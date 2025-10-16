#!/bin/bash
# Verify Development Environment Configuration
# Run this after production deployments to ensure dev environment is clean

echo "🔍 Verifying Development Environment Configuration..."
echo ""

# Check for production environment variables in current shell
echo "1️⃣ Checking for leaked production variables in shell..."
if [ -n "$VITE_AUTH0_CLIENT_ID" ]; then
  echo "   ⚠️  WARNING: VITE_AUTH0_CLIENT_ID is set in shell: $VITE_AUTH0_CLIENT_ID"
  echo "   This may override your .env files!"
else
  echo "   ✅ No VITE_AUTH0_CLIENT_ID in shell environment"
fi

if [ -n "$VITE_AUTH0_REDIRECT_URI" ]; then
  echo "   ⚠️  WARNING: VITE_AUTH0_REDIRECT_URI is set in shell: $VITE_AUTH0_REDIRECT_URI"
  if [[ "$VITE_AUTH0_REDIRECT_URI" == *"app2.heliotropeimaginal.com"* ]]; then
    echo "   🚨 PRODUCTION REDIRECT URI DETECTED! This will break local auth!"
    echo "   Run: unset VITE_AUTH0_REDIRECT_URI"
  fi
else
  echo "   ✅ No VITE_AUTH0_REDIRECT_URI in shell environment"
fi

echo ""
echo "2️⃣ Checking development .env files..."

# Check client/.env.development
if [ -f "client/.env.development" ]; then
  echo "   ✅ client/.env.development exists"
  REDIRECT_URI=$(grep "VITE_AUTH0_REDIRECT_URI" client/.env.development | cut -d '=' -f2)
  if [[ "$REDIRECT_URI" == *"localhost:8080"* ]]; then
    echo "   ✅ Redirect URI is set to localhost: $REDIRECT_URI"
  else
    echo "   ⚠️  WARNING: Redirect URI in .env.development: $REDIRECT_URI"
  fi
else
  echo "   ❌ client/.env.development NOT FOUND"
fi

# Check client/.env
if [ -f "client/.env" ]; then
  echo "   ✅ client/.env exists"
  REDIRECT_URI=$(grep "VITE_AUTH0_REDIRECT_URI" client/.env | cut -d '=' -f2)
  if [[ "$REDIRECT_URI" == *"localhost:8080"* ]]; then
    echo "   ✅ Redirect URI is set to localhost: $REDIRECT_URI"
  else
    echo "   ⚠️  WARNING: Redirect URI in .env: $REDIRECT_URI"
  fi
else
  echo "   ❌ client/.env NOT FOUND"
fi

echo ""
echo "3️⃣ Testing what Vite would load..."
cd client
NODE_ENV=development npx vite --version > /dev/null 2>&1
if command -v node &> /dev/null; then
  # Create a temporary test to see what env vars Vite would load
  LOADED_REDIRECT=$(NODE_ENV=development node -e "
    const dotenv = require('dotenv');
    const path = require('path');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    console.log(process.env.VITE_AUTH0_REDIRECT_URI || 'NOT_SET');
  " 2>/dev/null)

  if [[ "$LOADED_REDIRECT" == *"localhost:8080"* ]]; then
    echo "   ✅ Vite would load localhost redirect: $LOADED_REDIRECT"
  else
    echo "   ⚠️  Vite would load: $LOADED_REDIRECT"
  fi
fi
cd ..

echo ""
echo "4️⃣ Recommendations..."
if [ -n "$VITE_AUTH0_CLIENT_ID" ] || [ -n "$VITE_AUTH0_REDIRECT_URI" ]; then
  echo "   🔧 Clear your shell environment variables:"
  echo "      unset VITE_AUTH0_CLIENT_ID"
  echo "      unset VITE_AUTH0_DOMAIN"
  echo "      unset VITE_AUTH0_AUDIENCE"
  echo "      unset VITE_AUTH0_REDIRECT_URI"
  echo ""
  echo "   Or start a fresh terminal session"
else
  echo "   ✅ Environment looks good!"
  echo "   You can safely run: npm run dev:hmr"
fi

echo ""
echo "Done! 🎉"
