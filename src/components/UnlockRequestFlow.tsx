import React, { useState } from 'react';
import { Lock, Unlock, Send, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/EduFlareUI';
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

// Available fields that can be unlocked
const UNLOCKABLE_FIELDS = [
  { id: 'passportNumber', label: 'Passport Number' },
  { id: 'passportExpiry', label: 'Passport Expiry' },
  { id: 'currentAddress', label: 'Current Address' },
  { id: 'permanentAddress', label: 'Permanent Address' },
  { id: 'fatherName', label: 'Father Name' },
  { id: 'motherName', label: 'Mother Name' },
  { id: 'healthConditions', label: 'Health Conditions' },
  { id: 'highSchoolName', label: 'High School Name' },
  { id: 'highSchoolGrade', label: 'High School Grade' },
  { id: 'previousDegree', label: 'Previous Degree' },
  { id: 'previousInstitution', label: 'Previous Institution' },
];

interface UnlockRequest {
  id: string;
  studentId: string;
  studentName: string;
  requestedBy: string;
  requestedByRole: 'staff' | 'student';
  requestedFields: string[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
  adminNotes?: string;
}

interface StaffUnlockRequestButtonProps {
  studentId: string;
  studentName: string;
  isLocked: boolean;
  onRequestSubmit?: (fields: string[], reason: string) => void;
}

// Component for Staff to request unlock
export const StaffUnlockRequestButton: React.FC<StaffUnlockRequestButtonProps> = ({
  studentId,
  studentName,
  isLocked,
  onRequestSubmit,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [reason, setReason] = useState('');

  if (!isLocked) return null;

  const handleSubmit = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Select Fields",
        description: "Please select at least one field to unlock.",
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the unlock request.",
        variant: "destructive",
      });
      return;
    }

    onRequestSubmit?.(selectedFields, reason);
    toast({
      title: "Request Submitted",
      description: "Your unlock request has been sent to admin for approval.",
    });
    setIsOpen(false);
    setSelectedFields([]);
    setReason('');
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
        <Unlock className="w-4 h-4" />
        Request Unlock
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-warning" />
              Request Profile Unlock
            </DialogTitle>
            <DialogDescription>
              Request admin approval to unlock specific fields for <strong>{studentName}</strong>.
              This is required because the application has been submitted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Why is this locked?</AlertTitle>
              <AlertDescription>
                Once an application is submitted to admin, the student profile is locked to prevent 
                changes that could affect the application. Only admin can approve unlocks.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Select Fields to Unlock</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                {UNLOCKABLE_FIELDS.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Unlock Request *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why these fields need to be updated..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface AdminUnlockReviewProps {
  requests: UnlockRequest[];
  onApprove: (requestId: string, adminNotes?: string) => void;
  onReject: (requestId: string, adminNotes?: string) => void;
}

// Component for Admin to review unlock requests
export const AdminUnlockReview: React.FC<AdminUnlockReviewProps> = ({
  requests,
  onApprove,
  onReject,
}) => {
  const { toast } = useToast();
  const [reviewingRequest, setReviewingRequest] = useState<UnlockRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return null;
  }

  const handleAction = () => {
    if (!reviewingRequest || !action) return;

    if (action === 'approve') {
      onApprove(reviewingRequest.id, adminNotes);
      toast({
        title: "Request Approved",
        description: `Unlock request for ${reviewingRequest.studentName} has been approved.`,
      });
    } else {
      onReject(reviewingRequest.id, adminNotes);
      toast({
        title: "Request Rejected",
        description: `Unlock request for ${reviewingRequest.studentName} has been rejected.`,
      });
    }

    setReviewingRequest(null);
    setAdminNotes('');
    setAction(null);
  };

  return (
    <>
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-warning" />
          Pending Unlock Requests ({pendingRequests.length})
        </h3>
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div 
              key={request.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div>
                <p className="font-medium">{request.studentName}</p>
                <p className="text-sm text-muted-foreground">
                  {request.requestedFields.length} fields • Requested by {request.requestedByRole}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setReviewingRequest(request);
                    setAction('reject');
                  }}
                  className="text-error"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setReviewingRequest(request);
                    setAction('approve');
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!reviewingRequest} onOpenChange={() => setReviewingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-error" />
              )}
              {action === 'approve' ? 'Approve' : 'Reject'} Unlock Request
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? 'This will unlock the requested fields for staff to edit.'
                : 'This will reject the request. The student profile will remain locked.'}
            </DialogDescription>
          </DialogHeader>

          {reviewingRequest && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">{reviewingRequest.studentName}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm text-muted-foreground mb-2">Requested Fields</p>
                <div className="flex flex-wrap gap-2">
                  {reviewingRequest.requestedFields.map((field) => (
                    <StatusBadge key={field} variant="muted">
                      {UNLOCKABLE_FIELDS.find(f => f.id === field)?.label || field}
                    </StatusBadge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="text-sm">{reviewingRequest.reason}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes for this decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingRequest(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              variant={action === 'reject' ? 'destructive' : 'default'}
              className="gap-2"
            >
              {action === 'approve' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve Unlock
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Lock indicator component for showing lock status
interface LockIndicatorProps {
  isLocked: boolean;
  lockedAt?: Date;
  unlockedFields?: string[];
}

export const LockIndicator: React.FC<LockIndicatorProps> = ({
  isLocked,
  lockedAt,
  unlockedFields,
}) => {
  if (!isLocked) return null;

  return (
    <Alert className="border-warning/30 bg-warning/5">
      <Lock className="h-4 w-4 text-warning" />
      <AlertTitle>Profile Locked</AlertTitle>
      <AlertDescription>
        This profile was locked on {lockedAt ? new Date(lockedAt).toLocaleDateString() : 'submission'}. 
        {unlockedFields && unlockedFields.length > 0 ? (
          <>
            <br />
            <span className="text-success">Unlocked fields: {unlockedFields.join(', ')}</span>
          </>
        ) : (
          ' Changes require admin approval.'
        )}
      </AlertDescription>
    </Alert>
  );
};
