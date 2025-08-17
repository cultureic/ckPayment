// src/hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { SubscriptionService } from '../services/subscription-service';
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
  canisterId: string;
  autoFetch?: boolean;
}

export const useSubscription = ({ canisterId, autoFetch = true }: UseSubscriptionParams) => {
  const [state, setState] = useState<UseSubscriptionState>({
    plans: [],
    activePlans: [],
    subscriptions: [],
    userSubscriptions: [],
    payments: [],
    analytics: null,
    loading: false,
    error: null,
  });

  const [service] = useState(() => new SubscriptionService(canisterId));

  useEffect(() => {
    if (canisterId) {
      service.initialize().catch(console.error);
    }
  }, [service, canisterId]);

  const setLoading = (loading: boolean) => 
    setState(prev => ({ ...prev, loading }));

  const setError = (error: string | null) => 
    setState(prev => ({ ...prev, error }));

  // SUBSCRIPTION PLAN Operations
  const fetchPlans = useCallback(async () => {
    if (!canisterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getSubscriptionPlans();
      if (result.success) {
        setState(prev => ({ ...prev, plans: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch subscription plans');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service, canisterId]);

  const fetchActivePlans = useCallback(async () => {
    if (!canisterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getActiveSubscriptionPlans();
      if (result.success) {
        setState(prev => ({ ...prev, activePlans: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch active subscription plans');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service, canisterId]);

  const createPlan = useCallback(async (planData: CreateSubscriptionPlanForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.createSubscriptionPlan(planData);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create subscription plan');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  const updatePlan = useCallback(async (planId: string, planData: CreateSubscriptionPlanForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.updateSubscriptionPlan(planId, planData);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true };
      } else {
        setError(result.error || 'Failed to update subscription plan');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  const deletePlan = useCallback(async (planId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.deleteSubscriptionPlan(planId);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete subscription plan');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  const togglePlanStatus = useCallback(async (planId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.toggleSubscriptionPlanStatus(planId);
      if (result.success) {
        await fetchPlans(); // Refresh plans
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to toggle plan status');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchPlans]);

  // SUBSCRIPTION Management Operations
  const fetchSubscriptions = useCallback(async () => {
    if (!canisterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getMySubscriptions();
      if (result.success) {
        setState(prev => ({ ...prev, userSubscriptions: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service, canisterId]);

  const fetchAllSubscriptions = useCallback(async () => {
    if (!canisterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getAllSubscriptions();
      if (result.success) {
        setState(prev => ({ ...prev, subscriptions: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch all subscriptions');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service, canisterId]);

  const createSubscription = useCallback(async (subscriptionData: CreateSubscriptionForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.createSubscription(subscriptionData);
      if (result.success) {
        await fetchSubscriptions(); // Refresh subscriptions
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create subscription');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchSubscriptions]);

  const pauseSubscription = useCallback(async (subscriptionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.pauseSubscription(subscriptionId);
      if (result.success) {
        await fetchSubscriptions(); // Refresh subscriptions
        return { success: true };
      } else {
        setError(result.error || 'Failed to pause subscription');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchSubscriptions]);

  const resumeSubscription = useCallback(async (subscriptionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.resumeSubscription(subscriptionId);
      if (result.success) {
        await fetchSubscriptions(); // Refresh subscriptions
        return { success: true };
      } else {
        setError(result.error || 'Failed to resume subscription');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchSubscriptions]);

  const cancelSubscription = useCallback(async (subscriptionId: string, immediately = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.cancelSubscription(subscriptionId, immediately);
      if (result.success) {
        await fetchSubscriptions(); // Refresh subscriptions
        return { success: true };
      } else {
        setError(result.error || 'Failed to cancel subscription');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchSubscriptions]);

  // PAYMENT Operations
  const fetchPayments = useCallback(async (subscriptionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getSubscriptionPayments(subscriptionId);
      if (result.success) {
        setState(prev => ({ ...prev, payments: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to fetch payments');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const processPayment = useCallback(async (subscriptionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.processSubscriptionPayment(subscriptionId);
      if (result.success) {
        await fetchSubscriptions(); // Refresh subscriptions
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to process payment');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchSubscriptions]);

  // Analytics
  const calculateAnalytics = useCallback((plans: SubscriptionPlan[], subscriptions: Subscription[]) => {
    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.is_active).length;
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;
    
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.total_payments, BigInt(0));
    const churnRate = totalSubscriptions > 0 ? 
      (subscriptions.filter(s => s.status === 'Cancelled').length / totalSubscriptions) * 100 : 0;
    
    const averageRevenuePerUser = totalSubscriptions > 0 ? 
      totalRevenue / BigInt(totalSubscriptions) : BigInt(0);
    
    const planUsage = subscriptions.reduce((acc, sub) => {
      acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularPlan = Object.keys(planUsage).reduce((a, b) => 
      planUsage[a] > planUsage[b] ? a : b, '');

    const analytics: SubscriptionAnalytics = {
      total_plans: totalPlans,
      active_plans: activePlans,
      total_subscriptions: totalSubscriptions,
      active_subscriptions: activeSubscriptions,
      total_revenue: totalRevenue,
      churn_rate: churnRate,
      average_revenue_per_user: averageRevenuePerUser,
      most_popular_plan: mostPopularPlan || undefined
    };

    setState(prev => ({ ...prev, analytics }));
    return analytics;
  }, []);

  // Initialize data on mount
  useEffect(() => {
    if (autoFetch && canisterId) {
      Promise.all([
        fetchPlans(),
        fetchActivePlans(),
        fetchSubscriptions()
      ]).catch(console.error);
    }
  }, [fetchPlans, fetchActivePlans, fetchSubscriptions, autoFetch, canisterId]);

  // Update analytics when plans or subscriptions change
  useEffect(() => {
    if (state.plans.length > 0 || state.subscriptions.length > 0) {
      calculateAnalytics(state.plans, state.subscriptions);
    }
  }, [state.plans, state.subscriptions, calculateAnalytics]);

  return {
    ...state,
    // Plan operations
    fetchPlans,
    fetchActivePlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    // Subscription operations
    fetchSubscriptions,
    fetchAllSubscriptions,
    createSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    // Payment operations
    fetchPayments,
    processPayment,
    // Analytics
    calculateAnalytics,
    // Utilities
    refresh: useCallback(() => {
      return Promise.all([fetchPlans(), fetchSubscriptions()]);
    }, [fetchPlans, fetchSubscriptions]),
    refreshAll: useCallback(() => {
      return Promise.all([fetchPlans(), fetchActivePlans(), fetchSubscriptions(), fetchAllSubscriptions()]);
    }, [fetchPlans, fetchActivePlans, fetchSubscriptions, fetchAllSubscriptions]),
    // Service utility methods
    formatBillingInterval: service.formatBillingIntervalText,
    formatPrice: service.formatPrice,
    isTrialActive: service.isTrialActive,
    isPaymentDue: service.isPaymentDue,
    canPause: service.canPause,
    canResume: service.canResume,
    canCancel: service.canCancel,
  };
};
