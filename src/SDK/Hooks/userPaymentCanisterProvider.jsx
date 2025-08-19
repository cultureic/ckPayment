//@ts-nocheck
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";
import { UserPaymentService } from "../userPaymentCanister.js";

const UserPaymentCanisterContext = createContext(null);

export const useUserPaymentCanister = () => {
  const { identity, principal, isAuthenticated } = useAuth();
  const [userPaymentService, setUserPaymentService] = useState(null);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [canisterId, setCanisterId] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);
  const [canisterConfig, setCanisterConfig] = useState(null);


  useEffect(()=>{
    if(canisterId)
    {
      getSupportedTokensFromCanister();
      getModalConfigFromCanister();
      getCanisterConfigFromCanister();
    }
  },[canisterId])

  // Get canister ID from global or default
  useEffect(() => {
    const globalCanisterId = window.CKPAY_CANISTER_ID;
    setCanisterId(globalCanisterId);
    console.log('Using canister ID:', globalCanisterId);
  }, []);

  // Initialize user payment service when auth and canister ID are available
  useEffect(() => {
    console.log("auth",isAuthenticated,identity,canisterId)
    if (isAuthenticated && identity && canisterId) {
      const service = new UserPaymentService(canisterId, identity);
      setUserPaymentService(service);
      console.log('User payment service initialized with canister:', canisterId);
    }
  }, [isAuthenticated, identity, canisterId]);

  // Fetch all data when service is available
  useEffect(() => {
    if (userPaymentService) {
      getSupportedTokensFromCanister();
      getModalConfigFromCanister();
      getCanisterConfigFromCanister();
    }
  }, [userPaymentService]);

  const getSupportedTokensFromCanister = async () => {
    try {
      if (!userPaymentService) {
        console.warn('User payment service not available');
        return [];
      }
      
      console.log('Fetching supported tokens from user payment canister...');
      const tokens = await userPaymentService.getSupportedTokens();
      console.log('Supported tokens from canister:', tokens);
      setSupportedTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Failed to get supported tokens:', error);
      // Fallback to default tokens
      const fallbackTokens = [
        { id: 'icp', name: 'ICP', symbol: 'ICP', canister: 'ryjl3-tyaaa-aaaaa-aaaba-cai', decimals: 8 },
        { id: 'ruggy', name: 'Ruggy', symbol: 'RUGGY', canister: 'icaf7-3aaaa-aaaam-qcx3q-cai', decimals: 8 },
        { id: 'ratsy', name: 'Ratsy', symbol: 'RATSY', canister: 'bzx5a-iyaaa-aaaaa-qbmvq-cai', decimals: 8 }
      ];
      setSupportedTokens(fallbackTokens);
      return fallbackTokens;
    }
  };

  const getModalConfigFromCanister = async (modalId = 'modal_1') => {
    try {
      if (!userPaymentService) {
        console.warn('User payment service not available for modal config');
        return null;
      }
      
      console.log('Fetching modal configuration from user payment canister...');
      const config = await userPaymentService.getModalConfig(modalId);
      console.log('Modal configuration from canister:', config);
      setModalConfig(config);
      return config;
    } catch (error) {
      console.error('Failed to get modal configuration:', error);
      // Use default configuration on error
      const defaultConfig = {
        modal_id: 'default',
        name: 'Payment Modal',
        theme: {
          primary_color: '#3b82f6',
          background_color: '#ffffff',
          text_color: '#1f2937',
          border_radius: 8,
          font_family: 'Inter, sans-serif'
        },
        branding: {
          company_name: 'Your Company',
          logo_url: null
        },
        payment_options: {
          allowed_tokens: [],
          show_amount_breakdown: true
        }
      };
      setModalConfig(defaultConfig);
      return defaultConfig;
    }
  };

  const getCanisterConfigFromCanister = async () => {
    try {
      if (!userPaymentService) {
        console.warn('User payment service not available for canister config');
        return null;
      }
      
      console.log('Fetching canister configuration from user payment canister...');
      const config = await userPaymentService.getCanisterConfiguration();
      console.log('Canister configuration from canister:', config);
      setCanisterConfig(config);
      return config;
    } catch (error) {
      console.error('Failed to get canister configuration:', error);
      return null;
    }
  };

  const transferToken = async (tokenCanister, amount, recipient) => {
    try {
      if (!userPaymentService) {
        throw new Error('User payment service not initialized');
      }

      console.log('Transferring token via user payment canister:', {
        tokenCanister,
        amount,
        recipient,
        canisterId
      });

      const result = await userPaymentService.transferToken(tokenCanister, amount, recipient);
      
      // Refresh supported tokens after transfer
      await getSupportedTokensFromCanister();
      
      return result;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  };

  return {
    userPaymentService,
    supportedTokens,
    canisterId,
    modalConfig,
    canisterConfig,
    transferToken,
    getSupportedTokensFromCanister,
    getModalConfigFromCanister,
    getCanisterConfigFromCanister
  };
};

export const UserPaymentCanisterProvider = ({ children }) => {
  const userPaymentCanisterClient = useUserPaymentCanister();
  return (
    <UserPaymentCanisterContext.Provider value={userPaymentCanisterClient}>
      {children}
    </UserPaymentCanisterContext.Provider>
  );
};

export const useUserPaymentCanisterContext = () => useContext(UserPaymentCanisterContext);
