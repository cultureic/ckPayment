import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// User Payment Canister IDL (Interface Definition Language)
// This should match your Rust canister interface
const USER_PAYMENT_IDL = ({ IDL }) => {
  const TokenConfig = IDL.Record({
    'symbol': IDL.Text,
    'name': IDL.Text,
    'decimals': IDL.Nat8,
    'canister_id': IDL.Principal,
    'fee': IDL.Nat64,
    'logo': IDL.Opt(IDL.Text),
    'is_active': IDL.Bool
  });

  const ModalTheme = IDL.Record({
    'primary_color': IDL.Text,
    'background_color': IDL.Text,
    'text_color': IDL.Text,
    'border_radius': IDL.Nat32,
    'font_family': IDL.Text
  });

  const PaymentOptions = IDL.Record({
    'allowed_tokens': IDL.Vec(IDL.Text),
    'require_email': IDL.Bool,
    'require_shipping': IDL.Bool,
    'show_amount_breakdown': IDL.Bool,
    'enable_tips': IDL.Bool
  });

  const BrandingConfig = IDL.Record({
    'logo_url': IDL.Opt(IDL.Text),
    'company_name': IDL.Text,
    'support_url': IDL.Opt(IDL.Text),
    'terms_url': IDL.Opt(IDL.Text)
  });

  const RedirectUrls = IDL.Record({
    'success_url': IDL.Text,
    'cancel_url': IDL.Text,
    'webhook_url': IDL.Opt(IDL.Text)
  });

  const ModalConfig = IDL.Record({
    'modal_id': IDL.Text,
    'name': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'theme': ModalTheme,
    'payment_options': PaymentOptions,
    'branding': BrandingConfig,
    'redirect_urls': RedirectUrls,
    'template_id': IDL.Opt(IDL.Text),
    'created_at': IDL.Nat64,
    'updated_at': IDL.Nat64,
    'is_active': IDL.Bool
  });

  const CouponType = IDL.Variant({
    'Percentage': IDL.Nat32,
    'FixedAmount': IDL.Nat64,
    'FreeShipping': IDL.Null
  });

  const DiscountCoupon = IDL.Record({
    'coupon_id': IDL.Text,
    'code': IDL.Text,
    'coupon_type': CouponType,
    'description': IDL.Text,
    'minimum_amount': IDL.Opt(IDL.Nat64),
    'applicable_tokens': IDL.Vec(IDL.Text),
    'usage_limit': IDL.Opt(IDL.Nat32),
    'used_count': IDL.Nat32,
    'expires_at': IDL.Opt(IDL.Nat64),
    'is_active': IDL.Bool,
    'created_at': IDL.Nat64,
    'updated_at': IDL.Nat64
  });

  const BillingInterval = IDL.Variant({
    'Daily': IDL.Null,
    'Weekly': IDL.Null,
    'Monthly': IDL.Null,
    'Quarterly': IDL.Null,
    'Yearly': IDL.Null,
    'Custom': IDL.Nat64
  });

  const SubscriptionPlan = IDL.Record({
    'plan_id': IDL.Text,
    'name': IDL.Text,
    'description': IDL.Text,
    'price': IDL.Nat64,
    'token': IDL.Text,
    'billing_interval': BillingInterval,
    'trial_period_days': IDL.Opt(IDL.Nat32),
    'max_subscriptions': IDL.Opt(IDL.Nat32),
    'features': IDL.Vec(IDL.Text),
    'is_active': IDL.Bool,
    'created_at': IDL.Nat64,
    'updated_at': IDL.Nat64
  });

  const UserCanisterConfig = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Text,
    'supported_tokens': IDL.Vec(TokenConfig),
    'webhook': IDL.Opt(IDL.Text),
    'merchant_fee': IDL.Nat32,
    'auto_withdraw': IDL.Bool,
    'withdraw_threshold': IDL.Opt(IDL.Nat64),
    'custom_settings': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))
  });

  return IDL.Service({
    // Token configuration
    'get_supported_tokens': IDL.Func([], [IDL.Vec(TokenConfig)], ['query']),
    'get_configuration': IDL.Func([], [UserCanisterConfig], ['query']),
    
    // Modal configuration
    'get_modal_config': IDL.Func([IDL.Text], [IDL.Opt(ModalConfig)], ['query']),
    'list_modal_configs': IDL.Func([], [IDL.Vec(ModalConfig)], ['query']),
    
    // Discount coupons
    'get_discount_coupon': IDL.Func([IDL.Text], [IDL.Opt(DiscountCoupon)], ['query']),
    'list_active_coupons': IDL.Func([], [IDL.Vec(DiscountCoupon)], ['query']),
    'validate_and_use_coupon': IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Text], 
      [IDL.Variant({ 'Ok': IDL.Tuple(IDL.Text, IDL.Nat64), 'Err': IDL.Text })], 
      []
    ),
    
    // Subscription plans
    'get_subscription_plan': IDL.Func([IDL.Text], [IDL.Opt(SubscriptionPlan)], ['query']),
    'list_active_subscription_plans': IDL.Func([], [IDL.Vec(SubscriptionPlan)], ['query']),
    
    // Payments
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
        canister_id: token.canister_id.toText(),
        symbol: token.symbol,
        decimals: Number(token.decimals),
        fee: Number(token.fee || 0),
        logo: token.logo?.[0] || null,
        is_active: token.is_active,
        id: token.symbol.toLowerCase()
      }));
    } catch (error) {
      console.error('Failed to get supported tokens from user payment canister:', error);
      
      // Fallback to hardcoded tokens
      return [
        { id: 'icp', name: 'ICP', symbol: 'ICP', canister: 'ryjl3-tyaaa-aaaaa-aaaba-cai', canister_id: 'ryjl3-tyaaa-aaaaa-aaaba-cai', decimals: 8, fee: 10000, is_active: true },
        { id: 'ruggy', name: 'Ruggy', symbol: 'RUGGY', canister: 'icaf7-3aaaa-aaaam-qcx3q-cai', canister_id: 'icaf7-3aaaa-aaaam-qcx3q-cai', decimals: 8, fee: 0, is_active: true },
        { id: 'ratsy', name: 'Ratsy', symbol: 'RATSY', canister: 'bzx5a-iyaaa-aaaaa-qbmvq-cai', canister_id: 'bzx5a-iyaaa-aaaaa-qbmvq-cai', decimals: 8, fee: 0, is_active: true }
      ];
    }
  }

  async getCanisterConfiguration() {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.get_configuration();
      return {
        name: result.name,
        description: result.description,
        supported_tokens: result.supported_tokens.map(token => ({
          name: token.name,
          canister: token.canister_id.toText(),
          canister_id: token.canister_id.toText(),
          symbol: token.symbol,
          decimals: Number(token.decimals),
          fee: Number(token.fee || 0),
          logo: token.logo?.[0] || null,
          is_active: token.is_active,
          id: token.symbol.toLowerCase()
        })),
        webhook: result.webhook?.[0] || null,
        merchant_fee: Number(result.merchant_fee),
        auto_withdraw: result.auto_withdraw,
        withdraw_threshold: result.withdraw_threshold?.[0] ? Number(result.withdraw_threshold[0]) : null,
        custom_settings: result.custom_settings.map(([key, value]) => ({ key, value }))
      };
    } catch (error) {
      console.error('Failed to get canister configuration:', error);
      return null;
    }
  }

  async getModalConfig(modalId = 'modal_1') {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.get_modal_config(modalId);
      if (result && result.length > 0) {
        const config = result[0];
        return {
          modal_id: config.modal_id,
          name: config.name,
          description: config.description?.[0] || null,
          theme: {
            primary_color: config.theme.primary_color,
            background_color: config.theme.background_color,
            text_color: config.theme.text_color,
            border_radius: Number(config.theme.border_radius),
            font_family: config.theme.font_family
          },
          payment_options: {
            allowed_tokens: config.payment_options.allowed_tokens,
            require_email: config.payment_options.require_email,
            require_shipping: config.payment_options.require_shipping,
            show_amount_breakdown: config.payment_options.show_amount_breakdown,
            enable_tips: config.payment_options.enable_tips
          },
          branding: {
            logo_url: config.branding.logo_url?.[0] || null,
            company_name: config.branding.company_name,
            support_url: config.branding.support_url?.[0] || null,
            terms_url: config.branding.terms_url?.[0] || null
          },
          redirect_urls: {
            success_url: config.redirect_urls.success_url,
            cancel_url: config.redirect_urls.cancel_url,
            webhook_url: config.redirect_urls.webhook_url?.[0] || null
          },
          template_id: config.template_id?.[0] || null,
          is_active: config.is_active
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get modal configuration:', error);
      return null;
    }
  }

  async getActiveCoupons() {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.list_active_coupons();
      return result.map(coupon => ({
        coupon_id: coupon.coupon_id,
        code: coupon.code,
        coupon_type: coupon.coupon_type,
        description: coupon.description,
        minimum_amount: coupon.minimum_amount?.[0] ? Number(coupon.minimum_amount[0]) : null,
        applicable_tokens: coupon.applicable_tokens,
        usage_limit: coupon.usage_limit?.[0] ? Number(coupon.usage_limit[0]) : null,
        used_count: Number(coupon.used_count),
        expires_at: coupon.expires_at?.[0] ? Number(coupon.expires_at[0]) : null,
        is_active: coupon.is_active
      }));
    } catch (error) {
      console.error('Failed to get active coupons:', error);
      return [];
    }
  }

  async validateCoupon(couponCode, amount, tokenSymbol) {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.validate_and_use_coupon(
        couponCode.toUpperCase(),
        BigInt(Math.floor(amount * 1e8)), // Convert to smallest unit
        tokenSymbol
      );

      if ('Ok' in result) {
        const [couponId, discountAmount] = result.Ok;
        return {
          success: true,
          coupon_id: couponId,
          discount_amount: Number(discountAmount) / 1e8 // Convert back to decimal
        };
      } else {
        return {
          success: false,
          error: result.Err
        };
      }
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getActiveSubscriptionPlans() {
    try {
      if (!this.actor) {
        await this.initializeActor();
      }

      const result = await this.actor.list_active_subscription_plans();
      return result.map(plan => ({
        plan_id: plan.plan_id,
        name: plan.name,
        description: plan.description,
        price: Number(plan.price) / 1e8, // Convert to decimal
        token: plan.token,
        billing_interval: plan.billing_interval,
        trial_period_days: plan.trial_period_days?.[0] ? Number(plan.trial_period_days[0]) : null,
        max_subscriptions: plan.max_subscriptions?.[0] ? Number(plan.max_subscriptions[0]) : null,
        features: plan.features,
        is_active: plan.is_active
      }));
    } catch (error) {
      console.error('Failed to get subscription plans:', error);
      return [];
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
