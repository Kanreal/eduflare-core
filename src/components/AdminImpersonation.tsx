import React, { useState } from 'react';
import { Eye, Briefcase, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/EduFlareUI';

interface AdminImpersonationProps {
  className?: string;
}

// Mock staff list for impersonation
const mockStaffList = [
  { id: 'staff-1', name: 'Sarah Johnson', email: 'sarah.johnson@eduflare.com', department: 'Student Services' },
  { id: 'staff-2', name: 'James Mwanga', email: 'james.mwanga@eduflare.com', department: 'Admissions' },
  { id: 'staff-3', name: 'Grace Okonkwo', email: 'grace.okonkwo@eduflare.com', department: 'Student Services' },
];

export const AdminImpersonation: React.FC<AdminImpersonationProps> = ({ className }) => {
  const { role, user } = useAuth();
  const { isImpersonating, startImpersonation } = useImpersonation();
  const navigate = useNavigate();
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Only show for admins when not already impersonating
  if (role !== 'admin' || isImpersonating) return null;

  const filteredStaff = mockStaffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImpersonateStaff = (staff: typeof mockStaffList[0]) => {
    startImpersonation(
      { id: staff.id, name: staff.name, email: staff.email, role: 'staff' },
      'staff',
      user?.id || 'admin-unknown',
      user?.name || 'Admin'
    );
    setIsStaffDialogOpen(false);
    navigate('/staff/dashboard');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('gap-2', className)}>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View As</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Impersonate User
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsStaffDialogOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-warning" />
            <div>
              <span className="block">View as Staff Member</span>
              <span className="text-xs text-muted-foreground">Select a specific staff account</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            <p>To view as a student, go to their profile and click "View as Student"</p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Staff Selection Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-warning" />
              Select Staff to Impersonate
            </DialogTitle>
            <DialogDescription>
              Choose a staff member to view the system as they would see it. All actions will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredStaff.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleImpersonateStaff(staff)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar name={staff.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{staff.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{staff.email}</p>
                    <p className="text-xs text-muted-foreground">{staff.department}</p>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
              {filteredStaff.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No staff found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Component for impersonating a specific staff member from staff management
interface StaffImpersonationButtonProps {
  staff: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

export const StaffImpersonationButton: React.FC<StaffImpersonationButtonProps> = ({
  staff,
  className,
}) => {
  const { role, user } = useAuth();
  const { startImpersonation, isImpersonating } = useImpersonation();
  const navigate = useNavigate();

  // Only show for admins when not already impersonating
  if (role !== 'admin' || isImpersonating) return null;

  const handleImpersonate = () => {
    startImpersonation(
      { id: staff.id, name: staff.name, email: staff.email, role: 'staff' },
      'staff',
      user?.id || 'admin-unknown',
      user?.name || 'Admin'
    );
    navigate('/staff/dashboard');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleImpersonate}
      className={cn('gap-2 border-warning/30 text-warning hover:bg-warning/10', className)}
    >
      <Eye className="w-4 h-4" />
      View as Staff
    </Button>
  );
};

// Component for impersonating a specific student from their detail page
interface StudentImpersonationButtonProps {
  student: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

export const StudentImpersonationButton: React.FC<StudentImpersonationButtonProps> = ({
  student,
  className,
}) => {
  const { role, user } = useAuth();
  const { startImpersonation, isImpersonating } = useImpersonation();
  const navigate = useNavigate();

  // Only show for admins when not already impersonating
  if (role !== 'admin' || isImpersonating) return null;

  const handleImpersonate = () => {
    startImpersonation(
      { id: student.id, name: student.name, email: student.email, role: 'student' },
      'student',
      user?.id || 'admin-unknown',
      user?.name || 'Admin'
    );
    navigate('/student/dashboard');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleImpersonate}
      className={cn('gap-2 border-primary/30 text-primary hover:bg-primary/10', className)}
    >
      <Eye className="w-4 h-4" />
      View as Student
    </Button>
  );
};
