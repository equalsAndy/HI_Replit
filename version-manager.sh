#!/bin/bash

# Semantic Version Manager
# Usage: ./version-manager.sh [environment] [version_type]
# version_type: major, minor, patch, or specific version like "2.1.3"
#
# Semantic Versioning (SemVer) — MAJOR.MINOR.PATCH
# ─────────────────────────────────────────────────
#  MAJOR  — Breaking changes or significant rewrites (e.g. 2.x.x → 3.0.0)
#  MINOR  — New features added, backwards-compatible  (e.g. 2.7.x → 2.8.0)
#  PATCH  — Bug fixes and small patches               (e.g. 2.8.0 → 2.8.1)
#
# Build numbers are derived from git commit count (not stored in version.json).
# ─────────────────────────────────────────────────
# Examples:
#   ./version-manager.sh staging minor   → bumps 2.7.x to 2.8.0, build resets to 1
#   ./version-manager.sh staging patch   → bumps 2.8.0 to 2.8.1, build increments
#   ./version-manager.sh staging major   → bumps 2.x.x to 3.0.0, build resets to 1
#   ./version-manager.sh staging 2.8.0  → sets exact version

ENVIRONMENT=${1:-development}
VERSION_TYPE=${2:-patch}

# Single source of truth: version.json (managed by update-version.sh)
VERSION_JSON="version.json"

# Read current version from version.json
if [ -f "$VERSION_JSON" ]; then
    CURRENT_VERSION=$(node -p "JSON.parse(require('fs').readFileSync('$VERSION_JSON', 'utf8')).version")
else
    CURRENT_VERSION="2.0.1"
    echo "Warning: version.json not found, using default $CURRENT_VERSION"
fi

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

    VERSION="$NEW_VERSION"
    echo "🚀 Staging version: v$VERSION"
elif [ "$ENVIRONMENT" = "production" ]; then
    # Production uses current version from version.json
    VERSION="$CURRENT_VERSION"
    echo "🎯 Production version: v$VERSION (from version.json)"
else
    # Development uses date-based versioning
    VERSION=$(date +%Y.%m.%d)
    echo "💻 Development version: v$VERSION"
fi

# Derive build number from git commit count (no more stored state to conflict)
BUILD_NUMBER=$(git rev-list --count HEAD 2>/dev/null || echo "0")
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
echo "Build number is derived from git commit count (currently $BUILD_NUMBER commits)"