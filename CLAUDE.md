# Heliotrope Imaginal Development Project

## 🎯 Project Overview

Dual-workshop platform hosting **AST (AllStarTeams)** and **IA (Imaginal Agility)** workshops for team development through structured assessments and AI-powered insights.

**Key Technologies:** Node.js, React, TypeScript, PostgreSQL, Docker, AWS Lightsail, Claude API

## 🗂️ Project Structure

```
/Users/bradtopliff/Desktop/HI_Replit/
├── client/src/components/    # React components (see client/src/)
├── server/routes/            # API endpoints (see server/routes/)
├── shared/                   # Shared TypeScript types & schemas
├── docs/                     # Project documentation
├── JiraTickets/             # Jira ticket templates
├── tempClaudecomms/         # SSH command files
└── Claude Code Prompts/     # Specialized instructions
```

## 🚀 Quick Start

```bash
npm install                   # Install dependencies
npm run dev:hmr               # Start development (client+server with Vite HMR on :8080)
npm run build                 # Production build
npm test                      # Run tests
```

**Requirements:** Node.js 18+, Port 8080 (NOT 5000), PostgreSQL
**Environment Files:** `server/.env.*` and `client/.env.*`
**Server-only note:** `npm run dev` runs only the Express API (no Vite/HMR). Use for backend-only work or when serving a prebuilt client.

## 🔄 Environment Progression

| Environment | Database | URL | Purpose | Commands |
|-------------|----------|-----|---------|----------|
| Development | Local/RDS | localhost:8080 | Feature development | `npm run dev:hmr` (preferred) or `npm run dev` (server-only) |
| Staging | RDS | app2.heliotropeimaginal.com | Pre-production testing | See `DEPLOYMENT-QUICK-REFERENCE.md` |
| Production | RDS | app.heliotropeimaginal.com | Live application | See `DEPLOYMENT-QUICK-REFERENCE.md` |

**Deployment Flow**: Local development → Staging validation → Production release  
**Database Strategy**: Local DB (destructive ops) / RDS (safe development) → RDS Staging → RDS Production  
**Version Flow**: DEV builds → STAGING semantic → PRODUCTION release  
**Testing Rule**: Always validate in staging before production deployment

## 🚨 Workshop Separation

| Workshop | Color | Routes | API | Step IDs |
|----------|-------|--------|-----|----------|
| **AST** (AllStarTeams) | Blue | `/workshop/ast/*` | `/api/ast/*` | `1-1`, `1-2`, `2-1`, `2-2`, `3-1`, `3-2` |
| **IA** (Imaginal Agility) | Purple | `/workshop/ia/*` | `/api/ia/*` | `ia-1-1`, `ia-1-2`, `ia-2-1`, `ia-2-2` |

**RULE**: Never mix workshops - no cross-workshop data sharing or UI contamination  
**REQUIREMENT**: Always specify workshop type when working on features

## 🔄 Git Workflow

