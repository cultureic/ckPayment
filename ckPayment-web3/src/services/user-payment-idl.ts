import { IDL } from '@dfinity/candid';

// IDL factory for user payment canister based on the DID file
export const userPaymentCanisterIdlFactory = ({ IDL }: { IDL: typeof import('@dfinity/candid').IDL }) => {
  const InvoiceStatus = IDL.Variant({
    'Created': IDL.Null,
    'Paid': IDL.Null,
    'Expired': IDL.Null,
    'Cancelled': IDL.Null,
  });

  const TransactionStatus = IDL.Variant({
    'Pending': IDL.Null,
    'Completed': IDL.Null,
    'Failed': IDL.Text,
    'Refunded': IDL.Null,
  });

  const TokenConfig = IDL.Record({
    'symbol': IDL.Text,
    'name': IDL.Text,
    'decimals': IDL.Nat8,
    'canister_id': IDL.Principal,
    'fee': IDL.Nat64,
    'logo': IDL.Opt(IDL.Text),
    'is_active': IDL.Bool,
  });

  const UserCanisterConfig = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Text,
    'supported_tokens': IDL.Vec(TokenConfig),
    'webhook': IDL.Opt(IDL.Text),
    'merchant_fee': IDL.Nat32,
    'auto_withdraw': IDL.Bool,
    'withdraw_threshold': IDL.Opt(IDL.Nat64),
    'custom_settings': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });

  const PaymentInvoice = IDL.Record({
    'id': IDL.Text,
    'merchant': IDL.Principal,
    'amount': IDL.Nat64,
    'token': TokenConfig,
    'description': IDL.Text,
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'expires_at': IDL.Opt(IDL.Nat64),
    'created_at': IDL.Nat64,
    'status': InvoiceStatus,
  });

  const PaymentTransaction = IDL.Record({
    'id': IDL.Text,
    'from': IDL.Principal,
    'to': IDL.Principal,
    'token': TokenConfig,
    'amount': IDL.Nat64,
    'fee': IDL.Nat64,
    'merchant_fee': IDL.Nat64,
    'timestamp': IDL.Nat64,
    'status': TransactionStatus,
    'metadata': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });

  const PaymentAnalytics = IDL.Record({
    'total_transactions': IDL.Nat64,
    'total_volume': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    'success_rate': IDL.Float64,
    'average_amount': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64)),
    'top_tokens': IDL.Vec(IDL.Text),
  });

  const Result = IDL.Variant({ 'Ok': PaymentInvoice, 'Err': IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok': PaymentTransaction, 'Err': IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok': IDL.Nat64, 'Err': IDL.Text });
  const Result_4 = IDL.Variant({ 'Ok': IDL.Bool, 'Err': IDL.Text });

  return IDL.Service({
    'canister_id': IDL.Func([], [IDL.Principal], ['query']),
    'create_invoice': IDL.Func(
      [IDL.Nat64, IDL.Text, IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
      [Result],
      []
    ),
    'get_all_balances': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))], ['query']),
    'get_analytics': IDL.Func(
      [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
      [PaymentAnalytics],
      ['query']
    ),
    'get_balance': IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
    'get_configuration': IDL.Func([], [UserCanisterConfig], ['query']),
    'get_invoice': IDL.Func([IDL.Text], [IDL.Opt(PaymentInvoice)], ['query']),
    'get_owner': IDL.Func([], [IDL.Principal], ['query']),
    'get_supported_tokens': IDL.Func([], [IDL.Vec(TokenConfig)], ['query']),
    'get_transaction': IDL.Func([IDL.Text], [IDL.Opt(PaymentTransaction)], ['query']),
    'get_transaction_history': IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(PaymentTransaction)],
      ['query']
    ),
    'health': IDL.Func([], [IDL.Text, IDL.Nat64, IDL.Nat64], ['query']),
    'process_payment': IDL.Func([IDL.Text, IDL.Principal], [Result_1], []),
    'update_configuration': IDL.Func([UserCanisterConfig], [Result_2], []),
    'whoami': IDL.Func([], [IDL.Principal], ['query']),
    'withdraw': IDL.Func([IDL.Text, IDL.Nat64, IDL.Principal], [Result_3], []),
    
    // Token Management Methods
    'add_supported_token': IDL.Func([TokenConfig], [Result_2], []),
    'remove_supported_token': IDL.Func([IDL.Text], [Result_2], []),
    'update_supported_token': IDL.Func([IDL.Text, TokenConfig], [Result_2], []),
    'toggle_token_status': IDL.Func([IDL.Text], [Result_4], []),
    
    // Admin Methods
    'admin_update_owner': IDL.Func([IDL.Principal], [Result_2], []),
  });
};
