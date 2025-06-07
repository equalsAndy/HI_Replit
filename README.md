# Experimenting-Heliotrope-Imaginal

## Development

This project uses:
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Session-based with invite codes

## Navigation Progress Implementation Constraints

### CRITICAL CONSTRAINTS
- ASK PERMISSION as a group before modifying files beyond target file
- ASK PERMISSION before creating new files if something is missing
- EVALUATE ALTERNATIVES for complex architecture decisions (like global state)
- VERIFY all API endpoints exist before using them
- PROVIDE comprehensive testing (unit, integration, manual checklist)

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

### ARCHITECTURE
- **Mode**: SIMPLIFIED (track video but don't use for unlocking)
- **Feature flag**: Simple boolean (hard to change accidentally)
- **Database**: users.navigationProgress (JSON, max 2 nesting levels)
- **Error recovery**: Refresh/clear browser options, contact facilitator
- **NO section-level tracking** - pure step unlocking only