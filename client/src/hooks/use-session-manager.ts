import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useCurrentUser } from './use-current-user';
import { useToast } from './use-toast';
import { useAuth0 } from '@auth0/auth0-react';
import { queryClient } from '@/lib/queryClient';

export type SessionMessage = 
  | 'logged-out' 
  | 'session-expired' 
  | 'session-timeout' 
  | 'login-required'
  | 'server-restart'
  | 'permission-denied';

export interface SessionStatus {
  isValid: boolean;
  isLoading: boolean;
  message?: SessionMessage;
  lastCheck: Date | null;
}

export interface SessionManagerOptions {
  checkInterval?: number; // ms between session checks
  skipRoutes?: string[]; // routes that don't require auth
  onInvalidSession?: (reason: SessionMessage) => void;
}

const DEFAULT_SKIP_ROUTES = [
  '/',
  '/auth',
  '/auth/login', 
  '/login',
  '/register',
  '/invite-code',
  '/beta-tester'
];

const SESSION_CHECK_INTERVAL = 30000; // 30 seconds
const SESSION_STORAGE_KEY = 'returnUrl';
const MESSAGE_STORAGE_KEY = 'sessionMessage';

export function useSessionManager(options: SessionManagerOptions = {}) {
  const {
    checkInterval = SESSION_CHECK_INTERVAL,
    skipRoutes = DEFAULT_SKIP_ROUTES,
    onInvalidSession
  } = options;

  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const { data: user, isLoading: userLoading, error: userError } = useCurrentUser();
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isValid: false,
    isLoading: true,
    lastCheck: null
  });

  // Check if current route requires authentication
  const requiresAuth = useCallback(() => {
    return !skipRoutes.some(route => {
      if (route === '/') return location === '/';
      return location.startsWith(route);
    });
  }, [location, skipRoutes]);

  // Store intended destination before redirect
  const storeReturnUrl = useCallback((url: string) => {
    if (url && !skipRoutes.includes(url)) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, url);
    }
  }, [skipRoutes]);

  // Get and clear stored return URL
  const getAndClearReturnUrl = useCallback(() => {
    const url = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (url) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return url;
    }
    return null;
  }, []);

  // Store session message for display on auth page
  const storeSessionMessage = useCallback((message: SessionMessage) => {
    sessionStorage.setItem(MESSAGE_STORAGE_KEY, message);
  }, []);

  // Get and clear stored session message
  const getAndClearSessionMessage = useCallback(() => {
    const message = sessionStorage.getItem(MESSAGE_STORAGE_KEY) as SessionMessage;
    if (message) {
      sessionStorage.removeItem(MESSAGE_STORAGE_KEY);
      return message;
    }
    return null;
  }, []);

  // Handle invalid session with appropriate messaging and redirect
  const handleInvalidSession = useCallback((reason: SessionMessage) => {
    console.log('🚫 Invalid session detected:', reason);
    
    // Store current location for post-login redirect (if not already on auth page)
    if (requiresAuth()) {
      storeReturnUrl(location);
    }
    
    // Store session message for auth page
    storeSessionMessage(reason);
    
    // Clear any cached user data
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    
    // Update session status
    setSessionStatus({
      isValid: false,
      isLoading: false,
      message: reason,
      lastCheck: new Date()
    });
    
    // Call custom handler if provided
    if (onInvalidSession) {
      onInvalidSession(reason);
    }
    
    // Use Auth0 login or fallback to auth page
    if (reason === 'login-required' || reason === 'session-expired') {
      loginWithRedirect({
        appState: {
          returnTo: requiresAuth() ? location : '/dashboard'
        }
      });
    } else {
      setLocation('/auth');
    }
  }, [location, requiresAuth, storeReturnUrl, storeSessionMessage, onInvalidSession, setLocation, loginWithRedirect]);

  // Simplified session check that relies on Auth0 and user data
  const checkSession = useCallback(async (): Promise<boolean> => {
    // Skip check if route doesn't require auth
    if (!requiresAuth()) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return true;
    }

    // If we already have an app session user, consider session valid
    if (user?.id) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return true;
    }

    // If Auth0 is still loading, wait
    if (authLoading) {
      setSessionStatus(prev => ({ ...prev, isLoading: true }));
      return false;
    }

    // If not authenticated with Auth0 and no app session, trigger login
    if (!isAuthenticated) {
      handleInvalidSession('login-required');
      return false;
    }

    // Auth0 authenticated, check if we have user data
    if (user?.id) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return true;
    } else if (!userLoading) {
      // Auth0 authenticated but no user data - may need to create user profile
      console.log('⚠️ Auth0 authenticated but no user profile found');
      handleInvalidSession('login-required');
      return false;
    }

    // Still loading user data
    return false;
  }, [requiresAuth, isAuthenticated, authLoading, user, userLoading, handleInvalidSession]);

  // Handle Auth0 and user loading states
  useEffect(() => {
    if (!requiresAuth()) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return;
    }

    // If we already have an app session user, consider session valid early
    if (user?.id) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return;
    }

    // Auth0 still loading
    if (authLoading) {
      setSessionStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Not authenticated with Auth0
    if (!isAuthenticated) {
      setSessionStatus({
        isValid: false,
        isLoading: false,
        message: 'login-required',
        lastCheck: new Date()
      });
      return;
    }

    // Auth0 authenticated, now check user data
    if (userError) {
      // User fetch failed, likely due to expired session
      if (userError.message.includes('401')) {
        handleInvalidSession('session-expired');
      } else {
        handleInvalidSession('server-restart');
      }
    } else if (!userLoading) {
      // User loading finished, check if we have valid user data
      if (!user?.id) {
        console.log('⚠️ Auth0 authenticated but no user profile - may need to create profile');
        setSessionStatus({
          isValid: false,
          isLoading: false,
          message: 'login-required',
          lastCheck: new Date()
        });
      } else {
        setSessionStatus({
          isValid: true,
          isLoading: false,
          lastCheck: new Date()
        });
      }
    } else {
      // Still loading user data
      setSessionStatus(prev => ({
        ...prev,
        isLoading: true
      }));
    }
  }, [isAuthenticated, authLoading, user, userLoading, userError, requiresAuth, handleInvalidSession]);

  // Redirect to original destination after successful login
  const redirectToReturnUrl = useCallback(() => {
    const returnUrl = getAndClearReturnUrl();
    if (returnUrl) {
      setLocation(returnUrl);
      return true;
    }
    return false;
  }, [getAndClearReturnUrl, setLocation]);

  return {
    sessionStatus,
    requiresAuth: requiresAuth(),
    checkSession,
    handleInvalidSession,
    storeReturnUrl,
    redirectToReturnUrl,
    getAndClearSessionMessage,
    storeSessionMessage
  };
}

// Hook specifically for the auth page to handle session messages
export function useSessionMessage() {
  const [message, setMessage] = useState<SessionMessage | null>(null);
  
  useEffect(() => {
    const storedMessage = sessionStorage.getItem(MESSAGE_STORAGE_KEY) as SessionMessage;
    if (storedMessage) {
      setMessage(storedMessage);
      sessionStorage.removeItem(MESSAGE_STORAGE_KEY);
      
      // Auto-clear message after 5 seconds
      const timeout = setTimeout(() => {
        setMessage(null);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, clearMessage };
}
