import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, EyeOff, User, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, impersonatedUser, impersonationType, endImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) return null;

  const isStaffImpersonation = impersonationType === 'staff';
  const isStudentImpersonation = impersonationType === 'student';

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-sm border-b ${
        isStudentImpersonation 
          ? 'bg-primary/90 border-primary' 
          : 'bg-warning/90 border-warning'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${
            isStudentImpersonation ? 'text-primary-foreground' : 'text-warning-foreground'
          }`} />
          <div className="flex items-center gap-2">
            {isStaffImpersonation ? (
              <Briefcase className="w-4 h-4 text-warning-foreground" />
            ) : (
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            )}
            <span className={`text-sm font-medium ${
              isStudentImpersonation ? 'text-primary-foreground' : 'text-warning-foreground'
            }`}>
              {isStudentImpersonation 
                ? 'You are viewing this account as Student:' 
                : 'You are impersonating:'}
              <strong className="ml-1">{impersonatedUser.name}</strong>
            </span>
          </div>
          {isStudentImpersonation && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-primary-foreground">
              Read-only mode
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={endImpersonation}
          className={`gap-2 ${
            isStudentImpersonation
              ? 'bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30'
              : 'bg-white/20 border-white/30 text-warning-foreground hover:bg-white/30'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          Exit Impersonation
        </Button>
      </div>
    </motion.div>
  );
};
