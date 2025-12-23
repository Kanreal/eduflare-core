import React, { useState } from 'react';
import { Eye, EyeOff, Users, Shield, GraduationCap, Briefcase, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface AdminImpersonationProps {
  className?: string;
}

export const AdminImpersonation: React.FC<AdminImpersonationProps> = ({ className }) => {
  const { role, switchRole } = useAuth();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);

  // Only show for admins
  if (role !== 'admin' && !isImpersonating) return null;

  const handleImpersonate = (newRole: UserRole) => {
    setImpersonatedRole(newRole);
    setIsImpersonating(true);
    switchRole(newRole);
  };

  const handleExitImpersonation = () => {
    setIsImpersonating(false);
    setImpersonatedRole(null);
    switchRole('admin');
  };

  const roleConfig: Record<UserRole, { icon: React.ElementType; label: string; color: string }> = {
    admin: { icon: Shield, label: 'Admin', color: 'text-primary' },
    staff: { icon: Briefcase, label: 'Staff', color: 'text-warning' },
    student: { icon: GraduationCap, label: 'Student', color: 'text-success' },
  };

  // Show exit banner when impersonating
  if (isImpersonating && impersonatedRole) {
    const config = roleConfig[impersonatedRole];
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-warning/90 backdrop-blur-sm border-b border-warning"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-foreground" />
            <span className="text-sm font-medium text-warning-foreground">
              Impersonation Mode: Viewing as <strong className="capitalize">{impersonatedRole}</strong>
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExitImpersonation}
            className="bg-white/20 border-white/30 text-warning-foreground hover:bg-white/30"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Exit Impersonation
          </Button>
        </div>
      </motion.div>
    );
  }

  // Show impersonation button for admin
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('gap-2', className)}>
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">View As</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">Impersonate Role</p>
        </div>
        <DropdownMenuSeparator />
        {(['student', 'staff'] as UserRole[]).map((r) => {
          const config = roleConfig[r];
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={r}
              onClick={() => handleImpersonate(r)}
              className="gap-2 cursor-pointer"
            >
              <Icon className={cn('w-4 h-4', config.color)} />
              <span>View as {config.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
