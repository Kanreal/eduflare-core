import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MoreVertical,
  UserPlus,
  ArrowUpRight,
  Calendar,
  Eye,
  Edit,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { LeadStatus } from '@/types';

// Local lead type for this component's mock data
interface LocalLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  createdAt: Date;
  lastContactAt?: Date;
  assignedTo?: string;
}

const getStatusVariant = (status: string): 'primary' | 'error' | 'muted' | 'success' => {
  switch (status) {
    case 'new': return 'primary';
    case 'hot': return 'error';
    case 'converted': return 'success';
    default: return 'muted';
  }
};

const LeadManager: React.FC = () => {
  const navigate = useNavigate();
  const { leads, convertLeadToStudent, staff, logAudit } = useEduFlare();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LocalLead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewLead = (leadId: string) => {
    navigate(`/staff/leads/${leadId}`);
  };

  const handleConvertToStudent = (lead: LocalLead) => {
    setSelectedLead(lead);
    setIsConvertDialogOpen(true);
  };

  const confirmConversion = () => {
    if (!selectedLead) return;
    const assignedStaffId = selectedLead.assignedTo || staff[0]?.id;
    if (assignedStaffId) {
      const newStudent = convertLeadToStudent(selectedLead.id, assignedStaffId);
      if (newStudent) {
        logAudit({
          userId: 'current-user',
          userName: 'Current User',
          userRole: 'staff',
          action: 'Lead Converted',
          details: `Converted lead ${selectedLead.name} to student`,
          entityType: 'lead',
          entityId: selectedLead.id,
          isOverride: false,
        });
        navigate(`/staff/students/${newStudent.id}`);
      }
    }
    setIsConvertDialogOpen(false);
  };

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Manager</h1>
            <p className="text-muted-foreground mt-1">Track and manage your prospective students</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Enter the contact information for your new lead.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Add Lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: leads.length, color: 'text-foreground' },
            { label: 'New', value: leads.filter(l => l.status === 'new').length, color: 'text-primary' },
            { label: 'Hot', value: leads.filter(l => l.status === 'hot').length, color: 'text-error' },
            { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, color: 'text-success' },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Lead List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Lead</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Source</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Last Contact</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={lead.name} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <p className="text-sm text-foreground flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {lead.email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-sm text-foreground">{lead.source}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge variant={getStatusVariant(lead.status)}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </StatusBadge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {lead.lastContactAt?.toLocaleDateString() || 'Never'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="hidden sm:flex gap-1"
                            onClick={() => handleViewLead(lead.id)}
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="hidden md:flex gap-1"
                            onClick={() => handleConvertToStudent(lead as LocalLead)}
                            disabled={lead.status === 'converted' || lead.status === 'lost'}
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Convert
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleConvertToStudent(lead as LocalLead)}
                                disabled={lead.status === 'converted' || lead.status === 'lost'}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Convert to Student
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-error">Mark as Lost</DropdownMenuItem>
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
              icon={UserPlus}
              title="No leads found"
              description={searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search or filter criteria" 
                : "Start by adding your first lead"}
              action={!searchQuery && statusFilter === 'all' ? {
                label: 'Add Lead',
                onClick: () => setIsAddDialogOpen(true),
              } : undefined}
            />
          )}
        </div>

        {/* Convert to Student Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert Lead to Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to convert <strong>{selectedLead?.name}</strong> to a student? 
                This will create a new student profile and generate a contract.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedLead?.name || ''} />
                  <div>
                    <p className="font-medium text-foreground">{selectedLead?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedLead?.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmConversion} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Convert to Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default LeadManager;
