use candid::{CandidType, Encode, Principal};
use ic_cdk::api::call::RejectionCode;
use ic_management_canister_types::{
    CanisterIdRecord, CanisterInstallMode, CanisterSettingsArgsBuilder, CreateCanisterArgs,
    InstallCodeArgs,
};
use ic_base_types::PrincipalId;
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use std::borrow::Cow;

use crate::{UserCanisterConfig, CanisterRecord, TokenConfig, state};

// Include the compiled user payment canister WASM
include!(concat!(env!("OUT_DIR"), "/user_payment_canister_wasm.rs"));

// ============================================================================
// CANISTER DEPLOYMENT LOGIC (following BOB patterns)
// ============================================================================

#[derive(Debug, Clone, PartialEq, Eq, CandidType)]
pub struct CallError {
    pub method: String,
    pub reason: Reason,
}

#[derive(Debug, Clone, PartialEq, Eq, CandidType)]
pub enum Reason {
    OutOfCycles,
    CanisterError(String),
    Rejected(String),
    TransientInternalError(String),
    InternalError(String),
}

impl Reason {
    fn from_reject(reject_code: RejectionCode, reject_message: String) -> Self {
        match reject_code {
            RejectionCode::SysTransient => Self::TransientInternalError(reject_message),
            RejectionCode::CanisterError => Self::CanisterError(reject_message),
            RejectionCode::CanisterReject => Self::Rejected(reject_message),
            RejectionCode::NoError
            | RejectionCode::SysFatal
            | RejectionCode::DestinationInvalid
            | RejectionCode::Unknown => Self::InternalError(format!(
                "rejection code: {:?}, rejection message: {}",
                reject_code, reject_message
            )),
        }
    }
}

async fn call<I, O>(method: &str, payment: u64, input: &I) -> Result<O, CallError>
where
    I: CandidType,
    O: CandidType + DeserializeOwned,
{
    let balance = ic_cdk::api::canister_balance128();
    if balance < payment as u128 {
        return Err(CallError {
            method: method.to_string(),
            reason: Reason::OutOfCycles,
        });
    }

    let res: Result<(O,), _> = ic_cdk::api::call::call_with_payment(
        Principal::management_canister(),
        method,
        (input,),
        payment,
    )
    .await;

    match res {
        Ok((output,)) => Ok(output),
        Err((code, msg)) => Err(CallError {
            method: method.to_string(),
            reason: Reason::from_reject(code, msg),
        }),
    }
}

/// Get embedded user canister WASM (following BOB pattern)
pub fn user_canister_wasm() -> Cow<'static, [u8]> {
    // Use the embedded WASM that was included at compile time
    if USER_PAYMENT_CANISTER_WASM.is_empty() {
        // Fall back to storage if embedded WASM is not available
        match state::get_user_canister_wasm() {
            Some(wasm) => Cow::Owned(wasm),
            None => Cow::Borrowed(&[]), // Empty WASM as fallback
        }
    } else {
        Cow::Borrowed(USER_PAYMENT_CANISTER_WASM)
    }
}

/// Create a new canister (following BOB pattern)
pub async fn create_canister(cycles_for_canister_creation: u64) -> Result<Principal, CallError> {
    let create_args = CreateCanisterArgs {
        settings: Some(CanisterSettingsArgsBuilder::new().build()),
        ..Default::default()
    };
    let result: CanisterIdRecord = call(
        "create_canister",
        cycles_for_canister_creation,
        &create_args,
    )
    .await?;

    Ok(result.get_canister_id().get().into())
}

/// Install code on a canister (following BOB pattern)
pub async fn install_code(
    canister_id: Principal,
    wasm_module: Vec<u8>,
    arg: Vec<u8>,
) -> Result<(), CallError> {
    let install_code = InstallCodeArgs {
        mode: CanisterInstallMode::Install,
        canister_id: PrincipalId::from(canister_id),
        wasm_module,
        arg,
        compute_allocation: None,
        memory_allocation: None,
        sender_canister_version: None,
    };

    call("install_code", 0, &install_code).await?;

    Ok(())
}

