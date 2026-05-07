import { useEffect, useState } from 'react';
import { useCurrentUser } from './use-current-user';

const sessionKey = (userId: string | number) => `ia_beta_notice_shown_${userId}`;
const persistKey = (userId: string | number) => `ia_beta_notice_dismissed_${userId}`;

export const IA_BETA_NOTICE_DISMISSED_EVENT = 'iaBetaNoticeDismissed';

export function isIaBetaNoticeDismissed(userId: string | number | undefined | null): boolean {
  if (!userId) return false;
  try {
    return localStorage.getItem(persistKey(userId)) === 'true';
  } catch {
    return false;
  }
}

export function useIABetaNotice() {
  const { data: user, isLoggedIn } = useCurrentUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    // Beta testers get the heavier BetaTesterWelcomeModal + FAB; don't stack this on top.
    if (user.isBetaTester) return;

    if (isIaBetaNoticeDismissed(user.id)) return;

    const shownThisSession = sessionStorage.getItem(sessionKey(user.id)) === 'true';
    if (shownThisSession) return;

    setShowModal(true);
    sessionStorage.setItem(sessionKey(user.id), 'true');
  }, [isLoggedIn, user?.id, user?.isBetaTester]);

  const handleClose = () => {
    if (user?.id) {
      try {
        localStorage.setItem(persistKey(user.id), 'true');
      } catch {
        // ignore storage errors
      }
      window.dispatchEvent(
        new CustomEvent(IA_BETA_NOTICE_DISMISSED_EVENT, { detail: { userId: user.id } }),
      );
    }
    setShowModal(false);
  };

  return { showModal, handleClose };
}
