import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RealTimeStatusBadge } from './real-time-indicator';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info,
  Clock,
  Zap,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

/**
 * Animation types for metric updates
 */
export type AnimationType = 'pulse' | 'glow' | 'bounce' | 'slide' | 'scale' | 'shake' | 'flash';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  type: AnimationType;
  duration: number; // milliseconds
  intensity: 'subtle' | 'normal' | 'strong';
  trigger: 'always' | 'increase' | 'decrease' | 'change' | 'threshold';
  threshold?: number; // for threshold-based animations
}

/**
 * Value change tracking
 */
interface ValueChange {
  oldValue: string | number;
  newValue: string | number;
  timestamp: number;
  changeType: 'increase' | 'decrease' | 'same';
  changeAmount?: number;
  changePercentage?: number;
}

/**
 * Enhanced metrics card props
 */
export interface AnimatedMetricsCardProps {
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
  
  // Animation props
  animateOnUpdate?: boolean;
  animationConfig?: AnimationConfig;
  highlightChanges?: boolean;
  showTrend?: boolean;
  showSparkline?: boolean;
  sparklineData?: number[];
  
  // Real-time features
  connectionStatus?: 'connected' | 'disconnected' | 'connecting' | 'error';
  dataFreshness?: 'live' | 'recent' | 'stale' | 'offline';
}

/**
 * Animated Metrics Card Component
 */
export const AnimatedMetricsCard: React.FC<AnimatedMetricsCardProps> = ({
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
  alertLevel = 'none',
  animateOnUpdate = true,
  animationConfig = {
    type: 'pulse',
    duration: 1000,
    intensity: 'normal',
    trigger: 'change'
  },
  highlightChanges = true,
  showTrend = true,
  showSparkline = false,
  sparklineData = [],
  connectionStatus = 'disconnected',
  dataFreshness = 'offline'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [valueHistory, setValueHistory] = useState<ValueChange[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<string>('');
  const previousValueRef = useRef<string | number>(value);
  const cardRef = useRef<HTMLDivElement>(null);

  // Track value changes and trigger animations
  useEffect(() => {
    const previousValue = previousValueRef.current;
    const currentValue = value;

    if (previousValue !== currentValue && animateOnUpdate) {
      const changeType = typeof currentValue === 'number' && typeof previousValue === 'number'
        ? currentValue > previousValue ? 'increase' : 'decrease'
        : 'same';

      const changeAmount = typeof currentValue === 'number' && typeof previousValue === 'number'
        ? currentValue - previousValue
        : 0;

      const changePercentage = typeof currentValue === 'number' && typeof previousValue === 'number' && previousValue !== 0
        ? (changeAmount / previousValue) * 100
        : 0;

      const valueChange: ValueChange = {
        oldValue: previousValue,
        newValue: currentValue,
        timestamp: Date.now(),
        changeType,
        changeAmount,
        changePercentage
      };

      setValueHistory(prev => [...prev.slice(-9), valueChange]); // Keep last 10 changes
      
      // Trigger animation based on configuration
      if (shouldTriggerAnimation(valueChange)) {
        triggerAnimation();
      }
    }

    previousValueRef.current = currentValue;
  }, [value, animateOnUpdate, animationConfig]);

  // Determine if animation should be triggered
  const shouldTriggerAnimation = (valueChange: ValueChange): boolean => {
    switch (animationConfig.trigger) {
      case 'always':
        return true;
      case 'increase':
        return valueChange.changeType === 'increase';
      case 'decrease':
        return valueChange.changeType === 'decrease';
      case 'change':
        return valueChange.changeType !== 'same';
      case 'threshold':
        return Math.abs(valueChange.changePercentage || 0) >= (animationConfig.threshold || 5);
      default:
        return false;
    }
  };

  // Trigger animation
  const triggerAnimation = () => {
    if (isAnimating) return;

    const animationClass = getAnimationClass();
    setCurrentAnimation(animationClass);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setCurrentAnimation('');
    }, animationConfig.duration);
  };

  // Get CSS animation class based on configuration
  const getAnimationClass = (): string => {
    const { type, intensity } = animationConfig;
    const intensityMap = {
      subtle: 'animate-pulse',
      normal: '',
      strong: ''
    };

    switch (type) {
      case 'pulse':
        return intensity === 'subtle' ? 'animate-pulse' : 
               intensity === 'strong' ? 'animate-ping' : 'animate-pulse';
      case 'glow':
        return 'animate-pulse shadow-lg';
      case 'bounce':
        return 'animate-bounce';
      case 'slide':
        return 'animate-slide-in';
      case 'scale':
        return 'animate-scale-in';
      case 'shake':
        return 'animate-shake';
      case 'flash':
        return 'animate-flash';
      default:
        return 'animate-pulse';
    }
  };

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

  // Get alert level styling
  const getAlertStyling = () => {
    switch (alertLevel) {
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 'critical':
        return 'border-red-500/50 bg-red-500/5 animate-pulse';
      default:
        return '';
    }
  };

  // Get change highlight styling
  const getChangeHighlight = () => {
    if (!highlightChanges || valueHistory.length === 0) return '';
    
    const latestChange = valueHistory[valueHistory.length - 1];
    const timeSinceChange = Date.now() - latestChange.timestamp;
    
    if (timeSinceChange > 3000) return ''; // Fade after 3 seconds
    
    switch (latestChange.changeType) {
      case 'increase':
        return 'ring-2 ring-green-500/50 bg-green-500/5';
      case 'decrease':
        return 'ring-2 ring-red-500/50 bg-red-500/5';
      default:
        return '';
    }
  };

  const trendInfo = getTrendInfo();

  const cardContent = (
    <Card 
      ref={cardRef}
      className={cn(
        'p-4 transition-all duration-200 hover:shadow-md relative overflow-hidden',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        getAlertStyling(),
        getChangeHighlight(),
        currentAnimation,
        className
      )}
      onClick={onClick}
    >
      {/* Sparkle effect for real-time updates */}
      {isRealTime && dataFreshness === 'live' && (
        <div className="absolute top-2 right-2">
          <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      )}

      {/* Header with icon and real-time indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            alertLevel === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-primary/10 text-primary'
          )}>
            <Icon className="h-4 w-4" />
          </div>
          
          {isRealTime && (
            <RealTimeStatusBadge 
              status={connectionStatus}
              isLive={dataFreshness === 'live'}
            />
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

      {/* Main value with animation */}
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
            <div className={cn(
              'text-2xl font-bold transition-all duration-300',
              isAnimating && 'transform scale-105'
            )}>
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

      {/* Sparkline chart */}
      {showSparkline && sparklineData.length > 0 && !loading && !error && (
        <div className="mt-2 h-8">
          <MiniSparkline data={sparklineData} />
        </div>
      )}

      {/* Trend and change information */}
      {!loading && !error && showTrend && trendInfo && change !== undefined && (
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

      {/* Change indicator overlay */}
      {highlightChanges && valueHistory.length > 0 && (
        <ChangeIndicatorOverlay changes={valueHistory} />
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

/**
 * Mini sparkline component
 */
const MiniSparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range === 0 ? 50 : ((max - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const isPositiveTrend = data[data.length - 1] > data[0];

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={isPositiveTrend ? '#22c55e' : '#ef4444'}
          strokeWidth="2"
          points={points}
          className="opacity-70"
        />
        <circle
          cx={((data.length - 1) / (data.length - 1)) * 100}
          cy={range === 0 ? 50 : ((max - data[data.length - 1]) / range) * 100}
          r="2"
          fill={isPositiveTrend ? '#22c55e' : '#ef4444'}
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};

/**
 * Change indicator overlay
 */
const ChangeIndicatorOverlay: React.FC<{ changes: ValueChange[] }> = ({ changes }) => {
  const latestChange = changes[changes.length - 1];
  const timeSinceChange = Date.now() - latestChange.timestamp;
  
  if (timeSinceChange > 2000) return null; // Hide after 2 seconds

  const getChangeIcon = () => {
    switch (latestChange.changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-2 left-2 animate-fade-in-out">
      {getChangeIcon()}
    </div>
  );
};

export default AnimatedMetricsCard;