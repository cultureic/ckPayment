import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";

// ============================================================================
// CANISTER INTERFACES
// ============================================================================

// Factory canister interface
const factoryIdl = ({ IDL }) => {
  const TokenConfig = IDL.Record({
    symbol: IDL.Text,
    name: IDL.Text,
    decimals: IDL.Nat8,
    canister_id: IDL.Principal,
    fee: IDL.Nat64,
    logo: IDL.Opt(IDL.Text),
    is_active: IDL.Bool,
  });

  const UserCanisterConfig = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    supported_tokens: IDL.Vec(TokenConfig),
    webhook: IDL.Opt(IDL.Text),
    merchant_fee: IDL.Nat64,
    auto_withdraw: IDL.Bool,
    withdraw_threshold: IDL.Opt(IDL.Nat64),
    custom_settings: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });

  const CanisterRecord = IDL.Record({
    id: IDL.Principal,
    owner: IDL.Principal,
    name: IDL.Text,
    description: IDL.Text,
    version: IDL.Nat64,
    created_at: IDL.Nat64,
    last_updated: IDL.Nat64,
    is_active: IDL.Bool,
    supported_tokens: IDL.Vec(TokenConfig),
  });

  const FactoryStats = IDL.Record({
    total_canisters: IDL.Nat64,
    active_canisters: IDL.Nat64,
    total_users: IDL.Nat64,
    current_version: IDL.Nat64,
  });

  return IDL.Service({
    deploy_user_payment_canister: IDL.Func([UserCanisterConfig], [IDL.Variant({
      Ok: IDL.Principal,
      Err: IDL.Text
    })], []),
    get_canister_info: IDL.Func([IDL.Principal], [IDL.Opt(CanisterRecord)], ['query']),
    get_user_canisters: IDL.Func([IDL.Principal], [IDL.Vec(CanisterRecord)], ['query']),
    get_all_active_canisters: IDL.Func([], [IDL.Vec(CanisterRecord)], ['query']),
    find_canisters_by_token: IDL.Func([IDL.Text], [IDL.Vec(CanisterRecord)], ['query']),
    get_factory_stats: IDL.Func([], [FactoryStats], ['query']),
  });
};

// User payment canister interface
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

  const PaymentTransaction = IDL.Record({
    id: IDL.Text,
    from: IDL.Principal,
    to: IDL.Principal,
    token: TokenConfig,
    amount: IDL.Nat64,
    fee: IDL.Nat64,
    merchant_fee: IDL.Nat64,
    timestamp: IDL.Nat64,
    status: IDL.Variant({
      Pending: IDL.Null,
      Completed: IDL.Null,
      Failed: IDL.Text,
      Refunded: IDL.Null,
    }),
    metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });

  const PaymentAnalytics = IDL.Record({
    total_transactions: IDL.Nat64,
    total_volume: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    success_rate: IDL.Float64,
    average_amount: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    top_tokens: IDL.Vec(IDL.Text),
  });

  return IDL.Service({
    create_invoice: IDL.Func(
      [IDL.Nat64, IDL.Text, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      [IDL.Variant({ Ok: PaymentInvoice, Err: IDL.Text })],
      []
    ),
    process_payment: IDL.Func(
      [IDL.Text, IDL.Principal],
      [IDL.Variant({ Ok: PaymentTransaction, Err: IDL.Text })],
      []
    ),
    get_supported_tokens: IDL.Func([], [IDL.Vec(TokenConfig)], ['query']),
    get_balance: IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    get_all_balances: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))], ['query']),
    get_analytics: IDL.Func(
      [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
      [PaymentAnalytics],
      ['query']
    ),
    get_transaction_history: IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(PaymentTransaction)],
      ['query']
    ),
    get_transaction: IDL.Func([IDL.Text], [IDL.Opt(PaymentTransaction)], ['query']),
    get_invoice: IDL.Func([IDL.Text], [IDL.Opt(PaymentInvoice)], ['query']),
    health: IDL.Func([], [IDL.Tuple(IDL.Text, IDL.Nat64, IDL.Nat64)], ['query']),
  });
};

// ============================================================================
// ENHANCED SDK CLASS
// ============================================================================

