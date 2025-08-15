// Core Data Models
export interface MetricsData {
  payments: number;
  errors: number;
  transactions: number;
  revenue: number;
  conversionRate: number;
  activeUsers: number;
  chartData: ChartDataPoint[];
  trends: {
    paymentsChange: number;
    errorsChange: number;
    revenueChange: number;
    usersChange: number;
  };
}

export interface ChartDataPoint {
  date: string;
  payments: number;
  errors: number;
  revenue: number;
  users: number;
  timestamp: number;
}

// Configuration Models
export interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  environment: Environment;
  createdAt: string;
  lastUsed: string;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'expired';
}

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  environment: Environment;
  status: ConnectionStatus;
  lastChecked: string;
  responseTime?: number;
  version?: string;
}

export interface NotificationConfig {
  email: {
    enabled: boolean;
    address: string;
    events: NotificationEvent[];
    verified: boolean;
  };
  webhook: {
    enabled: boolean;
    url: string;
    events: NotificationEvent[];
    secret?: string;
  };
  sms: {
    enabled: boolean;
    number: string;
    events: NotificationEvent[];
    verified: boolean;
  };
}

export interface SecurityConfig {
  twoFactorAuth: {
    enabled: boolean;
    method: '2fa_app' | 'sms' | 'email';
    backupCodes: string[];
  };
  ipWhitelist: {
    enabled: boolean;
    addresses: IPWhitelistEntry[];
  };
  sessionTimeout: number;
  auditLog: {
    enabled: boolean;
    retentionDays: number;
    events: AuditLogEntry[];
  };
}

export interface IPWhitelistEntry {
  id: string;
  address: string;
  description: string;
  addedAt: string;
  lastUsed?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  details: Record<string, any>;
}

export interface ConfigData {
  apiKeys: ApiKeyConfig[];
  canisterEndpoints: EndpointConfig[];
  notifications: NotificationConfig;
  security: SecurityConfig;
  lastUpdated: string;
}

// Webhook Models
export interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  lastTriggered: string;
  successRate: number;
  responseTime: number;
  createdAt: string;
  description?: string;
  headers?: Record<string, string>;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
  };
  logs: WebhookLogEntry[];
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'retry';
  responseCode?: number;
  responseTime: number;
  error?: string;
  payload: Record<string, any>;
}

// Aggregate Dashboard Data
export interface DashboardData {
  metrics: MetricsData;
  config: ConfigData;
  webhooks: WebhookData[];
  lastRefreshed: string;
}

// Enums and Union Types
export type Environment = 'development' | 'staging' | 'production';
export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'testing';
export type WebhookStatus = 'active' | 'inactive' | 'error' | 'paused';
export type DashboardTab = 'analytics' | 'config' | 'webhooks';

export type Permission = 
  | 'read_metrics'
  | 'write_config'
  | 'manage_webhooks'
  | 'admin_access'
  | 'read_logs';

export type NotificationEvent = 
  | 'payment_completed'
  | 'payment_failed'
  | 'webhook_failed'
  | 'api_error'
  | 'security_alert'
  | 'system_maintenance';

export type WebhookEvent = 
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.pending'
  | 'user.created'
  | 'user.updated'
  | 'transaction.created'
  | 'error.occurred';

// State Management Types
export interface DashboardState {
  activeTab: DashboardTab;
  isLoading: boolean;
  error: DashboardError | null;
  data: DashboardData | null;
  lastRefresh: string | null;
}

export interface LoadingState {
  metrics: boolean;
  config: boolean;
  webhooks: boolean;
  global: boolean;
}

// Error Types
export interface DashboardError {
  type: ErrorType;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: string;
  context?: Record<string, any>;
}

export type ErrorType = 
  | 'network'
  | 'canister'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'unknown';

// Component Props Types
export interface DashboardProps {
  defaultTab?: DashboardTab;
  canisterId?: string;
  refreshInterval?: number;
}

export interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  error?: boolean;
}

export interface ChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: boolean;
  height?: number;
  showTooltip?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter and Search Types
