import { useState, useEffect, useMemo } from 'react';
import { useUserPaymentCanisterContext } from './userPaymentCanisterProvider';

/**
 * Hook to fetch and manage modal configuration from the user payment canister
 */
export const useModalConfig = (modalId = 'modal_1') => {
  const { userPaymentService } = useUserPaymentCanisterContext();
  const [modalConfig, setModalConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModalConfig = async () => {
      if (!userPaymentService) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const config = await userPaymentService.getModalConfig(modalId);
        if (config) {
          setModalConfig(config);
        } else {
          // Use default configuration if none is found
          setModalConfig(getDefaultModalConfig());
        }
      } catch (err) {
        console.error('Failed to fetch modal configuration:', err);
        setError(err.message);
        // Use default configuration on error
        setModalConfig(getDefaultModalConfig());
      } finally {
        setLoading(false);
      }
    };

    fetchModalConfig();
  }, [userPaymentService, modalId]);

  // Generate dynamic CSS styles based on modal config
  const dynamicStyles = useMemo(() => {
    if (!modalConfig?.theme) return {};

    return {
      '--primary-color': modalConfig.theme.primary_color || '#3b82f6',
      '--background-color': modalConfig.theme.background_color || '#ffffff',
      '--text-color': modalConfig.theme.text_color || '#1f2937',
      '--border-radius': `${modalConfig.theme.border_radius || 8}px`,
      '--font-family': modalConfig.theme.font_family || 'Inter, sans-serif'
    };
  }, [modalConfig]);

  // Apply styles to modal container
  const applyDynamicStyles = (element) => {
    if (!element || !modalConfig?.theme) return;

    Object.entries(dynamicStyles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  };

  return {
    modalConfig,
    loading,
    error,
    dynamicStyles,
    applyDynamicStyles,
    theme: modalConfig?.theme || getDefaultModalConfig().theme,
    branding: modalConfig?.branding || getDefaultModalConfig().branding,
    paymentOptions: modalConfig?.payment_options || getDefaultModalConfig().payment_options
  };
};

/**
 * Default modal configuration fallback
 */
const getDefaultModalConfig = () => ({
  modal_id: 'default',
  name: 'Payment Modal',
  description: 'Default payment modal configuration',
  theme: {
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_radius: 8,
    font_family: 'Inter, sans-serif'
  },
  payment_options: {
    allowed_tokens: [],
    require_email: false,
    require_shipping: false,
    show_amount_breakdown: true,
    enable_tips: false
  },
  branding: {
    logo_url: null,
    company_name: 'Your Company',
    support_url: null,
    terms_url: null
  },
  redirect_urls: {
    success_url: '',
    cancel_url: '',
    webhook_url: null
  },
  template_id: null,
  is_active: true
});

export default useModalConfig;
