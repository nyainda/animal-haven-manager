import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, addDays } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'event' | 'meeting' | 'production';
}

interface CalendarViewProps {
  calendarEvents: CalendarEvent[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ calendarEvents, currentMonth, setCurrentMonth, selectedDate, setSelectedDate }) => {
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startWeek = startOfWeek(monthStart);

    const calendarCells = [];
    for (let i = 0; i < getDay(monthStart); i++) {
      const prevDay = addDays(startWeek, i);
      calendarCells.push(
        <div key={`prev-${i}`} className="h-12 p-1 text-muted-foreground text-center border border-muted">
          <span className="text-xs">{format(prevDay, 'd')}</span>
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
            'h-12 p-1 text-center border border-muted relative cursor-pointer hover:bg-muted/30',
            isSelected && 'bg-primary/10 border-primary',
            isToday && 'font-bold'
          )}
          onClick={() => setSelectedDate(day)}
        >
          <span className={cn('text-xs inline-block w-6 h-6 rounded-full leading-6', isToday && 'bg-primary text-white')}>
            {format(day, 'd')}
          </span>
          {eventsForDay.length > 0 && (
            <div className="flex justify-center space-x-1 mt-1">
              {eventsForDay.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-1 h-1 rounded-full',
                    event.type === 'appointment' && 'bg-blue-500',
                    event.type === 'event' && 'bg-green-500',
                    event.type === 'meeting' && 'bg-amber-500',
                    event.type === 'production' && 'bg-purple-500'
                  )}
                  title={event.title}
                />
              ))}
            </div>
          )}
        </div>
      );
    });

    const totalCells = 7 * Math.ceil(days.length / 7);
    const remainingCells = totalCells - calendarCells.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push(
        <div key={`next-${i}`} className="h-12 p-1 text-muted-foreground text-center border border-muted">
          <span className="text-xs">{i}</span>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            Previous
          </Button>
          <h2 className="text-xl font-medium">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map(day => (
            <div key={day} className="text-center p-2 font-medium bg-muted/20">{day}</div>
          ))}
          {calendarCells}
        </div>
        {selectedDate && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
            {calendarEvents.filter(event => isSameDay(event.date, selectedDate)).length > 0 ? (
              calendarEvents
                .filter(event => isSameDay(event.date, selectedDate))
                .map(event => (
                  <div key={event.id} className="py-2 border-b last:border-0">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground">No events scheduled</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        {calendarEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No events scheduled yet.</p>
        ) : (
          <>
            <div className="flex space-x-4 mb-4">
              {[
                { type: 'appointment', color: 'bg-blue-500', label: 'Appointments' },
                { type: 'event', color: 'bg-green-500', label: 'Events' },
                { type: 'meeting', color: 'bg-amber-500', label: 'Meetings' },
                { type: 'production', color: 'bg-purple-500', label: 'Production' },
              ].map(item => (
                <div key={item.type} className="flex items-center space-x-1">
                  <div className={cn('w-3 h-3 rounded-full', item.color)} />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
            {renderCalendar()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;