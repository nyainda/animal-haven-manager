import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { createSupplier, updateSupplier, fetchSupplier, SupplierFormData } from '@/services/supplierApi';

// Define error state type
interface FormErrors {
  [key: string]: string[];
}

const AnimalSupplierForm: React.FC = () => {
  const { id: animalId, supplierId } = useParams<{ id: string; supplierId: string }>();
  const navigate = useNavigate();
  const isEditing = !!supplierId;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    type: 'feed',
    product_type: '',
    shop_name: '',
    contract_start_date: format(new Date(), 'yyyy-MM-dd'),
    contract_end_date: format(new Date(), 'yyyy-MM-dd'),
    supplier_importance: 'medium',
    inventory_level: 0,
    reorder_point: 0,
    minimum_order_quantity: 0,
    lead_time_days: 0,
    payment_terms: 'net30',
    credit_limit: 0,
    currency: 'USD',
    tax_rate: 0,
    supplier_rating: 0,
    status: 'active',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!isEditing || !animalId || !supplierId) return;
      setIsLoading(true);
      try {
        const supplier = await fetchSupplier(animalId, supplierId);
        setFormData({
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          tax_number: supplier.tax_number || undefined,
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          postal_code: supplier.postal_code || '',
          country: supplier.country || '',
          latitude: supplier.latitude || undefined,
          longitude: supplier.longitude || undefined,
          type: supplier.type || 'feed',
          product_type: supplier.product_type || '',
          shop_name: supplier.shop_name || '',
          business_registration_number: supplier.business_registration_number || undefined,
          contract_start_date: supplier.contract_start_date ? format(parseISO(supplier.contract_start_date), 'yyyy-MM-dd') : '',
          contract_end_date: supplier.contract_end_date ? format(parseISO(supplier.contract_end_date), 'yyyy-MM-dd') : '',
          account_holder: supplier.account_holder || undefined,
          account_number: supplier.account_number || undefined,
          bank_name: supplier.bank_name || undefined,
          bank_branch: supplier.bank_branch || undefined,
          swift_code: supplier.swift_code || undefined,
          iban: supplier.iban || undefined,
          supplier_importance: supplier.supplier_importance || 'medium',
          inventory_level: supplier.inventory_level || 0,
          reorder_point: supplier.reorder_point || 0,
          minimum_order_quantity: supplier.minimum_order_quantity || 0,
          lead_time_days: supplier.lead_time_days || 0,
          payment_terms: supplier.payment_terms || 'net30',
          credit_limit: supplier.credit_limit || 0,
          currency: supplier.currency || 'USD',
          tax_rate: supplier.tax_rate || 0,
          supplier_rating: supplier.supplier_rating || 0,
          status: supplier.status || 'active',
          notes: supplier.notes || undefined,
          contact_name: supplier.contact.name || undefined,
          contact_position: supplier.contact.position || undefined,
          contact_email: supplier.contact.email || undefined,
          contact_phone: supplier.contact.phone || undefined,
        });
        setErrors({});
      } catch (error) {
        toast.error('Failed to load supplier data');
        navigate(`/animals/${animalId}/suppliers`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupplierData();
  }, [animalId, supplierId, isEditing, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? Number(value) : 0 }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: format(date, 'yyyy-MM-dd') }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId) {
      toast.error('Animal ID is missing');
      return;
    }

    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country', 'type', 'product_type', 'shop_name'];
    const newErrors: FormErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field as keyof SupplierFormData]) {
        newErrors[field] = [`The ${field.replace('_', ' ')} field is required.`];
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isEditing && supplierId) {
        await updateSupplier(animalId, supplierId, formData);
      } else {
        await createSupplier(animalId, formData);
      }
      navigate(`/animals/${animalId}/suppliers`);
    } catch (error: any) {
      if (error.message && error.message.includes('API error')) {
        const errorData = JSON.parse(error.message.replace('API error: ', ''));
        if (errorData.errors) {
          setErrors(errorData.errors);
          toast.error(errorData.message || 'Failed to save supplier');
        } else {
          toast.error(errorData.message || 'Failed to save supplier');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading supplier data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(`/animals/${animalId}/suppliers`)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Suppliers
      </Button>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                {errors.name && <p className="text-red-500 text-sm">{errors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input id="tax_number" name="tax_number" value={formData.tax_number || ''} onChange={handleInputChange} />
                {errors.tax_number && <p className="text-red-500 text-sm">{errors.tax_number[0]}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required />
              {errors.address && <p className="text-red-500 text-sm">{errors.address[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Citys *</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                {errors.city && <p className="text-red-500 text-sm">{errors.city[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                {errors.state && <p className="text-red-500 text-sm">{errors.state[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} required />
                {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required />
                {errors.country && <p className="text-red-500 text-sm">{errors.country[0]}</p>}
              </div>
            </div>

            {/* Supplier Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <Label htmlFor="type">Type *</Label>
    <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="feed">Feed</SelectItem>
        <SelectItem value="equipment">Equipment</SelectItem>
        <SelectItem value="medicine">Medicine</SelectItem>
        <SelectItem value="veterinary_services">Veterinary Services</SelectItem>
        <SelectItem value="transportation">Transportation</SelectItem>
        <SelectItem value="breeding_stock">Breeding Stock</SelectItem>
        <SelectItem value="cleaning_supplies">Cleaning Supplies</SelectItem>
        <SelectItem value="consulting">Consulting</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
  </div>
  <div className="space-y-2">
    <Label htmlFor="product_type">Product Type *</Label>
    <Select value={formData.product_type} onValueChange={(value) => handleSelectChange('product_type', value)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {formData.type === 'feed' && (
          <>
            <SelectItem value="grain">Grain</SelectItem>
            <SelectItem value="hay">Hay</SelectItem>
            <SelectItem value="supplements">Supplements</SelectItem>
          </>
        )}
        {formData.type === 'medicine' && (
          <>
            <SelectItem value="antibiotics">Antibiotics</SelectItem>
            <SelectItem value="vaccines">Vaccines</SelectItem>
            <SelectItem value="pain_relief">Pain Relief</SelectItem>
          </>
        )}
        {formData.type === 'equipment' && (
          <>
            <SelectItem value="fencing">Fencing</SelectItem>
            <SelectItem value="feeding_troughs">Feeding Troughs</SelectItem>
            <SelectItem value="milking_machines">Milking Machines</SelectItem>
          </>
        )}
        {/* Add more conditional options for other types as needed */}
        {(!formData.type || formData.type === 'other') && (
          <SelectItem value="">Select a type first</SelectItem>
        )}
      </SelectContent>
    </Select>
    {errors.product_type && <p className="text-red-500 text-sm">{errors.product_type}</p>}
  </div>
</div>

            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name *</Label>
              <Input id="shop_name" name="shop_name" value={formData.shop_name} onChange={handleInputChange} required />
              {errors.shop_name && <p className="text-red-500 text-sm">{errors.shop_name[0]}</p>}
            </div>

            {/* Contract Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contract_start_date">Contract Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.contract_start_date ? format(parseISO(formData.contract_start_date), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={formData.contract_start_date ? parseISO(formData.contract_start_date) : undefined}
                      onSelect={(date) => handleDateChange('contract_start_date', date)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.contract_start_date && <p className="text-red-500 text-sm">{errors.contract_start_date[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_end_date">Contract End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.contract_end_date ? format(parseISO(formData.contract_end_date), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={formData.contract_end_date ? parseISO(formData.contract_end_date) : undefined}
                      onSelect={(date) => handleDateChange('contract_end_date', date)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.contract_end_date && <p className="text-red-500 text-sm">{errors.contract_end_date[0]}</p>}
              </div>
            </div>

            {/* Banking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="account_holder">Account Holder</Label>
                <Input id="account_holder" name="account_holder" value={formData.account_holder || ''} onChange={handleInputChange} />
                {errors.account_holder && <p className="text-red-500 text-sm">{errors.account_holder[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input id="account_number" name="account_number" value={formData.account_number || ''} onChange={handleInputChange} />
                {errors.account_number && <p className="text-red-500 text-sm">{errors.account_number[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" name="bank_name" value={formData.bank_name || ''} onChange={handleInputChange} />
                {errors.bank_name && <p className="text-red-500 text-sm">{errors.bank_name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_branch">Bank Branch</Label>
                <Input id="bank_branch" name="bank_branch" value={formData.bank_branch || ''} onChange={handleInputChange} />
                {errors.bank_branch && <p className="text-red-500 text-sm">{errors.bank_branch[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="swift_code">SWIFT Code</Label>
                <Input id="swift_code" name="swift_code" value={formData.swift_code || ''} onChange={handleInputChange} />
                {errors.swift_code && <p className="text-red-500 text-sm">{errors.swift_code[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" name="iban" value={formData.iban || ''} onChange={handleInputChange} />
                {errors.iban && <p className="text-red-500 text-sm">{errors.iban[0]}</p>}
              </div>
            </div>

            {/* Supplier Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplier_importance">Importance</Label>
                <Select value={formData.supplier_importance} onValueChange={(value) => handleSelectChange('supplier_importance', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {errors.supplier_importance && <p className="text-red-500 text-sm">{errors.supplier_importance[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory_level">Inventory Level</Label>
                <Input id="inventory_level" name="inventory_level" type="number" value={formData.inventory_level} onChange={handleNumberChange} />
                {errors.inventory_level && <p className="text-red-500 text-sm">{errors.inventory_level[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_point">Reorder Point</Label>
                <Input id="reorder_point" name="reorder_point" type="number" value={formData.reorder_point} onChange={handleNumberChange} />
                {errors.reorder_point && <p className="text-red-500 text-sm">{errors.reorder_point[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minimum_order_quantity">Min Order Qty</Label>
                <Input id="minimum_order_quantity" name="minimum_order_quantity" type="number" value={formData.minimum_order_quantity} onChange={handleNumberChange} />
                {errors.minimum_order_quantity && <p className="text-red-500 text-sm">{errors.minimum_order_quantity[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_time_days">Lead Time (days)</Label>
                <Input id="lead_time_days" name="lead_time_days" type="number" value={formData.lead_time_days} onChange={handleNumberChange} />
                {errors.lead_time_days && <p className="text-red-500 text-sm">{errors.lead_time_days[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Select value={formData.payment_terms} onValueChange={(value) => handleSelectChange('payment_terms', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net60">Net 60</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_terms && <p className="text-red-500 text-sm">{errors.payment_terms[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit</Label>
                <Input id="credit_limit" name="credit_limit" type="number" step="0.01" value={formData.credit_limit} onChange={handleNumberChange} />
                {errors.credit_limit && <p className="text-red-500 text-sm">{errors.credit_limit[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" value={formData.currency} onChange={handleInputChange} />
                {errors.currency && <p className="text-red-500 text-sm">{errors.currency[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input id="tax_rate" name="tax_rate" type="number" step="0.01" value={formData.tax_rate} onChange={handleNumberChange} />
                {errors.tax_rate && <p className="text-red-500 text-sm">{errors.tax_rate[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplier_rating">Supplier Rating (0-5)</Label>
                <Input id="supplier_rating" name="supplier_rating" type="number" step="0.1" min="0" max="5" value={formData.supplier_rating} onChange={handleNumberChange} />
                {errors.supplier_rating && <p className="text-red-500 text-sm">{errors.supplier_rating[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm">{errors.status[0]}</p>}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input id="contact_name" name="contact_name" value={formData.contact_name || ''} onChange={handleInputChange} />
              {errors.contact_name && <p className="text-red-500 text-sm">{errors.contact_name[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_position">Contact Position</Label>
                <Input id="contact_position" name="contact_position" value={formData.contact_position || ''} onChange={handleInputChange} />
                {errors.contact_position && <p className="text-red-500 text-sm">{errors.contact_position[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email || ''} onChange={handleInputChange} />
                {errors.contact_email && <p className="text-red-500 text-sm">{errors.contact_email[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input id="contact_phone" name="contact_phone" value={formData.contact_phone || ''} onChange={handleInputChange} />
              {errors.contact_phone && <p className="text-red-500 text-sm">{errors.contact_phone[0]}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} />
              {errors.notes && <p className="text-red-500 text-sm">{errors.notes[0]}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(`/animals/${animalId}/suppliers`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Supplier' : 'Save Supplier'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalSupplierForm;