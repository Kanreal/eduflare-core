import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye,
  MoreVertical,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  GraduationCap,
  ChevronRight,
  Send,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, EmptyState } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UniversityApplicationStatus } from '@/types';
import { generateMockData } from '@/lib/mockData';
import { AddApplicationForm } from '@/components/applications/AddApplicationForm';

// Get mock data
const { applications, students, universities } = generateMockData();

// Status configurations
const statusConfig: Record<UniversityApplicationStatus, { label: string; variant: 'warning' | 'primary' | 'success' | 'error' | 'muted' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  pending_admin: { label: 'Pending Admin Review', variant: 'warning' },
  approved: { label: 'Approved by Admin', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  submitted_to_uni: { label: 'Submitted to University', variant: 'primary' },
  returned_by_school: { label: 'Returned by School', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'error' },
};

const ApplicationManager: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Combine application data with student and university info
  const enrichedApplications = applications.map(app => {
    const student = students.find(s => s.id === app.studentId);
    const university = universities.find(u => u.id === app.universityId);
    return {
      ...app,
      studentName: student?.name || 'Unknown Student',
      studentEmail: student?.email || '',
      studentStatus: student?.status || 'unknown',
      universityCountry: university?.country || '',
    };
  });

  // Filter applications
  const filteredApplications = enrichedApplications.filter((app) => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesBatch = batchFilter === 'all' || app.batch.toString() === batchFilter;
    return matchesSearch && matchesStatus && matchesBatch;
  });

  // Sort by priority and date
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Stats
  const stats = {
    total: enrichedApplications.length,
    draft: enrichedApplications.filter(a => a.status === 'draft').length,
    pendingAdmin: enrichedApplications.filter(a => a.status === 'pending_admin').length,
    submittedToUni: enrichedApplications.filter(a => a.status === 'submitted_to_uni').length,
    accepted: enrichedApplications.filter(a => a.status === 'accepted').length,
  };

  const handleSubmitToAdmin = (appId: string) => {
    toast({
      title: "Submitted to Admin",
      description: "Application has been submitted for admin review.",
    });
  };

  const handleViewApplication = (appId: string) => {
    navigate(`/staff/applications/${appId}`);
  };

  const handleApplicationCreated = () => {
    setAddDialogOpen(false);
    toast({
      title: "Application Created",
      description: "University application has been created successfully.",
    });
  };

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Manager</h1>
            <p className="text-muted-foreground mt-1">Create and manage university applications for your students</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create University Application</DialogTitle>
                <DialogDescription>
                  Select a student and university to create a new application
                </DialogDescription>
              </DialogHeader>
              <AddApplicationForm 
                onSuccess={handleApplicationCreated}
                onCancel={() => setAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-muted/30 bg-muted/5 p-4">
            <p className="text-sm text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-muted-foreground tabular-nums">{stats.draft}</p>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <p className="text-sm text-muted-foreground">Pending Admin</p>
            <p className="text-2xl font-bold text-warning tabular-nums">{stats.pendingAdmin}</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">At University</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{stats.submittedToUni}</p>
          </div>
          <div className="rounded-xl border border-success/30 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold text-success tabular-nums">{stats.accepted}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, university, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-52">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_admin">Pending Admin</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="submitted_to_uni">Submitted to University</SelectItem>
              <SelectItem value="returned_by_school">Returned by School</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="1">Batch 1 (First 2)</SelectItem>
              <SelectItem value="2">Batch 2 (Next 3)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            {/* Application Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {sortedApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">University / Program</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Batch</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Created</th>
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
                                <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <div>
                                <p className="text-sm text-foreground">{app.universityName}</p>
                                <p className="text-xs text-muted-foreground">{app.program} • {app.universityCountry}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              app.batch === 1 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              Batch {app.batch}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-foreground">#{app.priority}</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge variant={statusConfig[app.status].variant}>
                              {statusConfig[app.status].label}
                            </StatusBadge>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="hidden sm:flex gap-1"
                                onClick={() => handleViewApplication(app.id)}
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewApplication(app.id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {app.status === 'draft' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleSubmitToAdmin(app.id)}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit to Admin
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {app.status === 'returned_by_school' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Update & Resubmit
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
                  icon={GraduationCap}
                  title="No applications found"
                  description="Create a new application or adjust your filters"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cards">
            {/* Card View */}
            {sortedApplications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedApplications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer group"
                    onClick={() => handleViewApplication(app.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.studentName} />
                        <div>
                          <p className="font-semibold text-foreground">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        app.batch === 1 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        Batch {app.batch}
                      </span>
                    </div>

                    {/* University Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{app.universityName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{app.program}</span>
                      </div>
                    </div>

                    {/* Priority & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">Priority #{app.priority}</span>
                      <StatusBadge variant={statusConfig[app.status].variant}>
                        {statusConfig[app.status].label}
                      </StatusBadge>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No applications found"
                description="Create a new application or adjust your filters"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default ApplicationManager;
