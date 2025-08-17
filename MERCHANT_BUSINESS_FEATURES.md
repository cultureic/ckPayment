# Merchant Business Features Extension
## Inventory, Subscriptions & Business Management on ICP

This document extends our Stripe-inspired features with essential **merchant business logic** including item/stock management, ICRC2-based subscriptions, and comprehensive business tools.

---

## 🏪 Feature 8: Item & Inventory Management System

### 💰 **User Payment Canister Responsibilities**
```rust
// Product and inventory management
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Product {
    pub product_id: String,
    pub name: String,
    pub description: String,
    pub price: u64,
    pub currency_token: String,
    pub category: String,
    pub sku: String,
    pub images: Vec<String>,
    pub metadata: HashMap<String, String>,
    pub is_active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct InventoryItem {
    pub product_id: String,
    pub stock_quantity: u64,
    pub reserved_quantity: u64, // items in pending orders
    pub reorder_level: u64,
    pub max_stock: u64,
    pub cost_per_unit: u64,
    pub last_restocked: u64,
    pub supplier_info: Option<SupplierInfo>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SupplierInfo {
    pub supplier_name: String,
    pub contact_email: String,
    pub lead_time_days: u32,
    pub minimum_order_quantity: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ProductVariant {
    pub variant_id: String,
    pub product_id: String,
    pub name: String, // e.g., "Size: Large, Color: Red"
    pub price_adjustment: i64, // positive or negative adjustment
    pub sku_suffix: String,
    pub attributes: HashMap<String, String>, // size: "L", color: "red"
    pub stock_quantity: u64,
    pub is_active: bool,
}

// Order management
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Order {
    pub order_id: String,
    pub customer_principal: Principal,
    pub customer_email: Option<String>,
    pub items: Vec<OrderItem>,
    pub total_amount: u64,
    pub currency_token: String,
    pub status: OrderStatus,
    pub payment_status: PaymentStatus,
    pub shipping_address: Option<ShippingAddress>,
    pub tracking_number: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub notes: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct OrderItem {
    pub product_id: String,
    pub variant_id: Option<String>,
    pub quantity: u64,
    pub unit_price: u64,
    pub total_price: u64,
    pub product_name: String, // snapshot for historical records
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum OrderStatus {
    Pending,
    Confirmed,
    Processing,
    Shipped,
    Delivered,
    Cancelled,
    Refunded,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum PaymentStatus {
    Pending,
    Paid,
    PartiallyPaid,
    Failed,
    Refunded,
    PartiallyRefunded,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ShippingAddress {
    pub name: String,
    pub street_address: String,
    pub city: String,
    pub state: String,
    pub postal_code: String,
    pub country: String,
    pub phone: Option<String>,
}
```

#### User Canister Methods:
```rust
// Product Management
create_product(product: Product) -> Result<String, String>
update_product(product_id: String, product: Product) -> Result<(), String>
get_product(product_id: String) -> Result<Product, String>
list_products(category: Option<String>, active_only: bool) -> Vec<Product>
delete_product(product_id: String) -> Result<(), String>

// Variant Management
create_product_variant(variant: ProductVariant) -> Result<String, String>
update_product_variant(variant_id: String, variant: ProductVariant) -> Result<(), String>
get_product_variants(product_id: String) -> Vec<ProductVariant>
delete_product_variant(variant_id: String) -> Result<(), String>

// Inventory Management
update_stock(product_id: String, variant_id: Option<String>, quantity: u64) -> Result<(), String>
reserve_stock(product_id: String, variant_id: Option<String>, quantity: u64) -> Result<(), String>
release_reserved_stock(product_id: String, variant_id: Option<String>, quantity: u64) -> Result<(), String>
get_inventory_status(product_id: String) -> Result<InventoryItem, String>
get_low_stock_alerts() -> Vec<InventoryAlert>
bulk_update_inventory(updates: Vec<InventoryUpdate>) -> Result<Vec<String>, String>

// Order Management
create_order(order: Order) -> Result<String, String>
update_order_status(order_id: String, status: OrderStatus) -> Result<(), String>
update_payment_status(order_id: String, status: PaymentStatus) -> Result<(), String>
get_order(order_id: String) -> Result<Order, String>
list_orders(status: Option<OrderStatus>, customer: Option<Principal>) -> Vec<Order>
add_tracking_number(order_id: String, tracking_number: String) -> Result<(), String>
cancel_order(order_id: String, reason: String) -> Result<(), String>

// Order Processing Workflow
process_payment_for_order(order_id: String, payment_data: PaymentData) -> Result<String, String>
fulfill_order(order_id: String, shipping_info: ShippingInfo) -> Result<(), String>
```

