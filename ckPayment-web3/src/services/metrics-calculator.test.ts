/**
 * Unit Tests for MetricsCalculator Service
 * Tests cycle efficiency calculations, performance analytics, and trend analysis
 */

import { MetricsCalculator } from '../../services/metrics-calculator';
import { TransactionData, MetricsData } from '../../types/dashboard';

describe('MetricsCalculator', () => {
  let calculator: MetricsCalculator;
  let mockTransactions: TransactionData[];
  let mockMetrics: MetricsData[];

  beforeEach(() => {
    calculator = new MetricsCalculator();
    
    // Create mock transaction data
    mockTransactions = [
      {
        id: '1',
        hash: 'hash1',
        from: 'user1',
        to: 'canister1',
        amount: 100,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        status: 'completed',
        cycleCost: 1000000,
        subnetId: 'subnet1',
        canisterId: 'canister1',
        executionTime: 50,
        memoryUsage: 1024,
        instructionCount: 5000,
        callHierarchy: []
      },
      {
        id: '2',
        hash: 'hash2',
        from: 'user2',
        to: 'canister2',
        amount: 200,
        timestamp: new Date('2024-01-01T11:00:00Z'),
        status: 'completed',
        cycleCost: 2000000,
        subnetId: 'subnet1',
        canisterId: 'canister2',
        executionTime: 100,
        memoryUsage: 2048,
        instructionCount: 10000,
        callHierarchy: []
      },
      {
        id: '3',
        hash: 'hash3',
        from: 'user3',
        to: 'canister1',
        amount: 150,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        status: 'failed',
        cycleCost: 500000,
        subnetId: 'subnet2',
        canisterId: 'canister1',
        executionTime: 25,
        memoryUsage: 512,
        instructionCount: 2500,
        callHierarchy: []
      }
    ];

    // Create mock metrics data
    mockMetrics = [
      {
        timestamp: new Date('2024-01-01T10:00:00Z'),
        totalTransactions: 100,
        successfulTransactions: 95,
        failedTransactions: 5,
        averageResponseTime: 150,
        totalVolume: 10000,
        activeUsers: 50,
        cyclesBurned: 5000000,
        cyclesBalance: 95000000,
        subnetMetrics: {
          subnet1: { uptime: 99.9, responseTime: 120, throughput: 1000 },
          subnet2: { uptime: 99.5, responseTime: 180, throughput: 800 }
        },
        canisterHealth: {
          canister1: { memoryUsage: 70, cycleBalance: 10000000, status: 'running' },
          canister2: { memoryUsage: 45, cycleBalance: 15000000, status: 'running' }
        }
      },
      {
        timestamp: new Date('2024-01-01T11:00:00Z'),
        totalTransactions: 120,
        successfulTransactions: 115,
        failedTransactions: 5,
        averageResponseTime: 140,
        totalVolume: 12000,
        activeUsers: 60,
        cyclesBurned: 6000000,
        cyclesBalance: 94000000,
        subnetMetrics: {
          subnet1: { uptime: 99.8, responseTime: 115, throughput: 1100 },
          subnet2: { uptime: 99.6, responseTime: 175, throughput: 850 }
        },
        canisterHealth: {
          canister1: { memoryUsage: 72, cycleBalance: 9500000, status: 'running' },
          canister2: { memoryUsage: 48, cycleBalance: 14500000, status: 'running' }
        }
      }
    ];
  });

  describe('Cycle Efficiency Calculations', () => {
    test('should calculate cycle efficiency per transaction', () => {
      const efficiency = calculator.calculateCycleEfficiency(mockTransactions);

      expect(efficiency.averageCyclesPerTransaction).toBe(1166666.67); // (1000000 + 2000000 + 500000) / 3
      expect(efficiency.cycleEfficiencyScore).toBeGreaterThan(0);
      expect(efficiency.cycleEfficiencyScore).toBeLessThanOrEqual(100);
    });

    test('should calculate cycles per instruction', () => {
      const efficiency = calculator.calculateCycleEfficiency(mockTransactions);

      expect(efficiency.averageCyclesPerInstruction).toBe(200); // Total cycles / Total instructions
    });

    test('should identify most efficient transactions', () => {
      const efficiency = calculator.calculateCycleEfficiency(mockTransactions);

      expect(efficiency.mostEfficientTransactions).toHaveLength(3);
      expect(efficiency.mostEfficientTransactions[0].cyclesPerInstruction).toBe(200); // 1000000 / 5000
    });

    test('should handle empty transaction list', () => {
      const efficiency = calculator.calculateCycleEfficiency([]);

      expect(efficiency.averageCyclesPerTransaction).toBe(0);
      expect(efficiency.averageCyclesPerInstruction).toBe(0);
      expect(efficiency.mostEfficientTransactions).toHaveLength(0);
    });

    test('should calculate cycle waste from failed transactions', () => {
      const efficiency = calculator.calculateCycleEfficiency(mockTransactions);

      expect(efficiency.wastedCycles).toBe(500000); // Cycles from failed transaction
      expect(efficiency.wastePercentage).toBe(14.29); // 500000 / 3500000 * 100
    });
  });

  describe('Performance Analytics', () => {
    test('should calculate throughput metrics', () => {
      const analytics = calculator.calculatePerformanceAnalytics(mockTransactions, mockMetrics);

      expect(analytics.throughput.transactionsPerSecond).toBeGreaterThan(0);
      expect(analytics.throughput.peakThroughput).toBeGreaterThan(0);
      expect(analytics.throughput.averageThroughput).toBeGreaterThan(0);
    });

    test('should calculate response time percentiles', () => {
      const analytics = calculator.calculatePerformanceAnalytics(mockTransactions, mockMetrics);

      expect(analytics.responseTime.p50).toBeDefined();
      expect(analytics.responseTime.p95).toBeDefined();
      expect(analytics.responseTime.p99).toBeDefined();
      expect(analytics.responseTime.average).toBe(58.33); // (50 + 100 + 25) / 3
    });

    test('should analyze success rates', () => {
      const analytics = calculator.calculatePerformanceAnalytics(mockTransactions, mockMetrics);

      expect(analytics.successRate.overall).toBe(66.67); // 2 successful out of 3 total
      expect(analytics.successRate.bySubnet.subnet1).toBe(100); // 2 successful out of 2
      expect(analytics.successRate.bySubnet.subnet2).toBe(0); // 0 successful out of 1
    });

    test('should calculate resource utilization', () => {
      const analytics = calculator.calculatePerformanceAnalytics(mockTransactions, mockMetrics);

      expect(analytics.resourceUtilization.averageMemoryUsage).toBe(1194.67); // (1024 + 2048 + 512) / 3
      expect(analytics.resourceUtilization.peakMemoryUsage).toBe(2048);
      expect(analytics.resourceUtilization.memoryEfficiency).toBeGreaterThan(0);
    });
  });

  describe('Trend Analysis', () => {
    test('should identify performance trends', () => {
      const trends = calculator.analyzeTrends(mockMetrics);

      expect(trends.transactionVolume.trend).toBeDefined();
      expect(trends.transactionVolume.changePercentage).toBe(20); // (120 - 100) / 100 * 100
      expect(trends.transactionVolume.isImproving).toBe(true);
    });

    test('should analyze response time trends', () => {
      const trends = calculator.analyzeTrends(mockMetrics);

      expect(trends.responseTime.trend).toBe('improving');
      expect(trends.responseTime.changePercentage).toBe(-6.67); // (140 - 150) / 150 * 100
      expect(trends.responseTime.isImproving).toBe(true);
    });

    test('should analyze cycle consumption trends', () => {
      const trends = calculator.analyzeTrends(mockMetrics);

      expect(trends.cycleConsumption.trend).toBe('increasing');
      expect(trends.cycleConsumption.changePercentage).toBe(20); // (6000000 - 5000000) / 5000000 * 100
      expect(trends.cycleConsumption.isImproving).toBe(false);
    });

    test('should handle single data point', () => {
      const singleMetric = [mockMetrics[0]];
      const trends = calculator.analyzeTrends(singleMetric);

      expect(trends.transactionVolume.trend).toBe('stable');
      expect(trends.transactionVolume.changePercentage).toBe(0);
    });
  });

  describe('Cost Analysis', () => {
    test('should calculate cost per operation type', () => {
      const costAnalysis = calculator.calculateCostAnalysis(mockTransactions);

      expect(costAnalysis.totalCost).toBe(3500000); // Sum of all cycle costs
      expect(costAnalysis.averageCostPerTransaction).toBe(1166666.67);
      expect(costAnalysis.costByStatus.completed).toBe(3000000);
      expect(costAnalysis.costByStatus.failed).toBe(500000);
    });

    test('should calculate cost efficiency by canister', () => {
      const costAnalysis = calculator.calculateCostAnalysis(mockTransactions);

      expect(costAnalysis.costByCanister.canister1).toBe(1500000); // 1000000 + 500000
      expect(costAnalysis.costByCanister.canister2).toBe(2000000);
    });

    test('should identify cost optimization opportunities', () => {
      const costAnalysis = calculator.calculateCostAnalysis(mockTransactions);

      expect(costAnalysis.optimizationOpportunities).toContain(
        expect.objectContaining({
          type: 'high_cost_operations',
          description: expect.stringContaining('expensive')
        })
      );
    });

    test('should project future costs', () => {
      const costAnalysis = calculator.calculateCostAnalysis(mockTransactions);

      expect(costAnalysis.projectedMonthlyCost).toBeGreaterThan(0);
      expect(costAnalysis.projectedDailyCost).toBeGreaterThan(0);
    });
  });

  describe('Anomaly Detection', () => {
    test('should detect response time anomalies', () => {
      // Add an anomalous transaction
      const anomalousTransaction = {
        ...mockTransactions[0],
        id: '4',
        executionTime: 5000, // Much higher than normal
        timestamp: new Date('2024-01-01T13:00:00Z')
      };

      const transactionsWithAnomaly = [...mockTransactions, anomalousTransaction];
      const anomalies = calculator.detectAnomalies(transactionsWithAnomaly, mockMetrics);

      expect(anomalies.responseTimeAnomalies).toHaveLength(1);
      expect(anomalies.responseTimeAnomalies[0].transactionId).toBe('4');
      expect(anomalies.responseTimeAnomalies[0].severity).toBe('high');
    });

    test('should detect cycle cost anomalies', () => {
      const expensiveTransaction = {
        ...mockTransactions[0],
        id: '5',
        cycleCost: 10000000, // Much higher than normal
        timestamp: new Date('2024-01-01T14:00:00Z')
      };

      const transactionsWithAnomaly = [...mockTransactions, expensiveTransaction];
      const anomalies = calculator.detectAnomalies(transactionsWithAnomaly, mockMetrics);

      expect(anomalies.costAnomalies).toHaveLength(1);
      expect(anomalies.costAnomalies[0].transactionId).toBe('5');
      expect(anomalies.costAnomalies[0].type).toBe('high_cost');
    });

    test('should detect memory usage anomalies', () => {
      const memoryIntensiveTransaction = {
        ...mockTransactions[0],
        id: '6',
        memoryUsage: 10240, // Much higher than normal
        timestamp: new Date('2024-01-01T15:00:00Z')
      };

      const transactionsWithAnomaly = [...mockTransactions, memoryIntensiveTransaction];
      const anomalies = calculator.detectAnomalies(transactionsWithAnomaly, mockMetrics);

      expect(anomalies.resourceAnomalies).toHaveLength(1);
      expect(anomalies.resourceAnomalies[0].type).toBe('memory_spike');
    });

    test('should calculate anomaly scores', () => {
      const anomalies = calculator.detectAnomalies(mockTransactions, mockMetrics);

      expect(anomalies.overallAnomalyScore).toBeGreaterThanOrEqual(0);
      expect(anomalies.overallAnomalyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Predictive Analytics', () => {
    test('should predict future transaction volume', () => {
      const predictions = calculator.generatePredictions(mockMetrics);

      expect(predictions.transactionVolume.nextHour).toBeGreaterThan(0);
      expect(predictions.transactionVolume.nextDay).toBeGreaterThan(0);
      expect(predictions.transactionVolume.confidence).toBeGreaterThan(0);
      expect(predictions.transactionVolume.confidence).toBeLessThanOrEqual(100);
    });

    test('should predict cycle consumption', () => {
      const predictions = calculator.generatePredictions(mockMetrics);

      expect(predictions.cycleConsumption.nextHour).toBeGreaterThan(0);
      expect(predictions.cycleConsumption.nextDay).toBeGreaterThan(0);
      expect(predictions.cycleConsumption.trend).toBeDefined();
    });

    test('should predict resource usage', () => {
      const predictions = calculator.generatePredictions(mockMetrics);

      expect(predictions.resourceUsage.memoryUsage).toBeGreaterThan(0);
      expect(predictions.resourceUsage.storageUsage).toBeGreaterThan(0);
      expect(predictions.resourceUsage.recommendedActions).toBeDefined();
    });

    test('should provide capacity planning recommendations', () => {
      const predictions = calculator.generatePredictions(mockMetrics);

      expect(predictions.capacityPlanning.recommendedCycleTopUp).toBeGreaterThan(0);
      expect(predictions.capacityPlanning.timeUntilCapacityLimit).toBeGreaterThan(0);
      expect(predictions.capacityPlanning.scalingRecommendations).toBeDefined();
    });
  });
});