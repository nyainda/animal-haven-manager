import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Control, FieldValues, Path } from 'react-hook-form';

interface FormFieldWrapperProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'checkbox';
  options?: string[];
  isCurrency?: boolean;
  required?: boolean;
}

export function FormFieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'text',
  options,
  isCurrency,
  required,
}: FormFieldWrapperProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={type === 'date' ? 'flex flex-col' : ''}>
          <FormLabel>
            {label}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                className={cn('min-h-[100px] border-border bg-background')}
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            ) : type === 'select' && options ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={cn('border-border bg-background')}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className={cn('bg-background border-border')}>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'date' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-long border-border bg-background',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? format(parseISO(field.value), 'PPP HH:mm:ss') : <span>{placeholder}</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={cn('w-auto p-0 bg-background border-border')} align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parseISO(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'") : null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={name}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className={cn(
                    'h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500 dark:text-purple-400 dark:focus:ring-purple-700'
                  )}
                />
                <label htmlFor={name} className={cn('text-sm font-medium text-foreground')}>
                  {label}
                </label>
              </div>
            ) : (
              <div className={isCurrency ? 'relative' : ''}>
                {isCurrency && (
                  <DollarSign className={cn('absolute left-2 top-2.5 h-4 w-4 text-muted-foreground')} />
                )}
                <Input
                  type={type}
                  placeholder={placeholder}
                  className={cn('border-border bg-background', isCurrency && 'pl-8')}
                  {...field}
                  onChange={(e) =>
                    type === 'number'
                      ? field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      : field.onChange(e.target.value || null)
                  }
                  value={field.value ?? ''}
                />
              </div>
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}