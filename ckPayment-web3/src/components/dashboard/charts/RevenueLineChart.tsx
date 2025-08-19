import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import BaseChart from './BaseChart';
import { ChartDataPoint } from '@/types/dashboard';

interface RevenueLineChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: boolean;
  lastUpdated?: Date;
  isRealTime?: boolean;
  onExport?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
}

const RevenueLineChart: React.FC<RevenueLineChartProps> = ({
  data,
  loading = false,
  error = false,
  lastUpdated,
  isRealTime = false,
  onExport,
  onExpand,
  onRefresh
}) => {
  // Calculate trend from data
  const calculateTrend = () => {
    if (data.length < 2) return null;
    
    const recent = data.slice(-7); // Last 7 data points
    const older = data.slice(-14, -7); // Previous 7 data points
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, point) => sum + point.revenue, 0) / recent.length;
    const olderAvg = older.reduce((sum, point) => sum + point.revenue, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      value: change,
      label: 'vs prev period'
    };
  };

  const trend = calculateTrend();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format data for display
  const formatData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    formattedRevenue: point.revenue
  }));

  return (
    <BaseChart
      title="Revenue Trends"
      subtitle="Daily revenue performance over time"
      loading={loading}
      error={error}
      height={350}
      badge={{
        text: 'Revenue',
        variant: 'default'
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
        <LineChart
          data={formatData}
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
            dataKey="date"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="formattedRevenue"
            name="Revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ 
              fill: 'hsl(var(--primary))', 
              strokeWidth: 2,
              r: 4
            }}
            activeDot={{ 
              r: 6, 
              stroke: 'hsl(var(--primary))',
              strokeWidth: 2,
              fill: 'hsl(var(--background))'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default RevenueLineChart;