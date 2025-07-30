# KAN - Session Auth Redirect System

**Issue Type:** Story  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-07-29

## Summary
Implement automatic redirection of non-logged-in users to auth page with appropriate session status messaging

## Description
Currently, users who lose their session or are logged out may encounter errors or remain on protected pages without proper guidance. We need a comprehensive session management system that:

1. **Detects expired/invalid sessions** across all protected routes
2. **Redirects to auth page** with appropriate messaging
3. **Displays session status messages** ("You have been logged out", "Session expired", etc.)
4. **Preserves intended destination** for post-login redirect
5. **Handles different logout scenarios** (manual logout, session timeout, server restart)

## Current Issues
- Users with expired sessions may see blank pages or errors
- No clear messaging when sessions expire
- Users don't know why they were redirected to login
- No indication of logout status after server restarts
- Protected routes don't consistently check authentication

## Acceptance Criteria

### Session Detection & Redirect
- [ ] All protected routes automatically check for valid session
- [ ] Invalid/expired sessions trigger immediate redirect to `/auth`
- [ ] Session checks happen on route change and API calls
- [ ] Handle both client-side session loss and server-side session invalidation

### User Messaging
- [ ] Display "You have been logged out" message when session expires
- [ ] Show "Session expired" message for timeout scenarios  
- [ ] Display "Please log in to continue" for unauthenticated access attempts
- [ ] Messages appear prominently on auth page without being intrusive
- [ ] Messages auto-dismiss after 5 seconds or user interaction

### Navigation Preservation
- [ ] Store intended destination URL before redirect
- [ ] Redirect to original destination after successful login
- [ ] Handle deep links to specific workshop steps
- [ ] Preserve query parameters when possible

### Logout Scenarios
- [ ] **Manual logout**: Clear session + "You have been logged out" message
- [ ] **Session timeout**: Detect + redirect + "Session expired" message
- [ ] **Server restart**: Detect invalid session + "Please log in again" message
- [ ] **Permission change**: Handle role/access changes gracefully

## Technical Requirements

### Frontend Changes
- **Authentication Hook**: Enhance `useAuth` or create `useSessionManager`
- **Route Guards**: Add session validation to protected routes
- **Message System**: Toast/banner system for session status messages
- **Redirect Logic**: Handle pre-login URL preservation

### Backend Changes
- **Session Validation**: Consistent session checking across all API endpoints
- **Session Status API**: Endpoint to check session validity
- **Logout Endpoint**: Proper session cleanup with reason codes
- **Session Timeout**: Configurable session duration with proper cleanup

### Database Considerations
- **Session Storage**: Review session table cleanup procedures
- **User Activity**: Track last activity for timeout calculations
- **Session Metadata**: Store session creation/expiry for better management

## Implementation Approach

### Phase 1: Core Session Detection
```typescript
// Example session hook
const useSessionManager = () => {
  const checkSession = () => {
    // Validate current session
    // Return { valid: boolean, reason?: string }
  };
  
  const handleInvalidSession = (reason: string) => {
    // Clear local storage
    // Set logout message
    // Redirect to auth with message
  };
};
```

### Phase 2: Message System
```typescript
// Message types
type SessionMessage = 
  | 'logged-out' 
  | 'session-expired' 
  | 'session-timeout' 
  | 'login-required';

// Auth page message display
const AuthPage = () => {
  const message = useSessionMessage();
  // Display appropriate message based on type
};
```

### Phase 3: URL Preservation
```typescript
// Before redirect
sessionStorage.setItem('returnUrl', currentPath);

// After login
const returnUrl = sessionStorage.getItem('returnUrl');
navigate(returnUrl || '/dashboard');
```

## Files Involved
- `client/src/hooks/useAuth.ts` - Session management
- `client/src/pages/auth-page.tsx` - Message display
- `client/src/components/core/ProtectedRoute.tsx` - Route guards
- `server/routes/auth-routes.ts` - Session validation
- `server/middleware/auth.js` - Session checking middleware

## Test Cases

### Session Expiry
- [ ] User session expires during workshop → redirects with "Session expired"
- [ ] User manually logs out → shows "You have been logged out"
- [ ] Server restart invalidates session → shows "Please log in again"

### Protected Route Access
- [ ] Direct URL access without login → redirects with "Login required"
- [ ] Deep link to workshop step → preserves URL for post-login redirect
- [ ] Admin page access with regular user → appropriate permission message

### Message Display
- [ ] Messages appear clearly on auth page
- [ ] Messages auto-dismiss after 5 seconds
- [ ] Multiple rapid session checks don't duplicate messages
- [ ] Messages don't interfere with login form

## Edge Cases
- Handle multiple browser tabs with different session states
- Manage session conflicts between different workshop types
- Handle rapid navigation during session expiry
- Deal with network connectivity issues affecting session validation

## Success Metrics
- Zero instances of users stuck on protected pages without valid sessions
- Clear user understanding of why they were redirected to login
- Successful preservation and restoration of user's intended destination
- Improved user experience during session transitions

## Dependencies
- Current authentication system
- Session storage mechanism (PostgreSQL sessions)
- Toast/notification system (may need to be created)
- React Router navigation system

## Risks & Mitigation
- **Risk**: Overly aggressive session checking impacts performance
  - **Mitigation**: Implement smart caching and rate limiting
- **Risk**: Users lose work when sessions expire
  - **Mitigation**: Auto-save functionality + clear warnings before expiry
- **Risk**: Complex redirect logic causes navigation issues
  - **Mitigation**: Comprehensive testing of all redirect scenarios

## Notes
- Consider implementing session warning before expiry (5-minute warning)
- May want to differentiate between AST and IA workshop session handling
- Should integrate with existing FloatingAI context to maintain continuity
- Consider analytics tracking for session expiry patterns