export interface FilterOptions {
  environment?: Environment[];
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface WebhookFormData {
  name: string;
  url: string;
  events: WebhookEvent[];
  description?: string;
  headers?: Record<string, string>;
  maxRetries: number;
  retryDelay: number;
}

export interface ApiKeyFormData {
  name: string;
  environment: Environment;
  permissions: Permission[];
  expiresAt?: string;
}

export interface EndpointFormData {
  name: string;
  url: string;
  environment: Environment;
}

// Transaction Models
export interface TransactionData {
  id: string;
  txHash?: string;
  amount: number;
  token: 'ICP' | 'ckBTC' | 'ckETH' | 'USD';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit';
  user: {
    id: string;
    name?: string;
    email?: string;
    principal?: string;
    wallet?: string;
  };
  timestamp: string;
  fee?: number;
  blockHeight?: number;
  confirmations?: number;
  description?: string;
  metadata?: Record<string, any>;
  canRefund: boolean;
  refundedAt?: string;
  refundTxId?: string;
}

export interface TransactionFilters {
  status?: string[];
  tokens?: string[];
  types?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface TransactionTableProps {
  transactions: TransactionData[];
  loading?: boolean;
  error?: boolean;
  onRefund?: (transactionId: string) => Promise<void>;
  onViewDetails?: (transaction: TransactionData) => void;
  onExport?: () => void;
  filters?: TransactionFilters;
  onFiltersChange?: (filters: TransactionFilters) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Constants
export const DASHBOARD_TABS = ['analytics', 'config', 'webhooks'] as const;
export const ENVIRONMENTS = ['development', 'staging', 'production'] as const;
export const WEBHOOK_EVENTS = [
  'payment.completed',
  'payment.failed',
  'payment.pending',
  'user.created',
  'user.updated',
  'transaction.created',
  'error.occurred'
] as const;

export const NOTIFICATION_EVENTS = [
  'payment_completed',
  'payment_failed',
  'webhook_failed',
  'api_error',
  'security_alert',
  'system_maintenance'
] as const;

export const PERMISSIONS = [
  'read_metrics',
  'write_config',
  'manage_webhooks',
  'admin_access',
  'read_logs'
] as const;

// ICP-Specific Enhanced Models
export interface ICPTransactionData extends TransactionData {
  // ICP-specific blockchain fields
  cycleCost: bigint;
  subnetId: string;
  canisterId: string;
  methodName?: string;
  
  // Inter-canister call information
  callHierarchy?: {
    caller: string;
    callee: string;
    method: string;
    cycleCost: bigint;
    depth: number;
  }[];
  
  // Performance metrics
  executionTime: number; // microseconds
  memoryUsage: number; // bytes
  instructionCount: bigint;
  
  // Subnet information
  subnetMetrics: {
    uptime: number; // percentage (0-100)
    responseTime: number; // milliseconds
    throughput: number; // transactions per second
    errorRate: number; // percentage (0-100)
  };
  
  // Consensus information
  consensusRound?: bigint;
  certificateHash?: string;
  
  // Cycle balance information
  cycleBalance?: {
    before: bigint;
    after: bigint;
    burned: bigint;
    refunded: bigint;
  };
}

export interface ICPMetricsData extends MetricsData {
  // Cycle-related metrics
  cycleMetrics: {
    totalCyclesUsed: bigint;
    averageCyclePerTransaction: bigint;
    cycleEfficiency: number; // cycles per instruction
    cyclesBurned: bigint;
    cyclesRefunded: bigint;
    cycleCostTrend: number; // percentage change
  };
  
  // Subnet performance tracking
  subnetMetrics: {
    [subnetId: string]: {
      uptime: number; // percentage
      averageResponseTime: number; // milliseconds
      throughput: number; // transactions per second
      errorRate: number; // percentage
      consensusHealth: number; // percentage
      lastUpdated: string;
      nodeCount: number;
      replicationFactor: number;
    };
  };
  
  // Canister health monitoring
  canisterHealth: {
    memoryUsage: number; // bytes
    cycleBalance: bigint;
    freezingThreshold: bigint;
    status: 'running' | 'stopping' | 'stopped';
    controllers: string[];
    moduleHash?: string;
    lastUpgrade?: string;
    computeAllocation: number; // percentage
    memoryAllocation: number; // bytes
  };
  
  // Performance trends
  performanceTrends: {
    cycleUsageTrend: number; // percentage change
    throughputTrend: number; // percentage change
    errorRateTrend: number; // percentage change
    responseTimeTrend: number; // percentage change
    memoryUsageTrend: number; // percentage change
  };
  
  // Network-wide statistics
  networkStats: {
    totalSubnets: number;
    totalCanisters: number;
    networkThroughput: number; // transactions per second
    averageSubnetLoad: number; // percentage
    networkUptime: number; // percentage
  };
}

// Subnet-specific types
export interface SubnetInfo {
  id: string;
  type: 'application' | 'system' | 'fiduciary' | 'verified_application';
  nodeCount: number;
  replicationFactor: number;
  location: string[];
  features: string[];
  status: 'active' | 'degraded' | 'maintenance';
}

export interface SubnetHealthScore {
  overall: number; // 0-100
  uptime: number; // 0-100
  performance: number; // 0-100
  reliability: number; // 0-100
  factors: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    consensusHealth: number;
    nodeHealth: number;
  };
  recommendations: string[];
}

// Inter-canister call tracking
export interface CanisterCall {
  id: string;
  caller: string;
  callee: string;
  method: string;
  timestamp: string;
  cycleCost: bigint;
  executionTime: number;
  status: 'completed' | 'failed' | 'trapped';
  errorMessage?: string;
  depth: number;
  parentCallId?: string;
}

// Cycle usage analytics
export interface CycleUsageAnalytics {
  totalUsage: bigint;
  usageByMethod: Map<string, bigint>;
  usageByCanister: Map<string, bigint>;
  usageBySubnet: Map<string, bigint>;
  efficiency: {
    cyclesPerInstruction: number;
    cyclesPerByte: number;
    cyclesPerSecond: number;
  };
  trends: {
    hourly: CycleDataPoint[];
    daily: CycleDataPoint[];
    weekly: CycleDataPoint[];
  };
  predictions: {
    nextHour: bigint;
    nextDay: bigint;
    nextWeek: bigint;
    confidence: number; // 0-1
  };
}

export interface CycleDataPoint {
  timestamp: string;
  cycles: bigint;
  transactions: number;
  efficiency: number;
}

// Performance monitoring types
export interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    max: number;
    min: number;
  };
  throughput: {
    current: number;
    average: number;
    peak: number;
    trend: number; // percentage change
  };
  errorRate: {
    current: number;
    average: number;
    byType: Map<string, number>;
    trend: number; // percentage change
  };
  resourceUsage: {
    memory: number; // percentage
    compute: number; // percentage
    storage: number; // bytes
    network: number; // bytes per second
  };
}

