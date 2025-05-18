import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Separator } from '@/components/ui/card';
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper';
import { Control } from 'react-hook-form';
import { TransactionFormData } from '@/services/transactionApis';
import { paymentMethods } from '@/schemas/transactionSchema';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

interface PaymentDetailsFormProps {
  control: Control<TransactionFormData>;
  totalAmount: number;
  depositAmount: number;
  currency: string;
}

export function PaymentDetailsForm({ control, totalAmount, depositAmount, currency }: PaymentDetailsFormProps) {
  const balanceDue = totalAmount - depositAmount;

  return (
    <Card className={cn('bg-background border-border')}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2 text-foreground')}>
          <DollarSign className="h-5 w-5 text-purple-600" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="payment_method"
            label="Payment Method"
            type="select"
            options={paymentMethods}
            required
          />
          <FormFieldWrapper
            control={control}
            name="payment_reference"
            label="Payment Reference (Optional)"
            placeholder="Check # or transaction ID"
            description="Reference number for the payment"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="deposit_amount"
            label="Deposit Amount (Optional)"
            type="number"
            isCurrency
            placeholder="0.00"
          />
          <FormFieldWrapper
            control={control}
            name="payment_due_date"
            label="Payment Due Date (Optional)"
            type="date"
            placeholder="Pick a date"
            description="When remaining balance is due"
          />
        </div>
        <div className={cn('p-4 rounded-lg bg-background border border-border')}>
          <div className={cn('text-sm font-medium text-foreground')}>Payment Summary</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className={cn('text-muted-foreground')}>Total Amount:</div>
            <div className={cn('text-right text-foreground')}>
              {totalAmount.toFixed(2)} {currency}
            </div>
            <div className={cn('text-muted-foreground')}>Deposit Amount:</div>
            <div className={cn('text-right text-foreground')}>
              {depositAmount.toFixed(2)} {currency}
            </div>
            <Separator className={cn('col-span-2 my-1 bg-border')} />
            <div className={cn('font-medium text-muted-foreground')}>Balance Due:</div>
            <div className={cn('text-right font-medium text-foreground')}>
              {balanceDue.toFixed(2)} {currency}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="insurance_policy_number"
            label="Insurance Policy Number (Optional)"
            placeholder="Enter policy number"
          />
          <FormFieldWrapper
            control={control}
            name="insurance_amount"
            label="Insurance Amount (Optional)"
            type="number"
            isCurrency
            placeholder="0.00"
          />
        </div>
      </CardContent>
    </Card>
  );
}