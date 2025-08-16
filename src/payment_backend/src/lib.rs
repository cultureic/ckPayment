use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    BTreeMap as StableBTreeMap,
    Cell,
    DefaultMemoryImpl,
    Storable,
};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

// Module declarations
pub mod factory;
pub mod state;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// ============================================================================
// CORE TYPES FOR FACTORY SYSTEM
// ============================================================================

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TokenConfig {
    pub symbol: String,
    pub name: String,
    pub decimals: u8,
    pub canister_id: Principal,
    pub fee: u64,
    pub logo: Option<String>,
    pub is_active: bool,
}

impl Storable for TokenConfig {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UserCanisterConfig {
    pub name: String,
    pub description: String,
    pub supported_tokens: Vec<TokenConfig>,
    pub webhook: Option<String>,
    pub merchant_fee: u32,     // basis points (e.g., 250 = 2.5%)
    pub auto_withdraw: bool,
    pub withdraw_threshold: Option<u64>,
    pub custom_settings: Vec<(String, String)>,
}

impl Storable for UserCanisterConfig {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterRecord {
    pub id: Principal,
    pub owner: Principal,
    pub name: String,
    pub description: String,
    pub version: u64,
    pub created_at: u64,
    pub last_updated: u64,
    pub is_active: bool,
    pub supported_tokens: Vec<TokenConfig>,
}

impl Storable for CanisterRecord {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FactoryStats {
    pub total_canisters: u64,
    pub active_canisters: u64,
    pub total_users: u64,
    pub current_version: u64,
}

impl Storable for FactoryStats {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Vector wrapper for stable storage
#[derive(CandidType, Deserialize, Serialize, Clone, Debug, Default)]
pub struct StableVecPrincipal(pub Vec<Principal>);

impl Storable for StableVecPrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StableVecPrincipal(Decode!(bytes.as_ref(), Vec<Principal>).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}


// ============================================================================
// STABLE STORAGE SETUP
// ============================================================================

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    // Factory system storage
    pub static USER_CANISTERS: RefCell<StableBTreeMap<Principal, CanisterRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(10))))
    );

    pub static CANISTER_BY_OWNER: RefCell<StableBTreeMap<Principal, StableVecPrincipal, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(11))))
    );

    pub static NEXT_CANISTER_VERSION: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(13))), 1u64).unwrap()
    );

    pub static FACTORY_STATS: RefCell<Cell<FactoryStats, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(14))), FactoryStats {
            total_canisters: 0,
            active_canisters: 0,
            total_users: 0,
            current_version: 0,
        }).unwrap()
    );

    // User canister WASM storage (admin controlled)
    pub static USER_CANISTER_WASM: RefCell<Cell<Option<Vec<u8>>, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(15))), None).unwrap()
    );
}

// ============================================================================
// ADMIN CONFIGURATION
// ============================================================================

const ADMIN_PRINCIPAL: &str = "ouuvn-c7hpi-46km4-ywlnr-j2ten-wldfi-xu53v-vth6u-3qtqr-cmbxu-gqe"; // Current identity as admin

fn is_admin(caller: Principal) -> bool {
    caller.to_text() == ADMIN_PRINCIPAL
}

// ============================================================================
// FACTORY CANISTER METHODS (BOB PATTERN)
// ============================================================================

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}! This is the ckPayment Factory Canister with BOB pattern.", name)
}

#[ic_cdk::update]
async fn deploy_user_payment_canister(config: UserCanisterConfig) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // Use the factory logic to deploy a real canister
    let canister_id = factory::complete_canister_deployment(config.clone(), caller).await?;
    
    Ok(format!("Successfully deployed user payment canister '{}' with ID: {}", config.name, canister_id))
}

#[ic_cdk::query]
fn get_canister_info(canister_id: Principal) -> Option<CanisterRecord> {
    USER_CANISTERS.with(|c| c.borrow().get(&canister_id))
}

#[ic_cdk::query]
fn get_user_canisters(owner: Principal) -> Vec<CanisterRecord> {
    let canister_ids = CANISTER_BY_OWNER.with(|c| c.borrow().get(&owner).unwrap_or_default().0);
    
    let mut results = Vec::new();
    for id in canister_ids {
        if let Some(record) = USER_CANISTERS.with(|c| c.borrow().get(&id)) {
            results.push(record);
        }
    }
    results
}

