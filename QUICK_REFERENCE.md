# ckPayment Quick Reference

## Project Structure

```
ckPayment/
├── src/
│   ├── SDK/                              # External-facing JavaScript SDK
│   │   ├── Pay.jsx                       # Main payment UI component
│   │   ├── userPaymentCanister.js        # Canister service layer
│   │   ├── auth.jsx                      # Authentication logic
│   │   └── interfaceHook.js              # Payment processing interface
│   │
│   ├── user_payment_canister/            # Rust backend canister
│   │   ├── src/lib.rs                    # Main canister logic
│   │   └── user_payment_canister.did     # Candid interface
│   │
│   └── declarations/                     # Generated canister interfaces
│
├── ckPayment-web3/                       # React admin dashboard
│   └── src/
│       ├── components/factory/           # Factory management UI
│       ├── services/user-payment-service.ts  # Dashboard → Canister service
│       └── hooks/useFactory.ts           # Factory state management
│
├── TESTING_GUIDE.md                     # Comprehensive testing workflows
├── DEPLOYMENT_GUIDE.md                  # Deployment procedures
├── DEVELOPMENT_PATTERNS.md              # Code patterns and examples
└── TROUBLESHOOTING_GUIDE.md             # Common issues and solutions
```

## Common Commands

### Development
```bash
# Start local replica
dfx start --clean

# Deploy all canisters
dfx deploy

# Build specific canister
dfx build user_payment_canister

# Deploy specific canister
dfx deploy user_payment_canister

# Check canister status
dfx canister status user_payment_canister

# View canister logs
dfx canister logs user_payment_canister
```

### Production
```bash
# Deploy to IC mainnet
dfx deploy --network ic

# Check mainnet canister status
dfx canister status CANISTER_ID --network ic

# View mainnet logs
dfx canister logs CANISTER_ID --network ic
```

### Frontend Development
```bash
# Dashboard development
cd ckPayment-web3
npm run dev

# SDK bundling
npm run build:sdk

# Test SDK integration
open test-sdk.html
```

### Code Generation
```bash
# Generate TypeScript declarations
dfx generate user_payment_canister
```

## Quick Workflows

### 1. Add New Backend Feature
```bash
# 1. Implement in Rust (lib.rs)
# 2. Build user payment canister
cargo build --target wasm32-unknown-unknown --release --manifest-path src/user_payment_canister/Cargo.toml

# 3. Update deployment (see DEPLOYMENT_GUIDE.md)
# 4. Test functionality (see TESTING_GUIDE.md)
```

### 2. Debug Method Issues
```bash
# 1. Discover available methods
grep -A 50 "service :" src/user_payment_canister/user_payment_canister.did

# 2. Check method signatures  
grep -B 5 -A 10 "method_name" src/user_payment_canister/user_payment_canister.did

# 3. Test method call
dfx canister call CANISTER_ID method_name '(parameters)' --network ic
```

### 3. Fix Authorization Issues
```bash
# 1. Check current owner
dfx canister call CANISTER_ID get_owner --network ic

# 2. Change owner temporarily for testing
dfx canister call CANISTER_ID admin_update_owner "(principal \"$(dfx identity get-principal --network ic)\")" --network ic

# 3. Test your methods
# 4. ALWAYS restore original owner
dfx canister call CANISTER_ID admin_update_owner "(principal \"sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae\")" --network ic
```

## Important Canister IDs

### Production Environment
- **Factory Backend**: `zdfvs-baaaa-aaaag-acoeq-cai`
- **Test User Canister**: `6tzcr-tqaaa-aaaag-aufoa-cai`

### Identity Management
- **Testing Principal**: `ouuvn-c7hpi-46km4-ywlnr-j2ten-wldfi-xu53v-vth6u-3qtqr-cmbxu-gqe`
- **Original Owner**: `sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae`

## Git Workflow

### Feature Branch Pattern
```bash
# Create feature branch
git checkout -b feature/new-payment-method

# Regular commits during development
git add .
git commit -m "feat: add backend support for new payment method"
git commit -m "feat: add dashboard UI for payment method management"
git commit -m "feat: integrate new payment method in SDK"

# Push and create PR
git push origin feature/new-payment-method
```

### Commit Message Conventions
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes
- `test:` - Test additions/changes

## Emergency Procedures

### Canister Issues
```bash
# Stop canister
dfx canister stop CANISTER_ID --network ic

# Restart canister
dfx canister start CANISTER_ID --network ic

# Check canister status
dfx canister status CANISTER_ID --network ic
```

### Local Environment Reset
```bash
# Stop replica
dfx stop

# Clean state and restart
dfx start --clean

# Redeploy everything
dfx deploy
```

## Quick Links to Detailed Guides

- **Testing**: See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive CRUD testing workflows
- **Deployment**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for WASM update procedures
- **Development**: See [DEVELOPMENT_PATTERNS.md](DEVELOPMENT_PATTERNS.md) for code patterns and examples
- **Troubleshooting**: See [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) for common issues and solutions
- **Feature Guide**: See [FEATURE_DEVELOPMENT_GUIDE.md](FEATURE_DEVELOPMENT_GUIDE.md) for comprehensive development guidance

Remember: Always refer to the specific guides for detailed procedures and troubleshooting steps!
