// src/types/subscription.ts
import { Principal } from '@dfinity/principal';

export enum SubscriptionStatus {
  Active = 'Active',
  Paused = 'Paused',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  PendingPayment = 'PendingPayment',
}

export enum BillingInterval {
  Daily = 'Daily',
  Weekly = 'Weekly', 
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Yearly = 'Yearly',
  Custom = 'Custom',
}

export type BillingIntervalData = 
  | { Daily: null }
  | { Weekly: null }
  | { Monthly: null }
  | { Quarterly: null }
  | { Yearly: null }
  | { Custom: bigint }; // Custom interval in seconds

export interface SubscriptionPlan {
  plan_id: string;
  name: string;
  description: string;
  price: bigint; // Price in token's smallest unit
  token: string; // Token symbol (e.g., "ckBTC")
  billing_interval: BillingIntervalData;
  trial_period_days?: number; // Free trial period
  max_subscriptions?: number; // Maximum number of active subscriptions, None = unlimited
  features: string[]; // List of features included in this plan
  is_active: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export interface Subscription {
  subscription_id: string;
  plan_id: string;
  subscriber: Principal;
  status: SubscriptionStatus;
  current_period_start: bigint;
  current_period_end: bigint;
  next_billing_date: bigint;
  trial_end?: bigint; // When trial period ends, if applicable
  cancelled_at?: bigint; // When subscription was cancelled
  cancel_at_period_end: boolean; // If true, cancel at end of current period
  total_payments: bigint; // Total amount paid over lifetime
  payment_failures: number; // Number of consecutive payment failures
  metadata: [string, string][]; // Custom metadata key-value pairs
  created_at: bigint;
  updated_at: bigint;
}

export interface SubscriptionPayment {
  payment_id: string;
  subscription_id: string;
  amount: bigint;
  token: string;
  billing_period_start: bigint;
  billing_period_end: bigint;
  payment_date: bigint;
  status: string; // "paid", "failed", "pending"
  transaction_id?: string; // Link to actual payment transaction
  failure_reason?: string; // If payment failed, why?
}

export interface SubscriptionAnalytics {
  total_plans: number;
  active_plans: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_revenue: bigint;
  churn_rate: number;
  average_revenue_per_user: bigint;
  most_popular_plan?: string;
}

// Form interfaces for creating/editing subscription plans
export interface CreateSubscriptionPlanForm {
  name: string;
  description: string;
  price: string; // Will be converted to bigint
  token: string;
  billing_interval: BillingInterval;
  custom_interval_seconds?: string; // For custom billing interval
  trial_period_days?: number;
  max_subscriptions?: number;
  features: string[];
  is_active: boolean;
}

export interface SubscriptionPlanFormData extends Omit<CreateSubscriptionPlanForm, 'price' | 'custom_interval_seconds'> {
  price: bigint;
  billing_interval: BillingIntervalData;
}

// Form interfaces for subscriptions
export interface CreateSubscriptionForm {
  plan_id: string;
  metadata: [string, string][];
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// UI component props
export interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit?: (plan: SubscriptionPlan) => void;
  onDelete?: (planId: string) => void;
  onToggleStatus?: (planId: string) => void;
  isLoading?: boolean;
}

export interface SubscriptionCardProps {
  subscription: Subscription;
  plan?: SubscriptionPlan;
  onPause?: (subscriptionId: string) => void;
  onResume?: (subscriptionId: string) => void;
  onCancel?: (subscriptionId: string, immediately?: boolean) => void;
  isLoading?: boolean;
}

export interface SubscriptionPlanFormProps {
  plan?: SubscriptionPlan;
  onSubmit: (planData: CreateSubscriptionPlanForm) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  supportedTokens: string[];
}

export interface SubscriptionAnalyticsProps {
  analytics: SubscriptionAnalytics;
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  isLoading?: boolean;
}

export interface BillingHistoryProps {
  payments: SubscriptionPayment[];
  isLoading?: boolean;
}