#[ic_cdk::query] 
fn get_all_active_canisters() -> Vec<CanisterRecord> {
    USER_CANISTERS.with(|c| {
        c.borrow()
            .iter()
            .filter(|(_, record)| record.is_active)
            .map(|(_, record)| record)
            .collect()
    })
}

#[ic_cdk::query]
fn find_canisters_by_token(token_symbol: String) -> Vec<CanisterRecord> {
    USER_CANISTERS.with(|c| {
        c.borrow()
            .iter()
            .filter(|(_, record)| {
                record.is_active && record.supported_tokens.iter().any(|token| token.symbol == token_symbol)
            })
            .map(|(_, record)| record)
            .collect()
    })
}

#[ic_cdk::query]
fn get_factory_stats() -> FactoryStats {
    FACTORY_STATS.with(|s| s.borrow().get().clone())
}


// ============================================================================
// ADMIN METHODS
// ============================================================================

#[ic_cdk::update]
fn set_user_canister_wasm(wasm: Vec<u8>) -> Result<(), String> {
    if !is_admin(ic_cdk::caller()) {
        return Err("Only admin can set WASM".to_string());
    }

    USER_CANISTER_WASM.with(|w| w.borrow_mut().set(Some(wasm)).unwrap());
    Ok(())
}


#[ic_cdk::update]
async fn admin_upgrade_user_canister(canister_id: Principal) -> Result<String, String> {
    if !is_admin(ic_cdk::caller()) {
        return Err("Only admin can upgrade canisters".to_string());
    }

    // Get the canister record to verify it exists and get the owner
    let canister_record = USER_CANISTERS.with(|c| c.borrow().get(&canister_id))
        .ok_or("Canister not found in factory records")?;

    // Upgrade the canister using the factory logic
    factory::upgrade_user_canister(canister_id, canister_record.owner).await
        .map_err(|e| format!("Failed to upgrade canister: {}", e))?;

    // Update the canister record's last_updated timestamp and increment version
    USER_CANISTERS.with(|c| {
        let mut map = c.borrow_mut();
        if let Some(mut record) = map.get(&canister_id) {
            record.last_updated = ic_cdk::api::time();
            record.version += 1;
            map.insert(canister_id, record);
        }
    });

    Ok(format!("Successfully upgraded user payment canister: {}", canister_id))
}

#[ic_cdk::update]
async fn admin_add_controller(canister_id: Principal, new_controller: Principal) -> Result<String, String> {
    if !is_admin(ic_cdk::caller()) {
        return Err("Only admin can add controllers".to_string());
    }

    // Verify the canister exists in our records
    let _canister_record = USER_CANISTERS.with(|c| c.borrow().get(&canister_id))
        .ok_or("Canister not found in factory records")?;

    // Use IC management canister to add controller
    use ic_cdk::api::management_canister::main::{canister_status, update_settings, UpdateSettingsArgument, CanisterSettings, CanisterIdRecord};

    // Get current status to preserve existing controllers
    let status_args = CanisterIdRecord {
        canister_id,
    };
    
    let status_result = canister_status(status_args).await
        .map_err(|e| format!("Failed to get canister status: {:?}", e))?;

    // Get current controllers and add the new one if not already present
    let mut controllers = status_result.0.settings.controllers;
    
    if !controllers.contains(&new_controller) {
        controllers.push(new_controller);
        
        // Update settings with new controllers
        let update_args = UpdateSettingsArgument {
            canister_id,
            settings: CanisterSettings {
                controllers: Some(controllers),
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                log_visibility: None,
                reserved_cycles_limit: None,
                wasm_memory_limit: None,
            },
        };
        
        update_settings(update_args).await
            .map_err(|e| format!("Failed to update settings: {:?}", e))?;
            
        Ok(format!("Successfully added controller {} to canister {}", new_controller, canister_id))
    } else {
        Ok(format!("Controller {} is already a controller of canister {}", new_controller, canister_id))
    }
}



// ============================================================================
// UTILITY METHODS
// ============================================================================

#[ic_cdk::query]
fn whoami() -> Principal {
    ic_cdk::caller()
}

#[ic_cdk::query] 
fn canister_id() -> Principal {
    ic_cdk::id()
}

