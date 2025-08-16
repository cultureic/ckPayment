import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

module {
  
  public type CanisterId = Principal;
  
  public type CanisterSettings = {
    controllers : ?[Principal];
    compute_allocation : ?Nat;
    memory_allocation : ?Nat;
    freezing_threshold : ?Nat;
  };
  
  public type CreateCanisterArgs = {
    settings : ?CanisterSettings;
  };
  
  public type CreateCanisterResult = {
    canister_id : CanisterId;
  };
  
  public type InstallMode = {
    #install;
    #reinstall;
    #upgrade;
  };
  
  public type InstallCodeArgs = {
    mode : InstallMode;
    canister_id : CanisterId;
    wasm_module : Blob;
    arg : Blob;
  };
  
  public type UpdateSettingsArgs = {
    canister_id : Principal;
    settings : CanisterSettings;
  };
  
  public type CanisterStatus = {
    #running;
    #stopping;
    #stopped;
  };
  
  public type DefiniteCanisterSettings = {
    controllers : [Principal];
    compute_allocation : Nat;
    memory_allocation : Nat;
    freezing_threshold : Nat;
  };
  
  public type CanisterStatusArgs = {
    canister_id : CanisterId;
  };
  
  public type CanisterStatusResult = {
    status : CanisterStatus;
    settings : DefiniteCanisterSettings;
    module_hash : ?Blob;
    memory_size : Nat;
    cycles : Nat;
  };
  
  public type StartCanisterArgs = {
    canister_id : CanisterId;
  };
  
  public type StopCanisterArgs = {
    canister_id : CanisterId;
  };
  
  public type DeleteCanisterArgs = {
    canister_id : CanisterId;
  };
  
  public type DepositCyclesArgs = {
    canister_id : CanisterId;
  };
  
  /// The management canister interface
  public type Management = actor {
    create_canister : CreateCanisterArgs -> async CreateCanisterResult;
    install_code : InstallCodeArgs -> async ();
    update_settings : UpdateSettingsArgs -> async ();
    canister_status : CanisterStatusArgs -> async CanisterStatusResult;
    start_canister : StartCanisterArgs -> async ();
    stop_canister : StopCanisterArgs -> async ();
    delete_canister : DeleteCanisterArgs -> async ();
    deposit_cycles : DepositCyclesArgs -> async ();
  };
}
