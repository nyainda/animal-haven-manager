import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ArrowLeft,
  BarChart2,
  List,
  Pencil,
  Trash2,
  LayoutDashboard,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Copy,
  Edit,
  FileText,
  Notebook,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Transaction,
  TransactionSummary,
  fetchTransactions,
  fetchTransactionSummary,
  deleteTransaction,
} from '@/services/transactionApis';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from 'sonner';

interface AnimalTransactionsProps {
  animalId: string;
}

type ViewMode = 'list' | 'summary';

// Reusable Dialog Component for long text fields
interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  field: 'details' | 'delivery_instructions';
  content: string;
  transactionType: string;
  transactionDate: string;
  animalId: string;
}

function TransactionDialog({
  open,
  onClose,
  transactionId,
  field,
  content,
  transactionType,
  transactionDate,
  animalId,
}: TransactionDialogProps) {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg transition-all duration-200 ease-in-out">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            {field === 'details' ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : (
              <Notebook className="h-5 w-5 text-primary" />
            )}
            {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} -{' '}
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recorded on {format(parseISO(transactionDate), 'PP')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
        </div>
        <div className="flex justify-between gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(content)}
            aria-label={`Copy ${field} to clipboard`}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/animals/${animalId}/transactions/${transactionId}/edit`)}
              aria-label={`Edit ${transactionType} transaction`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="default" onClick={onClose} aria-label="Close dialog">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Update the Transaction interface to include delivery_instructions
interface TransactionWithInstructions extends Transaction {
  delivery_instructions?: string;
}

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

  React.useEffect(() => {
    loadTransactions();
    loadSummary();
  }, [loadTransactions, loadSummary]);

  const handleDelete = useCallback(
    async (transactionId: string) => {
      try {
        setIsLoading(true);
        await deleteTransaction(animalId, transactionId);
        setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
        toast.success('Transaction deleted successfully');
        // Reload summary to reflect changes
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

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const transactionActions = useMemo(
    () => ({
      onEdit: (transaction: Transaction) => {
        navigate(`/animals/${animalId}/transactions/${transaction.id}/edit`);
      },
      onDelete: (transactionId: string) => handleDelete(transactionId),
    }),
    [handleDelete, navigate, animalId]
  );

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex flex-col border-l-4 border-border shadow-sm min-h-[200px]"
        >
          <CardHeader className="p-4 pb-3">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-3 flex-grow">
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Transaction Dashboard
              </h1>
              <p className="text-muted-foreground ml-1">
                Track and manage all transactions for this animal
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => navigate(`/animals/${animalId}/transactions/new`)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Transaction
          </Button>
          {viewMode === 'list' && (
            <Button
              onClick={() => navigate(`/animals/${animalId}/transactions/summary`)}
              disabled={isLoading}
            >
              <BarChart2 className="mr-2 h-5 w-5" />
              View Summary
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex justify-start sm:justify-end">
            <div className="inline-flex p-1 rounded-lg bg-muted">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-4 py-2 ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === 'summary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('summary')}
                className={`rounded-lg px-4 py-2 ${
                  viewMode === 'summary'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Summary View
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          renderSkeletons()
        ) : viewMode === 'list' ? (
          <TransactionListView
            transactions={transactions}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            actions={transactionActions}
            animalId={animalId}
          />
        ) : (
          <TransactionSummaryView
            summary={summary}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            animalId={animalId}
          />
        )}
      </div>
    </div>
  );
}

// TransactionListView Component
interface TransactionListViewProps {
  transactions: Transaction[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: number, currency: string) => string;
  actions: {
    onEdit: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
  };
  animalId: string;
}

