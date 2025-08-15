import { WebSocketManager, WebSocketEventType, DEFAULT_WEBSOCKET_CONFIG } from './websocket-manager';
import { ICPTransactionData, ICPMetricsData, EnhancedDashboardError } from '@/types/dashboard';

/**
 * Real-time configuration options
 */
export interface RealTimeConfig {
  enableWebSocket: boolean;
  enablePollingFallback: boolean;
  heartbeatInterval: number;
  maxReconnectAttempts: number;
  updateThrottling: {
    enabled: boolean;
    interval: number;
  };
  bandwidthOptimization: boolean;
  pollingInterval: number;
  maxConcurrentConnections: number;
}

/**
 * Update callback types
 */
export type MetricsUpdateCallback = (metrics: ICPMetricsData) => void;
export type TransactionUpdateCallback = (transaction: ICPTransactionData) => void;
export type ErrorUpdateCallback = (error: EnhancedDashboardError) => void;
export type StatusUpdateCallback = (status: any) => void;

/**
 * Real-time update payload
 */
export interface RealTimeUpdate<T = any> {
  type: 'metrics' | 'transaction' | 'error' | 'status';
  timestamp: string;
  data: T;
  metadata: {
    source: 'websocket' | 'polling';
    version: string;
    checksum?: string;
    compressed?: boolean;
  };
}

/**
 * Bandwidth optimization settings
 */
export interface BandwidthSettings {
  enabled: boolean;
  compressionLevel: number;
  deltaUpdatesOnly: boolean;
  batchUpdates: boolean;
  maxBatchSize: number;
  maxBatchDelay: number;
}

/**
 * Connection health metrics
 */
export interface ConnectionHealth {
  websocketStatus: 'connected' | 'disconnected' | 'error';
  pollingStatus: 'active' | 'inactive' | 'error';
  lastUpdate: Date | null;
  updateFrequency: number; // updates per minute
  dataFreshness: number; // seconds since last update
  errorCount: number;
  reconnectCount: number;
}

/**
 * Real-Time Data Manager
 * Coordinates WebSocket and polling updates for the ICP dashboard
 */
export class RealTimeDataManager {
  private config: RealTimeConfig;
  private wsManager: WebSocketManager | null = null;
  private pollingTimer: NodeJS.Timeout | null = null;
  private throttleTimer: NodeJS.Timeout | null = null;
  private isActive = false;
  private canisterId?: string;
  
  // Callback storage
  private metricsCallbacks = new Set<MetricsUpdateCallback>();
  private transactionCallbacks = new Set<TransactionUpdateCallback>();
  private errorCallbacks = new Set<ErrorUpdateCallback>();
  private statusCallbacks = new Set<StatusUpdateCallback>();
  
  // Update tracking
  private lastUpdate: Date | null = null;
  private updateCount = 0;
  private errorCount = 0;
  private reconnectCount = 0;
  private pendingUpdates: RealTimeUpdate[] = [];
  
  // Bandwidth optimization
  private bandwidthSettings: BandwidthSettings;
  private lastMetricsSnapshot: ICPMetricsData | null = null;
  
