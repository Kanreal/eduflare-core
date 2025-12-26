import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  PenTool,
  ChevronDown,
  ChevronUp,
  Landmark,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockInvoices, mockContracts } from '@/lib/constants';

// --- Types ---
type ScholarshipType = 'Self-Support' | 'Partial B' | 'Partial A' | 'Full B' | 'Full A';

// --- Mock Data Extension for Breakdown ---
const financialSnapshot = {
  scholarshipType: 'Partial B' as ScholarshipType,
  totalServiceFee: 1250,
  depositPaid: 750,
  creditApplied: 500, // The $500 from the $750 deposit
  retainedCost: 250,  // The non-refundable part
  finalBalance: 750,
};

const StudentFinancials: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Filter for current student
  const studentInvoices = mockInvoices.filter(inv => inv.studentId === '1');
  const studentContracts = mockContracts.filter(con => con.studentId === '1');

  const totalPaid = studentInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const totalDue = studentInvoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <PortalLayout portal="student">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Center</h1>
            <p className="text-muted-foreground mt-1">
              Manage payments, invoices, and service agreements
            </p>
          </div>
          {totalDue > 0 && (
            <Button onClick={() => setIsPaymentModalOpen(true)} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <CreditCard className="w-4 h-4 mr-2" /> Make Payment
            </Button>
          )}
        </motion.div>

        {/* Financial Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="card-elevated border-l-4 border-l-success">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Paid</p>
                  <p className="text-3xl font-bold font-mono mt-1 text-success">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`card-elevated border-l-4 ${totalDue > 0 ? 'border-l-warning' : 'border-l-muted'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Outstanding Balance</p>
                  <p className={`text-3xl font-bold font-mono mt-1 ${totalDue > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                    ${totalDue.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${totalDue > 0 ? 'bg-warning/10' : 'bg-muted'}`}>
                  <Clock className={`w-6 h-6 ${totalDue > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-elevated border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Active Contracts</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{studentContracts.filter(c => c.status === 'signed').length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Breakdown Accordion (Critical for Transparency) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="overflow-hidden border-primary/20">
            <div 
              className="p-4 bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Fee Structure Breakdown ({financialSnapshot.scholarshipType})</span>
              </div>
              {showBreakdown ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
            </div>
            
            {showBreakdown && (
              <CardContent className="p-0">
                <div className="bg-muted/10 p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Service Fee ({financialSnapshot.scholarshipType})</span>
                    <span className="font-mono font-medium">${financialSnapshot.totalServiceFee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Initial Deposit Paid</span>
                    <span className="font-mono font-medium text-success">-${financialSnapshot.depositPaid}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-muted">
                    <span className="text-muted-foreground italic">↳ Less Non-Refundable Retainer</span>
                    <span className="font-mono text-muted-foreground">+${financialSnapshot.retainedCost}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-green-200">
                    <span className="text-green-700 font-medium">↳ Credit Applied to Balance</span>
                    <span className="font-mono font-bold text-green-700">-${financialSnapshot.creditApplied}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center text-base font-bold">
                    <span>Final Balance Due</span>
                    <span>${financialSnapshot.finalBalance}</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="invoices" className="gap-2">
                <CreditCard className="w-4 h-4" /> Invoices
              </TabsTrigger>
              <TabsTrigger value="contracts" className="gap-2">
                <FileText className="w-4 h-4" /> Contracts
              </TabsTrigger>
            </TabsList>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>A history of all generated invoices and payments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Invoice #</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {studentInvoices.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No invoices found.</td></tr>
                        ) : (
                          studentInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3 font-mono font-medium">{invoice.id}</td>
                              <td className="px-4 py-3">{invoice.description}</td>
                              <td className="px-4 py-3">{invoice.dueDate.toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-mono font-semibold">${invoice.amount.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <StatusBadge variant={
                                  invoice.status === 'paid' ? 'success' :
                                  invoice.status === 'overdue' ? 'error' : 'warning'
                                }>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </StatusBadge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" title="View Details">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" title="Download PDF">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts">
              <div className="space-y-4">
                {studentContracts.length === 0 ? (
                   <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                     <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                     <p className="text-muted-foreground">No service agreements generated yet.</p>
                   </div>
                ) : (
                  studentContracts.map((contract) => (
                    <Card key={contract.id} className="card-elevated hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              contract.status === 'signed' ? 'bg-success/10' : 'bg-warning/10'
                            }`}>
                              <FileText className={`w-6 h-6 ${
                                contract.status === 'signed' ? 'text-success' : 'text-warning'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-lg">Study Abroad Service Agreement</h4>
                                <StatusBadge variant={contract.status === 'signed' ? 'success' : 'warning'}>
                                  {contract.status === 'signed' ? 'Signed' : 'Pending Signature'}
                                </StatusBadge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {contract.status === 'signed' 
                                  ? `Signed on ${contract.signedAt?.toLocaleDateString()}` 
                                  : `Created on ${contract.createdAt.toLocaleDateString()}`
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Button variant="outline" className="gap-2">
                              <Eye className="w-4 h-4" /> View
                            </Button>
                            {contract.status === 'signed' ? (
                              <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                              </Button>
                            ) : (
                              <Button className="gap-2 bg-primary hover:bg-primary/90">
                                <PenTool className="w-4 h-4" /> Sign Digitally
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Payment Modal (Bank Transfer / Receipt Upload) */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" /> Payment Instructions
              </DialogTitle>
              <DialogDescription>
                Please transfer the outstanding amount to the bank account below and upload your proof of payment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="p-4 bg-muted rounded-lg border">
                <p className="text-xs text-muted-foreground uppercase mb-1">Bank Name</p>
                <p className="font-medium">CRDB Bank Tanzania</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Account Number</p>
                    <p className="font-mono font-bold">0150394857300</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Account Name</p>
                    <p className="font-medium">EduFlare Consultancy</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                   <p className="text-xs text-muted-foreground uppercase mb-1">Reference / Memo</p>
                   <p className="font-mono font-bold text-primary">INV-{studentInvoices[0]?.id || '001'} / Student ID 1</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/20 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Upload Payment Receipt</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG or PNG (Max 5MB)</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Close</Button>
              <Button onClick={() => setIsPaymentModalOpen(false)}>Submit Receipt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PortalLayout>
  );
};

export default StudentFinancials;