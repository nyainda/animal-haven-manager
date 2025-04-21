import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Transaction,
  TransactionFormData,
  createTransaction,
  updateTransaction,
  fetchTransaction,
} from '@/services/transactionApis';

// Validation schema matching the working payload
const formSchema = z.object({
  transaction_type: z.string().min(1, 'Transaction type is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  tax_amount: z.number().min(0, 'Tax amount must be a positive number'),
  currency: z.string().min(1, 'Currency is required'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  details: z.string().nullable().optional(),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_reference: z.string().nullable().optional(),
  deposit_amount: z.number().min(0, 'Deposit amount must be a positive number').nullable().optional(),
  payment_due_date: z.string().nullable().optional(),
  seller_id: z.number().min(1, 'Seller ID is required'),
  buyer_id: z.number().min(1, 'Buyer ID is required'),
  seller_name: z.string().min(1, 'Seller name is required'),
  buyer_name: z.string().min(1, 'Buyer name is required'),
});

const transactionTypes = ['sale', 'purchase', 'lease', 'transfer'];
const paymentMethods = ['credit_card', 'bank_transfer', 'cash', 'check', 'paypal'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

const TransactionForm: React.FC = () => {
  const { id: animalId, transactionId } = useParams<{ id: string; transactionId?: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_type: '',
      price: 0,
      tax_amount: 0,
      currency: 'USD',
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      delivery_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      details: null,
      payment_method: '',
      payment_reference: null,
      deposit_amount: null,
      payment_due_date: null,
      seller_id: undefined,
      buyer_id: undefined,
      seller_name: '',
      buyer_name: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (transactionId && animalId) {
      const loadTransaction = async () => {
        try {
          console.log('[TransactionForm] Loading transaction:', { animalId, transactionId });
          const transaction = await fetchTransaction(animalId, transactionId);
          form.reset({
            transaction_type: transaction.transaction_type || '',
            price: transaction.price || 0,
            tax_amount: transaction.tax_amount || 0,
            currency: transaction.currency || 'USD',
            transaction_date: transaction.transaction_date || '',
            delivery_date: transaction.delivery_date || '',
            details: transaction.details || null,
            payment_method: transaction.payment_method || '',
            payment_reference: transaction.payment_reference || null,
            deposit_amount: transaction.deposit_amount || null,
            payment_due_date: transaction.payment_due_date || null,
            seller_id: transaction.seller_id || undefined,
            buyer_id: transaction.buyer_id || undefined,
            seller_name: transaction.seller_name || '',
            buyer_name: transaction.buyer_name || '',
          });
        } catch (error) {
          console.error('[TransactionForm] Failed to load transaction:', error);
          toast.error('Failed to load transaction data');
        }
      };
      loadTransaction();
    }
  }, [transactionId, animalId, form]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      if (!animalId) throw new Error('Animal ID is required');

      console.log('[TransactionForm] Submitting transaction data:', JSON.stringify(data, null, 2));

      let result;
      if (transactionId) {
        result = await updateTransaction(animalId, transactionId, data);
      } else {
        result = await createTransaction(animalId, data);
      }

      toast.success(transactionId ? 'Transaction updated successfully' : 'Transaction created successfully');
      navigate(`/animals/${animalId}/transactions`);
    } catch (error: any) {
      console.error('[TransactionForm] Failed to save transaction:', error);
      const errorMessage = error.message || 'Unknown error';
      toast.error(`Failed to save transaction: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/animals/${animalId}/transactions`)}
              className="rounded-full h-10 w-10 border-border hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {transactionId ? 'Edit Transaction' : 'New Transaction'}
            </h1>
          </div>
        </header>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transaction_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Transaction Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary">
                              <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transactionTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Tax Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter tax amount"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transaction_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-foreground">Transaction Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal bg-background border-border text-foreground hover:bg-muted',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), 'PPP HH:mm:ss')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? parseISO(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'") : '')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-foreground">Delivery Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal bg-background border-border text-foreground hover:bg-muted',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), 'PPP HH:mm:ss')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? parseISO(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'") : '')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deposit_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Deposit Amount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter deposit amount"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-foreground">Payment Due Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal bg-background border-border text-foreground hover:bg-muted',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), 'PPP HH:mm:ss')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="seller_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Seller ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter seller ID"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buyer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Buyer ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter buyer ID"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="seller_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Seller Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter seller name"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buyer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Buyer Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter buyer name"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter transaction details"
                          className="bg-background border-border text-foreground focus:ring-primary min-h-[100px]"
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
                  name="payment_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Payment Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter payment reference"
                          className="bg-background border-border text-foreground focus:ring-primary"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/animals/${animalId}/transactions`)}
                    disabled={isSubmitting}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(handleFormSubmit)}
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : transactionId
                      ? 'Update Transaction'
                      : 'Create Transaction'}
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionForm;