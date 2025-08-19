import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import BaseChart from './BaseChart';
import { ChartDataPoint } from '@/types/dashboard';

interface CumulativeAreaChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: boolean;
  lastUpdated?: Date;
  isRealTime?: boolean;
  onExport?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
}

const CumulativeAreaChart: React.FC<CumulativeAreaChartProps> = ({
  data,
  loading = false,
  error = false,
  lastUpdated,
  isRealTime = false,
  onExport,
  onExpand,
  onRefresh
}) => {
  // Transform data to cumulative values
  const transformToCumulative = (data: ChartDataPoint[]) => {
    let cumulativeRevenue = 0;
    let cumulativePayments = 0;
    let cumulativeUsers = 0;
    
    return data.map(point => {
      cumulativeRevenue += point.revenue;
      cumulativePayments += point.payments;
      cumulativeUsers += point.users;
      
      return {
        ...point,
        date: new Date(point.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        cumulativeRevenue,
        cumulativePayments,
        cumulativeUsers,
        // Calculate cycle usage (mock calculation)
        cumulativeCycles: cumulativePayments * 0.001
      };
    });
  };

  const cumulativeData = transformToCumulative(data);

  // Calculate trend
  const calculateTrend = () => {
    if (cumulativeData.length < 2) return null;
    
    const latest = cumulativeData[cumulativeData.length - 1];
    const previous = cumulativeData[cumulativeData.length - 2];
    
    const change = ((latest.cumulativeRevenue - previous.cumulativeRevenue) / previous.cumulativeRevenue) * 100;
    
    return {
      value: change,
      label: 'daily growth'
    };
  };

  const trend = calculateTrend();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium">
                {entry.dataKey === 'cumulativeRevenue' 
                  ? `$${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : entry.dataKey === 'cumulativeCycles'
                  ? `${entry.value.toFixed(3)} ICP`
                  : entry.value.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Define gradients
  const gradients = (
    <defs>
      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
      </linearGradient>
      <linearGradient id="paymentsGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
      </linearGradient>
      <linearGradient id="cyclesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
      </linearGradient>
    </defs>
  );

  return (
    <BaseChart
      title="Cumulative Growth"
      subtitle="Cumulative revenue, payments, and cycle usage over time"
      loading={loading}
      error={error}
      height={350}
      badge={{
        text: 'Cumulative',
        variant: 'outline'
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
        <AreaChart
          data={cumulativeData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {gradients}
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
            yAxisId="left"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(1)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          
          {/* Revenue Area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="cumulativeRevenue"
            name="Cumulative Revenue"
            stackId="1"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
          
          {/* Payments Area */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativePayments"
            name="Cumulative Payments"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#paymentsGradient)"
            fillOpacity={0.1}
          />
          
          {/* Cycles Area */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeCycles"
            name="Cycle Usage (ICP)"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#cyclesGradient)"
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default CumulativeAreaChart;