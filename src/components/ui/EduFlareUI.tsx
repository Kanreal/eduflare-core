import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

// ============================================
// STATUS BADGE COMPONENT
// ============================================
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        primary: 'bg-primary/12 text-primary',
        success: 'bg-success/12 text-success',
        warning: 'bg-warning/12 text-warning-foreground',
        error: 'bg-error/12 text-error',
        gold: 'bg-gold/12 text-gold',
        muted: 'bg-muted text-muted-foreground',
        outline: 'border border-border bg-transparent text-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, icon: Icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

// ============================================
// KPI CARD COMPONENT
// ============================================
export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'gold';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const bgStyles = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    gold: 'gradient-gold text-gold-foreground',
  };

  const textStyles = {
    default: 'text-foreground',
    primary: 'text-primary-foreground',
    gold: 'text-gold-foreground',
  };

  const mutedStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary-foreground/70',
    gold: 'text-gold-foreground/70',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border p-6 shadow-card transition-all hover:shadow-elevated',
        bgStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium', mutedStyles[variant])}>
            {title}
          </p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight tabular-nums',
              textStyles[variant]
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className={cn('mt-1 text-sm', mutedStyles[variant])}>{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-error'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className={cn('text-xs', mutedStyles[variant])}>vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-lg p-3',
              variant === 'default' ? 'bg-primary/10' : 'bg-white/20'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                variant === 'default' ? 'text-primary' : 'text-current'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// PROGRESS STEPPER COMPONENT
// ============================================
export interface Step {
  step: number;
  label: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.step < currentStep;
          const isActive = step.step === currentStep;
          const isPending = step.step > currentStep;

          return (
            <React.Fragment key={step.step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isActive && 'border-primary bg-primary/10 text-primary shadow-glow-primary',
                    isPending && 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.step
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isCompleted || isActive) && 'text-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 mt-[-2rem]',
                    step.step < currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// DOCUMENT CARD COMPONENT
// ============================================
export interface DocumentCardProps {
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'error' | 'locked';
  uploadedAt?: Date;
  onView?: () => void;
  onDownload?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  name,
  type,
  status,
  uploadedAt,
  onView,
  onDownload,
}) => {
  const statusVariants = {
    pending: 'warning',
    verified: 'success',
    error: 'error',
    locked: 'muted',
  } as const;

  const statusLabels = {
    pending: 'Pending Review',
    verified: 'Verified',
    error: 'Error - Action Required',
    locked: 'Locked',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card p-4 shadow-card transition-all',
        status === 'locked' && 'opacity-60'
      )}
    >
      {status === 'locked' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-xs font-medium">Locked</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{type}</p>
          <div className="mt-2">
            <StatusBadge variant={statusVariants[status]}>
              {statusLabels[status]}
            </StatusBadge>
          </div>
          {uploadedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Uploaded {uploadedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {status !== 'locked' && (onView || onDownload) && (
        <div className="mt-4 flex gap-2">
          {onView && (
            <button
              onClick={onView}
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              View
            </button>
          )}
          {onDownload && status === 'verified' && (
            <button
              onClick={onDownload}
              className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Download
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// LOCKED CONTENT OVERLAY
// ============================================
export interface LockedOverlayProps {
  title?: string;
  message?: string;
  children: React.ReactNode;
}

export const LockedOverlay: React.FC<LockedOverlayProps> = ({
  title = 'Content Locked',
  message = 'This content will be available once all requirements are met.',
  children,
}) => {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-xl">
        <div className="text-center p-6 max-w-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// ============================================
// AVATAR COMPONENT
// ============================================
export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

// ============================================
// ALERT CARD COMPONENT
// ============================================
export interface AlertCardProps {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  message,
  type,
  action,
  onDismiss,
}) => {
  const styles = {
    info: 'border-primary/30 bg-primary/5',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    error: 'border-error/30 bg-error/5',
  };

  const iconStyles = {
    info: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 animate-slide-up',
        styles[type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', iconStyles[type])}>
          {type === 'info' && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'success' && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {type === 'error' && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
