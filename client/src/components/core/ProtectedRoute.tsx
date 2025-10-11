import React from 'react';
import { useSessionManager } from '@/hooks/use-session-manager';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
  requireFacilitator?: boolean;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return null; // or a spinner
  if (!isAuthenticated) return <Redirect to="/" />;
  return <>{children}</>;
}

// Higher-order component version for easier integration
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook to check if user has required permissions
export function usePermissions() {
  const { sessionStatus } = useSessionManager();
  
  return {
    isAuthenticated: sessionStatus.isValid,
    isLoading: sessionStatus.isLoading,
    // Note: Role checking would need to be implemented based on your user data structure
    // This is a placeholder for future role-based access control
    hasPermission: (role: 'admin' | 'facilitator' | 'participant') => {
      // Implementation would check user role from context or API
      return sessionStatus.isValid;
    }
  };
}
