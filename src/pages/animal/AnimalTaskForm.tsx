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

const AnimalTaskForm: React.FC = () => {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const isEditing = !!taskId;

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

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!isEditing || !id || !taskId) return;
      
      setIsLoading(true);
      try {
        const task = await fetchTask(id, taskId);
        setFormData({
          ...task,
          start_date: format(parseISO(task.start_date), 'yyyy-MM-dd'),
          end_date: format(parseISO(task.end_date), 'yyyy-MM-dd'),
          end_repeat_date: task.end_repeat_date ? format(parseISO(task.end_repeat_date), 'yyyy-MM-dd') : undefined,
        });
      } catch (error) {
        toast.error('Failed to load task data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskData();
  }, [id, taskId, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const calculateDuration = () => {
    const start = new Date(`${formData.start_date}T${formData.start_time}`);
    const end = new Date(`${formData.end_date}T${formData.end_time}`);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    setFormData(prev => ({ ...prev, duration }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    try {
      if (isEditing && taskId) {
        await updateTask(id, taskId, formData);
        toast.success('Task updated successfully');
      } else {
        await createTask(id, formData);
        toast.success('Task created successfully');
      }
      navigate(`/animals/${id}/tasks`);
    } catch (error) {
      toast.error('Failed to save task');
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
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(`/animals/${id}/tasks`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Button>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
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
                    <SelectItem value="health_check">Health Check</SelectItem>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="grooming">Grooming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
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