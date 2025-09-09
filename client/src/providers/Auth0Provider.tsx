import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { getClientAuthConfig, validateClientEnvironment } from '../config/auth-environment';

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

// Get environment-aware configuration
const { config, warnings } = validateClientEnvironment();
const { domain, clientId, audience, redirectUri } = config;

if (!domain || !clientId) {
  console.error("[Auth0Provider] Missing Auth0 configuration for environment:", config.environment);
  console.error("Required: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID");
}

if (warnings.length > 0) {
  console.warn("[Auth0Provider] Configuration warnings:", warnings);
}

export default function HIAuth0Provider({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        ...(audience ? { audience } : {}),
      }}
      cacheLocation="localstorage" // Persist tokens across reloads (supports incognito session storage)
      onRedirectCallback={() => {
        // Defer session establishment to our /auth/callback page
        navigate('/auth/callback');
      }}
    >
      {children}
    </Auth0Provider>
  );
}
