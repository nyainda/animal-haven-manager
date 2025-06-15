import React from 'react';
import { DollarSign } from 'lucide-react';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  required?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '0.00',
  required = false,
}) => {
  return (
    <FormItem>
      <FormLabel>{label}{required && ' *'}</FormLabel>
      <FormControl>
        <div className="relative">
          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            step="0.01"
            placeholder={placeholder}
            className="pl-8"
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            value={value ?? ''}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};