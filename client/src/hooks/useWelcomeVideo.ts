import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from './use-current-user';
import { useLocation } from 'wouter';

export function useWelcomeVideo() {
  const { data: user, isLoggedIn } = useCurrentUser();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [, setLocation] = useLocation();
  const isInitialMount = useRef(true);


  // Reset modal state when user changes (handles logout/login cycle)
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setShowWelcomeModal(false);
    } else if (user?.id) {
      // Clean up session storage for the new user to ensure fresh state
      const sessionKey = `welcome_video_shown_${user.id}`;
      const freshLoginKey = `fresh_login_${user.id}`;

      // If this is a different user than before, clear their specific session storage
      const lastUserId = sessionStorage.getItem('last_logged_in_user_id');
      if (lastUserId && lastUserId !== user.id.toString()) {
        // Clear session storage for the new user to ensure fresh state
        sessionStorage.removeItem(sessionKey);
        sessionStorage.removeItem(freshLoginKey);
      }

      // Set the fresh login flag for this user and track them as the current user
      sessionStorage.setItem(freshLoginKey, 'true');
      sessionStorage.setItem('last_logged_in_user_id', user.id.toString());
    }
  }, [isLoggedIn, user?.id]);

  // Check if we should show the welcome video modal
  useEffect(() => {
    console.log('🎥 Welcome video hook triggered:', {
      isInitialMount: isInitialMount.current,
      isLoggedIn,
      userId: user?.id,
      username: user?.username,
      hasSeenWelcomeVideo: user?.hasSeenWelcomeVideo,
      currentPath: window.location.pathname
    });

    // Mark that we've passed the initial mount for future reference
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    // Only proceed if user authentication is stable and complete
    if (!isLoggedIn || !user?.id || !user?.username) {
      console.log('❌ Authentication not ready for welcome video:', {
        isLoggedIn,
        hasUserId: !!user?.id,
        hasUsername: !!user?.username
      });
      return;
    }

    // Don't show modal during navigation to login/invite pages
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login') || currentPath.includes('/invite')) {
      console.log('⛔ Skipping welcome video on auth page:', currentPath);
      return;
    }

    console.log('✅ Proceeding with welcome video check after delay...');

    // Add a delay to ensure user data is fully loaded and stable
    const timer = setTimeout(() => {
      // Double-check that we still have a valid user
      if (isLoggedIn && user?.id && user?.username) {
        // Create a session key for this user
        const sessionKey = `welcome_video_shown_${user.id}`;
        const hasShownThisSession = sessionStorage.getItem(sessionKey);

        // Only show welcome modal on fresh logins, not page refreshes
        const freshLoginKey = `fresh_login_${user.id}`;
        const isFreshLogin = sessionStorage.getItem(freshLoginKey) === 'true';

        console.log('🔍 DETAILED Welcome video analysis:', {
          userId: user.id,
          username: user.username,
          hasSeenWelcomeVideo: user.hasSeenWelcomeVideo,
          showWelcomeVideoOnStartup: user.showWelcomeVideoOnStartup,
          hasShownThisSession: !!hasShownThisSession,
          sessionKey,
          sessionValue: hasShownThisSession,
          freshLoginKey,
          isFreshLogin,
          currentPath: window.location.pathname,
          shouldShow_notSeenVideo: !user.hasSeenWelcomeVideo,
          shouldShow_preferenceEnabled: user.showWelcomeVideoOnStartup !== false,
          shouldShow_notShownThisSession: !hasShownThisSession,
          shouldShow_isFreshLogin: isFreshLogin
        });

        // Show welcome if:
        // 1. User hasn't seen it yet (!hasSeenWelcomeVideo), OR
        // 2. User has seen it but preference is still enabled (showWelcomeVideoOnStartup !== false)
        // AND it's a fresh login and not shown this session
        const shouldShowWelcome = (
          (!user.hasSeenWelcomeVideo || user.showWelcomeVideoOnStartup !== false) &&
          !hasShownThisSession &&
          isFreshLogin
        );

        console.log('🎯 Final decision - shouldShowWelcomeVideo:', shouldShowWelcome);
        console.log('🔍 Decision breakdown:', {
          userHasNotSeenVideo: !user.hasSeenWelcomeVideo,
          notShownThisSession: !hasShownThisSession,
          isFreshLoginFlag: isFreshLogin,
          allConditionsMet: shouldShowWelcome
        });

        if (shouldShowWelcome) {
          console.log('🎉 SHOWING welcome video modal for user:', user.username);
          setShowWelcomeModal(true);
          // Mark as shown this session to prevent showing on refresh
          sessionStorage.setItem(sessionKey, 'true');
          // Clear the fresh login flag since we've shown the modal
          sessionStorage.removeItem(freshLoginKey);
        } else {
          console.log('🚫 NOT showing welcome video modal because:');
          if (user.hasSeenWelcomeVideo) console.log('   - User has already seen welcome video (hasSeenWelcomeVideo = true)');
          if (hasShownThisSession) console.log('   - Already shown this session');
          if (!isFreshLogin) console.log('   - Not a fresh login (page refresh or direct navigation)');

          if (user.hasSeenWelcomeVideo && !hasShownThisSession) {
            // Mark as shown this session to prevent future checks
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } else {
        console.log('❌ User validation failed on timeout:', {
          isLoggedIn,
          hasId: !!user?.id,
          hasUsername: !!user?.username
        });
      }
    }, 1500); // 1.5 seconds delay to ensure authentication is completely stable

    return () => clearTimeout(timer);
  }, [isLoggedIn, user?.id, user?.hasSeenWelcomeVideo, user?.username, setLocation]);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
  };

  const handleMarkVideoSeen = async (showOnStartup: boolean = true) => {
    try {
      await fetch('/api/auth/mark-welcome-video-seen', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showOnStartup }),
      });
      console.log('✅ Welcome video marked as seen in database with preference:', showOnStartup);
    } catch (error) {
      console.error('❌ Failed to mark welcome video as seen:', error);
    }
  };

  const handleGetStarted = async (showOnStartup: boolean = true) => {
    // Mark as seen in database with user preference
    await handleMarkVideoSeen(showOnStartup);

    // Close modal
    setShowWelcomeModal(false);

    // Navigate to appropriate workshop based on user's access
    if (user?.astAccess) {
      setLocation('/allstarteams');
    } else if (user?.iaAccess) {
      setLocation('/imaginal-agility');
    } else {
      // Default to AllStarTeams
      setLocation('/allstarteams');
    }
  };

  const triggerWelcomeVideo = () => {
    if (user?.id) {
      // Clear the session storage to allow the modal to show
      const sessionKey = `welcome_video_shown_${user.id}`;
      sessionStorage.removeItem(sessionKey);

      // Show the modal directly (bypass fresh login check for manual triggers)
      setShowWelcomeModal(true);
    }
  };

  return {
    showWelcomeModal,
    handleCloseModal,
    handleGetStarted,
    handleMarkVideoSeen,
    triggerWelcomeVideo,
    isLoggedIn: !!user?.id,
  };
}