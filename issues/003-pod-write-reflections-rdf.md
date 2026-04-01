# #3 — Pod write service — serialize reflections to Turtle RDF

**State:** OPEN
**Labels:** vault-integration, data-layer, rdf
**Created:** 2026-03-08

---

## Summary

Serialize reflection data to Turtle, adding the context links that don't exist in Postgres:
- Link to parent assessment
- Dimension label and description
- Prompt text
- Reflection set and dimension identifiers

Reflections go to master pod only.
