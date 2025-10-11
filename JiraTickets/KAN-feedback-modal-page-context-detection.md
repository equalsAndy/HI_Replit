# KAN - Feedback Modal Page Context Detection Issue

**Issue Type:** Bug  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-07-31

## Summary
Feedback modal shows "Workshop Home" for all pages instead of displaying the correct step name (e.g., "Flow Attributes") when users provide feedback from specific workshop steps.

## Description
The feedback system is not correctly detecting the current workshop step context. When users click the "Give Feedback" button from any workshop step, the modal displays "Is your feedback about Workshop Home?" instead of showing the actual step they're on, such as "Is your feedback about Flow Attributes?".

## Steps to Reproduce
1. Navigate to any AST workshop step (e.g., step 3-4 "Add Flow to Your Star Card")
2. Click the "Give Feedback" button in the navbar
3. Observe the feedback modal header

**Expected:** "Is your feedback about Flow Attributes?"  
**Actual:** "Is your feedback about Workshop Home?"

## Root Cause Analysis
The issue occurs in the page detection flow:

1. **NavBar.tsx** calls `detectCurrentPage(currentStepId)` (line 338)
2. **currentStepId** comes from `useStepContextSafe()` (line 121)  
3. **Step context is not being updated** when users navigate between workshop steps
4. **currentStepId remains null**, causing `detectCurrentPage()` to fallback to "Workshop Home"

## Technical Details

### Current Implementation
```typescript
// NavBar.tsx line 338
<FeedbackTrigger 
  currentPage={detectCurrentPage(currentStepId || undefined)}
  variant="button"
  className="text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
/>
```

### Problem Location
- **StepContext**: `currentStepId` state is not being set when workshop content changes
- **Workshop Pages**: No calls to `setCurrentStepId()` when navigating between steps
- **Page Detection**: Falls back to default "Workshop Home" when step context is missing

### Solution Required
Workshop pages need to update the step context when content changes:

```typescript
// In workshop content components
const { setCurrentStepId } = useStepContext();

useEffect(() => {
  setCurrentStepId('3-4'); // Set appropriate step ID
}, [currentContent, setCurrentStepId]);
```

## Impact
- **User Experience**: Confusing feedback context, users unsure if feedback is about the right page
- **Data Quality**: Feedback may be miscategorized if users assume they're providing feedback about the wrong page
- **Testing**: Beta testers and test users affected during workshop evaluation

## Affected Components
- `client/src/components/layout/NavBar.tsx` - Feedback trigger
- `client/src/components/feedback/FeedbackModal.tsx` - Page context display
- `client/src/contexts/StepContext.tsx` - Step context management
- `client/src/utils/pageContext.ts` - Page detection logic
- `client/src/pages/allstarteams.tsx` - Workshop navigation
- Workshop content components (e.g., `FlowStarCardView.tsx`)

## Files to Modify
1. **Workshop Content Components**: Add `setCurrentStepId()` calls
2. **AllStarTeams Page**: Update step context when `currentContent` changes
3. **Step Mappings**: Ensure all step IDs are correctly mapped in `pageContext.ts`

## Acceptance Criteria
- [ ] Feedback modal displays correct step name for all AST workshop steps
- [ ] Page context updates automatically when users navigate between steps
- [ ] Step context remains accurate during browser refresh
- [ ] IA workshop steps also display correct context (if applicable)
- [ ] Console logs show correct `currentStepId` values during navigation

## Test Cases
1. **Step 3-4 (Flow Attributes)**: Should show "Flow Attributes" not "Workshop Home"
2. **Step 4-1 (Wellbeing)**: Should show "Ladder of Well-being"
3. **Step 5-2 (Holistic Reports)**: Should show "Your Holistic Report"
4. **Navigation**: Context should update when moving between steps
5. **Refresh**: Context should persist after page refresh

## Dependencies
- No external dependencies
- Requires coordination with existing step navigation system
- Should not break current workshop progression logic

## Implementation Notes
- Use existing `useStepContext()` hook and `setCurrentStepId()` function
- Map content keys to step IDs using existing navigation sequence
- Consider adding step context updates to navigation hooks
- Ensure step context updates don't interfere with auto-navigation

## Priority Justification
**Medium Priority** because:
- Affects user experience during feedback collection
- Important for beta testing and quality assurance
- Relatively straightforward fix with existing infrastructure
- Does not block core workshop functionality

## Timeline Estimate
- **Investigation and Planning**: 0.5 days
- **Implementation**: 1 day
- **Testing**: 0.5 day
- **Total**: 2 days

## Success Criteria
- All workshop steps display correct page context in feedback modal
- Step context updates automatically during navigation
- No regression in existing workshop functionality
- Improved feedback data quality and user clarity