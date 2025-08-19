import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useFactory } from './useFactory';
import { createActor } from '@/services/user-payment-idl';
import { 
  DashboardData,
  MetricsData,
  ConfigData,
  WebhookData,
  DashboardError,
  ConnectionHealth
} from '@/types/dashboard';
import { mockDataService } from '@/services/mock-data';

// All dashboard tab data interface
export interface AllDashboardData {
  // Basic dashboard data
  analytics: MetricsData | null;
  config: ConfigData | null;
  webhooks: WebhookData[] | null;
  
  // User payment canister specific data
  tokens: any[] | null;
  modals: any[] | null;
  discounts: any[] | null;
  subscriptions: any[] | null;
  subscriptionPlans: any[] | null;
  products: any[] | null;
  
  // Raw canister data
  userCanisters: any[] | null;
  selectedCanister: any | null;
}

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Hook options interface
export interface UseDashboardDataOptions {
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  fallbackToMock?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Hook return interface
export interface UseDashboardDataReturn {
  // All tab data
  allData: AllDashboardData | null;
  
  // Individual data access (for convenience)
  analytics: MetricsData | null;
  config: ConfigData | null;
  webhooks: WebhookData[] | null;
  tokens: any[] | null;
  modals: any[] | null;
  discounts: any[] | null;
  subscriptions: any[] | null;
  subscriptionPlans: any[] | null;
  products: any[] | null;
  userCanisters: any[] | null;
  selectedCanister: any | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: DashboardError | null;
  hasError: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
  selectCanister: (canisterId: string) => void;
  
  // Status
  lastRefresh: Date | null;
  connectionStatus: ConnectionStatus;
  isUsingMockData: boolean;
  
  // Connection health
  connectionHealth: ConnectionHealth;
}

/**
 * Comprehensive dashboard data hook that loads ALL tab data upfront
 * Uses userCanisterList from factory to populate all tabs simultaneously
 */
export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const {
    refreshInterval = 30000,
    enableAutoRefresh = true,
    fallbackToMock = true,
    retryAttempts = 1,
    retryDelay = 2000
  } = options;

  const { identity } = useAuth();
  const { data: factoryData, isLoading: factoryLoading } = useFactory();

