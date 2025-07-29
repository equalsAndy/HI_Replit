#!/bin/bash

# Update version script
# Usage: ./update-version.sh [version] [environment]

ENVIRONMENT=${2:-development}
BUILD_NUMBER=$(date +%H%M)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# For development, check if we have a set version, otherwise use date
if [ "$ENVIRONMENT" = "development" ] && [ -f "dev-version.txt" ] && [ -z "$1" ]; then
    VERSION=$(cat dev-version.txt)
    echo "Using stored development version: $VERSION"
else
    VERSION=${1:-$(date +%Y.%m.%d)}
fi

echo "Updating version to $VERSION build $BUILD_NUMBER for $ENVIRONMENT"

# Store the version for development if manually set
if [ "$ENVIRONMENT" = "development" ] && [ -n "$1" ]; then
    echo "$VERSION" > dev-version.txt
    echo "Stored development version: $VERSION"
fi

# Update .env.local
cat > .env.local << EOF
# Environment variables for version display
VITE_APP_VERSION=$VERSION
VITE_BUILD_NUMBER=$BUILD_NUMBER
VITE_ENVIRONMENT=$ENVIRONMENT
EOF

# Create client/public directory if it doesn't exist
mkdir -p client/public

# Update client/public/version.json (for Vite dev server)
cat > client/public/version.json << EOF
{
  "version": "$VERSION",
  "build": "$BUILD_NUMBER",
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT"
}
EOF

# Update public/version.json (for production builds)
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