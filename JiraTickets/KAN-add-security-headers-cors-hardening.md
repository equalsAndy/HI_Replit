# KAN - Add Security Headers and CORS Hardening

**Issue Type:** Task  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
Implement comprehensive security headers using Helmet middleware and establish strict CORS policy for production environments

## Description
The application currently has no security header middleware and no CORS strategy, leaving it vulnerable to various client-side attacks including XSS, clickjacking, MIME sniffing, and cross-origin attacks. Adding Helmet middleware and proper CORS configuration will significantly improve security posture.

### Current Security Gaps
1. **Missing Security Headers**: No protection against XSS, clickjacking, MIME sniffing
2. **No CORS Policy**: Allows unrestricted cross-origin requests
3. **Content Security Policy**: No CSP headers to prevent script injection
4. **Missing HSTS**: No HTTP Strict Transport Security for HTTPS enforcement
5. **Referrer Policy**: No control over referrer information leakage

### Security Headers Needed
- `X-Frame-Options` - Prevent clickjacking
- `X-Content-Type-Options` - Prevent MIME sniffing
- `X-XSS-Protection` - Enable browser XSS protection
- `Content-Security-Policy` - Prevent script injection
- `Strict-Transport-Security` - Enforce HTTPS
- `Referrer-Policy` - Control referrer information

## Impact Assessment
- **Severity**: High
- **Risk**: XSS attacks, clickjacking, CSRF, data leakage
- **Affected**: All users, especially in production
- **Compliance**: Security best practices, OWASP recommendations

## Acceptance Criteria

### Must Have
- [ ] Add Helmet middleware with secure defaults
- [ ] Implement environment-specific CORS policy
- [ ] Configure Content Security Policy for React/Vite application
- [ ] Enable HSTS for HTTPS environments
- [ ] Validate security headers in production

### Should Have
- [ ] Customize CSP for specific API and asset requirements
- [ ] Add security headers testing
- [ ] Document CORS configuration
- [ ] Implement security header monitoring

### Could Have
- [ ] Add security header reporting endpoints
- [ ] Implement nonce-based CSP for inline scripts
- [ ] Add feature policy headers
- [ ] Create security header compliance dashboard

## Technical Implementation

### Phase 1: Install and Configure Helmet
```typescript
import helmet from 'helmet';

// Basic Helmet configuration
app.use(helmet({
  // Configure Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite in development
        "'unsafe-eval'", // Required for development tools
        "https://cdn.jsdelivr.net", // For CDN resources
        "https://unpkg.com" // For CDN resources
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind and styled components
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:" // For base64 fonts
      ],
      imgSrc: [
        "'self'",
        "data:", // For base64 images
        "https:", // Allow external images
        "blob:" // For uploaded images
      ],
      connectSrc: [
        "'self'",
        "https://api.anthropic.com", // Claude API
        "https://api.openai.com", // OpenAI API
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production'
    }
  },
  // Configure HSTS for HTTPS environments
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

### Phase 2: Environment-Specific CORS Configuration
```typescript
import cors from 'cors';

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Rejected request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-App-Version',
    'X-App-Build',
    'X-App-Environment'
  ]
};

app.use(cors(corsOptions));
```

### Phase 3: Environment-Specific Origins
```typescript
function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV;
  const environment = process.env.ENVIRONMENT;
  
  switch (env) {
    case 'production':
      return [
        'https://app.heliotropeimaginal.com',
        'https://heliotropeimaginal.com'
      ];
    
    case 'staging':
      return [
        'https://app2.heliotropeimaginal.com',
        'http://34.220.143.127', // Staging VM
        'https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com'
      ];
    
    case 'development':
    default:
      return [
        'http://localhost:8080',
        'http://localhost:5173', // Vite dev server
        'http://127.0.0.1:8080',
        'http://127.0.0.1:5173'
      ];
  }
}
```

### Phase 4: Development vs Production CSP
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: isDevelopment ? 
    ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"] :
    ["'self'", "https://cdn.jsdelivr.net"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  // ... other directives
};
```

