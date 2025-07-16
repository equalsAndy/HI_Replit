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
const currentUser = userProfile?.user;

// CORRECT - fixes blank dashboard:
const currentUser = userProfile;
```

**Why this happens:**
- The `/api/auth/me` endpoint returns user object directly
- Component incorrectly expects `userProfile.user` structure
- When `currentUser` is undefined, component returns null

**Quick Debug:**
Add console.log to check userProfile structure:
```javascript
console.log('userProfile:', userProfile);
console.log('currentUser:', currentUser);
```

## Intermittent React Error #185

**Symptoms:**
- "Something went wrong" error boundary message
- React Error #185 in console (key prop error)
- Dashboard works after refresh

**Root Cause:**
Race condition during data loading/refetching where user.id becomes undefined temporarily

**Prevention:**
- Monitor during tab switching
- Check Network tab for failed API requests
- Note if happens during auto-refresh

**Quick Fix:**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Navigate away and back to /admin

## Debug Steps

1. **Check Authentication:**
```javascript
fetch('/api/auth/me').then(r => r.json()).then(console.log);
```

2. **Check Current User Extraction:**
```javascript
console.log('userProfile:', userProfile);
console.log('currentUser:', currentUser);
console.log('hasManagementAccess:', hasManagementAccess);
```

3. **Verify Component Rendering:**
```javascript
console.log('Component should render:', !!currentUser && hasManagementAccess);
```

## Known Working Configuration

**API Response Structure:**
```json
{
  "id": 1,
  "username": "admin", 
  "name": "System Administrator",
  "email": "admin@heliotropeimaginal.com",
  "role": "admin",
  "title": null,
  "organization": "Heliotrope Imaginal Workshops"
}
```

**Component Extraction:**
```typescript
const currentUser = userProfile; // Direct assignment
const hasManagementAccess = currentUser?.role === 'admin' || currentUser?.role === 'facilitator';
```

## Emergency Recovery

If admin dashboard is completely broken:

1. **Check git status:** `git status`
2. **Restore from backup:** `git checkout HEAD~1 -- client/src/pages/admin/dashboard.tsx`
3. **Fix currentUser extraction:** Change `userProfile?.user` to `userProfile`
4. **Rebuild:** `npm run build`
5. **Restart dev server:** `npm run dev`

## Last Working Version

**File:** `client/src/pages/admin/dashboard.tsx`
**Key Fix:** Line ~43: `const currentUser = userProfile;`
**Date Fixed:** July 16, 2025
**Issue ID:** Admin Dashboard Fix - Session Handoff