
const defaultOptions = {
  /**
   *  @type {import("@dfinity/auth-client").AuthClientCreateOptions}
   */
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
    },
  },
  /**
   * @type {import("@dfinity/auth-client").AuthClientLoginOptions}
   */
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === "ic"
        ?
        "https://identity.ic0.app/#authorize":
        `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`
       ,
  },
};



import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/payment_backend";

export const AuthContext = createContext(null);

// Global state
let globalAuthClient;
let globalState;



export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [backendActor, setBackendActor] = useState(null);

  useEffect(() => {
    AuthClient.create(options.createOptions).then(async (client) => {
      globalAuthClient = client;
      setAuthClient(client);
      updateClient(client);
    });
  }, []);

  const login = () => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => {
        updateClient(authClient);
      },
    });
  };

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);

    const identity = client.getIdentity();
    setIdentity(identity);

    const principal = identity.getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    globalState = {actor,principal,isAuthenticated};
    setBackendActor(actor);
  }

  async function logout() {
    await authClient?.logout();
    await updateClient(authClient);
  }

  return {
    isAuthenticated,
    login,
    logout,
    authClient,
    identity,
    principal,
    backendActor,
  };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const getGlobalState = () => {
  if (!globalState) {
    throw new Error("Not authenticated");
  }
  return globalState;
};

export const getGlobalAuthClient = () => {
  if (!globalAuthClient) {
    throw new Error("Not initialized");
  }
  return globalAuthClient;
};
