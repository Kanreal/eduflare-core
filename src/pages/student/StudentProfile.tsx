import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, FileText, Edit3 } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { mockStudent } from '@/lib/constants';

const StudentProfile: React.FC = () => {
  const student = mockStudent;

  const profileFields = [
    { label: 'Full Name', value: student.name, icon: User },
    { label: 'Email Address', value: student.email, icon: Mail },
    { label: 'Phone Number', value: student.phone || 'Not provided', icon: Phone },
    { label: 'Nationality', value: student.nationality || 'Not provided', icon: MapPin },
    { label: 'Date of Birth', value: student.dateOfBirth?.toLocaleDateString() || 'Not provided', icon: Calendar },
    { label: 'Passport Number', value: student.passportNumber || 'Not provided', icon: FileText },
  ];

  return (
    <PortalLayout portal="student">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Your personal information (read-only)
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Request Update</span>
          </button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
        >
          {/* Profile Header */}
          <div className="gradient-primary p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">{student.name}</h2>
            <p className="text-white/80 text-sm">Student ID: {student.id}</p>
          </div>

          {/* Profile Fields */}
          <div className="p-6 space-y-4">
            {profileFields.map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {field.label}
                    </p>
                    <p className="text-foreground font-medium mt-0.5 truncate">
                      {field.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Account Info */}
          <div className="px-6 pb-6">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Account created:</strong>{' '}
                {student.createdAt.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Request Fix Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/20"
        >
          <p className="text-sm text-foreground">
            <strong>Need to update your information?</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Contact your assigned consultant or click "Request Update" to submit a change request. 
            All updates require verification for security purposes.
          </p>
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentProfile;
