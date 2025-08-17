# ckPayment Troubleshooting Guide

## Common Issues and Solutions

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

## Method Discovery Issues

### "Canister has no update method"
**Problem**: Trying to call methods that don't exist or have different names
**Solution**: Always discover methods first
```bash
# Check actual method names in .did file
grep -A 50 "service :" src/user_payment_canister/user_payment_canister.did

# Or check deployed canister metadata (if available)
dfx canister metadata CANISTER_ID candid:service --network ic
```

### "Wrong method signature"
**Problem**: Using incorrect parameter types or structure
**Solution**: Check the exact Candid types
```bash
# Find the type definition in .did file
grep -B 5 -A 10 "method_name" src/user_payment_canister/user_payment_canister.did
```

## Authorization Issues

### "Unauthorized" errors
**Problem**: Method requires owner permissions but caller is not owner
**Solutions**:
```bash
# Check current owner
dfx canister call CANISTER_ID get_owner --network ic

# Check current caller
dfx canister call CANISTER_ID whoami --network ic

# Change owner for testing (temporary)
dfx canister call CANISTER_ID admin_update_owner "(principal \"YOUR_PRINCIPAL\")" --network ic

# ALWAYS restore original owner after testing
dfx canister call CANISTER_ID admin_update_owner "(principal \"ORIGINAL_OWNER\")" --network ic
```

### Factory vs User Canister Ownership
**Problem**: Changing factory ownership instead of user canister ownership
**Solution**: Use the correct method for each
```bash
# Factory ownership (tracking only)
dfx canister call factory_id admin_transfer_canister_ownership "(principal \"CANISTER_ID\", principal \"NEW_OWNER\")" --network ic

# User canister ownership (actual authorization)
dfx canister call CANISTER_ID admin_update_owner "(principal \"NEW_OWNER\")" --network ic
```

## Deployment Issues

### "New methods missing after upgrade"
**Root Causes & Solutions**:

1. **Factory build.rs not finding manually placed WASM**:
```bash
# Ensure WASM is in correct location
ls -la src/payment_backend/user_payment_canister.wasm

# Clean factory cache and rebuild
cargo clean --manifest-path src/payment_backend/Cargo.toml
cargo build --target wasm32-unknown-unknown --release --manifest-path src/payment_backend/Cargo.toml
# Look for: "Found user payment canister WASM at: user_payment_canister.wasm"
```

2. **Missing post_upgrade hook**:
```rust
// Must exist in src/user_payment_canister/src/lib.rs
#[ic_cdk::post_upgrade]
fn post_upgrade() {
    // Stable storage initialization happens automatically
    // This hook ensures proper initialization after upgrade
}
```

3. **Candid interface not regenerated from WASM**:
```bash
# ALWAYS regenerate .did from optimized WASM
ic-wasm target/wasm32-unknown-unknown/release/user_payment_canister.wasm -o user_payment_canister_optimized.wasm shrink
candid-extractor user_payment_canister_optimized.wasm > src/user_payment_canister/user_payment_canister.did

# Verify methods are in generated .did
grep -n "your_method_name" src/user_payment_canister/user_payment_canister.did
```

### "Canister has no wasm module"
**Problem**: Canister exists but has no code deployed
**Solutions**:
```bash
# Check canister status
dfx canister status CANISTER_ID --network ic
# Look for "Module hash: None" - indicates no WASM

# Deploy via factory upgrade
dfx canister call factory_id admin_upgrade_user_canister "(principal \"CANISTER_ID\")" --network ic
```

### "Upgrade arguments issue"
**Problem**: Factory upgrade fails due to encoding issues
**Solution**: Use proper Candid encoding
```rust
// In factory upgrade code, use Encode!() for empty args
let args = Encode!().unwrap();
// NOT vec![]
```

## Network and Connection Issues

### "Failed to connect to replica"
```bash
# Check network configuration
dfx ping --network ic

# Verify identity
dfx identity whoami

# Check identity principal
dfx identity get-principal --network ic
```

### "Request timed out"
```bash
# Increase timeout in dfx.json
{
  "networks": {
    "ic": {
      "providers": ["https://ic0.app"],
      "type": "persistent",
      "timeout": 60000
    }
  }
}
```

## State and Storage Issues

### "Stable storage not persisting"
**Problem**: Data lost after upgrade
**Solutions**:
```rust
// Ensure proper MemoryId usage - must be unique
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    // Each storage needs unique MemoryId
    static STORAGE_A: RefCell<StableBTreeMap<String, TypeA, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))))
    );
    
    static STORAGE_B: RefCell<StableBTreeMap<String, TypeB, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))))
    );
}
```

