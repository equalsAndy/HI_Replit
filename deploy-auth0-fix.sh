#!/bin/bash
# Complete Auth0 Production Fix Deployment
# Builds with production environment variables, then deploys quickly

set -e

echo "🎯 Complete Auth0 Production Fix Deployment"
echo "============================================"

# Step 1: Build with production environment variables
echo "📋 Step 1: Building with production Auth0 configuration..."
./build-production.sh

# Verify build completed
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Error: Frontend build failed - index.html not found!"
    exit 1
fi

echo "✅ Build verification: Frontend files ready"
ls -la dist/public/

# Step 2: Deploy to production
echo ""
echo "📋 Step 2: Deploying to production..."
echo "yes" | ./deploy-to-production-fast.sh

echo ""
echo "🎉 Auth0 fix deployment complete!"
echo "🌐 Production URL: https://app2.heliotropeimaginal.com/"
echo "🔧 Expected changes:"
echo "   ✅ Version updated from 2.0.4 to 2.5.4"  
echo "   ✅ Auth0 client ID: c28c7gpoPuIrmPrP85NMqtCYhige5Qd9 (production)"
echo "   ✅ Auth0 callback URL: https://app2.heliotropeimaginal.com/auth/callback"