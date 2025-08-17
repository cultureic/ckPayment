# ckPayment Development Quick Reference

## Quick File Map

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
└── FEATURE_DEVELOPMENT_GUIDE.md         # Comprehensive development guide
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

### User Payment Canister WASM Update Flow
```bash
# 1. Build user payment canister with new features
cargo build --target wasm32-unknown-unknown --release --manifest-path src/user_payment_canister/Cargo.toml

# 2. Rebuild factory backend to embed new WASM
cargo build --target wasm32-unknown-unknown --release --manifest-path src/payment_backend/Cargo.toml

# 3. Deploy factory backend with new embedded WASM
dfx deploy payment_backend --network ic

# 4. Upgrade existing user payment canisters via factory admin method
dfx canister call payment_backend admin_upgrade_user_canister '(principal "CANISTER_ID")' --network ic
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

## Feature Development Shortcut

### 1. Backend First (user_payment_canister)
- [ ] Add data structure in `lib.rs`
- [ ] Add stable storage with new MemoryId
- [ ] Implement canister method with authorization
- [ ] Update `user_payment_canister.did`
- [ ] Build: `cargo build --target wasm32-unknown-unknown --release`

### 2. Dashboard Integration (ckPayment-web3)
- [ ] Add TypeScript interface in `user-payment-service.ts`
- [ ] Add service method
- [ ] Create/update UI component
- [ ] Integrate with FactoryTab or Dashboard

### SDK Integration (src/SDK/)
- [ ] Add method to `userPaymentCanister.js`
- [ ] Update `interfaceHook.js` with wrapped function pattern
- [ ] Update React providers:
  - [ ] `userPaymentCanisterProvider.jsx` - Main canister provider
  - [ ] `walletProvider.jsx` - Token balance provider  
  - [ ] `providers/PaymentProvider.js` - Direct canister provider
- [ ] Update/create UI components:
  - [ ] `Pay.jsx` - Main payment component
  - [ ] `Components/` - Standalone components
  - [ ] `PaymentForm.js` - Form component
  - [ ] `TokenSelector.js` - Token selection

## Data Type Mapping Reference

### Rust ↔ TypeScript
```rust
// Rust
String                    → string
u64                      → bigint  
u32                      → number
bool                     → boolean
Option<T>                → T | null
Vec<T>                   → T[]
Principal                → Principal
Result<T, String>        → { Ok?: T; Err?: string }
```

### Candid ↔ TypeScript
```candid
text                     → string
nat64                    → bigint
nat32                    → number
bool                     → boolean
opt T                    → [] | [T]
vec T                    → T[]
principal                → Principal
variant { Ok: T; Err: text } → { Ok?: T; Err?: string }
```

## Common Patterns Cheat Sheet

### Authorization Check
```rust
#[ic_cdk::update]
async fn protected_method() -> Result<(), String> {
    let caller = ic_cdk::caller();
    OWNER.with(|owner| {
        if owner.borrow().get() != caller {
            return Err("Unauthorized".to_string());
        }
        Ok(())
    })
}
```

### Service Method Pattern
```typescript
async operation(canisterId: string, param: Type): Promise<{ success: boolean; error?: string; data?: T }> {
  try {
    const actor = await this.getActor(canisterId);
    const result = await actor.operation(param);
    
    if ('Ok' in result) {
      return { success: true, data: result.Ok };
    } else {
      return { success: false, error: result.Err };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### React Hook Pattern
```jsx
const useFeature = (canisterId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getData(canisterId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [canisterId]);

  return { data, loading, error, fetchData };
};
```

## Troubleshooting Quick Fixes

### "Actor is undefined"
```javascript
// Ensure actor is initialized
if (!this.actor) {
  await this.initializeActor();
}
```

### "Principal format error"
```javascript
// Convert string to Principal
Principal.fromText(canisterId)

// Convert Principal to string
principal.toText()
```

### "Candid decode error"
- Check TypeScript interfaces match Rust structs exactly
- Verify optional fields use `[] | [T]` format for Candid opts
- Ensure BigInt usage for nat64 types

### "Memory allocation error"
- Check MemoryId is unique in `thread_local!` storage
- Verify stable storage initialization
- Check for memory manager conflicts

### "Build failures"
```bash
# Clean and rebuild
cargo clean
dfx build user_payment_canister

# Check dfx.json configuration
# Verify Cargo.toml workspace setup
```

## Testing Workflow

### 1. Backend Testing
```bash
# Deploy locally
dfx deploy user_payment_canister

# Test via dfx
dfx canister call user_payment_canister get_supported_tokens
```

### 2. Dashboard Testing
```bash
cd ckPayment-web3
npm run dev

# Test in browser at localhost:5173
# Check browser console for errors
```

### 3. SDK Testing
```bash
# Open test file
open test-sdk.html

# Check browser console
# Test payment flow integration
```

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

### Canister Stuck/Broken
```bash
# Stop canister
dfx canister stop user_payment_canister

# Reinstall with state preservation
dfx canister install user_payment_canister --mode reinstall

# Or upgrade if compatible
dfx canister install user_payment_canister --mode upgrade
```

### Reset Local Environment
```bash
# Stop replica
dfx stop

# Clean state
dfx start --clean

# Redeploy everything
dfx deploy
```

### Data Recovery
- Stable storage should preserve data across upgrades
- Always test upgrade paths in development
- Keep backups of critical canister states

## Performance Monitoring

### Canister Metrics
```bash
# Check canister status
dfx canister status user_payment_canister

# View logs
dfx canister logs user_payment_canister

# Monitor memory usage
# Check cycle consumption
```

### Frontend Metrics
- Browser DevTools Performance tab
- Network tab for API call timing
- React DevTools for component performance
- Monitor bundle size with build tools

Remember: Always refer to `FEATURE_DEVELOPMENT_GUIDE.md` for comprehensive guidance on implementing new features across all three components.
