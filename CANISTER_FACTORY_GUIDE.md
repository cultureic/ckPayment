# CkPayment Canister Factory System

This document describes the enhanced CkPayment system that implements a **canister factory pattern** replacing API keys with user-deployable payment canisters.

## Architecture Overview

### Previous System (API Key Based)
- Users registered with API keys
- All payment data stored in one central canister
- Limited scalability and customization

### New System (Canister Factory)
- Users deploy their own payment canisters
- Each user has a dedicated canister ID (replaces API key)
- Distributed architecture with better scalability
- Individual token configurations per user

## System Components

### 1. Factory Canister (`payment_backend`)
**Location**: `src/payment_backend/src/lib.rs`

The main factory canister that:
- Deploys new user payment canisters
- Tracks all deployed canisters
- Provides discovery and management services
- Maintains backward compatibility with existing payment system

**Key Methods**:
```rust
deploy_user_payment_canister(config: UserCanisterConfig) -> Result<Principal, String>
get_user_canisters(owner: Principal) -> Vec<CanisterRecord>
find_canisters_by_token(token_symbol: String) -> Vec<CanisterRecord>
get_factory_stats() -> FactoryStats
```

### 2. User Payment Canister Template (`user_payment_canister`)
**Location**: `src/user_payment_canister/src/lib.rs`

Individual payment canisters deployed for each user that:
- Handle payment processing
- Store invoices and transactions
- Manage token balances
- Provide analytics

**Key Methods**:
```rust
create_invoice(amount, token_symbol, description, metadata) -> PaymentInvoice
process_payment(invoice_id, from) -> PaymentTransaction
get_supported_tokens() -> Vec<TokenConfig>
get_analytics() -> PaymentAnalytics
```

### 3. Enhanced SDK (`ckPay-enhanced.js`)
**Location**: `src/SDK/ckPay-enhanced.js`

The new SDK that:
- Replaces API keys with canister IDs
- Dynamically loads token configurations
- Supports canister deployment
- Provides backward compatibility

## Key Benefits

### 1. **Scalability**
- Distributed architecture reduces bottlenecks
- Each user has dedicated resources
- Better performance under load

### 2. **Customization**
- Users configure their own accepted tokens
- Individual merchant fees and settings
- Custom webhook endpoints

### 3. **Ownership**
- Users own their payment data
- No vendor lock-in
- Full control over payment processing

### 4. **Security**
- Isolated user data
- Reduced attack surface
- Canister-level access control

## Implementation Details

### Stable Storage Pattern
Following the patterns from your `dvinity` project, the implementation uses:

```rust
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    BTreeMap as StableBTreeMap,
    Cell,
    DefaultMemoryImpl,
    Storable,
};
```

### Factory Pattern
Based on the BOB project's miner deployment pattern:

```rust
// Deploy new user canister
let canister_id = create_canister(create_args, 2_000_000_000_000u128).await?;
install_code(install_args).await?;
```

### Memory Management
Each canister uses isolated memory spaces:
- Factory: Memory IDs 0-19
- User Canisters: Memory IDs 0-9 per canister

## Migration Guide

### For Existing Users (API Key System)

1. **Backward Compatibility**: Existing API key functionality remains functional
2. **Gradual Migration**: Users can migrate at their own pace
3. **Data Preservation**: Existing payment data is preserved

### Migration Steps:

1. **Deploy Your Payment Canister**:
```javascript
const sdk = new CkPaySDKEnhanced({
  factoryCanisterId: "your-factory-canister-id"
});

await sdk.login();
const canisterId = await sdk.deployPaymentCanister({
  name: "My Payment System",
  description: "Payment processing for my dapp",
  supported_tokens: [
    {
      symbol: "ckBTC",
      name: "Chain Key Bitcoin",
      decimals: 8,
      canister_id: "mxzaz-hqaaa-aaaar-qaada-cai",
      fee: 10,
      is_active: true
    }
  ],
  merchant_fee: 250, // 2.5%
  auto_withdraw: false
});
```

2. **Update Your Integration**:
```javascript
// Old way (API key)
const sdk = new CkPaySDK({ apiKey: "your-api-key" });

// New way (Canister ID)
const sdk = new CkPaySDKEnhanced({ 
  userCanisterId: canisterId 
});
```

3. **Use Dynamic Token Loading**:
```javascript
// Tokens are loaded automatically from your canister
const tokens = sdk.getSupportedTokens();
const invoice = await sdk.createInvoice(1000, "ckBTC", "Payment for services");
```

## Usage Examples

### 1. Deploy a Payment Canister

