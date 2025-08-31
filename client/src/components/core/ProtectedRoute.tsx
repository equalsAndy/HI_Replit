import React from 'react';
import { useSessionManager } from '@/hooks/use-session-manager';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
  requireFacilitator?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAdmin = false,
  requireFacilitator = false
}) => {
  const { requiresAuth, handleInvalidSession } = useSessionManager();
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  
  // If route doesn't require auth, render children directly
  if (!requiresAuth) {
    return <>{children}</>;
  }

  // Show loading state while checking Auth0 and user data
  if (authLoading || userLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  // If Auth0 not authenticated, redirect to login
  if (!isAuthenticated) {
    loginWithRedirect();
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role-based permissions
  if (user) {
    if (requireAdmin && user.role !== 'admin') {
      handleInvalidSession('permission-denied');
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>Access denied - admin privileges required</p>
            <p>Redirecting to login...</p>
          </div>
        </div>
      );
    }

    if (requireFacilitator && user.role !== 'admin' && user.role !== 'facilitator') {
      handleInvalidSession('permission-denied');
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>Access denied - facilitator privileges required</p>
            <p>Redirecting to login...</p>
          </div>
        </div>
      );
    }
  }

  // Session is valid and user has required permissions
  return <>{children}</>;
};

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
