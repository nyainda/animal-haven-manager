
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  animalId?: string;
  onSuccess?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ animalId, onSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date>(new Date());
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'general',
    priority: 'medium',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    due_time: '',
    assign_to: '',
    is_recurring: false,
    recurrence_pattern: '',
    is_completed: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log('Submitting task:', formData);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      toast.success("Task saved successfully");
      if (onSuccess) {
        onSuccess();
      } else if (animalId) {
        navigate(`/animals/${animalId}/tasks`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error("Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDueDate(date);
      setFormData(prev => ({
        ...prev,
        due_date: format(date, 'yyyy-MM-dd')
      }));
    }
  };
  
  return (
    <Card className="w-full shadow-md border-border">
      <CardHeader className="bg-card">
        <CardTitle className="font-serif text-2xl">Add New Task</CardTitle>
      </CardHeader>
      <CardContent className="bg-card pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="font-serif">Task Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                className="font-serif bg-background"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task_type" className="font-serif">Task Type</Label>
              <select
                id="task_type"
                name="task_type"
                value={formData.task_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
              >
                <option value="general">General</option>
                <option value="health">Health Check</option>
                <option value="feeding">Feeding</option>
                <option value="cleaning">Cleaning</option>
                <option value="medication">Medication</option>
                <option value="vaccination">Vaccination</option>
                <option value="deworming">Deworming</option>
                <option value="breeding">Breeding</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-serif">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_date" className="font-serif">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal font-serif",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_time" className="font-serif">Due Time (Optional)</Label>
              <div className="relative">
                <Input
                  id="due_time"
                  name="due_time"
                  type="time"
                  value={formData.due_time}
                  onChange={handleInputChange}
                  className="font-serif bg-background pl-10"
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assign_to" className="font-serif">Assign To (Optional)</Label>
              <Input
                id="assign_to"
                name="assign_to"
                value={formData.assign_to}
                onChange={handleInputChange}
                placeholder="Enter person's name"
                className="font-serif bg-background"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('is_recurring', checked === true)
                }
              />
              <Label htmlFor="is_recurring" className="font-serif">Recurring Task</Label>
            </div>
            
            {formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrence_pattern" className="font-serif">Recurrence Pattern</Label>
                <select
                  id="recurrence_pattern"
                  name="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md font-serif bg-background"
                >
                  <option value="">Select Pattern</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            )}
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="font-serif">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task details"
                rows={4}
                className="font-serif bg-background"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => animalId ? navigate(`/animals/${animalId}/tasks`) : navigate('/dashboard')}
              className="font-serif"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="font-serif">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
