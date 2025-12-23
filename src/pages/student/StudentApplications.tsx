import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import { mockUniversityApplications } from '@/lib/constants';

const StudentApplications: React.FC = () => {
  const applications = mockUniversityApplications;

  const getStatusConfig = (status: string) => {
    if (status === 'accepted') return { variant: 'success' as const, icon: CheckCircle, label: 'Accepted' };
    if (status === 'rejected') return { variant: 'error' as const, icon: XCircle, label: 'Rejected' };
    if (status === 'submitted') return { variant: 'primary' as const, icon: Clock, label: 'Under Review' };
    return { variant: 'warning' as const, icon: Clock, label: 'Pending' };
  };

  return (
    <PortalLayout portal="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Application Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track your university applications in real-time
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <p className="text-3xl font-bold text-foreground">{applications.length}</p>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <p className="text-3xl font-bold text-success">
              {applications.filter(a => a.status === 'accepted').length}
            </p>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <p className="text-3xl font-bold text-primary">
              {applications.filter(a => a.status === 'submitted').length}
            </p>
            <p className="text-sm text-muted-foreground">Under Review</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-card">
            <p className="text-3xl font-bold text-warning">
              {applications.filter(a => a.status === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-foreground">Your Applications</h2>
          </div>

          <div className="divide-y divide-border">
            {applications.map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline indicator */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        statusConfig.variant === 'success' 
                          ? 'bg-success/20 text-success' 
                          : statusConfig.variant === 'error'
                            ? 'bg-error/20 text-error'
                            : 'bg-primary/20 text-primary'
                      }`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      {index < applications.length - 1 && (
                        <div className="w-0.5 h-full absolute top-10 bg-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold text-foreground">{app.universityName}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{app.program}</p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <StatusBadge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </StatusBadge>
                            {app.submittedAt && (
                              <span className="text-xs text-muted-foreground">
                                Submitted {app.submittedAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                          Priority #{app.priority}
                        </span>
                      </div>

                      {statusConfig.variant === 'success' && (
                        <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
                          <p className="text-sm text-success font-medium">
                            🎉 Congratulations! You've been accepted.
                          </p>
                          <button className="mt-2 text-sm text-success font-medium flex items-center gap-1 hover:underline">
                            View Offer Details <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {statusConfig.variant === 'error' && (
                        <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
                          <p className="text-sm text-error">
                            Unfortunately, this application was not successful.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentApplications;
