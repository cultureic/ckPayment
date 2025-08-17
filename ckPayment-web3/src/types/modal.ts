// Modal Builder System Types
// Following FRONTEND_DEVELOPMENT_GUIDE.md patterns

import { Principal } from '@dfinity/principal';

// Core Modal Configuration Types
export interface ModalTheme {
  primary_color: string;
  background_color: string;
  text_color: string;
  border_radius: number;
  font_family: string;
}

export interface PaymentOptions {
  allowed_tokens: string[];
  require_email: boolean;
  require_shipping: boolean;
  show_amount_breakdown: boolean;
  enable_tips: boolean;
}

export interface BrandingConfig {
  logo_url?: string;
  company_name: string;
  support_url?: string;
  terms_url?: string;
}

export interface RedirectUrls {
  success_url: string;
  cancel_url: string;
  webhook_url?: string;
}

export interface ModalConfig {
  modal_id: string;
  name: string;
  description?: string;
  theme: ModalTheme;
  payment_options: PaymentOptions;
  branding: BrandingConfig;
  redirect_urls: RedirectUrls;
  template_id?: string; // Reference to factory template
  created_at: bigint;
  updated_at: bigint;
  is_active: boolean;
}

export interface ModalAnalytics {
  modal_id: string;
  total_views: bigint;
  successful_payments: bigint;
  conversion_rate: number;
  revenue_generated: bigint;
}

// Form Data Types (for client-side forms)
export interface ModalConfigFormData {
  name: string;
  description?: string;
  theme: {
    primary_color: string;
    background_color: string;
    text_color: string;
    border_radius: number;
    font_family: string;
  };
  payment_options: {
    allowed_tokens: string[];
    require_email: boolean;
    require_shipping: boolean;
    show_amount_breakdown: boolean;
    enable_tips: boolean;
  };
  branding: {
    logo_url?: string;
    company_name: string;
    support_url?: string;
    terms_url?: string;
  };
  redirect_urls: {
    success_url: string;
    cancel_url: string;
    webhook_url?: string;
  };
  template_id?: string;
  is_active: boolean;
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Component Props Types
export interface ModalConfigCardProps {
  modal: ModalConfig;
  analytics?: ModalAnalytics;
  onEdit?: (modal: ModalConfig) => void;
  onDelete?: (modalId: string) => void;
  onToggleStatus?: (modalId: string) => void;
  onViewAnalytics?: (modalId: string) => void;
  onGenerateEmbed?: (modalId: string) => void;
  isLoading?: boolean;
}

export interface ModalBuilderProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ModalConfig>;
  onSubmit: (data: ModalConfigFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  supportedTokens: string[];
  isLoading?: boolean;
}

export interface ModalPreviewProps {
  config: ModalConfig;
  className?: string;
}

export interface ModalAnalyticsProps {
  modalId: string;
  analytics: ModalAnalytics;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export interface ModalDashboardProps {
  canisterId: string;
  refreshInterval?: number;
}

// Hook State Types
export interface UseModalState {
  modals: ModalConfig[];
  analytics: Map<string, ModalAnalytics>;
  loading: boolean;
  error: string | null;
}

export interface UseModalActions {
  // Modal CRUD operations
  fetchModals: () => Promise<void>;
  createModal: (modalData: Omit<ModalConfigFormData, 'modal_id' | 'created_at' | 'updated_at'>) => Promise<ServiceResponse<string>>;
  updateModal: (modalId: string, modalData: ModalConfigFormData) => Promise<ServiceResponse<void>>;
  deleteModal: (modalId: string) => Promise<ServiceResponse<void>>;
  toggleModalStatus: (modalId: string) => Promise<ServiceResponse<boolean>>;
  
  // Analytics operations
  fetchAnalytics: (modalId: string) => Promise<ServiceResponse<ModalAnalytics>>;
  trackModalView: (modalId: string) => Promise<ServiceResponse<void>>;
  
  // Embed code generation
  generateEmbedCode: (modalId: string) => Promise<ServiceResponse<string>>;
  
  // Utility operations
  refresh: () => Promise<void>;
  clearError: () => void;
}

export type UseModalReturn = UseModalState & UseModalActions;

// Constants
export const MODAL_THEME_PRESETS = {
  'light': {
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_radius: 8,
    font_family: 'Inter, system-ui, sans-serif',
  },
  'dark': {
    primary_color: '#6366f1',
    background_color: '#1f2937',
    text_color: '#f9fafb',
    border_radius: 8,
    font_family: 'Inter, system-ui, sans-serif',
  },
  'minimal': {
    primary_color: '#000000',
    background_color: '#ffffff',
    text_color: '#374151',
    border_radius: 0,
    font_family: 'system-ui, sans-serif',
  },
  'colorful': {
    primary_color: '#f59e0b',
    background_color: '#fef3c7',
    text_color: '#92400e',
    border_radius: 12,
    font_family: 'Inter, system-ui, sans-serif',
  },
} as const;

export const DEFAULT_PAYMENT_OPTIONS: PaymentOptions = {
  allowed_tokens: [],
  require_email: false,
  require_shipping: false,
  show_amount_breakdown: true,
  enable_tips: false,
};

export const FONT_FAMILY_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times, serif', label: 'Times' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Helvetica Neue", sans-serif', label: 'Helvetica' },
] as const;

// Validation Types
export interface ModalValidationError {
  field: string;
  message: string;
}

export interface ModalValidationResult {
  isValid: boolean;
  errors: ModalValidationError[];
}

// Template Types (for future factory integration)
export interface ModalTemplate {
  template_id: string;
  name: string;
  description: string;
  preview_image?: string;
  config: Partial<ModalConfig>;
  category: 'ecommerce' | 'subscription' | 'donation' | 'custom';
  tags: string[];
  created_at: bigint;
  is_active: boolean;
}

export const MODAL_CATEGORIES = ['ecommerce', 'subscription', 'donation', 'custom'] as const;

// Error Types specific to Modal operations
export type ModalErrorType = 
  | 'validation'
  | 'network'
  | 'canister'
  | 'authentication'
  | 'not_found'
  | 'conflict'
  | 'unknown';

export interface ModalError {
  type: ModalErrorType;
  message: string;
  details?: string;
  field?: string; // For validation errors
  retryable: boolean;
  timestamp: string;
}

// Analytics Types
export interface ModalPerformanceMetrics {
  modal_id: string;
  views_trend: Array<{ date: string; views: number }>;
  conversion_trend: Array<{ date: string; conversions: number }>;
  revenue_trend: Array<{ date: string; revenue: number }>;
  device_breakdown: Array<{ device: string; count: number }>;
  location_breakdown: Array<{ country: string; count: number }>;
  traffic_sources: Array<{ source: string; count: number }>;
  bounce_rate: number;
  average_session_time: number;
}

// Embed Code Types
export interface EmbedCodeOptions {
  type: 'button' | 'inline' | 'popup';
  trigger_text?: string;
  auto_open?: boolean;
  custom_styles?: Record<string, string>;
}

export interface EmbedCodeResult {
  html: string;
  css: string;
  javascript: string;
  installation_instructions: string[];
}

// Export utility types
export type ModalThemePreset = keyof typeof MODAL_THEME_PRESETS;
export type FontFamilyOption = typeof FONT_FAMILY_OPTIONS[number];
export type ModalCategory = typeof MODAL_CATEGORIES[number];
