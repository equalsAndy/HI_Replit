import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useCurrentUser } from './use-current-user';
import { useToast } from './use-toast';
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
    
    // Redirect to auth page
    setLocation('/auth');
  }, [location, requiresAuth, storeReturnUrl, storeSessionMessage, onInvalidSession, setLocation]);

  // Simplified session check that relies on existing user data instead of making new requests
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

    // Use existing user data instead of making new request
    if (user?.id) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return true;
    } else if (!userLoading) {
      // No user data and not loading - session invalid
      handleInvalidSession('login-required');
      return false;
    }

    // Still loading, don't make assumptions
    return false;
  }, [requiresAuth, user, userLoading, handleInvalidSession]);

  // Handle user loading states and errors - rely on useCurrentUser hook instead of duplicating requests
  useEffect(() => {
    if (!requiresAuth()) {
      setSessionStatus({
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      });
      return;
    }

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
        handleInvalidSession('login-required');
      } else {
        setSessionStatus({
          isValid: true,
          isLoading: userLoading,
          lastCheck: new Date()
        });
      }
    } else {
      // Still loading
      setSessionStatus(prev => ({
        ...prev,
        isLoading: userLoading
      }));
    }
  }, [user, userLoading, userError, requiresAuth, handleInvalidSession]);

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