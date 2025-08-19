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
    pub payment_method: PaymentMethod,
    pub block_index: Option<u64>, // Block index from ledger transaction
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum PaymentMethod {
    Direct,        // Direct transfer
    TransferFrom,  // Transfer from approved amount
    Subscription,  // Subscription payment
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentRequest {
    pub invoice_id: String,
    pub amount: u64,
    pub token_symbol: String,
    pub coupon_code: Option<String>,
    pub metadata: Vec<(String, String)>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentResult {
    pub transaction_id: String,
    pub amount_paid: u64,
    pub discount_applied: u64,
    pub final_amount: u64,
    pub block_index: Option<u64>,
    pub payment_method: PaymentMethod,
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
// MODAL BUILDER FEATURE STRUCTURES
// ============================================================================

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ModalConfig {
    pub modal_id: String,
    pub name: String,
    pub description: Option<String>,
    pub theme: ModalTheme,
    pub payment_options: PaymentOptions,
    pub branding: BrandingConfig,
    pub redirect_urls: RedirectUrls,
    pub template_id: Option<String>, // Reference to factory template
    pub created_at: u64,
    pub updated_at: u64,
    pub is_active: bool,
}

impl Storable for ModalConfig {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ModalTheme {
    pub primary_color: String,
    pub background_color: String,
    pub text_color: String,
    pub border_radius: u32,
    pub font_family: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentOptions {
    pub allowed_tokens: Vec<String>,
    pub require_email: bool,
    pub require_shipping: bool,
    pub show_amount_breakdown: bool,
    pub enable_tips: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BrandingConfig {
    pub logo_url: Option<String>,
    pub company_name: String,
    pub support_url: Option<String>,
    pub terms_url: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RedirectUrls {
    pub success_url: String,
    pub cancel_url: String,
    pub webhook_url: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ModalAnalytics {
    pub modal_id: String,
    pub total_views: u64,
    pub successful_payments: u64,
    pub conversion_rate: f64,
    pub revenue_generated: u64,
}

impl Storable for ModalAnalytics {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// ============================================================================
// DISCOUNT COUPON SYSTEM STRUCTURES
// ============================================================================

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum CouponType {
    Percentage(u32), // Percentage discount (0-100)
    FixedAmount(u64), // Fixed amount discount in token's smallest unit
    FreeShipping,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DiscountCoupon {
    pub coupon_id: String,
    pub code: String, // Human-readable coupon code
    pub coupon_type: CouponType,
    pub description: String,
    pub minimum_amount: Option<u64>, // Minimum purchase amount to use coupon
    pub applicable_tokens: Vec<String>, // Empty means all tokens
    pub usage_limit: Option<u32>, // Max number of uses, None = unlimited
    pub used_count: u32,
    pub expires_at: Option<u64>, // Timestamp, None = never expires
    pub is_active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for DiscountCoupon {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CouponUsage {
    pub usage_id: String,
    pub coupon_id: String,
    pub user_principal: Principal,
    pub invoice_id: String,
    pub discount_applied: u64,
    pub used_at: u64,
}

impl Storable for CouponUsage {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// ============================================================================
// PRODUCT MANAGEMENT STRUCTURES
// ============================================================================

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ProductStatus {
    Active,
    Inactive,
    OutOfStock,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Product {
    pub product_id: String,
    pub name: String,
    pub description: String,
    pub price: u64, // Price in token's smallest unit
    pub token_symbol: String, // Token symbol (e.g., "ICP", "ckBTC")
    pub category: Option<String>,
    pub image_url: Option<String>,
    pub status: ProductStatus,
    pub inventory_count: Option<u32>, // None = unlimited inventory
    pub metadata: Vec<(String, String)>, // Custom metadata key-value pairs
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for Product {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ProductSalesStats {
    pub product_id: String,
    pub total_sales: u64,
    pub total_revenue: u64,
    pub units_sold: u32,
    pub last_sale_at: Option<u64>,
}

impl Storable for ProductSalesStats {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT SYSTEM STRUCTURES
// ============================================================================

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum SubscriptionStatus {
    Active,
    Paused,
    Cancelled,
    Expired,
    PendingPayment,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum BillingInterval {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
    Custom(u64), // Custom interval in seconds
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SubscriptionPlan {
    pub plan_id: String,
    pub name: String,
    pub description: String,
    pub price: u64, // Price in token's smallest unit
    pub token: String, // Token symbol (e.g., "ckBTC")
    pub billing_interval: BillingInterval,
    pub trial_period_days: Option<u32>, // Free trial period
    pub max_subscriptions: Option<u32>, // Maximum number of active subscriptions, None = unlimited
    pub features: Vec<String>, // List of features included in this plan
    pub is_active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for SubscriptionPlan {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Subscription {
    pub subscription_id: String,
    pub plan_id: String,
    pub subscriber: Principal,
    pub status: SubscriptionStatus,
    pub current_period_start: u64,
    pub current_period_end: u64,
    pub next_billing_date: u64,
    pub trial_end: Option<u64>, // When trial period ends, if applicable
    pub cancelled_at: Option<u64>, // When subscription was cancelled
    pub cancel_at_period_end: bool, // If true, cancel at end of current period
    pub total_payments: u64, // Total amount paid over lifetime
    pub payment_failures: u32, // Number of consecutive payment failures
    pub metadata: Vec<(String, String)>, // Custom metadata key-value pairs
    pub created_at: u64,
    pub updated_at: u64,
}

impl Storable for Subscription {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SubscriptionPayment {
    pub payment_id: String,
    pub subscription_id: String,
    pub amount: u64,
    pub token: String,
    pub billing_period_start: u64,
    pub billing_period_end: u64,
    pub payment_date: u64,
    pub status: String, // "paid", "failed", "pending"
    pub transaction_id: Option<String>, // Link to actual payment transaction
    pub failure_reason: Option<String>, // If payment failed, why?
}

impl Storable for SubscriptionPayment {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
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

    // Modal Builder storage (MemoryId 7) with default modal config
    static MODAL_CONFIGS: RefCell<StableBTreeMap<String, ModalConfig, Memory>> = RefCell::new(
        {
            let mut map = StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))));
            
            // Add default modal configuration
            let default_modal = ModalConfig {
                modal_id: "modal_1".to_string(),
                name: "Default Payment Modal".to_string(),
                description: Some("Default modal configuration for payments".to_string()),
                theme: ModalTheme {
                    primary_color: "#3b82f6".to_string(),  // Blue-500
                    background_color: "#ffffff".to_string(), // White
                    text_color: "#1f2937".to_string(),      // Gray-800
                    border_radius: 12,
                    font_family: "Inter, sans-serif".to_string(),
                },
                payment_options: PaymentOptions {
                    allowed_tokens: vec!["ICP".to_string()],
                    require_email: false,
                    require_shipping: false,
                    show_amount_breakdown: true,
                    enable_tips: false,
                },
                branding: BrandingConfig {
                    logo_url: None,
                    company_name: "My Business".to_string(),
                    support_url: None,
                    terms_url: None,
                },
                redirect_urls: RedirectUrls {
                    success_url: "https://example.com/success".to_string(),
                    cancel_url: "https://example.com/cancel".to_string(),
                    webhook_url: None,
                },
                template_id: None,
                created_at: 0,
                updated_at: 0,
                is_active: true,
            };
            
            map.insert("modal_1".to_string(), default_modal);
            map
        }
    );

    static MODAL_ANALYTICS: RefCell<StableBTreeMap<String, ModalAnalytics, Memory>> = RefCell::new(
        {
            let mut map = StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8))));
            
            // Add default modal analytics
            let default_analytics = ModalAnalytics {
                modal_id: "modal_1".to_string(),
                total_views: 0,
                successful_payments: 0,
                conversion_rate: 0.0,
                revenue_generated: 0,
            };
            
            map.insert("modal_1".to_string(), default_analytics);
            map
        }
    );

    static NEXT_MODAL_ID: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(9))), 2u64).unwrap()
    );

    // Discount Coupon System storage (MemoryId 10, 11, 12)
    static DISCOUNT_COUPONS: RefCell<StableBTreeMap<String, DiscountCoupon, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(10))))
    );

    static COUPON_USAGE_HISTORY: RefCell<StableBTreeMap<String, CouponUsage, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(11))))
    );

    static NEXT_COUPON_ID: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(12))), 1u64).unwrap()
    );

    // Subscription Management System storage (MemoryId 13, 14, 15, 16)
    static SUBSCRIPTION_PLANS: RefCell<StableBTreeMap<String, SubscriptionPlan, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(13))))
    );

    static SUBSCRIPTIONS: RefCell<StableBTreeMap<String, Subscription, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(14))))
    );

    static SUBSCRIPTION_PAYMENTS: RefCell<StableBTreeMap<String, SubscriptionPayment, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(15))))
    );

    static NEXT_SUBSCRIPTION_ID: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(16))), 1u64).unwrap()
    );

    // Product Management storage (MemoryId 17, 18, 19)
    static PRODUCTS: RefCell<StableBTreeMap<String, Product, Memory>> = RefCell::new(
        {
            let mut map = StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(17))));
            
            // Add default product priced at 1 ICP
            let default_product = Product {
                product_id: "product_1".to_string(),
                name: "Default Product".to_string(),
                description: "A default product for demonstration purposes".to_string(),
                price: 100_000_000, // 1 ICP in e8s (ICP has 8 decimals)
                token_symbol: "ICP".to_string(),
                category: Some("General".to_string()),
                image_url: None,
                status: ProductStatus::Active,
                inventory_count: None, // Unlimited inventory
                metadata: vec![
                    ("type".to_string(), "digital".to_string()),
                    ("featured".to_string(), "true".to_string()),
                ],
                created_at: 0,
                updated_at: 0,
            };
            
            map.insert("product_1".to_string(), default_product);
            map
        }
    );

    static PRODUCT_SALES_STATS: RefCell<StableBTreeMap<String, ProductSalesStats, Memory>> = RefCell::new(
        {
            let mut map = StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(18))));
            
            // Add default product sales stats
            let default_stats = ProductSalesStats {
                product_id: "product_1".to_string(),
                total_sales: 0,
                total_revenue: 0,
                units_sold: 0,
                last_sale_at: None,
            };
            
            map.insert("product_1".to_string(), default_stats);
            map
        }
    );

    static NEXT_PRODUCT_ID: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(19))), 2u64).unwrap()
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

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    // After upgrade, stable storage is automatically restored
    // This hook ensures all memory managers and storage are properly initialized
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