## Security Headers Configuration

### Production Headers
```typescript
// Strict production configuration
helmet({
  contentSecurityPolicy: { /* strict CSP */ },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: 'deny' }
})
```

### Development Headers
```typescript
// Relaxed development configuration  
helmet({
  contentSecurityPolicy: {
    directives: {
      // More permissive for dev tools
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // Allow webpack dev server
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  // Disable HSTS in development
  hsts: false
})
```

## CORS Strategy by Environment

### Development
- **Origins**: `localhost:8080`, `localhost:5173`
- **Credentials**: Allowed
- **Methods**: All standard methods
- **Headers**: Permissive for development tools

### Staging  
- **Origins**: Staging domain, VM IP, Lightsail URL
- **Credentials**: Allowed
- **Methods**: Standard REST methods
- **Headers**: Standard + custom app headers

### Production
- **Origins**: Production domains only
- **Credentials**: Allowed
- **Methods**: Required methods only
- **Headers**: Minimal required set

## Files Requiring Changes

### Core Application
- `server/index.ts` - Add Helmet and CORS middleware
- `package.json` - Add helmet and cors dependencies

### Configuration
- Create `server/config/security.ts` - Centralized security config
- Update `server/utils/environment.ts` - Add origin validation

### Documentation
- `docs/security.md` - Document security headers
- `.env.example` - Document security-related env vars

## Testing Strategy

### Security Header Validation
```bash
# Test security headers are present
curl -I https://app.heliotropeimaginal.com/health

# Validate CSP compliance
npm install --save-dev @typescript-eslint/parser
# Use CSP validator tools
```

### CORS Testing
```javascript
// Test allowed origins
fetch('https://api.domain.com/health', {
  method: 'GET',
  credentials: 'include'
});

// Test rejected origins (should fail)
```

### Integration Testing
- [ ] Verify application functionality with strict CSP
- [ ] Test cross-origin requests work for allowed origins
- [ ] Validate security headers don't break legitimate functionality
- [ ] Ensure development tools still work

## Performance Considerations

### Header Overhead
- Minimal impact (few KB per request)
- CSP header can be substantial but cached
- Consider header compression

### CORS Preflight
- OPTIONS requests for complex CORS requests
- Cache preflight responses when possible
- Minimize preflight triggers

## Security Validation

### Automated Testing
```typescript
// Test security headers are present
describe('Security Headers', () => {
  it('should include X-Frame-Options', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });
  
  it('should include CSP header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-security-policy']).toBeDefined();
  });
});
```

### Manual Validation
- [ ] Browser developer tools security tab
- [ ] Security header online validators
- [ ] CORS behavior testing with different origins
- [ ] CSP violation monitoring

## Risk Assessment

### High Risk - Missing Implementation
- XSS attacks through script injection
- Clickjacking through frame embedding
- CSRF attacks without proper CORS
- Data leakage through referrer headers

### Medium Risk - Configuration Issues
- Over-restrictive CSP breaking functionality
- CORS blocking legitimate requests
- Performance impact from complex headers

### Low Risk - Maintenance
- CSP needs updates when adding external resources
- Origin lists need maintenance for new environments

## Success Metrics
- [ ] All security headers present in production
- [ ] CORS policy blocks unauthorized origins
- [ ] No legitimate functionality broken by security headers
- [ ] Security audit shows improved header score

## Dependencies
- `helmet` - Express security middleware
- `cors` - CORS middleware
- No breaking changes to existing functionality

## Timeline Estimate
- **Planning and Configuration**: 3 hours
- **Implementation**: 4 hours
- **Testing CSP Compatibility**: 4 hours
- **CORS Testing**: 2 hours
- **Documentation**: 2 hours
- **Total**: 15 hours (2 development days)

---

**Related Issues:**
- Client-side security hardening
- Production deployment security
- OWASP security compliance

**Labels:** security, headers, cors, helmet, xss-protection, csp, production