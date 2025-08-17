# Repository Guidelines

## Project Structure & Modules
- `client/`: React + Vite + TypeScript app (`src/components`, `pages`, `hooks`, `utils`).
- `server/`: Express + TypeScript API (`routes`, `services`, `middleware`, `utils`).
- `__tests__/`: `unit/`, `integration/`, `e2e/` with fixtures.
- `dist/`: Production build output for server and client.
- `docs/`, `scripts/`, `JiraTickets/`: Documentation and ops utilities.

Note: Keep AST (AllStarTeams) and IA (Imaginal Agility) features isolated (routes, IDs, styling) — do not mix concerns. See `CLAUDE.md` (Project Structure, Separation Rules) and `docs/API-ROUTES.md` for endpoints.

## Build, Test, and Dev Commands
```bash
# Local development (Express + Vite HMR on 8080)
npm run dev:hmr

# Alternative dev (server only)
npm run dev

# Type-check, build, and analyze bundle
npm run check
npm run build
npm run bundle:analyze

# Start built app
npm start            # or: npm run start:staging | start:production

# Tests
npm test             # vitest
npm run test:watch   # watch mode
npm run test:coverage
```
More: `LOCAL-DEVELOPMENT-GUIDE.md`, `docs/performance-tracking/README.md`.

## Coding Style & Naming
- TypeScript throughout; 2-space indentation; semicolons optional but consistent.
- React components: PascalCase (`TeamCard.tsx`); variables/functions: camelCase; route files: kebab-case.
- Keep feature flags explicit and scoped per workshop.
- Run `npm run check` before PRs; keep types clean.
Reference flags and patterns in `CLAUDE.md` (Feature Flag System).

## Testing Guidelines
- Framework: Vitest (+ Supertest for API).
- Locations: `__tests__/unit|integration|e2e`.
- Naming: `*.test.ts` / `*.test.tsx` near source or under `__tests__`.
- Cover both AST and IA paths where applicable; include health checks for `/health`.
- Generate coverage locally via `npm run test:coverage`.
See examples in `__tests__/unit/server/auth-routes.test.ts`.

## Commit & Pull Requests
- Branches: `development` (active), `main` (release), `feature/*`, `hotfix/*`.
- Commits: Use explicit one-line messages, e.g., `feat(ast): add cohort export`.
- PRs must include: purpose, linked Jira/GitHub issue, workshop scope (AST/IA/both), screenshots or API examples, and testing notes.
- Avoid interactive Git commands that open editors; supply messages inline.
Workflow details in `CLAUDE.md` (Git Workflow Standards).

## Security & Configuration
- Required: Node 18+, port 8080 (avoid macOS 5000 conflict).
- Env files: `server/.env.*`, `client/.env.*`; never commit secrets.
- Database: use safe dev DB for destructive changes; confirm `DATABASE_URL` before running migrations.
Deployment refs: `DEPLOYMENT-QUICK-REFERENCE.md`, `DEPLOYMENT-CHECKLIST.md`, `docs/deployment/aws-lightsail-deployment-guide.md`. Security: `docs/security-hardening-plan.md`.
