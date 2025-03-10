import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  animalId?: string;
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ animalId, onSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    transaction_type: 'expense',
    category: '',
    amount: '',
    currency: 'USD',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'cash',
    description: '',
    vendor: '',
    receipt_number: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log('Submitting transaction:', formData);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      toast.success("Transaction saved successfully");
      if (onSuccess) {
        onSuccess();
      } else if (animalId) {
        navigate(`/animals/${animalId}/transactions`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  // Get expense or income categories based on transaction type
  const getCategoriesByType = () => {
    if (formData.transaction_type === 'expense') {
      return [
        { value: 'feed', label: 'Feed' },
        { value: 'medication', label: 'Medication' },
        { value: 'veterinary', label: 'Veterinary' },
        { value: 'supplies', label: 'Supplies' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'housing', label: 'Housing' },
        { value: 'labor', label: 'Labor' },
        { value: 'transport', label: 'Transport' },
        { value: 'breeding', label: 'Breeding' },
        { value: 'other_expense', label: 'Other Expense' }
      ];
    } else {
      return [
        { value: 'sale', label: 'Animal Sale' },
        { value: 'product_sale', label: 'Product Sale' },
        { value: 'breeding_fee', label: 'Breeding Fee' },
        { value: 'rental', label: 'Rental' },
        { value: 'subsidy', label: 'Subsidy' },
        { value: 'other_income', label: 'Other Income' }
      ];
    }
  };
  
  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="bg-card">
        <CardTitle className="font-serif text-2xl">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="transaction_type" className="font-serif">Transaction Type</Label>
              <select
                id="transaction_type"
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="font-serif">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
                required
              >
                <option value="">Select Category</option>
                {getCategoriesByType().map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-serif">Amount</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="flex-1 font-serif bg-background"
                  required
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-24 px-3 py-2 border border-input rounded-md font-serif bg-background"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="font-serif">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal font-serif",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="font-serif">Payment Method</Label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="mobile_payment">Mobile Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor" className="font-serif">Vendor/Client</Label>
              <Input
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                placeholder="Enter vendor or client name"
                className="font-serif bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt_number" className="font-serif">Receipt/Invoice Number</Label>
              <Input
                id="receipt_number"
                name="receipt_number"
                value={formData.receipt_number}
                onChange={handleInputChange}
                placeholder="Enter receipt or invoice number"
                className="font-serif bg-background"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="font-serif">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter transaction details"
                rows={4}
                className="font-serif bg-background"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => animalId ? navigate(`/animals/${animalId}/transactions`) : navigate('/dashboard')}
              className="font-serif"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-serif">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Transaction
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;