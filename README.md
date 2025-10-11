# Experimenting-Heliotrope-Imaginal

**Version**: v2.5.2

## Development

This project uses:
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Session-based with invite codes

## Deployment

- **Staging**: `./deploy-latest-code.sh` - Reliable layered deployment to app2.heliotropeimaginal.com
- **Production**: Ready for DNS cutover to AWS infrastructure
- **Documentation**: See `docs/deployment-best-practices.md` for full deployment strategy

## Navigation Progress Implementation Constraints

### CRITICAL CONSTRAINTS
- **ASK PERMISSION** as a group before modifying files beyond target file (EXCEPT Next button components)
- **ASK PERMISSION** before creating new files if something is missing
- **NEXT BUTTON EXCEPTION**: May modify Next button UI components as needed to implement proper behavior
- **EVALUATE ALTERNATIVES** for complex architecture decisions (like global state)
- **VERIFY** all API endpoints exist before using them
- **PROVIDE** comprehensive testing (unit, integration, manual checklist)

### TARGET FILE
Build navigation hook at `client/src/hooks/use-navigation-progress.ts`

### STEP SEQUENCE
`['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5', '5-1', '5-2', '5-3', '5-4', '6-1']`

### PROGRESSION RULES
- **Linear**: 1-1 → 2-1 → 2-2 → ... → 4-5
- **Branch**: 3-4 completion unlocks 5-1 (4-1 remains next step)
- **Branch**: 4-5 completion unlocks 6-1, 5-2, 5-3, 5-4 (all simultaneously)
- **Assessment blocking**: 2-2 (starCard), 3-2 (flowAssessment), 4-1 (cantrilLadder)
- **Reflection steps**: 4-2 and others (non-blocking in simplified mode)

### USER RESTORATION LOGIC
- **Load currentStepId** from database on app initialization
- **Navigate user** to their current step (not always 1-1)
- **Show green checkmarks** for all steps in completedSteps array
- **Update currentStepId** when user navigates between steps
- **Handle corrupted/missing** progress data gracefully

### NEXT BUTTON BEHAVIOR
- **Format**: "Next: [Step Name]" (e.g., "Next: Star Assessment")
- **Video steps**: Enabled immediately (simplified mode)
- **Assessment steps**: Disabled until completed, inline error if clicked
- **Reflection steps**: Enabled immediately (simplified mode)
- **Loading state**: Spinner + disabled during navigation (suggest: 500ms transition)
- **Error display**: Inline message below button with specific requirement
- **UI COMPONENTS**: Fix/modify Next button components as needed for proper behavior

### GREEN CHECKMARK BEHAVIOR
- **Show green checkmark** if stepId exists in completedSteps array
- **Completed steps** remain accessible (can navigate back)
- **Current step** highlighted differently from completed steps
- **Visual hierarchy**: current > completed > unlocked > locked

### ARCHITECTURE
- **Mode**: SIMPLIFIED (track video but don't use for unlocking)
- **Feature flag**: Simple boolean (hard to change accidentally)
- **Database**: users.navigationProgress (JSON, max 2 nesting levels)
- **Error recovery**: Refresh/clear browser options, contact facilitator
- **NO section-level tracking** - pure step unlocking only

## Port Conflict Resolution

If you encounter "Cannot GET /" errors or port conflicts, run these commands automatically:

### Kill existing processes and free ports
```bash
pkill -f "tsx server/index.ts" || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
```

### Start fresh server
```bash
npm run dev
```

These commands are also available in the "Kill app and ports 5000, 5001" workflow.