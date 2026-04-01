# #5 — Trigger pod writes on assessment/reflection completion

**State:** OPEN
**Labels:** vault-integration, data-layer
**Created:** 2026-03-08

---

## Summary

Wire the pod write service into existing AST flows so that:
1. Assessment completion -> writes to both master + sub pods
2. Reflection submission -> writes to master pod only
3. Existing Postgres writes are unaffected (pod writes are additive)
