import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

// If you use wouter:
let navigate: (to: string) => void;
try {
  // optional: only if you have wouter
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const useLocation = require("wouter").useLocation as () => [string, (to: string) => void];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [, nav] = useLocation?.() ?? ["/", (to: string) => { window.location.assign(to); }];
  navigate = nav;
} catch {
  navigate = (to: string) => { window.location.assign(to); };
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;
const redirectUri = (import.meta.env.VITE_AUTH0_REDIRECT_URI as string) || (window.location.origin + "/auth/callback");

if (!domain || !clientId) {
  // eslint-disable-next-line no-console
  console.warn("[Auth0Provider] Missing VITE_AUTH0_DOMAIN or VITE_AUTH0_CLIENT_ID");
}

export default function HIAuth0Provider({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        ...(audience ? { audience } : {}),
      }}
      onRedirectCallback={async (appState) => {
        try {
          const resp = await fetch('/api/auth/me');
          const result = await resp.json();
          const user = result.user;
          // Admins go to admin dashboard
          if (user.role === 'admin') {
            navigate('/admin');
            return;
          }
          // Beta/test users go to /dashboard
          if (user.isBetaTester) {
            navigate('/dashboard');
            return;
          }
          // Other users go to their workshop step
          const prog = JSON.parse(user.navigationProgress || '{}');
          const { appType, completedSteps = [], currentStepId } = prog;
          if (appType === 'ast' || appType === 'allstarteams') {
            navigate(completedSteps.length > 0 || currentStepId ? '/allstarteams' : '/');
          } else if (appType === 'ia' || appType === 'imaginal-agility') {
            navigate(completedSteps.length > 0 || currentStepId ? '/imaginal-agility' : '/');
          } else {
            navigate(appState?.returnTo || '/');
          }
        } catch {
          navigate(appState?.returnTo || '/dashboard');
        }
      }}
    >
      {children}
    </Auth0Provider>
  );
}
