import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, AlertCircle } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { 
  ProgressStepper, 
  KPICard, 
  AlertCard,
  StatusBadge 
} from '@/components/ui/EduFlareUI';
import { 
  applicationSteps, 
  mockStudent, 
  mockAppointments, 
  mockNotifications 
} from '@/lib/constants';

const StudentDashboard: React.FC = () => {
  const student = mockStudent;
  const appointments = mockAppointments;
  const alerts = mockNotifications.filter(n => n.type === 'warning');

  const getStatusMessage = (status: string) => {
    if (status === 'lead') return { title: 'Getting Started', subtitle: 'Complete your profile to begin' };
    if (status === 'contracted') return { title: 'Contract Signed', subtitle: 'Now collecting documents' };
    if (status === 'documents_pending') return { title: 'Documents in Review', subtitle: 'Some documents need attention' };
    if (status === 'submitted') return { title: 'Application Submitted', subtitle: 'Waiting for university response' };
    if (status === 'offer_released') return { title: 'Congratulations!', subtitle: 'Your offer letter is ready' };
    return { title: 'Welcome', subtitle: 'Track your progress here' };
  };

  const status = getStatusMessage(student.applicationStatus);

  return (
    <PortalLayout portal="student">
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {student.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your application journey
          </p>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Your Progress</h2>
          <ProgressStepper steps={applicationSteps} currentStep={student.currentStep} />
        </motion.div>

        {/* Status Card & Upcoming Appointment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KPICard
              title="Current Status"
              value={status.title}
              subtitle={status.subtitle}
              icon={FileText}
              variant="primary"
            />
          </motion.div>

          {/* Next Appointment */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Appointment</p>
                {appointments.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-foreground mt-2">
                      {appointments[0].title}
                    </h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{appointments[0].dateTime.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{appointments[0].dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-lg text-foreground mt-2">No upcoming appointments</p>
                )}
              </div>
              <div className="rounded-lg bg-gold/10 p-3">
                <Calendar className="w-5 h-5 text-gold" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Important Notices
            </h2>
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                description={alert.message}
                variant={alert.type as 'info' | 'success' | 'warning' | 'error'}
                icon={AlertCircle}
                action={{ label: 'View Details', onClick: () => {} }}
              />
            ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'View Documents', path: '/student/documents', icon: '📄' },
            { label: 'Track Applications', path: '/student/applications', icon: '📋' },
            { label: 'Check Financials', path: '/student/financials', icon: '💳' },
            { label: 'View Offers', path: '/student/offers', icon: '🎓' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.path}
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium text-foreground">{action.label}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;