```javascript
const sdk = new CkPaySDKEnhanced();
await sdk.login();

const config = {
  name: "E-commerce Store",
  description: "Payment processing for online store",
  supported_tokens: [
    {
      symbol: "ckBTC",
      name: "Chain Key Bitcoin", 
      decimals: 8,
      canister_id: "mxzaz-hqaaa-aaaar-qaada-cai",
      fee: 10,
      is_active: true
    },
    {
      symbol: "ICP",
      name: "Internet Computer Protocol",
      decimals: 8, 
      canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
      fee: 10000,
      is_active: true
    }
  ],
  merchant_fee: 250,
  auto_withdraw: true,
  withdraw_threshold: 1000000
};

const canisterId = await sdk.deployPaymentCanister(config);
console.log("Deployed canister:", canisterId.toString());
```

### 2. Process Payments

```javascript
const sdk = new CkPaySDKEnhanced({
  userCanisterId: "your-canister-id"
});

// Create invoice
const invoice = await sdk.createInvoice(
  1000000, // 0.01 ckBTC (in satoshis)
  "ckBTC",
  "Purchase premium plan",
  [["customer_id", "12345"], ["plan", "premium"]]
);

// Process payment
const transaction = await sdk.processPayment(
  invoice.id,
  "customer-principal-id"
);

console.log("Payment completed:", transaction);
```

### 3. Analytics and Management

```javascript
// Get payment analytics
const analytics = await sdk.getAnalytics();
console.log("Total transactions:", analytics.total_transactions);
console.log("Success rate:", analytics.success_rate);

// Get balances
const balances = await sdk.getAllBalances();
balances.forEach(([token, balance]) => {
  console.log(`${token}: ${balance}`);
});

// Get transaction history
const history = await sdk.getTransactionHistory(10, 0);
```

### 4. Widget Integration

```javascript
// Create a payment widget
const widget = sdk.createPaymentWidget('payment-container', {
  amount: 1000,
  description: 'Premium subscription',
  onSuccess: (transaction) => {
    console.log('Payment successful!', transaction);
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  }
});
```

## Development Setup

### 1. Build the Canisters

```bash
# Build the factory canister
dfx build payment_backend

# Build the user canister template
dfx build user_payment_canister
```

### 2. Deploy Factory Canister

```bash
# Deploy to local network
dfx deploy payment_backend

# Deploy to IC mainnet
dfx deploy --network ic payment_backend
```

### 3. Set User Canister WASM

```bash
# Get the user canister WASM
WASM_PATH=".dfx/local/canisters/user_payment_canister/user_payment_canister.wasm"

# Set it in the factory (admin only)
dfx canister call payment_backend set_user_canister_wasm \
  "(blob \"$(xxd -p $WASM_PATH | tr -d '\n')\")"
```

## Security Considerations

### 1. **Access Control**
- Only canister owners can update configurations
- Factory admin controls user canister WASM
- Isolated user data per canister

### 2. **Upgrade Safety**
- User canisters use stable storage
- Version tracking for upgrades
- Backward compatibility maintained

### 3. **Resource Management**
- Maximum 5 canisters per user
- Cycle management for deployments
- Automatic cleanup of expired data

## Testing

### Run Unit Tests
```bash
cargo test --workspace
```

### Integration Testing
```bash
# Start local replica
dfx start --clean --background

# Deploy canisters
dfx deploy

# Run integration tests
npm run test:integration
```

## API Reference

### Factory Canister Methods

| Method | Type | Description |
|--------|------|-------------|
| `deploy_user_payment_canister` | Update | Deploy new user payment canister |
| `get_user_canisters` | Query | Get canisters owned by user |
| `get_canister_info` | Query | Get info about specific canister |
| `find_canisters_by_token` | Query | Find canisters supporting token |
| `get_factory_stats` | Query | Get factory statistics |

### User Payment Canister Methods

| Method | Type | Description |
|--------|------|-------------|
| `create_invoice` | Update | Create payment invoice |
| `process_payment` | Update | Process payment for invoice |
| `get_supported_tokens` | Query | Get supported token configs |
| `get_balance` | Query | Get balance for token |
| `get_analytics` | Query | Get payment analytics |
| `get_transaction_history` | Query | Get transaction history |

## Roadmap

### Phase 1: Core Implementation ✅
- [x] Factory canister with deployment
- [x] User canister template
- [x] Enhanced SDK with canister ID support
- [x] Dynamic token loading

### Phase 2: Advanced Features (In Progress)
- [ ] Canister management UI
- [ ] Upgrade and migration system
- [ ] Advanced analytics dashboard
- [ ] Webhook system

### Phase 3: Enterprise Features
- [ ] Multi-signature support
- [ ] Advanced access controls
- [ ] Compliance reporting
- [ ] Custom fee structures

## Support

For questions and support:
- Create an issue in the repository
- Join the community Discord
- Check the documentation wiki

---

This canister factory system provides a robust, scalable foundation for payment processing on the Internet Computer while maintaining backward compatibility and enabling smooth migration from the API key system.
