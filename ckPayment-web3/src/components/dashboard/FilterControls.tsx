import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar,
  Search,
  X,
  Settings2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export interface FilterState {
  dateRange?: DateRange;
  searchQuery: string;
  tokenTypes: string[];
  statusFilters: string[];
  metricTypes: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExportAll: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  onExportAll,
  onRefresh,
  isLoading = false,
  className
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Predefined date ranges
  const datePresets = [
    {
      label: 'Last 7 days',
      value: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: 'Last 30 days',
      value: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: 'Last 90 days',
      value: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: 'This month',
      value: () => {
        const now = new Date();
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
      }
    }
  ];

  // Token type options
  const tokenTypes = [
    { id: 'ckBTC', label: 'ckBTC', color: '#f7931a' },
    { id: 'ckETH', label: 'ckETH', color: '#627eea' },
    { id: 'ICP', label: 'ICP', color: '#29abe2' },
    { id: 'USD', label: 'USD', color: '#22c55e' }
  ];

  // Status filter options
  const statusOptions = [
    { id: 'success', label: 'Success', color: '#22c55e' },
    { id: 'pending', label: 'Pending', color: '#eab308' },
    { id: 'failed', label: 'Failed', color: '#ef4444' },
    { id: 'cancelled', label: 'Cancelled', color: '#6b7280' }
  ];

  // Metric type options
  const metricTypes = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'payments', label: 'Payments' },
    { id: 'errors', label: 'Errors' },
    { id: 'users', label: 'Users' },
    { id: 'cycles', label: 'Cycle Usage' }
  ];

  // Update filters helper
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: undefined,
      searchQuery: '',
      tokenTypes: [],
      statusFilters: [],
      metricTypes: [],
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.dateRange ? 1 : 0,
    filters.searchQuery ? 1 : 0,
    filters.tokenTypes.length,
    filters.statusFilters.length,
    filters.metricTypes.length
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions, users, or IDs..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Date Range Picker */}
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={(dateRange) => updateFilters({ dateRange })}
          placeholder="Select date range"
          className="w-auto"
        />

        {/* Quick Date Presets */}
        <Select
          value=""
          onValueChange={(value) => {
            const preset = datePresets.find(p => p.label === value);
            if (preset) {
              updateFilters({ dateRange: preset.value() });
            }
          }}
        >
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Quick dates" />
          </SelectTrigger>
          <SelectContent>
            {datePresets.map((preset) => (
              <SelectItem key={preset.label} value={preset.label}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Settings2 className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              </div>

              <Separator />

              {/* Token Types */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Token Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {tokenTypes.map((token) => (
                    <div key={token.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={token.id}
                        checked={filters.tokenTypes.includes(token.id)}
                        onCheckedChange={(checked) => {
                          const newTokenTypes = checked
                            ? [...filters.tokenTypes, token.id]
                            : filters.tokenTypes.filter(t => t !== token.id);
                          updateFilters({ tokenTypes: newTokenTypes });
                        }}
                      />
                      <Label htmlFor={token.id} className="text-sm flex items-center space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: token.color }}
                        />
                        <span>{token.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={status.id}
                        checked={filters.statusFilters.includes(status.id)}
                        onCheckedChange={(checked) => {
                          const newStatusFilters = checked
                            ? [...filters.statusFilters, status.id]
                            : filters.statusFilters.filter(s => s !== status.id);
                          updateFilters({ statusFilters: newStatusFilters });
                        }}
                      />
                      <Label htmlFor={status.id} className="text-sm flex items-center space-x-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span>{status.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Metric Types */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Metrics</Label>
                <div className="space-y-1">
                  {metricTypes.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={filters.metricTypes.includes(metric.id)}
                        onCheckedChange={(checked) => {
                          const newMetricTypes = checked
                            ? [...filters.metricTypes, metric.id]
                            : filters.metricTypes.filter(m => m !== metric.id);
                          updateFilters({ metricTypes: newMetricTypes });
                        }}
                      />
                      <Label htmlFor={metric.id} className="text-sm">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sort Options */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort By</Label>
                <div className="flex space-x-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilters({ sortBy: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value: 'asc' | 'desc') => updateFilters({ sortOrder: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">↓</SelectItem>
                      <SelectItem value="asc">↑</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportAll}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.dateRange && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Date Range</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ dateRange: undefined })}
              />
            </Badge>
          )}
          
          {filters.searchQuery && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Search: "{filters.searchQuery}"</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ searchQuery: '' })}
              />
            </Badge>
          )}
          
          {filters.tokenTypes.map((token) => (
            <Badge key={token} variant="secondary" className="flex items-center space-x-1">
              <span>{token}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  tokenTypes: filters.tokenTypes.filter(t => t !== token) 
                })}
              />
            </Badge>
          ))}
          
          {filters.statusFilters.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center space-x-1">
              <span>{status}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  statusFilters: filters.statusFilters.filter(s => s !== status) 
                })}
              />
            </Badge>
          ))}
          
          {filters.metricTypes.map((metric) => (
            <Badge key={metric} variant="secondary" className="flex items-center space-x-1">
              <span>{metricTypes.find(m => m.id === metric)?.label}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ 
                  metricTypes: filters.metricTypes.filter(m => m !== metric) 
                })}
              />
            </Badge>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FilterControls;