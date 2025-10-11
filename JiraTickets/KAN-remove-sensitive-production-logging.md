# KAN - Remove Sensitive Production Logging

**Issue Type:** Task  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
Remove excessive logging of sensitive user data, session information, and passwords from production environments

## Description
The application currently logs sensitive information including full session data, user authentication details, and potentially passwords in production. This creates security risks through log exposure and violates data privacy principles.

### Current Issues Identified
1. **Session Data Logging**: Full session objects logged with user IDs and roles
2. **Authentication Logging**: User credentials and authentication details
3. **SQL Result Logging**: Raw database results potentially containing PII
4. **Password Logging**: Potential password exposure in authentication flows
5. **User Data Logging**: Personal information in debug output

### Affected Files (10+ locations)
- `server/middleware/auth.ts` - Session and user data
- `server/services/user-management-service.ts` - User authentication data  
- `server/routes/auth-routes.ts` - Login/password data
- `server/routes/holistic-report-routes.ts` - User report data
- `server/services/beta-tester-notes-service.ts` - User notes/feedback
- `server/services/pdf-report-service.ts` - User report content
- `server/routes/admin-routes.ts` - Admin operations
- `server/services/claude-api-service.ts` - API requests/responses
- `server/services/openai-api-service.ts` - AI interactions
- `server/index.ts` - Application startup logs

## Impact Assessment
- **Severity**: High
- **Risk**: Data privacy violation, log-based data exposure
- **Compliance**: GDPR, privacy regulation violations
- **Security**: Sensitive data in log files, potential credential exposure

## Acceptance Criteria

### Must Have
- [ ] No sensitive user data (PII, passwords, sessions) logged in production
- [ ] Implement environment-aware logging (verbose in dev, minimal in prod)
- [ ] Replace sensitive log content with sanitized versions
- [ ] Add logging configuration management

### Should Have
- [ ] Create structured logging with different levels
- [ ] Implement log sanitization functions
- [ ] Add security event logging (without sensitive data)
- [ ] Document logging best practices for team

### Could Have
- [ ] Implement log aggregation and monitoring
- [ ] Add audit trail for sensitive operations
- [ ] Create log retention policies
- [ ] Implement log encryption for sensitive environments

## Technical Implementation

### Phase 1: Environment-Aware Logging
```typescript
// Utility for production-safe logging
const isProduction = process.env.NODE_ENV === 'production';

function debugLog(message: string, data?: any) {
  if (!isProduction) {
    console.log(message, data);
  }
}

function productionSafeLog(message: string, sanitizedData?: any) {
  console.log(message, sanitizedData);
}
```

### Phase 2: Data Sanitization Functions
```typescript
// Sanitize user data for logging
function sanitizeUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    role: user.role,
    // Remove PII: name, email, etc.
  };
}

function sanitizeSession(session: any) {
  if (!session) return null;
  return {
    userId: session.userId ? '[USER_ID_SET]' : '[NO_USER]',
    hasRole: !!session.userRole,
    // Remove sensitive session data
  };
}

function sanitizeError(error: any) {
  return {
    message: error.message,
    stack: isProduction ? '[STACK_HIDDEN]' : error.stack
  };
}
```

### Phase 3: Replace Current Logging

#### Authentication Middleware
```typescript
// BEFORE (SENSITIVE)
console.log('Auth check - Session:', sessionUserId, 'Cookie:', cookieUserId);
console.log('Full session data:', req.session);

// AFTER (SAFE)
debugLog('Auth check details:', {
  hasSession: !!sessionUserId,
  hasCookie: !!cookieUserId
});
productionSafeLog('Authentication attempt', {
  userId: sessionUserId ? '[AUTHENTICATED]' : '[ANONYMOUS]',
  timestamp: new Date().toISOString()
});
```

#### User Authentication
```typescript
// BEFORE (SENSITIVE)  
console.log('Login attempt:', { email, password, userData });

// AFTER (SAFE)
productionSafeLog('Login attempt', {
  email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially obscure email
  success: false,
  timestamp: new Date().toISOString()
});
```

