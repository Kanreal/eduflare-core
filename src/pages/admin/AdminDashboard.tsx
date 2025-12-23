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
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { KPICard, StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { mockKPIData, mockAdmin } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock pending applications
  const pendingApplications = [
    { id: 'app-1', studentName: 'John Doe', university: 'Harvard University', priority: 'high', daysWaiting: 2 },
    { id: 'app-2', studentName: 'Sarah Miller', university: 'MIT', priority: 'medium', daysWaiting: 5 },
    { id: 'app-3', studentName: 'Michael Chen', university: 'Stanford', priority: 'low', daysWaiting: 1 },
  ];

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
            value={mockKPIData.pendingApplications.toString()}
            icon={Clock}
            subtitle="Requires review"
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
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">New Enrollments</span>
                </div>
                <span className="font-bold text-primary">12</span>
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
              {pendingApplications.map((app) => (
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
              ))}
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
