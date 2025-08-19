import React from 'react';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RevenueLineChart from './charts/RevenueLineChart';
import ErrorBarChart from './charts/ErrorBarChart';
import TokenPieChart from './charts/TokenPieChart';
import CumulativeAreaChart from './charts/CumulativeAreaChart';
import FilterControls, { FilterState } from './FilterControls';
import { ChartDataPoint } from '@/types/dashboard';
import { useFilters } from '@/hooks/useFilters';

interface ChartsSectionProps {
  chartData: ChartDataPoint[];
  loading?: boolean;
  error?: boolean;
  lastUpdated?: Date;
  isUsingMockData?: boolean;
  onRefresh?: () => void;
  metrics?: any; // For filtering metrics
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  chartData,
  loading = false,
  error = false,
  lastUpdated,
  isUsingMockData = false,
  onRefresh,
  metrics
}) => {
  // Use filters hook
  const {
    filters,
    updateFilters,
    filteredData,
    filteredMetrics
  } = useFilters(chartData, metrics);
  // Export functions for each chart (using filtered data)
  const handleExportRevenue = () => {
    const csvData = filteredData.map(point => ({
      Date: new Date(point.date).toLocaleDateString(),
      Revenue: point.revenue,
      Payments: point.payments,
      Users: point.users
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportErrors = () => {
    // Mock error data export
    const errorData = [
      { Category: 'Network Timeout', Count: 45, Percentage: 35.2, Severity: 'medium' },
      { Category: 'Invalid Payment', Count: 32, Percentage: 25.0, Severity: 'high' },
      { Category: 'Insufficient Balance', Count: 28, Percentage: 21.9, Severity: 'medium' },
      { Category: 'Canister Error', Count: 15, Percentage: 11.7, Severity: 'critical' },
      { Category: 'Rate Limit', Count: 8, Percentage: 6.2, Severity: 'low' }
    ];
    
    const csvContent = [
      Object.keys(errorData[0]).join(','),
      ...errorData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'error-analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportTokens = () => {
    // Mock token data export
    const tokenData = [
      { Token: 'ckBTC', Value: 45678.90, Percentage: 60.0 },
      { Token: 'ckETH', Value: 22839.45, Percentage: 30.0 },
      { Token: 'ICP', Value: 7613.15, Percentage: 10.0 }
    ];
    
    const csvContent = [
      Object.keys(tokenData[0]).join(','),
      ...tokenData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'token-distribution.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCumulative = () => {
    let cumulativeRevenue = 0;
    let cumulativePayments = 0;
    
    const cumulativeData = filteredData.map(point => {
      cumulativeRevenue += point.revenue;
      cumulativePayments += point.payments;
      
      return {
        Date: new Date(point.date).toLocaleDateString(),
        'Cumulative Revenue': cumulativeRevenue,
        'Cumulative Payments': cumulativePayments,
        'Cycle Usage': cumulativePayments * 0.001
      };
    });
    
    const csvContent = [
      Object.keys(cumulativeData[0]).join(','),
      ...cumulativeData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cumulative-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export all charts data
  const handleExportAll = () => {
    handleExportRevenue();
    setTimeout(() => handleExportErrors(), 100);
    setTimeout(() => handleExportTokens(), 200);
    setTimeout(() => handleExportCumulative(), 300);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Analytics Charts</h3>
          {isUsingMockData && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900/20 dark:text-blue-400">
              Demo Data
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export All</span>
        </Button>
      </div>

      {/* Filter Controls */}
      <FilterControls
        filters={filters}
        onFiltersChange={updateFilters}
        onExportAll={handleExportAll}
        onRefresh={onRefresh || (() => {})}
        isLoading={loading}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <RevenueLineChart
          data={filteredData}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          isRealTime={!isUsingMockData}
          onExport={handleExportRevenue}
          onRefresh={onRefresh}
        />

        {/* Error Bar Chart */}
        <ErrorBarChart
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          isRealTime={!isUsingMockData}
          onExport={handleExportErrors}
          onRefresh={onRefresh}
        />

        {/* Token Pie Chart */}
        <TokenPieChart
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          isRealTime={!isUsingMockData}
          onExport={handleExportTokens}
          onRefresh={onRefresh}
        />

        {/* Cumulative Area Chart */}
        <CumulativeAreaChart
          data={filteredData}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          isRealTime={!isUsingMockData}
          onExport={handleExportCumulative}
          onRefresh={onRefresh}
        />
      </div>

      {/* Chart Summary */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            Chart Summary 
            {filteredData.length !== chartData.length && (
              <span className="text-muted-foreground ml-2">
                (Filtered: {filteredData.length} of {chartData.length} points)
              </span>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data Points:</span>
              <span className="ml-2 font-medium">{filteredData.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date Range:</span>
              <span className="ml-2 font-medium">
                {filteredData.length > 0 && (
                  `${new Date(filteredData[0].date).toLocaleDateString()} - ${new Date(filteredData[filteredData.length - 1].date).toLocaleDateString()}`
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="ml-2 font-medium">
                ${filteredData.reduce((sum, point) => sum + point.revenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Payments:</span>
              <span className="ml-2 font-medium">
                {filteredData.reduce((sum, point) => sum + point.payments, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsSection;