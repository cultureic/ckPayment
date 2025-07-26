// Define the IDL factory for the management canister (focusing on canister_info)
export const idlFactory = ({ IDL }) => {
    const ChangeOrigin = IDL.Variant({
      'from_user': IDL.Record({ 'user_id': IDL.Principal }),
      'from_canister': IDL.Record({
        'canister_id': IDL.Principal,
        'canister_version': IDL.Opt(IDL.Nat64),
      }),
    });
    const CodeDeploymentMode = IDL.Variant({
      'install': IDL.Null,
      'reinstall': IDL.Null,
      'upgrade': IDL.Null,
    });
    const ChangeDetails = IDL.Variant({
      'creation': IDL.Record({ 'controllers': IDL.Vec(IDL.Principal) }),
      'code_uninstall': IDL.Null,
      'code_deployment': IDL.Record({
        'mode': CodeDeploymentMode,
        'module_hash': IDL.Vec(IDL.Nat8),
      }),
      'controllers_change': IDL.Record({ 'controllers': IDL.Vec(IDL.Principal) }),
    });
    const CanisterChange = IDL.Record({
      'timestamp_nanos': IDL.Nat64,
      'canister_version': IDL.Nat64,
      'origin': ChangeOrigin,
      'details': ChangeDetails,
    });
    const CanisterInfoResponse = IDL.Record({
      'total_num_changes': IDL.Nat64,
      'recent_changes': IDL.Vec(CanisterChange),
      'module_hash': IDL.Opt(IDL.Vec(IDL.Nat8)),
      'controllers': IDL.Vec(IDL.Principal),
    });
    return IDL.Service({
      'canister_info': IDL.Func(
        [IDL.Record({
          'canister_id': IDL.Principal,
          'num_requested_changes': IDL.Opt(IDL.Nat64),
        })],
        [CanisterInfoResponse],
        [],
      ),
    });
  };