class CkPaySDKEnhanced {
  constructor(config = {}) {
    this.config = {
      // Factory canister ID - this is the main entry point
      factoryCanisterId: config.factoryCanisterId || "rdmx6-jaaaa-aaaaa-aaadq-cai",
      
      // User's payment canister ID (replaces API key)
      userCanisterId: config.userCanisterId || null,
      
      // Network configuration
      host: config.host || (process.env.NODE_ENV === "development" ? "http://localhost:4943" : "https://ic0.app"),
      
      // Authentication
      authClient: null,
      identity: null,
      
      // Cached data
      supportedTokens: new Map(),
      canisterInfo: new Map(),
      
      // Event handlers
      onPaymentComplete: config.onPaymentComplete || null,
      onError: config.onError || null,
    };

    this.agent = null;
    this.factoryActor = null;
    this.userPaymentActor = null;
    
    this.init();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async init() {
    try {
      // Initialize auth client
      this.config.authClient = await AuthClient.create();
      
      // Create agent
      this.agent = new HttpAgent({
        host: this.config.host,
        identity: this.config.identity,
      });

      // Fetch root key for local development
      if (process.env.NODE_ENV === "development") {
        await this.agent.fetchRootKey();
      }

      // Initialize factory actor
      this.factoryActor = Actor.createActor(factoryIdl, {
        agent: this.agent,
        canisterId: this.config.factoryCanisterId,
      });

      // Initialize user payment actor if canister ID is provided
      if (this.config.userCanisterId) {
        await this.initUserPaymentActor(this.config.userCanisterId);
      }

    } catch (error) {
      console.error("Failed to initialize CkPaySDK:", error);
      if (this.config.onError) {
        this.config.onError(error);
      }
    }
  }

  async initUserPaymentActor(canisterId) {
    this.userPaymentActor = Actor.createActor(userPaymentIdl, {
      agent: this.agent,
      canisterId: canisterId,
    });
    
    // Cache supported tokens
    await this.loadSupportedTokens();
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login() {
    return new Promise((resolve) => {
      this.config.authClient.login({
        identityProvider: process.env.NODE_ENV === "development" 
          ? `http://localhost:4943?canister=${process.env.INTERNET_IDENTITY_CANISTER_ID}`
          : "https://identity.ic0.app",
        onSuccess: async () => {
          this.config.identity = this.config.authClient.getIdentity();
          await this.init(); // Reinitialize with authenticated identity
          resolve(true);
        },
        onError: (error) => {
          console.error("Login failed:", error);
          resolve(false);
        },
      });
    });
  }

  async logout() {
    await this.config.authClient.logout();
    this.config.identity = null;
    await this.init(); // Reinitialize without identity
  }

  async isAuthenticated() {
    return await this.config.authClient.isAuthenticated();
  }

  getPrincipal() {
    return this.config.identity?.getPrincipal()?.toString();
  }

  // ============================================================================
  // FACTORY METHODS - CANISTER DEPLOYMENT
  // ============================================================================

  async deployPaymentCanister(config) {
    if (!await this.isAuthenticated()) {
      throw new Error("Authentication required to deploy canister");
    }

    try {
      const result = await this.factoryActor.deploy_user_payment_canister(config);
      
      if ('Ok' in result) {
        const canisterId = result.Ok;
        this.config.userCanisterId = canisterId;
        await this.initUserPaymentActor(canisterId);
        return canisterId;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error("Failed to deploy payment canister:", error);
      throw error;
    }
  }

  async getMyPaymentCanisters() {
    if (!await this.isAuthenticated()) {
      return [];
    }

    try {
      const principal = Principal.fromText(this.getPrincipal());
      return await this.factoryActor.get_user_canisters(principal);
    } catch (error) {
      console.error("Failed to get user canisters:", error);
      return [];
    }
  }

  async getCanisterInfo(canisterId) {
    try {
      const principal = Principal.fromText(canisterId);
      const result = await this.factoryActor.get_canister_info(principal);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Failed to get canister info:", error);
      return null;
    }
  }

  async findCanistersByToken(tokenSymbol) {
    try {
      return await this.factoryActor.find_canisters_by_token(tokenSymbol);
    } catch (error) {
      console.error("Failed to find canisters by token:", error);
      return [];
    }
  }

  async getFactoryStats() {
    try {
      return await this.factoryActor.get_factory_stats();
    } catch (error) {
      console.error("Failed to get factory stats:", error);
      return null;
    }
  }

  // ============================================================================
  // PAYMENT PROCESSING - DYNAMIC TOKEN LOADING
  // ============================================================================

  async loadSupportedTokens() {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      const tokens = await this.userPaymentActor.get_supported_tokens();
      this.supportedTokens.clear();
      
      tokens.forEach(token => {
        this.supportedTokens.set(token.symbol, token);
      });

      return tokens;
    } catch (error) {
      console.error("Failed to load supported tokens:", error);
      throw error;
    }
  }

  getSupportedTokens() {
    return Array.from(this.supportedTokens.values());
  }

  getTokenConfig(symbol) {
    return this.supportedTokens.get(symbol);
  }

  async createInvoice(amount, tokenSymbol, description, metadata = []) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      const result = await this.userPaymentActor.create_invoice(
        BigInt(amount),
        tokenSymbol,
        description,
        metadata
      );

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  }

  async processPayment(invoiceId, fromPrincipal) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      const principal = Principal.fromText(fromPrincipal);
      const result = await this.userPaymentActor.process_payment(invoiceId, principal);

      if ('Ok' in result) {
        const transaction = result.Ok;
        
        // Trigger payment complete callback
        if (this.config.onPaymentComplete) {
          this.config.onPaymentComplete(transaction);
        }

        return transaction;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw error;
    }
  }

