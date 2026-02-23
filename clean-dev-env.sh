#!/bin/bash
# Clean Development Environment
# Run this if you suspect production environment variables are polluting your dev environment

echo "🧹 Cleaning Development Environment..."
echo ""

# Unset all Auth0 environment variables
echo "Unsetting Auth0 environment variables..."
unset VITE_AUTH0_CLIENT_ID
unset VITE_AUTH0_DOMAIN
unset VITE_AUTH0_AUDIENCE
unset VITE_AUTH0_REDIRECT_URI
unset VITE_AUTH0_CLIENT_ID_DEV
unset VITE_AUTH0_CLIENT_ID_STAGING
unset VITE_AUTH0_CLIENT_ID_PROD

# Rebuild client to clear any baked-in production values
echo ""
echo "🔨 Rebuilding client with fresh development configuration..."
cd client
rm -rf node_modules/.vite
rm -rf ../dist/public
echo "   ✅ Cleared Vite cache"

echo ""
echo "✅ Development environment cleaned!"
echo ""
echo "Next steps:"
echo "   1. Close this terminal and open a new one (to ensure clean shell)"
echo "   2. Run: npm run dev:hmr"
echo "   3. Test login - should redirect to localhost:8080/auth/callback"
echo ""
