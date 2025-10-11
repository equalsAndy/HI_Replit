# KAN - Guard Debug Routes Behind Production Checks

**Issue Type:** Task  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
Hide debug, test, and admin development endpoints behind environment checks or explicit admin flags to prevent exposure in production

## Description
The application currently exposes several debug, test, and administrative endpoints that should not be accessible in production environments. These endpoints can leak sensitive information, provide unnecessary attack surface, or allow unauthorized system manipulation. Implementing proper guards will improve production security posture.

### Current Issues Identified
1. **Debug Endpoints**: Development debugging routes exposed in all environments
2. **Test Routes**: Testing utilities accessible in production
3. **Admin Debug Routes**: Administrative debugging without proper restrictions
4. **Health Endpoints**: Overly verbose health checks exposing system details
5. **Reset Endpoints**: Data manipulation routes without environment guards

### Potential Exposed Routes (Examples)
- Debug/test endpoints in `server/index.ts`
- Admin debugging routes in various admin route files
- Development-only utilities
- System information endpoints
- Database manipulation routes

## Impact Assessment
- **Severity**: Medium
- **Risk**: Information disclosure, unauthorized system access, debug data leakage
- **Attack Surface**: Reduced security through obscurity
- **Compliance**: Production security best practices

## Acceptance Criteria

### Must Have
- [ ] All debug routes hidden behind `NODE_ENV !== 'production'` checks
- [ ] Test endpoints only accessible in development/staging environments
- [ ] Admin debug routes require explicit admin authentication + environment check
- [ ] Health endpoints provide minimal information in production
- [ ] No sensitive system information exposed in production

### Should Have
- [ ] Centralized debug route registration system
- [ ] Configurable debug mode via environment variables
- [ ] Audit logging when debug routes are accessed
- [ ] Clear documentation of which routes are debug-only
- [ ] Automatic route inventory for security review

### Could Have
- [ ] Debug route access logging and monitoring
- [ ] Time-based debug access (temporary debug windows)
- [ ] IP-based restrictions for debug routes
- [ ] Debug route usage analytics
- [ ] Automated security scanning for exposed debug routes

## Technical Implementation

### Phase 1: Environment-Based Route Guards
```typescript
// Utility for environment-aware route registration
export const debugRoutes = {
  // Register debug-only routes
  register: (app: Express, routes: DebugRoute[]) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isStaging = process.env.ENVIRONMENT === 'staging';
    const allowDebugRoutes = isDevelopment || isStaging || process.env.ENABLE_DEBUG_ROUTES === 'true';
    
    if (!allowDebugRoutes) {
      console.log('🔒 Debug routes disabled in production environment');
      return;
    }
    
    console.log(`🐛 Registering ${routes.length} debug routes`);
    routes.forEach(route => {
      app[route.method](route.path, ...route.handlers);
      console.log(`  - ${route.method.toUpperCase()} ${route.path} [DEBUG]`);
    });
  },
  
  // Create debug middleware wrapper
  guard: (handler: RequestHandler): RequestHandler => {
    return (req, res, next) => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isStaging = process.env.ENVIRONMENT === 'staging';
      const allowDebug = isDevelopment || isStaging || process.env.ENABLE_DEBUG_ROUTES === 'true';
      
      if (!allowDebug) {
        return res.status(404).json({
          success: false,
          error: 'Not found'
        });
      }
      
      // Log debug route access
      console.log(`🐛 DEBUG ROUTE ACCESS: ${req.method} ${req.path} from ${req.ip}`);
      handler(req, res, next);
    };
  }
};

interface DebugRoute {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  handlers: RequestHandler[];
  description?: string;
}
```

### Phase 2: Secure Health Endpoints
```typescript
// Production-safe health endpoint
app.get('/health', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const basicHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  };
  
  if (isProduction) {
    // Minimal information in production
    res.json(basicHealth);
  } else {
    // Detailed information in development/staging
    const detailedHealth = {
      ...basicHealth,
      version: getVersionInfo(),
      environment: process.env.NODE_ENV,
      database: await checkDatabaseConnection(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
    
    res.json(detailedHealth);
  }
});

// Separate detailed health endpoint for authorized access
app.get('/health/detailed', 
  requireAuth,
  requireAdmin,
  debugRoutes.guard(async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: getVersionInfo(),
      environment: process.env.NODE_ENV,
      database: await checkDatabaseConnection(),
      sessions: await checkSessionStore(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      diskSpace: await checkDiskSpace()
    };
    
    res.json(health);
  })
);
```

### Phase 3: Admin Debug Routes
```typescript
// Debug routes with admin + environment protection
const adminDebugRoutes: DebugRoute[] = [
  {
    method: 'get',
    path: '/debug/users',
    handlers: [
      requireAuth,
      requireAdmin,
      (req, res) => {
        // Debug user information
        res.json({ message: 'Debug users endpoint' });
      }
    ],
    description: 'Debug user information'
  },
  {
    method: 'get',
    path: '/debug/sessions',
    handlers: [
      requireAuth,
      requireAdmin,
      (req, res) => {
        // Debug session information
        res.json({ message: 'Debug sessions endpoint' });
      }
    ],
    description: 'Debug session information'
  },
  {
    method: 'post',
    path: '/debug/reset-data',
    handlers: [
      requireAuth,
      requireAdmin,
      (req, res) => {
        // Reset test data
        res.json({ message: 'Debug reset endpoint' });
      }
    ],
    description: 'Reset test data (DANGEROUS)'
  }
];

// Register admin debug routes
debugRoutes.register(app, adminDebugRoutes);
```

### Phase 4: Development-Only Test Routes
```typescript
// Test routes only in development
const testRoutes: DebugRoute[] = [
  {
    method: 'post',
    path: '/test/create-user',
    handlers: [(req, res) => {
      // Create test user
      res.json({ message: 'Test user created' });
    }],
    description: 'Create test user for development'
  },
  {
    method: 'get',
    path: '/test/workshop-data',
    handlers: [(req, res) => {
      // Get test workshop data
      res.json({ message: 'Test workshop data' });
    }],
    description: 'Get test workshop data'
  },
  {
    method: 'delete',
    path: '/test/cleanup',
    handlers: [(req, res) => {
      // Cleanup test data
      res.json({ message: 'Test data cleaned' });
    }],
    description: 'Cleanup test data'
  }
];

// Only register in development
if (process.env.NODE_ENV === 'development') {
  debugRoutes.register(app, testRoutes);
}
```

## Route Security Classification

### Public Routes (Always Available)
- `/health` - Basic health check
- `/api/auth/login` - Authentication
- `/api/auth/register` - Registration
- Main application routes

### Admin Routes (Require Authentication)
- `/admin/*` - Admin panel routes
- `/api/admin/*` - Admin API routes
- Require `requireAuth` + `requireAdmin`

### Debug Routes (Environment Restricted)
- `/debug/*` - Debug endpoints
- `/test/*` - Test utilities
- `/health/detailed` - Detailed system info
- Only in development/staging OR with `ENABLE_DEBUG_ROUTES=true`

### Dangerous Routes (Admin + Environment + Explicit Flag)
- Data reset endpoints
- System manipulation routes
- Database debugging
- Require admin auth + environment check + explicit flag

## Environment Configuration

### Development Environment
```bash
NODE_ENV=development
ENABLE_DEBUG_ROUTES=true  # Explicit enable
DEBUG_LEVEL=verbose       # Detailed logging
```

### Staging Environment
```bash
NODE_ENV=staging
ENABLE_DEBUG_ROUTES=true  # Allow for testing
DEBUG_LEVEL=normal        # Moderate logging
```

### Production Environment
```bash
NODE_ENV=production
ENABLE_DEBUG_ROUTES=false # Explicitly disabled
DEBUG_LEVEL=minimal       # Minimal logging
```

## Files Requiring Changes

### Core Application
- `server/index.ts` - Add debug route guards
- Create `server/utils/debug-routes.ts` - Debug route utilities

