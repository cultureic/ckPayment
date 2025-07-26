import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../declarations/payment_backend";

const defaultOptions = {
  createOptions: {
    idleOptions: {},
  },
  loginOptions: {
    identityProvider:  "https://identity.ic0.app/#authorize"
    
  },
};

export const AuthContext = createContext(null);

export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [backendActor, setBackendActor] = useState(null);

  useEffect(() => {
    console.log('Initializing AuthClient');
    AuthClient.create(options.createOptions).then(async (client) => {
      setAuthClient(client);
      await updateClient(client);
    }).catch(err => {
      console.error('Failed to create AuthClient:', err);
    });
  }, []);

  const login = async () => {
    if (!authClient) {
      console.error('AuthClient not initialized');
      return;
    }
    try {
      console.log('Starting login');
      await authClient.login({
        ...options.loginOptions,
        onSuccess: async () => {
          console.log('Login onSuccess triggered');
          await updateClient(authClient);
        },
        onError: (err) => {
          console.error('Login failed:', err);
        },
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  async function updateClient(client) {
    try {
      const isAuth = await client.isAuthenticated();
      console.log('Updating client - isAuthenticated:', isAuth);
      setIsAuthenticated(isAuth);

      const ident = client.getIdentity();
      setIdentity(ident);

      const princ = ident.getPrincipal();
      setPrincipal(princ);
      console.log('Principal set:', princ.toText());

      setAuthClient(client);

      const actor = createActor(canisterId, {
        agentOptions: {
          identity: ident,
        },
      });
      setBackendActor(actor);
      console.log('Backend actor set');
    } catch (err) {
      console.error('Error updating client:', err);
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
      setBackendActor(null);
    }
  }

  async function logout() {
    if (!authClient) {
      console.error('AuthClient not initialized');
      return;
    }
    try {
      console.log('Logging out');
      await authClient.logout();
      await updateClient(authClient);
    } catch (err) {
      console.error('Logout error:', err);
    }
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