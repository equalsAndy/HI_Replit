# #16 — AST: Module tags in sidebar expand to large boxes on step 2-4 (Mod2Recap)

**State:** CLOSED
**Labels:** bug
**Created:** 2026-03-19

---

## Bug Description

When navigating to AST step 2-4 (Module 2 Recap), the module indicator tags in the left navigation sidebar expand into oversized boxes instead of maintaining their normal compact pill/label styling seen on other steps.

## Screenshot

The MODULE 1, MODULE 2, and MODULE 3 labels in the sidebar become large rectangular boxes that are visually inconsistent with how they appear on other steps.

## Current Behavior

- Navigate to step 2-4 (Module 2 Recap)
- Module tags (MODULE 1, MODULE 2, MODULE 3) in the sidebar render as tall, wide boxes
- Takes up significantly more vertical space than intended

## Expected Behavior

- Module tags should remain consistent compact pills/labels regardless of which step is active
- Same sizing and styling as when viewing any other step (e.g., step 1-1, 2-1, 3-1)

## Likely Cause

The `Mod2RecapView` component or the sidebar's active-step styling may be applying a CSS class that affects the module label containers. Could be a layout shift caused by the recap content affecting the sidebar, or a conditional class applied differently for this step.

## Files to Investigate

- `client/src/components/workshops/AllStarTeamsWorkshop.tsx` — sidebar rendering logic
- `client/src/components/navigation/WorkshopNavigationSidebar.tsx` — module tag styling
- `client/src/components/content/Mod2RecapView.tsx` — may trigger layout changes

## Acceptance Criteria

- [x] Module tags in sidebar remain consistent size across all steps
- [x] No layout shift when navigating to/from step 2-4
- [x] Verified on other recap/summary steps as well
