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
use std::collections::HashMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// ============================================================================
// TYPES FROM FACTORY SYSTEM
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
    pub merchant_fee: u32,
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
pub struct PaymentInvoice {
    pub id: String,
    pub merchant: Principal,
    pub amount: u64,
    pub token: TokenConfig,
    pub description: String,
    pub metadata: Vec<(String, String)>,
    pub expires_at: Option<u64>,
    pub created_at: u64,
    pub status: InvoiceStatus,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum InvoiceStatus {
    Created,
    Paid,
    Expired,
    Cancelled,
}

impl Storable for PaymentInvoice {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentTransaction {
    pub id: String,
    pub from: Principal,
    pub to: Principal,
    pub token: TokenConfig,
    pub amount: u64,
    pub fee: u64,
    pub merchant_fee: u64,
    pub timestamp: u64,
    pub status: TransactionStatus,
    pub metadata: Vec<(String, String)>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransactionStatus {
    Pending,
    Completed,
    Failed(String),
    Refunded,
}

impl Storable for PaymentTransaction {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentAnalytics {
    pub total_transactions: u64,
    pub total_volume: Vec<(String, u64)>,
    pub success_rate: f64,
    pub average_amount: Vec<(String, u64)>,
    pub top_tokens: Vec<String>,
}

// ============================================================================
// STABLE STORAGE
// ============================================================================

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    // Configuration storage
    static CONFIG: RefCell<Cell<UserCanisterConfig, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), UserCanisterConfig {
            name: "Default".to_string(),
            description: "Default description".to_string(),
            supported_tokens: vec![],
            webhook: None,
            merchant_fee: 0,
            auto_withdraw: false,
            withdraw_threshold: None,
            custom_settings: vec![],
        }).unwrap()
    );

    static OWNER: RefCell<Cell<Principal, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), Principal::anonymous()).unwrap()
    );

    // Payment data storage
    static INVOICES: RefCell<StableBTreeMap<String, PaymentInvoice, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))))
    );

    static TRANSACTIONS: RefCell<StableBTreeMap<String, PaymentTransaction, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))))
    );

    // Balances per token
    static BALANCES: RefCell<StableBTreeMap<String, u64, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))))
    );

    // Counter for generating IDs
    static NEXT_INVOICE_ID: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))), 1u64).unwrap()
    );

    static NEXT_TRANSACTION_ID: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))), 1u64).unwrap()
    );
}

// ============================================================================
// INITIALIZATION
// ============================================================================

#[ic_cdk::init]
fn init(config: UserCanisterConfig, owner: Principal) {
    CONFIG.with(|c| c.borrow_mut().set(config).unwrap());
    OWNER.with(|o| o.borrow_mut().set(owner).unwrap());
}

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

#[ic_cdk::update]
fn update_configuration(new_config: UserCanisterConfig) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update configuration".to_string());
    }

    CONFIG.with(|c| c.borrow_mut().set(new_config).unwrap());
    Ok(())
}

#[ic_cdk::query]
fn get_configuration() -> UserCanisterConfig {
    CONFIG.with(|c| c.borrow().get().clone())
}

#[ic_cdk::query]
fn get_supported_tokens() -> Vec<TokenConfig> {
    CONFIG.with(|c| c.borrow().get().supported_tokens.clone())
}

#[ic_cdk::update]
fn add_supported_token(token: TokenConfig) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can add tokens".to_string());
    }

    // Validate token configuration
    if token.symbol.is_empty() {
        return Err("Token symbol cannot be empty".to_string());
    }
    if token.name.is_empty() {
        return Err("Token name cannot be empty".to_string());
    }
    if token.canister_id == Principal::anonymous() {
        return Err("Token canister ID cannot be anonymous".to_string());
    }

    CONFIG.with(|c| {
        let mut config = c.borrow().get().clone();
        
        // Check if token already exists (by symbol or canister_id)
        if config.supported_tokens.iter().any(|t| t.symbol == token.symbol || t.canister_id == token.canister_id) {
            return Err("Token with this symbol or canister ID already exists".to_string());
        }
        
        // Add the new token
        config.supported_tokens.push(token);
        c.borrow_mut().set(config).unwrap();
        Ok(())
    })
}

#[ic_cdk::update]
fn remove_supported_token(token_symbol: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can remove tokens".to_string());
    }

    CONFIG.with(|c| {
        let mut config = c.borrow().get().clone();
        
        let initial_len = config.supported_tokens.len();
        config.supported_tokens.retain(|t| t.symbol != token_symbol);
        
        if config.supported_tokens.len() == initial_len {
            return Err("Token not found".to_string());
        }
        
        // Ensure at least one token remains
        if config.supported_tokens.is_empty() {
            return Err("Cannot remove the last supported token".to_string());
        }
        
        c.borrow_mut().set(config).unwrap();
        Ok(())
    })
}

