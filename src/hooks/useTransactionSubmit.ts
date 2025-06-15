import { useState } from 'react';
import { toast } from 'sonner';
import {
  TransactionFormData,
  createTransaction,
  updateTransaction,
} from '@/services/transactionApis';
import { FormData } from '../types/transactionFormTypes';

export const useTransactionSubmit = (
  animalId?: string,
  transactionId?: string,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const effectiveAnimalId = data.animal_id || animalId || 'no-animal-id';
      console.log('[TransactionForm] Submitting transaction data:', JSON.stringify(data, null, 2));

      // FormData should now be compatible with TransactionFormData
      const apiData: TransactionFormData = data as TransactionFormData;

      let result;
      if (transactionId) {
        result = await updateTransaction(effectiveAnimalId, transactionId, apiData);
        toast.success('Transaction updated successfully');
      } else {
        result = await createTransaction(effectiveAnimalId, apiData);
        toast.success('Transaction created successfully');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('[TransactionForm] Failed to save transaction:', error);
      toast.error(`Failed to save transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};