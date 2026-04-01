# #10 — IA Module 1: Progression goes to removed ia-1-5 'Reality and Words' instead of ia-2-1

**State:** OPEN
**Labels:** bug
**Created:** 2026-03-14

---

## Summary

After completing ia-1-4 (The Bigger Picture), the "Continue" button navigates to the removed step ia-1-5 "Extra: Reality and Words" instead of proceeding to ia-2-1. This step was fully removed from the workshop — its content was redistributed to other steps — but the navigation/progression config still references it.

**Priority:** Medium
**Workshop:** IA
**Module:** 1 -> 2 transition

## Steps to Reproduce

1. Log in as any IA participant
2. Complete steps ia-1-1 through ia-1-4
3. On ia-1-4, click the "Continue to Reality and Words" button
4. **Actual:** Navigates to the removed "Extra: Reality and Words" page (ia-1-5)
5. **Expected:** Should navigate to ia-2-1

## Screenshots

- "Continue to Reality and Words" button visible at bottom of ia-1-4
- The removed page still renders with Reality Discernment Gauge content

## Additional Issue: Remove "Unit #" from Module 1 Next Buttons

The "Continue to..." buttons in Module 1 steps include unit numbers (e.g., "Continue to Unit 2: ..."). The "Unit #" prefix should be removed from these button labels.

## Fix Needed

1. Update navigation/progression config to skip ia-1-5 entirely
2. ia-1-4 "Next" should go to ia-2-1
3. Remove "Unit #" labels from Module 1 continue buttons
