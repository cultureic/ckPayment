import { 
  MetricsData, 
  ConfigData, 
  WebhookData, 
  ChartDataPoint,
  ApiKeyConfig,
  EndpointConfig,
  WebhookLogEntry,
  AuditLogEntry,
  IPWhitelistEntry,
  DashboardData,
  TransactionData,
  ICPTransactionData,
  ICPMetricsData,
  ICPChartDataPoint,
  SubnetInfo,
  SubnetHealthScore,
  CanisterCall,
  CycleUsageAnalytics,
  CycleDataPoint,
  PerformanceMetrics
} from '@/types/dashboard';

/**
 * Mock Data Generation Service
 * Provides realistic mock data for dashboard demonstration
 */
export class MockDataService {
  private static instance: MockDataService;
  private baseMetrics: Partial<MetricsData>;
  private cachedData: DashboardData | null = null;
  private lastGenerated: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds - much longer cache
  private readonly SEED = 12345; // Consistent seed for reproducible "randomness"

  constructor() {
    // Initialize base metrics for consistent variations (using fixed seed for consistency)
    this.baseMetrics = {
      payments: 1247,
      errors: 23,
      transactions: 1270,
      revenue: 45678.90,
      conversionRate: 3.2,
      activeUsers: 892,
    };
  }

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  /**
   * Generate realistic metrics data with time-based variations
   */
  generateMetricsData(): MetricsData {
    const now = Date.now();
    
    // Much slower and more stable variations based on time
    const timeVariation = Math.sin(now / 1000000) * 0.05 + 1; // Very slow oscillation, ±5%
    const microVariation = Math.sin(now / 100000) * 0.02 + 1; // Small micro variations, ±2%
    
    const payments = Math.round((this.baseMetrics.payments || 1247) * timeVariation * microVariation);
    const errors = Math.round((this.baseMetrics.errors || 23) * microVariation);
    const transactions = payments + errors + Math.floor(timeVariation * 20); // More predictable transaction count
    const revenue = (this.baseMetrics.revenue || 45678.90) * timeVariation * microVariation;
    const activeUsers = Math.round((this.baseMetrics.activeUsers || 892) * timeVariation * microVariation);
    
    // Create stable trend changes based on time instead of random
    const trendSeed = Math.sin(now / 500000); // Very slow trend changes
    
    return {
      payments,
      errors,
      transactions,
      revenue,
      conversionRate: Math.max(1.5, Math.min(6.0, (this.baseMetrics.conversionRate || 3.2) * microVariation)),
      activeUsers,
      chartData: this.generateChartData(payments, errors, revenue, activeUsers),
      trends: {
        paymentsChange: trendSeed * 8, // -8% to +8%
        errorsChange: trendSeed * -4, // Errors trend opposite to payments
        revenueChange: trendSeed * 6, // -6% to +6%
        usersChange: trendSeed * 10, // -10% to +10%
      }
    };
  }

  /**
   * Generate realistic chart data for the last 30 days
   */
  private generateChartData(basePayments: number, baseErrors: number, baseRevenue: number, baseUsers: number): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create realistic daily variations
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 0.7 : 1.0; // Lower activity on weekends
      
      // Add some trend over time (slight growth)
      const trendMultiplier = 1 + (29 - i) * 0.002; // 0.2% growth per day
      
      // Random daily variation
      const randomMultiplier = Math.random() * 0.4 + 0.8; // 80-120% of base
      
      const dailyMultiplier = weekendMultiplier * trendMultiplier * randomMultiplier;
      
