# Architecture Separation: Factory vs User Payment Canister
## Stripe-Inspired Features Implementation

This document clearly defines what features and logic will be implemented in the **Factory Backend** vs the **User Payment Canister** to maintain proper separation of concerns and avoid confusion.

---

## 🏗️ Current Architecture Overview

### Factory Backend (`src/payment_backend/`)
**Role**: Central management, deployment, and system-wide operations
- Deploys and manages user payment canisters
- Stores canister registry and metadata
- Provides system-wide analytics and monitoring
- Manages WASM updates and versions
- Admin operations and global configurations

### User Payment Canister (`src/user_payment_canister/`)
**Role**: Individual merchant payment processing and data
- Processes payments for specific merchant
- Stores merchant-specific transactions and invoices
- Manages merchant token configurations
- Handles merchant-specific analytics
- Merchant payment settings and customizations

---

## 🎨 Feature 1: Modal Builder with Visual Interface

### 🏭 **Factory Backend Responsibilities**
```rust
// Global modal templates and system-wide configurations
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GlobalModalTemplate {
    pub template_id: String,
    pub template_name: String,
    pub category: String,
    pub preview_url: String,
    pub is_public: bool,
    pub created_by: Principal,
    pub usage_count: u64,
    pub base_theme: ModalTheme,
}

// System-wide modal analytics
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GlobalModalStats {
    pub total_modals_created: u64,
    pub popular_templates: Vec<String>,
    pub conversion_rates_by_template: HashMap<String, f64>,
}
```

**Factory Methods**:
```rust
// Template management (system-wide)
create_global_modal_template(template: GlobalModalTemplate) -> Result<String, String>
list_public_modal_templates() -> Vec<GlobalModalTemplate>
get_modal_template_stats() -> GlobalModalStats
update_template_usage(template_id: String) -> Result<(), String>

// System analytics for modals
get_system_modal_analytics() -> GlobalModalStats
```

**Factory Storage**:
- Global modal templates (public/shareable)
- Template usage statistics
- System-wide modal conversion metrics

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific modal configurations
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

// Merchant-specific modal performance
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ModalAnalytics {
    pub modal_id: String,
    pub total_views: u64,
    pub successful_payments: u64,
    pub conversion_rate: f64,
    pub revenue_generated: u64,
}
```

**User Canister Methods**:
```rust
// Modal management (merchant-specific)
create_modal_config(config: ModalConfig) -> Result<String, String>
update_modal_config(modal_id: String, config: ModalConfig) -> Result<(), String>
get_modal_config(modal_id: String) -> Result<ModalConfig, String>
list_my_modals() -> Vec<ModalConfig>
delete_modal_config(modal_id: String) -> Result<(), String>

// Modal performance tracking
track_modal_view(modal_id: String) -> Result<(), String>
get_modal_analytics(modal_id: String) -> Result<ModalAnalytics, String>

