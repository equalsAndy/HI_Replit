#!/bin/bash

# Update version script
# Usage: ./update-version.sh [version] [environment]

ENVIRONMENT=${2:-development}
BUILD_NUMBER=$(date +%H%M)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# For development, increment semantic version or use provided version
if [ "$ENVIRONMENT" = "development" ] && [ -z "$1" ]; then
    if [ -f "version.json" ]; then
        # Read current version from version.json and increment patch
        CURRENT_VERSION=$(node -p "JSON.parse(require('fs').readFileSync('version.json', 'utf8')).version")
        echo "Current development version: $CURRENT_VERSION"
        
        # Parse version and increment patch
        IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
        MAJOR=${VERSION_PARTS[0]}
        MINOR=${VERSION_PARTS[1]}
        PATCH=${VERSION_PARTS[2]}
        
        # Increment patch version
        PATCH=$((PATCH + 1))
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        echo "Incrementing to: $VERSION"
        
        # Update version.json with new version
        node -e "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('version.json', 'utf8'));
            data.version = '$VERSION';
            data.lastUpdated = new Date().toISOString();
            fs.writeFileSync('version.json', JSON.stringify(data, null, 2));
        "
    else
        # No stored version, start with 2.3.1
        VERSION="2.3.1"
        echo "Initializing development version: $VERSION"
    fi
else
    VERSION=${1:-$(date +%Y.%m.%d)}
fi

echo "Updating version to $VERSION build $BUILD_NUMBER for $ENVIRONMENT"

# Store the version for development if manually set
if [ "$ENVIRONMENT" = "development" ] && [ -n "$1" ]; then
    # Update version.json with manually set version
    node -e "
        const fs = require('fs');
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync('version.json', 'utf8'));
        } catch (e) {
            data = { buildNumber: '1', description: 'Initial version' };
        }
        data.version = '$VERSION';
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync('version.json', JSON.stringify(data, null, 2));
    "
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