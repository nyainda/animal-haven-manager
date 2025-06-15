import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import { TransactionDetailsSection } from '@/components/transaction/sections/TransactionDetailsSection';
import { PersonInfoSection } from '@/components/transaction/sections/PersonInfoSection';
import { PaymentDetailsSection } from '@/components/transaction/sections/PaymentDetailsSection';
import { DocumentsSection } from '@/components/transaction/sections/DocumentsSection';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { useTransactionSubmit } from '@/hooks/useTransactionSubmit';
import { TransactionFormHeader } from '@/components/transaction/TransactionFormHeader';
import { TransactionFormActions } from '@/components/transaction/TransactionFormActions';
import { LoadingSpinner } from '@/components/transaction/LoadingSpinner';

const TransactionForm: React.FC = () => {
  const { id: animalId, transactionId } = useParams<{ id: string; transactionId?: string }>();
  const navigate = useNavigate();
  
  const { form, isLoading } = useTransactionForm(animalId, transactionId);
  const { handleSubmit, isSubmitting } = useTransactionSubmit(
    animalId,
    transactionId,
    () => navigate(`/animals/${animalId || 'no-animal-id'}/transactions`)
  );

  const handleBack = () => {
    navigate(`/animals/${animalId || 'no-animal-id'}/transactions`);
  };

  const handleCancel = () => {
    navigate(`/animals/${animalId || 'no-animal-id'}/transactions`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={cn('bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8')}>
      <div className="max-w-3xl mq-450:max-w-full mx-auto">
        <TransactionFormHeader
          isEditing={!!transactionId}
          onBack={handleBack}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <TransactionDetailsSection form={form} />
            <PersonInfoSection form={form} type="seller" title="Seller Information" />
            <PersonInfoSection form={form} type="buyer" title="Buyer Information" />
            <PaymentDetailsSection form={form} />
            <DocumentsSection form={form} />

            <TransactionFormActions
              isSubmitting={isSubmitting}
              isEditing={!!transactionId}
              onCancel={handleCancel}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TransactionForm;