#[ic_cdk::update]
fn update_supported_token(token_symbol: String, updated_token: TokenConfig) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update tokens".to_string());
    }

    // Validate updated token configuration
    if updated_token.symbol.is_empty() {
        return Err("Token symbol cannot be empty".to_string());
    }
    if updated_token.name.is_empty() {
        return Err("Token name cannot be empty".to_string());
    }
    if updated_token.canister_id == Principal::anonymous() {
        return Err("Token canister ID cannot be anonymous".to_string());
    }

    CONFIG.with(|c| {
        let mut config = c.borrow().get().clone();
        
        // Find the token to update
        let token_index = config.supported_tokens
            .iter()
            .position(|t| t.symbol == token_symbol)
            .ok_or("Token not found")?;
            
        let old_token = &config.supported_tokens[token_index];
        
        // If symbol is changing, check for conflicts
        if old_token.symbol != updated_token.symbol {
            if config.supported_tokens.iter().any(|t| t.symbol == updated_token.symbol) {
                return Err("A token with the new symbol already exists".to_string());
            }
        }
        
        // If canister_id is changing, check for conflicts
        if old_token.canister_id != updated_token.canister_id {
            if config.supported_tokens.iter().any(|t| t.canister_id == updated_token.canister_id) {
                return Err("A token with the new canister ID already exists".to_string());
            }
        }
        
        // Update the token
        config.supported_tokens[token_index] = updated_token;
        c.borrow_mut().set(config).unwrap();
        Ok(())
    })
}

#[ic_cdk::update]
fn toggle_token_status(token_symbol: String) -> Result<bool, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can toggle token status".to_string());
    }

    CONFIG.with(|c| {
        let mut config = c.borrow().get().clone();
        
        if let Some(token) = config.supported_tokens.iter_mut().find(|t| t.symbol == token_symbol) {
            token.is_active = !token.is_active;
            let new_status = token.is_active;
            c.borrow_mut().set(config).unwrap();
            Ok(new_status)
        } else {
            Err("Token not found".to_string())
        }
    })
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

#[ic_cdk::update]
fn create_invoice(
    amount: u64,
    token_symbol: String,
    description: String,
    metadata: Vec<(String, String)>
) -> Result<PaymentInvoice, String> {
    let config = CONFIG.with(|c| c.borrow().get().clone());
    
    // Find the token configuration
    let token = config.supported_tokens
        .iter()
        .find(|t| t.symbol == token_symbol && t.is_active)
        .ok_or("Token not supported or inactive")?
        .clone();

    // Generate invoice ID
    let invoice_id = NEXT_INVOICE_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("inv_{}", current)
    });

    let invoice = PaymentInvoice {
        id: invoice_id.clone(),
        merchant: OWNER.with(|o| *o.borrow().get()),
        amount,
        token,
        description,
        metadata,
        expires_at: Some(ic_cdk::api::time() + (24 * 60 * 60 * 1_000_000_000)), // 24 hours
        created_at: ic_cdk::api::time(),
        status: InvoiceStatus::Created,
    };

    INVOICES.with(|invoices| invoices.borrow_mut().insert(invoice_id, invoice.clone()));
    Ok(invoice)
}

#[ic_cdk::update]
async fn process_payment(invoice_id: String, from: Principal) -> Result<PaymentTransaction, String> {
    // Get the invoice
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id)
    }).ok_or("Invoice not found")?;

    // Check if invoice is still valid
    if let InvoiceStatus::Paid = invoice.status {
        return Err("Invoice already paid".to_string());
    }

    if let Some(expires_at) = invoice.expires_at {
        if ic_cdk::api::time() > expires_at {
            return Err("Invoice expired".to_string());
        }
    }

    // Generate transaction ID
    let transaction_id = NEXT_TRANSACTION_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("tx_{}", current)
    });

    let owner = OWNER.with(|o| *o.borrow().get());
    let config = CONFIG.with(|c| c.borrow().get().clone());

    // Calculate merchant fee
    let merchant_fee = (invoice.amount * config.merchant_fee as u64) / 10000; // merchant_fee is in basis points
    let net_amount = invoice.amount - merchant_fee;

    // Here you would integrate with actual token transfer logic
    // For now, we'll simulate the transfer

    let transaction = PaymentTransaction {
        id: transaction_id.clone(),
        from,
        to: owner,
        token: invoice.token.clone(),
        amount: invoice.amount,
        fee: invoice.token.fee,
        merchant_fee,
        timestamp: ic_cdk::api::time(),
        status: TransactionStatus::Completed, // In real implementation, start as Pending
        metadata: invoice.metadata.clone(),
    };

    // Update invoice status
    invoice.status = InvoiceStatus::Paid;
    INVOICES.with(|invoices| invoices.borrow_mut().insert(invoice_id, invoice.clone()));

    // Store transaction
    TRANSACTIONS.with(|transactions| {
        transactions.borrow_mut().insert(transaction_id, transaction.clone())
    });

    // Update balance
    BALANCES.with(|balances| {
        let mut map = balances.borrow_mut();
        let current_balance = map.get(&invoice.token.symbol).unwrap_or(0);
        map.insert(invoice.token.symbol.clone(), current_balance + net_amount);
    });

    Ok(transaction)
}

