import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Copy, 
  Code,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import type { ModalConfig } from '@/types/modal';

interface ModalPreviewProps {
  modal: ModalConfig;
  onBack: () => void;
  onEdit: () => void;
}

const ModalPreview: React.FC<ModalPreviewProps> = ({ 
  modal, 
  onBack, 
  onEdit 
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-md';
      default:
        return 'max-w-lg';
    }
  };

  const embedCode = `<!-- ckPayment Modal Embed -->
<script src="https://unpkg.com/@ckpayment/sdk@latest/dist/ckpay.js"></script>
<script>
  ckPay.init({
    modalId: '${modal.modal_id}',
    apiKey: 'YOUR_API_KEY'
  });
</script>

<!-- Payment Button -->
<button onclick="ckPay.showModal()">
  Pay with ckPayment
</button>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    // You could show a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold">{modal.name}</h3>
            <p className="text-muted-foreground">Modal Preview</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowEmbedCode(!showEmbedCode)}>
            <Code className="h-4 w-4 mr-2" />
            Embed Code
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Modal
          </Button>
        </div>
      </div>

      {/* Viewport Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preview Controls</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
            <div className={`transition-all duration-300 ${getViewportClass()}`}>
              {/* Modal Preview */}
              <div 
                className="border rounded-lg p-6 shadow-lg bg-card"
                style={{
                  backgroundColor: modal.theme.background_color,
                  color: modal.theme.text_color,
                  borderRadius: `${modal.theme.border_radius}px`,
                  fontFamily: modal.theme.font_family,
                }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  {modal.company_logo && (
                    <img 
                      src={modal.company_logo} 
                      alt={`${modal.company_name} logo`}
                      className="h-12 w-auto mx-auto mb-4 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{modal.company_name}</h3>
                  <p className="text-sm opacity-75">
                    Complete your payment securely
                  </p>
                  {modal.description && (
                    <p className="text-sm opacity-60 mt-2">
                      {modal.description}
                    </p>
                  )}
                </div>

                {/* Payment Form */}
                <div className="space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Amount {modal.minimum_amount && `(min: ${modal.minimum_amount})`}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full p-3 border rounded-md bg-background text-foreground"
                        style={{
                          borderRadius: `${modal.theme.border_radius * 0.75}px`,
                        }}
                        min={modal.minimum_amount}
                        max={modal.maximum_amount}
                      />
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Token
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {modal.allowed_tokens.map((token, index) => (
                        <button
                          key={token}
                          className={`px-3 py-2 rounded-md border transition-colors ${
                            index === 0 
                              ? 'border-current bg-current/10' 
                              : 'border-muted-foreground/20 hover:border-current/40'
                          }`}
                          style={{
                            borderRadius: `${modal.theme.border_radius * 0.75}px`,
                          }}
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Fields */}
                  {modal.custom_fields && modal.custom_fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select 
                          className="w-full p-3 border rounded-md bg-background text-foreground"
                          style={{
                            borderRadius: `${modal.theme.border_radius * 0.75}px`,
                          }}
                        >
                          <option value="">Select...</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">{field.label}</span>
                        </label>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full p-3 border rounded-md bg-background text-foreground"
                          style={{
                            borderRadius: `${modal.theme.border_radius * 0.75}px`,
                          }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Submit Button */}
                  <button
                    className="w-full py-3 px-4 rounded-md font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      backgroundColor: modal.theme.primary_color,
                      color: modal.theme.background_color,
                      borderRadius: `${modal.theme.border_radius}px`,
                    }}
                  >
                    Complete Payment
                  </button>

                  {/* Footer Links */}
                  <div className="flex justify-between items-center text-xs opacity-60 pt-2">
                    {modal.website_url && (
                      <a 
                        href={modal.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center hover:opacity-80"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </a>
                    )}
                    <span>Powered by ckPayment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant={modal.is_active ? 'default' : 'secondary'}>
                    {modal.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Tokens:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {modal.allowed_tokens.map((token) => (
                    <Badge key={token} variant="outline" className="text-xs">
                      {token}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <div className="mt-1">
                  {new Date(modal.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Updated:</span>
                <div className="mt-1">
                  {new Date(modal.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {modal.minimum_amount && (
              <div>
                <span className="font-medium text-muted-foreground">Minimum Amount:</span>
                <div className="mt-1">{modal.minimum_amount}</div>
              </div>
            )}

            {modal.maximum_amount && (
              <div>
                <span className="font-medium text-muted-foreground">Maximum Amount:</span>
                <div className="mt-1">{modal.maximum_amount}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration URLs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modal.success_url && (
              <div>
                <span className="font-medium text-muted-foreground text-sm">Success URL:</span>
                <div className="mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {modal.success_url}
                </div>
              </div>
            )}
            
            {modal.cancel_url && (
              <div>
                <span className="font-medium text-muted-foreground text-sm">Cancel URL:</span>
                <div className="mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {modal.cancel_url}
                </div>
              </div>
            )}
            
            {modal.webhook_url && (
              <div>
                <span className="font-medium text-muted-foreground text-sm">Webhook URL:</span>
                <div className="mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {modal.webhook_url}
                </div>
              </div>
            )}

            {!modal.success_url && !modal.cancel_url && !modal.webhook_url && (
              <p className="text-muted-foreground text-sm">
                No integration URLs configured
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Embed Code Modal */}
      {showEmbedCode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Embed Code</CardTitle>
                <Button variant="ghost" onClick={() => setShowEmbedCode(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">HTML/JavaScript Integration</h4>
                  <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{embedCode}</pre>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Replace <code>YOUR_API_KEY</code> with your actual API key</li>
                  <li>Add this code to your website where you want the payment button</li>
                  <li>Customize the button text and styling as needed</li>
                  <li>Test the integration in a development environment first</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModalPreview;
