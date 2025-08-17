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

// Service interface based on the canister methods from lib.rs
export type ModalServiceActor = ActorSubclass<{
  // Modal CRUD operations
  create_modal_config: (config: ModalConfig) => Promise<{ Ok?: string; Err?: string }>;
  update_modal_config: (modal_id: string, config: ModalConfig) => Promise<{ Ok?: null; Err?: string }>;
  get_modal_config: (modal_id: string) => Promise<{ Ok?: ModalConfig; Err?: string }>;
  list_my_modals: () => Promise<ModalConfig[]>;
  delete_modal_config: (modal_id: string) => Promise<{ Ok?: null; Err?: string }>;
  
  // Analytics operations
  track_modal_view: (modal_id: string) => Promise<{ Ok?: null; Err?: string }>;
  get_modal_analytics: (modal_id: string) => Promise<{ Ok?: ModalAnalytics; Err?: string }>;
  
  // Embed code generation
  generate_modal_embed_code: (modal_id: string) => Promise<{ Ok?: string; Err?: string }>;
}>;

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
  private formDataToCanisterFormat(formData: ModalConfigFormData): Omit<ModalConfig, 'modal_id' | 'created_at' | 'updated_at'> {
    return {
      name: formData.name,
      description: formData.description ? [formData.description] : [], // Candid Opt format
      theme: formData.theme,
      payment_options: formData.payment_options,
      branding: {
        logo_url: formData.branding.logo_url ? [formData.branding.logo_url] : [], // Candid Opt format
        company_name: formData.branding.company_name,
        support_url: formData.branding.support_url ? [formData.branding.support_url] : [], // Candid Opt format
        terms_url: formData.branding.terms_url ? [formData.branding.terms_url] : [], // Candid Opt format
      },
      redirect_urls: {
        success_url: formData.redirect_urls.success_url,
        cancel_url: formData.redirect_urls.cancel_url,
        webhook_url: formData.redirect_urls.webhook_url ? [formData.redirect_urls.webhook_url] : [], // Candid Opt format
      },
      template_id: formData.template_id ? [formData.template_id] : [], // Candid Opt format
      is_active: formData.is_active,
    };
  }

  // Helper method to convert canister format to client format
  private canisterFormatToClientFormat(canisterConfig: any): ModalConfig {
    return {
      ...canisterConfig,
      description: Array.isArray(canisterConfig.description) && canisterConfig.description.length > 0 
        ? canisterConfig.description[0] 
        : undefined,
      branding: {
        ...canisterConfig.branding,
        logo_url: Array.isArray(canisterConfig.branding.logo_url) && canisterConfig.branding.logo_url.length > 0 
          ? canisterConfig.branding.logo_url[0] 
          : undefined,
        support_url: Array.isArray(canisterConfig.branding.support_url) && canisterConfig.branding.support_url.length > 0 
          ? canisterConfig.branding.support_url[0] 
          : undefined,
        terms_url: Array.isArray(canisterConfig.branding.terms_url) && canisterConfig.branding.terms_url.length > 0 
          ? canisterConfig.branding.terms_url[0] 
          : undefined,
      },
      redirect_urls: {
        ...canisterConfig.redirect_urls,
        webhook_url: Array.isArray(canisterConfig.redirect_urls.webhook_url) && canisterConfig.redirect_urls.webhook_url.length > 0 
          ? canisterConfig.redirect_urls.webhook_url[0] 
          : undefined,
      },
      template_id: Array.isArray(canisterConfig.template_id) && canisterConfig.template_id.length > 0 
        ? canisterConfig.template_id[0] 
        : undefined,
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
      
      if ('Ok' in result && result.Ok) {
        const clientConfig = this.canisterFormatToClientFormat(result.Ok);
        return { success: true, data: clientConfig };
      } else {
        return { success: false, error: result.Err };
      }
    } catch (error) {
      console.error('Failed to get modal:', error);
      return this.handleError(error);
    }
  }

  async listModals(canisterId: string): Promise<ServiceResponse<ModalConfig[]>> {
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

  async getModalAnalytics(canisterId: string, modalId: string): Promise<ServiceResponse<ModalAnalytics>> {
    try {
      const actor = await this.getActor(canisterId);
      const result = await actor.get_modal_analytics(modalId);
      return this.handleResult(result);
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

  // Validation helpers (client-side)
  validateModalConfig(config: Partial<ModalConfigFormData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!config.name || config.name.trim().length === 0) {
      errors.push('Modal name is required');
    }

    if (!config.branding?.company_name || config.branding.company_name.trim().length === 0) {
      errors.push('Company name is required');
    }

    if (!config.redirect_urls?.success_url || config.redirect_urls.success_url.trim().length === 0) {
      errors.push('Success URL is required');
    }

    if (!config.redirect_urls?.cancel_url || config.redirect_urls.cancel_url.trim().length === 0) {
      errors.push('Cancel URL is required');
    }

    // URL validation
    const urlRegex = /^https?:\/\/.+/;
    if (config.redirect_urls?.success_url && !urlRegex.test(config.redirect_urls.success_url)) {
      errors.push('Success URL must be a valid HTTP/HTTPS URL');
    }

    if (config.redirect_urls?.cancel_url && !urlRegex.test(config.redirect_urls.cancel_url)) {
      errors.push('Cancel URL must be a valid HTTP/HTTPS URL');
    }

    if (config.redirect_urls?.webhook_url && config.redirect_urls.webhook_url.trim().length > 0 && !urlRegex.test(config.redirect_urls.webhook_url)) {
      errors.push('Webhook URL must be a valid HTTP/HTTPS URL');
    }

    if (config.branding?.logo_url && config.branding.logo_url.trim().length > 0 && !urlRegex.test(config.branding.logo_url)) {
      errors.push('Logo URL must be a valid HTTP/HTTPS URL');
    }

    if (config.branding?.support_url && config.branding.support_url.trim().length > 0 && !urlRegex.test(config.branding.support_url)) {
      errors.push('Support URL must be a valid HTTP/HTTPS URL');
    }

    if (config.branding?.terms_url && config.branding.terms_url.trim().length > 0 && !urlRegex.test(config.branding.terms_url)) {
      errors.push('Terms URL must be a valid HTTP/HTTPS URL');
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const modalService = new ModalService();
export default modalService;
