import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Lock,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Eye,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, DocumentCard } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mockDocuments } from '@/lib/constants';

// Mock application detail
const mockApplicationDetail = {
  id: 'app-1',
  studentName: 'John Doe',
  studentEmail: 'john.doe@email.com',
  studentPhone: '+1 234 567 890',
  university: 'Harvard University',
  program: 'Computer Science',
  status: 'pending_review',
  priority: 'high',
  submittedAt: new Date('2024-03-18'),
  assignedStaff: 'Sarah Johnson',
  notes: 'Strong academic background, excellent references.',
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isUploadOfferDialogOpen, setIsUploadOfferDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const application = mockApplicationDetail;
  const documents = mockDocuments.filter(d => d.status !== 'locked');

  const handleBulkDownload = () => {
    // Simulate bulk download
    console.log('Downloading all documents...');
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/admin/applications')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={application.studentName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{application.studentName}</h1>
              <p className="text-muted-foreground">{application.studentEmail}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <StatusBadge variant="warning">Pending Review</StatusBadge>
                <StatusBadge variant="error">High Priority</StatusBadge>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleBulkDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download All Docs
            </Button>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(true)} className="gap-2 text-error border-error/30 hover:bg-error/10">
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button onClick={() => setIsSubmitDialogOpen(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Submit to University
            </Button>
          </div>
        </div>

        {/* Application Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Application Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">University</label>
                <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  {application.university}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Program</label>
                <p className="font-medium text-foreground mt-1">{application.program}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Submitted</label>
                <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {application.submittedAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Assigned Staff</label>
                <p className="font-medium text-foreground mt-1">{application.assignedStaff}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Notes</label>
                <p className="text-sm text-foreground mt-1 p-3 rounded-lg bg-muted/50">{application.notes}</p>
              </div>
            </div>
          </motion.div>

          {/* Documents Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Student Documents
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">{documents.filter(d => d.status === 'verified').length} verified</span>
                <span className="text-muted-foreground">of {documents.length}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  name={doc.name}
                  type={doc.type}
                  status={doc.status}
                  uploadedAt={doc.uploadedAt}
                  onView={() => {}}
                  onDownload={doc.status === 'verified' ? () => {} : undefined}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <h2 className="font-semibold text-foreground mb-4">Additional Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setIsUploadOfferDialogOpen(true)} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Upload Offer Letter
            </Button>
            <Button variant="outline" onClick={() => setIsLockDialogOpen(true)} className="gap-2">
              <Lock className="w-4 h-4" />
              Mark as Submitted (Lock)
            </Button>
          </div>
        </motion.div>

        {/* Submit to University Dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Submit Application to University
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this application to {application.university}? 
                This will notify the student and update the application status.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-foreground">
                  <strong>{application.studentName}</strong> - {application.program}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All {documents.filter(d => d.status === 'verified').length} verified documents will be included
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSubmitDialogOpen(false)} className="gap-2">
                <Upload className="w-4 h-4" />
                Confirm Submission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-error">
                <XCircle className="w-5 h-5" />
                Reject Application
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. Please provide a reason for rejection.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="rounded-lg border border-error/30 bg-error/5 p-4">
                <div className="flex items-center gap-2 text-error mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-foreground">
                  Rejecting this application will notify the student and permanently close this application.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea id="reason" placeholder="Please provide a detailed reason for rejection..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setIsRejectDialogOpen(false)} className="gap-2">
                <XCircle className="w-4 h-4" />
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Offer Dialog */}
        <Dialog open={isUploadOfferDialogOpen} onOpenChange={setIsUploadOfferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Upload Offer Letter
              </DialogTitle>
              <DialogDescription>
                Upload the admission offer letter and JW202 form for this student.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click or drag files to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG up to 10MB each
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOfferDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsUploadOfferDialogOpen(false)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lock Application Dialog */}
        <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                Mark as Submitted (Permanent Lock)
              </DialogTitle>
              <DialogDescription>
                This action will permanently lock this application. No further changes can be made.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Important</span>
                </div>
                <p className="text-sm text-foreground">
                  Once marked as submitted, this application will be locked and no modifications 
                  can be made. This is typically done after the application has been successfully 
                  submitted to the university.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsLockDialogOpen(false)} className="gap-2">
                <Lock className="w-4 h-4" />
                Lock Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default ApplicationDetail;
