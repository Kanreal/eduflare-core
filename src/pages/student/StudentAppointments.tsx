import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  ExternalLink,
  CalendarDays
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, addDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';

// --- Mock Data ---
const mockAppointments = [
  {
    id: 'apt-1',
    title: 'Document Submission Review',
    type: 'document_submission',
    dateTime: addDays(new Date(), 2),
    duration: 30,
    staffName: 'Sarah Johnson',
    status: 'scheduled',
    location: 'Online - Zoom',
    joinUrl: 'https://zoom.us/j/123456789',
  },
  {
    id: 'apt-2',
    title: 'Visa Interview Prep',
    type: 'interview_prep',
    dateTime: addDays(new Date(), 5),
    duration: 60,
    staffName: 'Sarah Johnson',
    status: 'scheduled',
    location: 'Office - Room 201',
    joinUrl: null,
  },
  {
    id: 'apt-3',
    title: 'Initial Consultation',
    type: 'consultation',
    dateTime: addDays(new Date(), -10),
    duration: 45,
    staffName: 'James Mwanga',
    status: 'completed',
    location: 'Online - Zoom',
    joinUrl: 'https://zoom.us/j/987654321',
  },
];

const availableSlots = [
  { date: addDays(new Date(), 3), time: '10:00 AM' },
  { date: addDays(new Date(), 3), time: '2:00 PM' },
  { date: addDays(new Date(), 4), time: '09:00 AM' },
  { date: addDays(new Date(), 4), time: '11:00 AM' },
  { date: addDays(new Date(), 5), time: '03:00 PM' },
];

const StudentAppointments: React.FC = () => {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Derived state
  const upcomingAppointments = mockAppointments.filter(apt => apt.status === 'scheduled');
  const pastAppointments = mockAppointments.filter(apt => ['completed', 'cancelled'].includes(apt.status));

  const handleBookAppointment = () => {
    if (!selectedType || !selectedSlot) {
      toast.error('Please select both a type and a time slot.');
      return;
    }
    toast.success('Appointment request sent!', { description: 'Your consultant will confirm shortly.' });
    setIsBookingDialogOpen(false);
    setSelectedType('');
    setSelectedSlot('');
  };

  const handleCancel = (id: string) => {
    toast.success('Appointment cancelled successfully.');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return Video;
      case 'document_submission': return FileTextIcon; // Custom or FileText
      case 'interview_prep': return CalendarDays;
      default: return Calendar;
    }
  };

  // Helper for custom icons inside standard Lucid components logic
  const FileTextIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );

  return (
    <PortalLayout portal="student">
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Schedule meetings with your educational consultant</p>
          </div>
          <Button onClick={() => setIsBookingDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Book New Session
          </Button>
        </motion.div>

        {/* Upcoming Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
          </div>

          {upcomingAppointments.length === 0 ? (
            <Card className="card-elevated border-dashed bg-muted/20">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">No upcoming appointments</p>
                <Button variant="link" onClick={() => setIsBookingDialogOpen(true)}>Schedule one now</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((apt) => {
                const Icon = getTypeIcon(apt.type);
                const isOnline = apt.location.toLowerCase().includes('online') || apt.location.toLowerCase().includes('zoom');

                return (
                  <Card key={apt.id} className="card-elevated overflow-hidden border-l-4 border-l-primary">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Date Column */}
                        <div className="bg-primary/5 p-6 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-0 md:w-32 border-b md:border-b-0 md:border-r border-border/50">
                          <span className="text-sm font-bold text-primary uppercase tracking-wider">
                            {format(apt.dateTime, 'MMM')}
                          </span>
                          <span className="text-3xl font-bold text-foreground">
                            {format(apt.dateTime, 'd')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(apt.dateTime, 'EEEE')}
                          </span>
                        </div>

                        {/* Details Column */}
                        <div className="p-6 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{apt.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">with {apt.staffName}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {}}>Reschedule</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(apt.id)}>
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{format(apt.dateTime, 'h:mm a')} ({apt.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{apt.location}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {isOnline && (
                            <div className="mt-5">
                              <Button className="gap-2 w-full sm:w-auto" variant="outline" onClick={() => window.open(apt.joinUrl, '_blank')}>
                                <Video className="w-4 h-4 text-primary" />
                                Join Meeting
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Past Appointments Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 mt-8">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">History</h2>
          </div>

          <Card className="card-elevated">
            <CardContent className="p-0">
              {pastAppointments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No past appointments found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {pastAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
                          apt.status === 'completed' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {apt.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{apt.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{format(apt.dateTime, 'PPP')}</span>
                            <span>•</span>
                            <span>{apt.staffName}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge variant={apt.status === 'completed' ? 'success' : 'muted'}>
                        {apt.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Book an Appointment</DialogTitle>
              <DialogDescription>
                Choose a session type and a time that works for you.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-5">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>What is this regarding?</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'document_submission', label: 'Document Submission Review', desc: 'Submit and verify your application documents.' },
                    { id: 'consultation', label: 'General Consultation', desc: 'Discuss university options and strategy.' },
                    { id: 'interview_prep', label: 'Interview Preparation', desc: 'Mock interview session.' },
                  ].map((type) => (
                    <div 
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`cursor-pointer border rounded-lg p-3 transition-all hover:border-primary ${
                        selectedType === type.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedType === type.id ? 'border-primary' : 'border-muted-foreground'
                        }`}>
                          {selectedType === type.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slot Selection */}
              <div className="space-y-2">
                <Label>Select a Time Slot</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableSlots.map((slot, index) => {
                    const slotId = `${format(slot.date, 'yyyy-MM-dd')}-${slot.time}`;
                    const isSelected = selectedSlot === slotId;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slotId)}
                        className={`p-2 rounded-md border text-sm text-center transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="font-semibold">{format(slot.date, 'MMM d')}</div>
                        <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {slot.time}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleBookAppointment} disabled={!selectedType || !selectedSlot}>
                Confirm Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PortalLayout>
  );
};

export default StudentAppointments;