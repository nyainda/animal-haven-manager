import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper';
import { Control } from 'react-hook-form';
import { TransactionFormData } from '@/services/transactionApis';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface DocumentsFormProps {
  control: Control<TransactionFormData>;
}

export function DocumentsForm({ control }: DocumentsFormProps) {
  return (
    <Card className={cn('bg-background border-border')}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2 text-foreground')}>
          <FileText className="h-5 w-5 text-purple-600" />
          Documents & Certification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="invoice_number"
            label="Invoice Number (Optional)"
            placeholder="Enter invoice number"
          />
          <FormFieldWrapper
            control={control}
            name="contract_number"
            label="Contract Number (Optional)"
            placeholder="Enter contract number"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="health_certificate_number"
            label="Health Certificate Number (Optional)"
            placeholder="Enter health certificate #"
            description="Required for livestock transport"
          />
          <FormFieldWrapper
            control={control}
            name="transport_license_number"
            label="Transport License Number (Optional)"
            placeholder="Enter transport license #"
          />
        </div>
        <FormFieldWrapper
          control={control}
          name="special_conditions"
          label="Special Conditions (Optional)"
          type="textarea"
          placeholder="Enter any special conditions"
        />
        <FormFieldWrapper
          control={control}
          name="terms_and_conditions"
          label="Terms & Conditions (Optional)"
          type="textarea"
          placeholder="Enter the terms and conditions"
        />
        <FormFieldWrapper
          control={control}
          name="terms_accepted"
          label="I confirm that all parties have accepted the terms and conditions"
          type="checkbox"
        />
      </CardContent>
    </Card>
  );
}