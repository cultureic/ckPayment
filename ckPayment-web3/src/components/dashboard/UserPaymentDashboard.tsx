import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Wallet,
  Activity,
  Users,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import userPaymentService, { TokenConfig, PaymentAnalytics } from '@/services/user-payment-service';
import TokenIcon from '@/components/TokenIcon';

interface UserPaymentDashboardProps {
  canisterId: string;
}

const UserPaymentDashboard: React.FC<UserPaymentDashboardProps> = ({ canisterId }) => {
  const { identity, isAuthenticated } = useAuth();
  
  // State management
  const [tokens, setTokens] = useState<TokenConfig[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [balances, setBalances] = useState<Array<[string, bigint]>>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Token management state
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [newToken, setNewToken] = useState({
    symbol: '',
    name: '',
    decimals: 8,
    canister_id: '',
    fee: 10000n,
    logo: '',
    is_active: true
  });

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Initialize service and load data
  useEffect(() => {
    const initializeService = async () => {
      if (isAuthenticated && identity && !isInitialized) {
        console.log('Initializing user payment service...');
        const initialized = await userPaymentService.initialize(identity);
        setIsInitialized(initialized);
        
        if (initialized) {
          await loadDashboardData();
        } else {
          showMessage('Failed to initialize payment service', 'error');
        }
      }
    };

    initializeService();
  }, [isAuthenticated, identity, isInitialized, canisterId]);

  const loadDashboardData = async () => {
    if (!isInitialized) return;
    
    setLoading('dashboard');
    try {
      // Load all dashboard data in parallel
      const [tokensData, analyticsData, balancesData] = await Promise.all([
        userPaymentService.getSupportedTokens(canisterId),
        userPaymentService.getAnalytics(canisterId),
        userPaymentService.getAllBalances(canisterId)
      ]);

      setTokens(tokensData);
      setAnalytics(analyticsData);
      setBalances(balancesData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showMessage('Failed to load dashboard data', 'error');
    } finally {
      setLoading(null);
    }
  };

  const refreshData = async () => {
    await loadDashboardData();
    showMessage('Dashboard data refreshed', 'success');
  };

  // TOKEN MANAGEMENT ACTIONS
  const handleAddToken = async () => {
    if (!newToken.symbol || !newToken.name || !newToken.canister_id) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    // Check for duplicates
    if (tokens.some(t => t.symbol.toLowerCase() === newToken.symbol.toLowerCase())) {
      showMessage('A token with this symbol already exists', 'error');
      return;
    }

    setLoading('add-token');
    try {
      const tokenConfig: TokenConfig = {
        symbol: newToken.symbol,
        name: newToken.name,
        decimals: newToken.decimals,
        canister_id: Principal.fromText(newToken.canister_id),
        fee: BigInt(newToken.fee),
        logo: newToken.logo ? [newToken.logo] : [],
        is_active: newToken.is_active
      };

      const result = await userPaymentService.addSupportedToken(canisterId, tokenConfig);
      
      if (result.success) {
        await loadDashboardData(); // Refresh data
        setNewToken({
          symbol: '',
          name: '',
          decimals: 8,
          canister_id: '',
          fee: 10000n,
          logo: '',
          is_active: true
        });
        setIsAddingToken(false);
        showMessage('Token added successfully', 'success');
      } else {
        showMessage(result.error || 'Failed to add token', 'error');
      }
    } catch (err) {
      console.error('Error adding token:', err);
      showMessage('Failed to add token', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveToken = async (symbol: string) => {
    if (tokens.length <= 1) {
      showMessage('Cannot remove the last token', 'error');
      return;
    }

    setLoading(`remove-${symbol}`);
    try {
      const result = await userPaymentService.removeSupportedToken(canisterId, symbol);
      
      if (result.success) {
        await loadDashboardData(); // Refresh data
        showMessage('Token removed successfully', 'success');
      } else {
        showMessage(result.error || 'Failed to remove token', 'error');
      }
    } catch (err) {
      console.error('Error removing token:', err);
      showMessage('Failed to remove token', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleToken = async (symbol: string) => {
    setLoading(`toggle-${symbol}`);
    try {
      const result = await userPaymentService.toggleTokenStatus(canisterId, symbol);
      
      if (result.success && result.newStatus !== undefined) {
        await loadDashboardData(); // Refresh data
        showMessage(`Token ${result.newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showMessage(result.error || 'Failed to toggle token status', 'error');
      }
    } catch (err) {
      console.error('Error toggling token:', err);
      showMessage('Failed to toggle token status', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateToken = async (symbol: string, updates: Partial<TokenConfig>) => {
    setLoading(`update-${symbol}`);
    try {
      const existingToken = tokens.find(t => t.symbol === symbol);
      if (!existingToken) {
        showMessage('Token not found', 'error');
        return;
      }

      const updatedToken: TokenConfig = {
        ...existingToken,
        ...updates,
        // Ensure proper types
        canister_id: typeof updates.canister_id === 'string' 
          ? Principal.fromText(updates.canister_id)
          : updates.canister_id || existingToken.canister_id,
        fee: typeof updates.fee === 'string' || typeof updates.fee === 'number'
          ? BigInt(updates.fee)
          : updates.fee || existingToken.fee,
        logo: updates.logo !== undefined 
          ? (updates.logo ? [updates.logo as string] : [])
          : existingToken.logo
      };

      const result = await userPaymentService.updateSupportedToken(canisterId, symbol, updatedToken);
      
      if (result.success) {
        await loadDashboardData(); // Refresh data
        setEditingToken(null);
        showMessage('Token updated successfully', 'success');
      } else {
        showMessage(result.error || 'Failed to update token', 'error');
      }
    } catch (err) {
      console.error('Error updating token:', err);
      showMessage('Failed to update token', 'error');
    } finally {
      setLoading(null);
    }
  };

  // Format balance display
  const formatBalance = (balance: bigint, decimals: number = 8) => {
    const divisor = BigInt(10 ** decimals);
    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;
    return `${wholePart}.${fractionalPart.toString().padStart(decimals, '0').slice(0, 6)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please sign in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Dashboard</h2>
          <p className="text-muted-foreground">Canister ID: {canisterId}</p>
        </div>
        <Button onClick={refreshData} disabled={loading === 'dashboard'}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading === 'dashboard' ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_transactions.toString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics.success_rate * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supported Tokens</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokens.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokens.filter(t => t.is_active).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Token Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Token Management</span>
          </h3>
          <Button onClick={() => setIsAddingToken(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Token
          </Button>
        </div>

        {/* Add Token Form */}
        {isAddingToken && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Add New Token</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingToken(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symbol">Token Symbol *</Label>
                <Input
                  id="symbol"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., ckBTC"
                  maxLength={10}
                />
              </div>
              
              <div>
                <Label htmlFor="name">Token Name *</Label>
                <Input
                  id="name"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="e.g., Chain Key Bitcoin"
                />
              </div>
              
              <div>
                <Label htmlFor="canister_id">Canister ID *</Label>
                <Input
                  id="canister_id"
                  value={newToken.canister_id}
                  onChange={(e) => setNewToken({ ...newToken, canister_id: e.target.value.trim() })}
                  placeholder="e.g., mxzaz-hqaaa-aaaar-qaada-cai"
                />
              </div>
              
              <div>
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={newToken.decimals}
                  onChange={(e) => setNewToken({ ...newToken, decimals: parseInt(e.target.value) })}
                  min="0"
                  max="18"
                />
              </div>
              
              <div>
                <Label htmlFor="fee">Transaction Fee</Label>
                <Input
                  id="fee"
                  type="number"
                  value={Number(newToken.fee)}
                  onChange={(e) => setNewToken({ ...newToken, fee: BigInt(e.target.value) })}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <Input
                  id="logo"
                  value={newToken.logo}
                  onChange={(e) => setNewToken({ ...newToken, logo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddingToken(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddToken} 
                disabled={loading === 'add-token'}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading === 'add-token' ? 'Adding...' : 'Add Token'}
              </Button>
            </div>
          </Card>
        )}

        {/* Token List */}
        <div className="space-y-3">
          {tokens.map((token) => (
            <Card key={token.symbol} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TokenIcon 
                    tokenCanisterId={token.canister_id.toText()}
                    size="w-10 h-10"
                    showFallback={true}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium">{token.symbol}</h5>
                      <Badge variant={token.is_active ? 'default' : 'secondary'}>
                        {token.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>Decimals: {token.decimals}</span>
                      <span>Fee: {token.fee.toString()}</span>
                      <span>ID: {token.canister_id.toText().slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="text-right">
                    {balances.find(([symbol]) => symbol === token.symbol) && (
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatBalance(balances.find(([symbol]) => symbol === token.symbol)![1], token.decimals)}
                        </div>
                        <div className="text-muted-foreground">{token.symbol}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleToken(token.symbol)}
                    disabled={loading === `toggle-${token.symbol}`}
                    title={token.is_active ? 'Deactivate token' : 'Activate token'}
                  >
                    {token.is_active ? (
                      <EyeOff className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingToken(token.symbol)}
                    title="Edit token"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveToken(token.symbol)}
                    disabled={loading === `remove-${token.symbol}` || tokens.length <= 1}
                    className="text-red-600 hover:text-red-700"
                    title="Remove token"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {tokens.length === 0 && !loading && (
        <div className="text-center py-12">
          <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">No tokens configured</h4>
          <p className="text-muted-foreground mb-4">
            Add your first supported token to get started.
          </p>
          <Button onClick={() => setIsAddingToken(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Token
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserPaymentDashboard;