#[ic_cdk::query]
fn get_transaction(transaction_id: String) -> Option<PaymentTransaction> {
    TRANSACTIONS.with(|transactions| transactions.borrow().get(&transaction_id))
}

#[ic_cdk::query]
fn get_invoice(invoice_id: String) -> Option<PaymentInvoice> {
    INVOICES.with(|invoices| invoices.borrow().get(&invoice_id))
}

// ============================================================================
// BALANCE AND WITHDRAWAL MANAGEMENT
// ============================================================================

#[ic_cdk::query]
fn get_balance(token_symbol: String) -> u64 {
    BALANCES.with(|balances| balances.borrow().get(&token_symbol).unwrap_or(0))
}

#[ic_cdk::query]
fn get_all_balances() -> Vec<(String, u64)> {
    BALANCES.with(|balances| balances.borrow().iter().collect())
}

#[ic_cdk::update]
async fn withdraw(token_symbol: String, amount: u64, _to: Principal) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can withdraw".to_string());
    }

    let current_balance = BALANCES.with(|balances| {
        balances.borrow().get(&token_symbol).unwrap_or(0)
    });

    if current_balance < amount {
        return Err("Insufficient balance".to_string());
    }

    // Here you would integrate with actual token transfer logic
    // For now, we'll simulate the withdrawal

    BALANCES.with(|balances| {
        let mut map = balances.borrow_mut();
        map.insert(token_symbol, current_balance - amount);
    });

    Ok(amount)
}

// ============================================================================
// ANALYTICS
// ============================================================================

#[ic_cdk::query]
fn get_analytics(_from_date: Option<String>, _to_date: Option<String>) -> PaymentAnalytics {
    let transactions: Vec<PaymentTransaction> = TRANSACTIONS.with(|t| {
        t.borrow().iter().map(|(_, tx)| tx).collect()
    });

    let total_transactions = transactions.len() as u64;
    let completed_transactions = transactions.iter()
        .filter(|tx| matches!(tx.status, TransactionStatus::Completed))
        .count() as u64;

    let success_rate = if total_transactions > 0 {
        completed_transactions as f64 / total_transactions as f64
    } else {
        0.0
    };

    // Calculate volume per token
    let mut volume_per_token: HashMap<String, u64> = HashMap::new();
    for tx in &transactions {
        if matches!(tx.status, TransactionStatus::Completed) {
            *volume_per_token.entry(tx.token.symbol.clone()).or_insert(0) += tx.amount;
        }
    }

    let total_volume: Vec<(String, u64)> = volume_per_token.into_iter().collect();

    PaymentAnalytics {
        total_transactions,
        total_volume,
        success_rate,
        average_amount: vec![], // Calculate as needed
        top_tokens: vec![],     // Calculate as needed
    }
}

#[ic_cdk::query]
fn get_transaction_history(limit: u64, offset: u64) -> Vec<PaymentTransaction> {
    TRANSACTIONS.with(|transactions| {
        transactions.borrow()
            .iter()
            .skip(offset as usize)
            .take(limit as usize)
            .map(|(_, tx)| tx)
            .collect()
    })
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

#[ic_cdk::query]
fn health() -> (String, u64, u64) {
    let status = "healthy".to_string();
    let version = 1u64;
    let uptime = ic_cdk::api::time();
    (status, version, uptime)
}

// ============================================================================
// UTILITY METHODS
// ============================================================================

#[ic_cdk::query]
fn whoami() -> Principal {
    ic_cdk::caller()
}

#[ic_cdk::query]
fn get_owner() -> Principal {
    OWNER.with(|o| *o.borrow().get())
}

#[ic_cdk::update]
fn admin_update_owner(new_owner: Principal) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let current_owner = OWNER.with(|o| *o.borrow().get());
    
    // Only current owner or controllers can change ownership
    if caller != current_owner {
        // Check if caller is a controller by attempting to call a management canister function
        // This is a simple way to verify controller status
        // In practice, you might want a more sophisticated check
        
        // For now, we'll also allow the admin principal (factory owner) to update ownership
        let admin_principal = "ouuvn-c7hpi-46km4-ywlnr-j2ten-wldfi-xu53v-vth6u-3qtqr-cmbxu-gqe";
        if caller.to_text() != admin_principal {
            return Err("Only the current owner or admin can update ownership".to_string());
        }
    }
    
    if new_owner == Principal::anonymous() {
        return Err("Cannot set owner to anonymous principal".to_string());
    }
    
    OWNER.with(|o| o.borrow_mut().set(new_owner).unwrap());
    Ok(())
}

#[ic_cdk::query]
fn canister_id() -> Principal {
    ic_cdk::id()
}

// Export candid interface
ic_cdk::export_candid!();
