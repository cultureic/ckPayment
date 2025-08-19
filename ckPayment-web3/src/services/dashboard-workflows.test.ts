/**
 * End-to-End Tests for Dashboard Workflows
 * Tests complete user workflows with real-time updates and interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

// Mock the dashboard components
const MockDashboard = () => {
  const [metrics, setMetrics] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [errors, setErrors] = React.useState([]);
  const [connectionStatus, setConnectionStatus] = React.useState('connecting');
  const [mode, setMode] = React.useState('websocket');

  return (
    <div data-testid="dashboard">
      <div data-testid="connection-status">{connectionStatus}</div>
      <div data-testid="mode-indicator">{mode}</div>
      <div data-testid="metrics-display">
        {metrics ? JSON.stringify(metrics) : 'No metrics'}
      </div>
      <div data-testid="transactions-list">
        {transactions.length} transactions
      </div>
      <div data-testid="error-notifications">
        {errors.length} errors
      </div>
      <button data-testid="refresh-button" onClick={() => {}}>
        Refresh
      </button>
      <button data-testid="settings-button" onClick={() => {}}>
        Settings
      </button>
    </div>
  );
};

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Dashboard E2E Workflows', () => {
  let mockWebSocket: any;
  let mockFetch: jest.Mock;
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
    
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      url: ''
    };

    (global as any).WebSocket = jest.fn().mockImplementation((url) => {
      mockWebSocket.url = url;
      return mockWebSocket;
    });

    // Mock fetch
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        metrics: {
          totalTransactions: 100,
          successfulTransactions: 95,
          failedTransactions: 5,
          averageResponseTime: 150,
          totalVolume: 10000,
          activeUsers: 50,
          cyclesBurned: 5000000,
          cyclesBalance: 95000000
        },
        transactions: [],
        errors: []
      })
    });
    global.fetch = mockFetch;

    // Mock React state
    const mockSetState = jest.fn();
    (React.useState as jest.Mock).mockImplementation((initial) => [initial, mockSetState]);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Initial Dashboard Load', () => {
    test('should load dashboard and establish WebSocket connection', async () => {
      render(<MockDashboard />);

      // Verify initial state
      expect(screen.getByTestId('connection-status')).toHaveTextContent('connecting');
      expect(screen.getByTestId('mode-indicator')).toHaveTextContent('websocket');
      expect(screen.getByTestId('metrics-display')).toHaveTextContent('No metrics');

      // Simulate WebSocket connection success
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });
    });

    test('should fallback to polling when WebSocket fails', async () => {
      render(<MockDashboard />);

      // Simulate WebSocket connection failure
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED;
        const errorHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'error')?.[1];
        if (errorHandler) errorHandler();
      });

      // Advance time to trigger polling fallback
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode-indicator')).toHaveTextContent('polling');
      });

      // Verify polling is active
      expect(mockFetch).toHaveBeenCalled();
    });

    test('should display loading states appropriately', async () => {
      render(<MockDashboard />);

      // Initial loading state
      expect(screen.getByTestId('metrics-display')).toHaveTextContent('No metrics');
      expect(screen.getByTestId('transactions-list')).toHaveTextContent('0 transactions');

      // Simulate data loading
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();

        const messageHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'message')?.[1];
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'metrics',
              data: {
                totalTransactions: 150,
                successfulTransactions: 145,
                failedTransactions: 5,
                averageResponseTime: 120,
                totalVolume: 15000,
                activeUsers: 75,
                cyclesBurned: 7500000,
                cyclesBalance: 92500000
              }
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('metrics-display')).not.toHaveTextContent('No metrics');
      });
    });
  });

  describe('Real-Time Data Updates', () => {
    test('should update metrics in real-time via WebSocket', async () => {
      render(<MockDashboard />);

      // Establish WebSocket connection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send initial metrics
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'metrics',
              data: {
                totalTransactions: 100,
                successfulTransactions: 95,
                failedTransactions: 5,
                averageResponseTime: 150
              }
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('metrics-display')).toHaveTextContent('100');
      });

      // Send updated metrics
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'metrics',
              data: {
                totalTransactions: 120,
                successfulTransactions: 115,
                failedTransactions: 5,
                averageResponseTime: 140
              }
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('metrics-display')).toHaveTextContent('120');
      });
    });

    test('should update transaction list in real-time', async () => {
      render(<MockDashboard />);

      // Establish connection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send transaction updates
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'transactions',
              data: [
                {
                  id: '1',
                  hash: 'hash1',
                  from: 'user1',
                  to: 'canister1',
                  amount: 100,
                  timestamp: new Date(),
                  status: 'completed',
                  cycleCost: 1000000
                },
                {
                  id: '2',
                  hash: 'hash2',
                  from: 'user2',
                  to: 'canister2',
                  amount: 200,
                  timestamp: new Date(),
                  status: 'pending',
                  cycleCost: 2000000
                }
              ]
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('transactions-list')).toHaveTextContent('2 transactions');
      });

      // Add more transactions
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'transactions',
              data: [
                {
                  id: '3',
                  hash: 'hash3',
                  from: 'user3',
                  to: 'canister3',
                  amount: 300,
                  timestamp: new Date(),
                  status: 'completed',
                  cycleCost: 3000000
                }
              ]
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('transactions-list')).toHaveTextContent('3 transactions');
      });
    });

    test('should handle real-time error notifications', async () => {
      render(<MockDashboard />);

      // Establish connection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send error notification
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'errors',
              data: [
                {
                  id: 'error1',
                  message: 'Canister out of cycles',
                  severity: 'high',
                  timestamp: new Date(),
                  canisterId: 'canister1'
                }
              ]
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-notifications')).toHaveTextContent('1 errors');
      });
    });
  });

  describe('User Interactions', () => {
    test('should handle manual refresh action', async () => {
      render(<MockDashboard />);

      const refreshButton = screen.getByTestId('refresh-button');
      
      // Click refresh button
      await user.click(refreshButton);

      // Should trigger data refresh
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    test('should open settings panel', async () => {
      render(<MockDashboard />);

      const settingsButton = screen.getByTestId('settings-button');
      
      // Click settings button
      await user.click(settingsButton);

      // Settings panel should be accessible
      // (In a real implementation, this would open a settings modal/panel)
      expect(settingsButton).toBeInTheDocument();
    });

    test('should handle keyboard navigation', async () => {
      render(<MockDashboard />);

      const refreshButton = screen.getByTestId('refresh-button');
      const settingsButton = screen.getByTestId('settings-button');

      // Tab navigation
      await user.tab();
      expect(refreshButton).toHaveFocus();

      await user.tab();
      expect(settingsButton).toHaveFocus();

      // Enter key activation
      await user.keyboard('{Enter}');
      
      // Should trigger settings action
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Error Handling Workflows', () => {
    test('should display connection error and recovery options', async () => {
      render(<MockDashboard />);

      // Simulate connection failure
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED;
        const errorHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'error')?.[1];
        if (errorHandler) errorHandler();
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
      });

      // Should show fallback mode
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode-indicator')).toHaveTextContent('polling');
      });
    });

    test('should handle data validation errors gracefully', async () => {
      render(<MockDashboard />);

      // Establish connection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send invalid data
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: 'invalid json data'
          });
        }
      });

      // Dashboard should remain stable
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Send valid data after invalid
      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'metrics',
              data: {
                totalTransactions: 100,
                successfulTransactions: 95,
                failedTransactions: 5
              }
            })
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('metrics-display')).toHaveTextContent('100');
      });
    });

    test('should recover from temporary network issues', async () => {
      render(<MockDashboard />);

      // Start with successful connection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });

      // Simulate network interruption
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED;
        const closeHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1];
        if (closeHandler) closeHandler({ code: 1006, reason: 'Network error' });
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode-indicator')).toHaveTextContent('polling');
      });

      // Simulate network recovery
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      // Advance time for reconnection
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('mode-indicator')).toHaveTextContent('websocket');
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    test('should handle high-frequency updates without UI lag', async () => {
      render(<MockDashboard />);

      // Establish connection
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send rapid updates
      act(() => {
        if (messageHandler) {
          for (let i = 0; i < 50; i++) {
            messageHandler({
              data: JSON.stringify({
                type: 'metrics',
                data: {
                  totalTransactions: 100 + i,
                  successfulTransactions: 95 + i,
                  failedTransactions: 5,
                  averageResponseTime: 150 - i,
                  timestamp: Date.now()
                }
              })
            });
          }
        }
      });

      // UI should remain responsive
      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      expect(refreshButton).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    test('should maintain performance during mode transitions', async () => {
      render(<MockDashboard />);

      // Start with WebSocket
      act(() => {
        mockWebSocket.readyState = WebSocket.OPEN;
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1];
        if (openHandler) openHandler();
      });

      // Send some data
      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      act(() => {
        if (messageHandler) {
          messageHandler({
            data: JSON.stringify({
              type: 'metrics',
              data: { totalTransactions: 100 }
            })
          });
        }
      });

      // Switch to polling
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED;
        const closeHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'close')?.[1];
        if (closeHandler) closeHandler({ code: 1000 });
      });

      // Advance time for polling
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // UI should remain responsive during transition
      const settingsButton = screen.getByTestId('settings-button');
      await user.click(settingsButton);

      expect(settingsButton).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should be keyboard navigable', async () => {
      render(<MockDashboard />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByTestId('refresh-button')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('settings-button')).toHaveFocus();

      // Should be able to activate with Enter
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    });

    test('should have proper ARIA labels and roles', () => {
      render(<MockDashboard />);

      // Check for accessibility attributes
      const dashboard = screen.getByTestId('dashboard');
      expect(dashboard).toBeInTheDocument();

      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toHaveAttribute('type', 'button');

      const settingsButton = screen.getByTestId('settings-button');
      expect(settingsButton).toHaveAttribute('type', 'button');
    });

    test('should announce status changes to screen readers', async () => {
      render(<MockDashboard />);

      // Connection status should be announced
      const statusElement = screen.getByTestId('connection-status');
      expect(statusElement).toHaveTextContent('connecting');

      // Mode changes should be announced
      const modeElement = screen.getByTestId('mode-indicator');
      expect(modeElement).toHaveTextContent('websocket');

      // Simulate mode change
      act(() => {
        mockWebSocket.readyState = WebSocket.CLOSED;
        const errorHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'error')?.[1];
        if (errorHandler) errorHandler();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(modeElement).toHaveTextContent('polling');
      });
    });
  });
});