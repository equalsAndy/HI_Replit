# KAN - Automatic StarCard PNG Generation and Storage System

**Issue Type:** Story  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-01-29

## Summary
Implement automatic StarCard PNG generation and storage when users complete workshops, with special handling for test user data cleanup.

## Description
Currently, StarCard images are generated on-demand during download, which can cause performance issues and doesn't provide persistent access to completed StarCards. This ticket implements automatic PNG generation upon workshop completion and integrates with the new photo storage system to reduce network traffic and improve user experience.

The system should automatically generate and store StarCard PNGs when users complete either AST or IA workshops, with special directory organization for test user data that can be easily cleaned up.

## Acceptance Criteria

### Core Functionality
1. **Automatic Generation Trigger**
   - [ ] StarCard PNG is automatically generated when user completes AST workshop (step 5-1)
   - [ ] StarCard PNG is automatically generated when user completes IA workshop (final step)
   - [ ] Generation happens in background without blocking user workflow
   - [ ] Failed generation attempts are logged and don't break workshop completion

2. **Photo Storage Integration**
   - [ ] Generated StarCard PNGs are stored using the photo storage system (`photo_storage` table)
   - [ ] StarCard photo IDs are linked to user records for easy retrieval
   - [ ] Deduplication works correctly (same StarCard data = same image)
   - [ ] Thumbnails are automatically generated for StarCard images

3. **Test User Data Management**
   - [ ] Test user StarCard images are tagged/organized for easy identification
   - [ ] Test user images can be bulk deleted via admin interface
   - [ ] Production user images are protected from accidental deletion
   - [ ] Clear separation between test and production data

### Database Schema Updates
4. **User Table Enhancement**
   - [ ] Add `ast_starcard_photo_id` column to users table
   - [ ] Add `ia_starcard_photo_id` column to users table
   - [ ] Add foreign key constraints to photo_storage table
   - [ ] Update user views to include StarCard photo references

5. **Photo Storage Metadata**
   - [ ] Add `photo_type` field to distinguish StarCard images
   - [ ] Add `is_test_data` flag for test user content identification
   - [ ] Add `workshop_type` field ('ast' or 'ia') for StarCards
   - [ ] Update cleanup functions to respect test data flags

### API Endpoints
6. **StarCard Access**
   - [ ] GET `/api/users/me/starcard` returns StarCard photo URL if available
   - [ ] GET `/api/photos/:id/starcard` serves StarCard images with proper caching
   - [ ] POST `/api/users/regenerate-starcard` allows manual regeneration
   - [ ] DELETE `/api/admin/test-data/starcards` bulk deletes test StarCards

7. **Admin Management**
   - [ ] Admin dashboard shows StarCard storage usage statistics
   - [ ] Admin interface for managing test user data cleanup
   - [ ] Bulk operations for test data deletion
   - [ ] Storage usage monitoring and alerts

### Performance & Reliability
8. **Background Processing**
   - [ ] StarCard generation uses background job queue (avoid blocking UI)
   - [ ] Retry mechanism for failed generations (3 attempts max)
   - [ ] Error logging and monitoring for generation failures
   - [ ] Graceful degradation if storage system is unavailable

9. **Caching & Optimization**
   - [ ] Generated StarCards cached with proper ETags
   - [ ] Thumbnail generation for StarCard previews
   - [ ] Compression optimization for PNG files
   - [ ] CDN-ready headers for future scaling

## Technical Implementation Details

### Workshop Completion Integration
```typescript
// In workshop completion handler
async function completeWorkshop(userId: number, workshopType: 'ast' | 'ia') {
  // Existing completion logic...
  
  // Generate StarCard PNG in background
  await starCardGenerationService.queueGeneration(userId, workshopType);
}
```

### Photo Storage Schema Updates
```sql
-- Add StarCard-specific columns to photo_storage
ALTER TABLE photo_storage ADD COLUMN photo_type VARCHAR(20) DEFAULT 'general';
ALTER TABLE photo_storage ADD COLUMN is_test_data BOOLEAN DEFAULT FALSE;
ALTER TABLE photo_storage ADD COLUMN workshop_type VARCHAR(10);

-- Add StarCard photo references to users
ALTER TABLE users ADD COLUMN ast_starcard_photo_id INTEGER REFERENCES photo_storage(id);
ALTER TABLE users ADD COLUMN ia_starcard_photo_id INTEGER REFERENCES photo_storage(id);

-- Index for efficient test data cleanup
CREATE INDEX idx_photo_storage_test_data ON photo_storage(is_test_data, photo_type);
```

### Test Data Organization
```typescript
// Directory structure for test data identification
const photoMetadata = {
  photo_type: 'starcard',
  is_test_data: user.isTestUser,
  workshop_type: workshopType,
  uploaded_by: userId
};
```

## Dependencies
- ✅ Photo storage system (implemented in previous ticket)
- ✅ StarCard generation functionality (existing)
- ⏳ Background job processing system (may need implementation)
- ⏳ Sharp.js for PNG optimization (may need installation)

## Risk Assessment
**Medium Risk:**
- **Storage space**: Monitor 60GB VM storage usage
- **Generation failures**: Implement proper error handling
- **Performance impact**: Use background processing for generation

## Testing Requirements

### Unit Tests
- [ ] StarCard generation service functionality
- [ ] Photo storage integration with StarCard metadata
- [ ] Test data flagging and cleanup logic
- [ ] Error handling for generation failures

### Integration Tests  
- [ ] End-to-end workshop completion → StarCard generation
- [ ] Test user vs production user data separation
- [ ] Admin bulk deletion of test data
- [ ] Photo storage system integration

### Performance Tests
- [ ] StarCard generation time under load
- [ ] Storage system performance with large images
- [ ] Background job processing efficiency
- [ ] Memory usage during PNG generation

## Definition of Done
- [ ] All acceptance criteria completed and tested
- [ ] Code reviewed and approved
- [ ] Database migration scripts created and tested
- [ ] Admin documentation updated
- [ ] Performance monitoring added
- [ ] Test user cleanup procedures documented
- [ ] Production deployment validated

## Related Issues
- Links to photo storage system implementation
- Links to StarCard generation optimization tickets
- Links to background job processing implementation

## Additional Notes

### Storage Estimates
- **Average StarCard PNG**: ~150KB
- **10,000 users**: ~1.5GB storage
- **Test data cleanup**: Weekly automated cleanup recommended

### Monitoring Requirements
- Track StarCard generation success/failure rates
- Monitor storage usage by user type (test vs production)
- Alert on storage approaching 80% capacity
- Log generation performance metrics

### Future Enhancements
- Integration with CDN for global StarCard delivery
- StarCard versioning for regeneration tracking
- Batch generation for existing users
- StarCard analytics and usage tracking

---

**Estimated Effort:** 8-10 story points  
**Sprint Planning:** Can be split across 2 sprints if needed  
**Technical Debt:** Addresses network performance and user experience issues