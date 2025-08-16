import React, { createContext, useContext, useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// User Payment Canister IDL
const userPaymentIdl = ({ IDL }) => {
  const TokenConfig = IDL.Record({
    symbol: IDL.Text,
    name: IDL.Text,
    decimals: IDL.Nat8,
    canister_id: IDL.Principal,
    fee: IDL.Nat64,
    logo: IDL.Opt(IDL.Text),
    is_active: IDL.Bool,
  });

  const PaymentInvoice = IDL.Record({
    id: IDL.Text,
    merchant: IDL.Principal,
    amount: IDL.Nat64,
    token: TokenConfig,
    description: IDL.Text,
    metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    expires_at: IDL.Opt(IDL.Nat64),
    created_at: IDL.Nat64,
    status: IDL.Variant({
      Created: IDL.Null,
      Paid: IDL.Null,
      Expired: IDL.Null,
      Cancelled: IDL.Null,
    }),
  });

  return IDL.Service({
    get_supported_tokens: IDL.Func([], [IDL.Vec(TokenConfig)], ['query']),
    create_invoice: IDL.Func(
      [IDL.Nat64, IDL.Text, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      [IDL.Variant({ Ok: PaymentInvoice, Err: IDL.Text })],
      []
    ),
    get_invoice: IDL.Func([IDL.Text], [IDL.Opt(PaymentInvoice)], ['query']),
    health: IDL.Func([], [IDL.Tuple(IDL.Text, IDL.Nat64, IDL.Nat64)], ['query']),
  });
};

// Payment Context
const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children, canisterId, host }) => {
  const [actor, setActor] = useState(null);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canisterInfo, setCanisterInfo] = useState(null);

  // Initialize connection to payment canister
  useEffect(() => {
    if (!canisterId) {
      setError('No canister ID provided');
      return;
    }

    const initializeActor = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create agent
        const agent = new HttpAgent({ host });

        // Fetch root key for local development
        if (process.env.NODE_ENV === "development") {
          await agent.fetchRootKey();
        }

        // Create actor for user payment canister
        const paymentActor = Actor.createActor(userPaymentIdl, {
          agent,
          canisterId: canisterId,
        });

        setActor(paymentActor);

        // Load supported tokens
        const tokens = await paymentActor.get_supported_tokens();
        setSupportedTokens(tokens);

        // Get canister health
        const [status, version, uptime] = await paymentActor.health();
        setCanisterInfo({ status, version: Number(version), uptime: Number(uptime) });

      } catch (err) {
        console.error('Failed to initialize payment canister:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeActor();
  }, [canisterId, host]);

  // Create invoice
  const createInvoice = async (amount, tokenSymbol, description, metadata = []) => {
    if (!actor) throw new Error('Payment canister not initialized');

    try {
      setLoading(true);
      const result = await actor.create_invoice(
        BigInt(amount),
        tokenSymbol,
        description,
        metadata.map(([k, v]) => [k, v])
      );

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (err) {
      console.error('Failed to create invoice:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get invoice
  const getInvoice = async (invoiceId) => {
    if (!actor) throw new Error('Payment canister not initialized');

    try {
      const result = await actor.get_invoice(invoiceId);
      return result.length > 0 ? result[0] : null;
    } catch (err) {
      console.error('Failed to get invoice:', err);
      return null;
    }
  };

  // Get token by symbol
  const getTokenConfig = (symbol) => {
    return supportedTokens.find(token => token.symbol === symbol);
  };

  // Get payment address (controller of the canister)
  const getPaymentAddress = () => {
    return canisterId; // The canister ID is the payment address
  };

  const value = {
    // State
    actor,
    supportedTokens,
    loading,
    error,
    canisterInfo,
    canisterId,

    // Actions
    createInvoice,
    getInvoice,
    getTokenConfig,
    getPaymentAddress,

    // Utils
    isConnected: !!actor,
    isHealthy: canisterInfo?.status === 'healthy',
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
