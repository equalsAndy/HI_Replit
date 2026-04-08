# 025: Remove Coaching System — Phase 2: Untangle openai-api-service

**Type:** Cleanup / Refactor  
**Priority:** Medium  
**Labels:** cleanup, coaching, server, refactor  
**Blocked by:** 024  
**Blocks:** 026  

---

## Summary

`server/services/openai-api-service.ts` is the critical entangled file. It contains both dead coaching logic AND active report generation logic. This phase surgically removes the coaching dependencies while keeping report generation working.

## The Problem

`openai-api-service.ts` currently:
- **Imports** `taliaPersonaService, TALIA_PERSONAS` from `talia-personas.ts` (dead)
- **Imports** `CURRENT_PERSONAS` from `persona-management-routes.ts` (dead)
- **Exports** `generateOpenAICoachingResponse()` which is consumed by:
  - `coaching-routes.ts` — **DEAD**, being removed
  - `ast-sectional-report-service.ts` — **ACTIVE**, generates AST reports

The function `generateOpenAICoachingResponse` is misnamed — it's doing report generation for AST, not coaching. The coaching-specific code paths inside it (persona lookup, coaching context building, reflection prompts) are dead.

## What to Do

### Step 1: Remove dead imports from `openai-api-service.ts`
- Remove: `import { taliaPersonaService, TALIA_PERSONAS } from './talia-personas.js'`
- Remove: `import { CURRENT_PERSONAS } from '../routes/persona-management-routes.js'`
- Any code that references `CURRENT_PERSONAS`, `TALIA_PERSONAS`, or `taliaPersonaService` needs to be traced — if it's only used in the coaching path, remove it. If it's in the report path, replace with inline config or a simpler approach.

### Step 2: Audit `generateOpenAICoachingResponse` internals
Inside this function, there are branching paths based on `personaType`:
- `personaType === 'star_report'` → **KEEP** — this is the report generation path
- `personaType === 'talia_coach'` → **REMOVE** — this is the dead coaching path
- Fallback/reflection coaching logic → **REMOVE**

### Step 3: Consider renaming
The function `generateOpenAICoachingResponse` should probably become `generateAIReportResponse` or similar, since coaching is its only caller that's being removed. Update the import in `ast-sectional-report-service.ts` to match.

### Step 4: Remove dead helper services that only coaching-routes imported dynamically
Inside `coaching-routes.ts`, several services are imported with `await import()`:
- `talia-training-service.ts` — check if anything else uses it
- `user-learning-service.ts` — check if anything else uses it  
- `conversation-learning-service.ts` — check if anything else uses it
- `report-quality-monitor.ts` — check if anything else uses it

If these services are ONLY used by coaching-routes and openai-api-service coaching paths, they can be disconnected (don't delete yet, just stop importing).

## How to Test

1. `npm run dev` on port 8080 — server starts without errors
2. AST report generation still works end-to-end:
   - Generate a sectional report for a test user
   - Generate a holistic report for a test user
   - Verify report content quality is unchanged
3. IA exercises still work (they use `ai-provider.ts` / `ia-chat-routes.ts`, not this service)
4. `npx vite build` completes without errors
5. No console errors related to persona loading or coaching on startup

## Files Touched

- `server/services/openai-api-service.ts` — remove coaching imports, dead code paths, possibly rename export
- `server/services/ast-sectional-report-service.ts` — update import if function is renamed

## Risk

**Medium** — This is the riskiest phase because we're editing a file that active report generation depends on. Do this on development branch, test report generation thoroughly before merging.
