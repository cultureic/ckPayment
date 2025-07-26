export const idlFactory = ({ IDL }) => {
  const NewItemRequest = IDL.Record({
    'cost' : IDL.Nat,
    'name' : IDL.Text,
    'available' : IDL.Bool,
    'merchant' : IDL.Principal,
    'category' : IDL.Text,
  });
  const Result_6 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Profile = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'profilePicture' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_1 = IDL.Variant({ 'ok' : Profile, 'err' : IDL.Text });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const Invoice = IDL.Record({
    'to' : Account,
    'itemId' : IDL.Nat,
    'merchant' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const Result_5 = IDL.Variant({ 'ok' : Invoice, 'err' : IDL.Text });
  const Item = IDL.Record({
    'id' : IDL.Nat,
    'cost' : IDL.Nat,
    'name' : IDL.Text,
    'available' : IDL.Bool,
    'merchant' : IDL.Principal,
    'category' : IDL.Text,
    'wallet' : IDL.Opt(Subaccount),
  });
  const Result_2 = IDL.Variant({ 'ok' : Item, 'err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : TransferError });
  return IDL.Service({
    'addNewItem' : IDL.Func([NewItemRequest], [Result_6], []),
    'addNewProfile' : IDL.Func([Profile], [Result_1], []),
    'bitFabricCanister' : IDL.Func([], [IDL.Text], ['query']),
    'buyItem' : IDL.Func([IDL.Nat], [Result_4], []),
    'canCreateStore' : IDL.Func([], [IDL.Bool], ['query']),
    'getBalance' : IDL.Func([], [IDL.Nat], []),
    'getInvoice' : IDL.Func([IDL.Nat], [Result_5], []),
    'getItem' : IDL.Func([IDL.Nat], [Result_2], []),
    'getProfile' : IDL.Func([IDL.Principal], [Result_1], []),
    'mintBTC' : IDL.Func([], [Result_4], []),
    'payInvoice' : IDL.Func([Invoice], [Result_3], []),
    'updateItem' : IDL.Func([IDL.Nat, Item], [Result_2], []),
    'updateProfile' : IDL.Func([Profile], [Result_1], []),
    'whoami' : IDL.Func([], [IDL.Text], []),
    'whoamisub' : IDL.Func([], [Subaccount], ['query']),
    'withdraw' : IDL.Func([], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
