import { Principal } from '@dfinity/principal';
import { ActorSubclass, HttpAgent } from '@dfinity/agent';
import { createActor } from '../../../src/declarations/payment_backend';

// Types from the backend interface
export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  canister_id: Principal;
  fee: bigint;
  logo: string | null;
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

export interface CanisterRecord {
  id: Principal;
  owner: Principal;
  name: string;
  description: string;
  version: bigint;
  created_at: bigint;
  last_updated: bigint;
  is_active: boolean;
  supported_tokens: TokenConfig[];
}

export interface FactoryStats {
  total_canisters: bigint;
  active_canisters: bigint;
  total_users: bigint;
  current_version: bigint;
}

export interface DeploymentResult {
  success: boolean;
  canister_id?: Principal;
  error?: string;
}

class FactoryService {
  private actor: ActorSubclass<any> | null = null;
  private agent: HttpAgent | null = null;

  async initialize(identity?: any) {
    try {
      // Create agent
      this.agent = new HttpAgent({
        host: process.env.NODE_ENV === 'production' 
          ? 'https://icp-api.io' 
          : 'http://127.0.0.1:4943',
        identity
      });

      // Only fetch root key in development
      if (process.env.NODE_ENV !== 'production') {
        await this.agent.fetchRootKey();
      }

      // Create actor
      this.actor = createActor(process.env.CANISTER_ID_PAYMENT_BACKEND || 'zdfvs-baaaa-aaaag-acoeq-cai', {
        agent: this.agent
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize factory service:', error);
      return false;
    }
  }

  async deployUserCanister(config: UserCanisterConfig): Promise<DeploymentResult> {
    if (!this.actor) {
      throw new Error('Factory service not initialized');
    }

    try {
      const result = await this.actor.deploy_user_payment_canister(config);
      
      if ('Ok' in result) {
        return {
          success: true,
          canister_id: Principal.fromText(result.Ok)
        };
      } else {
        return {
          success: false,
          error: result.Err
        };
      }
    } catch (error) {
      console.error('Failed to deploy canister:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getFactoryStats(): Promise<FactoryStats | null> {
    if (!this.actor) {
      throw new Error('Factory service not initialized');
    }

    try {
      return await this.actor.get_factory_stats();
    } catch (error) {
      console.error('Failed to get factory stats:', error);
      return null;
    }
  }

  async getUserCanisters(principal: Principal): Promise<CanisterRecord[]> {
    if (!this.actor) {
      throw new Error('Factory service not initialized');
    }

    try {
      return await this.actor.get_user_canisters(principal);
    } catch (error) {
      console.error('Failed to get user canisters:', error);
      return [];
    }
  }

  async getAllActiveCanisters(): Promise<CanisterRecord[]> {
    if (!this.actor) {
      throw new Error('Factory service not initialized');
    }

    try {
      return await this.actor.get_all_active_canisters();
    } catch (error) {
      console.error('Failed to get active canisters:', error);
      return [];
    }
  }

  async getCanisterInfo(canisterId: Principal): Promise<CanisterRecord | null> {
    if (!this.actor) {
      throw new Error('Factory service not initialized');
    }

    try {
      const result = await this.actor.get_canister_info(canisterId);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get canister info:', error);
      return null;
    }
  }

  async findCanistersByToken(tokenSymbol: string): Promise<CanisterRecord[]> {
    if (!this.actor) {
      throw new Error('Factory service not initialized');
    }

    try {
      return await this.actor.find_canisters_by_token(tokenSymbol);
    } catch (error) {
      console.error('Failed to find canisters by token:', error);
      return [];
    }
  }

  async getWhoAmI(): Promise<Principal | null> {
    if (!this.actor) {
      return null;
    }

    try {
      return await this.actor.whoami();
    } catch (error) {
      console.error('Failed to get whoami:', error);
      return null;
    }
  }

  // Mock data fallback for development
  getMockFactoryStats(): FactoryStats {
    return {
      total_canisters: BigInt(15),
      active_canisters: BigInt(12),
      total_users: BigInt(8),
      current_version: BigInt(3)
    };
  }

  getMockRecentDeployments(): Array<{
    id: string;
    name: string;
    owner: string;
    created_at: Date;
    status: 'active' | 'pending' | 'error';
    version: string;
  }> {
    return [
      {
        id: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
        name: 'E-commerce Payment Gateway',
        owner: 'alice-principal-id',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'active',
        version: '1.3.0'
      },
      {
        id: 'rrkah-fqaaa-aaaah-qcgha-cai',
        name: 'Subscription Service Hub',
        owner: 'bob-principal-id',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: 'active',
        version: '1.3.0'
      },
      {
        id: 'ryjl3-tyaaa-aaaah-qcgfa-cai',
        name: 'Digital Marketplace',
        owner: 'charlie-principal-id',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        status: 'pending',
        version: '1.2.8'
      }
    ];
  }

  getMockUserCanisters(): CanisterRecord[] {
    return [
      {
        id: Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai'),
        owner: Principal.fromText('2vxsx-fae'),
        name: 'Demo Payment System',
        description: 'A demonstration payment processing canister with multiple tokens',
        version: BigInt(3),
        created_at: BigInt(Date.now() * 1_000_000 - 3600000 * 1_000_000), // 1 hour ago in nanoseconds
        last_updated: BigInt(Date.now() * 1_000_000),
        is_active: true,
        supported_tokens: [
          {
            symbol: 'ckBTC',
            name: 'Chain Key Bitcoin',
            decimals: 8,
            canister_id: Principal.fromText('mxzaz-hqaaa-aaaar-qaada-cai'),
            fee: BigInt(10),
            logo: null,
            is_active: true
          },
          {
            symbol: 'ICP',
            name: 'Internet Computer Protocol',
            decimals: 8,
            canister_id: Principal.fromText('ryjl3-tyaaa-aaaah-qcgha-cai'),
            fee: BigInt(10000),
            logo: null,
            is_active: true
          },
          {
            symbol: 'ckETH',
            name: 'Chain Key Ethereum',
            decimals: 18,
            canister_id: Principal.fromText('ss2fx-dyaaa-aaaar-qacoq-cai'),
            fee: BigInt(2000000000000000),
            logo: null,
            is_active: false
          }
        ]
      },
      {
        id: Principal.fromText('rrkah-fqaaa-aaaah-qcgha-cai'),
        owner: Principal.fromText('2vxsx-fae'),
        name: 'Marketplace Payments',
        description: 'Payment system for digital marketplace transactions',
        version: BigInt(2),
        created_at: BigInt(Date.now() * 1_000_000 - 7200000 * 1_000_000), // 2 hours ago
        last_updated: BigInt(Date.now() * 1_000_000 - 1800000 * 1_000_000), // 30 minutes ago
        is_active: true,
        supported_tokens: [
          {
            symbol: 'ckUSDC',
            name: 'Chain Key USDC',
            decimals: 6,
            canister_id: Principal.fromText('xkbca-myaaa-aaaah-qcgkq-cai'),
            fee: BigInt(1000),
            logo: null,
            is_active: true
          }
        ]
      }
    ];
  }

  // Create default configuration for new deployments
  createDefaultConfig(name: string, description: string): UserCanisterConfig {
    const defaultToken: TokenConfig = {
      symbol: 'ckBTC',
      name: 'Chain Key Bitcoin',
      decimals: 8,
      canister_id: Principal.fromText('mxzaz-hqaaa-aaaar-qaada-cai'),
      fee: BigInt(10),
      logo: null,
      is_active: true
    };

    return {
      name: name || 'New Payment System',
      description: description || 'Payment system created via Factory',
      supported_tokens: [defaultToken],
      webhook: null,
      merchant_fee: 250, // 2.5%
      auto_withdraw: false,
      withdraw_threshold: null,
      custom_settings: []
    };
  }
}

export const factoryService = new FactoryService();
export default factoryService;
