// src/hooks/useDiscount.ts
import { useState, useEffect, useCallback } from 'react';
import { DiscountService } from '../services/discount-service';
import type { 
  DiscountCoupon, 
  CouponUsage, 
  CreateCouponForm,
  CouponAnalytics,
  ServiceResponse
} from '../types/discount';

interface UseDiscountState {
  coupons: DiscountCoupon[];
  activeCoupons: DiscountCoupon[];
  usageHistory: CouponUsage[];
  analytics: CouponAnalytics | null;
  loading: boolean;
  error: string | null;
}

interface UseDiscountParams {
  canisterId: string;
  autoFetch?: boolean;
}

export const useDiscount = ({ canisterId, autoFetch = true }: UseDiscountParams) => {
  const [state, setState] = useState<UseDiscountState>({
    coupons: [],
    activeCoupons: [],
    usageHistory: [],
    analytics: null,
    loading: false,
    error: null,
  });

  const [service] = useState(() => new DiscountService(canisterId));

  useEffect(() => {
    if (canisterId) {
      service.initialize().catch(console.error);
    }
  }, [service, canisterId]);

  const setLoading = (loading: boolean) => 
    setState(prev => ({ ...prev, loading }));

  const setError = (error: string | null) => 
    setState(prev => ({ ...prev, error }));

  // Coupon CRUD Operations
  const fetchCoupons = useCallback(async () => {
    if (!canisterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getMyCoupons();
      if (result.success) {
        setState(prev => ({ ...prev, coupons: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch coupons');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service, canisterId]);

  const fetchActiveCoupons = useCallback(async () => {
    if (!canisterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getActiveCoupons();
      if (result.success) {
        setState(prev => ({ ...prev, activeCoupons: result.data || [] }));
      } else {
        setError(result.error || 'Failed to fetch active coupons');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [service, canisterId]);

  const createCoupon = useCallback(async (couponData: CreateCouponForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.createCoupon(couponData);
      if (result.success) {
        await fetchCoupons(); // Refresh coupons
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create coupon');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchCoupons]);

  const updateCoupon = useCallback(async (couponId: string, couponData: CreateCouponForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.updateCoupon(couponId, couponData);
      if (result.success) {
        await fetchCoupons(); // Refresh coupons
        return { success: true };
      } else {
        setError(result.error || 'Failed to update coupon');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchCoupons]);

  const deleteCoupon = useCallback(async (couponId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.deleteCoupon(couponId);
      if (result.success) {
        await fetchCoupons(); // Refresh coupons
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete coupon');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchCoupons]);

  const toggleCouponStatus = useCallback(async (couponId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.toggleCouponStatus(couponId);
      if (result.success) {
        await fetchCoupons(); // Refresh coupons
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to toggle coupon status');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchCoupons]);

  // Coupon validation and usage
  const validateCoupon = useCallback(async (code: string, invoiceAmount: bigint) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.validateCoupon(code, invoiceAmount);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to validate coupon');
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

  const applyCoupon = useCallback(async (code: string, invoiceAmount: bigint) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.applyCoupon(code, invoiceAmount);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to apply coupon');
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

  // Analytics and usage tracking
  const fetchCouponUsageStats = useCallback(async (couponId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getCouponUsageStats(couponId);
      if (result.success) {
        const [usageCount, history] = result.data || [0, []];
        setState(prev => ({ ...prev, usageHistory: history }));
        return { success: true, data: { usageCount, history } };
      } else {
        setError(result.error || 'Failed to fetch usage stats');
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

  const calculateAnalytics = useCallback((coupons: DiscountCoupon[], usageHistory: CouponUsage[]) => {
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => service.canUse(c)).length;
    const totalUsage = usageHistory.length;
    const totalSavings = usageHistory.reduce((sum, usage) => sum + usage.discount_applied, BigInt(0));
    
    const usageByCoupon = usageHistory.reduce((acc, usage) => {
      acc[usage.coupon_id] = (acc[usage.coupon_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedCoupon = Object.keys(usageByCoupon).reduce((a, b) => 
      usageByCoupon[a] > usageByCoupon[b] ? a : b, '');
    
    const conversionRate = totalCoupons > 0 ? totalUsage / totalCoupons : 0;
    
    const analytics: CouponAnalytics = {
      total_coupons: totalCoupons,
      active_coupons: activeCoupons,
      total_usage: totalUsage,
      total_savings: totalSavings,
      most_used_coupon: mostUsedCoupon || undefined,
      conversion_rate: conversionRate
    };

    setState(prev => ({ ...prev, analytics }));
    return analytics;
  }, [service]);

  // Admin operations
  const clearAllCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.clearAllCoupons();
      if (result.success) {
        await fetchCoupons(); // Refresh coupons
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to clear coupons');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [service, fetchCoupons]);

  // Initialize data on mount
  useEffect(() => {
    if (autoFetch && canisterId) {
      Promise.all([
        fetchCoupons(),
        fetchActiveCoupons()
      ]).catch(console.error);
    }
  }, [fetchCoupons, fetchActiveCoupons, autoFetch, canisterId]);

  // Update analytics when coupons or usage history changes
  useEffect(() => {
    if (state.coupons.length > 0 || state.usageHistory.length > 0) {
      calculateAnalytics(state.coupons, state.usageHistory);
    }
  }, [state.coupons, state.usageHistory, calculateAnalytics]);

  return {
    ...state,
    // CRUD operations
    fetchCoupons,
    fetchActiveCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    // Validation and usage
    validateCoupon,
    applyCoupon,
    // Analytics
    fetchCouponUsageStats,
    calculateAnalytics,
    // Admin operations
    clearAllCoupons,
    // Utilities
    refresh: useCallback(() => {
      return Promise.all([fetchCoupons(), fetchActiveCoupons()]);
    }, [fetchCoupons, fetchActiveCoupons]),
    // Service utility methods
    formatCouponDiscount: (coupon: DiscountCoupon) => service.formatCouponDiscount(coupon),
    isExpired: (coupon: DiscountCoupon) => service.isExpired(coupon),
    isUsageLimitReached: (coupon: DiscountCoupon) => service.isUsageLimitReached(coupon),
    canUse: (coupon: DiscountCoupon) => service.canUse(coupon),
  };
};
