import React from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  DollarSign, 
  Users,
  Zap,
  Coins,
  TrendingUp,
  Activity,
  Server,
  Shield
} from 'lucide-react';
import MetricsCard from './MetricsCard';
import ChartsSection from './ChartsSection';
import RecentTransactions from './RecentTransactions';
import { MetricsData } from '@/types/dashboard';

interface MetricsGridProps {
  metrics: MetricsData | null;
  loading?: boolean;
  error?: boolean;
  lastUpdated?: Date;
  isUsingMockData?: boolean;
  onRefresh?: () => void;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  loading = false,
  error = false,
  lastUpdated,
  isUsingMockData = false,
  onRefresh
}) => {
  // Calculate additional ICP-specific metrics
  const calculateICPMetrics = () => {
    if (!metrics) return null;
    
    // Mock ICP-specific data (in real implementation, this would come from the canister)
    const cycleUsage = metrics.payments * 0.001; // Approximate cycle usage
    const avgTransactionCost = cycleUsage / Math.max(metrics.transactions, 1);
    const errorRate = (metrics.errors / Math.max(metrics.transactions, 1)) * 100;
    const subnetUptime = 99.95; // Mock subnet uptime
    
    return {
      cycleUsage,
      avgTransactionCost,
      errorRate,
      subnetUptime,
      // Token breakdown (mock data)
      tokenBreakdown: {
        ckBTC: metrics.revenue * 0.6,
        ckETH: metrics.revenue * 0.3,
        ICP: metrics.revenue * 0.1
      }
    };
  };

  const icpMetrics = calculateICPMetrics();

  // Determine alert levels based on metrics
  const getAlertLevel = (metricType: string, value: number): 'none' | 'warning' | 'critical' => {
    switch (metricType) {
      case 'errors':
        if (value > 100) return 'critical';
        if (value > 50) return 'warning';
        return 'none';
      case 'errorRate':
        if (value > 5) return 'critical';
        if (value > 2) return 'warning';
        return 'none';
      case 'cycleUsage':
        if (value > 10) return 'critical';
        if (value > 5) return 'warning';
        return 'none';
      default:
        return 'none';
    }
  };

  return (
    <div className="space-y-8">
      {/* Main KPI Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Key Performance Indicators</span>
          {isUsingMockData && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900/20 dark:text-blue-400">
              Demo Data
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Payments"
            value={metrics?.payments || 0}
            change={metrics?.trends.paymentsChange}
            changeLabel="vs last period"
            icon={CreditCard}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            isRealTime={!isUsingMockData}
            tooltip="Total number of successful payments processed"
            badge={{
              text: 'Payments',
              variant: 'default'
            }}
          />
          
          <MetricsCard
            title="Errors"
            value={metrics?.errors || 0}
            change={metrics?.trends.errorsChange}
            changeLabel="vs last period"
            icon={AlertTriangle}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            isRealTime={!isUsingMockData}
            alertLevel={getAlertLevel('errors', metrics?.errors || 0)}
            tooltip="Number of failed transactions or system errors"
            badge={{
              text: 'Issues',
              variant: metrics && metrics.errors > 50 ? 'destructive' : 'secondary'
            }}
          />
          
          <MetricsCard
            title="Revenue"
            value={metrics?.revenue || 0}
            change={metrics?.trends.revenueChange}
            changeLabel="vs last period"
            icon={DollarSign}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            tokenType="USD"
            isRealTime={!isUsingMockData}
            tooltip="Total revenue generated from all payment channels"
            badge={{
              text: 'USD',
              variant: 'outline'
            }}
          />
          
          <MetricsCard
            title="Active Users"
            value={metrics?.activeUsers || 0}
            change={metrics?.trends.usersChange}
            changeLabel="vs last period"
            icon={Users}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            isRealTime={!isUsingMockData}
            tooltip="Number of unique users who made transactions"
            badge={{
              text: 'Users',
              variant: 'secondary'
            }}
          />
        </div>
      </div>

      {/* ICP-Specific Metrics */}
      <div className="pt-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>ICP Blockchain Metrics</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Cycle Usage"
            value={icpMetrics?.cycleUsage || 0}
            icon={Zap}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            tokenType="ICP"
            isRealTime={!isUsingMockData}
            alertLevel={getAlertLevel('cycleUsage', icpMetrics?.cycleUsage || 0)}
            tooltip="Total cycles consumed for canister operations"
            subtitle={`Avg: ${icpMetrics?.avgTransactionCost.toFixed(6) || '0'} ICP per transaction`}
            badge={{
              text: 'Cycles',
              variant: 'outline'
            }}
          />
          
          <MetricsCard
            title="Error Rate"
            value={`${icpMetrics?.errorRate.toFixed(2) || '0'}%`}
            icon={AlertTriangle}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            isRealTime={!isUsingMockData}
            alertLevel={getAlertLevel('errorRate', icpMetrics?.errorRate || 0)}
            tooltip="Percentage of failed transactions"
            badge={{
              text: 'Rate',
              variant: icpMetrics && icpMetrics.errorRate > 2 ? 'destructive' : 'secondary'
            }}
          />
          
          <MetricsCard
            title="Subnet Uptime"
            value={`${icpMetrics?.subnetUptime || 99.95}%`}
            icon={Server}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            isRealTime={!isUsingMockData}
            tooltip="ICP subnet availability and uptime"
            badge={{
              text: 'Uptime',
              variant: 'default'
            }}
          />
          
          <MetricsCard
            title="Conversion Rate"
            value={`${metrics?.conversionRate || 0}%`}
            icon={TrendingUp}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            isRealTime={!isUsingMockData}
            tooltip="Percentage of successful payment conversions"
            badge={{
              text: 'Conversion',
              variant: 'secondary'
            }}
          />
        </div>
      </div>

      {/* Token Breakdown */}
      {icpMetrics?.tokenBreakdown && (
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Token Distribution</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricsCard
              title="ckBTC Revenue"
              value={icpMetrics.tokenBreakdown.ckBTC}
              icon={Coins}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
              tokenType="USD"
              isRealTime={!isUsingMockData}
              tooltip="Revenue generated from ckBTC transactions"
              badge={{
                text: 'ckBTC',
                variant: 'outline'
              }}
              subtitle="60% of total revenue"
            />
            
            <MetricsCard
              title="ckETH Revenue"
              value={icpMetrics.tokenBreakdown.ckETH}
              icon={Coins}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
              tokenType="USD"
              isRealTime={!isUsingMockData}
              tooltip="Revenue generated from ckETH transactions"
              badge={{
                text: 'ckETH',
                variant: 'outline'
              }}
              subtitle="30% of total revenue"
            />
            
            <MetricsCard
              title="ICP Revenue"
              value={icpMetrics.tokenBreakdown.ICP}
              icon={Coins}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
              tokenType="USD"
              isRealTime={!isUsingMockData}
              tooltip="Revenue generated from native ICP transactions"
              badge={{
                text: 'ICP',
                variant: 'outline'
              }}
              subtitle="10% of total revenue"
            />
          </div>
        </div>
      )}

      {/* Charts Section */}
      {metrics?.chartData && (
        <div className="pt-6">
          <ChartsSection
          chartData={metrics.chartData}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          isUsingMockData={isUsingMockData}
          onRefresh={onRefresh}
          metrics={metrics}
        />
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="pt-6">
        <RecentTransactions
        loading={loading}
        error={error}
        onRefresh={onRefresh}
      />
      </div>
    </div>
  );
};

export default MetricsGrid;