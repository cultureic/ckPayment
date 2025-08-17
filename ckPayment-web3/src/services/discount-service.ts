// src/services/discount-service.ts
import { Principal } from '@dfinity/principal';
import { createActor } from '../services/user-payment-idl';
import type { 
  DiscountCoupon, 
  CouponUsage, 
  ServiceResponse, 
  CouponValidationResult,
  CreateCouponForm,
  CouponFormData,
  CouponTypeData,
  CouponType
} from '../types/discount';

export class DiscountService {
  private actor: any;
  
  constructor(private canisterId: string) {}
  
  async initialize(): Promise<void> {
    this.actor = await createActor(this.canisterId, {
      agentOptions: { host: 'https://ic0.app' }
    });
  }

  // CRUD Operations
  async createCoupon(couponData: CreateCouponForm): Promise<ServiceResponse<string>> {
    try {
      const formattedCoupon = this.formatCouponForBackend(couponData);
      const result = await this.actor.create_coupon(formattedCoupon);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateCoupon(couponId: string, couponData: CreateCouponForm): Promise<ServiceResponse<void>> {
    try {
      const formattedCoupon = this.formatCouponForBackend(couponData);
      formattedCoupon.coupon_id = couponId;
      
      const result = await this.actor.update_coupon(couponId, formattedCoupon);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCoupon(couponId: string): Promise<ServiceResponse<DiscountCoupon>> {
    try {
      const result = await this.actor.get_coupon(couponId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCouponByCode(code: string): Promise<ServiceResponse<DiscountCoupon>> {
    try {
      const result = await this.actor.get_coupon_by_code(code);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMyCoupons(): Promise<ServiceResponse<DiscountCoupon[]>> {
    try {
      const result = await this.actor.list_my_coupons();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveCoupons(): Promise<ServiceResponse<DiscountCoupon[]>> {
    try {
      const result = await this.actor.list_active_coupons();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteCoupon(couponId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.delete_coupon(couponId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async toggleCouponStatus(couponId: string): Promise<ServiceResponse<boolean>> {
    try {
      const result = await this.actor.toggle_coupon_status(couponId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Coupon validation and usage
  async validateCoupon(code: string, invoiceAmount: bigint): Promise<ServiceResponse<CouponValidationResult>> {
    try {
      const result = await this.actor.validate_coupon_usage(code, invoiceAmount);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async applyCoupon(code: string, invoiceAmount: bigint): Promise<ServiceResponse<[string, bigint]>> {
    try {
      const result = await this.actor.apply_coupon_discount(code, invoiceAmount);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Analytics and usage tracking
  async getCouponUsageStats(couponId: string): Promise<ServiceResponse<[number, CouponUsage[]]>> {
    try {
      const result = await this.actor.get_coupon_usage_stats(couponId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Admin operations
  async clearAllCoupons(): Promise<ServiceResponse<number>> {
    try {
      const result = await this.actor.admin_clear_all_coupons();
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Helper Methods
  private formatCouponForBackend(couponData: CreateCouponForm): any {
    const couponType = this.formatCouponType(couponData.coupon_type, couponData.discount_value);
    
    return {
      coupon_id: '', // Will be set by backend
      code: couponData.code.toUpperCase(),
      coupon_type: couponType,
      description: couponData.description,
      minimum_amount: couponData.minimum_amount ? [BigInt(couponData.minimum_amount)] : [],
      applicable_tokens: couponData.applicable_tokens,
      usage_limit: couponData.usage_limit ? [couponData.usage_limit] : [],
      used_count: 0,
      expires_at: couponData.expires_at ? [BigInt(couponData.expires_at.getTime() * 1_000_000)] : [],
      is_active: couponData.is_active,
      created_at: BigInt(0), // Will be set by backend
      updated_at: BigInt(0), // Will be set by backend
    };
  }

  private formatCouponType(type: CouponType, value: string): CouponTypeData {
    switch (type) {
      case CouponType.Percentage:
        return { Percentage: parseInt(value) };
      case CouponType.FixedAmount:
        return { FixedAmount: BigInt(value) };
      case CouponType.FreeShipping:
        return { FreeShipping: null };
      default:
        throw new Error(`Unsupported coupon type: ${type}`);
    }
  }

  private handleResult<T>(result: any): ServiceResponse<T> {
    if ('Ok' in result) {
      return { success: true, data: result.Ok };
    } else {
      return { success: false, error: result.Err };
    }
  }

  private handleError(error: any): ServiceResponse<never> {
    console.error('DiscountService error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  // Utility methods for UI
  formatCouponDiscount(coupon: DiscountCoupon): string {
    if ('Percentage' in coupon.coupon_type) {
      return `${coupon.coupon_type.Percentage}% OFF`;
    } else if ('FixedAmount' in coupon.coupon_type) {
      return `${coupon.coupon_type.FixedAmount} OFF`;
    } else if ('FreeShipping' in coupon.coupon_type) {
      return 'FREE SHIPPING';
    }
    return 'DISCOUNT';
  }

  isExpired(coupon: DiscountCoupon): boolean {
    if (!coupon.expires_at) return false;
    return coupon.expires_at < BigInt(Date.now() * 1_000_000);
  }

  isUsageLimitReached(coupon: DiscountCoupon): boolean {
    if (!coupon.usage_limit) return false;
    return coupon.used_count >= coupon.usage_limit;
  }

  canUse(coupon: DiscountCoupon): boolean {
    return coupon.is_active && !this.isExpired(coupon) && !this.isUsageLimitReached(coupon);
  }
}
