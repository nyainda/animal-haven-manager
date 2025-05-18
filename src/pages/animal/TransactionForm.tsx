import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, ChevronLeft, DollarSign, FileText, Tag, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Transaction,
  TransactionFormData,
  createTransaction,
  updateTransaction,
  fetchTransaction,
} from '@/services/transactionApis';

const formSchema = z.object({
  animal_id: z.string().optional(),
  transaction_type: z.string().min(1, 'Transaction type is required'),
  transaction_status: z.string().min(1, 'Status is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  tax_amount: z.number().min(0, 'Tax amount must be a non-negative number'),
  currency: z.string().min(1, 'Currency is required'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  delivery_date: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
  payment_method: z.string().min(1, 'Payment method is required'),
  payment_reference: z.string().nullable().optional(),
  deposit_amount: z.number().min(0, 'Deposit amount must be a positive number').nullable().optional(),
  balance_due: z.number().nullable().optional(),
  payment_due_date: z.string().nullable().optional(),
  seller_id: z.number().min(1, 'Seller ID is required').optional(),
  buyer_id: z.number().min(1, 'Buyer ID is required').optional(),
  seller_name: z.string().min(1, 'Seller name is required'),
  seller_company: z.string().nullable().optional(),
  seller_tax_id: z.string().nullable().optional(),
  seller_contact: z.string().nullable().optional(),
  seller_email: z.string().email().nullable().optional(),
  seller_phone: z.string().nullable().optional(),
  seller_address: z.string().nullable().optional(),
  seller_city: z.string().nullable().optional(),
  seller_state: z.string().nullable().optional(),
  seller_country: z.string().nullable().optional(),
  seller_postal_code: z.string().nullable().optional(),
  seller_identification: z.string().nullable().optional(),
  seller_license_number: z.string().nullable().optional(),
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_company: z.string().nullable().optional(),
  buyer_tax_id: z.string().nullable().optional(),
  buyer_contact: z.string().nullable().optional(),
  buyer_email: z.string().email().nullable().optional(),
  buyer_phone: z.string().nullable().optional(),
  buyer_address: z.string().nullable().optional(),
  buyer_city: z.string().nullable().optional(),
  buyer_state: z.string().nullable().optional(),
  buyer_country: z.string().nullable().optional(),
  buyer_postal_code: z.string().nullable().optional(),
  buyer_identification: z.string().nullable().optional(),
  buyer_license_number: z.string().nullable().optional(),
  invoice_number: z.string().nullable().optional(),
  contract_number: z.string().nullable().optional(),
  terms_accepted: z.boolean().nullable().optional(),
  health_certificate_number: z.string().nullable().optional(),
  transport_license_number: z.string().nullable().optional(),
  location_of_sale: z.string().nullable().optional(),
  terms_and_conditions: z.string().nullable().optional(),
  special_conditions: z.string().nullable().optional(),
  delivery_instructions: z.string().nullable().optional(),
  insurance_policy_number: z.string().nullable().optional(),
  insurance_amount: z.number().nullable().optional(),
});

const transactionTypes = ['sale', 'purchase', 'lease', 'trade', 'transfer', 'other'];
const transactionStatusOptions = ['pending', 'completedksom', 'cancelled', 'in_progress'];
const paymentMethods = ['credit_card', 'bank_transfer', 'cash', 'check', 'paypal', 'other'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];

const TransactionForm: React.FC = () => {
  const { id: animalId, transactionId } = useParams<{ id: string; transactionId?: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animal_id: animalId || '',
      transaction_type: '',
      transaction_status: 'pending',
      price: 0,
      tax_amount: 0,
      currency: 'USD',
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      delivery_date: null,
      details: null,
      payment_method: '',
      payment_reference: null,
      deposit_amount: null,
      balance_due: null,
      payment_due_date: null,
      seller_id: undefined,
      buyer_id: undefined,
      seller_name: '',
      seller_company: null,
      seller_tax_id: null,
      seller_contact: null,
      seller_email: null,
      seller_phone: null,
      seller_address: null,
      seller_city: null,
      seller_state: null,
      seller_country: null,
      seller_postal_code: null,
      seller_identification: null,
      seller_license_number: null,
      buyer_name: '',
      buyer_company: null,
      buyer_tax_id: null,
      buyer_contact: null,
      buyer_email: null,
      buyer_phone: null,
      buyer_address: null,
      buyer_city: null,
      buyer_state: null,
      buyer_country: null,
      buyer_postal_code: null,
      buyer_identification: null,
      buyer_license_number: null,
      invoice_number: null,
      contract_number: null,
      terms_accepted: false,
      health_certificate_number: null,
      transport_license_number: null,
      location_of_sale: null,
      terms_and_conditions: null,
      special_conditions: null,
      delivery_instructions: null,
      insurance_policy_number: null,
      insurance_amount: null,
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
            animal_id: transaction.animal_id || animalId || '',
            transaction_type: transaction.transaction_type || '',
            transaction_status: transaction.transaction_status || 'pending',
            price: transaction.price || 0,
            tax_amount: transaction.tax_amount || 0,
            currency: transaction.currency || 'USD',
            transaction_date: transaction.transaction_date || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            delivery_date: transaction.delivery_date || null,
            details: transaction.details || null,
            payment_method: transaction.payment_method || '',
            payment_reference: transaction.payment_reference || null,
            deposit_amount: transaction.deposit_amount || null,
            balance_due: transaction.balance_due || null,
            payment_due_date: transaction.payment_due_date || null,
            seller_id: transaction.seller_id || undefined,
            buyer_id: transaction.buyer_id || undefined,
            seller_name: transaction.seller_name || '',
            seller_company: transaction.seller_company || null,
            seller_tax_id: transaction.seller_tax_id || null,
            seller_contact: transaction.seller_contact || null,
            seller_email: transaction.seller_email || null,
            seller_phone: transaction.seller_phone || null,
            seller_address: transaction.seller_address || null,
            seller_city: transaction.seller_city || null,
            seller_state: transaction.seller_state || null,
            seller_country: transaction.seller_country || null,
            seller_postal_code: transaction.seller_postal_code || null,
            seller_identification: transaction.seller_identification || null,
            seller_license_number: transaction.seller_license_number || null,
            buyer_name: transaction.buyer_name || '',
            buyer_company: transaction.buyer_company || null,
            buyer_tax_id: transaction.buyer_tax_id || null,
            buyer_contact: transaction.buyer_contact || null,
            buyer_email: transaction.buyer_email || null,
            buyer_phone: transaction.buyer_phone || null,
            buyer_address: transaction.buyer_address || null,
            buyer_city: transaction.buyer_city || null,
            buyer_state: transaction.buyer_state || null,
            buyer_country: transaction.buyer_country || null,
            buyer_postal_code: transaction.buyer_postal_code || null,
            buyer_identification: transaction.buyer_identification || null,
            buyer_license_number: transaction.buyer_license_number || null,
            invoice_number: transaction.invoice_number || null,
            contract_number: transaction.contract_number || null,
            terms_accepted: transaction.terms_accepted || false,
            health_certificate_number: transaction.health_certificate_number || null,
            transport_license_number: transaction.transport_license_number || null,
            location_of_sale: transaction.location_of_sale || null,
            terms_and_conditions: transaction.terms_and_conditions || null,
            special_conditions: transaction.special_conditions || null,
            delivery_instructions: transaction.delivery_instructions || null,
            insurance_policy_number: transaction.insurance_policy_number || null,
            insurance_amount: transaction.insurance_amount || null,
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
      const effectiveAnimalId = data.animal_id || animalId || 'no-animal-id';
      console.log('[TransactionForm] Submitting transaction data:', JSON.stringify(data, null, 2));

      let result;
      if (transactionId) {
        result = await updateTransaction(effectiveAnimalId, transactionId, data);
      } else {
        result = await createTransaction(effectiveAnimalId, data);
      }

      toast.success(transactionId ? 'Transaction updated successfully' : 'Transaction created successfully');
      navigate(`/animals/${effectiveAnimalId}/transactions`);
    } catch (error: any) {
      console.error('[TransactionForm] Failed to save transaction:', error);
      const errorMessage = error.message || 'Unknown error';
      toast.error(`Failed to save transaction: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const price = form.watch('price') || 0;
  const taxAmount = form.watch('tax_amount') || 0;
  const totalAmount = price + taxAmount;
  const depositAmount = form.watch('deposit_amount') || 0;
  const balanceDue = totalAmount - depositAmount;

  return (
    <div className={cn('bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8')}>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/animals/${animalId || 'no-animal-id'}/transactions`)}
              className={cn(
                'rounded-full h-10 w-10 border-border text-purple-700 hover:bg-muted dark:text-purple-300 dark:hover:bg-muted'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1
                className={cn(
                  'text-2xl sm:text-3xl font-bold text-foreground'
                )}
              >
                {transactionId ? 'Edit Transaction' : 'New Transaction'}
              </h1>
              <p
                className={cn(
                  'text-sm mt-1 text-muted-foreground'
                )}
              >
                Manage transaction details for {animalId || 'unspecified animal'}
              </p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="transaction" className="w-full">
          <TabsList
            className={cn(
              'grid grid-cols-4 mb-8 bg-background border-border'
            )}
          >
            <TabsTrigger value="transaction" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Transaction</span>
            </TabsTrigger>
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Parties</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
              <TabsContent value="transaction" className="space-y-6">
                <Card
                  className={cn(
                    'bg-background border-border'
                  )}
                >
                  <CardHeader>
                    <CardTitle
                      className={cn(
                        'flex items-center gap-2 text-foreground'
                      )}
                    >
                      <Tag className="h-5 w-5 text-purple-600" />
                      Transaction Details
                    </CardTitle>
                    <FormDescription
                      className={cn(
                        'text-muted-foreground'
                      )}
                    >
                      Enter the basic details about this livestock transaction
                    </FormDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="animal_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Animal ID (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter animal ID"
                                className={cn(
                                  'border-border bg-background'
                                )}
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormDescription>
                              The unique identifier for the animal, if applicable
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transaction_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'border-border bg-background'
                                  )}
                                >
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                className={cn(
                                  'bg-background border-border'
                                )}
                              >
                                {transactionStatusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      {status === 'completed' && (
                                        <Check className="h-4 w-4 text-green-500" />
                                      )}
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Current status of the transaction
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="transaction_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'border-border bg-background'
                                  )}
                                >
                                  <SelectValue placeholder="Select transaction type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                className={cn(
                                  'bg-background border-border'
                                )}
                              >
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
                        name="transaction_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Transaction Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full pl-3 text-left font-normal border-border bg-background',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(parseISO(field.value), 'PPP HH:mm:ss')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className={cn(
                                  'w-auto p-0 bg-background border-border'
                                )}
                                align="start"
                              >
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign
                                  className={cn(
                                    'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground'
                                  )}
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  className={cn(
                                    'pl-8 border-border bg-background'
                                  )}
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  value={field.value || ''}
                                />
                              </div>
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
                            <FormLabel>Tax Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign
                                  className={cn(
                                    'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground'
                                  )}
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  className={cn(
                                    'pl-8 border-border bg-background'
                                  )}
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  value={field.value || ''}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'border-border bg-background'
                                  )}
                                >
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent
                                className={cn(
                                  'bg-background border-border'
                                )}
                              >
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

                    <div
                      className={cn(
                        'p-4 rounded-lg bg-background border border-border'
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-medium text-foreground'
                        )}
                      >
                        Transaction Summary
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div
                          className={cn(
                            'text-muted-foreground'
                          )}
                        >
                          Price:
                        </div>
                        <div
                          className={cn(
                            'text-right text-foreground'
                          )}
                        >
                          {price.toFixed(2)} {form.watch('currency')}
                        </div>
                        <div
                          className={cn(
                            'text-muted-foreground'
                          )}
                        >
                          Tax:
                        </div>
                        <div
                          className={cn(
                            'text-right text-foreground'
                          )}
                        >
                          {taxAmount.toFixed(2)} {form.watch('currency')}
                        </div>
                        <div
                          className={cn(
                            'font-medium text-muted-foreground'
                          )}
                        >
                          Total:
                        </div>
                        <div
                          className={cn(
                            'text-right font-medium text-foreground'
                          )}
                        >
                          {totalAmount.toFixed(2)} {form.watch('currency')}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Details (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter transaction details"
                              className={cn(
                                'min-h-[100px] border-border bg-background'
                              )}
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
                      name="location_of_sale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location of Sale (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter transaction location"
                              className={cn(
                                'border-border bg-background'
                              )}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription>
                            Where the transaction took place
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Delivery Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal border-border bg-background',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(parseISO(field.value), 'PPP HH:mm:ss')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className={cn(
                                'w-auto p-0 bg-background border-border'
                              )}
                              align="start"
                            >
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
                          <FormDescription>
                            When the animal will be delivered
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Special instructions for delivery"
                              className={cn(
                                'min-h-[100px] border-border bg-background'
                              )}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parties" className="space-y-6">
                <Card
                  className={cn(
                    'bg-background border-border'
                  )}
                >
                  <CardHeader>
                    <CardTitle
                      className={cn(
                        'flex items-center gap-2 text-foreground'
                      )}
                    >
                      <User className="h-5 w-5 text-purple-600" />
                      Seller Information
                    </CardTitle>
                    <FormDescription
                      className={cn(
                        'text-muted-foreground'
                      )}
                    >
                      Enter details about the seller
                    </FormDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="seller_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seller Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter seller's full name"
                                className={cn(
                                  'border-border bg-background'
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seller_company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company/Organization (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter company/organization name"
                                className={cn(
                                  'border-border bg-background'
                                )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="seller_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seller ID (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter seller ID"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="seller_tax_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter tax ID"
                                className={cn(
                                  'border-border bg-background'
                                )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="seller_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="seller_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter phone number"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                      name="seller_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter street address"
                              className={cn(
                                'border-border bg-background'
                              )}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <FormField
                        control={form.control}
                        name="seller_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="seller_state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="seller_postal_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Postal code"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="seller_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Country"
                                className={cn(
                                  'border-border bg-background'
                                )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="seller_identification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identification (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter identification number"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="seller_license_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter license number"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'bg-background border-border'
                  )}
                >
                  <CardHeader>
                    <CardTitle
                      className={cn(
                        'flex items-center gap-2 text-foreground'
                      )}
                    >
                      <User className="h-5 w-5 text-purple-600" />
                      Buyer Information
                    </CardTitle>
                    <FormDescription
                      className={cn(
                        'text-muted-foreground'
                      )}
                    >
                      Enter details about the buyer
                    </FormDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="buyer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buyer Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter buyer's full name"
                                className={cn(
                                  'border-border bg-background'
                                )}
                                {...field}
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
                            <FormLabel>Company/Organization (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter company/organization name"
                                className={cn(
                                  'border-border bg-background'
                                )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="buyer_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buyer ID (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter buyer ID"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="buyer_tax_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter tax ID"
                                className={cn(
                                  'border-border bg-background'
                                )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="buyer_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                        name="buyer_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter phone number"
                                className={cn(
                                  'border-border bg-background'
                                )}
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
                      name="buyer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter street address"
                              className={cn(
                                'border-border bg-background'
                              )}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <FormField
                          control={form.control}
                          name="buyer_city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                          name="buyer_state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="State"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                          name="buyer_postal_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Postal code"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                          name="buyer_country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Country"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="buyer_identification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Identification (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter identification number"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                          name="buyer_license_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Number (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter license number"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6">
                  <Card
                    className={cn(
                      'bg-background border-border'
                    )}
                  >
                    <CardHeader>
                      <CardTitle
                        className={cn(
                          'flex items-center gap-2 text-foreground'
                        )}
                      >
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Payment Details
                      </CardTitle>
                      <FormDescription
                        className={cn(
                          'text-muted-foreground'
                        )}
                      >
                        Enter payment information for this transaction
                      </FormDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="payment_method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      'border-border bg-background'
                                    )}
                                  >
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent
                                  className={cn(
                                    'bg-background border-border'
                                  )}
                                >
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

                        <FormField
                          control={form.control}
                          name="payment_reference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Reference (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Check # or transaction ID"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value || null)}
                                />
                              </FormControl>
                              <FormDescription>
                                Reference number for the payment
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="deposit_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Amount (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign
                                    className={cn(
                                      'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground'
                                    )}
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className={cn(
                                      'pl-8 border-border bg-background'
                                    )}
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                    value={field.value ?? ''}
                                  />
                                </div>
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
                              <FormLabel>Payment Due Date (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal border-border bg-background',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(parseISO(field.value), 'PPP HH:mm:ss')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className={cn(
                                    'w-auto p-0 bg-background border-border'
                                  )}
                                  align="start"
                                >
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
                              <FormDescription>
                                When remaining balance is due
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div
                        className={cn(
                          'p-4 rounded-lg bg-background border border-border'
                        )}
                      >
                        <div
                          className={cn(
                            'text-sm font-medium text-foreground'
                          )}
                        >
                          Payment Summary
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div
                            className={cn(
                              'text-muted-foreground'
                            )}
                          >
                            Total Amount:
                          </div>
                          <div
                            className={cn(
                              'text-right text-foreground'
                            )}
                          >
                            {totalAmount.toFixed(2)} {form.watch('currency')}
                          </div>
                          <div
                            className={cn(
                              'text-muted-foreground'
                            )}
                          >
                            Deposit Amount:
                          </div>
                          <div
                            className={cn(
                              'text-right text-foreground'
                            )}
                          >
                            {depositAmount.toFixed(2)} {form.watch('currency')}
                          </div>
                          <Separator
                            className={cn(
                              'col-span-2 my-1 bg-border'
                            )}
                          />
                          <div
                            className={cn(
                              'font-medium text-muted-foreground'
                            )}
                          >
                            Balance Due:
                          </div>
                          <div
                            className={cn(
                              'text-right font-medium text-foreground'
                            )}
                          >
                            {balanceDue.toFixed(2)} {form.watch('currency')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="insurance_policy_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Policy Number (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter policy number"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                          name="insurance_amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Amount (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign
                                    className={cn(
                                      'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground'
                                    )}
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className={cn(
                                      'pl-8 border-border bg-background'
                                    )}
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                    value={field.value ?? ''}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                  <Card
                    className={cn(
                      'bg-background border-border'
                    )}
                  >
                    <CardHeader>
                      <CardTitle
                        className={cn(
                          'flex items-center gap-2 text-foreground'
                        )}
                      >
                        <FileText className="h-5 w-5 text-purple-600" />
                        Documents & Certification
                      </CardTitle>
                      <FormDescription
                        className={cn(
                          'text-muted-foreground'
                        )}
                      >
                        Enter document information for this transaction
                      </FormDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="invoice_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Invoice Number (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter invoice number"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="health_certificate_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Health Certificate Number (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter health certificate #"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value || null)}
                                />
                              </FormControl>
                              <FormDescription>
                                Required for livestock transport
                              </FormDescription>
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
                                  placeholder="Enter transport license #"
                                  className={cn(
                                    'border-border bg-background'
                                  )}
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
                                placeholder="Enter any special conditions"
                                className={cn(
                                  'min-h-[100px] border-border bg-background'
                                )}
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
                                placeholder="Enter the terms and conditions"
                                className={cn(
                                  'min-h-[100px] border-border bg-background'
                                )}
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
                              <input
                                type="checkbox"
                                id="terms-accepted"
                                checked={field.value || false}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className={cn(
                                  'h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500 dark:text-purple-400 dark:focus:ring-purple-700'
                                )}
                              />
                              <label
                                htmlFor="terms-accepted"
                                className={cn(
                                  'text-sm font-medium text-foreground'
                                )}
                              >
                                I confirm that all parties have accepted the terms and conditions
                              </label>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <div
                  className={cn(
                    'sticky bottom-0 z-10 p-4 shadow-md border-t rounded-b-lg bg-background border-border'
                  )}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={form.formState.isValid ? 'success' : 'secondary'}
                        className={cn(
                          form.formState.isValid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {form.formState.isValid ? 'Ready to submit' : 'Please complete all required fields'}
                      </Badge>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'border-border text-foreground hover:bg-muted dark:hover:bg-muted'
                        )}
                        onClick={() => navigate(`/animals/${animalId || 'no-animal-id'}/transactions`)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className={cn(
                          'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600'
                        )}
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? 'Saving...'
                          : transactionId
                          ? 'Update Transaction'
                          : 'Create Transaction'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>
      </div>
    );
};

export default TransactionForm;