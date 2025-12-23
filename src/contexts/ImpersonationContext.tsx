import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole } from '@/types';

interface ImpersonatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface ImpersonationSession {
  id: string;
  impersonatedUser: ImpersonatedUser;
  impersonationType: 'staff' | 'student';
  actorAdminId: string;
  actorAdminName: string;
  startedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface ImpersonationLog {
  id: string;
  action: 'START_IMPERSONATION' | 'END_IMPERSONATION' | 'IMPERSONATION_EXPIRED';
  actorAdminId: string;
  actorAdminName: string;
  impersonatedUserId: string;
  impersonatedUserName: string;
  impersonationType: 'staff' | 'student';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: ImpersonatedUser | null;
  impersonationType: 'staff' | 'student' | null;
  currentSession: ImpersonationSession | null;
  actorAdminName: string | null;
  impersonationLogs: ImpersonationLog[];
  startImpersonation: (
    user: ImpersonatedUser,
    type: 'staff' | 'student',
    adminId: string,
    adminName: string
  ) => void;
  endImpersonation: () => string; // Returns redirect path
  getEffectiveRole: () => UserRole | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

const IMPERSONATION_STORAGE_KEY = 'eduflare_impersonation_session';

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

// Generate unique session ID
const generateSessionId = () => `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ImpersonationSession | null>(null);
  const [impersonationLogs, setImpersonationLogs] = useState<ImpersonationLog[]>([]);

  // Restore session from storage on mount (for page refreshes)
  useEffect(() => {
    try {
      const storedSession = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        // Restore with proper Date objects
        setCurrentSession({
          ...parsed,
          startedAt: new Date(parsed.startedAt),
        });
      }
    } catch (error) {
      console.error('Failed to restore impersonation session:', error);
      sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    }
  }, []);

  // Persist session to storage whenever it changes
  useEffect(() => {
    if (currentSession) {
      sessionStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(currentSession));
    } else {
      sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    }
  }, [currentSession]);

  const addLog = useCallback((log: Omit<ImpersonationLog, 'id' | 'timestamp'>) => {
    const newLog: ImpersonationLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date(),
    };
    setImpersonationLogs((prev) => [...prev, newLog]);
    
    // In production, this would also send to server for audit trail
    console.log('[AUDIT] Impersonation Event:', newLog);
    
    return newLog;
  }, []);

  const startImpersonation = useCallback(
    (
      user: ImpersonatedUser,
      type: 'staff' | 'student',
      adminId: string,
      adminName: string
    ) => {
      // Create new impersonation session
      const session: ImpersonationSession = {
        id: generateSessionId(),
        impersonatedUser: user,
        impersonationType: type,
        actorAdminId: adminId,
        actorAdminName: adminName,
        startedAt: new Date(),
        userAgent: navigator.userAgent,
      };

      setCurrentSession(session);

      // Log the impersonation start
      addLog({
        action: 'START_IMPERSONATION',
        actorAdminId: adminId,
        actorAdminName: adminName,
        impersonatedUserId: user.id,
        impersonatedUserName: user.name,
        impersonationType: type,
        userAgent: navigator.userAgent,
      });
    },
    [addLog]
  );

  const endImpersonation = useCallback((): string => {
    if (!currentSession) {
      return '/admin/dashboard';
    }

    // Log the impersonation end
    addLog({
      action: 'END_IMPERSONATION',
      actorAdminId: currentSession.actorAdminId,
      actorAdminName: currentSession.actorAdminName,
      impersonatedUserId: currentSession.impersonatedUser.id,
      impersonatedUserName: currentSession.impersonatedUser.name,
      impersonationType: currentSession.impersonationType,
      userAgent: navigator.userAgent,
    });

    // Clear the session
    setCurrentSession(null);

    // Return admin dashboard path for redirect
    return '/admin/dashboard';
  }, [currentSession, addLog]);

  const getEffectiveRole = useCallback((): UserRole | null => {
    if (currentSession) {
      return currentSession.impersonatedUser.role;
    }
    return null;
  }, [currentSession]);

  const value: ImpersonationContextType = {
    isImpersonating: !!currentSession,
    impersonatedUser: currentSession?.impersonatedUser || null,
    impersonationType: currentSession?.impersonationType || null,
    currentSession,
    actorAdminName: currentSession?.actorAdminName || null,
    impersonationLogs,
    startImpersonation,
    endImpersonation,
    getEffectiveRole,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};
