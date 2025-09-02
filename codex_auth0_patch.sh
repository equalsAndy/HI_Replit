#!/usr/bin/env bash
set -euo pipefail

# --- detect app root for client code ---
ROOT="$(pwd)"
if [ -d "$ROOT/client/src" ]; then
  SRC="$ROOT/client/src"
elif [ -d "$ROOT/src" ]; then
  SRC="$ROOT/src"
else
  echo "Could not find src folder (looked for client/src or src). Create it and re-run."
  exit 1
fi

mkdir -p "$SRC/providers" "$SRC/pages" "$SRC/components"

# --- create Auth0Provider.tsx ---
cat > "$SRC/providers/Auth0Provider.tsx" << 'TSX'
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
      onRedirectCallback={(appState) => {
        const to = (appState && (appState as any).returnTo) || "/dashboard";
        navigate(to);
      }}
    >
      {children}
    </Auth0Provider>
  );
}
TSX

# --- create AuthPage.tsx ---
cat > "$SRC/pages/AuthPage.tsx" << 'TSX'
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { loginWithRedirect } = useAuth0();
  const [, setLocation] = useLocation();

  return (
    <div style={{ maxWidth: 520, margin: "64px auto", textAlign: "center" }}>
      <h1>Sign in</h1>
      <p>You’ll be redirected to our secure sign-in page.</p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
        <button
          onClick={() =>
            loginWithRedirect({
              appState: { returnTo: "/dashboard" },
            })
          }
          data-testid="auth-continue"
        >
          Continue
        </button>
        <button
          onClick={() => setLocation("/?showCode=1")}
          style={{ background: "transparent", border: "1px solid #ccc" }}
          data-testid="auth-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
TSX

# --- create AuthCallback.tsx ---
cat > "$SRC/pages/AuthCallback.tsx" << 'TSX'
import React, { useEffect } from "react";

export default function AuthCallback() {
  // The Auth0Provider parses the callback; we render nothing.
  useEffect(() => {
    // Optionally show a "Completing sign-in..." indicator.
  }, []);
  return null;
}
TSX

# --- create ProtectedRoute.tsx ---
cat > "$SRC/components/ProtectedRoute.tsx" << 'TSX'
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return null; // or your spinner
  if (!isAuthenticated) return <Redirect to="/auth" />;
  return <>{children}</>;
}
TSX

echo "✅ Created/updated:"
echo "  - $SRC/providers/Auth0Provider.tsx"
echo "  - $SRC/pages/AuthPage.tsx"
echo "  - $SRC/pages/AuthCallback.tsx"
echo "  - $SRC/components/ProtectedRoute.tsx"

echo ""
echo "Next steps:"
echo "  1) Wire the provider at your app root (wrap <App /> with <HIAuth0Provider>)"
echo "  2) Add routes for /auth and /auth/callback"
echo "  3) Wrap protected routes in <ProtectedRoute>"
echo "  4) Ensure your Auth0 SPA settings (Allowed URLs / Origins) match your env"
