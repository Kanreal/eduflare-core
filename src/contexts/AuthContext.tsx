import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, Student, Staff, Admin } from '@/types';
import { mockStudent, mockStaff, mockAdmin } from '@/lib/constants';

type User = Student | Staff | Admin | null;

interface AuthContextType {
  user: User;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, portal: 'student' | 'internal') => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'eduflare_auth_session';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // In development HMR scenarios the hook can be invoked before the provider is mounted.
    // Return a safe fallback to avoid crashing the app.
    // This helps prevent "must be used within provider" runtime crashes while developing.
    // NOTE: This fallback should not be used in production — ensure the provider wraps the app.
    // eslint-disable-next-line no-console
    console.warn('useAuth called outside AuthProvider — returning safe fallback.');
    return {
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => false,
      logout: () => {},
      switchRole: () => {},
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from localStorage on mount
  React.useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const { user: storedUser, role: storedRole } = JSON.parse(storedAuth);
        setUser(storedUser);
        setRole(storedRole);
      }
    } catch (error) {
      console.error('Failed to restore authentication state:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    // Always set loading to false after restoration attempt
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, portal: 'student' | 'internal'): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

    let newUser: User;
    let newRole: UserRole;

    if (portal === 'student') {
      newUser = mockStudent;
      newRole = 'student';
    } else {
      // Internal login - determine role based on email domain or credentials
      if (email.includes('admin')) {
        newUser = mockAdmin;
        newRole = 'admin';
      } else {
        newUser = mockStaff;
        newRole = 'staff';
      }
    }

    // Update state
    setUser(newUser);
    setRole(newRole);

    // Persist to localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: newUser,
        role: newRole,
      }));
    } catch (error) {
      console.error('Failed to persist authentication state:', error);
    }

    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    // Clear localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    // For demo purposes - allows switching between roles
    let newUser: User;
    switch (newRole) {
      case 'student':
        newUser = mockStudent;
        break;
      case 'staff':
        newUser = mockStaff;
        break;
      case 'admin':
        newUser = mockAdmin;
        break;
      default:
        return;
    }

    setUser(newUser);
    setRole(newRole);

    // Persist to localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: newUser,
        role: newRole,
      }));
    } catch (error) {
      console.error('Failed to persist authentication state:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
