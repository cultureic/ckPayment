// src/components/subscription/SubscriptionCard.tsx
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
import { 
  MoreHorizontal, 
  Pause, 
  Play, 
  X, 
  Calendar, 
  Clock, 
  CreditCard,
  User,
  AlertTriangle
} from 'lucide-react';
import type { UserSubscription, SubscriptionPlan } from '@/types/subscription';

interface SubscriptionCardProps {
  subscription: UserSubscription;
  plan?: SubscriptionPlan;
  onPause: (subscriptionId: string) => Promise<{ success: boolean; error?: string }>;
  onResume: (subscriptionId: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: (subscriptionId: string, immediately?: boolean) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  canPause: (subscription: UserSubscription) => boolean;
  canResume: (subscription: UserSubscription) => boolean;
  canCancel: (subscription: UserSubscription) => boolean;
  isTrialActive: (subscription: UserSubscription) => boolean;
  isPaymentDue: (subscription: UserSubscription) => boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  plan,
  onPause,
  onResume,
  onCancel,
  isLoading,
  canPause,
  canResume,
  canCancel,
  isTrialActive,
  isPaymentDue,
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: 'pause' | 'resume' | 'cancel', callback: () => Promise<any>) => {
    setActionLoading(action);
    try {
      await callback();
      if (action === 'cancel') {
        setShowCancelDialog(false);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';
      case 'Paused': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Expired': return 'outline';
      case 'PastDue': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (timestamp: bigint | undefined): string => {
    if (!timestamp) return 'N/A';
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  };

  const formatDateTime = (timestamp: bigint | undefined): string => {
    if (!timestamp) return 'N/A';
    return new Date(Number(timestamp) / 1_000_000).toLocaleString();
  };

  const isInTrial = isTrialActive(subscription);
  const paymentOverdue = isPaymentDue(subscription);
  const canPauseSubscription = canPause(subscription);
  const canResumeSubscription = canResume(subscription);
  const canCancelSubscription = canCancel(subscription);

  return (
    <>
      <Card className={`transition-all hover:shadow-md ${subscription.status === 'Cancelled' ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  {plan?.name || 'Unknown Plan'}
                </CardTitle>
                <Badge variant={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="font-mono text-xs">
                    {subscription.subscriber_id.toText().slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started {formatDate(subscription.created_at)}
                </div>
              </div>

              {/* Trial Badge */}
              {isInTrial && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Trial Active
                  </Badge>
                </div>
              )}

              {/* Payment Due Warning */}
              {paymentOverdue && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Payment Overdue
                  </Badge>
                </div>
              )}
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
                {canPauseSubscription && (
                  <DropdownMenuItem 
                    onClick={() => handleAction('pause', () => onPause(subscription.subscription_id))}
                    disabled={actionLoading === 'pause'}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Subscription
                  </DropdownMenuItem>
                )}
                
                {canResumeSubscription && (
                  <DropdownMenuItem 
                    onClick={() => handleAction('resume', () => onResume(subscription.subscription_id))}
                    disabled={actionLoading === 'resume'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume Subscription
                  </DropdownMenuItem>
                )}
                
                {(canPauseSubscription || canResumeSubscription) && canCancelSubscription && (
                  <DropdownMenuSeparator />
                )}
                
                {canCancelSubscription && (
                  <DropdownMenuItem 
                    onClick={() => setShowCancelDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Next Billing</div>
              <div className="font-medium">
                {subscription.next_payment_date ? 
                  formatDate(subscription.next_payment_date) : 
                  'N/A'
                }
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Current Period</div>
              <div className="font-medium">
                {subscription.current_period_end ? 
                  `Until ${formatDate(subscription.current_period_end)}` : 
                  'N/A'
                }
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {subscription.last_payment_date && (
            <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Payment</span>
              </div>
              <div className="font-medium">
                {formatDate(subscription.last_payment_date)}
              </div>
            </div>
          )}

          {/* Trial Information */}
          {isInTrial && subscription.trial_end_date && (
            <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Trial Period</span>
              </div>
              <div className="text-blue-600 mt-1">
                Ends {formatDate(subscription.trial_end_date)}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div>
              ID: {subscription.subscription_id.slice(0, 8)}...
            </div>
            <div>
              Updated {formatDateTime(subscription.updated_at)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to cancel this subscription?</p>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="cancelType"
                    checked={!cancelImmediately}
                    onChange={() => setCancelImmediately(false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    Cancel at period end ({subscription.current_period_end ? 
                      formatDate(subscription.current_period_end) : 'N/A'})
                  </span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="cancelType"
                    checked={cancelImmediately}
                    onChange={() => setCancelImmediately(true)}
                    className="text-red-600"
                  />
                  <span className="text-sm">Cancel immediately</span>
                </label>
              </div>
              
              {cancelImmediately && (
                <p className="text-sm text-red-600 font-medium">
                  Warning: Immediate cancellation will end access right away and may not provide refunds.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading === 'cancel'}>
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction('cancel', () => onCancel(subscription.subscription_id, cancelImmediately))}
              disabled={actionLoading === 'cancel'}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