function TransactionListView({
  transactions,
  formatDate,
  formatCurrency,
  actions,
  animalId,
}: TransactionListViewProps) {
  const [modalContent, setModalContent] = useState<{
    transactionId: string;
    field: 'details' | 'delivery_instructions';
    content: string;
    transactionType: string;
    transactionDate: string;
  } | null>(null);

  const openModal = (
    transactionId: string,
    field: 'details' | 'delivery_instructions',
    content: string,
    transactionType: string,
    transactionDate: string
  ) => {
    setModalContent({ transactionId, field, content, transactionType, transactionDate });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  if (transactions.length === 0) {
    return (
      <Card className="border-dashed border-border shadow-sm p-8 text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <List className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            No Transactions Recorded
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start tracking transactions by adding your first entry. This will help you monitor sales and purchases.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {transactions.map((transaction) => {
          const isDetailsLong = (transaction.details?.length || 0) > 50;
          const isDeliveryInstructionsLong =
            (transaction as TransactionWithInstructions).delivery_instructions?.length || 0 > 50;
          const truncatedDetails = isDetailsLong
            ? `${transaction.details?.slice(0, 50)}...`
            : transaction.details;
          const truncatedDeliveryInstructions = isDeliveryInstructionsLong
            ? `${(transaction as TransactionWithInstructions).delivery_instructions?.slice(0, 50)}...`
            : (transaction as TransactionWithInstructions).delivery_instructions;

          return (
            <Card
              key={transaction.id}
              className="flex flex-col border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[250px] max-h-[250px]"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {transaction.transaction_type.charAt(0).toUpperCase() +
                      transaction.transaction_type.slice(1)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => actions.onEdit(transaction)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => actions.onDelete(transaction.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(transaction.transaction_date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow flex flex-col space-y-3 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Amount:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(transaction.total_amount, transaction.currency)}
                  </span>
                </div>
                <div className="flex-1 min-h-0">
                  <p className="text-sm font-medium text-foreground">Seller/Buyer</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {transaction.seller_name} → {transaction.buyer_name}
                  </p>
                </div>
                {transaction.details && (
                  <div className="flex-1 min-h-0">
                    <p className="text-sm font-medium text-foreground">Details</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncatedDetails}
                    </p>
                    {isDetailsLong && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-primary"
                        onClick={() =>
                          openModal(
                            transaction.id,
                            'details',
                            transaction.details || '',
                            transaction.transaction_type,
                            transaction.transaction_date
                          )
                        }
                      >
                        Read More
                      </Button>
                    )}
                  </div>
                )}
                {(transaction as TransactionWithInstructions).delivery_instructions && (
                  <div className="flex-1 min-h-0">
                    <p className="text-sm font-medium text-foreground">Delivery Instructions</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncatedDeliveryInstructions}
                    </p>
                    {isDeliveryInstructionsLong && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-primary"
                        onClick={() =>
                          openModal(
                            transaction.id,
                            'delivery_instructions',
                            (transaction as TransactionWithInstructions).delivery_instructions || '',
                            transaction.transaction_type,
                            transaction.transaction_date
                          )
                        }
                      >
                        Read More
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalContent && (
        <TransactionDialog
          open={!!modalContent}
          onClose={closeModal}
          transactionId={modalContent.transactionId}
          field={modalContent.field}
          content={modalContent.content}
          transactionType={modalContent.transactionType}
          transactionDate={modalContent.transactionDate}
          animalId={animalId}
        />
      )}
    </>
  );
}

// TransactionSummaryView Component
interface TransactionSummaryViewProps {
  summary: TransactionSummary | null;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number, currency: string) => string;
  animalId: string;
}

function TransactionSummaryView({
  summary,
  formatDate,
  formatCurrency,
  animalId,
}: TransactionSummaryViewProps) {
  const [modalContent, setModalContent] = useState<{
    transactionId: string;
    field: 'details' | 'delivery_instructions';
    content: string;
    transactionType: string;
    transactionDate: string;
  } | null>(null);

  const navigate = useNavigate();

  const openModal = (
    transactionId: string,
    field: 'details' | 'delivery_instructions',
    content: string,
    transactionType: string,
    transactionDate: string
  ) => {
    setModalContent({ transactionId, field, content, transactionType, transactionDate });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  if (!summary || summary.overview.total_transactions === 0) {
    return (
      <Card className="border-dashed border-border shadow-sm p-8 text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            No Data to Summarize
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add transactions to generate insights and visualize financial activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = useMemo(() => {
    return Object.entries(summary.status_distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [summary.status_distribution]);

  const recent = summary.recent_transactions.slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Move the function declaration inside to reference recent
  const renderRecentTransactions = () => (
    <div className="space-y-3">
      {recent.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p>No recent transactions to display</p>
        </div>
      ) : (
        recent.map((transaction, index) => {
          // This transaction from 'recent' doesn't have the full properties
          // Don't try to access 'delivery_instructions' from the transaction in 'recent'
          
          return (
            <div
              key={transaction.id}
              className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-h-[120px] max-h-[120px] flex items-start gap-3 overflow-hidden"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 flex flex-col space-y-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground truncate">
                    {transaction.transaction_type.charAt(0).toUpperCase() +
                      transaction.transaction_type.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(transaction.transaction_date)}
                  </span>
                </div>
                <div className="flex-1 flex flex-col space-y-1 overflow-hidden">
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    Amount: {transaction.total_amount} {summary.currency}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    Status: {transaction.transaction_status || 'N/A'}
                  </p>
                  {/* Only show details if they exist */}
                  {transaction.details && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      <span className="font-medium">Details: </span>
                      {transaction.details.length > 50 ? 
                        `${transaction.details.slice(0, 50)}...` : transaction.details}
                    </p>
                  )}
                  {/* No reference to delivery_instructions here since it might not exist in the summary objects */}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
  
  // Then return the component with the updated function call
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Transaction Overview
          </CardTitle>
          <CardDescription>
            Key metrics about your animal's transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center transition-transform hover:scale-105">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {summary.overview.total_transactions}
              </div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center transition-transform hover:scale-105">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {summary.overview.total_value} {summary.currency}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center transition-transform hover:scale-105">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {summary.overview.pending_amount} {summary.currency}
              </div>
              <div className="text-sm text-muted-foreground">Pending Amount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Status Distribution */}
        <Card className="shadow-sm border-border flex flex-col min-h-[400px] max-h-[400px] overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of transactions by status
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0 flex flex-col overflow-hidden">
            <div className="h-[220px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} transactions`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground truncate flex-1 min-w-0">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground flex-shrink-0">
                      ({((item.value / summary.overview.total_transactions) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-sm border-border flex flex-col min-h-[400px] max-h-[400px]">
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest transaction entries
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0 overflow-y-auto">
            {renderRecentTransactions()}
          </CardContent>
        </Card>
      </div>

      {modalContent && (
        <TransactionDialog
          open={!!modalContent}
          onClose={closeModal}
          transactionId={modalContent.transactionId}
          field={modalContent.field}
          content={modalContent.content}
          transactionType={modalContent.transactionType}
          transactionDate={modalContent.transactionDate}
          animalId={animalId}
        />
      )}
    </div>
  );
}
