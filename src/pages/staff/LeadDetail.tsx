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
  CreditCard,
  Upload,
  CheckCircle
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
  const { getLeadById, updateLead, changeLeadStatus, convertLeadToStudent, staff, logAudit, createInvoice, addDocument } = useEduFlare();
  
  // Auth context for role check (simulated)
  const role = 'staff'; 

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

  // Conversion State
  const [convAmount, setConvAmount] = useState<number>(50000);
  const [convCurrency, setConvCurrency] = useState<'TZS' | 'USD'>('TZS');
  const [convReceiptFile, setConvReceiptFile] = useState<File | null>(null);
  const [screeningData, setScreeningData] = useState({ nationality: '', dob: '', grade: '' }); // Phase B Requirement
  const [convErrors, setConvErrors] = useState<Record<string,string>>({});
  const [tempPasswordToShow, setTempPasswordToShow] = useState<string | null>(null);
  const [convertedStudentId, setConvertedStudentId] = useState<string | null>(null);

  if (!lead) {
    return (
      <PortalLayout portal="staff">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Lead Not Found</h2>
          <Button onClick={() => navigate('/staff/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
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
    toast({ title: "Lead Updated", description: "Information saved successfully." });
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
        details: `Changed status to ${newStatus}`,
        entityType: 'lead',
        entityId: lead.id,
        isOverride: false,
      });
      toast({ title: "Status Updated", description: `Lead is now ${newStatus}.` });
    }
  };

  const handleConvert = () => {
    const assignedStaffId = lead.assignedTo || staff[0]?.id;
    if (!assignedStaffId) {
      toast({ title: "Validation Error", description: "Assign staff before converting.", variant: "destructive" });
      return;
    }

    // Validation for Financials & Screening
    const errors: Record<string,string> = {};
    if (!convAmount || convAmount <= 0) errors.amount = 'Payment amount is required';
    if (!convReceiptFile) errors.receipt = 'Payment receipt is required';
    if (!screeningData.nationality) errors.nationality = 'Nationality required for screening';
    
    if (Object.keys(errors).length > 0) {
      setConvErrors(errors);
      return;
    }
    
    // 1. Create Student
    const newStudent = convertLeadToStudent(lead.id, assignedStaffId);
    
    if (newStudent) {
      // 2. Record Financial Event (Opening Book)
      createInvoice({
        studentId: newStudent.id,
        studentName: newStudent.name,
        type: 'opening_book',
        amount: convAmount,
        currency: convCurrency,
        status: 'paid',
        dueDate: new Date(),
        paidAt: new Date(),
        description: 'Opening Book / Consultation Fee',
        isReversal: false,
      });

      // 3. Store Receipt
      const fileUrl = window.URL.createObjectURL(convReceiptFile as File);
      addDocument({
        name: `Opening Book Receipt - ${newStudent.name}`,
        type: 'financial',
        status: 'verified',
        uploadedAt: new Date(),
        verifiedAt: new Date(),
        studentId: newStudent.id,
        isLocked: true,
        isHidden: false,
        fileUrl,
      });

      // 4. Update Student with Screening Data (Mock update)
      // updateStudent(newStudent.id, { nationality: screeningData.nationality, ... }) 

      logAudit({
        userId: 'current-user',
        userName: 'Current User',
        userRole: 'staff',
        action: 'Lead Converted',
        details: `Converted ${lead.name} to student. Fee Paid: ${convAmount} ${convCurrency}`,
        entityType: 'lead',
        entityId: lead.id,
        isOverride: false,
      });

      setTempPasswordToShow((newStudent as any).tempPassword || 'TEMP1234');
      setConvertedStudentId(newStudent.id);
      
      // Reset form but keep dialog open for password
      setConvReceiptFile(null);
      setConvErrors({});
    }
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
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
                  <StatusBadge variant="warning">Idle {daysSinceContact} days</StatusBadge>
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
                >
                  <Edit className="w-4 h-4" /> Edit Lead
                </Button>
                {lead.status !== 'converted' && lead.status !== 'lost' && (
                  <Button onClick={() => setIsConvertDialogOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" /> Convert to Student
                  </Button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                  <X className="w-4 h-4" /> Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Lead Info */}
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
                        <Input id="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Study Goal</Label>
                        <Select value={editForm.studyGoal} onValueChange={(value) => setEditForm({ ...editForm, studyGoal: value })}>
                          <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                          <SelectContent>
                            {studyGoalOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Preferred Country</Label>
                        <Select value={editForm.preferredCountry} onValueChange={(value) => setEditForm({ ...editForm, preferredCountry: value })}>
                          <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                          <SelectContent>
                            {countryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={4} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-muted-foreground">Full Name</Label><p className="font-medium flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />{lead.name}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground">Email</Label><p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{lead.email}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground">Phone</Label><p className="font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{lead.phone}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground">Source</Label><p className="font-medium capitalize">{lead.source}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground">Study Goal</Label><p className="font-medium flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" />{studyGoalOptions.find(o => o.value === lead.studyGoal)?.label || 'Not specified'}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground">Preferred Country</Label><p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />{countryOptions.find(o => o.value === lead.preferredCountry)?.label || 'Not specified'}</p></div>
                    </div>
                    {lead.message && (
                      <div className="border-t border-border pt-4">
                        <Label className="text-muted-foreground">Initial Message</Label>
                        <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-start gap-2"><MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" /><p className="text-sm">{lead.message}</p></div>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="border-t border-border pt-4">
                        <Label className="text-muted-foreground">Notes</Label>
                        <div className="mt-2 p-3 rounded-lg bg-muted/50"><p className="text-sm">{lead.notes}</p></div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Status & Timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Status Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Current Status</Label>
                  <StatusBadge variant={getStatusVariant(lead.status)}>{lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}</StatusBadge>
                </div>
                {allowedTransitions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Change Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {allowedTransitions.map((status) => (
                        <Button key={status} variant="outline" size="sm" onClick={() => handleStatusChange(status)} className="capitalize">{status}</Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-4 h-4" /> Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div><p className="text-sm font-medium">Lead Created</p><p className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  {lead.convertedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2" />
                      <div><p className="text-sm font-medium">Converted to Student</p><p className="text-xs text-muted-foreground">{new Date(lead.convertedAt).toLocaleDateString()}</p></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Convert Dialog with Financials */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Convert Lead to Student</DialogTitle>
              <DialogDescription>
                Convert <strong>{lead.name}</strong> to a Student. This action requires the "Opening Book" payment.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-4">
              
              {!tempPasswordToShow && (
                <>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
                    <Avatar name={lead.name} size="sm" />
                    <div className="text-sm">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>

                  {/* Screening Data (Phase B Requirement) */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <User className="w-4 h-4" /> Screening Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nationality <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => setScreeningData(p => ({...p, nationality: v}))}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tanzanian">Tanzanian</SelectItem>
                            <SelectItem value="Kenyan">Kenyan</SelectItem>
                            <SelectItem value="Ugandan">Ugandan</SelectItem>
                          </SelectContent>
                        </Select>
                        {convErrors.nationality && <p className="text-xs text-error">{convErrors.nationality}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date of Birth</Label>
                        <Input type="date" className="h-8" onChange={(e) => setScreeningData(p => ({...p, dob: e.target.value}))} />
                      </div>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <CreditCard className="w-4 h-4" /> Opening Book Payment
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs">Amount</Label>
                        <Input type="number" className={`h-9 ${convErrors.amount ? 'border-error' : ''}`} value={convAmount} onChange={(e) => setConvAmount(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Currency</Label>
                        <Select value={convCurrency} onValueChange={(v: any) => setConvCurrency(v)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="TZS">TZS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    {convErrors.amount && <p className="text-xs text-error">{convErrors.amount}</p>}

                    <div className="space-y-1">
                      <Label className="text-xs">Payment Receipt <span className="text-red-500">*</span></Label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${convErrors.receipt ? 'border-error bg-error/5' : 'border-border hover:bg-muted/50'}`}>
                        <input type="file" id="receipt-upload" className="hidden" onChange={(e) => setConvReceiptFile(e.target.files ? e.target.files[0] : null)} />
                        <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                          {convReceiptFile ? (
                            <>
                              <CheckCircle className="w-6 h-6 text-success mb-1" />
                              <span className="text-sm font-medium text-success truncate max-w-[200px]">{convReceiptFile.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">Upload Receipt (PDF/Image)</span>
                            </>
                          )}
                        </label>
                      </div>
                      {convErrors.receipt && <p className="text-xs text-error">{convErrors.receipt}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Success State */}
              {tempPasswordToShow && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-success-foreground">Conversion Successful!</h3>
                  <div className="bg-white p-3 rounded border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Temporary Password:</p>
                    <code className="text-lg font-mono font-bold select-all">{tempPasswordToShow}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">Copy this password and share it securely with the student.</p>
                </div>
              )}

            </div>
            <DialogFooter>
              {tempPasswordToShow ? (
                <Button onClick={() => {
                  setTempPasswordToShow(null);
                  setIsConvertDialogOpen(false);
                  if (convertedStudentId) navigate(`/staff/students/${convertedStudentId}`);
                }}>Go to Student Profile</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleConvert}>Confirm Conversion</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default LeadDetail;