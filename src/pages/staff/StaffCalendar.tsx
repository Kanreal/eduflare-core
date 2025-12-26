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
  CheckCircle,
  XCircle,
  Video,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  setHours,
  setMinutes
} from 'date-fns';
import { toast } from 'sonner';

// --- Types & Mock Data ---
type ViewMode = 'month' | 'week' | 'day';

const mockEvents = [
  { id: '1', title: 'Document Review', type: 'document_submission', dateTime: setHours(new Date(), 10), duration: 60, studentName: 'John Doe', status: 'scheduled', location: 'Online' },
  { id: '2', title: 'Initial Consultation', type: 'consultation', dateTime: addDays(new Date(), 1), duration: 45, studentName: 'Emily Wilson', status: 'scheduled', location: 'Zoom' },
  { id: '3', title: 'Visa Interview Prep', type: 'interview_prep', dateTime: addDays(new Date(), 2), duration: 90, studentName: 'Jane Smith', status: 'scheduled', location: 'Office 204' },
  { id: '4', title: 'Contract Signing', type: 'consultation', dateTime: addDays(new Date(), 3), duration: 30, studentName: 'David Brown', status: 'pending', location: 'Office 101' }, // Pending Request
];

// Incoming requests from Students (The "Queue")
const pendingRequests = [
  { id: 'req-1', studentName: 'Michael Chen', type: 'consultation', requestedDate: addDays(new Date(), 4), requestedTime: '10:00 AM' },
  { id: 'req-2', studentName: 'Sarah Connor', type: 'document_submission', requestedDate: addDays(new Date(), 5), requestedTime: '02:00 PM' },
];

const StaffCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // --- Helpers ---
  const getEventsForDay = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.dateTime, date));
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'consultation': return { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', icon: Video };
      case 'document_submission': return { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', icon: FileText };
      case 'interview_prep': return { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', icon: User };
      default: return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', icon: CalendarIcon };
    }
  };

  // --- Navigation Handlers ---
  const goToPrevious = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const goToNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleConfirmRequest = (id: string) => {
    toast.success("Appointment Confirmed", { description: "Notification sent to student." });
  };

  // --- Renderers ---
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = addDays(startOfWeek(addDays(monthEnd, 7), { weekStartsOn: 1 }), -1);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 auto-rows-[100px]">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                onClick={() => { setSelectedDate(day); setCurrentDate(day); }}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 overflow-hidden ${
                  !isCurrentMonth ? 'bg-muted/20 opacity-50' : 'bg-card'
                } ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto hide-scrollbar">
                  {dayEvents.map((event) => {
                    const style = getEventStyle(event.type);
                    return (
                      <div key={event.id} onClick={(e) => { e.stopPropagation(); handleEventClick(event); }} className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-medium ${style.bg} ${style.border} ${style.text}`}>
                        {event.status === 'pending' && '❓ '}{format(event.dateTime, 'HH:mm')} {event.studentName.split(' ')[0]}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="grid grid-cols-7 gap-2 h-full min-h-[500px]">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={index}
              onClick={() => { setSelectedDate(day); setCurrentDate(day); }}
              className={`flex flex-col rounded-lg border transition-all cursor-pointer overflow-hidden ${
                isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${isToday ? 'bg-muted/30' : ''}`}
            >
              {/* Header */}
              <div className={`p-2 text-center border-b ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                <p className="text-xs font-medium uppercase opacity-80">{format(day, 'EEE')}</p>
                <p className="text-lg font-bold">{format(day, 'd')}</p>
              </div>

              {/* Events Container */}
              <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => {
                    const style = getEventStyle(event.type);
                    return (
                      <div 
                        key={event.id} 
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        className={`p-2 rounded border text-xs flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02] ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${style.text}`}>{format(event.dateTime, 'HH:mm')}</span>
                          {event.status === 'pending' && <span title="Needs Approval">⚠️</span>}
                        </div>
                        <p className="font-medium text-foreground truncate leading-tight" title={event.title}>{event.title}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                          <User className="w-3 h-3" /> {event.studentName.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center opacity-20 hover:opacity-40 transition-opacity">
                    <Plus className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    // Simple vertical timeline for the day
    const dayEvents = getEventsForDay(currentDate).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" /> {format(currentDate, 'EEEE, MMMM do')}
        </h3>
        {dayEvents.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
            No events scheduled for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => {
                const style = getEventStyle(event.type);
                const Icon = style.icon;
                return (
                    <div key={event.id} onClick={() => handleEventClick(event)} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-0.5">Student: <span className="font-medium text-foreground">{event.studentName}</span></p>
                                </div>
                                <StatusBadge variant={event.status === 'pending' ? 'warning' : 'success'}>
                                    {event.status === 'pending' ? 'Needs Approval' : 'Confirmed'}
                                </StatusBadge>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(event.dateTime, 'h:mm a')} - {format(addDays(event.dateTime, 0), 'h:mm a')} ({event.duration}m)</div>
                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</div>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage appointments and student requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <List className="w-4 h-4" /> Availability
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Manual Booking
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Main Calendar Area */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <Card className="flex flex-col flex-1 min-h-0 overflow-hidden shadow-sm">
              <CardHeader className="py-4 border-b shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPrevious} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">Today</Button>
                    <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
                    <span className="font-semibold text-lg ml-2 w-32">{format(currentDate, 'MMMM yyyy')}</span>
                  </div>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="shrink-0">
                    <TabsList className="h-9">
                      <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                      <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                      <TabsTrigger value="day" className="text-xs">Day</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Requests & Today */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-1">
            
            {/* Pending Requests (The "Seamless Integration" part) */}
            <Card className="border-l-4 border-l-warning shadow-sm">
                <CardHeader className="py-4 px-5">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" /> Pending Requests
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-3">
                    {pendingRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No pending requests.</p>
                    ) : (
                        pendingRequests.map(req => (
                            <div key={req.id} className="p-3 bg-muted/30 rounded-lg border text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Avatar name={req.studentName} size="sm" />
                                    <div>
                                        <p className="font-medium leading-none">{req.studentName}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">wants {req.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <CalendarIcon className="w-3 h-3" /> {format(req.requestedDate, 'MMM d')} • {req.requestedTime}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="outline" className="h-7 text-xs">Reschedule</Button>
                                    <Button size="sm" className="h-7 text-xs bg-success hover:bg-success/90 text-white" onClick={() => handleConfirmRequest(req.id)}>Confirm</Button>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Upcoming for Selected Date */}
            <Card className="shadow-sm">
                <CardHeader className="py-4 px-5">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> {isSameDay(selectedDate, new Date()) ? "Today's" : format(selectedDate, 'MMM d')} Agenda
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-3">
                    {getEventsForDay(selectedDate).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Free day!</p>
                    ) : (
                        getEventsForDay(selectedDate).map(evt => {
                            const style = getEventStyle(evt.type);
                            return (
                                <div key={evt.id} className="flex gap-3 items-start p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors" onClick={() => handleEventClick(evt)}>
                                    <div className={`w-1 h-full min-h-[30px] rounded-full ${style.bg.replace('bg-', 'bg-').replace('100', '500')}`} />
                                    <div>
                                        <p className="font-medium text-sm">{evt.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(evt.dateTime, 'h:mm a')} • {evt.studentName}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Detail Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {selectedEvent && (
                            <span className={`px-2 py-0.5 rounded text-xs font-normal border ${getEventStyle(selectedEvent.type).bg} ${getEventStyle(selectedEvent.type).text} ${getEventStyle(selectedEvent.type).border}`}>
                                {selectedEvent.type.replace('_', ' ').toUpperCase()}
                            </span>
                        )}
                        Appointment Details
                    </DialogTitle>
                    <DialogDescription>Manage this session</DialogDescription>
                </DialogHeader>
                {selectedEvent && (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Avatar name={selectedEvent.studentName} />
                            <div>
                                <p className="font-medium text-foreground">{selectedEvent.studentName}</p>
                                <p className="text-sm text-muted-foreground">Student ID: STD-001</p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto text-xs">View Profile</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Date & Time</span>
                                <p className="font-medium flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> {format(selectedEvent.dateTime, 'PPP p')}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground">Location</span>
                                <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> {selectedEvent.location}</p>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="destructive" className="mr-auto" onClick={() => setIsEventDialogOpen(false)}>Cancel Appointment</Button>
                    <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Reschedule</Button>
                    <Button onClick={() => setIsEventDialogOpen(false)} className="bg-success hover:bg-success/90">Mark Completed</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </PortalLayout>
  );
};

export default StaffCalendar;