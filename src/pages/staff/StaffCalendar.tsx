import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  List,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  format, 
  addDays, 
  startOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  getDay,
} from 'date-fns';

const mockEvents = [
  { id: '1', title: 'Document Review - John Doe', type: 'document_submission', dateTime: addDays(new Date(), 0), duration: 60, studentName: 'John Doe' },
  { id: '2', title: 'Consultation - Emily Wilson', type: 'consultation', dateTime: addDays(new Date(), 1), duration: 45, studentName: 'Emily Wilson' },
  { id: '3', title: 'Interview Prep - Jane Smith', type: 'interview_prep', dateTime: addDays(new Date(), 2), duration: 90, studentName: 'Jane Smith' },
  { id: '4', title: 'Application Review - David Brown', type: 'document_submission', dateTime: addDays(new Date(), 3), duration: 60, studentName: 'David Brown' },
  { id: '5', title: 'Follow-up Call - Lisa Chen', type: 'consultation', dateTime: addDays(new Date(), 5), duration: 30, studentName: 'Lisa Chen' },
  { id: '6', title: 'Deadline: Harvard App', type: 'deadline', dateTime: addDays(new Date(), 7), duration: 0, studentName: '' },
  { id: '7', title: 'Milestone: Visa Interview', type: 'milestone', dateTime: addDays(new Date(), 10), duration: 0, studentName: 'John Doe' },
  { id: '8', title: 'Contract Signing - Maria Lopez', type: 'consultation', dateTime: addDays(new Date(), 14), duration: 30, studentName: 'Maria Lopez' },
];

type ViewMode = 'month' | 'week' | 'day';

const StaffCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Selected date for details panel and single active selection (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const getEventsForDay = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.dateTime, date));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-primary/10 border-primary/30 text-primary';
      case 'document_submission': return 'bg-success/10 border-success/30 text-success';
      case 'interview_prep': return 'bg-warning/10 border-warning/30 text-warning';
      case 'deadline': return 'bg-error/10 border-error/30 text-error';
      case 'milestone': return 'bg-primary/20 border-primary/40 text-primary';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  const getEventDot = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-primary';
      case 'document_submission': return 'bg-success';
      case 'interview_prep': return 'bg-warning';
      case 'deadline': return 'bg-error';
      case 'milestone': return 'bg-primary';
      default: return 'bg-muted-foreground';
    }
  };

  // Navigation handlers
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Generate calendar days for month view
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = addDays(startOfWeek(addDays(monthEnd, 7), { weekStartsOn: 1 }), -1);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Generate week days
  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const selectedEvents = getEventsForDay(selectedDate);
  const upcomingEvents = mockEvents
    .filter(event => event.dateTime > new Date())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, 5);

  const renderMonthView = () => {
    const days = getMonthDays();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="space-y-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.005 }}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentDate(day);
                }}
                className={`min-h-28 p-2 rounded-lg border transition-colors cursor-pointer ${!isCurrentMonth ? 'opacity-40' : ''} ${
                  isSameDay(day, selectedDate) ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isSameDay(day, selectedDate) ? 'text-primary' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`p-1 rounded text-xs border cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event.type)}`}
                    >
                      <p className="font-medium truncate">
                        {event.type === 'deadline' || event.type === 'milestone' 
                          ? event.title 
                          : event.studentName}
                      </p>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentDate(day);
                }}
                className={`min-h-64 p-3 rounded-lg border cursor-pointer ${
                isSameDay(day, selectedDate) ? 'border-primary bg-primary/10' : 'border-border/50'
              }`}
              >
              <div className="text-center mb-3">
                <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                <p className={`text-xl font-semibold ${isSameDay(day, selectedDate) ? 'text-primary' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </p>
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 rounded border ${getEventColor(event.type)}`}
                  >
                    <p className="font-medium text-sm truncate">{event.studentName || event.title}</p>
                    {event.duration > 0 && (
                      <p className="text-xs opacity-70 mt-0.5">
                        {format(event.dateTime, 'h:mm a')} • {event.duration}min
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    const isToday = isSameDay(currentDate, new Date());

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className={`p-6 rounded-xl border ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <div className="text-center mb-6">
            <p className="text-muted-foreground">{format(currentDate, 'EEEE')}</p>
            <p className={`text-4xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
              {format(currentDate, 'd')}
            </p>
            <p className="text-muted-foreground">{format(currentDate, 'MMMM yyyy')}</p>
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 text-center">
                      {event.duration > 0 ? (
                        <>
                          <p className="font-medium text-sm">{format(event.dateTime, 'h:mm')}</p>
                          <p className="text-xs opacity-70">{format(event.dateTime, 'a')}</p>
                        </>
                      ) : (
                        <p className="text-xs font-medium">All day</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.duration > 0 && (
                        <p className="text-sm opacity-70 mt-1">
                          Duration: {event.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">Manage your appointments and schedule</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Button variant="outline" size="icon" onClick={goToPrevious}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNext}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <CardTitle className="text-lg ml-2 truncate min-w-0" title={getHeaderTitle()}>
                      {getHeaderTitle()}
                    </CardTitle>
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex-shrink-0">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                      <TabsList>
                        <TabsTrigger value="month" className="gap-1.5">
                          <LayoutGrid className="w-4 h-4" />
                          Month
                        </TabsTrigger>
                        <TabsTrigger value="week" className="gap-1.5">
                          <Grid3X3 className="w-4 h-4" />
                          Week
                        </TabsTrigger>
                        <TabsTrigger value="day" className="gap-1.5">
                          <List className="w-4 h-4" />
                          Day
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {format(selectedDate, 'EEEE')}
                </CardTitle>
                <CardDescription>{format(selectedDate, 'MMMM d, yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events for this date</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{event.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {format(event.dateTime, 'h:mm a')} • {event.duration} min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full ${getEventDot(event.type)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {event.studentName || event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.dateTime, 'MMM d')} at {format(event.dateTime, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Consultation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Document Review</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-muted-foreground">Interview Prep</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-muted-foreground">Deadline</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default StaffCalendar;
