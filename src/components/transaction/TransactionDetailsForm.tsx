import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper';
import { Control } from 'react-hook-form';
import { TransactionFormData } from '@/services/transactionApis';
import { transactionTypes, transactionStatusOptions, currencies } from '@/schemas/transactionSchema';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

interface TransactionDetailsFormProps {
  control: Control<TransactionFormData>;
  price: number;
  taxAmount: number;
  currency: string;
}

export function TransactionDetailsForm({ control, price, taxAmount, currency }: TransactionDetailsFormProps) {
  const totalAmount = price + taxAmount;

  return (
    <Card className={cn('bg-background border-border')}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2 text-foreground')}>
          <Tag className="h-5 w-5 text-purple-600" />
          Transaction Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="animal_id"
            label="Animal ID (Optional)"
            placeholder="Enter animal ID"
            description="The unique identifier for the animal, if applicable"
          />
          <FormFieldWrapper
            control={control}
            name="transaction_status"
            label="Transaction Status"
            type="select"
            options={transactionStatusOptions}
            description="Current status of the transaction"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="transaction_type"
            label="Transaction Type"
            type="select"
            options={transactionTypes}
            required
          />
          <FormFieldWrapper
            control={control}
            name="transaction_date"
            label="Transaction Date"
            type="date"
            placeholder="Pick a date"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormFieldWrapper
            control={control}
            name="price"
            label="Price"
            type="number"
            isCurrency
            placeholder="0.00"
            required
          />
          <FormFieldWrapper
            control={control}
            name="tax_amount"
            label="Tax Amount"
            type="number"
            isCurrency
            placeholder="0.00"
            required
          />
          <FormFieldWrapper
            control={control}
            name="currency"
            label="Currency"
            type="select"
            options={currencies}
            required
          />
        </div>
        <div className={cn('p-4 rounded-lg bg-background border border-border')}>
          <div className={cn('text-sm font-medium text-foreground')}>Transaction Summary</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className={cn('text-muted-foreground')}>Price:</div>
            <div className={cn('text-right text-foreground')}>
              {price.toFixed(2)} {currency}
            </div>
            <div className={cn('text-muted-foreground')}>Tax:</div>
            <div className={cn('text-right text-foreground')}>
              {taxAmount.toFixed(2)} {currency}
            </div>
            <div className={cn('font-medium text-muted-foreground')}>Total:</div>
            <div className={cn('text-right font-medium text-foreground')}>
              {totalAmount.toFixed(2)} {currency}
            </div>
          </div>
        </div>
        <FormFieldWrapper
          control={control}
          name="details"
          label="Transaction Details (Optional)"
          type="textarea"
          placeholder="Enter transaction details"
        />
        <FormFieldWrapper
          control={control}
          name="location_of_sale"
          label="Location of Sale (Optional)"
          placeholder="Enter transaction location"
          description="Where the transaction took place"
        />
        <FormFieldWrapper
          control={control}
          name="delivery_date"
          label="Delivery Date (Optional)"
          type="date"
          placeholder="Pick a date"
          description="When the animal will be delivered"
        />
        <FormFieldWrapper
          control={control}
          name="delivery_instructions"
          label="Delivery Instructions (Optional)"
          type="textarea"
          placeholder="Special instructions for delivery"
        />
      </CardContent>
    </Card>
  );
}