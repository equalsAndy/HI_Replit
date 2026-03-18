# Workshop Locking System — Current Status

## Summary

The workshop locking system has a **solid backend layer** (schema, middleware, endpoints) and a **partially-wired frontend** for AST, but **zero frontend implementation for IA**. The core gap is that most AST step components in modules 1-3 either don't import the locking hook or don't pass `workshopLocked` to their input components, and IA has no locking wiring at all. The backend will reject writes to locked modules (403), but users can still type into fields — they just get an error on save.

---

## Backend Status

### Schema (`shared/schema.ts`, lines 109-113)

Completion columns exist in the `users` table:

| Column | Type | Default | Line |
|--------|------|---------|------|
| `ast_workshop_completed` | `boolean` | `false` | 110 |
| `ia_workshop_completed` | `boolean` | `false` | 111 |
| `ast_completed_at` | `timestamp` | `null` | 112 |
| `ia_completed_at` | `timestamp` | `null` | 113 |

Insert schema (lines 134-142) also includes these with defaults.

### Endpoints (`server/routes/workshop-data-routes.ts`)

| Endpoint | Method | Line | Auth | Purpose |
|----------|--------|------|------|---------|
| `/completion-status` | GET | 2970 | Yes | Returns all 4 completion fields |
| `/complete-workshop` | POST | 2999 | Yes | Marks workshop as completed |

### `complete-workshop` Logic (lines 2999-3099)

1. Validates `appType` is `'ast'` or `'ia'`
2. Reads `navigationProgress.completedSteps`
3. Checks all required steps are completed
4. Sets completion flag + timestamp in users table
5. **AST only**: Auto-generates StarCard PNG (lines 3079-3087)

### Required Steps

**AST** (line 3037): `['1-1', '1-2', '1-3', '2-1', '2-2', '2-4', '3-1', '3-2', '3-3', '3-4']`
- Note: Step 2-3 removed from workshop (line 3035 comment)

**IA** (line 3038): `['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-5-1', 'ia-6-1', 'ia-8-1']`

### Helper Functions

**`getStepModule()`** (lines 130-144): Parses step ID to module number (1-5). Handles both AST (`2-3`) and IA (`ia-2-3`) patterns.

**`isModuleLocked()`** (lines 152-163):
- **Modules 1-3**: Locked AFTER workshop completion (`return isWorkshopCompleted`)
- **Modules 4-5 (AST)**: Locked BEFORE completion, unlocked AFTER (`return !isWorkshopCompleted`)
- **Modules 4-7 (IA)**: Never locked (`return false`)

### Middleware Protection

**`checkWorkshopLocked`** middleware (lines 168-214): Reads user, determines workshop type, gets step module, checks locking rules, returns 403 if locked.

| Line | POST Endpoint | Uses `checkWorkshopLocked` | Notes |
|------|---------------|:--------------------------:|-------|
| 486 | `/assessment/start` | NO | Should it? Starting assessment in locked module |
| 536 | `/assessment/answer` | NO | Should it? Answering in locked module |
| 566 | `/assessment/complete` | **YES** | |
| 682 | `/flow-attributes` | **YES** | |
| 781 | `/rounding-out` | **YES** | |
| 936 | `/future-self` | **YES** | |
| 1154 | `/cantril-ladder` | **YES** | |
| 1365 | `/final-insights` | NO | Also missing auth |
| 1509 | `/assessments` | NO | Also missing auth |
| 1647 | `/step-by-step-reflection` | **YES** | |
| 1769 | `/upload-visualization-image` | **YES** | |
| 1825 | `/visualizing-potential` | **YES** | |
| 1978 | `/final-reflection` | **YES** | |
| 2151 | `/visualization` | NO | Also missing auth |
| 2341 | `/flow-assessment` | NO | Missing middleware |
| 2546 | `/navigation-progress` | NO | Expected — nav should always work |
| 2680 | `/ia-assessment` | NO | Missing middleware |
| 2813 | `/step` | **YES** | Generic step save |
| 2999 | `/complete-workshop` | NO | Expected — this IS the completion endpoint |
| 3105 | `/store-visualization-image` | NO | Module 4 (post-completion) |
| 3188 | `/assessment-profile` | NO | Module 4 (post-completion) |
| 3295 | `/woo-results` | NO | |
| 3392 | `/quick-start-profile` | NO | |

**11 endpoints protected**, several gaps noted (especially `/flow-assessment`, `/ia-assessment`, `/assessment/start`, `/assessment/answer`).

---

## Frontend Status

### Hook: `use-workshop-status.ts`

**File**: `client/src/hooks/use-workshop-status.ts`

