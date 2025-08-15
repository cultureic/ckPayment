import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Wifi, 
  Bell, 
  Palette, 
  Zap, 
  Monitor,
  Smartphone,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Activity,
  Clock,
  Gauge
} from 'lucide-react';
import { NotificationSettings } from './notification-system';

/**
 * Dashboard configuration interface
 */
export interface DashboardConfig {
  // Real-time settings
  realTime: {
    enableWebSocket: boolean;
    enablePollingFallback: boolean;
    heartbeatInterval: number;
    maxReconnectAttempts: number;
    updateThrottling: {
      enabled: boolean;
      interval: number;
    };
    bandwidthOptimization: boolean;
    pollingInterval: number;
  };
  
  // Display settings
  display: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    showAnimations: boolean;
    showSparklines: boolean;
    refreshRate: number; // seconds
    autoRefresh: boolean;
    showRealTimeIndicators: boolean;
    cardLayout: 'grid' | 'list';
    density: 'comfortable' | 'compact' | 'spacious';
  };
  
  // Performance settings
  performance: {
    enableVirtualization: boolean;
    maxDataPoints: number;
    cacheSize: number; // MB
    lazyLoading: boolean;
    prefetchData: boolean;
    optimizeForMobile: boolean;
  };
  
  // Analytics settings
  analytics: {
    enablePredictiveAnalytics: boolean;
    enableAnomalyDetection: boolean;
    retentionPeriod: number; // days
    aggregationLevels: ('minute' | 'hour' | 'day')[];
    showAdvancedMetrics: boolean;
    enableBenchmarking: boolean;
  };
  
  // Alert settings
  alerts: {
    enableDesktopNotifications: boolean;
    enableSounds: boolean;
    alertThresholds: {
      cycleUsage: number; // percentage
      errorRate: number; // percentage
      responseTime: number; // milliseconds
      uptime: number; // percentage
    };
    criticalAlertCooldown: number; // minutes
  };
}

/**
 * Default dashboard configuration
 */
const DEFAULT_CONFIG: DashboardConfig = {
  realTime: {
    enableWebSocket: true,
    enablePollingFallback: true,
    heartbeatInterval: 30000,
    maxReconnectAttempts: 10,
    updateThrottling: {
      enabled: true,
      interval: 1000
    },
    bandwidthOptimization: true,
    pollingInterval: 5000
  },
  display: {
    theme: 'system',
    compactMode: false,
    showAnimations: true,
    showSparklines: true,
    refreshRate: 30,
    autoRefresh: true,
    showRealTimeIndicators: true,
    cardLayout: 'grid',
    density: 'comfortable'
  },
  performance: {
    enableVirtualization: true,
    maxDataPoints: 1000,
    cacheSize: 50,
    lazyLoading: true,
    prefetchData: true,
    optimizeForMobile: false
  },
  analytics: {
    enablePredictiveAnalytics: true,
    enableAnomalyDetection: true,
    retentionPeriod: 30,
    aggregationLevels: ['hour', 'day'],
    showAdvancedMetrics: true,
    enableBenchmarking: true
  },
  alerts: {
    enableDesktopNotifications: true,
    enableSounds: false,
    alertThresholds: {
      cycleUsage: 80,
      errorRate: 5,
      responseTime: 1000,
      uptime: 95
    },
    criticalAlertCooldown: 5
  }
};

/**
 * Dashboard Settings Component
 */
export const DashboardSettings: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ isOpen, onClose, className }) => {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('realtime');

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboard-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);

  // Update configuration
  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newConfig;
    });
  };

  // Save configuration
  const saveConfig = () => {
    localStorage.setItem('dashboard-config', JSON.stringify(config));
    setHasChanges(false);
    
    // Emit custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('dashboard-config-updated', { 
      detail: config 
    }));
  };

  // Reset to defaults
  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  // Export configuration
  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import configuration
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setConfig({ ...DEFAULT_CONFIG, ...imported });
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import config:', error);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Dashboard Settings</h2>
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportConfig}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  className="hidden"
                />
              </label>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5 sticky top-0 bg-background z-10">
                <TabsTrigger value="realtime" className="flex items-center space-x-1">
                  <Wifi className="h-4 w-4" />
                  <span className="hidden sm:inline">Real-time</span>
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center space-x-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Display</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-1">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center space-x-1">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Alerts</span>
                </TabsTrigger>
              </TabsList>

              {/* Real-time Settings */}
              <TabsContent value="realtime" className="p-6 space-y-6">
                <RealTimeSettings config={config} updateConfig={updateConfig} />
              </TabsContent>

              {/* Display Settings */}
              <TabsContent value="display" className="p-6 space-y-6">
                <DisplaySettings config={config} updateConfig={updateConfig} />
              </TabsContent>

              {/* Performance Settings */}
              <TabsContent value="performance" className="p-6 space-y-6">
                <PerformanceSettings config={config} updateConfig={updateConfig} />
              </TabsContent>

              {/* Analytics Settings */}
              <TabsContent value="analytics" className="p-6 space-y-6">
                <AnalyticsSettings config={config} updateConfig={updateConfig} />
              </TabsContent>

              {/* Alerts Settings */}
              <TabsContent value="alerts" className="p-6 space-y-6">
                <AlertsSettings config={config} updateConfig={updateConfig} />
                <Separator />
                <NotificationSettings />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/30">
            <Button variant="outline" onClick={resetConfig}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveConfig} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Real-time Settings Section
 */
