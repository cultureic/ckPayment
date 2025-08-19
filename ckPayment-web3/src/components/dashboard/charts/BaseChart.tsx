import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Maximize2, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseChartProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  height?: number;
  className?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  trend?: {
    value: number;
    label: string;
  };
  actions?: {
    onExport?: () => void;
    onExpand?: () => void;
    onRefresh?: () => void;
  };
  lastUpdated?: Date;
  isRealTime?: boolean;
}

const BaseChart: React.FC<BaseChartProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error = false,
  height = 300,
  className,
  badge,
  trend,
  actions,
  lastUpdated,
  isRealTime = false
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.value > 0) return 'text-green-500';
    if (trend.value < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && (
              <Badge variant={badge.variant || 'secondary'} className="text-xs">
                {badge.text}
              </Badge>
            )}
            {isRealTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          {trend && TrendIcon && (
            <div className="flex items-center space-x-1">
              <TrendIcon className={cn('h-4 w-4', getTrendColor())} />
              <span className={cn('text-sm font-medium', getTrendColor())}>
                {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
          
          {actions?.onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.onExport}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {actions?.onExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.onExpand}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          
          {actions?.onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div style={{ height }} className="w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-4 w-full">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">Failed to load chart data</div>
              {actions?.onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.onRefresh}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {lastUpdated && !loading && !error && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          {isRealTime && (
            <div className="text-xs text-muted-foreground">
              Auto-refreshing every 30s
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default BaseChart;