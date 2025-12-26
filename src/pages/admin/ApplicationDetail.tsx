import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Upload, CheckCircle, XCircle, Lock,
  AlertTriangle, FileText, User, GraduationCap, Calendar,
  Eye, DollarSign, Globe, MapPin, Heart, Shield, Briefcase,
  Save, AlertCircle, Copy, Check, Clock, FileCheck, FileWarning, RefreshCw,
  ScrollText
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, DocumentCard } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDocuments } from '@/lib/constants';
import { Document } from '@/types';
import { useToast } from '@/hooks/use-toast';

// --- EXTENDED MOCK DOCUMENTS ---
// Separate legal docs from general application docs
const legalDocuments: any[] = [
    { id: 'leg-1', name: 'Signed Service Agreement.pdf', type: 'contract', status: 'verified', uploadedAt: new Date('2024-03-10'), url: '#' },
    { id: 'leg-2', name: 'Deposit Receipt ($750).jpg', type: 'financial', status: 'verified', uploadedAt: new Date('2024-03-10'), url: '#' },
];

const appDocuments = mockDocuments.filter(d => d.status !== 'locked');

// --- MOCK DATA (Matches Full StudentDetail Structure) ---
const mockApplicationDetail = {
  id: 'app-1',
  studentId: 'std-1',
  studentName: 'John Doe',
  studentEmail: 'john.doe@email.com',
  studentPhone: '+1 234 567 890',
  university: 'Harvard University',
  program: 'Computer Science',
  status: 'pending_review', // pending_review, submitted_to_university, offer_received, rejected
  priority: 'high',
  submittedAt: new Date('2024-03-18'),
  assignedStaff: 'Sarah Johnson',
  notes: 'Strong academic background, excellent references. Check Passport expiry.',
  
  // Profile Snapshot (Full Data Sheet)
  profileSnapshot: {
    givenName: 'John',
    surname: 'Doe',
    dob: '2000-05-15',
    gender: 'Male',
    maritalStatus: 'Single',
    religion: 'Christianity',
    nativeLanguage: 'English',
    
    nationality: 'United States',
    passportNumber: 'AB1234567',
    passportIssuedAt: '2020-08-15',
    passportExpiry: '2025-08-15',
    placeOfBirth: 'New York, NY, USA',
    
    currentAddress: '123 Campus Dr, Dorm A, Room 101, Boston, MA',
    homeAddress: '456 Family Lane, New York, NY 10001, USA',
    
    emergencyName: 'Jane Doe',
    emergencyRel: 'Mother',
    emergencyPhone: '+1 987 654 321',
    
    financialSupporterType: 'Parent',
    financialSupporterName: 'Jane Doe',
  },

  // Extended History Lists
  educationHistory: [
    { institution: 'Beijing High School No. 4', degree: 'High School Diploma', startYear: '2015-09-01', endYear: '2018-06-30', grade: '3.8 GPA' },
    { institution: 'Tsinghua University', degree: 'Bachelor of Science', startYear: '2018-09-01', endYear: '2022-06-30', grade: '3.9 GPA' },
  ],
  familyMembers: [
    { relation: 'Father', name: 'Robert Doe', phone: '+1 987 654 321', occupation: 'Civil Engineer' },
    { relation: 'Mother', name: 'Jane Doe', phone: '+1 987 654 322', occupation: 'High School Teacher' },
    { relation: 'Sibling', name: 'Jimmy Doe', phone: '+1 987 654 323', occupation: 'Student' },
  ],
  employmentHistory: [
    { employer: 'Tech Corp', jobTitle: 'Junior Developer', startYear: '2022-07-01', endYear: '2023-08-01', responsibilities: 'Frontend development using React.' }
  ],

  // Financial Snapshot
  scholarshipType: null as string | null, // Self-Support, Partial B, etc.
  depositPaid: 750,
  creditApplied: 500,
};

// --- PRICING ENGINE CONSTANTS ---
const PRICING_TABLE: Record<string, number> = {
  'Self-Support': 1000,
  'Partial B': 1250,
  'Partial A': 1500,
  'Full B': 1750,
  'Full A': 2000,
};

