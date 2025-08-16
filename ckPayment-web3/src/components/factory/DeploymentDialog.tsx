import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Factory, 
  Loader2, 
  Plus, 
  AlertCircle,
  Check,
  Settings,
  CreditCard,
  Webhook
} from 'lucide-react';
import { UserCanisterConfig, DeploymentResult } from '../../services/factory-service';
import factoryService from '../../services/factory-service';

interface DeploymentDialogProps {
  onDeploy: (config: UserCanisterConfig) => Promise<DeploymentResult>;
  isDeploying: boolean;
  trigger?: React.ReactNode;
}

export function DeploymentDialog({ 
  onDeploy, 
  isDeploying,
  trigger 
}: DeploymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    webhook: '',
    merchantFee: '2.5',
    autoWithdraw: false,
    withdrawThreshold: ''
  });
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    setDeploymentResult(null);

    try {
      const config = factoryService.createDefaultConfig(
        formData.name.trim(),
        formData.description.trim()
      );

      // Update with form values
      config.webhook = formData.webhook.trim() || null;
      config.merchant_fee = Math.round(parseFloat(formData.merchantFee) * 100); // Convert to basis points
      config.auto_withdraw = formData.autoWithdraw;
      config.withdraw_threshold = formData.withdrawThreshold 
        ? BigInt(Math.round(parseFloat(formData.withdrawThreshold) * 100000000)) // Convert to satoshis
        : null;

      const result = await onDeploy(config);
      setDeploymentResult(result);

      if (result.success) {
        // Reset form on success
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            webhook: '',
            merchantFee: '2.5',
            autoWithdraw: false,
            withdrawThreshold: ''
          });
          setDeploymentResult(null);
          setOpen(false);
        }, 2000);
      }
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button className="w-full justify-start" variant="outline">
      <Plus className="h-4 w-4 mr-2" />
      Deploy New Payment Contract
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Factory className="h-5 w-5" />
            <span>Deploy New Payment Contract</span>
          </DialogTitle>
          <DialogDescription>
            Create a new payment processing canister with custom configuration.
            This will deploy a dedicated payment system that you control.
          </DialogDescription>
        </DialogHeader>

        {deploymentResult?.success ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-semibold">Deployment Successful!</div>
                <div className="mt-1">
                  Your payment contract has been deployed successfully.
                </div>
                {deploymentResult.canister_id && (
                  <div className="mt-2 text-sm">
                    <strong>Canister ID:</strong> {deploymentResult.canister_id.toText()}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium">Basic Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Contract Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Payment Gateway"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Payment processing system for my application"
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium">Payment Configuration</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchantFee">Merchant Fee (%)</Label>
                  <Input
                    id="merchantFee"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.merchantFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, merchantFee: e.target.value }))}
                  />
                  <div className="text-xs text-gray-500">
                    Fee charged on each transaction
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawThreshold">Auto-withdraw Threshold (ckBTC)</Label>
                  <Input
                    id="withdrawThreshold"
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={formData.withdrawThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, withdrawThreshold: e.target.value }))}
                    placeholder="0.001"
                    disabled={!formData.autoWithdraw}
                  />
                </div>
              </div>

              <div className="flex items-center space-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoWithdraw"
                    checked={formData.autoWithdraw}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoWithdraw: checked }))}
                  />
                  <Label htmlFor="autoWithdraw">Enable Auto-withdraw</Label>
                </div>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Webhook className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium">Webhook Configuration</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL (Optional)</Label>
                <Input
                  id="webhook"
                  type="url"
                  value={formData.webhook}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook: e.target.value }))}
                  placeholder="https://your-app.com/webhook"
                />
                <div className="text-xs text-gray-500">
                  URL to receive payment notifications
                </div>
              </div>
            </div>

            {/* Default Token Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Supported Tokens</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">ckBTC</Badge>
                <span className="text-sm text-gray-600">Chain Key Bitcoin (Default)</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Additional tokens can be configured after deployment
              </div>
            </div>

            {/* Error Display */}
            {deploymentResult?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Deployment Failed</div>
                  <div className="mt-1">{deploymentResult.error}</div>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Factory className="mr-2 h-4 w-4" />
                    Deploy Contract
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
