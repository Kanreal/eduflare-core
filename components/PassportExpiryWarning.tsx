import React from 'react';
import { AlertTriangle, Calendar, Shield, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInMonths, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PassportExpiryWarningProps {
  expiryDate: Date | undefined;
  minimumMonths?: number;
  showAsBlock?: boolean;
  className?: string;
}

export const PassportExpiryWarning: React.FC<PassportExpiryWarningProps> = ({
  expiryDate,
  minimumMonths = 6,
  showAsBlock = false,
  className,
}) => {
  if (!expiryDate) {
    return (
      <div className={cn('flex items-center gap-2 text-warning', className)}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Passport expiry date not set</span>
      </div>
    );
  }

  const monthsUntilExpiry = differenceInMonths(expiryDate, new Date());
  const isExpired = expiryDate < new Date();
  const isNearExpiry = monthsUntilExpiry < minimumMonths;
  const isBlocked = isExpired || isNearExpiry;

  if (!isBlocked && !showAsBlock) return null;

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-lg border border-error/30 bg-error/10 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-error">Passport Expired</h4>
            <p className="text-sm text-error/80 mt-1">
              This passport expired on <strong>{format(expiryDate, 'MMMM d, yyyy')}</strong>.
              Application submission is blocked until the passport is renewed.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isNearExpiry) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-lg border border-warning/30 bg-warning/10 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-warning flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Submission Blocked
            </h4>
            <p className="text-sm text-foreground mt-1">
              Passport expires on <strong>{format(expiryDate, 'MMMM d, yyyy')}</strong> 
              ({monthsUntilExpiry} month{monthsUntilExpiry !== 1 ? 's' : ''} remaining).
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Applications require at least <strong>{minimumMonths} months</strong> of passport validity.
              Please renew the passport before submitting.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Valid passport - show success state if showAsBlock
  if (showAsBlock) {
    return (
      <div className={cn(
        'rounded-lg border border-success/30 bg-success/10 p-4',
        className
      )}>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-success" />
          <div>
            <span className="text-sm text-foreground">
              Passport valid until <strong>{format(expiryDate, 'MMMM d, yyyy')}</strong>
            </span>
            <span className="text-sm text-success ml-2">
              ({monthsUntilExpiry} months remaining)
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Helper hook for validation
export const usePassportValidation = (expiryDate: Date | undefined, minimumMonths: number = 6) => {
  if (!expiryDate) return { isValid: false, message: 'Passport expiry not set' };
  
  const monthsUntilExpiry = differenceInMonths(expiryDate, new Date());
  const isExpired = expiryDate < new Date();
  const isNearExpiry = monthsUntilExpiry < minimumMonths;
  
  if (isExpired) {
    return { isValid: false, message: 'Passport has expired' };
  }
  
  if (isNearExpiry) {
    return { 
      isValid: false, 
      message: `Passport expires in ${monthsUntilExpiry} months. Minimum ${minimumMonths} months required.` 
    };
  }
  
  return { isValid: true, message: 'Passport validity OK' };
};
