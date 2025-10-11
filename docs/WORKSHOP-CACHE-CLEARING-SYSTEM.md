# Workshop Cache Clearing System

**Date**: January 27, 2025  
**Issue**: Workshop step data was persisting in UI components after reset operations across both AST and IA workshops  
**Solution**: Comprehensive cache clearing system implementation

## Problem Description

The `useWorkshopStepData` hook is used extensively throughout the workshop system, creating individual cache entries for each step with query keys like:
- `/api/workshop-data/step/ia/ia-3-3`
- `/api/workshop-data/step/ast/4-5`
- `/api/workshop-data/step/ia/ia-2-1`

Previous reset operations were not comprehensively clearing these step-specific cache keys, resulting in:
- Cached data persisting in UI after reset
- Inconsistent state between server and client
- User confusion due to old data appearing in forms

## Solution Implementation

### 1. Universal Workshop Cache Clear Function

**File**: `/client/src/utils/forceRefresh.ts`

Created `forceWorkshopCacheDump(queryClient)` function that:
- Uses pattern matching to remove ALL workshop-related cache queries
- Targets multiple cache patterns:
  - `/api/workshop-data/step/` (all step data)
  - `/api/workshop-data/` (general workshop data)
  - `/api/navigation-progress/` (progress tracking)
  - Keywords: `workshop`, `starcard`, `assessment`, `flow-attributes`
  - IA patterns: `ia-` (e.g., `ia-3-3`, `ia-2-1`)
  - AST patterns: `\d+-\d+` (e.g., `4-5`, `3-2`)
- Clears both localStorage and sessionStorage
- Removes specific known workshop endpoints
- Forces invalidation of auth data (`/api/auth/me`)

**Key Features**:
```typescript
// Pattern matching for comprehensive cache removal
queryClient.removeQueries({ 
  predicate: (query: any) => {
    return query.queryKey.some((key: string) => 
      typeof key === 'string' && (
        key.includes('/api/workshop-data/step/') ||
        key.includes('/api/workshop-data/') ||
        key.includes('/api/navigation-progress/') ||
        key.includes('workshop') ||
        key.includes('starcard') ||
        key.includes('assessment') ||
        key.includes('flow-attributes') ||
        key.includes('ia-') ||
        key.match(/^\d+-\d+$/) // AST step patterns
      )
    );
  }
});
```

### 2. Enhanced useWorkshopStepData Hook

**File**: `/client/src/hooks/useWorkshopStepData.ts`

Added cache clearing capability:
- New `clearCache()` function in hook return object
- Allows components to clear cache for specific workshop steps
- Integrated with queryClient for step-specific cache removal
- Provides granular cache control

**Implementation**:
```typescript
const clearCache = useCallback(() => {
  const cacheKey = `/api/workshop-data/step/${workshopType}/${stepId}`;
  queryClient.removeQueries({ queryKey: [cacheKey] });
  queryClient.removeQueries({ 
    predicate: (query: any) => {
      return query.queryKey.some((key: string) => 
        typeof key === 'string' && key.includes(`/step/${workshopType}/${stepId}`)
      );
    }
  });
}, [queryClient, workshopType, stepId]);
```

### 3. Updated All Reset Operations

#### A. User Profile Reset
**File**: `/client/src/components/profile/ResetDataButton.tsx`
- Replaced complex manual cache clearing with `forceWorkshopCacheDump(queryClient)`
- Simplified and more comprehensive than previous implementation

#### B. Admin User Reset
**File**: `/client/src/components/admin/ResetUserDataButton.tsx`
- Replaced individual `queryClient.invalidateQueries()` calls
- Now uses comprehensive workshop cache dump
- Maintains admin-specific cache invalidation where needed

#### C. Test User Reset Operations
**File**: `/client/src/components/test-users/TestUsersModal.tsx`
- Updated all four reset mutation functions:
  - Progress reset
  - User data clear (preserve progress)
  - Complete reset
  - Flow data clear
- Replaced `queryClient.invalidateQueries()` with `forceWorkshopCacheDump(queryClient)`

## Files Modified

1. **Core Utilities**:
   - `/client/src/utils/forceRefresh.ts` - Added `forceWorkshopCacheDump()`
   - `/client/src/hooks/useWorkshopStepData.ts` - Added `clearCache()` function

2. **Reset Components**:
   - `/client/src/components/profile/ResetDataButton.tsx`
   - `/client/src/components/admin/ResetUserDataButton.tsx`
   - `/client/src/components/test-users/TestUsersModal.tsx`

## Cache Patterns Cleared

The comprehensive system removes queries matching:
- **Step Data**: `/api/workshop-data/step/ast/*`, `/api/workshop-data/step/ia/*`
- **Workshop Data**: `/api/workshop-data/*`
- **Progress**: `/api/navigation-progress/ast`, `/api/navigation-progress/ia`
- **Assessments**: `/api/workshop-data/ia-assessment`, `/api/assessment/data`
- **User Data**: `/api/starcard`, `/api/flow-attributes`, `/api/user/assessments`
- **Final Reflection**: `/api/workshop-data/final-reflection`

## Local/Session Storage Cleared

Removes storage keys containing:
- `workshop`, `assessment`, `starcard`, `flow`
- `navigation`, `ia-`, `ast-`
- Step patterns like `\d+-\d+`

## Expected Behavior After Implementation

1. **Complete Data Reset**: All workshop step data is cleared from cache after any reset operation
2. **UI Consistency**: UI shows empty/initial state matching server state after reset
3. **Cross-Workshop Support**: Works for both AST and IA workshops
4. **Reliable Test Operations**: Test user resets are now comprehensive and reliable
5. **Admin Efficiency**: Admin reset operations clear all relevant cache data

## Testing Recommendations

1. **Reset Data**: Verify all form fields show empty/initial state after reset
2. **Navigation**: Confirm progress indicators reset properly
3. **Step Data**: Check that individual workshop steps (like IA 3-3) show no cached data
4. **Cross-Browser**: Test localStorage/sessionStorage clearing across browsers
5. **Admin Operations**: Verify admin user resets clear all workshop data

## Migration Notes

- **Backward Compatible**: Existing `forceAssessmentCacheDump()` now calls the comprehensive function
- **Import Changes**: Components now import `forceWorkshopCacheDump` from `@/utils/forceRefresh`
- **No Breaking Changes**: All existing functionality preserved while adding comprehensive clearing

## Performance Considerations

- **Efficient Pattern Matching**: Uses single predicate function to match multiple patterns
- **Selective Clearing**: Only removes workshop-related queries, preserves other app data
- **Batch Operations**: Groups cache clearing operations for optimal performance
- **Memory Management**: Proper cleanup prevents memory leaks from stale cache entries