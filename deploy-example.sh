#!/bin/bash

# Example deployment script with version management
# This script shows how to integrate versioning into your deployment pipeline

# Set version based on deployment target
ENVIRONMENT=${1:-staging}
VERSION=${2:-$(date +%Y.%m.%d)}

echo "🚀 Deploying to $ENVIRONMENT with version $VERSION"

# Update version for the target environment
./update-version.sh $VERSION $ENVIRONMENT

# Build the application
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build:production
elif [ "$ENVIRONMENT" = "staging" ]; then
    npm run build:staging
else
    npm run build
fi

echo "✅ Build complete with version badges:"
echo "   - DEV will show: DEV v$VERSION.$(date +%H%M)"
echo "   - STAGING will show: STAGING v$VERSION.$(date +%H%M)"

# Example Docker deployment (uncomment if using Docker)
# docker build -t myapp:$VERSION .
# docker tag myapp:$VERSION myapp:latest

echo "🎉 Deployment ready!"
