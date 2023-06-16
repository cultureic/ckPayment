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
    id:Nat;
    merchant:Principal;
  };

public type NewInvoiceRequest = {
    to : Account;
    amount : Nat;
    id:Nat;
    merchant:Principal;
};

public type Item = {
    id:Nat;
    name:Nat;
    cost:Float;
    available:Bool;
    category:Text;
    merchant:Principal;
};


public type Profile = {
    profilePicture:?Blob;
    name:?Text;
    description:?Text;
}



};