// Enhanced process_payment with transferFrom support
#[ic_cdk::update]
async fn process_payment_request(payment_request: PaymentRequest) -> Result<PaymentResult, String> {
    let caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    // Get the invoice
    let mut invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&payment_request.invoice_id)
    }).ok_or("Invoice not found")?;

    // Check if invoice is still valid
    if let InvoiceStatus::Paid = invoice.status {
        return Err("Invoice already paid".to_string());
    }

    if let Some(expires_at) = invoice.expires_at {
        if current_time > expires_at {
            return Err("Invoice expired".to_string());
        }
    }

    // Validate token
    if invoice.token.symbol != payment_request.token_symbol {
        return Err("Token mismatch".to_string());
    }

    let mut final_amount = payment_request.amount;
    let mut discount_applied = 0u64;
    let mut coupon_id: Option<String> = None;

    // Process coupon if provided
    if let Some(coupon_code) = payment_request.coupon_code {
        match validate_and_use_coupon(coupon_code, payment_request.amount, payment_request.token_symbol.clone()) {
            Ok((used_coupon_id, discount)) => {
                discount_applied = discount;
                final_amount = payment_request.amount.saturating_sub(discount);
                coupon_id = Some(used_coupon_id);
            },
            Err(err) => {
                // Log coupon error but don't fail the payment
                ic_cdk::println!("Coupon validation failed: {}", err);
            }
        }
    }

    // Validate final amount
    if final_amount < invoice.amount {
        return Err("Payment amount insufficient after discount".to_string());
    }

    // Generate transaction ID
    let transaction_id = NEXT_TRANSACTION_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("tx_{}", current)
    });

    let owner = OWNER.with(|o| *o.borrow().get());
    let config = CONFIG.with(|c| c.borrow().get().clone());

    // Calculate fees
    let merchant_fee = (final_amount * config.merchant_fee as u64) / 10000;
    let net_amount = final_amount.saturating_sub(merchant_fee);

    // Attempt transferFrom call
    let transfer_result = transfer_from_token(
        invoice.token.canister_id,
        caller,
        owner,
        final_amount + invoice.token.fee, // Include token transfer fee
    ).await;

    let (status, block_index) = match transfer_result {
        Ok(block_idx) => (TransactionStatus::Completed, Some(block_idx)),
        Err(err) => {
            ic_cdk::println!("Transfer failed: {}", err);
            (TransactionStatus::Failed(err), None)
        }
    };

    // Create transaction record with enhanced metadata
    let mut metadata = payment_request.metadata;
    if let Some(cid) = coupon_id {
        metadata.push(("coupon_id".to_string(), cid));
        metadata.push(("discount_applied".to_string(), discount_applied.to_string()));
    }
    metadata.push(("original_amount".to_string(), payment_request.amount.to_string()));
    metadata.push(("final_amount".to_string(), final_amount.to_string()));

    let transaction = PaymentTransaction {
        id: transaction_id.clone(),
        from: caller,
        to: owner,
        token: invoice.token.clone(),
        amount: final_amount,
        fee: invoice.token.fee,
        merchant_fee,
        timestamp: current_time,
        status: status.clone(),
        metadata,
        payment_method: PaymentMethod::TransferFrom,
        block_index,
    };

    // Only update invoice and balances if payment succeeded
    if matches!(status, TransactionStatus::Completed) {
        // Update invoice status
        invoice.status = InvoiceStatus::Paid;
        INVOICES.with(|invoices| invoices.borrow_mut().insert(payment_request.invoice_id, invoice.clone()));

        // Update balance for successful payment
        BALANCES.with(|balances| {
            let mut map = balances.borrow_mut();
            let current_balance = map.get(&invoice.token.symbol).unwrap_or(0);
            map.insert(invoice.token.symbol.clone(), current_balance + net_amount);
        });

        // Track product sales if this is a product-based payment
        if let Some(product_id) = invoice.metadata.iter().find(|(key, _)| key == "product_id").map(|(_, value)| value) {
            update_product_sales_stats(product_id, final_amount);
        }

        // Track modal analytics if successful
        track_payment_analytics(&invoice.token.symbol, final_amount);
    }

    // Store transaction regardless of status for analytics
    TRANSACTIONS.with(|transactions| {
        transactions.borrow_mut().insert(transaction_id.clone(), transaction.clone())
    });

    // Return payment result
    Ok(PaymentResult {
        transaction_id,
        amount_paid: payment_request.amount,
        discount_applied,
        final_amount,
        block_index,
        payment_method: PaymentMethod::TransferFrom,
    })
}