---

## 📅 Feature 9: Subscription Management with ICRC2 Approve Logic

### 💰 **User Payment Canister Responsibilities**
```rust
// Subscription plans and management
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SubscriptionPlan {
    pub plan_id: String,
    pub name: String,
    pub description: String,
    pub price: u64,
    pub currency_token: String,
    pub billing_interval: BillingInterval,
    pub trial_period_days: Option<u32>,
    pub features: Vec<String>,
    pub max_usage_limits: HashMap<String, u64>, // e.g., "api_calls": 1000
    pub is_active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum BillingInterval {
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
    Custom(u64), // custom interval in seconds
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Subscription {
    pub subscription_id: String,
    pub customer_principal: Principal,
    pub plan_id: String,
    pub status: SubscriptionStatus,
    pub current_period_start: u64,
    pub current_period_end: u64,
    pub trial_end: Option<u64>,
    pub cancel_at_period_end: bool,
    pub cancelled_at: Option<u64>,
    pub billing_history: Vec<BillingRecord>,
    pub usage_tracking: HashMap<String, u64>,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum SubscriptionStatus {
    Trialing,
    Active,
    PastDue,
    Cancelled,
    Unpaid,
    Paused,
}

// ICRC2 Approve-based billing
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SubscriptionApproval {
    pub approval_id: String,
    pub subscription_id: String,
    pub customer_principal: Principal,
    pub token_canister: Principal,
    pub approved_amount: u64, // total amount approved for recurring charges
    pub amount_per_charge: u64, // amount per billing cycle
    pub max_charges: u32, // maximum number of charges allowed
    pub charges_used: u32, // charges already processed
    pub approval_expires_at: u64,
    pub created_at: u64,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BillingRecord {
    pub billing_id: String,
    pub subscription_id: String,
    pub amount: u64,
    pub currency_token: String,
    pub billing_date: u64,
    pub period_start: u64,
    pub period_end: u64,
    pub status: BillingStatus,
    pub transaction_id: Option<String>,
    pub failure_reason: Option<String>,
    pub retry_count: u32,
    pub next_retry_at: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum BillingStatus {
    Pending,
    Paid,
    Failed,
    Retrying,
    Cancelled,
    Refunded,
}

// Usage-based billing
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UsageRecord {
    pub usage_id: String,
    pub subscription_id: String,
    pub usage_type: String, // e.g., "api_calls", "storage_gb", "bandwidth_gb"
    pub quantity: u64,
    pub timestamp: u64,
    pub metadata: HashMap<String, String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UsageBilling {
    pub subscription_id: String,
    pub billing_period_start: u64,
    pub billing_period_end: u64,
    pub usage_summary: HashMap<String, u64>, // usage_type -> total_quantity
    pub base_charge: u64, // subscription base price
    pub usage_charges: HashMap<String, u64>, // usage_type -> charge_amount
    pub total_amount: u64,
    pub overage_details: Vec<OverageCharge>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct OverageCharge {
    pub usage_type: String,
    pub included_quantity: u64,
    pub actual_quantity: u64,
    pub overage_quantity: u64,
    pub rate_per_unit: u64,
    pub total_overage_charge: u64,
}
```

#### User Canister Methods:
```rust
// Subscription Plan Management
create_subscription_plan(plan: SubscriptionPlan) -> Result<String, String>
update_subscription_plan(plan_id: String, plan: SubscriptionPlan) -> Result<(), String>
get_subscription_plan(plan_id: String) -> Result<SubscriptionPlan, String>
list_subscription_plans(active_only: bool) -> Vec<SubscriptionPlan>
archive_subscription_plan(plan_id: String) -> Result<(), String>

// Customer Subscription Management
create_subscription(customer: Principal, plan_id: String, trial_days: Option<u32>) -> Result<String, String>
update_subscription_plan_for_customer(subscription_id: String, new_plan_id: String) -> Result<(), String>
cancel_subscription(subscription_id: String, cancel_immediately: bool) -> Result<(), String>
pause_subscription(subscription_id: String, pause_until: Option<u64>) -> Result<(), String>
resume_subscription(subscription_id: String) -> Result<(), String>
get_customer_subscriptions(customer: Principal) -> Vec<Subscription>

// ICRC2 Approve-based Billing Setup
request_subscription_approval(
    subscription_id: String,
    customer: Principal,
    token_canister: Principal,
    billing_cycles: u32
) -> Result<SubscriptionApproval, String>

validate_subscription_approval(approval_id: String) -> Result<bool, String>
refresh_subscription_approval(approval_id: String, additional_cycles: u32) -> Result<(), String>

// Billing Processing
process_subscription_billing(subscription_id: String) -> Result<BillingRecord, String>
retry_failed_billing(billing_id: String) -> Result<(), String>
get_billing_history(subscription_id: String) -> Vec<BillingRecord>
get_upcoming_billings(days_ahead: u32) -> Vec<UpcomingBilling>

// Usage Tracking & Billing
track_usage(subscription_id: String, usage_type: String, quantity: u64, metadata: HashMap<String, String>) -> Result<(), String>
get_usage_summary(subscription_id: String, period_start: u64, period_end: u64) -> HashMap<String, u64>
calculate_usage_billing(subscription_id: String, period_start: u64, period_end: u64) -> Result<UsageBilling, String>
reset_usage_tracking(subscription_id: String) -> Result<(), String>

// Subscription Analytics
get_subscription_metrics() -> SubscriptionMetrics
get_churn_analysis(period_start: u64, period_end: u64) -> ChurnAnalysis
get_revenue_recognition(period_start: u64, period_end: u64) -> RevenueRecognition
```

---

## 💳 Feature 10: Customer Management & CRM

### 💰 **User Payment Canister Responsibilities**
```rust
// Customer profiles and relationship management
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Customer {
    pub customer_id: String,
    pub principal: Principal,
    pub email: String,
    pub name: Option<String>,
    pub phone: Option<String>,
    pub default_shipping_address: Option<ShippingAddress>,
    pub billing_address: Option<ShippingAddress>,
    pub customer_since: u64,
    pub total_spent: u64,
    pub total_orders: u64,
    pub loyalty_points: u64,
    pub tags: Vec<String>, // e.g., "vip", "bulk_buyer"
    pub notes: Vec<CustomerNote>,
    pub communication_preferences: CommunicationPreferences,
    pub is_active: bool,
    pub last_activity: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CustomerNote {
    pub note_id: String,
    pub content: String,
    pub created_by: String, // staff member or system
    pub created_at: u64,
    pub is_internal: bool, // hidden from customer
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CommunicationPreferences {
    pub email_marketing: bool,
    pub sms_notifications: bool,
    pub order_updates: bool,
    pub promotional_offers: bool,
    pub preferred_language: String,
    pub timezone: String,
}

// Customer segments and targeting
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CustomerSegment {
    pub segment_id: String,
    pub name: String,
    pub description: String,
    pub criteria: Vec<SegmentCriteria>,
    pub customer_count: u64,
    pub created_at: u64,
    pub updated_at: u64,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SegmentCriteria {
    pub field: String, // e.g., "total_spent", "order_count", "last_activity"
    pub operator: ComparisonOperator, // greater_than, equals, contains, etc.
    pub value: String,
    pub condition: LogicalOperator, // and, or
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ComparisonOperator {
    Equals,
    NotEquals,
    GreaterThan,
    LessThan,
    GreaterThanOrEqual,
    LessThanOrEqual,
    Contains,
    NotContains,
    StartsWith,
    EndsWith,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum LogicalOperator {
    And,
    Or,
}
```

