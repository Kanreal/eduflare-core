import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface IdleAlertBadgeProps {
  lastContactDate: Date | undefined;
  thresholdDays: number;
  type?: 'lead' | 'application';
  className?: string;
}

export const IdleAlertBadge: React.FC<IdleAlertBadgeProps> = ({
  lastContactDate,
  thresholdDays,
  type = 'lead',
  className,
}) => {
  if (!lastContactDate) return null;

  const daysSinceContact = differenceInDays(new Date(), lastContactDate);
  const isIdle = daysSinceContact >= thresholdDays;

  if (!isIdle) return null;

  const isUrgent = daysSinceContact >= thresholdDays * 2;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        isUrgent 
          ? 'bg-error/10 text-error border border-error/20' 
          : 'bg-warning/10 text-warning border border-warning/20',
        className
      )}
    >
      <AlertTriangle className="w-3 h-3" />
      <span>
        {daysSinceContact}d idle
      </span>
    </div>
  );
};

interface IdleAlertBannerProps {
  count: number;
  type: 'leads' | 'applications';
  thresholdDays: number;
  onClick?: () => void;
  className?: string;
}

export const IdleAlertBanner: React.FC<IdleAlertBannerProps> = ({
  count,
  type,
  thresholdDays,
  onClick,
  className,
}) => {
  if (count === 0) return null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
        'bg-warning/10 border-warning/30 hover:bg-warning/20',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
        <Clock className="w-5 h-5 text-warning" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">
          {count} {type} need attention
        </p>
        <p className="text-sm text-muted-foreground">
          No activity for more than {thresholdDays} days
        </p>
      </div>
      <AlertTriangle className="w-5 h-5 text-warning" />
    </div>
  );
};
