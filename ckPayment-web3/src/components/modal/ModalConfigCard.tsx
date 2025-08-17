import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Code, 
  BarChart3,
  MoreVertical,
  Power,
  PowerOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ModalConfig, ModalAnalytics } from '@/types/modal';

interface ModalConfigCardProps {
  modal: ModalConfig;
  analytics?: ModalAnalytics;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onGenerateEmbed: () => void;
  onViewAnalytics: () => void;
}

const ModalConfigCard: React.FC<ModalConfigCardProps> = ({
  modal,
  analytics,
  onEdit,
  onPreview,
  onDelete,
  onToggleStatus,
  onGenerateEmbed,
  onViewAnalytics
}) => {
  // Format dates
  const createdDate = new Date(Number(modal.created_at)).toLocaleDateString();
  const updatedDate = new Date(Number(modal.updated_at)).toLocaleDateString();

  // Calculate conversion rate percentage
  const conversionRate = analytics ? 
    (Number(analytics.total_views) > 0 ? 
      (Number(analytics.successful_payments) / Number(analytics.total_views) * 100).toFixed(1)
      : '0.0'
    ) : '0.0';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold truncate">
              {modal.name}
            </CardTitle>
            {modal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {modal.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <Badge 
              variant={modal.is_active ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {modal.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onPreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewAnalytics}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onGenerateEmbed}>
                  <Code className="h-4 w-4 mr-2" />
                  Embed Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleStatus}>
                  {modal.is_active ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete} 
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Modal Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Theme</span>
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: modal.theme.primary_color }}
                title={modal.theme.primary_color}
              />
              <span className="text-xs text-muted-foreground">
                {modal.theme.primary_color}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tokens</span>
            <span className="text-xs">
              {(modal.allowed_tokens || modal.payment_options?.allowed_tokens)?.length || 0} supported
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Company</span>
            <span className="text-xs truncate ml-2">
              {modal.company_name || modal.branding?.company_name}
            </span>
          </div>
        </div>

        {/* Analytics Stats */}
        {analytics && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">
                {Number(analytics.total_views).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {conversionRate}%
              </div>
              <div className="text-xs text-muted-foreground">Conversion</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{createdDate}</span>
          </div>
          {updatedDate !== createdDate && (
            <div className="flex justify-between">
              <span>Updated:</span>
              <span>{updatedDate}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>ID:</span>
            <span className="font-mono">
              {modal.modal_id.slice(0, 8)}...
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModalConfigCard;
