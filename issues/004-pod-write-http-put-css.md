# #4 — Pod write service — HTTP PUT to CSS pods

**State:** OPEN
**Labels:** vault-integration, data-layer
**Created:** 2026-03-08

---

## Summary

Implement authenticated writes to CSS pods using `@inrupt/solid-client`. Service authenticates as the provisioning service account, writes serialized Turtle to the correct pod URLs.

## Acceptance Criteria

- Authenticated PUT to master pod works
- Authenticated PUT to sub pod works
- Provenance log appended on each write
- Error handling for network failures, auth expiry
