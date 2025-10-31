# JIRA TICKET - Remove AST Module 2 Step 2-3

## Ticket Information
**Project:** KAN  
**Type:** Task  
**Priority:** Medium  
**Sprint:** [Current Sprint]  

## Title
Remove Step 2-3 (Rounding Out) from AST Module 2 Navigation

## Description

### Summary
Temporarily remove step 2-3 (Rounding Out reflection) from AST Module 2 navigation flow. This is not a permanent deletion - all code and data must be preserved for potential restoration.

### Current State
**Module 2 Flow:** 2-1 (Star Strengths) → 2-2 (Flow Patterns) → 2-3 (Rounding Out) → 2-4 (Module 2 Recap)  
**Step Count:** 4 steps  
**Progress Display:** "X/4"

### Desired State
**Module 2 Flow:** 2-1 (Star Strengths) → 2-2 (Flow Patterns) → 2-4 (Module 2 Recap)  
**Step Count:** 3 steps  
**Progress Display:** "X/3"

### Technical Details

**Components Affected:**
- Navigation menu (remove 2-3 from sidebar)
- Navigation sequence (2-2 jumps directly to 2-4)
- Content routing (remove 2-3 switch case)
- Component files (archive FlowRoundingOutView.tsx)

**Database Changes:**
- NO schema changes required
- All tables and fields remain intact
- Data collection APIs remain functional
- User data from previous 2-3 completions preserved

**Code Preservation:**
- All code archived to: `archived-components/module-2-step-2-3/`
- README.md created documenting removal and restoration
- No permanent deletions

**Files Modified:**
1. `client/src/data/navigationData.ts` - Remove 2-3 from menu
2. `client/src/components/AllStarTeamsWorkshop.tsx` - Update navigation sequence
3. `client/src/components/AllStarTeamsContent.tsx` - Remove content case
4. `client/src/components/FlowRoundingOutView.tsx` - Move to archive

**Files Created:**
1. `archived-components/module-2-step-2-3/README.md` - Archive documentation
2. `archived-components/module-2-step-2-3/FlowRoundingOutView.tsx` - Archived component

### Important Constraints

**DO NOT:**
- Delete database tables or fields
- Modify backend API endpoints
- Change step numbering (keep 2-1, 2-2, 2-4 IDs)
- Touch holistic report generation code
- Affect IA workshop (this is AST only)

**DO:**
- Archive all code (preserve for restoration)
- Update navigation configuration
- Test thoroughly
- Document changes

### Holistic Report Dependency
Step 2-3 reflection data is used in holistic reports. This dependency will be handled separately in a future task. For now:
- Keep data collection mechanisms intact
- Preserve database fields
- Document that reports may reference missing data

## Acceptance Criteria

### Navigation & UI
- [ ] Step 2-3 "Rounding Out" not visible in navigation menu
- [ ] Module 2 displays "X/3" progress indicator (not "X/4")
- [ ] Navigation flows correctly: 2-1 → 2-2 → 2-4 → 3-1
- [ ] Back navigation works: 2-4 → 2-2 (skips 2-3)
- [ ] "Next" and "Previous" buttons work correctly
- [ ] No visual artifacts where 2-3 used to be

### Visual Indicators
- [ ] Blue rounded highlight on currently viewed step
- [ ] Green checkmarks on completed steps (2-1, 2-2, 2-4)
- [ ] Pulsating dot on next uncompleted step
- [ ] Lock icons on not-yet-accessible steps
- [ ] Module 2 section expands/collapses correctly

### Step Completion & Unlocking
- [ ] Completing 2-1 unlocks 2-2
- [ ] Completing 2-2 unlocks 2-4 (not 2-3)
- [ ] Completing 2-4 unlocks Module 3 (step 3-1)
- [ ] Completing 3-4 unlocks Modules 4 & 5
- [ ] Step completion persists after page refresh

### Data Integrity
- [ ] Navigation progress saves to database correctly
- [ ] Auto-resume loads correct step on workshop re-entry
- [ ] Existing users with 2-3 completion can still navigate
- [ ] No console errors during Module 2 navigation
- [ ] No TypeScript compilation errors

### Code Quality
- [ ] All components archived to `archived-components/module-2-step-2-3/`
- [ ] README.md created in archive with restoration instructions
- [ ] No unused imports in active code
- [ ] No dead code in active codebase
- [ ] Database schema unchanged
- [ ] Backend APIs unchanged

### Regression Testing
- [ ] Module 1 still works correctly (3 steps)
- [ ] Module 3 still works correctly (4 steps)
- [ ] Modules 4-5 unlock correctly after 3-4
- [ ] Overall workshop completion flow intact
- [ ] Other features unaffected

## Implementation Notes

### Development Environment
- Local: localhost:8080
- Database: AWS Lightsail PostgreSQL
- Branch: Create from `development`

### Testing Checklist
1. Manual navigation testing (forward/backward)
2. Step completion testing
3. Module unlocking verification
4. Visual indicator verification
5. Data persistence checks
6. Console error monitoring
7. Regression testing (other modules)

### Claude Code Prompts
Implementation prompts available at:
`/Claude Code Prompts/module-2-step-2-3-removal/`

Files:
1. `01-archive-and-remove-navigation.txt` - Main implementation
2. `02-testing-verification.txt` - Testing procedures
3. `README.md` - Complete implementation guide

## Related Links

**Confluence Documentation:**
- AST Workshop Structure (update after implementation)
- Navigation System Documentation

**Archive Location:**
- `archived-components/module-2-step-2-3/` (local)
- Git history preserves full change log

**Related Tickets:**
- [Future] Handle holistic report when 2-3 data missing
- [Future] Restore step 2-3 (if needed)

## Notes

### Why This Change?
[TO BE FILLED - Add business/product reasoning]

### Restoration Considerations
This is a temporary removal. Restoration is possible by:
1. Following instructions in archived README.md
2. Moving files back from archive
3. Updating same configuration files
4. Testing thoroughly

If step 2-3 is replaced (not restored):
- Can reuse 2-3 step ID for new content
- Archive serves as reference for old implementation
- Maintain navigation sequence logic

### Time Estimate
- Implementation: 30-45 minutes
- Testing: 15-20 minutes
- Documentation: 10 minutes
- **Total:** ~60-75 minutes

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Testing completed and documented
- [ ] Changes merged to development branch
- [ ] Deployed to staging environment
- [ ] Staging testing passed
- [ ] Confluence documentation updated
- [ ] Ticket marked as complete

## Labels
`ast-workshop`, `navigation`, `refactoring`, `temporary-change`, `module-2`

## Assignee
[TO BE ASSIGNED]

## Reporter
Brad Topliff

## Created
[INSERT DATE]

## Updated
[AUTO-UPDATES]
