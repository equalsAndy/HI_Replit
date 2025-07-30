import React from 'react';
import { useSessionManager } from '@/hooks/use-session-manager';

interface SessionManagerProviderProps {
  children: React.ReactNode;
}

export const SessionManagerProvider: React.FC<SessionManagerProviderProps> = ({ children }) => {
  // Initialize session manager at app level - remove aggressive checking
  useSessionManager({
    checkInterval: 300000, // Check every 5 minutes instead of 30 seconds
    skipRoutes: [
      '/',
      '/auth',
      '/auth/login',
      '/login',
      '/register',
      '/invite-code',
      '/beta-tester'
    ]
  });

  return <>{children}</>;
};