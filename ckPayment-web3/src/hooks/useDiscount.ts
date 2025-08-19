// src/hooks/useDiscount.ts
import { useState, useEffect, useCallback } from 'react';
import { createActor } from '../services/user-payment-idl';
import { useAuth } from './useAuth';
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
  selectedCanister?: any; // From Dashboard context
  preloadedCoupons?: any[]; // From Dashboard data
  autoFetch?: boolean;
}

export const useDiscount = ({ 
  selectedCanister, 
  preloadedCoupons = [], 
  autoFetch = true 
}: UseDiscountParams) => {
  const { identity } = useAuth();
  
  const [state, setState] = useState<UseDiscountState>({
    coupons: preloadedCoupons || [],
    activeCoupons: [],
    usageHistory: [],
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
        console.error('Failed to initialize discount actor:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize discount service' 
        }));
        setActor(null);
      }
    } else {
      setActor(null);
    }
  }, [selectedCanister, identity]);

  // Update state when preloaded data changes
  useEffect(() => {
    if (preloadedCoupons && preloadedCoupons.length > 0) {
      setState(prev => ({ ...prev, coupons: preloadedCoupons }));
    }
  }, [preloadedCoupons]);

  // Helper functions
  const setLoading = (loading: boolean) => 
    setState(prev => ({ ...prev, loading }));

  const setError = (error: string | null) => 
    setState(prev => ({ ...prev, error }));

  // Coupon CRUD Operations
  const fetchCoupons = useCallback(async () => {
    if (!actor) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actor.list_my_coupons();
      setState(prev => ({ ...prev, coupons: result || [] }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  const fetchActiveCoupons = useCallback(async () => {
    if (!actor) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actor.list_active_coupons();
      setState(prev => ({ ...prev, activeCoupons: result || [] }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch active coupons');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  // Simple utility functions for coupon display
  const formatCouponDiscount = useCallback((coupon: DiscountCoupon) => {
    if (!coupon.coupon_type) return '';
    
    if ('Percentage' in coupon.coupon_type) {
      return `${coupon.coupon_type.Percentage}% off`;
    } else if ('FixedAmount' in coupon.coupon_type) {
      return `${coupon.coupon_type.FixedAmount.toString()} tokens off`;
    } else if ('FreeShipping' in coupon.coupon_type) {
      return 'Free shipping';
    }
    return '';
  }, []);

  const isExpired = useCallback((coupon: DiscountCoupon) => {
    if (!coupon.expires_at || coupon.expires_at.length === 0) return false;
    const expiry = Number(coupon.expires_at[0]) / 1_000_000; // Convert from nanoseconds
    return Date.now() > expiry;
  }, []);

  const canUse = useCallback((coupon: DiscountCoupon) => {
    return coupon.is_active && !isExpired(coupon);
  }, [isExpired]);

  // Basic create coupon functionality
  const createCoupon = useCallback(async (couponData: CreateCouponForm) => {
    if (!actor) return { success: false, error: 'No canister selected' };
    
    setLoading(true);
    setError(null);
    
    try {
      // Format coupon type
      let couponType;
      switch (couponData.coupon_type) {
        case 'Percentage':
          couponType = { Percentage: parseInt(couponData.discount_value) };
          break;
        case 'FixedAmount':
          couponType = { FixedAmount: BigInt(couponData.discount_value) };
          break;
        case 'FreeShipping':
          couponType = { FreeShipping: null };
          break;
        default:
          throw new Error(`Unsupported coupon type: ${couponData.coupon_type}`);
      }
      
      const formattedCoupon = {
        coupon_id: '',
        code: couponData.code.toUpperCase(),
        coupon_type: couponType,
        description: couponData.description,
        minimum_amount: couponData.minimum_amount ? [BigInt(couponData.minimum_amount)] : [],
        applicable_tokens: couponData.applicable_tokens,
        usage_limit: couponData.usage_limit ? [couponData.usage_limit] : [],
        used_count: 0,
        expires_at: couponData.expires_at ? [BigInt(couponData.expires_at.getTime() * 1_000_000)] : [],
        is_active: couponData.is_active,
        created_at: BigInt(0),
        updated_at: BigInt(0),
      };
      
      const result = await actor.create_coupon(formattedCoupon);
      
      if ('Ok' in result) {
        await fetchCoupons(); // Refresh coupons
        return { success: true, data: result.Ok };
      } else {
        setError(result.Err || 'Failed to create coupon');
        return { success: false, error: result.Err };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [actor, fetchCoupons]);

  // Basic delete coupon functionality  
  const deleteCoupon = useCallback(async (couponId: string) => {
    if (!actor) return { success: false, error: 'No canister selected' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actor.delete_coupon(couponId);
      
      if ('Ok' in result) {
        await fetchCoupons(); // Refresh coupons
        return { success: true };
      } else {
        setError(result.Err || 'Failed to delete coupon');
        return { success: false, error: result.Err };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [actor, fetchCoupons]);

  // Basic update coupon functionality  
  const updateCoupon = useCallback(async (couponId: string, couponData: CreateCouponForm) => {
    if (!actor) return { success: false, error: 'No canister selected' };
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll just return a not implemented error
      // The actual implementation would require an update_coupon method in the canister
      setError('Update coupon functionality not yet implemented');
      return { success: false, error: 'Update coupon functionality not yet implemented' };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [actor, fetchCoupons]);

  // Toggle coupon status
  const toggleCouponStatus = useCallback(async (couponId: string) => {
    if (!actor) return { success: false, error: 'No canister selected' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await actor.toggle_coupon_status(couponId);
      
      if ('Ok' in result) {
        await fetchCoupons(); // Refresh coupons
        return { success: true, data: result.Ok };
      } else {
        setError(result.Err || 'Failed to toggle coupon status');
        return { success: false, error: result.Err };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [actor, fetchCoupons]);

  // Auto-fetch data when actor is available
  useEffect(() => {
    if (autoFetch && actor) {
      Promise.all([
        fetchCoupons(),
        fetchActiveCoupons()
      ]).catch(console.error);
    }
  }, [actor, autoFetch, fetchCoupons, fetchActiveCoupons]);

  return {
    ...state,
    // CRUD operations
    fetchCoupons,
    fetchActiveCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    // Utilities
    refresh: useCallback(() => {
      return Promise.all([fetchCoupons(), fetchActiveCoupons()]);
    }, [fetchCoupons, fetchActiveCoupons]),
    // Utility methods
    formatCouponDiscount,
    isExpired,
    canUse,
  };
};
