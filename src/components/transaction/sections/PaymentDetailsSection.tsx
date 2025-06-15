import React from 'react';
import { DollarSign } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePickerField } from '../DatePickerField';
import { CurrencyInput } from '../CurrencyInput';
//import   PaymentSummary  from '../TransactionSummary';
import { TransactionSummary } from '../TransactionSummary';
import { TransactionFormData } from '@/types/transaction';
import { paymentMethods } from '@/constants/transaction';
import { Transaction } from '@/services/transactionApis';

interface PaymentDetailsSectionProps {
  form: UseFormReturn<TransactionFormData>;
}

export const PaymentDetailsSection: React.FC<PaymentDetailsSectionProps> = ({ form }) => {
  const price = form.watch('price') || 0;
  const taxAmount = form.watch('tax_amount') || 0;
  const depositAmount = form.watch('deposit_amount') || 0;
  const currency = form.watch('currency') || 'USD';
  const totalAmount = price + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-purple-600" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Reference (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter payment reference"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deposit_amount"
            render={({ field }) => (
              <CurrencyInput
                label="Deposit Amount (Optional)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormField
            control={form.control}
            name="payment_due_date"
            render={({ field }) => (
              <DatePickerField
                label="Payment Due Date (Optional)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <TransactionSummary
          price={price}
          taxAmount={taxAmount}
          depositAmount={depositAmount}
          currency={currency}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="insurance_policy_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Policy Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter policy number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insurance_amount"
            render={({ field }) => (
              <CurrencyInput
                label="Insurance Amount (Optional)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};