# Dual Environment Development Workflow

## 🎯 **Strategy Overview**
Create a systematic workflow using both Local (VSCode) and Replit environments with proper database isolation and feature flagging for safe development-to-production pipeline.

## 📊 **Environment Architecture**

### **Development Environment (Local - VSCode)**
- **Database**: AWS Lightsail PostgreSQL (Development)
- **URL**: `postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require`
- **Purpose**: Feature development, testing, experimentation
- **Safety**: Zero production risk

### **Production Environment (Replit)**
- **Database**: Neon PostgreSQL (Production)
- **URL**: `postgresql://neondb_owner:npg_Qqe3ljCsDkT0@ep-noisy-sun-a6grqv7a.us-west-2.aws.neon.tech/neondb?sslmode=require`
- **Purpose**: Live application serving real users
- **Safety**: Production data protection

## 🔧 **Implementation Plan**

### **Phase 1: Configure Replit for Development Database**

**1. Update Replit Environment Variables:**
```bash
# In Replit .env (Secrets)
DATABASE_URL="postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require"
NODE_TLS_REJECT_UNAUTHORIZED=0
SESSION_SECRET="dev-secret-key-2025-heliotrope-imaginal"
ENVIRONMENT="development"
```

**2. Create Environment Toggle System:**
```typescript
// shared/config.ts
export const config = {
  environment: process.env.ENVIRONMENT || 'development',
  isDevelopment: process.env.ENVIRONMENT === 'development',
  isProduction: process.env.ENVIRONMENT === 'production',
  database: {
    url: process.env.DATABASE_URL,
    isDev: process.env.DATABASE_URL?.includes('lightsail'),
    isProd: process.env.DATABASE_URL?.includes('neon')
  }
};
```

### **Phase 2: Feature Flagging System**

**1. Create Feature Flag Infrastructure:**
```typescript
// server/utils/feature-flags.ts
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  environment: 'development' | 'production' | 'both';
  description: string;
  created: string;
  lastModified: string;
}

export const featureFlags: Record<string, FeatureFlag> = {
  workshopLocking: {
    name: 'Workshop Locking System',
    enabled: true,
    environment: 'development',
    description: 'Lock workshop inputs after completion',
    created: '2025-07-12',
    lastModified: '2025-07-12'
  },
  holisticReports: {
    name: 'AI Holistic Reports',
    enabled: false,
    environment: 'development', 
    description: 'Claude API-powered individual reports',
    created: '2025-07-12',
    lastModified: '2025-07-12'
  },
  facilitatorConsole: {
    name: 'Facilitator Console',
    enabled: false,
    environment: 'development',
    description: 'Cohort management for facilitators',
    created: '2025-07-12',
    lastModified: '2025-07-12'
  }
};

export function isFeatureEnabled(featureName: string, environment: string): boolean {
  const flag = featureFlags[featureName];
  if (!flag) return false;
  
  return flag.enabled && (
    flag.environment === environment || 
    flag.environment === 'both'
  );
}
```

**2. Feature Flag Middleware:**
```typescript
// server/middleware/feature-flags.ts
import { isFeatureEnabled } from '../utils/feature-flags.js';
import { config } from '../../shared/config.js';

export function requireFeature(featureName: string) {
  return (req: any, res: any, next: any) => {
    if (isFeatureEnabled(featureName, config.environment)) {
      next();
    } else {
      res.status(404).json({ 
        error: `Feature '${featureName}' not available in ${config.environment}` 
      });
    }
  };
}
```

### **Phase 3: Development Workflow Documentation**

**Development Process:**

1. **Feature Development (Local VSCode)**
   - Work on AWS Lightsail development database
   - Create new features with feature flags
   - Test thoroughly with real schema, no production data
   - Document changes in feature flag system

2. **Feature Testing (Replit Development Mode)**
   - Switch Replit to development database
   - Test features in Replit environment
   - Validate feature flags work correctly
   - Ensure no production data exposure

3. **Production Deployment (Replit Production Mode)**
   - Switch Replit back to production database
   - Enable feature flags for production
   - Monitor deployment and rollback if needed
   - Update documentation

