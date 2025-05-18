import { useState } from 'react';
import { Transaction } from '@/services/transactionApis';
import TransactionCard from './TransactionCard';
import TransactionDialog from './TransactionDialog';
import EmptyState from './EmptyState';

interface TransactionListViewProps {
  transactions: Transaction[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: number | string | null | undefined, currency: string) => string;
  actions: {
    onEdit: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
  };
  animalId: string;
  isLoading: boolean;
}

export default function TransactionListView({
  transactions,
  formatDate,
  formatCurrency,
  actions,
  animalId,
  isLoading,
}: TransactionListViewProps) {
  const [modalContent, setModalContent] = useState<{
    transactionId: string;
    field: 'details' | 'delivery_instructions' | 'terms_and_conditions' | 'special_conditions';
    content: string;
    transactionType: string;
    transactionDate: string;
  } | null>(null);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col border shadow-md min-h-[300px] overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gray-300/50 to-gray-400/50 w-full"></div>
            <div className="p-4 pb-3 bg-gradient-to-b from-gray-50/30 to-transparent dark:from-gray-900/20">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-7 w-16 bg-gray-200 rounded-full" />
              </div>
            </div>
            <div className="p-4 pt-2 pb-3 flex-grow space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <EmptyState animalId={animalId} mode="list" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            actions={actions}
            openModal={openModal}
            animalId={animalId}
          />
        ))}
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