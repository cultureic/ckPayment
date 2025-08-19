import { IDL } from '@dfinity/candid';

// IDL factory for user payment canister based on the actual DID file
export const userPaymentCanisterIdlFactory = ({ IDL }: { IDL: typeof import('@dfinity/candid').IDL }) => {
  const BillingInterval = IDL.Variant({
    'Weekly': IDL.Null,
    'Quarterly': IDL.Null,
    'Daily': IDL.Null,
    'Custom': IDL.Nat64,
    'Monthly': IDL.Null,
    'Yearly': IDL.Null,
  });

  const BrandingConfig = IDL.Record({
    'company_name': IDL.Text,
    'logo_url': IDL.Opt(IDL.Text),
    'terms_url': IDL.Opt(IDL.Text),
    'support_url': IDL.Opt(IDL.Text),
  });

  const CouponType = IDL.Variant({
    'FreeShipping': IDL.Null,
    'FixedAmount': IDL.Nat64,
    'Percentage': IDL.Nat32,
  });

  const DiscountCoupon = IDL.Record({
    'updated_at': IDL.Nat64,
    'usage_limit': IDL.Opt(IDL.Nat32),
    'applicable_tokens': IDL.Vec(IDL.Text),
    'code': IDL.Text,
    'coupon_id': IDL.Text,
    'description': IDL.Text,
    'created_at': IDL.Nat64,
    'minimum_amount': IDL.Opt(IDL.Nat64),
    'coupon_type': CouponType,
    'used_count': IDL.Nat32,
    'is_active': IDL.Bool,
    'expires_at': IDL.Opt(IDL.Nat64),
  });

  const InvoiceStatus = IDL.Variant({
    'Paid': IDL.Null,
    'Cancelled': IDL.Null,
    'Created': IDL.Null,
    'Expired': IDL.Null,
  });

  const ModalAnalytics = IDL.Record({
    'conversion_rate': IDL.Float64,
    'revenue_generated': IDL.Nat64,
    'modal_id': IDL.Text,
    'successful_payments': IDL.Nat64,
    'total_views': IDL.Nat64,
  });

  const ModalTheme = IDL.Record({
    'text_color': IDL.Text,
    'border_radius': IDL.Nat32,
    'font_family': IDL.Text,
    'primary_color': IDL.Text,
    'background_color': IDL.Text,
  });

  const PaymentOptions = IDL.Record({
    'require_shipping': IDL.Bool,
    'enable_tips': IDL.Bool,
    'require_email': IDL.Bool,
    'show_amount_breakdown': IDL.Bool,
    'allowed_tokens': IDL.Vec(IDL.Text),
  });

  const RedirectUrls = IDL.Record({
    'webhook_url': IDL.Opt(IDL.Text),
    'success_url': IDL.Text,
    'cancel_url': IDL.Text,
  });

  const ModalConfig = IDL.Record({
    'payment_options': PaymentOptions,
    'theme': ModalTheme,
    'updated_at': IDL.Nat64,
    'redirect_urls': RedirectUrls,
    'name': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'created_at': IDL.Nat64,
    'template_id': IDL.Opt(IDL.Text),
    'modal_id': IDL.Text,
    'is_active': IDL.Bool,
    'branding': BrandingConfig,
  });

  const TokenConfig = IDL.Record({
    'fee': IDL.Nat64,
    'decimals': IDL.Nat8,
    'logo': IDL.Opt(IDL.Text),
    'name': IDL.Text,
    'canister_id': IDL.Principal,
    'is_active': IDL.Bool,
    'symbol': IDL.Text,
  });

  const TransactionStatus = IDL.Variant({
    'Failed': IDL.Text,
    'Refunded': IDL.Null,
    'Completed': IDL.Null,
    'Pending': IDL.Null,
  });

  const UserCanisterConfig = IDL.Record({
    'merchant_fee': IDL.Nat32,
    'name': IDL.Text,
    'custom_settings': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'description': IDL.Text,
    'webhook': IDL.Opt(IDL.Text),
    'withdraw_threshold': IDL.Opt(IDL.Nat64),
    'auto_withdraw': IDL.Bool,
    'supported_tokens': IDL.Vec(TokenConfig),
  });

  const PaymentAnalytics = IDL.Record({
    'success_rate': IDL.Float64,
    'total_transactions': IDL.Nat64,
    'top_tokens': IDL.Vec(IDL.Text),
    'total_volume': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    'average_amount': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
  });

  const PaymentInvoice = IDL.Record({
    'id': IDL.Text,
    'status': InvoiceStatus,
    'token': TokenConfig,
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'description': IDL.Text,
    'created_at': IDL.Nat64,
    'merchant': IDL.Principal,
    'amount': IDL.Nat64,
    'expires_at': IDL.Opt(IDL.Nat64),
  });

  const PaymentMethod = IDL.Variant({
    'TransferFrom': IDL.Null,
    'Direct': IDL.Null,
    'Subscription': IDL.Null,
  });

  const PaymentTransaction = IDL.Record({
    'id': IDL.Text,
    'to': IDL.Principal,
    'fee': IDL.Nat64,
    'status': TransactionStatus,
    'merchant_fee': IDL.Nat64,
    'token': TokenConfig,
    'block_index': IDL.Opt(IDL.Nat64),
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'from': IDL.Principal,
    'payment_method': PaymentMethod,
    'timestamp': IDL.Nat64,
    'amount': IDL.Nat64,
  });

  const ProductStatus = IDL.Variant({
    'Inactive': IDL.Null,
    'Active': IDL.Null,
    'OutOfStock': IDL.Null,
  });

  const Product = IDL.Record({
    'status': ProductStatus,
    'updated_at': IDL.Nat64,
    'product_id': IDL.Text,
    'token_symbol': IDL.Text,
    'image_url': IDL.Opt(IDL.Text),
    'inventory_count': IDL.Opt(IDL.Nat32),
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'name': IDL.Text,
    'description': IDL.Text,
    'created_at': IDL.Nat64,
    'category': IDL.Opt(IDL.Text),
    'price': IDL.Nat64,
  });

  const ProductSalesStats = IDL.Record({
    'total_sales': IDL.Nat64,
    'product_id': IDL.Text,
    'last_sale_at': IDL.Opt(IDL.Nat64),
    'total_revenue': IDL.Nat64,
    'units_sold': IDL.Nat32,
  });

  const PaymentRequest = IDL.Record({
    'invoice_id': IDL.Text,
    'token_symbol': IDL.Text,
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'coupon_code': IDL.Opt(IDL.Text),
    'amount': IDL.Nat64,
  });

  const PaymentResult = IDL.Record({
    'transaction_id': IDL.Text,
    'block_index': IDL.Opt(IDL.Nat64),
    'payment_method': PaymentMethod,
    'discount_applied': IDL.Nat64,
    'amount_paid': IDL.Nat64,
    'final_amount': IDL.Nat64,
  });

  const CouponUsage = IDL.Record({
    'user_principal': IDL.Principal,
    'invoice_id': IDL.Text,
    'usage_id': IDL.Text,
    'coupon_id': IDL.Text,
    'used_at': IDL.Nat64,
    'discount_applied': IDL.Nat64,
  });

  const SubscriptionStatus = IDL.Variant({
    'Paused': IDL.Null,
    'PendingPayment': IDL.Null,
    'Active': IDL.Null,
    'Cancelled': IDL.Null,
    'Expired': IDL.Null,
  });

  const SubscriptionPlan = IDL.Record({
    'billing_interval': BillingInterval,
    'updated_at': IDL.Nat64,
    'features': IDL.Vec(IDL.Text),
    'token': IDL.Text,
    'name': IDL.Text,
    'trial_period_days': IDL.Opt(IDL.Nat32),
    'max_subscriptions': IDL.Opt(IDL.Nat32),
    'description': IDL.Text,
    'created_at': IDL.Nat64,
    'plan_id': IDL.Text,
    'is_active': IDL.Bool,
    'price': IDL.Nat64,
  });

  const Subscription = IDL.Record({
    'status': SubscriptionStatus,
    'payment_failures': IDL.Nat32,
    'updated_at': IDL.Nat64,
    'cancelled_at': IDL.Opt(IDL.Nat64),
    'subscription_id': IDL.Text,
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'trial_end': IDL.Opt(IDL.Nat64),
    'next_billing_date': IDL.Nat64,
    'current_period_start': IDL.Nat64,
    'created_at': IDL.Nat64,
    'current_period_end': IDL.Nat64,
    'plan_id': IDL.Text,
    'total_payments': IDL.Nat64,
    'subscriber': IDL.Principal,
    'cancel_at_period_end': IDL.Bool,
  });

  const SubscriptionPayment = IDL.Record({
    'transaction_id': IDL.Opt(IDL.Text),
    'status': IDL.Text,
    'payment_date': IDL.Nat64,
    'token': IDL.Text,
    'failure_reason': IDL.Opt(IDL.Text),
    'subscription_id': IDL.Text,
    'billing_period_start': IDL.Nat64,
    'billing_period_end': IDL.Nat64,
    'payment_id': IDL.Text,
    'amount': IDL.Nat64,
  });

  // Result types matching the DID file
  const Result = IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok': IDL.Nat32, 'Err': IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok': IDL.Text, 'Err': IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok': PaymentInvoice, 'Err': IDL.Text });
  const Result_4 = IDL.Variant({ 'Ok': DiscountCoupon, 'Err': IDL.Text });
  const Result_5 = IDL.Variant({ 'Ok': IDL.Tuple(IDL.Nat32, IDL.Vec(CouponUsage)), 'Err': IDL.Text });
  const Result_6 = IDL.Variant({ 'Ok': ModalAnalytics, 'Err': IDL.Text });
  const Result_7 = IDL.Variant({ 'Ok': ModalConfig, 'Err': IDL.Text });
  const Result_8 = IDL.Variant({ 'Ok': Product, 'Err': IDL.Text });
  const Result_9 = IDL.Variant({ 'Ok': ProductSalesStats, 'Err': IDL.Text });
  const Result_10 = IDL.Variant({ 'Ok': Subscription, 'Err': IDL.Text });
  const Result_11 = IDL.Variant({ 'Ok': SubscriptionPayment, 'Err': IDL.Text });
  const Result_12 = IDL.Variant({ 'Ok': SubscriptionPlan, 'Err': IDL.Text });
  const Result_13 = IDL.Variant({ 'Ok': PaymentTransaction, 'Err': IDL.Text });
  const Result_14 = IDL.Variant({ 'Ok': PaymentResult, 'Err': IDL.Text });
  const Result_15 = IDL.Variant({ 'Ok': IDL.Bool, 'Err': IDL.Text });
  const Result_16 = IDL.Variant({ 'Ok': ProductStatus, 'Err': IDL.Text });
  const Result_17 = IDL.Variant({ 'Ok': IDL.Tuple(IDL.Text, IDL.Nat64), 'Err': IDL.Text });
  const Result_18 = IDL.Variant({ 'Ok': IDL.Nat64, 'Err': IDL.Text });

  return IDL.Service({
    'add_supported_token': IDL.Func([TokenConfig], [Result], []),
    'admin_clear_all_coupons': IDL.Func([], [Result_1], []),
    'admin_clear_all_products': IDL.Func([], [Result_1], []),
    'admin_clear_all_subscriptions': IDL.Func([], [Result_1], []),
    'admin_update_owner': IDL.Func([IDL.Principal], [Result], []),
    'cancel_subscription': IDL.Func([IDL.Text, IDL.Bool], [Result], []),
    'canister_id': IDL.Func([], [IDL.Principal], ['query']),
    'create_coupon': IDL.Func([DiscountCoupon], [Result_2], []),
    'create_invoice': IDL.Func(
      [IDL.Nat64, IDL.Text, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      [Result_3],
      []
    ),
    'create_invoice_for_product': IDL.Func(
      [IDL.Text, IDL.Nat32, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      [Result_3],
      []
    ),
    'create_modal_config': IDL.Func([ModalConfig], [Result_2], []),
    'create_product': IDL.Func([Product], [Result_2], []),
    'create_subscription': IDL.Func([IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [Result_2], []),
    'create_subscription_plan': IDL.Func([SubscriptionPlan], [Result_2], []),
    'delete_coupon': IDL.Func([IDL.Text], [Result], []),
    'delete_modal_config': IDL.Func([IDL.Text], [Result], []),
    'delete_product': IDL.Func([IDL.Text], [Result], []),
    'delete_subscription_plan': IDL.Func([IDL.Text], [Result], []),
    'generate_modal_embed_code': IDL.Func([IDL.Text], [Result_2], ['query']),
    'get_all_balances': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))], ['query']),
    'get_analytics': IDL.Func(
      [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
      [PaymentAnalytics],
      ['query']
    ),
    'get_balance': IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    'get_configuration': IDL.Func([], [UserCanisterConfig], ['query']),
    'get_coupon': IDL.Func([IDL.Text], [Result_4], ['query']),
    'get_coupon_by_code': IDL.Func([IDL.Text], [Result_4], ['query']),
    'get_coupon_usage_stats': IDL.Func([IDL.Text], [Result_5], ['query']),
    'get_enhanced_analytics': IDL.Func([], [PaymentAnalytics], ['query']),
    'get_invoice': IDL.Func([IDL.Text], [IDL.Opt(PaymentInvoice)], ['query']),
    'get_modal_analytics': IDL.Func([IDL.Text], [Result_6], ['query']),
    'get_modal_config': IDL.Func([IDL.Text], [Result_7], ['query']),
    'get_owner': IDL.Func([], [IDL.Principal], ['query']),
    'get_payment_method_analytics': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))], ['query']),
    'get_product': IDL.Func([IDL.Text], [Result_8], ['query']),
    'get_product_categories': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'get_product_sales_stats': IDL.Func([IDL.Text], [Result_9], ['query']),
    'get_product_stats': IDL.Func([], [IDL.Tuple(IDL.Nat32, IDL.Nat32)], ['query']),
    'get_subscription': IDL.Func([IDL.Text], [Result_10], ['query']),
    'get_subscription_payment': IDL.Func([IDL.Text], [Result_11], ['query']),
    'get_subscription_plan': IDL.Func([IDL.Text], [Result_12], ['query']),
    'get_subscription_stats': IDL.Func([], [IDL.Tuple(IDL.Nat32, IDL.Nat32, IDL.Nat32)], ['query']),
    'get_supported_tokens': IDL.Func([], [IDL.Vec(TokenConfig)], ['query']),
    'get_transaction': IDL.Func([IDL.Text], [IDL.Opt(PaymentTransaction)], ['query']),
    'get_transaction_history': IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(PaymentTransaction)],
      ['query']
    ),
    'health': IDL.Func([], [IDL.Text, IDL.Nat64, IDL.Nat64], ['query']),
    'list_active_coupons': IDL.Func([], [IDL.Vec(DiscountCoupon)], ['query']),
    'list_active_products': IDL.Func([], [IDL.Vec(Product)], ['query']),
    'list_active_subscription_plans': IDL.Func([], [IDL.Vec(SubscriptionPlan)], ['query']),
    'list_all_product_sales_stats': IDL.Func([], [IDL.Vec(ProductSalesStats)], ['query']),
    'list_all_subscriptions': IDL.Func([], [IDL.Vec(Subscription)], ['query']),
    'list_my_coupons': IDL.Func([], [IDL.Vec(DiscountCoupon)], ['query']),
    'list_my_modals': IDL.Func([], [IDL.Vec(ModalConfig)], ['query']),
    'list_my_subscriptions': IDL.Func([], [IDL.Vec(Subscription)], ['query']),
    'list_products': IDL.Func([], [IDL.Vec(Product)], ['query']),
    'list_products_by_category': IDL.Func([IDL.Text], [IDL.Vec(Product)], ['query']),
    'list_products_by_token': IDL.Func([IDL.Text], [IDL.Vec(Product)], ['query']),
    'list_subscription_payments': IDL.Func([IDL.Text], [IDL.Vec(SubscriptionPayment)], ['query']),
    'list_subscription_plans': IDL.Func([], [IDL.Vec(SubscriptionPlan)], ['query']),
    'list_subscriptions_by_plan': IDL.Func([IDL.Text], [IDL.Vec(Subscription)], ['query']),
    'list_user_subscriptions': IDL.Func([IDL.Principal], [IDL.Vec(Subscription)], ['query']),
    'pause_subscription': IDL.Func([IDL.Text], [Result], []),
    'process_payment': IDL.Func([IDL.Text, IDL.Principal], [Result_13], []),
    'process_payment_request': IDL.Func([PaymentRequest], [Result_14], []),
    'process_subscription_payment': IDL.Func([IDL.Text], [Result_2], []),
    'remove_supported_token': IDL.Func([IDL.Text], [Result], []),
    'resume_subscription': IDL.Func([IDL.Text], [Result], []),
    'toggle_coupon_status': IDL.Func([IDL.Text], [Result_15], []),
    'toggle_product_status': IDL.Func([IDL.Text], [Result_16], []),
    'toggle_subscription_plan_status': IDL.Func([IDL.Text], [Result_15], []),
    'toggle_token_status': IDL.Func([IDL.Text], [Result_15], []),
    'track_modal_view': IDL.Func([IDL.Text], [Result], []),
    'update_configuration': IDL.Func([UserCanisterConfig], [Result], []),
    'update_coupon': IDL.Func([IDL.Text, DiscountCoupon], [Result], []),
    'update_modal_config': IDL.Func([IDL.Text, ModalConfig], [Result], []),
    'update_product': IDL.Func([IDL.Text, Product], [Result], []),
    'update_product_inventory': IDL.Func([IDL.Text, IDL.Opt(IDL.Nat32)], [Result], []),
    'update_subscription_metadata': IDL.Func([IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [Result], []),
    'update_subscription_plan': IDL.Func([IDL.Text, SubscriptionPlan], [Result], []),
    'update_supported_token': IDL.Func([IDL.Text, TokenConfig], [Result], []),
    'validate_and_use_coupon': IDL.Func([IDL.Text, IDL.Nat64, IDL.Text], [Result_17], []),
    'whoami': IDL.Func([], [IDL.Principal], ['query']),
    'withdraw': IDL.Func([IDL.Text, IDL.Nat64, IDL.Principal], [Result_18], []),
  });
};

// Export createActor function
import { Actor, HttpAgent } from '@dfinity/agent';

export const createActor = (canisterId: string, options: { agent?: HttpAgent } = {}) => {
  return Actor.createActor(userPaymentCanisterIdlFactory, {
    canisterId,
    ...options
  });
};
