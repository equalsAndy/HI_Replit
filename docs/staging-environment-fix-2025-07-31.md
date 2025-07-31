# Staging Environment Configuration Issues - Resolution Documentation

**Date:** July 31, 2025  
**Environment:** Staging (AWS Lightsail VM)  
**Affected Systems:** Persona Management, Claude API Integration  

## Issue Summary

The staging environment experienced two critical configuration issues that prevented proper AI functionality and persona management visibility.

### Issues Identified

1. **Claude API Connection Failures**
   - **Symptom:** Reflection Talia showing "trouble connecting to my AI systems" fallback messages
   - **Root Cause:** `aiDevConfig.ts` only enables Claude when `ENVIRONMENT === 'development'`, but staging was missing this variable

2. **Persona Management Visibility**
   - **Symptom:** Admin interface showing "Available personas: 0/2" 
   - **Root Cause:** npm start script hardcoded `NODE_ENV=production`, causing persona filtering to hide development/staging personas

## Root Causes Analysis

### 1. Environment Variable Inconsistency

**Problem:** Mixed usage of `NODE_ENV` vs `ENVIRONMENT` variables
```typescript
// aiDevConfig.ts - requires ENVIRONMENT
claude: { enabled: process.env.ENVIRONMENT === 'development' }

// persona-management-routes.ts - uses NODE_ENV  
const currentEnvironment = process.env.NODE_ENV || 'development';
```

**Impact:** Different parts of the application used different environment detection methods.

### 2. Hardcoded npm Start Script

**Problem:** Docker container npm start script overrides runtime NODE_ENV
```bash
# In container logs:
> NODE_ENV=production node dist/index.js
```

**Impact:** Even when setting `NODE_ENV=development` via Docker `-e` flag, the npm script forced production mode.

### 3. Restrictive Persona Environment Configuration

**Problem:** Personas had limited environment visibility
```typescript
// Reflection Talia
environments: ['development', 'staging']  // Missing 'production'

// Star Report Talia  
environments: ['development', 'staging']  // Database showed this vs expected ['development', 'staging', 'production']
```

**Impact:** When environment was detected as 'production', no personas were visible.

## Resolution Steps Applied

### 1. Claude API Fix
```bash
# Added missing ENVIRONMENT variable
echo 'ENVIRONMENT=development' >> staging.env
```

### 2. NODE_ENV Override
```bash
# Override hardcoded npm script
docker run -e NODE_ENV=development --env-file staging.env ...
```

### 3. Database Persona Environment Updates
```sql
-- Updated both personas to include production
UPDATE talia_personas 
SET environments = array['development', 'staging', 'production']
WHERE id IN ('ast_reflection', 'star_report');
```

## Final Working Configuration

**Environment Variables:**
```bash
NODE_ENV=development          # For persona visibility
ENVIRONMENT=development       # For Claude API access
DATABASE_URL=postgresql://... # Database connection
CLAUDE_API_KEY=sk-ant-...    # Claude API access
SESSION_SECRET=dev-secret... # Session management
```

**Results:**
- ✅ Claude API: `enabled=true, hasKey=true`
- ✅ Personas: `Available personas: 2/2`
- ✅ Reflection Talia: AI responses working
- ✅ Report Talia: Report generation working

## Permanent Fixes Required

### 1. Fix npm Start Script (High Priority)

**File:** `package.json`
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:production": "NODE_ENV=production node dist/index.js",
    "start:staging": "NODE_ENV=staging node dist/index.js",
    "start:development": "NODE_ENV=development node dist/index.js"
  }
}
```

### 2. Standardize Environment Detection (High Priority)

**File:** `server/routes/persona-management-routes.ts` (Line 415)
```typescript
// Current problematic code:
const currentEnvironment = process.env.NODE_ENV || 'development';

// Fixed code:
const currentEnvironment = process.env.ENVIRONMENT || process.env.NODE_ENV || 'development';
```

### 3. Update Default Persona Environments (Medium Priority)

**File:** `server/routes/persona-management-routes.ts` (Lines 142, 190)
```typescript
// Reflection Talia fallback
environments: ['development', 'staging', 'production'], // Added 'production'

// Star Report Talia fallback  
environments: ['development', 'staging', 'production'], // Ensure consistency
```

### 4. Add Environment Validation Logging (Medium Priority)

**File:** `server/index.ts` (Add to startup sequence)
```typescript
console.log('🔧 Environment Configuration Check:', {
  NODE_ENV: process.env.NODE_ENV,
  ENVIRONMENT: process.env.ENVIRONMENT,
  claudeEnabled: process.env.ENVIRONMENT === 'development',
  personaEnvironment: process.env.NODE_ENV || 'development'
});
```

### 5. Update Deployment Documentation (Low Priority)

**File:** `CLAUDE.md` (Staging deployment section)
```bash
# Always override NODE_ENV for staging
docker run -e NODE_ENV=development --env-file staging.env ...

# Verify environment variables
docker exec staging-app env | grep -E "(NODE_ENV|ENVIRONMENT)"
```

## Prevention Measures

### 1. Pre-deployment Checklist
- [ ] Verify NODE_ENV override in Docker command
- [ ] Confirm ENVIRONMENT variable is set
- [ ] Test persona visibility before deployment
- [ ] Verify Claude API connectivity

### 2. Environment Variable Standards
```bash
# Development
NODE_ENV=development
ENVIRONMENT=development

# Staging  
NODE_ENV=development     # For feature visibility
ENVIRONMENT=development  # For Claude API access

# Production
NODE_ENV=production
ENVIRONMENT=production
```

### 3. Health Check Enhancements
Add environment status to health endpoints:
```typescript
GET /api/health/environment
{
  "NODE_ENV": "development",
  "ENVIRONMENT": "development", 
  "claudeEnabled": true,
  "personasAvailable": 2
}
```

## Testing Verification

After implementing fixes, verify:

1. **Claude API:** Test Reflection Talia chat responses
2. **Personas:** Confirm both personas visible in admin interface
3. **Reports:** Generate test report with Report Talia
4. **Environment:** Check startup logs show consistent environment detection

## Timeline

- **Issue Discovered:** July 31, 2025
- **Root Cause Identified:** July 31, 2025  
- **Workaround Applied:** July 31, 2025
- **Permanent Fixes Required:** August 2025

## Impact Assessment

**Before Fix:**
- Staging AI features: Non-functional
- Admin persona management: Empty
- User experience: Degraded (fallback messages)

**After Fix:**
- Staging AI features: Fully functional
- Admin persona management: Both personas visible
- User experience: Equivalent to development environment

---

**Document Authors:** Claude Code  
**Review Status:** Ready for Implementation  
**Next Actions:** Implement permanent fixes in development branch