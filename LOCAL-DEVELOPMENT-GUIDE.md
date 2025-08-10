# Local Development Setup Guide

## 🗄️ Database Configuration

### **For Local Development (Recommended)**
Use the local PostgreSQL database to avoid interfering with live beta testing:

```bash
# Use local environment file
cp server/.env.local server/.env.development

# Or set environment variable directly
export DATABASE_URL="postgresql://bradtopliff@localhost:5432/heliotrope_dev"

# Start development server
npm run dev
```

**Local Database Connection:**
```
Database: heliotrope_dev
URL: postgresql://bradtopliff@localhost:5432/heliotrope_dev
Admin Users: testuser, simple, test, demo, system-admin
```

### **For AWS RDS Testing (If Needed)**
Only use when you need to test against the shared development database:

```bash
# Use the committed .env.development file (points to AWS RDS)
npm run dev
```

## 🔧 Development Commands

```bash
# Start local development (uses .env.local if available)
npm run dev

# Build for testing
npm run build

# Database management
psql heliotrope_dev                    # Connect to local DB
psql heliotrope_dev -c "\dt"          # List tables
dropdb heliotrope_dev && createdb heliotrope_dev  # Reset DB
```

## 🛡️ Git Hygiene

The following files are now properly ignored:

- ✅ **Environment files**: `server/.env.development`, `server/.env.local`
- ✅ **Version files**: `public/version.json`, `client/public/version.json`  
- ✅ **Staging packages**: `staging-deploy-*/`
- ✅ **Database scripts**: `setup-local-dev-database.sh`
- ✅ **Temporary files**: All temp and build artifacts

## 🚀 Deployment Process

### **Local Development → Staging → Production**

1. **Local Development**: Use `server/.env.local` with local PostgreSQL
2. **Staging Testing**: Deploy to VM using staging deployment scripts
3. **Production Release**: Use tagged releases for production deployment

## 📋 Environment Files

| File | Purpose | Database |
|------|---------|----------|
| `server/.env.local` | Your local development (not tracked) | Local PostgreSQL |
| `server/.env.development` | Shared development (tracked) | AWS RDS |
| `server/.env.staging` | Staging environment (not tracked) | AWS RDS |
| `server/.env.production` | Production environment (not tracked) | AWS RDS |

## ⚠️ Important Notes

- **Beta Testing Safety**: Local development won't affect live beta testers
- **Environment Isolation**: Each environment uses appropriate database
- **Git Clean**: Only commit code changes, not environment configurations
- **Database Reset**: Local database can be reset without affecting others

## 🔍 Troubleshooting

### **Can't Connect to Local Database**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL if needed (macOS)
brew services start postgresql@15

# Check database exists
psql -l | grep heliotrope_dev
```

### **Environment Issues**
```bash
# Check which environment file is being used
echo $DATABASE_URL

# Verify local environment file
cat server/.env.local
```

### **Git Issues**
```bash
# Clean working tree
git status

# Restore version files if needed
git restore public/version.json client/public/version.json
```