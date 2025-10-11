#!/bin/bash

# Create Release Script - Option C: Hybrid Approach
# Usage: ./create-release.sh [version_type] [release_title]
# version_type: patch (default), minor, major
# release_title: Custom title for the release

set -e  # Exit on any error

VERSION_TYPE=${1:-patch}
RELEASE_TITLE="$2"
VERSION_FILE="version.json"
HISTORY_FILE="build-history.json"
UPDATES_FILE="VERSION_UPDATES.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Creating new release...${NC}"

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ Invalid version type: $VERSION_TYPE${NC}"
    echo "Usage: ./create-release.sh [patch|minor|major] [release_title]"
    exit 1
fi

# Read current version
if [ ! -f "$VERSION_FILE" ]; then
    echo -e "${RED}❌ version.json not found${NC}"
    exit 1
fi

CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$VERSION_FILE', 'utf8')).version)")
echo -e "${BLUE}📋 Current version: v$CURRENT_VERSION${NC}"

# Calculate new version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $VERSION_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo -e "${GREEN}🎯 New version: v$NEW_VERSION${NC}"

# Get release title if not provided
if [ -z "$RELEASE_TITLE" ]; then
    echo -e "${YELLOW}📝 Enter release title (or press Enter for auto-generated):${NC}"
    read -r RELEASE_TITLE
fi

# Auto-generate title if still empty
if [ -z "$RELEASE_TITLE" ]; then
    case $VERSION_TYPE in
        major)
            RELEASE_TITLE="Major Feature Release"
            ;;
        minor)
            RELEASE_TITLE="Feature Updates & Improvements"
            ;;
        patch)
            RELEASE_TITLE="Bug Fixes & Enhancements"
            ;;
    esac
fi

# Read build history for recent changes
if [ ! -f "$HISTORY_FILE" ]; then
    echo -e "${YELLOW}⚠️ No build history found. Creating release with current changes only.${NC}"
    RECENT_BUILDS="[]"
else
    # Get builds since last release (filter for current major.minor)
    RECENT_BUILDS=$(node -e "
        const history = JSON.parse(require('fs').readFileSync('$HISTORY_FILE', 'utf8'));
        const currentBase = '$CURRENT_VERSION'.split('.').slice(0, 2).join('.');
        const recentBuilds = history.filter(build => build.version === '$CURRENT_VERSION');
        console.log(JSON.stringify(recentBuilds, null, 2));
    ")
fi

# Generate release notes from build descriptions
echo -e "${BLUE}📝 Generating release notes from recent builds...${NC}"

CATEGORIZED_CHANGES=$(node -e "
const builds = $RECENT_BUILDS;
const categories = {
    '🚀': { name: 'New Features', items: [] },
    '🔧': { name: 'Technical Improvements', items: [] },
    '🐛': { name: 'Bug Fixes', items: [] },
    '🎯': { name: 'User Experience', items: [] },
    '🔒': { name: 'Security', items: [] },
    '⚡': { name: 'Performance', items: [] },
    '📚': { name: 'Documentation', items: [] }
};

builds.forEach(build => {
    const desc = build.description;
    
    // Categorize based on keywords
    let category = '🔧'; // Default to technical
    
    if (desc.match(/add|new|create|implement|feature/i)) category = '🚀';
    else if (desc.match(/fix|bug|error|issue|resolve/i)) category = '🐛';
    else if (desc.match(/ui|ux|user|interface|design/i)) category = '🎯';
    else if (desc.match(/security|auth|permission|safe/i)) category = '🔒';
    else if (desc.match(/performance|speed|optimize|fast/i)) category = '⚡';
    else if (desc.match(/doc|readme|guide|comment/i)) category = '📚';
    
    categories[category].items.push('- ' + desc);
});

// Output markdown sections
let output = '';
Object.entries(categories).forEach(([emoji, category]) => {
    if (category.items.length > 0) {
        output += '### ' + emoji + ' ' + category.name + '\n';
        output += category.items.join('\n') + '\n\n';
    }
});

console.log(output || '### 🔧 Technical Improvements\n- Various improvements and updates\n\n');
")

# Create release entry
RELEASE_DATE=$(date +%Y-%m-%d)
RELEASE_ENTRY="## v$NEW_VERSION - $RELEASE_TITLE ($RELEASE_DATE)

$CATEGORIZED_CHANGES### 📁 Files Modified
See git commit history for detailed file changes.

### 🔄 Breaking Changes
None. All changes maintain backward compatibility.

---
"

# Update VERSION_UPDATES.md
if [ ! -f "$UPDATES_FILE" ]; then
    echo -e "${YELLOW}⚠️ $UPDATES_FILE not found. Creating new file.${NC}"
    echo "# Version Updates & Changelog" > "$UPDATES_FILE"
    echo "" >> "$UPDATES_FILE"
fi

# Insert new release at the top (after the header)
echo -e "${BLUE}📄 Updating $UPDATES_FILE...${NC}"

# Create temporary file with new content
{
    # Keep the header
    head -n 2 "$UPDATES_FILE"
    echo ""
    # Add new release
    echo "$RELEASE_ENTRY"
    # Add rest of file (skip first 2 lines)
    tail -n +3 "$UPDATES_FILE"
} > "${UPDATES_FILE}.tmp"

mv "${UPDATES_FILE}.tmp" "$UPDATES_FILE"

# Update version.json
echo -e "${BLUE}🔄 Updating version.json...${NC}"
node -e "
const fs = require('fs');
const versionData = JSON.parse(fs.readFileSync('$VERSION_FILE', 'utf8'));
versionData.version = '$NEW_VERSION';
versionData.buildNumber = '1';
versionData.lastUpdated = new Date().toISOString();
versionData.description = 'Release v$NEW_VERSION - $RELEASE_TITLE';
fs.writeFileSync('$VERSION_FILE', JSON.stringify(versionData, null, 2));
"

# Update .env file
echo -e "${BLUE}📄 Updating .env file...${NC}"
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    # Remove existing version lines and add new ones
    grep -v "^VITE_APP_VERSION=" "$ENV_FILE" | grep -v "^VITE_BUILD_NUMBER=" > "${ENV_FILE}.tmp"
    echo "VITE_APP_VERSION=$NEW_VERSION" >> "${ENV_FILE}.tmp"
    echo "VITE_BUILD_NUMBER=1" >> "${ENV_FILE}.tmp"
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
else
    echo "VITE_APP_VERSION=$NEW_VERSION" > "$ENV_FILE"
    echo "VITE_BUILD_NUMBER=1" >> "$ENV_FILE"
fi

# Clear build history for fresh start
echo "[]" > "$HISTORY_FILE"

echo -e "${GREEN}✅ Release v$NEW_VERSION created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Release Summary:${NC}"
echo -e "  📌 Version: ${GREEN}v$NEW_VERSION${NC}"
echo -e "  📝 Title: ${GREEN}$RELEASE_TITLE${NC}"
echo -e "  📅 Date: ${GREEN}$RELEASE_DATE${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Review changes in ${BLUE}$UPDATES_FILE${NC}"
echo -e "  2. Run ${BLUE}./bump-version.sh \"Initial release build\"${NC} for first build"
echo -e "  3. Test the release thoroughly"
echo -e "  4. Deploy when ready"
echo ""
echo -e "${BLUE}💡 Continue using ${GREEN}node increment-version.mjs \"description\"${NC} for daily builds${NC}"