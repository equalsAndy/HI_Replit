# KAN - Implement Holistic Report Data Cleanup System

**Issue Type:** Story  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-07-30  

## Summary
Implement automated cleanup system to delete holistic reports when associated user assessment data is deleted or reset.

## Description
Currently, when user assessment data is deleted (via admin reset or user data cleanup), the associated holistic reports remain in the database and file system. This creates orphaned reports that reference non-existent data and can lead to:

1. **Data inconsistency**: Reports exist for users with no assessment data
2. **Storage bloat**: PDF files accumulate without corresponding user data
3. **Confusion**: Users may see old reports that no longer reflect their current state
4. **Security concerns**: Personal data persists after user requests deletion

## Current Behavior
- User completes workshop and generates holistic reports
- Reports are stored in `holistic_reports` table and PDF files in `storage/reports/`
- When user data is reset via `/api/reports/holistic/admin/reset`, only reports are deleted
- When assessment data is deleted via other admin functions, reports remain orphaned

## Acceptance Criteria

### 1. Cascade Deletion System
- [ ] When user assessment data is deleted, automatically delete associated holistic reports
- [ ] When user account is deleted, clean up all associated reports
- [ ] When workshop data is reset for a user, remove all related reports

### 2. Admin Functions Enhancement
- [ ] Update admin reset endpoints to include report cleanup
- [ ] Add admin function to identify and clean orphaned reports
- [ ] Provide admin visibility into report storage usage

### 3. Database Constraints
- [ ] Add proper foreign key relationships between reports and assessment data
- [ ] Implement cascade delete constraints in database schema
- [ ] Add database triggers for automatic cleanup

### 4. File System Cleanup
- [ ] Delete PDF files when database records are removed
- [ ] Implement cleanup job for orphaned PDF files
- [ ] Add file system integrity checks

### 5. API Enhancements
- [ ] Update report generation to check for existing user data
- [ ] Add endpoint to check report-data consistency
- [ ] Implement soft delete option for reports (if needed for audit trails)

## Technical Implementation Notes

### Database Changes
```sql
-- Add foreign key constraints
ALTER TABLE holistic_reports 
ADD CONSTRAINT fk_holistic_reports_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add trigger for file cleanup
CREATE OR REPLACE FUNCTION cleanup_report_files()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete associated PDF file
    PERFORM pg_notify('cleanup_pdf', OLD.pdf_file_path);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_report_files
AFTER DELETE ON holistic_reports
FOR EACH ROW EXECUTE FUNCTION cleanup_report_files();
```

### Service Updates
- Update `holistic-report-routes.ts` admin endpoints
- Enhance `pdf-report-service.ts` with cleanup methods
- Add file system cleanup to report deletion functions
- Update user deletion flows to include report cleanup

### Files to Modify
- `server/routes/holistic-report-routes.ts` - Admin endpoints
- `server/services/pdf-report-service.ts` - File cleanup
- `server/routes/user-routes.ts` - User deletion flows
- `server/routes/workshop-data-routes.ts` - Assessment data cleanup
- `shared/schema.ts` - Database constraints
- Database migration files

## Testing Requirements
- [ ] Test cascade deletion with user account removal
- [ ] Test report cleanup with assessment data reset
- [ ] Test file system cleanup functionality
- [ ] Test admin functions for orphaned report detection
- [ ] Test report generation with missing user data
- [ ] Performance test cleanup operations with large datasets

## Definition of Done
- [ ] All cascade deletion scenarios work correctly
- [ ] Orphaned reports are automatically cleaned up
- [ ] PDF files are properly deleted from file system
- [ ] Admin functions provide clear visibility into cleanup operations
- [ ] All tests pass including edge cases
- [ ] Documentation updated for new cleanup procedures

## Risk Assessment
- **Low Risk**: Primarily cleanup and data consistency improvements
- **Data Safety**: Implement backup procedures before cleanup operations
- **Performance**: Large cleanup operations may impact database performance

## Related Issues
- Data privacy compliance requirements
- Storage cost optimization
- User data retention policies

## Additional Considerations
- Consider implementing soft delete for audit trails
- Add logging for all cleanup operations
- Consider batch cleanup operations for performance
- Implement rollback procedures for accidental cleanups