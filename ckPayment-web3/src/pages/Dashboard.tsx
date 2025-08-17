import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  Settings, 
  Webhook,
  Activity,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  LogOut,
  User,
  Factory,
  Code,
  Tag,
  CreditCard
} from 'lucide-react';
import { useAuth, withAuth, UserInfo, LogoutButton } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DashboardProps, 
  DashboardTab
} from '@/types/dashboard';
import { useICPData } from '@/hooks/useICPData';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import AnimatedBackground from '@/components/AnimatedBackground';
import { FactoryTab } from '@/components/factory/FactoryTab';
import ModalBuilderTab from '@/components/modal/ModalBuilderTab';
import { DiscountTab } from '@/components/discount/DiscountTab';
import SubscriptionTab from '@/components/subscription/SubscriptionTab';

const Dashboard: React.FC<DashboardProps> = ({ 
  defaultTab = 'analytics',
  canisterId,
  refreshInterval = 30000
}) => {
  // Authentication hook
  const { principal, isAuthenticated } = useAuth();
  
  // State Management
  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab);
  
  // Data Management Hook
  const {
    data,
    metrics,
    config,
    webhooks,
    isLoading,
    isRefreshing,
    error,
    hasError,
    refetch,
    clearError,
    lastRefresh,
    isUsingMockData,
    connectionStatus
  } = useICPData({
    canisterId,
    refreshInterval,
    enableAutoRefresh: true,
    fallbackToMock: true
  });

  // Loading State - only show main loading when we have no data at all
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-lg sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Developer Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* User Authentication Info */}
              {principal && (
                <Badge variant="outline" className="text-xs">
                  {principal.slice(0, 8)}...{principal.slice(-4)}
                </Badge>
              )}
              
              <Badge variant="outline" className="text-xs">
                Preview Mode
              </Badge>
              {isUsingMockData && (
                <Badge variant="secondary" className="text-xs">
                  Demo Data
                </Badge>
              )}
              <div className="flex items-center space-x-1">
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : connectionStatus === 'disconnected' ? (
                  <WifiOff className="h-4 w-4 text-red-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* User Info and Logout */}
              <div className="flex items-center space-x-2">
                <UserInfo />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                  Monitor your ICP applications, manage configurations, and track webhook performance.
                </p>
              </div>
              {lastRefresh && (
                <div className="text-sm text-muted-foreground">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            {/* Error Alert */}
            {hasError && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error?.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearError}
                    className="ml-4"
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Mock Data Notice */}
            {isUsingMockData && !hasError && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Currently displaying demo data. The dashboard will automatically switch to live data when the ICP canister connection is established.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
            <TabsList className="grid w-full grid-cols-7 lg:w-[850px]">
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="modals" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Modals</span>
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Config</span>
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center space-x-2">
                <Webhook className="h-4 w-4" />
                <span>Webhooks</span>
              </TabsTrigger>
              <TabsTrigger value="factory" className="flex items-center space-x-2">
                <Factory className="h-4 w-4" />
                <span>Factory</span>
              </TabsTrigger>
              <TabsTrigger value="discounts" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Discounts</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Subscriptions</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="mt-8">
            <TabsContent value="analytics">
                <Card className="p-6">
                  {isLoading && !metrics ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading analytics...</p>
                    </div>
                  ) : metrics ? (
                    <MetricsGrid 
                      metrics={metrics}
                      loading={isRefreshing}
                      error={hasError}
                      lastUpdated={lastRefresh}
                      isUsingMockData={isUsingMockData}
                      onRefresh={refetch}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                      <p className="text-muted-foreground">
                        Unable to load analytics data. Please try refreshing.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="config">
                <Card className="p-6">
                  {isLoading && !config ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading configuration...</p>
                    </div>
                  ) : config ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configuration Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">API Keys</h4>
                          <div className="space-y-2">
                            {config.apiKeys.slice(0, 3).map((key) => (
                              <div key={key.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                  <div className="font-medium text-sm">{key.name}</div>
                                  <div className="text-xs text-muted-foreground">{key.environment}</div>
                                </div>
                                <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                                  {key.status}
                                </Badge>
                              </div>
                            ))}
                            {config.apiKeys.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                +{config.apiKeys.length - 3} more keys
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium">Canister Endpoints</h4>
                          <div className="space-y-2">
                            {config.canisterEndpoints.slice(0, 3).map((endpoint) => (
                              <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                  <div className="font-medium text-sm">{endpoint.name}</div>
                                  <div className="text-xs text-muted-foreground">{endpoint.environment}</div>
                                </div>
                                <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                                  {endpoint.status}
                                </Badge>
                              </div>
                            ))}
                            {config.canisterEndpoints.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                +{config.canisterEndpoints.length - 3} more endpoints
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Full configuration interface will be implemented in upcoming tasks...
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Configuration Data</h3>
                      <p className="text-muted-foreground">
                        Unable to load configuration. Please try refreshing.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="webhooks">
                <Card className="p-6">
                  {isLoading && !webhooks ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading webhooks...</p>
                    </div>
                  ) : webhooks && webhooks.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Webhooks</h3>
                        <Badge variant="outline">{webhooks.length} configured</Badge>
                      </div>
                      <div className="space-y-4">
                        {webhooks.map((webhook) => (
                          <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{webhook.name}</h4>
                                <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                                  {webhook.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {webhook.url}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Events: {webhook.events.join(', ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {webhook.successRate.toFixed(1)}% success
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {webhook.responseTime.toFixed(0)}ms avg
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Full webhook management interface will be implemented in upcoming tasks...
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Webhooks Configured</h3>
                      <p className="text-muted-foreground">
                        Set up webhooks to receive real-time notifications about events.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="modals">
                <ModalBuilderTab />
              </TabsContent>

              <TabsContent value="factory">
                <FactoryTab />
              </TabsContent>

              <TabsContent value="discounts">
                <DiscountTab />
              </TabsContent>

              <TabsContent value="subscriptions">
                <SubscriptionTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default withAuth(Dashboard);
