import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Save,
  Bell,
  Shield,
  DollarSign,
  Mail,
  Users,
  Globe,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const AdminSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  // General settings
  const [companyName, setCompanyName] = useState('EduFlare Consulting');
  const [supportEmail, setSupportEmail] = useState('support@eduflare.com');
  const [timezone, setTimezone] = useState('UTC');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [documentAlerts, setDocumentAlerts] = useState(false);

  // Financial settings
  const [commissionRate, setCommissionRate] = useState('15');
  const [currency, setCurrency] = useState('USD');
  const [autoInvoicing, setAutoInvoicing] = useState(true);

  // Security settings
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [ipWhitelist, setIpWhitelist] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary" />
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                General Settings
              </h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@company.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="CST">China Standard Time (CST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </h2>
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Application Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about new applications</p>
                  </div>
                  <Switch checked={applicationAlerts} onCheckedChange={setApplicationAlerts} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Payment Alerts</p>
                    <p className="text-sm text-muted-foreground">Notifications for payments and refunds</p>
                  </div>
                  <Switch checked={paymentAlerts} onCheckedChange={setPaymentAlerts} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Document Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about document uploads</p>
                  </div>
                  <Switch checked={documentAlerts} onCheckedChange={setDocumentAlerts} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Financial Settings
              </h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="commission-rate">Default Commission Rate (%)</Label>
                  <Input
                    id="commission-rate"
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="15"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    This rate applies to all new staff members by default
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Auto Invoicing</p>
                    <p className="text-sm text-muted-foreground">Automatically generate invoices for new contracts</p>
                  </div>
                  <Switch checked={autoInvoicing} onCheckedChange={setAutoInvoicing} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Settings
              </h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Require Two-Factor Authentication
                    </p>
                    <p className="text-sm text-muted-foreground">All admin users must enable 2FA</p>
                  </div>
                  <Switch checked={twoFactorRequired} onCheckedChange={setTwoFactorRequired} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    placeholder="60"
                    min="5"
                    max="480"
                  />
                  <p className="text-xs text-muted-foreground">
                    Users will be logged out after this period of inactivity
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip-whitelist">IP Whitelist (Optional)</Label>
                  <Textarea
                    id="ip-whitelist"
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    placeholder="Enter IP addresses, one per line"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to allow access from any IP address
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Status Indicator */}
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium text-foreground">System Status: Operational</p>
              <p className="text-sm text-muted-foreground">All services are running normally</p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminSettings;
