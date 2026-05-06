import { useEffect, useState } from 'react';
import { useCurrentUser } from './use-current-user';

const sessionKey = (userId: string | number) => `ia_beta_notice_shown_${userId}`;
const persistKey = (userId: string | number) => `ia_beta_notice_dismissed_${userId}`;

export function useIABetaNotice() {
  const { data: user, isLoggedIn } = useCurrentUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    const dismissed = localStorage.getItem(persistKey(user.id)) === 'true';
    if (dismissed) return;

    const shownThisSession = sessionStorage.getItem(sessionKey(user.id)) === 'true';
    if (shownThisSession) return;

    setShowModal(true);
    sessionStorage.setItem(sessionKey(user.id), 'true');
  }, [isLoggedIn, user?.id]);

  const handleClose = (dontShowAgain: boolean) => {
    if (dontShowAgain && user?.id) {
      localStorage.setItem(persistKey(user.id), 'true');
    }
    setShowModal(false);
  };

  return { showModal, handleClose };
}
