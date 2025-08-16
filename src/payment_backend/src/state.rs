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

use crate::{CanisterRecord, FactoryStats, StableVecPrincipal};

type Memory = VirtualMemory<DefaultMemoryImpl>;

// ============================================================================
// STABLE STORAGE SETUP
// ============================================================================

thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    // Factory system storage only - removed old payment system types

    // New factory system storage  
    pub static USER_CANISTERS: RefCell<StableBTreeMap<Principal, CanisterRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(10))))
    );

    pub static CANISTER_BY_OWNER: RefCell<StableBTreeMap<Principal, StableVecPrincipal, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(11))))
    );

    // PaymentTransaction moved to user canisters

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
// HELPER FUNCTIONS FOR STATE ACCESS
// ============================================================================

// Removed get_next_item_id - not used in factory pattern

pub fn get_next_canister_version() -> u64 {
    NEXT_CANISTER_VERSION.with(|v| {
        let current = *v.borrow().get();
        v.borrow_mut().set(current + 1).unwrap();
        current
    })
}

pub fn increment_total_canisters() {
    FACTORY_STATS.with(|s| {
        let mut stats = s.borrow().get().clone();
        stats.total_canisters += 1;
        stats.active_canisters += 1;
        s.borrow_mut().set(stats).unwrap();
    });
}

pub fn get_user_canister_wasm() -> Option<Vec<u8>> {
    USER_CANISTER_WASM.with(|w| w.borrow().get().clone())
}

pub fn set_user_canister_wasm(wasm: Vec<u8>) {
    USER_CANISTER_WASM.with(|w| w.borrow_mut().set(Some(wasm)).unwrap());
}

pub fn add_user_canister(canister_id: Principal, record: CanisterRecord) {
    USER_CANISTERS.with(|c| c.borrow_mut().insert(canister_id, record));
}

pub fn get_user_canister(canister_id: &Principal) -> Option<CanisterRecord> {
    USER_CANISTERS.with(|c| c.borrow().get(canister_id))
}

pub fn add_canister_to_owner(owner: Principal, canister_id: Principal) {
    CANISTER_BY_OWNER.with(|c| {
        let mut map = c.borrow_mut();
        let mut canisters = map.get(&owner).unwrap_or_default().0;
        canisters.push(canister_id);
        map.insert(owner, StableVecPrincipal(canisters));
    });
}

pub fn get_owner_canisters(owner: &Principal) -> Vec<Principal> {
    CANISTER_BY_OWNER.with(|c| c.borrow().get(owner).unwrap_or_default().0)
}

pub fn get_active_canisters() -> Vec<CanisterRecord> {
    USER_CANISTERS.with(|c| {
        c.borrow()
            .iter()
            .filter(|(_, record)| record.is_active)
            .map(|(_, record)| record)
            .collect()
    })
}

pub fn find_canisters_by_token_symbol(token_symbol: &String) -> Vec<CanisterRecord> {
    USER_CANISTERS.with(|c| {
        c.borrow()
            .iter()
            .filter(|(_, record)| {
                record.is_active && record.supported_tokens.iter().any(|token| &token.symbol == token_symbol)
            })
            .map(|(_, record)| record)
            .collect()
    })
}

pub fn get_factory_statistics() -> FactoryStats {
    FACTORY_STATS.with(|s| s.borrow().get().clone())
}

