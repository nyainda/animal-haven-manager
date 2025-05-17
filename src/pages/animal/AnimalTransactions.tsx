import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Download,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Transaction,
  TransactionSummary,
  fetchTransactions,
  fetchTransactionSummary,
  deleteTransaction,
} from '@/services/transactionApis';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from 'sonner';

// Interface Definitions
interface AnimalTransactionsProps {
  animalId: string;
}

type ViewMode = 'list' | 'summary';

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions';
  content: string;
  transactionType: string;
  transactionDate: string;
  animalId: string;
}

// TransactionDialog Component
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
    toast.success(`${field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} copied to clipboard`);
  };

  const fieldIcons = {
    details: <FileText className="h-5 w-5 text-primary" />,
    delivery_instructions: <Notebook className="h-5 w-5 text-primary" />,
    terms_and_conditions: <FileText className="h-5 w-5 text-primary" />,
    special_conditions: <Notebook className="h-5 w-5 text-primary" />,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg transition-all duration-200 ease-in-out">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {fieldIcons[field]}
            {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} -{' '}
            {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Recorded on {format(parseISO(transactionDate), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(content)}
            className="gap-1.5"
            aria-label={`Copy ${field} to clipboard`}
          >
            <Copy className="h-4 w-4" />
            Copy Text
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/animals/${animalId}/transactions/${transactionId}/edit`)}
              className="gap-1.5"
              aria-label={`Edit ${transactionType} transaction`}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="default" onClick={onClose} aria-label="Close dialog">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Status badge color mapping
const getStatusColor = (status: string): string => {
  const normalizedStatus = status?.toLowerCase()?.trim() || 'unknown';
  const statusMap: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    unknown: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  if (!statusMap[normalizedStatus]) {
    console.warn(`Unexpected transaction status: "${status}"`);
  }
  return statusMap[normalizedStatus] || statusMap.unknown;
};

// Transaction type badge color mapping
const getTypeColor = (type: string): string => {
  const typeMap: Record<string, string> = {
    sale: 'bg-blue-500',
    purchase: 'bg-emerald-500',
    transfer: 'bg-amber-500',
    service: 'bg-purple-500',
  };
  return typeMap[type.toLowerCase()] || 'bg-gray-500';
};

// Main AnimalTransactions Component
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
      console.log('Fetched transactions:', data); // Debug log
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
      console.log('Fetched summary:', data); // Debug log
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

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
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
        <Card key={index} className="flex flex-col border shadow-sm min-h-[300px]">
          <div className="h-2 bg-primary/15 w-full rounded-t-lg"></div>
          <CardHeader className="p-4 pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-3 flex-grow space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:bg-muted"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Transaction Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage all transactions for this animal
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button
              onClick={() => navigate(`/animals/${animalId}/transactions/new`)}
              disabled={isLoading}
              className="shadow-sm transition-all duration-200 gap-1.5 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
              className="shadow-sm gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/20 rounded-xl shadow-sm border border-border/60 p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Transaction Records</h2>
            <div className="inline-flex p-1 rounded-lg bg-muted/70 border border-border/60 shadow-sm">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-md gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
                List View
              </Button>
              <Button
                variant={viewMode === 'summary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('summary')}
                className={`rounded-md gap-1.5 ${
                  viewMode === 'summary'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                Summary View
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

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
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions';
    content: string;
    transactionType: string;
    transactionDate: string;
  } | null>(null);
  const [expandedDocuments, setExpandedDocuments] = useState<{ [key: string]: boolean }>({});

  const openModal = (
    transactionId: string,
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions',
    content: string,
    transactionType: string,
    transactionDate: string
  ) => {
    setModalContent({ transactionId, field, content, transactionType, transactionDate });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const toggleDocuments = (transactionId: string) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));
  };

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="border-dashed border-border shadow-sm p-8 text-center max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <List className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Transactions Recorded
            </h3>
            <p className="text-muted-foreground mb-6">
              Start tracking transactions by adding your first entry to monitor sales and purchases.
            </p>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add First Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {transactions.map((transaction) => {
          const isDetailsLong = (transaction.details?.length || 0) > 30;
          const isDeliveryInstructionsLong = (transaction.delivery_instructions?.length || 0) > 30;
          const truncatedDetails = isDetailsLong
            ? `${transaction.details?.slice(0, 30)}...`
            : transaction.details;
          const truncatedDeliveryInstructions = isDeliveryInstructionsLong
            ? `${transaction.delivery_instructions?.slice(0, 30)}...`
            : transaction.delivery_instructions;
          const status = transaction.transaction_status?.toLowerCase()?.trim() || 'unknown';
          const maxDocumentsToShow = expandedDocuments[transaction.id] ? Infinity : 2;

          return (
            <Card
              key={transaction.id}
              className="flex flex-col shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden min-h-[300px] max-h-[500px]"
            >
              <div className={`h-1.5 w-full ${getTypeColor(transaction.transaction_type)}`}></div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {transaction.transaction_type.charAt(0).toUpperCase() +
                        transaction.transaction_type.slice(1)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-sm mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(transaction.transaction_date)}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(status)} border px-2 py-0.5 text-xs capitalize`}>
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 flex-grow overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(transaction.total_amount, transaction.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Invoice #:</span>
                    <span className="text-sm text-foreground">
                      {transaction.invoice_number || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-0.5">Transaction Parties</p>
                    <div className="flex items-center text-sm gap-1.5">
                      <span className="text-foreground font-medium truncate max-w-[45%]">
                        {transaction.seller_name || 'Unknown'}
                      </span>
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium truncate max-w-[45%]">
                        {transaction.buyer_name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  {transaction.details && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-0.5">Details</p>
                      <p className="text-sm text-foreground line-clamp-1">{truncatedDetails}</p>
                      {isDetailsLong && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-0.5 text-primary text-xs"
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
                  {transaction.delivery_instructions && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-0.5">Delivery Instructions</p>
                      <p className="text-sm text-foreground line-clamp-1">{truncatedDeliveryInstructions}</p>
                      {isDeliveryInstructionsLong && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-0.5 text-primary text-xs"
                          onClick={() =>
                            openModal(
                              transaction.id,
                              'delivery_instructions',
                              transaction.delivery_instructions || '',
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
                  <Accordion type="single" collapsible>
                    <AccordionItem value="additional-details">
                      <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline">
                        Additional Details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {transaction.terms_and_conditions && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Terms & Conditions</p>
                              <p className="text-sm text-foreground line-clamp-1">
                                {transaction.terms_and_conditions.length > 30
                                  ? `${transaction.terms_and_conditions.slice(0, 30)}...`
                                  : transaction.terms_and_conditions}
                              </p>
                              {transaction.terms_and_conditions.length > 30 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 mt-0.5 text-primary text-xs"
                                  onClick={() =>
                                    openModal(
                                      transaction.id,
                                      'terms_and_conditions',
                                      transaction.terms_and_conditions || '',
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
                          {transaction.special_conditions && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Special Conditions</p>
                              <p className="text-sm text-foreground line-clamp-1">
                                {transaction.special_conditions.length > 30
                                  ? `${transaction.special_conditions.slice(0, 30)}...`
                                  : transaction.special_conditions}
                              </p>
                              {transaction.special_conditions.length > 30 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 mt-0.5 text-primary text-xs"
                                  onClick={() =>
                                    openModal(
                                      transaction.id,
                                      'special_conditions',
                                      transaction.special_conditions || '',
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
                          {transaction.insurance_policy_number && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Insurance Policy:</p>
                              <p className="text-sm text-foreground">
                                {transaction.insurance_policy_number}
                                {transaction.insurance_amount &&
                                  ` (${formatCurrency(transaction.insurance_amount, transaction.currency)})`}
                              </p>
                            </div>
                          )}
                          {transaction.health_certificate_number && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Health Certificate:</p>
                              <p className="text-sm text-foreground">{transaction.health_certificate_number}</p>
                            </div>
                          )}
                          {transaction.transport_license_number && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Transport License:</p>
                              <p className="text-sm text-foreground">{transaction.transport_license_number}</p>
                            </div>
                          )}
                          {transaction.seller_email && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Seller Contact:</p>
                              <p className="text-sm text-foreground">
                                {transaction.seller_email}
                                {transaction.seller_phone && `, ${transaction.seller_phone}`}
                              </p>
                            </div>
                          )}
                          {transaction.buyer_email && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Buyer Contact:</p>
                              <p className="text-sm text-foreground">
                                {transaction.buyer_email}
                                {transaction.buyer_phone && `, ${transaction.buyer_phone}`}
                              </p>
                            </div>
                          )}
                          {transaction.attached_documents && transaction.attached_documents.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Documents:</p>
                              <ul className="text-sm text-foreground space-y-1 max-h-[100px] overflow-y-auto">
                                {transaction.attached_documents
                                  .slice(0, maxDocumentsToShow)
                                  .map((doc) => (
                                    <li key={doc.id}>
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                        aria-label={`Download ${doc.name}`}
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                                      </a>
                                    </li>
                                  ))}
                              </ul>
                              {transaction.attached_documents.length > 2 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 mt-1 text-primary text-xs"
                                  onClick={() => toggleDocuments(transaction.id)}
                                  aria-label={expandedDocuments[transaction.id] ? 'Show fewer documents' : 'Show more documents'}
                                >
                                  {expandedDocuments[transaction.id] ? 'Show Less' : 'Show More'}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 pt-2 bg-muted/20 border-t border-border/50 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.onEdit(transaction)}
                  className="h-8 text-xs gap-1"
                  aria-label="Edit transaction"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.onDelete(transaction.id)}
                  className="h-8 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete transaction"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
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
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions';
    content: string;
    transactionType: string;
    transactionDate: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (summary) {
      console.log('Status distribution:', summary.status_distribution); // Debug log
    }
  }, [summary]);

  const openModal = (
    transactionId: string,
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions',
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
      <div className="flex items-center justify-center py-12">
        <Card className="border-dashed border-border shadow-sm p-8 text-center max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BarChart2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Data to Summarize
            </h3>
            <p className="text-muted-foreground mb-6">
              Add transactions to generate insights and visualize financial activity.
            </p>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add First Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = useMemo(() => {
    return Object.entries(summary.status_distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [summary.status_distribution]);

  const recent = summary.recent_transactions.slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const renderRecentTransactions = () => (
    <div className="space-y-3">
      {recent.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p>No recent transactions to display</p>
        </div>
      ) : (
        recent.map((transaction, index) => {
          const status = transaction.transaction_status?.toLowerCase()?.trim() || 'unknown';
          return (
            <div
              key={transaction.id}
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/40 transition-colors flex items-start gap-3 overflow-hidden"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-semibold ${getTypeColor(
                  transaction.transaction_type
                )}`}
              >
                {index + 1}
              </div>
              <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {transaction.transaction_type.charAt(0).toUpperCase() +
                        transaction.transaction_type.slice(1)}
                    </span>
                    <Badge className={`${getStatusColor(status)} border px-2 py-0 text-xs capitalize`}>
                      {status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(transaction.transaction_date)}
                  </span>
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(Number(transaction.total_amount), summary.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance Due:</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(Number(transaction.balance_due), summary.currency)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm gap-1.5">
                    <span className="text-foreground font-medium truncate max-w-[40%]">
                      {transaction.seller_name || 'Unknown'}
                    </span>
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium truncate max-w-[40%]">
                      {transaction.buyer_name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-sm border-border overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full"></div>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Transaction Overview
          </CardTitle>
          <CardDescription>Key metrics about your animal's transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-5 text-center transition-all duration-200 hover:shadow-md hover:bg-muted/50 border border-border/40">
              <div className="text-3xl font-bold text-foreground mb-1">
                {summary.overview.total_transactions}
              </div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5 text-center transition-all duration-200 hover:shadow-md hover:bg-muted/50 border border-border/40">
              <div className="text-3xl font-bold text-primary mb-1">
                {formatCurrency(Number(summary.overview.total_value), summary.currency)}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5 text-center transition-all duration-200 hover:shadow-md hover:bg-muted/50 border border-border/40">
              <div className="text-3xl font-bold text-amber-500 mb-1">
                {formatCurrency(Number(summary.overview.pending_amount), summary.currency)}
              </div>
              <div className="text-sm text-muted-foreground">Pending Amount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-border overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 w-full"></div>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of transactions by status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[250px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(156, 163, 175, 0.6)', strokeWidth: 1 }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} transactions`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mb-2">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-foreground">
                    {item.name}: {item.value}
                  </span>
                  <span className="text-muted-foreground">
                    ({((item.value / summary.overview.total_transactions) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 w-full"></div>
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest transaction entries</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 max-h-[400px] overflow-y-auto">
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