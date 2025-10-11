#!/usr/bin/env bash
set -euo pipefail

echo "==> Auth0 & HMR setup starting..."

# Detect package manager (npm assumed; keep simple)
PM="npm"

# 1) Upgrade TypeScript and align React types
echo "==> Ensuring TypeScript >= 5.9 and React types are aligned"
$PM i -D typescript@^5.9 @types/react@latest @types/react-dom@latest

# 2) Install Auth0 React SDK
echo "==> Installing @auth0/auth0-react"
$PM i @auth0/auth0-react

# 3) Create ProtectedRoute (safe overwrite with backup)
PR_DIR="src/components/core"
PR_FILE="$PR_DIR/ProtectedRoute.tsx"
mkdir -p "$PR_DIR"
if [[ -f "$PR_FILE" ]]; then
  cp "$PR_FILE" "$PR_FILE.bak.$(date +%s)"
  echo "Backed up existing ProtectedRoute.tsx -> $PR_FILE.bak.*"
fi

cat > "$PR_FILE" <<'TSX'
import { PropsWithChildren } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return null;
  if (!isAuthenticated) {
    void loginWithRedirect();
    return null;
  }
  return <>{children}</>;
}
TSX
echo "Wrote $PR_FILE"

# 4) Vite config: add server/HMR block if file exists, else create example
VITE_CFG="vite.config.ts"
if [[ -f "$VITE_CFG" ]]; then
  cp "$VITE_CFG" "$VITE_CFG.bak.$(date +%s)"
  echo "Backed up existing vite.config.ts -> $VITE_CFG.bak.*"

  # If the file lacks a server block, append one. If present, leave as-is.
  if ! grep -q "server:" "$VITE_CFG"; then
    echo "==> Adding server/HMR block to vite.config.ts"
    cat >> "$VITE_CFG" <<'TS'
// --- Added by setup_auth0.sh ---
export default {
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
    hmr: { host: "localhost", port: 24679, clientPort: 24679 }
  }
};
// --- End added block ---
TS
  else
    echo "vite.config.ts already has a server block. Consider aligning HMR ports to 24679."
  fi
else
  echo "No vite.config.ts found. Writing example to snippets/vite.config.ts.example instead."
fi

# 5) Emit guidance for main.tsx wrapping
MAIN_TS="src/main.tsx"
if [[ -f "$MAIN_TS" ]]; then
  if grep -q "Auth0Provider" "$MAIN_TS"; then
    echo "Auth0Provider already present in src/main.tsx — skipping wrap."
  else
    echo "==> NOTE: src/main.tsx found but not wrapped with Auth0Provider."
    echo "Add this around your <App /> (see snippets/main.wrapper.tsx)."
  fi
else
  echo "No src/main.tsx found. See snippets/main.wrapper.tsx for a working example."
fi

echo "==> Done. Next steps:"
echo " - Copy env/client.env.example -> client/.env and fill in values"
echo " - If you have a backend, copy env/server.env.example -> server/.env"
echo " - Start dev with: bash scripts/run_dev.sh"
