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


  useEffect(()=>{
    if(canisterId)
    {
      getSupportedTokensFromCanister()
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

  // Fetch supported tokens when service is available
  useEffect(() => {
    if (userPaymentService) {
      getSupportedTokensFromCanister();
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
    transferToken,
    getSupportedTokensFromCanister
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