#### User Canister Methods:
```rust
// Customer Management
create_customer(customer: Customer) -> Result<String, String>
update_customer(customer_id: String, customer: Customer) -> Result<(), String>
get_customer(customer_id: String) -> Result<Customer, String>
get_customer_by_principal(principal: Principal) -> Result<Customer, String>
get_customer_by_email(email: String) -> Result<Customer, String>
list_customers(segment_id: Option<String>, active_only: bool) -> Vec<Customer>
add_customer_note(customer_id: String, note: CustomerNote) -> Result<(), String>
update_customer_tags(customer_id: String, tags: Vec<String>) -> Result<(), String>

// Customer Analytics
get_customer_lifetime_value(customer_id: String) -> CustomerLifetimeValue
get_customer_order_history(customer_id: String) -> Vec<Order>
get_customer_subscription_history(customer_id: String) -> Vec<Subscription>
calculate_customer_churn_risk(customer_id: String) -> ChurnRiskScore

// Customer Segmentation
create_customer_segment(segment: CustomerSegment) -> Result<String, String>
update_customer_segment(segment_id: String, segment: CustomerSegment) -> Result<(), String>
get_customers_in_segment(segment_id: String) -> Vec<String> // customer_ids
refresh_segment_membership(segment_id: String) -> Result<u64, String> // returns count
list_customer_segments() -> Vec<CustomerSegment>

// Loyalty & Rewards
award_loyalty_points(customer_id: String, points: u64, reason: String) -> Result<(), String>
redeem_loyalty_points(customer_id: String, points: u64, order_id: String) -> Result<(), String>
get_customer_loyalty_status(customer_id: String) -> LoyaltyStatus
```

---

## 🎁 Feature 11: Discounts, Coupons & Promotions

### 💰 **User Payment Canister Responsibilities**
```rust
// Discount and promotion system
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Discount {
    pub discount_id: String,
    pub name: String,
    pub description: String,
    pub discount_type: DiscountType,
    pub value: u64, // percentage (0-10000 = 0-100%) or fixed amount
    pub applies_to: DiscountApplication,
    pub minimum_order_amount: Option<u64>,
    pub maximum_discount_amount: Option<u64>,
    pub usage_limit: Option<u64>,
    pub usage_count: u64,
    pub customer_usage_limit: Option<u64>, // per customer
    pub valid_from: u64,
    pub valid_until: Option<u64>,
    pub is_active: bool,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum DiscountType {
    Percentage,
    FixedAmount,
    BuyXGetY { buy_quantity: u64, get_quantity: u64 },
    FreeShipping,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum DiscountApplication {
    EntireOrder,
    SpecificProducts(Vec<String>), // product_ids
    ProductCategory(String),
    CustomerSegment(String),
    FirstTimeCustomers,
    SubscriptionPlans(Vec<String>), // plan_ids
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Coupon {
    pub coupon_id: String,
    pub code: String, // e.g., "SAVE20", "WELCOME10"
    pub discount_id: String,
    pub usage_count: u64,
    pub customer_usage: HashMap<String, u64>, // customer_id -> usage_count
    pub is_active: bool,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PromotionCampaign {
    pub campaign_id: String,
    pub name: String,
    pub description: String,
    pub discounts: Vec<String>, // discount_ids
    pub target_segments: Vec<String>, // segment_ids
    pub start_date: u64,
    pub end_date: u64,
    pub budget_limit: Option<u64>,
    pub current_spend: u64,
    pub performance_metrics: CampaignMetrics,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CampaignMetrics {
    pub impressions: u64,
    pub clicks: u64,
    pub conversions: u64,
    pub revenue_generated: u64,
    pub cost_per_conversion: f64,
    pub return_on_investment: f64,
}
```

