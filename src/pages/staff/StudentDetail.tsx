import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Eye,
  Plus,
  Shield,
  Edit,
  XCircle,
  Download,
  DollarSign,
  Heart,
  Globe,
  Briefcase,
  Trash2
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, DocumentCard, ProgressStepper } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { studyGoalOptions, countryOptions, applicationSteps, mockDocuments } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PassportExpiryWarning, usePassportValidation } from '@/components/PassportExpiryWarning';
import { StudentImpersonationButton } from '@/components/AdminImpersonation';
import { StaffUnlockRequestButton, LockIndicator } from '@/components/UnlockRequestFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { useToast } from '@/hooks/use-toast';

// --- CONSTANTS ---
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const RELIGION_OPTIONS = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Other', 'None'];
const RELATION_OPTIONS = ['Father', 'Mother', 'Sibling', 'Spouse', 'Guardian', 'Other'];
const DEGREE_OPTIONS = ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD'];

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, user } = useAuth();
  const { getStudentById, getDocumentsByStudent, submitUnlockRequest, updateStudent, logAudit } = useEduFlare();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isActivationDialogOpen, setIsActivationDialogOpen] = useState(false);
  const [isCreateApplicationOpen, setIsCreateApplicationOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [editedStudent, setEditedStudent] = useState<Record<string, any>>({});
  const [familyMembers, setFamilyMembers] = useState<Array<Record<string, any>>>([]);
  const [educationHistory, setEducationHistory] = useState<Array<Record<string, any>>>([]);
  const [employmentHistory, setEmploymentHistory] = useState<Array<Record<string, any>>>([]);
  const [activationFiles, setActivationFiles] = useState<{contract: File | null, receipt: File | null}>({contract: null, receipt: null});

  // Get student from context or fallback
  const student = id ? getStudentById(id) : undefined;
  const documents = id ? getDocumentsByStudent(id) : mockDocuments;
  const isAdmin = role === 'admin';
  const unlockedFields = student?.unlockedFields || [];

  // --- MOCK / DEMO DATA MERGE ---
  // We overlay the real student data with default values if missing to support the demo flow
  const studentData = {
    id: id || 'std-1',
    name: student?.name || 'John Doe',
    email: student?.email || 'john.doe@email.com',
    phone: student?.phone || '+1 234 567 890',
    nationality: student?.nationality || 'United States',
    dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth) : new Date('2000-05-15'),
    passportNumber: student?.passportNumber || 'AB1234567',
    passportExpiry: student?.passportExpiry ? new Date(student.passportExpiry) : new Date('2025-08-15'),
    passportIssuedAt: new Date('2020-08-15'),
    currentStep: student?.currentStep || 2,
    
    // Logic Toggle for Demo: Change this to 'pending_contract', 'active', or 'submitted_to_admin'
    status: (student?.status as string) || 'pending_contract', 
    
    // Identity
    gender: (student as any)?.gender || 'Male',
    maritalStatus: (student as any)?.maritalStatus || 'Single',
    nativeLanguage: (student as any)?.nativeLanguage || 'English',
    religion: (student as any)?.religion || 'Christianity',
    placeOfBirth: (student as any)?.placeOfBirth || 'New York, NY, USA',
    
    // Contact
    currentAddress: (student as any)?.currentAddress || '123 Campus Dr, Dorm A, Room 101, Boston, MA',
    homeAddress: (student as any)?.homeAddress || '456 Family Lane, New York, NY 10001',
    
    // Support
    emergencyName: (student as any)?.emergencyName || 'Jane Doe',
    emergencyRel: (student as any)?.emergencyRel || 'Mother',
    emergencyPhone: (student as any)?.emergencyPhone || '+1 987 654 321',
  };

  // --- LOGIC GATES ---
  const isPendingContract = studentData.status === 'pending_contract';
  const isActiveProfile = studentData.status === 'active' || studentData.status === 'documents_pending';
  const isLocked = studentData.status === 'submitted_to_admin' || studentData.status === 'submitted_to_university' || (student?.isProfileLocked || false);

  // Passport validation
  const passportValidation = usePassportValidation(
    studentData.passportExpiry, 
    6
  );

  // --- HANDLERS ---
  const handleStartEdit = () => {
    // If locked and no fields unlocked, prevent edit
    if (isLocked && unlockedFields.length === 0) return;

    setEditedStudent({ ...studentData });
    // Initialize repeatable sections
    setFamilyMembers((student && (student as any).familyMembers) ? (student as any).familyMembers.slice() : []);
    setEducationHistory((student && (student as any).educationHistory) ? (student as any).educationHistory.slice() : []);
    setEmploymentHistory((student && (student as any).employmentHistory) ? (student as any).employmentHistory.slice() : []);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Validation
    if (familyMembers.length === 0) {
      toast({ title: "Validation Error", description: "At least one family member is required.", variant: "destructive" });
      return;
    }
    if (educationHistory.length === 0) {
      toast({ title: "Validation Error", description: "At least one education record is required.", variant: "destructive" });
      return;
    }

    if (student) {
      const updates: Record<string, any> = { ...editedStudent };
      updates.familyMembers = familyMembers;
      updates.educationHistory = educationHistory;
      updates.employmentHistory = employmentHistory;
      
      updateStudent(student.id, updates);
      logAudit({
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        userRole: role as any,
        action: 'student_profile_updated',
        details: `Updated profile details`,
        entityType: 'student',
        entityId: student.id,
        isOverride: false,
      });
      toast({ title: "Profile Updated", description: "Master Profile changes saved successfully." });
    }
    setIsEditing(false);
  };

  const handleDownloadContract = () => {
    toast({ 
      title: "Contract Downloaded", 
      description: "Service Agreement template downloaded. Please print and sign with the student.",
      className: "bg-blue-50 border-blue-200 text-blue-800"
    });
  };

  const handleConfirmActivation = () => {
    if (!activationFiles.contract || !activationFiles.receipt) {
        toast({ title: "Validation Error", description: "Both the signed contract and payment receipt are required to activate the student.", variant: "destructive" });
        return;
    }
    
    // In real app: Upload files -> Update Status -> Trigger Commission Logic
    if (student) {
      updateStudent(student.id, { status: 'active_profile' });
    }

    toast({
      title: "Student Activated",
      description: "Contract and deposit verified. Student is now Active and Profile Building (Phase D) is unlocked.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
    setIsActivationDialogOpen(false);
  };

  const handleSubmitToAdmin = () => {
    if (student) {
      updateStudent(student.id, { status: 'submitted_to_admin', isProfileLocked: true });
    }
    toast({
      title: "Profile Submitted",
      description: "Application locked and sent to Admin for review.",
      className: "bg-purple-50 border-purple-200 text-purple-800"
    });
    setIsSubmitDialogOpen(false);
  };

  const handleUnlockRequest = (fields: string[], reason: string) => {
    if (student && user) {
      submitUnlockRequest(student.id, student.name, user.id, 'staff', fields, reason);
    }
  };

  const isFieldEditable = (fieldName: string): boolean => {
    if (!isLocked) return true;
    return unlockedFields.includes(fieldName);
  };

  // Helper for text inputs
  const renderField = (label: string, value: string, fieldName: string) => {
    const editable = isFieldEditable(fieldName);
    if (isEditing && editable) {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Input 
            value={editedStudent[fieldName] || ''} 
            onChange={(e) => setEditedStudent({...editedStudent, [fieldName]: e.target.value})} 
            className="h-8 bg-white" 
          />
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          {label}
          {isLocked && !editable && <Lock className="w-3 h-3 text-warning" />}
          {isLocked && editable && <CheckCircle className="w-3 h-3 text-success" />}
        </label>
        <p className="font-medium text-sm truncate" title={value}>{value || <span className="text-muted-foreground/50 italic">--</span>}</p>
      </div>
    );
  };

  // Helper for selects
  const renderSelect = (label: string, value: string, fieldName: string, options: string[]) => {
    const editable = isFieldEditable(fieldName);
    if (isEditing && editable) {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Select 
            value={editedStudent[fieldName]} 
            onValueChange={(v) => setEditedStudent({...editedStudent, [fieldName]: v})}
          >
            <SelectTrigger className="h-8 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return renderField(label, value, fieldName);
  };

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/staff/students')}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar name={studentData.name} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{studentData.name}</h1>
                <StatusBadge 
                    variant={isPendingContract ? 'warning' : isLocked ? 'info' : 'success'}
                >
                    {studentData.status.replace('_', ' ').toUpperCase()}
                </StatusBadge>
                {isAdmin && student && (
                  <StudentImpersonationButton student={{ id: student.id, name: student.name, email: student.email }} />
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">{studentData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLocked && (
              <StaffUnlockRequestButton
                studentId={studentData.id}
                studentName={studentData.name}
                isLocked={isLocked}
                onRequestSubmit={handleUnlockRequest}
              />
            )}
            {!isEditing && !isLocked && !isPendingContract && (
                <Button variant="outline" onClick={handleStartEdit} className="gap-2">
                    <Edit className="w-4 h-4" /> Edit Master Profile
                </Button>
            )}
            {isEditing && (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
            )}
          </div>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="max-w-3xl">
          <ProgressStepper steps={applicationSteps} currentStep={studentData.currentStep} />
        </div>

        {/* --- PHASE ALERT BANNERS --- */}
        
        {/* PHASE C: CONTRACT PENDING */}
        {isPendingContract && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-warning/10 rounded-full text-warning shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-warning-foreground">Phase C: Contract & Deposit Required</h4>
                        <p className="text-sm text-muted-foreground">
                            1. Download the contract. 2. Sign it with the student. 3. Upload signed contract & receipt to unlock Profile Building.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownloadContract} className="bg-white border-warning/20 text-warning-foreground hover:bg-warning/10 gap-2">
                        <Download className="w-4 h-4" /> Download Contract
                    </Button>
                    <Button onClick={() => setIsActivationDialogOpen(true)} className="bg-warning hover:bg-warning/90 text-white border-none gap-2">
                        <Upload className="w-4 h-4" /> Upload & Activate
                    </Button>
                </div>
            </motion.div>
        )}

        {/* PHASE D: PROFILE BUILDING */}
        {isActiveProfile && !isEditing && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-primary">Phase D: Profile Building Active</h4>
                    <p className="text-sm text-muted-foreground">
                        Collect all bio-data and documents. Review with student before submitting to Admin.
                    </p>
                </div>
            </motion.div>
        )}

        {/* LOCK INDICATOR */}
        {isLocked && (
          <LockIndicator 
            isLocked={isLocked} 
            lockedAt={student?.lockedAt} 
            unlockedFields={unlockedFields}
          />
        )}

        {/* PASSPORT EXPIRY ALERT */}
        <PassportExpiryWarning 
            expiryDate={studentData.passportExpiry} 
            minimumMonths={6}
            showAsBlock
        />

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile">Master Profile</TabsTrigger>
            <TabsTrigger value="documents">
              Documents {isPendingContract && <Lock className="w-3 h-3 ml-2 opacity-50" />}
            </TabsTrigger>
            <TabsTrigger value="applications" disabled={isPendingContract}>
                Applications {isPendingContract && <Lock className="w-3 h-3 ml-2 opacity-50" />}
            </TabsTrigger>
          </TabsList>

          {/* 1. MASTER PROFILE TAB */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Identity Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                        <User className="w-5 h-5 text-primary/70" /> Identity
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('Full Name', studentData.name, 'name')}
                            {isEditing && isFieldEditable('dateOfBirth') ? (
                                <div className="space-y-1">
                                    <Label className="text-xs">Date of Birth</Label>
                                    <Input type="date" value={editedStudent.dateOfBirth?.toISOString().split('T')[0]} onChange={(e) => setEditedStudent({...editedStudent, dateOfBirth: new Date(e.target.value)})} className="h-8 bg-white"/>
                                </div>
                            ) : renderField('Date of Birth', studentData.dateOfBirth.toLocaleDateString(), 'dateOfBirth')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {renderSelect('Gender', studentData.gender, 'gender', GENDER_OPTIONS)}
                            {renderSelect('Marital Status', studentData.maritalStatus, 'maritalStatus', MARITAL_OPTIONS)}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {renderSelect('Religion', studentData.religion, 'religion', RELIGION_OPTIONS)}
                            {renderField('Native Language', studentData.nativeLanguage, 'nativeLanguage')}
                        </div>
                    </div>
                </div>

                {/* Passport Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                        <Globe className="w-5 h-5 text-primary/70" /> Passport
                    </h3>
                    <div className="space-y-4">
                        {renderField('Nationality', studentData.nationality, 'nationality')}
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('Passport No.', studentData.passportNumber, 'passportNumber')}
                            {renderField('Place of Birth', studentData.placeOfBirth, 'placeOfBirth')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             {isEditing && isFieldEditable('passportIssuedAt') ? (
                                <>
                                    <div className="space-y-1"><Label className="text-xs">Issued Date</Label><Input type="date" className="h-8"/></div>
                                    <div className="space-y-1"><Label className="text-xs">Expiry Date</Label><Input type="date" className="h-8"/></div>
                                </>
                             ) : (
                                <>
                                    {renderField('Issued', studentData.passportIssuedAt.toLocaleDateString(), 'passportIssuedAt')}
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry</p>
                                        <p className="font-medium text-sm">{studentData.passportExpiry.toLocaleDateString()}</p>
                                    </div>
                                </>
                             )}
                        </div>
                    </div>
                </div>

                {/* Contact & Support */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                        <MapPin className="w-5 h-5 text-primary/70" /> Contact & Support
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('Email', studentData.email, 'email')}
                            {renderField('Phone', studentData.phone, 'phone')}
                        </div>
                        {renderField('Current Address', studentData.currentAddress, 'currentAddress')}
                        {renderField('Home Country Address', studentData.homeAddress, 'homeAddress')}
                        
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-red-400"/> Emergency Contact</h4>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                {renderField('Name', studentData.emergencyName, 'emergencyName')}
                                {renderSelect('Relationship', studentData.emergencyRel, 'emergencyRel', RELATION_OPTIONS)}
                            </div>
                            {renderField('Phone', studentData.emergencyPhone, 'emergencyPhone')}
                        </div>
                    </div>
                </div>

                {/* --- LISTS SECTIONS --- */}
                
                {/* Family List */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Heart className="w-5 h-5 text-primary/70" /> Family <span className="text-red-500 text-sm">*</span>
                        </h3>
                        {isEditing && (
                            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setFamilyMembers([...familyMembers, { relation: 'Father', name: '', phone: '', occupation: '' }])}>
                                <Plus className="w-3 h-3" /> Add
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {familyMembers.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No family added.</p>}
                        {familyMembers.map((fam, idx) => (
                            <div key={idx} className="p-3 bg-muted/20 rounded-lg border text-sm relative group">
                                {isEditing && (
                                    <button onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1"><Label className="text-xs">Relation</Label><Select value={fam.relation} onValueChange={v => {const n=[...familyMembers]; n[idx].relation=v; setFamilyMembers(n)}}><SelectTrigger className="h-7"><SelectValue/></SelectTrigger><SelectContent>{RELATION_OPTIONS.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                            <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={fam.name} onChange={e => {const n=[...familyMembers]; n[idx].name=e.target.value; setFamilyMembers(n)}} className="h-7 bg-white"/></div>
                                            <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={fam.phone} onChange={e => {const n=[...familyMembers]; n[idx].phone=e.target.value; setFamilyMembers(n)}} className="h-7 bg-white"/></div>
                                            <div className="space-y-1"><Label className="text-xs">Job</Label><Input value={fam.occupation} onChange={e => {const n=[...familyMembers]; n[idx].occupation=e.target.value; setFamilyMembers(n)}} className="h-7 bg-white"/></div>
                                        </>
                                    ) : (
                                        <>
                                            <div><p className="text-xs text-muted-foreground">Relation</p><p className="font-medium">{fam.relation}</p></div>
                                            <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{fam.name}</p></div>
                                            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{fam.phone}</p></div>
                                            <div><p className="text-xs text-muted-foreground">Occupation</p><p className="font-medium">{fam.occupation}</p></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education List */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary/70" /> Education <span className="text-red-500 text-sm">*</span>
                        </h3>
                        {isEditing && (
                            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setEducationHistory([...educationHistory, { institution: '', degree: 'High School', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }])}>
                                <Plus className="w-3 h-3" /> Add
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {educationHistory.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No education added.</p>}
                        {educationHistory.map((edu, idx) => (
                            <div key={idx} className="p-3 bg-muted/20 rounded-lg border text-sm relative group">
                                {isEditing && (
                                    <button onClick={() => setEducationHistory(educationHistory.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="grid grid-cols-6 gap-3">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1 col-span-1"><Label className="text-xs">School</Label><Input value={edu.institution} onChange={e => {const n=[...educationHistory]; n[idx].institution=e.target.value; setEducationHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="space-y-1 col-span-1"><Label className="text-xs">Degree</Label><Select value={edu.degree} onValueChange={v => {const n=[...educationHistory]; n[idx].degree=v; setEducationHistory(n)}}><SelectTrigger className="h-7"><SelectValue/></SelectTrigger><SelectContent>{DEGREE_OPTIONS.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                            <div className="space-y-1 col-span-1"><Label className="text-xs">Field</Label><Input value={edu.fieldOfStudy} onChange={e => {const n=[...educationHistory]; n[idx].fieldOfStudy=e.target.value; setEducationHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="space-y-1 col-span-1"><Label className="text-xs">Start</Label><Input type="date" value={edu.startDate} onChange={e => {const n=[...educationHistory]; n[idx].startDate=e.target.value; setEducationHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="space-y-1 col-span-1"><Label className="text-xs">End</Label><Input type="date" value={edu.endDate} onChange={e => {const n=[...educationHistory]; n[idx].endDate=e.target.value; setEducationHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="space-y-1 col-span-1"><Label className="text-xs">Grade</Label><Input value={edu.grade} onChange={e => {const n=[...educationHistory]; n[idx].grade=e.target.value; setEducationHistory(n)}} className="h-7 bg-white"/></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-span-1"><p className="text-xs text-muted-foreground">School</p><p className="font-medium truncate" title={edu.institution}>{edu.institution}</p></div>
                                            <div className="col-span-1"><p className="text-xs text-muted-foreground">Degree</p><p className="font-medium truncate" title={edu.degree}>{edu.degree}</p></div>
                                            <div className="col-span-1"><p className="text-xs text-muted-foreground">Field</p><p className="font-medium truncate" title={edu.fieldOfStudy}>{edu.fieldOfStudy}</p></div>
                                            <div className="col-span-2"><p className="text-xs text-muted-foreground">Duration</p><p className="font-medium">{edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : ''}</p></div>
                                            <div className="col-span-1"><p className="text-xs text-muted-foreground">Grade</p><p className="font-medium">{edu.grade}</p></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Employment List */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary/70" /> Employment History
                        </h3>
                        {isEditing && (
                            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setEmploymentHistory([...employmentHistory, { employer: '', title: '', start: '', end: '' }])}>
                                <Plus className="w-3 h-3" /> Add
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {employmentHistory.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No employment history.</p>}
                        {employmentHistory.map((emp, idx) => (
                            <div key={idx} className="p-3 bg-muted/20 rounded-lg border text-sm relative group">
                                {isEditing && (
                                    <button onClick={() => setEmploymentHistory(employmentHistory.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="grid grid-cols-4 gap-3">
                                    {isEditing ? (
                                        <>
                                            <div className="col-span-1"><Label className="text-xs">Employer</Label><Input value={emp.employer} onChange={e => {const n=[...employmentHistory]; n[idx].employer=e.target.value; setEmploymentHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="col-span-1"><Label className="text-xs">Title</Label><Input value={emp.title} onChange={e => {const n=[...employmentHistory]; n[idx].title=e.target.value; setEmploymentHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="col-span-1"><Label className="text-xs">Start</Label><Input type="date" value={emp.start} onChange={e => {const n=[...employmentHistory]; n[idx].start=e.target.value; setEmploymentHistory(n)}} className="h-7 bg-white"/></div>
                                            <div className="col-span-1"><Label className="text-xs">End</Label><Input type="date" value={emp.end} onChange={e => {const n=[...employmentHistory]; n[idx].end=e.target.value; setEmploymentHistory(n)}} className="h-7 bg-white"/></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-span-1"><p className="text-xs text-muted-foreground">Employer</p><p className="font-medium">{emp.employer}</p></div>
                                            <div className="col-span-1"><p className="text-xs text-muted-foreground">Title</p><p className="font-medium">{emp.title}</p></div>
                                            <div className="col-span-2"><p className="text-xs text-muted-foreground">Duration</p><p className="font-medium">{emp.start} - {emp.end}</p></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          </TabsContent>

          {/* 2. DOCUMENTS TAB */}
          <TabsContent value="documents">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Document Vault</h2>
                    {!isLocked && !isPendingContract && <Button className="gap-2"><Upload className="w-4 h-4"/> Upload Document</Button>}
                </div>
                
                {/* Add Phase Warning for Documents */}
                {isPendingContract && (
                    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-center gap-3 mb-4">
                        <Lock className="w-5 h-5 text-warning" />
                        <p className="text-sm text-warning-foreground">
                            Document uploads are locked until the Contract is signed and Deposit is paid. You can only view existing files.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documents.map(doc => (
                        <DocumentCard 
                            key={doc.id} 
                            name={doc.name}
                            type={doc.type}
                            status={isLocked ? 'locked' : doc.status as any}
                            uploadedAt={doc.uploadedAt}
                            onView={() => {}}
                            onDownload={() => {}}
                        />
                    ))}
                </div>
            </div>
          </TabsContent>

          {/* 3. APPLICATIONS TAB (GATED) */}
          <TabsContent value="applications">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">University Applications (2+3 Strategy)</h2>
                    <Button onClick={() => setIsCreateApplicationOpen(true)} className="gap-2"><Plus className="w-4 h-4"/> Add Application</Button>
                </div>
                
                {/* Mock Application List */}
                <div className="grid gap-4">
                    <div className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                            <div>
                                <h4 className="font-bold">Harvard University</h4>
                                <p className="text-sm text-muted-foreground">Computer Science</p>
                            </div>
                        </div>
                        <StatusBadge variant="warning">Draft</StatusBadge>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                            <div>
                                <h4 className="font-bold">MIT</h4>
                                <p className="text-sm text-muted-foreground">Software Engineering</p>
                            </div>
                        </div>
                        <StatusBadge variant="warning">Draft</StatusBadge>
                    </div>
                </div>
                
                {/* SUBMIT TO ADMIN ACTION */}
                <div className="mt-8 border-t pt-6 flex justify-end">
                    <Button size="lg" onClick={() => setIsSubmitDialogOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200">
                        <Shield className="w-4 h-4" /> Submit Profile to Admin
                    </Button>
                </div>
            </div>
          </TabsContent>

        </Tabs>

        {/* ACTIVATION DIALOG */}
        <Dialog open={isActivationDialogOpen} onOpenChange={setIsActivationDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Activate Student</DialogTitle>
                    <DialogDescription>
                        Complete Phase C by uploading the signed contract and deposit receipt. This will unlock the Master Profile for editing.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Signed Service Agreement</Label>
                        <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <input type="file" className="hidden" id="upload-contract" onChange={(e) => setActivationFiles({...activationFiles, contract: e.target.files?.[0] || null})} />
                            <label htmlFor="upload-contract" className="cursor-pointer flex flex-col items-center">
                                {activationFiles.contract ? (
                                    <div className="flex items-center gap-2 text-success font-medium text-sm">
                                        <CheckCircle className="w-4 h-4" /> {activationFiles.contract.name}
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-muted-foreground mb-1"/>
                                        <span className="text-xs text-muted-foreground">Click to upload signed PDF</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Deposit Receipt ($750)</Label>
                        <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <input type="file" className="hidden" id="upload-receipt" onChange={(e) => setActivationFiles({...activationFiles, receipt: e.target.files?.[0] || null})} />
                            <label htmlFor="upload-receipt" className="cursor-pointer flex flex-col items-center">
                                {activationFiles.receipt ? (
                                    <div className="flex items-center gap-2 text-success font-medium text-sm">
                                        <CheckCircle className="w-4 h-4" /> {activationFiles.receipt.name}
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-muted-foreground mb-1"/>
                                        <span className="text-xs text-muted-foreground">Click to upload payment proof</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsActivationDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmActivation} className="bg-success hover:bg-success/90">Confirm & Activate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Submit Confirmation Dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-warning" /> Confirm Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this application? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitToAdmin} className="gap-2"><CheckCircle className="w-4 h-4" /> Confirm Submission</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CREATE APPLICATION DIALOG */}
        <Dialog open={isCreateApplicationOpen} onOpenChange={setIsCreateApplicationOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create University Application</DialogTitle>
              <DialogDescription>
                Select batch, set priority, and add notes for the 2+3 university application strategy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-2">
              {/* Batch Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Batch *</Label>
                  <span className="text-xs text-muted-foreground">Select batch</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <input type="radio" name="batch" value="batch1" className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">Batch 1 (First 2 universities)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          High-priority universities - Submit first for early decision deadlines
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <input type="radio" name="batch" value="batch2" className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">Batch 2 (Next 3 universities)</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Secondary universities - Submit after Batch 1 decisions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>2+3 strategy:</strong> First submit to top 2, then next 3 universities for optimal admission chances.
                  </p>
                </div>
              </div>

              {/* Priority Setting */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Priority *</Label>
                  <span className="text-xs text-muted-foreground">Set priority</span>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notes</Label>
                <textarea
                  className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any special notes, deadlines, or requirements for this application..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateApplicationOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateApplicationOpen(false)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default StudentDetail;