import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Edit2,
  Eye,
  EyeOff,
  History,
  MoreVertical,
  Search,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: 'standard' | 'premium' | 'basic';
  usageCount: number;
}

interface TemplateVersion {
  version: number;
  updatedAt: Date;
  updatedBy: string;
  changes: string;
}

const mockTemplates: ContractTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Standard Service Agreement',
    description: 'Default contract for regular study abroad services',
    content: 'This Service Agreement ("Agreement") is entered into by...',
    version: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-15'),
    category: 'standard',
    usageCount: 145,
  },
  {
    id: 'tpl-2',
    name: 'Premium Package Agreement',
    description: 'Enhanced services with priority processing',
    content: 'This Premium Service Agreement provides comprehensive...',
    version: 2,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10'),
    category: 'premium',
    usageCount: 52,
  },
  {
    id: 'tpl-3',
    name: 'Basic Consultation Agreement',
    description: 'Simple consultation-only services',
    content: 'This Basic Consultation Agreement covers initial...',
    version: 1,
    isActive: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    category: 'basic',
    usageCount: 23,
  },
];

const mockVersionHistory: TemplateVersion[] = [
  { version: 3, updatedAt: new Date('2024-03-15'), updatedBy: 'Admin User', changes: 'Updated refund policy section' },
  { version: 2, updatedAt: new Date('2024-02-10'), updatedBy: 'Admin User', changes: 'Added scholarship terms' },
  { version: 1, updatedAt: new Date('2024-01-01'), updatedBy: 'Admin User', changes: 'Initial version' },
];

const ContractTemplates: React.FC = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    content: string;
    category: 'standard' | 'premium' | 'basic';
  }>({
    name: '',
    description: '',
    content: '',
    category: 'standard',
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    const newTemplate: ContractTemplate = {
      id: `tpl-${Date.now()}`,
      ...formData,
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };
    setTemplates([newTemplate, ...templates]);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', description: '', content: '', category: 'standard' });
    toast.success('Template created successfully');
  };

  const handleEdit = () => {
    if (!selectedTemplate) return;
    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id 
        ? { ...t, ...formData, version: t.version + 1, updatedAt: new Date() }
        : t
    ));
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
    toast.success('Template updated - new version created');
  };

  const handleToggleActive = (template: ContractTemplate) => {
    setTemplates(templates.map(t => 
      t.id === template.id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success(`Template ${template.isActive ? 'disabled' : 'enabled'}`);
  };

  const openEditDialog = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
    });
    setIsEditDialogOpen(true);
  };

  const openVersionDialog = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setIsVersionDialogOpen(true);
  };

  const categoryColors = {
    standard: 'bg-primary/10 text-primary',
    premium: 'bg-warning/10 text-warning',
    basic: 'bg-muted text-muted-foreground',
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contract Templates</h1>
            <p className="text-muted-foreground mt-1">Create and manage contract templates for staff use</p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{templates.length}</p>
                  <p className="text-sm text-muted-foreground">Total Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {templates.filter(t => t.isActive).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="space-y-4">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={!template.isActive ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{template.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[template.category]}`}>
                              {template.category}
                            </span>
                            <StatusBadge variant={template.isActive ? 'success' : 'muted'}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <History className="w-3 h-3" />
                              Version {template.version}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Updated {format(template.updatedAt, 'MMM d, yyyy')}
                            </span>
                            <span>Used {template.usageCount} times</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor={`active-${template.id}`} className="text-sm text-muted-foreground">
                          {template.isActive ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`active-${template.id}`}
                          checked={template.isActive}
                          onCheckedChange={() => handleToggleActive(template)}
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openVersionDialog(template)} className="gap-1">
                        <History className="w-4 h-4" />
                        History
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openVersionDialog(template)}>
                            <History className="w-4 h-4 mr-2" />
                            Version History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                            {template.isActive ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Disable Template
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Enable Template
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new contract template that staff can use to generate contracts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g., Standard Service Agreement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'standard' | 'premium' | 'basic') => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of this template"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Content</Label>
              <Textarea
                placeholder="Enter the full contract text..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.content}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Editing will create a new version. Previous versions are preserved in history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'standard' | 'premium' | 'basic') => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save as New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} - All versions are read-only
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {mockVersionHistory.map((version) => (
                <div
                  key={version.version}
                  className="p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      Version {version.version}
                      {version.version === selectedTemplate?.version && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(version.updatedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{version.changes}</p>
                  <p className="text-xs text-muted-foreground mt-1">By {version.updatedBy}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default ContractTemplates;
