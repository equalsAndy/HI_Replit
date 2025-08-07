import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from './use-current-user';
import { useLocation } from 'wouter';

export function useBetaWelcome() {
  const { data: user, isLoggedIn } = useCurrentUser();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [, setLocation] = useLocation();
  const isInitialMount = useRef(true);
  
  // Reset modal state when user changes (handles logout/login cycle)
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setShowWelcomeModal(false);
    } else if (user?.id) {
      // Clear session storage when a user successfully logs in
      // This ensures beta testers can see the welcome modal on each new login
      const sessionKey = `beta_welcome_shown_${user.id}`;
      sessionStorage.removeItem(sessionKey);
      console.log('🧹 Cleared beta welcome session storage for new login:', sessionKey);
    }
  }, [isLoggedIn, user?.id]);

  // Check if we should show the beta welcome modal
  useEffect(() => {
    console.log('🚀 Beta welcome hook triggered:', {
      isInitialMount: isInitialMount.current,
      isLoggedIn,
      userId: user?.id,
      username: user?.username,
      isBetaTester: user?.isBetaTester,
      currentPath: window.location.pathname
    });

    // Skip on initial mount to prevent showing during page load
    if (isInitialMount.current) {
      console.log('⏭️ Skipping initial mount');
      isInitialMount.current = false;
      return;
    }

    // Only proceed if user authentication is stable and complete
    if (!isLoggedIn || !user?.id || !user?.username) {
      console.log('❌ Authentication not ready:', {
        isLoggedIn,
        hasUserId: !!user?.id,
        hasUsername: !!user?.username
      });
      return;
    }

    // Don't show modal during navigation to login/invite pages (but allow /auth since users redirect through it)
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login') || currentPath.includes('/invite')) {
      console.log('⛔ Skipping modal on auth page:', currentPath);
      return;
    }

    console.log('✅ Proceeding with beta welcome check after delay...');

    // Add a delay to ensure user data is fully loaded and stable
    const timer = setTimeout(() => {
      // Double-check that we still have a valid beta tester
      if (isLoggedIn && user?.isBetaTester && user?.id && user?.username) {
        // Create a session key for this user
        const sessionKey = `beta_welcome_shown_${user.id}`;
        const hasShownThisSession = sessionStorage.getItem(sessionKey);
        
        console.log('🔍 DETAILED Beta welcome analysis:', {
          userId: user.id,
          username: user.username,
          isBetaTester: user.isBetaTester,
          hasSeenBetaWelcome: user.hasSeenBetaWelcome,
          hasShownThisSession: !!hasShownThisSession,
          sessionKey,
          sessionValue: hasShownThisSession,
          currentPath: window.location.pathname,
          shouldShow_isBeta: user.isBetaTester,
          shouldShow_notSeenWelcome: !user.hasSeenBetaWelcome,
          shouldShow_notShownThisSession: !hasShownThisSession
        });
        
        // Show modal if user is a beta tester and either:
        // 1. They haven't permanently disabled "show at startup" (hasSeenBetaWelcome is the "show at startup" setting)
        // 2. OR we haven't shown it this session (for subsequent page visits)
        const shouldShowWelcome = user.isBetaTester && 
                                 !user.hasSeenBetaWelcome && 
                                 !hasShownThisSession;
        
        console.log('🎯 Final decision - shouldShowWelcome:', shouldShowWelcome);
        
        if (shouldShowWelcome) {
          console.log('🎉 SHOWING beta welcome modal for user:', user.username);
          setShowWelcomeModal(true);
          // Mark as shown this session to prevent showing on refresh
          sessionStorage.setItem(sessionKey, 'true');
        } else {
          console.log('🚫 NOT showing welcome modal because:');
          if (!user.isBetaTester) console.log('   - User is not a beta tester');
          if (user.hasSeenBetaWelcome) console.log('   - User has already seen welcome (hasSeenBetaWelcome = true)');
          if (hasShownThisSession) console.log('   - Already shown this session');
          
          if (user.hasSeenBetaWelcome && !hasShownThisSession) {
            // If user has disabled "show at startup", go directly to workshop
            // Only redirect if we're currently on dashboard or root paths that beta users shouldn't see
            console.log('🔄 Beta user has seen welcome, checking redirect from path:', currentPath);
            if (currentPath === '/dashboard' || currentPath === '/' || currentPath === '/testuser') {
              if (user.astAccess) {
                setLocation('/allstarteams');
              } else if (user.iaAccess) {
                setLocation('/imaginal-agility');
              } else {
                // Default to AllStarTeams for beta users without explicit access
                setLocation('/allstarteams');
              }
            }
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } else {
        console.log('❌ Beta tester validation failed on timeout:', {
          isLoggedIn,
          isBetaTester: user?.isBetaTester,
          hasId: !!user?.id,
          hasUsername: !!user?.username
        });
      }
    }, 1500); // Increased to 1.5 seconds delay to ensure authentication is completely stable

    return () => clearTimeout(timer);
  }, [isLoggedIn, user?.id, user?.isBetaTester, user?.hasSeenBetaWelcome, user?.username, user?.astAccess, user?.iaAccess, setLocation]);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
  };

  const handleDontShowAgain = async (dontShow: boolean) => {
    if (dontShow) {
      try {
        await fetch('/api/auth/mark-beta-welcome-seen', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Failed to mark beta welcome as seen:', error);
      }
    }
    setShowWelcomeModal(false);
  };

  const handleStartWorkshop = () => {
    // Mark as seen and redirect to workshop
    handleDontShowAgain(true);
    
    // Navigate to appropriate workshop based on user's access
    if (user?.astAccess) {
      setLocation('/allstarteams');
    } else if (user?.iaAccess) {
      setLocation('/imaginal-agility');
    } else {
      // Default to AllStarTeams for beta users without explicit access
      setLocation('/allstarteams');
    }
  };

  return {
    showWelcomeModal,
    handleCloseModal,
    handleDontShowAgain,
    handleStartWorkshop,
    isBetaTester: user?.isBetaTester || false,
  };
}