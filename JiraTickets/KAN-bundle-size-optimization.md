# KAN - Bundle Size Optimization Through Code Splitting

**Issue Type:** Task  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-07-27  

## Summary
Implement code splitting to reduce main bundle size from 1.9MB to improve application performance and user experience.

## Description
The current build generates a 1.9MB main bundle which impacts initial page load performance. Build warnings indicate chunks larger than 500KB after minification. We need to implement strategic code splitting to break the application into smaller, loadable chunks.

**Current Issues:**
- Main bundle: 1.9MB (too large for optimal loading)
- Build warning: "Some chunks are larger than 500 kB after minification"
- html2canvas library causing dynamic/static import conflicts
- No separation between AST/IA workshop code at bundle level

## Acceptance Criteria
1. **Bundle Size Reduction**
   - Main bundle reduced to <500KB
   - Total initial load <1MB
   - Route-specific chunks <300KB each

2. **Code Splitting Implementation**
   - Route-based splitting (admin, AST workshop, IA workshop, assessments)
   - Workshop separation (AST vs IA chunks align with project architecture)
   - Heavy library splitting (html2canvas, charts, etc.)

3. **Performance Improvements**
   - Faster initial page load
   - Progressive loading of features
   - Maintained workshop separation requirements

4. **Technical Requirements**
   - Configure Vite manual chunks
   - Implement lazy loading for major routes
   - Resolve html2canvas import conflicts
   - Maintain existing functionality

## Technical Notes
**Implementation Phases:**
1. **Analysis**: Bundle analyzer to identify heavy dependencies
2. **Route Splitting**: Major pages (admin, workshops, assessments)  
3. **Workshop Splitting**: AST/IA separation (aligns with existing architecture)
4. **Library Splitting**: html2canvas, video players, export functionality
5. **Configuration**: Vite manual chunks optimization

**Files Involved:**
- `vite.config.ts` - Bundle configuration
- Route components - Lazy loading implementation
- `client/src/lib/html2canvas.ts` - Import conflict resolution
- Workshop components - AST/IA separation

**Architecture Considerations:**
- Must maintain strict AST/IA workshop separation
- Admin features should be separate chunk
- Export/download functionality can be lazy-loaded
- Shared UI components should remain in main bundle

**Performance Targets:**
- Main bundle: <500KB (67% reduction)
- Initial load: <1MB total
- Route chunks: <300KB each
- Time to interactive improvement: 30-40%

## Dependencies
- No external dependencies
- Requires build process optimization
- May need testing across different connection speeds

## Definition of Done
- [ ] Bundle analyzer shows size breakdown
- [ ] Main bundle <500KB
- [ ] Route-based code splitting implemented
- [ ] Workshop separation maintained in chunks
- [ ] Build warnings resolved
- [ ] Performance testing completed
- [ ] No functionality regressions