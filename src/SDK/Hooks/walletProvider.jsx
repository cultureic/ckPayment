//@ts-nocheck
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";
import tokensConfig from "./tokens.json"; // Import JSON configurations
import { defaultIcrcTransferArgs, toDefaultSub } from "../utils/index.js";
import { Principal } from "@dfinity/principal";

const TokenContext = createContext(null);


export const useTokenClient = () => {
  const { identity, principal, isAuth } = useAuth();
  const [balances, setBalances] = useState(null);

  useEffect(() => {
    if (isAuth) {
      getBalances();
    }
  }, [principal, identity]);
  useEffect(() => {
    console.log("balances", balances);
  }, [balances]);

  useEffect(() => {
  if (!isAuth) return;

  // Initial fetch
  getBalances();

  // Poll every 5 seconds
  const interval = setInterval(() => {
    getBalances();
  }, 5000);

  // Cleanup on unmount or when isAuth changes
  return () => clearInterval(interval);
}, [isAuth, principal, identity]);


  async function getBalances() {
    console.log("Fetching balances...");
    let balancesData = {};

    for (const token of tokensConfig.tokens) {
      let actor = createicrc1Actor(token.canister, {
        agentOptions: { identity },
      });
      let balance = await actor.icrc1_balance_of(toDefaultSub(principal));
      balancesData[token.name] = e8sToNumber(balance);
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
    const token = tokensConfig.tokens.find((t) => t.name === tokenName);
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
    const token = tokensConfig.tokens.find((t) => t.name === tokenName);
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
    transferToken,
    transferTokenAccount,
    getBalances
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
