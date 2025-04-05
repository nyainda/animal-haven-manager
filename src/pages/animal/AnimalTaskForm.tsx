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
import { createTask, updateTask, fetchTask, TaskFormData } from '@/services/taskApi';

interface FormErrors {
  [key: string]: string[];
}

const AnimalTaskForm: React.FC = () => {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const isEditing = !!taskId && taskId !== 'undefined';

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    task_type: 'health_check',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_date: format(new Date(), 'yyyy-MM-dd'),
    end_time: '10:00',
    duration: 60,
    priority: 'medium',
    status: 'pending',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const normalizeTime = (time: string): string => {
    if (!time) return '00:00';
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.slice(0, 2)}`;
  };

  useEffect(() => {
    if (isEditing && (!taskId || taskId === 'undefined')) {
      toast.error('Invalid task ID');
      navigate(`/animals/${id}/tasks`);
      return;
    }

    const fetchTaskData = async () => {
      if (!isEditing || !id || !taskId) return;
      
      setIsLoading(true);
      try {
        const task = await fetchTask(id, taskId);
        setFormData({
          ...task,
          start_date: format(parseISO(task.start_date), 'yyyy-MM-dd'),
          end_date: format(parseISO(task.end_date), 'yyyy-MM-dd'),
          start_time: normalizeTime(task.start_time),
          end_time: normalizeTime(task.end_time),
          end_repeat_date: task.end_repeat_date ? format(parseISO(task.end_repeat_date), 'yyyy-MM-dd') : undefined,
        });
        setErrors({});
      } catch (error) {
        toast.error('Failed to load task data');
        navigate(`/animals/${id}/tasks`);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTaskData();
  }, [id, taskId, isEditing, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'start_time' || name === 'end_time') {
      setFormData(prev => ({ ...prev, [name]: normalizeTime(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: format(date, 'yyyy-MM-dd') }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: [] }));
      }
    }
  };

  const calculateDuration = () => {
    const start = new Date(`${formData.start_date}T${formData.start_time}`);
    const end = new Date(`${formData.end_date}T${formData.end_time}`);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    setFormData(prev => ({ ...prev, duration }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const durationValue = parseInt(e.target.value);
    
    if (isNaN(durationValue) || durationValue <= 0) return;
    
    const start = new Date(`${formData.start_date}T${formData.start_time}`);
    const end = new Date(start.getTime() + durationValue * 60000);
    
    setFormData(prev => ({ 
      ...prev, 
      duration: durationValue,
      end_date: format(end, 'yyyy-MM-dd'),
      end_time: normalizeTime(format(end, 'HH:mm')),
    }));
    if (errors.duration) {
      setErrors(prev => ({ ...prev, duration: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
  
    if (isEditing && (!taskId || taskId === 'undefined')) {
      toast.error('Invalid task ID');
      return;
    }
  
    const normalizedFormData = {
      ...formData,
      start_time: normalizeTime(formData.start_time),
      end_time: normalizeTime(formData.end_time),
    };

    setIsLoading(true);
    setErrors({});

    try {
      if (isEditing && taskId) {
        await updateTask(id, taskId, normalizedFormData);
        toast.success('Task updated successfully');
      } else {
        await createTask(id, normalizedFormData);
        toast.success('Task created successfully');
      }
      navigate(`/animals/${id}/tasks`);
    } catch (error: any) {
      if (error.message && error.message.includes('API error')) {
        const errorData = JSON.parse(error.message.replace('API error: ', ''));
        if (errorData.errors) {
          setErrors(errorData.errors);
          toast.error(errorData.message || 'Failed to save task');
        } else {
          toast.error(errorData.message || 'Failed to save task');
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
        <span>Loading task data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(`/animals/${id}/tasks`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Button>

      <Card className="mt-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_type">Task Type</Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value) => handleSelectChange('task_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="milking">Milking</SelectItem>
                    <SelectItem value="health_check">Health Check</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="breeding">Breeding</SelectItem>
                    <SelectItem value="shearing">Shearing/Wool Collection</SelectItem>
                    <SelectItem value="egg_collection">Egg Collection</SelectItem>
                    <SelectItem value="grooming">Grooming</SelectItem>
                    <SelectItem value="hoof_care">Hoof/Claw Care</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="weighing">Weighing</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="deworming">Deworming</SelectItem>
                    <SelectItem value="parasite_control">Parasite Control</SelectItem>
                    <SelectItem value="pen_rotation">Pen/Pasture Rotation</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="slaughter">Slaughter/Processing</SelectItem>
                    <SelectItem value="fiber_collection">Fiber Collection</SelectItem>
                    <SelectItem value="water_maintenance">Water Maintenance</SelectItem>
                    <SelectItem value="identification">Tagging/Identification</SelectItem>
                    <SelectItem value="feather_collection">Feather Collection</SelectItem>
                    <SelectItem value="custom">Custom Task</SelectItem>
                  </SelectContent>
                </Select>
                {errors.task_type && <p className="text-red-500 text-sm">{errors.task_type[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(parseISO(formData.start_date), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={parseISO(formData.start_date)}
                      onSelect={(date) => handleDateChange('start_date', date)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  onBlur={calculateDuration}
                  required
                />
                {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(parseISO(formData.end_date), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <CalendarComponent
                      mode="single"
                      selected={parseISO(formData.end_date)}
                      onSelect={(date) => handleDateChange('end_date', date)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  onBlur={calculateDuration}
                  required
                />
                {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleDurationChange}
                  min="1"
                  required
                />
                {errors.duration && <p className="text-red-500 text-sm">{errors.duration[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description[0]}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-red-500 text-sm">{errors.priority[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">Progress</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm">{errors.status[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="repeats">Repeats</Label>
                <Select
                  value={formData.repeats}
                  onValueChange={(value) => handleSelectChange('repeats', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.repeats && <p className="text-red-500 text-sm">{errors.repeats[0]}</p>}
              </div>
              {formData.repeats && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="repeat_frequency">Frequency</Label>
                    <Input
                      type="number"
                      id="repeat_frequency"
                      name="repeat_frequency"
                      value={formData.repeat_frequency || ''}
                      onChange={handleInputChange}
                      min="1"
                    />
                    {errors.repeat_frequency && <p className="text-red-500 text-sm">{errors.repeat_frequency[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_repeat_date">End Repeat Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.end_repeat_date ? format(parseISO(formData.end_repeat_date), 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <CalendarComponent
                          mode="single"
                          selected={formData.end_repeat_date ? parseISO(formData.end_repeat_date) : undefined}
                          onSelect={(date) => handleDateChange('end_repeat_date', date)}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.end_repeat_date && <p className="text-red-500 text-sm">{errors.end_repeat_date[0]}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/animals/${id}/tasks`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Task' : 'Save Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalTaskForm;