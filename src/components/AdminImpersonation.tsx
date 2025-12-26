import React from 'react';
import { Eye, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface StaffImpersonationButtonProps {
  staff: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

interface StudentImpersonationButtonProps {
  student: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

export const StaffImpersonationButton: React.FC<StaffImpersonationButtonProps> = ({
  staff,
  className
}) => {
  const { startImpersonation } = useImpersonation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleImpersonate = () => {
    if (currentUser) {
      startImpersonation({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: 'staff',
      }, 'staff', currentUser.id || 'admin', currentUser.name);

      // Navigate to staff dashboard
      navigate('/staff/dashboard');
    }
  };

  return (
    <Button
      onClick={handleImpersonate}
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
    >
      <Eye className="w-4 h-4" />
      <Briefcase className="w-3 h-3" />
      Impersonate
    </Button>
  );
};

export const StudentImpersonationButton: React.FC<StudentImpersonationButtonProps> = ({
  student,
  className
}) => {
  const { startImpersonation } = useImpersonation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleImpersonate = () => {
    if (currentUser) {
      startImpersonation({
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
      }, 'student', currentUser.id || 'admin', currentUser.name);

      // Navigate to student dashboard
      navigate('/student/dashboard');
    }
  };

  return (
    <Button
      onClick={handleImpersonate}
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
    >
      <Eye className="w-4 h-4" />
      <GraduationCap className="w-3 h-3" />
      View as Student
    </Button>
  );
};
