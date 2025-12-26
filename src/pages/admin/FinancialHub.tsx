import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  Eye,
  FileText,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, EmptyState } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { formatCurrency } from '@/lib/constants';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { format } from 'date-fns';

// Mock transactions
const mockTransactions = [
  { id: 'tx-1', type: 'payment', amount: 5000, currency: 'USD', description: 'Consultation Fee', studentName: 'John Doe', status: 'completed', createdAt: new Date('2024-03-15') },
  { id: 'tx-2', type: 'payment', amount: 15000, currency: 'USD', description: 'Application Processing Fee', studentName: 'Sarah Miller', status: 'completed', createdAt: new Date('2024-03-14') },
  { id: 'tx-3', type: 'refund', amount: 2500, currency: 'USD', description: 'Partial Refund', studentName: 'Emily Wilson', status: 'pending', createdAt: new Date('2024-03-13') },
  { id: 'tx-4', type: 'payment', amount: 8000, currency: 'USD', description: 'Document Verification', studentName: 'Michael Chen', status: 'completed', createdAt: new Date('2024-03-12') },
  { id: 'tx-5', type: 'refund', amount: 5000, currency: 'USD', description: 'Service Cancellation', studentName: 'David Brown', status: 'pending', createdAt: new Date('2024-03-11') },
];

// Mock lead payments
const mockLeadPayments = [
  { id: 'tx-lead-1', type: 'lead_payment', amount: 50000, currency: 'TZS', description: 'Opening Book Fee', studentName: 'John Doe', status: 'completed', createdAt: new Date('2024-03-20') },
  { id: 'tx-lead-2', type: 'lead_payment', amount: 75000, currency: 'TZS', description: 'Consultation Fee', studentName: 'Sarah Miller', status: 'completed', createdAt: new Date('2024-03-18') },
  { id: 'tx-lead-3', type: 'lead_payment', amount: 150, currency: 'USD', description: 'Opening Book Fee', studentName: 'Michael Chen', status: 'completed', createdAt: new Date('2024-03-15') },
];

// Combine all transactions
const allTransactions = [...mockTransactions, ...mockLeadPayments];

// Mock refund requests
const mockRefundRequests = [
  { id: 'ref-1', studentName: 'Emily Wilson', amount: 2500, reason: 'Changed university plans', requestedAt: new Date('2024-03-13'), originalPayment: 'INV-2024-002' },
  { id: 'ref-2', studentName: 'David Brown', amount: 5000, reason: 'Service cancellation - visa denied', requestedAt: new Date('2024-03-11'), originalPayment: 'INV-2024-005' },
  { id: 'ref-3', studentName: 'Lisa Chen', amount: 1500, reason: 'Duplicate payment correction', requestedAt: new Date('2024-03-10'), originalPayment: 'INV-2024-008' },
];

// Mock commission payroll
const mockCommissions = [
  { id: 'com-1', staffName: 'Sarah Johnson', students: 8, totalEarned: 12500, pendingAmount: 3200, status: 'partial' },
  { id: 'com-2', staffName: 'Tom Wilson', students: 5, totalEarned: 7800, pendingAmount: 0, status: 'paid' },
  { id: 'com-3', staffName: 'Maria Garcia', students: 6, totalEarned: 9400, pendingAmount: 2100, status: 'partial' },
];

