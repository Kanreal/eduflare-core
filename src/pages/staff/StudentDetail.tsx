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
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, DocumentCard, ProgressStepper } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAuth } from '@/contexts/AuthContext';

// Mock student detail with passport expiry
const mockStudentDetail = {
  id: 'std-1',
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+1 234 567 890',
  nationality: 'United States',
  dateOfBirth: new Date('2000-05-15'),
  passportNumber: 'AB1234567',
  passportExpiry: new Date('2025-08-15'), // 8 months from now - valid
  currentStep: 3,
  status: 'documents_pending',
  applications: [
    { id: 'app-1', university: 'Harvard University', program: 'Computer Science', status: 'pending', priority: 1, isLocked: false },
    { id: 'app-2', university: 'MIT', program: 'Engineering', status: 'pending', priority: 2, isLocked: false },
    { id: 'app-3', university: 'Stanford University', program: 'Data Science', status: 'draft', priority: 3, isLocked: true },
  ],
};

// Mock universities for batch selector
const mockUniversities = [
  { id: 'uni-1', name: 'Harvard University', country: 'USA' },
  { id: 'uni-2', name: 'MIT', country: 'USA' },
  { id: 'uni-3', name: 'Stanford University', country: 'USA' },
  { id: 'uni-4', name: 'Yale University', country: 'USA' },
  { id: 'uni-5', name: 'Princeton University', country: 'USA' },
  { id: 'uni-6', name: 'Columbia University', country: 'USA' },
];

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isAddAppDialogOpen, setIsAddAppDialogOpen] = useState(false);
  const [selectedBatch1, setSelectedBatch1] = useState<string[]>(['uni-1', 'uni-2']);
  const [selectedBatch2, setSelectedBatch2] = useState<string[]>(['uni-3']);

  const student = mockStudentDetail;
  const documents = mockDocuments;
  
  const isAdmin = role === 'admin';

  // Passport validation
  const passportValidation = usePassportValidation(student.passportExpiry, 6);

  const handleSubmitApplication = (appId: string) => {
    // Check passport validity before allowing submission
    if (!passportValidation.isValid) {
      return; // Block submission - warning will be shown
    }
    setSelectedApp(appId);
    setIsSubmitDialogOpen(true);
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
            <Avatar name={student.name} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                {isAdmin && (
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
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {student.phone}
                </span>
              </div>
              <div className="mt-3">
                <StatusBadge variant="warning">Documents Pending</StatusBadge>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="lg:max-w-md w-full">
            <ProgressStepper steps={applicationSteps} currentStep={student.currentStep} />
          </div>
        </div>

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
                expiryDate={student.passportExpiry} 
                minimumMonths={6}
                showAsBlock
              />

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="font-medium text-foreground">{student.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium text-foreground">{student.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium text-foreground">{student.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Nationality</label>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {student.nationality}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {student.dateOfBirth.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Passport Number</label>
                    <p className="font-medium text-foreground font-mono">{student.passportNumber}</p>
                  </div>
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
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Application
                </Button>
              </div>

              <div className="space-y-4">
                {student.applications.map((app, index) => (
                  <div
                    key={app.id}
                    className={`rounded-xl border bg-card p-5 ${
                      app.isLocked ? 'border-muted opacity-75' : 'border-border'
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
                            {app.isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
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
                        {!app.isLocked && app.status === 'pending' && (
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
