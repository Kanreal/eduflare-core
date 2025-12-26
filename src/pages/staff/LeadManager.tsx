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
  User,
  Flame,
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, EmptyState } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { studyGoalOptions, countryOptions } from '@/lib/constants';
import { LeadStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
  const { leads, convertLeadToStudent, staff, logAudit, addLead, createInvoice, addDocument } = useEduFlare();
  const { toast } = useToast();
  // Safe role check avoiding circular dependencies if necessary
  const { role } = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const auth = require('@/contexts/AuthContext') as any;
      return auth.useAuth();
    } catch {
      return { role: null };
    }
  })();

  const [convAmount, setConvAmount] = useState<number>(50000);
  const [convCurrency, setConvCurrency] = useState<'TZS' | 'USD' | 'EUR'>('TZS');
  const [convReceiptFile, setConvReceiptFile] = useState<File | null>(null);
  const [screeningData, setScreeningData] = useState({ nationality: '', dob: '' });
  const [convErrors, setConvErrors] = useState<Record<string,string>>({});
  const [tempPasswordToShow, setTempPasswordToShow] = useState<string | null>(null);
  const [convertedStudentId, setConvertedStudentId] = useState<string | null>(null);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    studyGoal: '',
    preferredCountry: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateNewLead = () => {
    const errors: Record<string, string> = {};
    if (!newLeadForm.name.trim()) errors.name = 'Full name is required';
    if (!newLeadForm.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(newLeadForm.email)) errors.email = 'Enter a valid email';
    }
    if (!newLeadForm.phone.trim()) errors.phone = 'Phone is required';
    if (!newLeadForm.studyGoal) errors.studyGoal = 'Study goal is required';
    if (!newLeadForm.preferredCountry) errors.preferredCountry = 'Preferred country is required';
    if (!newLeadForm.source) errors.source = 'Source is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
      const errors: Record<string,string> = {};
      if (!convAmount || convAmount <= 0) errors.amount = 'Payment amount is required';
      if (!convReceiptFile) errors.receipt = 'Payment receipt is required';
      if (!screeningData.nationality) errors.nationality = 'Nationality is required'; 
      
      if (Object.keys(errors).length > 0) {
        setConvErrors(errors);
        return;
      }

      const newStudent = convertLeadToStudent(selectedLead.id, assignedStaffId);
      if (newStudent) {
        createInvoice({
          studentId: newStudent.id,
          studentName: newStudent.name,
          type: 'opening_book',
          amount: convAmount,
          currency: convCurrency,
          status: 'paid',
          dueDate: new Date(),
          paidAt: new Date(),
          description: 'Opening Book / Consultation Fee',
          isReversal: false,
        });

        const fileUrl = window.URL.createObjectURL(convReceiptFile as File);
        addDocument({
          name: `Opening Book Receipt - ${newStudent.name}`,
          type: 'other',
          status: 'verified',
          uploadedAt: new Date(),
          verifiedAt: new Date(),
          studentId: newStudent.id,
          isLocked: false,
          isHidden: false,
          fileUrl,
        });

        logAudit({
          userId: 'current-user',
          userName: 'Current User',
          userRole: 'staff',
          action: 'Lead Converted',
          details: `Converted lead ${selectedLead.name} to student; Opening Book paid ${convAmount}`,
          entityType: 'lead',
          entityId: selectedLead.id,
          isOverride: false,
        });

        setTempPasswordToShow((newStudent as any).tempPassword || null);
        setConvertedStudentId(newStudent.id);
        setConvAmount(50000);
        setConvCurrency('TZS');
        setConvReceiptFile(null);
        setScreeningData({ nationality: '', dob: '' });
        setConvErrors({});
      }
    }
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
              <Button className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>
                  Enter the contact information for your new lead.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newLeadForm.name}
                      onChange={(e) => setNewLeadForm(f => ({ ...f, name: e.target.value }))}
                      className={`h-9 ${formErrors.name ? 'border-error focus:ring-error' : ''}`}
                    />
                    {formErrors.name && <p className="text-xs text-error mt-1">Required</p>}
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email" value={newLeadForm.email} onChange={(e) => setNewLeadForm(f => ({ ...f, email: e.target.value }))} className="h-9" />
                    {formErrors.email && <p className="text-xs text-error mt-1">{formErrors.email}</p>}
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input id="phone" placeholder="Enter phone" value={newLeadForm.phone} onChange={(e) => setNewLeadForm(f => ({ ...f, phone: e.target.value }))} className="h-9" />
                    {formErrors.phone && <p className="text-xs text-error mt-1">Required</p>}
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="source" className="text-sm">Source</Label>
                    <Select value={newLeadForm.source} onValueChange={(v) => setNewLeadForm(f => ({ ...f, source: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="studyGoal" className="text-sm">Study Goal</Label>
                    <Select value={newLeadForm.studyGoal} onValueChange={(v) => setNewLeadForm(f => ({ ...f, studyGoal: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {studyGoalOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {formErrors.studyGoal && <p className="text-xs text-error mt-1">Required</p>}
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="preferredCountry" className="text-sm">Country</Label>
                    <Select value={newLeadForm.preferredCountry} onValueChange={(v) => setNewLeadForm(f => ({ ...f, preferredCountry: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {countryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {formErrors.preferredCountry && <p className="text-xs text-error mt-1">Required</p>}
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="message" className="text-sm">Initial Message</Label>
                    <Textarea id="message" placeholder="Optional notes..." value={newLeadForm.message} onChange={(e) => setNewLeadForm(f => ({ ...f, message: e.target.value }))} rows={3} className="resize-none" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setNewLeadForm({ name: '', email: '', phone: '', source: 'website', studyGoal: '', preferredCountry: '', message: '' }); }}>Cancel</Button>
                <Button onClick={() => {
                  if (!validateNewLead()) return;
                  const lead = {
                    name: newLeadForm.name.trim(),
                    email: newLeadForm.email.trim(),
                    phone: newLeadForm.phone.trim(),
                    source: newLeadForm.source as any,
                    studyGoal: newLeadForm.studyGoal as any,
                    preferredCountry: newLeadForm.preferredCountry as any,
                    message: newLeadForm.message.trim(),
                    status: 'new' as any,
                  };
                  const created = addLead(lead);
                  logAudit({ userId: 'current-user', userName: 'Current User', userRole: 'staff', action: 'Lead Created', details: `Created lead ${lead.name}`, entityType: 'lead', entityId: created.id, isOverride: false });
                  setIsAddDialogOpen(false);
                  setNewLeadForm({ name: '', email: '', phone: '', source: 'website', studyGoal: '', preferredCountry: '', message: '' });
                  setFormErrors({});
                  navigate(`/staff/leads/${created.id}`);
                }}>Add Lead</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'New Leads', value: leads.filter(l => l.status === 'new').length, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: 'Hot Leads', value: leads.filter(l => l.status === 'hot').length, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`rounded-xl border ${stat.border} ${stat.bg} p-4 flex items-center justify-between shadow-sm transition-all hover:shadow-md`}>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color} tabular-nums mt-1`}>{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/60">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-muted/30">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lead List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lead Details</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Contact Info</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Source</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Last Contact</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={lead.name} size="sm" />
                          <div>
                            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{lead.name}</p>
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
                        <span className="text-sm text-foreground capitalize bg-muted/50 px-2 py-1 rounded border border-border/50">{lead.source}</span>
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
                            className="hidden sm:flex gap-1 h-8"
                            onClick={() => handleViewLead(lead.id)}
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="hidden md:flex gap-1 h-8 bg-primary/90 hover:bg-primary"
                            onClick={() => handleConvertToStudent(lead as LocalLead)}
                            disabled={lead.status === 'converted' || lead.status === 'lost'}
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Convert
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              {lead.status !== 'converted' && (
                                <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Lead
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleConvertToStudent(lead as LocalLead)}
                                disabled={lead.status === 'converted' || lead.status === 'lost'}
                              >
                                <UserPlus className="w-4 h-4 mr-2" /> Convert to Student
                              </DropdownMenuItem>
                              {lead.status !== 'converted' && (
                                <DropdownMenuItem className="text-error focus:text-error">Mark as Lost</DropdownMenuItem>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Convert Lead to Student</DialogTitle>
              <DialogDescription>
                Convert <strong>{selectedLead?.name}</strong> to a Student. This action requires the "Opening Book" payment.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3 mb-4">
                <Avatar name={selectedLead?.name || ''} size="sm" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">{selectedLead?.name}</p>
                  <p className="text-muted-foreground">{selectedLead?.email}</p>
                </div>
              </div>

              {!tempPasswordToShow && (
                <div className="grid grid-cols-1 gap-4">
                  {/* Screening Data */}
                  <div className="border-b border-border pb-4 mb-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <User className="w-3 h-3" /> Screening Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Nationality <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(v) => setScreeningData(p => ({...p, nationality: v}))}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tanzanian">Tanzanian</SelectItem>
                                    <SelectItem value="Kenyan">Kenyan</SelectItem>
                                    <SelectItem value="Ugandan">Ugandan</SelectItem>
                                </SelectContent>
                            </Select>
                            {convErrors.nationality && <p className="text-xs text-error">{convErrors.nationality}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input type="date" className="h-8" onChange={(e) => setScreeningData(p => ({...p, dob: e.target.value}))} />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="col-span-2">
                        <Label className="text-xs mb-1 block">Amount</Label>
                        <Input type="number" className={`h-9 ${convErrors.amount ? 'border-error' : ''}`} value={convAmount} onChange={(e) => setConvAmount(Number(e.target.value))} disabled={role !== 'admin'} />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Currency</Label>
                        <Select value={convCurrency} onValueChange={(v: 'TZS' | 'USD' | 'EUR') => setConvCurrency(v)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="TZS">TZS</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    {convErrors.amount && <p className="text-xs text-error">{convErrors.amount}</p>}

                    <div className="space-y-1.5">
                      <Label className="text-xs">Receipt Proof <span className="text-red-500">*</span></Label>
                      <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${convErrors.receipt ? 'border-error bg-error/5' : 'border-border hover:bg-muted/50 hover:border-primary/50'}`}>
                        <input type="file" id="conv-receipt" className="hidden" accept="image/*,application/pdf" onChange={(e) => setConvReceiptFile(e.target.files ? e.target.files[0] : null)} />
                        <label htmlFor="conv-receipt" className="cursor-pointer w-full flex flex-col items-center">
                          {convReceiptFile ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-success mb-1" />
                              <span className="text-xs font-medium text-success truncate max-w-[200px]">{convReceiptFile.name}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">Click to upload receipt</span>
                            </>
                          )}
                        </label>
                      </div>
                      {convErrors.receipt && <p className="text-xs text-error">{convErrors.receipt}</p>}
                    </div>
                  </div>
                </div>
              )}

              {tempPasswordToShow && (
                <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-1">Conversion Successful!</h3>
                  <p className="text-xs text-green-800 mb-4">Student account created.</p>
                  
                  <div className="bg-white border border-green-200 rounded p-3 mb-2 flex items-center justify-between gap-2">
                    <div className="text-left">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Temp Password</p>
                        <code className="font-mono font-bold text-lg text-foreground">{tempPasswordToShow}</code>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={async () => {
                      try { await navigator.clipboard?.writeText(tempPasswordToShow || ''); toast({ title: 'Copied' }); } catch {}
                    }}>Copy</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Share this password securely with the student.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                if (tempPasswordToShow && convertedStudentId) {
                  setIsConvertDialogOpen(false);
                  const sid = convertedStudentId;
                  setTempPasswordToShow(null);
                  setConvertedStudentId(null);
                  navigate(`/staff/students/${sid}`);
                } else {
                  setIsConvertDialogOpen(false);
                }
              }}>
                {tempPasswordToShow ? 'Close' : 'Cancel'}
              </Button>
              {!tempPasswordToShow && (
                <Button onClick={confirmConversion} className="gap-2 bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4" /> Convert to Student
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default LeadManager;