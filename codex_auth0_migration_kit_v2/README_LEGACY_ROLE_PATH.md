# Codex Task: Auth0 Bulk Import + Role Assignment + Hard Delete (LEGACY ROLE PATH AWARE)

This version lets you specify **your exact legacy role field** via `.env`:
- `LEGACY_ROLE_PATH` — JSON path (dot notation) to where the legacy role lives on the Auth0 user profile.
  - Default: `app_metadata.legacy_role`
  - Examples: `role`, `legacy.role`, `profile.role`, `app_metadata.roles.primary`

Codex: follow steps 0 → 9 exactly as written in README_CODEX_PROMPT.md (same as v1), with this change:
- Before running `assign_roles.sh`, set `LEGACY_ROLE_PATH` in `.env` appropriately.
