import React, { Component, createContext, useContext, useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from "./auth";
import { WalletProvider, useTokens } from "./Hooks/walletProvider";
import { UserPaymentCanisterProvider, useUserPaymentCanisterContext } from "./Hooks/userPaymentCanisterProvider";
import { useSubscriptionPlans } from "./Hooks/useSubscriptionPlans";
import { useCoupons } from "./Hooks/useCoupons";
import { useModalConfig } from "./Hooks/useModalConfig";
import { addItem, addProfile, getItem, buyItem } from "./interfaceHook";
import { motion } from "framer-motion";
import { Copy, Check, Bitcoin, CircleDollarSign, Loader2, X, ChevronLeft, ChevronRight, CheckCircle2, Zap, ArrowRight, Wallet, Tag, Gift, Calendar, Clock } from "lucide-react";
import TokenIcon from "./Components/TokenIcon";
import "./index.css";

// Subscription Context to share state
const SubscriptionContext = createContext();

const SubscriptionProvider = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [error, setError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalAmount, setFinalAmount] = useState(0);

  return (
    <SubscriptionContext.Provider value={{ 
      selectedPlan, setSelectedPlan, 
      selectedMethod, setSelectedMethod,
      transactionId, setTransactionId, 
      error, setError,
      appliedCoupon, setAppliedCoupon,
      finalAmount, setFinalAmount
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

const useSubscription = () => useContext(SubscriptionContext);

// Combined Auth and Subscription Step
const SubscriptionStep = ({ handleNextStep, removePaymentModal, isAuthenticated, login, logout, props }) => {
  const { selectedPlan, setSelectedPlan, selectedMethod, setSelectedMethod, error, setError, setTransactionId, appliedCoupon, setAppliedCoupon, finalAmount, setFinalAmount } = useSubscription();
  const { balances } = useTokens();
  const { supportedTokens } = useUserPaymentCanisterContext();
  const { backendActor: actor, principal } = useAuth();
  const { subscriptionPlans, loading: plansLoading } = useSubscriptionPlans();
  const { validateCoupon, validatingCoupon, calculateDiscount } = useCoupons();
  const { modalConfig, theme, branding, dynamicStyles } = useModalConfig();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  // Set default payment method to first supported token when tokens are loaded
  useEffect(() => {
    if (supportedTokens && supportedTokens.length > 0 && !selectedMethod) {
      setSelectedMethod(supportedTokens[0].symbol?.toLowerCase() || supportedTokens[0].name?.toLowerCase());
    }
  }, [supportedTokens, selectedMethod, setSelectedMethod]);

  // Set default plan selection to first available plan
  useEffect(() => {
    if (subscriptionPlans && subscriptionPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(subscriptionPlans[0]);
    }
  }, [subscriptionPlans, selectedPlan, setSelectedPlan]);

  // Calculate final amount when plan or coupon changes
  useEffect(() => {
    if (selectedPlan) {
      let amount = selectedPlan.price;
      if (appliedCoupon) {
        const discount = calculateDiscount(appliedCoupon.coupon_type, amount);
        amount = Math.max(0, amount - discount);
      }
      setFinalAmount(amount);
    }
  }, [selectedPlan, appliedCoupon, calculateDiscount, setFinalAmount]);

  // Debug auth state
  useEffect(() => {
    console.log('Auth state in SubscriptionStep:', { isAuthenticated, actor: actor ? 'present' : 'undefined', principal: principal ? principal.toText() : 'undefined' });
  }, [isAuthenticated, actor, principal]);

  // Create tokens array from backend supported tokens with balances
  const tokens = React.useMemo(() => {
    if (!supportedTokens || supportedTokens.length === 0) {
      // Return empty array if no tokens are available from canister
      return [];
    }

    return supportedTokens
      .filter(token => token.is_active !== false) // Only show active tokens
      .map((token) => {
        // Get the token's balance using symbol or name as key
        const balanceKey = token.symbol || token.name;
        const balance = balances?.[balanceKey] || balances?.[balanceKey.toUpperCase()] || 0;
        
        return {
          id: (token.symbol || token.name || '').toLowerCase(),
          name: token.name || token.symbol || 'Unknown',
          symbol: token.symbol || token.name || 'UNK',
          balance: balance,
          canister_id: token.canister_id || token.canister,
          decimals: token.decimals || 8,
          fee: token.fee || 0,
          logo: token.logo || null
        };
      });
  }, [supportedTokens, balances]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!selectedPlan) {
      setCouponError('Please select a subscription plan first');
      return;
    }

    setCouponError('');
    
    try {
      const result = await validateCoupon(couponCode.trim(), selectedPlan.price, selectedPlan.token);
      
      if (result.success) {
        setAppliedCoupon({
          code: couponCode.trim(),
          coupon_id: result.coupon_id,
          discount_amount: result.discount_amount,
          coupon_type: { FixedAmount: result.discount_amount * 1e8 } // For display calculation
        });
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError(result.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleConfirm = async () => {
    if (!isAuthenticated || !actor) {
      setError('Please authenticate to proceed');
      return;
    }
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      const amountE8s = BigInt(Math.floor(finalAmount * 1e8));
      const result = await buyItem(amountE8s, selectedMethod, { 
        subscription: true, 
        plan_id: selectedPlan.plan_id,
        coupon: appliedCoupon 
      });
      setTransactionId(result?.transactionId || '0x' + Math.random().toString(16).slice(2, 10));
      console.log('Subscription payment successful - advancing to success');
      handleNextStep();
      if (props.onPayment) {
        props.onPayment({ 
          success: true, 
          transactionId: result?.transactionId, 
          amount: finalAmount, 
          currency: selectedMethod,
          subscription: selectedPlan,
          coupon: appliedCoupon
        });
      }
    } catch (err) {
      setError('Subscription payment failed: ' + err.message);
      console.error('Subscription payment error:', err);
      if (props.onPayment) {
        props.onPayment({ success: false, error: err.message, subscription: selectedPlan });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    try {
      await login();
      console.log('Login triggered - awaiting state update');
    } catch (err) {
      setError('Login failed: ' + err.message);
      console.error('Login error:', err);
    }
  };

  const handleCopyPrincipal = async () => {
    if (!principal) return;
    try {
      await navigator.clipboard.writeText(principal.toText());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy principal:', err);
      setError('Failed to copy principal');
    }
  };

  if (plansLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-6 text-center"
      >
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading subscription plans...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-6"
      style={dynamicStyles}
    >
      <div className="text-center mb-8">
        {branding?.logo_url && (
          <img 
            src={branding.logo_url} 
            alt={branding.company_name || 'Company Logo'} 
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
        )}
        <h2 className="text-3xl font-bold mb-2" style={{ color: theme?.text_color || '#1f2937', fontFamily: theme?.font_family || 'inherit' }}>
          Choose Your Subscription
        </h2>
        <p className="text-muted-foreground">
          {branding?.company_name ? `Subscribe to ${branding.company_name}` : 'Select a plan and complete your subscription'}
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">Please login to proceed</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full py-4 px-6 text-white rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center group"
            style={{ 
              background: `linear-gradient(to right, ${theme?.primary_color || '#3b82f6'}, ${theme?.primary_color || '#3b82f6'})`,
              borderRadius: `${theme?.border_radius || 8}px`,
              fontFamily: theme?.font_family || 'inherit'
            }}
          >
            <CircleDollarSign className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Login with Internet Identity
          </motion.button>
        </div>
      ) : (
        <>
          <div className="p-4 bg-green-50/50 backdrop-blur-sm rounded-xl border border-green-200 text-center mb-4">
            <p className="text-green-600 font-medium">Authentication successful!</p>
          </div>

          {/* Principal Display */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-foreground mb-4">Your Wallet Principal</h3>
            <div className="relative bg-gradient-to-r from-primary/30 to-accent/30 p-4 rounded-xl border border-primary/50 shadow-md hover:shadow-xl transition-shadow flex items-center justify-between bg-opacity-90">
              <span className="font-mono text-sm text-foreground truncate max-w-[70%]">
                {principal ? principal.toText() : 'No principal available'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyPrincipal}
                disabled={!principal}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isCopied ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/90'
                } transition-colors`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-foreground mb-4">Choose Your Plan</h3>
            <div className="space-y-3">
              {subscriptionPlans.map((plan) => (
                <motion.div 
                  key={plan.plan_id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedPlan?.plan_id === plan.plan_id
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground text-lg">{plan.name}</h4>
                        <div className="text-right">
                          <div className="text-xl font-bold text-foreground">{plan.price_display}</div>
                          <div className="text-sm text-muted-foreground">per {plan.billing_interval_label.toLowerCase()}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                      {plan.has_trial && (
                        <div className="flex items-center text-sm text-green-600 mb-2">
                          <Gift className="w-4 h-4 mr-1" />
                          {plan.trial_display}
                        </div>
                      )}
                      {plan.features && plan.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {plan.features.map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedPlan?.plan_id === plan.plan_id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-4">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Coupon Code */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-foreground mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Coupon Code
            </h3>
            {!appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 py-2 px-4 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    disabled={validatingCoupon}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </motion.button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm">{couponError}</p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">{appliedCoupon.code}</span>
                  <span className="ml-2 text-green-600">
                    - {appliedCoupon.discount_amount.toFixed(4)} {selectedPlan?.token}
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-foreground mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              {tokens.map((token) => (
                <motion.div 
                  key={token.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedMethod === token.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedMethod(token.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <TokenIcon 
                          tokenCanisterId={token.canister_id}
                          size="w-10 h-10"
                          className={`${
                            selectedMethod === token.id ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{token.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Balance: {token.balance.toFixed(4)} {token.name}
                        </p>
                      </div>
                    </div>
                    {selectedMethod === token.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {selectedPlan && (
            <div className="mb-8">
              <h3 className="text-xl font-medium text-foreground mb-4">Order Summary</h3>
              <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{selectedPlan.name}</span>
                  <span className="font-medium text-foreground">{selectedPlan.price} {selectedPlan.token}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center py-2 text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{appliedCoupon.discount_amount.toFixed(4)} {selectedPlan.token}</span>
                  </div>
                )}
                <hr className="my-3 border-border/20" />
                <div className="flex justify-between items-center py-2 font-bold text-lg">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{finalAmount.toFixed(4)} {selectedPlan?.token}</span>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-muted text-muted-foreground rounded-xl font-medium flex items-center justify-center border border-border hover:bg-muted/80 transition-colors"
            >
              <X className="mr-2 h-5 w-5" />
              Logout
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              disabled={isProcessing || !selectedPlan || !selectedMethod}
              className={`flex-1 py-3 px-4 font-medium flex items-center justify-center group transition-all ${
                isProcessing || !selectedPlan || !selectedMethod
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'text-white shadow-lg hover:shadow-primary/20'
              }`}
              style={{
                borderRadius: `${theme?.border_radius || 8}px`,
                fontFamily: theme?.font_family || 'inherit',
                background: isProcessing || !selectedPlan || !selectedMethod ? undefined : `linear-gradient(to right, ${theme?.primary_color || '#3b82f6'}, ${theme?.primary_color || '#3b82f6'})`
              }}
            >
              {isProcessing ? 'Processing...' : 'Subscribe Now'}
              <ArrowRight className={`ml-2 h-5 w-5 ${!isProcessing && selectedPlan && selectedMethod ? 'group-hover:translate-x-1 transition-transform' : ''}`} />
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

const SuccessStep = ({ removePaymentModal }) => {
  const { selectedPlan, selectedMethod, transactionId, appliedCoupon, finalAmount } = useSubscription();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Subscription Successful!</h2>
        <p className="text-muted-foreground">Your subscription has been activated</p>
      </div>
      
      <div className="bg-muted/30 rounded-xl p-5 mb-8 border border-border/50">
        <div className="flex justify-between items-center py-3 border-b border-border/20">
          <span className="text-muted-foreground">Transaction ID</span>
          <span className="font-mono text-sm text-foreground">{transactionId || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/20">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium text-foreground">{selectedPlan?.name}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/20">
          <span className="text-muted-foreground">Billing</span>
          <span className="font-medium text-foreground">{selectedPlan?.billing_interval_label}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between items-center py-3 border-b border-border/20">
            <span className="text-muted-foreground">Coupon Applied</span>
            <span className="font-medium text-green-600">{appliedCoupon.code}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-3 border-b border-border/20">
          <span className="text-muted-foreground">Amount Paid</span>
          <span className="font-medium text-foreground">{finalAmount?.toFixed(4)} {selectedMethod?.toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center pt-3">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium text-foreground">{new Date().toLocaleString()}</span>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={removePaymentModal}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center group"
      >
        <Check className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        Done
      </motion.button>
    </motion.div>
  );
};

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-muted-foreground">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 py-2 px-4 bg-primary text-white rounded-xl"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Subscription Component
const SubscriptionComponent = ({ 
  steps, 
  removePaymentModal,
  onPayment,
  ...props 
}) => {
  const { isAuthenticated, login, logout } = useAuth();
  const { modalConfig, theme, branding, dynamicStyles } = useModalConfig();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleNextStep = () => {
    console.log('Advancing to next step:', currentStepIndex + 1);
    setCurrentStepIndex(prev => prev + 1);
  };

  const defaultSteps = [
    { type: 'subscription', title: 'Subscription', data: {} },
    { type: 'success', title: 'Success', data: {} },
  ];

  const activeSteps = steps || defaultSteps;
  const currentStep = activeSteps[currentStepIndex];

  if (!currentStep) {
    console.error('Current step is undefined', { currentStepIndex, activeSteps });
    return null;
  }

  const componentMapping = {
    subscription: SubscriptionStep,
    success: SuccessStep,
  };

  const StepComponent = componentMapping[currentStep.type];

  if (!StepComponent) {
    console.error(`No component found for step type: ${currentStep.type}`);
    return null;
  }

  return (
    <SubscriptionProvider>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg relative overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: theme?.background_color || '#ffffff',
            borderRadius: `${theme?.border_radius || 8}px`,
            fontFamily: theme?.font_family || 'inherit',
            border: `1px solid ${theme?.primary_color || '#3b82f6'}20`
          }}
        >
          <button
            onClick={removePaymentModal}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="h-1.5 overflow-hidden" style={{ backgroundColor: `${theme?.primary_color || '#3b82f6'}20` }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: theme?.primary_color || '#3b82f6' }}
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (activeSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <StepComponent
            handleNextStep={handleNextStep}
            removePaymentModal={removePaymentModal}
            login={login}
            logout={logout}
            isAuthenticated={isAuthenticated}
            props={{ ...props, onPayment }}
          />
        </motion.div>
      </div>
    </SubscriptionProvider>
  );
};

// Backward compatible MyLibrary export
let modalContainer = null;
let root = null;
let options = {};

const MySubscriptionLibrary = {
  setCanisterId: (canisterId) => {
    console.log('Setting canister ID for subscriptions:', canisterId);
    window.CKPAY_CANISTER_ID = canisterId;
    window.CKPAY_USER_PAYMENT_CANISTER = canisterId;
    return MySubscriptionLibrary;
  },
  
  initialize: (containerId, opts) => {
    modalContainer = document.getElementById(containerId);
    if (!modalContainer) throw new Error("Could not find container element");
    options = opts || {};
    root = createRoot(modalContainer);
  },
  
  renderSubscriptionModal: (props, onPayment) => {
    if (!modalContainer || !root) throw new Error("You must initialize MySubscriptionLibrary first");

    const defaultProps = {
      steps: [
        { type: 'subscription', title: 'Subscription', data: {} },
        { type: 'success', title: 'Success', data: {} },
      ],
    };

    props = { ...defaultProps, ...options, ...props };

    root.render(
      <ErrorBoundary>
        <AuthProvider>
          <UserPaymentCanisterProvider>
            <WalletProvider>
              <SubscriptionComponent 
                {...props} 
                onPayment={onPayment} 
                removePaymentModal={MySubscriptionLibrary.removeSubscriptionModal}
              />
            </WalletProvider>
          </UserPaymentCanisterProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  },
  
  removeSubscriptionModal: () => {
    if (!modalContainer || !root) throw new Error("You must initialize MySubscriptionLibrary first");
    root.render(null);
  }
};

// Expose MySubscriptionLibrary as ckPaySDK.SubscriptionComponent
window.ckPaySDK = window.ckPaySDK || {};
window.ckPaySDK.SubscriptionComponent = MySubscriptionLibrary;

export default MySubscriptionLibrary;
