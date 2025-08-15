/**
 * Unit Tests for WebSocketManager Service
 * Tests connection management, reconnection, and subscription handling
 */

import { WebSocketManager } from '../../services/websocket-manager';

// Mock WebSocket implementation
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  private listeners: { [key: string]: ((event: any) => void)[] } = {};

  constructor(url: string) {
    this.url = url;
    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
      this.dispatchEvent('open', new Event('open'));
    }, 10);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(type: string, event: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => listener(event));
    }
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      const closeEvent = new CloseEvent('close', { code: code || 1000, reason: reason || '' });
      this.onclose?.(closeEvent);
      this.dispatchEvent('close', closeEvent);
    }, 10);
  }
}

// Replace global WebSocket with mock
(global as any).WebSocket = MockWebSocket;

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  const testUrl = 'ws://localhost:8080/test';

  beforeEach(() => {
    wsManager = new WebSocketManager();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    wsManager.disconnect();
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    test('should connect to WebSocket successfully', async () => {
      const connectPromise = wsManager.connect(testUrl);
      
      // Fast-forward timers to simulate connection
      jest.advanceTimersByTime(20);
      
      await expect(connectPromise).resolves.toBe(true);
      expect(wsManager.isConnected()).toBe(true);
    });

    test('should handle connection failure', async () => {
      // Mock WebSocket to fail immediately
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        const ws = new MockWebSocket(testUrl);
        setTimeout(() => {
          ws.readyState = MockWebSocket.CLOSED;
          ws.onerror?.(new Event('error'));
          ws.dispatchEvent('error', new Event('error'));
        }, 5);
        return ws;
      });

      const connectPromise = wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      await expect(connectPromise).resolves.toBe(false);
      expect(wsManager.isConnected()).toBe(false);
    });

    test('should disconnect properly', async () => {
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      wsManager.disconnect();
      jest.advanceTimersByTime(20);
      
      expect(wsManager.isConnected()).toBe(false);
    });
  });

  describe('Reconnection Logic', () => {
    test('should attempt reconnection on connection loss', async () => {
      const reconnectSpy = jest.spyOn(wsManager as any, 'attemptReconnection');
      
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      // Simulate connection loss
      (wsManager as any).ws?.close(1006, 'Connection lost');
      jest.advanceTimersByTime(20);
      
      expect(reconnectSpy).toHaveBeenCalled();
    });

    test('should use exponential backoff for reconnection', async () => {
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      // Mock failed reconnections
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        const ws = new MockWebSocket(testUrl);
        setTimeout(() => {
          ws.readyState = MockWebSocket.CLOSED;
          ws.onerror?.(new Event('error'));
        }, 5);
        return ws;
      });
      
      // Trigger reconnection
      (wsManager as any).ws?.close(1006, 'Connection lost');
      
      // First attempt should be immediate
      jest.advanceTimersByTime(100);
      expect((global as any).WebSocket).toHaveBeenCalledTimes(2);
      
      // Second attempt should be delayed
      jest.advanceTimersByTime(1000);
      expect((global as any).WebSocket).toHaveBeenCalledTimes(3);
      
      // Third attempt should be delayed more
      jest.advanceTimersByTime(2000);
      expect((global as any).WebSocket).toHaveBeenCalledTimes(4);
    });

    test('should stop reconnection after max attempts', async () => {
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      // Mock all reconnections to fail
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        const ws = new MockWebSocket(testUrl);
        setTimeout(() => {
          ws.readyState = MockWebSocket.CLOSED;
          ws.onerror?.(new Event('error'));
        }, 5);
        return ws;
      });
      
      // Trigger reconnection
      (wsManager as any).ws?.close(1006, 'Connection lost');
      
      // Fast-forward through all reconnection attempts
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }
      
      // Should not exceed max attempts (5)
      expect((global as any).WebSocket).toHaveBeenCalledTimes(6); // Initial + 5 reconnects
    });
  });

  describe('Subscription Management', () => {
    test('should handle message subscriptions', async () => {
      const callback = jest.fn();
      
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      wsManager.subscribe('metrics', callback);
      
      // Simulate incoming message
      const testMessage = { type: 'metrics', data: { value: 100 } };
      (wsManager as any).ws?.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify(testMessage)
      }));
      
      expect(callback).toHaveBeenCalledWith(testMessage.data);
    });

    test('should handle multiple subscribers for same event', async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      wsManager.subscribe('metrics', callback1);
      wsManager.subscribe('metrics', callback2);
      
      const testMessage = { type: 'metrics', data: { value: 100 } };
      (wsManager as any).ws?.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify(testMessage)
      }));
      
      expect(callback1).toHaveBeenCalledWith(testMessage.data);
      expect(callback2).toHaveBeenCalledWith(testMessage.data);
    });

    test('should unsubscribe properly', async () => {
      const callback = jest.fn();
      
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      wsManager.subscribe('metrics', callback);
      wsManager.unsubscribe('metrics', callback);
      
      const testMessage = { type: 'metrics', data: { value: 100 } };
      (wsManager as any).ws?.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify(testMessage)
      }));
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Connection Quality Assessment', () => {
    test('should track connection quality metrics', async () => {
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      // Simulate some latency measurements
      (wsManager as any).recordLatency(50);
      (wsManager as any).recordLatency(75);
      (wsManager as any).recordLatency(100);
      
      const quality = wsManager.getConnectionQuality();
      expect(quality.averageLatency).toBe(75);
      expect(quality.isStable).toBe(true);
    });

    test('should detect unstable connections', async () => {
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      // Simulate high latency and disconnections
      (wsManager as any).recordLatency(500);
      (wsManager as any).recordLatency(1000);
      (wsManager as any).recordDisconnection();
      (wsManager as any).recordDisconnection();
      
      const quality = wsManager.getConnectionQuality();
      expect(quality.isStable).toBe(false);
      expect(quality.averageLatency).toBeGreaterThan(200);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed messages gracefully', async () => {
      const callback = jest.fn();
      
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      wsManager.subscribe('metrics', callback);
      
      // Send malformed JSON
      (wsManager as any).ws?.onmessage?.(new MessageEvent('message', {
        data: 'invalid json'
      }));
      
      expect(callback).not.toHaveBeenCalled();
      // Should not throw error
    });

    test('should handle WebSocket errors', async () => {
      const errorCallback = jest.fn();
      
      await wsManager.connect(testUrl);
      jest.advanceTimersByTime(20);
      
      wsManager.onError(errorCallback);
      
      // Simulate WebSocket error
      (wsManager as any).ws?.onerror?.(new Event('error'));
      
      expect(errorCallback).toHaveBeenCalled();
    });
  });
});