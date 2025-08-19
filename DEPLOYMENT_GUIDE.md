# ckPayment Deployment Guide

## User Payment Canister WASM Update Flow

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

## Deployment Debugging

### Problem: New methods missing after upgrade

**Root Causes & Solutions:**

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

## Common Deployment Commands

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

### Production Deployment
```bash
# Deploy to IC mainnet
dfx deploy --network ic

# Check mainnet canister status
dfx canister status CANISTER_ID --network ic

# View mainnet logs
dfx canister logs CANISTER_ID --network ic
```

## Factory Canister Management

### Get Factory Status
```bash
# Check WASM status
dfx canister call payment_backend get_wasm_status --network ic

# Get factory stats
dfx canister call payment_backend get_factory_stats --network ic

# List all user canisters
dfx canister call payment_backend get_all_active_canisters --network ic
```

### Admin Operations
```bash
# Upgrade user canister
dfx canister call payment_backend admin_upgrade_user_canister '(principal "CANISTER_ID")' --network ic

# Add controller to canister
dfx canister call payment_backend admin_add_controller '(principal "CANISTER_ID", principal "NEW_CONTROLLER")' --network ic

# Transfer canister ownership (factory records only)
dfx canister call payment_backend admin_transfer_canister_ownership '(principal "CANISTER_ID", principal "NEW_OWNER")' --network ic
```

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

### Cycle Management
```bash
# Check cycles balance
dfx canister status CANISTER_ID --network ic

# Top up cycles if needed
dfx canister deposit-cycles AMOUNT CANISTER_ID --network ic
```

## Canister IDs

### Testing Environment
- **Factory Backend**: `zdfvs-baaaa-aaaag-acoeq-cai`
- **Test User Canister**: `6tzcr-tqaaa-aaaag-aufoa-cai`

### Identity Management
- **Testing Principal**: `ouuvn-c7hpi-46km4-ywlnr-j2ten-wldfi-xu53v-vth6u-3qtqr-cmbxu-gqe`
- **Original Owner**: `sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae`
