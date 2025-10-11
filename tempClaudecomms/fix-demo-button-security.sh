#!/bin/bash

# Fix demo button security issues - replace isTestUser with shouldShowDemoButtons
# This addresses the issue where demo buttons weren't working

echo "🔧 Fixing demo button security checks..."

# Define the files that need to be fixed
files=(
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/flow/FlowAssessment.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/flow/RoundingOutReflection.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/reflection/StepByStepReflection.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/assessment/ImaginalAgilityAssessmentModal.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/assessment/AssessmentModal.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/assessment/ImaginalAgilityAssessment.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/FinalReflectionView.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/FlowRoundingOutView.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_4_6_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_3_6_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_4_3_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_4_5_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_4_4_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/ImaginationAssessmentContent.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_4_2_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_3_4_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/imaginal-agility/steps/IA_3_2_Content.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/VisualizingYouView.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/ReflectionView.tsx"
    "/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/CantrilLadderView.tsx"
)

# Fix each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing: $file"
        # Replace the isTestUser check with shouldShowDemoButtons
        sed -i '' 's/if (!isTestUser)/if (!shouldShowDemoButtons)/g' "$file"
        echo "✅ Fixed $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo "🎉 Demo button security fixes complete!"
echo "All demo buttons should now work properly for test users."