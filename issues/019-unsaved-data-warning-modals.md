# #19 — Add unsaved data warning when closing assessment modals early

**State:** OPEN
**Labels:** enhancement, ux
**Created:** 2026-03-24

---

## Summary

When users close modals (such as assessments) before completing them, display a warning that their progress/data so far will not be saved.

## Details

- Applies to assessment modals and similar modals where users enter data
- If a user attempts to close the modal before finishing, show a confirmation dialog warning that data entered so far will not be saved
- User should have the option to go back (continue the modal) or confirm close (lose data)

## Acceptance Criteria

- [ ] Closing an in-progress assessment modal triggers a warning dialog
- [ ] Warning clearly states that data entered so far will not be saved
- [ ] User can cancel the close and return to the modal
- [ ] User can confirm the close and discard data
- [ ] Applies to both AST and IA assessment modals
