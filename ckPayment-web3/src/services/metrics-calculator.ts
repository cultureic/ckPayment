import { 
  ICPTransactionData, 
  ICPMetricsData, 
  SubnetHealthScore, 
  CycleUsageAnalytics,
  CycleDataPoint,
  PerformanceMetrics,
  SubnetInfo
} from '@/types/dashboard';

/**
 * Time range for analytics calculations
 */
export interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

/**
 * Cycle trend analysis
 */
export interface CycleTrend {
  timestamp: string;
  totalCycles: bigint;
  averageCycles: bigint;
  efficiency: number;
  cost: number; // in USD equivalent
  transactions: number;
  prediction?: {
    nextValue: bigint;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

/**
 * Performance comparison between periods
 */
export interface PerformanceComparison {
  period1: {
    start: Date;
    end: Date;
    metrics: PerformanceMetrics;
  };
  period2: {
    start: Date;
    end: Date;
    metrics: PerformanceMetrics;
  };
  changes: {
    responseTime: number; // percentage change
    throughput: number;
    errorRate: number;
    efficiency: number;
  };
  significance: 'low' | 'medium' | 'high';
}

/**
 * Cycle usage prediction
 */
export interface CyclePrediction {
  timeframe: number; // hours
  predicted: bigint;
  confidence: number; // 0-1
  factors: {
    historical: number; // weight of historical data
    seasonal: number; // weight of seasonal patterns
    trend: number; // weight of trend analysis
  };
  range: {
    min: bigint;
    max: bigint;
  };
  recommendations: string[];
}

/**
 * Anomaly detection result
 */
export interface Anomaly {
  id: string;
  timestamp: string;
  type: 'spike' | 'drop' | 'pattern' | 'outlier';
  metric: string;
  value: number;
  expected: number;
  deviation: number; // standard deviations from normal
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  possibleCauses: string[];
  recommendations: string[];
}

/**
 * Network benchmark result
 */
export interface BenchmarkResult {
  canisterId: string;
  metrics: {
    responseTime: {
      value: number;
      percentile: number; // 0-100, where this canister ranks
      networkAverage: number;
    };
    throughput: {
      value: number;
      percentile: number;
      networkAverage: number;
    };
    cycleEfficiency: {
      value: number;
      percentile: number;
      networkAverage: number;
    };
    errorRate: {
      value: number;
      percentile: number; // lower is better
      networkAverage: number;
    };
  };
  overallScore: number; // 0-100
  ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  recommendations: string[];
}

/**
 * Metrics Calculator Service
 * Provides advanced analytics and predictive capabilities for ICP dashboard
 */
export class MetricsCalculator {
  private static instance: MetricsCalculator;
  private historicalData: Map<string, ICPTransactionData[]> = new Map();
  private metricsHistory: ICPMetricsData[] = [];
  private cyclePrice = 0.000001; // USD per cycle (mock value)

  constructor() {
    // Initialize with empty data
  }

  static getInstance(): MetricsCalculator {
    if (!MetricsCalculator.instance) {
      MetricsCalculator.instance = new MetricsCalculator();
    }
    return MetricsCalculator.instance;
  }

  /**
   * Add historical data for calculations
   */
  addHistoricalData(canisterId: string, transactions: ICPTransactionData[]): void {
    this.historicalData.set(canisterId, transactions);
  }

  /**
   * Add metrics history for trend analysis
   */
  addMetricsHistory(metrics: ICPMetricsData): void {
    this.metricsHistory.push(metrics);
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }
  }

  /**
   * Calculate cycle efficiency across transactions
   */
  calculateCycleEfficiency(transactions: ICPTransactionData[]): number {
    if (transactions.length === 0) return 0;

    const totalCycles = transactions.reduce((sum, tx) => sum + Number(tx.cycleCost), 0);
    const totalInstructions = transactions.reduce((sum, tx) => sum + Number(tx.instructionCount), 0);

    if (totalInstructions === 0) return 0;

    return totalCycles / totalInstructions; // cycles per instruction
  }

  /**
   * Calculate cycle trends over time
   */
  calculateCycleTrends(timeRange: TimeRange): CycleTrend[] {
    const trends: CycleTrend[] = [];
    const allTransactions = Array.from(this.historicalData.values()).flat();
    
    // Filter transactions by time range
    const filteredTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= timeRange.start && txDate <= timeRange.end;
    });

