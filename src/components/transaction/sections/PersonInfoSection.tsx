import React from 'react';
import { User } from 'lucide-react';
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
import { TransactionFormData } from '@/types/transaction';

interface PersonInfoSectionProps {
  form: UseFormReturn<TransactionFormData>;
  type: 'seller' | 'buyer';
  title: string;
}

export const PersonInfoSection: React.FC<PersonInfoSectionProps> = ({ form, type, title }) => {
  const getFieldName = (field: string) => `${type}_${field}` as keyof TransactionFormData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={getFieldName('name')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{type === 'seller' ? 'Seller' : 'Buyer'} Name *</FormLabel>
                <FormControl>
                  <Input placeholder={`Enter ${type}'s full name`} {...field} value={field.value?.toString() || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={getFieldName('company')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter company name"
                    {...field}
                    value={field.value !== undefined ? String(field.value) : ''}
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
            name={getFieldName('id')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{type === 'seller' ? 'Seller' : 'Buyer'} ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={`Enter ${type} ID`}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    value={field.value !== undefined ? String(field.value) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={getFieldName('tax_id')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter tax ID"
                    {...field}
                    value={field.value !== undefined ? String(field.value) : ''}
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
            name={getFieldName('email')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={getFieldName('phone')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...field}
                    value={field.value !== undefined ? String(field.value) : ''}
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
          name={getFieldName('address')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter street address"
                  {...field}
                  value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={getFieldName('city')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter city"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={getFieldName('state')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>State (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter state"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
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
            name={getFieldName('country')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter country"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={getFieldName('postal_code')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter postal code"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
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
            name={getFieldName('identification')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identification (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter identification number"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={getFieldName('license_number')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter license number"
                    {...field}
                    value={typeof field.value === 'boolean' ? field.value.toString() : field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