**Exports:**
```typescript
{
  astCompleted: boolean,
  iaCompleted: boolean,
  astCompletedAt?: string,
  iaCompletedAt?: string,
  loading: boolean,
  error: string | null,
  completeWorkshop: (appType: 'ast' | 'ia') => Promise<Result>,
  isWorkshopLocked: (appType: 'ast' | 'ia', stepId?: string) => boolean,
  isModuleAccessible: (appType: 'ast' | 'ia', module: number) => boolean,
  getStepModule: (stepId: string) => 1 | 2 | 3 | 4 | 5 | null,
  triggerGlobalCompletion: () => void,
  completed: boolean  // Legacy alias for astCompleted
}
```

**`isModuleLocked()` logic** (lines 42-51): Mirrors backend — modules 1-3 lock after completion, 4-5 lock before.

**`isWorkshopLocked(appType, stepId?)`** (lines 144-160): If no stepId, returns legacy binary lock. If stepId provided, uses module-specific rules.

### Key UI Components

**`LockedInputWrapper`** (`client/src/components/ui/LockedInputWrapper.tsx`):
- Wraps any input/select/slider with locked state
- Clones child with `disabled=true, readOnly=true`
- Adds `opacity-60 cursor-not-allowed bg-gray-50` styling
- Removes click/change handlers
- Shows lock icon overlay (optional)
- Takes optional `stepId` for step-specific locking

**`WorkshopCompletionBanner`** (`client/src/components/common/WorkshopCompletionBanner.tsx`):
- Only shows for AST workshop (returns null for IA)
- Modules 1-3: Gray "locked for reference" banner
- Modules 4-5: Green "now unlocked" banner with unlock icon

**`ReusableReflection`** (`client/src/components/reflection/ReusableReflection.tsx`):
- Has `workshopLocked?: boolean` prop (line 24)
- Disables textarea (line 517): `disabled={workshopLocked}`
- Prevents save when locked (line 149)
- Prevents completion when locked (line 165-166)
- Auto-validates when locked (line 264)

### Components Using Workshop Status (Connected)

| Component | File | What It Does |
|-----------|------|-------------|
| `AllStarTeamsWorkshop` | `client/src/components/workshops/AllStarTeamsWorkshop.tsx` | Uses hook for `isStepAccessible()` checks |
| `ImaginalAgilityWorkshop` | `client/src/components/workshops/ImaginalAgilityWorkshop.tsx` | Uses hook for step progression only (NOT input disabling) |
| `WellBeingView` | `client/src/components/content/WellBeingView.tsx` | Slider disabling + style changes (lines 73-74, 108, 155-156) |
| `IntroToFlowView` | `client/src/components/content/IntroToFlowView.tsx` | Shows `WorkshopCompletionBanner` only — no input disabling |
| `FinalReflectionView` | `client/src/components/content/FinalReflectionView.tsx` | Uses `LockedInputWrapper` for textarea |
| `VisualizingYouView` | `client/src/components/content/VisualizingYouView.tsx` | Uses `LockedInputWrapper` for image search + meaning textarea |
| `ReflectionView` | `client/src/components/content/ReflectionView.tsx` | Passes `workshopLocked` to `ReusableReflection` — but uses legacy `.completed` not `isWorkshopLocked()` |
| `CantrilLadderView` | `client/src/components/content/CantrilLadderView.tsx` | Imports hook for ladder locking |
| `WorkshopRecap` | `client/src/components/content/WorkshopRecap.tsx` | Shows `WorkshopCompletionBanner` |
| `FutureSelfView` | `client/src/components/content/FutureSelfView.tsx` | Imports hook |
| `LockedInputWrapper` | `client/src/components/ui/LockedInputWrapper.tsx` | Uses hook internally |
| `WorkshopCompletionBanner` | `client/src/components/common/WorkshopCompletionBanner.tsx` | Uses hook internally |
| `FloatingAITrigger` | `client/src/components/ai/FloatingAITrigger.tsx` | Imports hook — unclear if it blocks AI interactions |
| `AssessmentModal` | `client/src/components/assessment/AssessmentModal.tsx` | Imports `LockedInputWrapper` |
| `FlowAssessment` | `client/src/components/flow/FlowAssessment.tsx` | Imports `LockedInputWrapper` |
| `StepByStepReflection` | `client/src/components/reflection/StepByStepReflection.tsx` | Imports `LockedInputWrapper`, wraps textarea |

### Components NOT Using Workshop Status (The Gap)

#### AST Modules 1-3 — Steps Missing Locking

