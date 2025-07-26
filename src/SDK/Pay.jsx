import React, { Component, createContext, useContext, useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from "./auth";
import { WalletProvider, useTokens } from "./Hooks/walletProvider";
import { addItem, addProfile, getItem, buyItem } from "./interfaceHook";
import { motion } from "framer-motion";
import { Copy, Check, Bitcoin, CircleDollarSign, Loader2, X, ChevronLeft, ChevronRight, CheckCircle2, Zap, ArrowRight, Wallet } from "lucide-react";
import "./index.css";

// Payment Context to share state
const PaymentContext = createContext();

const PaymentProvider = ({ children, initialAmount, initialCurrency }) => {
  const [selectedMethod, setSelectedMethod] = useState(initialCurrency || 'icp');
  const [amount, setAmount] = useState(initialAmount || '');
  const [transactionId, setTransactionId] = useState(null);
  const [error, setError] = useState(null);

  return (
    <PaymentContext.Provider value={{ selectedMethod, setSelectedMethod, amount, setAmount, transactionId, setTransactionId, error, setError }}>
      {children}
    </PaymentContext.Provider>
  );
};

const usePayment = () => useContext(PaymentContext);

const PaymentStep = ({ handleNextStep, removePaymentModal, isAuthenticated, login, logout, props }) => {
  const { selectedMethod, setSelectedMethod, amount, setAmount, error, setError, setTransactionId } = usePayment();
  const { balances } = useTokens();
  const { backendActor: actor, principal } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidAmount, setIsValidAmount] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Debug auth state
  useEffect(() => {
    console.log('Auth state in PaymentStep:', { isAuthenticated, actor: actor ? 'present' : 'undefined', principal: principal ? principal.toText() : 'undefined' });
  }, [isAuthenticated, actor, principal]);

  // Poll for auth state changes to handle async login delays
  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(async () => {
        try {
          const client = await import("@dfinity/auth-client").then((module) => module.AuthClient);
          const authClient = await client.create();
          const isAuth = await authClient.isAuthenticated();
          if (isAuth) {
            console.log('Polling detected authentication - updating state');
            login();
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, login]);

  // Validate amount
  useEffect(() => {
    const num = parseFloat(amount);
    setIsValidAmount(!isNaN(num) && num > 0);
  }, [amount]);

  const tokens = [
    { id: 'icp', name: 'ICP', icon: CircleDollarSign, balance: balances?.ICP || 0 },
    { id: 'btc', name: 'Bitcoin', icon: Bitcoin, balance: balances?.BTC || 0 },
  ];

  const handleConfirm = async () => {
    if (!isAuthenticated || !actor) {
      setError('Please authenticate to proceed');
      return;
    }
    if (!isValidAmount) {
      setError('Please enter a valid amount');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const amountE8s = BigInt(Math.floor(parseFloat(amount) * 1e8));
      const result = await buyItem(amountE8s, selectedMethod);
      setTransactionId(result?.transactionId || '0x' + Math.random().toString(16).slice(2, 10));
      console.log('Payment successful - advancing to success');
      handleNextStep();
      if (props.onPayment) {
        props.onPayment({ success: true, transactionId: result?.transactionId, amount, currency: selectedMethod });
      }
    } catch (err) {
      setError('Payment failed: ' + err.message);
      console.error('Payment error:', err);
      if (props.onPayment) {
        props.onPayment({ success: false, error: err.message });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full p-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Make a Payment</h2>
        <p className="text-muted-foreground">Authenticate and complete your payment</p>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">Please login to proceed</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center group"
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
            <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-xl border border-primary/20 shadow-md hover:shadow-lg transition-shadow flex items-center justify-between">
              <span className="font-mono text-sm text-foreground truncate max-w-[70%]">
                {principal ? principal.toText() : 'No principal available'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyPrincipal}
                disabled={!principal}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isCopied ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/80'
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        selectedMethod === token.id ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <token.icon className={`w-5 h-5 ${
                          selectedMethod === token.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
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

          <div className="mb-8">
            <h3 className="text-xl font-medium text-foreground mb-4">Enter Amount</h3>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="w-full py-4 px-6 text-3xl font-medium text-center bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl">
                {selectedMethod.toUpperCase()}
              </div>
            </div>
          </div>

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
              disabled={isProcessing || !isValidAmount}
              className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center group transition-all ${
                isProcessing || !isValidAmount
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/20'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
              <ArrowRight className={`ml-2 h-5 w-5 ${!isProcessing && isValidAmount ? 'group-hover:translate-x-1 transition-transform' : ''}`} />
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

const SuccessStep = ({ removePaymentModal }) => {
  const { amount, selectedMethod, transactionId } = usePayment();

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
        <h2 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">Your transaction has been completed</p>
      </div>
      
      <div className="bg-muted/30 rounded-xl p-5 mb-8 border border-border/50">
        <div className="flex justify-between items-center py-3 border-b border-border/20">
          <span className="text-muted-foreground">Transaction ID</span>
          <span className="font-mono text-sm text-foreground">{transactionId || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/20">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium text-foreground">{amount} {selectedMethod.toUpperCase()}</span>
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

// Payment Component
const PaymentComponent = ({ 
  steps, 
  removePaymentModal,
  onPayment,
  amount: initialAmount,
  currency: initialCurrency,
  ...props 
}) => {
  const { isAuthenticated, login, logout } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleNextStep = () => {
    console.log('Advancing to next step:', currentStepIndex + 1);
    setCurrentStepIndex(prev => prev + 1);
  };

  // Debug log for step changes
  useEffect(() => {
    console.log('Current step:', activeSteps[currentStepIndex]?.type);
  }, [currentStepIndex]);

  const defaultSteps = [
    { type: 'payment', title: 'Payment', data: {} },
    { type: 'success', title: 'Success', data: {} },
  ];

  const activeSteps = steps || defaultSteps;
  const currentStep = activeSteps[currentStepIndex];

  if (!currentStep) {
    console.error('Current step is undefined', { currentStepIndex, activeSteps });
    return null;
  }

  const componentMapping = {
    payment: PaymentStep,
    success: SuccessStep,
  };

  const StepComponent = componentMapping[currentStep.type];

  if (!StepComponent) {
    console.error(`No component found for step type: ${currentStep.type}`);
    return null;
  }

  return (
    <PaymentProvider initialAmount={initialAmount} initialCurrency={initialCurrency}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background rounded-xl w-full max-w-md relative overflow-hidden shadow-xl border border-border/20"
        >
          <button
            onClick={removePaymentModal}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="h-1.5 bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
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
    </PaymentProvider>
  );
};

// Backward compatible MyLibrary export
let modalContainer = null;
let root = null;
let options = {};

const MyLibrary = {
  initialize: (containerId, opts) => {
    modalContainer = document.getElementById(containerId);
    if (!modalContainer) throw new Error("Could not find container element");
    options = opts || {};
    root = createRoot(modalContainer);
  },
  
  renderPaymentModal: (props, onPayment) => {
    if (!modalContainer || !root) throw new Error("You must initialize MyLibrary first");

    const defaultProps = {
      steps: null, // Use default flow
      amount: '',
      currency: 'icp'
    };

    props = { ...defaultProps, ...options, ...props };

    root.render(
      <ErrorBoundary>
        <AuthProvider>
          <WalletProvider>
            <PaymentComponent 
              {...props} 
              onPayment={onPayment} 
              removePaymentModal={MyLibrary.removePaymentModal}
            />
          </WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  },
  
  removePaymentModal: () => {
    if (!modalContainer || !root) throw new Error("You must initialize MyLibrary first");
    root.render(null);
  },
  
  addItem,
  addProfile,
  buyItem,
  getItem
};

export default MyLibrary;