import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Save,
  Bell,
  Shield,
  DollarSign,
  Mail,
  Globe,
  Lock,
  CheckCircle,
  Edit2,
  Calculator,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

// Scholarship pricing types
type ScholarshipType = 'self_support' | 'partial_b' | 'partial_a' | 'full_b' | 'full_a';

interface PricingRow {
  type: ScholarshipType;
  label: string;
  totalServiceFee: number;
  depositPaid: number;
  creditApplied: number;
  clientPays: number; // Computed: totalServiceFee - depositPaid + creditApplied
}

// Default pricing as per spec
const defaultPricing: PricingRow[] = [
  { type: 'self_support', label: 'Self-Support', totalServiceFee: 1000, depositPaid: 750, creditApplied: 500, clientPays: 500 },
  { type: 'partial_b', label: 'Partial B', totalServiceFee: 1250, depositPaid: 750, creditApplied: 500, clientPays: 750 },
  { type: 'partial_a', label: 'Partial A', totalServiceFee: 1500, depositPaid: 750, creditApplied: 500, clientPays: 1000 },
  { type: 'full_b', label: 'Full B', totalServiceFee: 1750, depositPaid: 750, creditApplied: 500, clientPays: 1250 },
  { type: 'full_a', label: 'Full A', totalServiceFee: 2000, depositPaid: 750, creditApplied: 500, clientPays: 1500 },
];

const AdminSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // General settings
  const [companyName, setCompanyName] = useState('EduFlare Consulting');
  const [supportEmail, setSupportEmail] = useState('support@eduflare.com');
  const [timezone, setTimezone] = useState('UTC');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [documentAlerts, setDocumentAlerts] = useState(false);

  // Pricing settings
  const [pricing, setPricing] = useState<PricingRow[]>(defaultPricing);
  const [editingRow, setEditingRow] = useState<ScholarshipType | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingRow>>({});

  // Commission settings
  const [commissionAmount, setCommissionAmount] = useState('20000'); // TZS
  const [commissionCurrency, setCommissionCurrency] = useState('TZS');
  const [commissionTriggerDeposit, setCommissionTriggerDeposit] = useState(true);
  const [commissionTriggerContract, setCommissionTriggerContract] = useState(true);

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
      description: "Your settings have been updated successfully. Pricing changes apply to NEW contracts only.",
    });
  };

  const handleEditPricing = (row: PricingRow) => {
    setEditingRow(row.type);
    setEditForm({ ...row });
  };

  const handleSavePricing = () => {
    if (!editingRow || !editForm) return;
    
    setPricing(prev => prev.map(row => {
      if (row.type === editingRow) {
        const totalServiceFee = editForm.totalServiceFee || row.totalServiceFee;
        const depositPaid = editForm.depositPaid || row.depositPaid;
        const creditApplied = editForm.creditApplied || row.creditApplied;
        // Formula: Final Balance = (Scholarship Fee) - (Initial Deposit - 250 Credit)
        // Client Pays = Total Service Fee - Deposit + Credit Applied
        const clientPays = totalServiceFee - depositPaid + creditApplied;
        
        return {
          ...row,
          totalServiceFee,
          depositPaid,
          creditApplied,
          clientPays,
        };
      }
      return row;
    }));
    
    setEditingRow(null);
    setEditForm({});
    toast({
      title: "Pricing updated",
      description: "Remember: Changes apply to NEW contracts only.",
    });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditForm({});
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <Calculator className="w-4 h-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="commission" className="gap-2">
              <Users className="w-4 h-4" />
              Commission
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
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
                      <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
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

          {/* Pricing Settings */}
          <TabsContent value="pricing">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Pricing Engine
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage scholarship pricing. Changes apply to NEW contracts only.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Scholarship Type</TableHead>
                      <TableHead className="text-right font-semibold">Total Service Fee (USD)</TableHead>
                      <TableHead className="text-right font-semibold">Deposit (USD)</TableHead>
                      <TableHead className="text-right font-semibold">Credit Applied (USD)</TableHead>
                      <TableHead className="text-right font-semibold">Client Pays (USD)</TableHead>
                      <TableHead className="text-center font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricing.map((row) => (
                      <TableRow key={row.type}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className="text-right">
                          {editingRow === row.type ? (
                            <Input
                              type="number"
                              value={editForm.totalServiceFee || ''}
                              onChange={(e) => setEditForm({ ...editForm, totalServiceFee: Number(e.target.value) })}
                              className="w-24 text-right ml-auto"
                            />
                          ) : (
                            `$${row.totalServiceFee.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingRow === row.type ? (
                            <Input
                              type="number"
                              value={editForm.depositPaid || ''}
                              onChange={(e) => setEditForm({ ...editForm, depositPaid: Number(e.target.value) })}
                              className="w-24 text-right ml-auto"
                            />
                          ) : (
                            `$${row.depositPaid.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingRow === row.type ? (
                            <Input
                              type="number"
                              value={editForm.creditApplied || ''}
                              onChange={(e) => setEditForm({ ...editForm, creditApplied: Number(e.target.value) })}
                              className="w-24 text-right ml-auto"
                            />
                          ) : (
                            `$${row.creditApplied.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ${row.clientPays.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingRow === row.type ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" onClick={handleSavePricing}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditPricing(row)}
                              className="gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Formula:</strong> Client Pays = Total Service Fee - Deposit + Credit Applied
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Note:</strong> When a contract is generated, the current pricing is snapshotted and stored with the contract. Future pricing changes will not affect existing contracts.
                </p>
              </div>
            </motion.div>
          </TabsContent>

          {/* Commission Settings */}
          <TabsContent value="commission">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Staff Commission Settings
              </h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="commission-amount">Commission Amount per Contract</Label>
                  <div className="flex gap-2">
                    <Input
                      id="commission-amount"
                      type="number"
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(e.target.value)}
                      placeholder="20000"
                      className="flex-1"
                    />
                    <Select value={commissionCurrency} onValueChange={setCommissionCurrency}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TZS">TZS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Default: 20,000 TZS per completed contract
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Commission Trigger Rules</Label>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Commission is earned when ALL selected conditions are met:
                  </p>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Contract Signed</p>
                      <p className="text-sm text-muted-foreground">Student must sign the service agreement</p>
                    </div>
                    <Switch 
                      checked={commissionTriggerContract} 
                      onCheckedChange={setCommissionTriggerContract}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Deposit Paid ($750 USD)</p>
                      <p className="text-sm text-muted-foreground">Student must pay the initial deposit</p>
                    </div>
                    <Switch 
                      checked={commissionTriggerDeposit} 
                      onCheckedChange={setCommissionTriggerDeposit}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                  <h4 className="font-medium text-foreground mb-2">Clawback Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Before payout:</strong> Commission is voided if student cancels</li>
                    <li>• <strong>After payout:</strong> Negative entry applied to next payroll</li>
                  </ul>
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
