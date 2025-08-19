// src/components/subscription/PlanForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, X, AlertCircle } from 'lucide-react';
import type { SubscriptionPlan, CreateSubscriptionPlanForm } from '@/types/subscription';

// Zod validation schema
const planFormSchema = z.object({
  name: z.string()
    .min(3, 'Plan name must be at least 3 characters')
    .max(50, 'Plan name must be less than 50 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Price must be a valid positive number'),
  token_symbol: z.string()
    .min(1, 'Token symbol is required'),
  billing_interval: z.object({
    interval_type: z.enum(['Days', 'Weeks', 'Months', 'Years']),
    interval_count: z.number().min(1, 'Interval count must be at least 1'),
  }),
  trial_period_days: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, 'Trial period must be a valid number'),
  features: z.array(z.string()).optional(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  plan?: SubscriptionPlan;
  onSubmit: (data: CreateSubscriptionPlanForm) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading: boolean;
  supportedTokens: string[];
}

export const PlanForm: React.FC<PlanFormProps> = ({
  plan,
  onSubmit,
  onCancel,
  isLoading,
  supportedTokens,
}) => {
  const [features, setFeatures] = useState<string[]>(plan?.features || []);
  const [newFeature, setNewFeature] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!plan;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: plan?.name || '',
      description: plan?.description || '',
      price: plan ? (Number(plan.price) / 1e8).toString() : '',
      token_symbol: plan?.token_symbol || supportedTokens[0] || 'ICP',
      billing_interval: plan?.billing_interval || { interval_type: 'Months', interval_count: 1 },
      trial_period_days: plan?.trial_period_days ? Number(plan.trial_period_days).toString() : '',
      features: plan?.features || [],
    },
  });

  // Update form when plan changes
  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        description: plan.description || '',
        price: (Number(plan.price) / 1e8).toString(),
        token_symbol: plan.token_symbol,
        billing_interval: plan.billing_interval,
        trial_period_days: plan.trial_period_days ? Number(plan.trial_period_days).toString() : '',
        features: plan.features || [],
      });
      setFeatures(plan.features || []);
    }
  }, [plan, reset]);

  const intervalType = watch('billing_interval.interval_type');

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      setValue('features', updatedFeatures);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    setValue('features', updatedFeatures);
  };

  const onFormSubmit = async (data: PlanFormData) => {
    setSubmitError(null);
    
    try {
      // Convert form data to backend format
      const formData: CreateSubscriptionPlanForm = {
        name: data.name,
        description: data.description || '',
        price: BigInt(Math.floor(parseFloat(data.price) * 1e8)), // Convert to e8s
        token_symbol: data.token_symbol,
        billing_interval: {
          [data.billing_interval.interval_type]: BigInt(data.billing_interval.interval_count)
        },
        trial_period_days: data.trial_period_days ? BigInt(parseInt(data.trial_period_days)) : 0n,
        features: features.length > 0 ? features : [],
      };

      const result = await onSubmit(formData);
      
      if (!result.success) {
        setSubmitError(result.error || 'Failed to save subscription plan');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred');
      console.error('Plan form submission error:', error);
    }
  };

  const getIntervalOptions = () => {
    const options: { [key: string]: string } = {
      'Days': 'day(s)',
      'Weeks': 'week(s)',
      'Months': 'month(s)',
      'Years': 'year(s)',
    };
    return options;
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Premium Plan"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this plan includes..."
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Token */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                {...register('price')}
                placeholder="10.00"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Token *</Label>
              <Select
                value={watch('token_symbol')}
                onValueChange={(value) => setValue('token_symbol', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {supportedTokens.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.token_symbol && (
                <p className="text-sm text-red-600">{errors.token_symbol.message}</p>
              )}
            </div>
          </div>

          {/* Billing Interval */}
          <div className="space-y-2">
            <Label>Billing Interval *</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={watch('billing_interval.interval_count') || 1}
                onChange={(e) => setValue('billing_interval.interval_count', parseInt(e.target.value) || 1)}
                disabled={isLoading}
                className="w-24"
              />
              <Select
                value={intervalType}
                onValueChange={(value: any) => setValue('billing_interval.interval_type', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(getIntervalOptions()).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Customers will be billed every{' '}
              {watch('billing_interval.interval_count') || 1}{' '}
              {getIntervalOptions()[intervalType]?.replace('(s)', watch('billing_interval.interval_count') === 1 ? '' : 's')}
            </p>
            {errors.billing_interval && (
              <p className="text-sm text-red-600">{errors.billing_interval.message}</p>
            )}
          </div>

          {/* Trial Period */}
          <div className="space-y-2">
            <Label htmlFor="trial_period_days">Trial Period (days)</Label>
            <Input
              id="trial_period_days"
              {...register('trial_period_days')}
              placeholder="0"
              type="number"
              min="0"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Optional: Number of free trial days before billing starts
            </p>
            {errors.trial_period_days && (
              <p className="text-sm text-red-600">{errors.trial_period_days.message}</p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Plan Features</Label>
            
            {/* Feature List */}
            {features.length > 0 && (
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/30 rounded p-2">
                    <span className="text-sm">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Feature Input */}
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature (e.g., Unlimited storage)"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFeature}
                disabled={!newFeature.trim() || isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Add features to highlight what's included in this plan
            </p>
          </div>

          {/* Preview Card */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Preview:</div>
              <div className="space-y-2">
                <div className="font-medium">{watch('name') || 'Plan Name'}</div>
                <div className="text-2xl font-bold">
                  {watch('price') ? `${parseFloat(watch('price')).toFixed(2)} ${watch('token_symbol')}` : '0.00 ICP'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {getIntervalOptions()[intervalType]?.replace('(s)', '')}
                  </span>
                </div>
                {watch('trial_period_days') && parseInt(watch('trial_period_days')) > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {watch('trial_period_days')} day trial
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {submitError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                isEditing ? 'Updating...' : 'Creating...'
              ) : (
                isEditing ? 'Update Plan' : 'Create Plan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
