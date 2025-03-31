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
import { Activity, ActivityFormData, createActivity, updateActivity, fetchActivity } from '@/services/ActivityApi';

// Validation schema
const formSchema = z.object({
  activity_type: z.string().min(1, 'Activity type is required'),
  activity_date: z.string().min(1, 'Activity date is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  notes: z.string().optional(),
  breeding_date: z.string().optional(),
  breeding_notes: z.string().optional(),
});

const activityTypes = [
  'feeding',
  'medication',
  'veterinary_visit',
  'grooming',
  'exercise',
  'training',
  'breeding',
  'weighing',
  'vaccination',
  'deworming',
  'health_check',
  'transport',
  'milking',
  'shearing',
  'hoof_trimming',
  'socialization',
  'enrichment',
  'cleaning',
  'observation',
  'other'
];

export function ActivityForm() {
  const { animalId, activityId } = useParams<{ animalId: string; activityId?: string }>();
  const navigate = useNavigate();
  const [showBreedingFields, setShowBreedingFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity_type: '',
      activity_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      notes: '',
      breeding_date: '',
      breeding_notes: '',
    },
  });

  useEffect(() => {
    if (activityId) {
      const loadActivity = async () => {
        try {
          const activity = await fetchActivity(animalId!, activityId);
          form.reset({
            activity_type: activity.activity_type,
            activity_date: activity.activity_date.split('T')[0],
            description: activity.description,
            notes: activity.notes || '',
            breeding_date: activity.breeding_date || '',
            breeding_notes: activity.breeding_notes || '',
          });
          setShowBreedingFields(activity.activity_type === 'breeding');
        } catch (error) {
          console.error('Failed to load activity:', error);
        }
      };
      loadActivity();
    }
  }, [activityId, animalId, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'activity_type') {
        setShowBreedingFields(value.activity_type === 'breeding');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleFormSubmit = async (data: ActivityFormData) => {
    if (data.activity_type !== 'breeding') {
      data.breeding_date = undefined;
      data.breeding_notes = undefined;
    }
    try {
      setIsSubmitting(true);
      if (activityId) {
        await updateActivity(animalId!, activityId, data);
      } else {
        await createActivity(animalId!, data);
      }
      navigate(`/animals/${animalId}/activities`);
    } catch (error) {
      console.error('Failed to save activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/animals/${animalId}/activities`)}
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              {activityId ? 'Edit Activity' : 'New Activity'}
            </h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="activity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-100">Activity Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
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
                name="activity_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-800 dark:text-gray-100">Activity Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(new Date(field.value), "PPP") : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-100">Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter activity description" 
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-100">Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about the activity"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showBreedingFields && (
                <>
                  <FormField
                    control={form.control}
                    name="breeding_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-gray-800 dark:text-gray-100">Breeding Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(new Date(field.value), "PPP") : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
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
                    name="breeding_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 dark:text-gray-100">Breeding Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Details about the breeding"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 shadow-md"
              >
                {isSubmitting ? 'Saving...' : activityId ? 'Update Activity' : 'Create Activity'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}