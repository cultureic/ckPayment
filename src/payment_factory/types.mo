import Result "mo:base/Result";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module {
  
  /// Configuration for a token supported by a user canister
  public type TokenConfig = {
    symbol: Text;           // e.g., "ckBTC", "ICP", "USDC"
    name: Text;            // e.g., "Chain Key Bitcoin"
    decimals: Nat8;        // Token decimals
    canisterId: Principal; // Token ledger canister ID
    fee: Nat;              // Transfer fee in smallest unit
    logo: ?Text;           // Optional logo URL or base64 image
    isActive: Bool;        // Whether this token is currently accepted
  };
  
  /// Configuration for deploying a user payment canister
  public type UserCanisterConfig = {
    name: Text;                    // Display name for the payment system
    description: Text;             // Description of what this payment system is for
    supportedTokens: [TokenConfig]; // List of tokens this canister will accept
    webhook: ?Text;                // Optional webhook URL for payment notifications
    merchantFee: Nat;              // Fee percentage (in basis points, e.g., 250 = 2.5%)
    autoWithdraw: Bool;            // Whether to auto-withdraw to owner's account
    withdrawThreshold: ?Nat;       // Min amount before auto-withdrawal triggers
    customSettings: [(Text, Text)]; // Key-value pairs for custom settings
  };
  
  /// Record of a deployed user canister
  public type CanisterRecord = {
    id: Principal;                 // Canister ID
    owner: Principal;              // Owner who deployed it
    name: Text;                    // Display name
    description: Text;             // Description
    version: Nat;                  // Canister version
    createdAt: Int;               // Creation timestamp
    lastUpdated: Int;             // Last update timestamp
    isActive: Bool;               // Whether the canister is active
    supportedTokens: [TokenConfig]; // Supported tokens
  };
  
  /// Statistics about the factory
  public type FactoryStats = {
    totalCanisters: Nat;    // Total number of canisters deployed
    activeCanisters: Nat;   // Number of active canisters
    totalUsers: Nat;        // Number of unique users who deployed canisters
    currentVersion: Nat;    // Current canister version
  };
  
  /// Payment transaction record
  public type PaymentTransaction = {
    id: Text;                      // Unique transaction ID
    from: Principal;               // Payer's principal
    to: Principal;                 // Merchant/receiver principal
    token: TokenConfig;            // Token used for payment
    amount: Nat;                   // Amount paid (in token's smallest unit)
    fee: Nat;                      // Transaction fee paid
    merchantFee: Nat;              // Merchant fee deducted
    timestamp: Int;                // Transaction timestamp
    status: TransactionStatus;     // Current status
    metadata: [(Text, Text)];      // Additional metadata
  };
  
  public type TransactionStatus = {
    #pending;
    #completed;
    #failed: Text;
    #refunded;
  };
  
  /// Invoice for payment requests
  public type PaymentInvoice = {
    id: Text;                      // Unique invoice ID
    merchant: Principal;           // Merchant who created the invoice
    amount: Nat;                   // Amount to be paid
    token: TokenConfig;            // Token to be used for payment
    description: Text;             // Payment description
    metadata: [(Text, Text)];      // Additional metadata
    expiresAt: ?Int;              // Optional expiration timestamp
    createdAt: Int;               // Creation timestamp
    status: InvoiceStatus;        // Current status
  };
  
  public type InvoiceStatus = {
    #created;
    #paid;
    #expired;
    #cancelled;
  };
  
  /// Configuration update for user canisters
  public type ConfigUpdate = {
    #addToken: TokenConfig;
    #removeToken: Text; // Token symbol
    #updateToken: TokenConfig;
    #setWebhook: ?Text;
    #setMerchantFee: Nat;
    #setAutoWithdraw: Bool;
    #setWithdrawThreshold: ?Nat;
    #updateSetting: (Text, Text);
  };
  
  /// Analytics data for payments
  public type PaymentAnalytics = {
    totalTransactions: Nat;
    totalVolume: [(Text, Nat)];     // Volume per token symbol
    successRate: Float;             // Percentage of successful transactions
    averageAmount: [(Text, Nat)];   // Average amount per token
    topTokens: [Text];             // Most used tokens by volume
    dailyStats: [DailyStats];      // Daily statistics
  };
  
  public type DailyStats = {
    date: Text;                    // Date in YYYY-MM-DD format
    transactions: Nat;             // Number of transactions
    volume: [(Text, Nat)];         // Volume per token
  };
  
  /// Interface that user payment canisters must implement
  public type UserPaymentCanister = actor {
    // Configuration management
    updateConfiguration: (UserCanisterConfig) -> async Result.Result<(), Text>;
    getConfiguration: () -> async UserCanisterConfig;
    
    // Payment processing
    createInvoice: (amount: Nat, token: Text, description: Text, metadata: [(Text, Text)]) -> async Result.Result<PaymentInvoice, Text>;
    processPayment: (invoiceId: Text, from: Principal) -> async Result.Result<PaymentTransaction, Text>;
    getTransaction: (transactionId: Text) -> async ?PaymentTransaction;
    
    // Token management
    getSupportedTokens: () -> async [TokenConfig];
    updateTokenConfig: (ConfigUpdate) -> async Result.Result<(), Text>;
    
    // Analytics
    getAnalytics: (fromDate: ?Text, toDate: ?Text) -> async PaymentAnalytics;
    getTransactionHistory: (limit: Nat, offset: Nat) -> async [PaymentTransaction];
    
    // Withdrawal management
    withdraw: (token: Text, amount: Nat, to: Principal) -> async Result.Result<Nat, Text>;
    getBalance: (token: Text) -> async Nat;
    
    // Health check
    health: () -> async {status: Text; version: Nat; uptime: Int};
  };
  
  /// Webhook notification payload
  public type WebhookPayload = {
    event: WebhookEvent;
    timestamp: Int;
    canisterId: Principal;
    data: [(Text, Text)];
  };
  
  public type WebhookEvent = {
    #payment_received;
    #payment_failed;
    #invoice_created;
    #invoice_expired;
    #withdrawal_completed;
    #config_updated;
  };
  
  /// Error types for the payment system
  public type PaymentError = {
    #insufficient_funds: {required: Nat; available: Nat};
    #invalid_token: Text;
    #invoice_not_found: Text;
    #invoice_expired: Text;
    #transaction_failed: Text;
    #unauthorized: Text;
    #configuration_error: Text;
    #network_error: Text;
  };
  
  /// Deposit address for receiving payments
  public type DepositAddress = {
    token: Text;           // Token symbol
    address: Text;         // Deposit address (for Bitcoin-like tokens)
    principal: Principal;  // Principal for ICP-native tokens
    subaccount: ?Blob;     // Subaccount if applicable
    memo: ?Text;          // Optional memo for identification
  };
}
