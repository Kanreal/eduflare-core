import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, FileText, Edit3, 
  GraduationCap, Globe, Heart, DollarSign, Shield, Briefcase, 
  AlertCircle 
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { mockStudent, studyGoalOptions, countryOptions } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

// --- Extended Mock Data for Student View ---
const studentData = {
  ...mockStudent,
  // Ensure these fields exist even if mockStudent doesn't have them yet
  givenName: 'John',
  surname: 'Doe',
  gender: 'Male',
  maritalStatus: 'Single',
  religion: 'Christianity',
  nativeLanguage: 'English',
  placeOfBirth: 'New York, NY, USA',
  passportIssuedAt: new Date('2020-08-15'),
  passportExpiry: new Date('2025-08-15'),
  
  currentAddress: '123 Campus Dr, Dorm A, Room 101, Boston, MA',
  homeAddress: '456 Family Lane, New York, NY 10001, USA',
  
  emergencyName: 'Jane Doe',
  emergencyRel: 'Mother',
  emergencyPhone: '+1 987 654 321',
  
  financialType: 'Parent',
  financialName: 'Jane Doe',

  // Lists
  educationHistory: [
    { institution: 'Beijing High School No. 4', degree: 'High School Diploma', startYear: '2015', endYear: '2018', grade: '3.8 GPA' },
    { institution: 'Tsinghua University', degree: 'Bachelor of Science', startYear: '2018', endYear: '2022', grade: '3.9 GPA' },
  ],
  familyMembers: [
    { relation: 'Father', name: 'Robert Doe', phone: '+1 987 654 321', occupation: 'Civil Engineer' },
    { relation: 'Mother', name: 'Jane Doe', phone: '+1 987 654 322', occupation: 'High School Teacher' },
  ],
  employmentHistory: [
    { employer: 'Tech Corp', jobTitle: 'Junior Developer', startYear: '2022', endYear: '2023', responsibilities: 'Frontend development using React.' }
  ]
};

// --- Reusable Read-Only Field Component ---
const ProfileField = ({ label, value, icon }: { label: string, value: string | React.ReactNode, icon?: React.ReactNode }) => (
  <div className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors">
    <div className="flex items-center gap-2 mb-1.5">
      {icon && <span className="text-primary/70">{icon}</span>}
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <div className="font-medium text-foreground text-sm pl-1">
      {value || <span className="text-muted-foreground/50 italic">Not provided</span>}
    </div>
  </div>
);

