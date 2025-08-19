// src/components/subscription/SubscriptionAnalytics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import type { SubscriptionAnalytics, SubscriptionPlan, UserSubscription } from '@/types/subscription';

interface SubscriptionAnalyticsProps {
  analytics: SubscriptionAnalytics;
  plans: SubscriptionPlan[];
  subscriptions: UserSubscription[];
  isLoading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, className = '' }) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground">
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={change.type === 'increase' ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change.value)}%
            </span>
            <span className="ml-1">{change.period}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const SubscriptionAnalytics: React.FC<SubscriptionAnalyticsProps> = ({
  analytics,
  plans,
  subscriptions,
  isLoading,
}) => {
  const formatCurrency = (amount: bigint, symbol: string = 'ICP'): string => {
    return `${(Number(amount) / 1e8).toFixed(2)} ${symbol}`;
  };

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  };

  // Calculate growth rates (simplified - in real app, would come from backend)
  const calculateGrowthRate = (current: number, previous: number): { value: number; type: 'increase' | 'decrease' } => {
    if (previous === 0) return { value: 0, type: 'increase' };
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(growth)),
      type: growth >= 0 ? 'increase' : 'decrease'
    };
  };

  // Group subscriptions by status
  const subscriptionsByStatus = subscriptions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average revenue per user (simplified)
  const totalRevenue = Number(analytics.total_revenue);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active').length;
  const arpu = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

  // Get top performing plans
  const planPerformance = plans.map(plan => {
    const planSubscriptions = subscriptions.filter(sub => sub.plan_id === plan.plan_id);
    const revenue = planSubscriptions.length * Number(plan.price);
    return {
      ...plan,
      subscriber_count: planSubscriptions.length,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.total_revenue)}
          change={calculateGrowthRate(Number(analytics.total_revenue), Number(analytics.total_revenue) * 0.9)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        
        <MetricCard
          title="Active Subscriptions"
          value={analytics.active_subscriptions.toString()}
          change={calculateGrowthRate(Number(analytics.active_subscriptions), Number(analytics.active_subscriptions) * 0.95)}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(analytics.monthly_recurring_revenue)}
          change={calculateGrowthRate(Number(analytics.monthly_recurring_revenue), Number(analytics.monthly_recurring_revenue) * 0.92)}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        
        <MetricCard
          title="Average Revenue Per User"
          value={formatCurrency(BigInt(Math.round(arpu * 1e8)))}
          change={calculateGrowthRate(arpu, arpu * 0.88)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(subscriptionsByStatus).map(([status, count]) => {
                const percentage = Math.round((count / subscriptions.length) * 100);
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Active': return 'bg-green-500';
                    case 'Paused': return 'bg-yellow-500';
                    case 'Cancelled': return 'bg-red-500';
                    case 'Expired': return 'bg-gray-500';
                    default: return 'bg-blue-500';
                  }
                };

                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                      <span className="font-medium">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{count}</Badge>
                      <span className="text-sm text-muted-foreground w-12">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performing Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planPerformance.slice(0, 5).map((plan, index) => (
                <div key={plan.plan_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(plan.price, plan.token_symbol)} / month
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{plan.subscriber_count} subscribers</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(BigInt(plan.revenue * 1e8), plan.token_symbol)}
                    </div>
                  </div>
                </div>
              ))}
              {planPerformance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No plans available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.churn_rate ? `${Number(analytics.churn_rate).toFixed(1)}%` : '0.0%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly subscription cancellation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Avg. Subscription Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.average_subscription_length ? 
                `${Number(analytics.average_subscription_length)} days` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average days customers stay subscribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Trial Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.trial_conversion_rate ? 
                `${Number(analytics.trial_conversion_rate).toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trial to paid subscription conversion
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
