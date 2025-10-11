# KAN - Fix Docker Canvas/Puppeteer Compatibility Issues

**Issue Type:** Bug  
**Project:** KAN  
**Priority:** High  
**Reporter:** Claude Code  
**Date Created:** 2025-08-08

## Summary
StarCard generation and other Canvas/Puppeteer operations are failing in Docker containers due to missing system dependencies

## Description
The current Docker setup using Alpine-based Node.js images is missing critical system libraries required for Canvas operations and headless browser functionality. This affects:

- **StarCard PNG generation** (failing to create user StarCards)
- **PDF report generation** (if using Puppeteer)
- **Any HTML-to-image conversion** operations
- **Chart generation services** that rely on Canvas

The root cause is that Alpine Linux doesn't include the native dependencies required by:
- `canvas` npm package (Cairo, Pango, graphics libraries)
- `puppeteer` (Chromium dependencies, X11 libraries)
- `html2canvas` server-side operations

## Current Error Symptoms
- Canvas operations fail with "library not found" errors
- Puppeteer launches fail with missing Chrome dependencies
- Font rendering issues in generated images
- Container crashes during image generation

## Impact Assessment
- **High**: StarCard downloads completely broken for users
- **Medium**: Report generation may be affected
- **Low**: Development workflow interrupted by inconsistent environments

## Acceptance Criteria

### Must Have
- [ ] StarCard generation works reliably in Docker containers
- [ ] All Canvas/Puppeteer operations function identically in dev/staging/production
- [ ] Container builds successfully with all required dependencies
- [ ] No regression in container startup time (reasonable increase acceptable)

### Should Have  
- [ ] Container image size optimized (multi-stage build if needed)
- [ ] Font rendering works correctly for all text elements
- [ ] Error handling improved for Canvas operation failures
- [ ] Documentation updated with Canvas dependency requirements

### Could Have
- [ ] Alternative cloud-based image generation service evaluated
- [ ] Client-side Canvas generation option implemented as fallback
- [ ] Performance benchmarking of Canvas operations in containers

## Technical Implementation Plan

### Option 1: Switch to Debian Base Image (Recommended)
```dockerfile
FROM node:18-bullseye  # Instead of Alpine

# Install Canvas and Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*
```

### Option 2: Multi-stage Build for Size Optimization
```dockerfile
FROM node:18-bullseye AS deps
# Install all dependencies

FROM node:18-bullseye-slim AS runtime  
# Copy only required runtime dependencies
```

### Option 3: Use Pre-built Puppeteer Image
```dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest
# Already includes all required dependencies
```

## Files Affected
- `/Dockerfile` - Main application container
- `/docker-compose.yml` - Development environment
- `/generate-starcards.js` - StarCard generation script
- `/server/services/chart-generation-service.ts` - Chart generation
- `/server/services/pdf-report-service.ts` - PDF generation
- `/.dockerignore` - May need updates for new dependencies

## Testing Strategy

### Unit Tests
- [ ] Canvas operations work in containerized environment
- [ ] Puppeteer launches successfully with required flags
- [ ] Font loading and rendering tests pass
- [ ] Image generation produces expected output

### Integration Tests
- [ ] Complete StarCard generation workflow
- [ ] PDF report generation end-to-end
- [ ] Chart generation service functionality
- [ ] Cross-platform container compatibility (AMD64/ARM64)

### Performance Tests
- [ ] Container startup time benchmarking
- [ ] Image generation performance comparison
- [ ] Memory usage profiling during Canvas operations
- [ ] Concurrent request handling under load

## Deployment Strategy
1. **Development**: Test new Dockerfile in local environment
2. **Staging**: Deploy to staging with full Canvas functionality testing
3. **Production**: Coordinated deployment with rollback plan
4. **Validation**: Verify all image generation features working

## Risk Assessment

### High Risk
- **Container size increase**: New base image will be larger than Alpine
- **Startup time impact**: Additional dependencies may slow container startup
- **Memory usage**: Graphics libraries may increase runtime memory usage

### Medium Risk
- **Platform compatibility**: Different architecture support (ARM64 vs AMD64)
- **Dependency conflicts**: New system packages may conflict with existing setup
- **Build time increase**: Installing additional packages will slow CI/CD

### Low Risk
- **Application logic changes**: Canvas operations should work without code changes
- **Database connectivity**: No impact on database operations
- **API functionality**: Core API endpoints unaffected

## Alternative Solutions Considered

### Cloud-based Image Generation
- **Pros**: No Docker dependency issues, scalable
- **Cons**: External service dependency, costs, latency
- **Services**: HTMLCSStoImage, PDFShift, Bannerbear

### Client-side Generation
- **Pros**: No server resources needed, works around Docker issues  
- **Cons**: User experience complexity, browser compatibility
- **Implementation**: HTML2Canvas in browser with download trigger

### Host-based Generation
- **Pros**: Avoids container issues entirely
- **Cons**: Environment inconsistency, deployment complexity
- **Approach**: Volume mount for generated files

## Success Metrics
- [ ] StarCard generation success rate: 100%
- [ ] Container build success rate: 100% 
- [ ] Average image generation time: < 5 seconds
- [ ] Container startup time: < 30 seconds
- [ ] Memory usage increase: < 50MB per container
- [ ] Zero Canvas-related error reports from users

## Dependencies
- Docker/containerization knowledge
- Canvas/Puppeteer debugging skills
- AWS Lightsail container service familiarity
- System library dependency management

## Timeline Estimate
- **Research and Dockerfile updates**: 4 hours
- **Testing and validation**: 4 hours  
- **Deployment and monitoring**: 2 hours
- **Total**: 1-2 development days

## Notes
- This issue is blocking StarCard feature for all users
- Priority should be given to getting basic Canvas functionality working
- Performance optimization can be addressed in follow-up tickets
- Consider creating separate tickets for client-side generation alternatives

---

**Related Issues:**
- StarCard generation failures
- PDF report generation inconsistencies  
- Docker deployment complexity

**Labels:** docker, canvas, puppeteer, starcard, high-priority, infrastructure