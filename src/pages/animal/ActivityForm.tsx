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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  'other',
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
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/animals/${animalId}/activities`)}
              className="rounded-full h-10 w-10 border-border hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {activityId ? 'Edit Activity' : 'New Activity'}
            </h1>
          </div>
        </header>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Activity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="activity_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Activity Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-border text-foreground focus:ring-primary">
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
                        <FormLabel className="text-foreground">Activity Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-background border-border text-foreground hover:bg-muted",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter activity description"
                          className="bg-background border-border text-foreground focus:ring-primary min-h-[100px]"
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
                      <FormLabel className="text-foreground">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes about the activity"
                          className="bg-background border-border text-foreground focus:ring-primary min-h-[100px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showBreedingFields && (
                  <div className="space-y-6 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground">
                      Breeding Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="breeding_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-foreground">Breeding Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal bg-background border-border text-foreground hover:bg-muted",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) =>
                                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
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
                        name="breeding_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Breeding Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Details about the breeding"
                                className="bg-background border-border text-foreground focus:ring-primary min-h-[100px]"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/animals/${animalId}/activities`)}
                    disabled={isSubmitting}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Saving...' : activityId ? 'Update Activity' : 'Create Activity'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}