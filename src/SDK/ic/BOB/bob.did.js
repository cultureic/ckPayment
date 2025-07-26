export const idlFactory = ({ IDL }) => {
    const CurrentBlockStatus = IDL.Record({
      'burned_cyles' : IDL.Nat64,
      'active_miners' : IDL.Nat64,
    });
    const Block = IDL.Record({
      'to' : IDL.Principal,
      'miner' : IDL.Opt(IDL.Principal),
      'miner_cycles_burned' : IDL.Opt(IDL.Nat64),
      'total_cycles_burned' : IDL.Opt(IDL.Nat64),
      'timestamp' : IDL.Nat64,
      'rewards' : IDL.Nat64,
      'miner_count' : IDL.Opt(IDL.Nat64),
    });
    const LeaderBoardEntry = IDL.Record({
      'owner' : IDL.Principal,
      'block_count' : IDL.Nat64,
      'miner_count' : IDL.Nat64,
    });
    const Miner = IDL.Record({
      'id' : IDL.Principal,
      'mined_blocks' : IDL.Nat64,
    });
    const PoolStats = IDL.Record({
      'pool_mined_blocks' : IDL.Nat64,
      'users_count_in_pool' : IDL.Nat64,
    });
    const Stats = IDL.Record({
      'halving_count' : IDL.Nat64,
      'average_block_speed' : IDL.Nat64,
      'cycle_balance' : IDL.Nat64,
      'block_count' : IDL.Nat64,
      'miner_count' : IDL.Nat64,
      'time_since_last_block' : IDL.Nat64,
      'pending_blocks' : IDL.Vec(Block),
    });
    const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
    const Result_1 = IDL.Variant({ 'Ok' : IDL.Principal, 'Err' : IDL.Text });
    return IDL.Service({
      'filter_out_known_index' : IDL.Func(
          [IDL.Vec(IDL.Nat64)],
          [IDL.Vec(IDL.Nat64)],
          ['query'],
        ),
      'get_current_block_status' : IDL.Func([], [CurrentBlockStatus], ['query']),
      'get_latest_blocks' : IDL.Func([], [IDL.Vec(Block)], ['query']),
      'get_leader_board' : IDL.Func([], [IDL.Vec(LeaderBoardEntry)], ['query']),
      'get_miners' : IDL.Func([IDL.Principal], [IDL.Vec(Miner)], ['query']),
      'get_pool_statistic' : IDL.Func([], [PoolStats], ['query']),
      'get_statistics' : IDL.Func([], [Stats], ['query']),
      'get_wasm_len' : IDL.Func([], [IDL.Nat64], ['query']),
      'hours_left_in_pool' : IDL.Func(
          [IDL.Opt(IDL.Principal)],
          [IDL.Nat64],
          ['query'],
        ),
      'join_pool' : IDL.Func([IDL.Nat64], [Result], []),
      'spawn_miner' : IDL.Func([IDL.Nat64], [Result_1], []),
      'submit_burned_cycles' : IDL.Func([IDL.Nat64], [Result], []),
      'upgrade_miner' : IDL.Func([IDL.Principal], [Result], []),
    });
  };
  export const init = ({ IDL }) => { return []; };