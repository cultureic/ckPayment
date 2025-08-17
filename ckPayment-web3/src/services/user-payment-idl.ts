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

  const PaymentTransaction = IDL.Record({
    'id': IDL.Text,
    'to': IDL.Principal,
    'fee': IDL.Nat64,
    'status': TransactionStatus,
    'merchant_fee': IDL.Nat64,
    'token': TokenConfig,
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'from': IDL.Principal,
    'timestamp': IDL.Nat64,
    'amount': IDL.Nat64,
  });

  // Result types matching the DID file
  const Result = IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok': IDL.Nat32, 'Err': IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok': IDL.Text, 'Err': IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok': PaymentInvoice, 'Err': IDL.Text });
  const Result_4 = IDL.Variant({ 'Ok': DiscountCoupon, 'Err': IDL.Text });
  const Result_5 = IDL.Variant({ 'Ok': IDL.Tuple(IDL.Nat32, IDL.Vec(IDL.Text)), 'Err': IDL.Text });
  const Result_6 = IDL.Variant({ 'Ok': ModalAnalytics, 'Err': IDL.Text });
  const Result_7 = IDL.Variant({ 'Ok': ModalConfig, 'Err': IDL.Text });
  const Result_11 = IDL.Variant({ 'Ok': PaymentTransaction, 'Err': IDL.Text });
  const Result_12 = IDL.Variant({ 'Ok': IDL.Bool, 'Err': IDL.Text });
  const Result_13 = IDL.Variant({ 'Ok': IDL.Tuple(IDL.Text, IDL.Nat64), 'Err': IDL.Text });
  const Result_14 = IDL.Variant({ 'Ok': IDL.Nat64, 'Err': IDL.Text });

  return IDL.Service({
    'add_supported_token': IDL.Func([TokenConfig], [Result], []),
    'admin_clear_all_coupons': IDL.Func([], [Result_1], []),
    'admin_clear_all_subscriptions': IDL.Func([], [Result_1], []),
    'admin_update_owner': IDL.Func([IDL.Principal], [Result], []),
    'canister_id': IDL.Func([], [IDL.Principal], ['query']),
    'create_invoice': IDL.Func(
      [IDL.Nat64, IDL.Text, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      [Result_3],
      []
    ),
    'create_modal_config': IDL.Func([ModalConfig], [Result_2], []),
    'delete_modal_config': IDL.Func([IDL.Text], [Result], []),
    'generate_modal_embed_code': IDL.Func([IDL.Text], [Result_2], ['query']),
    'get_all_balances': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))], ['query']),
    'get_analytics': IDL.Func(
      [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
      [PaymentAnalytics],
      ['query']
    ),
    'get_balance': IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    'get_configuration': IDL.Func([], [UserCanisterConfig], ['query']),
    'get_invoice': IDL.Func([IDL.Text], [IDL.Opt(PaymentInvoice)], ['query']),
    'get_modal_analytics': IDL.Func([IDL.Text], [Result_6], ['query']),
    'get_modal_config': IDL.Func([IDL.Text], [Result_7], ['query']),
    'get_owner': IDL.Func([], [IDL.Principal], ['query']),
    'get_supported_tokens': IDL.Func([], [IDL.Vec(TokenConfig)], ['query']),
    'get_transaction': IDL.Func([IDL.Text], [IDL.Opt(PaymentTransaction)], ['query']),
    'get_transaction_history': IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(PaymentTransaction)],
      ['query']
    ),
    'health': IDL.Func([], [IDL.Text, IDL.Nat64, IDL.Nat64], ['query']),
    'list_my_modals': IDL.Func([], [IDL.Vec(ModalConfig)], ['query']),
    'process_payment': IDL.Func([IDL.Text, IDL.Principal], [Result_11], []),
    'remove_supported_token': IDL.Func([IDL.Text], [Result], []),
    'toggle_token_status': IDL.Func([IDL.Text], [Result_12], []),
    'track_modal_view': IDL.Func([IDL.Text], [Result], []),
    'update_configuration': IDL.Func([UserCanisterConfig], [Result], []),
    'update_modal_config': IDL.Func([IDL.Text, ModalConfig], [Result], []),
    'update_supported_token': IDL.Func([IDL.Text, TokenConfig], [Result], []),
    'whoami': IDL.Func([], [IDL.Principal], ['query']),
    'withdraw': IDL.Func([IDL.Text, IDL.Nat64, IDL.Principal], [Result_14], []),
  });
};