// Legacy process_payment method for backwards compatibility
#[ic_cdk::update]
async fn process_payment(invoice_id: String, _from: Principal) -> Result<PaymentTransaction, String> {
    // Get the invoice for amount and token info
    let invoice = INVOICES.with(|invoices| {
        invoices.borrow().get(&invoice_id)
    }).ok_or("Invoice not found")?;

    // Create a payment request
    let payment_request = PaymentRequest {
        invoice_id,
        amount: invoice.amount,
        token_symbol: invoice.token.symbol,
        coupon_code: None,
        metadata: vec![],
    };

    // Process the payment
    let result = process_payment_request(payment_request).await?;
    
    // Return the transaction for backwards compatibility
    TRANSACTIONS.with(|transactions| {
        transactions.borrow().get(&result.transaction_id)
            .ok_or("Transaction not found after processing".to_string())
    })
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
// TOKEN TRANSFER INTEGRATION
// ============================================================================

// Transfer arguments for ICRC-1 tokens
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferArg {
    pub from_subaccount: Option<[u8; 32]>,
    pub to: Account,
    pub amount: u64,
    pub fee: Option<u64>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<[u8; 32]>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferFromArg {
    pub spender_subaccount: Option<[u8; 32]>,
    pub from: Account,
    pub to: Account,
    pub amount: u64,
    pub fee: Option<u64>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransferError {
    BadFee { expected_fee: u64 },
    BadBurn { min_burn_amount: u64 },
    InsufficientFunds { balance: u64 },
    InsufficientAllowance { allowance: u64 },
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    Duplicate { duplicate_of: u64 },
    TemporarilyUnavailable,
    GenericError { error_code: u64, message: String },
}

type TransferResult = Result<u64, TransferError>; // Block index or error

// Function to perform transferFrom call to token canister
async fn transfer_from_token(
    token_canister_id: Principal,
    from: Principal,
    to: Principal,
    amount: u64,
) -> Result<u64, String> {
    let transfer_from_arg = TransferFromArg {
        spender_subaccount: None,
        from: Account {
            owner: from,
            subaccount: None,
        },
        to: Account {
            owner: to,
            subaccount: None,
        },
        amount,
        fee: None, // Let the token canister determine the fee
        memo: None,
        created_at_time: Some(ic_cdk::api::time()),
    };

    // Call the token canister's icrc2_transfer_from method
    let result: Result<(TransferResult,), _> = ic_cdk::call(
        token_canister_id,
        "icrc2_transfer_from",
        (transfer_from_arg,),
    ).await;

    match result {
        Ok((transfer_result,)) => match transfer_result {
            Ok(block_index) => Ok(block_index),
            Err(transfer_error) => {
                let error_msg = match transfer_error {
                    TransferError::BadFee { expected_fee } => {
                        format!("Bad fee: expected {}", expected_fee)
                    },
                    TransferError::InsufficientFunds { balance } => {
                        format!("Insufficient funds: balance {}", balance)
                    },
                    TransferError::InsufficientAllowance { allowance } => {
                        format!("Insufficient allowance: {}", allowance)
                    },
                    TransferError::TooOld => "Transaction too old".to_string(),
                    TransferError::CreatedInFuture { ledger_time } => {
                        format!("Transaction created in future: ledger time {}", ledger_time)
                    },
                    TransferError::Duplicate { duplicate_of } => {
                        format!("Duplicate transaction: {}", duplicate_of)
                    },
                    TransferError::TemporarilyUnavailable => {
                        "Service temporarily unavailable".to_string()
                    },
                    TransferError::GenericError { error_code, message } => {
                        format!("Generic error {}: {}", error_code, message)
                    },
                    _ => "Unknown transfer error".to_string(),
                };
                Err(error_msg)
            }
        },
        Err((rejection_code, msg)) => {
            Err(format!(
                "Transfer call failed: {:?} - {}",
                rejection_code, msg
            ))
        }
    }
}

// ============================================================================
// ENHANCED ANALYTICS
// ============================================================================

// Track payment analytics for modal conversion
fn track_payment_analytics(token_symbol: &str, amount: u64) {
    // Update modal analytics for successful payment
    MODAL_ANALYTICS.with(|analytics| {
        let mut map = analytics.borrow_mut();
        if let Some(mut modal_analytics) = map.get(&"modal_1".to_string()) {
            modal_analytics.successful_payments += 1;
            modal_analytics.revenue_generated += amount;
            
            // Recalculate conversion rate
            if modal_analytics.total_views > 0 {
                modal_analytics.conversion_rate = 
                    modal_analytics.successful_payments as f64 / modal_analytics.total_views as f64;
            }
            
            map.insert("modal_1".to_string(), modal_analytics);
        }
    });
}

// Get enhanced analytics with payment method breakdown
#[ic_cdk::query]
fn get_enhanced_analytics() -> PaymentAnalytics {
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
    let mut amount_per_token: HashMap<String, Vec<u64>> = HashMap::new();
    
    for tx in &transactions {
        if matches!(tx.status, TransactionStatus::Completed) {
            *volume_per_token.entry(tx.token.symbol.clone()).or_insert(0) += tx.amount;
            amount_per_token.entry(tx.token.symbol.clone())
                .or_insert_with(Vec::new)
                .push(tx.amount);
        }
    }

    let total_volume: Vec<(String, u64)> = volume_per_token.clone().into_iter().collect();
    
    // Calculate average amounts
    let average_amount: Vec<(String, u64)> = amount_per_token.into_iter()
        .map(|(token, amounts)| {
            let avg = if !amounts.is_empty() {
                amounts.iter().sum::<u64>() / amounts.len() as u64
            } else {
                0
            };
            (token, avg)
        })
        .collect();

    // Get top tokens by volume
    let mut top_tokens: Vec<(String, u64)> = volume_per_token.into_iter().collect();
    top_tokens.sort_by(|a, b| b.1.cmp(&a.1));
    let top_tokens: Vec<String> = top_tokens.into_iter().take(5).map(|(token, _)| token).collect();

    PaymentAnalytics {
        total_transactions,
        total_volume,
        success_rate,
        average_amount,
        top_tokens,
    }
}

// Get payment method analytics
#[ic_cdk::query]
fn get_payment_method_analytics() -> Vec<(String, u64)> {
    let transactions: Vec<PaymentTransaction> = TRANSACTIONS.with(|t| {
        t.borrow().iter().map(|(_, tx)| tx).collect()
    });

    let mut method_counts: HashMap<String, u64> = HashMap::new();
    
    for tx in &transactions {
        if matches!(tx.status, TransactionStatus::Completed) {
            let method_name = match tx.payment_method {
                PaymentMethod::Direct => "Direct",
                PaymentMethod::TransferFrom => "TransferFrom",
                PaymentMethod::Subscription => "Subscription",
            };
            *method_counts.entry(method_name.to_string()).or_insert(0) += 1;
        }
    }

    method_counts.into_iter().collect()
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

// ============================================================================
// MODAL BUILDER METHODS
// ============================================================================

#[ic_cdk::update]
fn create_modal_config(config: ModalConfig) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can create modal configurations".to_string());
    }

    // Validate modal configuration
    if config.name.is_empty() {
        return Err("Modal name cannot be empty".to_string());
    }
    if config.branding.company_name.is_empty() {
        return Err("Company name cannot be empty".to_string());
    }
    if config.redirect_urls.success_url.is_empty() {
        return Err("Success URL cannot be empty".to_string());
    }
    if config.redirect_urls.cancel_url.is_empty() {
        return Err("Cancel URL cannot be empty".to_string());
    }

    // Generate modal ID
    let modal_id = NEXT_MODAL_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("modal_{}", current)
    });

    let mut new_config = config;
    new_config.modal_id = modal_id.clone();
    new_config.created_at = ic_cdk::api::time();
    new_config.updated_at = ic_cdk::api::time();

    MODAL_CONFIGS.with(|configs| {
        configs.borrow_mut().insert(modal_id.clone(), new_config)
    });

    // Initialize analytics for this modal
    let analytics = ModalAnalytics {
        modal_id: modal_id.clone(),
        total_views: 0,
        successful_payments: 0,
        conversion_rate: 0.0,
        revenue_generated: 0,
    };
    
    MODAL_ANALYTICS.with(|analytics_map| {
        analytics_map.borrow_mut().insert(modal_id.clone(), analytics)
    });

    Ok(modal_id)
}

#[ic_cdk::update]
fn update_modal_config(modal_id: String, mut config: ModalConfig) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update modal configurations".to_string());
    }

    // Validate modal configuration
    if config.name.is_empty() {
        return Err("Modal name cannot be empty".to_string());
    }
    if config.branding.company_name.is_empty() {
        return Err("Company name cannot be empty".to_string());
    }
    if config.redirect_urls.success_url.is_empty() {
        return Err("Success URL cannot be empty".to_string());
    }
    if config.redirect_urls.cancel_url.is_empty() {
        return Err("Cancel URL cannot be empty".to_string());
    }

    MODAL_CONFIGS.with(|configs| {
        let mut map = configs.borrow_mut();
        let existing_config = map.get(&modal_id)
            .ok_or("Modal configuration not found")?;
        
        // Preserve original creation data and ID
        config.modal_id = modal_id.clone();
        config.created_at = existing_config.created_at;
        config.updated_at = ic_cdk::api::time();
        
        map.insert(modal_id, config);
        Ok(())
    })
}

#[ic_cdk::query]
fn get_modal_config(modal_id: String) -> Result<ModalConfig, String> {
    MODAL_CONFIGS.with(|configs| {
        configs.borrow().get(&modal_id)
            .ok_or("Modal configuration not found".to_string())
    })
}

#[ic_cdk::query]
fn list_my_modals() -> Vec<ModalConfig> {
    MODAL_CONFIGS.with(|configs| {
        configs.borrow().iter().map(|(_, config)| config).collect()
    })
}

#[ic_cdk::update]
fn delete_modal_config(modal_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can delete modal configurations".to_string());
    }

    MODAL_CONFIGS.with(|configs| {
        let mut map = configs.borrow_mut();
        if map.remove(&modal_id).is_none() {
            return Err("Modal configuration not found".to_string());
        }
        Ok(())
    })?;

    // Also remove analytics data
    MODAL_ANALYTICS.with(|analytics| {
        analytics.borrow_mut().remove(&modal_id)
    });

    Ok(())
}

