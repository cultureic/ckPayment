import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CanisterRecord {
  'id' : Principal,
  'owner' : Principal,
  'name' : string,
  'description' : string,
  'last_updated' : bigint,
  'created_at' : bigint,
  'version' : bigint,
  'is_active' : boolean,
  'supported_tokens' : Array<TokenConfig>,
}
export interface FactoryStats {
  'active_canisters' : bigint,
  'total_users' : bigint,
  'current_version' : bigint,
  'total_canisters' : bigint,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };
export interface TokenConfig {
  'fee' : bigint,
  'decimals' : number,
  'logo' : [] | [string],
  'name' : string,
  'canister_id' : Principal,
  'is_active' : boolean,
  'symbol' : string,
}
export interface UserCanisterConfig {
  'merchant_fee' : number,
  'name' : string,
  'custom_settings' : Array<[string, string]>,
  'description' : string,
  'webhook' : [] | [string],
  'withdraw_threshold' : [] | [bigint],
  'auto_withdraw' : boolean,
  'supported_tokens' : Array<TokenConfig>,
}
export interface _SERVICE {
  'canister_id' : ActorMethod<[], Principal>,
  'deploy_user_payment_canister' : ActorMethod<[UserCanisterConfig], Result>,
  'find_canisters_by_token' : ActorMethod<[string], Array<CanisterRecord>>,
  'get_all_active_canisters' : ActorMethod<[], Array<CanisterRecord>>,
  'get_canister_info' : ActorMethod<[Principal], [] | [CanisterRecord]>,
  'get_factory_stats' : ActorMethod<[], FactoryStats>,
  'get_user_canisters' : ActorMethod<[Principal], Array<CanisterRecord>>,
  'get_wasm_status' : ActorMethod<[], string>,
  'greet' : ActorMethod<[string], string>,
  'set_user_canister_wasm' : ActorMethod<[Uint8Array | number[]], Result_1>,
  'whoami' : ActorMethod<[], Principal>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
