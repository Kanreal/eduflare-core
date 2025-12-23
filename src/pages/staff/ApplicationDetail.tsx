import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  User,
  Calendar,
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { generateMockData } from '@/lib/mockData';
import { UniversityApplicationStatus } from '@/types';

const { applications, students, universities, documents } = generateMockData();

const statusConfig: Record<UniversityApplicationStatus, { label: string; variant: 'warning' | 'primary' | 'success' | 'error' | 'muted'; icon: typeof Clock }> = {
  draft: { label: 'Draft', variant: 'muted', icon: FileText },
  pending_admin: { label: 'Pending Admin Review', variant: 'warning', icon: Clock },
  approved: { label: 'Approved by Admin', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'error', icon: XCircle },
  submitted_to_uni: { label: 'Submitted to University', variant: 'primary', icon: Send },
  returned_by_school: { label: 'Returned by School', variant: 'warning', icon: AlertCircle },
  accepted: { label: 'Accepted', variant: 'success', icon: CheckCircle },
  declined: { label: 'Declined', variant: 'error', icon: XCircle },
};

const StaffApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  // Find application
  const application = applications.find(app => app.id === id);
  const student = application ? students.find(s => s.id === application.studentId) : null;
  const university = application ? universities.find(u => u.id === application.universityId) : null;
  const studentDocs = student ? documents.filter(d => d.studentId === student.id) : [];

  if (!application || !student) {
    return (
      <PortalLayout portal="staff">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-4">The application you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/staff/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const StatusIcon = statusConfig[application.status].icon;
  const canSubmitToAdmin = application.status === 'draft' || application.status === 'returned_by_school';
  const verifiedDocs = studentDocs.filter(d => d.status === 'verified').length;
  const totalRequiredDocs = studentDocs.length;

  const handleSubmitToAdmin = () => {
    if (verifiedDocs < totalRequiredDocs) {
      toast({
        title: "Cannot Submit",
        description: "All documents must be verified before submitting to admin.",
        variant: "destructive",
      });
      return;
    }
    setSubmitDialogOpen(true);
  };

  const confirmSubmitToAdmin = () => {
    // In real app, this would call an API
    toast({
      title: "Submitted to Admin",
      description: "Application has been submitted for admin review.",
    });
    setSubmitDialogOpen(false);
  };

  // Timeline events
  const timelineEvents = [
    { date: application.createdAt, label: 'Application Created', icon: FileText },
    ...(application.submittedToAdminAt ? [{ date: application.submittedToAdminAt, label: 'Submitted to Admin', icon: Upload }] : []),
    ...(application.approvedAt ? [{ date: application.approvedAt, label: 'Approved by Admin', icon: CheckCircle }] : []),
    ...(application.submittedToUniAt ? [{ date: application.submittedToUniAt, label: 'Submitted to University', icon: Send }] : []),
    ...(application.returnedAt ? [{ date: application.returnedAt, label: 'Returned by School', icon: AlertCircle }] : []),
    ...(application.responseAt ? [{ date: application.responseAt, label: 'Response Received', icon: CheckCircle }] : []),
  ];

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/staff/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{university?.name || application.universityName}</h1>
              <StatusBadge variant={statusConfig[application.status].variant}>
                {statusConfig[application.status].label}
              </StatusBadge>
            </div>
            <p className="text-muted-foreground mt-1">{application.program}</p>
          </div>
          {canSubmitToAdmin && (
            <Button onClick={handleSubmitToAdmin} className="gap-2">
              <Send className="w-4 h-4" />
              Submit to Admin
            </Button>
          )}
        </div>

        {/* Return Alert if applicable */}
        {application.status === 'returned_by_school' && application.returnReason && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Returned by University</AlertTitle>
            <AlertDescription>
              {application.returnReason}
              {application.returnedFields && application.returnedFields.length > 0 && (
                <div className="mt-2">
                  <strong>Fields to update:</strong> {application.returnedFields.join(', ')}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents ({verifiedDocs}/{totalRequiredDocs})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>University and program information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* University Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">University</Label>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">{university?.name || application.universityName}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Location</Label>
                        <p className="font-medium">{university?.city}, {university?.country}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Program</Label>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="font-medium">{application.program}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Partner Status</Label>
                        <p className="font-medium">{university?.isPartner ? 'Partner University' : 'Non-Partner'}</p>
                      </div>
                    </div>

                    {/* Application Strategy */}
                    <div className="border-t border-border pt-4">
                      <h4 className="font-medium mb-3">Application Strategy</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border p-3">
                          <p className="text-sm text-muted-foreground">Batch</p>
                          <p className="text-lg font-semibold">Batch {application.batch}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.batch === 1 ? 'First 2 universities' : 'Next 3 universities'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <p className="text-sm text-muted-foreground">Priority</p>
                          <p className="text-lg font-semibold">#{application.priority}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.priority === 1 ? 'Top choice' : application.priority <= 3 ? 'High priority' : 'Safety'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {application.adminNotes && (
                      <div className="border-t border-border pt-4">
                        <h4 className="font-medium mb-2">Admin Notes</h4>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-sm">{application.adminNotes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>Documents needed for this application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentDocs.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{doc.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <StatusBadge 
                            variant={
                              doc.status === 'verified' ? 'success' :
                              doc.status === 'error' ? 'error' :
                              doc.status === 'locked' ? 'muted' : 'warning'
                            }
                          >
                            {doc.status}
                          </StatusBadge>
                        </div>
                      ))}
                    </div>
                    {verifiedDocs < totalRequiredDocs && (
                      <p className="text-sm text-warning mt-4">
                        ⚠️ All documents must be verified before submitting to admin
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                    <CardDescription>Track the progress of this application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-0">
                      {timelineEvents.map((event, index) => {
                        const Icon = event.icon;
                        return (
                          <div key={index} className="flex gap-4 pb-6 last:pb-0">
                            <div className="relative flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              {index < timelineEvents.length - 1 && (
                                <div className="w-0.5 flex-1 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="font-medium text-sm">{event.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Student Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={student.name} />
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality</span>
                    <span>{student.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passport</span>
                    <span>{student.passportNumber}</span>
                  </div>
                  {student.passportExpiry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passport Expiry</span>
                      <span>{new Date(student.passportExpiry).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/staff/students/${student.id}`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Application Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
                {application.submittedToAdminAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Submitted to Admin</span>
                    <span>{new Date(application.submittedToAdminAt).toLocaleDateString()}</span>
                  </div>
                )}
                {application.submittedToUniAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sent to University</span>
                    <span>{new Date(application.submittedToUniAt).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit to Admin Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Application to Admin</DialogTitle>
              <DialogDescription>
                This will lock the application and send it for admin review. Make sure all documents are verified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm"><strong>Student:</strong> {student.name}</p>
                <p className="text-sm"><strong>University:</strong> {application.universityName}</p>
                <p className="text-sm"><strong>Program:</strong> {application.program}</p>
              </div>
              <div className="space-y-2">
                <Label>Notes for Admin (optional)</Label>
                <Textarea 
                  placeholder="Any notes for the admin reviewer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSubmitToAdmin}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default StaffApplicationDetail;
