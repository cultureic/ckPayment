//@ts-nocheck
import { useState, useEffect } from 'react';
import { useUserPaymentCanisterContext } from './userPaymentCanisterProvider';

export const useCoupons = () => {
  const { userPaymentService } = useUserPaymentCanisterContext();
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveCoupons = async () => {
    if (!userPaymentService) {
      console.log('User payment service not available for coupons');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching active coupons from canister...');
      const coupons = await userPaymentService.getActiveCoupons();
      console.log('Active coupons received:', coupons);
      setActiveCoupons(coupons);
    } catch (err) {
      console.error('Failed to fetch active coupons:', err);
      setError(err.message);
      setActiveCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch coupons when service becomes available
  useEffect(() => {
    if (userPaymentService) {
      fetchActiveCoupons();
    }
  }, [userPaymentService]);

  const validateCoupon = async (couponCode, amount, tokenSymbol) => {
    if (!userPaymentService) {
      return {
        success: false,
        error: 'Payment service not available'
      };
    }

    if (!couponCode || !amount || !tokenSymbol) {
      return {
        success: false,
        error: 'Missing required parameters'
      };
    }

    setValidatingCoupon(true);
    
    try {
      console.log('Validating coupon:', { couponCode, amount, tokenSymbol });
      const result = await userPaymentService.validateCoupon(couponCode, amount, tokenSymbol);
      console.log('Coupon validation result:', result);
      return result;
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setValidatingCoupon(false);
    }
  };

  const getCouponTypeLabel = (couponType) => {
    if (!couponType) return 'Unknown';
    
    if (typeof couponType === 'object') {
      const key = Object.keys(couponType)[0];
      const value = couponType[key];
      
      switch (key) {
        case 'Percentage':
          return `${value}% off`;
        case 'FixedAmount':
          return `${Number(value) / 1e8} fixed discount`;
        case 'FreeShipping':
          return 'Free shipping';
        default:
          return key;
      }
    }
    
    return couponType.toString();
  };

  const calculateDiscount = (couponType, amount) => {
    if (!couponType || !amount) return 0;
    
    if (typeof couponType === 'object') {
      const key = Object.keys(couponType)[0];
      const value = couponType[key];
      
      switch (key) {
        case 'Percentage':
          return (amount * Number(value)) / 100;
        case 'FixedAmount':
          const fixedDiscount = Number(value) / 1e8;
          return Math.min(fixedDiscount, amount); // Don't exceed the total amount
        case 'FreeShipping':
          return 0; // This would be handled separately in shipping calculation
        default:
          return 0;
      }
    }
    
    return 0;
  };

  const formatCouponForDisplay = (coupon) => {
    return {
      ...coupon,
      type_label: getCouponTypeLabel(coupon.coupon_type),
      is_expired: coupon.expires_at && coupon.expires_at < Date.now() * 1000000, // Convert to nanoseconds
      is_limit_reached: coupon.usage_limit && coupon.used_count >= coupon.usage_limit,
      minimum_amount_display: coupon.minimum_amount ? `Min: ${coupon.minimum_amount / 1e8}` : null,
      expiry_display: coupon.expires_at ? new Date(Number(coupon.expires_at) / 1000000).toLocaleDateString() : 'No expiry'
    };
  };

  return {
    activeCoupons: activeCoupons.map(formatCouponForDisplay),
    loading,
    validatingCoupon,
    error,
    validateCoupon,
    refreshCoupons: fetchActiveCoupons,
    getCouponTypeLabel,
    calculateDiscount,
    formatCouponForDisplay
  };
};

export default useCoupons;
