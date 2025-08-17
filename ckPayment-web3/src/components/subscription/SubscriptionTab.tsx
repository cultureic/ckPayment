// src/components/subscription/SubscriptionTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard } from 'lucide-react';

const SubscriptionTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <p className="text-muted-foreground">
          Manage subscription plans and customer subscriptions
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Subscription System Coming Soon</h3>
            <p className="text-muted-foreground">
              The subscription management system is currently being implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
