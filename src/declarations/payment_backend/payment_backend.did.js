export const idlFactory = ({ IDL }) => {
  const TokenConfig = IDL.Record({
    'fee' : IDL.Nat64,
    'decimals' : IDL.Nat8,
    'logo' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
    'is_active' : IDL.Bool,
    'symbol' : IDL.Text,
  });
  const UserCanisterConfig = IDL.Record({
    'merchant_fee' : IDL.Nat32,
    'name' : IDL.Text,
    'custom_settings' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'description' : IDL.Text,
    'webhook' : IDL.Opt(IDL.Text),
    'withdraw_threshold' : IDL.Opt(IDL.Nat64),
    'auto_withdraw' : IDL.Bool,
    'supported_tokens' : IDL.Vec(TokenConfig),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const CanisterRecord = IDL.Record({
    'id' : IDL.Principal,
    'owner' : IDL.Principal,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'last_updated' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'version' : IDL.Nat64,
    'is_active' : IDL.Bool,
    'supported_tokens' : IDL.Vec(TokenConfig),
  });
  const FactoryStats = IDL.Record({
    'active_canisters' : IDL.Nat64,
    'total_users' : IDL.Nat64,
    'current_version' : IDL.Nat64,
    'total_canisters' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'canister_id' : IDL.Func([], [IDL.Principal], ['query']),
    'deploy_user_payment_canister' : IDL.Func(
        [UserCanisterConfig],
        [Result],
        [],
      ),
    'find_canisters_by_token' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(CanisterRecord)],
        ['query'],
      ),
    'get_all_active_canisters' : IDL.Func(
        [],
        [IDL.Vec(CanisterRecord)],
        ['query'],
      ),
    'get_canister_info' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(CanisterRecord)],
        ['query'],
      ),
    'get_factory_stats' : IDL.Func([], [FactoryStats], ['query']),
    'get_user_canisters' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(CanisterRecord)],
        ['query'],
      ),
    'get_wasm_status' : IDL.Func([], [IDL.Text], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'set_user_canister_wasm' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_1], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
