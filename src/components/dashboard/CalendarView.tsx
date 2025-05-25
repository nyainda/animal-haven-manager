import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock, Users, Briefcase, Play, FileText, CheckSquare, X } from 'lucide-react';

// Mock data for demo
const mockAnimals = [
  { id: '1', name: 'Bella', type: 'Dog' },
  { id: '2', name: 'Whiskers', type: 'Cat' },
  { id: '3', name: 'Charlie', type: 'Horse' },
  { id: '4', name: 'Daisy', type: 'Cow' },
];

const mockEvents = [
  {
    id: '1',
    title: 'Vaccination Checkup',
    date: new Date(2025, 4, 26), // Note: Month is 0-indexed, so 4 is May
    time: '09:00',
    type: 'appointment',
    animalId: '1',
    priority: 'high',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Health Notes Review',
    date: new Date(2025, 4, 28),
    type: 'note',
    animalId: '2',
    priority: 'medium',
    status: 'completed',
    content: 'Reviewed annual health records. All clear.',
    category: 'Health Record'
  },
  {
    id: '3',
    title: 'Feeding Schedule Update',
    date: new Date(2025, 4, 30),
    time: '14:30',
    type: 'task',
    animalId: '3',
    priority: 'low',
    status: 'pending',
    taskType: 'Feeding',
    description: 'Transition to new feed type.'
  },
];

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState(mockEvents); // Changed to allow updates
  const [animals] = useState(mockAnimals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventType, setEventType] = useState('note'); // Default to 'note'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    task_type: '', // For task's specific type, e.g., "Feeding", "Vaccination"
    category: '',   // For note's category
    keywords: '',   // Not used in current form, but part of original state
    animalId: '',
    priority: 'medium',
    status: 'pending',
    start_date: '', // Will be set from selectedDate
    start_time: '09:00',
    end_date: '',   // Not directly used for simple event creation logic here
    end_time: '10:00', // Not directly used
    duration: 60,    // For tasks
    description: '', // For tasks
    health_notes: '',// Not used in current form
    location: '',    // Not used in current form
    repeats: '',     // Not used in current form
    repeat_frequency: 1, // Not used
    end_repeat_date: '', // Not used
    add_to_calendar: true, // Not used
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getMonthEnd = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const isSameDay = (date1, date2) =>
    date1 && date2 && // Ensure dates are not null
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  const generateCalendarDays = () => {
    const monthStart = getMonthStart(currentMonth);
    const monthEnd = getMonthEnd(currentMonth);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());

    const days = [];
    const dateIterator = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(dateIterator));
      dateIterator.setDate(dateIterator.getDate() + 1);
    }
    return days;
  };

  const getEventsForDay = useCallback((day) => {
    if (!day) return [];
    return calendarEvents.filter(event => isSameDay(event.date, day));
  }, [calendarEvents]);


  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return <Clock className="w-3 h-3 text-white" />;
      case 'meeting': return <Users className="w-3 h-3 text-white" />;
      case 'note': return <FileText className="w-3 h-3 text-white" />;
      case 'task': return <CheckSquare className="w-3 h-3 text-white" />;
      case 'production': return <Play className="w-3 h-3 text-white" />;
      default: return <Briefcase className="w-3 h-3 text-white" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'from-blue-500 to-blue-600';
      case 'meeting': return 'from-amber-500 to-amber-600';
      case 'note': return 'from-emerald-500 to-emerald-600';
      case 'task': return 'from-violet-500 to-violet-600';
      case 'production': return 'from-pink-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      task_type: '',
      category: '',
      keywords: '',
      animalId: '',
      priority: 'medium',
      status: 'pending',
      start_date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      end_time: '10:00',
      duration: 60,
      description: '',
      health_notes: '',
      location: '',
      repeats: '',
      repeat_frequency: 1,
      end_repeat_date: '',
      add_to_calendar: true,
    });
  }, [selectedDate]); // formData depends on selectedDate for date pre-fill

  // Reset form when dialog opens or selectedDate for dialog changes
  useEffect(() => {
    if (isDialogOpen && selectedDate) {
      resetForm();
    }
  }, [isDialogOpen, selectedDate, resetForm]);

  // Adjust form fields when eventType changes within the dialog
  useEffect(() => {
    if (isDialogOpen) { // Only apply when dialog is open
        setFormData(prev => ({
            ...prev, // Keep common fields like animalId, priority, status, start_date
            // Reset fields that are specific to one type or might need clearing
            title: '', // Reset title as context might imply a different kind of title
            content: eventType === 'note' ? prev.content : '', // Keep if switching to note, clear if switching away
            category: eventType === 'note' ? prev.category : '',
            task_type: eventType === 'task' ? prev.task_type : '',
            description: eventType === 'task' ? prev.description : '',
            // start_time and duration are more task-specific but might be kept for convenience
        }));
    }
  }, [eventType, isDialogOpen]);


  const handleCreateEvent = () => {
    if (!selectedDate) {
      alert("Error: A date must be selected to create an event.");
      return;
    }
    if (!formData.animalId) {
      alert("Please select an animal for the event.");
      return;
    }
    if (!formData.title.trim()) {
      alert(`Please enter a title for the ${eventType}.`);
      return;
    }
    if (eventType === 'note' && !formData.content.trim() && !formData.title.trim()) {
      alert("Please enter a title or content for the note.");
      return;
    }


    const newEvent: any = {
      id: String(Date.now()), // Simple unique ID
      title: formData.title.trim(),
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()), // Use date part of selectedDate
      animalId: formData.animalId,
      priority: formData.priority,
      status: formData.status,
      type: eventType, // This is 'note' or 'task' from the dialog
    };

    if (eventType === 'note') {
      newEvent.content = formData.content.trim();
      if (formData.category.trim()) newEvent.category = formData.category.trim();
    } else if (eventType === 'task') {
      if (formData.task_type.trim()) newEvent.taskType = formData.task_type.trim(); // Corresponds to mockEvent's taskType
      if (formData.start_time) newEvent.time = formData.start_time;
      newEvent.duration = formData.duration;
      if (formData.description.trim()) newEvent.description = formData.description.trim();
    }

    setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
    setIsDialogOpen(false);
    // resetForm(); // Form will be reset by the useEffect when isDialogOpen becomes true again or by explicit user action.
                   // Or, if we want it reset immediately for the *next* potential opening without relying on selectedDate change:
    // Let's keep the original pattern of resetting after creation for good measure.
    // However, resetForm depends on selectedDate, which hasn't changed. This is fine.
    // The useEffect for dialog open will handle the fresh reset.
  };

  const days = generateCalendarDays();
  const today = new Date();
  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : getEventsForDay(today);

  const openDialogForDate = (date) => {
    setSelectedDate(date);
    setEventType('note'); // Default to 'note' when opening
    setIsDialogOpen(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-300 to-purple-400 bg-clip-text text-transparent">
            Animal Care Calendar
          </h1>
          <p className="text-purple-200 text-lg">Manage schedules, tasks, and health records</p>
        </div>

        {/* Main Content */}
        {calendarEvents.length === 0 && !isDialogOpen ? ( // Added !isDialogOpen to ensure it doesn't show if dialog is opening for the first time
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-12 text-center">
            <Calendar className="w-24 h-24 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No events scheduled yet</h3>
            <p className="text-purple-200 mb-8 max-w-md mx-auto">
              Start by selecting a date and adding your first event to manage your animal care schedule.
            </p>
            <button
              onClick={() => openDialogForDate(new Date())}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Add Your First Event
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Calendar */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border-b border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5 text-white group-hover:text-purple-200" />
                    </button>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm font-medium"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                        aria-label="Next month"
                      >
                        <ChevronRight className="w-5 h-5 text-white group-hover:text-purple-200" />
                      </button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
                    {[
                      { type: 'appointment', label: 'Appointments', color: getEventTypeColor('appointment') },
                      { type: 'note', label: 'Notes', color: getEventTypeColor('note') },
                      { type: 'task', label: 'Tasks', color: getEventTypeColor('task') },
                      { type: 'meeting', label: 'Meetings', color: getEventTypeColor('meeting') },
                      { type: 'production', label: 'Production', color: getEventTypeColor('production') },
                    ].map(item => (
                      <div key={item.type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color} shadow-lg`} />
                        <span className="text-white/80 text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4 sm:p-6">
                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {weekDays.map(day => (
                      <div key={day} className="text-center p-2 sm:p-3 text-white/60 font-semibold text-xs sm:text-sm">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {days.map((day, index) => {
                      const isCurrentMonthDay = day.getMonth() === currentMonth.getMonth();
                      const isTodayDate = isSameDay(day, today);
                      const isSelectedDate = selectedDate && isSameDay(day, selectedDate);
                      const dayEvents = getEventsForDay(day);
                      
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            relative group cursor-pointer rounded-lg sm:rounded-xl p-2 sm:p-3 min-h-[4.5rem] sm:min-h-[6rem] 
                            transition-all duration-300 hover:scale-105 border 
                            ${isCurrentMonthDay 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-white/40'
                            }
                            ${isSelectedDate ? 'bg-purple-500/30 border-purple-400/60 shadow-lg shadow-purple-500/30 scale-105' : ''}
                            ${isTodayDate && !isSelectedDate ? 'ring-2 ring-purple-400/70' : ''}
                          `}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-1 sm:mb-2">
                              <span className={`
                                text-xs sm:text-sm font-medium
                                ${isCurrentMonthDay ? 'text-white' : 'text-white/40'}
                                ${isTodayDate ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold' : ''}
                              `}>
                                {day.getDate()}
                              </span>
                              {isCurrentMonthDay && ( // Only show add button for days in current month (optional)
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDialogForDate(day);
                                  }}
                                  aria-label={`Add event for ${day.toLocaleDateString()}`}
                                  className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1 rounded-md bg-white/20 hover:bg-white/30 transition-opacity"
                                >
                                  <Plus className="w-3 h-3 text-white" />
                                </button>
                              )}
                            </div>
                            
                            {dayEvents.length > 0 && (
                              <div className="flex flex-col gap-1 mt-auto overflow-hidden">
                                {dayEvents.slice(0, 2).map((event, idx) => (
                                  <div
                                    key={idx}
                                    className={`
                                      px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-gradient-to-r ${getEventTypeColor(event.type)} 
                                      text-white text-[0.6rem] sm:text-xs font-medium truncate flex items-center gap-1
                                      shadow-md opacity-90 group-hover:opacity-100 transition-opacity
                                    `}
                                    title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
                                  >
                                    {getEventTypeIcon(event.type)}
                                    <span className="truncate hidden sm:inline">{event.title}</span>
                                    <span className="truncate sm:hidden">{event.title.substring(0,5)}...</span>

                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-[0.6rem] sm:text-xs text-white/60 px-1 sm:px-2 font-medium">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {selectedDate ? 'Selected Day' : "Today's Events"}
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={() => openDialogForDate(selectedDate)}
                      aria-label="Add new event for selected day"
                      className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {selectedDate && (
                  <div className="mb-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10">
                    <p className="text-white font-medium text-sm">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1"> {/* Added pr-1 for scrollbar space */}
                  {selectedEvents.length > 0 ? (
                    selectedEvents.map(event => {
                      const animal = animals.find(a => a.id === event.animalId);
                      return (
                        <div
                          key={event.id}
                          className="group p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${getEventTypeColor(event.type)} shadow-lg flex-shrink-0`}>
                              {getEventTypeIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white group-hover:text-purple-200 transition-colors truncate text-sm sm:text-base">
                                {event.title}
                              </h4>
                              {animal && (
                                <p className="text-xs sm:text-sm text-white/60 mt-1">
                                  {animal.name} ({animal.type})
                                </p>
                              )}
                              {event.time && (
                                <p className="text-xs sm:text-sm text-white/60 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </p>
                              )}
                              {event.description && event.type === 'task' && (
                                <p className="text-xs text-white/50 mt-1 truncate" title={event.description}>
                                  {event.description}
                                </p>
                              )}
                              {event.content && event.type === 'note' && (
                                <p className="text-xs text-white/50 mt-1 truncate" title={event.content}>
                                  {event.content}
                                </p>
                              )}
                              <div className="flex items-center flex-wrap gap-2 mt-2">
                                {event.priority && (
                                  <span className={`px-2 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-medium bg-gradient-to-r ${getPriorityColor(event.priority)} text-white shadow-sm`}>
                                    {event.priority}
                                  </span>
                                )}
                                {event.status && (
                                  <span className={`px-2 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-medium ${
                                    event.status === 'completed' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
                                    event.status === 'pending' ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30' :
                                    event.status === 'in progress' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                                    'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                                  }`}>
                                    {event.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60 mb-4">No events scheduled for {selectedDate ? 'this day' : 'today'}</p>
                      {selectedDate && (
                        <button
                          onClick={() => openDialogForDate(selectedDate)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                        >
                          Create Event
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Creation Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-white/20 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm border-b border-white/10 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                  </h3>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    aria-label="Close dialog"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto flex-grow">
                {/* Event Type Tabs */}
                <div className="flex rounded-xl bg-white/10 p-1 mb-6">
                  <button
                    onClick={() => setEventType('note')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      eventType === 'note' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Note
                  </button>
                  <button
                    onClick={() => setEventType('task')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      eventType === 'task' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Task
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Date Display */}
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10">
                    <p className="text-white font-medium text-sm">
                      {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      }) : 'No date selected'}
                    </p>
                  </div>

                  {/* Animal Selection */}
                  <div>
                    <label htmlFor="animalId" className="block text-sm text-white/80 font-medium mb-1.5">Animal*</label>
                    <select
                      id="animalId"
                      value={formData.animalId}
                      onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="" className="bg-slate-800 text-white/70">Select animal</option>
                      {animals.map(animal => (
                        <option key={animal.id} value={animal.id} className="bg-slate-700 hover:bg-slate-600">
                          {animal.name} ({animal.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title Input */}
                  <div>
                      <label htmlFor="eventTitle" className="block text-sm text-white/80 font-medium mb-1.5">
                        {eventType === 'note' ? 'Note Title*' : 'Task Title*'}
                      </label>
                      <input
                        id="eventTitle"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={eventType === 'note' ? 'Enter note title...' : 'Enter task title...'}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                  </div>

                  {/* Form fields based on event type */}
                  {eventType === 'note' ? (
                    <>
                      <div>
                        <label htmlFor="noteContent" className="block text-sm text-white/80 font-medium mb-1.5">Content*</label>
                        <textarea
                          id="noteContent"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter note content..."
                          rows={4}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[100px] resize-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="noteCategory" className="block text-sm text-white/80 font-medium mb-1.5">Category</label>
                        <input
                          id="noteCategory"
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="e.g., Health, Behavior"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>
                    </>
                  ) : ( // eventType === 'task'
                    <>
                      <div>
                        <label htmlFor="taskType" className="block text-sm text-white/80 font-medium mb-1.5">Task Category/Type</label>
                        <input
                          id="taskType"
                          type="text"
                          value={formData.task_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
                          placeholder="e.g., Vaccination, Feeding"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startTime" className="block text-sm text-white/80 font-medium mb-1.5">Start Time</label>
                          <input
                            id="startTime"
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="duration" className="block text-sm text-white/80 font-medium mb-1.5">Duration (min)</label>
                          <input
                            id="duration"
                            type="number"
                            min="0"
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                            placeholder="60"
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          />
                        </div>
                      </div>
                       <div>
                        <label htmlFor="taskDescription" className="block text-sm text-white/80 font-medium mb-1.5">Description</label>
                        <textarea
                          id="taskDescription"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Additional details about the task..."
                          rows={3}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[80px] resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Priority and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="eventPriority" className="block text-sm text-white/80 font-medium mb-1.5">Priority</label>
                      <select
                        id="eventPriority"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        <option value="low" className="bg-slate-700">Low</option>
                        <option value="medium" className="bg-slate-700">Medium</option>
                        <option value="high" className="bg-slate-700">High</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="eventStatus" className="block text-sm text-white/80 font-medium mb-1.5">Status</label>
                      <select
                        id="eventStatus"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        <option value="pending" className="bg-slate-700">Pending</option>
                        <option value="in progress" className="bg-slate-700">In Progress</option>
                        <option value="completed" className="bg-slate-700">Completed</option>
                        <option value="cancelled" className="bg-slate-700">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="bg-slate-800/50 border-t border-white/10 p-5 sm:p-6 mt-auto">
                <div className="flex justify-end gap-3">
                    <button
                    onClick={() => setIsDialogOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all font-medium"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleCreateEvent}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg font-medium"
                    >
                    Create {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;