### Phase 4: Security Event Logging
```typescript
// Log security events without exposing data
function logSecurityEvent(event: string, userId?: number, details?: any) {
  const logData = {
    event,
    userId: userId || null,
    timestamp: new Date().toISOString(),
    ip: details?.ip,
    userAgent: details?.userAgent?.substring(0, 50) // Truncate
  };
  
  console.log(`SECURITY_EVENT: ${event}`, logData);
}

// Usage examples
logSecurityEvent('LOGIN_SUCCESS', userId);
logSecurityEvent('LOGIN_FAILED', null, { ip: req.ip });
logSecurityEvent('ADMIN_ACCESS', userId, { action: 'view_users' });
```

## Logging Strategy by Environment

### Development Environment
- **Level**: Verbose/Debug
- **Content**: Full data for debugging (non-sensitive)
- **Retention**: Local only, can be detailed

### Staging Environment  
- **Level**: Info/Warn
- **Content**: Sanitized data, security events
- **Retention**: 30 days, structured logs

### Production Environment
- **Level**: Warn/Error + Security Events
- **Content**: No PII, minimal context
- **Retention**: 90 days, encrypted storage

## Files Requiring Changes

### High Priority (Authentication & User Data)
- `server/middleware/auth.ts` - Remove session logging
- `server/routes/auth-routes.ts` - Sanitize login logs
- `server/services/user-management-service.ts` - Remove user data logs

### Medium Priority (Application Logic)
- `server/routes/holistic-report-routes.ts` - Sanitize report logs
- `server/services/beta-tester-notes-service.ts` - Remove content logs
- `server/routes/admin-routes.ts` - Sanitize admin operation logs

### Low Priority (External Services)
- `server/services/claude-api-service.ts` - Remove API request/response logs
- `server/services/openai-api-service.ts` - Sanitize AI interaction logs

### Infrastructure
- Create `server/utils/logging.ts` - Centralized logging utilities
- Update `server/index.ts` - Configure logging levels

## Testing Strategy

### Code Review Checklist
- [ ] No console.log with user objects
- [ ] No password/session data in logs
- [ ] Environment checks for verbose logging
- [ ] Sanitization functions used correctly

### Security Testing
- [ ] Review production logs for sensitive data
- [ ] Test logging in all environments
- [ ] Verify log sanitization works properly
- [ ] Check error handling doesn't expose data

### Compliance Testing
- [ ] Ensure no PII in production logs
- [ ] Verify GDPR compliance
- [ ] Test log retention policies
- [ ] Validate data minimization principles

## Implementation Guidelines

### DO's
✅ Log security events (login success/failure, admin actions)  
✅ Use environment-aware logging levels  
✅ Sanitize data before logging  
✅ Log errors without exposing sensitive context  
✅ Include timestamps and basic context  

### DON'Ts
❌ Log full user objects or session data  
❌ Log passwords, tokens, or credentials  
❌ Log personal information (names, emails, addresses)  
❌ Log raw SQL results containing user data  
❌ Log API keys or secrets  

## Risk Mitigation

### Immediate Actions
1. Audit current logs for sensitive data exposure
2. Implement emergency log sanitization
3. Review log access permissions
4. Consider log file encryption

### Long-term Actions
1. Implement structured logging framework
2. Create log monitoring and alerting
3. Establish log retention policies  
4. Regular log security audits

## Success Metrics
- [ ] Zero PII/sensitive data in production logs
- [ ] Maintained debugging capability in development
- [ ] Security event logging functional
- [ ] No regression in error tracking/debugging

## Dependencies
- No external dependencies required
- Existing logging infrastructure sufficient
- May require log management system updates

## Timeline Estimate
- **Audit Current Logging**: 4 hours
- **Implement Logging Utils**: 4 hours  
- **Update All Log Statements**: 8 hours
- **Testing and Validation**: 4 hours
- **Total**: 20 hours (2.5 development days)

---

**Related Issues:**
- Data privacy compliance
- Security logging implementation
- Production environment hardening

**Labels:** security, logging, privacy, data-protection, production, compliance