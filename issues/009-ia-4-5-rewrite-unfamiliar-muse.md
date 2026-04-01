# #9 — IA 4-5: Rewrite legacy 'unfamiliar muse pathway' content to mind-freeing/capture framing

**State:** OPEN
**Labels:** content-update
**Created:** 2026-03-12

---

## Summary

IA step 4-5 (Action Planning / Inspiration Support) still has content referencing the old "unfamiliar muse pathway" framing. These need rewriting to use the new **mind-freeing / capture** framing.

**Priority:** Medium — address before merging to development

## Locations to Update

### 1. ActionPlanningExercise.tsx
The following blocks still use old framing:
- Purpose card
- "What You Just Did" block
- Tags
- Example text
- Flow Connection card

### 2. Step wrapper purpose copy
The purpose/description text shown in the IA 4-5 step wrapper.

### 3. `IA45_INTRO` constant in `prompts.ts`
The intro prompt constant used for AI conversations in this step.

## Framing Change

| Old | New |
|-----|-----|
| "Unfamiliar muse pathway" | Mind-freeing / capture framing |

## How to Fix

> **Note:** Claude.ai (claude.ai project conversation) has additional context on the correct mind-freeing/capture framing and copy direction. When working on this issue, start by asking Claude for a prompt/guidance on the updated content before rewriting.

## Context

- Workshop: IA
- Module: 4 (steps 4-5)
- AI flow is being tested separately — this issue is content-only
