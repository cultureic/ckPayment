// Modal Builder Service
// Following FRONTEND_DEVELOPMENT_GUIDE.md patterns

import { Principal } from '@dfinity/principal';
import { ActorSubclass, HttpAgent } from '@dfinity/agent';
import type { 
  ModalConfig, 
  ModalAnalytics, 
  ServiceResponse, 
  ModalConfigFormData 
} from '../types/modal';

// Service interface based on the canister methods from user-payment-idl.ts
// Using the same interface as UserPaymentCanisterActor for modal methods
import type { UserPaymentCanisterActor } from './user-payment-service';
export type ModalServiceActor = UserPaymentCanisterActor;

export class ModalService {
  private agent: HttpAgent | null = null;
  private actors: Map<string, ModalServiceActor> = new Map();

  async initialize(identity?: any): Promise<boolean> {
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
      console.error('Failed to initialize modal service:', error);
      return false;
    }
  }

  private async getActor(canisterId: string): Promise<ModalServiceActor> {
    if (!this.agent) {
      throw new Error('Modal service not initialized');
    }

    // Check if we already have an actor for this canister
    if (this.actors.has(canisterId)) {
      return this.actors.get(canisterId)!;
    }

    try {
      // Import the user payment IDL (since modal methods are part of user payment canister)
      const { userPaymentCanisterIdlFactory } = await import('./user-payment-idl');
      
      // Create new actor
      const { Actor } = await import('@dfinity/agent');
      const actor = Actor.createActor(userPaymentCanisterIdlFactory, {
        agent: this.agent,
        canisterId: Principal.fromText(canisterId),
      }) as ModalServiceActor;

      // Cache the actor
      this.actors.set(canisterId, actor);
      return actor;
    } catch (error) {
      console.error('Failed to create modal actor for canister:', canisterId, error);
      throw new Error(`Failed to create modal actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to convert form data to canister format
  // Note: The ModalBuilder component uses a flat structure, so we need to adapt it
  // IMPORTANT: Candid optional fields use [] for null and [value] for non-null
  private formDataToCanisterFormat(formData: any): any {
    return {
      name: formData.name,
      description: formData.description && formData.description.trim() ? [formData.description] : [],
      theme: {
        primary_color: formData.theme.primary_color,
        background_color: formData.theme.background_color,
        text_color: formData.theme.text_color,
        border_radius: formData.theme.border_radius,
        font_family: formData.theme.font_family,
        button_style: formData.theme.button_style || 'solid',
      },
      payment_options: {
        allowed_tokens: formData.allowed_tokens || ['ICP'],
        require_email: false,
        require_shipping: false,
        show_amount_breakdown: true,
        enable_tips: false,
      },
      branding: {
        logo_url: formData.company_logo && formData.company_logo.trim() ? [formData.company_logo] : [],
        company_name: formData.company_name,
        support_url: formData.website_url && formData.website_url.trim() ? [formData.website_url] : [],
        terms_url: formData.terms_url && formData.terms_url.trim() ? [formData.terms_url] : [],
      },
      redirect_urls: {
        success_url: formData.success_url || 'https://example.com/success',
        cancel_url: formData.cancel_url || 'https://example.com/cancel',
        webhook_url: formData.webhook_url && formData.webhook_url.trim() ? [formData.webhook_url] : [],
      },
      template_id: formData.template_id && formData.template_id.trim() ? [formData.template_id] : [],
      is_active: formData.is_active ?? true,
      custom_fields: formData.custom_fields || [],
      minimum_amount: formData.minimum_amount,
      maximum_amount: formData.maximum_amount,
    };
  }

  // Helper method to convert canister format to client format
  // Convert to the flat structure expected by ModalBuilder component
  // IMPORTANT: Extract values from Candid optional fields [value] or [] format
  private canisterFormatToClientFormat(canisterConfig: any): any {
    return {
      modal_id: canisterConfig.modal_id || 'mock-id',
      name: canisterConfig.name || '',
      description: (canisterConfig.description && canisterConfig.description.length > 0) ? canisterConfig.description[0] : '',
      company_name: canisterConfig.branding?.company_name || '',
      company_logo: (canisterConfig.branding?.logo_url && canisterConfig.branding.logo_url.length > 0) ? canisterConfig.branding.logo_url[0] : '',
      website_url: (canisterConfig.branding?.support_url && canisterConfig.branding.support_url.length > 0) ? canisterConfig.branding.support_url[0] : '',
      success_url: canisterConfig.redirect_urls?.success_url || '',
      cancel_url: canisterConfig.redirect_urls?.cancel_url || '',
      webhook_url: (canisterConfig.redirect_urls?.webhook_url && canisterConfig.redirect_urls.webhook_url.length > 0) ? canisterConfig.redirect_urls.webhook_url[0] : '',
      theme: {
        primary_color: canisterConfig.theme?.primary_color || '#3B82F6',
        background_color: canisterConfig.theme?.background_color || '#FFFFFF',
        text_color: canisterConfig.theme?.text_color || '#1F2937',
        border_radius: canisterConfig.theme?.border_radius || 8,
        font_family: canisterConfig.theme?.font_family || 'Inter',
        button_style: canisterConfig.theme?.button_style || 'solid',
      },
      allowed_tokens: canisterConfig.payment_options?.allowed_tokens || ['ICP'],
      minimum_amount: canisterConfig.minimum_amount,
      maximum_amount: canisterConfig.maximum_amount,
      custom_fields: canisterConfig.custom_fields || [],
      is_active: canisterConfig.is_active ?? true,
      created_at: canisterConfig.created_at || new Date().toISOString(),
      updated_at: canisterConfig.updated_at || new Date().toISOString(),
    };
  }

  // Helper method to handle Result types
  private handleResult<T>(result: { Ok?: T; Err?: string }): ServiceResponse<T> {
    if ('Ok' in result && result.Ok !== undefined) {
      return { success: true, data: result.Ok };
    } else {
      return { success: false, error: result.Err };
    }
  }

  // Helper method to handle errors
  private handleError(error: any): ServiceResponse<never> {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  // CRUD Operations
  async createModal(canisterId: string, modalData: Omit<ModalConfigFormData, 'modal_id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<string>> {
    try {
      const actor = await this.getActor(canisterId);
      const canisterConfig = this.formDataToCanisterFormat(modalData) as ModalConfig;
      
      const result = await actor.create_modal_config(canisterConfig);
      return this.handleResult(result);
    } catch (error) {
      console.error('Failed to create modal:', error);
      return this.handleError(error);
    }
  }

  async updateModal(canisterId: string, modalId: string, modalData: ModalConfigFormData): Promise<ServiceResponse<void>> {
    try {
      const actor = await this.getActor(canisterId);
      const canisterConfig = {
        ...this.formDataToCanisterFormat(modalData),
        modal_id: modalId,
        created_at: BigInt(Date.now()), // Will be preserved by the canister
        updated_at: BigInt(Date.now()),
      } as ModalConfig;
      
      const result = await actor.update_modal_config(modalId, canisterConfig);
      return this.handleResult(result);
    } catch (error) {
      console.error('Failed to update modal:', error);
      return this.handleError(error);
    }
  }

  async getModal(canisterId: string, modalId: string): Promise<ServiceResponse<ModalConfig>> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.get_modal_config(modalId);
      
      // Handle Result<ModalConfig, Text> format from DID
      if ('Ok' in result && result.Ok) {
        const clientConfig = this.canisterFormatToClientFormat(result.Ok);
        return { success: true, data: clientConfig };
      } else {
        return { success: false, error: result.Err || 'Modal not found' };
      }
    } catch (error) {
      console.error('Failed to get modal:', error);
      return this.handleError(error);
    }
  }

  async listModals(canisterId: string): Promise<ServiceResponse<any[]>> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.list_my_modals();
      
      // Convert canister format to client format
      const clientConfigs = result.map(config => this.canisterFormatToClientFormat(config));
      
      return { success: true, data: clientConfigs };
    } catch (error) {
      console.error('Failed to list modals:', error);
      return this.handleError(error);
    }
  }

  async deleteModal(canisterId: string, modalId: string): Promise<ServiceResponse<void>> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.delete_modal_config(modalId);
      return this.handleResult(result);
    } catch (error) {
      console.error('Failed to delete modal:', error);
      return this.handleError(error);
    }
  }

  // Analytics Operations
  async trackModalView(canisterId: string, modalId: string): Promise<ServiceResponse<void>> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.track_modal_view(modalId);
      return this.handleResult(result);
    } catch (error) {
      console.error('Failed to track modal view:', error);
      return this.handleError(error);
    }
  }

  async getModalAnalytics(canisterId: string, modalId: string): Promise<ServiceResponse<any>> {
    try {
      // Return mock analytics data for now
      const mockAnalytics = {
        modal_id: modalId,
        total_views: BigInt(1250),
        total_conversions: BigInt(89),
        conversion_rate: 7.12,
        total_revenue: 4567.89,
        views_change: 12.3,
        conversions_change: 8.7,
        conversion_rate_change: 1.2,
        revenue_change: 15.6,
        revenue_by_token: {
          'ICP': 2300.45,
          'ckBTC': 1890.23,
          'ckETH': 377.21
        },
        top_countries: [
          { country: 'United States', views: 456 },
          { country: 'Canada', views: 234 },
          { country: 'United Kingdom', views: 123 },
          { country: 'Germany', views: 98 },
          { country: 'France', views: 76 }
        ],
        device_breakdown: {
          desktop: 745,
          mobile: 398,
          tablet: 107
        },
        referral_sources: [
          { source: 'Direct', views: 567 },
          { source: 'Google', views: 234 },
          { source: 'Twitter', views: 189 },
          { source: 'Facebook', views: 134 },
          { source: 'LinkedIn', views: 89 }
        ],
        avg_session_duration: 45000, // milliseconds
        bounce_rate: 23.4
      };
      
      return { success: true, data: mockAnalytics };
      
      // Commented out actual implementation until canister is ready
      // const actor = await this.getActor(canisterId);
      // const result = await actor.get_modal_analytics(modalId);
      // return this.handleResult(result);
    } catch (error) {
      console.error('Failed to get modal analytics:', error);
      return this.handleError(error);
    }
  }

  // Embed Code Generation
  async generateEmbedCode(canisterId: string, modalId: string): Promise<ServiceResponse<string>> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.generate_modal_embed_code(modalId);
      return this.handleResult(result);
    } catch (error) {
      console.error('Failed to generate embed code:', error);
      return this.handleError(error);
    }
  }

  // Utility Methods
  async refreshActorCache(canisterId: string): Promise<void> {
    this.actors.delete(canisterId);
  }

  async clearAllCaches(): Promise<void> {
    this.actors.clear();
  }

  // Validation helpers (client-side) - Updated for simplified structure
  validateModalConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!config.name || config.name.trim().length === 0) {
      errors.push('Modal name is required');
    }

    if (!config.company_name || config.company_name.trim().length === 0) {
      errors.push('Company name is required');
    }

    // URL validation
    const urlRegex = /^https?:\/\/.+/;
    
    if (config.success_url && config.success_url.trim().length > 0 && !urlRegex.test(config.success_url)) {
      errors.push('Success URL must be a valid HTTP/HTTPS URL');
    }

    if (config.cancel_url && config.cancel_url.trim().length > 0 && !urlRegex.test(config.cancel_url)) {
      errors.push('Cancel URL must be a valid HTTP/HTTPS URL');
    }

    if (config.webhook_url && config.webhook_url.trim().length > 0 && !urlRegex.test(config.webhook_url)) {
      errors.push('Webhook URL must be a valid HTTP/HTTPS URL');
    }

    if (config.company_logo && config.company_logo.trim().length > 0 && !urlRegex.test(config.company_logo)) {
      errors.push('Company logo URL must be a valid HTTP/HTTPS URL');
    }

    if (config.website_url && config.website_url.trim().length > 0 && !urlRegex.test(config.website_url)) {
      errors.push('Website URL must be a valid HTTP/HTTPS URL');
    }

    // Color validation
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    if (config.theme?.primary_color && !colorRegex.test(config.theme.primary_color)) {
      errors.push('Primary color must be a valid hex color (e.g., #3b82f6)');
    }

    if (config.theme?.background_color && !colorRegex.test(config.theme.background_color)) {
      errors.push('Background color must be a valid hex color (e.g., #ffffff)');
    }

    if (config.theme?.text_color && !colorRegex.test(config.theme.text_color)) {
      errors.push('Text color must be a valid hex color (e.g., #1f2937)');
    }

    // Border radius validation
    if (config.theme?.border_radius !== undefined && (config.theme.border_radius < 0 || config.theme.border_radius > 50)) {
      errors.push('Border radius must be between 0 and 50');
    }

    // Token validation
    if (!config.allowed_tokens || !Array.isArray(config.allowed_tokens) || config.allowed_tokens.length === 0) {
      errors.push('At least one token must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const modalService = new ModalService();
export default modalService;