### **Phase 4: Environment Switching System**

**1. Environment Switch Script:**
```typescript
// scripts/switch-environment.ts
import fs from 'fs';

const environments = {
  development: {
    DATABASE_URL: "postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require",
    ENVIRONMENT: "development",
    NODE_TLS_REJECT_UNAUTHORIZED: "0"
  },
  production: {
    DATABASE_URL: "postgresql://neondb_owner:npg_Qqe3ljCsDkT0@ep-noisy-sun-a6grqv7a.us-west-2.aws.neon.tech/neondb?sslmode=require",
    ENVIRONMENT: "production"
  }
};

function switchEnvironment(env: 'development' | 'production') {
  const config = environments[env];
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  fs.writeFileSync('.env', envContent);
  console.log(`✅ Switched to ${env} environment`);
  console.log(`📊 Database: ${config.DATABASE_URL.includes('lightsail') ? 'Development (Lightsail)' : 'Production (Neon)'}`);
}
```

**2. Safety Checks:**
```typescript
// server/middleware/environment-safety.ts
export function validateEnvironment(req: any, res: any, next: any) {
  const isDev = config.database.isDev;
  const isProd = config.database.isProd;
  
  // Add safety headers
  res.setHeader('X-Environment', config.environment);
  res.setHeader('X-Database-Type', isDev ? 'development' : 'production');
  
  // Warning for production operations
  if (isProd && req.method !== 'GET') {
    console.warn(`⚠️ PRODUCTION OPERATION: ${req.method} ${req.path}`);
  }
  
  next();
}
```

## 📋 **Development Workflow**

### **Daily Development Process**

**1. Local Development (VSCode)**
```bash
# Ensure development environment
cat .env | grep DATABASE_URL
# Should show Lightsail database

# Start development
npm run dev

# Work on features with safety
# - No production data risk
# - Full schema available
# - Real database interactions
```

**2. Feature Flag Management**
```bash
# Enable feature for development
# Edit server/utils/feature-flags.ts
# Set enabled: true, environment: 'development'

# Test feature in local environment
# Verify functionality

# Enable for production when ready
# Change environment: 'production' or 'both'
```

**3. Replit Deployment Testing**
```bash
# Switch Replit to development database
# Test deployed version with development data
# Validate feature flags
# Ensure no production impact
```

**4. Production Deployment**
```bash
# Switch Replit to production database
# Enable production feature flags
# Monitor application health
# Document deployment
```

### **Safety Protocols**

**1. Database Protection**
- ✅ Never develop directly on production database
- ✅ Always verify environment before destructive operations
- ✅ Use feature flags for all new functionality
- ✅ Test on development database first

**2. Feature Deployment**
- ✅ Feature flags control availability
- ✅ Gradual rollout capability
- ✅ Quick rollback via flag toggle
- ✅ Environment-specific enabling

**3. Documentation Requirements**
- ✅ All features documented in feature flags
- ✅ Environment switches logged
- ✅ Production deployments tracked
- ✅ Rollback procedures available

## 🎯 **Immediate Implementation Steps**

### **Step 1: Configure Replit Development Mode**
1. Update Replit environment variables to use development database
2. Add environment safety middleware
3. Test Replit connection to development database

### **Step 2: Implement Feature Flag System**
1. Create feature flag utilities
2. Add middleware for feature protection
3. Document current features in flag system

### **Step 3: Create Environment Switch Process**
1. Document environment switching procedures
2. Create safety checks and validation
3. Test full development-to-production pipeline

### **Step 4: Establish Development Workflow**
1. Document daily development process
2. Create deployment checklists
3. Train on safety protocols

## 📊 **Success Metrics**

**Development Safety:**
- ✅ Zero accidental production modifications
- ✅ Feature flags control all new functionality
- ✅ Clear environment identification
- ✅ Safe rollback capability

**Development Efficiency:**
- ✅ Quick feature development cycle
- ✅ Easy environment switching
- ✅ Comprehensive testing capability
- ✅ Clear deployment pipeline

---

**Status**: Ready for implementation  
**Priority**: High - Establishes safe development foundation  
**Timeline**: 1-2 development sessions to implement core system