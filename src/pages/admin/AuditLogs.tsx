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
import { mockAuditLogs } from '@/lib/constants';

// Extended mock audit logs
const extendedAuditLogs = [
  ...mockAuditLogs,
  { id: 'log-4', userId: 'staff-2', userName: 'Tom Wilson', action: 'Updated Student Profile', details: 'Changed contact information for Sarah Miller', entityType: 'student', entityId: 'std-2', timestamp: new Date(Date.now() - 3600000), ipAddress: '192.168.1.5' },
  { id: 'log-5', userId: 'admin-1', userName: 'Michael Chen', action: 'Processed Refund', details: 'Refund of $2,500 approved for Emily Wilson', entityType: 'payment', entityId: 'pay-3', timestamp: new Date(Date.now() - 7200000), ipAddress: '192.168.1.1' },
  { id: 'log-6', userId: 'staff-1', userName: 'Sarah Johnson', action: 'Uploaded Document', details: 'Bank statement uploaded for John Doe', entityType: 'document', entityId: 'doc-7', timestamp: new Date(Date.now() - 10800000), ipAddress: '192.168.1.2' },
  { id: 'log-7', userId: 'admin-1', userName: 'Michael Chen', action: 'Changed System Settings', details: 'Updated commission rate to 15%', entityType: 'settings', entityId: 'set-1', timestamp: new Date(Date.now() - 86400000), ipAddress: '192.168.1.1' },
  { id: 'log-8', userId: 'staff-2', userName: 'Tom Wilson', action: 'Converted Lead', details: 'Lead David Brown converted to student', entityType: 'lead', entityId: 'lead-2', timestamp: new Date(Date.now() - 172800000), ipAddress: '192.168.1.5' },
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
  if (action.includes('Approved') || action.includes('Verified') || action.includes('Converted')) return 'success';
  if (action.includes('Rejected') || action.includes('Deleted')) return 'error';
  if (action.includes('Updated') || action.includes('Changed')) return 'warning';
  return 'primary';
};

const AuditLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredLogs = extendedAuditLogs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date();
      matchesDate = log.timestamp.toDateString() === today.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = log.timestamp >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = log.timestamp >= monthAgo;
    }
    
    return matchesSearch && matchesEntity && matchesDate;
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
            <p className="text-2xl font-bold text-foreground tabular-nums">{extendedAuditLogs.length}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {new Set(extendedAuditLogs.map(l => l.userId)).size}
            </p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {extendedAuditLogs.filter(l => l.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
            </p>
            <p className="text-xs text-muted-foreground">Last 24 Hours</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {new Set(extendedAuditLogs.map(l => l.entityType)).size}
            </p>
            <p className="text-xs text-muted-foreground">Entity Types</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AuditLogs;
