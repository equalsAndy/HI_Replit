# Local Development Setup Guide

## 🗄️ Database Configuration

### **AWS RDS Only - No Local Database**

**IMPORTANT**: This project does NOT use local databases. All environments (including local development) connect to AWS-hosted PostgreSQL databases.

```bash
# Database URL is in root .env file
DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require

# Start development server (automatically uses AWS RDS)
npm run dev:hmr
```

**Development Database Connection:**
```
Environment: Development (localhost:8080)
Database: AWS Lightsail PostgreSQL (isolated dev database)
URL: postgresql://dbmasteruser:...@ls-3a6b051...us-west-2.rds.amazonaws.com:5432/postgres
SSL: Required (sslmode=require)
```

### **Why AWS RDS for Development?**

- ✅ **Data Persistence**: Data survives server restarts
- ✅ **Team Collaboration**: Shared development database
- ✅ **Production Parity**: Same database engine as staging/production
- ✅ **No Local Setup**: No PostgreSQL installation needed
- ✅ **Claude Code Compatible**: Consistent database across environments

## 🔧 Development Commands

```bash
# Start local development with HMR (preferred)
npm run dev:hmr

# Start server only (no Vite HMR)
npm run dev

# Build for testing
npm run build

# Run tests
npm test

# Check database connection
curl http://localhost:8080/health
```

## 🔍 Database Access

### Via Application:
```bash
# Admin console (requires admin credentials)
http://localhost:8080/admin

# Health check
curl http://localhost:8080/health
```

### Via Code:
```typescript
// Use existing database connection
import { db } from './server/db.js';
import { users, workshopStepData } from '../shared/schema.js';

// Query AWS database
const user = await db.select().from(users).where(eq(users.id, userId));
```

### Direct SQL (if needed):
```bash
# Connection string from .env
psql "postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require"
```

## 🛡️ Git Hygiene

The following files are properly ignored:

- ✅ **Environment files**: `.env`, `.env.local`, `server/.env*`
- ✅ **Version files**: `public/version.json`, `client/public/version.json`
- ✅ **Staging packages**: `staging-deploy-*/`
- ✅ **Temporary files**: All temp and build artifacts

## 🚀 Deployment Process

### **Local Development → Staging → Production**

1. **Local Development**: `localhost:8080` → AWS RDS Development DB
2. **Staging Testing**: `34.220.143.127` or `app2.heliotropeimaginal.com` → AWS RDS Staging DB
3. **Production Release**: `app.heliotropeimaginal.com` → AWS RDS Production DB

## 📋 Environment Configuration

| Environment | Server URL | Database | SSL |
|------------|-----------|----------|-----|
| Development | localhost:8080 | AWS Lightsail PostgreSQL (Dev) | Required |
| Staging | app2.heliotropeimaginal.com | AWS Lightsail PostgreSQL (Staging) | Required |
| Production | app.heliotropeimaginal.com | AWS Lightsail PostgreSQL (Production) | Required |

## ⚠️ Important Notes

- **No Local PostgreSQL**: Do NOT install PostgreSQL locally
- **Environment Isolation**: Each environment has separate AWS database
- **Git Clean**: Only commit code changes, not environment configurations
- **Data Safety**: Development database is isolated from staging/production
- **SSL Required**: All database connections use SSL

## 🔍 Troubleshooting

### **Can't Connect to Database**
```bash
# Check DATABASE_URL is loaded
echo $DATABASE_URL
# Should show: postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051...

# Check server logs
npm run dev:hmr
# Look for: "🔧 Database URL exists: true"
# Look for: "✅ Environment variables validated"
```

### **Database Connection Error**
```bash
# Verify SSL requirement
# DATABASE_URL must end with: ?sslmode=require

# Check AWS RDS is accessible
# Ensure you have internet connection
# Verify AWS Lightsail database is running
```

### **User Deletion Shows 0 Records**
```bash
# Restart server to reload root .env file
npm run dev:hmr

# Verify database connection in logs:
# Should show: "Database URL (partial): postgresql://dbmasteruser:Heli..."
# Should NOT show: "localhost" or "127.0.0.1"
```

### **Environment Issues**
```bash
# Server loads .env in this order:
# 1. Root .env (contains AWS DATABASE_URL) ← Primary
# 2. server/.env.<NODE_ENV> (if exists) ← Overrides (optional)

# Check root .env exists
cat .env | grep DATABASE_URL

# Check server is loading it
# Look in server/index.ts lines 9-15
```

## 🚫 What NOT to Do

- ❌ Don't install PostgreSQL locally
- ❌ Don't create local database connections
- ❌ Don't use `localhost:5432` for database
- ❌ Don't run `createdb` or `dropdb` commands
- ❌ Don't set up pgAdmin for local database
- ❌ Don't create `.env.local` with local database URL

## ✅ Correct Development Pattern

```typescript
// ✅ CORRECT: Use existing AWS database connection
import { db } from './server/db.js';
import { workshopStepData } from '../shared/schema.js';

export async function saveWorkshopData(userId: number, stepId: string, data: any) {
  return await db.insert(workshopStepData).values({
    userId,
    stepId,
    data,
    workshopType: 'ast'
  });
}

// ❌ INCORRECT: Don't create new database connections
const localDb = new PostgresClient('localhost:5432'); // WRONG!
```

## 📚 Additional Resources

- **Database Guide**: `/docs/claude-code-database-guide.md`
- **Deployment Guide**: `DEPLOYMENT-QUICK-REFERENCE.md`
- **Claude.md**: `CLAUDE.md` (project instructions)
- **API Routes**: `/docs/API-ROUTES.md`

---

**Last Updated**: October 2025
**Database**: AWS Lightsail PostgreSQL (all environments)
