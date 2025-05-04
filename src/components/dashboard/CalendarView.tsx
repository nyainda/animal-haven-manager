import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { Animal } from '@/types/AnimalTypes';
import { NoteFormData } from '@/services/noteApi';
import { TaskFormData } from '@/services/taskApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'appointment' | 'note' | 'task' | 'meeting' | 'production';
  animalId?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'archived';
  taskType?: string;
}

interface CalendarViewProps {
  calendarEvents: CalendarEvent[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  animals: Animal[];
  onNoteCreated: (animalId: string, noteData: NoteFormData) => void;
  onTaskCreated: (animalId: string, taskData: TaskFormData) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  calendarEvents,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  animals,
  onNoteCreated,
  onTaskCreated,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventType, setEventType] = useState<'note' | 'task'>('note');
  const [formData, setFormData] = useState<{
    title?: string; // For tasks
    content?: string; // For notes
    task_type?: string;
    category?: string;
    keywords?: string;
    animalId?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'completed' | 'archived';
    start_date?: string;
    start_time?: string;
    end_date?: string;
    end_time?: string;
    duration?: number;
    description?: string;
    health_notes?: string;
    location?: string;
    repeats?: 'daily' | 'weekly' | 'monthly';
    repeat_frequency?: number;
    end_repeat_date?: string;
    add_to_calendar?: boolean;
  }>({
    priority: 'medium',
    status: 'pending',
    start_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    end_time: '10:00',
    duration: 60,
    add_to_calendar: true,
  });

  const handleCreateEvent = () => {
    if (!selectedDate || !formData.animalId) return;

    if (eventType === 'note' && formData.content) {
      const noteData: NoteFormData = {
        content: formData.content,
        category: formData.category || 'General',
        keywords: formData.keywords?.split(',').map(k => k.trim()).filter(k => k) || [],
        priority: formData.priority,
        status: formData.status,
        due_date: formData.start_date || format(selectedDate, 'yyyy-MM-dd'),
        add_to_calendar: formData.add_to_calendar || false,
      };
      onNoteCreated(formData.animalId, noteData);
    } else if (
      eventType === 'task' &&
      formData.title &&
      formData.task_type &&
      formData.start_date &&
      formData.start_time &&
      formData.end_date &&
      formData.end_time &&
      formData.duration
    ) {
      const taskData: TaskFormData = {
        title: formData.title,
        task_type: formData.task_type,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
        duration: formData.duration,
        description: formData.description,
        health_notes: formData.health_notes,
        location: formData.location,
        priority: formData.priority,
        status: formData.status,
        repeats: formData.repeats,
        repeat_frequency: formData.repeat_frequency,
        end_repeat_date: formData.end_repeat_date,
      };
      onTaskCreated(formData.animalId, taskData);
    }
    setFormData({
      priority: 'medium',
      status: 'pending',
      start_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      end_time: '10:00',
      duration: 60,
      add_to_calendar: true,
    });
    setIsDialogOpen(false);
  };