/// Upgrade code on an existing canister
pub async fn upgrade_code(
    canister_id: Principal,
    wasm_module: Vec<u8>,
    arg: Vec<u8>,
) -> Result<(), CallError> {
    let install_code = InstallCodeArgs {
        mode: CanisterInstallMode::Upgrade,
        canister_id: PrincipalId::from(canister_id),
        wasm_module,
        arg,
        compute_allocation: None,
        memory_allocation: None,
        sender_canister_version: None,
    };

    call("install_code", 0, &install_code).await?;

    Ok(())
}

/// Upgrade an existing user payment canister to the latest WASM
pub async fn upgrade_user_canister(
    canister_id: Principal,
    owner: Principal,
) -> Result<(), String> {
    // Get the WASM module
    let wasm = user_canister_wasm();
    if wasm.is_empty() {
        return Err("User canister WASM not available".to_string());
    }
    
    // For upgrade, we pass empty initialization args since we're preserving existing state
    let arg = vec![];

    // Upgrade the user payment canister code
    upgrade_code(canister_id, wasm.to_vec(), arg)
        .await
        .map_err(|e| format!("{} - {:?}", e.method, e.reason))?;

    Ok(())
}


/// Create a default user canister configuration
fn create_default_user_config() -> UserCanisterConfig {
    let default_token = TokenConfig {
        symbol: "ckBTC".to_string(),
        name: "Chain Key Bitcoin".to_string(),
        decimals: 8,
        canister_id: Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(),
        fee: 10,
        logo: None,
        is_active: true,
    };
    
    UserCanisterConfig {
        name: "Default Payment System".to_string(),
        description: "Default payment system configuration".to_string(),
        supported_tokens: vec![default_token],
        webhook: None,
        merchant_fee: 250, // 2.5%
        auto_withdraw: false,
        withdraw_threshold: None,
        custom_settings: vec![],
    }
}

/// Deploy a new user payment canister (following BOB's spawn_miner pattern)
pub async fn deploy_user_canister(
    config: UserCanisterConfig,
    owner: Principal,
) -> Result<Principal, String> {
    // Cycles for canister creation (4T cycles to match dfx deploy cost)
    // This includes: creation (2.5T) + WASM installation (1-1.5T) = ~4T total
    const CYCLES_FOR_CREATION: u64 = 4_000_000_000_000;
    
    // Get the WASM module
    let wasm = user_canister_wasm();
    if wasm.is_empty() {
        return Err("User canister WASM not available".to_string());
    }
    
    // Create hardcoded default configuration for user canister initialization
    let hardcoded_config = create_default_user_config();
    
    // Prepare the initialization argument with hardcoded values
    let arg = Encode!(&hardcoded_config, &owner)
        .map_err(|e| format!("Failed to encode canister arguments: {:?}", e))?;

    // Create the canister
    let canister_id = create_canister(CYCLES_FOR_CREATION)
        .await
        .map_err(|e| format!("{} - {:?}", e.method, e.reason))?;

    // Install the user payment canister code
    install_code(canister_id, wasm.to_vec(), arg)
        .await
        .map_err(|e| format!("{} - {:?}", e.method, e.reason))?;

    Ok(canister_id)
}

/// Create a canister record for tracking
pub fn create_canister_record(
    canister_id: Principal,
    owner: Principal,
    config: &UserCanisterConfig,
) -> CanisterRecord {
    let version = state::get_next_canister_version();
    
    CanisterRecord {
        id: canister_id,
        owner,
        name: config.name.clone(),
        description: config.description.clone(),
        version,
        created_at: ic_cdk::api::time(),
        last_updated: ic_cdk::api::time(),
        is_active: true,
        supported_tokens: config.supported_tokens.clone(),
    }
}

/// Complete canister deployment process
pub async fn complete_canister_deployment(
    config: UserCanisterConfig,
    caller: Principal,
) -> Result<Principal, String> {
    // Validate caller is not anonymous
    if caller == Principal::anonymous() {
        return Err("Cannot deploy anonymously".to_string());
    }

    // Check user doesn't have too many canisters (max 5)
    let existing_canisters = state::get_owner_canisters(&caller);
    if existing_canisters.len() >= 5 {
        return Err("Maximum number of canisters reached (5)".to_string());
    }

    // Validate configuration
    validate_canister_config(&config)?;

    // Deploy the canister
    let canister_id = deploy_user_canister(config.clone(), caller).await?;

    // Create and store the canister record
    let record = create_canister_record(canister_id, caller, &config);
    
    // Update storage
    state::add_user_canister(canister_id, record);
    state::add_canister_to_owner(caller, canister_id);
    state::increment_total_canisters();

    Ok(canister_id)
}

