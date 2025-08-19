// src/components/product/ProductTab.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFactory } from '@/hooks/useFactory';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, AlertCircle, Package, BarChart3 } from 'lucide-react';

interface ProductTabProps {
  products?: any[];
  selectedCanister?: any;
  isLoading?: boolean;
}

export const ProductTab: React.FC<ProductTabProps> = ({ 
  products: propProducts = [],
  selectedCanister,
  isLoading: parentLoading = false 
}) => {
  const { isAuthenticated } = useAuth();
  
  // ✅ REUSE factory state instead of refetching (State Reuse Pattern)
  const { data: factoryData, isLoading: factoryLoading, error: factoryError } = useFactory();
  const userCanisters = factoryData?.userCanisters || [];
  
  // ✅ Local state only for UI-specific concerns
  const [selectedCanisterId, setSelectedCanisterId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // ✅ Auto-select first canister when factory data loads
  useEffect(() => {
    if (!selectedCanisterId && userCanisters.length > 0) {
      setSelectedCanisterId(userCanisters[0].id.toText());
    }
  }, [userCanisters, selectedCanisterId]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to manage products.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (factoryLoading) {
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
            You need to create a payment canister first to manage products.
          </p>
          <p className="text-sm text-muted-foreground">
            Go to the Factory tab to create your first payment canister.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Canister Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">
            Create and manage products for your payment canister
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
            disabled={!selectedCanisterId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </div>
      </div>

      {selectedCanisterId && (
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>My Products</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Active Products</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Sales Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Product listing will go here */}
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first product to start selling.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {/* Active products will go here */}
            <Card>
              <CardHeader>
                <CardTitle>Active Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Products</h3>
                  <p className="text-muted-foreground mb-4">
                    Activate products to make them available for purchase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Product analytics will go here */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sales Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Sales analytics will appear here once you have products and sales.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Product Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Product Form Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  The product creation form will be implemented next.
                </p>
                <Button onClick={() => setShowCreateForm(false)}>
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

export default ProductTab;
