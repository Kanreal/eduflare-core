import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download,
  Shield,
  Clock,
  User,
  FileText,
  CreditCard,
  Settings,
  Eye,
  EyeOff,
  UserCheck,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { mockAuditLogs } from '@/lib/constants';

// Extended mock audit logs
const extendedAuditLogs = [
  ...mockAuditLogs,
  { id: 'log-4', userId: 'staff-2', userName: 'Tom Wilson', userRole: 'staff' as const, action: 'Updated Student Profile', details: 'Changed contact information for Sarah Miller', entityType: 'student' as const, entityId: 'std-2', timestamp: new Date(Date.now() - 3600000), ipAddress: '192.168.1.5', isOverride: false },
  { id: 'log-5', userId: 'admin-1', userName: 'Michael Chen', userRole: 'admin' as const, action: 'Processed Refund', details: 'Refund of $2,500 approved for Emily Wilson', entityType: 'payment' as const, entityId: 'pay-3', timestamp: new Date(Date.now() - 7200000), ipAddress: '192.168.1.1', isOverride: false },
  { id: 'log-6', userId: 'staff-1', userName: 'Sarah Johnson', userRole: 'staff' as const, action: 'Uploaded Document', details: 'Bank statement uploaded for John Doe', entityType: 'document' as const, entityId: 'doc-7', timestamp: new Date(Date.now() - 10800000), ipAddress: '192.168.1.2', isOverride: false },
  { id: 'log-7', userId: 'admin-1', userName: 'Michael Chen', userRole: 'admin' as const, action: 'Changed System Settings', details: 'Updated commission rate to 15%', entityType: 'settings' as const, entityId: 'set-1', timestamp: new Date(Date.now() - 86400000), ipAddress: '192.168.1.1', isOverride: false },
  { id: 'log-8', userId: 'staff-2', userName: 'Tom Wilson', userRole: 'staff' as const, action: 'Converted Lead', details: 'Lead David Brown converted to student', entityType: 'lead' as const, entityId: 'lead-2', timestamp: new Date(Date.now() - 172800000), ipAddress: '192.168.1.5', isOverride: false },
];

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case 'application':
      return FileText;
    case 'document':
      return FileText;
    case 'contract':
      return FileText;
    case 'payment':
      return CreditCard;
    case 'student':
      return User;
    case 'lead':
      return User;
    case 'settings':
      return Settings;
    default:
      return Eye;
  }
};

const getActionColor = (action: string) => {
  if (action.includes('Approved') || action.includes('Verified') || action.includes('Converted') || action.includes('approved')) return 'success';
  if (action.includes('Rejected') || action.includes('Deleted') || action.includes('rejected')) return 'error';
  if (action.includes('Updated') || action.includes('Changed') || action.includes('submitted')) return 'warning';
  return 'primary';
};

const AuditLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('system');
  const { impersonationLogs } = useImpersonation();
  const { auditLogs, unlockRequests } = useEduFlare();

  // Combine extended mock logs with context audit logs
  const allAuditLogs = [...extendedAuditLogs, ...auditLogs];

  // Filter unlock-related audit entries
  const unlockAuditLogs = allAuditLogs.filter(log => 
    log.action.includes('unlock_request') || 
    log.action.includes('Unlock') ||
    log.details.toLowerCase().includes('unlock')
  );

  const filteredLogs = allAuditLogs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    
    // Date filter logic
    let matchesDate = true;
    const logTimestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
    if (dateFilter === 'today') {
      const today = new Date();
      matchesDate = logTimestamp.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = logTimestamp >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = logTimestamp >= monthAgo;
    }
    
    return matchesSearch && matchesEntity && matchesDate;
  });

  const formatTimestamp = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateObj.toLocaleDateString();
  };

  const getImpersonationActionIcon = (action: string) => {
    if (action === 'START_IMPERSONATION') return Eye;
    if (action === 'END_IMPERSONATION') return EyeOff;
    return UserCheck;
  };

  const getImpersonationActionColor = (action: string) => {
    if (action === 'START_IMPERSONATION') return 'warning';
    if (action === 'END_IMPERSONATION') return 'success';
    return 'muted';
  };

  const getUnlockActionIcon = (action: string) => {
    if (action.includes('approved')) return CheckCircle;
    if (action.includes('rejected')) return XCircle;
    if (action.includes('submitted')) return Lock;
    return Unlock;
  };

  const getUnlockActionColor = (action: string) => {
    if (action.includes('approved')) return 'success';
    if (action.includes('rejected')) return 'error';
    if (action.includes('submitted')) return 'warning';
    return 'primary';
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary" />
              Audit Logs
            </h1>
            <p className="text-muted-foreground mt-1">Complete record of all system activities</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
        </div>

        {/* Security Notice */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Immutable Audit Trail</p>
              <p className="text-sm text-muted-foreground mt-1">
                All actions are permanently recorded and cannot be modified or deleted. 
                This log maintains complete accountability for all system operations.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for System Logs, Impersonation Logs, and Unlock Requests */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="system" className="gap-2">
              <FileText className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="unlock" className="gap-2">
              <Unlock className="w-4 h-4" />
              Unlocks ({unlockRequests.length})
            </TabsTrigger>
            <TabsTrigger value="impersonation" className="gap-2">
              <Eye className="w-4 h-4" />
              Impersonation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="application">Applications</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audit Log Timeline */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-0">
                {filteredLogs.map((log, index) => {
                  const EntityIcon = getEntityIcon(log.entityType);
                  const actionColor = getActionColor(log.action);
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative pl-8 pb-8 last:pb-0"
                    >
                      {/* Timeline line */}
                      {index < filteredLogs.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                      )}
                      
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        actionColor === 'success' ? 'bg-success/20' :
                        actionColor === 'error' ? 'bg-error/20' :
                        actionColor === 'warning' ? 'bg-warning/20' : 'bg-primary/20'
                      }`}>
                        <EntityIcon className={`w-3 h-3 ${
                          actionColor === 'success' ? 'text-success' :
                          actionColor === 'error' ? 'text-error' :
                          actionColor === 'warning' ? 'text-warning' : 'text-primary'
                        }`} />
                      </div>
                      
                      {/* Content */}
                      <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground">{log.action}</span>
                              <StatusBadge variant={actionColor as 'success' | 'error' | 'warning' | 'primary'} size="sm">
                                {log.entityType}
                              </StatusBadge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Avatar name={log.userName} size="sm" className="w-5 h-5 text-[8px]" />
                                {log.userName}
                              </span>
                              {log.ipAddress && (
                                <span className="font-mono">{log.ipAddress}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium text-foreground">No logs found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">{allAuditLogs.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {new Set(allAuditLogs.map(l => l.userId)).size}
                </p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {allAuditLogs.filter(l => {
                    const ts = l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp);
                    return ts >= new Date(Date.now() - 24 * 60 * 60 * 1000);
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Last 24 Hours</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {new Set(allAuditLogs.map(l => l.entityType)).size}
                </p>
                <p className="text-xs text-muted-foreground">Entity Types</p>
              </div>
            </div>
          </TabsContent>

          {/* Unlock Requests Tab */}
          <TabsContent value="unlock" className="space-y-4">
            {/* Unlock Info */}
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Profile Unlock Audit Trail</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All unlock requests and their approvals/rejections are permanently recorded. 
                    This ensures accountability for any changes made to locked student profiles.
                  </p>
                </div>
              </div>
            </div>

            {/* Unlock Requests List */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-0">
                {unlockRequests.length > 0 ? (
                  unlockRequests.slice().reverse().map((request, index) => {
                    const ActionIcon = getUnlockActionIcon(request.status);
                    const actionColor = getUnlockActionColor(request.status);
                    
                    return (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="relative pl-8 pb-8 last:pb-0"
                      >
                        {/* Timeline line */}
                        {index < unlockRequests.length - 1 && (
                          <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                        )}
                        
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                          actionColor === 'success' ? 'bg-success/20' :
                          actionColor === 'error' ? 'bg-error/20' :
                          actionColor === 'warning' ? 'bg-warning/20' : 'bg-primary/20'
                        }`}>
                          <ActionIcon className={`w-3 h-3 ${
                            actionColor === 'success' ? 'text-success' :
                            actionColor === 'error' ? 'text-error' :
                            actionColor === 'warning' ? 'text-warning' : 'text-primary'
                          }`} />
                        </div>
                        
                        {/* Content */}
                        <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">
                                  Unlock Request - {request.status === 'pending' ? 'Pending' : 
                                    request.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                                <StatusBadge 
                                  variant={request.status === 'approved' ? 'success' : 
                                    request.status === 'rejected' ? 'error' : 'warning'} 
                                  size="sm"
                                >
                                  {request.status}
                                </StatusBadge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>{request.studentName}</strong> - Fields: {request.requestedFields.join(', ')}
                              </p>
                              
                              <p className="text-sm text-muted-foreground mt-1">
                                Reason: {request.reason}
                              </p>
                              
                              {request.adminNotes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Admin notes: <span className="italic">{request.adminNotes}</span>
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Requested by: {request.requestedByRole}
                                </span>
                                {request.processedBy && (
                                  <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Processed by: {request.processedBy}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimestamp(request.createdAt)}</span>
                              </div>
                              {request.processedAt && (
                                <span className="text-xs">
                                  Processed: {formatTimestamp(request.processedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Unlock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground">No unlock requests</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Unlock requests will appear here when staff or students request profile changes
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Unlock Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">{unlockRequests.length}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-warning tabular-nums">
                  {unlockRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-success tabular-nums">
                  {unlockRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-error tabular-nums">
                  {unlockRequests.filter(r => r.status === 'rejected').length}
                </p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="impersonation" className="space-y-4">
            {/* Impersonation Warning */}
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Impersonation Audit Log</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All impersonation sessions are logged for security and accountability. 
                    Actions taken while impersonating are recorded with both the admin and impersonated user context.
                  </p>
                </div>
              </div>
            </div>

            {/* Impersonation Logs Timeline */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-0">
                {impersonationLogs.length > 0 ? (
                  impersonationLogs.slice().reverse().map((log, index) => {
                    const ActionIcon = getImpersonationActionIcon(log.action);
                    const actionColor = getImpersonationActionColor(log.action);
                    
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="relative pl-8 pb-8 last:pb-0"
                      >
                        {/* Timeline line */}
                        {index < impersonationLogs.length - 1 && (
                          <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />
                        )}
                        
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                          actionColor === 'success' ? 'bg-success/20' :
                          actionColor === 'warning' ? 'bg-warning/20' : 'bg-muted'
                        }`}>
                          <ActionIcon className={`w-3 h-3 ${
                            actionColor === 'success' ? 'text-success' :
                            actionColor === 'warning' ? 'text-warning' : 'text-muted-foreground'
                          }`} />
                        </div>
                        
                        {/* Content */}
                        <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">
                                  {log.action === 'START_IMPERSONATION' ? 'Started Impersonation' : 
                                   log.action === 'END_IMPERSONATION' ? 'Ended Impersonation' : 
                                   'Impersonation Expired'}
                                </span>
                                <StatusBadge variant={log.impersonationType === 'staff' ? 'warning' : 'primary'} size="sm">
                                  {log.impersonationType}
                                </StatusBadge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>{log.actorAdminName}</strong> {log.action === 'START_IMPERSONATION' ? 'started viewing as' : 'stopped viewing as'}{' '}
                                <strong>{log.impersonatedUserName}</strong>
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Admin: {log.actorAdminName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Target: {log.impersonatedUserName}
                                </span>
                                {log.userAgent && (
                                  <span className="font-mono text-[10px] truncate max-w-[200px]" title={log.userAgent}>
                                    {log.userAgent.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimestamp(log.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground">No impersonation events</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Impersonation events will appear here when an admin views the system as another user
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Impersonation Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">{impersonationLogs.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {impersonationLogs.filter(l => l.action === 'START_IMPERSONATION').length}
                </p>
                <p className="text-xs text-muted-foreground">Sessions Started</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {impersonationLogs.filter(l => l.impersonationType === 'student').length}
                </p>
                <p className="text-xs text-muted-foreground">Student Views</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default AuditLogs;