  // Priority and status badges
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        priority === 'high' && 'bg-red-100 text-red-800',
        priority === 'medium' && 'bg-yellow-100 text-yellow-800',
        priority === 'low' && 'bg-green-100 text-green-800'
      )}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: 'pending' | 'completed' | 'archived') => {
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        status === 'pending' && 'bg-blue-100 text-blue-800',
        status === 'completed' && 'bg-green-100 text-green-800',
        status === 'archived' && 'bg-gray-100 text-gray-800'
      )}>
        {status}
      </span>
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'note': return 'bg-emerald-500';
      case 'task': return 'bg-violet-500';
      case 'meeting': return 'bg-amber-500';
      case 'production': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setCurrentMonth(new Date())}
          className="text-sm"
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startWeek = startOfWeek(monthStart);

    const calendarCells = [];
    for (let i = 0; i < getDay(monthStart); i++) {
      const prevDay = addDays(startWeek, i);
      calendarCells.push(
        <div key={`prev-${i}`} className="h-24 p-1 text-muted-foreground text-center border border-muted bg-muted/5">
          <span className="text-xs opacity-50">{format(prevDay, 'd')}</span>
        </div>
      );
    }

    days.forEach(day => {
      const eventsForDay = calendarEvents.filter(event => isSameDay(event.date, day));
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());

      calendarCells.push(
        <div
          key={day.toString()}
          className={cn(
            'h-24 p-1 border border-muted relative cursor-pointer transition-all',
            isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'hover:bg-muted/10',
            isToday && 'ring-2 ring-primary/20'
          )}
          onClick={() => setSelectedDate(day)}
          role="button"
          aria-label={`Select ${format(day, 'MMMM d, yyyy')}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSelectedDate(day);
            }
          }}
        >
          <div className="flex justify-between items-start">
            <span
              className={cn(
                'text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full',
                isToday && 'bg-primary text-primary-foreground'
              )}
            >
              {format(day, 'd')}
            </span>
            {isSelected && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
          {eventsForDay.length > 0 && (
            <div className="mt-1 space-y-1 overflow-hidden max-h-[calc(100%-24px)]">
              {eventsForDay.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-sm truncate flex items-center space-x-1',
                    `${getEventTypeColor(event.type)} bg-opacity-90 text-white`
                  )}
                  title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
                >
                  {event.time && (
                    <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                  )}
                  <span className="truncate">{event.title}</span>
                </div>
              ))}
              {eventsForDay.length > 3 && (
                <div className="text-xs px-1.5 py-0.5 text-muted-foreground font-medium">
                  +{eventsForDay.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    });

    const totalCells = 7 * Math.ceil(days.length / 7);
    const remainingCells = totalCells - calendarCells.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push(
        <div key={`next-${i}`} className="h-24 p-1 text-muted-foreground text-center border border-muted bg-muted/5">
          <span className="text-xs opacity-50">{i}</span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map(day => (
          <div key={day} className="text-center p-2 font-medium bg-muted/10 border-b border-muted text-sm">{day}</div>
        ))}
        {calendarCells}
      </div>
    );
  };

  const renderAgendaView = () => {
    if (!selectedDate) return null;

    const eventsForDay = calendarEvents.filter(event => isSameDay(event.date, selectedDate));
    
    return (
      <div className="mt-6 p-4 border rounded-lg shadow-sm bg-card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
            <p className="text-sm text-muted-foreground">
              {eventsForDay.length} event{eventsForDay.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
        
        {eventsForDay.length > 0 ? (
          <div className="space-y-2">
            {eventsForDay.map(event => (
              <div
                key={event.id}
                className="p-3 border rounded-md cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => {
                  console.log('View event:', event.id);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${getEventTypeColor(event.type)}`} />
                  <p className="font-medium flex-grow">{event.title}</p>
                  {event.time && (
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.time}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground capitalize flex items-center gap-2">
                  <span className="capitalize">{event.type}</span>
                  {event.priority && getPriorityBadge(event.priority)}
                  {event.status && getStatusBadge(event.status)}
                  {event.taskType && <span className="text-muted-foreground">Type: {event.taskType}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mb-2 opacity-40" />
            <p>No events scheduled for this day</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              Create your first event
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New {eventType === 'note' ? 'Note' : 'Task'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={eventType} onValueChange={(value) => setEventType(value as 'note' | 'task')} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="note">Note</TabsTrigger>
            <TabsTrigger value="task">Task</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            <div className="p-2 rounded-md bg-muted/20">
              <p className="text-sm mb-1 font-medium">Date</p>
              <p className="text-muted-foreground text-sm">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
              </p>
            </div>
            
            <Select
              value={formData.animalId || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, animalId: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <TabsContent value="note" className="mt-0 space-y-4">
              <Textarea
                placeholder="Content"
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-32"
              />
              <Input
                placeholder="Category (e.g., Health, Maintenance)"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
              <Input
                placeholder="Keywords (comma-separated)"
                value={formData.keywords || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add-to-calendar"
                  checked={formData.add_to_calendar}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, add_to_calendar: !!checked }))}
                />
                <label htmlFor="add-to-calendar" className="text-sm">Add to calendar</label>
              </div>
            </TabsContent>
            
            <TabsContent value="task" className="mt-0 space-y-4">
              <Input
                placeholder="Task Title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Task Type (e.g., Vaccination, Feeding)"
                value={formData.task_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm block mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm block mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">End Time</label>
                  <Input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              <Input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              />
              <Textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <Textarea
                placeholder="Health Notes"
                value={formData.health_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, health_notes: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
              <Select
                value={formData.repeats || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, repeats: value as 'daily' | 'weekly' | 'monthly' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select repeat frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {formData.repeats && (
                <>
                  <Input
                    type="number"
                    placeholder="Repeat Frequency"
                    value={formData.repeat_frequency || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeat_frequency: parseInt(e.target.value) }))}
                  />
                  <div>
                    <label className="text-sm block mb-1">End Repeat Date</label>
                    <Input
                      type="date"
                      value={formData.end_repeat_date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_repeat_date: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Common fields for both tabs */}
            <div className="pt-2 grid grid-cols-2 gap-4">
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pending' | 'completed' | 'archived' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Tabs>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvent}
            disabled={
              !formData.animalId ||
              (eventType === 'note' && !formData.content) ||
              (eventType === 'task' &&
                (!formData.title ||
                  !formData.task_type ||
                  !formData.start_date ||
                  !formData.start_time ||
                  !formData.end_date ||
                  !formData.end_time ||
                  !formData.duration))
            }
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderLegend = () => (
    <div className="grid grid-cols-5 gap-2 mb-6 md:flex md:flex-wrap md:gap-4">
      {[
        { type: 'appointment', color: 'bg-blue-500', label: 'Appointments' },
        { type: 'note', color: 'bg-emerald-500', label: 'Notes' },
        { type: 'task', color: 'bg-violet-500', label: 'Tasks' },
        { type: 'meeting', color: 'bg-amber-500', label: 'Meetings' },
        { type: 'production', color: 'bg-pink-500', label: 'Production' },
      ].map(item => (
        <div key={item.type} className="flex items-center space-x-2">
          <div className={cn('w-3 h-3 rounded-full', item.color)} />
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-2xl space-x-2">
          <CalendarIcon className="h-6 w-6" />
          <span>Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[600px]">
        {calendarEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-medium mb-2">No events scheduled yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start by selecting a date and adding your first event to the calendar.
            </p>
            <Button onClick={() => {
              setSelectedDate(new Date());
              setIsDialogOpen(true);
            }}>
              Add Your First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {renderLegend()}
            {renderCalendarHeader()}
            <div className="grid lg:grid-cols-[3fr,2fr] gap-6">
              <div>
                {renderCalendarGrid()}
              </div>
              <div className="order-first lg:order-last">
                {renderAgendaView()}
              </div>
            </div>
          </div>
        )}
        {renderForm()}
      </CardContent>
    </Card>
  );
};

export default CalendarView;