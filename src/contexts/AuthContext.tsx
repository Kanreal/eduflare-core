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
  registerAdmin: (name: string, email: string, password: string) => Promise<boolean>;
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
      // Check for registered admin accounts stored in localStorage (demo only)
      try {
        const storedAdmins = JSON.parse(localStorage.getItem('eduflare_admin_accounts') || '[]');
        const matchedAdmin = storedAdmins.find((a: any) => a.email === email && a.password === password);
        if (matchedAdmin) {
          newUser = {
            id: matchedAdmin.id,
            email: matchedAdmin.email,
            name: matchedAdmin.name,
            role: 'admin',
            phone: matchedAdmin.phone || '',
            createdAt: new Date(matchedAdmin.createdAt),
            isActive: true,
            permissions: matchedAdmin.permissions || ['all'],
            canImpersonate: true,
          } as Admin;
          newRole = 'admin';
        } else {
          // Internal login - fallback behavior based on email
          if (email.includes('admin')) {
            newUser = mockAdmin;
            newRole = 'admin';
          } else {
            newUser = mockStaff;
            newRole = 'staff';
          }
        }
      } catch (err) {
        // If parsing fails, fall back to mock logic
        if (email.includes('admin')) {
          newUser = mockAdmin;
          newRole = 'admin';
        } else {
          newUser = mockStaff;
          newRole = 'staff';
        }
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

  const registerAdmin = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    // Demo-only admin registration. In real app, call backend to create admin and set roles.
    await new Promise(resolve => setTimeout(resolve, 600)); // simulate API

    try {
      const existing = JSON.parse(localStorage.getItem('eduflare_admin_accounts') || '[]');
      if (existing.some((a: any) => a.email === email)) {
        return false; // already exists
      }

      const newAdmin = {
        id: `admin-${Date.now()}`,
        name,
        email,
        password, // Stored in plain text for demo only — do NOT do this in production
        permissions: ['all'],
        createdAt: new Date().toISOString(),
      };

      existing.push(newAdmin);
      localStorage.setItem('eduflare_admin_accounts', JSON.stringify(existing));

      // Auto-login the new admin
      const adminUser: Admin = {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: 'admin',
        phone: '',
        createdAt: new Date(newAdmin.createdAt),
        isActive: true,
        permissions: newAdmin.permissions,
        canImpersonate: true,
      };

      setUser(adminUser);
      setRole('admin');

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: adminUser, role: 'admin' }));
      } catch (err) {
        console.error('Failed to persist admin session:', err);
      }

      return true;
    } catch (err) {
      console.error('Failed to register admin:', err);
      return false;
    }
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
        registerAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
