import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  FileSignature, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ArrowRight,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { KPICard, StatusBadge, Avatar } from '@/components/ui/EduFlareUI';
import { mockLeads, mockStaff } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data for tasks
  const tasks = [
    { id: 1, title: 'Review returned application - John Doe', type: 'urgent', dueDate: 'Today' },
    { id: 2, title: 'Follow up with lead - Emily Wilson', type: 'warning', dueDate: 'Tomorrow' },
    { id: 3, title: 'Submit documents for MIT application', type: 'normal', dueDate: 'Dec 25' },
    { id: 4, title: 'Schedule interview prep with Lisa Chen', type: 'normal', dueDate: 'Dec 26' },
  ];

  const recentActivities = [
    { id: 1, action: 'Lead converted to student', entity: 'David Brown', time: '2 hours ago' },
    { id: 2, action: 'Document verified', entity: 'Passport - Sarah Miller', time: '4 hours ago' },
    { id: 3, action: 'Contract signed', entity: 'John Doe - Service Agreement', time: 'Yesterday' },
  ];

  const hotLeads = mockLeads.filter(l => l.status === 'hot' || l.status === 'new').slice(0, 3);

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {mockStaff.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here's your activity overview for today</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Active Students"
            value="24"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <KPICard
            title="Hot Leads"
            value={hotLeads.length.toString()}
            icon={TrendingUp}
            subtitle="Requires follow-up"
          />
          <KPICard
            title="Pending Tasks"
            value={tasks.length.toString()}
            icon={Clock}
            subtitle="Action required"
          />
          <KPICard
            title="This Month's Commission"
            value={`$${mockStaff.commission.toLocaleString()}`}
            icon={DollarSign}
            variant="gold"
          />
        </div>

        {/* Earnings Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold" />
              Earnings Summary
            </h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    ${mockStaff.commission.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Commission</p>
                  <p className="text-xl font-semibold text-warning tabular-nums">
                    ${mockStaff.pendingCommission.toLocaleString()}
                  </p>
                </div>
                <StatusBadge variant="warning">Awaiting</StatusBadge>
              </div>
            </div>
          </motion.div>

          {/* Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pending Tasks
              </h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.type === 'urgent' ? 'bg-error' : 
                    task.type === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{task.dueDate}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hot Leads & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hot Leads */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-error" />
                Hot Leads
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/staff/leads')} className="text-primary">
                Manage Leads <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {hotLeads.length > 0 ? hotLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar name={lead.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                  <StatusBadge variant={lead.status === 'hot' ? 'error' : 'primary'}>
                    {lead.status}
                  </StatusBadge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hot leads at the moment</p>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-secondary" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {index < recentActivities.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.entity}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
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

export default StaffDashboard;
