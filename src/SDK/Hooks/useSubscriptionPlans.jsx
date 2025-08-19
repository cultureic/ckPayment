//@ts-nocheck
import { useState, useEffect } from 'react';
import { useUserPaymentCanisterContext } from './userPaymentCanisterProvider';

export const useSubscriptionPlans = () => {
  const { userPaymentService } = useUserPaymentCanisterContext();
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptionPlans = async () => {
    if (!userPaymentService) {
      console.log('User payment service not available for subscription plans');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching subscription plans from canister...');
      const plans = await userPaymentService.getActiveSubscriptionPlans();
      console.log('Subscription plans received:', plans);
      setSubscriptionPlans(plans);
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
      setError(err.message);
      // Set empty array on error
      setSubscriptionPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans when service becomes available
  useEffect(() => {
    if (userPaymentService) {
      fetchSubscriptionPlans();
    }
  }, [userPaymentService]);

  const getBillingIntervalLabel = (interval) => {
    if (!interval) return 'Unknown';
    
    if (typeof interval === 'object') {
      const key = Object.keys(interval)[0];
      const value = interval[key];
      
      switch (key) {
        case 'Daily':
          return 'Daily';
        case 'Weekly':
          return 'Weekly';
        case 'Monthly':
          return 'Monthly';
        case 'Quarterly':
          return 'Quarterly';
        case 'Yearly':
          return 'Yearly';
        case 'Custom':
          const days = Math.floor(Number(value) / (24 * 60 * 60));
          return `Every ${days} days`;
        default:
          return key;
      }
    }
    
    return interval.toString();
  };

  const formatPlanForDisplay = (plan) => {
    return {
      ...plan,
      billing_interval_label: getBillingIntervalLabel(plan.billing_interval),
      price_display: `${plan.price} ${plan.token}`,
      has_trial: plan.trial_period_days && plan.trial_period_days > 0,
      trial_display: plan.trial_period_days ? `${plan.trial_period_days} day${plan.trial_period_days > 1 ? 's' : ''} free trial` : null
    };
  };

  return {
    subscriptionPlans: subscriptionPlans.map(formatPlanForDisplay),
    loading,
    error,
    refreshPlans: fetchSubscriptionPlans,
    getBillingIntervalLabel,
    formatPlanForDisplay
  };
};

export default useSubscriptionPlans;
