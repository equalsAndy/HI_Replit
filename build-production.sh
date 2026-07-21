#!/bin/bash
# Fast Production Build Script
# Builds locally with production environment variables, then uses fast Docker deployment

set -e

echo "🏗️ Building locally with production environment variables..."

# Run build in a subshell to prevent environment variable pollution
(
  # Get production environment variables from AWS Parameter Store
  echo "🔐 Retrieving Auth0 configuration from AWS SSM Parameter Store..."
  export VITE_AUTH0_CLIENT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
  export VITE_AUTH0_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
  export VITE_AUTH0_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)
  export VITE_AUTH0_REDIRECT_URI=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_REDIRECT_URI" --with-decryption --query "Parameter.Value" --output text)

  # Client feature flags are baked into the bundle at build time, so they must be
  # exported here — the container's runtime env cannot switch them on later.
  export VITE_FEATURE_EMAIL_TEMPLATES=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_FEATURE_EMAIL_TEMPLATES" --query "Parameter.Value" --output text 2>/dev/null || echo "false")

  echo "✅ Production environment variables set (in isolated subshell):"
  echo "   VITE_FEATURE_EMAIL_TEMPLATES: $VITE_FEATURE_EMAIL_TEMPLATES"
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
)

echo "✅ Production build complete!"
echo "📁 Built files are in ./dist/"
echo ""
echo "🚀 Ready for Docker deployment!"
echo "   Run: ./deploy-to-production.sh -y"
echo ""
echo "⚠️  Note: dist/ now contains production-built client assets."
echo "   The deploy scripts will auto-rebuild dist/ for dev after pushing."
echo "   If running this standalone, run 'npm run build' afterward to restore dev config."
