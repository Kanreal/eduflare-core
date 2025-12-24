import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

// ============================================
// STATUS BADGE COMPONENT
// ============================================
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground border-border',
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning-foreground border-warning/20',
        error: 'bg-error/10 text-error border-error/20',
        gold: 'bg-gold/10 text-gold border-gold/20',
        muted: 'bg-muted text-muted-foreground border-border',
        outline: 'border-border bg-transparent text-foreground',
        info: 'bg-info/10 text-info border-info/20',
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
  variant?: 'default' | 'primary' | 'gold' | 'success';
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
    success: 'gradient-success text-success-foreground',
  };

  const textStyles = {
    default: 'text-foreground',
    primary: 'text-primary-foreground',
    gold: 'text-gold-foreground',
    success: 'text-success-foreground',
  };

  const mutedStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary-foreground/70',
    gold: 'text-gold-foreground/70',
    success: 'text-success-foreground/70',
  };

  const iconBgStyles = {
    default: 'bg-primary/10',
    primary: 'bg-white/20',
    gold: 'bg-white/20',
    success: 'bg-white/20',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border p-6 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 relative overflow-hidden group',
        bgStyles[variant],
        className
      )}
    >
      {/* Subtle gradient overlay on hover for default variant */}
      {variant === 'default' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <div className="flex items-start justify-between relative">
        <div>
          <p className={cn('text-sm font-medium', mutedStyles[variant])}>
            {title}
          </p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight tabular-nums font-display',
              textStyles[variant]
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className={cn('mt-1 text-sm', mutedStyles[variant])}>{subtitle}</p>
          )}
          {trend && (
            <div className="mt-3 flex items-center gap-1.5">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error" />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
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
              'rounded-xl p-3 transition-transform duration-200 group-hover:scale-110',
              iconBgStyles[variant]
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
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                    isCompleted && 'border-success bg-success text-success-foreground',
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
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      (isCompleted || isActive) && 'text-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-24">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-3 mt-[-2.5rem] rounded-full transition-colors duration-300',
                    step.step < currentStep ? 'bg-success' : 'bg-border'
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
    error: 'Action Required',
    locked: 'Locked',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-elevated group',
        status === 'locked' && 'opacity-60'
      )}
    >
      {status === 'locked' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
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
        <div className="rounded-xl bg-primary/10 p-2.5 transition-transform duration-200 group-hover:scale-105">
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
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted hover:border-muted-foreground/20"
            >
              View
            </button>
          )}
          {onDownload && status === 'verified' && (
            <button
              onClick={onDownload}
              className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
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
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[3px] rounded-xl">
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
          <h3 className="font-semibold text-foreground font-display">{title}</h3>
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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="rounded-2xl bg-muted p-5 mb-5">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-semibold text-foreground font-display text-lg">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color based on name
  const colors = [
    'bg-primary/15 text-primary',
    'bg-success/15 text-success', 
    'bg-gold/15 text-gold',
    'bg-error/15 text-error',
    'bg-info/15 text-info',
  ];
  const colorIndex = name.length % colors.length;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold overflow-hidden ring-2 ring-background',
        sizeClasses[size],
        src ? '' : colors[colorIndex],
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
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  variant = 'info',
  title,
  description,
  icon: Icon,
  action,
  onDismiss,
}) => {
  const variantStyles = {
    info: {
      container: 'bg-info/10 border-info/20',
      icon: 'text-info',
      title: 'text-info',
    },
    success: {
      container: 'bg-success/10 border-success/20',
      icon: 'text-success',
      title: 'text-success',
    },
    warning: {
      container: 'bg-warning/10 border-warning/20',
      icon: 'text-warning',
      title: 'text-warning-foreground',
    },
    error: {
      container: 'bg-error/10 border-error/20',
      icon: 'text-error',
      title: 'text-error',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200',
        styles.container
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={cn('h-5 w-5', styles.icon)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-medium', styles.title)}>{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-background/50 text-muted-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// STAT MINI COMPONENT
// ============================================
export interface StatMiniProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
  className?: string;
}

export const StatMini: React.FC<StatMiniProps> = ({
  label,
  value,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: 'border-border bg-card',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    error: 'border-error/30 bg-error/5',
    primary: 'border-primary/30 bg-primary/5',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    primary: 'text-primary',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200',
        variantStyles[variant],
        className
      )}
    >
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums mt-1 font-display', valueStyles[variant])}>
        {value}
      </p>
    </div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================
export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted animate-pulse',
        className
      )}
    />
  );
};

// ============================================
// DIVIDER
// ============================================
export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className }) => {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <div className={cn('h-px bg-border', className)} />;
};