**Branches:**
- **main**: Production-ready code
- **development**: Active development (primary branch)  
- **feature/**: New features
- **hotfix/**: Critical production fixes

**Safe Commands** (always use `-m` to avoid terminal hangs):
```bash
git commit -m "Your message here"
git tag -a v1.0.0 -m "Version message"  
git merge --no-ff branch-name -m "Merge message"
```

## 🗄️ Database & Environment Variables

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `CLAUDE_API_KEY` - AI integration key
- `OPENAI_API_KEY` - AI integration key
- `NODE_ENV` - Environment (development/staging/production)
- `ENVIRONMENT` - Deployment environment

**Database Selection:**
- **Local DB** (`postgresql://localhost:5432/heliotrope_dev`): Schema changes, AI training, destructive operations
- **RDS DB**: UI development, read-only testing, staging/production

**Commands:**
```bash
npm run db:migrate      # Run migrations
npm run db:seed        # Seed test data
psql heliotrope_dev    # Connect to local DB
```

**Admin Access**: `/admin` (credentials in `.env` files)

## 🚩 Feature Flags

**Configuration Files:**
- **Server**: `server/utils/feature-flags.ts`
- **Client**: `client/src/utils/featureFlags.ts`

**Toggle Pattern:**
```bash
# Environment variables in .env files
FEATURE_HOLISTIC_REPORTS=true
FEATURE_DEBUG_PANEL=false  # Dev only
FEATURE_AI_COACHING=true
```

**Main Features**: Workshop locking, holistic reports, AI coaching, video management, feedback system, facilitator console

## 🔧 Development Tasks

**Feature Development Checklist:**
1. Create feature flag (if needed)
2. Determine workshop type (AST, IA, or both)  
3. Create appropriate routes/API endpoints
4. Implement with workshop separation
5. Add comprehensive tests

**API Structure**: `/api/ast/*`, `/api/ia/*`, `/api/shared/*`, `/api/admin/*`  
**Components**: `client/src/components/ui/` (shared), `content/allstarteams/` (AST), `content/imaginal-agility/` (IA)  
**API Documentation**: See `docs/API-ROUTES.md`

## 🧪 Testing

**Commands:**
```bash
npm test                       # Run all tests
npm run test:watch            # Watch mode  
npm run test:coverage         # Coverage report
```

**Workshop Coverage**: Always test both AST and IA workshops for any shared functionality  
**Separation Testing**: Validate no cross-workshop data contamination  
**Test Files**: See `__tests__/` directory for examples

## 📊 Performance Monitoring

**Budgets:**
- Main Bundle: 500 KB gzipped (⚠️ Currently 639 KB - FAILING)  
- Total Assets: 1000 KB gzipped (✅ Currently 693 KB - PASSING)

**Commands:**
```bash
npm run bundle:analyze         # Check bundle size
npm run build                 # Build with analysis
```

**Optimization**: 72% reduction possible via code splitting (see `/JiraTickets/KAN-147-implementation-report.md`)  
**Tracking**: See `docs/performance-tracking/README.md`

## 🔍 Troubleshooting

**Port Issues**: Use port 8080 (NOT 5000 - macOS AirPlay conflict)  
```bash
lsof -ti:8080 | xargs kill -9  # Kill process on port 8080
```

**Build Issues**: Clear caches and reinstall
```bash
npm cache clean --force && rm -rf node_modules && npm install
```

**Asset Loading Issues**: Sync development assets
```bash
./tempClaudecomms/sync-dev-assets.sh  # Sync ADV graphics between directories
```

**Health Check**: 
```bash
curl http://localhost:8080/health  # ⚠️ Use /health NOT /api/health
```

## 🤖 AI Integration

**Features**: Holistic reports, coaching interface, content generation  
**Configuration**: `CLAUDE_API_KEY` and `OPENAI_API_KEY` in environment variables  
**Key Storage**: Keys managed in `keys/` directory (do not commit)  
**Guidelines**: Validate responses, rate limiting, caching, fallback content

## 🚀 Deployment

**Infrastructure**: AWS Lightsail service `hi-replit-v2`, container `allstarteams-app`, port 8080  

**Deployment Documentation:**
- **Quick Reference**: `DEPLOYMENT-QUICK-REFERENCE.md`
- **Checklist**: `DEPLOYMENT-CHECKLIST.md`  
- **AWS Guide**: `docs/deployment/aws-lightsail-deployment-guide.md`
- **Version Management**: `./version-manager.sh` for semantic versioning
- **Environment Access**: See deployment docs for SSH and environment access
- **VM SSH Key**: `keys/ubuntu-staging-key.pem` for hi-staging-vm (34.220.143.127)

**Critical Rules**:
- Use port 8080 (NOT 5000)
- Health check path: `/health` (NOT `/api/health`)
- Always test staging before production
- Use git commands with `-m` flag

## 🤖 Claude Code Integration

**Capabilities:**
- ✅ Local development, builds, code analysis
- ✅ Git operations (with `-m` flags), documentation updates
- ✅ Command preparation in `/tempClaudecomms/`
- ✅ Jira ticket creation in `/JiraTickets/`
- ❌ No SSH access, remote execution, or live debugging

**Command Handoff Process:**
1. Claude prepares commands in `/tempClaudecomms/`
2. User executes on appropriate environment  
3. User shares results/errors for analysis
4. Iterative resolution

**Custom Prompts**: `/Claude Code Prompts/` folder for specialized task instructions

## 📊 Project Management

**Jira Projects**: SA (strategic), KAN (development), AWB (assets), CR (research)  
**Ticket Process**: Claude creates tickets in `/JiraTickets/` folder, user manually creates in Jira  
**Confluence**: SAHI space (technical docs), HI space (general info)

## 🔐 Security & Standards

**Environment Protection**: Development (open) → Staging (protected) → Production (restricted)  
**Data Security**: Workshop-specific data, no cross-workshop sharing, secure API key management  
**Code Documentation**: Use TypeScript JSDoc for complex functions  
**API Documentation**: See `docs/API-ROUTES.md` for endpoint documentation

## 🎯 Development Priorities

**High**: Workshop separation, data integrity, performance, security  
**Medium**: Feature flags, AI integration, testing, documentation  
**Low**: UI polish, advanced optimizations, analytics

## 🆘 Emergency Procedures

**Application Down**: Check health endpoints → review deployments → check DB → roll back  
**Data Issues**: Stop writes → assess scope → restore backup → validate integrity  
**Security**: Rotate API keys → review logs → notify stakeholders → implement fixes

**Emergency Contacts**: Development team (technical), DevOps (production), Security team, Product team

## 📚 Resources

**Documentation**: `docs/` folder for project-specific guides  
**External**: [Node.js](https://nodejs.org/docs/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/), [PostgreSQL](https://www.postgresql.org/docs/)  
**Services**: [Claude API](https://docs.anthropic.com/), [AWS Lightsail](https://docs.aws.amazon.com/lightsail/)

## 💡 Claude Code Tips

**Be Specific**: Always specify workshop type (AST/IA) and environment context  
**Include Errors**: Paste full error messages with file paths and line numbers  
**Workshop Rule**: Test both AST and IA when making shared changes

---

**Last Updated**: January 2025 | **Project Version**: v2.5.1 | **Claude Code Compatible**: ✅