const StudentProfile: React.FC = () => {
  const { toast } = useToast();
  const [isRequestFixOpen, setIsRequestFixOpen] = useState(false);

  const handleRequestFix = () => {
    setIsRequestFixOpen(false);
    toast({
      title: "Request Sent",
      description: "Your consultant has been notified of your update request.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  return (
    <PortalLayout portal="student">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar name={studentData.name} size="xl" className="w-24 h-24 text-2xl border-4 border-white shadow-lg" />
              <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{studentData.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <span className="font-medium">Student ID:</span>
                <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">{studentData.id}</code>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                <StatusBadge variant="info">Profile Active</StatusBadge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                  <Mail className="w-3.5 h-3.5" /> {studentData.email}
                </div>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setIsRequestFixOpen(true)} variant="outline" className="gap-2 shadow-sm">
            <Edit3 className="w-4 h-4" /> Request Update
          </Button>
        </motion.div>

        {/* 1. Identity & Legal Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Identity Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 pb-2 border-b">
              <User className="w-5 h-5 text-primary" /> Personal Identity
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ProfileField label="Given Name" value={studentData.givenName} />
                <ProfileField label="Surname" value={studentData.surname} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ProfileField label="Date of Birth" value={studentData.dateOfBirth?.toLocaleDateString()} icon={<Calendar className="w-3 h-3"/>} />
                <ProfileField label="Gender" value={studentData.gender} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ProfileField label="Marital Status" value={studentData.maritalStatus} />
                <ProfileField label="Religion" value={studentData.religion} />
              </div>
              <ProfileField label="Native Language" value={studentData.nativeLanguage} />
            </div>
          </div>

          {/* Passport Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 pb-2 border-b">
              <Globe className="w-5 h-5 text-primary" /> Citizenship & Passport
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <ProfileField label="Nationality" value={studentData.nationality} icon={<MapPin className="w-3 h-3"/>} />
                </div>
                <ProfileField label="Passport Number" value={studentData.passportNumber} icon={<Shield className="w-3 h-3"/>} />
                <ProfileField label="Place of Birth" value={studentData.placeOfBirth} />
                <ProfileField label="Issued Date" value={studentData.passportIssuedAt?.toLocaleDateString()} />
                <ProfileField label="Expiry Date" value={
                  <span className={studentData.passportExpiry < new Date() ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    {studentData.passportExpiry?.toLocaleDateString()}
                  </span>
                } />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. Contact Information */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 pb-2 border-b">
            <MapPin className="w-5 h-5 text-primary" /> Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">Current Contact</h3>
              <ProfileField label="Email Address" value={studentData.email} icon={<Mail className="w-3 h-3"/>} />
              <ProfileField label="Phone Number" value={studentData.phone} icon={<Phone className="w-3 h-3"/>} />
              <ProfileField label="Current Address" value={studentData.currentAddress} />
            </div>
            <div className="space-y-4 md:border-l md:pl-8">
              <h3 className="text-sm font-medium text-muted-foreground uppercase">Permanent / Home</h3>
              <ProfileField label="Home Country Address" value={studentData.homeAddress} icon={<Globe className="w-3 h-3"/>} />
            </div>
          </div>
        </motion.div>

        {/* 3. Support & Family */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Support Network */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" /> Emergency Contact
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <ProfileField label="Name" value={studentData.emergencyName} />
                <ProfileField label="Relationship" value={studentData.emergencyRel} />
              </div>
              <ProfileField label="Emergency Phone" value={studentData.emergencyPhone} icon={<Phone className="w-3 h-3"/>} />
            </div>
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Financial Supporter
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1"><ProfileField label="Type" value={studentData.financialType} /></div>
                <div className="col-span-2"><ProfileField label="Supporter Name" value={studentData.financialName} /></div>
              </div>
            </div>
          </div>

          {/* Family List */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 pb-2 border-b">
              <User className="w-5 h-5 text-primary" /> Family Members
            </h2>
            <div className="space-y-3">
              {studentData.familyMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic bg-muted/20 rounded-lg">No family information listed.</div>
              ) : (
                studentData.familyMembers.map((member, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/10 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary text-sm uppercase tracking-wide">{member.relation}</span>
                      <span className="text-xs text-muted-foreground">{member.occupation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* 4. History (Education & Employment) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Education */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 pb-2 border-b">
              <GraduationCap className="w-5 h-5 text-primary" /> Education History
            </h2>
            <div className="space-y-4">
              {studentData.educationHistory.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-muted/10 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase">Institution</p>
                    <p className="font-semibold">{edu.institution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Degree</p>
                    <p className="font-medium">{edu.degree}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Graduated</p>
                    <p className="font-medium">{edu.endYear} <span className="text-muted-foreground text-xs ml-1">({edu.grade})</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employment */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 pb-2 border-b">
              <Briefcase className="w-5 h-5 text-primary" /> Employment History
            </h2>
            <div className="space-y-4">
              {studentData.employmentHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground italic">No employment history record.</div>
              ) : (
                studentData.employmentHistory.map((job, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/10 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <p className="text-xs text-muted-foreground uppercase">Employer</p>
                      <p className="font-semibold">{job.employer}</p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-xs text-muted-foreground uppercase">Role</p>
                      <p className="font-medium">{job.jobTitle}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase">Duration</p>
                      <p className="font-medium">{job.startYear} - {job.endYear}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Request Update Dialog */}
        <Dialog open={isRequestFixOpen} onOpenChange={setIsRequestFixOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                Request Profile Update
              </DialogTitle>
              <DialogDescription>
                Describe the changes you need. Your consultant will verify and update your profile.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-700">
                  Note: Sensitive fields like Name and Passport Number require proof documents to change.
                </p>
              </div>
              <Label htmlFor="request-details" className="mb-2 block">Change Details</Label>
              <Textarea 
                id="request-details" 
                placeholder="e.g., My passport expiry date is wrong. It should be..." 
                className="h-32"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestFixOpen(false)}>Cancel</Button>
              <Button onClick={handleRequestFix}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PortalLayout>
  );
};

export default StudentProfile;