// --- HELPER COMPONENT: COPYABLE DATA FIELD ---
// This is critical for Admins filling out external University Portals
const DataField = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => {
  const { toast } = useToast();
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ description: `${label} copied to clipboard`, duration: 1000 });
  };

  return (
    <div className="group relative p-2 rounded-md hover:bg-muted/40 transition-colors">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          {icon && <span className="opacity-70">{icon}</span>}
          {label}
        </Label>
        <button 
          onClick={handleCopy} 
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"
          title="Copy to clipboard"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <p className="font-medium text-sm text-foreground mt-0.5 select-all truncate">
        {value || <span className="text-muted-foreground/40 italic">N/A</span>}
      </p>
    </div>
  );
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dialog States
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isUploadOfferDialogOpen, setIsUploadOfferDialogOpen] = useState(false);
  const [isDocReviewOpen, setIsDocReviewOpen] = useState(false);
  
  // Local Data States
  const [scholarshipType, setScholarshipType] = useState<string | null>(mockApplicationDetail.scholarshipType);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState(mockApplicationDetail.notes);
  const [status, setStatus] = useState(mockApplicationDetail.status);
  const [documents, setDocuments] = useState(appDocuments as any[]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExplicitCancel, setIsExplicitCancel] = useState(false);

  // Computed Financials
  const totalServiceFee = scholarshipType ? PRICING_TABLE[scholarshipType] : 0;
  const finalBalance = totalServiceFee > 0 ? totalServiceFee - mockApplicationDetail.creditApplied : 0;

  // --- FILE UPLOAD FUNCTIONS ---
  const validateAndAddFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were skipped. Only PDF, JPG, PNG files under 10MB are allowed.",
        variant: "destructive"
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      validateAndAddFiles(files);
    }
    // Reset input value to allow re-selecting the same file
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- ACTIONS ---

  const handleBulkDownload = () => {
    toast({
      title: "Generating ZIP Archive",
      description: "Compressing documents for download...",
    });
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: `Application_${mockApplicationDetail.studentName.replace(' ', '_')}_Docs.zip`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }, 1500);
  };

  const handleSubmitToUniversity = () => {
    setStatus('submitted_to_university');
    setIsSubmitDialogOpen(false);
    toast({
      title: "Application Submitted",
      description: "Profile locked. Status updated to 'Submitted to University'.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  const handleReject = () => {
    if (!rejectionReason) {
      toast({ title: "Error", description: "Rejection reason is required.", variant: "destructive" });
      return;
    }
    setStatus('rejected');
    setIsRejectDialogOpen(false);
    toast({
      title: "Application Rejected",
      description: "Returned to Staff for corrections. Profile unlocked.",
      variant: "destructive",
    });
  };

  const handleOfferUpload = async () => {
    if (!scholarshipType) {
      toast({ title: "Validation Error", description: "Please select a Scholarship Type before uploading offer.", variant: "destructive" });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({ title: "No Files Selected", description: "Please select files to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would upload files to your storage here
      // For now, we'll just simulate success

      setStatus('offer_received');
      // Don't close dialog here - let user close it manually
      setUploadedFiles([]);
      setIsDragOver(false);

      toast({
        title: "Documents Stored Successfully",
        description: "Admission Letter and JW202 have been stored and are now visible in the offer management section. Financials generated.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveFinancials = () => {
      toast({
          title: "Financials Updated",
          description: `Scholarship type set to ${scholarshipType}. Balance updated to $${finalBalance}.`,
      });
  };

  // --- DOCUMENT REVIEW LOGIC ---
  const openDocReview = (doc: any) => {
    setSelectedDoc(doc);
    setIsDocReviewOpen(true);
  };

  const updateDocumentStatus = (newStatus: 'verified' | 'action_required' | 'pending') => {
    if (!selectedDoc) return;
    
    setDocuments(prevDocs => 
      prevDocs.map(d => d.id === selectedDoc.id ? { ...d, status: newStatus } : d)
    );
    
    setIsDocReviewOpen(false);
    toast({
      title: "Status Updated",
      description: `Document marked as ${newStatus.replace('_', ' ')}.`,
      className: newStatus === 'verified' ? "bg-green-50 border-green-200 text-green-800" : ""
    });
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/applications')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Button>

        {/* 1. HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={mockApplicationDetail.studentName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{mockApplicationDetail.studentName}</h1>
              <p className="text-muted-foreground">{mockApplicationDetail.studentEmail}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <StatusBadge 
                    variant={
                        status === 'pending_review' ? 'warning' : 
                        status === 'submitted_to_university' ? 'info' : 
                        status === 'offer_received' ? 'success' : 'error'
                    }
                >
                    {status.replace(/_/g, ' ').toUpperCase()}
                </StatusBadge>
                {mockApplicationDetail.priority === 'high' && <StatusBadge variant="error">High Priority</StatusBadge>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleBulkDownload} className="gap-2">
              <Download className="w-4 h-4" /> Download All (ZIP)
            </Button>
            
            {status !== 'offer_received' && status !== 'rejected' && (
                <>
                    <Button variant="outline" onClick={() => setIsRejectDialogOpen(true)} className="gap-2 text-error border-error/30 hover:bg-error/10">
                      <XCircle className="w-4 h-4" /> Reject & Return
                    </Button>
                    
                    {status === 'pending_review' ? (
                         <Button onClick={() => setIsSubmitDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Upload className="w-4 h-4" /> Submit to University
                         </Button>
                    ) : (
                        <Button onClick={() => setIsUploadOfferDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4" /> Upload Offer Letter
                        </Button>
                    )}
                </>
            )}
          </div>
        </div>

        {/* 2. MAIN WORKFLOW TABS */}
        <Tabs defaultValue="review" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                <TabsTrigger value="review">Full Data Sheet</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="financials">Admission & Financials</TabsTrigger>
            </TabsList>

            {/* TAB A: FULL DATA SHEET (Expanded for Admin Form Filling) */}
            <TabsContent value="review">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    
                    {/* Top Row: Core Identity & Passport (Most Frequent Copy Targets) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Identity */}
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                                <User className="w-5 h-5 text-primary/70" /> Identity Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DataField label="Surname" value={mockApplicationDetail.profileSnapshot.surname} />
                                <DataField label="Given Name" value={mockApplicationDetail.profileSnapshot.givenName} />
                                <DataField label="Gender" value={mockApplicationDetail.profileSnapshot.gender} />
                                <DataField label="Date of Birth" value={mockApplicationDetail.profileSnapshot.dob} icon={<Calendar className="w-3 h-3"/>} />
                                <DataField label="Marital Status" value={mockApplicationDetail.profileSnapshot.maritalStatus} />
                                <DataField label="Religion" value={mockApplicationDetail.profileSnapshot.religion} />
                                <DataField label="Native Language" value={mockApplicationDetail.profileSnapshot.nativeLanguage} />
                            </div>
                        </div>

                        {/* Passport & Origin */}
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                                <Globe className="w-5 h-5 text-primary/70" /> Passport & Origin
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <DataField label="Nationality" value={mockApplicationDetail.profileSnapshot.nationality} />
                                </div>
                                <DataField label="Passport No." value={mockApplicationDetail.profileSnapshot.passportNumber} />
                                <DataField label="Place of Birth" value={mockApplicationDetail.profileSnapshot.placeOfBirth} />
                                <DataField label="Issued Date" value={mockApplicationDetail.profileSnapshot.passportIssuedAt} icon={<Calendar className="w-3 h-3"/>} />
                                <DataField label="Expiry Date" value={mockApplicationDetail.profileSnapshot.passportExpiry} icon={<Calendar className="w-3 h-3"/>} />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Support */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                            <MapPin className="w-5 h-5 text-primary/70" /> Contact & Support Network
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Direct Contact */}
                             <div className="space-y-2">
                                 <h4 className="text-sm font-semibold text-gray-900 mb-2">Student Contact</h4>
                                 <DataField label="Email" value={mockApplicationDetail.studentEmail} icon={<User className="w-3 h-3"/>}/>
                                 <DataField label="Phone" value={mockApplicationDetail.studentPhone} icon={<User className="w-3 h-3"/>}/>
                                 <DataField label="Current Address" value={mockApplicationDetail.profileSnapshot.currentAddress} />
                                 <DataField label="Home Country Address" value={mockApplicationDetail.profileSnapshot.homeAddress} />
                             </div>
                             
                             {/* Emergency */}
                             <div className="space-y-2 md:border-l md:pl-6">
                                 <h4 className="text-sm font-semibold text-gray-900 mb-2">Emergency Contact</h4>
                                 <DataField label="Name" value={mockApplicationDetail.profileSnapshot.emergencyName} icon={<Heart className="w-3 h-3"/>}/>
                                 <DataField label="Relationship" value={mockApplicationDetail.profileSnapshot.emergencyRel} />
                                 <DataField label="Phone" value={mockApplicationDetail.profileSnapshot.emergencyPhone} />
                             </div>

                             {/* Financial */}
                             <div className="space-y-2 md:border-l md:pl-6">
                                 <h4 className="text-sm font-semibold text-gray-900 mb-2">Financial Supporter</h4>
                                 <DataField label="Supporter Name" value={mockApplicationDetail.profileSnapshot.financialSupporterName} icon={<DollarSign className="w-3 h-3"/>}/>
                                 <DataField label="Type/Relationship" value={mockApplicationDetail.profileSnapshot.financialSupporterType} />
                             </div>
                        </div>
                    </div>

                    {/* Extended Lists: Education, Family, Employment */}
                    
                    {/* Education (Crucial) */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                            <GraduationCap className="w-5 h-5 text-primary/70" /> Education History (Full List)
                        </h3>
                        <div className="space-y-4">
                            {mockApplicationDetail.educationHistory.map((edu, idx) => (
                                <div key={idx} className="p-4 bg-muted/20 rounded-lg border flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DataField label="Institution" value={edu.institution} />
                                        <DataField label="Degree" value={edu.degree} />
                                        <DataField label="Dates" value={`${edu.startYear} to ${edu.endYear}`} />
                                        <DataField label="Grade/GPA" value={edu.grade} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Family & Employment Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Family List */}
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                                <Heart className="w-5 h-5 text-primary/70" /> Family Members
                            </h3>
                            <div className="space-y-4">
                                {mockApplicationDetail.familyMembers.map((fam, idx) => (
                                    <div key={idx} className="p-3 bg-muted/20 rounded-lg border">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold uppercase text-primary tracking-wider">{fam.relation}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <DataField label="Name" value={fam.name} />
                                            <DataField label="Phone" value={fam.phone} />
                                            <div className="col-span-2">
                                                <DataField label="Occupation" value={fam.occupation} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Employment List */}
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                                <Briefcase className="w-5 h-5 text-primary/70" /> Employment History
                            </h3>
                            <div className="space-y-4">
                                {mockApplicationDetail.employmentHistory.length > 0 ? (
                                    mockApplicationDetail.employmentHistory.map((job, idx) => (
                                        <div key={idx} className="p-3 bg-muted/20 rounded-lg border">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold uppercase text-primary tracking-wider">{job.jobTitle}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <DataField label="Employer" value={job.employer} />
                                                <DataField label="Dates" value={`${job.startYear} - ${job.endYear}`} />
                                                <DataField label="Responsibilities" value={job.responsibilities} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground italic text-sm">
                                        No employment history provided.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <Label>Internal Admin Notes</Label>
                        <Textarea 
                            className="mt-2 bg-yellow-50/50 border-yellow-200" 
                            rows={3} 
                            value={adminNotes} 
                            onChange={(e) => setAdminNotes(e.target.value)} 
                        />
                        <div className="flex justify-end mt-2">
                            <Button size="sm" variant="ghost" className="text-xs" onClick={() => toast({title: "Notes Saved"})}>Save Notes</Button>
                        </div>
                    </div>
                </motion.div>
            </TabsContent>

            {/* TAB B: DOCUMENTS (UPDATED WITH LEGAL SECTION) */}
            <TabsContent value="documents">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                    {/* 1. Legal & Financial Documents */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" /> Contract & Financials
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {legalDocuments.map((doc) => (
                                <div key={doc.id} className="relative group">
                                    <DocumentCard
                                        name={doc.name}
                                        type={doc.type}
                                        status={doc.status}
                                        uploadedAt={doc.uploadedAt}
                                        onView={() => window.open(doc.url, '_blank')}
                                        onDownload={() => {}}
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" className="bg-white text-purple-700 hover:bg-gray-50 shadow-sm" onClick={() => window.open(doc.url, '_blank')}>
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Application Documents */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" /> Application Documents
                            </h3>
                            <Button size="sm" variant="outline" onClick={handleBulkDownload}>
                                <Download className="w-4 h-4 mr-2" /> ZIP Download
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="relative group">
                                    <DocumentCard
                                        name={doc.name}
                                        type={doc.type}
                                        status={doc.status}
                                        uploadedAt={doc.uploadedAt}
                                        onView={() => window.open((doc as any).fileUrl || '', '_blank')}
                                        onDownload={() => window.open((doc as any).fileUrl || '', '_blank')}
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            className="bg-white text-primary hover:bg-gray-50 shadow-sm"
                                            onClick={() => openDocReview(doc)}
                                        >
                                            Review & Verify
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </TabsContent>

            {/* TAB C: FINANCIALS */}
            <TabsContent value="financials">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" /> Financial Assessment
                            </h2>
                            <StatusBadge variant="info">Pricing Engine Active</StatusBadge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Select Scholarship Type</Label>
                                    <Select 
                                        value={scholarshipType || ''} 
                                        onValueChange={(val) => setScholarshipType(val)}
                                        disabled={status === 'offer_received'}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Scholarship..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(PRICING_TABLE).map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">Select the scholarship awarded to enable financial calculations.</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-lg space-y-3 border">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-sm">Deposit Verification</h4>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1" onClick={() => window.open('#contract', '_blank')}>
                                            <ScrollText className="w-3 h-3" /> View Contract
                                        </Button>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Initial Deposit Paid:</span>
                                        <span className="font-mono text-foreground font-bold">$750.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t">
                                        <span className="font-medium text-foreground">Applied Credit:</span>
                                        <span className="font-mono font-bold text-green-600">$500.00</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center space-y-4 p-6 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Total Service Fee</span>
                                    <span className="text-lg font-bold">${totalServiceFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Less: Applied Credit</span>
                                    <span className="text-lg font-bold text-green-600">-${mockApplicationDetail.creditApplied.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-primary/20 my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary">Final Balance Due</span>
                                    <span className="text-3xl font-extrabold text-primary">${finalBalance.toFixed(2)}</span>
                                </div>
                                <div className="pt-4">
                                    <Button className="w-full" onClick={saveFinancials} disabled={!scholarshipType || status === 'offer_received'}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {status === 'offer_received' ? 'Financials Locked' : 'Update Financials'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                         <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-foreground flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" /> Admission Offer Management
                            </h2>
                        </div>
                        {status !== 'offer_received' ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <h3 className="font-medium text-foreground">No Offer Uploaded Yet</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    Upload Admission Letter and JW202 to finalize the offer and generate the invoice.
                                </p>
                                <Button onClick={() => setIsUploadOfferDialogOpen(true)} disabled={status === 'pending_review'} className="mt-4">
                                    <Upload className="w-4 h-4 mr-2" /> Upload Offer & JW202
                                </Button>
                                {status === 'pending_review' && (
                                    <p className="text-xs text-orange-600 mt-2 font-medium">Must "Submit to University" first.</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Mock files for now - in production, these would come from the uploaded files */}
                                    <div className="p-4 border rounded-lg bg-green-50/50 flex items-start gap-3">
                                        <FileText className="w-6 h-6 text-green-600" />
                                        <div>
                                            <p className="font-medium text-foreground">Admission_Letter.pdf</p>
                                            <p className="text-xs text-muted-foreground">Uploaded today</p>
                                            <div className="flex gap-3 mt-1 text-xs text-primary font-medium cursor-pointer">
                                                <span>Preview</span>
                                                <span>Download</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-green-50/50 flex items-start gap-3">
                                        <FileText className="w-6 h-6 text-green-600" />
                                        <div>
                                            <p className="font-medium text-foreground">JW202_Form.pdf</p>
                                            <p className="text-xs text-muted-foreground">Uploaded today</p>
                                            <div className="flex gap-3 mt-1 text-xs text-primary font-medium cursor-pointer">
                                                <span>Preview</span>
                                                <span>Download</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm mt-4">
                                    <Eye className="w-4 h-4" />
                                    <span>Files are <strong>HIDDEN</strong> from student until Final Balance (${finalBalance}) is paid.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </TabsContent>
        </Tabs>

        {/* DIALOGS - Submit, Reject, Upload */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Submit Application</DialogTitle>
              <DialogDescription>Submit to {mockApplicationDetail.university}? This locks the profile.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitToUniversity} className="gap-2"><Upload className="w-4 h-4" /> Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-error"><XCircle className="w-5 h-5" /> Reject Application</DialogTitle>
              <DialogDescription>Return to staff for corrections. Profile will be unlocked.</DialogDescription>
            </DialogHeader>
            <Textarea placeholder="Rejection Reason (Required)..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject & Return</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isUploadOfferDialogOpen} onOpenChange={(open) => {
          if (!open) {
            if (isExplicitCancel) {
              // Clear data only when explicitly cancelled
              setUploadedFiles([]);
              setIsDragOver(false);
              setIsExplicitCancel(false);
            }
            setIsUploadOfferDialogOpen(false);
          } else {
            setIsUploadOfferDialogOpen(open);
          }
        }}>
          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden">
            <DialogHeader className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Upload Admission Documents
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Upload Admission Letter and JW202 forms. Drag and drop files or click to browse. Files will be stored and displayed in the offer management section below.
              </DialogDescription>
            </DialogHeader>

            {/* File Upload Area */}
            <div className="space-y-4">
              <div
                className={`relative py-8 sm:py-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                }`}
                onClick={handleUploadAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 transition-colors ${
                  isDragOver ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="text-sm sm:text-base text-muted-foreground font-medium mb-1">
                  {isDragOver ? 'Drop files here' : 'Drag & drop files here or click to browse'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  PDF, JPG, PNG files (Max 10MB each)
                </p>
                {uploadedFiles.length > 0 && (
                  <p className="text-xs sm:text-sm text-primary font-medium mt-2">
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Selected Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Selected Files ({uploadedFiles.length})
                  </Label>
                  <div className="grid gap-2 max-h-40 sm:max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/20">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {file.type.includes('pdf') ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(1)}MB • {file.type.split('/')[1].toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          disabled={isUploading}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total size: {(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)}MB</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFiles([])}
                      className="text-xs h-6 px-2"
                      disabled={isUploading}
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsExplicitCancel(true);
                  setIsUploadOfferDialogOpen(false);
                }}
                disabled={isUploading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOfferUpload}
                disabled={!scholarshipType || uploadedFiles.length === 0 || isUploading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 order-1 sm:order-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Storing {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Store {uploadedFiles.length || ''} File{uploadedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- NEW DOCUMENT REVIEW DIALOG --- */}
        <Dialog open={isDocReviewOpen} onOpenChange={setIsDocReviewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Document</DialogTitle>
              <DialogDescription>
                Verify <strong>{selectedDoc?.name}</strong> or request changes.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
               {/* Document Preview Placeholder */}
               <div className="aspect-video bg-muted/30 border rounded-lg flex items-center justify-center flex-col gap-2">
                   <FileText className="w-8 h-8 text-muted-foreground" />
                   <Button variant="link" onClick={() => window.open(selectedDoc?.url, '_blank')}>View Full Document</Button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Type</Label>
                       <p className="font-medium text-sm">{selectedDoc?.type}</p>
                   </div>
                   <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Uploaded</Label>
                       <p className="font-medium text-sm">{selectedDoc?.uploadedAt?.toLocaleDateString()}</p>
                   </div>
               </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-muted-foreground"
                    onClick={() => updateDocumentStatus('pending')}
                >
                    <RefreshCw className="w-4 h-4" /> Reset
                </Button>
                <Button 
                    variant="destructive" 
                    className="flex-1 gap-2"
                    onClick={() => updateDocumentStatus('action_required')}
                >
                    <FileWarning className="w-4 h-4" /> Action Required
                </Button>
                <Button 
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => updateDocumentStatus('verified')}
                >
                    <FileCheck className="w-4 h-4" /> Verify
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PortalLayout>
  );
};

export default ApplicationDetail;