  constructor(config: RealTimeConfig) {
    this.config = config;
    this.bandwidthSettings = {
      enabled: config.bandwidthOptimization,
      compressionLevel: 6,
      deltaUpdatesOnly: true,
      batchUpdates: true,
      maxBatchSize: 10,
      maxBatchDelay: 1000
    };
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates(canisterId?: string): void {
    if (this.isActive) {
      console.warn('Real-time updates already active');
      return;
    }

    this.canisterId = canisterId;
    this.isActive = true;
    this.errorCount = 0;
    this.reconnectCount = 0;

    console.log('Starting real-time updates...');

    // Initialize WebSocket connection if enabled
    if (this.config.enableWebSocket) {
      this.initializeWebSocket();
    }

    // Initialize polling fallback if enabled
    if (this.config.enablePollingFallback) {
      this.initializePolling();
    }

    // Start update throttling if enabled
    if (this.config.updateThrottling.enabled) {
      this.startUpdateThrottling();
    }
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (!this.isActive) {
      return;
    }

    console.log('Stopping real-time updates...');
    
    this.isActive = false;
    
    // Disconnect WebSocket
    if (this.wsManager) {
      this.wsManager.disconnect();
      this.wsManager = null;
    }
    
    // Stop polling
    this.stopPolling();
    
    // Stop throttling
    this.stopUpdateThrottling();
    
    // Clear pending updates
    this.pendingUpdates = [];
  }

  /**
   * Pause updates temporarily
   */
  pauseUpdates(): void {
    if (this.wsManager) {
      // Don't disconnect, just stop processing updates
      console.log('Pausing real-time updates...');
    }
    this.stopPolling();
  }

  /**
   * Resume updates
   */
  resumeUpdates(): void {
    if (this.isActive) {
      console.log('Resuming real-time updates...');
      
      if (this.config.enablePollingFallback) {
        this.initializePolling();
      }
    }
  }

  /**
   * Register metrics update callback
   */
  onMetricsUpdate(callback: MetricsUpdateCallback): () => void {
    this.metricsCallbacks.add(callback);
    return () => this.metricsCallbacks.delete(callback);
  }

  /**
   * Register transaction update callback
   */
  onTransactionUpdate(callback: TransactionUpdateCallback): () => void {
    this.transactionCallbacks.add(callback);
    return () => this.transactionCallbacks.delete(callback);
  }

  /**
   * Register error update callback
   */
  onErrorUpdate(callback: ErrorUpdateCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Register status update callback
   */
  onStatusUpdate(callback: StatusUpdateCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  /**
   * Enable or disable polling fallback
   */
  enablePollingFallback(enabled: boolean): void {
    this.config.enablePollingFallback = enabled;
    
    if (this.isActive) {
      if (enabled) {
        this.initializePolling();
      } else {
        this.stopPolling();
      }
    }
  }

  /**
   * Set polling interval
   */
  setPollingInterval(interval: number): void {
    this.config.pollingInterval = interval;
    
    if (this.isActive && this.config.enablePollingFallback) {
      this.stopPolling();
      this.initializePolling();
    }
  }

  /**
   * Enable or disable update throttling
   */
  setUpdateThrottling(enabled: boolean, interval?: number): void {
    this.config.updateThrottling.enabled = enabled;
    if (interval) {
      this.config.updateThrottling.interval = interval;
    }
    
    if (this.isActive) {
      if (enabled) {
        this.startUpdateThrottling();
      } else {
        this.stopUpdateThrottling();
      }
    }
  }

  /**
   * Enable or disable bandwidth optimization
   */
  setBandwidthOptimization(enabled: boolean): void {
    this.config.bandwidthOptimization = enabled;
    this.bandwidthSettings.enabled = enabled;
  }

  /**
   * Get connection health status
   */
  getConnectionHealth(): ConnectionHealth {
    const now = new Date();
    const timeSinceLastUpdate = this.lastUpdate 
      ? (now.getTime() - this.lastUpdate.getTime()) / 1000 
      : Infinity;

    return {
      websocketStatus: this.wsManager?.getConnectionStatus() || 'disconnected',
      pollingStatus: this.pollingTimer ? 'active' : 'inactive',
      lastUpdate: this.lastUpdate,
      updateFrequency: this.calculateUpdateFrequency(),
      dataFreshness: timeSinceLastUpdate,
      errorCount: this.errorCount,
      reconnectCount: this.reconnectCount
    };
  }

  /**
   * Force immediate update
   */
  async forceUpdate(): Promise<void> {
    console.log('Forcing immediate update...');
    
    if (this.wsManager && this.wsManager.getConnectionStatus() === 'connected') {
      // Request immediate update via WebSocket
      // Implementation would depend on server protocol
    } else {
      // Perform polling update
      await this.performPollingUpdate();
    }
  }

  // ===== PRIVATE METHODS =====

  /**
   * Initialize WebSocket connection
   */
  private async initializeWebSocket(): void {
    try {
      const wsConfig = {
        ...DEFAULT_WEBSOCKET_CONFIG,
        heartbeatInterval: this.config.heartbeatInterval,
        reconnectStrategy: {
          ...DEFAULT_WEBSOCKET_CONFIG.reconnectStrategy,
          maxAttempts: this.config.maxReconnectAttempts
        }
      };

      this.wsManager = new WebSocketManager(wsConfig);
      
      // Set up event listeners
      this.setupWebSocketListeners();
      
      // Connect to WebSocket
      await this.wsManager.connect(this.canisterId);
      
      console.log('WebSocket connection established');
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.errorCount++;
      
      // Fall back to polling if WebSocket fails
      if (this.config.enablePollingFallback) {
        console.log('Falling back to polling...');
        this.initializePolling();
      }
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupWebSocketListeners(): void {
    if (!this.wsManager) return;

    // Subscribe to different event types
    this.wsManager.subscribe('metrics_update', (data: ICPMetricsData) => {
      this.handleMetricsUpdate(data, 'websocket');
    });

    this.wsManager.subscribe('transaction_update', (data: ICPTransactionData) => {
      this.handleTransactionUpdate(data, 'websocket');
    });

    this.wsManager.subscribe('error_update', (data: EnhancedDashboardError) => {
      this.handleErrorUpdate(data, 'websocket');
    });

    // Handle connection events
    this.wsManager.addEventListener('connected', () => {
      console.log('WebSocket connected - stopping polling fallback');
      this.stopPolling();
    });

    this.wsManager.addEventListener('disconnected', () => {
      console.log('WebSocket disconnected - starting polling fallback');
      this.reconnectCount++;
      
      if (this.config.enablePollingFallback) {
        this.initializePolling();
      }
    });

    this.wsManager.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      this.errorCount++;
    });
  }

  /**
   * Initialize polling mechanism
   */
  private initializePolling(): void {
    if (this.pollingTimer) {
      return; // Already polling
    }

    console.log(`Starting polling with ${this.config.pollingInterval}ms interval`);
    
    this.pollingTimer = setInterval(() => {
      this.performPollingUpdate();
    }, this.config.pollingInterval);

    // Perform initial update
    this.performPollingUpdate();
  }

  /**
   * Stop polling mechanism
   */
  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      console.log('Polling stopped');
    }
  }

  /**
   * Perform polling update
   */
  private async performPollingUpdate(): Promise<void> {
    try {
      // In a real implementation, this would make HTTP requests to ICP canister
      // For now, we'll simulate with mock data
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      // Generate mock updates (in real implementation, fetch from canister)
      const mockMetrics = this.generateMockMetricsUpdate();
      const mockTransaction = this.generateMockTransactionUpdate();
      
      if (mockMetrics) {
        this.handleMetricsUpdate(mockMetrics, 'polling');
      }
      
      if (mockTransaction) {
        this.handleTransactionUpdate(mockTransaction, 'polling');
      }
      
    } catch (error) {
      console.error('Polling update failed:', error);
      this.errorCount++;
    }
  }

  /**
   * Handle metrics update
   */
  private handleMetricsUpdate(metrics: ICPMetricsData, source: 'websocket' | 'polling'): void {
    // Apply bandwidth optimization
    if (this.bandwidthSettings.enabled && this.bandwidthSettings.deltaUpdatesOnly) {
      if (this.lastMetricsSnapshot && this.isMetricsSimilar(metrics, this.lastMetricsSnapshot)) {
        return; // Skip similar updates
      }
    }

    const update: RealTimeUpdate<ICPMetricsData> = {
      type: 'metrics',
      timestamp: new Date().toISOString(),
      data: metrics,
      metadata: {
        source,
        version: '1.0',
        compressed: this.bandwidthSettings.enabled
      }
    };

    this.processUpdate(update);
    this.lastMetricsSnapshot = metrics;
  }

  /**
   * Handle transaction update
   */
  private handleTransactionUpdate(transaction: ICPTransactionData, source: 'websocket' | 'polling'): void {
    const update: RealTimeUpdate<ICPTransactionData> = {
      type: 'transaction',
      timestamp: new Date().toISOString(),
      data: transaction,
      metadata: {
        source,
        version: '1.0'
      }
    };

    this.processUpdate(update);
  }

  /**
   * Handle error update
   */
  private handleErrorUpdate(error: EnhancedDashboardError, source: 'websocket' | 'polling'): void {
    const update: RealTimeUpdate<EnhancedDashboardError> = {
      type: 'error',
      timestamp: new Date().toISOString(),
      data: error,
      metadata: {
        source,
        version: '1.0'
      }
    };

    this.processUpdate(update);
  }

  /**
   * Process update with throttling and batching
   */
  private processUpdate(update: RealTimeUpdate): void {
    this.updateCount++;
    this.lastUpdate = new Date();

    if (this.config.updateThrottling.enabled) {
      this.pendingUpdates.push(update);
      return;
    }

    this.deliverUpdate(update);
  }

  /**
   * Deliver update to callbacks
   */
  private deliverUpdate(update: RealTimeUpdate): void {
    try {
      switch (update.type) {
        case 'metrics':
          this.metricsCallbacks.forEach(callback => {
            callback(update.data as ICPMetricsData);
          });
          break;
          
        case 'transaction':
          this.transactionCallbacks.forEach(callback => {
            callback(update.data as ICPTransactionData);
          });
          break;
          
        case 'error':
          this.errorCallbacks.forEach(callback => {
            callback(update.data as EnhancedDashboardError);
          });
          break;
          
        case 'status':
          this.statusCallbacks.forEach(callback => {
            callback(update.data);
          });
          break;
      }
    } catch (error) {
      console.error('Error delivering update:', error);
      this.errorCount++;
    }
  }

  /**
   * Start update throttling
   */
  private startUpdateThrottling(): void {
    if (this.throttleTimer) {
      return;
    }

    this.throttleTimer = setInterval(() => {
      this.processPendingUpdates();
    }, this.config.updateThrottling.interval);
  }

  /**
   * Stop update throttling
   */
  private stopUpdateThrottling(): void {
    if (this.throttleTimer) {
      clearInterval(this.throttleTimer);
      this.throttleTimer = null;
    }
    
    // Process any remaining updates
    this.processPendingUpdates();
  }

  /**
   * Process pending updates
   */
  private processPendingUpdates(): void {
    if (this.pendingUpdates.length === 0) {
      return;
    }

    // Batch updates if enabled
    if (this.bandwidthSettings.batchUpdates) {
      const batches = this.createUpdateBatches();
      batches.forEach(batch => {
        batch.forEach(update => this.deliverUpdate(update));
      });
    } else {
      this.pendingUpdates.forEach(update => this.deliverUpdate(update));
    }

    this.pendingUpdates = [];
  }

  /**
   * Create update batches for bandwidth optimization
   */
  private createUpdateBatches(): RealTimeUpdate[][] {
    const batches: RealTimeUpdate[][] = [];
    const batchSize = this.bandwidthSettings.maxBatchSize;
    
    for (let i = 0; i < this.pendingUpdates.length; i += batchSize) {
      batches.push(this.pendingUpdates.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Calculate update frequency
   */
  private calculateUpdateFrequency(): number {
    // Calculate updates per minute based on recent activity
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // This is a simplified calculation
    // In a real implementation, you'd track timestamps of recent updates
    return this.updateCount > 0 ? Math.min(60, this.updateCount) : 0;
  }

  /**
   * Check if metrics are similar (for delta updates)
   */
  private isMetricsSimilar(current: ICPMetricsData, previous: ICPMetricsData): boolean {
    // Simple similarity check - in real implementation, this would be more sophisticated
    const threshold = 0.01; // 1% change threshold
    
    const paymentsDiff = Math.abs(current.payments - previous.payments) / previous.payments;
    const revenueDiff = Math.abs(current.revenue - previous.revenue) / previous.revenue;
    
    return paymentsDiff < threshold && revenueDiff < threshold;
  }

  /**
   * Generate mock metrics update (for polling simulation)
   */
  private generateMockMetricsUpdate(): ICPMetricsData | null {
    // Only generate update occasionally to simulate real behavior
    if (Math.random() > 0.3) {
      return null;
    }

    // In real implementation, this would come from the mock data service
    // For now, return null to avoid circular dependencies
    return null;
  }

  /**
   * Generate mock transaction update (for polling simulation)
   */
  private generateMockTransactionUpdate(): ICPTransactionData | null {
    // Only generate update occasionally
    if (Math.random() > 0.1) {
      return null;
    }

    // In real implementation, this would come from the mock data service
    return null;
  }
}

/**
 * Default real-time configuration
 */
export const DEFAULT_REALTIME_CONFIG: RealTimeConfig = {
  enableWebSocket: true,
  enablePollingFallback: true,
  heartbeatInterval: 30000, // 30 seconds
  maxReconnectAttempts: 10,
  updateThrottling: {
    enabled: true,
    interval: 1000 // 1 second
  },
  bandwidthOptimization: true,
  pollingInterval: 5000, // 5 seconds
  maxConcurrentConnections: 3
};

/**
 * Create real-time data manager instance
 */
export const createRealTimeDataManager = (config?: Partial<RealTimeConfig>): RealTimeDataManager => {
  const finalConfig = { ...DEFAULT_REALTIME_CONFIG, ...config };
  return new RealTimeDataManager(finalConfig);
};