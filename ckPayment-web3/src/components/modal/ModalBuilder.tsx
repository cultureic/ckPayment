import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Palette, 
  CreditCard, 
  Building, 
  Globe,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import type { ModalConfig, ModalTheme, PaymentToken } from '@/types/modal';

// Validation schema
const modalConfigSchema = z.object({
  name: z.string().min(1, 'Modal name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  company_logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  success_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  cancel_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  webhook_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean(),
  theme: z.object({
    primary_color: z.string().min(4, 'Invalid color').max(7, 'Invalid color'),
    background_color: z.string().min(4, 'Invalid color').max(7, 'Invalid color'),
    text_color: z.string().min(4, 'Invalid color').max(7, 'Invalid color'),
    font_family: z.string().min(1, 'Font family is required'),
    border_radius: z.number().min(0).max(50),
    button_style: z.enum(['solid', 'outline', 'ghost']),
  }),
  allowed_tokens: z.array(z.string()).min(1, 'At least one token must be selected'),
  minimum_amount: z.number().min(0, 'Minimum amount must be positive').optional(),
  maximum_amount: z.number().min(0, 'Maximum amount must be positive').optional(),
  custom_fields: z.array(z.object({
    name: z.string().min(1, 'Field name is required'),
    label: z.string().min(1, 'Field label is required'),
    type: z.enum(['text', 'email', 'number', 'select', 'checkbox']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })).optional(),
});

type ModalConfigFormData = z.infer<typeof modalConfigSchema>;

interface ModalBuilderProps {
  initialData?: ModalConfig;
  onSave: (data: Partial<ModalConfig>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  supportedTokens?: string[]; // Available tokens from the canister
}

const ModalBuilder: React.FC<ModalBuilderProps> = ({ 
  initialData, 
  onSave, 
  onCancel,
  supportedTokens = ['ICP'] // Default fallback if not provided
}) => {
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [customFields, setCustomFields] = useState(initialData?.custom_fields || []);

  const form = useForm<ModalConfigFormData>({
    resolver: zodResolver(modalConfigSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      company_name: initialData?.company_name || '',
      company_logo: initialData?.company_logo || '',
      website_url: initialData?.website_url || '',
      success_url: initialData?.success_url || '',
      cancel_url: initialData?.cancel_url || '',
      webhook_url: initialData?.webhook_url || '',
      is_active: initialData?.is_active ?? true,
      theme: {
        primary_color: initialData?.theme?.primary_color || '#3B82F6',
        background_color: initialData?.theme?.background_color || '#FFFFFF',
        text_color: initialData?.theme?.text_color || '#1F2937',
        font_family: initialData?.theme?.font_family || 'Inter',
        border_radius: initialData?.theme?.border_radius || 8,
        button_style: initialData?.theme?.button_style || 'solid',
      },
      allowed_tokens: initialData?.allowed_tokens || ['ICP'],
      minimum_amount: initialData?.minimum_amount || undefined,
      maximum_amount: initialData?.maximum_amount || undefined,
      custom_fields: initialData?.custom_fields || [],
    },
  });

  const fontFamilies = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
  const buttonStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'outline', label: 'Outline' },
    { value: 'ghost', label: 'Ghost' },
  ];

  const onSubmit = async (data: ModalConfigFormData) => {
    setSaving(true);
    try {
      const result = await onSave({
        ...data,
        custom_fields: customFields,
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!result.success) {
        form.setError('root', { message: result.error || 'Failed to save modal' });
      }
    } catch (error) {
      form.setError('root', { message: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      {
        name: '',
        label: '',
        type: 'text',
        required: false,
        options: [],
      },
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], ...field };
    setCustomFields(updated);
  };

  if (previewMode) {
    const formData = form.getValues();
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modal Preview</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mock modal preview */}
          <div className="max-w-md mx-auto">
            <div 
              className="border rounded-lg p-6 shadow-lg"
              style={{
                backgroundColor: formData.theme.background_color,
                color: formData.theme.text_color,
                borderRadius: `${formData.theme.border_radius}px`,
                fontFamily: formData.theme.font_family,
              }}
            >
              <div className="text-center mb-6">
                {formData.company_logo && (
                  <img 
                    src={formData.company_logo} 
                    alt="Company Logo" 
                    className="h-12 mx-auto mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold">{formData.company_name}</h3>
                <p className="text-sm opacity-75 mt-1">
                  Complete your payment securely
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input placeholder="Enter amount" />
                </div>

                <div>
                  <Label>Token</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.allowed_tokens.map((token) => (
                      <Badge key={token} variant="outline">
                        {token}
                      </Badge>
                    ))}
                  </div>
                </div>

                {customFields.map((field, index) => (
                  <div key={index}>
                    <Label>{field.label} {field.required && '*'}</Label>
                    {field.type === 'select' ? (
                      <select className="w-full p-2 border rounded">
                        <option>Select...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <Input 
                        type={field.type} 
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}

                <Button 
                  className="w-full"
                  style={{
                    backgroundColor: formData.theme.primary_color,
                    borderRadius: `${formData.theme.border_radius}px`,
                  }}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {initialData ? 'Edit Modal' : 'Create New Modal'}
          </h3>
          <p className="text-muted-foreground">
            Configure your payment modal settings and appearance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Modal Name *</Label>
                <Input 
                  id="name"
                  {...form.register('name')}
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input 
                  id="company_name"
                  {...form.register('company_name')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                {...form.register('description')}
                placeholder="Optional description for this modal configuration"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_logo">Company Logo URL</Label>
                <Input 
                  id="company_logo"
                  {...form.register('company_logo')}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input 
                  id="website_url"
                  {...form.register('website_url')}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="primary_color"
                    {...form.register('theme.primary_color')}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={form.watch('theme.primary_color')}
                    onChange={(e) => form.setValue('theme.primary_color', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="background_color"
                    {...form.register('theme.background_color')}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={form.watch('theme.background_color')}
                    onChange={(e) => form.setValue('theme.background_color', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="text_color"
                    {...form.register('theme.text_color')}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={form.watch('theme.text_color')}
                    onChange={(e) => form.setValue('theme.text_color', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="font_family">Font Family</Label>
                <select 
                  {...form.register('theme.font_family')}
                  className="w-full p-2 border rounded-md"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="border_radius">Border Radius</Label>
                <Input 
                  id="border_radius"
                  type="number"
                  {...form.register('theme.border_radius', { valueAsNumber: true })}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <Label htmlFor="button_style">Button Style</Label>
                <select 
                  {...form.register('theme.button_style')}
                  className="w-full p-2 border rounded-md"
                >
                  {buttonStyles.map((style) => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Allowed Tokens *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {supportedTokens.map((token) => (
                  <label key={token} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.watch('allowed_tokens').includes(token)}
                      onChange={(e) => {
                        const current = form.getValues('allowed_tokens');
                        if (e.target.checked) {
                          form.setValue('allowed_tokens', [...current, token]);
                        } else {
                          form.setValue('allowed_tokens', current.filter(t => t !== token));
                        }
                      }}
                    />
                    <Badge variant="outline">{token}</Badge>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimum_amount">Minimum Amount</Label>
                <Input 
                  id="minimum_amount"
                  type="number"
                  step="0.01"
                  {...form.register('minimum_amount', { valueAsNumber: true })}
                  placeholder="0.01"
                />
              </div>
              <div>
                <Label htmlFor="maximum_amount">Maximum Amount</Label>
                <Input 
                  id="maximum_amount"
                  type="number"
                  step="0.01"
                  {...form.register('maximum_amount', { valueAsNumber: true })}
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="success_url">Success URL</Label>
                <Input 
                  id="success_url"
                  {...form.register('success_url')}
                  placeholder="https://example.com/success"
                />
              </div>
              <div>
                <Label htmlFor="cancel_url">Cancel URL</Label>
                <Input 
                  id="cancel_url"
                  {...form.register('cancel_url')}
                  placeholder="https://example.com/cancel"
                />
              </div>
              <div>
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input 
                  id="webhook_url"
                  {...form.register('webhook_url')}
                  placeholder="https://example.com/webhook"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
              <Label>Modal is active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Custom Fields</CardTitle>
              <Button type="button" variant="outline" onClick={addCustomField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customFields.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No custom fields added yet. Click "Add Field" to create custom form fields.
              </p>
            ) : (
              <div className="space-y-4">
                {customFields.map((field, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Field {index + 1}</h4>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeCustomField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Field Name</Label>
                        <Input 
                          value={field.name}
                          onChange={(e) => updateCustomField(index, { name: e.target.value })}
                          placeholder="field_name"
                        />
                      </div>
                      <div>
                        <Label>Label</Label>
                        <Input 
                          value={field.label}
                          onChange={(e) => updateCustomField(index, { label: e.target.value })}
                          placeholder="Field Label"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select 
                          value={field.type}
                          onChange={(e) => updateCustomField(index, { type: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="select">Select</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                        />
                        <Label>Required</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Update Modal' : 'Create Modal'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ModalBuilder;
