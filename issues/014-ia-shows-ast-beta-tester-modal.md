# #14 — IA Workshop Shows AST Beta Tester Welcome Modal

**State:** OPEN
**Labels:** bug
**Created:** 2026-03-18

---

## Bug Description

When a user is in the Imaginal Agility (IA) workshop and clicks the beta tester button in the top nav, it opens `BetaTesterWelcomeModal` which is entirely AllStarTeams-branded — wrong logo, wrong copy, wrong color scheme, and AST-specific step names.

## Current Behavior

The modal is hardcoded to AST:
- **Logo**: AllStarTeams logo (blue star)
- **Header**: "Welcome to AllStarTeams Beta"
- **Body copy**: "AllStarTeams is a workshop that helps people discover their strengths..."
- **Color scheme**: Blue gradient (`from-blue-600 to-blue-800`)
- **Step names**: AST-only (`1-1: Getting Started`, `1-2: Star Card Creation`, etc.)
- **Footer**: "Heliotrope Imaginal - AllStarTeams Beta Program"

## Expected Behavior

IA users should see a purple-branded modal with:
- Imaginal Agility logo
- "Welcome to Imaginal Agility Beta" heading
- IA-specific workshop description
- Purple color scheme (matching IA workshop)
- IA step names in progress tracking (`ia-1-1`, `ia-2-1`, etc.)

## Root Cause

`client/src/components/modals/BetaTesterWelcomeModal.tsx` has no `appType` prop — it is fully AST-branded with no conditional rendering for IA. The component is rendered from `NavBar.tsx` and/or `App.tsx` without passing workshop type.

## Files to Change

| File | Change |
|------|--------|
| `client/src/components/modals/BetaTesterWelcomeModal.tsx` | Add `appType: 'ast' \| 'ia'` prop; branch on logo, copy, colors, step names |
| `client/src/components/layout/NavBar.tsx` | Pass `appType` when rendering modal |
| `client/src/App.tsx` | Pass `appType` if modal rendered here |

## Implementation Notes

Add `appType` prop to `BetaTesterWelcomeModal` and conditionally render branding. Single component, two modes — no duplication.

**IA step names:**
- `ia-1-1` -> Overview
- `ia-2-1` -> I4C Prism
- `ia-2-2` -> Capability Dynamics
- `ia-2-3` -> Self Assessment
- `ia-3-1` -> Ladder Overview
- `ia-4-1` -> Advanced Ladder

**IA colors**: Purple (`from-purple-600 to-purple-800`, badges `bg-purple-600`)

## Acceptance Criteria

- [ ] IA users see purple-branded modal with IA logo and IA-specific copy
- [ ] AST users see existing blue-branded modal unchanged
- [ ] Progress tracking reads IA step IDs correctly for IA users
- [ ] "Show this at startup" checkbox behavior unchanged for both workshops
- [ ] No cross-workshop branding contamination
