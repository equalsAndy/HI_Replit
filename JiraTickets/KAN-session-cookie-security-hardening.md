# KAN - Session Cookie Security Hardening

**Issue Type:** Task  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
Secure session cookie configuration for production HTTPS deployment and eliminate hardcoded secrets

## Description
Session cookies are currently configured insecurely with `secure: false` even for production environments and use a hardcoded fallback secret. This creates multiple security vulnerabilities including session hijacking and predictable session encryption.

### Current Vulnerable Configuration
```typescript
cookie: {
  secure: process.env.NODE_ENV === 'production' ? false : false, // Always false!
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax'
},
secret: process.env.SESSION_SECRET || 'aws-production-secret-2025', // Hardcoded fallback
```

### Security Issues Identified
1. **Insecure Cookies**: `secure: false` allows session cookies over HTTP in production
2. **Hardcoded Secret**: Fallback secret is committed to source control
3. **Session Hijacking**: Cookies can be intercepted over unencrypted connections
4. **Predictable Encryption**: Known secret makes session data decryptable

## Impact Assessment
- **Severity**: High
- **Risk**: Session hijacking, man-in-the-middle attacks, session decryption
- **Affected**: All authenticated users
- **Deployment**: Critical for HTTPS production environments

## Acceptance Criteria

### Must Have
- [ ] Enable `secure: true` for HTTPS environments (staging/production)
- [ ] Require `SESSION_SECRET` environment variable (no fallback)
- [ ] Application fails to start without proper `SESSION_SECRET`
- [ ] Validate session secret strength (min 32 random characters)

### Should Have  
- [ ] Add session configuration validation on startup
- [ ] Document required environment variables in .env.example
- [ ] Implement session security headers
- [ ] Add session rotation mechanism

### Could Have
- [ ] Generate random session secrets in deployment scripts
- [ ] Implement session fingerprinting
- [ ] Add session security monitoring
- [ ] Consider shorter session timeouts for sensitive operations

## Technical Implementation

### Phase 1: Secure Cookie Configuration
```typescript
// Environment-aware secure cookie settings
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.ENVIRONMENT === 'staging';
const useSecureCookies = isProduction || isStaging;

app.use(session({
  store: sessionStore,
  secret: requireSessionSecret(), // Will throw if missing
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: useSecureCookies, // True for HTTPS environments
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: useSecureCookies ? 'strict' : 'lax' // Stricter for HTTPS
  },
  name: 'sessionId'
}));
```

### Phase 2: Session Secret Validation
```typescript
function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  
  if (!secret) {
    console.error('❌ SESSION_SECRET environment variable is required');
    console.error('Generate a secure secret: openssl rand -base64 32');
    process.exit(1);
  }
  
  if (secret.length < 32) {
    console.error('❌ SESSION_SECRET must be at least 32 characters');
    process.exit(1);
  }
  
  // Warn about common weak secrets
  const weakSecrets = [
    'aws-production-secret-2025',
    'session-secret',
    'development-secret'
  ];
  
  if (weakSecrets.includes(secret)) {
    console.error('❌ SESSION_SECRET appears to be a default/weak value');
    process.exit(1);
  }
  
  return secret;
}
```

### Phase 3: Environment Configuration
```bash
# .env.example additions
# Session Security (REQUIRED)
SESSION_SECRET=generate_with_openssl_rand_base64_32

# Development only - use secure cookies locally with HTTPS
# FORCE_SECURE_COOKIES=true
```

## Environment-Specific Configuration

### Development Environment
```typescript
cookie: {
  secure: false, // HTTP localhost acceptable
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax'
}
```

### Staging/Production Environment  
```typescript
cookie: {
  secure: true, // HTTPS required
  httpOnly: true,
  maxAge: 8 * 60 * 60 * 1000, // Shorter in production (8 hours)
  sameSite: 'strict' // Prevent CSRF
}
```

## Security Validation

### Pre-Deployment Checklist
- [ ] Verify `SESSION_SECRET` is set in all environments
- [ ] Test application startup fails without session secret
- [ ] Confirm secure cookies work with HTTPS
- [ ] Validate session persistence across requests
- [ ] Test logout properly clears sessions

### Post-Deployment Validation
- [ ] Monitor for session-related errors
- [ ] Verify cookies are marked secure in browser dev tools
- [ ] Test authentication flow works normally
- [ ] Confirm no session hijacking possible

## Deployment Strategy

### Phase 1: Environment Variable Setup
1. Generate strong session secrets for each environment
2. Update environment configuration files
3. Validate secrets in CI/CD pipeline

### Phase 2: Code Deployment
1. Deploy session validation code
2. Test in staging environment first
3. Monitor for authentication issues
4. Roll out to production with monitoring

### Phase 3: Security Verification
1. Security scan of session configuration
2. Penetration testing of session management
3. User acceptance testing
4. Performance impact assessment

## Files Requiring Changes

### Core Configuration
- `server/index.ts` - Session middleware configuration
- `server/utils/environment-validation.ts` - Add session secret validation

### Documentation
- `.env.example` - Document required SESSION_SECRET
- `README.md` - Update environment setup instructions
- `docs/deployment.md` - Document session security requirements

### Deployment Scripts
- `version-manager.sh` - Add session secret validation
- Deployment scripts - Ensure SESSION_SECRET is set

## Testing Strategy

### Unit Tests
- [ ] Session secret validation function
- [ ] Environment-specific cookie configuration
- [ ] Session security header validation

### Integration Tests
- [ ] Authentication flow with secure cookies
- [ ] Session persistence across requests
- [ ] Logout clears sessions properly
- [ ] HTTPS cookie behavior

### Security Tests
- [ ] Session hijacking prevention
- [ ] Cookie security attributes validation
- [ ] Secret strength validation
- [ ] Environment configuration testing

## Risk Assessment

### High Risk - Missing Implementation
- Session hijacking over insecure connections
- Predictable session encryption with known secrets
- Man-in-the-middle attacks

### Medium Risk - Configuration Issues
- Application startup failures without proper setup
- User authentication issues during deployment
- Session timeout behavior changes

### Low Risk - Performance Impact
- Minimal overhead from security validation
- Potential slight increase in cookie processing

## Success Metrics
- [ ] Zero session cookies transmitted over HTTP in production
- [ ] All environments use unique, strong session secrets
- [ ] No authentication regressions after deployment
- [ ] Security audit confirms proper session security

## Dependencies
- Existing express-session infrastructure
- HTTPS deployment for secure cookie functionality
- Environment variable management system
- CI/CD pipeline for secret management

## Timeline Estimate
- **Planning and Secret Generation**: 2 hours
- **Implementation**: 4 hours
- **Testing and Validation**: 3 hours
- **Deployment and Monitoring**: 3 hours
- **Total**: 12 hours (1.5 development days)

---

**Related Issues:**
- Session security hardening
- Production deployment security
- Authentication system improvements

**Labels:** security, session, cookies, production, configuration, hardening