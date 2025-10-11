#!/bin/bash
# Fix all malformed demo button patterns
# Date: 2025-01-26

echo "Fixing all demo button patterns..."

# Find and fix the extremely malformed patterns
find client/src -name "*.tsx" -type f | while read file; do
    # Check if file contains the malformed pattern
    if grep -q "{shouldShowDemoButtons {shouldShowDemoButtons" "$file"; then
        echo "Fixing multiple pattern in: $file"
        # Replace any occurrence of multiple nested patterns with single
        sed -i '' 's/{shouldShowDemoButtons {shouldShowDemoButtons.*( (/{shouldShowDemoButtons && (/g' "$file"
    fi
done

echo "Fix complete!"