import React, { useState, useEffect } from 'react';
import { Receipt, AlertCircle } from 'lucide-react';
import TransactionsTable from './TransactionsTable';
import { TransactionData } from '@/types/dashboard';
import { mockDataService } from '@/services/mock-data';
import { toast } from 'sonner';

interface RecentTransactionsProps {
  loading?: boolean;
  error?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  loading = false,
  error = false,
  onRefresh,
  className
}) => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [hasError, setHasError] = useState(error);

  // Load transactions data
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Simulate network delay
        await mockDataService.simulateNetworkDelay(300, 800);
        
        // Generate mock transactions
        const mockTransactions = mockDataService.generateTransactionsData(100);
        setTransactions(mockTransactions);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setHasError(true);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    }
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      await mockDataService.simulateNetworkDelay(200, 500);
      const mockTransactions = mockDataService.generateTransactionsData(100);
      setTransactions(mockTransactions);
      toast.success('Transactions refreshed');
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
      setHasError(true);
      toast.error('Failed to refresh transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refund
  const handleRefund = async (transactionId: string): Promise<void> => {
    // Simulate refund process
    await mockDataService.simulateNetworkDelay(1000, 2000);
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Refund failed: Insufficient balance in merchant account');
    }
    
    // Update transaction status
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { 
              ...tx, 
              refundedAt: new Date().toISOString(),
              refundTxId: `refund_${Math.random().toString(36).substr(2, 9)}`,
              canRefund: false
            }
          : tx
      )
    );
  };

  // Handle view details
  const handleViewDetails = (transaction: TransactionData) => {
    // This could open a detailed modal or navigate to a details page
    console.log('Viewing transaction details:', transaction);
  };

  // Handle export
  const handleExport = () => {
    const csvData = transactions.map(tx => ({
      'Transaction ID': tx.id,
      'Date': new Date(tx.timestamp).toLocaleDateString(),
      'Time': new Date(tx.timestamp).toLocaleTimeString(),
      'Amount': tx.amount,
      'Token': tx.token,
      'Status': tx.status,
      'Type': tx.type,
      'User Name': tx.user.name || 'Anonymous',
      'User Email': tx.user.email || '',
      'Description': tx.description || '',
      'Fee': tx.fee || 0,
      'Block Height': tx.blockHeight || '',
      'Confirmations': tx.confirmations || '',
      'TX Hash': tx.txHash || '',
      'Can Refund': tx.canRefund ? 'Yes' : 'No',
      'Refunded At': tx.refundedAt || '',
      'Refund TX ID': tx.refundTxId || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Transactions exported successfully');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center space-x-2">
        <Receipt className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900/20 dark:text-blue-400">
          Demo Data
        </span>
      </div>

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="flex items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Failed to Load Transactions
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              There was an error loading the transaction data. Please try again.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {!hasError && (
        <TransactionsTable
          transactions={transactions}
          loading={isLoading}
          error={hasError}
          onRefund={handleRefund}
          onViewDetails={handleViewDetails}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default RecentTransactions;