#### User Canister Methods:
```rust
// Discount Management
create_discount(discount: Discount) -> Result<String, String>
update_discount(discount_id: String, discount: Discount) -> Result<(), String>
get_discount(discount_id: String) -> Result<Discount, String>
list_active_discounts() -> Vec<Discount>
deactivate_discount(discount_id: String) -> Result<(), String>

// Coupon Management
create_coupon(coupon: Coupon) -> Result<String, String>
validate_coupon(code: String, customer_id: String, order_amount: u64) -> Result<DiscountApplication, String>
apply_coupon(code: String, customer_id: String) -> Result<String, String> // returns discount_id
get_coupon_usage_stats(code: String) -> CouponUsageStats
bulk_create_coupons(discount_id: String, count: u32, prefix: String) -> Result<Vec<String>, String>

// Promotion Campaigns
create_promotion_campaign(campaign: PromotionCampaign) -> Result<String, String>
update_campaign_metrics(campaign_id: String, metrics: CampaignMetrics) -> Result<(), String>
get_active_campaigns() -> Vec<PromotionCampaign>
get_campaign_performance(campaign_id: String) -> CampaignMetrics

// Order Discount Application
calculate_order_discounts(order_items: Vec<OrderItem>, customer_id: String) -> Vec<AppliedDiscount>
apply_automatic_discounts(order: &mut Order) -> Result<Vec<AppliedDiscount>, String>
```

---

## 📊 Feature 12: Business Intelligence & Reporting

### 💰 **User Payment Canister Responsibilities**
```rust
// Advanced business analytics
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BusinessMetrics {
    pub revenue_metrics: RevenueMetrics,
    pub customer_metrics: CustomerMetrics,
    pub product_metrics: ProductMetrics,
    pub subscription_metrics: SubscriptionMetrics,
    pub operational_metrics: OperationalMetrics,
    pub period_start: u64,
    pub period_end: u64,
    pub generated_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RevenueMetrics {
    pub total_revenue: u64,
    pub recurring_revenue: u64,
    pub one_time_revenue: u64,
    pub revenue_by_token: HashMap<String, u64>,
    pub average_order_value: u64,
    pub revenue_growth_rate: f64,
    pub monthly_recurring_revenue: u64,
    pub annual_run_rate: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CustomerMetrics {
    pub total_customers: u64,
    pub new_customers: u64,
    pub returning_customers: u64,
    pub customer_lifetime_value: f64,
    pub customer_acquisition_cost: f64,
    pub churn_rate: f64,
    pub retention_rate: f64,
    pub net_promoter_score: Option<f64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ProductMetrics {
    pub total_products: u64,
    pub products_sold: u64,
    pub top_selling_products: Vec<ProductPerformance>,
    pub inventory_turnover: f64,
    pub out_of_stock_incidents: u64,
    pub average_profit_margin: f64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ProductPerformance {
    pub product_id: String,
    pub product_name: String,
    pub units_sold: u64,
    pub revenue_generated: u64,
    pub profit_margin: f64,
    pub inventory_turnover: f64,
}

// Custom reporting system
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CustomReport {
    pub report_id: String,
    pub name: String,
    pub description: String,
    pub report_type: ReportType,
    pub data_sources: Vec<String>,
    pub filters: Vec<ReportFilter>,
    pub grouping: Vec<String>,
    pub metrics: Vec<String>,
    pub schedule: Option<ReportSchedule>,
    pub output_format: OutputFormat,
    pub recipients: Vec<String>, // email addresses
    pub created_at: u64,
    pub last_generated: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ReportType {
    Sales,
    Customers,
    Inventory,
    Subscriptions,
    Financial,
    Custom,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ReportFilter {
    pub field: String,
    pub operator: ComparisonOperator,
    pub value: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum OutputFormat {
    JSON,
    CSV,
    PDF,
    Chart,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ReportSchedule {
    pub frequency: ReportFrequency,
    pub time_of_day: u32, // hour in 24h format
    pub day_of_week: Option<u32>, // for weekly reports
    pub day_of_month: Option<u32>, // for monthly reports
    pub timezone: String,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ReportFrequency {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
}
```

