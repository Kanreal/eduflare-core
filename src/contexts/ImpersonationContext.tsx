import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole } from '@/types';

interface ImpersonatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: ImpersonatedUser | null;
  impersonationType: 'staff' | 'student' | null;
  startImpersonation: (user: ImpersonatedUser, type: 'staff' | 'student') => void;
  endImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);
  const [impersonationType, setImpersonationType] = useState<'staff' | 'student' | null>(null);

  const startImpersonation = useCallback((user: ImpersonatedUser, type: 'staff' | 'student') => {
    setImpersonatedUser(user);
    setImpersonationType(type);
    setIsImpersonating(true);
  }, []);

  const endImpersonation = useCallback(() => {
    setImpersonatedUser(null);
    setImpersonationType(null);
    setIsImpersonating(false);
  }, []);

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating,
        impersonatedUser,
        impersonationType,
        startImpersonation,
        endImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};
