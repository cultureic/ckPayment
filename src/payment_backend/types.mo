import Text "mo:base/Text";
import Blob "mo:base/Blob";
module {



  public type Subaccount = Blob;
  public type Account = {
    owner : Principal;
    subaccount : ?Subaccount;
  };

  public type BlockIndex = Nat;
  public type Tokens = Nat;
  public type TxIndex = Nat;
    public type TimeStamp = Nat64;



    public type TransferError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #BadBurn : { min_burn_amount : Nat };
    #Duplicate : { duplicate_of : Nat };
    #BadFee : { expected_fee : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #TooOld;
    #InsufficientFunds : { balance : Nat };
  };

 public type TransferArg = {
    to : Account;
    fee : ?Tokens;
    memo : ?Blob;
    from_subaccount : ?Subaccount;
    created_at_time : ?TimeStamp;
    amount : Tokens;
  };

  public type TransferResult = {
      #Ok:BlockIndex;
      #Err:TransferError;
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