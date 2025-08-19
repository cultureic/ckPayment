/**
 * Unit Tests for RealTimeDataManager Service
 * Tests real-time data coordination, fallback mechanisms, and update throttling
 */

import { RealTimeDataManager } from '../../services/realtime-data-manager';
import { WebSocketManager } from '../../services/websocket-manager';

// Mock WebSocketManager
jest.mock('../../services/websocket-manager');

describe('RealTimeDataManager', () => {
  let dataManager: RealTimeDataManager;
  let mockWebSocketManager: jest.Mocked<WebSocketManager>;

  beforeEach(() => {
    mockWebSocketManager = new WebSocketManager() as jest.Mocked<WebSocketManager>;
    dataManager = new RealTimeDataManager();
    
    // Replace the internal WebSocket manager with our mock
    (dataManager as any).wsManager = mockWebSocketManager;
    
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    dataManager.stop();
    jest.useRealTimers();
  });

  describe('Initialization and Configuration', () => {
    test('should initialize with default configuration', () => {
      expect(dataManager.isActive()).toBe(false);
      expect(dataManager.getCurrentMode()).toBe('websocket');
    });

    test('should start with WebSocket mode', async () => {
      mockWebSocketManager.connect.mockResolvedValue(true);
      mockWebSocketManager.isConnected.mockReturnValue(true);

      await dataManager.start('ws://localhost:8080');

      expect(mockWebSocketManager.connect).toHaveBeenCalledWith('ws://localhost:8080');
      expect(dataManager.isActive()).toBe(true);
      expect(dataManager.getCurrentMode()).toBe('websocket');
    });

    test('should fallback to polling when WebSocket fails', async () => {
      mockWebSocketManager.connect.mockResolvedValue(false);
      mockWebSocketManager.isConnected.mockReturnValue(false);

      await dataManager.start('ws://localhost:8080');

      expect(dataManager.getCurrentMode()).toBe('polling');
      expect(dataManager.isActive()).toBe(true);
    });

    test('should configure update intervals', () => {
      const config = {
        websocketReconnectInterval: 2000,
        pollingInterval: 5000,
        maxReconnectAttempts: 3
      };

      dataManager.configure(config);

      expect((dataManager as any).config.websocketReconnectInterval).toBe(2000);
      expect((dataManager as any).config.pollingInterval).toBe(5000);
      expect((dataManager as any).config.maxReconnectAttempts).toBe(3);
    });
  });

  describe('WebSocket Mode Operations', () => {
    beforeEach(async () => {
      mockWebSocketManager.connect.mockResolvedValue(true);
      mockWebSocketManager.isConnected.mockReturnValue(true);
      await dataManager.start('ws://localhost:8080');
    });

    test('should subscribe to WebSocket events', () => {
      const callback = jest.fn();
      
      dataManager.subscribe('metrics', callback);

      expect(mockWebSocketManager.subscribe).toHaveBeenCalledWith('metrics', expect.any(Function));
    });

    test('should handle WebSocket messages', () => {
      const callback = jest.fn();
      const testData = { value: 100, timestamp: Date.now() };
      
      dataManager.subscribe('metrics', callback);
      
      // Simulate WebSocket message
      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback(testData);

      expect(callback).toHaveBeenCalledWith(testData);
    });

    test('should throttle rapid updates', () => {
      const callback = jest.fn();
      const testData = { value: 100, timestamp: Date.now() };
      
      dataManager.subscribe('metrics', callback);
      
      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      
      // Send multiple rapid updates
      wsCallback(testData);
      wsCallback({ ...testData, value: 101 });
      wsCallback({ ...testData, value: 102 });

      // Only first update should be processed immediately
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(testData);

      // Advance time to allow throttled updates
      jest.advanceTimersByTime(1000);
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith({ ...testData, value: 102 });
    });

    test('should detect connection quality degradation', () => {
      mockWebSocketManager.getConnectionQuality.mockReturnValue({
        averageLatency: 500,
        isStable: false,
        disconnectionCount: 3,
        lastDisconnection: Date.now() - 1000
      });

      const qualityCallback = jest.fn();
      dataManager.onConnectionQualityChange(qualityCallback);

      // Trigger quality check
      (dataManager as any).checkConnectionQuality();

      expect(qualityCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'websocket',
          quality: 'poor',
          shouldFallback: true
        })
      );
    });
  });

  describe('Polling Mode Operations', () => {
    beforeEach(async () => {
      mockWebSocketManager.connect.mockResolvedValue(false);
      await dataManager.start('ws://localhost:8080');
    });

    test('should start polling when in polling mode', () => {
      expect(dataManager.getCurrentMode()).toBe('polling');
      expect((dataManager as any).pollingInterval).toBeDefined();
    });

    test('should make periodic polling requests', () => {
      const pollingSpy = jest.spyOn(dataManager as any, 'performPollingUpdate');
      
      // Advance time to trigger polling
      jest.advanceTimersByTime(5000);
      
      expect(pollingSpy).toHaveBeenCalled();
    });

    test('should adjust polling frequency based on activity', () => {
      const callback = jest.fn();
      dataManager.subscribe('metrics', callback);

      // Simulate high activity
      (dataManager as any).recordActivity();
      (dataManager as any).recordActivity();
      (dataManager as any).recordActivity();

      // Check if polling interval was adjusted
      const currentInterval = (dataManager as any).getCurrentPollingInterval();
      expect(currentInterval).toBeLessThan(5000); // Should be faster than default
    });

    test('should handle polling errors gracefully', async () => {
      const errorCallback = jest.fn();
      dataManager.onError(errorCallback);

      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Trigger polling
      jest.advanceTimersByTime(5000);
      await Promise.resolve(); // Allow async operations to complete

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'polling_error',
          message: expect.stringContaining('Network error')
        })
      );
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should switch from WebSocket to polling on connection failure', async () => {
      mockWebSocketManager.connect.mockResolvedValue(true);
      mockWebSocketManager.isConnected.mockReturnValue(true);
      
      await dataManager.start('ws://localhost:8080');
      expect(dataManager.getCurrentMode()).toBe('websocket');

      // Simulate WebSocket disconnection
      mockWebSocketManager.isConnected.mockReturnValue(false);
      const disconnectCallback = mockWebSocketManager.onDisconnect.mock.calls[0][0];
      disconnectCallback();

      expect(dataManager.getCurrentMode()).toBe('polling');
    });

    test('should attempt to reconnect WebSocket periodically', async () => {
      mockWebSocketManager.connect.mockResolvedValue(false);
      await dataManager.start('ws://localhost:8080');
      
      expect(dataManager.getCurrentMode()).toBe('polling');

      // Mock successful reconnection
      mockWebSocketManager.connect.mockResolvedValue(true);
      mockWebSocketManager.isConnected.mockReturnValue(true);

      // Advance time to trigger reconnection attempt
      jest.advanceTimersByTime(10000);

      expect(mockWebSocketManager.connect).toHaveBeenCalledTimes(2);
    });

    test('should switch back to WebSocket when connection is restored', async () => {
      mockWebSocketManager.connect.mockResolvedValue(false);
      await dataManager.start('ws://localhost:8080');
      
      expect(dataManager.getCurrentMode()).toBe('polling');

      // Simulate successful reconnection
      mockWebSocketManager.connect.mockResolvedValue(true);
      mockWebSocketManager.isConnected.mockReturnValue(true);

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(dataManager.getCurrentMode()).toBe('websocket');
    });

    test('should stop reconnection attempts after max attempts', async () => {
      dataManager.configure({ maxReconnectAttempts: 2 });
      
      mockWebSocketManager.connect.mockResolvedValue(false);
      await dataManager.start('ws://localhost:8080');

      // Advance time for multiple reconnection attempts
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(10000);
        await Promise.resolve();
      }

      // Should not exceed max attempts + initial connection
      expect(mockWebSocketManager.connect).toHaveBeenCalledTimes(3);
    });
  });

  describe('Bandwidth Optimization', () => {
    test('should compress data when bandwidth optimization is enabled', () => {
      dataManager.configure({ enableBandwidthOptimization: true });
      
      const callback = jest.fn();
      const largeData = {
        transactions: new Array(1000).fill({ id: 'test', amount: 100 }),
        timestamp: Date.now()
      };

      dataManager.subscribe('metrics', callback);
      
      // Simulate receiving large data
      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback(largeData);

      // Data should be processed (compression is internal)
      expect(callback).toHaveBeenCalled();
    });

    test('should adjust update frequency based on bandwidth', () => {
      dataManager.configure({ 
        enableBandwidthOptimization: true,
        adaptiveThrottling: true
      });

      // Simulate low bandwidth scenario
      (dataManager as any).recordBandwidthUsage(1000000); // 1MB
      (dataManager as any).recordBandwidthUsage(1000000);
      (dataManager as any).recordBandwidthUsage(1000000);

      const throttleDelay = (dataManager as any).getAdaptiveThrottleDelay();
      expect(throttleDelay).toBeGreaterThan(1000); // Should increase delay
    });

    test('should prioritize critical updates during bandwidth constraints', () => {
      dataManager.configure({ enableBandwidthOptimization: true });
      
      const criticalCallback = jest.fn();
      const normalCallback = jest.fn();

      dataManager.subscribe('errors', criticalCallback, { priority: 'high' });
      dataManager.subscribe('metrics', normalCallback, { priority: 'normal' });

      // Simulate bandwidth constraint
      (dataManager as any).setBandwidthConstrained(true);

      const errorData = { type: 'critical_error', message: 'System failure' };
      const metricsData = { value: 100, timestamp: Date.now() };

      // Simulate receiving both types of data
      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback({ type: 'errors', data: errorData });
      wsCallback({ type: 'metrics', data: metricsData });

      // Critical updates should be processed immediately
      expect(criticalCallback).toHaveBeenCalledWith(errorData);
      // Normal updates might be throttled
      expect(normalCallback).toHaveBeenCalledTimes(0);
    });
  });

  describe('Data Validation and Error Handling', () => {
    test('should validate incoming data format', () => {
      const callback = jest.fn();
      const errorCallback = jest.fn();
      
      dataManager.subscribe('metrics', callback);
      dataManager.onError(errorCallback);

      // Send invalid data
      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback(null);
      wsCallback(undefined);
      wsCallback('invalid string data');

      expect(callback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'data_validation_error'
        })
      );
    });

    test('should handle subscription errors gracefully', () => {
      const callback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const errorCallback = jest.fn();

      dataManager.subscribe('metrics', callback);
      dataManager.onError(errorCallback);

      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback({ value: 100 });

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'callback_error',
          message: expect.stringContaining('Callback error')
        })
      );
    });

    test('should recover from temporary errors', () => {
      const callback = jest.fn();
      let callCount = 0;
      
      callback.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Temporary error');
        }
      });

      dataManager.subscribe('metrics', callback);

      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback({ value: 100 });
      wsCallback({ value: 200 });

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track update latency', () => {
      const callback = jest.fn();
      dataManager.subscribe('metrics', callback);

      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback({ value: 100, timestamp: Date.now() - 100 });

      const stats = dataManager.getPerformanceStats();
      expect(stats.averageLatency).toBeGreaterThan(0);
      expect(stats.totalUpdates).toBe(1);
    });

    test('should monitor memory usage', () => {
      const callback = jest.fn();
      dataManager.subscribe('metrics', callback);

      // Generate multiple updates to track memory
      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      for (let i = 0; i < 100; i++) {
        wsCallback({ value: i, timestamp: Date.now() });
      }

      const stats = dataManager.getPerformanceStats();
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.totalUpdates).toBe(100);
    });

    test('should detect performance degradation', () => {
      const performanceCallback = jest.fn();
      dataManager.onPerformanceChange(performanceCallback);

      // Simulate slow updates
      const callback = jest.fn().mockImplementation(() => {
        // Simulate slow processing
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Busy wait
        }
      });

      dataManager.subscribe('metrics', callback);

      const wsCallback = mockWebSocketManager.subscribe.mock.calls[0][1];
      wsCallback({ value: 100 });

      expect(performanceCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'performance_degradation',
          averageProcessingTime: expect.any(Number)
        })
      );
    });
  });
});