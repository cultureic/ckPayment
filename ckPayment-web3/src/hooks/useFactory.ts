import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { useAuth } from './useAuth';
import factoryService, { 
  FactoryStats, 
  CanisterRecord, 
  UserCanisterConfig, 
  DeploymentResult 
} from '../services/factory-service';

export interface FactoryData {
  stats: FactoryStats | null;
  userCanisters: CanisterRecord[];
  allCanisters: CanisterRecord[];
  recentDeployments: Array<{
    id: string;
    name: string;
    owner: string;
    created_at: Date;
    status: 'active' | 'pending' | 'error';
    version: string;
  }>;
}

export interface UseFactoryReturn {
  // Data
  data: FactoryData | null;
  
  // Loading states
  isLoading: boolean;
  isDeploying: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  deployCanister: (config: UserCanisterConfig) => Promise<DeploymentResult>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Status
  lastRefresh: Date | null;
  isInitialized: boolean;
}

export function useFactory(): UseFactoryReturn {
  const { identity, principal } = useAuth();
  
  // State management
  const [data, setData] = useState<FactoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize factory service
  const initializeService = useCallback(async () => {
    try {
      const success = await factoryService.initialize(identity);
      setIsInitialized(success);
      return success;
    } catch (err) {
      console.error('Failed to initialize factory service:', err);
      setError('Failed to initialize factory service');
      setIsInitialized(false);
      return false;
    }
  }, [identity]);

  // Fetch factory data
  const fetchData = useCallback(async (useMockData = false) => {
    try {
      setError(null);
      
      let stats: FactoryStats | null = null;
      let userCanisters: CanisterRecord[] = [];
      let allCanisters: CanisterRecord[] = [];
      let recentDeployments: Array<{
        id: string;
        name: string;
        owner: string;
        created_at: Date;
        status: 'active' | 'pending' | 'error';
        version: string;
      }> = [];

      if (useMockData || !isInitialized) {
        // Use mock data when not initialized or explicitly requested
        stats = factoryService.getMockFactoryStats();
        recentDeployments = factoryService.getMockRecentDeployments();
        userCanisters = factoryService.getMockUserCanisters();
      } else {
        // Try to fetch real data
        try {
          [stats, allCanisters] = await Promise.all([
            factoryService.getFactoryStats(),
            factoryService.getAllActiveCanisters()
          ]);

          // Get user-specific canisters if we have a principal
          if (principal) {
            userCanisters = await factoryService.getUserCanisters(
              typeof principal === 'string' ? Principal.fromText(principal) : principal
            );
          }

          // Convert recent canisters to deployment format
          recentDeployments = allCanisters
            .sort((a, b) => Number(b.created_at - a.created_at))
            .slice(0, 5)
            .map(canister => ({
              id: canister.id.toText(),
              name: canister.name,
              owner: canister.owner.toText(),
              created_at: new Date(Number(canister.created_at) / 1_000_000), // Convert nanoseconds to milliseconds
              status: canister.is_active ? 'active' as const : 'error' as const,
              version: `1.${Number(canister.version)}.0`
            }));

        } catch (backendError) {
          console.warn('Failed to fetch from backend, using mock data:', backendError);
          // Fall back to mock data
          stats = factoryService.getMockFactoryStats();
          recentDeployments = factoryService.getMockRecentDeployments();
        }
      }

      setData({
        stats,
        userCanisters,
        allCanisters,
        recentDeployments
      });
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch factory data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch factory data');
    }
  }, [isInitialized, principal]);

  // Deploy new canister
  const deployCanister = useCallback(async (config: UserCanisterConfig): Promise<DeploymentResult> => {
    setIsDeploying(true);
    setError(null);

    try {
      if (!isInitialized) {
        throw new Error('Factory service not initialized');
      }

      const result = await factoryService.deployUserCanister(config);
      
      if (result.success) {
        // Refresh data after successful deployment
        await fetchData();
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to deploy canister';
      setError(error);
      return {
        success: false,
        error
      };
    } finally {
      setIsDeploying(false);
    }
  }, [isInitialized, fetchData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
    setIsLoading(false);
  }, [fetchData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize and fetch data on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      // Try to initialize the service
      const initialized = await initializeService();
      
      // Fetch data (will use mock if not initialized)
      await fetchData(!initialized);
      
      setIsLoading(false);
    };

    initialize();
  }, [initializeService, fetchData]);

  return {
    // Data
    data,
    
    // Loading states
    isLoading,
    isDeploying,
    
    // Error handling
    error,
    
    // Actions
    deployCanister,
    refreshData,
    clearError,
    
    // Status
    lastRefresh,
    isInitialized
  };
}
