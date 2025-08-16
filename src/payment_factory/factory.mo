import Result "mo:base/Result";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";

import Types "./types";
import IC "./ic_management";

actor PaymentFactory {
  
  type CanisterRecord = Types.CanisterRecord;
  type UserCanisterConfig = Types.UserCanisterConfig;
  type TokenConfig = Types.TokenConfig;
  type FactoryStats = Types.FactoryStats;
  
  // Stable storage for deployed canisters
  stable var stableUserCanisters : [(Principal, CanisterRecord)] = [];
  stable var stableCanistersByOwner : [(Principal, [Principal])] = [];
  stable var nextCanisterVersion : Nat = 1;
  
  // Runtime storage
  let userCanisters = HashMap.fromIter<Principal, CanisterRecord>(
    Iter.fromArray(stableUserCanisters), 
    stableUserCanisters.size(), 
    Principal.equal, 
    Principal.hash
  );
  
  let canistersByOwner = HashMap.fromIter<Principal, [Principal]>(
    Iter.fromArray(stableCanistersByOwner), 
    stableCanistersByOwner.size(), 
    Principal.equal, 
    Principal.hash
  );
  
  // IC management canister reference
  let ic : IC.Management = actor("aaaaa-aa");
  
  // Wasm modules for user canisters (these would be set by admin)
  stable var userCanisterWasm : ?Blob = null;
  
  system func preupgrade() {
    stableUserCanisters := Iter.toArray(userCanisters.entries());
    stableCanistersByOwner := Iter.toArray(canistersByOwner.entries());
  };
  
  system func postupgrade() {
    stableUserCanisters := [];
    stableCanistersByOwner := [];
  };
  
  /// Deploy a new payment canister for the caller
  public shared(msg) func deployUserCanister(
    config: UserCanisterConfig
  ) : async Result.Result<Principal, Text> {
    let caller = msg.caller;
    
    // Check if user already has maximum allowed canisters (limit to prevent abuse)
    let existingCanisters = switch (canistersByOwner.get(caller)) {
      case null { [] };
      case (?canisters) { canisters };
    };
    
    if (existingCanisters.size() >= 5) { // Max 5 canisters per user
      return #err("Maximum number of canisters reached (5)");
    };
    
    // Validate configuration
    if (config.name.size() == 0 or config.name.size() > 50) {
      return #err("Name must be between 1 and 50 characters");
    };
    
    if (config.description.size() > 200) {
      return #err("Description must be less than 200 characters");
    };
    
    if (config.supportedTokens.size() == 0) {
      return #err("At least one supported token is required");
    };
    
    let ?wasm = userCanisterWasm else {
      return #err("User canister WASM not set");
    };
    
    try {
      // Add cycles for canister creation
      Cycles.add(2_000_000_000_000); // 2T cycles for creation
      
      let createResult = await ic.create_canister({
        settings = ?{
          controllers = ?[Principal.fromActor(PaymentFactory), caller];
          compute_allocation = null;
          memory_allocation = null;
          freezing_threshold = null;
        };
      });
      
      let canisterId = createResult.canister_id;
      
      // Install the user payment canister code
      let installArgs = to_candid(config);
      
      await ic.install_code({
        mode = #install;
        canister_id = canisterId;
        wasm_module = wasm;
        arg = installArgs;
      });
      
      // Record the deployment
      let canisterRecord : CanisterRecord = {
        id = canisterId;
        owner = caller;
        name = config.name;
        description = config.description;
        version = nextCanisterVersion;
        createdAt = Time.now();
        lastUpdated = Time.now();
        isActive = true;
        supportedTokens = config.supportedTokens;
      };
      
      userCanisters.put(canisterId, canisterRecord);
      
      // Update owner's canister list
      let updatedCanisters = Array.append(existingCanisters, [canisterId]);
      canistersByOwner.put(caller, updatedCanisters);
      
      nextCanisterVersion += 1;
      
      #ok(canisterId)
      
    } catch (error) {
      #err("Failed to deploy canister: " # Error.message(error))
    }
  };
  
  /// Get information about a specific canister
  public query func getCanisterInfo(canisterId: Principal) : async ?CanisterRecord {
    userCanisters.get(canisterId)
  };
  
  /// Get all canisters owned by a user
  public query func getUserCanisters(owner: Principal) : async [CanisterRecord] {
    let canisterIds = switch (canistersByOwner.get(owner)) {
      case null { [] };
      case (?ids) { ids };
    };
    
    let results = Buffer.Buffer<CanisterRecord>(canisterIds.size());
    for (id in canisterIds.vals()) {
      switch (userCanisters.get(id)) {
        case (?record) { results.add(record) };
        case null { /* Skip invalid entries */ };
      };
    };
    
    Buffer.toArray(results)
  };
  
  /// Get all active canisters (for discovery)
  public query func getAllActiveCanisters() : async [CanisterRecord] {
    let results = Buffer.Buffer<CanisterRecord>(userCanisters.size());
    for (record in userCanisters.vals()) {
      if (record.isActive) {
        results.add(record);
      };
    };
    Buffer.toArray(results)
  };
  
  /// Update a user's canister configuration (only owner can do this)
  public shared(msg) func updateCanisterConfig(
    canisterId: Principal, 
    newConfig: UserCanisterConfig
  ) : async Result.Result<(), Text> {
    let caller = msg.caller;
    
    let ?record = userCanisters.get(canisterId) else {
      return #err("Canister not found");
    };
    
    if (record.owner != caller) {
      return #err("Only the owner can update the canister");
    };
    
    // Validate new configuration
    if (newConfig.name.size() == 0 or newConfig.name.size() > 50) {
      return #err("Name must be between 1 and 50 characters");
    };
    
    if (newConfig.supportedTokens.size() == 0) {
      return #err("At least one supported token is required");
    };
    
    try {
      // Call the user canister's update configuration method
      let userCanister : Types.UserPaymentCanister = actor(Principal.toText(canisterId));
      let updateResult = await userCanister.updateConfiguration(newConfig);
      
      switch (updateResult) {
        case (#ok()) {
          // Update our record
          let updatedRecord : CanisterRecord = {
            record with
            name = newConfig.name;
            description = newConfig.description;
            supportedTokens = newConfig.supportedTokens;
            lastUpdated = Time.now();
          };
          
          userCanisters.put(canisterId, updatedRecord);
          #ok()
        };
        case (#err(msg)) {
          #err("Failed to update canister configuration: " # msg)
        };
      };
    } catch (error) {
      #err("Error communicating with user canister: " # Error.message(error))
    }
  };
  
  /// Deactivate a canister (soft delete)
  public shared(msg) func deactivateCanister(canisterId: Principal) : async Result.Result<(), Text> {
    let caller = msg.caller;
    
    let ?record = userCanisters.get(canisterId) else {
      return #err("Canister not found");
    };
    
    if (record.owner != caller) {
      return #err("Only the owner can deactivate the canister");
    };
    
    let updatedRecord : CanisterRecord = {
      record with isActive = false; lastUpdated = Time.now();
    };
    
    userCanisters.put(canisterId, updatedRecord);
    #ok()
  };
  
  /// Get factory statistics
  public query func getFactoryStats() : async FactoryStats {
    let totalCanisters = userCanisters.size();
    let activeCanisters = Iter.size(
      Iter.filter(userCanisters.vals(), func(record: CanisterRecord) : Bool {
        record.isActive
      })
    );
    let totalUsers = canistersByOwner.size();
    
    {
      totalCanisters = totalCanisters;
      activeCanisters = activeCanisters;
      totalUsers = totalUsers;
      currentVersion = nextCanisterVersion - 1;
    }
  };
  
  /// Find canisters by token support
  public query func findCanistersByToken(tokenSymbol: Text) : async [CanisterRecord] {
    let results = Buffer.Buffer<CanisterRecord>(10);
    
    for (record in userCanisters.vals()) {
      if (record.isActive) {
        for (token in record.supportedTokens.vals()) {
          if (token.symbol == tokenSymbol) {
            results.add(record);
          };
        };
      };
    };
    
    Buffer.toArray(results)
  };
  
  // === ADMIN FUNCTIONS ===
  
  /// Set the WASM module for user canisters (admin only)
  public shared(msg) func setUserCanisterWasm(wasm: Blob) : async Result.Result<(), Text> {
    // TODO: Add proper admin authorization
    if (not isAdmin(msg.caller)) {
      return #err("Only admin can set WASM");
    };
    
    userCanisterWasm := ?wasm;
    #ok()
  };
  
  /// Upgrade user canisters to new version (admin only)
  public shared(msg) func upgradeUserCanisters(
    canisterIds: [Principal], 
    newWasm: Blob
  ) : async Result.Result<[Result.Result<(), Text>], Text> {
    if (not isAdmin(msg.caller)) {
      return #err("Only admin can upgrade canisters");
    };
    
    let results = Buffer.Buffer<Result.Result<(), Text>>(canisterIds.size());
    
    for (canisterId in canisterIds.vals()) {
      try {
        await ic.install_code({
          mode = #upgrade;
          canister_id = canisterId;
          wasm_module = newWasm;
          arg = Blob.fromArray([]);
        });
        
        // Update version in our records
        switch (userCanisters.get(canisterId)) {
          case (?record) {
            let updatedRecord : CanisterRecord = {
              record with 
              version = nextCanisterVersion;
              lastUpdated = Time.now();
            };
            userCanisters.put(canisterId, updatedRecord);
          };
          case null { /* Skip */ };
        };
        
        results.add(#ok());
      } catch (error) {
        results.add(#err(Error.message(error)));
      };
    };
    
    nextCanisterVersion += 1;
    #ok(Buffer.toArray(results))
  };
  
  // Helper functions
  private func isAdmin(caller: Principal) : Bool {
    // TODO: Implement proper admin check
    // For now, only the factory canister itself can be admin
    Principal.equal(caller, Principal.fromActor(PaymentFactory))
  };
  
  private func to_candid(config: UserCanisterConfig) : Blob {
    // TODO: Implement proper candid serialization
    // For now, return empty blob - this should serialize the config
    Blob.fromArray([])
  };
}
