import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper';
import { Control } from 'react-hook-form';
import { TransactionFormData } from '@/services/transactionApis';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface SellerInfoFormProps {
  control: Control<TransactionFormData>;
}

export function SellerInfoForm({ control }: SellerInfoFormProps) {
  return (
    <Card className={cn('bg-background border-border')}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2 text-foreground')}>
          <User className="h-5 w-5 text-purple-600" />
          Seller Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="seller_name"
            label="Seller Name"
            placeholder="Enter seller's full name"
            required
          />
          <FormFieldWrapper
            control={control}
            name="seller_company"
            label="Company/Organization (Optional)"
            placeholder="Enter company/organization name"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="seller_id"
            label="Seller ID (Optional)"
            type="number"
            placeholder="Enter seller ID"
          />
          <FormFieldWrapper
            control={control}
            name="seller_tax_id"
            label="Tax ID (Optional)"
            placeholder="Enter tax ID"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="seller_email"
            label="Email (Optional)"
            type="email"
            placeholder="Enter email address"
          />
          <FormFieldWrapper
            control={control}
            name="seller_phone"
            label="Phone (Optional)"
            type="tel"
            placeholder="Enter phone number"
          />
        </div>
        <FormFieldWrapper
          control={control}
          name="seller_address"
          label="Address (Optional)"
          placeholder="Enter street address"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <FormFieldWrapper
            control={control}
            name="seller_city"
            label="City (Optional)"
            placeholder="City"
          />
          <FormFieldWrapper
            control={control}
            name="seller_state"
            label="State/Province (Optional)"
            placeholder="State"
          />
          <FormFieldWrapper
            control={control}
            name="seller_postal_code"
            label="Postal Code (Optional)"
            placeholder="Postal code"
          />
          <FormFieldWrapper
            control={control}
            name="seller_country"
            label="Country (Optional)"
            placeholder="Country"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            control={control}
            name="seller_identification"
            label="Identification (Optional)"
            placeholder="Enter identification number"
          />
          <FormFieldWrapper
            control={control}
            name="seller_license_number"
            label="License Number (Optional)"
            placeholder="Enter license number"
          />
        </div>
      </CardContent>
    </Card>
  );
}