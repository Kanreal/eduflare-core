import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye,
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  ArrowUpDown,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, EmptyState } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

// Mock application queue data
const mockApplicationQueue = [
  { 
    id: 'app-1', 
    studentName: 'John Doe', 
    university: 'Harvard University', 
    program: 'Computer Science',
    status: 'pending_review',
    priority: 'high',
    submittedAt: new Date('2024-03-18'),
    docsComplete: true,
    assignedStaff: 'Sarah Johnson',
  },
  { 
    id: 'app-2', 
    studentName: 'Sarah Miller', 
    university: 'MIT', 
    program: 'Engineering',
    status: 'pending_review',
    priority: 'medium',
    submittedAt: new Date('2024-03-15'),
    docsComplete: true,
    assignedStaff: 'Sarah Johnson',
  },
  { 
    id: 'app-3', 
    studentName: 'Michael Chen', 
    university: 'Stanford University', 
    program: 'Business Administration',
    status: 'submitted_to_uni',
    priority: 'low',
    submittedAt: new Date('2024-03-10'),
    docsComplete: true,
    assignedStaff: 'Tom Wilson',
  },
  { 
    id: 'app-4', 
    studentName: 'Emily Wilson', 
    university: 'Yale University', 
    program: 'Law',
    status: 'offer_received',
    priority: 'low',
    submittedAt: new Date('2024-02-20'),
    docsComplete: true,
    assignedStaff: 'Sarah Johnson',
  },
  { 
    id: 'app-5', 
    studentName: 'David Brown', 
    university: 'Princeton', 
    program: 'Economics',
    status: 'rejected',
    priority: 'low',
    submittedAt: new Date('2024-02-15'),
    docsComplete: true,
    assignedStaff: 'Tom Wilson',
  },
];

type AppStatus = 'pending_review' | 'submitted_to_uni' | 'offer_received' | 'rejected';

const statusConfig: Record<AppStatus, { label: string; variant: 'warning' | 'primary' | 'success' | 'error' }> = {
  pending_review: { label: 'Pending Review', variant: 'warning' },
  submitted_to_uni: { label: 'Submitted to University', variant: 'primary' },
  offer_received: { label: 'Offer Received', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
};

const ApplicationQueue: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredApplications = mockApplicationQueue.filter((app) => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort by priority (high first) then by date
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    }
    return b.submittedAt.getTime() - a.submittedAt.getTime();
  });

  const stats = {
    total: mockApplicationQueue.length,
    pending: mockApplicationQueue.filter(a => a.status === 'pending_review').length,
    submitted: mockApplicationQueue.filter(a => a.status === 'submitted_to_uni').length,
    offers: mockApplicationQueue.filter(a => a.status === 'offer_received').length,
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Application Queue</h1>
          <p className="text-muted-foreground mt-1">Review and process student applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-warning tabular-nums">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">Submitted</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{stats.submitted}</p>
          </div>
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Offers Received</p>
            <p className="text-2xl font-bold text-success tabular-nums">{stats.offers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="submitted_to_uni">Submitted</SelectItem>
              <SelectItem value="offer_received">Offer Received</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Application List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {sortedApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">University / Program</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Submitted</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedApplications.map((app, index) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={app.studentName} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{app.studentName}</p>
                            <p className="text-xs text-muted-foreground lg:hidden">{app.university}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <p className="text-sm text-foreground">{app.university}</p>
                        <p className="text-xs text-muted-foreground">{app.program}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            app.priority === 'high' ? 'bg-error' :
                            app.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                          }`} />
                          <span className="text-sm capitalize text-foreground">{app.priority}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge variant={statusConfig[app.status as AppStatus].variant}>
                          {statusConfig[app.status as AppStatus].label}
                        </StatusBadge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {app.submittedAt.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hidden sm:flex gap-1"
                            onClick={() => navigate(`/admin/applications/${app.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/applications/${app.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {app.status === 'pending_review' && (
                                <>
                                  <DropdownMenuItem>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Submit to University
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-error">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Application
                                  </DropdownMenuItem>
                                </>
                              )}
                              {app.status === 'submitted_to_uni' && (
                                <>
                                  <DropdownMenuItem>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Upload Offer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-error">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Mark as Rejected
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="No applications found"
              description="Try adjusting your search or filter criteria"
            />
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default ApplicationQueue;