#[ic_cdk::update]
fn track_modal_view(modal_id: String) -> Result<(), String> {
    MODAL_ANALYTICS.with(|analytics| {
        let mut map = analytics.borrow_mut();
        if let Some(mut modal_analytics) = map.get(&modal_id) {
            modal_analytics.total_views += 1;
            
            // Recalculate conversion rate
            if modal_analytics.total_views > 0 {
                modal_analytics.conversion_rate = 
                    modal_analytics.successful_payments as f64 / modal_analytics.total_views as f64;
            }
            
            map.insert(modal_id, modal_analytics);
            Ok(())
        } else {
            Err("Modal analytics not found".to_string())
        }
    })
}

#[ic_cdk::query]
fn get_modal_analytics(modal_id: String) -> Result<ModalAnalytics, String> {
    MODAL_ANALYTICS.with(|analytics| {
        analytics.borrow().get(&modal_id)
            .ok_or("Modal analytics not found".to_string())
    })
}

#[ic_cdk::update]
fn generate_modal_embed_code(modal_id: String) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can generate embed codes".to_string());
    }

    let config = MODAL_CONFIGS.with(|configs| {
        configs.borrow().get(&modal_id)
    }).ok_or("Modal configuration not found")?;

    if !config.is_active {
        return Err("Cannot generate embed code for inactive modal".to_string());
    }

    let canister_id = ic_cdk::id().to_text();
    
    let embed_code = format!(
        r#"<script src="https://sdk.ckpayment.io/embed.js"></script>
<script>
  ckPayment.createModal({{
    canisterId: "{}",
    modalId: "{}",
    theme: {{
      primaryColor: "{}",
      backgroundColor: "{}",
      textColor: "{}",
      borderRadius: {},
      fontFamily: "{}"
    }},
    branding: {{
      companyName: "{}",
      logoUrl: "{}"
    }},
    redirectUrls: {{
      successUrl: "{}",
      cancelUrl: "{}"
    }}
  }});
</script>"#,
        canister_id,
        modal_id,
        config.theme.primary_color,
        config.theme.background_color,
        config.theme.text_color,
        config.theme.border_radius,
        config.theme.font_family,
        config.branding.company_name,
        config.branding.logo_url.as_deref().unwrap_or(""),
        config.redirect_urls.success_url,
        config.redirect_urls.cancel_url
    );

    Ok(embed_code)
}

// ============================================================================
// DISCOUNT COUPON SYSTEM METHODS
// ============================================================================

#[ic_cdk::update]
fn create_coupon(mut coupon: DiscountCoupon) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can create coupons".to_string());
    }

    // Validate coupon configuration
    if coupon.code.is_empty() {
        return Err("Coupon code cannot be empty".to_string());
    }
    if coupon.description.is_empty() {
        return Err("Coupon description cannot be empty".to_string());
    }
    
    // Validate coupon type
    match &coupon.coupon_type {
        CouponType::Percentage(percent) => {
            if *percent > 100 {
                return Err("Percentage discount cannot exceed 100%".to_string());
            }
        },
        CouponType::FixedAmount(amount) => {
            if *amount == 0 {
                return Err("Fixed discount amount must be greater than 0".to_string());
            }
        },
        CouponType::FreeShipping => {}
    }

    // Check if coupon code already exists
    let code_exists = DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().iter().any(|(_, existing_coupon)| {
            existing_coupon.code.to_lowercase() == coupon.code.to_lowercase()
        })
    });

    if code_exists {
        return Err("A coupon with this code already exists".to_string());
    }

    // Generate coupon ID
    let coupon_id = NEXT_COUPON_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("coupon_{}", current)
    });

    // Set coupon metadata
    coupon.coupon_id = coupon_id.clone();
    coupon.code = coupon.code.to_uppercase(); // Standardize to uppercase
    coupon.used_count = 0;
    coupon.created_at = ic_cdk::api::time();
    coupon.updated_at = ic_cdk::api::time();

    DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow_mut().insert(coupon_id.clone(), coupon)
    });

    Ok(coupon_id)
}

#[ic_cdk::update]
fn update_coupon(coupon_id: String, mut updated_coupon: DiscountCoupon) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update coupons".to_string());
    }

    // Validate coupon configuration
    if updated_coupon.code.is_empty() {
        return Err("Coupon code cannot be empty".to_string());
    }
    if updated_coupon.description.is_empty() {
        return Err("Coupon description cannot be empty".to_string());
    }
    
    // Validate coupon type
    match &updated_coupon.coupon_type {
        CouponType::Percentage(percent) => {
            if *percent > 100 {
                return Err("Percentage discount cannot exceed 100%".to_string());
            }
        },
        CouponType::FixedAmount(amount) => {
            if *amount == 0 {
                return Err("Fixed discount amount must be greater than 0".to_string());
            }
        },
        CouponType::FreeShipping => {}
    }

    DISCOUNT_COUPONS.with(|coupons| {
        let mut map = coupons.borrow_mut();
        let existing_coupon = map.get(&coupon_id)
            .ok_or("Coupon not found")?;
        
        // Check if the new code conflicts with other coupons (excluding this one)
        let code_conflict = map.iter().any(|(id, coupon)| {
            *id != coupon_id && coupon.code.to_lowercase() == updated_coupon.code.to_lowercase()
        });
        
        if code_conflict {
            return Err("A coupon with this code already exists".to_string());
        }

        // Preserve original metadata
        updated_coupon.coupon_id = coupon_id.clone();
        updated_coupon.code = updated_coupon.code.to_uppercase();
        updated_coupon.used_count = existing_coupon.used_count; // Preserve usage count
        updated_coupon.created_at = existing_coupon.created_at;
        updated_coupon.updated_at = ic_cdk::api::time();
        
        map.insert(coupon_id, updated_coupon);
        Ok(())
    })
}

#[ic_cdk::query]
fn get_coupon(coupon_id: String) -> Result<DiscountCoupon, String> {
    DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().get(&coupon_id)
            .ok_or("Coupon not found".to_string())
    })
}

#[ic_cdk::query]
fn get_coupon_by_code(code: String) -> Result<DiscountCoupon, String> {
    let uppercase_code = code.to_uppercase();
    DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().iter()
            .find(|(_, coupon)| coupon.code == uppercase_code)
            .map(|(_, coupon)| coupon)
            .ok_or("Coupon not found".to_string())
    })
}

#[ic_cdk::query]
fn list_my_coupons() -> Vec<DiscountCoupon> {
    DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().iter().map(|(_, coupon)| coupon).collect()
    })
}

#[ic_cdk::query]
fn list_active_coupons() -> Vec<DiscountCoupon> {
    let current_time = ic_cdk::api::time();
    DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().iter()
            .filter(|(_, coupon)| {
                coupon.is_active && 
                (coupon.expires_at.is_none() || coupon.expires_at.unwrap() > current_time) &&
                (coupon.usage_limit.is_none() || coupon.used_count < coupon.usage_limit.unwrap())
            })
            .map(|(_, coupon)| coupon)
            .collect()
    })
}

#[ic_cdk::update]
fn delete_coupon(coupon_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can delete coupons".to_string());
    }

    DISCOUNT_COUPONS.with(|coupons| {
        let mut map = coupons.borrow_mut();
        if map.remove(&coupon_id).is_none() {
            return Err("Coupon not found".to_string());
        }
        Ok(())
    })?;

    // Clean up usage history for this coupon
    COUPON_USAGE_HISTORY.with(|usage_history| {
        let mut map = usage_history.borrow_mut();
        let usage_ids_to_remove: Vec<String> = map.iter()
            .filter(|(_, usage)| usage.coupon_id == coupon_id)
            .map(|(usage_id, _)| usage_id)
            .collect();
        
        for usage_id in usage_ids_to_remove {
            map.remove(&usage_id);
        }
    });

    Ok(())
}

#[ic_cdk::update]
fn toggle_coupon_status(coupon_id: String) -> Result<bool, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can toggle coupon status".to_string());
    }

    DISCOUNT_COUPONS.with(|coupons| {
        let mut map = coupons.borrow_mut();
        if let Some(mut coupon) = map.get(&coupon_id) {
            coupon.is_active = !coupon.is_active;
            coupon.updated_at = ic_cdk::api::time();
            let new_status = coupon.is_active;
            map.insert(coupon_id, coupon);
            Ok(new_status)
        } else {
            Err("Coupon not found".to_string())
        }
    })
}

