# 026: Remove Coaching System — Phase 3: Delete Dead Files

**Type:** Cleanup / Dead Code  
**Priority:** Low  
**Labels:** cleanup, coaching, server, client  
**Blocked by:** 024, 025  
**Blocks:** Nothing  

---

## Summary

After Phases 1-2 have been deployed and tested, this phase deletes all coaching-related files that are no longer imported or referenced anywhere. Also cleans up client-side coaching components and root-level scripts.

## Prerequisites

- Phase 1 (024) completed and tested — routes disconnected
- Phase 2 (025) completed and tested — openai-api-service untangled
- Confirm via grep that NO active file imports from any file in the delete list

## Files to Delete

### Server Routes (dead)
- `server/routes/persona-management-routes.ts`
- `server/routes/coaching-routes.ts`
- `server/routes/metalia-routes.ts`
- `server/routes/talia-status-routes.ts`

### Server Services (dead)
- `server/services/talia-personas.ts`
- `server/services/talia-training-service.ts`
- `server/services/conversation-learning-service.ts`
- `server/services/conversation-logging-service.ts` (verify metalia-routes was the only other consumer)
- `server/services/user-learning-service.ts`
- `server/services/metalia-analysis-service.ts`
- `server/services/report-quality-monitor.ts`
- `server/services/coaching-chat-service.ts.bak`
- `server/services/coaching-chat-service.ts.disabled`

### Client Components (dead)
- `client/src/components/coaching/` — entire folder:
  - `CoachingChatbot.tsx` + `.css`
  - `CoachingModal.tsx` + `.css`
  - `TaliaCoach.tsx`
  - `ReflectionCoachingButton.tsx`
  - `TestCoachingButton.tsx`
- `client/src/hooks/use-coaching-system.ts`
- `client/src/types/coaching.ts`

### Root-Level Scripts & Migrations (dead)
- `check-coaching-tables.js`
- `create-coaching-chatbot-migration.js`
- `create-coaching-tables.sql`
- `run-coaching-migration.js`
- `test-coaching-setup.js`
- `test-coaching-message.json`
- `check-persona-docs.ts`
- `migrations/add-coaching-chatbot-system.sql`
- `migrations/add_coaching_tables.sql`
- `migrations/coaching-chatbot-schema.sql`
- `server/migrations/create_talia_personas_table.sql`
- `server/migrations/add-talia-training-access.sql`
- `server/migrations/add-metalia-conversation-logging.sql`

### Data Folders (dead)
- `coaching-data/` — entire folder (sample Talia reports)

### Staging Deploy Packages (dead coaching artifacts)
These contain compiled JS versions of the coaching files:
- `staging-deploy-package*/server/routes/persona-document-sync-routes.js`
- `staging-deploy-package*/server/routes/persona-management-routes.js`
- `staging-deploy-package*/server/services/persona-document-sync-service.js`
- `staging-deploy-package*/server/services/talia-personas.js`

### JiraTickets (reference only, optional)
- `JiraTickets/KAN-persona-document-sync-implementation.md`
- `JiraTickets/SA-metalia-comprehensive-ai-persona-system.md`

## Database Tables (future, separate task)

These tables can be dropped once we confirm no production data needs preserving:
- `coaching_conversations`
- `coaching_messages`
- `coaching_prompts`
- `user_coaching_preferences`
- `coaching_sessions`
- `talia_personas`
- METAlia conversation logging tables

**Do NOT drop tables in this phase.** Create a separate migration issue if/when ready.

## Pre-Delete Verification

Before deleting each file, run:
```bash
grep -rn "FILENAME" server/ client/src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "staging-deploy"
```
Confirm zero active imports for each file.

## How to Test

1. `npm run dev` on port 8080 — server starts clean
2. `npx vite build` — no build errors
3. AST workshop works end-to-end
4. IA workshop works end-to-end
5. AST report generation works
6. No console errors at startup
7. Bundle size should decrease (check before/after)