    // Group by time granularity
    const groups = this.groupByTimeGranularity(filteredTransactions, timeRange.granularity);
    
    groups.forEach((transactions, timeKey) => {
      const totalCycles = transactions.reduce((sum, tx) => sum + tx.cycleCost, BigInt(0));
      const averageCycles = transactions.length > 0 ? totalCycles / BigInt(transactions.length) : BigInt(0);
      const efficiency = this.calculateCycleEfficiency(transactions);
      const cost = Number(totalCycles) * this.cyclePrice;

      // Simple prediction based on trend
      const prediction = this.predictNextValue(trends, totalCycles);

      trends.push({
        timestamp: timeKey,
        totalCycles,
        averageCycles,
        efficiency,
        cost,
        transactions: transactions.length,
        prediction
      });
    });

    return trends.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Calculate cost per operation type
   */
  calculateCostPerOperation(transactions: ICPTransactionData[]): Map<string, bigint> {
    const costMap = new Map<string, bigint>();
    const countMap = new Map<string, number>();

    transactions.forEach(tx => {
      const operation = tx.methodName || tx.type;
      const currentCost = costMap.get(operation) || BigInt(0);
      const currentCount = countMap.get(operation) || 0;

      costMap.set(operation, currentCost + tx.cycleCost);
      countMap.set(operation, currentCount + 1);
    });

    // Calculate average cost per operation
    const avgCostMap = new Map<string, bigint>();
    costMap.forEach((totalCost, operation) => {
      const count = countMap.get(operation) || 1;
      avgCostMap.set(operation, totalCost / BigInt(count));
    });

    return avgCostMap;
  }

