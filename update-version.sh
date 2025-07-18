#!/bin/bash

# Update version script
# Usage: ./update-version.sh [version] [environment]

VERSION=${1:-$(date +%Y.%m.%d)}
ENVIRONMENT=${2:-development}
BUILD_NUMBER=$(date +%H%M)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "Updating version to $VERSION build $BUILD_NUMBER for $ENVIRONMENT"

# Update .env.local
cat > .env.local << EOF
# Environment variables for version display
VITE_APP_VERSION=$VERSION
VITE_BUILD_NUMBER=$BUILD_NUMBER
VITE_ENVIRONMENT=$ENVIRONMENT
EOF

# Update public/version.json
cat > public/version.json << EOF
{
  "version": "$VERSION",
  "build": "$BUILD_NUMBER",
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT"
}
EOF

echo "Version updated successfully!"
echo "DEV will show: DEV v$VERSION.$BUILD_NUMBER"
echo "STAGING will show: STAGING v$VERSION.$BUILD_NUMBER"
