import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, Plus, CheckCircle, XCircle } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

const mockAppointments = [
  {
    id: 'apt-1',
    title: 'Document Submission',
    type: 'document_submission',
    dateTime: addDays(new Date(), 2),
    duration: 60,
    staffName: 'Sarah Johnson',
    status: 'scheduled',
    location: 'Online - Zoom',
  },
  {
    id: 'apt-2',
    title: 'Interview Preparation',
    type: 'interview_prep',
    dateTime: addDays(new Date(), 5),
    duration: 90,
    staffName: 'Sarah Johnson',
    status: 'scheduled',
    location: 'Office - Room 201',
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
  },
];

const availableSlots = [
  { date: addDays(new Date(), 3), time: '10:00 AM' },
  { date: addDays(new Date(), 3), time: '2:00 PM' },
  { date: addDays(new Date(), 4), time: '9:00 AM' },
  { date: addDays(new Date(), 4), time: '11:00 AM' },
  { date: addDays(new Date(), 5), time: '3:00 PM' },
];

const StudentAppointments: React.FC = () => {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const upcomingAppointments = mockAppointments.filter(apt => apt.status === 'scheduled');
  const pastAppointments = mockAppointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled');

  const handleBookAppointment = () => {
    if (!selectedType || !selectedSlot) {
      toast.error('Please select appointment type and time slot');
      return;
    }
    toast.success('Appointment booked successfully!');
    setIsBookingDialogOpen(false);
    setSelectedType('');
    setSelectedSlot('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return Video;
      case 'document_submission': return Calendar;
      case 'interview_prep': return Clock;
      default: return Calendar;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'muted' | 'error' => {
    switch (status) {
      case 'scheduled': return 'success';
      case 'completed': return 'muted';
      case 'cancelled': return 'error';
      default: return 'muted';
    }
  };

  return (
    <PortalLayout portal="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage your appointments</p>
          </div>
          <Button className="gap-2" onClick={() => setIsBookingDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled meetings and consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming appointments. Book one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((apt, index) => {
                  const TypeIcon = getTypeIcon(apt.type);
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{apt.title}</h3>
                            <p className="text-sm text-muted-foreground">with {apt.staffName}</p>
                          </div>
                          <StatusBadge status={apt.status} variant={getStatusVariant(apt.status)} />
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(apt.dateTime, 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(apt.dateTime, 'h:mm a')} ({apt.duration} min)
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {apt.location}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Past Appointments</CardTitle>
            <CardDescription>Your appointment history</CardDescription>
          </CardHeader>
          <CardContent>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No past appointments yet.
              </div>
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {apt.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{apt.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(apt.dateTime, 'MMM d, yyyy')} • {apt.staffName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} variant={getStatusVariant(apt.status)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
            <DialogDescription>
              Select your appointment type and preferred time slot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="document_submission">Document Submission</SelectItem>
                  <SelectItem value="interview_prep">Interview Preparation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(`${format(slot.date, 'yyyy-MM-dd')}-${slot.time}`)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedSlot === `${format(slot.date, 'yyyy-MM-dd')}-${slot.time}`
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{format(slot.date, 'EEEE, MMM d')}</div>
                    <div className="text-sm text-muted-foreground">{slot.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookAppointment}>
              Book Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default StudentAppointments;
