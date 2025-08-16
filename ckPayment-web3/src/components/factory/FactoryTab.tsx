import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Plus, 
  Settings,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Database,
  Activity,
  Rocket,
  Coins,
  Zap,
  User,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeploymentDialog } from './DeploymentDialog';
import { TokenManager } from './TokenManager';
import { useFactory } from '@/hooks/useFactory';
import { useAuth } from '@/hooks/useAuth';
import userPaymentService from '@/services/user-payment-service';

export function FactoryTab() {
  const {
    data,
    isLoading,
    isDeploying,
    error,
    deployCanister,
    refreshData,
    clearError,
    lastRefresh,
    isInitialized
  } = useFactory();
  
  const { isAuthenticated, principal, identity } = useAuth();
  const [selectedCanister, setSelectedCanister] = useState<any>(null);
  const [showTokenManager, setShowTokenManager] = useState(false);
  const [liveTokenData, setLiveTokenData] = useState<{[key: string]: any[]}>({});
  const [tokenServiceInitialized, setTokenServiceInitialized] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Initialize user payment service when identity is available
  useEffect(() => {
    const initializeTokenService = async () => {
      if (identity && !tokenServiceInitialized) {
        try {
          await userPaymentService.initialize(identity);
          setTokenServiceInitialized(true);
        } catch (error) {
          console.error('Failed to initialize user payment service:', error);
        }
      }
    };
    initializeTokenService();
  }, [identity, tokenServiceInitialized]);

  // Fetch live token data for all user canisters
  const fetchLiveTokenData = React.useCallback(async () => {
    if (!data?.userCanisters || !tokenServiceInitialized || isLoadingTokens) {
      return;
    }

    setIsLoadingTokens(true);
    const newTokenData: {[key: string]: any[]} = {};

    try {
      // Fetch tokens for each canister
      await Promise.all(
        data.userCanisters.map(async (canister) => {
          try {
            const canisterId = canister.id.toText();
            const tokens = await userPaymentService.getSupportedTokens(canisterId);
            newTokenData[canisterId] = tokens;
          } catch (error) {
            console.error(`Failed to fetch tokens for canister ${canister.id.toText()}:`, error);
            // Fallback to cached data
            newTokenData[canister.id.toText()] = canister.supported_tokens;
          }
        })
      );

      setLiveTokenData(newTokenData);
    } catch (error) {
      console.error('Error fetching live token data:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  }, [data?.userCanisters, tokenServiceInitialized]);

  useEffect(() => {
    if (!isLoadingTokens) {
      fetchLiveTokenData();
    }
  }, [fetchLiveTokenData, isLoadingTokens]);

  const handleCopyCanisterId = async (canisterId: string) => {
    try {
      await navigator.clipboard.writeText(canisterId);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy canister ID:', err);
    }
  };

  const handleManageTokens = (canister: any) => {
    console.log('Opening token manager for canister:', canister);
    setSelectedCanister(canister);
    setShowTokenManager(true);
  };

  const handleCloseTokenManager = () => {
    setShowTokenManager(false);
    setSelectedCanister(null);
  };

  if (isLoading && !data) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading factory data...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Factory className="h-5 w-5" />
            <span>Payment Factory</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Deploy and manage payment processing canisters
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isInitialized && (
            <Badge variant="secondary" className="text-xs">
              Demo Mode
            </Badge>
          )}
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* User Summary */}
      {isAuthenticated && principal && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Payment Infrastructure</h3>
              <p className="text-muted-foreground">
                You have <strong>{data?.userCanisters?.length || 0}</strong> payment canister{(data?.userCanisters?.length || 0) !== 1 ? 's' : ''} deployed and ready.
              </p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-muted/30 rounded-lg border">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">
                {principal.slice(0, 8)}...{principal.slice(-4)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Factory Stats */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {Number(data.stats.total_canisters)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Contracts
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {Number(data.stats.active_canisters)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Contracts
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {Number(data.stats.total_users)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Users
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  v{Number(data.stats.current_version)}.0
                </div>
                <div className="text-sm text-muted-foreground">
                  Latest Version
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content - Changes based on user's canister count */}
      {!data?.userCanisters || data.userCanisters.length === 0 ? (
        /* First-time user guidance */
        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">🚀 Welcome to Payment Factory</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              You don't have any payment contracts yet. Let's get you started with your first deployment!
            </p>
          </div>
          
          {/* Step-by-step guidance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold mb-2">Deploy Your Contract</h4>
              <p className="text-sm text-muted-foreground">
                Create your own dedicated payment processing contract with custom token support.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold mb-2">Configure Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Choose which tokens your payment system will accept (ckBTC, ICP, etc.).
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold mb-2">Start Processing</h4>
              <p className="text-sm text-muted-foreground">
                Use your contract ID to integrate payment processing into your applications.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center">
            <DeploymentDialog 
              onDeploy={deployCanister}
              isDeploying={isDeploying}
              trigger={
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isDeploying}
                >
                  <Factory className="h-5 w-5 mr-2" />
                  {isDeploying ? 'Deploying Your First Contract...' : 'Deploy Your First Payment Contract'}
                </Button>
              }
            />
            <p className="text-sm text-muted-foreground mt-3">
              Deploy in seconds, customize anytime
            </p>
          </div>
        </Card>
      ) : (
        /* Returning user interface */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Quick Actions</span>
            </h4>
            <div className="space-y-3">
              <DeploymentDialog 
                onDeploy={deployCanister}
                isDeploying={isDeploying}
                trigger={
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    disabled={isDeploying}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isDeploying ? 'Deploying...' : 'Deploy Another Contract'}
                  </Button>
                }
              />
              
              <Button className="w-full justify-start" variant="outline" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Configure Factory Settings
              </Button>
              
              <Button className="w-full justify-start" variant="outline" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Factory Analytics
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-blue-900">Factory Status</div>
                <div className="text-blue-700 mt-1">
                  {isInitialized ? 'Connected to IC Network' : 'Running in Demo Mode'}
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Deployments */}
          <Card className="p-6">
            <h4 className="font-medium mb-4">Recent Deployments</h4>
            {data?.recentDeployments && data.recentDeployments.length > 0 ? (
              <div className="space-y-3">
                {data.recentDeployments.map((deployment) => (
                  <div 
                    key={deployment.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{deployment.name}</span>
                        <Badge 
                          variant={
                            deployment.status === 'active' ? 'default' : 
                            deployment.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {deployment.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {deployment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {deployment.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                          {deployment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {deployment.created_at.toLocaleString()} • v{deployment.version}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {deployment.id.slice(0, 12)}...
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCanisterId(deployment.id)}
                        className="p-1 h-auto"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://${deployment.id}.icp0.io/`, '_blank')}
                        className="p-1 h-auto"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-sm font-medium">No recent deployments</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Deploy a contract to see it here
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* User Canisters (if any) */}
      {data?.userCanisters && data.userCanisters.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Your Payment Contracts ({data.userCanisters.length})</h4>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.userCanisters.map((canister) => (
              <div 
                key={canister.id.toText()} 
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{canister.name}</span>
                    <Badge variant={canister.is_active ? 'default' : 'secondary'}>
                      {canister.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {canister.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ID: {canister.id.toText()} • v{Number(canister.version)} • 
                    Created: {new Date(Number(canister.created_at) / 1_000_000).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <Coins className="h-3 w-3 text-muted-foreground" />
                    {(() => {
                      const canisterId = canister.id.toText();
                      const liveTokens = liveTokenData[canisterId];
                      const tokensToDisplay = liveTokens || canister.supported_tokens;
                      const tokenCount = tokensToDisplay.length;
                      const tokenSymbols = tokensToDisplay.map(t => t.symbol).join(', ');
                      
                      return (
                        <span className="text-xs text-muted-foreground">
                          {isLoadingTokens && !liveTokens ? (
                            <span className="flex items-center">
                              <div className="w-3 h-3 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin mr-1"></div>
                              Loading tokens...
                            </span>
                          ) : (
                            <>
                              {tokenCount} token{tokenCount !== 1 ? 's' : ''}: {tokenSymbols}
                              {liveTokens && <span className="text-green-600 ml-1">✓</span>}
                            </>
                          )}
                        </span>
                      );
                    })()} 
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageTokens(canister)}
                  >
                    <Coins className="h-4 w-4 mr-1" />
                    Manage Tokens
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(`https://${canister.id.toText()}.icp0.io/`, '_blank')}
                    title="View Candid Interface"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Development Notice */}
      {!isInitialized && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Demo Mode Active</div>
            <div className="mt-1">
              This Factory interface is displaying demo data. Connect with Internet Identity 
              to access real factory functionality and deploy actual payment contracts to the IC network.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Token Manager Modal */}
      {showTokenManager && selectedCanister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={handleCloseTokenManager}
          />
          <div className="relative bg-background rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Token Management</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseTokenManager}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <TokenManager 
                canister={selectedCanister}
                onRefresh={() => {
                  refreshData();
                  // Also refresh live token data
                  setLiveTokenData({});
                  fetchLiveTokenData();
                  handleCloseTokenManager();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