| Step ID | Component | Input Types Present | Locking Status |
|---------|-----------|-------------------|----------------|
| 1-1 | `WelcomeView` | Likely minimal/none | NOT CHECKED — may not need locking |
| 1-2 | `SelfAwarenessOpportunityView` | Unknown | NOT CHECKED |
| 1-3 | `AboutCourseView` | Video content only | Likely no inputs to lock |
| 2-2 | `IntroToFlowView` | Reflections, flow assessment | PARTIAL — has banner but no input disabling |
| 2-3 | (Removed from workshop) | N/A | N/A |
| 2-4 | `Mod2RecapView` | Unknown | NOT CHECKED |

**Note**: Steps 2-1 (StrengthsView), 3-1 (WellBeingView), 3-2 (FutureSelfView), 3-3 (FinalReflectionView), 3-4 (VisualizingYouView) have at least partial locking. The main gaps are in Module 1 and step 2-2/2-4.

#### IA Modules 1-3 — ZERO Locking Implementation

**IA has NO locking wiring whatsoever.** Zero IA step components:
- Import `useWorkshopStatus`
- Accept a `workshopLocked` prop
- Use `LockedInputWrapper`
- Reference completion status

All 30+ IA step files in `client/src/components/content/imaginal-agility/steps/` are completely unwired. Any text inputs, assessment sliders, reflection textareas, and self-assessment modals in IA modules 1-3 remain fully editable after workshop completion.

### Input Components Inventory

| Component | File | Supports Locked Mode | Used In |
|-----------|------|:--------------------:|---------|
| `ReusableReflection` | `client/src/components/reflection/ReusableReflection.tsx` | **YES** (`workshopLocked` prop) | Multiple AST steps |
| `StepByStepReflection` | `client/src/components/reflection/StepByStepReflection.tsx` | **YES** (via `LockedInputWrapper`) | AST strength reflections |
| `LockedInputWrapper` | `client/src/components/ui/LockedInputWrapper.tsx` | **YES** (IS the wrapper) | 5 components |
| `AssessmentModal` | `client/src/components/assessment/AssessmentModal.tsx` | **PARTIAL** (imports wrapper) | Star Strengths assessment |
| `FlowAssessment` | `client/src/components/flow/FlowAssessment.tsx` | **PARTIAL** (imports wrapper) | Flow patterns step |
| `WorkshopCompletionBanner` | `client/src/components/common/WorkshopCompletionBanner.tsx` | **YES** (visual only) | 2 AST steps |
| `InlineChat` | Various IA steps | **NO** | IA coaching modals |
| Cantril Ladder sliders | `WellBeingView.tsx` | **YES** (inline disabled logic) | Step 3-1 |

---

## Navigation Behavior

### Current State

**Step Progression** (`use-navigation-progress.ts`, lines 134-250):
- Step 1-1 always unlocked
- Linear progression: each completed step unlocks the next
- Completing step 3-4 unlocks ALL of Module 4 & 5

**Module Accessibility** (`AllStarTeamsWorkshop.tsx`, lines 610-640):
- `isStepAccessible()` checks both module-level locking and step-level progression
- Module 4-5 steps locked before workshop completion, unlocked after

**Navigation Sidebar** (`WorkshopNavigationSidebar.tsx`):
- Shows lock icons for inaccessible steps (line 539)
- Disables click handler for locked steps (line 518-528)
- Shows "Complete previous steps first" tooltip (line 594-601)

**Route Protection** (`RouteProtection.tsx`):
- Shows blocking message screen for inaccessible steps (lines 80-110)
- Offers redirect option

### Does Navigation Block Access to Completed Steps?

**Currently: YES, partially.** The `isModuleAccessible()` function returns `false` for modules 1-3 after workshop completion (because `isModuleLocked` returns `true`). This means:
- After completing the workshop, modules 1-3 steps may show as "locked" in the sidebar
- Users may not be able to click/navigate to those steps to review their work
- **This is the opposite of desired behavior** — users should be able to revisit all steps in read-only mode

**The fix needed**: `isModuleAccessible` should return `true` for completed modules (allow navigation) while `isWorkshopLocked` returns `true` (disable inputs). These are currently conflated.

---

## What's Working

- Database schema has all required completion columns
- `complete-workshop` endpoint validates required steps and sets completion flags
- `completion-status` endpoint returns all completion data
- `checkWorkshopLocked` middleware protects 11 POST endpoints from writes to locked modules
- `use-workshop-status.ts` hook exists with correct module locking logic
- `LockedInputWrapper` component exists and works correctly
- `WorkshopCompletionBanner` component exists with module-aware messaging
- `ReusableReflection` supports `workshopLocked` prop with full disable behavior
- Several AST steps (WellBeing, FinalReflection, VisualizingYou, CantrilLadder) have working locking
- Backend correctly differentiates AST vs IA locking rules (IA modules 4-7 never locked)