  // State management
  const [allData, setAllData] = useState<AllDashboardData | null>(null);
  const [selectedCanisterId, setSelectedCanisterId] = useState<string | null>(null);
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
  const userCanisters = factoryData?.userCanisters || [];
  const selectedCanister = selectedCanisterId 
    ? userCanisters.find(c => c.id.toText() === selectedCanisterId)
    : userCanisters[0] || null;

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
      selectedCanisterId,
      refreshInterval,
      isUsingMockData
    }
  }), [selectedCanisterId, refreshInterval, isUsingMockData]);

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
   * Fetch data from a specific user payment canister
   */
  const fetchCanisterData = useCallback(async (canister: any, signal?: AbortSignal) => {
    if (!identity || !canister?.id) return null;

    try {
      const actor = createActor(canister.id.toText(), { 
        agent: { identity } as any 
      });

      // Fetch all canister data simultaneously
      const [
        analytics,
        configuration,
        supportedTokens,
        modalConfigs,
        coupons,
        allSubscriptions,
        subscriptionPlans,
        products
      ] = await Promise.all([
        actor.get_enhanced_analytics().catch(() => null),
        actor.get_configuration().catch(() => null),
        actor.get_supported_tokens().catch(() => []),
        actor.list_my_modals().catch(() => []),
        actor.list_my_coupons().catch(() => []),
        actor.list_all_subscriptions().catch(() => []),
        actor.list_subscription_plans().catch(() => []),
        actor.list_products().catch(() => [])
      ]);

      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      return {
        analytics,
        configuration,
        supportedTokens,
        modalConfigs,
        coupons,
        allSubscriptions,
        subscriptionPlans,
        products
      };
    } catch (err) {
      console.warn(`Failed to fetch data from canister ${canister.id.toText()}:`, err);
      return null;
    }
  }, [identity]);

  /**
   * Fetch all dashboard data from available canisters
   */
  const fetchAllDashboardData = useCallback(async (signal?: AbortSignal): Promise<AllDashboardData> => {
    try {
      setConnectionStatus('connecting');
      updateConnectionHealth('connecting');

      if (!userCanisters.length) {
        // If no user canisters, return basic mock data
        if (fallbackToMock) {
          setIsUsingMockData(true);
          const mockDashboardData = mockDataService.generateDashboardData();
          
          return {
            analytics: mockDashboardData.metrics,
            config: mockDashboardData.config,
            webhooks: mockDashboardData.webhooks,
            tokens: [],
            modals: [],
            discounts: [],
            subscriptions: [],
            subscriptionPlans: [],
            products: [],
            userCanisters: [],
            selectedCanister: null
          };
        }
        throw new Error('No user canisters available');
      }

      // Use selected canister or first available canister
      const targetCanister = selectedCanister || userCanisters[0];
      const canisterData = await fetchCanisterData(targetCanister, signal);

      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      let analytics: MetricsData | null = null;
      let config: ConfigData | null = null;
      let webhooks: WebhookData[] | null = null;

      if (canisterData) {
        // Transform canister analytics to dashboard format
        if (canisterData.analytics) {
          analytics = {
            totalTransactions: Number(canisterData.analytics.total_transactions || 0),
            totalVolume: Array.isArray(canisterData.analytics.total_volume) 
              ? canisterData.analytics.total_volume.reduce((sum: number, [_, amount]: [string, bigint]) => sum + Number(amount), 0)
              : 0,
            successRate: Number(canisterData.analytics.success_rate || 0),
            averageAmount: Array.isArray(canisterData.analytics.average_amount) && canisterData.analytics.average_amount.length > 0
              ? Number(canisterData.analytics.average_amount[0][1])
              : 0,
            topTokens: Array.isArray(canisterData.analytics.top_tokens) 
              ? canisterData.analytics.top_tokens 
              : []
          };
        }

        // Transform configuration data
        if (canisterData.configuration) {
          config = {
            apiKeys: [],
            canisterEndpoints: [{
              id: targetCanister.id.toText(),
              name: canisterData.configuration.name || 'User Payment Canister',
              environment: 'production',
              status: 'active'
            }],
            webhookUrl: canisterData.configuration.webhook || null,
            autoWithdraw: canisterData.configuration.auto_withdraw || false,
            merchantFee: Number(canisterData.configuration.merchant_fee || 0)
          };
        }

        // Mock webhooks for now - this would be implemented in future
        webhooks = [];
      }

      setConnectionStatus('connected');
      updateConnectionHealth('connected');
      setIsUsingMockData(false);

      return {
        analytics,
        config,
        webhooks,
        tokens: canisterData?.supportedTokens || [],
        modals: canisterData?.modalConfigs || [],
        discounts: canisterData?.coupons || [],
        subscriptions: canisterData?.allSubscriptions || [],
        subscriptionPlans: canisterData?.subscriptionPlans || [],
        products: canisterData?.products || [],
        userCanisters: userCanisters,
        selectedCanister: targetCanister
      };

    } catch (err) {
      console.warn('Failed to fetch canister data, falling back to mock data:', err);
      
      if (!fallbackToMock) {
        setConnectionStatus('disconnected');
        updateConnectionHealth('disconnected', true);
        throw err;
      }

      // Fallback to mock data
      setConnectionStatus('connected');
      updateConnectionHealth('connected');
      setIsUsingMockData(true);
      
      const mockDashboardData = mockDataService.generateDashboardData();
      
      return {
        analytics: mockDashboardData.metrics,
        config: mockDashboardData.config,
        webhooks: mockDashboardData.webhooks,
        tokens: [],
        modals: [],
        discounts: [],
        subscriptions: [],
        subscriptionPlans: [],
        products: [],
        userCanisters: userCanisters,
        selectedCanister: selectedCanister
      };
    }
  }, [userCanisters, selectedCanister, fallbackToMock, fetchCanisterData, updateConnectionHealth]);

  /**
   * Main data loading function
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

      const dashboardData = await fetchAllDashboardData(abortController.signal);
      
      setAllData(dashboardData);
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

    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [fetchAllDashboardData, createError, updateConnectionHealth, hasInitialData]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  /**
   * Select a specific canister
   */
  const selectCanister = useCallback((canisterId: string) => {
    setSelectedCanisterId(canisterId);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load data when factory data is available and not loading
  useEffect(() => {
    if (!factoryLoading && factoryData?.userCanisters) {
      loadData(false);
    }
  }, [factoryLoading, factoryData?.userCanisters.length, loadData]);

  // Reload data when selected canister changes
  useEffect(() => {
    if (selectedCanisterId && hasInitialData) {
      loadData(false);
    }
  }, [selectedCanisterId]);

  // Setup auto-refresh
  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;
  
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
    // All tab data
    allData,
    
    // Individual data access (for convenience)
    analytics: allData?.analytics || null,
    config: allData?.config || null,
    webhooks: allData?.webhooks || null,
    tokens: allData?.tokens || null,
    modals: allData?.modals || null,
    discounts: allData?.discounts || null,
    subscriptions: allData?.subscriptions || null,
    subscriptionPlans: allData?.subscriptionPlans || null,
    products: allData?.products || null,
    userCanisters: allData?.userCanisters || null,
    selectedCanister: allData?.selectedCanister || null,
    
    // Loading states
    isLoading: isLoading || factoryLoading,
    isRefreshing,
    
    // Error handling
    error,
    hasError,
    
    // Actions
    refetch,
    clearError,
    selectCanister,
    
    // Status
    lastRefresh,
    connectionStatus,
    isUsingMockData,
    
    // Connection health
    connectionHealth
  };
}

export default useDashboardData;
