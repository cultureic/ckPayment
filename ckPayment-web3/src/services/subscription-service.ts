// src/services/subscription-service.ts
import { Principal } from '@dfinity/principal';
import { createActor } from '../services/user-payment-idl';
import type { 
  SubscriptionPlan, 
  Subscription, 
  SubscriptionPayment,
  ServiceResponse, 
  CreateSubscriptionPlanForm,
  CreateSubscriptionForm,
  SubscriptionPlanFormData,
  BillingIntervalData,
  BillingInterval
} from '../types/subscription';

export class SubscriptionService {
  private actor: any;
  
  constructor(private canisterId: string) {}
  
  async initialize(): Promise<void> {
    this.actor = await createActor(this.canisterId, {
      agentOptions: { host: 'https://ic0.app' }
    });
  }

  // SUBSCRIPTION PLAN CRUD Operations
  async createSubscriptionPlan(planData: CreateSubscriptionPlanForm): Promise<ServiceResponse<string>> {
    try {
      const formattedPlan = this.formatPlanForBackend(planData);
      const result = await this.actor.create_subscription_plan(formattedPlan);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscriptionPlan(planId: string): Promise<ServiceResponse<SubscriptionPlan>> {
    try {
      const result = await this.actor.get_subscription_plan(planId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscriptionPlans(): Promise<ServiceResponse<SubscriptionPlan[]>> {
    try {
      const result = await this.actor.list_subscription_plans();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveSubscriptionPlans(): Promise<ServiceResponse<SubscriptionPlan[]>> {
    try {
      const result = await this.actor.list_active_subscription_plans();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSubscriptionPlan(planId: string, planData: CreateSubscriptionPlanForm): Promise<ServiceResponse<void>> {
    try {
      const formattedPlan = this.formatPlanForBackend(planData);
      formattedPlan.plan_id = planId;
      
      const result = await this.actor.update_subscription_plan(planId, formattedPlan);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.delete_subscription_plan(planId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async toggleSubscriptionPlanStatus(planId: string): Promise<ServiceResponse<boolean>> {
    try {
      const result = await this.actor.toggle_subscription_plan_status(planId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // SUBSCRIPTION Management Operations
  async createSubscription(subscriptionData: CreateSubscriptionForm): Promise<ServiceResponse<string>> {
    try {
      const result = await this.actor.create_subscription(
        subscriptionData.plan_id,
        subscriptionData.metadata
      );
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscription(subscriptionId: string): Promise<ServiceResponse<Subscription>> {
    try {
      const result = await this.actor.get_subscription(subscriptionId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMySubscriptions(): Promise<ServiceResponse<Subscription[]>> {
    try {
      const result = await this.actor.list_my_subscriptions();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserSubscriptions(user: Principal): Promise<ServiceResponse<Subscription[]>> {
    try {
      const result = await this.actor.list_user_subscriptions(user);
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscriptionsByPlan(planId: string): Promise<ServiceResponse<Subscription[]>> {
    try {
      const result = await this.actor.list_subscriptions_by_plan(planId);
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllSubscriptions(): Promise<ServiceResponse<Subscription[]>> {
    try {
      const result = await this.actor.list_all_subscriptions();
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async pauseSubscription(subscriptionId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.pause_subscription(subscriptionId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.resume_subscription(subscriptionId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.cancel_subscription(subscriptionId, immediately);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSubscriptionMetadata(subscriptionId: string, metadata: [string, string][]): Promise<ServiceResponse<void>> {
    try {
      const result = await this.actor.update_subscription_metadata(subscriptionId, metadata);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // PAYMENT Processing
  async processSubscriptionPayment(subscriptionId: string): Promise<ServiceResponse<string>> {
    try {
      const result = await this.actor.process_subscription_payment(subscriptionId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscriptionPayment(paymentId: string): Promise<ServiceResponse<SubscriptionPayment>> {
    try {
      const result = await this.actor.get_subscription_payment(paymentId);
      return this.handleResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<ServiceResponse<SubscriptionPayment[]>> {
    try {
      const result = await this.actor.list_subscription_payments(subscriptionId);
      return { success: true, data: result };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Helper Methods
  private formatPlanForBackend(planData: CreateSubscriptionPlanForm): any {
    const billingInterval = this.formatBillingInterval(
      planData.billing_interval, 
      planData.custom_interval_seconds
    );
    
    return {
      plan_id: '', // Will be set by backend
      name: planData.name,
      description: planData.description,
      price: BigInt(planData.price),
      token: planData.token,
      billing_interval: billingInterval,
      trial_period_days: planData.trial_period_days ? [planData.trial_period_days] : [],
      max_subscriptions: planData.max_subscriptions ? [planData.max_subscriptions] : [],
      features: planData.features,
      is_active: planData.is_active,
      created_at: BigInt(0), // Will be set by backend
      updated_at: BigInt(0), // Will be set by backend
    };
  }

  private formatBillingInterval(interval: BillingInterval, customSeconds?: string): BillingIntervalData {
    switch (interval) {
      case BillingInterval.Daily:
        return { Daily: null };
      case BillingInterval.Weekly:
        return { Weekly: null };
      case BillingInterval.Monthly:
        return { Monthly: null };
      case BillingInterval.Quarterly:
        return { Quarterly: null };
      case BillingInterval.Yearly:
        return { Yearly: null };
      case BillingInterval.Custom:
        if (!customSeconds) {
          throw new Error('Custom interval requires seconds value');
        }
        return { Custom: BigInt(customSeconds) };
      default:
        throw new Error(`Unsupported billing interval: ${interval}`);
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
    console.error('SubscriptionService error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  // Utility methods for UI
  formatBillingIntervalText(interval: BillingIntervalData): string {
    if ('Daily' in interval) return 'Daily';
    if ('Weekly' in interval) return 'Weekly';
    if ('Monthly' in interval) return 'Monthly';
    if ('Quarterly' in interval) return 'Quarterly';
    if ('Yearly' in interval) return 'Yearly';
    if ('Custom' in interval) {
      const seconds = Number(interval.Custom);
      const days = seconds / (24 * 60 * 60);
      return `Every ${days} days`;
    }
    return 'Unknown';
  }

  formatPrice(price: bigint, token: string): string {
    // This should be enhanced based on token decimals
    return `${price.toString()} ${token}`;
  }

  isTrialActive(subscription: Subscription): boolean {
    if (!subscription.trial_end) return false;
    return subscription.trial_end > BigInt(Date.now() * 1_000_000);
  }

  isPaymentDue(subscription: Subscription): boolean {
    return subscription.next_billing_date <= BigInt(Date.now() * 1_000_000);
  }

  canPause(subscription: Subscription): boolean {
    return subscription.status === 'Active';
  }

  canResume(subscription: Subscription): boolean {
    return subscription.status === 'Paused';
  }

  canCancel(subscription: Subscription): boolean {
    return subscription.status === 'Active' || subscription.status === 'Paused';
  }
}
