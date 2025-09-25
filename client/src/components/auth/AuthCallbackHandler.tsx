import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export function AuthCallbackHandler() {
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      if (isLoading) return;

      try {
        if (isAuthenticated && user) {
          console.log('🔄 Processing Auth0 callback for user:', user.email);
          
          // Get the access token
          const token = await getAccessTokenSilently();
          
          // Send token to backend to create session
          const response = await fetch('/api/auth/auth0-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error(`Session creation failed: ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ Session created, redirecting to:', data.redirectTo);
          console.log('👤 User data:', data.user);

          // Admin-specific redirect fix
          if (data.user?.role === 'admin') {
            console.log('🔧 Admin detected, forcing redirect to /admin');
            navigate('/admin', { replace: true });
            return;
          }

          // Redirect to the route determined by the backend
          if (data.redirectTo) {
            navigate(data.redirectTo, { replace: true });
          } else {
            // Fallback redirect based on user role
            const fallbackRoute = data.user?.role === 'admin' 
              ? '/admin' 
              : data.user?.role === 'facilitator'
              ? '/facilitator'
              : '/dashboard';
            
            console.log('📍 Using fallback redirect:', fallbackRoute);
            navigate(fallbackRoute, { replace: true });
          }
        } else {
          console.error('❌ Auth callback failed: user not authenticated');
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsProcessing(false);
      }
    }

    handleAuthCallback();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, navigate]);

  if (isLoading || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing login...
          </h2>
          <p className="text-gray-600">
            Setting up your session and redirecting you to the right place.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// Hook for checking authentication status and redirecting
export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not authenticated, redirect to login
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
}

// Component for protecting routes
export function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode; 
  requiredRole?: 'admin' | 'facilitator';
}) {
  const { isAuthenticated, isLoading } = useAuth0();
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAccess() {
      if (isLoading) return;

      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        // Get current user session
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to get user session');
        }

        const userData = await response.json();
        setUser(userData);

        // Check role access
        if (requiredRole && userData.role !== requiredRole && userData.role !== 'admin') {
          console.warn(`Access denied: user role ${userData.role} cannot access ${requiredRole} route`);
          navigate('/dashboard'); // Redirect to appropriate dashboard
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Access check failed:', error);
        navigate('/login');
      }
    }

    checkAccess();
  }, [isAuthenticated, isLoading, requiredRole, navigate]);

  if (isLoading || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
