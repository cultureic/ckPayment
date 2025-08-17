import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import type { ModalAnalytics as ModalAnalyticsType } from '@/types/modal';

interface ModalAnalyticsProps {
  modalId: string;
  modalName: string;
  analytics?: ModalAnalyticsType;
  onBack: () => void;
  onRefresh: () => void;
}

const ModalAnalytics: React.FC<ModalAnalyticsProps> = ({
  modalId,
  modalName,
  analytics,
  onBack,
  onRefresh
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };

  const handleExport = () => {
    if (!analytics) return;

    const data = {
      modalId,
      modalName,
      timeRange,
      analytics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modal-analytics-${modalId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return null;
  };

  const mockChartData = [
    { date: '2024-01-01', views: 120, conversions: 15, revenue: 1250 },
    { date: '2024-01-02', views: 135, conversions: 18, revenue: 1450 },
    { date: '2024-01-03', views: 98, conversions: 12, revenue: 980 },
    { date: '2024-01-04', views: 156, conversions: 22, revenue: 1876 },
    { date: '2024-01-05', views: 142, conversions: 19, revenue: 1623 },
    { date: '2024-01-06', views: 178, conversions: 28, revenue: 2340 },
    { date: '2024-01-07', views: 165, conversions: 24, revenue: 2010 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold">{modalName}</h3>
            <p className="text-muted-foreground">Analytics & Performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 border rounded-md">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(Number(analytics?.total_views || 0))}
            </div>
            {analytics?.views_change !== undefined && (
              <div className={`flex items-center text-xs ${getChangeColor(analytics.views_change)}`}>
                {(() => {
                  const Icon = getChangeIcon(analytics.views_change);
                  return Icon ? <Icon className="h-3 w-3 mr-1" /> : null;
                })()}
                {analytics.views_change > 0 ? '+' : ''}{analytics.views_change.toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(Number(analytics?.total_conversions || 0))}
            </div>
            {analytics?.conversions_change !== undefined && (
              <div className={`flex items-center text-xs ${getChangeColor(analytics.conversions_change)}`}>
                {(() => {
                  const Icon = getChangeIcon(analytics.conversions_change);
                  return Icon ? <Icon className="h-3 w-3 mr-1" /> : null;
                })()}
                {analytics.conversions_change > 0 ? '+' : ''}{analytics.conversions_change.toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(analytics?.conversion_rate || 0).toFixed(1)}%
            </div>
            {analytics?.conversion_rate_change !== undefined && (
              <div className={`flex items-center text-xs ${getChangeColor(analytics.conversion_rate_change)}`}>
                {(() => {
                  const Icon = getChangeIcon(analytics.conversion_rate_change);
                  return Icon ? <Icon className="h-3 w-3 mr-1" /> : null;
                })()}
                {analytics.conversion_rate_change > 0 ? '+' : ''}{analytics.conversion_rate_change.toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(analytics?.total_revenue || 0))}
            </div>
            {analytics?.revenue_change !== undefined && (
              <div className={`flex items-center text-xs ${getChangeColor(analytics.revenue_change)}`}>
                {(() => {
                  const Icon = getChangeIcon(analytics.revenue_change);
                  return Icon ? <Icon className="h-3 w-3 mr-1" /> : null;
                })()}
                {analytics.revenue_change > 0 ? '+' : ''}{analytics.revenue_change.toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Views & Conversions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple mock chart visualization */}
            <div className="space-y-2">
              {mockChartData.map((data, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="text-sm text-muted-foreground">
                    {new Date(data.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>{data.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>{data.conversions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Conversions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.revenue_by_token && Object.entries(analytics.revenue_by_token).map(([token, amount]) => (
                <div key={token} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{token}</Badge>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(Number(amount))}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No revenue data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.top_countries?.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">{country.country}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{country.views}</div>
                    <div className="text-xs text-muted-foreground">
                      ({((country.views / Number(analytics?.total_views || 1)) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No geographic data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.device_breakdown && Object.entries(analytics.device_breakdown).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="capitalize text-sm">{device}</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      ({((Number(count) / Number(analytics?.total_views || 1)) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No device data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.referral_sources?.slice(0, 5).map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm truncate">{source.source || 'Direct'}</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{source.views}</div>
                    <div className="text-xs text-muted-foreground">
                      ({((source.views / Number(analytics?.total_views || 1)) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No referral data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.conversion_rate > 5 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">
                    Excellent conversion rate of {analytics.conversion_rate.toFixed(1)}% - above industry average
                  </span>
                </div>
              )}
              
              {analytics.conversion_rate < 2 && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">
                    Conversion rate of {analytics.conversion_rate.toFixed(1)}% could be improved - consider A/B testing different designs
                  </span>
                </div>
              )}

              {analytics.views_change > 20 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">
                    Strong growth in views (+{analytics.views_change.toFixed(1)}%) - your marketing efforts are paying off
                  </span>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>
                  Average session duration: {analytics.avg_session_duration ? 
                    `${Math.round(Number(analytics.avg_session_duration) / 1000)}s` : 
                    'Not available'}
                </p>
                <p>
                  Bounce rate: {analytics.bounce_rate ? 
                    `${Number(analytics.bounce_rate).toFixed(1)}%` : 
                    'Not available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!analytics && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground text-center mb-4">
              Analytics data will appear here once your modal starts receiving traffic.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModalAnalytics;
