export const idlFactory = ({ IDL }) => {
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const TransferFromError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const BetError = IDL.Variant({
    'RuggyTransferFailed' : TransferError,
    'InvalidAmount' : IDL.Null,
    'InvalidIncenseDuration' : IDL.Null,
    'InsufficientICP' : IDL.Null,
    'InvalidIncenseAmount' : IDL.Null,
    'IncenseAlreadyActive' : IDL.Null,
    'RatsyMintFailed' : TransferError,
    'CanisterCallFailed' : IDL.Tuple(IDL.Nat32, IDL.Text),
    'IncenseTransferFailed' : IDL.Text,
    'IncenseNotActive' : IDL.Null,
    'TransferFailed' : TransferFromError,
    'FaucetAlreadyUsed' : IDL.Null,
    'RatsyBurnFailed' : TransferError,
    'InsufficientPool' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : BetError });
  const BetResult = IDL.Record({
    'multiplier' : IDL.Nat8,
    'block_index' : IDL.Nat,
    'spin_result' : IDL.Nat8,
  });
  const Result_1 = IDL.Variant({ 'Ok' : BetResult, 'Err' : BetError });
  const Profile = IDL.Record({
    'name' : IDL.Text,
    'total_won' : IDL.Nat,
    'win_count' : IDL.Nat64,
  });
  const Result_2 = IDL.Variant({ 'Ok' : Profile, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : BetError });
  const Winner = IDL.Record({
    'amount_won' : IDL.Nat,
    'timestamp' : IDL.Nat64,
    'ratsy_minted' : IDL.Nat,
  });
  const IncenseConfig = IDL.Record({
    'ruggy_per_spin' : IDL.Nat,
    'active' : IDL.Bool,
    'end_time' : IDL.Nat64,
    'total_ruggy' : IDL.Nat,
    'duration_hours' : IDL.Nat64,
    'spins_completed' : IDL.Nat64,
    'start_time' : IDL.Nat64,
  });
  const IncenseRecord = IDL.Record({
    'next_spin_time' : IDL.Nat64,
    'last_spin_time' : IDL.Nat64,
    'config' : IncenseConfig,
  });
  const GameStats = IDL.Record({
    'ratsy_supply' : IDL.Nat,
    'ruggy_pool' : IDL.Nat,
    'active_players_count' : IDL.Nat64,
    'last_win_time' : IDL.Nat64,
    'total_bets' : IDL.Nat,
    'treasury' : IDL.Nat,
  });
  const Bet = IDL.Record({
    'resolved' : IDL.Bool,
    'odds' : IDL.Float64,
    'created_at' : IDL.Nat64,
    'amount' : IDL.Nat,
  });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : BetError });
  return IDL.Service({
    'activate_cinnamon_incense' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Nat64, IDL.Nat],
        [Result],
        [],
      ),
    'bet' : IDL.Func([IDL.Nat], [Result_1], []),
    'calculate_sell_price' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'checkBalance' : IDL.Func([], [IDL.Nat], []),
    'create_user_profile' : IDL.Func([IDL.Text], [Result_2], []),
    'deactivate_cinnamon_incense' : IDL.Func([], [Result_3], []),
    'get_active_players' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'get_all_winners' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(Winner)))],
        ['query'],
      ),
    'get_cinnamon_incense_status' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IncenseRecord)],
        ['query'],
      ),
    'get_current_odds' : IDL.Func([], [IDL.Float64], ['query']),
    'get_game_stats' : IDL.Func([], [GameStats], ['query']),
    'get_my_bets' : IDL.Func([], [IDL.Vec(Bet)], ['query']),
    'get_my_cinnamon_incense_status' : IDL.Func(
        [],
        [IDL.Opt(IncenseRecord)],
        ['query'],
      ),
    'get_my_profile' : IDL.Func([], [IDL.Opt(Profile)], ['query']),
    'get_my_wins' : IDL.Func([], [IDL.Vec(Winner)], ['query']),
    'get_player_bets' : IDL.Func([IDL.Principal], [IDL.Vec(Bet)], ['query']),
    'get_player_bets_paginated' : IDL.Func(
        [IDL.Principal, IDL.Nat32, IDL.Nat32],
        [IDL.Vec(Bet)],
        ['query'],
      ),
    'get_player_wins' : IDL.Func([IDL.Principal], [IDL.Vec(Winner)], ['query']),
    'get_profile' : IDL.Func([IDL.Principal], [IDL.Opt(Profile)], ['query']),
    'has_used_faucet' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'has_used_faucet_self' : IDL.Func([], [IDL.Bool], ['query']),
    'is_player_active' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'mintRatsyP' : IDL.Func([IDL.Nat], [Result_3], []),
    'process_incense_spins' : IDL.Func([], [Result_4], []),
    'ruggyFaucet' : IDL.Func([], [Result_3], []),
    'sell_ratsy' : IDL.Func([IDL.Nat], [Result_3], []),
    'swapRatsy' : IDL.Func([IDL.Nat], [Result_3], []),
  });
};
export const init = ({ IDL }) => { return []; };