#[ic_cdk::update]
fn validate_and_use_coupon(
    coupon_code: String, 
    invoice_amount: u64, 
    token_symbol: String
) -> Result<(String, u64), String> {
    let uppercase_code = coupon_code.to_uppercase();
    let current_time = ic_cdk::api::time();
    let caller = ic_cdk::caller();
    
    // Find the coupon
    let coupon = DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().iter()
            .find(|(_, coupon)| coupon.code == uppercase_code)
            .map(|(_, coupon)| coupon)
            .ok_or("Coupon not found".to_string())
    })?;

    // Validate coupon
    if !coupon.is_active {
        return Err("Coupon is not active".to_string());
    }

    if let Some(expires_at) = coupon.expires_at {
        if current_time > expires_at {
            return Err("Coupon has expired".to_string());
        }
    }

    if let Some(usage_limit) = coupon.usage_limit {
        if coupon.used_count >= usage_limit {
            return Err("Coupon usage limit reached".to_string());
        }
    }

    if let Some(minimum_amount) = coupon.minimum_amount {
        if invoice_amount < minimum_amount {
            return Err(format!("Minimum purchase amount of {} required", minimum_amount));
        }
    }

    // Check if coupon applies to this token
    if !coupon.applicable_tokens.is_empty() && !coupon.applicable_tokens.contains(&token_symbol) {
        return Err("Coupon is not applicable to this token".to_string());
    }

    // Calculate discount
    let discount_amount = match coupon.coupon_type {
        CouponType::Percentage(percent) => {
            (invoice_amount * percent as u64) / 100
        },
        CouponType::FixedAmount(amount) => {
            if amount > invoice_amount {
                invoice_amount // Cap discount at invoice amount
            } else {
                amount
            }
        },
        CouponType::FreeShipping => 0, // This would be handled in shipping calculation
    };

    // Update coupon usage count
    DISCOUNT_COUPONS.with(|coupons| {
        let mut map = coupons.borrow_mut();
        if let Some(mut updated_coupon) = map.get(&coupon.coupon_id) {
            updated_coupon.used_count += 1;
            updated_coupon.updated_at = current_time;
            map.insert(coupon.coupon_id.clone(), updated_coupon);
        }
    });

    // Record usage
    let usage_id = format!("usage_{}_{}", coupon.coupon_id, current_time);
    let usage = CouponUsage {
        usage_id: usage_id.clone(),
        coupon_id: coupon.coupon_id.clone(),
        user_principal: caller,
        invoice_id: format!("pending_{}", current_time), // This would be updated with actual invoice ID
        discount_applied: discount_amount,
        used_at: current_time,
    };

    COUPON_USAGE_HISTORY.with(|usage_history| {
        usage_history.borrow_mut().insert(usage_id.clone(), usage)
    });

    Ok((coupon.coupon_id, discount_amount))
}

#[ic_cdk::query]
fn get_coupon_usage_stats(coupon_id: String) -> Result<(u32, Vec<CouponUsage>), String> {
    let coupon = DISCOUNT_COUPONS.with(|coupons| {
        coupons.borrow().get(&coupon_id)
            .ok_or("Coupon not found".to_string())
    })?;

    let usage_history: Vec<CouponUsage> = COUPON_USAGE_HISTORY.with(|usage_history| {
        usage_history.borrow().iter()
            .filter(|(_, usage)| usage.coupon_id == coupon_id)
            .map(|(_, usage)| usage)
            .collect()
    });

    Ok((coupon.used_count, usage_history))
}

#[ic_cdk::update]
fn admin_clear_all_coupons() -> Result<u32, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can clear all coupons".to_string());
    }

    let count = DISCOUNT_COUPONS.with(|coupons| {
        let coupon_ids: Vec<String> = coupons.borrow().iter().map(|(id, _)| id).collect();
        let count = coupon_ids.len() as u32;
        let mut map = coupons.borrow_mut();
        for id in coupon_ids {
            map.remove(&id);
        }
        count
    });

    COUPON_USAGE_HISTORY.with(|usage_history| {
        let usage_ids: Vec<String> = usage_history.borrow().iter().map(|(id, _)| id).collect();
        let mut map = usage_history.borrow_mut();
        for id in usage_ids {
            map.remove(&id);
        }
    });

    Ok(count)
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT SYSTEM METHODS
// ============================================================================

// ============================================================================
// SUBSCRIPTION PLAN MANAGEMENT
// ============================================================================

#[ic_cdk::update]
fn create_subscription_plan(mut plan: SubscriptionPlan) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can create subscription plans".to_string());
    }

    // Validate plan configuration
    if plan.name.is_empty() {
        return Err("Plan name cannot be empty".to_string());
    }
    if plan.description.is_empty() {
        return Err("Plan description cannot be empty".to_string());
    }
    if plan.price == 0 {
        return Err("Plan price must be greater than 0".to_string());
    }
    if plan.token.is_empty() {
        return Err("Plan token cannot be empty".to_string());
    }

    // Validate that the token is supported
    let config = CONFIG.with(|c| c.borrow().get().clone());
    let token_exists = config.supported_tokens
        .iter()
        .any(|t| t.symbol == plan.token && t.is_active);
    
    if !token_exists {
        return Err("Token not supported or inactive".to_string());
    }

    // Generate plan ID
    let plan_id = NEXT_SUBSCRIPTION_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("plan_{}", current)
    });

    // Set plan metadata
    plan.plan_id = plan_id.clone();
    plan.created_at = ic_cdk::api::time();
    plan.updated_at = ic_cdk::api::time();

    SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow_mut().insert(plan_id.clone(), plan)
    });

    Ok(plan_id)
}

#[ic_cdk::update]
fn update_subscription_plan(plan_id: String, mut updated_plan: SubscriptionPlan) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update subscription plans".to_string());
    }

    // Validate plan configuration
    if updated_plan.name.is_empty() {
        return Err("Plan name cannot be empty".to_string());
    }
    if updated_plan.description.is_empty() {
        return Err("Plan description cannot be empty".to_string());
    }
    if updated_plan.price == 0 {
        return Err("Plan price must be greater than 0".to_string());
    }
    if updated_plan.token.is_empty() {
        return Err("Plan token cannot be empty".to_string());
    }

    // Validate that the token is supported
    let config = CONFIG.with(|c| c.borrow().get().clone());
    let token_exists = config.supported_tokens
        .iter()
        .any(|t| t.symbol == updated_plan.token && t.is_active);
    
    if !token_exists {
        return Err("Token not supported or inactive".to_string());
    }

    SUBSCRIPTION_PLANS.with(|plans| {
        let mut map = plans.borrow_mut();
        let existing_plan = map.get(&plan_id)
            .ok_or("Subscription plan not found")?;
        
        // Preserve original metadata
        updated_plan.plan_id = plan_id.clone();
        updated_plan.created_at = existing_plan.created_at;
        updated_plan.updated_at = ic_cdk::api::time();
        
        map.insert(plan_id, updated_plan);
        Ok(())
    })
}

#[ic_cdk::query]
fn get_subscription_plan(plan_id: String) -> Result<SubscriptionPlan, String> {
    SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow().get(&plan_id)
            .ok_or("Subscription plan not found".to_string())
    })
}

#[ic_cdk::query]
fn list_subscription_plans() -> Vec<SubscriptionPlan> {
    SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow().iter().map(|(_, plan)| plan).collect()
    })
}

#[ic_cdk::query]
fn list_active_subscription_plans() -> Vec<SubscriptionPlan> {
    SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow().iter()
            .filter(|(_, plan)| plan.is_active)
            .map(|(_, plan)| plan)
            .collect()
    })
}

#[ic_cdk::update]
fn delete_subscription_plan(plan_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can delete subscription plans".to_string());
    }

    // Check if there are any active subscriptions for this plan
    let has_active_subscriptions = SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter()
            .any(|(_, subscription)| {
                subscription.plan_id == plan_id &&
                matches!(subscription.status, SubscriptionStatus::Active | SubscriptionStatus::PendingPayment)
            })
    });

    if has_active_subscriptions {
        return Err("Cannot delete plan with active subscriptions. Cancel subscriptions first.".to_string());
    }

    SUBSCRIPTION_PLANS.with(|plans| {
        let mut map = plans.borrow_mut();
        if map.remove(&plan_id).is_none() {
            return Err("Subscription plan not found".to_string());
        }
        Ok(())
    })
}

#[ic_cdk::update]
fn toggle_subscription_plan_status(plan_id: String) -> Result<bool, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can toggle plan status".to_string());
    }

    SUBSCRIPTION_PLANS.with(|plans| {
        let mut map = plans.borrow_mut();
        if let Some(mut plan) = map.get(&plan_id) {
            plan.is_active = !plan.is_active;
            plan.updated_at = ic_cdk::api::time();
            let new_status = plan.is_active;
            map.insert(plan_id, plan);
            Ok(new_status)
        } else {
            Err("Subscription plan not found".to_string())
        }
    })
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

