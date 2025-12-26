import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Lock,
  Eye,
  Shield,
  Download,
  MessageSquare
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import { mockDocuments } from '@/lib/constants';

const StudentDocuments: React.FC = () => {
  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      passport: 'Identity Document',
      transcript: 'Academic Record',
      language: 'Language Certification',
      financial: 'Financial Document',
      statement: 'Personal Statement',
      recommendation: 'Reference Letter',
    };
    return labels[type] || type;
  };

  const verifiedCount = mockDocuments.filter(d => d.status === 'verified').length;
  const pendingCount = mockDocuments.filter(d => d.status === 'pending').length;
  const errorCount = mockDocuments.filter(d => d.status === 'error').length;
  const lockedCount = mockDocuments.filter(d => d.status === 'locked').length;

  return (
    <PortalLayout portal="student">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            Your secure document vault. These files are used for your university applications.
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="card-elevated border-l-4 border-l-success">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-warning">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-destructive">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Action Req</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated border-l-4 border-l-muted">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lockedCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Locked</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-primary">Read-Only Vault</p>
                <p className="text-sm text-muted-foreground mt-1">
                  To ensure application integrity, documents can only be uploaded by your consultant. 
                  Please send any new or updated files directly to them via email or WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mockDocuments.map((doc) => (
            <Card key={doc.id} className={`card-elevated relative overflow-hidden group transition-all hover:shadow-lg ${doc.status === 'error' ? 'border-destructive/30 ring-1 ring-destructive/10' : ''}`}>
              
              {/* Lock Indicator */}
              {(doc.status === 'locked' || doc.status === 'verified') && (
                <div className="absolute top-0 right-0 p-3">
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                </div>
              )}

              <CardContent className="p-6">
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.status === 'verified' ? 'bg-success/10 text-success' :
                    doc.status === 'error' ? 'bg-destructive/10 text-destructive' :
                    doc.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate text-foreground" title={doc.name}>{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">{getDocumentTypeLabel(doc.type)}</p>
                  </div>
                </div>
                
                {/* Status Bar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
                    <StatusBadge variant={
                      doc.status === 'verified' ? 'success' :
                      doc.status === 'error' ? 'error' :
                      doc.status === 'pending' ? 'warning' :
                      doc.status === 'locked' ? 'muted' : 'default'
                    }>
                      {doc.status === 'error' ? 'Action Required' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </StatusBadge>
                  </div>
                  
                  {/* Metadata */}
                  {doc.uploadedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span className="font-medium">{doc.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {/* Feedback Section (If Error) */}
                  {doc.status === 'error' && (
                    <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-destructive mb-0.5">Consultant Feedback:</p>
                          <p className="text-xs text-destructive/90">
                            "Image is too blurry. Please re-scan."
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2">
                    {doc.status === 'verified' || doc.status === 'locked' ? (
                      <Button variant="outline" className="w-full gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30" size="sm">
                        <Download className="w-4 h-4" />
                        Download Copy
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full gap-2 text-muted-foreground" size="sm" disabled>
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Empty State */}
        {mockDocuments.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Vault Empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-1">
              Your documents will appear here once your consultant uploads them.
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default StudentDocuments;