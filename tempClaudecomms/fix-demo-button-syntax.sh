#!/bin/bash
# Fix malformed demo button syntax
# Date: 2025-01-26

# Find all files with the malformed pattern
echo "Fixing malformed demo button syntax..."

# Fix the triple pattern
find client/src -name "*.tsx" -type f -exec grep -l "{shouldShowDemoButtons {isTestUser && ({isTestUser && (" {} \; | while read file; do
    echo "Fixing: $file"
    sed -i '' 's/{shouldShowDemoButtons {isTestUser && ({isTestUser && ( (/{shouldShowDemoButtons && (/g' "$file"
done

# Also check for other variations
find client/src -name "*.tsx" -type f -exec grep -l "{isTestUser &&" {} \; | while read file; do
    echo "Checking: $file"
    # Only fix if it's still using isTestUser
    if grep -q "const isTestUser = useTestUser();" "$file"; then
        echo "Still using old pattern in: $file"
    fi
done

echo "Fix complete!"