fn calculate_next_billing_date(current_time: u64, billing_interval: &BillingInterval) -> u64 {
    match billing_interval {
        BillingInterval::Daily => current_time + (24 * 60 * 60 * 1_000_000_000),
        BillingInterval::Weekly => current_time + (7 * 24 * 60 * 60 * 1_000_000_000),
        BillingInterval::Monthly => current_time + (30 * 24 * 60 * 60 * 1_000_000_000), // Approximate
        BillingInterval::Quarterly => current_time + (90 * 24 * 60 * 60 * 1_000_000_000), // Approximate
        BillingInterval::Yearly => current_time + (365 * 24 * 60 * 60 * 1_000_000_000), // Approximate
        BillingInterval::Custom(seconds) => current_time + (seconds * 1_000_000_000),
    }
}

#[ic_cdk::update]
fn create_subscription(plan_id: String, metadata: Vec<(String, String)>) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    // Get the subscription plan
    let plan = SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow().get(&plan_id)
    }).ok_or("Subscription plan not found")?;

    if !plan.is_active {
        return Err("Subscription plan is not active".to_string());
    }

    // Check if plan has subscription limits
    if let Some(max_subscriptions) = plan.max_subscriptions {
        let current_active_count = SUBSCRIPTIONS.with(|subscriptions| {
            subscriptions.borrow().iter()
                .filter(|(_, subscription)| {
                    subscription.plan_id == plan_id &&
                    matches!(subscription.status, SubscriptionStatus::Active | SubscriptionStatus::PendingPayment)
                })
                .count() as u32
        });

        if current_active_count >= max_subscriptions {
            return Err("Subscription plan has reached maximum number of subscriptions".to_string());
        }
    }

    // Check if user already has an active subscription to this plan
    let has_existing_subscription = SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter()
            .any(|(_, subscription)| {
                subscription.subscriber == caller &&
                subscription.plan_id == plan_id &&
                matches!(subscription.status, SubscriptionStatus::Active | SubscriptionStatus::PendingPayment)
            })
    });

    if has_existing_subscription {
        return Err("User already has an active subscription to this plan".to_string());
    }

    // Generate subscription ID
    let subscription_id = NEXT_SUBSCRIPTION_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("sub_{}", current)
    });

    // Calculate billing dates
    let trial_end = plan.trial_period_days.map(|days| {
        current_time + (days as u64 * 24 * 60 * 60 * 1_000_000_000)
    });

    let next_billing_date = if trial_end.is_some() {
        trial_end.unwrap()
    } else {
        calculate_next_billing_date(current_time, &plan.billing_interval)
    };

    let current_period_end = calculate_next_billing_date(current_time, &plan.billing_interval);

    let subscription = Subscription {
        subscription_id: subscription_id.clone(),
        plan_id: plan_id.clone(),
        subscriber: caller,
        status: if trial_end.is_some() {
            SubscriptionStatus::Active // Free trial is active
        } else {
            SubscriptionStatus::PendingPayment // Needs initial payment
        },
        current_period_start: current_time,
        current_period_end,
        next_billing_date,
        trial_end,
        cancelled_at: None,
        cancel_at_period_end: false,
        total_payments: 0,
        payment_failures: 0,
        metadata,
        created_at: current_time,
        updated_at: current_time,
    };

    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow_mut().insert(subscription_id.clone(), subscription)
    });

    Ok(subscription_id)
}

#[ic_cdk::query]
fn get_subscription(subscription_id: String) -> Result<Subscription, String> {
    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().get(&subscription_id)
            .ok_or("Subscription not found".to_string())
    })
}

#[ic_cdk::query]
fn list_user_subscriptions(user: Principal) -> Vec<Subscription> {
    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter()
            .filter(|(_, subscription)| subscription.subscriber == user)
            .map(|(_, subscription)| subscription)
            .collect()
    })
}

#[ic_cdk::query]
fn list_my_subscriptions() -> Vec<Subscription> {
    let caller = ic_cdk::caller();
    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter()
            .filter(|(_, subscription)| subscription.subscriber == caller)
            .map(|(_, subscription)| subscription)
            .collect()
    })
}

#[ic_cdk::query]
fn list_subscriptions_by_plan(plan_id: String) -> Vec<Subscription> {
    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter()
            .filter(|(_, subscription)| subscription.plan_id == plan_id)
            .map(|(_, subscription)| subscription)
            .collect()
    })
}

#[ic_cdk::query]
fn list_all_subscriptions() -> Vec<Subscription> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return vec![];
    }

    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter().map(|(_, subscription)| subscription).collect()
    })
}

#[ic_cdk::update]
fn cancel_subscription(subscription_id: String, cancel_immediately: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    SUBSCRIPTIONS.with(|subscriptions| {
        let mut map = subscriptions.borrow_mut();
        let mut subscription = map.get(&subscription_id)
            .ok_or("Subscription not found")?;
        
        // Check authorization - only subscriber or owner can cancel
        let owner = OWNER.with(|o| *o.borrow().get());
        if caller != subscription.subscriber && caller != owner {
            return Err("Only the subscriber or owner can cancel this subscription".to_string());
        }

        // Check if already cancelled
        if matches!(subscription.status, SubscriptionStatus::Cancelled) {
            return Err("Subscription is already cancelled".to_string());
        }

        if cancel_immediately {
            subscription.status = SubscriptionStatus::Cancelled;
            subscription.cancelled_at = Some(current_time);
        } else {
            // Cancel at end of current period
            subscription.cancel_at_period_end = true;
        }
        
        subscription.updated_at = current_time;
        map.insert(subscription_id, subscription);
        Ok(())
    })
}

#[ic_cdk::update]
fn pause_subscription(subscription_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    SUBSCRIPTIONS.with(|subscriptions| {
        let mut map = subscriptions.borrow_mut();
        let mut subscription = map.get(&subscription_id)
            .ok_or("Subscription not found")?;
        
        // Check authorization - only subscriber or owner can pause
        let owner = OWNER.with(|o| *o.borrow().get());
        if caller != subscription.subscriber && caller != owner {
            return Err("Only the subscriber or owner can pause this subscription".to_string());
        }

        // Check if can be paused
        if !matches!(subscription.status, SubscriptionStatus::Active) {
            return Err("Only active subscriptions can be paused".to_string());
        }

        subscription.status = SubscriptionStatus::Paused;
        subscription.updated_at = current_time;
        map.insert(subscription_id, subscription);
        Ok(())
    })
}

#[ic_cdk::update]
fn resume_subscription(subscription_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    SUBSCRIPTIONS.with(|subscriptions| {
        let mut map = subscriptions.borrow_mut();
        let mut subscription = map.get(&subscription_id)
            .ok_or("Subscription not found")?;
        
        // Check authorization - only subscriber or owner can resume
        let owner = OWNER.with(|o| *o.borrow().get());
        if caller != subscription.subscriber && caller != owner {
            return Err("Only the subscriber or owner can resume this subscription".to_string());
        }

        // Check if can be resumed
        if !matches!(subscription.status, SubscriptionStatus::Paused) {
            return Err("Only paused subscriptions can be resumed".to_string());
        }

        subscription.status = SubscriptionStatus::Active;
        subscription.updated_at = current_time;
        map.insert(subscription_id, subscription);
        Ok(())
    })
}

#[ic_cdk::update]
fn update_subscription_metadata(subscription_id: String, metadata: Vec<(String, String)>) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    SUBSCRIPTIONS.with(|subscriptions| {
        let mut map = subscriptions.borrow_mut();
        let mut subscription = map.get(&subscription_id)
            .ok_or("Subscription not found")?;
        
        // Check authorization - only subscriber or owner can update
        let owner = OWNER.with(|o| *o.borrow().get());
        if caller != subscription.subscriber && caller != owner {
            return Err("Only the subscriber or owner can update this subscription".to_string());
        }

        subscription.metadata = metadata;
        subscription.updated_at = current_time;
        map.insert(subscription_id, subscription);
        Ok(())
    })
}

// ============================================================================
// SUBSCRIPTION PAYMENT PROCESSING
// ============================================================================