// Enhanced chart data with ICP-specific metrics
export interface ICPChartDataPoint extends ChartDataPoint {
  cycles: bigint;
  subnetHealth: number;
  canisterCount: number;
  networkThroughput: number;
  consensusTime: number;
  memoryUsage: number;
}

// ICP-specific constants
export const ICP_SUBNET_TYPES = ['application', 'system', 'fiduciary', 'verified_application'] as const;
export const ICP_CANISTER_STATUSES = ['running', 'stopping', 'stopped'] as const;
export const ICP_CALL_STATUSES = ['completed', 'failed', 'trapped'] as const;

export type SubnetType = typeof ICP_SUBNET_TYPES[number];
export type CanisterStatus = typeof ICP_CANISTER_STATUSES[number];
export type CallStatus = typeof ICP_CALL_STATUSES[number];

// Enhanced Error Handling Types
export type DashboardErrorType = 
  | 'network'
  | 'canister'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'websocket'
  | 'consensus'
  | 'subnet'
  | 'cycles'
  | 'memory'
  | 'unknown';

export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'reconnect' | 'fallback' | 'contact_support';
  label: string;
  description: string;
  action: () => Promise<void>;
  priority: number;
  automated: boolean;
}

export interface EnhancedDashboardError extends DashboardError {
  type: DashboardErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'user' | 'system' | 'network' | 'blockchain';
  
