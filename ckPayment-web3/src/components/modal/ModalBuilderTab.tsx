import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Code,
  BarChart3,
  Building2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useFactory } from '@/hooks/useFactory';
import { userPaymentService } from '@/services/user-payment-service';
import type { ModalConfig } from '@/types/modal';
import ModalConfigCard from './ModalConfigCard';
import ModalBuilder from './ModalBuilder';
import ModalPreview from './ModalPreview';
import ModalAnalytics from './ModalAnalytics';

interface ModalBuilderTabProps {
  canisterId?: string;
}

const ModalBuilderTab: React.FC<ModalBuilderTabProps> = ({ 
  canisterId: propCanisterId
}) => {
  const { isAuthenticated, principal } = useAuth();
  
  // Use factory data (reuse existing state instead of refetching)
  const { data: factoryData, isLoading: factoryLoading, error: factoryError } = useFactory();
  const userCanisters = factoryData?.userCanisters || [];
  
  // Canister selection state
  const [selectedCanisterId, setSelectedCanisterId] = useState<string | null>(propCanisterId || null);
  
  // Supported tokens state
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  
  // Auto-select first canister when factory data loads
  useEffect(() => {
    if (!selectedCanisterId && userCanisters.length > 0) {
      setSelectedCanisterId(userCanisters[0].id.toText());
    }
  }, [userCanisters, selectedCanisterId]);
  
  // Modal management hook - only initialize if canister is selected
  const {
    modals,
    loading,
    error,
    analytics,
    fetchModals,
    createModal,
    updateModal,
    deleteModal,
    toggleModalStatus,
    fetchAnalytics,
    trackModalView,
    generateEmbedCode,
    refresh,
    clearError,
    getModal,
    getModalAnalytics
  } = useModal({ 
    canisterId: selectedCanisterId || '',
    autoFetch: isAuthenticated && !!selectedCanisterId
  });

  // UI state
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'preview' | 'analytics'>('list');
  const [selectedModal, setSelectedModal] = useState<ModalConfig | null>(null);
  const [embedCode, setEmbedCode] = useState<string>('');
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Load supported tokens when canister is selected
  useEffect(() => {
    const loadSupportedTokens = async () => {
      if (selectedCanisterId) {
        setLoadingTokens(true);
        try {
          await userPaymentService.initialize();
          const tokens = await userPaymentService.getSupportedTokens(selectedCanisterId);
          const tokenSymbols = tokens
            .filter(token => token.is_active)
            .map(token => token.symbol);
          setSupportedTokens(tokenSymbols);
        } catch (error) {
          console.error('Failed to load supported tokens:', error);
          // Fallback to default tokens if canister call fails
          setSupportedTokens(['ICP', 'ckBTC', 'ckETH']);
        } finally {
          setLoadingTokens(false);
        }
      } else {
        setSupportedTokens([]);
      }
    };

    loadSupportedTokens();
  }, [selectedCanisterId]);

  // Initialize
  useEffect(() => {
    if (isAuthenticated && selectedCanisterId) {
      refresh();
    }
  }, [isAuthenticated, selectedCanisterId, refresh]);

  // Handle modal selection for editing
  const handleEditModal = (modal: ModalConfig) => {
    setSelectedModal(modal);
    setActiveView('edit');
  };

  // Handle modal preview
  const handlePreviewModal = (modal: ModalConfig) => {
    setSelectedModal(modal);
    setActiveView('preview');
  };

  // Handle modal deletion
  const handleDeleteModal = async (modalId: string) => {
    if (window.confirm('Are you sure you want to delete this modal? This action cannot be undone.')) {
      const result = await deleteModal(modalId);
      if (result.success) {
        await fetchModals(); // Refresh the list
      }
    }
  };

  // Handle modal status toggle
  const handleToggleStatus = async (modalId: string) => {
    const result = await toggleModalStatus(modalId);
    if (result.success) {
      await fetchModals(); // Refresh the list
    }
  };

  // Handle embed code generation
  const handleGenerateEmbedCode = async (modalId: string) => {
    const result = await generateEmbedCode(modalId);
    if (result.success && result.data) {
      setEmbedCode(result.data);
      setShowEmbedCode(true);
    }
  };

  // Handle modal analytics view
  const handleViewAnalytics = (modal: ModalConfig) => {
    setSelectedModal(modal);
    setActiveView('analytics');
  };

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'create':
        return (
          <ModalBuilder
            supportedTokens={supportedTokens}
            onSave={async (modalData) => {
              const result = await createModal(modalData);
              if (result.success) {
                setActiveView('list');
                await fetchModals();
              }
              return result;
            }}
            onCancel={() => setActiveView('list')}
          />
        );

      case 'edit':
        return selectedModal ? (
          <ModalBuilder
            initialData={selectedModal}
            supportedTokens={supportedTokens}
            onSave={async (modalData) => {
              const result = await updateModal(selectedModal.modal_id, modalData);
              if (result.success) {
                setActiveView('list');
                await fetchModals();
              }
              return result;
            }}
            onCancel={() => setActiveView('list')}
          />
        ) : null;

      case 'preview':
        return selectedModal ? (
          <ModalPreview
            modal={selectedModal}
            onBack={() => setActiveView('list')}
            onEdit={() => handleEditModal(selectedModal)}
          />
        ) : null;

      case 'analytics':
        return selectedModal ? (
          <ModalAnalytics
            modalId={selectedModal.modal_id}
            modalName={selectedModal.name}
            analytics={getModalAnalytics(selectedModal.modal_id)}
            onBack={() => setActiveView('list')}
            onRefresh={() => fetchAnalytics(selectedModal.modal_id)}
          />
        ) : null;

      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Payment Modals</h3>
                <p className="text-muted-foreground">
                  Create and manage custom payment modal configurations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={loading || !selectedCanisterId}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setActiveView('create')}
                  disabled={loading || !selectedCanisterId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Modal
                </Button>
              </div>
            </div>
            
            {/* Canister Selection */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Select Payment Canister</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose which payment canister to configure modals for
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {factoryLoading ? (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading canisters...</span>
                      </div>
                    ) : userCanisters.length > 0 ? (
                      <Select 
                        value={selectedCanisterId || ''} 
                        onValueChange={setSelectedCanisterId}
                      >
                        <SelectTrigger className="w-80">
                          <SelectValue placeholder="Select a payment canister" />
                        </SelectTrigger>
                        <SelectContent>
                          {userCanisters.map((canister) => (
                            <SelectItem key={canister.id.toText()} value={canister.id.toText()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{canister.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {canister.id.toText()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No payment canisters found. Deploy one from the Factory tab first.
                      </div>
                    )}
                    {selectedCanisterId && (
                      <Badge variant="outline">
                        {userCanisters.find(c => c.id.toText() === selectedCanisterId)?.name || 'Selected'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearError}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && modals.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading modals...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Modals</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{modals.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {modals.filter(m => m.is_active).length} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.values(analytics).reduce((sum, a) => sum + Number(a.total_views || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across all modals
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.values(analytics).length > 0 ? 
                          (Object.values(analytics).reduce((sum, a) => sum + Number(a.conversion_rate || 0), 0) / Object.values(analytics).length).toFixed(1)
                          : '0.0'
                        }%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average across all modals
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Modals Grid */}
                {modals.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Code className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Modals Found</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Get started by creating your first payment modal configuration.
                      </p>
                      <Button onClick={() => setActiveView('create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Modal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modals.map((modal) => (
                      <ModalConfigCard
                        key={modal.modal_id}
                        modal={modal}
                        analytics={analytics[modal.modal_id]}
                        onEdit={() => handleEditModal(modal)}
                        onPreview={() => handlePreviewModal(modal)}
                        onDelete={() => handleDeleteModal(modal.modal_id)}
                        onToggleStatus={() => handleToggleStatus(modal.modal_id)}
                        onGenerateEmbed={() => handleGenerateEmbedCode(modal.modal_id)}
                        onViewAnalytics={() => handleViewAnalytics(modal)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Embed Code Modal */}
            {showEmbedCode && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Embed Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                      <code>{embedCode}</code>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(embedCode);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button onClick={() => setShowEmbedCode(false)}>
                        Done
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground text-center">
            Please authenticate to access the modal builder.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default ModalBuilderTab;
