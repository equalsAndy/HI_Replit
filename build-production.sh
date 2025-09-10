#!/bin/bash
# Fast Production Build Script
# Builds locally with production environment variables, then uses fast Docker deployment

set -e

echo "🏗️ Building locally with production environment variables..."

# Set production environment variables for frontend build
export VITE_AUTH0_CLIENT_ID="c28c7gpoPuIrmPrP85NMqtCYhige5Qd9"
export VITE_AUTH0_DOMAIN="auth.heliotropeimaginal.com"  
export VITE_AUTH0_AUDIENCE="https://api.heliotropeimaginal.com"
export VITE_AUTH0_REDIRECT_URI="https://app2.heliotropeimaginal.com/auth/callback"

echo "✅ Production environment variables set:"
echo "   VITE_AUTH0_CLIENT_ID: $VITE_AUTH0_CLIENT_ID"
echo "   VITE_AUTH0_DOMAIN: $VITE_AUTH0_DOMAIN"
echo "   VITE_AUTH0_AUDIENCE: $VITE_AUTH0_AUDIENCE"
echo "   VITE_AUTH0_REDIRECT_URI: $VITE_AUTH0_REDIRECT_URI"

# Update version for production
echo "📋 Updating version for production..."
./version-manager.sh production

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Build with production environment variables
echo "🔨 Running production build..."
npm run build:production

echo "✅ Production build complete!"
echo "📁 Built files are in ./dist/"
echo ""
echo "🚀 Ready for fast Docker deployment!"
echo "   Run: echo 'yes' | ./deploy-to-production-fast.sh"