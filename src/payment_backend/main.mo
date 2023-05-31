import Text "mo:base/Text";
actor {
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public query func getMessage(): async Text {
    return "Hello ICP From the payment provider backends!"
  }
};
