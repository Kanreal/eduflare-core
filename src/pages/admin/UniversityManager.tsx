import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Search, Plus, MapPin, GraduationCap, 
  MoreVertical, Edit, Trash2, CheckCircle, XCircle 
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/EduFlareUI';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const mockUniversities = [
  { id: 'uni-1', name: 'Zhejiang University', country: 'China', city: 'Hangzhou', programs: ['Computer Science', 'Engineering', 'Business'], isPartner: true, isActive: true, studentsPlaced: 45 },
  { id: 'uni-2', name: 'Beijing University', country: 'China', city: 'Beijing', programs: ['Medicine', 'Law', 'Arts'], isPartner: true, isActive: true, studentsPlaced: 38 },
  { id: 'uni-3', name: 'Tsinghua University', country: 'China', city: 'Beijing', programs: ['Engineering', 'Science', 'Architecture'], isPartner: true, isActive: true, studentsPlaced: 52 },
  { id: 'uni-4', name: 'Delhi University', country: 'India', city: 'Delhi', programs: ['Commerce', 'Arts', 'Science'], isPartner: true, isActive: true, studentsPlaced: 28 },
  { id: 'uni-5', name: 'IIT Bombay', country: 'India', city: 'Mumbai', programs: ['Engineering', 'Technology', 'Design'], isPartner: false, isActive: true, studentsPlaced: 15 },
  { id: 'uni-6', name: 'Istanbul University', country: 'Turkey', city: 'Istanbul', programs: ['Medicine', 'Law', 'Engineering'], isPartner: true, isActive: false, studentsPlaced: 22 },
];

const UniversityManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<typeof mockUniversities[0] | null>(null);

  const filteredUniversities = mockUniversities.filter((uni) => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || uni.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const countries = [...new Set(mockUniversities.map(u => u.country))];
  const partnerCount = mockUniversities.filter(u => u.isPartner).length;
  const activeCount = mockUniversities.filter(u => u.isActive).length;

  const handleEdit = (uni: typeof mockUniversities[0]) => {
    setSelectedUniversity(uni);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (uni: typeof mockUniversities[0]) => {
    toast.success(`${uni.name} has been removed`);
  };

  return (
    <PortalLayout portal="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">University Manager</h1>
            <p className="text-muted-foreground mt-1">Add and manage partner universities</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add University
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockUniversities.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{partnerCount}</p>
                  <p className="text-sm text-muted-foreground">Partners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{countries.length}</p>
                  <p className="text-sm text-muted-foreground">Countries</p>
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
                  placeholder="Search universities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* University Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">University</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Programs</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Students</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUniversities.map((uni, index) => (
                    <motion.tr
                      key={uni.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        !uni.isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{uni.name}</p>
                            {uni.isPartner && (
                              <span className="text-xs text-success">Partner</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {uni.city}, {uni.country}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {uni.programs.slice(0, 2).map((program) => (
                            <span
                              key={program}
                              className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                            >
                              {program}
                            </span>
                          ))}
                          {uni.programs.length > 2 && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                              +{uni.programs.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground">{uni.studentsPlaced}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge 
                          status={uni.isActive ? 'Active' : 'Inactive'} 
                          variant={uni.isActive ? 'success' : 'muted'} 
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(uni)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(uni)}
                                className="text-error"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add University Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add University</DialogTitle>
            <DialogDescription>
              Add a new university to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>University Name</Label>
              <Input placeholder="Enter university name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="china">China</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Programs (comma separated)</Label>
              <Input placeholder="Engineering, Medicine, Business" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Partner University</Label>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('University added successfully');
              setIsAddDialogOpen(false);
            }}>
              Add University
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>
              Update university details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>University Name</Label>
              <Input defaultValue={selectedUniversity?.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select defaultValue={selectedUniversity?.country.toLowerCase()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="china">China</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input defaultValue={selectedUniversity?.city} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Programs (comma separated)</Label>
              <Input defaultValue={selectedUniversity?.programs.join(', ')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Partner University</Label>
              <Switch defaultChecked={selectedUniversity?.isPartner} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch defaultChecked={selectedUniversity?.isActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('University updated successfully');
              setIsEditDialogOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default UniversityManager;
