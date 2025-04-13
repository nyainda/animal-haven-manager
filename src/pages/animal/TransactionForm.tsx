import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
import {
  Transaction,
  TransactionFormData,
  createTransaction,
  updateTransaction,
  fetchTransaction,
} from '@/services/transactionApis'; 

// Validation schema
const formSchema = z.object({
  transaction_type: z.string().min(1, 'Transaction type is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  tax_amount: z.number().min(0, 'Tax amount must be a positive number'),
  currency: z.string().min(1, 'Currency is required'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  details: z.string().optional(),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_reference: z.string().optional(),
  deposit_amount: z.number().min(0, 'Deposit amount must be a positive number').optional(),
  payment_due_date: z.string().optional(),
  transaction_status: z.string().optional(),
  seller_name: z.string().min(1, 'Seller name is required'),
  buyer_name: z.string().min(1, 'Buyer name is required'),
  seller_company: z.string().optional(),
  buyer_company: z.string().optional(),
  invoice_number: z.string().optional(),
  health_certificate_number: z.string().optional(),
  delivery_instructions: z.string().optional(),
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
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      delivery_date: format(new Date(), 'yyyy-MM-dd'),
      details: '',
      payment_method: '',
      payment_reference: '',
      deposit_amount: undefined,
      payment_due_date: '',
      transaction_status: '',
      seller_name: '',
      buyer_name: '',
      seller_company: '',
      buyer_company: '',
      invoice_number: '',
      health_certificate_number: '',
      delivery_instructions: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (transactionId && animalId) {
      const loadTransaction = async () => {
        try {
          const transaction = await fetchTransaction(animalId, transactionId);
          form.reset({
            transaction_type: transaction.transaction_type,
            price: transaction.price,
            tax_amount: transaction.tax_amount,
            currency: transaction.currency,
            transaction_date: transaction.transaction_date.split('T')[0],
            delivery_date: transaction.delivery_date.split('T')[0],
            details: transaction.details || '',
            payment_method: transaction.payment_method,
            payment_reference: transaction.payment_reference || '',
            deposit_amount: transaction.deposit_amount || undefined,
            payment_due_date: transaction.payment_due_date
              ? transaction.payment_due_date.split('T')[0]
              : '',
            transaction_status: transaction.transaction_status || '',
            seller_name: transaction.seller_name || '',
            buyer_name: transaction.buyer_name || '',
            seller_company: transaction.seller_company || '',
            buyer_company: transaction.buyer_company || '',
            invoice_number: transaction.invoice_number || '',
            health_certificate_number: transaction.health_certificate_number || '',
            delivery_instructions: transaction.delivery_instructions || '',
          });
        } catch (error) {
          console.error('Failed to load transaction:', error);
        }
      };
      loadTransaction();
    }
  }, [transactionId, animalId, form]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      if (!animalId) throw new Error('Animal ID is required');
      if (transactionId) {
        await updateTransaction(animalId, transactionId, data);
      } else {
        await createTransaction(animalId, data);
      }
      navigate(`/animals/${animalId}/transactions`);
    } catch (error) {
      console.error('Failed to save transaction:', error);
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
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="transaction_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Transaction Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                          defaultValue={field.value}
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                                  format(new Date(field.value), 'PPP')
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
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
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
                                  format(new Date(field.value), 'PPP')
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
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
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
                        defaultValue={field.value}
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
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value || ''}
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
                                  format(new Date(field.value), 'PPP')
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
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="seller_company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Seller Company (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter seller company"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buyer_company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Buyer Company (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter buyer company"
                            className="bg-background border-border text-foreground focus:ring-primary"
                            {...field}
                            value={field.value || ''}
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
                          value={field.value || ''}
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
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Invoice Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter invoice number"
                          className="bg-background border-border text-foreground focus:ring-primary"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="health_certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Health Certificate Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter health certificate number"
                          className="bg-background border-border text-foreground focus:ring-primary"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Delivery Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter delivery instructions"
                          className="bg-background border-border text-foreground focus:ring-primary min-h-[100px]"
                          {...field}
                          value={field.value || ''}
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
                    type="submit"
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionForm;