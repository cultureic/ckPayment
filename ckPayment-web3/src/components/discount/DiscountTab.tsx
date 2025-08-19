// src/components/discount/DiscountTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFactory } from '@/hooks/useFactory';
import { useDiscount } from '@/hooks/useDiscount';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, AlertCircle } from 'lucide-react';
import { CouponCard } from './CouponCard';
import { CouponForm } from './CouponForm';
import { CouponAnalytics } from './CouponAnalytics';
import type { DiscountCoupon, CreateCouponForm } from '@/types/discount';

interface DiscountTabProps {
  coupons?: any[];
  selectedCanister?: any;
  isLoading?: boolean;
}

export const DiscountTab: React.FC<DiscountTabProps> = ({ 
  coupons = [],
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
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  
  // ✅ Auto-select first canister when factory data loads or use provided canister
  useEffect(() => {
    if (selectedCanister && !selectedCanisterId) {
      setSelectedCanisterId(selectedCanister.id.toText());
    } else if (!selectedCanisterId && userCanisters.length > 0) {
      setSelectedCanisterId(userCanisters[0].id.toText());
    }
  }, [userCanisters, selectedCanisterId, selectedCanister]);
  
  // ✅ Feature-specific hook using shared context - get selectedCanister from props or factory fallback
  const currentSelectedCanister = selectedCanister || (selectedCanisterId ? userCanisters.find(c => c.id.toText() === selectedCanisterId) : null);
  
  // Use the new hook signature with selectedCanister and preloaded data
  const discountHook = useDiscount({
    selectedCanister: currentSelectedCanister,
    preloadedCoupons: coupons, // Use preloaded data from props
    autoFetch: isAuthenticated && !!currentSelectedCanister
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to manage discount coupons.
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
            You need to create a payment canister first to manage discount coupons.
          </p>
          <p className="text-sm text-muted-foreground">
            Go to the Factory tab to create your first payment canister.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateCoupon = async (couponData: CreateCouponForm) => {
    const result = await discountHook.createCoupon(couponData);
    if (result.success) {
      setShowCreateForm(false);
    }
    return result;
  };

  const handleUpdateCoupon = async (couponData: CreateCouponForm) => {
    if (!editingCoupon) return { success: false, error: 'No coupon selected for editing' };
    
    const result = await discountHook.updateCoupon(editingCoupon.coupon_id, couponData);
    if (result.success) {
      setEditingCoupon(null);
    }
    return result;
  };

  const handleDeleteCoupon = async (couponId: string) => {
    return await discountHook.deleteCoupon(couponId);
  };

  const handleToggleStatus = async (couponId: string) => {
    return await discountHook.toggleCouponStatus(couponId);
  };

  // Get supported tokens from the selected canister
  const supportedTokens = useMemo(() => {
    if (!selectedCanisterId) {
      return ['ICP']; // Default fallback
    }
    
    const selectedCanister = userCanisters.find(
      canister => canister.id.toText() === selectedCanisterId
    );
    
    if (!selectedCanister || !selectedCanister.supported_tokens) {
      return ['ICP']; // Default fallback
    }
    
    const activeTokens = selectedCanister.supported_tokens
      .filter(token => token.is_active)
      .map(token => token.symbol);
      
    return activeTokens.length > 0 ? activeTokens : ['ICP'];
  }, [selectedCanisterId, userCanisters]);

  return (
    <div className="space-y-6">
      {/* Header with Canister Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discount Coupons</h2>
          <p className="text-muted-foreground">
            Create and manage discount coupons for your payment canister
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
            disabled={!selectedCanisterId || discountHook.loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {discountHook.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {discountHook.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Info */}
      <div className="text-sm text-muted-foreground space-y-1 p-4 border rounded">
        <div>Selected Canister ID: {selectedCanisterId || 'None'}</div>
        <div>User Canisters: {userCanisters.length}</div>
        <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>Factory Loading: {factoryLoading ? 'Yes' : 'No'}</div>
        <div>Parent Loading: {parentLoading ? 'Yes' : 'No'}</div>
        <div>Discount Hook Loading: {discountHook.loading ? 'Yes' : 'No'}</div>
        <div>Discount Hook Error: {discountHook.error || 'None'}</div>
      </div>

      {selectedCanisterId && (
        <Tabs defaultValue="coupons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="coupons">My Coupons</TabsTrigger>
            <TabsTrigger value="active">Active Coupons</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons" className="space-y-4">
            {discountHook.loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : discountHook.coupons.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No Coupons Created</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first discount coupon to attract customers.
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Coupon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Found {discountHook.coupons.length} Coupons</h3>
                    <p className="text-muted-foreground mb-4">
                      Coupons list will be displayed here. CouponCard component temporarily disabled for debugging.
                    </p>
                    <div className="text-sm text-left space-y-2">
                      {discountHook.coupons.map((coupon, index) => (
                        <div key={index} className="p-2 border rounded">
                          <div>Code: {coupon.code || 'N/A'}</div>
                          <div>Description: {coupon.description || 'N/A'}</div>
                          <div>Active: {coupon.is_active ? 'Yes' : 'No'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {discountHook.loading ? (
              <div>Loading active coupons...</div>
            ) : discountHook.activeCoupons.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No Active Coupons</h3>
                    <p className="text-muted-foreground">
                      No coupons are currently active and available for use.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Found {discountHook.activeCoupons.length} Active Coupons</h3>
                    <p className="text-muted-foreground mb-4">
                      Active coupons will be displayed here. CouponCard component temporarily disabled for debugging.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                  <p className="text-muted-foreground">
                    Coupon analytics will be displayed here. CouponAnalytics component temporarily disabled for debugging.
                  </p>
                  {discountHook.analytics && (
                    <div className="text-sm text-left mt-4">
                      <div>Analytics object exists: Yes</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Form Modal - Temporarily disabled for debugging */}
      {(showCreateForm || editingCoupon) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Create/Edit Coupon Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Form Temporarily Disabled</h3>
                <p className="text-muted-foreground mb-4">
                  CouponForm component temporarily disabled for debugging.
                </p>
                <Button onClick={() => {
                  setShowCreateForm(false);
                  setEditingCoupon(null);
                }}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
