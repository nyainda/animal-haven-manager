import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionSummary } from '@/services/transactionApis';
import SummaryStatsCards from './SummaryStatsCards';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import StatusDistributionChart from './StatusDistributionChart';
import RecentTransactions from './RecentTransactions';
import TransactionDialog from './TransactionDialog';
import EmptyState from './EmptyState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TransactionSummaryViewProps {
  summary: TransactionSummary | null;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number | string | null | undefined, currency: string) => string;
  animalId: string;
  isLoading?: boolean;
}

export default function TransactionSummaryView({
  summary,
  formatDate,
  formatCurrency,
  animalId,
  isLoading = false,
}: TransactionSummaryViewProps) {
  const [modalContent, setModalContent] = useState<{
    transactionId: string;
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions';
    content: string;
    transactionType: string;
    transactionDate: string;
  } | null>(null);

  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 w-full bg-gray-200 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-gray-200 rounded" />
          <div className="h-80 bg-gray-200 rounded" />
        </div>
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!summary || summary.overview.total_transactions === 0) {
    return <EmptyState animalId={animalId} mode="summary" />;
  }

  try {
    return (
      <div className="space-y-8">
        <SummaryStatsCards summary={summary} formatCurrency={formatCurrency} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MonthlyTrendsChart
            monthlyTrends={summary.monthly_trends || []}
            currency={summary.currency}
          />
          <StatusDistributionChart
            statusDistribution={summary.status_distribution || {}}
            totalTransactions={summary.overview.total_transactions}
          />
        </div>
        <RecentTransactions
          transactions={summary.recent_transactions || []}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          currency={summary.currency}
          animalId={animalId}
          lastUpdated={summary.last_updated}
        />
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
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          An error occurred while rendering the summary. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }
}