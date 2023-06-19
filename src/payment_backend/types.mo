import Text "mo:base/Text";
import Blob "mo:base/Blob";
module {



  public type Subaccount = Blob;
  public type Account = {
    owner : Principal;
    subaccount : ?Subaccount;
  };


public type Invoice = {
    to : Account;
    amount : Nat;
    itemId: Nat;
    merchant: Principal;
  };

public type Item = {
    id: Nat;
    name: Text;
    cost: Nat;
    available: Bool;
    category: Text;
    merchant: Principal;
    wallet: ?Subaccount; 
};

public type NewItemRequest = {
    name: Text;
    cost: Nat;
    available: Bool;
    category: Text;
    merchant: Principal;
};


public type Profile = {
    profilePicture: ?Blob;
    name: Text;
    description: Text;
}



};