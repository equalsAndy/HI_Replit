#!/bin/bash

# Semantic Version Manager
# Usage: 
#   ./update-version.sh                    # Build only - increment build number
#   ./update-version.sh patch              # Task/bug fix - increment patch (2.3.x)
#   ./update-version.sh minor              # Feature - increment minor (2.x.0) 
#   ./update-version.sh major              # Major release - increment major (x.0.0)
#   ./update-version.sh [version]          # Set specific version (e.g., 2.5.3)

BUMP_TYPE=${1:-build}
ENVIRONMENT=${2:-development}
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Read current version from version.json
if [ -f "version.json" ]; then
    CURRENT_VERSION=$(node -p "JSON.parse(require('fs').readFileSync('version.json', 'utf8')).version")
    CURRENT_BUILD=$(node -p "JSON.parse(require('fs').readFileSync('version.json', 'utf8')).buildNumber || '1'")
    echo "Current version: $CURRENT_VERSION build $CURRENT_BUILD"
else
    # Initialize with current version
    CURRENT_VERSION="2.4.70"
    CURRENT_BUILD="1"
    echo "Initializing version: $CURRENT_VERSION"
fi

# Parse current version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Determine new version and build number based on bump type
case $BUMP_TYPE in
    "build")
        # Build only - increment build number, keep version same
        VERSION="$CURRENT_VERSION"
        BUILD_NUMBER=$((CURRENT_BUILD + 1))
        echo "Build increment: $VERSION build $BUILD_NUMBER"
        ;;
    "patch")
        # Task/bug fix - increment patch, reset build
        PATCH=$((PATCH + 1))
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        BUILD_NUMBER="1"
        echo "Patch increment: $VERSION (task/bug fix)"
        ;;
    "minor")
        # Feature - increment minor, reset patch and build
        MINOR=$((MINOR + 1))
        PATCH="0"
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        BUILD_NUMBER="1"
        echo "Minor increment: $VERSION (new feature)"
        ;;
    "major")
        # Major release - increment major, reset minor, patch, and build
        MAJOR=$((MAJOR + 1))
        MINOR="0"
        PATCH="0"
        VERSION="${MAJOR}.${MINOR}.${PATCH}"
        BUILD_NUMBER="1"
        echo "Major increment: $VERSION (breaking changes)"
        ;;
    *)
        # Custom version provided
        if [[ $BUMP_TYPE =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            VERSION="$BUMP_TYPE"
            BUILD_NUMBER="1"
            echo "Custom version: $VERSION"
        else
            echo "Error: Invalid version format. Use 'build', 'patch', 'minor', 'major', or semantic version (e.g., 2.5.3)"
            exit 1
        fi
        ;;
esac

echo "Updating to version $VERSION build $BUILD_NUMBER for $ENVIRONMENT"

# Update version.json with new version and build
node -e "
    const fs = require('fs');
    let data = {};
    try {
        data = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    } catch (e) {
        data = {};
    }
    data.version = '$VERSION';
    data.buildNumber = '$BUILD_NUMBER';
    data.lastUpdated = new Date().toISOString();
    if ('$BUMP_TYPE' === 'patch') {
        data.description = 'Task/bug fix update';
    } else if ('$BUMP_TYPE' === 'minor') {
        data.description = 'New feature release';
    } else if ('$BUMP_TYPE' === 'major') {
        data.description = 'Major version release';
    } else if ('$BUMP_TYPE' === 'build') {
        data.description = data.description || 'Build increment';
    }
    fs.writeFileSync('version.json', JSON.stringify(data, null, 2));
"

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
echo "STAGING will show: STAGING v$VERSION.$BUILD_NUMBER"

# Show usage examples
if [ "$BUMP_TYPE" = "build" ]; then
    echo ""
    echo "Next time use:"
    echo "  ./update-version.sh patch     # For task/bug fix (2.3.x)"
    echo "  ./update-version.sh minor     # For new feature (2.x.0)"  
    echo "  ./update-version.sh major     # For breaking changes (x.0.0)"
fi