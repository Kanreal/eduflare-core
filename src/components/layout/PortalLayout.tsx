import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { Avatar } from '@/components/ui/EduFlareUI';
import { NotificationBell } from '@/components/NotificationBell';
import { 
  studentNavItems, 
  staffNavItems, 
  adminNavItems,
  type NavItem,
} from '@/lib/constants';

interface PortalLayoutProps {
  children: React.ReactNode;
  portal: 'student' | 'staff' | 'admin';
}

const getNavItems = (portal: 'student' | 'staff' | 'admin'): NavItem[] => {
  switch (portal) {
    case 'student':
      return studentNavItems;
    case 'staff':
      return staffNavItems;
    case 'admin':
      return adminNavItems;
    default:
      return [];
  }
};

const getPortalTitle = (portal: 'student' | 'staff' | 'admin'): string => {
  switch (portal) {
    case 'student':
      return 'Student Portal';
    case 'staff':
      return 'Staff Portal';
    case 'admin':
      return 'Admin Portal';
    default:
      return 'EduFlare';
  }
};

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children, portal }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();
  const { effectiveUser, isImpersonating } = useEffectiveUser();

  const handleLogout = () => {
    logout(); // Clear authentication state
    // Redirect to appropriate login page
    const loginPath = portal === 'student' ? '/login/student' : '/login/internal';
    navigate(loginPath, { replace: true });
  };

  const navItems = getNavItems(portal);
  const portalTitle = getPortalTitle(portal);

  const isAdminPortal = portal === 'admin';

  return (
    <div 
      className="min-h-screen flex w-full bg-background"
      data-portal={portal}
    >
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-out',
          sidebarCollapsed ? 'w-[72px]' : 'w-64',
          isAdminPortal 
            ? 'bg-sidebar' 
            : 'bg-card border-r border-border'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b',
          isAdminPortal ? 'border-sidebar-border' : 'border-border'
        )}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className={cn(
                  'font-display font-bold text-base',
                  isAdminPortal ? 'text-sidebar-foreground' : 'text-foreground'
                )}>EduFlare</span>
                <span className={cn(
                  'block text-xs font-medium',
                  isAdminPortal ? 'text-sidebar-foreground/60' : 'text-muted-foreground'
                )}>{portalTitle}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      sidebarCollapsed && 'justify-center px-2',
                      isActive 
                        ? isAdminPortal
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                          : 'bg-primary/10 text-primary shadow-sm'
                        : isAdminPortal
                          ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                      isActive && 'scale-110'
                    )} />
                    <AnimatePresence mode="wait">
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className={cn(
          'p-3 border-t',
          isAdminPortal ? 'border-sidebar-border' : 'border-border'
        )}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isAdminPortal
                ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'lg:hidden fixed left-0 top-0 h-screen w-72 z-50 shadow-float',
              isAdminPortal 
                ? 'bg-sidebar' 
                : 'bg-card border-r border-border'
            )}
          >
            {/* Mobile Header */}
            <div className={cn(
              'flex items-center justify-between px-4 py-5 border-b',
              isAdminPortal ? 'border-sidebar-border' : 'border-border'
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={cn(
                    'font-display font-bold text-base',
                    isAdminPortal ? 'text-sidebar-foreground' : 'text-foreground'
                  )}>EduFlare</span>
                  <span className={cn(
                    'block text-xs font-medium',
                    isAdminPortal ? 'text-sidebar-foreground/60' : 'text-muted-foreground'
                  )}>{portalTitle}</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'p-2 rounded-xl transition-colors',
                  isAdminPortal
                    ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <motion.li 
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                          isActive 
                            ? isAdminPortal
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'bg-primary/10 text-primary'
                            : isAdminPortal
                              ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <h1 className="font-display font-semibold text-foreground text-lg">
                  {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-border ml-2">
                <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground">{(isImpersonating ? effectiveUser?.name : user?.name) || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{portal}</p>
                </div>
                <Avatar name={(isImpersonating ? effectiveUser?.name : user?.name) || 'U'} size="sm" />
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="animate-fade-in"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">EduFlare</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <span>Education Management System</span>
          </div>
        </footer>
      </div>
    </div>
  );
};