# KAN - Production Logging Cleanup and Infrastructure

**Issue Type:** Task  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-01-27

## Summary
Replace extensive console.log statements with proper logging infrastructure and reduce noise in production environments.

## Description
Code review revealed 3,760+ console statements across the codebase, creating excessive noise in production logs and potential performance issues.

**Current Issues:**
- 3,760+ console.log/error/warn statements throughout codebase
- No centralized logging configuration
- Debug information mixed with production logs
- No log level management
- Potential performance impact in production

**Impact:**
- Difficult to troubleshoot production issues
- Log noise makes monitoring ineffective
- Potential performance degradation
- Poor production observability

## Acceptance Criteria

### Phase 1: Logging Infrastructure
- [ ] Install and configure Winston or Pino logging library
- [ ] Create centralized logger configuration with log levels
- [ ] Set up environment-specific logging (dev vs staging vs production)
- [ ] Configure log rotation and retention policies
- [ ] Add structured logging format (JSON for production)

### Phase 2: Console Statement Audit
- [ ] Audit all console.log statements in client code
- [ ] Audit all console.log statements in server code
- [ ] Categorize logs by importance (debug, info, warn, error)
- [ ] Identify which logs are needed in production

### Phase 3: Logging Replacement
- [ ] Replace debug console.logs with proper debug-level logging
- [ ] Replace informational console.logs with info-level logging
- [ ] Replace error console.logs with error-level logging
- [ ] Remove unnecessary debug statements
- [ ] Add contextual information to important logs

### Phase 4: Production Optimization
- [ ] Set production log level to 'info' or higher
- [ ] Remove development-only logging
- [ ] Add request/response logging middleware
- [ ] Implement error tracking integration (optional)

## Technical Implementation

### High-Priority Files for Cleanup:
```
server/routes/auth-routes.ts - 15+ console statements
server/services/user-management-service.ts - 51+ console statements  
server/routes/workshop-data-routes.ts - 97+ console statements
client/src/hooks/use-navigation-progress.ts - 54+ console statements
client/src/components/assessment/*.tsx - Multiple files with debug logs
```

### Logger Configuration Example:
```typescript
// server/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Workshop-Specific Logging:
- Add workshop context to all logs (AST vs IA)
- Include user ID and session information
- Log critical workshop transitions
- Maintain audit trail for admin actions

## Environment Configuration
- **Development:** All log levels, console output
- **Staging:** Info level and above, file + console
- **Production:** Warn level and above, file only

## Performance Targets
- Reduce console output by 80% in production
- Log file size under 100MB daily with rotation
- No performance impact on user-facing operations

## Dependencies
- Choose logging library (Winston vs Pino)
- Configure log storage/rotation
- Update deployment scripts for log management