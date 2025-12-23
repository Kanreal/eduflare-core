import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated || !role) {
    const isStudentRoute = location.pathname.startsWith('/student');
    const loginPath = isStudentRoute ? '/login/student' : '/login/internal';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Authenticated but wrong role - redirect to their correct dashboard
  if (!allowedRoles.includes(role)) {
    const dashboardPaths: Record<UserRole, string> = {
      student: '/student/dashboard',
      staff: '/staff/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardPaths[role]} replace />;
  }

  return <>{children}</>;
};
