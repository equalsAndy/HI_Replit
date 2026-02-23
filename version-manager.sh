#!/bin/bash

# Semantic Version Manager
# Usage: ./version-manager.sh [environment] [version_type]
# version_type: major, minor, patch, or specific version like "2.1.3"
#
# Semantic Versioning (SemVer) — MAJOR.MINOR.PATCH
# ─────────────────────────────────────────────────
#  MAJOR  — Breaking changes or significant rewrites (e.g. 2.x.x → 3.0.0)
#            Resets MINOR and PATCH to 0. Reset build number to 1.
#  MINOR  — New features added, backwards-compatible  (e.g. 2.7.x → 2.8.0)
#            Resets PATCH to 0. Reset build number to 1.
#  PATCH  — Bug fixes and small patches               (e.g. 2.8.0 → 2.8.1)
#            Build number increments; no resets needed.
# ─────────────────────────────────────────────────
# Examples:
#   ./version-manager.sh staging minor   → bumps 2.7.x to 2.8.0, build resets to 1
#   ./version-manager.sh staging patch   → bumps 2.8.0 to 2.8.1, build increments
#   ./version-manager.sh staging major   → bumps 2.x.x to 3.0.0, build resets to 1
#   ./version-manager.sh staging 2.8.0  → sets exact version

ENVIRONMENT=${1:-development}
VERSION_TYPE=${2:-patch}

# Staging semantic versioning file
VERSION_FILE="staging-version.txt"

# Initialize version file if it doesn't exist
if [ ! -f "$VERSION_FILE" ]; then
    echo "2.0.1" > "$VERSION_FILE"
fi

# Read current staging version
CURRENT_VERSION=$(cat "$VERSION_FILE")

# Function to increment version
increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -ra VERSION_PARTS <<< "$version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    case $type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            # Specific version provided
            echo "$type"
            return
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

# Determine version based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # Specific version provided
        NEW_VERSION="$VERSION_TYPE"
    else
        # Increment version
        NEW_VERSION=$(increment_version "$CURRENT_VERSION" "$VERSION_TYPE")
    fi
    
    # Save new staging version
    echo "$NEW_VERSION" > "$VERSION_FILE"
    
    VERSION="$NEW_VERSION"
    echo "🚀 Staging version: v$VERSION"
elif [ "$ENVIRONMENT" = "production" ]; then
    # Production uses current staging version
    VERSION=$(cat "$VERSION_FILE")
    echo "🎯 Production version: v$VERSION (from staging)"
else
    # Development uses date-based versioning
    VERSION=$(date +%Y.%m.%d)
    echo "💻 Development version: v$VERSION"
fi

BUILD_NUMBER=$(date +%m%d.%H%M)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "Updating version to v$VERSION build $BUILD_NUMBER for $ENVIRONMENT"

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

echo "✅ Version updated successfully!"

# Display what will show in each environment
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "📱 STAGING will show: STAGING v$VERSION.$BUILD_NUMBER"
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "🔒 PRODUCTION will show: No badge (version in admin only)"
    echo "📊 Admin/Test dashboards will show: v$VERSION.$BUILD_NUMBER"
else
    echo "💻 DEV will show: DEV v$VERSION.$BUILD_NUMBER"
fi

echo ""
echo "Build number format: MMDD.HHMM (e.g., 0725.1045 = July 25, 10:45 AM)"