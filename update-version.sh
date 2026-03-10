#!/bin/bash

# Semantic Version Manager
# Usage:
#   ./update-version.sh                    # Build only - regenerate derived files
#   ./update-version.sh patch              # Task/bug fix - increment patch (2.3.x)
#   ./update-version.sh minor              # Feature - increment minor (2.x.0)
#   ./update-version.sh major              # Major release - increment major (x.0.0)
#   ./update-version.sh [version]          # Set specific version (e.g., 2.5.3)
#
# Build number increments by 1 on every run, stored in public/version.json.
# Only the semantic version and description are tracked in version.json.

BUMP_TYPE=${1:-build}
ENVIRONMENT=${2:-development}
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Build number: read last build from file, increment by 1
LAST_BUILD=0
if [ -f "public/version.json" ]; then
    LAST_BUILD=$(node -p "JSON.parse(require('fs').readFileSync('public/version.json', 'utf8')).build" 2>/dev/null || echo "0")
fi
BUILD_NUMBER=$((LAST_BUILD + 1))
SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Read current version from version.json
if [ -f "version.json" ]; then
    CURRENT_VERSION=$(node -p "JSON.parse(require('fs').readFileSync('version.json', 'utf8')).version")
    echo "Current version: $CURRENT_VERSION (build #$LAST_BUILD → #$BUILD_NUMBER, $SHORT_SHA)"
else
    # Initialize with current version
    CURRENT_VERSION="2.8.2"
    echo "Initializing version: $CURRENT_VERSION"
fi

# Parse current version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Determine new version based on bump type
case $BUMP_TYPE in
    "build")
        # Build only - keep version same, just regenerate derived files
        VERSION="$CURRENT_VERSION"
        echo "Build refresh: $VERSION build #$BUILD_NUMBER ($SHORT_SHA)"
        ;;
    "patch")
        # Task/bug fix - increment patch
        PATCH=$((PATCH + 1))
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        echo "Patch increment: $VERSION (task/bug fix)"
        ;;
    "minor")
        # Feature - increment minor, reset patch
        MINOR=$((MINOR + 1))
        PATCH="0"
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        echo "Minor increment: $VERSION (new feature)"
        ;;
    "major")
        # Major release - increment major, reset minor and patch
        MAJOR=$((MAJOR + 1))
        MINOR="0"
        PATCH="0"
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        echo "Major increment: $VERSION (breaking changes)"
        ;;
    *)
        # Custom version provided
        if [[ $BUMP_TYPE =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            VERSION="$BUMP_TYPE"
            echo "Custom version: $VERSION"
        else
            echo "Error: Invalid version format. Use 'build', 'patch', 'minor', 'major', or semantic version (e.g., 2.5.3)"
            exit 1
        fi
        ;;
esac

echo "Updating to version $VERSION build #$BUILD_NUMBER for $ENVIRONMENT"

# Update version.json with version and description only (NO buildNumber — derived from git)
if [ "$BUMP_TYPE" != "build" ]; then
    node -e "
        const fs = require('fs');
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync('version.json', 'utf8'));
        } catch (e) {
            data = {};
        }
        data.version = '$VERSION';
        if ('$BUMP_TYPE' === 'patch') {
            data.description = 'Task/bug fix update';
        } else if ('$BUMP_TYPE' === 'minor') {
            data.description = 'New feature release';
        } else if ('$BUMP_TYPE' === 'major') {
            data.description = 'Major version release';
        }
        fs.writeFileSync('version.json', JSON.stringify(data, null, 2) + '\n');
    "
    echo "Updated tracked version.json to $VERSION"
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

# Update client/public/version.json (for Vite dev server — gitignored)
cat > client/public/version.json << EOF
{
  "version": "$VERSION",
  "build": "$BUILD_NUMBER",
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT"
}
EOF

# Update public/version.json (for production builds — gitignored)
cat > public/version.json << EOF
{
  "version": "$VERSION",
  "build": "$BUILD_NUMBER",
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT"
}
EOF

# Update documentation files for semantic version changes (not builds)
update_documentation() {
    local old_version="$1"
    local new_version="$2"

    echo "Updating documentation files with new version..."

    # Files to update with version references
    local doc_files=(
        "README.md"
        "VERSIONING-SYSTEM.md"
        "VERSION_TRACKING.md"
        "docs/SEMANTIC-VERSIONING.md"
        "CLAUDE.md"
    )

    for file in "${doc_files[@]}"; do
        if [ -f "$file" ]; then
            # Update version patterns like "v2.4.70" or "2.4.70"
            sed -i.bak "s/v\?[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*/v$new_version/g" "$file" 2>/dev/null || true
            # Update version in example patterns
            sed -i.bak "s/\"version\": \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/\"version\": \"$new_version\"/g" "$file" 2>/dev/null || true
            # Clean up backup files
            rm -f "$file.bak" 2>/dev/null || true
            echo "  Updated $file"
        fi
    done

    echo "Documentation updated to version $new_version"
}

# Call documentation update for semantic version changes only
if [ "$BUMP_TYPE" != "build" ]; then
    update_documentation "$CURRENT_VERSION" "$VERSION"
fi

echo "Version updated successfully!"
echo "DEV will show: DEV v$VERSION.$BUILD_NUMBER"

# Show usage examples
if [ "$BUMP_TYPE" = "build" ]; then
    echo ""
    echo "Next time use:"
    echo "  ./update-version.sh patch     # For task/bug fix (2.3.x)"
    echo "  ./update-version.sh minor     # For new feature (2.x.0)"
    echo "  ./update-version.sh major     # For breaking changes (x.0.0)"
fi
