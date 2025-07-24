# Troubleshooting: Demo Buttons Not Appearing

## Issue Description
Demo data buttons are not appearing in AST workshop components despite user being logged in as a test user (admin) with `isTestUser: true` in the database.

## Symptoms
- User is successfully logged in and can access admin dashboard
- Database shows `isTestUser: true` for the user
- `/api/auth/me` endpoint returns correct user data with `isTestUser: true`
- Demo buttons are not visible in workshop components
- Test user console may show permission denied errors

## Root Cause
**React Query caching issue**: The `useTestUser` hook was serving stale cached data where `isTestUser: false`, even though the database had been updated to `isTestUser: true`.

## Technical Details
The issue occurs when:
1. User's `isTestUser` status is changed in the database
2. React Query cache still contains old user data with `isTestUser: false`
3. The `useTestUser` hook returns cached data instead of fresh data
4. Components conditionally render demo buttons based on `useTestUser()` result
5. Demo buttons don't appear because cached data shows `isTestUser: false`

## Solution
Modify the `useTestUser` hook in `client/src/hooks/useTestUser.ts` to force cache invalidation:

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useTestUser = () => {
  const queryClient = useQueryClient();
  
  const { data: userData } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      title: string | null;
      organization: string | null;
      role?: string;
      isTestUser?: boolean;
    }
  }>({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: true, // Enable refetch on focus
    staleTime: 0, // Force fresh data every time
    gcTime: 0, // Don't cache the data
  });
  
  const user = userData?.user;
  const isTestUser = user?.isTestUser === true;
  
  // Debug logging
  console.log('🔍 useTestUser Debug:', {
    userData: userData,
    user: user,
    isTestUser: isTestUser,
    rawIsTestUser: user?.isTestUser,
    timestamp: new Date().toISOString()
  });
  
  return isTestUser;
};
```

## Key Changes
1. **`staleTime: 0`**: Forces React Query to always fetch fresh data
2. **`gcTime: 0`**: Prevents caching of the data
3. **`refetchOnWindowFocus: true`**: Refetches when user returns to browser tab
4. **Debug logging**: Helps identify if the hook is being called and what data it's receiving

## Components Affected
Demo buttons appear in these components when `useTestUser()` returns `true`:

### Secured Components (9 total)
1. **StepByStepReflection** - "Add Demo Data" button
2. **FlowAssessment** - "Fill Demo Answers" button
3. **AssessmentModal** - "Demo Data" button
4. **ImaginalAgilityAssessmentModal** - "Demo Mode" button
5. **ReflectionView** - "Demo Data" button
6. **ImaginationAssessmentContent** - "Demo Mode" button
7. **CantrilLadderView** - Demo data function
8. **FutureSelfView** - Demo data function
9. **DemoModeProvider** - Global demo mode toggle

### Unsecured Components (1 total)
1. **ImaginalAgilityAssessment** - "Demo Data" button (visible to all users)

## Verification Steps
1. Check browser console for `🔍 useTestUser Debug:` logs
2. Verify the logs show `isTestUser: true` and correct user data
3. Navigate to workshop components that should have demo buttons
4. Confirm demo buttons are visible and functional

## Prevention
- When updating user `isTestUser` status, consider adding cache invalidation
- Monitor React Query cache behavior during user data updates
- Use debug logging to track authentication state changes

## Related Files
- `client/src/hooks/useTestUser.ts` - Main hook with cache invalidation
- `shared/schema.ts` - Database schema with `isTestUser` field
- `server/index.ts` - Authentication endpoints
- All component files listed above that use `useTestUser()`

## Date Resolved
July 18, 2025

## Additional Issues Fixed
### Admin Interface Switching Bug (July 18, 2025)
**Issue**: Interface switching between Student/Professional modes had multiple bugs:
- Toast messages showed incorrect interface names (reversed)
- Interface didn't actually change (both showed professional)
- State didn't persist after page refresh

**Root Cause**: 
1. **Frontend**: Toast message used wrong variable (`contentAccess` instead of `variables`)
2. **Backend**: `/api/auth/me` PUT endpoint didn't handle `contentAccess` field

**Solution**:
1. **Fixed toast message**: Changed from `contentAccess === 'student'` to `variables === 'student'`
2. **Added backend support**: Modified `/api/auth/me` PUT endpoint to accept and validate `contentAccess`
3. **Added debug logging**: Both frontend and backend now log interface switching

**Files Modified**:
- `client/src/pages/admin/dashboard-new.tsx` - Fixed toast message and added debug logging
- `server/routes/auth-routes.ts` - Added contentAccess handling to PUT /api/auth/me

## Contributors
- System Administrator (admin user)
- GitHub Copilot (troubleshooting and fix implementation)
