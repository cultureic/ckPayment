// src/hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { createActor } from '../services/user-payment-idl';
import { useAuth } from './useAuth';
import type { 
  SubscriptionPlan, 
  Subscription, 
  SubscriptionPayment,
  CreateSubscriptionPlanForm,
  CreateSubscriptionForm,
  SubscriptionAnalytics
} from '../types/subscription';

interface UseSubscriptionState {
  plans: SubscriptionPlan[];
  activePlans: SubscriptionPlan[];
  subscriptions: Subscription[];
  userSubscriptions: Subscription[];
  payments: SubscriptionPayment[];
  analytics: SubscriptionAnalytics | null;
  loading: boolean;
  error: string | null;
}

interface UseSubscriptionParams {
  selectedCanister?: any; // From Dashboard context
  preloadedPlans?: any[]; // From Dashboard data
  preloadedSubscriptions?: any[]; // From Dashboard data
  autoFetch?: boolean;
}

export const useSubscription = ({ 
  selectedCanister, 
  preloadedPlans = [], 
  preloadedSubscriptions = [],
  autoFetch = true 
}: UseSubscriptionParams) => {
  const { identity } = useAuth();
  
  const [state, setState] = useState<UseSubscriptionState>({
    plans: preloadedPlans || [],
    activePlans: [],
    subscriptions: preloadedSubscriptions || [],
    userSubscriptions: [],
    payments: [],
    analytics: null,
    loading: false,
    error: null,
  });

  const [actor, setActor] = useState<any>(null);

  // Initialize actor when canister changes
  useEffect(() => {
    if (selectedCanister && identity) {
      try {
        const newActor = createActor(selectedCanister.id.toText(), { 
          agent: { identity } as any 
        });
        setActor(newActor);
        setState(prev => ({ ...prev, error: null }));
      } catch (error) {
        console.error('Failed to initialize subscription actor:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize subscription service' 
        }));
        setActor(null);
      }
    } else {
      setActor(null);
    }
  }, [selectedCanister, identity]);

  // Update state when preloaded data changes
  useEffect(() => {
    if (preloadedPlans && preloadedPlans.length > 0) {
      setState(prev => ({ ...prev, plans: preloadedPlans }));
    }
  }, [preloadedPlans]);

  useEffect(() => {
    if (preloadedSubscriptions && preloadedSubscriptions.length > 0) {
      setState(prev => ({ ...prev, subscriptions: preloadedSubscriptions }));
    }
  }, [preloadedSubscriptions]);

  // Helper functions
  const setLoading = (loading: boolean) => 
    setState(prev => ({ ...prev, loading }));

  const setError = (error: string | null) => 
    setState(prev => ({ ...prev, error }));

  // Basic fetch operations
  const fetchPlans = useCallback(async () => {
    if (!actor) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actor.list_subscription_plans();
      setState(prev => ({ ...prev, plans: result || [] }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  const fetchSubscriptions = useCallback(async () => {
    if (!actor) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actor.list_my_subscriptions();
      setState(prev => ({ ...prev, userSubscriptions: result || [] }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  // Basic create functionality (simplified)
  const createPlan = useCallback(async (planData: CreateSubscriptionPlanForm) => {
    if (!actor) return { success: false, error: 'No canister selected' };
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, just return not implemented
      setError('Create subscription plan functionality not yet implemented');
      return { success: false, error: 'Create subscription plan functionality not yet implemented' };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [actor]);

  // Auto-fetch data when actor is available
  useEffect(() => {
    if (autoFetch && actor) {
      Promise.all([
        fetchPlans(),
        fetchSubscriptions()
      ]).catch(console.error);
    }
  }, [actor, autoFetch, fetchPlans, fetchSubscriptions]);

  return {
    ...state,
    // Basic operations
    fetchPlans,
    fetchSubscriptions,
    createPlan,
    // Utilities
    refresh: useCallback(() => {
      return Promise.all([fetchPlans(), fetchSubscriptions()]);
    }, [fetchPlans, fetchSubscriptions]),
  };
};
