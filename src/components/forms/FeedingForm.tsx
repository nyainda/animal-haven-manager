import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarIcon, Clock, Loader2 } from 'lucide-react';
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

interface FeedingFormProps {
  animalId?: string;
  onSuccess?: () => void;
}

const FeedingForm: React.FC<FeedingFormProps> = ({ animalId, onSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    feed_type: '',
    amount: '',
    unit: 'kg',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    notes: '',
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
      console.log('Submitting feeding record:', formData);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      toast.success("Feeding record saved successfully");
      if (onSuccess) {
        onSuccess();
      } else if (animalId) {
        navigate(`/animals/${animalId}/feedings`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error saving feeding record:', error);
      toast.error("Failed to save feeding record");
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
  
  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="bg-card">
        <CardTitle className="font-serif text-2xl">Add Feeding Record</CardTitle>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="feed_type" className="font-serif">Feed Type</Label>
              <select
                id="feed_type"
                name="feed_type"
                value={formData.feed_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
                required
              >
                <option value="">Select Feed Type</option>
                <option value="hay">Hay</option>
                <option value="grain">Grain</option>
                <option value="silage">Silage</option>
                <option value="concentrate">Concentrate</option>
                <option value="grass">Grass/Pasture</option>
                <option value="minerals">Minerals</option>
                <option value="feed_mix">Feed Mix</option>
                <option value="other">Other</option>
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
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-24 px-3 py-2 border border-input rounded-md font-serif bg-background"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                  <option value="liters">L</option>
                  <option value="floz">fl oz</option>
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
              <Label htmlFor="time" className="font-serif">Time</Label>
              <div className="relative">
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="font-serif bg-background pl-10"
                  required
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="font-serif">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
                rows={4}
                className="font-serif bg-background"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => animalId ? navigate(`/animals/${animalId}/feedings`) : navigate('/dashboard')}
              className="font-serif"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-serif">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Feeding Record
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedingForm;