import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DashboardData,
  MetricsData,
  ConfigData,
  WebhookData,
  DashboardError,
  ConnectionHealth
} from '@/types/dashboard';
import { mockDataService } from '@/services/mock-data';

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Hook options interface
export interface UseICPDataOptions {
  canisterId?: string;
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  fallbackToMock?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Hook return interface
export interface UseICPDataReturn {
  // Data
  data: DashboardData | null;
  metrics: MetricsData | null;
  config: ConfigData | null;
  webhooks: WebhookData[] | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: DashboardError | null;
  hasError: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Status
  lastRefresh: Date | null;
  connectionStatus: ConnectionStatus;
  isUsingMockData: boolean;
  
  // Connection health
  connectionHealth: ConnectionHealth;
}

/**
 * Custom hook for managing ICP dashboard data with automatic refresh,
 * error handling, and fallback to mock data
 */
export function useICPData(options: UseICPDataOptions = {}): UseICPDataReturn {
  const {
    canisterId,
    refreshInterval = 30000,
    enableAutoRefresh = true,
    fallbackToMock = true,
    retryAttempts = 1,
    retryDelay = 2000
  } = options;

  // State management
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isUsingMockData, setIsUsingMockData] = useState(fallbackToMock);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
    websocketStatus: 'disconnected',
    pollingStatus: 'inactive',
    lastUpdate: null,
    updateFrequency: refreshInterval,
    dataFreshness: 0,
    errorCount: 0,
    reconnectCount: 0,
    quality: 'poor'
  });

  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Derived state
  const hasError = error !== null;
  const metrics = data?.metrics || null;
  const config = data?.config || null;
  const webhooks = data?.webhooks || null;

  /**
   * Create a dashboard error object
   */
  const createError = useCallback((
    type: DashboardError['type'],
    message: string,
    details?: string,
    retryable = true
  ): DashboardError => ({
    type,
    message,
    details,
    retryable,
    timestamp: new Date().toISOString(),
    context: {
      canisterId,
      refreshInterval,
      isUsingMockData
    }
  }), [canisterId, refreshInterval, isUsingMockData]);

  /**
   * Update connection health metrics
   */
  const updateConnectionHealth = useCallback((
    status: ConnectionStatus,
    errorOccurred = false
  ) => {
    setConnectionHealth(prev => {
      const now = new Date();
      const timeSinceLastUpdate = prev.lastUpdate ? now.getTime() - prev.lastUpdate.getTime() : 0;
      
      return {
        ...prev,
        websocketStatus: status === 'connected' ? 'connected' : 'disconnected',
        pollingStatus: status === 'connected' ? 'active' : 'inactive',
        lastUpdate: now,
        dataFreshness: timeSinceLastUpdate,
        errorCount: errorOccurred ? prev.errorCount + 1 : prev.errorCount,
        reconnectCount: status === 'connecting' ? prev.reconnectCount + 1 : prev.reconnectCount,
        quality: status === 'connected' ? 
          (prev.errorCount < 3 ? 'excellent' : 'good') : 
          (prev.errorCount > 10 ? 'poor' : 'unstable')
      };
    });
  }, []);

  /**
   * Simulate network delay for realistic mock data
   */
  const simulateNetworkDelay = useCallback(async (isInitialLoad = false): Promise<void> => {
    // Shorter delay for auto-refresh to reduce flickering, longer for initial load for realism
    const delay = isInitialLoad ? Math.random() * 800 + 300 : Math.random() * 300 + 100; // 300-1100ms initial, 100-400ms refresh
    return new Promise(resolve => setTimeout(resolve, delay));
  }, []);

  /**
   * Fetch data from ICP canister (simulated)
   */
  const fetchICPData = useCallback(async (signal?: AbortSignal): Promise<DashboardData> => {
    // Simulate canister interaction
    if (canisterId && Math.random() > 0.8) {
      // 20% chance of successful canister connection
      await simulateNetworkDelay();
      
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      // Generate real data (currently using mock service)
      return mockDataService.generateDashboardData();
    } else {
      // Simulate canister connection failure
      throw new Error('Failed to connect to ICP canister');
    }
  }, [canisterId, simulateNetworkDelay]);

  /**
   * Fetch data with fallback to mock data
   */
  const fetchData = useCallback(async (signal?: AbortSignal, isRefresh = false): Promise<DashboardData> => {
    try {
      // Only show connecting status for initial loads or when not already using mock data
      if (!isRefresh || !isUsingMockData) {
        setConnectionStatus('connecting');
        updateConnectionHealth('connecting');
      }

      // Try to fetch from ICP canister first
      const data = await fetchICPData(signal);
      
      setConnectionStatus('connected');
      updateConnectionHealth('connected');
      setIsUsingMockData(false);
      
      return data;
    } catch (err) {
      console.warn('ICP canister fetch failed, falling back to mock data:', err);
      
      if (!fallbackToMock) {
        setConnectionStatus('disconnected');
        updateConnectionHealth('disconnected', true);
        throw err;
      }

      // For refresh operations when already using mock data, skip the delay
      if (!isRefresh || !isUsingMockData) {
        await simulateNetworkDelay(!hasInitialData);
      }
      
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      setConnectionStatus('connected');
      updateConnectionHealth('connected');
      setIsUsingMockData(true);
      
      return mockDataService.generateDashboardData();
    }
  }, [fetchICPData, fallbackToMock, simulateNetworkDelay, updateConnectionHealth, isUsingMockData, hasInitialData]);

  /**
   * Fetch data with retry logic
   */
  const fetchDataWithRetry = useCallback(async (
    attempt = 1,
    signal?: AbortSignal,
    isRefresh = false
  ): Promise<DashboardData> => {
    try {
      return await fetchData(signal, isRefresh);
    } catch (err) {
      if (signal?.aborted) {
        throw err;
      }

      if (attempt < retryAttempts) {
        console.log(`Fetch attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
        
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, retryDelay * attempt);
        });

        if (signal?.aborted) {
          throw new Error('Request aborted during retry delay');
        }

        return fetchDataWithRetry(attempt + 1, signal, isRefresh);
      }

      throw err;
    }
  }, [fetchData, retryAttempts, retryDelay]);

  /**
   * Main data fetching function
   */
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const dashboardData = await fetchDataWithRetry(1, abortController.signal, isRefresh);
      
      setData(dashboardData);
      setLastRefresh(new Date());
      setConnectionStatus('connected');
      updateConnectionHealth('connected');
      
      // Mark that we have initial data
      if (!hasInitialData) {
        setHasInitialData(true);
      }

    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request aborted') {
        return; // Request was cancelled, don't update state
      }

      console.error('Failed to load dashboard data:', err);
      
      const dashboardError = createError(
        'network',
        err.message || 'Failed to load dashboard data',
        err.stack,
        true
      );
      
      setError(dashboardError);
      setConnectionStatus('error');
      updateConnectionHealth('error', true);

      // If this is the initial load and we have fallback enabled, try mock data
      if (!isRefresh && !data && fallbackToMock && !isUsingMockData) {
        try {
          console.log('Attempting fallback to mock data...');
          const mockData = mockDataService.generateDashboardData();
          setData(mockData);
          setIsUsingMockData(true);
          setConnectionStatus('connected');
          updateConnectionHealth('connected');
          setLastRefresh(new Date());
        } catch (mockErr) {
          console.error('Mock data fallback also failed:', mockErr);
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [
    createError,
    fetchDataWithRetry,
    updateConnectionHealth,
    fallbackToMock,
    hasInitialData
  ]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // Initial data load - only run once
  useEffect(() => {
    let mounted = true;
    const initialLoad = async () => {
      if (mounted) {
        await loadData(false);
      }
    };
    initialLoad();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  // Setup auto-refresh - using refs to avoid dependency loops
  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;
  
  // State refs for auto-refresh condition checking
  const connectionStatusRef = useRef(connectionStatus);
  const isRefreshingRef = useRef(isRefreshing);
  const isLoadingRef = useRef(isLoading);
  
  connectionStatusRef.current = connectionStatus;
  isRefreshingRef.current = isRefreshing;
  isLoadingRef.current = isLoading;
  
  useEffect(() => {
    if (!enableAutoRefresh || refreshInterval <= 0 || !hasInitialData) {
      return;
    }

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      // Only auto-refresh if we're in a stable connected state and not already loading
      // Use refs to avoid triggering re-renders
      if (connectionStatusRef.current === 'connected' && !isRefreshingRef.current && !isLoadingRef.current) {
        loadDataRef.current(true);
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [enableAutoRefresh, refreshInterval, hasInitialData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    data,
    metrics,
    config,
    webhooks,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error handling
    error,
    hasError,
    
    // Actions
    refetch,
    clearError,
    
    // Status
    lastRefresh,
    connectionStatus,
    isUsingMockData,
    
    // Connection health
    connectionHealth
  };
}

export default useICPData;