## What's Missing

### Critical

1. **IA has zero frontend locking** — all 30+ step components in modules 1-3 are fully editable after completion
2. **Navigation blocks revisiting completed steps** — `isModuleAccessible` conflates "navigable" with "editable", preventing users from reviewing their completed work
3. **`ReflectionView` uses legacy `.completed`** instead of `isWorkshopLocked('ast', stepId)` — not module-aware

### High Priority

4. **AST step 2-2 (`IntroToFlowView`)** — has banner but no actual input disabling for flow assessment/reflections
5. **AST step 2-4 (`Mod2RecapView`)** — not checked for locking, may have inputs
6. **Several backend endpoints missing `checkWorkshopLocked`**: `/flow-assessment`, `/ia-assessment`, `/assessment/start`, `/assessment/answer`
7. **`WorkshopCompletionBanner` only works for AST** — returns null for IA

### Medium Priority

8. **AST Module 1 steps** (1-1, 1-2, 1-3) — need verification of whether they have editable inputs
9. **`InlineChat` component** — no locked mode; should AI coaching be disabled when locked?
10. **`FloatingAITrigger`** — imports hook but unclear if it blocks interactions when locked
11. **Some AST steps use `LockedInputWrapper` import but need verification that it's actually applied to all inputs**

### Low Priority

12. **Backend endpoints `/final-insights`, `/assessments`, `/visualization` missing both auth AND locking middleware**
13. **No visual lock indicator on steps that are locked but navigable** (once navigation is fixed)

---

## Design Requirements (from Brad)

- Users MUST be able to revisit all steps after completion (read-only)
- All text inputs, textareas, sliders, radio groups should be disabled
- Expandable/collapsible sections should still work
- AST Module 5 should NOT be locked
- IA Modules 4+ should NOT be locked (active learning)
- Visual indicator (lock icon or banner) on locked steps

---

## Recommended Implementation Order

### Phase 1: Fix Navigation (Unblock Revisiting)
**Priority: CRITICAL — Must be done first**

Separate "navigable" from "editable" in `isModuleAccessible()`. After workshop completion, all modules should be navigable (return `true`) but modules 1-3 should be locked for editing. This is likely a small change in `use-workshop-status.ts` and `AllStarTeamsWorkshop.tsx`.

### Phase 2: Complete AST Module 1-3 Locking
**Priority: HIGH**

1. Audit each AST step component in modules 1-3 for editable inputs
2. Wire `useWorkshopStatus` + `isWorkshopLocked('ast', stepId)` into each
3. Wrap all inputs with `LockedInputWrapper` or pass `workshopLocked` to `ReusableReflection`
4. Fix `ReflectionView` to use `isWorkshopLocked()` instead of legacy `.completed`
5. Add `WorkshopCompletionBanner` to all locked steps

### Phase 3: Backend Endpoint Gaps
**Priority: HIGH**

Add `checkWorkshopLocked` middleware to: `/flow-assessment`, `/ia-assessment`, `/assessment/start`, `/assessment/answer`. Add auth to unprotected endpoints.

### Phase 4: IA Module 1-3 Locking
**Priority: MEDIUM** (IA workshop less mature)

1. Update `WorkshopCompletionBanner` to support IA workshop
2. Wire `useWorkshopStatus` into each IA step component for modules 1-3
3. Apply `LockedInputWrapper` to all IA inputs (textareas, assessment sliders, self-assessment modals)
4. Decide on `InlineChat` locking behavior for IA

### Phase 5: Polish & Edge Cases
**Priority: LOW**

1. Decide on `FloatingAITrigger` / `InlineChat` behavior when locked
2. Add visual lock indicators to navigation sidebar for locked-but-navigable steps
3. End-to-end testing of full lock flow for both workshops
4. Address remaining unprotected backend endpoints

---

## Existing Documentation

| File | Location | Content |
|------|----------|---------|
| `workshop-locking-system-implementation.txt` | `Claude Code Prompts/` | Implementation plan for KAN-170 through KAN-175 |
| `fix-resource-steps-and-implement-locking.md` | `Claude Code Prompts/` | Code templates for `LockedInputWrapper` and `WorkshopCompletionBanner` |
| `fix-navigation-step-completion.txt` | `Claude Code Prompts/` | Navigation step completion fixes |

---

*Generated: Investigation only — no code changes made*