#[ic_cdk::query]
fn get_wasm_status() -> String {
    // Check the embedded WASM first (from build script)
    let embedded_wasm = factory::user_canister_wasm();
    if !embedded_wasm.is_empty() {
        format!("User canister WASM is embedded at compile time ({} bytes) and ready for deployment", embedded_wasm.len())
    } else {
        // Fall back to checking runtime storage
        let has_runtime_wasm = USER_CANISTER_WASM.with(|w| w.borrow().get().is_some());
        if has_runtime_wasm {
            "User canister WASM is loaded in runtime storage and ready for deployment".to_string()
        } else {
            "User canister WASM not available. Either embedded WASM is missing or admin needs to upload WASM.".to_string()
        }
    }
}

// ============================================================================
// ADMIN CANISTER MANAGEMENT METHODS
// ============================================================================

#[ic_cdk::update]
fn admin_remove_canister_record(canister_id: Principal) -> Result<(), String> {
    if !is_admin(ic_cdk::caller()) {
        return Err("Only admin can remove canister records".to_string());
    }

    // Get the canister record to find its owner
    let canister_record = USER_CANISTERS.with(|c| c.borrow().get(&canister_id));
    
    if let Some(record) = canister_record {
        let owner = record.owner;
        
        // Remove from USER_CANISTERS
        USER_CANISTERS.with(|c| c.borrow_mut().remove(&canister_id));
        
        // Remove from owner's canister list
        CANISTER_BY_OWNER.with(|c| {
            let mut map = c.borrow_mut();
            if let Some(mut owner_canisters) = map.get(&owner) {
                owner_canisters.0.retain(|id| *id != canister_id);
                map.insert(owner, owner_canisters);
            }
        });
        
        // Decrement total canisters count
        FACTORY_STATS.with(|s| {
            let mut stats = s.borrow().get().clone();
            if stats.total_canisters > 0 {
                stats.total_canisters -= 1;
            }
            if record.is_active && stats.active_canisters > 0 {
                stats.active_canisters -= 1;
            }
            s.borrow_mut().set(stats).unwrap();
        });
        
        Ok(())
    } else {
        Err("Canister record not found".to_string())
    }
}

#[ic_cdk::update]
fn admin_transfer_canister_ownership(
    canister_id: Principal, 
    new_owner: Principal
) -> Result<(), String> {
    if !is_admin(ic_cdk::caller()) {
        return Err("Only admin can transfer canister ownership".to_string());
    }

    if new_owner == Principal::anonymous() {
        return Err("Cannot transfer ownership to anonymous principal".to_string());
    }

    // Get the canister record
    let mut canister_record = USER_CANISTERS.with(|c| c.borrow().get(&canister_id))
        .ok_or("Canister record not found")?;
    
    let old_owner = canister_record.owner;
    
    // Update the record with new owner
    canister_record.owner = new_owner;
    canister_record.last_updated = ic_cdk::api::time();
    
    // Update USER_CANISTERS
    USER_CANISTERS.with(|c| c.borrow_mut().insert(canister_id, canister_record));
    
    // Remove from old owner's list
    CANISTER_BY_OWNER.with(|c| {
        let mut map = c.borrow_mut();
        if let Some(mut old_owner_canisters) = map.get(&old_owner) {
            old_owner_canisters.0.retain(|id| *id != canister_id);
            map.insert(old_owner, old_owner_canisters);
        }
    });
    
    // Add to new owner's list
    CANISTER_BY_OWNER.with(|c| {
        let mut map = c.borrow_mut();
        if let Some(mut new_owner_canisters) = map.get(&new_owner) {
            new_owner_canisters.0.push(canister_id);
            map.insert(new_owner, new_owner_canisters);
        } else {
            // New owner doesn't exist, create entry
            map.insert(new_owner, StableVecPrincipal(vec![canister_id]));
            
            // Increment user count
            FACTORY_STATS.with(|s| {
                let mut stats = s.borrow().get().clone();
                stats.total_users += 1;
                s.borrow_mut().set(stats).unwrap();
            });
        }
    });
    
    Ok(())
}

#[ic_cdk::query]
fn admin_get_all_canister_records() -> Vec<CanisterRecord> {
    if !is_admin(ic_cdk::caller()) {
        return vec![];
    }
    
    USER_CANISTERS.with(|c| {
        c.borrow().iter().map(|(_, record)| record).collect()
    })
}

// Export the candid interface
ic_cdk::export_candid!();
