// src/components/subscription/BillingHistory.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Filter, 
  Download, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Search
} from 'lucide-react';
import type { PaymentRecord } from '@/types/subscription';

interface BillingHistoryProps {
  payments: PaymentRecord[];
  isLoading: boolean;
  onFetchPayments: () => Promise<void>;
}

type PaymentStatus = 'Completed' | 'Failed' | 'Pending' | 'Refunded';
type FilterPeriod = 'all' | '7d' | '30d' | '90d' | '1y';

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  payments,
  isLoading,
  onFetchPayments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<FilterPeriod>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const formatCurrency = (amount: bigint, symbol: string = 'ICP'): string => {
    return `${(Number(amount) / 1e8).toFixed(4)} ${symbol}`;
  };

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Failed':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      case 'Refunded':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filterPaymentsByPeriod = (payments: PaymentRecord[], period: FilterPeriod): PaymentRecord[] => {
    if (period === 'all') return payments;
    
    const now = Date.now() * 1_000_000; // Convert to nanoseconds
    const periodMap = {
      '7d': 7 * 24 * 60 * 60 * 1000 * 1_000_000,
      '30d': 30 * 24 * 60 * 60 * 1000 * 1_000_000,
      '90d': 90 * 24 * 60 * 60 * 1000 * 1_000_000,
      '1y': 365 * 24 * 60 * 60 * 1000 * 1_000_000,
    };
    
    const cutoffTime = now - periodMap[period];
    return payments.filter(payment => Number(payment.timestamp) >= cutoffTime);
  };

  // Apply filters
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Filter by period
    filtered = filterPaymentsByPeriod(filtered, periodFilter);

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.payment_id.toLowerCase().includes(search) ||
        payment.subscription_id.toLowerCase().includes(search) ||
        payment.payer_id.toText().toLowerCase().includes(search)
      );
    }

    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

    return filtered;
  }, [payments, statusFilter, periodFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  // Summary statistics
  const totalAmount = filteredPayments.reduce((sum, payment) => {
    if (payment.status === 'Completed') {
      return sum + Number(payment.amount);
    }
    return sum;
  }, 0);

  const statusCounts = filteredPayments.reduce((acc, payment) => {
    acc[payment.status] = (acc[payment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Payment ID', 'Subscription ID', 'Amount', 'Token', 'Status', 'Payer'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        formatDate(payment.timestamp),
        payment.payment_id,
        payment.subscription_id,
        (Number(payment.amount) / 1e8).toFixed(4),
        payment.token_symbol,
        payment.status,
        payment.payer_id.toText().slice(0, 16) + '...'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Total Revenue</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {formatCurrency(BigInt(totalAmount * 1e8))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From {filteredPayments.length} payments
            </div>
          </CardContent>
        </Card>

        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <div className="text-sm font-medium">{status}</div>
              </div>
              <div className="text-2xl font-bold mt-2">{count}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((count / filteredPayments.length) * 100).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onFetchPayments}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredPayments.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by payment ID, subscription ID, or payer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={periodFilter} onValueChange={(value: any) => setPeriodFilter(value)}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment records found</p>
              <p className="text-sm">Try adjusting your filters or refresh the data</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Subscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {payment.payment_id.slice(0, 12)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(payment.amount, payment.token_symbol)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(payment.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {payment.payer_id.toText().slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {payment.subscription_id.slice(0, 8)}...
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