  // ICP-specific error details
  canisterError?: {
    code: number;
    message: string;
    canisterId: string;
    methodName?: string;
    cyclesCost?: bigint;
  };
  
  // Network error details
  networkError?: {
    statusCode?: number;
    timeout: boolean;
    retryable: boolean;
    endpoint: string;
    latency?: number;
  };
  
  // WebSocket error details
  websocketError?: {
    code: number;
    reason: string;
    wasClean: boolean;
    reconnectAttempt: number;
  };
  
  // Context information
  context: {
    userId?: string;
    sessionId: string;
    canisterId?: string;
    subnetId?: string;
    timestamp: string;
    userAgent: string;
    url: string;
    stackTrace?: string;
    breadcrumbs?: string[];
  };
  
  // Recovery information
  recovery: {
    suggested: boolean;
    actions: RecoveryAction[];
    autoRetry: boolean;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: string;
  };
  
  // Error analytics
  analytics?: {
    frequency: number; // How often this error occurs
    impact: 'low' | 'medium' | 'high'; // Business impact
    affectedUsers: number;
    firstOccurrence: string;
    lastOccurrence: string;
  };
}

export interface ErrorContext {
  component: string;
  operation: string;
  userId?: string;
  canisterId?: string;
  subnetId?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Map<DashboardErrorType, number>;
  errorsBySeverity: Map<string, number>;
  errorsByCategory: Map<string, number>;
  averageResolutionTime: number;
  recurringErrors: number;
  criticalErrors: number;
}

export interface ErrorTrend {
  timestamp: string;
  errorCount: number;
  errorType: DashboardErrorType;
  severity: string;
  resolved: boolean;
}

// Circuit Breaker Types
export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  failureThreshold: number;
  timeout: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
  successCount: number;
  totalRequests: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  monitoringPeriod: number;
  expectedErrors: DashboardErrorType[];
  fallbackEnabled: boolean;
}

// Real-time update types
export interface RealTimeUpdate<T = any> {
  type: 'metrics' | 'transaction' | 'error' | 'status';
  timestamp: string;
  data: T;
  metadata: {
    source: 'websocket' | 'polling' | 'push';
    version: string;
    checksum?: string;
    compressed?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'critical';
  };
}

export interface ConnectionHealth {
  websocketStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  pollingStatus: 'active' | 'inactive' | 'error';
  lastUpdate: Date | null;
  updateFrequency: number;
  dataFreshness: number;
  errorCount: number;
  reconnectCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'unstable';
}

// Notification types for real-time updates
export interface DashboardNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  persistent: boolean;
  actions?: NotificationAction[];
  metadata?: {
    source: string;
    category: string;
    priority: number;
  };
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

export interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
  showProgress?: boolean;
  actions?: NotificationAction[];
  sound?: boolean;
}

export interface GlobalNotificationOptions {
  position: NotificationPosition;
  maxNotifications: number;
  defaultDuration: number;
  enableSounds: boolean;
  enableAnimations: boolean;
}

export type NotificationPosition = 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right' 
  | 'top-center' 
  | 'bottom-center';

// Enhanced error constants
export const DASHBOARD_ERROR_TYPES = [
  'network',
  'canister', 
  'validation',
  'authentication',
  'authorization',
  'rate_limit',
  'websocket',
  'consensus',
  'subnet',
  'cycles',
  'memory',
  'unknown'
] as const;

export const ERROR_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const ERROR_CATEGORIES = ['user', 'system', 'network', 'blockchain'] as const;
export const RECOVERY_ACTION_TYPES = ['retry', 'refresh', 'reconnect', 'fallback', 'contact_support'] as const;