  async getTransaction(transactionId) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      const result = await this.userPaymentActor.get_transaction(transactionId);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Failed to get transaction:", error);
      return null;
    }
  }

  async getInvoice(invoiceId) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      const result = await this.userPaymentActor.get_invoice(invoiceId);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Failed to get invoice:", error);
      return null;
    }
  }

  // ============================================================================
  // BALANCE AND ANALYTICS
  // ============================================================================

  async getBalance(tokenSymbol) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      return await this.userPaymentActor.get_balance(tokenSymbol);
    } catch (error) {
      console.error("Failed to get balance:", error);
      return 0n;
    }
  }

  async getAllBalances() {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      return await this.userPaymentActor.get_all_balances();
    } catch (error) {
      console.error("Failed to get all balances:", error);
      return [];
    }
  }

  async getAnalytics(fromDate = null, toDate = null) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      return await this.userPaymentActor.get_analytics(
        fromDate ? [fromDate] : [],
        toDate ? [toDate] : []
      );
    } catch (error) {
      console.error("Failed to get analytics:", error);
      return null;
    }
  }

  async getTransactionHistory(limit = 50, offset = 0) {
    if (!this.userPaymentActor) {
      throw new Error("No user payment canister configured");
    }

    try {
      return await this.userPaymentActor.get_transaction_history(
        BigInt(limit),
        BigInt(offset)
      );
    } catch (error) {
      console.error("Failed to get transaction history:", error);
      return [];
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  // Set user canister ID (replaces API key functionality)
  setUserCanister(canisterId) {
    this.config.userCanisterId = canisterId;
    return this.initUserPaymentActor(canisterId);
  }

  // Create a payment widget for embedding
  createPaymentWidget(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID '${containerId}' not found`);
    }

    const widget = document.createElement('div');
    widget.className = 'ckpay-widget';
    widget.innerHTML = `
      <div class="ckpay-header">
        <h3>Payment</h3>
        <p>Amount: ${options.amount || 0} ${options.tokenSymbol || 'tokens'}</p>
      </div>
      <div class="ckpay-content">
        <select id="token-select" class="ckpay-token-select">
          <option value="">Select Token</option>
        </select>
        <button id="pay-button" class="ckpay-pay-button">Pay Now</button>
      </div>
      <div id="payment-status" class="ckpay-status"></div>
    `;

    container.appendChild(widget);

    // Populate token options
    this.loadSupportedTokens().then(() => {
      const select = widget.querySelector('#token-select');
      this.getSupportedTokens().forEach(token => {
        const option = document.createElement('option');
        option.value = token.symbol;
        option.textContent = `${token.name} (${token.symbol})`;
        select.appendChild(option);
      });
    });

    // Handle payment
    const payButton = widget.querySelector('#pay-button');
    const statusDiv = widget.querySelector('#payment-status');

    payButton.addEventListener('click', async () => {
      try {
        payButton.disabled = true;
        statusDiv.textContent = 'Processing payment...';

        const selectedToken = widget.querySelector('#token-select').value;
        if (!selectedToken) {
          throw new Error('Please select a token');
        }

        // Create invoice
        const invoice = await this.createInvoice(
          options.amount || 0,
          selectedToken,
          options.description || 'Payment',
          options.metadata || []
        );

        // Process payment (in real implementation, this would involve token transfer)
        const transaction = await this.processPayment(
          invoice.id,
          this.getPrincipal()
        );

        statusDiv.textContent = 'Payment completed successfully!';
        statusDiv.className = 'ckpay-status success';

        if (options.onSuccess) {
          options.onSuccess(transaction);
        }

      } catch (error) {
        statusDiv.textContent = `Payment failed: ${error.message}`;
        statusDiv.className = 'ckpay-status error';
        
        if (options.onError) {
          options.onError(error);
        }
      } finally {
        payButton.disabled = false;
      }
    });

    return widget;
  }

  // Health check for user canister
  async healthCheck() {
    if (!this.userPaymentActor) {
      return { status: 'no_canister', healthy: false };
    }

    try {
      const [status, version, uptime] = await this.userPaymentActor.health();
      return {
        status,
        version: Number(version),
        uptime: Number(uptime),
        healthy: status === 'healthy'
      };
    } catch (error) {
      return { status: 'error', healthy: false, error: error.message };
    }
  }
}

// ============================================================================
// EXPORT AND GLOBAL REGISTRATION
// ============================================================================

// Export the enhanced SDK
export default CkPaySDKEnhanced;

// Make it available globally for non-module environments
if (typeof window !== 'undefined') {
  window.CkPaySDKEnhanced = CkPaySDKEnhanced;
}

// Backward compatibility - also export with old name but log deprecation
export class CkPaySDK extends CkPaySDKEnhanced {
  constructor(config) {
    console.warn('CkPaySDK is deprecated. Use CkPaySDKEnhanced instead. API keys are being replaced with canister IDs.');
    super(config);
  }
}
