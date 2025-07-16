# Admin Dashboard Troubleshooting Guide

## Common Issue: Blank Admin Dashboard

**Symptoms:**
- Admin dashboard shows blank page
- Console shows "Returning null because: no currentUser"
- User is authenticated as admin but page is empty

**Root Cause:**
API response structure mismatch in currentUser extraction

**Fix:**
```typescript
// WRONG - causes blank dashboard:
const currentUser = userProfile;

// CORRECT - fixes blank dashboard:
const currentUser = userProfile?.user;
```

**Why this happens:**
- The /api/auth/me endpoint returns { success: boolean, user: {...} }
- Component needs to extract the user object from the response
- When currentUser is undefined, component returns null

**Quick Debug:**
Add console.log to check userProfile structure:
```javascript
console.log('userProfile:', userProfile);
console.log('currentUser:', currentUser);
```

**Prevention:**
- Always verify API response structure before extracting nested properties
- Use TypeScript interfaces to define expected response shape
- Add defensive coding for optional chaining