#### User Canister Methods:
```rust
// Business Intelligence
generate_business_metrics(period_start: u64, period_end: u64) -> Result<BusinessMetrics, String>
get_revenue_analysis(period_start: u64, period_end: u64, group_by: String) -> RevenueAnalysis
get_customer_cohort_analysis(cohort_period: String) -> CohortAnalysis
get_product_performance_analysis() -> Vec<ProductPerformance>
get_subscription_analytics() -> SubscriptionAnalytics

// Custom Reporting
create_custom_report(report: CustomReport) -> Result<String, String>
generate_report(report_id: String) -> Result<ReportOutput, String>
schedule_report(report_id: String, schedule: ReportSchedule) -> Result<(), String>
get_scheduled_reports() -> Vec<CustomReport>
export_data(data_source: String, filters: Vec<ReportFilter>, format: OutputFormat) -> Result<Vec<u8>, String>

// Forecasting & Predictions
forecast_revenue(months_ahead: u32) -> RevenueForecast
predict_customer_churn(customer_id: String) -> ChurnPrediction
recommend_inventory_levels(product_id: String) -> InventoryRecommendation
suggest_pricing_optimization(product_id: String) -> PricingRecommendation
```

---

## 🔄 Updated Feature Summary

| Feature | Factory Backend | User Payment Canister |
|---------|----------------|----------------------|
| **Item & Inventory** | - | ✅ Products, variants, stock, orders |
| **Subscriptions** | Global ICRC2 standards | ✅ Plans, billing, usage tracking |
| **Customer Management** | - | ✅ CRM, segments, loyalty |
| **Discounts & Promotions** | - | ✅ Coupons, campaigns, analytics |
| **Business Intelligence** | Industry benchmarks | ✅ Custom reports, forecasting |
| **Modal Builder** | Global templates | ✅ Merchant configurations |
| **Hosted Pages** | Infrastructure | ✅ Session management |
| **Elements System** | Component registry | ✅ Element configurations |
| **One-Click Payments** | Global network | ✅ Payment profiles |
| **Multi-Token Support** | Market data | ✅ Merchant preferences |
| **Analytics** | System metrics | ✅ Detailed merchant analytics |
| **Security** | Global threats | ✅ Merchant security config |

## 🎯 **ICRC2 Subscription Flow Example**

```rust
// 1. Customer approves recurring charges
let approval = request_subscription_approval(
    subscription_id,
    customer_principal,
    token_canister,
    12 // 12 billing cycles
)?;

// 2. System validates approval with ICRC2 canister
let is_valid = validate_subscription_approval(approval.approval_id)?;

// 3. Process monthly billing using approved allowance
let billing_result = process_subscription_billing(subscription_id)?;

// 4. Track usage and calculate overages
track_usage(subscription_id, "api_calls", 150, metadata)?;
let usage_billing = calculate_usage_billing(subscription_id, period_start, period_end)?;
```

This comprehensive merchant feature set transforms your payment platform into a complete **e-commerce and subscription business management system** while maintaining the ICP canister architecture and ICRC2 token standards.

Would you like me to start implementing any of these merchant business features, or would you prefer to see detailed implementation plans for specific features like the ICRC2 subscription system?
