
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

interface NoteFormProps {
  animalId?: string;
  onSuccess?: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ animalId, onSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    date: format(new Date(), 'yyyy-MM-dd'),
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
      console.log('Submitting note:', formData);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      toast.success("Note saved successfully");
      if (onSuccess) {
        onSuccess();
      } else if (animalId) {
        navigate(`/animals/${animalId}/notes`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Failed to save note");
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
        <CardTitle className="font-serif text-2xl">Add New Note</CardTitle>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-serif">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter note title"
                className="font-serif bg-background"
                required
              />
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
              <Label htmlFor="category" className="font-serif">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
              >
                <option value="general">General</option>
                <option value="health">Health</option>
                <option value="behavior">Behavior</option>
                <option value="feeding">Feeding</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="font-serif">Note Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter note details"
                rows={6}
                className="font-serif bg-background"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => animalId ? navigate(`/animals/${animalId}/notes`) : navigate('/dashboard')}
              className="font-serif"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-serif">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NoteForm;
