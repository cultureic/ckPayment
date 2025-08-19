// useModal Custom Hook
// Following FRONTEND_DEVELOPMENT_GUIDE.md patterns

import { useState, useEffect, useCallback, useRef } from 'react';
import { modalService } from '../services/modal-service';
import type { 
  ModalConfig, 
  ModalAnalytics, 
  ModalConfigFormData, 
  UseModalState, 
  UseModalActions, 
  UseModalReturn,
  ServiceResponse 
} from '../types/modal';

interface UseModalOptions {
  canisterId: string;
  autoFetch?: boolean;
  refreshInterval?: number;
}

export const useModal = (options: UseModalOptions): UseModalReturn => {
  const { canisterId, autoFetch = true, refreshInterval } = options;
  
  // State management
  const [state, setState] = useState<UseModalState>({
    modals: [],
    analytics: new Map(),
    loading: false,
    error: null,
  });

  // Refs for cleanup and preventing stale closures
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Helper functions
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Initialize service
  useEffect(() => {
    const initializeService = async () => {
      if (!isInitializedRef.current) {
        try {
          await modalService.initialize();
          isInitializedRef.current = true;
        } catch (error) {
          console.error('Failed to initialize modal service:', error);
          setError('Failed to initialize modal service');
        }
      }
    };

    initializeService();
  }, [setError]);

  // Modal CRUD Operations
  const fetchModals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await modalService.listModals(canisterId);
      if (result.success && result.data) {
        setState(prev => ({ 
          ...prev, 
          modals: result.data || []
        }));
      } else {
        setError(result.error || 'Failed to fetch modals');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to fetch modals:', error);
    } finally {
      setLoading(false);
    }
  }, [canisterId, setLoading, setError]);

  const createModal = useCallback(async (
    modalData: Omit<ModalConfigFormData, 'modal_id' | 'created_at' | 'updated_at'>
  ): Promise<ServiceResponse<string>> => {
    setLoading(true);
    setError(null);
    
    try {
      // Client-side validation
      const validation = modalService.validateModalConfig(modalData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const result = await modalService.createModal(canisterId, modalData);
      
      if (result.success) {
        // Refresh the modals list
        await fetchModals();
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create modal');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [canisterId, setLoading, setError, fetchModals]);

  const updateModal = useCallback(async (
    modalId: string, 
    modalData: ModalConfigFormData
  ): Promise<ServiceResponse<void>> => {
    setLoading(true);
    setError(null);
    
    try {
      // Client-side validation
      const validation = modalService.validateModalConfig(modalData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const result = await modalService.updateModal(canisterId, modalId, modalData);
      
      if (result.success) {
        // Refresh the modals list
        await fetchModals();
        return { success: true };
      } else {
        setError(result.error || 'Failed to update modal');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [canisterId, setLoading, setError, fetchModals]);

  const deleteModal = useCallback(async (modalId: string): Promise<ServiceResponse<void>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await modalService.deleteModal(canisterId, modalId);
      
      if (result.success) {
        // Remove from local state and refresh
        setState(prev => ({
          ...prev,
          modals: prev.modals.filter(modal => modal.modal_id !== modalId)
        }));
        
        // Also remove analytics if they exist
        setState(prev => {
          const newAnalytics = new Map(prev.analytics);
          newAnalytics.delete(modalId);
          return { ...prev, analytics: newAnalytics };
        });
        
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete modal');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [canisterId, setLoading, setError]);

  const toggleModalStatus = useCallback(async (modalId: string): Promise<ServiceResponse<boolean>> => {
    // Find the modal and toggle its status
    const modal = state.modals.find(m => m.modal_id === modalId);
    if (!modal) {
      return { success: false, error: 'Modal not found' };
    }

    // Use the simplified structure that matches the modal service
    const updatedModalData = {
      ...modal,
      is_active: !modal.is_active,
    };

    const result = await updateModal(modalId, updatedModalData);
    
    if (result.success) {
      return { success: true, data: !modal.is_active };
    } else {
      return { success: false, error: result.error };
    }
  }, [state.modals, updateModal]);

  // Analytics Operations
  const fetchAnalytics = useCallback(async (modalId: string): Promise<ServiceResponse<ModalAnalytics>> => {
    try {
      const result = await modalService.getModalAnalytics(canisterId, modalId);
      
      if (result.success && result.data) {
        // Update analytics in state
        setState(prev => {
          const newAnalytics = new Map(prev.analytics);
          newAnalytics.set(modalId, result.data!);
          return { ...prev, analytics: newAnalytics };
        });
        
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [canisterId]);

  const trackModalView = useCallback(async (modalId: string): Promise<ServiceResponse<void>> => {
    try {
      const result = await modalService.trackModalView(canisterId, modalId);
      
      if (result.success) {
        // Optionally refresh analytics for this modal
        await fetchAnalytics(modalId);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [canisterId, fetchAnalytics]);

  // Embed Code Generation
  const generateEmbedCode = useCallback(async (modalId: string): Promise<ServiceResponse<string>> => {
    try {
      const result = await modalService.generateEmbedCode(canisterId, modalId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [canisterId]);

  // Utility Operations
  const refresh = useCallback(async () => {
    await fetchModals();
    
    // Also refresh analytics for all modals
    const analyticsPromises = state.modals.map(modal => 
      fetchAnalytics(modal.modal_id).catch(() => {
        // Silently ignore analytics errors during refresh
        console.warn(`Failed to refresh analytics for modal ${modal.modal_id}`);
      })
    );
    
    await Promise.all(analyticsPromises);
  }, [fetchModals, fetchAnalytics, state.modals]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && canisterId && isInitializedRef.current) {
      fetchModals();
    }
  }, [autoFetch, canisterId, fetchModals]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!state.loading) {
          refresh();
        }
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, refresh, state.loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Helper function to get analytics for a specific modal
  const getModalAnalytics = useCallback((modalId: string): ModalAnalytics | undefined => {
    return state.analytics.get(modalId);
  }, [state.analytics]);

  // Helper function to get modal by ID
  const getModal = useCallback((modalId: string): ModalConfig | undefined => {
    return state.modals.find(modal => modal.modal_id === modalId);
  }, [state.modals]);

  // Return combined state and actions
  return {
    // State
    ...state,
    
    // Modal CRUD operations
    fetchModals,
    createModal,
    updateModal,
    deleteModal,
    toggleModalStatus,
    
    // Analytics operations
    fetchAnalytics,
    trackModalView,
    
    // Embed code generation
    generateEmbedCode,
    
    // Utility operations
    refresh,
    clearError,
    
    // Helper functions
    getModalAnalytics,
    getModal,
  };
};

// Export utility hook for single modal management
export const useModalById = (canisterId: string, modalId: string) => {
  const modalHook = useModal({ canisterId, autoFetch: true });
  
  const modal = modalHook.getModal(modalId);
  const analytics = modalHook.getModalAnalytics(modalId);
  
  return {
    ...modalHook,
    modal,
    analytics,
  };
};

export default useModal;