      data.push({
        date: date.toISOString().split('T')[0],
        payments: Math.round((basePayments / 30) * dailyMultiplier),
        errors: Math.round((baseErrors / 30) * dailyMultiplier * (Math.random() * 0.5 + 0.75)),
        revenue: (baseRevenue / 30) * dailyMultiplier,
        users: Math.round((baseUsers / 30) * dailyMultiplier),
        timestamp: date.getTime(),
      });
    }
    
    return data;
  }

  /**
   * Generate mock configuration data
   */
  generateConfigData(): ConfigData {
    return {
      apiKeys: this.generateApiKeys(),
      canisterEndpoints: this.generateEndpoints(),
      notifications: {
        email: {
          enabled: true,
          address: 'developer@example.com',
          events: ['payment_completed', 'payment_failed', 'api_error'],
          verified: true,
        },
        webhook: {
          enabled: false,
          url: 'https://api.example.com/webhooks/notifications',
          events: ['payment_completed', 'webhook_failed'],
          secret: 'wh_secret_' + Math.random().toString(36).substring(7),
        },
        sms: {
          enabled: false,
          number: '+1234567890',
          events: ['security_alert'],
          verified: false,
        },
      },
      security: {
        twoFactorAuth: {
          enabled: Math.random() > 0.5,
          method: '2fa_app',
          backupCodes: Array.from({ length: 8 }, () => 
            Math.random().toString(36).substring(2, 8).toUpperCase()
          ),
        },
        ipWhitelist: {
          enabled: Math.random() > 0.7,
          addresses: this.generateIPWhitelist(),
        },
        sessionTimeout: 3600000, // 1 hour
        auditLog: {
          enabled: true,
          retentionDays: 90,
          events: this.generateAuditLog(),
        },
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate mock API keys
   */
  private generateApiKeys(): ApiKeyConfig[] {
    const environments = ['development', 'staging', 'production'] as const;
    const permissions = ['read_metrics', 'write_config', 'manage_webhooks', 'admin_access', 'read_logs'] as const;
    const statuses = ['active', 'inactive', 'expired'] as const;
    
    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => {
      const env = environments[Math.floor(Math.random() * environments.length)];
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const lastUsedDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: `key_${Math.random().toString(36).substring(2, 10)}`,
        name: `${env.charAt(0).toUpperCase() + env.slice(1)} API Key ${i + 1}`,
        key: `ck_${env}_${Math.random().toString(36).substring(2, 20)}`,
        environment: env,
        createdAt: createdDate.toISOString(),
        lastUsed: lastUsedDate.toISOString(),
        permissions: permissions.slice(0, Math.floor(Math.random() * permissions.length) + 1),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
  }

  /**
   * Generate mock canister endpoints
   */
  private generateEndpoints(): EndpointConfig[] {
    const environments = ['development', 'staging', 'production'] as const;
    const statuses = ['active', 'inactive', 'error', 'testing'] as const;
    
    const baseEndpoints = [
      { name: 'Main Canister', path: 'main' },
      { name: 'Payment Processor', path: 'payments' },
      { name: 'User Management', path: 'users' },
      { name: 'Analytics Engine', path: 'analytics' },
    ];
    
    return baseEndpoints.flatMap(endpoint => 
      environments.map(env => ({
        id: `endpoint_${endpoint.path}_${env}`,
        name: `${endpoint.name} (${env})`,
        url: `https://${endpoint.path}-${env}.ic0.app`,
        environment: env,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastChecked: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        responseTime: Math.random() * 1000 + 100, // 100-1100ms
        version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      }))
    );
  }

  /**
   * Generate mock IP whitelist entries
   */
  private generateIPWhitelist(): IPWhitelistEntry[] {
    const ips = [
      '192.168.1.100',
      '10.0.0.50',
      '203.0.113.25',
      '198.51.100.75',
    ];
    
    return ips.map((ip, i) => ({
      id: `ip_${i + 1}`,
      address: ip,
      description: `Office Network ${i + 1}`,
      addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    }));
  }

  /**
   * Generate mock audit log entries
   */
  private generateAuditLog(): AuditLogEntry[] {
    const actions = [
      'API key created',
      'Configuration updated',
      'Webhook created',
      'User login',
      'Password changed',
      'Webhook deleted',
      'Endpoint tested',
    ];
    
    const users = ['john.doe@example.com', 'jane.smith@example.com', 'admin@example.com'];
    const ips = ['192.168.1.100', '10.0.0.50', '203.0.113.25'];
    
    return Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, i) => ({
      id: `audit_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users[Math.floor(Math.random() * users.length)],
      ip: ips[Math.floor(Math.random() * ips.length)],
      details: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        resource: Math.random() > 0.5 ? 'webhook_123' : 'api_key_456',
      },
    }));
  }

  /**
   * Generate mock webhook data
   */
  generateWebhooksData(): WebhookData[] {
    const events = ['payment.completed', 'payment.failed', 'user.created', 'transaction.created'] as const;
    const statuses = ['active', 'inactive', 'error', 'paused'] as const;
    
    const webhookNames = [
      'Payment Notifications',
      'User Registration Hook',
      'Transaction Logger',
      'Error Reporting',
      'Analytics Tracker',
      'Backup System',
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 4) + 3 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const lastTriggered = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      
      return {
        id: `webhook_${Math.random().toString(36).substring(2, 10)}`,
        name: webhookNames[i] || `Webhook ${i + 1}`,
        url: `https://api.example${i + 1}.com/webhooks/receive`,
        events: events.slice(0, Math.floor(Math.random() * events.length) + 1),
        status,
        lastTriggered: lastTriggered.toISOString(),
        successRate: Math.random() * 30 + 70, // 70-100%
        responseTime: Math.random() * 500 + 100, // 100-600ms
        createdAt: createdDate.toISOString(),
        description: `Webhook for handling ${webhookNames[i]?.toLowerCase() || 'various events'}`,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': `key_${Math.random().toString(36).substring(2, 10)}`,
        },
        retryConfig: {
          maxRetries: Math.floor(Math.random() * 3) + 3, // 3-5 retries
          retryDelay: Math.floor(Math.random() * 2000) + 1000, // 1-3 seconds
        },
        logs: this.generateWebhookLogs(),
      };
    });
  }

  /**
   * Generate mock webhook log entries
   */
  private generateWebhookLogs(): WebhookLogEntry[] {
    const events = ['payment.completed', 'payment.failed', 'user.created'];
    const statuses = ['success', 'failed', 'retry'] as const;
    const responseCodes = [200, 201, 400, 404, 500, 502, 503];
    
    return Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const responseCode = responseCodes[Math.floor(Math.random() * responseCodes.length)];
      
      return {
        id: `log_${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        event: events[Math.floor(Math.random() * events.length)],
        status,
        responseCode: status === 'success' ? 200 : responseCode,
        responseTime: Math.random() * 1000 + 50,
        error: status === 'failed' ? 'Connection timeout' : undefined,
        payload: {
          id: `txn_${Math.random().toString(36).substring(2, 10)}`,
          amount: Math.random() * 1000 + 10,
          currency: 'USD',
          timestamp: new Date().toISOString(),
        },
      };
    });
  }

  /**
   * Generate complete dashboard data with caching
   */
  generateDashboardData(): DashboardData {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedData && (now - this.lastGenerated) < this.CACHE_DURATION) {
      // Update only the timestamp to show data freshness
      return {
        ...this.cachedData,
        lastRefreshed: new Date().toISOString(),
      };
    }
    
    // Generate new data if cache is expired or empty
    this.cachedData = {
      metrics: this.generateMetricsData(),
      config: this.generateConfigData(),
      webhooks: this.generateWebhooksData(),
      lastRefreshed: new Date().toISOString(),
    };
    
    this.lastGenerated = now;
    return this.cachedData;
  }

  /**
   * Add realistic delays to simulate network requests
   */
  async simulateNetworkDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate occasional network errors for testing error handling
   */
  simulateNetworkError(errorRate: number = 0.1): void {
    if (Math.random() < errorRate) {
      const errors = [
        'Network connection failed',
        'Request timeout',
        'Service temporarily unavailable',
        'Rate limit exceeded',
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }
  }

  /**
   * Generate realistic transaction data
   */
  generateTransactionsData(count: number = 50): TransactionData[] {
    const transactions: TransactionData[] = [];
    const tokens = ['ckBTC', 'ckETH', 'ICP', 'USD'] as const;
    const statuses = ['completed', 'pending', 'failed', 'cancelled'] as const;
    const types = ['payment', 'refund', 'withdrawal', 'deposit'] as const;
    
    const users = [
      { name: 'Alice Johnson', email: 'alice@example.com', principal: 'rdmx6-jaaaa-aaaah-qcaiq-cai' },
      { name: 'Bob Smith', email: 'bob@example.com', principal: 'rrkah-fqaaa-aaaah-qcaiq-cai' },
      { name: 'Carol Davis', email: 'carol@example.com', principal: 'ryjl3-tyaaa-aaaah-qcaiq-cai' },
      { name: 'David Wilson', email: 'david@example.com', principal: 'rdmx6-jaaaa-aaaah-qcaiq-cai' },
      { name: 'Eva Brown', email: 'eva@example.com', principal: 'rrkah-fqaaa-aaaah-qcaiq-cai' },
    ];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      // Generate realistic amounts based on token
      let amount: number;
      let fee: number;
      
      switch (token) {
        case 'ckBTC':
          amount = Math.random() * 2 + 0.001; // 0.001 - 2 BTC
          fee = amount * 0.001; // 0.1% fee
          break;
        case 'ckETH':
          amount = Math.random() * 50 + 0.01; // 0.01 - 50 ETH
          fee = amount * 0.002; // 0.2% fee
          break;
        case 'ICP':
          amount = Math.random() * 1000 + 1; // 1 - 1000 ICP
          fee = amount * 0.001; // 0.1% fee
          break;
        case 'USD':
          amount = Math.random() * 10000 + 10; // $10 - $10,000
          fee = Math.max(0.5, amount * 0.029); // 2.9% fee, min $0.50
          break;
      }

      const txId = `tx_${Math.random().toString(36).substr(2, 9)}_${i.toString().padStart(3, '0')}`;
      const txHash = Math.random() > 0.3 ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined;

      transactions.push({
        id: txId,
        txHash,
        amount: Math.round(amount * 1000000) / 1000000, // Round to 6 decimals
        token,
        status,
        type,
        user: {
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          name: user.name,
          email: user.email,
          principal: user.principal,
          wallet: `${token.toLowerCase()}_wallet_${Math.random().toString(36).substr(2, 8)}`
        },
        timestamp: timestamp.toISOString(),
        fee: Math.round(fee * 1000000) / 1000000,
        blockHeight: Math.random() > 0.2 ? Math.floor(Math.random() * 1000000) + 5000000 : undefined,
        confirmations: status === 'completed' ? Math.floor(Math.random() * 100) + 6 : undefined,
        description: this.generateTransactionDescription(type, token, amount),
        metadata: {
          userAgent: 'Mozilla/5.0 (compatible)',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          source: Math.random() > 0.5 ? 'web' : 'mobile'
        },
        canRefund: status === 'completed' && type === 'payment' && Math.random() > 0.3,
        refundedAt: status === 'completed' && Math.random() > 0.9 ? 
          new Date(timestamp.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        refundTxId: status === 'completed' && Math.random() > 0.9 ? 
          `refund_${Math.random().toString(36).substr(2, 9)}` : 
          undefined
      });
    }

    // Sort by timestamp (newest first)
    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private generateTransactionDescription(type: string, token: string, amount: number): string {
    const descriptions = {
      payment: [
        `Payment for premium subscription`,
        `Purchase of digital goods`,
        `Service fee payment`,
        `Monthly subscription renewal`,
        `One-time purchase`
      ],
      refund: [
        `Refund for cancelled order`,
        `Service credit refund`,
        `Overpayment refund`,
        `Subscription cancellation refund`
      ],
      withdrawal: [
        `Withdrawal to external wallet`,
        `Transfer to bank account`,
        `Cash out request`,
        `Funds withdrawal`
      ],
      deposit: [
        `Deposit from external wallet`,
        `Bank transfer deposit`,
        `Account funding`,
        `Initial deposit`
      ]
    };

    const typeDescriptions = descriptions[type as keyof typeof descriptions] || descriptions.payment;
    const baseDescription = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
    
    return `${baseDescription} - ${amount.toFixed(6)} ${token}`;
  }

  /**
   * Update base metrics to create realistic data evolution
   */
  updateBaseMetrics(): void {
    const now = Date.now();
    if (now - this.lastGenerated > this.CACHE_DURATION) {
      // Gradually evolve the base metrics
      this.baseMetrics.payments = (this.baseMetrics.payments || 1247) + Math.floor(Math.random() * 10 - 5);
      this.baseMetrics.errors = Math.max(0, (this.baseMetrics.errors || 23) + Math.floor(Math.random() * 4 - 2));
      this.baseMetrics.revenue = (this.baseMetrics.revenue || 45678.90) + Math.random() * 1000 - 500;
      this.baseMetrics.activeUsers = (this.baseMetrics.activeUsers || 892) + Math.floor(Math.random() * 20 - 10);
      
      this.lastGenerated = now;
    }
  }

  // ===== ICP-SPECIFIC DATA GENERATION METHODS =====

  /**
   * Generate ICP-specific transaction data with blockchain details
   */
  generateICPTransactionsData(count: number = 50): ICPTransactionData[] {
    const baseTransactions = this.generateTransactionsData(count);
    const subnets = this.generateSubnetInfos();
    const canisters = this.generateCanisterIds();
    
    return baseTransactions.map((tx, index) => {
      const subnet = subnets[Math.floor(Math.random() * subnets.length)];
      const canisterId = canisters[Math.floor(Math.random() * canisters.length)];
      
      // Calculate realistic cycle costs based on transaction complexity
      const baseCycleCost = this.calculateBaseCycleCost(tx.type, tx.amount);
      const cycleCost = BigInt(Math.floor(baseCycleCost * (0.8 + Math.random() * 0.4))); // ±20% variation
      
      // Generate performance metrics
      const executionTime = Math.floor(Math.random() * 50000 + 5000); // 5-55ms in microseconds
      const memoryUsage = Math.floor(Math.random() * 1024 * 1024 + 512 * 1024); // 0.5-1.5MB
      const instructionCount = BigInt(Math.floor(cycleCost / BigInt(4))); // Rough estimate: 4 cycles per instruction
      
      // Generate call hierarchy for complex transactions
      const callHierarchy = Math.random() > 0.7 ? this.generateCallHierarchy(canisterId, cycleCost) : undefined;
      
      // Generate cycle balance information
      const cycleBalance = {
        before: BigInt(Math.floor(Math.random() * 1000000000000 + 100000000000)), // 100B-1T cycles
        after: BigInt(0),
        burned: cycleCost,
        refunded: BigInt(Math.floor(Number(cycleCost) * 0.1 * Math.random())) // 0-10% refund
      };
      cycleBalance.after = cycleBalance.before - cycleBalance.burned + cycleBalance.refunded;

      const icpTransaction: ICPTransactionData = {
        ...tx,
        // ICP-specific blockchain fields
        cycleCost,
        subnetId: subnet.id,
        canisterId,
        methodName: this.generateMethodName(tx.type),
        
        // Inter-canister call information
        callHierarchy,
        
        // Performance metrics
        executionTime,
        memoryUsage,
        instructionCount,
        
        // Subnet information
        subnetMetrics: {
          uptime: subnet.uptime,
          responseTime: Math.floor(Math.random() * 200 + 50), // 50-250ms
          throughput: Math.floor(Math.random() * 1000 + 100), // 100-1100 TPS
          errorRate: Math.random() * 2 // 0-2% error rate
        },
        
        // Consensus information
        consensusRound: BigInt(Math.floor(Math.random() * 1000000 + 500000)),
        certificateHash: Math.random() > 0.3 ? `cert_${Math.random().toString(16).substr(2, 32)}` : undefined,
        
        // Cycle balance information
        cycleBalance
      };

      return icpTransaction;
    });
  }

  /**
   * Generate ICP-specific metrics data with cycle and subnet information
   */
  generateICPMetricsData(): ICPMetricsData {
    const baseMetrics = this.generateMetricsData();
    const subnets = this.generateSubnetInfos();
    
    // Calculate cycle metrics
    const totalCyclesUsed = BigInt(Math.floor(Math.random() * 1000000000000 + 100000000000)); // 100B-1T cycles
    const averageCyclePerTransaction = BigInt(Math.floor(Number(totalCyclesUsed) / baseMetrics.transactions));
    const cycleEfficiency = Math.random() * 2 + 3; // 3-5 cycles per instruction
    const cyclesBurned = BigInt(Math.floor(Number(totalCyclesUsed) * 0.95)); // 95% burned
    const cyclesRefunded = totalCyclesUsed - cyclesBurned;
    
    // Generate subnet metrics
    const subnetMetrics: { [subnetId: string]: any } = {};
    subnets.forEach(subnet => {
      subnetMetrics[subnet.id] = {
        uptime: subnet.uptime,
        averageResponseTime: Math.floor(Math.random() * 200 + 50),
        throughput: Math.floor(Math.random() * 1000 + 100),
        errorRate: Math.random() * 2,
        consensusHealth: Math.random() * 10 + 90, // 90-100%
        lastUpdated: new Date().toISOString(),
        nodeCount: subnet.nodeCount,
        replicationFactor: subnet.replicationFactor
      };
    });
    
    // Generate canister health
    const canisterHealth = {
      memoryUsage: Math.floor(Math.random() * 2 * 1024 * 1024 * 1024), // 0-2GB
      cycleBalance: BigInt(Math.floor(Math.random() * 1000000000000 + 100000000000)),
      freezingThreshold: BigInt(Math.floor(Math.random() * 1000000000 + 100000000)),
      status: ['running', 'stopping', 'stopped'][Math.floor(Math.random() * 3)] as 'running' | 'stopping' | 'stopped',
      controllers: [`controller_${Math.random().toString(36).substr(2, 8)}`],
      moduleHash: `module_${Math.random().toString(16).substr(2, 32)}`,
      lastUpgrade: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      computeAllocation: Math.floor(Math.random() * 100),
      memoryAllocation: Math.floor(Math.random() * 8 * 1024 * 1024 * 1024) // 0-8GB
    };
    
    // Generate performance trends
    const performanceTrends = {
      cycleUsageTrend: (Math.random() - 0.5) * 20, // -10% to +10%
      throughputTrend: (Math.random() - 0.5) * 15,
      errorRateTrend: (Math.random() - 0.5) * 10,
      responseTimeTrend: (Math.random() - 0.5) * 25,
      memoryUsageTrend: (Math.random() - 0.5) * 30
    };
    
    // Generate network statistics
    const networkStats = {
      totalSubnets: subnets.length,
      totalCanisters: Math.floor(Math.random() * 100000 + 50000),
      networkThroughput: Math.floor(Math.random() * 10000 + 5000),
      averageSubnetLoad: Math.random() * 30 + 40, // 40-70%
      networkUptime: Math.random() * 2 + 98 // 98-100%
    };

    const icpMetrics: ICPMetricsData = {
      ...baseMetrics,
      cycleMetrics: {
        totalCyclesUsed,
        averageCyclePerTransaction,
        cycleEfficiency,
        cyclesBurned,
        cyclesRefunded,
        cycleCostTrend: (Math.random() - 0.5) * 15
      },
      subnetMetrics,
      canisterHealth,
      performanceTrends,
      networkStats
    };

    return icpMetrics;
  }

  /**
   * Generate realistic subnet information
   */
  private generateSubnetInfos(): SubnetInfo[] {
    const subnetTypes = ['application', 'system', 'fiduciary', 'verified_application'] as const;
    const locations = [
      ['US-East', 'US-West'],
      ['Europe-North', 'Europe-Central'],
      ['Asia-Pacific', 'Asia-East'],
      ['Global-Distributed']
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 8) + 5 }, (_, i) => ({
      id: `subnet_${Math.random().toString(36).substr(2, 8)}`,
      type: subnetTypes[Math.floor(Math.random() * subnetTypes.length)],
      nodeCount: Math.floor(Math.random() * 20) + 13, // 13-32 nodes
      replicationFactor: Math.floor(Math.random() * 3) + 3, // 3-5 replication
      location: locations[Math.floor(Math.random() * locations.length)],
      features: ['consensus', 'execution', 'networking'].slice(0, Math.floor(Math.random() * 3) + 1),
      status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'degraded' : 'maintenance'),
      uptime: Math.random() * 5 + 95 // 95-100% uptime
    }));
  }

  /**
   * Generate realistic canister IDs
   */
  private generateCanisterIds(): string[] {
    return Array.from({ length: 10 }, () => 
      `${Math.random().toString(36).substr(2, 5)}-${Math.random().toString(36).substr(2, 5)}-aaaah-qcaiq-cai`
    );
  }

  /**
   * Calculate base cycle cost for different transaction types
   */
  private calculateBaseCycleCost(type: string, amount: number): number {
    const baseCosts = {
      payment: 50000000, // 50M cycles
      refund: 30000000,  // 30M cycles
      withdrawal: 40000000, // 40M cycles
      deposit: 35000000  // 35M cycles
    };
    
    const baseCost = baseCosts[type as keyof typeof baseCosts] || baseCosts.payment;
    
    // Add complexity based on amount (larger amounts = more validation = more cycles)
    const complexityMultiplier = 1 + Math.log10(amount + 1) * 0.1;
    
    return Math.floor(baseCost * complexityMultiplier);
  }

  /**
   * Generate method names based on transaction type
   */
  private generateMethodName(type: string): string {
    const methodNames = {
      payment: ['process_payment', 'execute_transfer', 'handle_payment'],
      refund: ['process_refund', 'execute_refund', 'handle_refund'],
      withdrawal: ['process_withdrawal', 'execute_withdrawal', 'handle_withdrawal'],
      deposit: ['process_deposit', 'execute_deposit', 'handle_deposit']
    };
    
    const methods = methodNames[type as keyof typeof methodNames] || methodNames.payment;
    return methods[Math.floor(Math.random() * methods.length)];
  }

  /**
   * Generate inter-canister call hierarchy
   */
  private generateCallHierarchy(rootCanisterId: string, totalCycles: bigint): CanisterCall['callHierarchy'] {
    const callCount = Math.floor(Math.random() * 3) + 1; // 1-3 calls
    const hierarchy: CanisterCall['callHierarchy'] = [];
    const canisters = this.generateCanisterIds();
    
    let remainingCycles = totalCycles;
    
    for (let i = 0; i < callCount; i++) {
      const cycleCost = i === callCount - 1 
        ? remainingCycles // Last call gets remaining cycles
        : BigInt(Math.floor(Number(remainingCycles) * (0.2 + Math.random() * 0.6))); // 20-80% of remaining
      
      hierarchy.push({
        caller: i === 0 ? rootCanisterId : canisters[i - 1],
        callee: canisters[i],
        method: this.generateMethodName('payment'),
        cycleCost,
        depth: i + 1
      });
      
      remainingCycles -= cycleCost;
    }
    
    return hierarchy;
  }

  /**
   * Generate subnet health scores
   */
  generateSubnetHealthScores(): SubnetHealthScore[] {
    const subnets = this.generateSubnetInfos();
    
    return subnets.map(subnet => {
      const responseTime = Math.random() * 200 + 50; // 50-250ms
      const throughput = Math.random() * 1000 + 100; // 100-1100 TPS
      const errorRate = Math.random() * 2; // 0-2%
      const consensusHealth = Math.random() * 10 + 90; // 90-100%
      const nodeHealth = Math.random() * 5 + 95; // 95-100%
      
      // Calculate factor scores (0-100)
      const factors = {
        responseTime: Math.max(0, 100 - (responseTime - 50) / 2), // Lower is better
        throughput: Math.min(100, throughput / 10), // Higher is better
        errorRate: Math.max(0, 100 - errorRate * 50), // Lower is better
        consensusHealth,
        nodeHealth
      };
      
      // Calculate overall score
      const overall = Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length;
      const uptime = subnet.uptime;
      const performance = (factors.responseTime + factors.throughput) / 2;
      const reliability = (factors.errorRate + factors.consensusHealth + factors.nodeHealth) / 3;
      
      // Generate recommendations based on scores
      const recommendations: string[] = [];
      if (factors.responseTime < 70) recommendations.push('Consider optimizing response time');
      if (factors.throughput < 50) recommendations.push('Monitor throughput capacity');
      if (factors.errorRate < 80) recommendations.push('Investigate error patterns');
      if (factors.consensusHealth < 95) recommendations.push('Check consensus mechanism health');
      if (factors.nodeHealth < 98) recommendations.push('Review node status and connectivity');
      
      return {
        overall: Math.round(overall),
        uptime: Math.round(uptime),
        performance: Math.round(performance),
        reliability: Math.round(reliability),
        factors: {
          responseTime: Math.round(factors.responseTime),
          throughput: Math.round(factors.throughput),
          errorRate: Math.round(factors.errorRate),
          consensusHealth: Math.round(factors.consensusHealth),
          nodeHealth: Math.round(factors.nodeHealth)
        },
        recommendations
      };
    });
  }

  /**
   * Generate cycle usage analytics
   */
  generateCycleUsageAnalytics(): CycleUsageAnalytics {
    const totalUsage = BigInt(Math.floor(Math.random() * 1000000000000 + 100000000000));
    
    // Generate usage by method
    const methods = ['process_payment', 'execute_transfer', 'handle_refund', 'validate_transaction'];
    const usageByMethod = new Map<string, bigint>();
    let remainingUsage = totalUsage;
    
    methods.forEach((method, index) => {
      const usage = index === methods.length - 1 
        ? remainingUsage
        : BigInt(Math.floor(Number(remainingUsage) * Math.random() * 0.4));
      usageByMethod.set(method, usage);
      remainingUsage -= usage;
    });
    
    // Generate usage by canister
    const canisters = this.generateCanisterIds().slice(0, 5);
    const usageByCanister = new Map<string, bigint>();
    remainingUsage = totalUsage;
    
    canisters.forEach((canister, index) => {
      const usage = index === canisters.length - 1
        ? remainingUsage
        : BigInt(Math.floor(Number(remainingUsage) * Math.random() * 0.3));
      usageByCanister.set(canister, usage);
      remainingUsage -= usage;
    });
    
    // Generate usage by subnet
    const subnets = this.generateSubnetInfos().slice(0, 3);
    const usageBySubnet = new Map<string, bigint>();
    remainingUsage = totalUsage;
    
    subnets.forEach((subnet, index) => {
      const usage = index === subnets.length - 1
        ? remainingUsage
        : BigInt(Math.floor(Number(remainingUsage) * Math.random() * 0.4));
      usageBySubnet.set(subnet.id, usage);
      remainingUsage -= usage;
    });
    
    // Generate efficiency metrics
    const efficiency = {
      cyclesPerInstruction: Math.random() * 2 + 3, // 3-5 cycles per instruction
      cyclesPerByte: Math.random() * 1000 + 500, // 500-1500 cycles per byte
      cyclesPerSecond: Number(totalUsage) / (24 * 60 * 60) // Daily usage spread over seconds
    };
    
    // Generate trend data
    const generateTrendData = (granularity: 'hourly' | 'daily' | 'weekly'): CycleDataPoint[] => {
      const points = granularity === 'hourly' ? 24 : granularity === 'daily' ? 30 : 12;
      const data: CycleDataPoint[] = [];
      
      for (let i = 0; i < points; i++) {
        const cycles = BigInt(Math.floor(Number(totalUsage) / points * (0.8 + Math.random() * 0.4)));
        const transactions = Math.floor(Math.random() * 1000 + 100);
        const efficiency = Number(cycles) / transactions;
        
        data.push({
          timestamp: new Date(Date.now() - i * (granularity === 'hourly' ? 60 * 60 * 1000 : 
                                                granularity === 'daily' ? 24 * 60 * 60 * 1000 : 
                                                7 * 24 * 60 * 60 * 1000)).toISOString(),
          cycles,
          transactions,
          efficiency
        });
      }
      
      return data.reverse();
    };
    
    return {
      totalUsage,
      usageByMethod,
      usageByCanister,
      usageBySubnet,
      efficiency,
      trends: {
        hourly: generateTrendData('hourly'),
        daily: generateTrendData('daily'),
        weekly: generateTrendData('weekly')
      },
      predictions: {
        nextHour: BigInt(Math.floor(Number(totalUsage) / 24 * (0.9 + Math.random() * 0.2))),
        nextDay: BigInt(Math.floor(Number(totalUsage) * (0.95 + Math.random() * 0.1))),
        nextWeek: BigInt(Math.floor(Number(totalUsage) * 7 * (0.98 + Math.random() * 0.04))),
        confidence: Math.random() * 0.2 + 0.8 // 80-100% confidence
      }
    };
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();

// Export factory function for testing
export const createMockDataService = () => new MockDataService();