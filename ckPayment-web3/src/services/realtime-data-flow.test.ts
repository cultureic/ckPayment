/**
 * Integration Tests for Real-Time Data Flow
 * Tests complete data flow from canister to UI components
 */

import { RealTimeDataManager } from '../../services/realtime-data-manager';
import { MetricsCalculator } from '../../services/metrics-calculator';
import { ErrorHandlerService } from '../../services/error-handler';
import { TransactionData, MetricsData } from '../../types/dashboard';

// Mock React hooks for component testing
jest.mock('react', () => ({
  useState: jest.fn(() => [null, jest.fn()]),
  useEffect: jest.fn(),
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Real-Time Data Flow Integration', () => {
  let dataManager: RealTimeDataManager;
  let metricsCalculator: MetricsCalculator;
  let errorHandler: ErrorHandlerService;

  beforeEach(() => {
    dataManager = new RealTimeDataManager();
    metricsCalculator = new MetricsCalculator();
    errorHandler = new ErrorHandlerService();
    
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    dataManager.stop();
    jest.useRealTimers();
  });

  describe('Canister to Dashboard Data Flow', () => {
    test('should process complete data pipeline from WebSocket to UI', async () => {
      const processedData: any[] = [];
      const uiUpdates: any[] = [];
      
      // Mock WebSocket connection
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

      await dataManager.start('ws://localhost:8080/canister-data');

      // Set up data processing pipeline
      dataManager.subscribe('transactions', (data: TransactionData[]) => {
        processedData.push(...data);
        
        // Calculate metrics from transactions
        const efficiency = metricsCalculator.calculateCycleEfficiency(data);
        const analytics = metricsCalculator.calculatePerformanceAnalytics(data, []);
        
        uiUpdates.push({
          type: 'transactions',
          count: data.length,
          efficiency,
          analytics
        });
      });

      dataManager.subscribe('metrics', (data: MetricsData) => {
        const trends = metricsCalculator.analyzeTrends([data]);
        
        uiUpdates.push({
          type: 'metrics',
          data,
          trends
        });
      });

      // Simulate canister sending transaction data
      const mockTransactions: TransactionData[] = [
        {
          id: '1',
          hash: 'hash1',
          from: 'user1',
          to: 'canister1',
          amount: 100,
          timestamp: new Date(),
          status: 'completed',
          cycleCost: 1000000,
          subnetId: 'subnet1',
          canisterId: 'canister1',
          executionTime: 50,
          memoryUsage: 1024,
          instructionCount: 5000,
          callHierarchy: []
        },
        {
          id: '2',
          hash: 'hash2',
          from: 'user2',
          to: 'canister2',
          amount: 200,
          timestamp: new Date(),
          status: 'completed',
          cycleCost: 2000000,
          subnetId: 'subnet1',
          canisterId: 'canister2',
          executionTime: 75,
          memoryUsage: 2048,
          instructionCount: 7500,
          callHierarchy: []
        }
      ];

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      if (messageHandler) {
        messageHandler({
          data: JSON.stringify({
            type: 'transactions',
            data: mockTransactions
          })
        });
      }

      await Promise.resolve();

      expect(processedData).toHaveLength(2);
      expect(uiUpdates).toHaveLength(1);
      expect(uiUpdates[0].type).toBe('transactions');
      expect(uiUpdates[0].efficiency.averageCyclesPerTransaction).toBe(1500000);
    });

    test('should handle real-time metrics updates with trend analysis', async () => {
      const metricsHistory: MetricsData[] = [];
      const trendUpdates: any[] = [];

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

      await dataManager.start('ws://localhost:8080/metrics');

      dataManager.subscribe('metrics', (data: MetricsData) => {
        metricsHistory.push(data);
        
        if (metricsHistory.length >= 2) {
          const trends = metricsCalculator.analyzeTrends(metricsHistory);
          trendUpdates.push(trends);
        }
      });

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send series of metrics updates
      const metricsSequence: MetricsData[] = [
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          totalTransactions: 100,
          successfulTransactions: 95,
          failedTransactions: 5,
          averageResponseTime: 150,
          totalVolume: 10000,
          activeUsers: 50,
          cyclesBurned: 5000000,
          cyclesBalance: 95000000,
          subnetMetrics: {},
          canisterHealth: {}
        },
        {
          timestamp: new Date('2024-01-01T10:01:00Z'),
          totalTransactions: 120,
          successfulTransactions: 115,
          failedTransactions: 5,
          averageResponseTime: 140,
          totalVolume: 12000,
          activeUsers: 60,
          cyclesBurned: 6000000,
          cyclesBalance: 94000000,
          subnetMetrics: {},
          canisterHealth: {}
        },
        {
          timestamp: new Date('2024-01-01T10:02:00Z'),
          totalTransactions: 140,
          successfulTransactions: 135,
          failedTransactions: 5,
          averageResponseTime: 130,
          totalVolume: 14000,
          activeUsers: 70,
          cyclesBurned: 7000000,
          cyclesBalance: 93000000,
          subnetMetrics: {},
          canisterHealth: {}
        }
      ];

      if (messageHandler) {
        metricsSequence.forEach((metrics, index) => {
          setTimeout(() => {
            messageHandler({
              data: JSON.stringify({
                type: 'metrics',
                data: metrics
              })
            });
          }, index * 100);
        });
      }

      jest.advanceTimersByTime(500);
      await Promise.resolve();

      expect(metricsHistory).toHaveLength(3);
      expect(trendUpdates).toHaveLength(2);
      
      // Verify trend analysis
      const latestTrend = trendUpdates[trendUpdates.length - 1];
      expect(latestTrend.transactionVolume.trend).toBe('increasing');
      expect(latestTrend.responseTime.trend).toBe('improving');
    });

    test('should detect and handle data anomalies in real-time', async () => {
      const anomalies: any[] = [];
      const alerts: any[] = [];

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

      await dataManager.start('ws://localhost:8080/anomaly-detection');

      const transactionHistory: TransactionData[] = [];

      dataManager.subscribe('transactions', (data: TransactionData[]) => {
        transactionHistory.push(...data);
        
        // Detect anomalies in real-time
        const detectedAnomalies = metricsCalculator.detectAnomalies(transactionHistory, []);
        
        if (detectedAnomalies.responseTimeAnomalies.length > 0 ||
            detectedAnomalies.costAnomalies.length > 0 ||
            detectedAnomalies.resourceAnomalies.length > 0) {
          anomalies.push(detectedAnomalies);
          
          // Trigger alert
          alerts.push({
            type: 'anomaly_detected',
            timestamp: new Date(),
            anomalies: detectedAnomalies
          });
        }
      });

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send normal transactions first
      const normalTransactions: TransactionData[] = [
        {
          id: '1',
          hash: 'hash1',
          from: 'user1',
          to: 'canister1',
          amount: 100,
          timestamp: new Date(),
          status: 'completed',
          cycleCost: 1000000,
          subnetId: 'subnet1',
          canisterId: 'canister1',
          executionTime: 50,
          memoryUsage: 1024,
          instructionCount: 5000,
          callHierarchy: []
        }
      ];

      // Send anomalous transaction
      const anomalousTransaction: TransactionData = {
        id: '2',
        hash: 'hash2',
        from: 'user2',
        to: 'canister2',
        amount: 200,
        timestamp: new Date(),
        status: 'completed',
        cycleCost: 10000000, // 10x higher than normal
        subnetId: 'subnet1',
        canisterId: 'canister2',
        executionTime: 5000, // 100x higher than normal
        memoryUsage: 10240, // 10x higher than normal
        instructionCount: 50000,
        callHierarchy: []
      };

      if (messageHandler) {
        messageHandler({
          data: JSON.stringify({
            type: 'transactions',
            data: normalTransactions
          })
        });

        setTimeout(() => {
          messageHandler({
            data: JSON.stringify({
              type: 'transactions',
              data: [anomalousTransaction]
            })
          });
        }, 100);
      }

      jest.advanceTimersByTime(200);
      await Promise.resolve();

      expect(anomalies).toHaveLength(1);
      expect(alerts).toHaveLength(1);
      
      const detectedAnomaly = anomalies[0];
      expect(detectedAnomaly.costAnomalies).toHaveLength(1);
      expect(detectedAnomaly.responseTimeAnomalies).toHaveLength(1);
      expect(detectedAnomaly.resourceAnomalies).toHaveLength(1);
    });
  });

  describe('Error Handling in Data Flow', () => {
    test('should handle malformed data gracefully without breaking pipeline', async () => {
      const validData: any[] = [];
      const errors: any[] = [];

      errorHandler.onError((error) => errors.push(error));

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

      await dataManager.start('ws://localhost:8080/malformed-data');

      dataManager.subscribe('transactions', (data: TransactionData[]) => {
        try {
          // Validate data before processing
          if (Array.isArray(data) && data.every(t => t.id && t.hash)) {
            validData.push(...data);
          } else {
            throw new Error('Invalid transaction data format');
          }
        } catch (error) {
          errorHandler.handleError(error as Error, {
            component: 'DataProcessor',
            operation: 'processTransactions'
          });
        }
      });

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      if (messageHandler) {
        // Send valid data
        messageHandler({
          data: JSON.stringify({
            type: 'transactions',
            data: [{
              id: '1',
              hash: 'hash1',
              from: 'user1',
              to: 'canister1',
              amount: 100,
              timestamp: new Date(),
              status: 'completed',
              cycleCost: 1000000,
              subnetId: 'subnet1',
              canisterId: 'canister1',
              executionTime: 50,
              memoryUsage: 1024,
              instructionCount: 5000,
              callHierarchy: []
            }]
          })
        });

        // Send malformed data
        messageHandler({
          data: JSON.stringify({
            type: 'transactions',
            data: [{ invalid: 'data' }]
          })
        });

        // Send more valid data
        messageHandler({
          data: JSON.stringify({
            type: 'transactions',
            data: [{
              id: '2',
              hash: 'hash2',
              from: 'user2',
              to: 'canister2',
              amount: 200,
              timestamp: new Date(),
              status: 'completed',
              cycleCost: 2000000,
              subnetId: 'subnet1',
              canisterId: 'canister2',
              executionTime: 75,
              memoryUsage: 2048,
              instructionCount: 7500,
              callHierarchy: []
            }]
          })
        });
      }

      await Promise.resolve();

      expect(validData).toHaveLength(2);
      expect(errors).toHaveLength(1);
      expect(errors[0].category).toBe('validation');
    });

    test('should maintain data consistency during connection interruptions', async () => {
      const receivedData: any[] = [];
      const connectionEvents: any[] = [];

      dataManager.onConnectionChange((event) => connectionEvents.push(event));

      // Start with WebSocket
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

      // Mock polling fallback
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transactions: [{
            id: 'polling-1',
            hash: 'polling-hash',
            from: 'polling-user',
            to: 'polling-canister',
            amount: 300,
            timestamp: new Date(),
            status: 'completed',
            cycleCost: 3000000,
            subnetId: 'subnet1',
            canisterId: 'polling-canister',
            executionTime: 100,
            memoryUsage: 3072,
            instructionCount: 10000,
            callHierarchy: []
          }]
        })
      });

      await dataManager.start('ws://localhost:8080/consistency-test');

      dataManager.subscribe('transactions', (data: TransactionData[]) => {
        receivedData.push(...data.map(t => ({ ...t, source: dataManager.getCurrentMode() })));
      });

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send data via WebSocket
      if (messageHandler) {
        messageHandler({
          data: JSON.stringify({
            type: 'transactions',
            data: [{
              id: 'ws-1',
              hash: 'ws-hash',
              from: 'ws-user',
              to: 'ws-canister',
              amount: 150,
              timestamp: new Date(),
              status: 'completed',
              cycleCost: 1500000,
              subnetId: 'subnet1',
              canisterId: 'ws-canister',
              executionTime: 60,
              memoryUsage: 1536,
              instructionCount: 6000,
              callHierarchy: []
            }]
          })
        });
      }

      await Promise.resolve();

      // Simulate connection loss
      mockWs.readyState = WebSocket.CLOSED;
      const closeHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'close')?.[1];
      
      if (closeHandler) {
        closeHandler({ code: 1006, reason: 'Connection lost' });
      }

      // Wait for fallback to polling
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Trigger polling
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(receivedData).toHaveLength(2);
      expect(receivedData[0].source).toBe('websocket');
      expect(receivedData[1].source).toBe('polling');
      expect(connectionEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Under Load', () => {
    test('should handle high-frequency data updates efficiently', async () => {
      const processedCount = { value: 0 };
      const processingTimes: number[] = [];

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

      await dataManager.start('ws://localhost:8080/high-frequency');

      dataManager.subscribe('metrics', (data: MetricsData) => {
        const startTime = performance.now();
        
        // Simulate processing
        processedCount.value++;
        
        const endTime = performance.now();
        processingTimes.push(endTime - startTime);
      });

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send high-frequency updates
      if (messageHandler) {
        for (let i = 0; i < 100; i++) {
          setTimeout(() => {
            messageHandler({
              data: JSON.stringify({
                type: 'metrics',
                data: {
                  timestamp: new Date(),
                  totalTransactions: 100 + i,
                  successfulTransactions: 95 + i,
                  failedTransactions: 5,
                  averageResponseTime: 150 - i,
                  totalVolume: 10000 + (i * 100),
                  activeUsers: 50 + i,
                  cyclesBurned: 5000000 + (i * 10000),
                  cyclesBalance: 95000000 - (i * 10000),
                  subnetMetrics: {},
                  canisterHealth: {}
                }
              })
            });
          }, i * 10); // 10ms intervals
        }
      }

      jest.advanceTimersByTime(2000);
      await Promise.resolve();

      expect(processedCount.value).toBeGreaterThan(50); // Should handle most updates
      
      const averageProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      expect(averageProcessingTime).toBeLessThan(10); // Should be fast
    });

    test('should throttle updates appropriately under load', async () => {
      const receivedUpdates: any[] = [];
      
      // Configure aggressive throttling
      dataManager.configure({
        throttleDelay: 100,
        maxUpdatesPerSecond: 10
      });

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

      await dataManager.start('ws://localhost:8080/throttling-test');

      dataManager.subscribe('metrics', (data: MetricsData) => {
        receivedUpdates.push({ data, timestamp: Date.now() });
      });

      const messageHandler = mockWs.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      // Send rapid updates
      if (messageHandler) {
        for (let i = 0; i < 50; i++) {
          messageHandler({
            data: JSON.stringify({
              type: 'metrics',
              data: {
                timestamp: new Date(),
                totalTransactions: i,
                successfulTransactions: i,
                failedTransactions: 0,
                averageResponseTime: 100,
                totalVolume: i * 100,
                activeUsers: i,
                cyclesBurned: i * 1000,
                cyclesBalance: 1000000,
                subnetMetrics: {},
                canisterHealth: {}
              }
            })
          });
        }
      }

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Should receive fewer updates due to throttling
      expect(receivedUpdates.length).toBeLessThan(50);
      expect(receivedUpdates.length).toBeGreaterThan(5);

      // Verify throttling intervals
      if (receivedUpdates.length >= 2) {
        const timeDiff = receivedUpdates[1].timestamp - receivedUpdates[0].timestamp;
        expect(timeDiff).toBeGreaterThanOrEqual(100);
      }
    });
  });
});