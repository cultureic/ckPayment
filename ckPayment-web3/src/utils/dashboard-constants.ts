import { 
  Environment, 
  WebhookEvent, 
  NotificationEvent, 
  Permission,
  DashboardTab 
} from '@/types/dashboard';

// Dashboard Configuration Constants
export const DASHBOARD_CONFIG = {
  DEFAULT_REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_CHART_DATA_POINTS: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_WEBHOOK_RETRIES: 5,
  DEFAULT_RETRY_DELAY: 1000, // 1 second
  SESSION_TIMEOUT: 3600000, // 1 hour
} as const;

// Tab Configuration
export const TAB_CONFIG: Record<DashboardTab, { 
  label: string; 
  description: string; 
  icon: string;
}> = {
  analytics: {
    label: 'Analytics',
    description: 'View metrics, charts, and performance data',
    icon: 'BarChart3'
  },
  config: {
    label: 'Configuration',
    description: 'Manage API keys, endpoints, and settings',
    icon: 'Settings'
  },
  webhooks: {
    label: 'Webhooks',
    description: 'Configure and monitor webhook endpoints',
    icon: 'Webhook'
  }
} as const;

// Environment Configuration
export const ENVIRONMENT_CONFIG: Record<Environment, {
  label: string;
  color: string;
  description: string;
}> = {
  development: {
    label: 'Development',
    color: 'bg-blue-500',
    description: 'Development environment for testing'
  },
  staging: {
    label: 'Staging',
    color: 'bg-yellow-500',
    description: 'Pre-production environment'
  },
  production: {
    label: 'Production',
    color: 'bg-green-500',
    description: 'Live production environment'
  }
} as const;

// Webhook Event Configuration
export const WEBHOOK_EVENT_CONFIG: Record<WebhookEvent, {
  label: string;
  description: string;
  category: 'payment' | 'user' | 'transaction' | 'system';
}> = {
  'payment.completed': {
    label: 'Payment Completed',
    description: 'Triggered when a payment is successfully processed',
    category: 'payment'
  },
  'payment.failed': {
    label: 'Payment Failed',
    description: 'Triggered when a payment fails to process',
    category: 'payment'
  },
  'payment.pending': {
    label: 'Payment Pending',
    description: 'Triggered when a payment is pending confirmation',
    category: 'payment'
  },
  'user.created': {
    label: 'User Created',
    description: 'Triggered when a new user account is created',
    category: 'user'
  },
  'user.updated': {
    label: 'User Updated',
    description: 'Triggered when user information is updated',
    category: 'user'
  },
  'transaction.created': {
    label: 'Transaction Created',
    description: 'Triggered when a new transaction is initiated',
    category: 'transaction'
  },
  'error.occurred': {
    label: 'Error Occurred',
    description: 'Triggered when a system error occurs',
    category: 'system'
  }
} as const;

// Notification Event Configuration
export const NOTIFICATION_EVENT_CONFIG: Record<NotificationEvent, {
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}> = {
  payment_completed: {
    label: 'Payment Completed',
    description: 'Successful payment notifications',
    severity: 'low'
  },
  payment_failed: {
    label: 'Payment Failed',
    description: 'Failed payment notifications',
    severity: 'high'
  },
  webhook_failed: {
    label: 'Webhook Failed',
    description: 'Webhook delivery failure notifications',
    severity: 'medium'
  },
  api_error: {
    label: 'API Error',
    description: 'API error notifications',
    severity: 'high'
  },
  security_alert: {
    label: 'Security Alert',
    description: 'Security-related notifications',
    severity: 'critical'
  },
  system_maintenance: {
    label: 'System Maintenance',
    description: 'System maintenance notifications',
    severity: 'medium'
  }
} as const;

// Permission Configuration
export const PERMISSION_CONFIG: Record<Permission, {
  label: string;
  description: string;
  category: 'read' | 'write' | 'admin';
}> = {
  read_metrics: {
    label: 'Read Metrics',
    description: 'View analytics and performance metrics',
    category: 'read'
  },
  write_config: {
    label: 'Write Configuration',
    description: 'Modify configuration settings',
    category: 'write'
  },
  manage_webhooks: {
    label: 'Manage Webhooks',
    description: 'Create, update, and delete webhooks',
    category: 'write'
  },
  admin_access: {
    label: 'Admin Access',
    description: 'Full administrative access',
    category: 'admin'
  },
  read_logs: {
    label: 'Read Logs',
    description: 'View system and audit logs',
    category: 'read'
  }
} as const;

// Status Colors and Icons
export const STATUS_CONFIG = {
  active: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Active'
  },
  inactive: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    label: 'Inactive'
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Error'
  },
  paused: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Paused'
  },
  testing: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Testing'
  }
} as const;

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
  muted: '#6b7280'
} as const;

// Date Format Constants
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  iso: 'yyyy-MM-dd',
  isoWithTime: 'yyyy-MM-dd HH:mm:ss',
  relative: 'relative'
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  webhook: {
    url: {
      pattern: /^https?:\/\/.+/,
      message: 'URL must start with http:// or https://'
    },
    name: {
      minLength: 3,
      maxLength: 50,
      message: 'Name must be between 3 and 50 characters'
    }
  },
  apiKey: {
    name: {
      minLength: 3,
      maxLength: 30,
      message: 'Name must be between 3 and 30 characters'
    }
  },
  endpoint: {
    url: {
      pattern: /^https?:\/\/.+/,
      message: 'URL must start with http:// or https://'
    }
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network connection failed. Please check your internet connection.',
  canister: 'Unable to connect to ICP canister. Using demo data instead.',
  validation: 'Please check your input and try again.',
  authentication: 'Authentication failed. Please log in again.',
  authorization: 'You do not have permission to perform this action.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  unknown: 'An unexpected error occurred. Please try again.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  webhook_created: 'Webhook created successfully',
  webhook_updated: 'Webhook updated successfully',
  webhook_deleted: 'Webhook deleted successfully',
  config_saved: 'Configuration saved successfully',
  api_key_created: 'API key created successfully',
  api_key_deleted: 'API key deleted successfully',
  endpoint_tested: 'Endpoint connection successful'
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  dashboard: 'Loading dashboard...',
  metrics: 'Loading metrics...',
  config: 'Loading configuration...',
  webhooks: 'Loading webhooks...',
  testing: 'Testing connection...',
  saving: 'Saving changes...'
} as const;