#!/bin/bash
# Update all files to use new useTestUser hook structure
# Date: 2025-01-26

# Find all TypeScript files that use the old pattern
files=$(find client/src -name "*.tsx" -type f -exec grep -l "const isTestUser = useTestUser()" {} \;)

echo "Found $(echo "$files" | wc -l) files to update"

for file in $files; do
    echo "Updating: $file"
    
    # Replace the hook usage
    sed -i '' 's/const isTestUser = useTestUser();/const { shouldShowDemoButtons } = useTestUser();/g' "$file"
    
    # Replace the conditional rendering
    sed -i '' 's/{isTestUser && (/{shouldShowDemoButtons && (/g' "$file"
    
    # Handle cases with extra spaces
    sed -i '' 's/{isTestUser  && (/{shouldShowDemoButtons && (/g' "$file"
    sed -i '' 's/{ isTestUser && (/{shouldShowDemoButtons && (/g' "$file"
done

echo "Update complete!"