import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';

/**
 * AuthCallback establishes an app session after Auth0 and routes the user.
 */
export default function AuthCallback() {
  const [, navigate] = useLocation();
  const { getIdTokenClaims, getAccessTokenSilently, loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[AuthCallback] Starting session bootstrap...');
        let claims: any | null = null;
        // Try up to 3 times to allow context hydration
        for (let i = 0; i < 3; i++) {
          // eslint-disable-next-line no-await-in-loop
          claims = await getIdTokenClaims();
          if (claims?.__raw) break;
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 200));
        }
        console.log('[AuthCallback] ID token claims:', claims ? Object.keys(claims) : 'null');
        let idToken: string | null = claims?.__raw ?? null;

        // Attempt silent token acquisition if still missing
        if (!idToken) {
          try {
            await getAccessTokenSilently({ detailedResponse: true, cacheMode: 'on' } as any);
            const retryClaims: any = await getIdTokenClaims();
            idToken = retryClaims?.__raw ?? null;
          } catch (silentErr) {
            console.warn('[AuthCallback] Silent token attempt failed:', silentErr);
          }
        }

        if (!idToken) {
          console.error('[AuthCallback] Missing id token');
          setError('Missing ID token from Auth0 after redirect');
          setDebug({ isAuthenticated, isLoading, location: window.location.href });
          return;
        }

        // Create app session on backend (try a few well-known endpoints for compatibility)
        const endpoints = [
          '/api/auth/auth0-session',
          '/api/auth/session',
          '/api/auth0/auth0-session',
          '/api/auth0/session',
          '/api/auth0-session',
        ];
        let created = false;
        let lastStatus = 0;
        let lastText = '';
        for (const url of endpoints) {
          const r = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            credentials: 'include',
          });
          if (r.ok) { created = true; break; }
          lastStatus = r.status; lastText = await r.text();
          console.warn('[AuthCallback] Session endpoint failed', url, lastStatus, lastText);
        }
        if (!created) {
          console.error('[AuthCallback] Session creation failed:', lastStatus, lastText);
          setError(`Failed to create session (${lastStatus || 'unknown'})`);
          setDebug({ response: lastText });
          return;
        }

        // Fetch current user
        const meResp = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meResp.ok) {
          const t = await meResp.text();
          console.error('[AuthCallback] /api/auth/me failed:', meResp.status, t);
          setError(`/api/auth/me failed (${meResp.status})`);
          setDebug({ response: t });
          throw new Error('Failed to fetch user');
        }
        const me = await meResp.json();
        const user = me.user || me;
        console.log('[AuthCallback] User fetched:', {
          id: user?.id,
          email: user?.email,
          role: user?.role,
          isBetaTester: user?.isBetaTester
        });

        // Decide destination
        let dest = '/';
        if (user?.role === 'admin') dest = '/admin';
        else if (user?.isBetaTester || user?.isTestUser) dest = '/dashboard';
        else if (user?.astAccess) dest = '/allstarteams';
        else if (user?.iaAccess) dest = '/imaginal-agility';

        if (mounted) navigate(dest);
      } catch (e) {
        // On error, go back to landing
        console.error('[AuthCallback] Error during callback processing:', e);
        if (mounted && !error) {
          setError('Authentication processing failed');
          setDebug(d => ({ ...(d || {}), error: String(e) }));
        }
      }
    })();
    return () => { mounted = false; };
  }, [getIdTokenClaims, getAccessTokenSilently, isAuthenticated, isLoading, navigate]);

  if (!error) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Alert className="bg-amber-50 border-amber-200 mb-4">
          <InfoIcon className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Login Incomplete</AlertTitle>
          <AlertDescription className="text-amber-700">
            {error}. Please try again. If this persists, check that the Auth0 application has your local callback URL
            whitelisted and that the email scope is enabled.
          </AlertDescription>
        </Alert>

        {debug && (
          <pre className="text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-60 mb-4">
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => loginWithRedirect({
              authorizationParams: {
                redirect_uri: (import.meta.env.VITE_AUTH0_REDIRECT_URI as string) || (window.location.origin + '/auth/callback'),
                scope: 'openid profile email',
                prompt: 'login',
              }
            })}
            className="bg-indigo-600"
          >
            Try Login Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
}
