// src/components/discount/CouponCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DiscountCoupon } from '../../types/discount';

interface CouponCardProps {
  coupon: DiscountCoupon;
  onEdit?: (coupon: DiscountCoupon) => void;
  onDelete?: (couponId: string) => Promise<any>;
  onToggleStatus?: (couponId: string) => Promise<any>;
  isLoading?: boolean;
  formatDiscount?: (coupon: DiscountCoupon) => string;
  isExpired?: (coupon: DiscountCoupon) => boolean;
  canUse?: (coupon: DiscountCoupon) => boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  formatDiscount,
  isExpired,
  canUse,
}) => {
  const discount = formatDiscount ? formatDiscount(coupon) : 'DISCOUNT';
  const expired = isExpired ? isExpired(coupon) : false;
  const usable = canUse ? canUse(coupon) : coupon.is_active;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy coupon code:', err);
    }
  };

  const getStatusColor = () => {
    if (expired) return 'destructive';
    if (!coupon.is_active) return 'secondary';
    if (usable) return 'default';
    return 'secondary';
  };

  const getStatusText = () => {
    if (expired) return 'Expired';
    if (!coupon.is_active) return 'Inactive';
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return 'Used Up';
    return 'Active';
  };

  const formatExpiryDate = () => {
    if (!coupon.expires_at) return 'No expiration';
    
    const expiryDate = new Date(Number(coupon.expires_at) / 1_000_000);
    return `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
  };

  const getUsageText = () => {
    if (!coupon.usage_limit) return `${coupon.used_count} uses`;
    return `${coupon.used_count}/${coupon.usage_limit} uses`;
  };

  return (
    <Card className={`transition-opacity ${isLoading ? 'opacity-50' : ''} ${expired ? 'bg-muted/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {coupon.code}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(coupon)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Coupon
                </DropdownMenuItem>
              )}
              {onToggleStatus && (
                <DropdownMenuItem onClick={() => onToggleStatus(coupon.coupon_id)}>
                  {coupon.is_active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(coupon.coupon_id)} 
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStatusColor()} className="text-xs">
            {getStatusText()}
          </Badge>
          <div className="text-2xl font-bold text-primary">
            {discount}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {coupon.description}
        </p>

        {/* Usage Statistics */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {getUsageText()}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatExpiryDate()}
          </div>
        </div>

        {/* Minimum Amount */}
        {coupon.minimum_amount && (
          <div className="text-xs text-muted-foreground">
            Minimum order: {coupon.minimum_amount.toString()}
          </div>
        )}

        {/* Applicable Tokens */}
        {coupon.applicable_tokens.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Valid for tokens:</div>
            <div className="flex flex-wrap gap-1">
              {coupon.applicable_tokens.map((token, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {token}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Created {formatDistanceToNow(new Date(Number(coupon.created_at) / 1_000_000), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};