const RealTimeSettings: React.FC<{
  config: DashboardConfig;
  updateConfig: (path: string, value: any) => void;
}> = ({ config, updateConfig }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-4">Connection Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable WebSocket</Label>
            <p className="text-sm text-muted-foreground">
              Use WebSocket for real-time updates
            </p>
          </div>
          <Switch
            checked={config.realTime.enableWebSocket}
            onCheckedChange={(checked) => updateConfig('realTime.enableWebSocket', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Polling Fallback</Label>
            <p className="text-sm text-muted-foreground">
              Fall back to polling when WebSocket fails
            </p>
          </div>
          <Switch
            checked={config.realTime.enablePollingFallback}
            onCheckedChange={(checked) => updateConfig('realTime.enablePollingFallback', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label>Heartbeat Interval: {config.realTime.heartbeatInterval / 1000}s</Label>
          <Slider
            value={[config.realTime.heartbeatInterval]}
            onValueChange={([value]) => updateConfig('realTime.heartbeatInterval', value)}
            min={10000}
            max={120000}
            step={5000}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Polling Interval: {config.realTime.pollingInterval / 1000}s</Label>
          <Slider
            value={[config.realTime.pollingInterval]}
            onValueChange={([value]) => updateConfig('realTime.pollingInterval', value)}
            min={1000}
            max={30000}
            step={1000}
            className="w-full"
          />
        </div>
      </div>
    </div>

    <Separator />

    <div>
      <h3 className="text-lg font-medium mb-4">Optimization</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Update Throttling</Label>
            <p className="text-sm text-muted-foreground">
              Limit update frequency to improve performance
            </p>
          </div>
          <Switch
            checked={config.realTime.updateThrottling.enabled}
            onCheckedChange={(checked) => updateConfig('realTime.updateThrottling.enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Bandwidth Optimization</Label>
            <p className="text-sm text-muted-foreground">
              Compress data and use delta updates
            </p>
          </div>
          <Switch
            checked={config.realTime.bandwidthOptimization}
            onCheckedChange={(checked) => updateConfig('realTime.bandwidthOptimization', checked)}
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Display Settings Section
 */
const DisplaySettings: React.FC<{
  config: DashboardConfig;
  updateConfig: (path: string, value: any) => void;
}> = ({ config, updateConfig }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-4">Appearance</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={config.display.theme}
            onValueChange={(value) => updateConfig('display.theme', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Card Layout</Label>
          <Select
            value={config.display.cardLayout}
            onValueChange={(value) => updateConfig('display.cardLayout', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Density</Label>
          <Select
            value={config.display.density}
            onValueChange={(value) => updateConfig('display.density', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <Separator />

    <div>
      <h3 className="text-lg font-medium mb-4">Visual Features</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Animations</Label>
            <p className="text-sm text-muted-foreground">
              Enable smooth transitions and animations
            </p>
          </div>
          <Switch
            checked={config.display.showAnimations}
            onCheckedChange={(checked) => updateConfig('display.showAnimations', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Show Sparklines</Label>
            <p className="text-sm text-muted-foreground">
              Display mini charts in metric cards
            </p>
          </div>
          <Switch
            checked={config.display.showSparklines}
            onCheckedChange={(checked) => updateConfig('display.showSparklines', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Real-time Indicators</Label>
            <p className="text-sm text-muted-foreground">
              Show connection status and data freshness
            </p>
          </div>
          <Switch
            checked={config.display.showRealTimeIndicators}
            onCheckedChange={(checked) => updateConfig('display.showRealTimeIndicators', checked)}
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Performance Settings Section
 */
const PerformanceSettings: React.FC<{
  config: DashboardConfig;
  updateConfig: (path: string, value: any) => void;
}> = ({ config, updateConfig }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-4">Optimization</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Virtualization</Label>
            <p className="text-sm text-muted-foreground">
              Improve performance with large datasets
            </p>
          </div>
          <Switch
            checked={config.performance.enableVirtualization}
            onCheckedChange={(checked) => updateConfig('performance.enableVirtualization', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Lazy Loading</Label>
            <p className="text-sm text-muted-foreground">
              Load components only when needed
            </p>
          </div>
          <Switch
            checked={config.performance.lazyLoading}
            onCheckedChange={(checked) => updateConfig('performance.lazyLoading', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Mobile Optimization</Label>
            <p className="text-sm text-muted-foreground">
              Optimize for mobile devices
            </p>
          </div>
          <Switch
            checked={config.performance.optimizeForMobile}
            onCheckedChange={(checked) => updateConfig('performance.optimizeForMobile', checked)}
          />
        </div>
      </div>
    </div>

    <Separator />

    <div>
      <h3 className="text-lg font-medium mb-4">Data Management</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Max Data Points: {config.performance.maxDataPoints}</Label>
          <Slider
            value={[config.performance.maxDataPoints]}
            onValueChange={([value]) => updateConfig('performance.maxDataPoints', value)}
            min={100}
            max={5000}
            step={100}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Cache Size: {config.performance.cacheSize}MB</Label>
          <Slider
            value={[config.performance.cacheSize]}
            onValueChange={([value]) => updateConfig('performance.cacheSize', value)}
            min={10}
            max={200}
            step={10}
            className="w-full"
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Analytics Settings Section
 */
const AnalyticsSettings: React.FC<{
  config: DashboardConfig;
  updateConfig: (path: string, value: any) => void;
}> = ({ config, updateConfig }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-4">Advanced Features</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Predictive Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Enable cycle usage predictions
            </p>
          </div>
          <Switch
            checked={config.analytics.enablePredictiveAnalytics}
            onCheckedChange={(checked) => updateConfig('analytics.enablePredictiveAnalytics', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Anomaly Detection</Label>
            <p className="text-sm text-muted-foreground">
              Automatically detect unusual patterns
            </p>
          </div>
          <Switch
            checked={config.analytics.enableAnomalyDetection}
            onCheckedChange={(checked) => updateConfig('analytics.enableAnomalyDetection', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Network Benchmarking</Label>
            <p className="text-sm text-muted-foreground">
              Compare performance against network averages
            </p>
          </div>
          <Switch
            checked={config.analytics.enableBenchmarking}
            onCheckedChange={(checked) => updateConfig('analytics.enableBenchmarking', checked)}
          />
        </div>
      </div>
    </div>

    <Separator />

    <div>
      <h3 className="text-lg font-medium mb-4">Data Retention</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Retention Period: {config.analytics.retentionPeriod} days</Label>
          <Slider
            value={[config.analytics.retentionPeriod]}
            onValueChange={([value]) => updateConfig('analytics.retentionPeriod', value)}
            min={7}
            max={365}
            step={7}
            className="w-full"
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Alerts Settings Section
 */
const AlertsSettings: React.FC<{
  config: DashboardConfig;
  updateConfig: (path: string, value: any) => void;
}> = ({ config, updateConfig }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-4">Alert Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Desktop Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Show browser notifications for alerts
            </p>
          </div>
          <Switch
            checked={config.alerts.enableDesktopNotifications}
            onCheckedChange={(checked) => updateConfig('alerts.enableDesktopNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Sound Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Play sounds for notifications
            </p>
          </div>
          <Switch
            checked={config.alerts.enableSounds}
            onCheckedChange={(checked) => updateConfig('alerts.enableSounds', checked)}
          />
        </div>
      </div>
    </div>

    <Separator />

    <div>
      <h3 className="text-lg font-medium mb-4">Alert Thresholds</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Cycle Usage Alert: {config.alerts.alertThresholds.cycleUsage}%</Label>
          <Slider
            value={[config.alerts.alertThresholds.cycleUsage]}
            onValueChange={([value]) => updateConfig('alerts.alertThresholds.cycleUsage', value)}
            min={50}
            max={95}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Error Rate Alert: {config.alerts.alertThresholds.errorRate}%</Label>
          <Slider
            value={[config.alerts.alertThresholds.errorRate]}
            onValueChange={([value]) => updateConfig('alerts.alertThresholds.errorRate', value)}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Response Time Alert: {config.alerts.alertThresholds.responseTime}ms</Label>
          <Slider
            value={[config.alerts.alertThresholds.responseTime]}
            onValueChange={([value]) => updateConfig('alerts.alertThresholds.responseTime', value)}
            min={100}
            max={5000}
            step={100}
            className="w-full"
          />
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSettings;