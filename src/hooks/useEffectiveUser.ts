import { useAuth } from '@/contexts/AuthContext';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const useEffectiveUser = () => {
  const auth = useAuth();
  let impersonation;
  try {
    impersonation = useImpersonation();
  } catch {
    impersonation = undefined as any;
  }

  const isImpersonating = !!impersonation && impersonation.isImpersonating;
  const impersonatedUser = impersonation?.impersonatedUser;

  const effectiveUser = isImpersonating && impersonatedUser ? impersonatedUser : auth.user;
  const effectiveRole = isImpersonating && impersonatedUser ? impersonatedUser.role : auth.role;

  return { effectiveUser, effectiveRole, isImpersonating };
};


