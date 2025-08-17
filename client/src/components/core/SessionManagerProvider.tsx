import React, { useMemo } from 'react';
import { useSessionManager } from '@/hooks/use-session-manager';

interface SessionManagerProviderProps {
  children: React.ReactNode;
}

export const SessionManagerProvider: React.FC<SessionManagerProviderProps> = ({ children }) => {
  // Memoize options to avoid recreating functions and triggering effect loops
  const sessionOptions = useMemo(() => ({
    checkInterval: 300000, // Check every 5 minutes instead of 30 seconds
    skipRoutes: [
      '/',
      '/auth',
      '/auth/login',
      '/login',
      '/register',
      '/invite-code',
      '/beta-tester'
    ],
  }), []);

  // Initialize session manager at app level
  useSessionManager(sessionOptions);

  return <>{children}</>;
};
