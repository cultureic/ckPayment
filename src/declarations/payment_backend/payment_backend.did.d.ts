import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Subaccount],
}
export interface Invoice {
  'to' : Account,
  'itemId' : bigint,
  'merchant' : Principal,
  'amount' : bigint,
}
export interface Item {
  'id' : bigint,
  'cost' : bigint,
  'name' : string,
  'available' : boolean,
  'merchant' : Principal,
  'category' : string,
  'wallet' : [] | [Subaccount],
}
export interface NewItemRequest {
  'cost' : bigint,
  'name' : string,
  'available' : boolean,
  'merchant' : Principal,
  'category' : string,
}
export interface Profile {
  'name' : string,
  'description' : string,
  'profilePicture' : [] | [Uint8Array | number[]],
}
export type Result = { 'ok' : bigint } |
  { 'err' : TransferError };
export type Result_1 = { 'ok' : Profile } |
  { 'err' : string };
export type Result_2 = { 'ok' : Item } |
  { 'err' : string };
export type Result_3 = { 'ok' : null } |
  { 'err' : string };
export type Result_4 = { 'ok' : string } |
  { 'err' : string };
export type Result_5 = { 'ok' : Invoice } |
  { 'err' : string };
export type Result_6 = { 'ok' : bigint } |
  { 'err' : string };
export type Subaccount = Uint8Array | number[];
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface _SERVICE {
  'addNewItem' : ActorMethod<[NewItemRequest], Result_6>,
  'addNewProfile' : ActorMethod<[Profile], Result_1>,
  'bitFabricCanister' : ActorMethod<[], string>,
  'buyItem' : ActorMethod<[bigint], Result_4>,
  'canCreateStore' : ActorMethod<[], boolean>,
  'getBalance' : ActorMethod<[], bigint>,
  'getInvoice' : ActorMethod<[bigint], Result_5>,
  'getItem' : ActorMethod<[bigint], Result_2>,
  'getProfile' : ActorMethod<[Principal], Result_1>,
  'mintBTC' : ActorMethod<[], Result_4>,
  'payInvoice' : ActorMethod<[Invoice], Result_3>,
  'updateItem' : ActorMethod<[bigint, Item], Result_2>,
  'updateProfile' : ActorMethod<[Profile], Result_1>,
  'whoami' : ActorMethod<[], string>,
  'whoamisub' : ActorMethod<[], Subaccount>,
  'withdraw' : ActorMethod<[], Result>,
}