const FinancialHub: React.FC = () => {
  const { invoices, students, staff } = useEduFlare();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<typeof mockRefundRequests[0] | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // Filter transactions based on search, type, status, and date
  const filteredTransactions = useMemo(() => {
    return invoices.filter(invoice => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.studentName.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = typeFilter === 'all' || invoice.type === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const invoiceDate = invoice.paidAt || invoice.dueDate;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateFilter) {
          case 'today':
            const invoiceDay = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate());
            matchesDate = invoiceDay.getTime() === today.getTime();
            break;
          case 'thisWeek':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = invoiceDate >= weekAgo;
            break;
          case 'thisMonth':
            matchesDate = invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
            break;
          case 'lastMonth':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            matchesDate = invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear;
            break;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [invoices, searchQuery, typeFilter, statusFilter, dateFilter]);

  // Calculate summary metrics from filtered transactions
  const summaryMetrics = useMemo(() => {
    const totalRevenue = filteredTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = filteredTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      pendingAmount,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const totalRevenue = invoices
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingRefunds = invoices
    .filter(t => t.type === 'refund' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleApproveRefund = (refund: typeof mockRefundRequests[0]) => {
    setSelectedRefund(refund);
    setIsApproveDialogOpen(true);
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Hub</h1>
            <p className="text-muted-foreground mt-1">Manage transactions, refunds, and commissions</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
                  ${summaryMetrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-warning tabular-nums mt-1">
                  ${summaryMetrics.pendingAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-primary tabular-nums mt-1">
                  {summaryMetrics.transactionCount}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opening Book Fees</p>
                <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
                  {invoices.filter(i => i.type === 'opening_book' && i.status === 'paid').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gold/10">
                <FileText className="w-5 h-5 text-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
            <TabsTrigger value="commissions">Commission Payroll</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="opening_book">Opening Book</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="balance">Balance</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Student</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                <tbody className="divide-y divide-border">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((invoice, index) => {
                          const getTypeDisplay = (type: string) => {
                            switch (type) {
                              case 'opening_book': return 'Opening Book';
                              case 'deposit': return 'Deposit';
                              case 'balance': return 'Balance Payment';
                              case 'refund': return 'Refund';
                              default: return type;
                            }
                          };

                          return (
                            <motion.tr
                              key={invoice.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  invoice.type !== 'refund' ? 'bg-success/10' : 'bg-error/10'
                                }`}>
                                  {invoice.type !== 'refund' ? (
                                    <ArrowDownLeft className="w-4 h-4 text-success" />
                                  ) : (
                                    <ArrowUpRight className="w-4 h-4 text-error" />
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p className="font-medium text-foreground">{getTypeDisplay(invoice.type)}</p>
                                  <p className="text-xs text-muted-foreground">{invoice.description}</p>
                                </div>
                              </td>
                              <td className="p-4 hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <Avatar name={invoice.studentName} size="sm" />
                                  <span className="text-sm text-foreground">{invoice.studentName}</span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`font-semibold tabular-nums ${
                                  invoice.type !== 'refund' ? 'text-success' : 'text-error'
                                }`}>
                                  {invoice.type !== 'refund' ? '+' : '-'}
                                  {invoice.currency === 'TZS' ? 'TZS ' : '$'}{invoice.amount.toLocaleString()}
                                </span>
                              </td>
                              <td className="p-4">
                                <StatusBadge variant={
                                  invoice.status === 'paid' ? 'success' :
                                  invoice.status === 'pending' ? 'warning' :
                                  invoice.status === 'overdue' ? 'error' : 'muted'
                                }>
                                  {invoice.status}
                                </StatusBadge>
                              </td>
                              <td className="p-4 hidden lg:table-cell">
                                <span className="text-sm text-muted-foreground">
                                  {invoice.paidAt ? format(invoice.paidAt, 'MMM d, yyyy') : format(invoice.dueDate, 'MMM d, yyyy')}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <Drawer>
                                  <DrawerTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedTransaction(invoice)}
                                      className="gap-1"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Details
                                    </Button>
                                  </DrawerTrigger>
                                  <DrawerContent>
                                    <DrawerHeader>
                                      <DrawerTitle>Transaction Details</DrawerTitle>
                                      <DrawerDescription>
                                        Complete audit information for this transaction
                                      </DrawerDescription>
                                    </DrawerHeader>
                                    <div className="p-6 space-y-6">
                                      <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Transaction Info</h4>
                                            <div className="space-y-2">
                                              <div className="flex justify-between">
                                                <span className="text-sm">Type:</span>
                                                <span className="font-medium">{getTypeDisplay(invoice.type)}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-sm">Status:</span>
                                                <StatusBadge variant={
                                                  invoice.status === 'paid' ? 'success' :
                                                  invoice.status === 'pending' ? 'warning' :
                                                  invoice.status === 'overdue' ? 'error' : 'muted'
                                                } size="sm">
                                                  {invoice.status}
                                                </StatusBadge>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-sm">Amount:</span>
                                                <span className="font-medium tabular-nums">
                                                  {invoice.currency === 'TZS' ? 'TZS ' : '$'}{invoice.amount.toLocaleString()}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-sm">Date:</span>
                                                <span className="font-medium">
                                                  {invoice.paidAt ? format(invoice.paidAt, 'PPP') : format(invoice.dueDate, 'PPP')}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Audit Information</h4>
                                            <div className="space-y-2">
                                              <div className="flex justify-between items-center">
                                                <span className="text-sm">Created By:</span>
                                                <div className="flex items-center gap-2">
                                                  {invoice.createdBy && (
                                                    <Avatar name={invoice.createdByName || 'Unknown'} size="sm" />
                                                  )}
                                                  <span className="font-medium text-sm">
                                                    {invoice.createdByName || 'Unknown Staff'}
                                                  </span>
                                                </div>
                                              </div>
                                              {invoice.receiptFileName && (
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">Receipt:</span>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(invoice.receiptFileUrl, '_blank')}
                                                    className="gap-1"
                                                  >
                                                    <FileText className="w-3 h-3" />
                                                    {invoice.receiptFileName}
                                                  </Button>
                                                </div>
                                              )}
                                              <div className="flex justify-between">
                                                <span className="text-sm">Reference:</span>
                                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                  {invoice.id.slice(-8).toUpperCase()}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </DrawerContent>
                                </Drawer>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No transactions found matching your filters.
                          </td>
                        </tr>
                      )}
                </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {mockRefundRequests.length > 0 ? (
                <div className="grid gap-4">
                  {mockRefundRequests.map((refund, index) => (
                    <motion.div
                      key={refund.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border border-border bg-card p-5 shadow-card"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar name={refund.studentName} />
                          <div>
                            <p className="font-semibold text-foreground">{refund.studentName}</p>
                            <p className="text-sm text-muted-foreground mt-1">{refund.reason}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Ref: {refund.originalPayment}</span>
                              <span>Requested: {refund.requestedAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-error tabular-nums">
                              ${refund.amount.toLocaleString()}
                            </p>
                            <StatusBadge variant="warning">Pending</StatusBadge>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleApproveRefund(refund)} className="gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-error border-error/30">
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="No pending refunds"
                  description="All refund requests have been processed"
                />
              )}
            </motion.div>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Staff Member</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Students</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total Earned</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Pending</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockCommissions.map((comm, index) => (
                      <motion.tr
                        key={comm.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={comm.staffName} size="sm" />
                            <span className="font-medium text-foreground">{comm.staffName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-foreground tabular-nums">{comm.students}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-foreground tabular-nums">
                            ${comm.totalEarned.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`font-semibold tabular-nums ${
                            comm.pendingAmount > 0 ? 'text-warning' : 'text-muted-foreground'
                          }`}>
                            ${comm.pendingAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge variant={comm.status === 'paid' ? 'success' : 'warning'}>
                            {comm.status === 'paid' ? 'Paid' : 'Partial'}
                          </StatusBadge>
                        </td>
                        <td className="p-4 text-right">
                          {comm.pendingAmount > 0 && (
                            <Button size="sm" className="gap-1">
                              <DollarSign className="w-4 h-4" />
                              Pay
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Approve Refund Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Approve Refund
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this refund request?
              </DialogDescription>
            </DialogHeader>
            {selectedRefund && (
              <div className="py-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Student</span>
                    <span className="font-medium text-foreground">{selectedRefund.studentName}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-bold text-error tabular-nums">${selectedRefund.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reason</span>
                    <span className="text-sm text-foreground">{selectedRefund.reason}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsApproveDialogOpen(false)} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Approve Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default FinancialHub;
