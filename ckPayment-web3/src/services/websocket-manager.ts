import { ICPTransactionData, ICPMetricsData, EnhancedDashboardError } from '@/types/dashboard';

/**
 * WebSocket connection states
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unstable';

/**
 * WebSocket event types for ICP dashboard
 */
export type WebSocketEventType = 
  | 'metrics_update'
  | 'transaction_update' 
  | 'error_update'
  | 'canister_status'
  | 'subnet_health'
  | 'cycle_alert';

/**
 * Reconnection strategy configuration
 */
export interface ReconnectStrategy {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
}

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  heartbeatInterval: number;
  reconnectStrategy: ReconnectStrategy;
  maxMessageSize: number;
  compressionEnabled: boolean;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  timestamp: string;
  data: T;
  metadata?: {
    source: string;
    version: string;
    checksum?: string;
    compressed?: boolean;
  };
}

/**
 * Subscription callback function
 */
export type SubscriptionCallback<T = any> = (data: T, message: WebSocketMessage<T>) => void;

/**
 * Connection quality metrics
 */
export interface ConnectionMetrics {
  latency: number;
  messagesSent: number;
  messagesReceived: number;
  reconnectCount: number;
  lastReconnect?: Date;
  uptime: number;
  errorCount: number;
}

/**
 * WebSocket Manager for real-time ICP dashboard updates
 * Handles connection lifecycle, subscriptions, and automatic reconnection
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private subscriptions = new Map<string, SubscriptionCallback>();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private connectionQuality: ConnectionQuality = 'excellent';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeat: Date | null = null;
  private connectionMetrics: ConnectionMetrics;
  private eventListeners = new Map<string, Set<(event: any) => void>>();

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.connectionMetrics = {
      latency: 0,
      messagesSent: 0,
      messagesReceived: 0,
      reconnectCount: 0,
      uptime: 0,
      errorCount: 0
    };
  }

  /**
   * Establish WebSocket connection
   */
  async connect(canisterId?: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    this.setConnectionStatus('connecting');
    
    try {
      // Construct WebSocket URL with canister ID if provided
      const url = canisterId 
        ? `${this.config.url}?canister=${canisterId}`
        : this.config.url;

      this.ws = new WebSocket(url, this.config.protocols);
      
      // Configure WebSocket event handlers
      this.setupEventHandlers();
      
      // Wait for connection to open
      await this.waitForConnection();
      
      // Start heartbeat mechanism
      this.startHeartbeat();
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
      
      this.emit('connected', { canisterId });
      
    } catch (error) {
      this.handleConnectionError(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect WebSocket connection
   */
  disconnect(): void {
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionStatus('disconnected');
    this.emit('disconnected', {});
  }

  /**
   * Reconnect with exponential backoff
   */
  async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.reconnectStrategy.maxAttempts) {
      console.error('Max reconnection attempts reached');
      this.setConnectionStatus('error');
      return;
    }

    const delay = this.calculateReconnectDelay();
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        this.reconnectAttempts++;
        this.connectionMetrics.reconnectCount++;
        this.connectionMetrics.lastReconnect = new Date();
        
        await this.connect();
        
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.reconnect(); // Try again
      }
    }, delay);
  }

  /**
   * Subscribe to specific event types
   */
  subscribe<T = any>(eventType: WebSocketEventType, callback: SubscriptionCallback<T>): string {
    const subscriptionId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.subscriptions.set(subscriptionId, callback as SubscriptionCallback);
    
    // Send subscription message to server
    this.sendMessage({
      type: 'subscribe' as WebSocketEventType,
      timestamp: new Date().toISOString(),
      data: { eventType, subscriptionId }
    });
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      
      // Send unsubscription message to server
      this.sendMessage({
        type: 'unsubscribe' as WebSocketEventType,
        timestamp: new Date().toISOString(),
        data: { subscriptionId }
      });
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get connection quality assessment
   */
  getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality;
  }

  /**
   * Get connection metrics
   */
  getConnectionMetrics(): ConnectionMetrics {
    return { ...this.connectionMetrics };
  }

  /**
   * Set heartbeat interval
   */
  setHeartbeatInterval(interval: number): void {
    this.config.heartbeatInterval = interval;
    
    if (this.heartbeatTimer) {
      this.clearHeartbeatTimer();
      this.startHeartbeat();
    }
  }

  /**
   * Set reconnection strategy
   */
  setReconnectStrategy(strategy: ReconnectStrategy): void {
    this.config.reconnectStrategy = strategy;
  }

  /**
   * Add event listener for connection events
   */
  addEventListener(event: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, listener: (event: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // ===== PRIVATE METHODS =====

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      console.log('WebSocket connected');
      this.setConnectionStatus('connected');
      this.updateConnectionQuality();
      this.emit('open', event);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.setConnectionStatus('disconnected');
      this.clearHeartbeatTimer();
      
      // Attempt reconnection if not a clean close
      if (event.code !== 1000 && this.reconnectAttempts < this.config.reconnectStrategy.maxAttempts) {
        this.reconnect();
      }
      
      this.emit('close', event);
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.connectionMetrics.errorCount++;
      this.handleConnectionError(new Error('WebSocket connection error'));
      this.emit('error', event);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      this.connectionMetrics.messagesReceived++;
      
      let message: WebSocketMessage;
      
      // Handle compressed messages if enabled
      if (this.config.compressionEnabled && typeof event.data === 'string') {
        // In a real implementation, you would decompress here
        message = JSON.parse(event.data);
      } else {
        message = JSON.parse(event.data);
      }

      // Handle heartbeat responses
      if (message.type === 'heartbeat' as WebSocketEventType) {
        this.handleHeartbeatResponse(message);
        return;
      }

      // Update connection quality based on message timing
      this.updateConnectionQuality();

      // Notify subscribers
      this.notifySubscribers(message);
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.connectionMetrics.errorCount++;
    }
  }

  /**
   * Notify subscribers of new messages
   */
  private notifySubscribers(message: WebSocketMessage): void {
    this.subscriptions.forEach((callback, subscriptionId) => {
      try {
        // Check if subscription matches message type
        const eventType = subscriptionId.split('_')[0] as WebSocketEventType;
        if (eventType === message.type || eventType === 'all') {
          callback(message.data, message);
        }
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  /**
   * Send message through WebSocket
   */
  private sendMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      let payload: string;
      
      // Handle compression if enabled
      if (this.config.compressionEnabled) {
        // In a real implementation, you would compress here
        payload = JSON.stringify(message);
      } else {
        payload = JSON.stringify(message);
      }

      // Check message size
      if (payload.length > this.config.maxMessageSize) {
        console.warn('Message size exceeds limit:', payload.length);
        return;
      }

      this.ws.send(payload);
      this.connectionMetrics.messagesSent++;
      
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.connectionMetrics.errorCount++;
    }
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    if (this.config.heartbeatInterval <= 0) return;

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  /**
   * Send heartbeat message
   */
  private sendHeartbeat(): void {
    const heartbeatMessage: WebSocketMessage = {
      type: 'heartbeat' as WebSocketEventType,
      timestamp: new Date().toISOString(),
      data: { timestamp: Date.now() }
    };

    this.lastHeartbeat = new Date();
    this.sendMessage(heartbeatMessage);
  }

  /**
   * Handle heartbeat response
   */
  private handleHeartbeatResponse(message: WebSocketMessage): void {
    if (this.lastHeartbeat) {
      const latency = Date.now() - message.data.timestamp;
      this.connectionMetrics.latency = latency;
      this.updateConnectionQuality();
    }
  }

  /**
   * Update connection quality based on metrics
   */
  private updateConnectionQuality(): void {
    const { latency, errorCount, messagesReceived } = this.connectionMetrics;
    
    // Calculate quality based on latency and error rate
    const errorRate = messagesReceived > 0 ? errorCount / messagesReceived : 0;
    
    if (latency < 100 && errorRate < 0.01) {
      this.connectionQuality = 'excellent';
    } else if (latency < 300 && errorRate < 0.05) {
      this.connectionQuality = 'good';
    } else if (latency < 1000 && errorRate < 0.1) {
      this.connectionQuality = 'poor';
    } else {
      this.connectionQuality = 'unstable';
    }
  }

  /**
   * Calculate reconnection delay with exponential backoff
   */
  private calculateReconnectDelay(): number {
    const { initialDelay, maxDelay, backoffMultiplier, jitterEnabled } = this.config.reconnectStrategy;
    
    let delay = initialDelay * Math.pow(backoffMultiplier, this.reconnectAttempts);
    delay = Math.min(delay, maxDelay);
    
    // Add jitter to prevent thundering herd
    if (jitterEnabled) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Wait for WebSocket connection to open
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000); // 10 second timeout

      this.ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    console.error('WebSocket connection error:', error);
    this.setConnectionStatus('error');
    this.connectionMetrics.errorCount++;
    
    // Emit error event
    this.emit('connectionError', { error: error.message });
  }

  /**
   * Set connection status and emit event
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.emit('statusChange', { status });
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Clear heartbeat timer
   */
  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

/**
 * Default WebSocket configuration
 */
export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: 'wss://api.ic0.app/ws',
  protocols: ['icp-dashboard-v1'],
  heartbeatInterval: 30000, // 30 seconds
  maxMessageSize: 1024 * 1024, // 1MB
  compressionEnabled: true,
  reconnectStrategy: {
    maxAttempts: 10,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    jitterEnabled: true
  }
};

/**
 * Create WebSocket manager instance with default configuration
 */
export const createWebSocketManager = (config?: Partial<WebSocketConfig>): WebSocketManager => {
  const finalConfig = { ...DEFAULT_WEBSOCKET_CONFIG, ...config };
  return new WebSocketManager(finalConfig);
};