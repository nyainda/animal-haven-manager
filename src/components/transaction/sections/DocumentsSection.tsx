import React from 'react';
import { FileText } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TransactionFormData } from '@/types/transaction';

interface DocumentsSectionProps {
  form: UseFormReturn<TransactionFormData>;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Documents & Certification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter invoice number"
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
            name="contract_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contract number"
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
            name="health_certificate_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Certificate Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter health certificate number"
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
            name="transport_license_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport License Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter transport license number"
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
        <FormField
          control={form.control}
          name="special_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Conditions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter special conditions"
                  className="min-h-[100px]"
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
          name="terms_and_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Conditions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter terms and conditions"
                  className="min-h-[100px]"
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
          name="terms_accepted"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <input
                    type="checkbox"
                    id="terms-accepted"
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </FormControl>
                <FormLabel htmlFor="terms-accepted" className="text-sm font-medium">
                  Terms and conditions accepted
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};