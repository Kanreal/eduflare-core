import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, EyeOff, Briefcase, GraduationCap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const ImpersonationBanner: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isImpersonating, 
    impersonatedUser, 
    impersonationType, 
    actorAdminName,
    endImpersonation 
  } = useImpersonation();

  const handleExitImpersonation = () => {
    const redirectPath = endImpersonation();
    // Force navigation to admin dashboard
    navigate(redirectPath, { replace: true });
  };

  return (
    <AnimatePresence>
      {isImpersonating && impersonatedUser && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-sm border-b shadow-lg ${
            impersonationType === 'student'
              ? 'bg-primary/95 border-primary'
              : 'bg-warning/95 border-warning'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <AlertTriangle
                className={`w-5 h-5 ${
                  impersonationType === 'student' ? 'text-primary-foreground' : 'text-warning-foreground'
                }`}
              />
              <div className="flex items-center gap-3">
                {impersonationType === 'staff' ? (
                  <Briefcase className="w-4 h-4 text-warning-foreground" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span
                    className={`text-sm font-medium ${
                      impersonationType === 'student' ? 'text-primary-foreground' : 'text-warning-foreground'
                    }`}
                  >
                    {impersonationType === 'student'
                      ? 'You are viewing this account as Student:'
                      : 'You are impersonating:'}
                    <strong className="ml-1">{impersonatedUser.name}</strong>
                  </span>
                  {actorAdminName && (
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        impersonationType === 'student'
                          ? 'text-primary-foreground/80'
                          : 'text-warning-foreground/80'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      Acting Admin: {actorAdminName}
                    </span>
                  )}
                </div>
              </div>
              {impersonationType === 'student' && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-primary-foreground">
                  Read-only mode
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExitImpersonation}
              className={`gap-2 font-semibold ${
                impersonationType === 'student'
                  ? 'bg-white/20 border-white/40 text-primary-foreground hover:bg-white/30'
                  : 'bg-white/20 border-white/40 text-warning-foreground hover:bg-white/30'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              Exit Impersonation
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
