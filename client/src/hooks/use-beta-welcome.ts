import { useState, useEffect } from 'react';
import { useCurrentUser } from './use-current-user';
import { useLocation } from 'wouter';

export function useBetaWelcome() {
  const { data: user, isLoggedIn } = useCurrentUser();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [, setLocation] = useLocation();

  // Check if we should show the beta welcome modal - only once per session
  useEffect(() => {
    if (isLoggedIn && user) {
      // Create a session key for this user
      const sessionKey = `beta_welcome_shown_${user.id}`;
      const hasShownThisSession = sessionStorage.getItem(sessionKey);
      
      // Show modal if user is a beta tester, hasn't permanently dismissed it, 
      // and we haven't shown it this session
      const shouldShowWelcome = user.isBetaTester && 
                               !user.hasSeenBetaWelcome && 
                               !hasShownThisSession;
      
      if (shouldShowWelcome) {
        setShowWelcomeModal(true);
        // Mark as shown this session to prevent showing on refresh
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [isLoggedIn, user]);

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
      setLocation('/auth'); // Fallback to auth page
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