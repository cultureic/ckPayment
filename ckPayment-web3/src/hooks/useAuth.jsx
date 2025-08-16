import { useState, useEffect, createContext, useContext } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Internet Identity configuration
  const II_URL = process.env.NODE_ENV === 'production' 
    ? 'https://identity.ic0.app'
    : process.env.CANISTER_ID_INTERNET_IDENTITY 
      ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
      : 'http://localhost:4943/?canister=rdmx6-jaaaa-aaaaa-aaadq-cai';

  // Maximum auth time (8 hours)
  const MAX_TIME_TO_LIVE = BigInt(8 * 60 * 60 * 1000 * 1000 * 1000);

  // Initialize auth client
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      const client = await AuthClient.create();
      setAuthClient(client);

      // Check if already authenticated
      const isAuth = await client.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const identity = client.getIdentity();
        setIdentity(identity);
        setPrincipal(identity.getPrincipal().toString());
      }
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) return false;

    try {
      setIsLoading(true);
      
      return new Promise((resolve) => {
        authClient.login({
          identityProvider: II_URL,
          maxTimeToLive: MAX_TIME_TO_LIVE,
          onSuccess: () => {
            const identity = authClient.getIdentity();
            setIdentity(identity);
            setPrincipal(identity.getPrincipal().toString());
            setIsAuthenticated(true);
            resolve(true);
          },
          onError: (error) => {
            console.error('Login failed:', error);
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      setIsLoading(true);
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create authenticated agent for making calls to canisters
  const createAuthenticatedAgent = async () => {
    if (!identity) return null;

    const agent = new HttpAgent({
      identity,
      host: process.env.NODE_ENV === 'production' 
        ? 'https://ic0.app' 
        : 'http://localhost:4943',
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    return agent;
  };

  // Create actor for interacting with backend canister
  const createBackendActor = async () => {
    const agent = await createAuthenticatedAgent();
    if (!agent) return null;

    // Import your backend canister interface here
    // const { idlFactory } = await import('../declarations/payment_backend');
    // const canisterId = process.env.CANISTER_ID_PAYMENT_BACKEND;
    
    // return Actor.createActor(idlFactory, {
    //   agent,
    //   canisterId,
    // });
  };

  const value = {
    isAuthenticated,
    identity,
    principal,
    isLoading,
    login,
    logout,
    createAuthenticatedAgent,
    createBackendActor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Higher-order component for protecting routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-md w-full mx-4">
            {/* Auth Card */}
            <div className="bg-card border border-border rounded-lg shadow-lg p-8">
              {/* Logo/Icon */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">Welcome to ckPayment</h1>
                <p className="text-muted-foreground">Secure payments on the Internet Computer</p>
              </div>

              {/* Auth Content */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Access Your Dashboard</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Sign in with Internet Identity to manage your payments, view analytics, and configure settings.
                  </p>
                </div>

                {/* Login Button */}
                <div className="space-y-4">
                  <LoginButton />
                  
                  {/* Info about Internet Identity */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      New to Internet Identity? 
                      <a 
                        href="https://identity.ic0.app" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline ml-1"
                      >
                        Create an account
                      </a>
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="border-t border-border pt-6">
                  <p className="text-sm font-medium mb-3">What you can do:</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Monitor payment analytics
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Configure webhooks and settings
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      View transaction history
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                Powered by the Internet Computer Protocol
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Login button component
export const LoginButton = () => {
  const { login, isLoading } = useAuth();

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Connecting to Internet Identity...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span>Continue with Internet Identity</span>
        </>
      )}
    </button>
  );
};

// Logout button component
export const LogoutButton = () => {
  const { logout, isLoading } = useAuth();

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className="bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
    >
      {isLoading ? 'Disconnecting...' : 'Logout'}
    </button>
  );
};

// User info component
export const UserInfo = () => {
  const { principal, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {principal?.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        {principal?.slice(0, 8)}...{principal?.slice(-4)}
      </span>
    </div>
  );
};
