import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';

const mockEvents = [
  { id: '1', title: 'Document Review - John Doe', type: 'document_submission', dateTime: addDays(new Date(), 0), duration: 60, studentName: 'John Doe' },
  { id: '2', title: 'Consultation - Emily Wilson', type: 'consultation', dateTime: addDays(new Date(), 1), duration: 45, studentName: 'Emily Wilson' },
  { id: '3', title: 'Interview Prep - Jane Smith', type: 'interview_prep', dateTime: addDays(new Date(), 2), duration: 90, studentName: 'Jane Smith' },
  { id: '4', title: 'Application Review - David Brown', type: 'document_submission', dateTime: addDays(new Date(), 3), duration: 60, studentName: 'David Brown' },
  { id: '5', title: 'Follow-up Call - Lisa Chen', type: 'consultation', dateTime: addDays(new Date(), 5), duration: 30, studentName: 'Lisa Chen' },
];

const StaffCalendar: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getEventsForDay = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.dateTime, date));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-primary/10 border-primary/30 text-primary';
      case 'document_submission': return 'bg-success/10 border-success/30 text-success';
      case 'interview_prep': return 'bg-warning/10 border-warning/30 text-warning';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  const todayEvents = getEventsForDay(new Date());
  const upcomingEvents = mockEvents
    .filter(event => event.dateTime > new Date())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, 5);

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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {format(currentWeekStart, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                        className={`min-h-32 p-2 rounded-lg border ${
                          isToday ? 'border-primary bg-primary/5' : 'border-border/50'
                        }`}
                      >
                        <div className="text-center mb-2">
                          <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                          <p className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                            {format(day, 'd')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={`p-1.5 rounded text-xs border ${getEventColor(event.type)}`}
                            >
                              <p className="font-medium truncate">{event.studentName}</p>
                              <p className="text-[10px] opacity-70">{format(event.dateTime, 'h:mm a')}</p>
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
                  Today's Schedule
                </CardTitle>
                <CardDescription>{format(new Date(), 'EEEE, MMMM d')}</CardDescription>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events today</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
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
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'consultation' ? 'bg-primary' :
                        event.type === 'document_submission' ? 'bg-success' : 'bg-warning'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.dateTime, 'MMM d')} at {format(event.dateTime, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
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
