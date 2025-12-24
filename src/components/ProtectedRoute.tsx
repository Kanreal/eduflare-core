import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role: actualRole } = useAuth();
  const { isImpersonating, impersonatedUser, impersonationType } = useImpersonation();
  const location = useLocation();

  // If auth context is not yet available (during fallback), show loading or return null
  // This prevents premature redirects during HMR or component initialization
  if (!isAuthenticated && actualRole === null) {
    // Return null to avoid rendering anything until auth state is determined
    return null;
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated || !actualRole) {
    const isStudentRoute = location.pathname.startsWith('/student');
    const loginPath = isStudentRoute ? '/login/student' : '/login/internal';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // When impersonating, use the impersonated user's role for access control
  const effectiveRole: UserRole = isImpersonating && impersonatedUser 
    ? impersonatedUser.role 
    : actualRole;

  // Check if the effective role is allowed
  // Admin can always access admin routes even while impersonating
  // But staff/student routes should use impersonated role
  const hasAccess = (() => {
    // Admin routes - only actual admins (not impersonating as staff/student can access)
    if (location.pathname.startsWith('/admin')) {
      return actualRole === 'admin' && !isImpersonating;
    }
    
    // Staff routes - allowed if actual admin OR impersonating staff OR actual staff
    if (location.pathname.startsWith('/staff')) {
      if (actualRole === 'admin' && !isImpersonating) return true;
      if (isImpersonating && impersonationType === 'staff') return true;
      if (actualRole === 'staff') return true;
      return false;
    }
    
    // Student routes - allowed if impersonating student OR actual student
    if (location.pathname.startsWith('/student')) {
      if (isImpersonating && impersonationType === 'student') return true;
      if (actualRole === 'student') return true;
      return false;
    }
    
    // Default check
    return allowedRoles.includes(effectiveRole);
  })();

  if (!hasAccess) {
    // Redirect to appropriate dashboard based on actual role
    const dashboardPaths: Record<UserRole, string> = {
      student: '/student/dashboard',
      staff: '/staff/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardPaths[actualRole]} replace />;
  }

  return <>{children}</>;
};
