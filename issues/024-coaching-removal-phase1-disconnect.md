# 024: Remove Coaching System — Phase 1: Disconnect Routes

**Type:** Cleanup / Dead Code  
**Priority:** Medium  
**Labels:** cleanup, coaching, server  
**Blocked by:** Nothing  
**Blocks:** 025, 026  

---

## Summary

The entire coaching chatbot system (Talia coaching, persona management, METAlia conversation analysis) is no longer used in the Heliotrope platform. Coaching will be handled by third-party tools going forward. This phase disconnects the dead routes from the server without deleting any files.

## What to Do

In `server/index.ts`, comment out or remove all coaching/persona route registrations and imports:

### Imports to remove (lines ~33-48):
- `import coachingRoutes from './routes/coaching-routes.ts'` (line 33, active)
- `import metaliaRoutes from './routes/metalia-routes.ts'` (line 42, active)
- `import taliaStatusRoutes from './routes/talia-status-routes.ts'` (line 48, active)
- Already-commented persona imports (line 38) — delete the commented lines

### Route mounts to remove (lines ~493-526):
- `app.use('/api/coaching', coachingRoutes)` (line 493, active)
- `app.use('/api/talia-status', taliaStatusRoutes)` (line 519, active)
- `app.use('/api/metalia', metaliaRoutes)` (line 526, active)
- Already-commented coaching/persona mounts (lines 494, 503, 521) — delete

### Startup code to remove (lines ~343-344):
- Persona loading block and its console log
- `personaEnvironment` reference (line 109)

### Create-coaching-tables endpoint to remove (lines ~879-952):
- The `app.post('/create-coaching-tables', ...)` handler

## How to Test

1. `npm run dev` on port 8080 — server should start without errors
2. Confirm these endpoints return 404:
   - `curl http://localhost:8080/api/coaching/status`
   - `curl http://localhost:8080/api/coaching/chat/personas`
   - `curl http://localhost:8080/api/talia-status`
   - `curl http://localhost:8080/api/metalia`
3. Confirm AST workshop still loads and works
4. Confirm IA workshop still loads and works
5. Confirm AST report generation still works (this uses `openai-api-service.ts` which is NOT touched in this phase)
6. `npx vite build` completes without errors

## Files Touched

- `server/index.ts` — remove imports, mounts, startup code

## Files NOT Touched (yet)

All coaching route/service files remain on disk. They're just no longer imported or mounted. Phase 2 handles the `openai-api-service.ts` entanglement. Phase 3 handles file deletion.
