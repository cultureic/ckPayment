// src/components/subscription/SubscriptionTab.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFactory } from '@/hooks/useFactory';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { SubscriptionCard } from './SubscriptionCard';
import { PlanForm } from './PlanForm';
import { SubscriptionAnalytics } from './SubscriptionAnalytics';
import { BillingHistory } from './BillingHistory';
import type { SubscriptionPlan, CreateSubscriptionPlanForm } from '@/types/subscription';

interface SubscriptionTabProps {
  subscriptions?: any[];
  subscriptionPlans?: any[];
  selectedCanister?: any;
  isLoading?: boolean;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  subscriptions = [],
  subscriptionPlans = [],
  selectedCanister,
  isLoading: parentLoading = false
}) => {
  const { isAuthenticated } = useAuth();
  
  // ✅ FALLBACK to factory hook only if props not provided (backward compatibility)
  const { data: factoryData, isLoading: factoryLoading, error: factoryError } = useFactory();
  const userCanisters = factoryData?.userCanisters || [];
  
  // ✅ Local state only for UI-specific concerns
  const [selectedCanisterId, setSelectedCanisterId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  
  // ✅ Auto-select first canister when factory data loads or use provided canister
  useEffect(() => {
    if (selectedCanister && !selectedCanisterId) {
      setSelectedCanisterId(selectedCanister.id.toText());
    } else if (!selectedCanisterId && userCanisters.length > 0) {
      setSelectedCanisterId(userCanisters[0].id.toText());
    }
  }, [userCanisters, selectedCanisterId, selectedCanister]);
  
  // ✅ Feature-specific hook only for subscription operations
  const subscriptionHook = useSubscription({ 
    canisterId: selectedCanisterId || '',
    autoFetch: isAuthenticated && !!selectedCanisterId
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to manage subscriptions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (factoryLoading || parentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading canisters...</p>
        </div>
      </div>
    );
  }

  if (factoryError) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading canisters: {factoryError}</AlertDescription>
      </Alert>
    );
  }

  if (userCanisters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Payment Canisters Found</h3>
          <p className="text-muted-foreground mb-4">
            You need to create a payment canister first to manage subscriptions.
          </p>
          <p className="text-sm text-muted-foreground">
            Go to the Factory tab to create your first payment canister.
          </p>
        </div>
      </div>
    );
  }

  const handleCreatePlan = async (planData: CreateSubscriptionPlanForm) => {
    const result = await subscriptionHook.createPlan(planData);
    if (result.success) {
      setShowCreateForm(false);
    }
    return result;
  };

  const handleUpdatePlan = async (planData: CreateSubscriptionPlanForm) => {
    if (!editingPlan) return { success: false, error: 'No plan selected for editing' };
    
    const result = await subscriptionHook.updatePlan(editingPlan.plan_id, planData);
    if (result.success) {
      setEditingPlan(null);
    }
    return result;
  };

  const handleDeletePlan = async (planId: string) => {
    return await subscriptionHook.deletePlan(planId);
  };

  const handleTogglePlanStatus = async (planId: string) => {
    return await subscriptionHook.togglePlanStatus(planId);
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: 'pause' | 'resume' | 'cancel', immediately = false) => {
    switch (action) {
      case 'pause':
        return await subscriptionHook.pauseSubscription(subscriptionId);
      case 'resume':
        return await subscriptionHook.resumeSubscription(subscriptionId);
      case 'cancel':
        return await subscriptionHook.cancelSubscription(subscriptionId, immediately);
    }
  };

  // Get supported tokens from config
  const supportedTokens = userCanisters.find(c => c.id.toText() === selectedCanisterId)
    ?.supported_tokens?.map(t => t.symbol) || ['ICP'];

  return (
    <div className="space-y-6">
      {/* Header with Canister Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground">
            Create subscription plans and manage customer subscriptions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="min-w-[200px]">
            <Select value={selectedCanisterId || ""} onValueChange={setSelectedCanisterId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a canister" />
              </SelectTrigger>
              <SelectContent>
                {userCanisters.map((canister) => (
                  <SelectItem key={canister.id.toText()} value={canister.id.toText()}>
                    {canister.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={!selectedCanisterId || subscriptionHook.loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {subscriptionHook.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {subscriptionHook.error}
          </AlertDescription>
        </Alert>
      )}

      {selectedCanisterId && (
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            {subscriptionHook.loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : subscriptionHook.plans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No Subscription Plans Created</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first subscription plan to offer recurring services.
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptionHook.plans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.plan_id}
                    plan={plan}
                    onEdit={(plan) => setEditingPlan(plan)}
                    onDelete={handleDeletePlan}
                    onToggleStatus={handleTogglePlanStatus}
                    isLoading={subscriptionHook.loading}
                    formatBillingInterval={subscriptionHook.formatBillingInterval}
                    formatPrice={subscriptionHook.formatPrice}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            {subscriptionHook.loading ? (
              <div>Loading subscriptions...</div>
            ) : subscriptionHook.userSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
                    <p className="text-muted-foreground">
                      No customers have subscribed to your plans yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptionHook.userSubscriptions.map((subscription) => {
                  const plan = subscriptionHook.plans.find(p => p.plan_id === subscription.plan_id);
                  return (
                    <SubscriptionCard
                      key={subscription.subscription_id}
                      subscription={subscription}
                      plan={plan}
                      onPause={(id) => handleSubscriptionAction(id, 'pause')}
                      onResume={(id) => handleSubscriptionAction(id, 'resume')}
                      onCancel={(id, immediately) => handleSubscriptionAction(id, 'cancel', immediately)}
                      isLoading={subscriptionHook.loading}
                      canPause={subscriptionHook.canPause}
                      canResume={subscriptionHook.canResume}
                      canCancel={subscriptionHook.canCancel}
                      isTrialActive={subscriptionHook.isTrialActive}
                      isPaymentDue={subscriptionHook.isPaymentDue}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {subscriptionHook.analytics && (
              <SubscriptionAnalytics
                analytics={subscriptionHook.analytics}
                plans={subscriptionHook.plans}
                subscriptions={subscriptionHook.subscriptions}
                isLoading={subscriptionHook.loading}
              />
            )}
          </TabsContent>

          <TabsContent value="billing">
            <BillingHistory
              payments={subscriptionHook.payments}
              isLoading={subscriptionHook.loading}
              onFetchPayments={subscriptionHook.fetchPayments}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingPlan) && (
        <PlanForm
          plan={editingPlan || undefined}
          onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPlan(null);
          }}
          isLoading={subscriptionHook.loading}
          supportedTokens={supportedTokens}
        />
      )}
    </div>
  );
};

export default SubscriptionTab;
