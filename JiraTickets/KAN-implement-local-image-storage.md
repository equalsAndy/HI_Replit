# KAN - Implement Local Image Storage for Visualizing Potential Feature

**Issue Type:** Story  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-07-30  

## Summary
Implement local image storage system for Visualizing Potential images instead of relying solely on external CDN URLs

## Description
Currently, the Visualizing Potential feature (step 4-3) saves Unsplash image URLs that point to external CDN servers. While this works functionally, storing images locally would provide:

- Better data persistence and reliability
- Reduced dependency on external services
- Faster loading times for frequently accessed images
- Better control over image lifecycle and caching
- Compliance with data sovereignty requirements

**Current Behavior:**
- Images are saved as URLs pointing to Unsplash CDN
- URLs like: `https://images.unsplash.com/photo-1497633762265-9d179a990aa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=...`

**Desired Behavior:**
- Download and store images locally in `/storage/images/` directory
- Save local file paths in database alongside original URLs
- Maintain Unsplash attribution requirements
- Implement image optimization and resizing

## Acceptance Criteria
1. **Local Storage Implementation**
   - Create `/storage/images/visualizing-potential/` directory structure
   - Download selected images from Unsplash URLs
   - Save images with structured naming: `user-{userId}-{timestamp}-{imageId}.jpg`
   - Store both local path and original URL in database

2. **Database Schema Updates**
   - Add `localImagePath` field to visualizing potential data structure
   - Maintain backward compatibility with existing URL-only records
   - Add migration script for existing data

3. **API Endpoint Updates**
   - Modify `/api/workshop-data/visualizing-potential` POST endpoint
   - Implement image download and storage logic
   - Add error handling for download failures
   - Fallback to URL-only storage if download fails

4. **Frontend Updates**
   - Update image loading to prefer local images over CDN URLs
   - Maintain Unsplash attribution display
   - Handle both local and remote image sources

5. **Storage Management**
   - Implement image cleanup for deleted/updated selections
   - Add disk space monitoring
   - Configure image optimization (resize, compression)

## Technical Notes

**Files Involved:**
- `server/routes/workshop-data-routes.ts` - API endpoint modifications
- `server/services/image-storage-service.ts` - New service for image handling
- `client/src/components/content/VisualizingYouView.tsx` - Frontend image loading
- Database migration script for schema updates

**Implementation Considerations:**
- Use Node.js `fs` and `https` modules for image downloading
- Implement proper error handling and retry logic
- Consider image format standardization (WebP for optimization)
- Ensure proper file permissions and security
- Add rate limiting to prevent abuse

**Storage Structure:**
```
/storage/images/
├── visualizing-potential/
│   ├── user-1/
│   │   ├── 2025-07-30-lUaaKCUANVI.jpg
│   │   └── 2025-07-30-eeSdJfLfx1A.jpg
│   └── user-2/
│       └── ...
```

**Dependencies:**
- Sharp or similar library for image optimization
- File system utilities for directory management
- Image validation and security scanning

## Definition of Done
- [ ] Images are downloaded and stored locally when selected
- [ ] Database properly stores both local paths and original URLs
- [ ] Frontend loads local images with CDN fallback
- [ ] Proper error handling and logging implemented
- [ ] Unsplash attribution requirements maintained
- [ ] Storage cleanup mechanisms in place
- [ ] Performance testing completed
- [ ] Documentation updated