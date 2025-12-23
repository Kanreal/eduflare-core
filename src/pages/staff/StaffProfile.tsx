import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/EduFlareUI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { mockStaff } from '@/lib/constants';

const commissionHistory = [
  { id: 1, studentName: 'John Doe', amount: 20000, status: 'paid', date: new Date('2024-02-01') },
  { id: 2, studentName: 'Jane Smith', amount: 20000, status: 'pending', date: new Date('2024-02-15') },
  { id: 3, studentName: 'Alex Mwangi', amount: 20000, status: 'paid', date: new Date('2024-01-20') },
  { id: 4, studentName: 'Lisa Chen', amount: 20000, status: 'paid', date: new Date('2024-01-05') },
  { id: 5, studentName: 'David Brown', amount: 20000, status: 'pending', date: new Date('2024-03-01') },
];

const activityHistory = [
  { id: 1, action: 'Converted lead to student', entity: 'Emily Wilson', date: new Date() },
  { id: 2, action: 'Uploaded document', entity: 'John Doe - Passport', date: new Date(Date.now() - 86400000) },
  { id: 3, action: 'Generated contract', entity: 'Jane Smith', date: new Date(Date.now() - 2 * 86400000) },
  { id: 4, action: 'Verified document', entity: 'Alex Mwangi - Transcript', date: new Date(Date.now() - 3 * 86400000) },
  { id: 5, action: 'Submitted application to admin', entity: 'John Doe', date: new Date(Date.now() - 4 * 86400000) },
];

const StaffProfile: React.FC = () => {
  const totalCommission = commissionHistory.reduce((sum, c) => sum + c.amount, 0);
  const pendingCommission = commissionHistory.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  const paidCommission = commissionHistory.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar name={mockStaff.name} size="lg" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{mockStaff.name}</h1>
                  <p className="text-muted-foreground">{mockStaff.department}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {mockStaff.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {mockStaff.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {format(mockStaff.createdAt, 'MMM yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalCommission.toLocaleString()} TZS
                    </p>
                    <p className="text-sm text-muted-foreground">Total Commission</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {paidCommission.toLocaleString()} TZS
                    </p>
                    <p className="text-sm text-muted-foreground">Paid Commission</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {pendingCommission.toLocaleString()} TZS
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Commission</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="commission" className="space-y-4">
          <TabsList>
            <TabsTrigger value="commission">Commission History</TabsTrigger>
            <TabsTrigger value="activity">Activity History</TabsTrigger>
          </TabsList>

          <TabsContent value="commission">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission History</CardTitle>
                <CardDescription>Track your earnings from student conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissionHistory.map((commission, index) => (
                    <motion.div
                      key={commission.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          commission.status === 'paid' ? 'bg-success' : 'bg-warning'
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">{commission.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(commission.date, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {commission.amount.toLocaleString()} TZS
                        </p>
                        <p className={`text-xs capitalize ${
                          commission.status === 'paid' ? 'text-success' : 'text-warning'
                        }`}>
                          {commission.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity History</CardTitle>
                <CardDescription>Your recent actions in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">
                          <span className="font-medium">{activity.action}</span>
                          {' '}
                          <span className="text-muted-foreground">— {activity.entity}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(activity.date, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default StaffProfile;
