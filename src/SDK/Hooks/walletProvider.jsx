//@ts-nocheck
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";
import tokensConfig from "./tokens.json"; // Import JSON configurations
import { defaultIcrcTransferArgs, toDefaultSub } from "../utils/index.js";
import { Principal } from "@dfinity/principal";
import { useUserPaymentCanisterContext } from "./userPaymentCanisterProvider.jsx";

// User Payment Canister ID

const TokenContext = createContext(null);

export const useTokenClient = () => {
  const { identity, principal, isAuthenticated } = useAuth();
  const [balances, setBalances] = useState(null);
  
  // Use the user payment canister context instead of creating our own
  const { 
    supportedTokens = [], 
    userPaymentService, 
    canisterId: userPaymentCanisterId,
    transferToken: userPaymentTransfer,
    getSupportedTokensFromCanister 
  } = useUserPaymentCanisterContext()


  useEffect(()=>{
    if (!isAuthenticated) return;
    console.log("supportd tokns",supportedTokens);
    // Initial fetch
    getBalances();
    console.log("balances", balances);
  },[supportedTokens])

  useEffect(() => {
    console.log("balances", balances);
  }, [balances]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    getBalances();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      getBalances();
    }, 5000);

    // Cleanup on unmount or when isAuthenticated changes
    return () => clearInterval(interval);
  }, [isAuthenticated, principal, identity, supportedTokens]);

  async function getBalances() {
    console.log("Fetching balances...");
    let balancesData = {};
    
    // Use supported tokens if available, otherwise fallback to tokensConfig
    const tokensToUse = supportedTokens.length > 0 ? supportedTokens : tokensConfig.tokens;

    for (const token of tokensToUse) {
      try {
        let actor = createicrc1Actor(token.canister, {
          agentOptions: { identity  },
        });
        let balance = await actor.icrc1_balance_of(toDefaultSub(principal));
        balancesData[token.name] = e8sToNumber(balance);
      } catch (error) {
        console.error(`Failed to get balance for ${token.name}:`, error);
        balancesData[token.name] = 0;
      }
    }

    setBalances(balancesData);
  }



  function e8sToNumber(e8s) {
    return Number(e8s) / 100_000_000;
  }

  function toE8s(amount) {
    if (typeof amount !== "number" || isNaN(amount)) {
      throw new Error("Invalid amount: must be a number");
    }
    return Math.round(amount * 100_000_000);
  }
  

  async function transferTokenAccount(tokenName, amount,to) {
    // Use supported tokens if available, otherwise fallback to tokensConfig
    const tokensToUse = supportedTokens.length > 0 ? supportedTokens : tokensConfig.tokens;
    const token = tokensToUse.find((t) => t.name === tokenName);
    if (!token) {
      console.error(`Token ${tokenName} not found`);
      return;
    }

    let actor = createicrc1Actor(token.canister, {
      agentOptions: { identity },
    });
    let transferArgs = {
      fee: { e8s: BigInt(token.transferFee) },
      amount: { e8s: BigInt(amount * 100_000_000) },
      memo: BigInt(1347768404),
      from_subaccount: [],
      to: Array.from(
        Uint8Array.from(
          Buffer.from(
            to,
            "hex"
          )
        )
      ),
      created_at_time: [],
    };

    let transfer = await actor.transfer(transferArgs);
    console.log(`Transfer result for ${tokenName}:`, transfer);
    return transfer;
  }

  async function transferToken(tokenName, amount,to) {
    // Use supported tokens if available, otherwise fallback to tokensConfig
    const tokensToUse = supportedTokens.length > 0 ? supportedTokens : tokensConfig.tokens;
    const token = tokensToUse.find((t) => t.name === tokenName);
    if (!token) {
      console.error(`Token ${tokenName} not found`);
      return;
    }
    let actor = createicrc1Actor(token.canister, {
      agentOptions: { identity },
    });
    let fee = await actor.icrc1_fee();
    let amountToE8s = toE8s(amount);
    let transferArgs = defaultIcrcTransferArgs(Principal.fromText(to), amountToE8s);
    let transferResult = await actor.icrc1_transfer(transferArgs);
    await getBalances()
  }


  return {
    identity,
    balances,
    supportedTokens,
    userPaymentService,
    transferToken,
    transferTokenAccount,
    getBalances,
    getSupportedTokensFromCanister
  };
};

export const WalletProvider = ({ children }) => {
  const tokenClient = useTokenClient();
  return (
    <TokenContext.Provider value={tokenClient}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => useContext(TokenContext);
