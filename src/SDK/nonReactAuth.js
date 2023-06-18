import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/payment_backend";

const defaultOptions = {
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
    },
  },
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app/#authorize"
        : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
  },
};

export const createAuthClient = async (options = defaultOptions) => {
  const authClient = await AuthClient.create(options.createOptions);
  return authClient;
};

export const login = async (authClient, onSuccess, options = defaultOptions) => {
  await authClient.login({
    ...options.loginOptions,
    onSuccess,
  });
};

export const logout = async (authClient, options = defaultOptions) => {
  await authClient?.logout();
};

export const getBackendActor = (authClient, options = defaultOptions) => {
  const identity = authClient.getIdentity();
  const actor = createActor(canisterId, {
    agentOptions: {
      identity,
    },
  });
  return actor;
};

export const isAuthenticated = async (authClient, options = defaultOptions) => {
  return await authClient.isAuthenticated();
};
