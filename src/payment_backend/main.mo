import Result "mo:base/Result";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Types "./types";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Prelude "mo:base/Prelude";




actor DB {

  stable var stableItems : [(Text, Types.Item)] = [];
  stable var stableInvoice : [(Text, Types.Invoice)] = [];
  stable var stableProfile : [(Principal, Types.Profile)] = [];

  let itemStore = HashMap.fromIter<Text, Types.Item>(Iter.fromArray(stableItems), stableItems.size(), Text.equal, Text.hash);
  let invoiceStore = HashMap.fromIter<Text, Types.Invoice>(Iter.fromArray(stableInvoice), stableItems.size(), Text.equal, Text.hash);
  let profileStore = HashMap.fromIter<Principal, Types.Profile>(Iter.fromArray(stableProfile), stableProfile.size(), Principal.equal, Principal.hash);

  // Upgrade canister
  //these could be improved to prevent data loss if values are added/removed in future
  system func preupgrade() {
    stableItems := Iter.toArray(itemStore.entries());
    stableInvoice := Iter.toArray(invoiceStore.entries());
    stableProfile := Iter.toArray(profileStore.entries());

  };

  system func postupgrade() {
    stableItems := [];
    stableInvoice := [];
    stableProfile := [];
  };

  public shared (msg) func addNewItem(newItem : Types.Item) : async Result.Result<Nat, Text> {
    if (null == profileStore.get(msg.caller)) return #err("You are not a merchant");
    let newid = itemStore.size();
    let itemToAdd : Types.Item = {
      id = newid;
      name = newItem.name;
      available = newItem.available;
      cost = newItem.cost;
      category = newItem.category;
      merchant = msg.caller;
    };
    switch (itemStore.put(Nat.toText(newid), itemToAdd)) {
      case (added) {
        return #ok(newid);
      };
    };
    return #err("Couldn't add the Item");
  };

  public shared (msg) func addNewProfile(newProfile : Types.Profile) : async Result.Result<Types.Profile, Text> {
    if (null != profileStore.get(msg.caller)) return #err("You already registered");
    let newid = profileStore.size();
    let profileToAdd : Types.Profile = {
      name = newProfile.name;
      profilePicture = newProfile.profilePicture;
      description = newProfile.description;
    };
    switch (profileStore.put(msg.caller, profileToAdd)) {
      case (added) {
        return #ok(profileToAdd);
      };
    };
    return #err("Couldn't add the Item");
  };

  public shared (msg) func addInvoice(newInvoice : Types.NewInvoiceRequest) : async Result.Result<Types.Invoice, Text> {
    if (null == profileStore.get(msg.caller)) return #err("You are not a merchant");
    let newid = invoiceStore.size();
    let invoiceToAdd : Types.Invoice = {
      id = newid;
      to = newInvoice.to;
      amount = newInvoice.amount;
      merchant = newInvoice.merchant;
    };
    switch (invoiceStore.put(Nat.toText(newid), invoiceToAdd)) {
      case (added) {
        return #ok(newInvoice);
      };
    };
    return #err("Couldn't add the Item");
  };

  public shared (msg) func getItem(id : Nat) : async Result.Result<Types.Item, Text> {
    let errorMsg = "item does not exist";
    if (id >= itemStore.size()) {
      return #err(errorMsg);
    };
    switch (itemStore.get(Nat.toText(id))) {
      case null { return #err(errorMsg) };
      case (?found) {
        return #ok(found);
      };
    };
  };

  public shared (msg) func getInvoice(id : Nat) : async Result.Result<Types.Invoice, Text> {
    let errorMsg = "Invoice does not exist";
    if (id >= invoiceStore.size()) {
      return #err(errorMsg);
    };
    switch (invoiceStore.get(Nat.toText(id))) {
      case null { return #err(errorMsg) };
      case (?found) {
        return #ok(found);
      };
    };
  };

  public shared (msg) func getProfile(id : Principal) : async Result.Result<Types.Profile, Text> {
    let errorMsg = "Invoice does not exist";
    switch (profileStore.get(id)) {
      case null { return #err(errorMsg) };
      case (?found) {
        return #ok(found);
      };
    };
  };



  public shared (msg) func deleteItem(id:Nat) : async Result.Result<(Text),Text>{
       let errorMsg = "Item does not exist";
    switch (itemStore.delete(Nat.toText(id))) {
      case (()) {
        return #ok("item has been deleted");
      };
    };
  };

    public shared (msg) func deleteProfile(id:Principal) : async Result.Result<(Text),Text>{
       let errorMsg = "Item does not exist";
    switch (profileStore.delete(id)) {
      case (()) {
        return #ok("item has been deleted");
      };
    };
  };



 public shared (msg) func updateProfile(profile : Types.Profile) : async Result.Result<(Types.Profile),Text> {
    switch (profileStore.get(msg.caller)) {
      case null {
        return #err("Profile not found")
      };
      case (?found) {
        let imgBlob : ?Blob = profile.profilePicture;
        let newProfile : Types.Profile = {
          name = profile.name;
          profilePicture = imgBlob;
          description = profile.name;
        };
        profileStore.put(msg.caller, newProfile);
        return #ok newProfile
      }
    }
  };



public shared (msg) func updateItem(id:Nat,newItem:Types.Item):async Result.Result<Types.Item,Text>{
  let errorMsg = "item does not exist";
    if (id >= itemStore.size()) {
      return #err(errorMsg);
    };
  switch(itemStore.get(Nat.toText(id))){
    case null { return #err errorMsg};
    case (?found) {
      if (msg.caller != found.merchant) return #err("You are not the merchant of this item");
      let itemToUpdate:Types.Item = {
        id=found.id;
        name=newItem.name;
        cost=newItem.cost;
        available=newItem.available;
        category=newItem.category;
        merchant=found.merchant;
      };
      itemStore.put(Nat.toText(id),itemToUpdate);
      return #ok itemToUpdate;
    }
  }
};




};
