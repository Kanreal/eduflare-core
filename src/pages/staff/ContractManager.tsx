import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus,
  FileSignature,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  DollarSign,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ContractStatus } from '@/types';

// Extended mock contracts
const mockContractsData = [
  { 
    id: 'con-1', 
    studentId: 'std-1', 
    studentName: 'John Doe', 
    status: 'signed' as ContractStatus, 
    amount: 22500, 
    createdAt: new Date('2024-01-10'), 
    signedAt: new Date('2024-01-12'),
    program: 'Computer Science - Harvard',
  },
  { 
    id: 'con-2', 
    studentId: 'std-2', 
    studentName: 'Sarah Miller', 
    status: 'pending' as ContractStatus, 
    amount: 18000, 
    createdAt: new Date('2024-02-15'),
    program: 'Engineering - MIT',
  },
  { 
    id: 'con-3', 
    studentId: 'std-3', 
    studentName: 'Michael Chen', 
    status: 'draft' as ContractStatus, 
    amount: 25000, 
    createdAt: new Date('2024-03-01'),
    program: 'Business - Stanford',
  },
  { 
    id: 'con-4', 
    studentId: 'std-4', 
    studentName: 'Emily Wilson', 
    status: 'expired' as ContractStatus, 
    amount: 15000, 
    createdAt: new Date('2023-06-01'),
    expiresAt: new Date('2023-12-01'),
    program: 'Law - Yale',
  },
];

const statusVariants: Record<ContractStatus, 'muted' | 'warning' | 'success' | 'error'> = {
  draft: 'muted',
  pending: 'warning',
  pending_signature: 'warning',
  signed: 'success',
  expired: 'error',
  cancelled: 'muted',
};

const ContractManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  const filteredContracts = mockContractsData.filter((contract) => {
    const matchesSearch = contract.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = mockContractsData
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingValue = mockContractsData
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contract Manager</h1>
            <p className="text-muted-foreground mt-1">Create and manage student contracts</p>
          </div>
          <Button className="gap-2" onClick={() => setIsGenerateDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Generate Contract
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Contracts</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{mockContractsData.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Signed Value</p>
            <p className="text-2xl font-bold text-success tabular-nums">${totalValue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Pending Value</p>
            <p className="text-2xl font-bold text-warning tabular-nums">${pendingValue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold text-muted-foreground tabular-nums">
              {mockContractsData.filter(c => c.status === 'draft').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
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
              <SelectItem value="all">All Contracts</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contracts List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {filteredContracts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Program</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContracts.map((contract, index) => (
                    <motion.tr
                      key={contract.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={contract.studentName} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{contract.studentName}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{contract.program}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-foreground">{contract.program}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground tabular-nums flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          {contract.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge variant={statusVariants[contract.status]}>
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </StatusBadge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {contract.signedAt 
                            ? `Signed ${contract.signedAt.toLocaleDateString()}`
                            : `Created ${contract.createdAt.toLocaleDateString()}`
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="hidden sm:flex gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          {contract.status === 'signed' && (
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-1">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Contract</DropdownMenuItem>
                              {contract.status === 'signed' && (
                                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                              )}
                              {contract.status === 'draft' && (
                                <>
                                  <DropdownMenuItem>Edit Contract</DropdownMenuItem>
                                  <DropdownMenuItem>Send for Signing</DropdownMenuItem>
                                </>
                              )}
                              {contract.status === 'pending' && (
                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-error">Void Contract</DropdownMenuItem>
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
              icon={FileSignature}
              title="No contracts found"
              description="Try adjusting your search or filter criteria"
            />
          )}
        </div>

        {/* Generate Contract Dialog */}
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Contract</DialogTitle>
              <DialogDescription>
                Create a new service agreement for a student.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student">Select Student</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="std-1">John Doe</SelectItem>
                    <SelectItem value="std-2">Sarah Miller</SelectItem>
                    <SelectItem value="std-3">Michael Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Contract Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Service Agreement</SelectItem>
                    <SelectItem value="premium">Premium Package</SelectItem>
                    <SelectItem value="basic">Basic Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Contract Value</Label>
                <Input id="amount" type="number" placeholder="Enter amount" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsGenerateDialogOpen(false)} className="gap-2">
                <FileSignature className="w-4 h-4" />
                Generate Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default ContractManager;
