// src/types/discount.ts
import { Principal } from '@dfinity/principal';

export enum CouponType {
  FreeShipping = 'FreeShipping',
  FixedAmount = 'FixedAmount', 
  Percentage = 'Percentage',
}

export interface DiscountCoupon {
  coupon_id: string;
  code: string;
  coupon_type: CouponTypeData;
  description: string;
  minimum_amount?: bigint;
  applicable_tokens: string[];
  usage_limit?: number;
  used_count: number;
  expires_at?: bigint;
  is_active: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export type CouponTypeData = 
  | { FreeShipping: null }
  | { FixedAmount: bigint }
  | { Percentage: number };

export interface CouponUsage {
  usage_id: string;
  coupon_id: string;
  user_principal: Principal;
  invoice_id: string;
  discount_applied: bigint;
  used_at: bigint;
}

export interface CouponAnalytics {
  total_coupons: number;
  active_coupons: number;
  total_usage: number;
  total_savings: bigint;
  most_used_coupon?: string;
  conversion_rate: number;
}

// Form interfaces for creating/editing coupons
export interface CreateCouponForm {
  code: string;
  coupon_type: CouponType;
  discount_value: string; // Will be converted to appropriate type
  description: string;
  minimum_amount?: string;
  applicable_tokens: string[];
  usage_limit?: number;
  expires_at?: Date;
  is_active: boolean;
}

export interface CouponFormData extends Omit<CreateCouponForm, 'expires_at'> {
  expires_at?: bigint;
  minimum_amount?: bigint;
  discount_value: CouponTypeData;
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CouponValidationResult {
  is_valid: boolean;
  discount_amount?: bigint;
  error_message?: string;
  coupon?: DiscountCoupon;
}

// UI component props
export interface CouponCardProps {
  coupon: DiscountCoupon;
  onEdit?: (coupon: DiscountCoupon) => void;
  onDelete?: (couponId: string) => void;
  onToggleStatus?: (couponId: string) => void;
  isLoading?: boolean;
}

export interface CouponFormProps {
  coupon?: DiscountCoupon;
  onSubmit: (couponData: CreateCouponForm) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CouponAnalyticsProps {
  analytics: CouponAnalytics;
  coupons: DiscountCoupon[];
  usageHistory: CouponUsage[];
  isLoading?: boolean;
}