#[ic_cdk::update]
fn process_subscription_payment(subscription_id: String) -> Result<String, String> {
    let _caller = ic_cdk::caller();
    let current_time = ic_cdk::api::time();
    
    // Get subscription
    let mut subscription = SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().get(&subscription_id)
    }).ok_or("Subscription not found")?;

    // Get plan
    let plan = SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow().get(&subscription.plan_id)
    }).ok_or("Subscription plan not found")?;

    // Check if payment is due
    if current_time < subscription.next_billing_date {
        return Err("Payment is not yet due".to_string());
    }

    // Generate payment ID
    let payment_id = format!("pay_{}_{}", subscription_id, current_time);
    
    // Create subscription payment record
    let subscription_payment = SubscriptionPayment {
        payment_id: payment_id.clone(),
        subscription_id: subscription_id.clone(),
        amount: plan.price,
        token: plan.token.clone(),
        billing_period_start: subscription.current_period_start,
        billing_period_end: subscription.current_period_end,
        payment_date: current_time,
        status: "pending".to_string(),
        transaction_id: None,
        failure_reason: None,
    };

    // In a real implementation, you would integrate with actual payment processing here
    // For this demo, we'll simulate successful payment
    let mut updated_payment = subscription_payment.clone();
    updated_payment.status = "paid".to_string();
    
    // Update subscription
    subscription.status = SubscriptionStatus::Active;
    subscription.current_period_start = subscription.current_period_end;
    subscription.current_period_end = calculate_next_billing_date(subscription.current_period_end, &plan.billing_interval);
    subscription.next_billing_date = subscription.current_period_end;
    subscription.total_payments += plan.price;
    subscription.payment_failures = 0; // Reset failure count on successful payment
    subscription.updated_at = current_time;
    
    // If subscription was set to cancel at period end, cancel it now
    if subscription.cancel_at_period_end {
        subscription.status = SubscriptionStatus::Cancelled;
        subscription.cancelled_at = Some(current_time);
    }

    // Store updated subscription
    SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow_mut().insert(subscription_id.clone(), subscription)
    });

    // Store payment record
    SUBSCRIPTION_PAYMENTS.with(|payments| {
        payments.borrow_mut().insert(payment_id.clone(), updated_payment)
    });

    Ok(payment_id)
}

#[ic_cdk::query]
fn get_subscription_payment(payment_id: String) -> Result<SubscriptionPayment, String> {
    SUBSCRIPTION_PAYMENTS.with(|payments| {
        payments.borrow().get(&payment_id)
            .ok_or("Subscription payment not found".to_string())
    })
}

#[ic_cdk::query]
fn list_subscription_payments(subscription_id: String) -> Vec<SubscriptionPayment> {
    SUBSCRIPTION_PAYMENTS.with(|payments| {
        payments.borrow().iter()
            .filter(|(_, payment)| payment.subscription_id == subscription_id)
            .map(|(_, payment)| payment)
            .collect()
    })
}

// ============================================================================
// SUBSCRIPTION ADMIN METHODS
// ============================================================================

#[ic_cdk::update]
fn admin_clear_all_subscriptions() -> Result<u32, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can clear all subscriptions".to_string());
    }

    // Clear subscription plans
    let plan_count = SUBSCRIPTION_PLANS.with(|plans| {
        let plan_ids: Vec<String> = plans.borrow().iter().map(|(id, _)| id).collect();
        let count = plan_ids.len() as u32;
        let mut map = plans.borrow_mut();
        for id in plan_ids {
            map.remove(&id);
        }
        count
    });

    // Clear subscriptions
    let subscription_count = SUBSCRIPTIONS.with(|subscriptions| {
        let subscription_ids: Vec<String> = subscriptions.borrow().iter().map(|(id, _)| id).collect();
        let count = subscription_ids.len() as u32;
        let mut map = subscriptions.borrow_mut();
        for id in subscription_ids {
            map.remove(&id);
        }
        count
    });

    // Clear subscription payments
    SUBSCRIPTION_PAYMENTS.with(|payments| {
        let payment_ids: Vec<String> = payments.borrow().iter().map(|(id, _)| id).collect();
        let mut map = payments.borrow_mut();
        for id in payment_ids {
            map.remove(&id);
        }
    });

    Ok(plan_count + subscription_count)
}

#[ic_cdk::query]
fn get_subscription_stats() -> (u32, u32, u32) {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return (0, 0, 0);
    }

    let plan_count = SUBSCRIPTION_PLANS.with(|plans| {
        plans.borrow().len() as u32
    });

    let subscription_count = SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().len() as u32
    });

    let active_subscription_count = SUBSCRIPTIONS.with(|subscriptions| {
        subscriptions.borrow().iter()
            .filter(|(_, subscription)| matches!(subscription.status, SubscriptionStatus::Active))
            .count() as u32
    });

    (plan_count, subscription_count, active_subscription_count)
}

// ============================================================================
// PRODUCT MANAGEMENT METHODS
// ============================================================================

#[ic_cdk::update]
fn create_product(mut product: Product) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can create products".to_string());
    }

    // Validate product configuration
    if product.name.is_empty() {
        return Err("Product name cannot be empty".to_string());
    }
    if product.description.is_empty() {
        return Err("Product description cannot be empty".to_string());
    }
    if product.price == 0 {
        return Err("Product price must be greater than 0".to_string());
    }
    if product.token_symbol.is_empty() {
        return Err("Product token symbol cannot be empty".to_string());
    }

    // Validate that the token is supported
    let config = CONFIG.with(|c| c.borrow().get().clone());
    let token_exists = config.supported_tokens
        .iter()
        .any(|t| t.symbol == product.token_symbol && t.is_active);
    
    if !token_exists {
        return Err("Token not supported or inactive".to_string());
    }

    // Generate product ID
    let product_id = NEXT_PRODUCT_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("product_{}", current)
    });

    // Set product metadata
    product.product_id = product_id.clone();
    product.created_at = ic_cdk::api::time();
    product.updated_at = ic_cdk::api::time();

    // Store the product
    PRODUCTS.with(|products| {
        products.borrow_mut().insert(product_id.clone(), product)
    });

    // Initialize sales stats for this product
    let sales_stats = ProductSalesStats {
        product_id: product_id.clone(),
        total_sales: 0,
        total_revenue: 0,
        units_sold: 0,
        last_sale_at: None,
    };
    
    PRODUCT_SALES_STATS.with(|stats| {
        stats.borrow_mut().insert(product_id.clone(), sales_stats)
    });

    Ok(product_id)
}

#[ic_cdk::update]
fn update_product(product_id: String, mut updated_product: Product) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update products".to_string());
    }

    // Validate product configuration
    if updated_product.name.is_empty() {
        return Err("Product name cannot be empty".to_string());
    }
    if updated_product.description.is_empty() {
        return Err("Product description cannot be empty".to_string());
    }
    if updated_product.price == 0 {
        return Err("Product price must be greater than 0".to_string());
    }
    if updated_product.token_symbol.is_empty() {
        return Err("Product token symbol cannot be empty".to_string());
    }

    // Validate that the token is supported
    let config = CONFIG.with(|c| c.borrow().get().clone());
    let token_exists = config.supported_tokens
        .iter()
        .any(|t| t.symbol == updated_product.token_symbol && t.is_active);
    
    if !token_exists {
        return Err("Token not supported or inactive".to_string());
    }

    PRODUCTS.with(|products| {
        let mut map = products.borrow_mut();
        let existing_product = map.get(&product_id)
            .ok_or("Product not found")?;
        
        // Preserve original metadata
        updated_product.product_id = product_id.clone();
        updated_product.created_at = existing_product.created_at;
        updated_product.updated_at = ic_cdk::api::time();
        
        map.insert(product_id, updated_product);
        Ok(())
    })
}

#[ic_cdk::query]
fn get_product(product_id: String) -> Result<Product, String> {
    PRODUCTS.with(|products| {
        products.borrow().get(&product_id)
            .ok_or("Product not found".to_string())
    })
}

#[ic_cdk::query]
fn list_products() -> Vec<Product> {
    PRODUCTS.with(|products| {
        products.borrow().iter().map(|(_, product)| product).collect()
    })
}

#[ic_cdk::query]
fn list_active_products() -> Vec<Product> {
    PRODUCTS.with(|products| {
        products.borrow().iter()
            .filter(|(_, product)| matches!(product.status, ProductStatus::Active))
            .map(|(_, product)| product)
            .collect()
    })
}

#[ic_cdk::query]
fn list_products_by_category(category: String) -> Vec<Product> {
    PRODUCTS.with(|products| {
        products.borrow().iter()
            .filter(|(_, product)| {
                product.category.as_ref().map_or(false, |cat| cat == &category)
            })
            .map(|(_, product)| product)
            .collect()
    })
}

