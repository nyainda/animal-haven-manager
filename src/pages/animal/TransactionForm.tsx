import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, ChevronLeft, DollarSign, FileText, Tag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { toast } from 'sonner';
import {
  TransactionFormData,
  createTransaction,
  updateTransaction,
  fetchTransaction,
} from '@/services/transactionApis';

// Form schema
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
  payment_due_date: z.string().nullable().optional(),
  seller_id: z.number().min(1, 'Seller ID is required').optional(),
  buyer_id: z.number().min(1, 'Buyer ID is required').optional(),
  seller_name: z.string().min(1, 'Seller name is required'),
  seller_company: z.string().nullable().optional(),
  seller_tax_id: z.string().nullable().optional(),
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
  insurance_amount: z.number().min(0, 'Insurance amount must be a non-negative number').nullable().optional(),
});

const transactionTypes = ['sale', 'purchase', 'lease', 'transfer', 'other'];
const transactionStatusOptions = ['pending', 'completed', 'cancelled', 'in_progress'];
const paymentMethods = ['credit_card', 'bank_transfer', 'cash', 'check', 'paypal', 'other'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'];

const TransactionForm: React.FC = () => {
  const { id: animalId, transactionId } = useParams<{ id: string; transactionId?: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animal_id: animalId || '',
      transaction_type: '',
     // transaction_status: 'pending',
      price: 0,
      tax_amount: 0,
      currency: 'USD',
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      delivery_date: null,
      details: null,
      payment_method: '',
      payment_reference: null,
      deposit_amount: null,
      payment_due_date: null,
      seller_id: undefined,
      buyer_id: undefined,
      seller_name: '',
      seller_company: null,
      seller_tax_id: null,
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

  // Fetch transaction data for editing
  useEffect(() => {
    if (transactionId && animalId) {
      setIsLoading(true);
      fetchTransaction(animalId, transactionId)
        .then((transaction) => {
          const normalizedData: TransactionFormData = {
            ...transaction,
            animal_id: transaction.animal_id || animalId,
            price: transaction.price || 0,
            tax_amount: transaction.tax_amount || 0,
            deposit_amount: transaction.deposit_amount || null,
            insurance_amount: transaction.insurance_amount || null,
            seller_id: transaction.seller_id || undefined,
            buyer_id: transaction.buyer_id || undefined,
            transaction_date: transaction.transaction_date || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            delivery_date: transaction.delivery_date || null,
            payment_due_date: transaction.payment_due_date || null,
            details: transaction.details || null,
            payment_reference: transaction.payment_reference || null,
            seller_name: transaction.seller_name || '',
            seller_company: transaction.seller_company || null,
            seller_tax_id: transaction.seller_tax_id || null,
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
          };
          form.reset(normalizedData);
          toast.success('Transaction data loaded successfully');
        })
        .catch((error) => {
          console.error('[TransactionForm] Failed to fetch transaction:', error);
          toast.error(`Failed to load transaction: ${error.message || 'Unknown error'}`);
        })
        .finally(() => setIsLoading(true));
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
        toast.success('Transaction updated successfully');
      } else {
        result = await createTransaction(effectiveAnimalId, data);
        toast.success('Transaction created successfully');
      }

      navigate(`/animals/${effectiveAnimalId}/transactions`);
    } catch (error: any) {
      console.error('[TransactionForm] Failed to save transaction:', error);
      toast.error(`Failed to save transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const price = form.watch('price') || 0;
  const taxAmount = form.watch('tax_amount') || 0;
  const totalAmount = price + taxAmount;
  const depositAmount = form.watch('deposit_amount') || 0;
  const balanceDue = totalAmount - depositAmount;

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className={cn('bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8')}>
      <div className="max-w-3xl mq-450:max-w-full mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/animals/${animalId || 'no-animal-id'}/transactions`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {transactionId ? 'Edit Transaction' : 'New Transaction'}
          </h1>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="animal_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animal ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter animal ID"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transaction_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="transaction_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transactionStatusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
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
                      <FormItem>
                        <FormLabel>Transaction Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn('text-left font-normal', !field.value && 'text-muted-foreground')}
                              >
                                {field.value ? format(parseISO(field.value), 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
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
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
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
                            <SelectTrigger>
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
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium">Transaction Summary</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Price:</div>
                    <div className="text-right">{price.toFixed(2)} {form.watch('currency')}</div>
                    <div className="text-muted-foreground">Tax:</div>
                    <div className="text-right">{taxAmount.toFixed(2)} {form.watch('currency')}</div>
                    <div className="text-muted-foreground font-medium">Total:</div>
                    <div className="text-right font-medium">{totalAmount.toFixed(2)} {form.watch('currency')}</div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter transaction details"
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
                  name="location_of_sale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location of Sale (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter location"
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
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn('text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                              {field.value ? format(parseISO(field.value), 'PPP') : 'Pick a date'}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <FormField
                  control={form.control}
                  name="delivery_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter delivery instructions"
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
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seller_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seller Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter seller's full name" {...field} />
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
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
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
                    name="seller_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seller ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter seller ID"
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
                    name="seller_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email"
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
                          {...field}
                          value={field.value ?? ''}
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
                    name="seller_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
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
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter state"
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
                    name="seller_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter country"
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
                            placeholder="Enter postal code"
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
                    name="seller_identification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identification (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter identification number"
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

            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buyer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buyer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter buyer's full name" {...field} />
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
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
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
                    name="buyer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buyer ID (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter buyer ID"
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
                    name="buyer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email"
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
                          {...field}
                          value={field.value ?? ''}
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
                    name="buyer_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
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
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter state"
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
                    name="buyer_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter country"
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
                            placeholder="Enter postal code"
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
                    name="buyer_identification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identification (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter identification number"
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

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                  <FormField
                    control={form.control}
                    name="payment_reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Reference (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter payment reference"
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
                    name="deposit_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deposit Amount (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
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
                      <FormItem>
                        <FormLabel>Payment Due Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn('text-left font-normal', !field.value && 'text-muted-foreground')}
                              >
                                {field.value ? format(parseISO(field.value), 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-medium">Payment Summary</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Total Amount:</div>
                    <div className="text-right">{totalAmount.toFixed(2)} {form.watch('currency')}</div>
                    <div className="text-muted-foreground">Deposit Amount:</div>
                    <div className="text-right">{depositAmount.toFixed(2)} {form.watch('currency')}</div>
                    <div className="text-muted-foreground font-medium">Balance Due:</div>
                    <div className="text-right font-medium">{balanceDue.toFixed(2)} {form.watch('currency')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance_policy_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Policy Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter policy number"
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
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8"
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

            {/* Documents & Certification */}
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

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${animalId || 'no-animal-id'}/transactions`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
      </div>
    </div>
  );
};

export default TransactionForm;