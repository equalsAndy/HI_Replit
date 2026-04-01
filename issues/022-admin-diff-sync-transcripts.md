# #22 — Admin: Diff report & selective sync for transcripts and AI training docs (dev vs production)

**State:** OPEN
**Labels:** enhancement, feature
**Created:** 2026-03-28

---

## Summary

Add dev-vs-production comparison and sync capabilities to the existing admin list view for transcripts and AI training docs.

**NOTE: Check in before building the full feature — we may want to start with the simple version (Phase 1) and add sync later.**

## Phase 1 (minimum)

### Timestamps on Existing Admin List View
- Add **last updated timestamp** for both dev and production to each item in the existing admin list view for transcripts and AI training docs

### Diff Modal
- Admin selects a single item to inspect
- Opens a diff modal showing the differences between dev and production versions
- One item at a time

## Phase 2 (discuss before building)

### Selective Sync
- From the diff view or list, admin can choose to sync:
  - Dev -> Production (push)
  - Production -> Dev (pull)
- Admin can select **one or more** items to sync, or **push all**
- Clear confirmation before any sync action
- Success/failure feedback after sync completes

## Acceptance Criteria

- [ ] Existing admin list view shows last-updated timestamps (dev and prod) per item
- [ ] Admin can select a single item to open a diff modal (dev vs production)
- [ ] Diff modal clearly shows differences between the two environments
- [ ] **Check in before proceeding to Phase 2 sync features**
- [ ] Admin can sync selected item(s) in either direction
- [ ] "Push all" option available
- [ ] Confirmation dialog before executing sync
