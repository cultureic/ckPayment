import type { ModalConfig, ModalAnalytics } from '../../types/modal';

export const mockModalConfig: ModalConfig = {
  modal_id: 'test-modal-1',
  name: 'Test Modal',
  description: 'A test modal for unit tests',
  theme: {
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_radius: 8,
    font_family: 'Inter, sans-serif',
  },
  payment_options: {
    allowed_tokens: ['ckBTC', 'ICP'],
    require_email: false,
    require_shipping: false,
    show_amount_breakdown: true,
    enable_tips: false,
  },
  branding: {
    company_name: 'Test Company',
    logo_url: 'https://example.com/logo.png',
    support_url: 'https://example.com/support',
    terms_url: 'https://example.com/terms',
  },
  redirect_urls: {
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    webhook_url: 'https://example.com/webhook',
  },
  is_active: true,
  created_at: BigInt(Date.now() - 86400000),
  updated_at: BigInt(Date.now()),
};

export const mockModalAnalytics: ModalAnalytics = {
  modal_id: 'test-modal-1',
  total_views: BigInt(150),
  successful_payments: BigInt(23),
  conversion_rate: 15.33,
  revenue_generated: BigInt(450000000),
};

export const createMockModal = (overrides: Partial<ModalConfig> = {}): ModalConfig => ({
  ...mockModalConfig,
  ...overrides,
});

export const createMockAnalytics = (overrides: Partial<ModalAnalytics> = {}): ModalAnalytics => ({
  ...mockModalAnalytics,
  ...overrides,
});
