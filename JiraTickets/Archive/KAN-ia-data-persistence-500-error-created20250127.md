# KAN - IA Workshop Data Persistence 500 Error
**Issue Type:** Bug  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-07-26

## Summary
IA (Imaginal Agility) workshop data is not persisting due to persistent 500 Internal Server Error when attempting to save workshop step data via POST `/api/workshop-data/step`

## Description
After extensive debugging and multiple fix attempts, IA workshop data still fails to persist. Users can enter data in form fields, but the data is lost when they navigate away from the page and does not appear in database or data exports.

**Current Behavior:**
- User enters data in IA workshop forms (ia-3-3, ia-3-4, etc.)
- Console shows auto-save attempts with useWorkshopStepData hook
- API request is made to POST `/api/workshop-data/step` with correct payload
- Server returns 500 Internal Server Error
- Data is lost and not saved to database

**Expected Behavior:**
- IA data should auto-save as user types (like AST workshop data)
- Data should persist between page refreshes
- Data should appear in database with `workshop_type = 'ia'`
- Data should be included in admin user data exports

## Steps to Reproduce
1. Login to http://localhost:8080 as any user
2. Navigate to IA workshop (any step: ia-3-3, ia-3-4, ia-4-4, etc.)
3. Open browser console (F12)
4. Enter data in any form field
5. Observe console error:
   ```
   POST http://localhost:8080/api/workshop-data/step 500 (Internal Server Error)
   🔍 Save response status: 500
   🔍 Save failed: {success: false, error: 'Failed to save step data'}
   ```

## Technical Investigation History

### Issues Identified and Fixed:
1. ✅ **Frontend Hook Missing**: useWorkshopStepData was commented out in IA components
   - **Fixed**: Uncommented and implemented in multiple IA content components
   - **Files**: IA_3_3_Content.tsx, IA_3_4_Content.tsx, IA_4_2_Content.tsx, etc.

2. ✅ **Fake Save Functions**: handleSave using setTimeout instead of real persistence
   - **Fixed**: Changed to use `await saveNow()` from useWorkshopStepData hook
   - **Files**: IA_3_3_Content.tsx and other components

3. ✅ **Export Service Missing IA Data**: Admin exports didn't include IA workshop data
   - **Fixed**: Added workshopStepData query to include IA data in exports
   - **File**: server/services/export-service.ts

4. ✅ **Authentication Middleware Bug**: Looking for 'appType' instead of 'workshopType'
   - **Fixed**: Added check for req.body.workshopType in middleware
   - **File**: server/routes/workshop-data-routes.ts:42

5. ✅ **SQL Syntax Error**: Malformed onConflictDoUpdate operation
   - **Fixed**: Removed extra comment line breaking SQL syntax
   - **File**: server/routes/workshop-data-routes.ts:2643-2646

### Current Status - Still 500 Error
Despite all fixes above, the 500 error persists. The server logs show:
```
❌ Error saving workshop step data: [Error details]
❌ Error details: {message: '...', stack: '...'}
```

## Debugging Information

### Request Payload (Confirmed Correct):
```javascript
POST /api/workshop-data/step
{
  "workshopType": "ia",
  "stepId": "ia-3-3", 
  "data": {...user input data...}
}
```

### Database Schema (Confirmed Correct):
```sql
workshop_step_data table:
- id (serial primary key)
- user_id (integer, not null, foreign key)
- workshop_type (varchar(10), not null) 
- step_id (varchar(20), not null)
- data (jsonb, not null)
- version (integer, default 1)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint on (user_id, workshop_type, step_id)
```

### Current Code Structure:
```javascript
// UPSERT operation in workshop-data-routes.ts
const result = await db
  .insert(workshopStepData)
  .values({
    userId,
    workshopType, 
    stepId,
    data: data,
    updatedAt: new Date()
  })
  .onConflictDoUpdate({
    target: [workshopStepData.userId, workshopStepData.workshopType, workshopStepData.stepId],
    set: {
      data: data,
      updatedAt: new Date()
    }
  })
  .returning();
```

## Potential Remaining Issues

### Hypothesis 1: Type/Import Mismatch
- **Issue**: workshopStepData import from schema may not match actual database table
- **Evidence**: Import shows `import { users, workshopStepData } from '../../shared/schema.js'`
- **Test**: Verify schema definition matches actual database structure

### Hypothesis 2: Session/Authentication Issue  
- **Issue**: User session not properly authenticated for IA workshop operations
- **Evidence**: Middleware checks pass but database operation fails
- **Test**: Check if userId is properly resolved from session

### Hypothesis 3: Database Connection Issue
- **Issue**: Database connection failing specifically for UPSERT operations
- **Evidence**: GET operations work but POST operations fail
- **Test**: Test raw SQL query outside of Drizzle ORM

### Hypothesis 4: Drizzle ORM Version/Configuration Issue
- **Issue**: ORM configuration mismatch causing SQL generation errors
- **Evidence**: Complex UPSERT with unique constraint fails
- **Test**: Simplify to basic INSERT or separate SELECT/UPDATE logic

## Acceptance Criteria
1. IA workshop data auto-saves as user types (1-second debounce)
2. Data persists between page refreshes
3. Data appears in database with `workshop_type = 'ia'`
4. Data is included in admin user data exports
5. No 500 errors on save operations
6. Console shows successful save messages: `✅ Save successful for: {workshopType: "ia"}`

## Technical Notes

### Files Involved:
- **Frontend**: 
  - `client/src/hooks/useWorkshopStepData.ts` (persistence hook with debug logging)
  - `client/src/components/content/imaginal-agility/steps/*.tsx` (IA components)
- **Backend**: 
  - `server/routes/workshop-data-routes.ts` (API endpoint - line 2590-2671)
  - `shared/schema.ts` (database schema definition)
  - `server/services/export-service.ts` (data export functionality)

### Debug Commands:
```sql
-- Check if any IA data exists
SELECT * FROM workshop_step_data WHERE workshop_type = 'ia';

-- Check table structure
\d workshop_step_data;

-- Test direct insert
INSERT INTO workshop_step_data (user_id, workshop_type, step_id, data) 
VALUES (1, 'ia', 'ia-test', '{"test": "data"}');
```

### Server Logging:
The error catch block has extensive logging:
```javascript
console.error('❌ Error saving workshop step data:', error);
console.error('❌ Error details:', {
  message: error instanceof Error ? error.message : 'Unknown error',
  stack: error instanceof Error ? error.stack : 'No stack trace'
});
```

## Priority Justification
**High Priority** because:
1. IA workshop is a core feature of the platform
2. Data loss impacts user experience severely  
3. Multiple users affected (any user attempting IA workshop)
4. Extensive debugging time already invested
5. Issue blocks IA workshop functionality completely

## Next Steps
1. **Immediate**: Check server console for exact error message and stack trace
2. **Database**: Test direct SQL operations to isolate ORM vs DB issues
3. **Logging**: Add more granular logging around UPSERT operation
4. **Alternative**: Consider fallback to separate SELECT/INSERT/UPDATE logic
5. **Verification**: Test with different user accounts and authentication states

## Related Issues
- AST workshop data persistence works correctly (reference implementation)
- Export functionality partially implemented (includes IA structure but no data)
- Authentication middleware supports both workshop types

---

**Engineering Impact**: High - Core feature broken  
**User Impact**: High - Data loss in IA workshop  
**Complexity**: Medium - Database/ORM investigation required  
**Effort Estimate**: 4-8 hours for full resolution and testing