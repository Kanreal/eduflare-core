import React, { useState } from 'react';
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
import { studyGoalOptions, countryOptions } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { applicationSteps, mockDocuments } from '@/lib/constants';
import { PassportExpiryWarning, usePassportValidation } from '@/components/PassportExpiryWarning';
import { BatchSelector } from '@/components/BatchSelector';
import { StudentImpersonationButton } from '@/components/AdminImpersonation';
import { StaffUnlockRequestButton, LockIndicator } from '@/components/UnlockRequestFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useEduFlare } from '@/contexts/EduFlareContext';

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { students, getStudentById, getDocumentsByStudent, submitUnlockRequest, updateStudent, logAudit } = useEduFlare();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Record<string, any>>({});
  const [familyMembers, setFamilyMembers] = useState<Array<Record<string, any>>>([]);
  const [educationHistory, setEducationHistory] = useState<Array<Record<string, any>>>([]);
  const [employmentHistory, setEmploymentHistory] = useState<Array<Record<string, any>>>([]);
  
  // Get student from context or fallback to mock
  const student = id ? getStudentById(id) : undefined;
  const documents = id ? getDocumentsByStudent(id) : mockDocuments;
  
  const isAdmin = role === 'admin';
  const isLocked = student?.isProfileLocked || false;
  const unlockedFields = student?.unlockedFields || [];

  // Mock applications for display (would come from context in real implementation)
  const mockApplications = [
    { id: 'app-1', university: 'Harvard University', program: 'Computer Science', status: 'pending', priority: 1, isLocked: false },
    { id: 'app-2', university: 'MIT', program: 'Engineering', status: 'pending', priority: 2, isLocked: false },
    { id: 'app-3', university: 'Stanford University', program: 'Data Science', status: 'draft', priority: 3, isLocked: true },
  ];

  // Fallback student data
  const studentData = student || {
    id: id || 'std-1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234 567 890',
    nationality: 'United States',
    dateOfBirth: new Date('2000-05-15'),
    passportNumber: 'AB1234567',
    passportExpiry: new Date('2025-08-15'),
    currentStep: 3,
    status: 'documents_pending',
    isProfileLocked: false,
    unlockedFields: [],
  };

  // Passport validation
  const passportValidation = usePassportValidation(
    studentData.passportExpiry instanceof Date ? studentData.passportExpiry : new Date(studentData.passportExpiry || Date.now()), 
    6
  );

  const handleSubmitApplication = (appId: string) => {
    if (!passportValidation.isValid) {
      return;
    }
    setSelectedApp(appId);
    setIsSubmitDialogOpen(true);
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

  const handleStartEdit = () => {
    if (isLocked && unlockedFields.length === 0) return;
    setEditedStudent({
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      nationality: studentData.nationality,
      passportNumber: studentData.passportNumber,
      studyGoal: (student && (student as any).studyGoal) || (studentData as any).studyGoal || '',
      preferredCountry: (student && (student as any).preferredCountry) || (studentData as any).preferredCountry || '',
    });
    // Initialize repeatable sections for editing
    setFamilyMembers((student && (student as any).familyMembers) ? (student as any).familyMembers.slice() : []);
    setEducationHistory((student && (student as any).educationHistory) ? (student as any).educationHistory.slice() : []);
    setEmploymentHistory((student && (student as any).employmentHistory) ? (student as any).employmentHistory.slice() : []);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (student) {
      // Only save unlocked fields if profile is locked
      const updates: Record<string, any> = {};
      Object.entries(editedStudent).forEach(([key, value]) => {
        if (isFieldEditable(key)) {
          updates[key] = value;
        }
      });
      // Include repeatable sections (always allow when editing)
      updates.familyMembers = familyMembers;
      updates.educationHistory = educationHistory;
      updates.employmentHistory = employmentHistory;
      
      updateStudent(student.id, updates);
      logAudit({
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        userRole: role as any,
        action: 'student_profile_updated',
        details: `Updated fields: ${Object.keys(updates).join(', ')}`,
        entityType: 'student',
        entityId: student.id,
        isOverride: false,
      });
    }
    setIsEditing(false);
  };

  const renderFieldWithLock = (label: string, value: string, fieldName: string) => {
    const editable = isFieldEditable(fieldName);
    
    if (isEditing && editable) {
      return (
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">{label}</Label>
          <Input
            value={editedStudent[fieldName] || ''}
            onChange={(e) => setEditedStudent(prev => ({ ...prev, [fieldName]: e.target.value }))}
            className="h-9"
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground flex items-center gap-1">
          {label}
          {isLocked && !editable && <Lock className="w-3 h-3 text-warning" />}
          {isLocked && editable && <CheckCircle className="w-3 h-3 text-success" />}
        </label>
        <p className={`font-medium ${isLocked && !editable ? 'text-muted-foreground' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    );
  };

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/staff/students')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={studentData.name} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{studentData.name}</h1>
                {isLocked && (
                  <StatusBadge variant="warning" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </StatusBadge>
                )}
                {isAdmin && student && (
                  <StudentImpersonationButton 
                    student={{ 
                      id: student.id, 
                      name: student.name, 
                      email: student.email 
                    }} 
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {studentData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {studentData.phone}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge variant="warning">Documents Pending</StatusBadge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isLocked && (
              <StaffUnlockRequestButton
                studentId={studentData.id}
                studentName={studentData.name}
                isLocked={isLocked}
                onRequestSubmit={handleUnlockRequest}
              />
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-2xl">
          <ProgressStepper steps={applicationSteps} currentStep={studentData.currentStep} />
        </div>

        {/* Lock Indicator */}
        {isLocked && (
          <LockIndicator 
            isLocked={isLocked} 
            lockedAt={student?.lockedAt} 
            unlockedFields={unlockedFields}
          />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Applications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Passport Expiry Warning */}
              <PassportExpiryWarning 
                expiryDate={studentData.passportExpiry instanceof Date ? studentData.passportExpiry : new Date(studentData.passportExpiry || Date.now())} 
                minimumMonths={6}
                showAsBlock
              />

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                  {!isEditing && (!isLocked || unlockedFields.length > 0) && (
                    <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-2">
                      <Edit className="w-4 h-4" />
                      {isLocked ? 'Edit Unlocked Fields' : 'Edit'}
                    </Button>
                  )}
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFieldWithLock('Full Name', studentData.name, 'name')}
                  {renderFieldWithLock('Email', studentData.email, 'email')}
                  {renderFieldWithLock('Phone', studentData.phone || '', 'phone')}
                  {renderFieldWithLock('Nationality', studentData.nationality || '', 'nationality')}
                  
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      Date of Birth
                      {isLocked && <Lock className="w-3 h-3 text-warning" />}
                    </label>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {studentData.dateOfBirth instanceof Date 
                        ? studentData.dateOfBirth.toLocaleDateString() 
                        : new Date(studentData.dateOfBirth || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {renderFieldWithLock('Passport Number', studentData.passportNumber || '', 'passportNumber')}
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      Study Goal
                      {isLocked && <Lock className="w-3 h-3 text-warning" />}
                    </label>
                    {isEditing ? (
                      <Select value={editedStudent.studyGoal || ''} onValueChange={(v) => setEditedStudent(prev => ({ ...prev, studyGoal: v }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select study goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {studyGoalOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{studyGoalOptions.find(o => o.value === (student && (student as any).studyGoal) || (studentData as any).studyGoal)?.label || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      Preferred Country
                      {isLocked && <Lock className="w-3 h-3 text-warning" />}
                    </label>
                    {isEditing ? (
                      <Select value={editedStudent.preferredCountry || ''} onValueChange={(v) => setEditedStudent(prev => ({ ...prev, preferredCountry: v }))}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{countryOptions.find(o => o.value === (student && (student as any).preferredCountry) || (studentData as any).preferredCountry)?.label || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Family, Education and Employment Sections */}
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Family</h2>
                  {isEditing && <Button size="sm" variant="outline" onClick={() => setFamilyMembers(prev => [...prev, { relation: '', name: '', phone: '', occupation: '' }])} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>}
                </div>
                <div className="space-y-3">
                  {(student && (student as any).familyMembers ? (student as any).familyMembers : familyMembers).length === 0 && familyMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No family information available</p>
                  ) : (
                    (isEditing ? familyMembers : ((student && (student as any).familyMembers) ? (student as any).familyMembers : familyMembers)).map((member: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        {isEditing ? (
                          <>
                            <div>
                              <Label className="text-muted-foreground">Relation</Label>
                              <Input value={member.relation} onChange={(e) => setFamilyMembers(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], relation: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Name</Label>
                              <Input value={member.name} onChange={(e) => setFamilyMembers(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], name: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Phone</Label>
                              <Input value={member.phone} onChange={(e) => setFamilyMembers(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], phone: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Label className="text-muted-foreground">Occupation</Label>
                                <Input value={member.occupation} onChange={(e) => setFamilyMembers(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], occupation: e.target.value }; return copy; })} className="h-9" />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setFamilyMembers(prev => prev.filter((_, i) => i !== idx))}>
                                <XCircle className="w-4 h-4 text-error" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Relation</p>
                              <p className="font-medium">{member.relation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="font-medium">{member.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{member.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Occupation</p>
                              <p className="font-medium">{member.occupation}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Education History</h2>
                  {isEditing && <Button size="sm" variant="outline" onClick={() => setEducationHistory(prev => [...prev, { institution: '', degree: '', year: '', grade: '' }])} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>}
                </div>
                <div className="space-y-3">
                  {educationHistory.length === 0 && !(student && (student as any).educationHistory) ? (
                    <p className="text-sm text-muted-foreground">No education history</p>
                  ) : (
                    (isEditing ? educationHistory : ((student && (student as any).educationHistory) ? (student as any).educationHistory : educationHistory)).map((edu: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        {isEditing ? (
                          <>
                            <div>
                              <Label className="text-muted-foreground">Institution</Label>
                              <Input value={edu.institution} onChange={(e) => setEducationHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], institution: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Degree</Label>
                              <Input value={edu.degree} onChange={(e) => setEducationHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], degree: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Year</Label>
                              <Input value={edu.year} onChange={(e) => setEducationHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], year: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Label className="text-muted-foreground">Grade / GPA</Label>
                                <Input value={edu.grade} onChange={(e) => setEducationHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], grade: e.target.value }; return copy; })} className="h-9" />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setEducationHistory(prev => prev.filter((_, i) => i !== idx))}>
                                <XCircle className="w-4 h-4 text-error" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Institution</p>
                              <p className="font-medium">{edu.institution}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Degree</p>
                              <p className="font-medium">{edu.degree}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Year</p>
                              <p className="font-medium">{edu.year}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Grade</p>
                              <p className="font-medium">{edu.grade}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Employment History</h2>
                  {isEditing && <Button size="sm" variant="outline" onClick={() => setEmploymentHistory(prev => [...prev, { employer: '', jobTitle: '', startYear: '', endYear: '', responsibilities: '' }])} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>}
                </div>
                <div className="space-y-3">
                  {employmentHistory.length === 0 && !(student && (student as any).employmentHistory) ? (
                    <p className="text-sm text-muted-foreground">No employment history</p>
                  ) : (
                    (isEditing ? employmentHistory : ((student && (student as any).employmentHistory) ? (student as any).employmentHistory : employmentHistory)).map((job: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        {isEditing ? (
                          <>
                            <div>
                              <Label className="text-muted-foreground">Employer</Label>
                              <Input value={job.employer} onChange={(e) => setEmploymentHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], employer: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Job Title</Label>
                              <Input value={job.jobTitle} onChange={(e) => setEmploymentHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], jobTitle: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Start Year</Label>
                              <Input value={job.startYear} onChange={(e) => setEmploymentHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], startYear: e.target.value }; return copy; })} className="h-9" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Label className="text-muted-foreground">End Year</Label>
                                <Input value={job.endYear} onChange={(e) => setEmploymentHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], endYear: e.target.value }; return copy; })} className="h-9" />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setEmploymentHistory(prev => prev.filter((_, i) => i !== idx))}>
                                <XCircle className="w-4 h-4 text-error" />
                              </Button>
                            </div>
                            <div className="md:col-span-4">
                              <Label className="text-muted-foreground">Responsibilities</Label>
                              <Input value={job.responsibilities} onChange={(e) => setEmploymentHistory(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], responsibilities: e.target.value }; return copy; })} className="h-9" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Employer</p>
                              <p className="font-medium">{job.employer}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Job Title</p>
                              <p className="font-medium">{job.jobTitle}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Start</p>
                              <p className="font-medium">{job.startYear}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">End</p>
                              <p className="font-medium">{job.endYear}</p>
                            </div>
                            <div className="md:col-span-4">
                              <p className="text-sm text-muted-foreground">Responsibilities</p>
                              <p className="font-medium">{job.responsibilities}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Student Documents</h2>
                {!isLocked && (
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                )}
                {isLocked && (
                  <StatusBadge variant="warning" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Documents Locked
                  </StatusBadge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    name={doc.name}
                    type={doc.type}
                    status={isLocked ? 'locked' : doc.status}
                    uploadedAt={doc.uploadedAt}
                    onView={() => {}}
                    onDownload={doc.status === 'verified' ? () => {} : undefined}
                  />
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">University Applications</h2>
                {!isLocked && (
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Application
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {mockApplications.map((app, index) => (
                  <div
                    key={app.id}
                    className={`rounded-xl border bg-card p-5 ${
                      app.isLocked || isLocked ? 'border-muted opacity-75' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {app.priority}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {app.university}
                            {(app.isLocked || isLocked) && <Lock className="w-4 h-4 text-muted-foreground" />}
                          </h3>
                          <p className="text-sm text-muted-foreground">{app.program}</p>
                          <div className="mt-2">
                            <StatusBadge variant={app.status === 'pending' ? 'warning' : 'muted'}>
                              {app.status === 'pending' ? 'Pending Submission' : 'Draft'}
                            </StatusBadge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {!app.isLocked && !isLocked && app.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleSubmitApplication(app.id)}
                          >
                            <Upload className="w-4 h-4" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Submit Confirmation Dialog */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Confirm Submission
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this application? This action cannot be undone.
                Once submitted, the application will be locked and no further changes can be made.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-warning" />
                  <strong>Important:</strong> The application will be permanently locked after submission.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSubmitDialogOpen(false)} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirm Submission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default StudentDetail;