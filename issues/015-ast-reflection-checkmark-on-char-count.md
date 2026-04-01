# #15 — AST: Reflection checkmark appears at min char count, not on actual completion

**State:** OPEN
**Labels:** bug
**Created:** 2026-03-19

---

## Bug Description

In the AST workshop, reflection textareas show a "complete" checkmark as soon as the minimum character count threshold is reached. This is misleading — hitting the character minimum just means the input is *valid*, not that the step is complete. Meanwhile, a "Mark Complete" button appears below, creating a contradictory UX: a checkmark saying "done" next to a button asking the user to mark it done.

## Current Behavior

1. User types in a reflection textarea
2. Once minimum character count is reached, a green checkmark appears (indicating "complete")
3. A "Mark Complete" button also becomes enabled below the textarea
4. User sees conflicting signals — checkmark says complete, button says "mark complete"

## Expected Behavior

- The checkmark should NOT appear when the character minimum is met — that's just input validation
- A subtle validation indicator (e.g., character count turning green) is fine for showing "enough text entered"
- The **complete** checkmark should only appear AFTER the user clicks "Mark Complete"
- Or: remove the "Mark Complete" button and use the checkmark as the completion trigger — but not both

## Affected Components

- `ReusableReflection` (`client/src/components/reflection/ReusableReflection.tsx`) — likely where the checkmark logic lives
- `StepByStepReflection` (`client/src/components/reflection/StepByStepReflection.tsx`) — may have similar behavior
- Navigation progress indicators that consume completion state

## Acceptance Criteria

- [ ] Green checkmark only appears after explicit completion action (not on character threshold)
- [ ] Character minimum validation is shown via a non-completion indicator (e.g., char count color, subtle text)
- [ ] No contradictory "complete checkmark + mark complete button" state
- [ ] Completion state persists correctly in navigation progress
- [ ] All AST reflection steps behave consistently
