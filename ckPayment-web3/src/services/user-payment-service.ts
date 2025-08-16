import { Principal } from '@dfinity/principal';
import { ActorSubclass, HttpAgent } from '@dfinity/agent';
import { userPaymentCanisterIdlFactory } from './user-payment-idl';

// Types from the user payment canister interface
export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  canister_id: Principal;
  fee: bigint;
  logo: [] | [string];  // Candid Opt(Text) format: [] for null, [value] for some value
  is_active: boolean;
}

export interface UserCanisterConfig {
  name: string;
  description: string;
  supported_tokens: TokenConfig[];
  webhook: string | null;
  merchant_fee: number;
  auto_withdraw: boolean;
  withdraw_threshold: bigint | null;
  custom_settings: [string, string][];
}

export interface PaymentAnalytics {
  total_transactions: bigint;
  total_volume: Array<[string, bigint]>;
  success_rate: number;
  average_amount: Array<[string, bigint]>;
  top_tokens: string[];
}

export interface PaymentTransaction {
  id: string;
  from: Principal;
  to: Principal;
  token: TokenConfig;
  amount: bigint;
  fee: bigint;
  merchant_fee: bigint;
  timestamp: bigint;
  status: 'Pending' | 'Completed' | { Failed: string } | 'Refunded';
  metadata: Array<[string, string]>;
}

export type UserPaymentCanisterActor = ActorSubclass<{
  add_supported_token: (token: TokenConfig) => Promise<{ Ok?: null; Err?: string }>;
  remove_supported_token: (symbol: string) => Promise<{ Ok?: null; Err?: string }>;
  update_supported_token: (symbol: string, token: TokenConfig) => Promise<{ Ok?: null; Err?: string }>;
  toggle_token_status: (symbol: string) => Promise<{ Ok?: boolean; Err?: string }>;
  get_supported_tokens: () => Promise<TokenConfig[]>;
  get_configuration: () => Promise<UserCanisterConfig>;
  admin_update_owner: (new_owner: Principal) => Promise<{ Ok?: null; Err?: string }>;
  get_all_balances: () => Promise<Array<[string, bigint]>>;
  get_analytics: (start_date?: [string] | [], end_date?: [string] | []) => Promise<PaymentAnalytics>;
  get_transaction_history: (limit: bigint, offset: bigint) => Promise<PaymentTransaction[]>;
  health: () => Promise<[string, bigint, bigint]>;
  get_owner: () => Promise<Principal>;
}>;

class UserPaymentService {
  private agent: HttpAgent | null = null;
  private actors: Map<string, UserPaymentCanisterActor> = new Map();

  async initialize(identity?: any) {
    try {
      // Create agent
      this.agent = new HttpAgent({
        host: process.env.NODE_ENV === 'production' 
          ? 'https://ic0.app' 
          : 'http://127.0.0.1:4943',
        identity
      });

      // Only fetch root key in development
      if (process.env.NODE_ENV !== 'production') {
        await this.agent.fetchRootKey();
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize user payment service:', error);
      return false;
    }
  }

  private async getActor(canisterId: string): Promise<UserPaymentCanisterActor> {
    if (!this.agent) {
      throw new Error('User payment service not initialized');
    }

    // Check if we already have an actor for this canister
    if (this.actors.has(canisterId)) {
      return this.actors.get(canisterId)!;
    }

    try {
      // Create new actor
      const { Actor } = await import('@dfinity/agent');
      const actor = Actor.createActor(userPaymentCanisterIdlFactory, {
        agent: this.agent,
        canisterId: Principal.fromText(canisterId),
      }) as UserPaymentCanisterActor;

      // Cache the actor
      this.actors.set(canisterId, actor);
      return actor;
    } catch (error) {
      console.error('Failed to create actor for canister:', canisterId, error);
      throw new Error(`Failed to create actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addSupportedToken(canisterId: string, token: TokenConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.add_supported_token(token);
      
      if ('Ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Failed to add supported token:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async removeSupportedToken(canisterId: string, symbol: string): Promise<{ success: boolean; error?: string }> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.remove_supported_token(symbol);
      
      if ('Ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Failed to remove supported token:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateSupportedToken(canisterId: string, symbol: string, token: TokenConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.update_supported_token(symbol, token);
      
      if ('Ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Failed to update supported token:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async toggleTokenStatus(canisterId: string, symbol: string): Promise<{ success: boolean; newStatus?: boolean; error?: string }> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.toggle_token_status(symbol);
      
      if ('Ok' in result) {
        return { success: true, newStatus: result.Ok };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Failed to toggle token status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSupportedTokens(canisterId: string): Promise<TokenConfig[]> {
    try {
      const actor = await this.getActor(canisterId);
      return await actor.get_supported_tokens();
    } catch (error) {
      console.error('Failed to get supported tokens:', error);
      return [];
    }
  }

  async getConfiguration(canisterId: string): Promise<UserCanisterConfig | null> {
    try {
      const actor = await this.getActor(canisterId);
      return await actor.get_configuration();
    } catch (error) {
      console.error('Failed to get configuration:', error);
      return null;
    }
  }

  async adminUpdateOwner(canisterId: string, newOwner: Principal): Promise<{ success: boolean; error?: string }> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.admin_update_owner(newOwner);
      
      if ('Ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Failed to update owner:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAllBalances(canisterId: string): Promise<Array<[string, bigint]>> {
    try {
      const actor = await this.getActor(canisterId);
      return await actor.get_all_balances();
    } catch (error) {
      console.error('Failed to get balances:', error);
      return [];
    }
  }

  async getAnalytics(canisterId: string, startDate?: string, endDate?: string): Promise<PaymentAnalytics | null> {
    try {
      const actor = await this.getActor(canisterId);
      return await actor.get_analytics(
        startDate ? [startDate] : [],
        endDate ? [endDate] : []
      );
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  async getTransactionHistory(canisterId: string, limit: number = 50, offset: number = 0): Promise<PaymentTransaction[]> {
    try {
      const actor = await this.getActor(canisterId);
      return await actor.get_transaction_history(BigInt(limit), BigInt(offset));
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  async getHealth(canisterId: string): Promise<{ status: string; version: bigint; uptime: bigint } | null> {
    try {
      const actor = await this.getActor(canisterId);
      const [status, version, uptime] = await actor.health();
      return { status, version, uptime };
    } catch (error) {
      console.error('Failed to get health:', error);
      return null;
    }
  }

  async getOwner(canisterId: string): Promise<Principal | null> {
    try {
      const actor = await this.getActor(canisterId);
      return await actor.get_owner();
    } catch (error) {
      console.error('Failed to get owner:', error);
      return null;
    }
  }
}

export const userPaymentService = new UserPaymentService();
export default userPaymentService;
