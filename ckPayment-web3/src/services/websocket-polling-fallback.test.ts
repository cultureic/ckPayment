/**
 * Integration Tests for WebSocket to Polling Fallback
 * Tests the complete fallback mechanism between WebSocket and polling modes
 */

import { RealTimeDataManager } from '../../services/realtime-data-manager';
import { WebSocketManager } from '../../services/websocket-manager';

// Mock fetch for polling tests
global.fetch = jest.fn();

describe('WebSocket to Polling Fallback Integration', () => {
  let dataManager: RealTimeDataManager;
  let mockServer: any;

  beforeEach(() => {
    dataManager = new RealTimeDataManager();
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock fetch responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        metrics: { value: 100, timestamp: Date.now() },
        transactions: [],
        errors: []
      })
    });
  });

  afterEach(() => {
    dataManager.stop();
    jest.useRealTimers();
    if (mockServer) {
      mockServer.close();
    }
  });

  describe('Seamless Fallback Transition', () => {
    test('should transition from WebSocket to polling when connection fails', async () => {
      const metricsCallback = jest.fn();
      const modeChangeCallback = jest.fn();
      
      dataManager.subscribe('metrics', metricsCallback);
      dataManager.onModeChange(modeChangeCallback);

      // Start with WebSocket (will fail to connect)
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      expect(dataManager.getCurrentMode()).toBe('polling');
      expect(modeChangeCallback).toHaveBeenCalledWith({
        from: 'websocket',
        to: 'polling',
        reason: 'connection_failed'
      });

      // Advance time to trigger polling
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalled();
      expect(metricsCallback).toHaveBeenCalled();
    });

    test('should maintain data flow during mode transition', async () => {
      const dataReceived: any[] = [];
      const callback = (data: any) => dataReceived.push({ ...data, mode: dataManager.getCurrentMode() });
      
      dataManager.subscribe('metrics', callback);

      // Start in polling mode
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      // Receive some data via polling
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(dataReceived.length).toBeGreaterThan(0);
      expect(dataReceived[0].mode).toBe('polling');

      // Simulate WebSocket becoming available
      const mockWs = {
        readyState: WebSocket.OPEN,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      // Mock successful WebSocket connection
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'open')
            .forEach(call => call[1]());
        }, 10);
        return mockWs;
      });

      // Trigger reconnection attempt
      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(dataManager.getCurrentMode()).toBe('websocket');
    });

    test('should handle rapid connection state changes', async () => {
      const stateChanges: string[] = [];
      const modeChangeCallback = (change: any) => stateChanges.push(`${change.from}->${change.to}`);
      
      dataManager.onModeChange(modeChangeCallback);

      // Start with failed WebSocket
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      // Simulate multiple connection attempts
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(10000);
        await Promise.resolve();
      }

      expect(stateChanges.length).toBeGreaterThan(0);
      expect(stateChanges[0]).toBe('websocket->polling');
    });
  });

  describe('Data Consistency Across Modes', () => {
    test('should maintain subscription callbacks across mode changes', async () => {
      const metricsCallback = jest.fn();
      const transactionsCallback = jest.fn();
      
      dataManager.subscribe('metrics', metricsCallback);
      dataManager.subscribe('transactions', transactionsCallback);

      // Start in polling mode
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      const initialMetricsCalls = metricsCallback.mock.calls.length;
      const initialTransactionsCalls = transactionsCallback.mock.calls.length;

      // Switch to WebSocket mode (mock successful connection)
      const mockWs = {
        readyState: WebSocket.OPEN,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'open')
            .forEach(call => call[1]());
          
          // Simulate WebSocket messages
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'message')
            .forEach(call => {
              call[1]({ data: JSON.stringify({ type: 'metrics', data: { value: 200 } }) });
              call[1]({ data: JSON.stringify({ type: 'transactions', data: [{ id: '1' }] }) });
            });
        }, 10);
        return mockWs;
      });

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(metricsCallback.mock.calls.length).toBeGreaterThan(initialMetricsCalls);
      expect(transactionsCallback.mock.calls.length).toBeGreaterThan(initialTransactionsCalls);
    });

    test('should handle data format differences between modes', async () => {
      const callback = jest.fn();
      dataManager.subscribe('metrics', callback);

      // Configure different data formats for polling vs WebSocket
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          // Polling format
          metrics: { value: 100, timestamp: Date.now(), source: 'polling' }
        })
      });

      await dataManager.start('ws://localhost:9999/nonexistent');
      
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'polling' })
      );

      // Switch to WebSocket with different format
      const mockWs = {
        readyState: WebSocket.OPEN,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'open')
            .forEach(call => call[1]());
          
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'message')
            .forEach(call => {
              call[1]({ 
                data: JSON.stringify({ 
                  type: 'metrics', 
                  data: { value: 200, timestamp: Date.now(), source: 'websocket' }
                })
              });
            });
        }, 10);
        return mockWs;
      });

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'websocket' })
      );
    });
  });

  describe('Error Recovery Integration', () => {
    test('should recover from polling errors by retrying', async () => {
      const errorCallback = jest.fn();
      const dataCallback = jest.fn();
      
      dataManager.onError(errorCallback);
      dataManager.subscribe('metrics', dataCallback);

      // Mock fetch to fail initially, then succeed
      let fetchCallCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        fetchCallCount++;
        if (fetchCallCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ metrics: { value: 100 } })
        });
      });

      await dataManager.start('ws://localhost:9999/nonexistent');
      
      // Trigger multiple polling attempts
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      }

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'polling_error' })
      );
      expect(dataCallback).toHaveBeenCalled(); // Should eventually succeed
    });

    test('should handle WebSocket reconnection with exponential backoff', async () => {
      const reconnectAttempts: number[] = [];
      let attemptCount = 0;

      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        attemptCount++;
        reconnectAttempts.push(Date.now());
        
        const mockWs = {
          readyState: WebSocket.CONNECTING,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          send: jest.fn(),
          close: jest.fn()
        };

        // Fail first few attempts, succeed on later attempt
        setTimeout(() => {
          if (attemptCount <= 3) {
            mockWs.addEventListener.mock.calls
              .filter(call => call[0] === 'error')
              .forEach(call => call[1]());
          } else {
            mockWs.readyState = WebSocket.OPEN;
            mockWs.addEventListener.mock.calls
              .filter(call => call[0] === 'open')
              .forEach(call => call[1]());
          }
        }, 10);

        return mockWs;
      });

      await dataManager.start('ws://localhost:8080/test');
      
      // Advance time to trigger multiple reconnection attempts
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
      }

      expect(reconnectAttempts.length).toBeGreaterThan(1);
      
      // Verify exponential backoff (later attempts should be further apart)
      if (reconnectAttempts.length >= 3) {
        const interval1 = reconnectAttempts[1] - reconnectAttempts[0];
        const interval2 = reconnectAttempts[2] - reconnectAttempts[1];
        expect(interval2).toBeGreaterThanOrEqual(interval1);
      }
    });
  });

  describe('Performance Under Load', () => {
    test('should handle high-frequency updates in both modes', async () => {
      const receivedData: any[] = [];
      const callback = (data: any) => receivedData.push(data);
      
      dataManager.subscribe('metrics', callback);

      // Start in polling mode
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      // Configure high-frequency polling
      dataManager.configure({ pollingInterval: 100 });

      // Generate rapid polling updates
      (global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: { value: Math.random() * 100, timestamp: Date.now() }
          })
        });
      });

      // Run for several polling cycles
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      const pollingDataCount = receivedData.length;
      expect(pollingDataCount).toBeGreaterThan(5);

      // Switch to WebSocket mode with high-frequency updates
      const mockWs = {
        readyState: WebSocket.OPEN,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'open')
            .forEach(call => call[1]());
          
          // Simulate rapid WebSocket messages
          const messageHandler = mockWs.addEventListener.mock.calls
            .find(call => call[0] === 'message')?.[1];
          
          if (messageHandler) {
            const sendMessages = () => {
              for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                  messageHandler({ 
                    data: JSON.stringify({ 
                      type: 'metrics', 
                      data: { value: Math.random() * 100, timestamp: Date.now() }
                    })
                  });
                }, i * 10);
              }
            };
            sendMessages();
          }
        }, 10);
        return mockWs;
      });

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(receivedData.length).toBeGreaterThan(pollingDataCount);
    });

    test('should maintain performance during mode transitions', async () => {
      const performanceMetrics: any[] = [];
      const callback = (data: any) => {
        performanceMetrics.push({
          timestamp: Date.now(),
          mode: dataManager.getCurrentMode(),
          data
        });
      };
      
      dataManager.subscribe('metrics', callback);
      dataManager.onPerformanceChange((stats) => {
        performanceMetrics.push({ type: 'performance', stats });
      });

      await dataManager.start('ws://localhost:9999/nonexistent');
      
      // Generate load in polling mode
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      }

      // Switch to WebSocket
      const mockWs = {
        readyState: WebSocket.OPEN,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn()
      };

      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'open')
            .forEach(call => call[1]());
        }, 10);
        return mockWs;
      });

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      // Continue generating load in WebSocket mode
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      }

      const pollingMetrics = performanceMetrics.filter(m => m.mode === 'polling');
      const websocketMetrics = performanceMetrics.filter(m => m.mode === 'websocket');

      expect(pollingMetrics.length).toBeGreaterThan(0);
      expect(websocketMetrics.length).toBeGreaterThan(0);
    });
  });
});