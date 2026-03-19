#!/bin/bash

# Semantic Version Manager
# Usage: ./version-manager.sh [environment] [version_type]
# version_type: major, minor, patch, or specific version like "2.1.3"
#
# Semantic Versioning (SemVer) — MAJOR.MINOR.PATCH
# ─────────────────────────────────────────────────
#  MAJOR  — Breaking changes or significant rewrites (e.g. 2.x.x → 3.0.0)
#  MINOR  — New features added, backwards-compatible  (e.g. 2.7.x → 2.8.0)
#  PATCH  — Auto-incremented on every production deploy
#
# Dev builds: version from version.json + incrementing build number + git hash
# Production deploys: auto-bump patch + git hash (no build number needed)
# ─────────────────────────────────────────────────
# Examples:
#   ./version-manager.sh production            → auto-bumps patch (2.10.0 → 2.10.1)
#   ./version-manager.sh development           → keeps version, increments build number
#   ./version-manager.sh production minor      → bumps minor (2.10.x → 2.11.0)
#   ./version-manager.sh production major      → bumps major (2.x.x → 3.0.0)
#   ./version-manager.sh production 2.11.0     → sets exact version

ENVIRONMENT=${1:-development}
VERSION_TYPE=${2:-patch}

# Single source of truth: version.json
VERSION_JSON="version.json"

# Read current version and build from version.json
if [ -f "$VERSION_JSON" ]; then
    CURRENT_VERSION=$(node -p "JSON.parse(require('fs').readFileSync('$VERSION_JSON', 'utf8')).version")
    CURRENT_BUILD=$(node -p "JSON.parse(require('fs').readFileSync('$VERSION_JSON', 'utf8')).build || 0" 2>/dev/null || echo "0")
else
    CURRENT_VERSION="2.10.0"
    CURRENT_BUILD="0"
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

# Get git short hash and branch for exact code identification
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Determine version based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # Specific version provided (e.g., ./version-manager.sh production 3.0.0)
        VERSION="$VERSION_TYPE"
        echo "🎯 Production version: v$VERSION ($GIT_HASH) — set explicitly"
    else
        # Auto-increment (default: patch)
        VERSION=$(increment_version "$CURRENT_VERSION" "$VERSION_TYPE")
        echo "🎯 Production version: v$VERSION ($GIT_HASH) — $VERSION_TYPE auto-incremented from $CURRENT_VERSION"
    fi
    BUILD_NUMBER=""
else
    # Development: use current version from version.json, increment build number
    VERSION="$CURRENT_VERSION"
    BUILD_NUMBER=$((CURRENT_BUILD + 1))
    echo "💻 Development version: v$VERSION build $BUILD_NUMBER ($GIT_HASH)"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "Updating version to v$VERSION ($GIT_HASH) for $ENVIRONMENT"

# Update .env.local
cat > .env.local << EOF
# Environment variables for version display
VITE_APP_VERSION=$VERSION
VITE_GIT_HASH=$GIT_HASH
VITE_ENVIRONMENT=$ENVIRONMENT
EOF

# Create client/public directory if it doesn't exist
mkdir -p client/public

# Build the version JSON (include build number for dev, omit for production)
if [ -n "$BUILD_NUMBER" ]; then
    VERSION_CONTENT="{
  \"version\": \"$VERSION\",
  \"build\": \"$BUILD_NUMBER\",
  \"gitHash\": \"$GIT_HASH\",
  \"gitBranch\": \"$GIT_BRANCH\",
  \"timestamp\": \"$TIMESTAMP\",
  \"environment\": \"$ENVIRONMENT\"
}"
else
    VERSION_CONTENT="{
  \"version\": \"$VERSION\",
  \"gitHash\": \"$GIT_HASH\",
  \"gitBranch\": \"$GIT_BRANCH\",
  \"timestamp\": \"$TIMESTAMP\",
  \"environment\": \"$ENVIRONMENT\"
}"
fi

# Write to both version.json locations
echo "$VERSION_CONTENT" > client/public/version.json
echo "$VERSION_CONTENT" > public/version.json

echo "✅ Version updated: v$VERSION ($GIT_HASH)"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔒 PRODUCTION: v$VERSION ($GIT_HASH)"
else
    echo "💻 DEV: v$VERSION build $BUILD_NUMBER ($GIT_HASH)"
fi