#[ic_cdk::query]
fn list_products_by_token(token_symbol: String) -> Vec<Product> {
    PRODUCTS.with(|products| {
        products.borrow().iter()
            .filter(|(_, product)| product.token_symbol == token_symbol)
            .map(|(_, product)| product)
            .collect()
    })
}

#[ic_cdk::update]
fn delete_product(product_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can delete products".to_string());
    }

    PRODUCTS.with(|products| {
        let mut map = products.borrow_mut();
        if map.remove(&product_id).is_none() {
            return Err("Product not found".to_string());
        }
        Ok(())
    })?;

    // Also remove sales statistics
    PRODUCT_SALES_STATS.with(|stats| {
        stats.borrow_mut().remove(&product_id)
    });

    Ok(())
}

#[ic_cdk::update]
fn toggle_product_status(product_id: String) -> Result<ProductStatus, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can toggle product status".to_string());
    }

    PRODUCTS.with(|products| {
        let mut map = products.borrow_mut();
        if let Some(mut product) = map.get(&product_id) {
            product.status = match product.status {
                ProductStatus::Active => ProductStatus::Inactive,
                ProductStatus::Inactive => ProductStatus::Active,
                ProductStatus::OutOfStock => ProductStatus::Active,
            };
            product.updated_at = ic_cdk::api::time();
            let new_status = product.status.clone();
            map.insert(product_id, product);
            Ok(new_status)
        } else {
            Err("Product not found".to_string())
        }
    })
}

#[ic_cdk::update]
fn update_product_inventory(product_id: String, inventory_count: Option<u32>) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can update product inventory".to_string());
    }

    PRODUCTS.with(|products| {
        let mut map = products.borrow_mut();
        if let Some(mut product) = map.get(&product_id) {
            product.inventory_count = inventory_count;
            product.updated_at = ic_cdk::api::time();
            
            // Update status based on inventory
            if let Some(count) = inventory_count {
                if count == 0 && matches!(product.status, ProductStatus::Active) {
                    product.status = ProductStatus::OutOfStock;
                } else if count > 0 && matches!(product.status, ProductStatus::OutOfStock) {
                    product.status = ProductStatus::Active;
                }
            }
            
            map.insert(product_id, product);
            Ok(())
        } else {
            Err("Product not found".to_string())
        }
    })
}

#[ic_cdk::query]
fn get_product_sales_stats(product_id: String) -> Result<ProductSalesStats, String> {
    PRODUCT_SALES_STATS.with(|stats| {
        stats.borrow().get(&product_id)
            .ok_or("Product sales statistics not found".to_string())
    })
}

#[ic_cdk::query]
fn list_all_product_sales_stats() -> Vec<ProductSalesStats> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return vec![];
    }

    PRODUCT_SALES_STATS.with(|stats| {
        stats.borrow().iter().map(|(_, stat)| stat).collect()
    })
}

#[ic_cdk::query]
fn get_product_categories() -> Vec<String> {
    PRODUCTS.with(|products| {
        let mut categories: std::collections::HashSet<String> = std::collections::HashSet::new();
        
        for (_, product) in products.borrow().iter() {
            if let Some(category) = &product.category {
                categories.insert(category.clone());
            }
        }
        
        categories.into_iter().collect()
    })
}

// Helper function to update product sales stats
fn update_product_sales_stats(product_id: &str, sale_amount: u64) {
    let current_time = ic_cdk::api::time();
    let product_id_string = product_id.to_string();
    
    PRODUCT_SALES_STATS.with(|stats| {
        let mut map = stats.borrow_mut();
        if let Some(mut product_stats) = map.get(&product_id_string) {
            product_stats.total_sales += 1;
            product_stats.total_revenue += sale_amount;
            product_stats.units_sold += 1;
            product_stats.last_sale_at = Some(current_time);
            
            map.insert(product_id_string.clone(), product_stats);
        }
    });
    
    // Update inventory if applicable
    PRODUCTS.with(|products| {
        let mut map = products.borrow_mut();
        if let Some(mut product) = map.get(&product_id_string) {
            if let Some(current_inventory) = product.inventory_count {
                if current_inventory > 0 {
                    product.inventory_count = Some(current_inventory - 1);
                    
                    // Mark as out of stock if inventory reaches 0
                    if current_inventory == 1 {
                        product.status = ProductStatus::OutOfStock;
                    }
                    
                    product.updated_at = current_time;
                    map.insert(product_id_string, product);
                }
            }
        }
    });
}

// ============================================================================
// PRODUCT-BASED INVOICE CREATION
// ============================================================================

#[ic_cdk::update]
fn create_invoice_for_product(
    product_id: String,
    quantity: u32,
    metadata: Vec<(String, String)>
) -> Result<PaymentInvoice, String> {
    if quantity == 0 {
        return Err("Quantity must be greater than 0".to_string());
    }

    // Get the product
    let product = PRODUCTS.with(|products| {
        products.borrow().get(&product_id)
    }).ok_or("Product not found")?;

    // Check if product is active and available
    if !matches!(product.status, ProductStatus::Active) {
        return Err("Product is not available for purchase".to_string());
    }

    // Check inventory if applicable
    if let Some(inventory) = product.inventory_count {
        if inventory < quantity {
            return Err(format!(
                "Insufficient inventory. Available: {}, Requested: {}", 
                inventory, quantity
            ));
        }
    }

    // Get the token configuration for this product
    let config = CONFIG.with(|c| c.borrow().get().clone());
    let token = config.supported_tokens
        .iter()
        .find(|t| t.symbol == product.token_symbol && t.is_active)
        .ok_or("Product token not supported or inactive")?
        .clone();

    // Calculate total amount
    let total_amount = product.price * quantity as u64;

    // Generate invoice ID
    let invoice_id = NEXT_INVOICE_ID.with(|id| {
        let current = *id.borrow().get();
        id.borrow_mut().set(current + 1).unwrap();
        format!("inv_{}", current)
    });

    // Create enhanced metadata with product information
    let mut enhanced_metadata = metadata;
    enhanced_metadata.push(("product_id".to_string(), product_id));
    enhanced_metadata.push(("product_name".to_string(), product.name.clone()));
    enhanced_metadata.push(("quantity".to_string(), quantity.to_string()));
    enhanced_metadata.push(("unit_price".to_string(), product.price.to_string()));
    if let Some(category) = &product.category {
        enhanced_metadata.push(("category".to_string(), category.clone()));
    }

    let invoice = PaymentInvoice {
        id: invoice_id.clone(),
        merchant: OWNER.with(|o| *o.borrow().get()),
        amount: total_amount,
        token,
        description: format!("{} (Qty: {})", product.name, quantity),
        metadata: enhanced_metadata,
        expires_at: Some(ic_cdk::api::time() + (24 * 60 * 60 * 1_000_000_000)), // 24 hours
        created_at: ic_cdk::api::time(),
        status: InvoiceStatus::Created,
    };

    INVOICES.with(|invoices| invoices.borrow_mut().insert(invoice_id, invoice.clone()));
    Ok(invoice)
}

#[ic_cdk::update]
fn admin_clear_all_products() -> Result<u32, String> {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return Err("Only the owner can clear all products".to_string());
    }

    // Clear products (except the default one)
    let count = PRODUCTS.with(|products| {
        let product_ids: Vec<String> = products.borrow().iter()
            .filter(|(id, _)| *id != "product_1") // Keep default product
            .map(|(id, _)| id)
            .collect();
        let count = product_ids.len() as u32;
        let mut map = products.borrow_mut();
        for id in product_ids {
            map.remove(&id);
        }
        count
    });

    // Clear corresponding sales stats (except for default product)
    PRODUCT_SALES_STATS.with(|stats| {
        let stats_ids: Vec<String> = stats.borrow().iter()
            .filter(|(id, _)| *id != "product_1") // Keep default product stats
            .map(|(id, _)| id)
            .collect();
        let mut map = stats.borrow_mut();
        for id in stats_ids {
            map.remove(&id);
        }
    });

    Ok(count)
}

#[ic_cdk::query]
fn get_product_stats() -> (u32, u32) {
    let caller = ic_cdk::caller();
    let owner = OWNER.with(|o| *o.borrow().get());
    
    if caller != owner {
        return (0, 0);
    }

    let total_products = PRODUCTS.with(|products| {
        products.borrow().len() as u32
    });

    let active_products = PRODUCTS.with(|products| {
        products.borrow().iter()
            .filter(|(_, product)| matches!(product.status, ProductStatus::Active))
            .count() as u32
    });

    (total_products, active_products)
}

// Export candid interface
ic_cdk::export_candid!();
