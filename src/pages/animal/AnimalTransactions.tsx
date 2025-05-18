import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction, TransactionSummary, fetchTransactions, fetchTransactionSummary, deleteTransaction } from '@/services/transactionApis';
import Header from '@/components/AnimalTransactions/Header';
import ViewToggle from '@/components/AnimalTransactions/ViewToggle';
import TransactionListView from '@/components/AnimalTransactions/TransactionListView';
import TransactionSummaryView from '@/components/AnimalTransactions/TransactionSummaryView';
import { FileBarChart } from 'lucide-react';

interface AnimalTransactionsProps {
  animalId: string;
}

type ViewMode = 'list' | 'summary';

export function AnimalTransactions({ animalId }: AnimalTransactionsProps) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransactions(animalId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [animalId]);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransactionSummary(animalId);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load transaction summary:', error);
      toast.error('Failed to load transaction summary');
    } finally {
      setIsLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([loadTransactions(), loadSummary()]);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [loadTransactions, loadSummary]);

  const handleDelete = useCallback(
    async (transactionId: string) => {
      try {
        setIsLoading(true);
        await deleteTransaction(animalId, transactionId);
        setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
        toast.success('Transaction deleted successfully');
        loadSummary();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        toast.error('Failed to delete transaction');
      } finally {
        setIsLoading(false);
      }
    },
    [animalId, loadSummary]
  );

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'PP');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string | null | undefined, currency: string): string => {
    if (amount == null) return 'N/A';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(numericAmount);
  };

  const transactionActions = {
    onEdit: (transaction: Transaction) => {
      navigate(`/animals/${animalId}/transactions/${transaction.id}/edit`);
    },
    onDelete: (transactionId: string) => handleDelete(transactionId),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header animalId={animalId} isLoading={isLoading} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-6">
        <Card className="border shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 bg-gradient-to-r from-primary/10 to-transparent border-b">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              Transaction Records
            </h2>
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
          <CardContent className="p-4 md:p-6">
            {viewMode === 'list' ? (
              <TransactionListView
                transactions={transactions}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                actions={transactionActions}
                animalId={animalId}
                isLoading={isLoading}
              />
            ) : (
              <TransactionSummaryView
                summary={summary}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                animalId={animalId}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}