### "Memory conflicts"
**Problem**: Multiple storages using same MemoryId
**Solution**: Audit all MemoryIds in your canister
```bash
# Search for all MemoryId usage
grep -r "MemoryId::new" src/user_payment_canister/src/
```

## Frontend Integration Issues

### "Cannot fetch candid interface"
**Warning**: `Cannot fetch Candid interface for method_name`
**This is normal**: dfx infers types when .did metadata isn't embedded
**No action needed**: Commands will still work

### "Type mismatch in frontend"
**Problem**: TypeScript types don't match Candid interface
**Solution**: Regenerate declarations
```bash
dfx generate user_payment_canister
```

### "Actor initialization fails"
```typescript
// Ensure proper actor initialization
const createActor = (canisterId: string, options?: CreateActorOptions) => {
  const agent = new HttpAgent({
    host: options?.agentOptions?.host || 'https://ic0.app',
    identity: options?.agentOptions?.identity,
  });

  // Only fetch root key in development
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey();
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
```

## Testing Issues

### "Test data not cleaned up"
**Problem**: Previous test data interferes with new tests
**Solution**: Always clean up test data
```bash
# Use admin cleanup methods
dfx canister call CANISTER_ID admin_clear_all_coupons --network ic
dfx canister call CANISTER_ID admin_clear_all_feature_data --network ic
```

### "Owner not restored after testing"
**Problem**: Test ownership changes aren't reverted
**Solution**: Always restore original owner
```bash
ORIGINAL_OWNER="sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae"
dfx canister call CANISTER_ID admin_update_owner "(principal \"$ORIGINAL_OWNER\")" --network ic

# Verify restoration
dfx canister call CANISTER_ID get_owner --network ic
```

## Performance Issues

### "High cycle consumption"
**Causes & Solutions**:
1. **Inefficient queries**: Use paginated results
2. **Large data operations**: Process in batches
3. **Frequent storage writes**: Cache updates in memory

### "Slow response times"
**Causes & Solutions**:
1. **Large result sets**: Implement pagination
2. **Complex computations**: Move to query methods when possible
3. **Network latency**: Use local replica for development

## Git and Version Control Issues

### "Merge conflicts in generated files"
**Problem**: Conflicts in .did files or declarations
**Solution**: Regenerate after merge
```bash
# After resolving merge conflicts
cargo build --target wasm32-unknown-unknown --release --manifest-path src/user_payment_canister/Cargo.toml
ic-wasm target/wasm32-unknown-unknown/release/user_payment_canister.wasm -o user_payment_canister_optimized.wasm shrink
candid-extractor user_payment_canister_optimized.wasm > src/user_payment_canister/user_payment_canister.did
```

### "Large binary files in git"
**Problem**: WASM files are tracked in git
**Solution**: Use git LFS or exclude from tracking
```bash
# Add to .gitignore
*.wasm
user_payment_canister_optimized.wasm
```

## Emergency Recovery

### "Canister stuck or broken"
```bash
# Stop canister
dfx canister stop CANISTER_ID --network ic

# Reinstall with state preservation (if possible)
dfx canister install CANISTER_ID --mode reinstall --network ic

# Or upgrade if compatible
dfx canister install CANISTER_ID --mode upgrade --network ic
```

### "Complete environment reset"
```bash
# Local development reset
dfx stop
dfx start --clean
dfx deploy

# Mainnet: Cannot reset - work with existing state
```

### "Lost access to canister"
**Problem**: Owner lost or identity changed
**Solution**: Use controller identity
```bash
# Check controllers
dfx canister info CANISTER_ID --network ic

# Use controller identity
dfx identity use controller-identity
dfx canister call CANISTER_ID admin_update_owner "(principal \"NEW_OWNER\")" --network ic
```

## Debugging Tips

### Enable detailed logging
```bash
# Set log level
export RUST_LOG=debug
dfx start --verbose

# Check canister logs
dfx canister logs CANISTER_ID --network ic
```

### Check canister status frequently
```bash
# Monitor canister health
dfx canister status CANISTER_ID --network ic

# Watch for:
# - Memory usage growth
# - Cycle consumption
# - Module hash changes
# - Controller changes
```

### Verify method signatures
```bash
# Before calling methods, verify signatures
grep -A 5 "method_name" src/user_payment_canister/user_payment_canister.did
```
