import { useState, useMemo, useCallback } from 'react';
import { ChartDataPoint, MetricsData } from '@/types/dashboard';

// Filter state interface (matching FilterControls)
export interface FilterState {
  dateRange?: DateRange;
  searchQuery: string;
  tokenTypes: string[];
  statusFilters: string[];
  metricTypes: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  timeframe?: '24h' | '7d' | '30d' | '90d' | 'custom';
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  showTrends?: boolean;
  compareMode?: boolean;
  comparisonPeriod?: {
    start: Date;
    end: Date;
  };
}

// Import DateRange from react-day-picker
import { DateRange } from 'react-day-picker';

// Hook return interface
export interface UseFiltersReturn {
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  filteredData: ChartDataPoint[];
  filteredMetrics: MetricsData | null;
  appliedFiltersCount: number;
  isFiltering: boolean;
}

/**
 * Calculate default date range based on timeframe
 */
const getDefaultDateRange = (timeframe: FilterState['timeframe']): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (timeframe) {
    case '24h':
      start.setHours(start.getHours() - 24);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    default:
      start.setDate(start.getDate() - 30); // Default to 30 days
  }

  return { start, end };
};

/**
 * Default filter state
 */
const getDefaultFilters = (): FilterState => ({
  dateRange: undefined, // Use undefined for date range picker
  searchQuery: '',
  tokenTypes: [],
  statusFilters: [],
  metricTypes: [],
  sortBy: 'date',
  sortOrder: 'desc',
  timeframe: '30d',
  groupBy: 'day',
  showTrends: true,
  compareMode: false,
  comparisonPeriod: undefined
});

/**
 * Custom hook for managing dashboard filters and data filtering
 */
export function useFilters(
  chartData: ChartDataPoint[] = [],
  metrics: MetricsData | null = null
): UseFiltersReturn {
  
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());

  /**
   * Update filters with new values
   */
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...updates };
      
      // Auto-update date range if timeframe changes
      if (updates.timeframe && updates.timeframe !== 'custom') {
        const { start, end } = getDefaultDateRange(updates.timeframe);
        newFilters.dateRange = { from: start, to: end };
      }
      
      // Reset comparison period if compare mode is disabled
      if (updates.compareMode === false) {
        newFilters.comparisonPeriod = undefined;
      }
      
      return newFilters;
    });
  }, []);

  /**
   * Reset filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  /**
   * Filter chart data based on current filter state
   */
  const filteredData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    let filtered = [...chartData];

    // Filter by date range
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter(point => {
        const pointDate = new Date(point.date);
        return pointDate >= from && pointDate <= to;
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group data if needed
    if (filters.groupBy !== 'day') {
      filtered = groupDataPoints(filtered, filters.groupBy);
    }

    return filtered;
  }, [chartData, filters.dateRange, filters.groupBy]);

  /**
   * Calculate filtered metrics based on filtered data
   */
  const filteredMetrics = useMemo(() => {
    if (!metrics || !filteredData.length) return metrics;

    // Calculate totals from filtered data
    const totals = filteredData.reduce(
      (acc, point) => ({
        payments: acc.payments + point.payments,
        errors: acc.errors + point.errors,
        revenue: acc.revenue + point.revenue,
        users: acc.users + point.users
      }),
      { payments: 0, errors: 0, revenue: 0, users: 0 }
    );

    // Calculate trends (simplified - comparing first half to second half of data)
    const midPoint = Math.floor(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midPoint);
    const secondHalf = filteredData.slice(midPoint);

    const firstHalfTotals = firstHalf.reduce(
      (acc, point) => ({
        payments: acc.payments + point.payments,
        errors: acc.errors + point.errors,
        revenue: acc.revenue + point.revenue,
        users: acc.users + point.users
      }),
      { payments: 0, errors: 0, revenue: 0, users: 0 }
    );

    const secondHalfTotals = secondHalf.reduce(
      (acc, point) => ({
        payments: acc.payments + point.payments,
        errors: acc.errors + point.errors,
        revenue: acc.revenue + point.revenue,
        users: acc.users + point.users
      }),
      { payments: 0, errors: 0, revenue: 0, users: 0 }
    );

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const trends = {
      paymentsChange: calculateChange(secondHalfTotals.payments, firstHalfTotals.payments),
      errorsChange: calculateChange(secondHalfTotals.errors, firstHalfTotals.errors),
      revenueChange: calculateChange(secondHalfTotals.revenue, firstHalfTotals.revenue),
      usersChange: calculateChange(secondHalfTotals.users, firstHalfTotals.users)
    };

    // Calculate conversion rate
    const conversionRate = totals.payments > 0 ? (totals.payments / (totals.payments + totals.errors)) * 100 : 0;

    return {
      ...metrics,
      ...totals,
      conversionRate,
      trends,
      chartData: filteredData
    };
  }, [metrics, filteredData]);

  /**
   * Count applied filters (excluding defaults)
   */
  const appliedFiltersCount = useMemo(() => {
    let count = 0;

    if (filters?.dateRange) count++;
    if (filters?.searchQuery) count++;
    if (filters?.tokenTypes?.length || 0 > 0) count++;
    if (filters?.statusFilters?.length || 0 > 0) count++;
    if (filters?.metricTypes?.length || 0 > 0) count++;
    if (filters?.timeframe && filters.timeframe !== '30d') count++;
    if (filters?.groupBy && filters.groupBy !== 'day') count++;
    if (filters?.showTrends !== true) count++;
    if (filters?.compareMode !== false) count++;

    return count;
  }, [filters]);

  /**
   * Check if any non-default filtering is active
   */
  const isFiltering = appliedFiltersCount > 0;

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredData,
    filteredMetrics,
    appliedFiltersCount,
    isFiltering
  };
}

/**
 * Group data points by the specified interval
 */
function groupDataPoints(data: ChartDataPoint[], groupBy: FilterState['groupBy']): ChartDataPoint[] {
  if (groupBy === 'day') return data; // No grouping needed

  const grouped = new Map<string, ChartDataPoint>();

  data.forEach(point => {
    const date = new Date(point.date);
    let key: string;

    switch (groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        break;
      default:
        key = point.date;
    }

    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      grouped.set(key, {
        ...existing,
        payments: existing.payments + point.payments,
        errors: existing.errors + point.errors,
        revenue: existing.revenue + point.revenue,
        users: Math.max(existing.users, point.users), // Take max for unique users
      });
    } else {
      grouped.set(key, {
        ...point,
        date: key,
        timestamp: new Date(key).getTime()
      });
    }
  });

  return Array.from(grouped.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export default useFilters;
