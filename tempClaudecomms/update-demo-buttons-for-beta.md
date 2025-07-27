# Update Demo Buttons for Beta Tester Feature

## Files that need updating:

All files currently using `const isTestUser = useTestUser();` need to be updated to:
```javascript
const { shouldShowDemoButtons } = useTestUser();
```

And replace `{isTestUser && (` with `{shouldShowDemoButtons && (`

## Files to update:
1. /client/src/components/content/imaginal-agility/steps/IA_4_4_Content.tsx
2. /client/src/components/content/imaginal-agility/steps/IA_4_6_Content.tsx
3. /client/src/components/content/imaginal-agility/steps/IA_3_3_Content.tsx
4. /client/src/components/content/imaginal-agility/steps/IA_3_2_Content.tsx
5. /client/src/components/content/imaginal-agility/steps/IA_3_4_Content.tsx
6. /client/src/components/content/imaginal-agility/steps/IA_4_5_Content.tsx
7. /client/src/components/content/imaginal-agility/steps/IA_4_3_Content.tsx
8. /client/src/components/content/imaginal-agility/steps/IA_4_2_Content.tsx
9. /client/src/components/content/imaginal-agility/steps/IA_3_6_Content.tsx
10. /client/src/components/assessment/ImaginalAgilityAssessment.tsx
11. /client/src/components/reflection/StepByStepReflection.tsx
12. /client/src/components/content/FinalReflectionView.tsx
13. /client/src/components/content/VisualizingYouView.tsx
14. /client/src/components/content/FlowRoundingOutView.tsx
15. /client/src/components/content/CantrilLadderView.tsx
16. /client/src/components/flow/RoundingOutReflection.tsx