import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye,
  MoreVertical,
  Users,
  FileText,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { StatusBadge, Avatar, EmptyState } from '@/components/ui/EduFlareUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationStatus } from '@/types';
import { useNavigate } from 'react-router-dom';

// Mock students data
const mockStudents = [
  { 
    id: 'std-1', 
    name: 'John Doe', 
    email: 'john@email.com', 
    status: 'documents_pending' as ApplicationStatus,
    currentStep: 3,
    university: 'Harvard University',
    program: 'Computer Science',
    docsVerified: 4,
    docsTotal: 6,
  },
  { 
    id: 'std-2', 
    name: 'Sarah Miller', 
    email: 'sarah@email.com', 
    status: 'submitted' as ApplicationStatus,
    currentStep: 4,
    university: 'MIT',
    program: 'Engineering',
    docsVerified: 6,
    docsTotal: 6,
  },
  { 
    id: 'std-3', 
    name: 'Michael Chen', 
    email: 'michael@email.com', 
    status: 'contracted' as ApplicationStatus,
    currentStep: 2,
    university: 'Stanford University',
    program: 'Business Administration',
    docsVerified: 2,
    docsTotal: 6,
  },
  { 
    id: 'std-4', 
    name: 'Emily Wilson', 
    email: 'emily@email.com', 
    status: 'offer_released' as ApplicationStatus,
    currentStep: 5,
    university: 'Yale University',
    program: 'Law',
    docsVerified: 6,
    docsTotal: 6,
  },
];

const statusVariants: Record<ApplicationStatus, 'muted' | 'primary' | 'warning' | 'success' | 'gold'> = {
  lead: 'muted',
  contracted: 'primary',
  documents_pending: 'warning',
  submitted: 'success',
  offer_released: 'gold',
};

const statusLabels: Record<ApplicationStatus, string> = {
  lead: 'Lead',
  contracted: 'Contracted',
  documents_pending: 'Documents Pending',
  submitted: 'Submitted',
  offer_released: 'Offer Released',
};

const ActiveStudents: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PortalLayout portal="staff">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Students</h1>
          <p className="text-muted-foreground mt-1">Manage and track your assigned students</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="contracted">Contracted</SelectItem>
              <SelectItem value="documents_pending">Documents Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="offer_released">Offer Released</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => navigate(`/staff/students/${student.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.name} />
                    <div>
                      <p className="font-semibold text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>View Documents</DropdownMenuItem>
                      <DropdownMenuItem>View Applications</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <StatusBadge variant={statusVariants[student.status]}>
                    {statusLabels[student.status]}
                  </StatusBadge>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">University:</span>
                    <span className="text-foreground font-medium truncate">{student.university}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Documents:</span>
                    <span className={`font-medium ${student.docsVerified === student.docsTotal ? 'text-success' : 'text-warning'}`}>
                      {student.docsVerified}/{student.docsTotal} verified
                    </span>
                  </div>
                </div>

                {/* Step Progress */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>Step {student.currentStep} of 5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full ${
                          step <= student.currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* View Button */}
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Try adjusting your search or filter criteria"
          />
        )}
      </div>
    </PortalLayout>
  );
};

export default ActiveStudents;
