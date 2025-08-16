import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// User Payment Canister IDL (Interface Definition Language)
// This should match your Rust canister interface
const USER_PAYMENT_IDL = ({ IDL }) => {
  return IDL.Service({
    'get_supported_tokens': IDL.Func([], [IDL.Vec(IDL.Record({
      'name': IDL.Text,
      'canister_id': IDL.Principal,
      'symbol': IDL.Text,
      'decimals': IDL.Nat8
    }))], ['query']),
    'transfer_token': IDL.Func([
      IDL.Record({
        'token_canister': IDL.Principal,
        'amount': IDL.Nat,
        'to': IDL.Principal
      })
    ], [IDL.Variant({
      'Ok': IDL.Text,
      'Err': IDL.Text
    })], [])
  });
};

// Create actor for user payment canister
export const createUserPaymentActor = (canisterId, options = {}) => {
  const agent = new HttpAgent({
    host: 'https://ic0.app',
    ...options.agentOptions
  });

  // Fetch root key for certificate validation during development
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  return Actor.createActor(USER_PAYMENT_IDL, {
    agent,
    canisterId: Principal.fromText(canisterId)
  });
};

// User Payment Canister service
export class UserPaymentService {
  constructor(canisterId, identity = null) {
    this.canisterId = canisterId;
    this.actor = null;
    this.identity = identity;
  }

  async initializeActor(identity = null) {
    if (identity) {
      this.identity = identity;
    }

    const agent = new HttpAgent({
      host: 'https://ic0.app',
      identity: this.identity
    });

    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    this.actor = Actor.createActor(USER_PAYMENT_IDL, {
      agent,
      canisterId: Principal.fromText(this.canisterId)
    });

    return this.actor;
  }

  async getSupportedTokens() {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.get_supported_tokens();
      return result.map(token => ({
        name: token.name,
        canister: token.canister_id.toText(),
        symbol: token.symbol,
        decimals: Number(token.decimals),
        id: token.symbol.toLowerCase()
      }));
    } catch (error) {
      console.error('Failed to get supported tokens from user payment canister:', error);
      
      // Fallback to hardcoded tokens
      return [
        { id: 'icp', name: 'ICP', symbol: 'ICP', canister: 'ryjl3-tyaaa-aaaaa-aaaba-cai', decimals: 8 },
        { id: 'ruggy', name: 'Ruggy', symbol: 'RUGGY', canister: 'icaf7-3aaaa-aaaam-qcx3q-cai', decimals: 8 },
        { id: 'ratsy', name: 'Ratsy', symbol: 'RATSY', canister: 'bzx5a-iyaaa-aaaaa-qbmvq-cai', decimals: 8 }
      ];
    }
  }

  async transferToken(tokenCanister, amount, recipient) {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.transfer_token({
        token_canister: Principal.fromText(tokenCanister),
        amount: BigInt(amount),
        to: Principal.fromText(recipient)
      });

      if ('Ok' in result) {
        return { success: true, transactionId: result.Ok };
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }
}

export default UserPaymentService;
