# ckPayment Testing Guide

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

## Testing Principals

**Testing Principal**: `6tzcr-tqaaa-aaaag-aufoa-cai`
**Original Owner**: `sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae`
