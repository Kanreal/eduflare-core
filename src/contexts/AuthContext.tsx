import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, Student, Staff, Admin } from '@/types';
import { mockStudent, mockStaff, mockAdmin } from '@/lib/constants';

type User = Student | Staff | Admin | null;

interface AuthContextType {
  user: User;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, portal: 'student' | 'internal') => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = useCallback(async (email: string, password: string, portal: 'student' | 'internal'): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

    if (portal === 'student') {
      setUser(mockStudent);
      setRole('student');
      return true;
    } else {
      // Internal login - determine role based on email domain or credentials
      if (email.includes('admin')) {
        setUser(mockAdmin);
        setRole('admin');
      } else {
        setUser(mockStaff);
        setRole('staff');
      }
      return true;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    // For demo purposes - allows switching between roles
    switch (newRole) {
      case 'student':
        setUser(mockStudent);
        break;
      case 'staff':
        setUser(mockStaff);
        break;
      case 'admin':
        setUser(mockAdmin);
        break;
    }
    setRole(newRole);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
