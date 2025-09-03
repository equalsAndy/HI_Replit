# 🔧 Secret Management Troubleshooting

## Common Issues & Solutions

### ❌ "Missing required environment variables: ['DATABASE_URL', 'SESSION_SECRET']"

**Quick Fix:**
```bash
# Check what's missing
npm run check:env

# Set up environment
cp .env.example .env
# Edit .env file with your values
```

### ❌ "failed to save session"

**Cause**: Usually SESSION_SECRET not set or database connection issues.

**Solutions:**
1. **Check SESSION_SECRET**: `npm run check:env`
2. **Generate new secret**: 
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Check database connectivity**: Verify DATABASE_URL format

### ❌ Database connection errors

**Check DATABASE_URL format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Common issues:**
- Missing `?sslmode=require` for cloud databases
- Wrong credentials
- Network connectivity

### ❌ "Cannot GET /" in browser

**Cause**: Environment variables not loaded or server startup failed.

**Quick Fix:**
```bash
# Kill existing processes
pkill -f "tsx server/index.ts" || true

# Check environment
npm run check:env

# Start fresh
npm run dev
```

### 🟢 Replit-Specific Issues

**Variables not loading:**
1. Check Secrets tab (🔒 icon)
2. Verify variable names match exactly: `DATABASE_URL`, `SESSION_SECRET`
3. Restart Replit after adding secrets

**Still not working:**
- Use Console tab to run: `npm run check:env`
- Check for typos in secret names

### ☁️ AWS Production Issues

**Secrets not loading in container:**
1. Check AWS Secrets Manager has `hi-replit-env` secret
2. Verify Lightsail has permissions to access secrets
3. Check container logs for startup errors

**Update production secrets:**
```bash
aws secretsmanager update-secret \
  --secret-id hi-replit-env \
  --secret-string '{"DATABASE_URL":"...","SESSION_SECRET":"..."}'
```

## Environment File Issues

### .env file not working

**Check:**
1. File is in project root (same level as package.json)
2. File is named `.env` exactly (no .txt extension)
3. No spaces around = signs: `KEY=value` not `KEY = value`
4. Restart server after creating .env

### .env file ignored

**Possible causes:**
1. `.env` in wrong location
2. Server caching old environment
3. File has wrong format

**Fix:**
```bash
# Verify location
ls -la .env

# Check format
cat .env

# Restart with fresh environment
npm run dev
```

## Validation Commands

### Check if secrets are loaded
```bash
npm run check:env
```

### Test specific variable
```bash
node -e "console.log('DATABASE_URL:', !!process.env.DATABASE_URL)"
```

### Generate secure session secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Emergency Reset

If nothing works, start fresh:

```bash
# 1. Stop everything
pkill -f "tsx server/index.ts" || true

# 2. Clean environment
rm .env

# 3. Start fresh
cp .env.example .env
# Edit .env with correct values

# 4. Verify setup
npm run check:env

# 5. Start server
npm run dev
```

## Getting Help

**Before asking for help, run:**
```bash
npm run check:env
```

**Include this information:**
- Environment (Local/Replit/AWS)
- Error messages from terminal
- Output of `npm run check:env`
- Whether .env file exists: `ls -la .env`

**Common solutions work 90% of the time:**
1. Run `npm run check:env`
2. Copy `.env.example` to `.env`
3. Fill in correct values
4. Restart server with `npm run dev`