### Route Files
- `server/routes/admin-routes.ts` - Guard admin debug routes
- `server/routes/auth-routes.ts` - Remove debug login helpers
- Any other files with debug/test endpoints

### Configuration
- `server/config/environment.ts` - Add debug configuration
- `.env.example` - Document debug environment variables

### Documentation
- `docs/development.md` - Document debug route system
- `README.md` - Update development setup instructions

## Testing Strategy

### Environment Testing
```typescript
describe('Debug Route Guards', () => {
  beforeEach(() => {
    // Reset environment
    delete process.env.NODE_ENV;
    delete process.env.ENABLE_DEBUG_ROUTES;
  });
  
  it('should hide debug routes in production', async () => {
    process.env.NODE_ENV = 'production';
    
    const response = await request(app).get('/debug/test-route');
    expect(response.status).toBe(404);
  });
  
  it('should allow debug routes in development', async () => {
    process.env.NODE_ENV = 'development';
    
    const response = await request(app).get('/debug/test-route');
    expect(response.status).not.toBe(404);
  });
  
  it('should respect explicit debug flag', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEBUG_ROUTES = 'true';
    
    const response = await request(app).get('/debug/test-route');
    expect(response.status).not.toBe(404);
  });
});
```

### Security Testing
- [ ] Verify debug routes are not accessible in production
- [ ] Test admin routes require proper authentication
- [ ] Confirm health endpoints don't leak sensitive info
- [ ] Validate environment variable behavior

## Security Audit Checklist

### Route Inventory
- [ ] List all endpoints and their protection level
- [ ] Identify debug/test routes
- [ ] Document admin-only routes
- [ ] Review health/status endpoints

### Access Control
- [ ] Verify authentication requirements
- [ ] Test authorization checks
- [ ] Validate environment guards
- [ ] Confirm error handling doesn't leak info

### Information Disclosure
- [ ] Review error messages
- [ ] Check logging output
- [ ] Validate health endpoint responses
- [ ] Test debug route responses

## Monitoring and Logging

### Debug Route Access Logging
```typescript
const logDebugAccess = (req: Request, route: string) => {
  const logData = {
    timestamp: new Date().toISOString(),
    route,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100),
    userId: (req.session as any)?.userId || null
  };
  
  console.warn('DEBUG_ROUTE_ACCESS:', logData);
  
  // In production, this might warrant an alert
  if (process.env.NODE_ENV === 'production') {
    console.error('🚨 DEBUG ROUTE ACCESSED IN PRODUCTION:', logData);
  }
};
```

### Production Alerts
```typescript
// Alert if debug routes are accessed in production
const alertDebugAccess = (route: string, req: Request) => {
  if (process.env.NODE_ENV === 'production') {
    // Send alert to monitoring system
    console.error('SECURITY_ALERT: Debug route accessed in production', {
      route,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
};
```

## Risk Assessment

### High Risk - Missing Implementation
- Debug routes exposed in production
- Sensitive information disclosure
- Unauthorized system access

### Medium Risk - Configuration Issues
- Environment variables not set correctly
- Admin routes not properly protected
- Debug flags accidentally enabled in production

### Low Risk - Operational
- Debug routes needed for troubleshooting
- Monitoring overhead from logging
- Developer workflow impact

## Success Metrics
- [ ] Zero debug routes accessible in production
- [ ] All admin routes properly protected
- [ ] Health endpoints provide appropriate detail level
- [ ] No sensitive information disclosed

## Dependencies
- Existing authentication and authorization middleware
- Environment configuration system
- Logging infrastructure

## Timeline Estimate
- **Route Audit and Classification**: 3 hours
- **Debug Guard Implementation**: 4 hours
- **Environment Configuration**: 2 hours
- **Testing and Validation**: 3 hours
- **Documentation**: 2 hours
- **Total**: 14 hours (2 development days)

---

**Related Issues:**
- Production security hardening
- Environment configuration management
- Admin panel security

**Labels:** security, debug, environment, production, routes, access-control