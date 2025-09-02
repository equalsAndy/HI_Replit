import React, { useEffect } from 'react';

/**
 * AuthCallback is the landing page for Auth0 redirects.
 * It does not render UI but ensures onRedirectCallback logic runs.
 */
export default function AuthCallback() {
  useEffect(() => {
    // No-op: Auth0Provider handles the redirect callback
  }, []);
  return null;
}
