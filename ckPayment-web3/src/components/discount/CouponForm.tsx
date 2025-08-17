// src/components/discount/CouponForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import type { DiscountCoupon, CreateCouponForm, CouponType } from '../../types/discount';

// Validation schema
const couponFormSchema = z.object({
  code: z.string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code must be less than 50 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code can only contain uppercase letters, numbers, underscores, and hyphens'),
  coupon_type: z.nativeEnum({
    Percentage: 'Percentage',
    FixedAmount: 'FixedAmount',
    FreeShipping: 'FreeShipping',
  } as const),
  discount_value: z.string().optional(),
  description: z.string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must be less than 500 characters'),
  minimum_amount: z.string().optional(),
  applicable_tokens: z.array(z.string()).default([]),
  usage_limit: z.number().min(1).optional(),
  expires_at: z.date().optional(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (data.coupon_type === 'Percentage') {
    const value = parseInt(data.discount_value || '0');
    return value > 0 && value <= 100;
  }
  if (data.coupon_type === 'FixedAmount') {
    const value = parseInt(data.discount_value || '0');
    return value > 0;
  }
  return true;
}, {
  message: 'Invalid discount value for selected coupon type',
  path: ['discount_value'],
});

type CouponFormData = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  coupon?: DiscountCoupon;
  onSubmit: (couponData: CreateCouponForm) => Promise<any>;
  onCancel: () => void;
  isLoading?: boolean;
}

const COMMON_TOKENS = ['ICP', 'ckBTC', 'ckETH', 'USDC', 'USDT'];

export const CouponForm: React.FC<CouponFormProps> = ({
  coupon,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [newToken, setNewToken] = useState('');
  const isEditing = !!coupon;

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code || '',
      coupon_type: getCouponTypeFromData(coupon?.coupon_type) || 'Percentage',
      discount_value: getDiscountValueFromData(coupon?.coupon_type) || '',
      description: coupon?.description || '',
      minimum_amount: coupon?.minimum_amount ? coupon.minimum_amount.toString() : '',
      applicable_tokens: coupon?.applicable_tokens || [],
      usage_limit: coupon?.usage_limit || undefined,
      expires_at: coupon?.expires_at ? new Date(Number(coupon.expires_at) / 1_000_000) : undefined,
      is_active: coupon?.is_active ?? true,
    },
  });

  const { fields: tokenFields, append: appendToken, remove: removeToken } = useFieldArray({
    control: form.control,
    name: 'applicable_tokens',
  });

  const watchedCouponType = form.watch('coupon_type');

  function getCouponTypeFromData(couponType?: any): CouponType | undefined {
    if (!couponType) return undefined;
    if ('Percentage' in couponType) return 'Percentage';
    if ('FixedAmount' in couponType) return 'FixedAmount';
    if ('FreeShipping' in couponType) return 'FreeShipping';
    return undefined;
  }

  function getDiscountValueFromData(couponType?: any): string {
    if (!couponType) return '';
    if ('Percentage' in couponType) return couponType.Percentage.toString();
    if ('FixedAmount' in couponType) return couponType.FixedAmount.toString();
    return '';
  }

  const handleSubmit = async (data: CouponFormData) => {
    const formattedData: CreateCouponForm = {
      code: data.code.toUpperCase(),
      coupon_type: data.coupon_type as CouponType,
      discount_value: data.discount_value || '0',
      description: data.description,
      minimum_amount: data.minimum_amount || undefined,
      applicable_tokens: data.applicable_tokens,
      usage_limit: data.usage_limit,
      expires_at: data.expires_at,
      is_active: data.is_active,
    };

    const result = await onSubmit(formattedData);
    if (result.success) {
      form.reset();
    }
  };

  const addToken = () => {
    if (newToken && !form.getValues('applicable_tokens').includes(newToken)) {
      appendToken(newToken);
      setNewToken('');
    }
  };

  const addCommonToken = (token: string) => {
    if (!form.getValues('applicable_tokens').includes(token)) {
      appendToken(token);
    }
  };

  const getDiscountPlaceholder = () => {
    switch (watchedCouponType) {
      case 'Percentage':
        return 'Enter percentage (1-100)';
      case 'FixedAmount':
        return 'Enter fixed amount';
      case 'FreeShipping':
        return 'Free shipping (no value needed)';
      default:
        return 'Enter discount value';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the coupon details below.' 
              : 'Create a new discount coupon for your customers.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Coupon Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SAVE20" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Unique code customers will use to apply the discount
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coupon Type */}
            <FormField
              control={form.control}
              name="coupon_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage Discount</SelectItem>
                      <SelectItem value="FixedAmount">Fixed Amount Discount</SelectItem>
                      <SelectItem value="FreeShipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Value */}
            {watchedCouponType !== 'FreeShipping' && (
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder={getDiscountPlaceholder()}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedCouponType === 'Percentage' 
                        ? 'Enter a value between 1-100 for percentage discount'
                        : 'Enter the fixed discount amount'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description of this coupon and what it offers..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minimum Amount */}
            <FormField
              control={form.control}
              name="minimum_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Minimum purchase amount required"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty if no minimum purchase amount is required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Applicable Tokens */}
            <FormField
              control={form.control}
              name="applicable_tokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicable Tokens (Optional)</FormLabel>
                  <FormDescription>
                    Specify which tokens this coupon can be used with. Leave empty for all tokens.
                  </FormDescription>
                  
                  {/* Common Tokens */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_TOKENS.map((token) => (
                      <Button
                        key={token}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCommonToken(token)}
                        disabled={field.value.includes(token)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {token}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Token Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter token symbol"
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToken())}
                    />
                    <Button type="button" onClick={addToken} disabled={!newToken}>
                      Add
                    </Button>
                  </div>

                  {/* Selected Tokens */}
                  {tokenFields.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tokenFields.map((field, index) => (
                        <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                          {field.value}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => removeToken(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Usage Limit */}
            <FormField
              control={form.control}
              name="usage_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Maximum number of times this coupon can be used"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for unlimited usage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Set expiry date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                      {field.value && (
                        <div className="p-3 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(undefined)}
                            className="w-full"
                          >
                            Clear Date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Leave empty if the coupon should never expire
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Activate Coupon
                    </FormLabel>
                    <FormDescription>
                      Enable this coupon to be used by customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Coupon' : 'Create Coupon')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
