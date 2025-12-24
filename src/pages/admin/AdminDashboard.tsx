import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  FileText,
  BarChart3,
  Unlock,
  Target,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { KPICard, StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { mockKPIData, mockAdmin } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEduFlare } from '@/contexts/EduFlareContext';
import { AdminUnlockReview } from '@/components/UnlockRequestFlow';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getPendingUnlockRequests,
    processUnlockRequest,
    unlockRequests,
    applications,
    students,
    leads
  } = useEduFlare();

  const pendingUnlockRequests = getPendingUnlockRequests();

  // Lead Statistics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const leadsThisMonth = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
  });

  const leadStats = {
    totalLeads: leads.length,
    leadsThisMonth: leadsThisMonth.length,
    hotLeads: leads.filter(l => l.status === 'hot').length,
    newLeads: leads.filter(l => l.status === 'new').length,
    convertedLeads: leads.filter(l => l.status === 'converted').length,
  };

  // Get pending applications from context
  const pendingApplications = applications
    .filter(app => app.status === 'pending_admin')
    .slice(0, 3)
    .map(app => {
      const student = students.find(s => s.id === app.studentId);
      const daysWaiting = app.submittedToAdminAt 
        ? Math.floor((Date.now() - new Date(app.submittedToAdminAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return {
        id: app.id,
        studentName: student?.name || 'Unknown',
        university: app.universityName,
        priority: daysWaiting > 3 ? 'high' : daysWaiting > 1 ? 'medium' : 'low',
        daysWaiting,
      };
    });

  // Mock pending refunds
  const pendingRefunds = [
    { id: 'ref-1', studentName: 'Emily Wilson', amount: 2500, reason: 'Service cancellation' },
    { id: 'ref-2', studentName: 'David Brown', amount: 1000, reason: 'Partial refund' },
  ];

  // Mock revenue data for chart
  const monthlyData = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 78000 },
    { month: 'Apr', revenue: 105000 },
    { month: 'May', revenue: 112000 },
    { month: 'Jun', revenue: 125000 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  const handleApproveUnlock = (requestId: string, adminNotes?: string) => {
    processUnlockRequest(requestId, true, user?.id || 'admin', adminNotes);
  };

  const handleRejectUnlock = (requestId: string, adminNotes?: string) => {
    processUnlockRequest(requestId, false, user?.id || 'admin', adminNotes);
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {mockAdmin.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/audit')}>
              View Audit Logs
            </Button>
            <Button onClick={() => navigate('/admin/applications')}>
              Review Applications
            </Button>
          </div>
        </div>

        {/* Pending Unlock Requests - Priority Section */}
        {pendingUnlockRequests.length > 0 && (
          <AdminUnlockReview
            requests={unlockRequests}
            onApprove={handleApproveUnlock}
            onReject={handleRejectUnlock}
          />
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={`$${(mockKPIData.totalRevenue / 1000).toFixed(0)}K`}
            icon={DollarSign}
            trend={{ value: mockKPIData.monthlyGrowth, isPositive: true }}
            variant="gold"
          />
          <KPICard
            title="Active Students"
            value={mockKPIData.activeStudents.toString()}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <KPICard
            title="Success Rate"
            value={`${mockKPIData.successRate}%`}
            icon={TrendingUp}
            trend={{ value: 2.3, isPositive: true }}
          />
          <KPICard
            title="Pending Applications"
            value={applications.filter(a => a.status === 'pending_admin').length.toString()}
            icon={Clock}
            subtitle="Requires review"
          />
        </div>

        {/* Lead Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Leads"
            value={leadStats.totalLeads.toString()}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <KPICard
            title="This Month"
            value={leadStats.leadsThisMonth.toString()}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
          />
          <KPICard
            title="New Leads"
            value={leadStats.newLeads.toString()}
            icon={Target}
            variant="primary"
          />
          <KPICard
            title="Hot Leads"
            value={leadStats.hotLeads.toString()}
            icon={TrendingUp}
            variant="primary"
          />
          <KPICard
            title="Converted"
            value={leadStats.convertedLeads.toString()}
            icon={CheckCircle}
            variant="success"
          />
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Revenue Overview
              </h2>
              <select className="text-sm bg-muted border-0 rounded-lg px-3 py-1.5 text-foreground">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>This year</option>
              </select>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between gap-3 h-48">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full gradient-primary rounded-t-lg min-h-[20px]"
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total this period</span>
              <span className="font-semibold text-foreground tabular-nums">
                ${monthlyData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </span>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="font-semibold text-foreground mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm text-foreground">Offers Released</span>
                </div>
                <span className="font-bold text-success">24</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="text-sm text-foreground">Awaiting Docs</span>
                </div>
                <span className="font-bold text-warning">18</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-error/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-error" />
                  <span className="text-sm text-foreground">Urgent Actions</span>
                </div>
                <span className="font-bold text-error">5</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-3">
                  <Unlock className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Unlock Requests</span>
                </div>
                <span className="font-bold text-primary">{pendingUnlockRequests.length}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pending Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Applications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-warning" />
                Pending Applications
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/applications')} className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {pendingApplications.length > 0 ? (
                pendingApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                  >
                    <Avatar name={app.studentName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{app.studentName}</p>
                      <p className="text-xs text-muted-foreground">{app.university}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge 
                        variant={app.priority === 'high' ? 'error' : app.priority === 'medium' ? 'warning' : 'muted'}
                      >
                        {app.priority}
                      </StatusBadge>
                      <p className="text-xs text-muted-foreground mt-1">{app.daysWaiting}d waiting</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p>No pending applications</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pending Refunds */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-error" />
                Pending Refunds
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/financials')} className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {pendingRefunds.map((refund) => (
                <div
                  key={refund.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Avatar name={refund.studentName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{refund.studentName}</p>
                    <p className="text-xs text-muted-foreground">{refund.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-error tabular-nums">${refund.amount.toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
                      <Button size="sm" className="h-7 text-xs">Approve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;