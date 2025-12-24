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
  const { role } = (() => {
    try {
      // lazy import to avoid circular issues
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
      // simple email regex
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
      // validate payment & receipt
      const errors: Record<string,string> = {};
      if (!convAmount || convAmount <= 0) errors.amount = 'Payment amount is required';
      if (!convReceiptFile) errors.receipt = 'Payment receipt is required';
      if (Object.keys(errors).length > 0) {
        setConvErrors(errors);
        return;
      }

      const newStudent = convertLeadToStudent(selectedLead.id, assignedStaffId);
      if (newStudent) {
        // Record invoice/payment
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

        // Store receipt as document (mock fileUrl using blob URL)
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

        // Show temporary password to staff (generated by context)
        setTempPasswordToShow((newStudent as any).tempPassword || null);
        setConvertedStudentId(newStudent.id);
        // reset conv form (keep dialog open so staff can copy password)
        setConvAmount(50000);
        setConvCurrency('TZS');
        setConvReceiptFile(null);
        setConvErrors({});
      }
    }
    // do not auto-close — show temp password panel
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
                    aria-invalid={!!formErrors.name}
                  />
                  {formErrors.name && <p className="text-xs text-error mt-1">Enter full name</p>}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" value={newLeadForm.email} onChange={(e) => setNewLeadForm(f => ({ ...f, email: e.target.value }))} className="h-9" />
                {formErrors.email && <p className="text-xs text-error mt-1">{formErrors.email}</p>}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" value={newLeadForm.phone} onChange={(e) => setNewLeadForm(f => ({ ...f, phone: e.target.value }))} className="h-9" />
                  {formErrors.phone && <p className="text-xs text-error mt-1">{formErrors.phone}</p>}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="source" className="text-sm">Source</Label>
                  <Select value={newLeadForm.source} onValueChange={(v) => setNewLeadForm(f => ({ ...f, source: v }))}>
                    <SelectTrigger className="h-9">
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
                <div className="col-span-1">
                  <Label htmlFor="studyGoal" className="text-sm">Study Goal</Label>
                  <Select value={newLeadForm.studyGoal} onValueChange={(v) => setNewLeadForm(f => ({ ...f, studyGoal: v }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyGoalOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formErrors.studyGoal && <p className="text-xs text-error mt-1">{formErrors.studyGoal}</p>}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="preferredCountry" className="text-sm">Preferred Country</Label>
                  <Select value={newLeadForm.preferredCountry} onValueChange={(v) => setNewLeadForm(f => ({ ...f, preferredCountry: v }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formErrors.preferredCountry && <p className="text-xs text-error mt-1">{formErrors.preferredCountry}</p>}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="message" className="text-sm">Initial Message</Label>
                  <Textarea id="message" placeholder="Initial message..." value={newLeadForm.message} onChange={(e) => setNewLeadForm(f => ({ ...f, message: e.target.value }))} rows={3} className="resize-none" />
                </div>
              </div>
            </div>
              <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setNewLeadForm({ name: '', email: '', phone: '', source: 'website', studyGoal: '', preferredCountry: '', message: '' }); }}>
                Cancel
              </Button>
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
                logAudit({
                  userId: 'current-user',
                  userName: 'Current User',
                  userRole: 'staff',
                  action: 'Lead Created',
                  details: `Created lead ${lead.name}`,
                  entityType: 'lead',
                  entityId: created.id,
                  isOverride: false,
                });
                setIsAddDialogOpen(false);
                setNewLeadForm({ name: '', email: '', phone: '', source: 'website', studyGoal: '', preferredCountry: '', message: '' });
                setFormErrors({});
                navigate(`/staff/leads/${created.id}`);
              }}>
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
                              {lead.status !== 'converted' && (
                                <DropdownMenuItem onClick={() => handleViewLead(lead.id)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Lead
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleConvertToStudent(lead as LocalLead)}
                                disabled={lead.status === 'converted' || lead.status === 'lost'}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Convert to Student
                              </DropdownMenuItem>
                              {lead.status !== 'converted' && (
                                <DropdownMenuItem className="text-error">Mark as Lost</DropdownMenuItem>
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

              {/* Conversion payment form */}
              {!tempPasswordToShow && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label className="text-sm">Payment Amount</Label>
                    <input
                      type="number"
                      className={`h-9 w-full rounded-md border px-2 col-span-1 ${convErrors.amount ? 'border-error' : 'border-border'}`}
                      value={convAmount}
                      onChange={(e) => setConvAmount(Number(e.target.value))}
                      disabled={role !== 'admin'}
                      aria-invalid={!!convErrors.amount}
                    />
                    <Select value={convCurrency} onValueChange={(v: 'TZS' | 'USD' | 'EUR') => setConvCurrency(v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TZS">TZS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {convErrors.amount && <p className="text-xs text-error">{convErrors.amount}</p>}
                  <p className="text-sm text-muted-foreground mt-1">Formatted: <strong>{convCurrency} {convAmount.toLocaleString('en-US')}</strong></p>

                  <div className="grid grid-cols-1 gap-1">
                    <Label className="text-sm">Payment Receipt</Label>
                    <div className="flex items-center gap-3">
                      {!convReceiptFile ? (
                        <>
                          <label
                            htmlFor="conv-receipt"
                            className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2 cursor-pointer hover:border-primary transition-colors min-w-0 flex-1"
                          >
                            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <div className="text-sm text-muted-foreground truncate">
                              Upload receipt (image or PDF)
                            </div>
                          </label>
                          <input
                            id="conv-receipt"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setConvReceiptFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2 min-w-0 flex-1">
                            <div className="text-sm text-foreground truncate font-medium">{convReceiptFile.name}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setConvReceiptFile(null)}
                            className="text-xs text-error underline"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    {convErrors.receipt && <p className="text-xs text-error">{convErrors.receipt}</p>}
                  </div>
                </div>
              )}

              {/* Temporary password display after conversion */}
              {tempPasswordToShow && (
                <div className="mt-4 rounded-md bg-primary/10 p-3 text-sm">
                  <p className="mb-2"><strong>Temporary password:</strong></p>
                  <div className="flex items-center gap-2">
                          <code className="font-mono text-lg">{tempPasswordToShow}</code>
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        await navigator.clipboard?.writeText(tempPasswordToShow || '');
                        toast({
                          title: 'Copied',
                          description: 'Temporary password copied to clipboard',
                        });
                      } catch {
                        toast({
                          title: 'Copy failed',
                          description: 'Could not copy to clipboard',
                          variant: 'destructive',
                        });
                      }
                    }}>Copy</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This password is shown once — copy and share it securely with the student. The student must change it at first login.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                // if temp password shown, close and navigate; otherwise cancel
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
                {tempPasswordToShow ? 'Done' : 'Cancel'}
              </Button>
              {!tempPasswordToShow && (
                <Button onClick={confirmConversion} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Convert to Student
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
