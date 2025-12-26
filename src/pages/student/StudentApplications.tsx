import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight,
  AlertCircle,
  Search
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import { mockUniversityApplications } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

const StudentApplications: React.FC = () => {
  const navigate = useNavigate();
  const applications = mockUniversityApplications;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return { variant: 'success' as const, icon: CheckCircle, label: 'Accepted', description: 'Congratulations! Offer received.' };
      case 'rejected':
        return { variant: 'error' as const, icon: XCircle, label: 'Rejected', description: 'Application was not successful.' };
      case 'submitted':
        return { variant: 'info' as const, icon: Clock, label: 'Under Review', description: 'Submitted to university. Awaiting decision.' };
      case 'returned': // Handling potential future state
        return { variant: 'warning' as const, icon: AlertCircle, label: 'Action Required', description: 'Additional information requested.' };
      default:
        return { variant: 'warning' as const, icon: Clock, label: 'Pending Staff', description: 'Preparing for submission.' };
    }
  };

  return (
    <PortalLayout portal="student">
      <div className="space-y-6 max-w-5xl mx-auto">
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

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="card-elevated border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{applications.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Apps</p>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-success">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-success">
                {applications.filter(a => a.status === 'accepted').length}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Accepted</p>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(a => a.status === 'submitted').length}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Under Review</p>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-warning">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-warning">
                {applications.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-destructive">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Rejected</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline / List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-elevated overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Your Applications
              </CardTitle>
            </CardHeader>

            <div className="divide-y divide-border">
              {applications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No Applications Yet</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    Your consultant is currently reviewing your profile to select the best universities for you.
                  </p>
                </div>
              ) : (
                applications.map((app, index) => {
                  const statusConfig = getStatusConfig(app.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.1 }}
                      className="p-6 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon Indicator */}
                        <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          statusConfig.variant === 'success' ? 'bg-success/10 text-success' : 
                          statusConfig.variant === 'error' ? 'bg-destructive/10 text-destructive' :
                          statusConfig.variant === 'info' ? 'bg-blue-50 text-blue-600' :
                          'bg-warning/10 text-warning'
                        }`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-foreground">{app.universityName}</h3>
                                <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded text-muted-foreground border border-border">
                                  Priority #{app.priority}
                                </span>
                              </div>
                              <p className="text-muted-foreground font-medium">{app.program}</p>
                              
                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <StatusBadge variant={statusConfig.variant}>
                                  {statusConfig.label}
                                </StatusBadge>
                                {app.submittedAt && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Submitted: {app.submittedAt.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            {statusConfig.variant === 'success' && (
                              <Button 
                                onClick={() => navigate('/student/offers')} 
                                className="bg-success hover:bg-success/90 text-white shadow-sm gap-2 shrink-0"
                                size="sm"
                              >
                                View Offer <ArrowRight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {/* Dynamic Feedback / Description Section */}
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-start gap-2">
                              <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${
                                statusConfig.variant === 'success' ? 'bg-success' :
                                statusConfig.variant === 'error' ? 'bg-destructive' :
                                statusConfig.variant === 'info' ? 'bg-blue-500' : 'bg-warning'
                              }`} />
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {statusConfig.description}
                              </p>
                            </div>
                            
                            {/* Example of handling specific feedback if data existed */}
                            {app.status === 'rejected' && (
                                <div className="mt-2 p-3 bg-destructive/5 border border-destructive/10 rounded-md">
                                    <p className="text-xs font-medium text-destructive">Note from Admissions:</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Competition for this program was extremely high this year. We encourage you to accept the offer from your second choice university.
                                    </p>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentApplications;