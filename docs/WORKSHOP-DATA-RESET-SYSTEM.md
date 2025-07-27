# Workshop Data Reset System

## Overview

The Workshop Data Reset System provides a reliable way to clear user workshop data for testing and production use. It implements a **hybrid approach** that handles test users and production users differently to balance testing needs with data recovery requirements.

## System Architecture

### Hybrid Reset Strategy

The system automatically determines the appropriate reset strategy based on user type:

- **Test Users** (`is_test_user = true`): **Hard Delete** - Permanent removal, no database bloat
- **Production Users** (`is_test_user = false`): **Soft Delete** - Recoverable, with cleanup options

### Database Schema

**Workshop Step Data Table:**
```sql
CREATE TABLE workshop_step_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_type VARCHAR(10) NOT NULL, -- 'ast' or 'ia'
  step_id VARCHAR(20) NOT NULL,      -- e.g., 'ia-3-4', '2-1'
  data JSONB NOT NULL,               -- Workshop step data
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP               -- NULL = active, timestamp = soft deleted
);
```

## Implementation Details

### Admin Interface Reset

**Location:** `server/services/user-management-service.ts` - `deleteUserData()` method

**Process:**
1. Determines user type (`is_test_user` from users table)
2. Applies appropriate deletion strategy
3. Logs detailed information about the operation
4. Returns comprehensive deletion summary

**Code Example:**
```typescript
// Hard delete for test users
if (isTestUser) {
  const result = await db.execute(sql`DELETE FROM workshop_step_data WHERE user_id = ${userId}`);
  console.log(`=== HARD DELETE: Permanently deleted ${count} workshop records ===`);
}
// Soft delete for production users  
else {
  const result = await db.execute(sql`UPDATE workshop_step_data SET deleted_at = NOW() WHERE user_id = ${userId}`);
  console.log(`=== SOFT DELETE: Marked ${count} workshop records as deleted ===`);
}
```

### API Endpoint Reset

**Location:** `server/routes/reset-routes.ts`

**Endpoints:**
- `POST /api/test-users/reset/user/:userId` - Complete user data reset
- `POST /api/test-users/reset/user/:userId/starcard` - Star card only
- `POST /api/test-users/reset/user/:userId/flow` - Flow attributes only

**Authentication:** Requires admin privileges or self-reset only

### Query Filtering

**All workshop data queries automatically exclude soft-deleted records:**

**Export Service:** `server/services/export-service.ts`
```typescript
const allWorkshopSteps = await db.select()
  .from(workshopStepData)
  .where(and(
    eq(workshopStepData.userId, userId),
    isNull(workshopStepData.deletedAt)  // Exclude soft-deleted
  ));
```

**Workshop Data Routes:** `server/routes/workshop-data-routes.ts`
```typescript
const result = await db.select()
  .from(workshopStepData)
  .where(and(
    eq(workshopStepData.userId, userId),
    eq(workshopStepData.workshopType, workshopType),
    eq(workshopStepData.stepId, stepId),
    isNull(workshopStepData.deletedAt)  // Exclude soft-deleted
  ));
```

## Usage Guide

### For Development/Testing

1. **Test Users** automatically get hard deletion
2. **No recovery needed** - data is permanently removed
3. **No database bloat** - deleted records don't accumulate
4. **Fast reset cycles** for iterative testing

### For Production

1. **Production users** automatically get soft deletion
2. **Data recovery possible** - can restore if needed
3. **Audit trail maintained** - know when data was "deleted"
4. **Cleanup available** - periodic removal of old soft-deleted records

### Admin Interface Usage

1. Navigate to Admin Dashboard
2. Find user in user list
3. Click "Reset All User Data" button
4. Confirm deletion
5. System automatically applies appropriate strategy

**Expected Logs for Test User:**
```
Starting complete data deletion for user X
=== STARTING HYBRID WORKSHOP RESET for user X ===
=== RESET STRATEGY: User X isTestUser: true ===
=== ATTEMPTING HARD DELETE for test user X ===
=== HARD DELETE: Permanently deleted 4 workshop records for test user X ===
Completed data deletion for user X
```

**Expected Logs for Production User:**
```
Starting complete data deletion for user Y
=== STARTING HYBRID WORKSHOP RESET for user Y ===
=== RESET STRATEGY: User Y isTestUser: false ===
=== ATTEMPTING SOFT DELETE for production user Y ===
=== SOFT DELETE: Marked 4 workshop records as deleted for production user Y ===
Completed data deletion for user Y
```

## Data Recovery

### Soft-Deleted Data Recovery

**View soft-deleted records:**
```sql
SELECT * FROM workshop_step_data 
WHERE user_id = ? AND deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

**Restore soft-deleted records:**
```sql
UPDATE workshop_step_data 
SET deleted_at = NULL, updated_at = NOW() 
WHERE user_id = ? AND deleted_at IS NOT NULL;
```

### Cleanup Operations

**Cleanup Service:** `server/services/cleanup-service.ts`

**Manual cleanup (6+ months old):**
```typescript
import { CleanupService } from '../services/cleanup-service';

