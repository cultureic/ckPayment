export const idlFactory = ({ IDL }) => {
    const State = IDL.Record({
      'owner' : IDL.Principal,
      'max_cycles_per_round' : IDL.Nat,
      'hashes_computed' : IDL.Nat,
      'solved_challenges' : IDL.Nat64,
      'last_cycles_burned' : IDL.Nat,
      'bob_minter_id' : IDL.Principal,
    });
    const Stats = IDL.Record({
      'hashes_computed' : IDL.Nat,
      'cycle_balance' : IDL.Nat64,
      'solved_challenges' : IDL.Nat64,
      'hash_per_minute' : IDL.Nat,
      'cycles_burned_per_minute' : IDL.Nat,
    });
    const StatsV2 = IDL.Record({
      'cycles_burned_per_round' : IDL.Nat,
      'last_round_cyles_burned' : IDL.Nat,
      'round_length_secs' : IDL.Nat64,
      'cycle_balance' : IDL.Nat64,
    });
    const MinerSettings = IDL.Record({
      'max_cycles_per_round' : IDL.Opt(IDL.Nat),
      'new_owner' : IDL.Opt(IDL.Principal),
    });
    return IDL.Service({
      'get_state' : IDL.Func([], [State], ['query']),
      'get_statistics' : IDL.Func([], [Stats], ['query']),
      'get_statistics_v2' : IDL.Func([], [StatsV2], ['query']),
      'push_challenge' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Nat64], [], []),
      'update_miner_settings' : IDL.Func([MinerSettings], [], []),
    });
  };
  export const init = ({ IDL }) => { return []; };