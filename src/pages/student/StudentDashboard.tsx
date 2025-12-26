import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CreditCard, 
  GraduationCap, 
  ClipboardList, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { 
  ProgressStepper, 
  KPICard, 
  AlertCard
} from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  applicationSteps, 
  mockStudent, 
  mockAppointments, 
  mockNotifications 
} from '@/lib/constants';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const student = mockStudent;
  const appointments = mockAppointments;
  const alerts = mockNotifications.filter(n => n.type === 'warning');

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'lead': return { title: 'Getting Started', subtitle: 'Complete your profile to begin', variant: 'primary', nextAction: 'Update Profile', link: '/student/profile' };
      case 'contracted': return { title: 'Contract Signed', subtitle: 'Now collecting documents', variant: 'info', nextAction: 'Upload Documents', link: '/student/documents' };
      case 'documents_pending': return { title: 'Documents in Review', subtitle: 'Some documents need attention', variant: 'warning', nextAction: 'Check Documents', link: '/student/documents' };
      case 'submitted': return { title: 'Application Submitted', subtitle: 'Waiting for university response', variant: 'primary', nextAction: 'Track Applications', link: '/student/applications' };
      case 'offer_released': return { title: 'Congratulations!', subtitle: 'Your offer letter is ready', variant: 'success', nextAction: 'View Offers', link: '/student/offers' };
      default: return { title: 'Welcome', subtitle: 'Track your progress here', variant: 'primary', nextAction: 'View Dashboard', link: '/student/dashboard' };
    }
  };

  const statusInfo = getStatusMessage(student.applicationStatus);

  const quickActions = [
    { label: 'View Documents', path: '/student/documents', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Track Applications', path: '/student/applications', icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Check Financials', path: '/student/financials', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'View Offers', path: '/student/offers', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <PortalLayout portal="student">
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {student.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your application journey
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border">
            Student ID: <span className="font-mono font-medium text-foreground">{student.id}</span>
          </div>
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

        {/* Status & Next Step Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Status KPI */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <KPICard
              title="Current Status"
              value={statusInfo.title}
              subtitle={statusInfo.subtitle}
              icon={Sparkles}
              variant={statusInfo.variant as any}
            />
          </motion.div>

          {/* Recommended Action Card (New Feature) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-xl border border-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Next Step</h3>
                <p className="text-muted-foreground">{statusInfo.subtitle}</p>
              </div>
            </div>
            <Button onClick={() => navigate(statusInfo.link)} className="w-full sm:w-auto shadow-lg shadow-primary/20 gap-2">
              {statusInfo.nextAction} <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Quick Actions & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(action.path)}
                      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${action.bg}`}>
                        <Icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground block group-hover:text-primary transition-colors">{action.label}</span>
                        <span className="text-xs text-muted-foreground">Click to view</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

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
                    action={{ label: 'View', onClick: () => {} }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Right Column: Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-1"
          >
            <Card className="card-elevated h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Upcoming</h2>
                  <div className="p-2 bg-muted rounded-full">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-muted/20 border border-border hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-col items-center justify-center text-center bg-card rounded-md border p-2 min-w-[50px] hidden sm:flex">
                            <span className="text-xs font-bold text-primary uppercase">
                              {apt.dateTime.toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-foreground">
                              {apt.dateTime.getDate()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{apt.title}</h4>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{apt.dateTime.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{apt.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/student/appointments')}>
                      View All Appointments
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No upcoming appointments</p>
                    <Button variant="link" className="mt-2 text-primary" onClick={() => navigate('/student/appointments')}>
                      Schedule One
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </PortalLayout>
  );
};

export default StudentDashboard;