/// Validate user canister configuration
fn validate_canister_config(config: &UserCanisterConfig) -> Result<(), String> {
    if config.name.is_empty() || config.name.len() > 50 {
        return Err("Name must be between 1 and 50 characters".to_string());
    }

    if config.description.len() > 200 {
        return Err("Description must be less than 200 characters".to_string());
    }

    if config.supported_tokens.is_empty() {
        return Err("At least one supported token is required".to_string());
    }

    // Validate token configurations
    for token in &config.supported_tokens {
        if token.symbol.is_empty() {
            return Err("Token symbol cannot be empty".to_string());
        }
        if token.name.is_empty() {
            return Err("Token name cannot be empty".to_string());
        }
        if token.canister_id == Principal::anonymous() {
            return Err("Token canister ID cannot be anonymous".to_string());
        }
    }

    // Validate merchant fee (max 10% = 1000 basis points)
    if config.merchant_fee > 1000 {
        return Err("Merchant fee cannot exceed 10%".to_string());
    }

    Ok(())
}

/// Get canister information by ID
pub fn get_canister_info(canister_id: Principal) -> Option<CanisterRecord> {
    state::get_user_canister(&canister_id)
}

/// Get all canisters owned by a user
pub fn get_user_canisters(owner: Principal) -> Vec<CanisterRecord> {
    let canister_ids = state::get_owner_canisters(&owner);
    
    let mut results = Vec::new();
    for id in canister_ids {
        if let Some(record) = state::get_user_canister(&id) {
            results.push(record);
        }
    }
    results
}

/// Get all active canisters
pub fn get_all_active_canisters() -> Vec<CanisterRecord> {
    state::get_active_canisters()
}

/// Find canisters by token support
pub fn find_canisters_by_token(token_symbol: String) -> Vec<CanisterRecord> {
    state::find_canisters_by_token_symbol(&token_symbol)
}

/// Set the WASM module for user canisters (admin only)
pub fn set_user_canister_wasm(wasm: Vec<u8>, caller: Principal) -> Result<(), String> {
    if !is_admin(caller) {
        return Err("Only admin can set WASM".to_string());
    }

    state::set_user_canister_wasm(wasm);
    Ok(())
}

/// Check if caller is admin
fn is_admin(caller: Principal) -> bool {
    caller.to_text() == "ouuvn-c7hpi-46km4-ywlnr-j2ten-wldfi-xu53v-vth6u-3qtqr-cmbxu-gqe"
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::TokenConfig;

    fn create_test_token_config() -> TokenConfig {
        TokenConfig {
            symbol: "ckBTC".to_string(),
            name: "Chain Key Bitcoin".to_string(),
            decimals: 8,
            canister_id: Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(),
            fee: 10,
            logo: None,
            is_active: true,
        }
    }

    fn create_test_config() -> UserCanisterConfig {
        UserCanisterConfig {
            name: "Test Payment System".to_string(),
            description: "Test description".to_string(),
            supported_tokens: vec![create_test_token_config()],
            webhook: None,
            merchant_fee: 250, // 2.5%
            auto_withdraw: false,
            withdraw_threshold: None,
            custom_settings: vec![],
        }
    }

    #[test]
    fn test_validate_canister_config_valid() {
        let config = create_test_config();
        assert!(validate_canister_config(&config).is_ok());
    }

    #[test]
    fn test_validate_canister_config_empty_name() {
        let mut config = create_test_config();
        config.name = "".to_string();
        assert!(validate_canister_config(&config).is_err());
    }

    #[test]
    fn test_validate_canister_config_long_name() {
        let mut config = create_test_config();
        config.name = "a".repeat(51);
        assert!(validate_canister_config(&config).is_err());
    }

    #[test]
    fn test_validate_canister_config_no_tokens() {
        let mut config = create_test_config();
        config.supported_tokens = vec![];
        assert!(validate_canister_config(&config).is_err());
    }

    #[test]
    fn test_validate_canister_config_high_fee() {
        let mut config = create_test_config();
        config.merchant_fee = 1001; // Over 10%
        assert!(validate_canister_config(&config).is_err());
    }
}
