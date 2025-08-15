import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  error?: boolean;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  tooltip?: string;
  lastUpdated?: Date;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  className?: string;
  // ICP-specific props
  cycleUsage?: number;
  tokenType?: 'ICP' | 'ckBTC' | 'ckETH' | 'USD';
  isRealTime?: boolean;
  alertLevel?: 'none' | 'warning' | 'critical';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  loading = false,
  error = false,
  subtitle,
  badge,
  tooltip,
  lastUpdated,
  trend,
  onClick,
  className,
  cycleUsage,
  tokenType,
  isRealTime = false,
  alertLevel = 'none'
}) => {
  // Format the main value based on type
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (tokenType === 'USD') {
        return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      } else if (tokenType === 'ICP' || tokenType === 'ckBTC' || tokenType === 'ckETH') {
        return `${val.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${tokenType}`;
      }
      return val.toLocaleString();
    }
    return val.toString();
  };

  // Determine trend direction and color
  const getTrendInfo = () => {
    if (change === undefined) return null;
    
    const isPositive = change >= 0;
    const isNeutral = change === 0;
    
    let trendIcon;
    let colorClass;
    
    if (isNeutral) {
      trendIcon = Minus;
      colorClass = 'text-muted-foreground';
    } else if (isPositive) {
      trendIcon = TrendingUp;
      colorClass = title.toLowerCase().includes('error') ? 'text-red-500' : 'text-green-500';
    } else {
      trendIcon = TrendingDown;
      colorClass = title.toLowerCase().includes('error') ? 'text-green-500' : 'text-red-500';
    }
    
    return {
      icon: trendIcon,
      colorClass,
      isPositive: title.toLowerCase().includes('error') ? !isPositive : isPositive
    };
  };

  const trendInfo = getTrendInfo();

  // Alert level styling
  const getAlertStyling = () => {
    switch (alertLevel) {
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 'critical':
        return 'border-red-500/50 bg-red-500/5';
      default:
        return '';
    }
  };

  const cardContent = (
    <Card 
      className={cn(
        'p-4 transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        getAlertStyling(),
        className
      )}
      onClick={onClick}
    >
      {/* Header with icon and real-time indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'p-2 rounded-lg',
            alertLevel === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-primary/10 text-primary'
          )}>
            <Icon className="h-4 w-4" />
          </div>
          {isRealTime && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
        </div>
        
        {/* Alert indicator */}
        {alertLevel !== 'none' && (
          <AlertTriangle className={cn(
            'h-4 w-4',
            alertLevel === 'critical' ? 'text-red-500' : 'text-yellow-500'
          )} />
        )}
      </div>

      {/* Main value */}
      <div className="space-y-1">
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        ) : error ? (
          <div className="space-y-1">
            <div className="text-2xl font-bold text-muted-foreground">--</div>
            <div className="text-sm text-red-500">Error loading data</div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatValue(value)}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {title}
              </div>
              {badge && (
                <Badge variant={badge.variant || 'secondary'} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
          </>
        )}
      </div>

      {/* Trend and change information */}
      {!loading && !error && trendInfo && change !== undefined && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center space-x-1">
            <trendInfo.icon className={cn('h-3 w-3', trendInfo.colorClass)} />
            <span className={cn('text-xs font-medium', trendInfo.colorClass)}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
          
          {lastUpdated && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Subtitle or additional info */}
      {subtitle && !loading && !error && (
        <div className="text-xs text-muted-foreground mt-2">
          {subtitle}
        </div>
      )}

      {/* Cycle usage for ICP-specific metrics */}
      {cycleUsage !== undefined && !loading && !error && (
        <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Cycle usage: {cycleUsage.toFixed(6)} ICP</span>
        </div>
      )}
    </Card>
  );

  // Wrap with tooltip if provided
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};

export default MetricsCard;