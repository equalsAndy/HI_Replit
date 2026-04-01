# #2 — Pod write service — serialize Star Card to Turtle RDF

**State:** OPEN
**Labels:** vault-integration, data-layer, rdf
**Created:** 2026-03-08

---

## Summary

Build the module that takes Star Card assessment data from Postgres and serializes it to Turtle RDF matching the resource design in `selfactual-pod-resources-sketch.md`. Must handle master pod version (with reflection links) and sub pod version (without).

## Acceptance Criteria

- Star Card data serializes to valid Turtle
- Master version includes `sa:hasReflections` link
- Sub version omits reflection links
- Includes provenance metadata (app version, timestamp)
