import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  RotateCcw,
  MoreHorizontal,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TransactionData, TransactionFilters } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TransactionsTableProps {
  transactions: TransactionData[];
  loading?: boolean;
  error?: boolean;
  onRefund?: (transactionId: string) => Promise<void>;
  onViewDetails?: (transaction: TransactionData) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  loading = false,
  error = false,
  onRefund,
  onViewDetails,
  onExport,
  onRefresh,
  className
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);
  const [refundingTx, setRefundingTx] = useState<string | null>(null);

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/20' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/20' };
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/20' };
      default:
        return { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/20' };
    }
  };

  // Get token color
  const getTokenColor = (token: string) => {
    switch (token) {
      case 'ckBTC':
        return 'text-orange-500';
      case 'ckETH':
        return 'text-blue-500';
      case 'ICP':
        return 'text-cyan-500';
      case 'USD':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Format amount
  const formatAmount = (amount: number, token: string) => {
    if (token === 'USD') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${token}`;
  };

  // Filter and sort transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = [...transactions];

    // Apply filters
    if (filters.status?.length) {
      filtered = filtered.filter(tx => filters.status!.includes(tx.status));
    }
    if (filters.tokens?.length) {
      filtered = filtered.filter(tx => filters.tokens!.includes(tx.token));
    }
    if (filters.types?.length) {
      filtered = filtered.filter(tx => filters.types!.includes(tx.type));
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(query) ||
        tx.txHash?.toLowerCase().includes(query) ||
        tx.user.name?.toLowerCase().includes(query) ||
        tx.user.email?.toLowerCase().includes(query) ||
        tx.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle refund
  const handleRefund = async (transactionId: string) => {
    if (!onRefund) return;
    
    setRefundingTx(transactionId);
    try {
      await onRefund(transactionId);
      toast.success('Refund initiated successfully');
    } catch (error) {
      toast.error('Failed to initiate refund');
    } finally {
      setRefundingTx(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.status?.[0] || 'all'}
          onValueChange={(value) => 
            setFilters({ ...filters, status: value === 'all' ? [] : [value] })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.tokens?.[0] || 'all'}
          onValueChange={(value) => 
            setFilters({ ...filters, tokens: value === 'all' ? [] : [value] })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tokens</SelectItem>
            <SelectItem value="ckBTC">ckBTC</SelectItem>
            <SelectItem value="ckETH">ckETH</SelectItem>
            <SelectItem value="ICP">ICP</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'timestamp') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('timestamp');
                      setSortOrder('desc');
                    }
                  }}
                  className="h-auto p-0 font-medium"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'amount') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('amount');
                      setSortOrder('desc');
                    }
                  }}
                  className="h-auto p-0 font-medium"
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'status') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('status');
                      setSortOrder('desc');
                    }
                  }}
                  className="h-auto p-0 font-medium"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {error ? 'Failed to load transactions' : 'No transactions found'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => {
                const statusInfo = getStatusInfo(transaction.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {transaction.id.slice(0, 8)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn('font-medium', getTokenColor(transaction.token))}>
                        {formatAmount(transaction.amount, transaction.token)}
                      </div>
                      {transaction.fee && (
                        <div className="text-xs text-muted-foreground">
                          Fee: {formatAmount(transaction.fee, transaction.token)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('flex items-center space-x-1 w-fit', statusInfo.bgColor)}>
                        <StatusIcon className={cn('h-3 w-3', statusInfo.color)} />
                        <span className="capitalize">{transaction.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.user.name || 'Anonymous'}
                        </div>
                        {transaction.user.email && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.user.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onViewDetails?.(transaction)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(transaction.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy ID
                          </DropdownMenuItem>
                          {transaction.txHash && (
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(transaction.txHash!)}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Copy Hash
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {transaction.canRefund && transaction.status === 'completed' && (
                            <DropdownMenuItem
                              onClick={() => handleRefund(transaction.id)}
                              disabled={refundingTx === transaction.id}
                              className="text-red-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              {refundingTx === transaction.id ? 'Processing...' : 'Refund'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredTransactions.length)} of{' '}
              {filteredTransactions.length} results
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
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
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information for transaction {selectedTransaction.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transaction ID</label>
                <p className="text-sm text-muted-foreground break-all">{selectedTransaction.id}</p>
              </div>
              
              {selectedTransaction.txHash && (
                <div>
                  <label className="text-sm font-medium">Transaction Hash</label>
                  <p className="text-sm text-muted-foreground break-all">{selectedTransaction.txHash}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-sm text-muted-foreground">
                  {formatAmount(selectedTransaction.amount, selectedTransaction.token)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground capitalize">{selectedTransaction.status}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-muted-foreground capitalize">{selectedTransaction.type}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Timestamp</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedTransaction.timestamp).toLocaleString()}
                </p>
              </div>
              
              {selectedTransaction.blockHeight && (
                <div>
                  <label className="text-sm font-medium">Block Height</label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.blockHeight}</p>
                </div>
              )}
              
              {selectedTransaction.confirmations && (
                <div>
                  <label className="text-sm font-medium">Confirmations</label>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.confirmations}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default TransactionsTable;