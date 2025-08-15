import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import BaseChart from './BaseChart';

interface TokenData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon?: string;
}

interface TokenPieChartProps {
  data?: TokenData[];
  loading?: boolean;
  error?: boolean;
  lastUpdated?: Date;
  isRealTime?: boolean;
  onExport?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
}

const TokenPieChart: React.FC<TokenPieChartProps> = ({
  data,
  loading = false,
  error = false,
  lastUpdated,
  isRealTime = false,
  onExport,
  onExpand,
  onRefresh
}) => {
  // Default token distribution data
  const defaultData: TokenData[] = [
    { 
      name: 'ckBTC', 
      value: 45678.90, 
      percentage: 60.0, 
      color: '#f7931a',
      icon: '₿'
    },
    { 
      name: 'ckETH', 
      value: 22839.45, 
      percentage: 30.0, 
      color: '#627eea',
      icon: 'Ξ'
    },
    { 
      name: 'ICP', 
      value: 7613.15, 
      percentage: 10.0, 
      color: '#29abe2',
      icon: '∞'
    }
  ];

  const chartData = data || defaultData;
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  // Calculate trend (mock data)
  const trend = {
    value: 8.3,
    label: 'vs last month'
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: data.color }}
            >
              {data.icon}
            </div>
            <span className="text-sm font-medium">{data.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Value:</span>
              <span className="text-sm font-medium">
                ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Share:</span>
              <span className="text-sm font-medium">{data.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show labels for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center space-x-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: entry.color }}
          >
            {entry.payload.icon}
          </div>
          <div className="text-sm">
            <div className="font-medium">{entry.value}</div>
            <div className="text-muted-foreground text-xs">
              ${entry.payload.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <BaseChart
      title="Token Distribution"
      subtitle="Revenue breakdown by cryptocurrency"
      loading={loading}
      error={error}
      height={400}
      badge={{
        text: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default TokenPieChart;