import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import userPaymentService, { TokenConfig as ServiceTokenConfig } from '@/services/user-payment-service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
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
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import TokenIcon from '@/components/TokenIcon';

interface Token {
  symbol: string;
  name: string;
  decimals: number;
  canister_id: string | Principal;
  fee: number | bigint;
  logo?: string | null;
  is_active: boolean;
}

interface TokenManagerProps {
  canister: {
    id: { toText(): string };
    name: string;
    supported_tokens: Token[];
  };
  onRefresh?: () => void;
}

// Helper function to validate Principal ID format
function isValidPrincipal(principalText: string): boolean {
  try {
    Principal.fromText(principalText);
    return true;
  } catch {
    return false;
  }
}

export function TokenManager({ canister, onRefresh }: TokenManagerProps) {
  const { identity, isAuthenticated } = useAuth();
  
  // Convert supported_tokens to ensure consistent format
  const normalizeTokens = (inputTokens: any[]): Token[] => {
    return inputTokens.map(token => ({
      symbol: token.symbol,
      name: token.name,
      decimals: Number(token.decimals),
      canister_id: typeof token.canister_id === 'string' 
        ? token.canister_id 
        : token.canister_id.toText ? token.canister_id.toText() : token.canister_id,
      fee: typeof token.fee === 'bigint' ? Number(token.fee) : Number(token.fee),
      logo: Array.isArray(token.logo) ? (token.logo.length > 0 ? token.logo[0] : null) : token.logo,
      is_active: token.is_active
    }));
  };

  const [tokens, setTokens] = useState<Token[]>(normalizeTokens(canister.supported_tokens));
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [newToken, setNewToken] = useState<Partial<Token>>({
    symbol: '',
    name: '',
    decimals: 8,
    canister_id: '',
    fee: 10,
    is_active: true
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAddToken = async () => {
    if (!newToken.symbol || !newToken.name || !newToken.canister_id) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    // Check for duplicates
    if (tokens.some(t => t.symbol.toLowerCase() === newToken.symbol?.toLowerCase())) {
      showMessage('A token with this symbol already exists', 'error');
      return;
    }

    setLoading('add');
    try {
      console.log('Add token - isAuthenticated:', isAuthenticated, 'isInitialized:', isInitialized);
      console.log('Canister ID to call:', canister.id.toText());
      
      // ALWAYS try real backend integration first
      console.log('Attempting real backend integration for canister:', canister.id.toText());
      
      // Initialize service if needed
      if (!isInitialized && isAuthenticated && identity) {
        console.log('Service not initialized, initializing now...');
        const initialized = await userPaymentService.initialize(identity);
        setIsInitialized(initialized);
        if (!initialized) {
          showMessage('Failed to initialize payment service', 'error');
          return;
        }
      }
      
      let canisterPrincipal;
      try {
        canisterPrincipal = Principal.fromText(newToken.canister_id as string);
      } catch (principalError) {
        showMessage(`Invalid canister ID format: ${newToken.canister_id}`, 'error');
        return;
      }

      const tokenConfig = {
        symbol: newToken.symbol!,
        name: newToken.name!,
        decimals: newToken.decimals || 8,
        canister_id: canisterPrincipal,
        fee: BigInt(newToken.fee || 10),
        logo: newToken.logo ? [newToken.logo] : [],
        is_active: newToken.is_active !== false
      };

      console.log('Calling userPaymentService.addSupportedToken with:', tokenConfig);
      const result = await userPaymentService.addSupportedToken(
        canister.id.toText(), 
        tokenConfig
      );
      console.log('Backend call result:', result);
      
      if (result.success) {
        // Refresh tokens from backend
        await refreshTokens();
        
        setNewToken({
          symbol: '',
          name: '',
          decimals: 8,
          canister_id: '',
          fee: 10,
          is_active: true
        });
        setIsAddingToken(false);
        showMessage('Token added successfully', 'success');
        onRefresh?.();
      } else {
        showMessage(result.error || 'Failed to add token', 'error');
      }
    } catch (err) {
      console.error('Error adding token:', err);
      showMessage('Failed to add token: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveToken = async (symbol: string) => {
    if (tokens.length <= 1) {
      showMessage('Cannot remove the last token. At least one token must remain.', 'error');
      return;
    }

    setLoading(`remove-${symbol}`);
    try {
      // Check if this is a real canister ID (not demo)
      const canisterIdText = canister.id.toText();
      const isDemoCanister = canisterIdText.startsWith('rdmx6-') || canisterIdText.startsWith('rrkah-');
      
      if (isDemoCanister && (!isAuthenticated || !isInitialized)) {
        // Demo mode - local simulation
        setTokens(tokens.filter(t => t.symbol !== symbol));
        showMessage('Token removed successfully (Demo Mode)', 'success');
        onRefresh?.();
        return;
      }

      const result = await userPaymentService.removeSupportedToken(
        canister.id.toText(), 
        symbol
      );
      
      if (result.success) {
        // Refresh tokens from backend
        await refreshTokens();
        showMessage('Token removed successfully', 'success');
        onRefresh?.();
      } else {
        showMessage(result.error || 'Failed to remove token', 'error');
      }
    } catch (err) {
      console.error('Error removing token:', err);
      showMessage('Failed to remove token: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleToken = async (symbol: string) => {
    setLoading(`toggle-${symbol}`);
    try {
      // Check if this is a real canister ID (not demo)
      const canisterIdText = canister.id.toText();
      const isDemoCanister = canisterIdText.startsWith('rdmx6-') || canisterIdText.startsWith('rrkah-');
      
      if (isDemoCanister && (!isAuthenticated || !isInitialized)) {
        // Demo mode - local simulation
        setTokens(tokens.map(t => 
          t.symbol === symbol ? { ...t, is_active: !t.is_active } : t
        ));
        const currentToken = tokens.find(t => t.symbol === symbol);
        showMessage(`Token ${currentToken?.is_active ? 'deactivated' : 'activated'} successfully (Demo Mode)`, 'success');
        onRefresh?.();
        return;
      }

      const result = await userPaymentService.toggleTokenStatus(
        canister.id.toText(), 
        symbol
      );
      
      if (result.success && result.newStatus !== undefined) {
        // Refresh tokens from backend
        await refreshTokens();
        showMessage(`Token ${result.newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        onRefresh?.();
      } else {
        showMessage(result.error || 'Failed to toggle token status', 'error');
      }
    } catch (err) {
      console.error('Error toggling token status:', err);
      showMessage('Failed to toggle token status: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateToken = async (symbol: string, updates: Partial<Token>) => {
    setLoading(`update-${symbol}`);
    try {
      // Find the existing token to merge updates
      const existingToken = tokens.find(t => t.symbol === symbol);
      if (!existingToken) {
        showMessage('Token not found', 'error');
        return;
      }

      // Check if this is a real canister ID (not demo)
      const canisterIdText = canister.id.toText();
      const isDemoCanister = canisterIdText.startsWith('rdmx6-') || canisterIdText.startsWith('rrkah-');
      
      if (isDemoCanister && (!isAuthenticated || !isInitialized)) {
        // Demo mode - local simulation
        setTokens(tokens.map(t => 
          t.symbol === symbol ? { ...t, ...updates } : t
        ));
        setEditingToken(null);
        showMessage('Token updated successfully (Demo Mode)', 'success');
        onRefresh?.();
        return;
      }

      // Prepare updated token config for backend
      const logoValue = updates.logo !== undefined ? updates.logo : existingToken.logo;
      const updatedTokenConfig = {
        symbol: existingToken.symbol,
        name: updates.name || existingToken.name,
        decimals: updates.decimals !== undefined ? updates.decimals : existingToken.decimals,
        canister_id: typeof existingToken.canister_id === 'string' 
          ? Principal.fromText(existingToken.canister_id)
          : existingToken.canister_id as Principal,
        fee: BigInt(updates.fee !== undefined ? updates.fee : existingToken.fee),
        logo: logoValue ? [logoValue] : [],
        is_active: updates.is_active !== undefined ? updates.is_active : existingToken.is_active
      };

      const result = await userPaymentService.updateSupportedToken(
        canister.id.toText(), 
        symbol, 
        updatedTokenConfig
      );
      
      if (result.success) {
        // Refresh tokens from backend
        await refreshTokens();
        setEditingToken(null);
        showMessage('Token updated successfully', 'success');
        onRefresh?.();
      } else {
        showMessage(result.error || 'Failed to update token', 'error');
      }
    } catch (err) {
      console.error('Error updating token:', err);
      showMessage('Failed to update token: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setLoading(null);
    }
  };

  const copyCanisterId = async (canisterId: string) => {
    try {
      await navigator.clipboard.writeText(canisterId);
      showMessage('Canister ID copied to clipboard', 'success');
    } catch (err) {
      showMessage('Failed to copy canister ID', 'error');
    }
  };

  // Initialize user payment service and refresh tokens
  const refreshTokens = async () => {
    try {
      if (isAuthenticated && identity && isInitialized) {
        const latestTokens = await userPaymentService.getSupportedTokens(canister.id.toText());
        setTokens(normalizeTokens(latestTokens));
      } else {
        // Stay in demo mode - keep existing tokens
        console.log('Staying in demo mode, keeping existing tokens');
      }
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      // On error, keep existing tokens
    }
  };

  // Initialize service and load tokens
  useEffect(() => {
    const initializeService = async () => {
      if (isAuthenticated && identity && !isInitialized) {
        console.log('Initializing user payment service...');
        const initialized = await userPaymentService.initialize(identity);
        setIsInitialized(initialized);
        
        if (initialized) {
          // Try to load fresh tokens from the backend
          await refreshTokens();
        }
      } else if (isAuthenticated && identity && isInitialized) {
        // Service already initialized, just refresh tokens
        console.log('Service already initialized, refreshing tokens...');
        await refreshTokens();
      }
    };

    initializeService();
  }, [isAuthenticated, identity, isInitialized, canister.id.toText()]);

  // Reset tokens to initial state when canister prop changes
  useEffect(() => {
    console.log('Canister prop changed, resetting tokens to initial state');
    setTokens(normalizeTokens(canister.supported_tokens));
  }, [canister.id.toText()]);

  // Debug output
  useEffect(() => {
    console.log('TokenManager rendered with canister:', canister);
    console.log('Normalized tokens:', tokens);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Service initialized:', isInitialized);
  }, [canister, tokens, isAuthenticated, isInitialized]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Token Management</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage supported tokens for {canister.name}
          </p>
        </div>
<div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTokens}
            disabled={loading === 'refresh'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading === 'refresh' ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsAddingToken(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Token
          </Button>
        </div>
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

      {/* Add Token Form */}
      {isAddingToken && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Add New Token</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingToken(false);
                setNewToken({
                  symbol: '',
                  name: '',
                  decimals: 8,
                  canister_id: '',
                  fee: 10,
                  is_active: true
                });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Token Symbol *</Label>
              <Input
                id="symbol"
                value={newToken.symbol || ''}
                onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value.toUpperCase() })}
                placeholder="e.g., ckBTC"
                maxLength={10}
              />
            </div>
            
            <div>
              <Label htmlFor="name">Token Name *</Label>
              <Input
                id="name"
                value={newToken.name || ''}
                onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                placeholder="e.g., Chain Key Bitcoin"
              />
            </div>
            
            <div>
              <Label htmlFor="canister_id">Canister ID *</Label>
              <Input
                id="canister_id"
                value={newToken.canister_id || ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setNewToken({ ...newToken, canister_id: value });
                }}
                placeholder="e.g., mxzaz-hqaaa-aaaar-qaada-cai"
                className={newToken.canister_id && newToken.canister_id.length > 10 && !isValidPrincipal(newToken.canister_id as string) ? 'border-red-500' : ''}
              />
              {newToken.canister_id && newToken.canister_id.length > 10 && !isValidPrincipal(newToken.canister_id as string) && (
                <p className="text-xs text-red-600 mt-1">Invalid canister ID format. Should be like: mxzaz-hqaaa-aaaar-qaada-cai</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                type="number"
                value={newToken.decimals || 8}
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
                value={newToken.fee || 10}
                onChange={(e) => setNewToken({ ...newToken, fee: parseInt(e.target.value) })}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="logo">Logo URL (optional)</Label>
              <Input
                id="logo"
                value={newToken.logo || ''}
                onChange={(e) => setNewToken({ ...newToken, logo: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingToken(false);
                setNewToken({
                  symbol: '',
                  name: '',
                  decimals: 8,
                  canister_id: '',
                  fee: 10,
                  is_active: true
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToken}
              disabled={loading === 'add'}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading === 'add' ? 'Adding...' : 'Add Token'}
            </Button>
          </div>
        </Card>
      )}

      {/* Token List */}
      <div className="space-y-3">
        {tokens.map((token) => (
          <Card key={token.symbol} className="p-4">
            {editingToken === token.symbol ? (
              /* Edit Mode */
              <EditTokenForm
                token={token}
                onSave={(updates) => handleUpdateToken(token.symbol, updates)}
                onCancel={() => setEditingToken(null)}
                loading={loading === `update-${token.symbol}`}
              />
            ) : (
              /* View Mode */
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <TokenIcon 
                      tokenCanisterId={String(token.canister_id)}
                      size="w-8 h-8"
                      showFallback={true}
                    />
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium">{token.symbol}</h5>
                        <Badge variant={token.is_active ? 'default' : 'secondary'}>
                          {token.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{token.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>Decimals: {token.decimals}</span>
                        <span>Fee: {token.fee}</span>
                        <div className="flex items-center space-x-1">
                          <span>ID: {String(token.canister_id).slice(0, 8)}...</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCanisterId(String(token.canister_id))}
                            className="p-0 h-auto"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
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
                    onClick={() => window.open(`https://${String(token.canister_id)}.icp0.io/`, '_blank')}
                    title="View token canister"
                  >
                    <ExternalLink className="h-4 w-4" />
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
            )}
          </Card>
        ))}
      </div>
      
      {tokens.length === 0 && (
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
}

// Edit Token Form Component
function EditTokenForm({ 
  token, 
  onSave, 
  onCancel, 
  loading 
}: { 
  token: Token; 
  onSave: (updates: Partial<Token>) => void; 
  onCancel: () => void; 
  loading: boolean; 
}) {
  const [formData, setFormData] = useState({
    name: token.name,
    decimals: token.decimals,
    fee: token.fee,
    logo: token.logo || ''
  });

  const handleSave = () => {
    const updates: Partial<Token> = {};
    if (formData.name !== token.name) updates.name = formData.name;
    if (formData.decimals !== token.decimals) updates.decimals = formData.decimals;
    if (formData.fee !== token.fee) updates.fee = formData.fee;
    if (formData.logo !== (token.logo || '')) updates.logo = formData.logo;
    
    onSave(updates);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="edit-name">Token Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-decimals">Decimals</Label>
          <Input
            id="edit-decimals"
            type="number"
            value={formData.decimals}
            onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
            min="0"
            max="18"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-fee">Transaction Fee</Label>
          <Input
            id="edit-fee"
            type="number"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) })}
            min="0"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-logo">Logo URL</Label>
          <Input
            id="edit-logo"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export default TokenManager;
