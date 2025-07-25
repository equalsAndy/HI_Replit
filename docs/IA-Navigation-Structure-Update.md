# IA Workshop Navigation Menu Structure Update

## Issue Summary
**Type:** Bug/Enhancement  
**Priority:** High  
**Component:** IA Workshop Navigation  
**Affects:** Imaginal Agility workshop user experience

## Problem Description
The current IA workshop navigation structure does not match the Confluence documentation. The navigation menu is missing sections and has incorrect naming, leading to:
- Inconsistent user experience 
- Missing content sections that users cannot access
- Incorrect section titles that don't match documentation

## Current vs Required Structure

### Current Structure (7 sections, 26 steps)
```
Section 1: WELCOME (2 steps)
Section 2: THE I4C MODEL (2 steps) 
Section 3: LADDER OF IMAGINATION (6 steps)
Section 4: ADVANCED LADDER OF IMAGINATION (6 steps)
Section 5: OUTCOMES & BENEFITS (5 steps)
Section 6: QUARTERLY TUNE-UP (3 steps)
Section 7: ADDITIONAL INFO (2 steps) ❌ INCORRECT NAME
```

### Required Structure (8 sections, 28 steps)
```
Section 1: WELCOME (2 steps) ✅ CORRECT
Section 2: THE I4C MODEL (2 steps) ✅ CORRECT
Section 3: LADDER OF IMAGINATION (6 steps) ✅ CORRECT
Section 4: ADVANCED LADDER OF IMAGINATION (6 steps) ✅ CORRECT
Section 5: OUTCOMES & BENEFITS (5 steps) ✅ CORRECT
Section 6: QUARTERLY TUNE-UP (3 steps) ✅ CORRECT
Section 7: TEAM LADDER OF IMAGINATION (2 steps) ❌ NEEDS RENAME + CONTENT UPDATE
Section 8: MORE INFO (2 steps) ❌ MISSING SECTION
```

## Detailed Changes Required

### 1. Section 7 Updates
**Current:** "ADDITIONAL INFO"  
**Required:** "TEAM LADDER OF IMAGINATION"

**Steps to Update:**
- `ia-7-1`: Change from current content to "Team Ladder Overview" (video)
- `ia-7-2`: Change from current content to "Whiteboard Link" (interactive)

### 2. Section 8 Addition
**New Section:** "MORE INFO" (id: '8')  
**Default State:** `expanded: false`

**Steps to Add:**
- `ia-8-1`: "The Neuroscience of Imagination" (video, contentKey: 'ia-8-1')
- `ia-8-2`: "About Heliotrope Imaginal" (video, contentKey: 'ia-8-2')

### 3. Content Key Validation
**Task:** Verify all contentKey values match their respective component implementations
- Review each step's contentKey in navigationData.ts
- Cross-reference with actual content components
- Update any mismatched keys

## Technical Implementation

### Files to Modify
1. **Primary File:** `/client/src/components/navigation/navigationData.ts`
   - Update Section 7 title and steps
   - Add Section 8 with new steps
   - Verify all contentKey values

2. **Validation Files:**
   - Check content components exist for new contentKeys
   - Update progression logic if needed for new steps
   - Verify menu expansion logic handles 8 sections

### Implementation Steps
1. **Update navigationData.ts**
   ```typescript
   // Section 7 - Update existing
   {
     id: '7',
     title: 'TEAM LADDER OF IMAGINATION', // Changed from 'ADDITIONAL INFO'
     expanded: false,
     steps: [
       { 
         id: 'ia-7-1', 
         title: 'Team Ladder Overview', 
         type: 'video',
         contentKey: 'ia-7-1'
       },
       { 
         id: 'ia-7-2', 
         title: 'Whiteboard Link', 
         type: 'interactive',
         contentKey: 'ia-7-2'
       }
     ]
   },
   // Section 8 - Add new
   {
     id: '8',
     title: 'MORE INFO',
     expanded: false,
     steps: [
       { 
         id: 'ia-8-1', 
         title: 'The Neuroscience of Imagination', 
         type: 'video',
         contentKey: 'ia-8-1'
       },
       { 
         id: 'ia-8-2', 
         title: 'About Heliotrope Imaginal', 
         type: 'video',
         contentKey: 'ia-8-2'
       }
     ]
   }
   ```

2. **Update Progression Logic**
   - Review unlock conditions for ia-7-1, ia-7-2, ia-8-1, ia-8-2
   - Ensure new steps integrate properly with existing progression system
   - Update any hardcoded step counts (currently 26 → should be 28)

3. **Create/Verify Content Components**
   - Ensure content components exist for ia-7-1, ia-7-2, ia-8-1, ia-8-2
   - Create placeholder components if they don't exist
   - Verify contentKey mapping works correctly

## Testing Requirements

### Functional Testing
- [ ] Navigation displays 8 sections with correct titles
- [ ] Section 7 shows "TEAM LADDER OF IMAGINATION" 
- [ ] Section 8 shows "MORE INFO" with 2 steps
- [ ] All 28 steps are accessible and clickable when unlocked
- [ ] Content loads correctly for all steps
- [ ] Progression logic works with new step count

### Regression Testing  
- [ ] Existing sections 1-6 remain unchanged
- [ ] Menu expansion/collapse still works
- [ ] Step unlocking progression still works
- [ ] Progress bar shows correct total (28 steps)
- [ ] No broken contentKey references

## Acceptance Criteria
1. ✅ Section 7 renamed to "TEAM LADDER OF IMAGINATION"
2. ✅ Section 7 contains correct steps (Team Ladder Overview, Whiteboard Link)
3. ✅ Section 8 "MORE INFO" added with 2 video steps
4. ✅ All contentKey values reference valid content components
5. ✅ Total step count updated from 26 to 28
6. ✅ Navigation progression logic works with new structure
7. ✅ No regression in existing functionality

## Risk Assessment
**Low Risk:** This is primarily a configuration change to navigationData.ts
**Potential Issues:**
- Missing content components for new contentKeys
- Hardcoded step counts in progression logic
- UI layout issues with 8 sections vs 7

## Related Work
- **Depends on:** Current IA navigation system
- **Blocks:** KAN-112 (Progressive Menu Expansion) - should implement this structure first
- **Related:** KAN-108 (Update IA Menu System to Match New Content Structure)

## Implementation Priority
**Should be completed BEFORE:** KAN-112 (Progressive Menu Expansion)  
**Reason:** No point implementing progressive expansion on incorrect structure

---

**Created:** 2025-01-24  
**Status:** Ready for Implementation  
**Estimated Effort:** 2-4 hours  
**Component:** IA Workshop Navigation System