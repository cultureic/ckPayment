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
export type Result = { 'ok' : Profile } |
  { 'err' : string };
export type Result_1 = { 'ok' : Item } |
  { 'err' : string };
export type Result_2 = { 'ok' : null } |
  { 'err' : string };
export type Result_3 = { 'ok' : string } |
  { 'err' : string };
export type Result_4 = { 'ok' : Invoice } |
  { 'err' : string };
export type Result_5 = { 'ok' : bigint } |
  { 'err' : string };
export type Subaccount = Uint8Array | number[];
export interface _SERVICE {
  'addNewItem' : ActorMethod<[NewItemRequest], Result_5>,
  'addNewProfile' : ActorMethod<[Profile], Result>,
  'buyItem' : ActorMethod<[bigint], Result_3>,
  'getBalance' : ActorMethod<[], bigint>,
  'getInvoice' : ActorMethod<[bigint], Result_4>,
  'getItem' : ActorMethod<[bigint], Result_1>,
  'getProfile' : ActorMethod<[Principal], Result>,
  'mintBTC' : ActorMethod<[], Result_3>,
  'payInvoice' : ActorMethod<[Invoice], Result_2>,
  'updateItem' : ActorMethod<[bigint, Item], Result_1>,
  'updateProfile' : ActorMethod<[Profile], Result>,
  'whoami' : ActorMethod<[], string>,
}
