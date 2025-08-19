
import PaymentComponent from "./Pay.jsx";
import SubscriptionComponent from "./Subscription.jsx";
import { AuthProvider, useAuth } from "./auth";
import { UserPaymentService } from "./userPaymentCanister.js";

// Main SDK object
const ckPaySDK = {
  // Payment components
  PaymentComponent,
  SubscriptionComponent,
  
  // Auth utilities
  AuthProvider,
  useAuth,
  
  // Services
  UserPaymentService,
  
  // Utility methods
  setCanisterId: (canisterId) => {
    console.log('Setting global canister ID:', canisterId);
    window.CKPAY_CANISTER_ID = canisterId;
    window.CKPAY_USER_PAYMENT_CANISTER = canisterId;
    // Also set on both components
    PaymentComponent.setCanisterId(canisterId);
    SubscriptionComponent.setCanisterId(canisterId);
    return ckPaySDK;
  },
  
  // Initialize both payment flows in the same container
  initialize: (containerId, options = {}) => {
    console.log('Initializing ckPaySDK with container:', containerId);
    PaymentComponent.initialize(containerId, options);
    SubscriptionComponent.initialize(containerId, options);
    return ckPaySDK;
  },
  
  // Render payment modal (one-time payments)
  renderPaymentModal: (props, onPayment) => {
    console.log('Rendering payment modal');
    return PaymentComponent.renderPaymentModal(props, onPayment);
  },
  
  // Render subscription modal (recurring subscriptions)
  renderSubscriptionModal: (props, onPayment) => {
    console.log('Rendering subscription modal');
    return SubscriptionComponent.renderSubscriptionModal(props, onPayment);
  },
  
  // Remove any active modal
  removeModal: () => {
    console.log('Removing all modals');
    try {
      PaymentComponent.removePaymentModal();
    } catch (err) {
      // Ignore errors if payment modal is not active
    }
    try {
      SubscriptionComponent.removeSubscriptionModal();
    } catch (err) {
      // Ignore errors if subscription modal is not active
    }
    return ckPaySDK;
  },
  
  // Legacy methods for backward compatibility
  removePaymentModal: () => {
    try {
      return PaymentComponent.removePaymentModal();
    } catch (err) {
      console.warn('Payment modal not active:', err.message);
    }
  },
  
  removeSubscriptionModal: () => {
    try {
      return SubscriptionComponent.removeSubscriptionModal();
    } catch (err) {
      console.warn('Subscription modal not active:', err.message);
    }
  }
};

// Make it globally available
window.ckPaySDK = ckPaySDK;

// Also expose individual components for backward compatibility
window.ckPaySDK.PaymentComponent = PaymentComponent;
window.ckPaySDK.SubscriptionComponent = SubscriptionComponent;

export default ckPaySDK;
