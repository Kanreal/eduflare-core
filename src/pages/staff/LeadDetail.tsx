import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  MessageSquare,
  Clock,
  Edit,
  UserPlus,
  History,
  Save,
  X,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { LeadStatus, LEAD_TRANSITIONS } from '@/types';
import { studyGoalOptions, countryOptions } from '@/lib/constants';

const getStatusVariant = (status: LeadStatus): 'primary' | 'error' | 'muted' | 'success' | 'warning' => {
  switch (status) {
    case 'new': return 'primary';
    case 'hot': return 'error';
    case 'cold': return 'muted';
    case 'converted': return 'success';
    case 'lost': return 'warning';
    default: return 'muted';
  }
};

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getLeadById, updateLead, changeLeadStatus, convertLeadToStudent, staff, logAudit } = useEduFlare();

  const lead = getLeadById(id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    studyGoal: lead?.studyGoal || '',
    preferredCountry: lead?.preferredCountry || '',
    notes: lead?.notes || '',
    message: lead?.message || '',
  });

  if (!lead) {
    return (
      <PortalLayout portal="staff">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Lead Not Found</h2>
          <p className="text-muted-foreground mb-4">The lead you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/staff/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const allowedTransitions = LEAD_TRANSITIONS[lead.status];
  const assignedStaff = staff.find(s => s.id === lead.assignedTo);

  const handleSave = () => {
    updateLead(lead.id, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      studyGoal: editForm.studyGoal as any,
      preferredCountry: editForm.preferredCountry as any,
      notes: editForm.notes,
      message: editForm.message,
    });
    logAudit({
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'staff',
      action: 'Lead Updated',
      details: `Updated lead ${lead.name}`,
      entityType: 'lead',
      entityId: lead.id,
      isOverride: false,
    });
    toast({
      title: "Lead Updated",
      description: "Lead information has been saved successfully.",
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    const success = changeLeadStatus(lead.id, newStatus);
    if (success) {
      logAudit({
        userId: 'current-user',
        userName: 'Current User',
        userRole: 'staff',
        action: 'Lead Status Changed',
        details: `Changed lead ${lead.name} status from ${lead.status} to ${newStatus}`,
        entityType: 'lead',
        entityId: lead.id,
        isOverride: false,
        previousValue: lead.status,
        newValue: newStatus,
      });
      toast({
        title: "Status Updated",
        description: `Lead status changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Invalid Transition",
        description: "This status transition is not allowed.",
        variant: "destructive",
      });
    }
  };

  const handleConvert = () => {
    const assignedStaffId = lead.assignedTo || staff[0]?.id;
    if (!assignedStaffId) {
      toast({
        title: "No Staff Assigned",
        description: "Please assign a staff member before converting.",
        variant: "destructive",
      });
      return;
    }
    
    const newStudent = convertLeadToStudent(lead.id, assignedStaffId);
    if (newStudent) {
      logAudit({
        userId: 'current-user',
        userName: 'Current User',
        userRole: 'staff',
        action: 'Lead Converted',
        details: `Converted lead ${lead.name} to student`,
        entityType: 'lead',
        entityId: lead.id,
        isOverride: false,
      });
      toast({
        title: "Lead Converted",
        description: `${lead.name} has been converted to a student.`,
      });
      navigate(`/staff/students/${newStudent.id}`);
    }
    setIsConvertDialogOpen(false);
  };

  const daysSinceContact = lead.lastContactAt 
    ? Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/staff/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={lead.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
              <p className="text-muted-foreground">{lead.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <StatusBadge variant={getStatusVariant(lead.status)}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </StatusBadge>
                {daysSinceContact !== null && daysSinceContact > 7 && (
                  <StatusBadge variant="warning">
                    Idle {daysSinceContact} days
                  </StatusBadge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => { if (lead.status !== 'converted') setIsEditing(true); }}
                  className="gap-2"
                  disabled={lead.status === 'converted'}
                  title={lead.status === 'converted' ? 'Lead converted — edit in student profile' : undefined}
                >
                  <Edit className="w-4 h-4" />
                  Edit Lead
                </Button>
                {lead.status !== 'converted' && lead.status !== 'lost' && (
                  <Button onClick={() => setIsConvertDialogOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Convert to Student
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
                <CardDescription>Contact details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studyGoal">Study Goal</Label>
                        <Select 
                          value={editForm.studyGoal} 
                          onValueChange={(value) => setEditForm({ ...editForm, studyGoal: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            {studyGoalOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredCountry">Preferred Country</Label>
                        <Select 
                          value={editForm.preferredCountry} 
                          onValueChange={(value) => setEditForm({ ...editForm, preferredCountry: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countryOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Initial Message</Label>
                      <Textarea
                        id="message"
                        value={editForm.message}
                        onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={4}
                        placeholder="Add private notes about this lead..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {lead.name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {lead.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Phone</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {lead.phone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Source</Label>
                        <p className="font-medium capitalize">{lead.source}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Study Goal</Label>
                        <p className="font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          {studyGoalOptions.find(o => o.value === lead.studyGoal)?.label || 'Not specified'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Preferred Country</Label>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {countryOptions.find(o => o.value === lead.preferredCountry)?.label || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {lead.message && (
                      <div className="border-t border-border pt-4">
                        <Label className="text-muted-foreground">Initial Message</Label>
                        <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{lead.message}</p>
                        </div>
                      </div>
                    )}

                    {lead.notes && (
                      <div className="border-t border-border pt-4">
                        <Label className="text-muted-foreground">Notes</Label>
                        <div className="mt-2 p-3 rounded-lg bg-muted/50">
                          <p className="text-sm">{lead.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Current Status</Label>
                  <StatusBadge variant={getStatusVariant(lead.status)}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </StatusBadge>
                </div>

                {allowedTransitions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Change Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {allowedTransitions.map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(status)}
                          className="capitalize"
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Lead Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {lead.lastContactAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2" />
                      <div>
                        <p className="text-sm font-medium">Last Contact</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.lastContactAt).toLocaleDateString()} at {new Date(lead.lastContactAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {lead.convertedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2" />
                      <div>
                        <p className="text-sm font-medium">Converted to Student</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.convertedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assigned Staff */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedStaff ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={assignedStaff.name} size="sm" />
                    <div>
                      <p className="font-medium">{assignedStaff.name}</p>
                      <p className="text-sm text-muted-foreground">{assignedStaff.department}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No staff assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Convert Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Lead to Student</DialogTitle>
              <DialogDescription>
                This will create a new student profile for <strong>{lead.name}</strong> and 
                generate a service agreement. The lead will be marked as converted.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={lead.name} />
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvert} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Convert to Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default LeadDetail;