// Code generation (merchant-specific)
generate_modal_embed_code(modal_id: String) -> Result<String, String>
```

**User Canister Storage**:
- Merchant's modal configurations
- Modal-specific analytics and performance data
- Merchant branding and customization settings

---

## 🌐 Feature 2: Hosted Payment Pages Infrastructure

### 🏭 **Factory Backend Responsibilities**
```rust
// System-wide hosted page infrastructure
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct HostedPageInfrastructure {
    pub subdomain_config: SubdomainConfig,
    pub ssl_certificates: Vec<SSLCertificate>,
    pub global_page_templates: Vec<PageTemplate>,
    pub system_performance: HostedPageMetrics,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SubdomainConfig {
    pub base_domain: String, // checkout.ckpayment.io
    pub custom_domains: HashMap<Principal, String>, // merchant custom domains
    pub routing_rules: Vec<RoutingRule>,
}
```

**Factory Methods**:
```rust
// Infrastructure management
configure_hosted_infrastructure() -> Result<(), String>
add_custom_domain(canister_id: Principal, domain: String) -> Result<(), String>
get_hosted_page_templates() -> Vec<PageTemplate>
get_system_hosted_metrics() -> HostedPageMetrics

// Global routing and DNS
resolve_hosted_page_route(session_id: String) -> Result<Principal, String>
```

**Factory Storage**:
- Global hosted page infrastructure
- Custom domain mappings
- System-wide page templates
- Global hosted page performance metrics

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific checkout sessions
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct HostedCheckoutSession {
    pub session_id: String,
    pub modal_config_id: String,
    pub amount: u64,
    pub currency_token: String,
    pub customer_email: Option<String>,
    pub metadata: HashMap<String, String>,
    pub status: CheckoutStatus,
    pub payment_intent_id: Option<String>,
    pub expires_at: u64,
    pub created_at: u64,
    pub custom_domain: Option<String>,
}

// Session management for specific merchant
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CheckoutSessionAnalytics {
    pub total_sessions: u64,
    pub completed_sessions: u64,
    pub abandonment_rate: f64,
    pub average_completion_time: u64,
}
```

**User Canister Methods**:
```rust
// Session management (merchant-specific)
create_checkout_session(
    modal_config_id: String,
    amount: u64,
    currency_token: String,
    metadata: HashMap<String, String>
) -> Result<HostedCheckoutSession, String>

get_checkout_session(session_id: String) -> Result<HostedCheckoutSession, String>
complete_checkout_session(session_id: String, transaction_id: String) -> Result<(), String>
expire_old_sessions() -> Result<u32, String>

// Merchant session analytics
get_checkout_session_analytics() -> CheckoutSessionAnalytics
```

**User Canister Storage**:
- Merchant's checkout sessions
- Session-specific payment data
- Merchant checkout analytics

---

## 🧩 Feature 3: Embeddable Components System (Crypto Elements)

### 🏭 **Factory Backend Responsibilities**
```rust
// System-wide component registry and CDN
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ComponentRegistry {
    pub available_components: Vec<ComponentDefinition>,
    pub component_versions: HashMap<String, Vec<String>>,
    pub cdn_urls: HashMap<String, String>,
    pub usage_statistics: HashMap<String, u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ComponentDefinition {
    pub component_id: String,
    pub name: String,
    pub version: String,
    pub cdn_url: String,
    pub documentation_url: String,
    pub compatibility: Vec<String>, // frameworks
}
```

**Factory Methods**:
```rust
// Component distribution
get_available_components() -> Vec<ComponentDefinition>
get_component_cdn_url(component_id: String, version: String) -> Result<String, String>
track_component_usage(component_id: String, canister_id: Principal) -> Result<(), String>
get_component_usage_stats() -> HashMap<String, u64>

// Component versioning
deploy_component_version(component: ComponentDefinition) -> Result<(), String>
```

**Factory Storage**:
- Component registry and versions
- CDN distribution URLs
- System-wide usage statistics
- Component compatibility matrix

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific element configurations
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ElementConfiguration {
    pub element_id: String,
    pub component_type: String, // PaymentButton, TokenSelector, etc.
    pub theme_overrides: HashMap<String, String>,
    pub validation_rules: HashMap<String, String>,
    pub merchant_branding: BrandingConfig,
    pub is_active: bool,
}

// Element usage tracking
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ElementUsageMetrics {
    pub element_id: String,
    pub total_renders: u64,
    pub successful_interactions: u64,
    pub error_rate: f64,
}
```

**User Canister Methods**:
```rust
// Element configuration (merchant-specific)
configure_payment_element(config: ElementConfiguration) -> Result<String, String>
get_element_configuration(element_id: String) -> Result<ElementConfiguration, String>
list_merchant_elements() -> Vec<ElementConfiguration>

// Element performance tracking
track_element_usage(element_id: String, interaction_type: String) -> Result<(), String>
get_element_metrics(element_id: String) -> Result<ElementUsageMetrics, String>
```

**User Canister Storage**:
- Merchant element configurations
- Element-specific theming and branding
- Merchant element usage metrics

---

## ⚡ Feature 4: One-Click Payment System (Crypto Link)

### 🏭 **Factory Backend Responsibilities**
```rust
// Global one-click infrastructure
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GlobalPaymentNetwork {
    pub registered_merchants: u64,
    pub total_profiles: u64,
    pub cross_merchant_analytics: CrossMerchantMetrics,
    pub fraud_patterns: Vec<FraudPattern>,
    pub global_spending_insights: GlobalSpendingData,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CrossMerchantMetrics {
    pub average_transaction_size: u64,
    pub popular_tokens_globally: Vec<String>,
    pub geographic_distribution: HashMap<String, u64>,
}
```

**Factory Methods**:
```rust
// Global payment network management
register_merchant_for_one_click(canister_id: Principal) -> Result<(), String>
get_global_payment_metrics() -> GlobalPaymentNetwork
validate_cross_merchant_limits(principal: Principal, amount: u64) -> Result<bool, String>

// Fraud detection (system-wide)
analyze_payment_pattern(payment_data: PaymentPattern) -> FraudScore
update_global_fraud_patterns() -> Result<(), String>
```

**Factory Storage**:
- Global merchant registry for one-click
- System-wide fraud patterns
- Cross-merchant analytics
- Global spending pattern analysis

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific payment profiles and authorizations
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PaymentProfile {
    pub profile_id: String,
    pub principal: Principal,
    pub email: Option<String>,
    pub preferred_tokens: Vec<String>,
    pub spending_limits: HashMap<String, SpendingLimit>,
    pub auto_approve_under: u64,
    pub merchant_specific_settings: HashMap<String, String>,
    pub created_at: u64,
    pub last_used: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PreAuthorizedPayment {
    pub auth_id: String,
    pub customer_principal: Principal,
    pub max_amount: u64,
    pub token_symbol: String,
    pub expires_at: u64,
    pub uses_remaining: u32,
    pub merchant_specific_data: HashMap<String, String>,
}
```

**User Canister Methods**:
```rust
// Payment profile management (merchant-specific)
create_payment_profile_for_merchant(principal: Principal, email: Option<String>) -> Result<PaymentProfile, String>
update_merchant_spending_limits(principal: Principal, limits: HashMap<String, SpendingLimit>) -> Result<(), String>

// Pre-authorization management
create_pre_authorization(customer: Principal, max_amount: u64, token: String, duration: u64) -> Result<String, String>
execute_one_click_payment(auth_id: String, amount: u64, metadata: HashMap<String, String>) -> Result<String, String>
revoke_authorization(auth_id: String) -> Result<(), String>

// Merchant-specific analytics
get_merchant_one_click_analytics() -> OneClickAnalytics
```

**User Canister Storage**:
- Merchant-specific payment profiles
- Pre-authorized payments for this merchant
- Merchant one-click payment analytics
- Customer preferences for this merchant

---

## 🔄 Feature 5: Enhanced Multi-Token Support & Auto-Selection

### 🏭 **Factory Backend Responsibilities**
```rust
// Global token pricing and market data
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GlobalTokenMarket {
    pub real_time_rates: HashMap<String, f64>,
    pub market_volatility: HashMap<String, f64>,
    pub liquidity_data: HashMap<String, LiquidityInfo>,
    pub trending_tokens: Vec<String>,
    pub global_fee_estimates: HashMap<String, u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TokenRecommendationEngine {
    pub recommendation_algorithm_version: String,
    pub global_preferences: HashMap<String, f64>, // token popularity scores
    pub market_conditions: MarketConditions,
}
```

**Factory Methods**:
```rust
// Global pricing and market data
get_real_time_rates() -> HashMap<String, f64>
update_global_token_rates() -> Result<(), String>
get_global_fee_estimates() -> HashMap<String, u64>
get_market_conditions() -> MarketConditions

// Recommendation algorithm
get_global_token_recommendations(amount: u64, region: Option<String>) -> Vec<GlobalTokenRecommendation>
update_recommendation_algorithm() -> Result<(), String>
```

**Factory Storage**:
- Global real-time token pricing
- Market volatility and liquidity data
- Global fee estimation models
- Token recommendation algorithms

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific token preferences and customer data
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MerchantTokenPreferences {
    pub preferred_tokens: Vec<String>,
    pub token_priorities: HashMap<String, u32>,
    pub minimum_amounts: HashMap<String, u64>,
    pub merchant_fee_overrides: HashMap<String, u32>,
    pub auto_convert_to: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CustomerTokenHistory {
    pub customer_principal: Principal,
    pub token_usage_frequency: HashMap<String, u32>,
    pub preferred_tokens: Vec<String>,
    pub average_transaction_sizes: HashMap<String, u64>,
    pub last_used_tokens: Vec<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PersonalizedTokenRecommendation {
    pub token_symbol: String,
    pub available_balance: u64,
    pub estimated_fee: u64,
    pub total_cost: u64,
    pub fiat_equivalent: FiatEquivalent,
    pub recommendation_score: f64,
    pub merchant_bonus: f64, // merchant-specific scoring
    pub customer_history_bonus: f64,
    pub recommendation_reason: String,
}
```

**User Canister Methods**:
```rust
// Merchant token preferences
update_merchant_token_preferences(preferences: MerchantTokenPreferences) -> Result<(), String>
get_merchant_token_preferences() -> MerchantTokenPreferences

// Personalized recommendations
get_personalized_token_recommendations(
    customer: Principal, 
    amount: u64
) -> Vec<PersonalizedTokenRecommendation>

track_customer_token_usage(customer: Principal, token: String, amount: u64) -> Result<(), String>

// Merchant-specific pricing
estimate_transaction_cost_for_merchant(token_symbol: String, amount: u64) -> Result<u64, String>
```

**User Canister Storage**:
- Merchant token preferences and priorities
- Customer transaction history with this merchant
- Merchant-specific fee structures
- Personalized recommendation data

---

## 📊 Feature 6: Advanced Analytics Dashboard

### 🏭 **Factory Backend Responsibilities**
```rust
// System-wide analytics and benchmarking
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SystemAnalytics {
    pub total_system_volume: u64,
    pub active_merchants: u64,
    pub system_wide_conversion_rates: f64,
    pub popular_payment_methods: Vec<String>,
    pub geographic_distribution: HashMap<String, MerchantCount>,
    pub system_health_metrics: SystemHealthMetrics,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BenchmarkData {
    pub industry_averages: HashMap<String, f64>,
    pub merchant_performance_percentiles: HashMap<Principal, u32>,
    pub conversion_rate_benchmarks: HashMap<String, f64>,
}
```

**Factory Methods**:
```rust
// System analytics
get_system_analytics() -> SystemAnalytics
get_merchant_benchmarks(canister_id: Principal) -> BenchmarkData
calculate_system_conversion_rates() -> HashMap<String, f64>

// Comparative analytics
get_industry_benchmarks() -> HashMap<String, f64>
compare_merchant_performance(canister_id: Principal) -> PerformanceComparison
```

**Factory Storage**:
- System-wide aggregated metrics
- Industry benchmark data
- Cross-merchant comparative analytics
- System health and performance data

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific detailed analytics
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MerchantAnalytics {
    pub total_volume: HashMap<String, u64>,
    pub transaction_count: u64,
    pub success_rate: f64,
    pub average_transaction_size: u64,
    pub top_tokens: Vec<TokenUsageStats>,
    pub conversion_funnel: ConversionMetrics,
    pub customer_analytics: CustomerBehaviorMetrics,
    pub time_series_data: Vec<TimeSeriesPoint>,
    pub revenue_by_period: HashMap<String, u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct WebhookConfig {
    pub webhook_id: String,
    pub url: String,
    pub events: Vec<WebhookEvent>,
    pub secret: String,
    pub active: bool,
    pub delivery_stats: WebhookDeliveryStats,
}
```

**User Canister Methods**:
```rust
// Detailed merchant analytics
get_payment_analytics(date_range: DateRange) -> MerchantAnalytics
get_conversion_metrics() -> ConversionMetrics
get_customer_behavior_analysis() -> CustomerBehaviorMetrics
get_revenue_breakdown(period: TimePeriod) -> RevenueBreakdown

// Webhook management
configure_webhook(config: WebhookConfig) -> Result<String, String>
test_webhook(webhook_id: String) -> Result<WebhookTestResult, String>
get_webhook_delivery_stats(webhook_id: String) -> WebhookDeliveryStats

// Custom reporting
generate_custom_report(criteria: ReportCriteria) -> Result<CustomReport, String>
schedule_automated_report(schedule: ReportSchedule) -> Result<String, String>
```

**User Canister Storage**:
- Detailed transaction and payment data
- Customer behavior and conversion metrics
- Webhook configurations and delivery logs
- Custom report configurations

---

## 🔒 Feature 7: Enhanced Security & Trust Features

### 🏭 **Factory Backend Responsibilities**
```rust
// System-wide security monitoring
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SystemSecurityConfig {
    pub global_fraud_patterns: Vec<FraudPattern>,
    pub system_rate_limits: HashMap<String, RateLimit>,
    pub blocked_principals: Vec<Principal>,
    pub security_alert_thresholds: HashMap<String, u64>,
    pub compliance_requirements: Vec<ComplianceRule>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GlobalThreatIntelligence {
    pub known_bad_addresses: Vec<String>,
    pub suspicious_patterns: Vec<Pattern>,
    pub threat_score_models: HashMap<String, ThreatModel>,
    pub geographic_risk_scores: HashMap<String, f64>,
}
```

**Factory Methods**:
```rust
// System-wide security
update_global_security_config(config: SystemSecurityConfig) -> Result<(), String>
check_principal_reputation(principal: Principal) -> ReputationScore
add_to_global_blocklist(principal: Principal, reason: String) -> Result<(), String>

// Threat intelligence
get_address_risk_score(address: String) -> RiskScore
update_threat_intelligence() -> Result<(), String>
validate_transaction_against_global_rules(transaction: TransactionData) -> SecurityResult

// Compliance monitoring
check_compliance_requirements(canister_id: Principal) -> ComplianceStatus
generate_compliance_report() -> ComplianceReport
```

**Factory Storage**:
- Global security configurations
- System-wide threat intelligence
- Global blocklists and reputation data
- Compliance monitoring and reporting

### 💰 **User Payment Canister Responsibilities**
```rust
// Merchant-specific security configurations
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MerchantSecurityConfig {
    pub require_2fa_over: u64,
    pub allowed_countries: Vec<String>,
    pub merchant_blocked_addresses: Vec<String>,
    pub custom_rate_limits: RateLimitConfig,
    pub verification_preferences: VerificationPreferences,
    pub risk_tolerance: RiskTolerance,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransactionVerification {
    pub verification_id: String,
    pub transaction_amount: u64,
    pub customer_principal: Principal,
    pub verification_method: VerificationMethod,
    pub status: VerificationStatus,
    pub initiated_at: u64,
    pub expires_at: u64,
    pub attempts: u32,
}
```

**User Canister Methods**:
```rust
// Merchant security configuration
update_security_config(config: MerchantSecurityConfig) -> Result<(), String>
get_security_config() -> MerchantSecurityConfig

// Transaction verification
request_transaction_verification(
    amount: u64, 
    customer: Principal, 
    method: VerificationMethod
) -> Result<TransactionVerification, String>

verify_transaction(verification_id: String, verification_code: String) -> Result<bool, String>

// Merchant-specific fraud detection
analyze_transaction_risk(transaction: TransactionData) -> RiskAssessment
block_address_for_merchant(address: String, reason: String) -> Result<(), String>
get_security_alerts() -> Vec<SecurityAlert>

// Customer verification management
get_customer_verification_status(customer: Principal) -> VerificationStatus
require_additional_verification(customer: Principal, reason: String) -> Result<(), String>
```

**User Canister Storage**:
- Merchant-specific security configurations
- Transaction verification records
- Merchant fraud detection data
- Customer verification statuses

---

## 📋 Summary Table

| Feature | Factory Backend | User Payment Canister |
|---------|----------------|----------------------|
| **Modal Builder** | Global templates, system analytics | Merchant modal configs, performance tracking |
| **Hosted Pages** | Infrastructure, routing, domains | Session management, merchant checkout data |
| **Elements System** | Component registry, CDN, versions | Element configurations, usage metrics |
| **One-Click Payments** | Global network, fraud patterns | Payment profiles, authorizations |
| **Multi-Token Support** | Global pricing, market data | Merchant preferences, customer history |
| **Analytics** | System metrics, benchmarks | Detailed merchant analytics, webhooks |
| **Security** | Global threats, compliance | Merchant security config, verifications |

---

## 🔄 Inter-Canister Communication Patterns

### Factory → User Canister
- Deploy new features via canister upgrades
- Push global security updates
- Provide market data for recommendations
- Send system-wide alerts

### User Canister → Factory
- Report usage statistics
- Request global data (pricing, templates)
- Send security alerts for analysis
- Contribute to system metrics

### User Canister → User Canister
- Cross-merchant one-click authorizations (via Factory mediation)
- Shared fraud intelligence (via Factory)

This separation ensures:
- **Scalability**: User canisters handle merchant-specific load
- **Privacy**: Merchant data stays in their canister
- **Efficiency**: Global data centralized in Factory
- **Security**: Proper isolation between merchants
- **Maintenance**: Clear upgrade and update paths