const result = await CleanupService.cleanupOldDeletedWorkshopData(6);
console.log(`Cleaned up ${result.deletedCount} old records`);
```

**Get cleanup statistics:**
```typescript
const stats = await CleanupService.getCleanupStats();
// Returns: totalSoftDeleted, oldestDeletedAt, newestDeletedAt
```

## Monitoring & Maintenance

### Health Checks

**Validate reset functionality:**
```bash
# Test reset for test user (should hard delete)
curl -X POST http://localhost:8080/api/test-users/reset/user/8 -H "Content-Type: application/json" -b "userId=1"

# Validate data cleared
curl http://localhost:8080/api/admin/users/8/validate -H "Content-Type: application/json" -b "userId=1"
```

### Database Maintenance

**Check soft-deleted data accumulation:**
```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(deleted_at) as soft_deleted,
  COUNT(*) - COUNT(deleted_at) as active_records
FROM workshop_step_data;
```

**Monitor old soft-deleted records:**
```sql
SELECT 
  DATE_TRUNC('month', deleted_at) as month,
  COUNT(*) as deleted_records
FROM workshop_step_data 
WHERE deleted_at IS NOT NULL
GROUP BY DATE_TRUNC('month', deleted_at)
ORDER BY month;
```

## Workshop Separation

The reset system maintains strict separation between AST and IA workshops:

**AST Workshop Data:**
- `workshop_type = 'ast'`
- Step IDs: `1-1`, `1-2`, `2-1`, `2-2`, `3-1`, `3-2`

**IA Workshop Data:**
- `workshop_type = 'ia'`  
- Step IDs: `ia-1-1`, `ia-1-2`, `ia-2-1`, `ia-2-2`, etc.

**Per-Workshop Reset** (if needed):
```sql
-- Reset only AST data
UPDATE workshop_step_data 
SET deleted_at = NOW() 
WHERE user_id = ? AND workshop_type = 'ast';

-- Reset only IA data  
UPDATE workshop_step_data 
SET deleted_at = NOW() 
WHERE user_id = ? AND workshop_type = 'ia';
```

## Security Considerations

### Access Control

- **Admin users** can reset any user's data
- **Regular users** can only reset their own data
- **Authentication required** for all reset operations
- **Session validation** prevents unauthorized access

### Data Protection

- **Production users** protected by soft deletion
- **Test users** clearly identified in database
- **Audit logging** for all reset operations
- **No accidental hard deletion** of production data

## Troubleshooting

### Common Issues

**Reset not working:**
1. Check server logs for error messages
2. Verify user exists and authentication is valid
3. Confirm database migration applied (`deleted_at` column exists)
4. Check if using correct API endpoint

**Data still visible after reset:**
1. **Soft deletion:** Data marked as deleted but queries might not filter properly
2. **Cache issues:** Browser/client cache might show old data
3. **Wrong user type:** Production users get soft deletion, not hard deletion

**Database errors:**
```
ERROR: column "deleted_at" does not exist
```
**Solution:** Run the database migration:
```sql
ALTER TABLE workshop_step_data ADD COLUMN deleted_at TIMESTAMP;
```

### Debug Information

**Enable detailed logging in reset operations:**
- Server logs show reset strategy decisions
- Database query results logged
- Error messages include specific failure reasons

**Validation commands:**
```bash
# Check user type
psql $DATABASE_URL -c "SELECT id, username, is_test_user FROM users WHERE id = 1;"

# Check workshop data
psql $DATABASE_URL -c "SELECT user_id, workshop_type, step_id, deleted_at FROM workshop_step_data WHERE user_id = 1;"

# Check soft-deleted count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM workshop_step_data WHERE deleted_at IS NOT NULL;"
```

## Migration Notes

### From Old Reset System

The previous reset system had issues:
- ❌ Only deleted from some tables
- ❌ Ignored `workshop_step_data` table completely  
- ❌ No recovery options
- ❌ Silent failures

### Current System Benefits

- ✅ **Comprehensive:** Deletes from all relevant tables
- ✅ **Reliable:** Hybrid approach prevents data loss
- ✅ **Recoverable:** Soft deletion for production users
- ✅ **Efficient:** Hard deletion for test users prevents bloat
- ✅ **Auditable:** Clear logging and tracking
- ✅ **Maintainable:** Cleanup tools for long-term health

## Version History

- **v2.1.1** (2025-07-27): Initial hybrid reset system implementation
- **Migration:** Added `deleted_at` column to `workshop_step_data` table
- **Schema:** Updated all workshop data queries to filter soft-deleted records
- **Services:** Enhanced `UserManagementService` and `ResetService` with hybrid logic

---

**Last Updated:** 2025-07-27  
**System Version:** v2.1.1  
**Database Migration:** 0003_add_workshop_step_data_deleted_at.sql