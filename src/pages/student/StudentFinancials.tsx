import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileSignature, Download, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import { mockInvoices, mockContracts } from '@/lib/constants';

const StudentFinancials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'contracts'>('invoices');
  const invoices = mockInvoices;
  const contracts = mockContracts;

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const totalPending = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getInvoiceStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { variant: 'success' as const, icon: CheckCircle };
      case 'overdue':
        return { variant: 'error' as const, icon: AlertCircle };
      default:
        return { variant: 'warning' as const, icon: Clock };
    }
  };

  return (
    <PortalLayout portal="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Financials</h1>
          <p className="text-muted-foreground mt-1">
            View your invoices and contracts
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-success font-mono">
                  ${totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-2xl font-bold text-warning font-mono">
                  ${totalPending.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 border-b border-border"
        >
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invoices'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'contracts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            Contracts
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'invoices' && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const statusConfig = getInvoiceStatusConfig(invoice.status);
                    return (
                      <tr key={invoice.id}>
                        <td className="font-mono text-sm">{invoice.id}</td>
                        <td>{invoice.description}</td>
                        <td className="text-muted-foreground">
                          {invoice.dueDate.toLocaleDateString()}
                        </td>
                        <td className="text-right font-mono font-semibold">
                          ${invoice.amount.toLocaleString()}
                        </td>
                        <td>
                          <StatusBadge variant={statusConfig.variant} icon={statusConfig.icon}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-card rounded-xl border border-border p-6 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Service Agreement</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Contract ID: {contract.id}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-2xl font-bold text-foreground font-mono">
                          ${contract.amount.toLocaleString()}
                        </span>
                        <StatusBadge
                          variant={contract.status === 'signed' ? 'success' : 'warning'}
                          icon={contract.status === 'signed' ? CheckCircle : Clock}
                        >
                          {contract.status === 'signed' ? 'Signed' : 'Pending Signature'}
                        </StatusBadge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>
                      {contract.status === 'signed' && (
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>

                  {contract.signedAt && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Signed on {contract.signedAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {contract.status !== 'signed' && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <button className="w-full py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity">
                        Sign Contract Digitally
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentFinancials;
