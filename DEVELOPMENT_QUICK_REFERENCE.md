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

**CRITICAL**: This process must be followed exactly to ensure new features are properly deployed.

```bash
# 1. Add #[ic_cdk::post_upgrade] hook to user payment canister (REQUIRED for upgrades)
# Ensure post_upgrade() function exists in src/user_payment_canister/src/lib.rs:
# #[ic_cdk::post_upgrade]
# fn post_upgrade() {
#     // After upgrade, stable storage is automatically restored
#     // This hook ensures all memory managers and storage are properly initialized
# }

# 2. Build user payment canister with new features
cargo build --target wasm32-unknown-unknown --release --manifest-path src/user_payment_canister/Cargo.toml

# 3. Optimize WASM and regenerate Candid interface from WASM (CRITICAL STEP)
ic-wasm target/wasm32-unknown-unknown/release/user_payment_canister.wasm -o user_payment_canister_optimized.wasm shrink
candid-extractor user_payment_canister_optimized.wasm > src/user_payment_canister/user_payment_canister.did

# 4. VERIFY the .did file contains your new methods
grep -n "your_new_method_name" src/user_payment_canister/user_payment_canister.did

# 5. Copy optimized WASM and updated .did file to factory backend
cp user_payment_canister_optimized.wasm src/payment_backend/user_payment_canister.wasm
cp src/user_payment_canister/user_payment_canister.did src/payment_backend/user_payment_canister.did

# 6. IMPORTANT: Clean factory backend build cache to force rebuild
cargo clean --manifest-path src/payment_backend/Cargo.toml

# 7. Rebuild factory backend to embed new WASM and .did file
cargo build --target wasm32-unknown-unknown --release --manifest-path src/payment_backend/Cargo.toml
# VERIFY: Look for "Found user payment canister WASM at: user_payment_canister.wasm" in build output

# 8. Deploy factory backend with new embedded WASM and .did file
dfx deploy payment_backend --network ic

# 9. Upgrade existing user payment canisters via factory admin method
dfx canister call payment_backend admin_upgrade_user_canister '(principal "CANISTER_ID")' --network ic

# 10. Test that new methods are available
dfx canister call CANISTER_ID your_new_method_name --network ic
```

**DEBUGGING NOTES:**

**Problem**: New methods missing after upgrade
**Root Causes & Solutions**:

1. **Factory build.rs not finding manually placed WASM**:
   - The factory's build.rs looks for WASM in specific paths
   - Ensure `src/payment_backend/build.rs` includes `"user_payment_canister.wasm"` as first priority path
   - Always `cargo clean` factory backend before rebuild

2. **Missing post_upgrade hook**:
   - User payment canister MUST have `#[ic_cdk::post_upgrade]` function
   - Without this, canister state may not initialize correctly after upgrade

3. **Candid interface not regenerated from WASM**:
   - ALWAYS regenerate .did file from the optimized WASM using `candid-extractor`
   - Never manually edit .did files
   - Verify your methods appear in the generated .did file

4. **Upgrade arguments issue**:
   - Factory upgrade method must use `Encode!()` for proper candid encoding
   - Empty arguments should be `Encode!()` not `vec![]`

**Testing Principal**: `6tzcr-tqaaa-aaaag-aufoa-cai`

## CRUD Testing Workflow

**IMPORTANT**: For testing new features that require owner permissions, follow this exact workflow:

### Testing Setup
```bash
# 1. Get your current dfx identity principal
TEST_PRINCIPAL=$(dfx identity get-principal --network ic)
echo "Test Principal: $TEST_PRINCIPAL"

# 2. CRITICAL: DISCOVER AVAILABLE METHODS FIRST (avoid guessing method names)
# Check the current .did file to see actual method names:
grep -A 50 "service :" src/user_payment_canister/user_payment_canister.did
# OR check what methods are actually available on deployed canister:
dfx canister metadata CANISTER_ID candid:service --network ic

# 3. CRITICAL: Change canister owner in the USER PAYMENT CANISTER (not factory)
# Use the user payment canister's admin_update_owner method:
dfx canister call CANISTER_ID admin_update_owner "(principal \"$TEST_PRINCIPAL\")" --network ic

# 4. Verify ownership change
dfx canister call CANISTER_ID get_owner --network ic
```

**IMPORTANT DISCOVERY**: 
- The factory has `admin_transfer_canister_ownership` but this ONLY changes ownership in factory records
- For actual canister ownership (needed for admin methods), use the user payment canister's `admin_update_owner`
- Both methods exist but serve different purposes:
  - Factory method: Updates factory tracking records
  - User canister method: Updates actual canister owner for authorization

### CRUD Testing Commands
```bash
# Create operations
dfx canister call CANISTER_ID create_method_name '(parameters)' --network ic

# Read operations  
dfx canister call CANISTER_ID list_method_name --network ic
dfx canister call CANISTER_ID get_method_name '("id")' --network ic

# Update operations
dfx canister call CANISTER_ID update_method_name '("id", updated_data)' --network ic

# Delete operations
dfx canister call CANISTER_ID delete_method_name '("id")' --network ic
```

### Complete CRUD Testing Example - Discount Coupon System

**PROVEN WORKING EXAMPLE** (Tested 2025-08-17):