  /**
   * Calculate throughput for a subnet
   */
  calculateThroughput(transactions: ICPTransactionData[], subnetId?: string): number {
    let filteredTransactions = transactions;
    
    if (subnetId) {
      filteredTransactions = transactions.filter(tx => tx.subnetId === subnetId);
    }

    if (filteredTransactions.length === 0) return 0;

    // Calculate throughput as transactions per second
    const timestamps = filteredTransactions.map(tx => new Date(tx.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeSpanSeconds = (maxTime - minTime) / 1000;

    if (timeSpanSeconds === 0) return 0;

    return filteredTransactions.length / timeSpanSeconds;
  }

  /**
   * Calculate response time percentiles
   */
  calculateResponseTimePercentiles(transactions: ICPTransactionData[]): PerformanceMetrics['responseTime'] {
    if (transactions.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, max: 0, min: 0 };
    }

    const responseTimes = transactions
      .map(tx => tx.subnetMetrics.responseTime)
      .sort((a, b) => a - b);

    return {
      p50: this.calculatePercentile(responseTimes, 50),
      p90: this.calculatePercentile(responseTimes, 90),
      p95: this.calculatePercentile(responseTimes, 95),
      p99: this.calculatePercentile(responseTimes, 99),
      max: Math.max(...responseTimes),
      min: Math.min(...responseTimes)
    };
  }

  /**
   * Calculate subnet health score
   */
  calculateSubnetHealth(subnetId: string): SubnetHealthScore {
    const transactions = Array.from(this.historicalData.values())
      .flat()
      .filter(tx => tx.subnetId === subnetId);

    if (transactions.length === 0) {
      return {
        overall: 0,
        uptime: 0,
        performance: 0,
        reliability: 0,
        factors: {
          responseTime: 0,
          throughput: 0,
          errorRate: 0,
          consensusHealth: 0,
          nodeHealth: 0
        },
        recommendations: ['No data available for this subnet']
      };
    }

    // Calculate individual factors
    const responseTimeScore = this.calculateResponseTimeScore(transactions);
    const throughputScore = this.calculateThroughputScore(transactions);
    const errorRateScore = this.calculateErrorRateScore(transactions);
    const consensusHealthScore = this.calculateConsensusHealthScore(transactions);
    const nodeHealthScore = 95; // Mock value - would come from node monitoring

    // Calculate composite scores
    const performance = (responseTimeScore + throughputScore) / 2;
    const reliability = (errorRateScore + consensusHealthScore + nodeHealthScore) / 3;
    const uptime = transactions.reduce((sum, tx) => sum + tx.subnetMetrics.uptime, 0) / transactions.length;
    const overall = (performance + reliability + uptime) / 3;

    // Generate recommendations
    const recommendations = this.generateHealthRecommendations({
      responseTime: responseTimeScore,
      throughput: throughputScore,
      errorRate: errorRateScore,
      consensusHealth: consensusHealthScore,
      nodeHealth: nodeHealthScore
    });

    return {
      overall: Math.round(overall),
      uptime: Math.round(uptime),
      performance: Math.round(performance),
      reliability: Math.round(reliability),
      factors: {
        responseTime: Math.round(responseTimeScore),
        throughput: Math.round(throughputScore),
        errorRate: Math.round(errorRateScore),
        consensusHealth: Math.round(consensusHealthScore),
        nodeHealth: Math.round(nodeHealthScore)
      },
      recommendations
    };
  }

  /**
   * Predict cycle usage for a given timeframe
   */
  predictCycleUsage(historicalData: ICPMetricsData[], timeframe: number): CyclePrediction {
    if (historicalData.length < 2) {
      return {
        timeframe,
        predicted: BigInt(0),
        confidence: 0,
        factors: { historical: 0, seasonal: 0, trend: 0 },
        range: { min: BigInt(0), max: BigInt(0) },
        recommendations: ['Insufficient historical data for prediction']
      };
    }

    // Extract cycle usage data
    const cycleData = historicalData.map(metrics => ({
      timestamp: new Date().toISOString(), // Would use actual timestamp
      cycles: metrics.cycleMetrics.totalCyclesUsed
    }));

    // Calculate trend
    const trend = this.calculateTrend(cycleData.map(d => Number(d.cycles)));
    
    // Calculate seasonal patterns (simplified)
    const seasonal = this.calculateSeasonalPattern(cycleData);
    
    // Make prediction
    const lastValue = Number(cycleData[cycleData.length - 1].cycles);
    const trendAdjustment = trend * timeframe;
    const seasonalAdjustment = seasonal * lastValue;
    
    const predicted = BigInt(Math.max(0, Math.round(lastValue + trendAdjustment + seasonalAdjustment)));
    
    // Calculate confidence based on data consistency
    const confidence = this.calculatePredictionConfidence(cycleData.map(d => Number(d.cycles)));
    
    // Calculate range
    const variance = this.calculateVariance(cycleData.map(d => Number(d.cycles)));
    const margin = Math.sqrt(variance) * 2; // 2 standard deviations
    
    const range = {
      min: BigInt(Math.max(0, Number(predicted) - margin)),
      max: BigInt(Number(predicted) + margin)
    };

    // Generate recommendations
    const recommendations = this.generateUsageRecommendations(predicted, trend, confidence);

    return {
      timeframe,
      predicted,
      confidence,
      factors: {
        historical: 0.6,
        seasonal: 0.2,
        trend: 0.2
      },
      range,
      recommendations
    };
  }

  /**
   * Detect anomalies in metrics data
   */
  detectAnomalies(metrics: ICPMetricsData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    if (metrics.length < 10) {
      return anomalies; // Need sufficient data for anomaly detection
    }

    // Detect cycle usage anomalies
    const cycleUsages = metrics.map(m => Number(m.cycleMetrics.totalCyclesUsed));
    const cycleAnomalies = this.detectStatisticalAnomalies(
      cycleUsages, 
      'cycle_usage', 
      'Total Cycle Usage'
    );
    anomalies.push(...cycleAnomalies);

    // Detect error rate anomalies
    const errorRates = metrics.map(m => m.errors / Math.max(m.transactions, 1) * 100);
    const errorAnomalies = this.detectStatisticalAnomalies(
      errorRates,
      'error_rate',
      'Error Rate'
    );
    anomalies.push(...errorAnomalies);

    // Detect throughput anomalies
    const throughputs = metrics.map(m => m.transactions);
    const throughputAnomalies = this.detectStatisticalAnomalies(
      throughputs,
      'throughput',
      'Transaction Throughput'
    );
    anomalies.push(...throughputAnomalies);

    return anomalies.sort((a, b) => b.deviation - a.deviation);
  }

  /**
   * Compare performance between two periods
   */
  comparePerformance(period1: TimeRange, period2: TimeRange): PerformanceComparison {
    const metrics1 = this.calculatePeriodMetrics(period1);
    const metrics2 = this.calculatePeriodMetrics(period2);

    const changes = {
      responseTime: this.calculatePercentageChange(
        metrics1.responseTime.p50, 
        metrics2.responseTime.p50
      ),
      throughput: this.calculatePercentageChange(
        metrics1.throughput.average,
        metrics2.throughput.average
      ),
      errorRate: this.calculatePercentageChange(
        metrics1.errorRate.average,
        metrics2.errorRate.average
      ),
      efficiency: this.calculatePercentageChange(
        metrics1.resourceUsage.compute,
        metrics2.resourceUsage.compute
      )
    };

    // Determine significance
    const significance = this.determineSignificance(changes);

    return {
      period1: {
        start: period1.start,
        end: period1.end,
        metrics: metrics1
      },
      period2: {
        start: period2.start,
        end: period2.end,
        metrics: metrics2
      },
      changes,
      significance
    };
  }

  /**
   * Benchmark canister against network averages
   */
  benchmarkAgainstNetwork(canisterId: string): BenchmarkResult {
    const canisterTransactions = this.historicalData.get(canisterId) || [];
    
    if (canisterTransactions.length === 0) {
      return {
        canisterId,
        metrics: {
          responseTime: { value: 0, percentile: 0, networkAverage: 0 },
          throughput: { value: 0, percentile: 0, networkAverage: 0 },
          cycleEfficiency: { value: 0, percentile: 0, networkAverage: 0 },
          errorRate: { value: 0, percentile: 0, networkAverage: 0 }
        },
        overallScore: 0,
        ranking: 'poor',
        recommendations: ['No data available for benchmarking']
      };
    }

    // Calculate canister metrics
    const canisterMetrics = {
      responseTime: this.calculateResponseTimePercentiles(canisterTransactions).p50,
      throughput: this.calculateThroughput(canisterTransactions),
      cycleEfficiency: this.calculateCycleEfficiency(canisterTransactions),
      errorRate: this.calculateErrorRate(canisterTransactions)
    };

    // Calculate network averages (mock values - would come from network data)
    const networkAverages = {
      responseTime: 150, // ms
      throughput: 500, // TPS
      cycleEfficiency: 4.5, // cycles per instruction
      errorRate: 1.2 // percentage
    };

    // Calculate percentiles (simplified - would use actual network distribution)
    const metrics = {
      responseTime: {
        value: canisterMetrics.responseTime,
        percentile: this.calculateNetworkPercentile(canisterMetrics.responseTime, networkAverages.responseTime, false),
        networkAverage: networkAverages.responseTime
      },
      throughput: {
        value: canisterMetrics.throughput,
        percentile: this.calculateNetworkPercentile(canisterMetrics.throughput, networkAverages.throughput, true),
        networkAverage: networkAverages.throughput
      },
      cycleEfficiency: {
        value: canisterMetrics.cycleEfficiency,
        percentile: this.calculateNetworkPercentile(canisterMetrics.cycleEfficiency, networkAverages.cycleEfficiency, false),
        networkAverage: networkAverages.cycleEfficiency
      },
      errorRate: {
        value: canisterMetrics.errorRate,
        percentile: this.calculateNetworkPercentile(canisterMetrics.errorRate, networkAverages.errorRate, false),
        networkAverage: networkAverages.errorRate
      }
    };

    // Calculate overall score
    const overallScore = (
      metrics.responseTime.percentile +
      metrics.throughput.percentile +
      metrics.cycleEfficiency.percentile +
      metrics.errorRate.percentile
    ) / 4;

    // Determine ranking
    const ranking = this.determineRanking(overallScore);

    // Generate recommendations
    const recommendations = this.generateBenchmarkRecommendations(metrics);

    return {
      canisterId,
      metrics,
      overallScore: Math.round(overallScore),
      ranking,
      recommendations
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private groupByTimeGranularity(
    transactions: ICPTransactionData[], 
    granularity: TimeRange['granularity']
  ): Map<string, ICPTransactionData[]> {
    const groups = new Map<string, ICPTransactionData[]>();

    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      let key: string;

      switch (granularity) {
        case 'minute':
          key = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
          break;
        case 'hour':
          key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case 'day':
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7); // YYYY-MM
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      const group = groups.get(key) || [];
      group.push(tx);
      groups.set(key, group);
    });

    return groups;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateSeasonalPattern(data: { timestamp: string; cycles: bigint }[]): number {
    // Simplified seasonal calculation - would be more sophisticated in real implementation
    const hour = new Date().getHours();
    
    // Mock seasonal patterns (higher usage during business hours)
    if (hour >= 9 && hour <= 17) {
      return 0.1; // 10% increase during business hours
    } else if (hour >= 18 && hour <= 22) {
      return 0.05; // 5% increase during evening
    } else {
      return -0.05; // 5% decrease during night
    }
  }

  private calculatePredictionConfidence(values: number[]): number {
    if (values.length < 3) return 0.1;

    // Calculate coefficient of variation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = this.calculateVariance(values);
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Convert to confidence (lower CV = higher confidence)
    return Math.max(0.1, Math.min(0.95, 1 - cv));
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / (values.length - 1);
  }

  private detectStatisticalAnomalies(
    values: number[], 
    metricType: string, 
    metricName: string
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    if (values.length < 5) return anomalies;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(this.calculateVariance(values));
    const threshold = 2.5; // 2.5 standard deviations

    values.forEach((value, index) => {
      const deviation = Math.abs(value - mean) / stdDev;
      
      if (deviation > threshold) {
        const severity = deviation > 4 ? 'critical' : 
                        deviation > 3 ? 'high' : 
                        deviation > 2.5 ? 'medium' : 'low';

        const type = value > mean ? 'spike' : 'drop';

        anomalies.push({
          id: `anomaly_${metricType}_${index}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type,
          metric: metricName,
          value,
          expected: mean,
          deviation,
          severity,
          description: `${metricName} ${type} detected: ${value.toFixed(2)} (expected ~${mean.toFixed(2)})`,
          possibleCauses: this.getPossibleCauses(metricType, type),
          recommendations: this.getAnomalyRecommendations(metricType, type, severity)
        });
      }
    });

    return anomalies;
  }

  private calculateResponseTimeScore(transactions: ICPTransactionData[]): number {
    const avgResponseTime = transactions.reduce((sum, tx) => sum + tx.subnetMetrics.responseTime, 0) / transactions.length;
    
    // Score based on response time (lower is better)
    if (avgResponseTime < 50) return 100;
    if (avgResponseTime < 100) return 90;
    if (avgResponseTime < 200) return 75;
    if (avgResponseTime < 500) return 50;
    return 25;
  }

  private calculateThroughputScore(transactions: ICPTransactionData[]): number {
    const throughput = this.calculateThroughput(transactions);
    
    // Score based on throughput (higher is better)
    if (throughput > 1000) return 100;
    if (throughput > 500) return 90;
    if (throughput > 100) return 75;
    if (throughput > 50) return 50;
    return 25;
  }

  private calculateErrorRateScore(transactions: ICPTransactionData[]): number {
    const errorRate = this.calculateErrorRate(transactions);
    
    // Score based on error rate (lower is better)
    if (errorRate < 0.1) return 100;
    if (errorRate < 0.5) return 90;
    if (errorRate < 1.0) return 75;
    if (errorRate < 2.0) return 50;
    return 25;
  }

  private calculateConsensusHealthScore(transactions: ICPTransactionData[]): number {
    // Mock consensus health calculation
    return 95 + Math.random() * 5; // 95-100%
  }

  private calculateErrorRate(transactions: ICPTransactionData[]): number {
    if (transactions.length === 0) return 0;
    
    // Mock error rate calculation based on subnet metrics
    const avgErrorRate = transactions.reduce((sum, tx) => sum + tx.subnetMetrics.errorRate, 0) / transactions.length;
    return avgErrorRate;
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private calculatePeriodMetrics(period: TimeRange): PerformanceMetrics {
    // Mock implementation - would calculate actual metrics for the period
    return {
      responseTime: {
        p50: 100 + Math.random() * 50,
        p90: 200 + Math.random() * 100,
        p95: 300 + Math.random() * 150,
        p99: 500 + Math.random() * 200,
        max: 1000 + Math.random() * 500,
        min: 50 + Math.random() * 25
      },
      throughput: {
        current: 500 + Math.random() * 200,
        average: 450 + Math.random() * 100,
        peak: 800 + Math.random() * 200,
        trend: (Math.random() - 0.5) * 20
      },
      errorRate: {
        current: Math.random() * 2,
        average: Math.random() * 1.5,
        byType: new Map([
          ['network', Math.random() * 0.5],
          ['canister', Math.random() * 0.3],
          ['validation', Math.random() * 0.2]
        ]),
        trend: (Math.random() - 0.5) * 10
      },
      resourceUsage: {
        memory: Math.random() * 80 + 10,
        compute: Math.random() * 70 + 20,
        storage: Math.random() * 1000000000,
        network: Math.random() * 1000000
      }
    };
  }

  private determineSignificance(changes: any): 'low' | 'medium' | 'high' {
    const maxChange = Math.max(
      Math.abs(changes.responseTime),
      Math.abs(changes.throughput),
      Math.abs(changes.errorRate),
      Math.abs(changes.efficiency)
    );

    if (maxChange > 20) return 'high';
    if (maxChange > 10) return 'medium';
    return 'low';
  }

  private calculateNetworkPercentile(value: number, networkAverage: number, higherIsBetter: boolean): number {
    // Simplified percentile calculation
    const ratio = value / networkAverage;
    
    if (higherIsBetter) {
      return Math.min(100, Math.max(0, ratio * 50));
    } else {
      return Math.min(100, Math.max(0, (2 - ratio) * 50));
    }
  }

  private determineRanking(score: number): BenchmarkResult['ranking'] {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'average';
    if (score >= 25) return 'below_average';
    return 'poor';
  }

  private predictNextValue(trends: CycleTrend[], currentValue: bigint): CycleTrend['prediction'] {
    if (trends.length < 2) {
      return {
        nextValue: currentValue,
        confidence: 0.1,
        trend: 'stable'
      };
    }

    // Simple trend calculation
    const recentTrends = trends.slice(-5);
    const values = recentTrends.map(t => Number(t.totalCycles));
    const trendSlope = this.calculateTrend(values);
    
    const nextValue = BigInt(Math.max(0, Number(currentValue) + trendSlope));
    const confidence = this.calculatePredictionConfidence(values);
    
    const trend = trendSlope > 0.1 ? 'increasing' : 
                  trendSlope < -0.1 ? 'decreasing' : 'stable';

    return { nextValue, confidence, trend };
  }

  private generateHealthRecommendations(factors: SubnetHealthScore['factors']): string[] {
    const recommendations: string[] = [];

    if (factors.responseTime < 70) {
      recommendations.push('Consider optimizing response time through caching or code optimization');
    }
    if (factors.throughput < 50) {
      recommendations.push('Monitor throughput capacity and consider scaling solutions');
    }
    if (factors.errorRate < 80) {
      recommendations.push('Investigate error patterns and implement better error handling');
    }
    if (factors.consensusHealth < 95) {
      recommendations.push('Check consensus mechanism health and node connectivity');
    }
    if (factors.nodeHealth < 98) {
      recommendations.push('Review node status and consider maintenance or replacement');
    }

    return recommendations;
  }

  private generateUsageRecommendations(predicted: bigint, trend: number, confidence: number): string[] {
    const recommendations: string[] = [];

    if (trend > 0.2) {
      recommendations.push('Cycle usage is increasing rapidly - consider optimization');
    }
    if (confidence < 0.5) {
      recommendations.push('Prediction confidence is low - gather more historical data');
    }
    if (Number(predicted) > 1000000000) {
      recommendations.push('High cycle usage predicted - ensure adequate cycle balance');
    }

    return recommendations;
  }

  private generateBenchmarkRecommendations(metrics: BenchmarkResult['metrics']): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime.percentile < 50) {
      recommendations.push('Response time is below network average - consider performance optimization');
    }
    if (metrics.throughput.percentile < 50) {
      recommendations.push('Throughput is below network average - review capacity and scaling');
    }
    if (metrics.cycleEfficiency.percentile < 50) {
      recommendations.push('Cycle efficiency is below average - optimize code for better cycle usage');
    }
    if (metrics.errorRate.percentile < 50) {
      recommendations.push('Error rate is above network average - improve error handling and validation');
    }

    return recommendations;
  }

  private getPossibleCauses(metricType: string, anomalyType: 'spike' | 'drop'): string[] {
    const causes: Record<string, Record<string, string[]>> = {
      cycle_usage: {
        spike: ['Increased transaction volume', 'Code inefficiency', 'Complex operations', 'Memory leaks'],
        drop: ['Reduced activity', 'Optimization improvements', 'System maintenance', 'User behavior change']
      },
      error_rate: {
        spike: ['Network issues', 'Code bugs', 'Resource constraints', 'External service failures'],
        drop: ['Bug fixes', 'Improved error handling', 'System stability improvements', 'Better validation']
      },
      throughput: {
        spike: ['Increased demand', 'Performance improvements', 'Scaling optimizations', 'Caching effectiveness'],
        drop: ['System overload', 'Resource constraints', 'Network issues', 'Code inefficiencies']
      }
    };

    return causes[metricType]?.[anomalyType] || ['Unknown cause'];
  }

  private getAnomalyRecommendations(metricType: string, anomalyType: 'spike' | 'drop', severity: string): string[] {
    const recommendations: Record<string, Record<string, string[]>> = {
      cycle_usage: {
        spike: ['Review recent code changes', 'Optimize expensive operations', 'Check for memory leaks', 'Monitor transaction patterns'],
        drop: ['Verify system functionality', 'Check for reduced user activity', 'Confirm optimization effectiveness']
      },
      error_rate: {
        spike: ['Investigate error logs', 'Check system resources', 'Review recent deployments', 'Monitor external dependencies'],
        drop: ['Document improvements made', 'Continue monitoring', 'Share best practices']
      },
      throughput: {
        spike: ['Monitor resource usage', 'Prepare for sustained load', 'Check system capacity'],
        drop: ['Investigate performance bottlenecks', 'Check resource availability', 'Review system health']
      }
    };

    return recommendations[metricType]?.[anomalyType] || ['Monitor closely and investigate'];
  }
}

// Export singleton instance
export const metricsCalculator = MetricsCalculator.getInstance();

// Export factory function for testing
export const createMetricsCalculator = () => new MetricsCalculator();