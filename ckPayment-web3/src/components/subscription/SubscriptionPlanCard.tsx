// src/components/subscription/SubscriptionPlanCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, Clock, Users } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscription';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => Promise<{ success: boolean; error?: string }>;
  onToggleStatus: (planId: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  formatBillingInterval: (interval: any) => string;
  formatPrice: (price: bigint, token: string) => string;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading,
  formatBillingInterval,
  formatPrice,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      const result = await onDelete(plan.plan_id);
      if (result.success) {
        setShowDeleteDialog(false);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading('toggle');
    try {
      await onToggleStatus(plan.plan_id);
    } finally {
      setActionLoading(null);
    }
  };

  const isActive = plan.status === 'Active';
  const hasTrialPeriod = plan.trial_period_days && plan.trial_period_days > 0n;
  
  return (
    <>
      <Card className={`transition-all hover:shadow-md ${!isActive ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {plan.status}
                </Badge>
                {hasTrialPeriod && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {Number(plan.trial_period_days)} day trial
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  disabled={isLoading || actionLoading !== null}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(plan)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleToggleStatus}
                  disabled={actionLoading === 'toggle'}
                >
                  {isActive ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Price Display */}
          <div className="text-center py-2 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">
              {formatPrice(plan.price, plan.token_symbol)}
            </div>
            <div className="text-sm text-muted-foreground">
              per {formatBillingInterval(plan.billing_interval)}
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {plan.description}
            </p>
          )}

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-xs text-muted-foreground/80">
                    +{plan.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {Number(plan.subscriber_count || 0n)} subscribers
            </div>
            <div>
              Created {new Date(Number(plan.created_at) / 1_000_000).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{plan.name}" plan? This action cannot be undone.
              {Number(plan.subscriber_count || 0n) > 0 && (
                <span className="block mt-2 font-medium text-red-600">
                  Warning: This plan has {Number(plan.subscriber_count)} active subscribers. 
                  Deleting this plan may affect active subscriptions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === 'delete'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
