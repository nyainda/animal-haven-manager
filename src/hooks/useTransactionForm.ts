import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { fetchTransaction } from '@/services/transactionApis';
import { formSchema, type FormData } from '@/types/transactionFormTypes';
import {
  transactionTypes,
  paymentMethods,
  type TransactionType,
  type Currency,
  type PaymentMethod,
  type TransactionStatus,
} from '@/constants/transaction';

export const useTransactionForm = (animalId?: string, transactionId?: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Required fields with defaults
      transaction_type: transactionTypes[0] as TransactionType,
      currency: 'USD' as Currency,
      payment_method: paymentMethods[0] as PaymentMethod,
      seller_name: '',
      buyer_name: '',
      price: 0,
      tax_amount: 0,
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      
      // Optional fields
      animal_id: animalId || undefined,
      transaction_status: 'pending' as TransactionStatus,
      delivery_date: null,
      details: null,
      payment_reference: null,
      deposit_amount: null,
      payment_due_date: null,
      seller_id: undefined,
      buyer_id: undefined,
      seller_company: null,
      seller_tax_id: null,
      seller_email: null,
      seller_phone: null,
      seller_address: null,
      seller_city: null,
      seller_state: null,
      seller_country: null,
      seller_postal_code: null,
      seller_identification: null,
      seller_license_number: null,
      buyer_company: null,
      buyer_tax_id: null,
      buyer_email: null,
      buyer_phone: null,
      buyer_address: null,
      buyer_city: null,
      buyer_state: null,
      buyer_country: null,
      buyer_postal_code: null,
      buyer_identification: null,
      buyer_license_number: null,
      invoice_number: null,
      contract_number: null,
      terms_accepted: false,
      health_certificate_number: null,
      transport_license_number: null,
      location_of_sale: null,
      terms_and_conditions: null,
      special_conditions: null,
      delivery_instructions: null,
      insurance_policy_number: null,
      insurance_amount: null,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    console.log('[DEBUG] useEffect triggered', { transactionId, animalId });

    if (transactionId && animalId) {
      console.log('[DEBUG] Both IDs present, starting fetch');
      setIsLoading(true);

      fetchTransaction(animalId, transactionId)
        .then((transaction) => {
          console.log('[DEBUG] Transaction fetched successfully:', transaction);

          if (!transaction.transaction_type || !transaction.currency || !transaction.payment_method) {
            console.error('[DEBUG] Missing required fields in transaction:', {
              transaction_type: transaction.transaction_type,
              currency: transaction.currency,
              payment_method: transaction.payment_method,
            });
            toast.error('Transaction data is incomplete');
            return;
          }

          const normalizedData: FormData = {
            // Required fields
            transaction_type: (transaction.transaction_type as TransactionType) || transactionTypes[0],
            currency: (transaction.currency as Currency) || 'USD',
            payment_method: (transaction.payment_method as PaymentMethod) || paymentMethods[0],
            seller_name: transaction.seller_name || '',
            buyer_name: transaction.buyer_name || '',
            price: Number(transaction.price) || 0,
            tax_amount: Number(transaction.tax_amount) || 0,
            transaction_date: transaction.transaction_date || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            
            // Optional fields
            animal_id: transaction.animal_id || animalId,
            transaction_status: (transaction.transaction_status as TransactionStatus) || 'pending',
            delivery_date: transaction.delivery_date || null,
            details: transaction.details || null,
            payment_reference: transaction.payment_reference || null,
            deposit_amount: transaction.deposit_amount ? Number(transaction.deposit_amount) : null,
            payment_due_date: transaction.payment_due_date || null,
            seller_id: transaction.seller_id ? Number(transaction.seller_id) : undefined,
            buyer_id: transaction.buyer_id ? Number(transaction.buyer_id) : undefined,
            seller_company: transaction.seller_company || null,
            seller_tax_id: transaction.seller_tax_id || null,
            seller_email: transaction.seller_email || null,
            seller_phone: transaction.seller_phone || null,
            seller_address: transaction.seller_address || null,
            seller_city: transaction.seller_city || null,
            seller_state: transaction.seller_state || null,
            seller_country: transaction.seller_country || null,
            seller_postal_code: transaction.seller_postal_code || null,
            seller_identification: transaction.seller_identification || null,
            seller_license_number: transaction.seller_license_number || null,
            buyer_company: transaction.buyer_company || null,
            buyer_tax_id: transaction.buyer_tax_id || null,
            buyer_email: transaction.buyer_email || null,
            buyer_phone: transaction.buyer_phone || null,
            buyer_address: transaction.buyer_address || null,
            buyer_city: transaction.buyer_city || null,
            buyer_state: transaction.buyer_state || null,
            buyer_country: transaction.buyer_country || null,
            buyer_postal_code: transaction.buyer_postal_code || null,
            buyer_identification: transaction.buyer_identification || null,
            buyer_license_number: transaction.buyer_license_number || null,
            invoice_number: transaction.invoice_number || null,
            contract_number: transaction.contract_number || null,
            terms_accepted: Boolean(transaction.terms_accepted),
            health_certificate_number: transaction.health_certificate_number || null,
            transport_license_number: transaction.transport_license_number || null,
            location_of_sale: transaction.location_of_sale || null,
            terms_and_conditions: transaction.terms_and_conditions || null,
            special_conditions: transaction.special_conditions || null,
            delivery_instructions: transaction.delivery_instructions || null,
            insurance_policy_number: transaction.insurance_policy_number || null,
            insurance_amount: transaction.insurance_amount ? Number(transaction.insurance_amount) : null,
          };

          console.log('[DEBUG] Normalized data:', normalizedData);

          try {
            form.reset(normalizedData);
            console.log('[DEBUG] Form reset successful');
            toast.success('Transaction data loaded successfully');
          } catch (formError) {
            console.error('[DEBUG] Form reset failed:', formError);
            toast.error('Failed to populate form with transaction data');
          }
        })
        .catch((error) => {
          console.error('[DEBUG] Failed to fetch transaction:', error);
          toast.error(`Failed to load transaction: ${error.message || 'Unknown error'}`);
        })
        .finally(() => {
          console.log('[DEBUG] Setting loading to false');
          setIsLoading(false);
        });
    } else {
      console.log('[DEBUG] Missing required IDs', { transactionId, animalId });
      if (transactionId || animalId) {
        console.error('[DEBUG] Partial IDs detected - this might cause issues');
        toast.error('Missing required transaction or animal ID');
      }
    }
  }, [transactionId, animalId, form]);

  return { form, isLoading };
};