```bash
# Setup
TEST_PRINCIPAL=$(dfx identity get-principal --network ic)
CANISTER_ID="6tzcr-tqaaa-aaaag-aufoa-cai"
ORIGINAL_OWNER="sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae"

# 1. Discover methods (CRITICAL STEP)
grep -A 50 "service :" src/user_payment_canister/user_payment_canister.did

# 2. Change owner for testing
dfx canister call $CANISTER_ID admin_update_owner "(principal \"$TEST_PRINCIPAL\")" --network ic

# 3. CREATE - Create test coupon
dfx canister call $CANISTER_ID create_coupon '(
  record {
    coupon_id = "TEST001";
    code = "TESTSAVE20";
    description = "20% off test coupon";
    coupon_type = variant { Percentage = 20 : nat32 };
    usage_limit = opt (5 : nat32);
    expires_at = opt (1800000000000000000 : nat64);
    minimum_amount = opt (100000000 : nat64);
    applicable_tokens = vec { "ckBTC" };
    is_active = true;
    used_count = 0 : nat32;
    created_at = 1755392000000000000 : nat64;
    updated_at = 1755392000000000000 : nat64;
  }
)' --network ic
# Returns: (variant { 17_724 = "coupon_1" })

# 4. READ - List active coupons
dfx canister call $CANISTER_ID list_active_coupons --network ic
# Returns: (vec { record { ... } })

# 5. READ - Get specific coupon
dfx canister call $CANISTER_ID get_coupon '("coupon_1")' --network ic
# Returns: (variant { 17_724 = record { ... } })

# 6. READ - Get by code
dfx canister call $CANISTER_ID get_coupon_by_code '("TESTSAVE20")' --network ic
# Returns: (variant { 17_724 = record { ... } })

# 7. UPDATE - Toggle status
dfx canister call $CANISTER_ID toggle_coupon_status '("coupon_1")' --network ic
# Returns: (variant { 17_724 = false }) - now inactive

dfx canister call $CANISTER_ID toggle_coupon_status '("coupon_1")' --network ic
# Returns: (variant { 17_724 = true }) - now active again

# 8. UPDATE - Update coupon details
dfx canister call $CANISTER_ID update_coupon '("coupon_1", 
  record {
    coupon_id = "coupon_1";
    code = "TESTSAVE30";
    description = "UPDATED: 30% off test coupon";
    coupon_type = variant { Percentage = 30 : nat32 };
    usage_limit = opt (10 : nat32);
    expires_at = opt (1800000000000000000 : nat64);
    minimum_amount = opt (50000000 : nat64);
    applicable_tokens = vec { "ckBTC"; "ckETH" };
    is_active = true;
    used_count = 0 : nat32;
    created_at = 1755392000000000000 : nat64;
    updated_at = 1755395000000000000 : nat64;
  }
)' --network ic
# Returns: (variant { 17_724 })

# 9. READ - Verify updates
dfx canister call $CANISTER_ID get_coupon '("coupon_1")' --network ic
# Verify: code is "TESTSAVE30", percentage is 30, etc.

# 10. STATS - Check usage statistics
dfx canister call $CANISTER_ID get_coupon_usage_stats '("coupon_1")' --network ic
# Returns: (variant { 17_724 = record { 0 : nat32; vec {} } })

# 11. CREATE - Create second coupon for deletion test
dfx canister call $CANISTER_ID create_coupon '(
  record {
    coupon_id = "TEST002";
    code = "FIXEDDISCOUNT";
    description = "Fixed 0.01 ckBTC discount";
    coupon_type = variant { FixedAmount = 1000000 : nat64 };
    usage_limit = opt (3 : nat32);
    expires_at = opt (1900000000000000000 : nat64);
    minimum_amount = opt (5000000 : nat64);
    applicable_tokens = vec { "ckBTC" };
    is_active = true;
    used_count = 0 : nat32;
    created_at = 1755392000000000000 : nat64;
    updated_at = 1755392000000000000 : nat64;
  }
)' --network ic
# Returns: (variant { 17_724 = "coupon_2" })

# 12. DELETE - Delete second coupon
dfx canister call $CANISTER_ID delete_coupon '("coupon_2")' --network ic
# Returns: (variant { 17_724 })

# 13. VERIFY DELETE
dfx canister call $CANISTER_ID get_coupon '("coupon_2")' --network ic
# Returns: (variant { 3_456_837 = "Coupon not found" })

# 14. CLEANUP - Clear all test data
dfx canister call $CANISTER_ID admin_clear_all_coupons --network ic
# Returns: (variant { 17_724 = 1 : nat32 }) - cleared 1 coupon

# 15. VERIFY CLEANUP
dfx canister call $CANISTER_ID list_active_coupons --network ic
# Returns: (vec {}) - empty

# 16. RESTORE ORIGINAL OWNER (CRITICAL!)
dfx canister call $CANISTER_ID admin_update_owner "(principal \"$ORIGINAL_OWNER\")" --network ic
# Returns: (variant { 17_724 })

# 17. VERIFY OWNER RESTORATION
dfx canister call $CANISTER_ID get_owner --network ic
# Returns: (principal "sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae")
```

**SUCCESS INDICATORS:**
- ✅ All methods return success variants (usually `17_724`)
- ✅ Error variants (like `3_456_837`) only for expected failures
- ✅ Data persists between operations
- ✅ Updates reflect in subsequent reads
- ✅ Cleanup removes all test data
- ✅ Original owner successfully restored

### Testing Cleanup
```bash
# 1. Clear all test data (use admin cleanup methods)
dfx canister call CANISTER_ID admin_clear_all_feature_data --network ic

# 2. CRITICAL: Restore original owner
ORIGINAL_OWNER="sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae"
dfx canister call CANISTER_ID admin_update_owner "(principal \"$ORIGINAL_OWNER\")" --network ic

# 3. Verify owner restoration
dfx canister call CANISTER_ID get_owner --network ic
```

**NEVER FORGET**: Always restore the original owner `sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae` after testing!

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
