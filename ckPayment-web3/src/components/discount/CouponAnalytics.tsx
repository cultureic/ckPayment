// src/components/discount/CouponAnalytics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Tag,
  Percent,
  Target,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CouponAnalyticsProps } from '../../types/discount';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CouponAnalytics: React.FC<CouponAnalyticsProps> = ({
  analytics,
  coupons,
  usageHistory,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate additional metrics
  const expiredCoupons = coupons.filter(coupon => {
    if (!coupon.expires_at) return false;
    return coupon.expires_at < BigInt(Date.now() * 1_000_000);
  }).length;

  const usedUpCoupons = coupons.filter(coupon => {
    if (!coupon.usage_limit) return false;
    return coupon.used_count >= coupon.usage_limit;
  }).length;

  // Prepare chart data
  const couponUsageData = coupons.map(coupon => ({
    name: coupon.code,
    usage: coupon.used_count,
    limit: coupon.usage_limit || coupon.used_count,
  })).sort((a, b) => b.usage - a.usage).slice(0, 5);

  const couponStatusData = [
    { name: 'Active', value: analytics.active_coupons, color: '#00C49F' },
    { name: 'Inactive', value: analytics.total_coupons - analytics.active_coupons, color: '#FF8042' },
    { name: 'Expired', value: expiredCoupons, color: '#8884D8' },
    { name: 'Used Up', value: usedUpCoupons, color: '#FFBB28' },
  ].filter(item => item.value > 0);

  const recentActivity = usageHistory
    .sort((a, b) => Number(b.used_at - a.used_at))
    .slice(0, 5)
    .map(usage => {
      const coupon = coupons.find(c => c.coupon_id === usage.coupon_id);
      return {
        ...usage,
        coupon_code: coupon?.code || 'Unknown',
        formatted_time: formatDistanceToNow(new Date(Number(usage.used_at) / 1_000_000), { addSuffix: true })
      };
    });

  const formatSavings = (savings: bigint) => {
    // This should be enhanced with proper token formatting
    return savings.toString();
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_coupons}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.active_coupons} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_usage}</div>
            <p className="text-xs text-muted-foreground">
              Times coupons were used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSavings(analytics.total_savings)}</div>
            <p className="text-xs text-muted-foreground">
              Customer savings generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.conversion_rate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Usage per coupon created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coupon Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            {couponUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={couponUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No usage data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coupon Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Coupon Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {couponStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={couponStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {couponStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No coupons created yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Popular Coupon */}
      {analytics.most_used_coupon && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Most Popular Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary">
                {coupons.find(c => c.coupon_id === analytics.most_used_coupon)?.code || analytics.most_used_coupon}
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {coupons.find(c => c.coupon_id === analytics.most_used_coupon)?.used_count || 0} uses
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Coupon Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.usage_id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{activity.coupon_code}</div>
                      <div className="text-sm text-muted-foreground">
                        Saved {activity.discount_applied.toString()} • {activity.formatted_time}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Used
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent coupon activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.conversion_rate < 0.5 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">Low Conversion Rate</h4>
              <p className="text-sm text-yellow-600 mt-1">
                Your coupons have a low usage rate. Consider creating more attractive discounts or improving promotion.
              </p>
            </div>
          )}

          {expiredCoupons > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800">Expired Coupons</h4>
              <p className="text-sm text-red-600 mt-1">
                You have {expiredCoupons} expired coupons. Consider extending their validity or creating new ones.
              </p>
            </div>
          )}

          {analytics.active_coupons === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">No Active Coupons</h4>
              <p className="text-sm text-blue-600 mt-1">
                Create and activate some coupons to start attracting customers with discounts.
              </p>
            </div>
          )}

          {analytics.conversion_rate > 0.8 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">Great Performance!</h4>
              <p className="text-sm text-green-600 mt-1">
                Your coupons are performing well with high usage rates. Keep up the good work!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
