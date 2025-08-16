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

const ADMIN_PRINCIPAL: &str = "2vxsx-fae"; // Replace with actual admin principal

fn is_admin(caller: Principal) -> bool {
    caller.to_text() == ADMIN_PRINCIPAL || caller == ic_cdk::id()
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
    let has_wasm = USER_CANISTER_WASM.with(|w| w.borrow().get().is_some());
    if has_wasm {
        "User canister WASM is loaded and ready for deployment".to_string()
    } else {
        "User canister WASM not set. Admin needs to upload WASM first.".to_string()
    }
}

// Export the candid interface
ic_cdk::export_candid!();
