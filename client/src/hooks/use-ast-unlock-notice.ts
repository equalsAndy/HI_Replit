import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './use-current-user';

// Only surface the notice inside the authenticated workshop area — never on the
// public landing page ("/") or auth/registration screens.
const WORKSHOP_AREA_ROUTES = ['/workshop-selection', '/allstarteams', '/imaginal-agility', '/product-mindset'];

/**
 * Drives the one-time ICIE pilot "start with AllStarTeams first" onboarding notice.
 *
 * Shows once on the first workshop login for users flagged with
 * `astUnlockNoticePending`. Dismissing (either by starting AST or closing) clears
 * the flag server-side so it never shows again.
 */
export function useAstUnlockNotice() {
  const { data: user, isLoggedIn } = useCurrentUser();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showNotice, setShowNotice] = useState(false);
  // Guards against the modal re-appearing between dismissal and the /me refetch.
  const dismissedRef = useRef(false);

  // Re-evaluates on route changes too (`location` dep), so the notice still fires
  // after the post-login redirect from /auth/callback → /workshop-selection, even
  // when the user data is already cached by the time the callback page mounts.
  useEffect(() => {
    if (!isLoggedIn || !user?.id || !user?.astUnlockNoticePending) return;
    if (dismissedRef.current) return;

    // Only inside the authenticated workshop area (excludes the public landing page).
    if (!WORKSHOP_AREA_ROUTES.some((p) => location.startsWith(p))) return;

    // Small delay so the workshop shell is fully settled first.
    const timer = setTimeout(() => setShowNotice(true), 900);
    return () => clearTimeout(timer);
  }, [isLoggedIn, user?.id, user?.astUnlockNoticePending, location]);

  const markSeen = async () => {
    try {
      await fetch('/api/auth/mark-ast-unlock-notice-seen', {
        method: 'POST',
        credentials: 'include',
      });
      // Refresh the cached user so the flag reflects the dismissal.
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    } catch (error) {
      console.error('Failed to mark AST unlock notice as seen:', error);
    }
  };

  const handleClose = () => {
    dismissedRef.current = true;
    setShowNotice(false);
    markSeen();
  };

  const handleStartAst = () => {
    dismissedRef.current = true;
    setShowNotice(false);
    markSeen();
    setLocation('/allstarteams');
  };

  // First name for a personalized greeting (falls back gracefully if absent).
  const fullName = (user as any)?.firstName || user?.name || '';
  const userName = String(fullName).trim().split(/\s+/)[0] || '';

  return { showNotice, handleClose, handleStartAst, userName };
}
