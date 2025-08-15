import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import BaseChart from './BaseChart';

interface ErrorData {
  category: string;
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorBarChartProps {
  data?: ErrorData[];
  loading?: boolean;
  error?: boolean;
  lastUpdated?: Date;
  isRealTime?: boolean;
  onExport?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
}

const ErrorBarChart: React.FC<ErrorBarChartProps> = ({
  data,
  loading = false,
  error = false,
  lastUpdated,
  isRealTime = false,
  onExport,
  onExpand,
  onRefresh
}) => {
  // Generate mock error data if none provided
  const defaultData: ErrorData[] = [
    { category: 'Network Timeout', count: 45, percentage: 35.2, severity: 'medium' },
    { category: 'Invalid Payment', count: 32, percentage: 25.0, severity: 'high' },
    { category: 'Insufficient Balance', count: 28, percentage: 21.9, severity: 'medium' },
    { category: 'Canister Error', count: 15, percentage: 11.7, severity: 'critical' },
    { category: 'Rate Limit', count: 8, percentage: 6.2, severity: 'low' }
  ];

  const chartData = data || defaultData;

  // Calculate trend
  const totalErrors = chartData.reduce((sum, item) => sum + item.count, 0);
  const criticalErrors = chartData.filter(item => item.severity === 'critical').length;
  const trend = {
    value: -12.5, // Mock trend - in real app this would be calculated
    label: 'vs last week'
  };

  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444'; // red-500
      case 'high':
        return '#f97316'; // orange-500
      case 'medium':
        return '#eab308'; // yellow-500
      case 'low':
        return '#22c55e'; // green-500
      default:
        return 'hsl(var(--primary))';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Count:</span>
              <span className="text-sm font-medium">{data.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Percentage:</span>
              <span className="text-sm font-medium">{data.percentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Severity:</span>
              <span className={`text-sm font-medium capitalize ${
                data.severity === 'critical' ? 'text-red-500' :
                data.severity === 'high' ? 'text-orange-500' :
                data.severity === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {data.severity}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape with severity-based colors
  const CustomBar = (props: any) => {
    const { payload } = props;
    const fill = getSeverityColor(payload.severity);
    return <Bar {...props} fill={fill} />;
  };

  return (
    <BaseChart
      title="Error Distribution"
      subtitle="Breakdown of errors by category and severity"
      loading={loading}
      error={error}
      height={350}
      badge={{
        text: `${totalErrors} Total`,
        variant: criticalErrors > 0 ? 'destructive' : 'secondary'
      }}
      trend={trend}
      actions={{
        onExport,
        onExpand,
        onRefresh
      }}
      lastUpdated={lastUpdated}
      isRealTime={isRealTime}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted-foreground/20"
          />
          <XAxis 
            dataKey="category"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            content={() => (
              <div className="flex justify-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Critical</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded" />
                  <span>High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Low</span>
                </div>
              </div>
            )}
          />
          <Bar
            dataKey="count"
            name="Error Count"
            radius={[4, 4, 0, 0]}
            fill={(entry: any) => getSeverityColor(entry.severity)}
          />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default ErrorBarChart;