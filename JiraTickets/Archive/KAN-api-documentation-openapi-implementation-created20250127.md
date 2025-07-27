# KAN - API Documentation with OpenAPI Implementation

**Issue Type:** Story  
**Project:** KAN (Development tasks)  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-01-27  

## Summary
Implement comprehensive API documentation using OpenAPI/Swagger for all workshop endpoints and admin functionality

## Description
The application has extensive API endpoints for both AST and IA workshops, user management, and admin functionality, but lacks comprehensive API documentation. This makes it difficult for developers to understand API contracts, integrate with the system, and maintain consistency. We need to implement OpenAPI/Swagger documentation for all endpoints.

## Current Documentation State
- **Missing:** Comprehensive API documentation
- **Missing:** Request/response schema documentation
- **Missing:** Authentication flow documentation  
- **Missing:** Workshop-specific API documentation
- **Existing:** Some inline code comments in route files
- **Present:** TypeScript types that could be leveraged for schemas

## Expected Outcome
- Complete API documentation accessible via web interface
- Auto-generated documentation from code annotations
- Interactive API testing capability
- Clear documentation of workshop separation in APIs
- Developer-friendly integration guide

## Acceptance Criteria
1. **OpenAPI Specification**
   - Complete OpenAPI 3.0 specification for all endpoints
   - Auto-generated from JSDoc annotations in route files
   - Separated documentation for AST and IA workshop endpoints
   - Admin API documentation with proper security annotations

2. **Interactive Documentation**
   - Swagger UI integration accessible at `/api-docs`
   - Interactive testing capability for all endpoints
   - Authentication flow testing with session management
   - Example requests and responses for all endpoints

3. **Schema Documentation**
   - Complete request/response schema definitions
   - Workshop data structure documentation
   - User management schema documentation
   - Error response format standardization

4. **Workshop Separation Documentation**
   - Clear documentation of AST vs IA endpoint separation
   - Role-based access documentation
   - Workshop-specific data flow documentation
   - Cross-workshop data isolation explanation

## Technical Implementation
- **OpenAPI Generator:** swagger-jsdoc for annotation-based generation
- **UI Framework:** swagger-ui-express for interactive documentation
- **Schema Integration:** Leverage existing Zod schemas
- **Authentication:** Document session-based auth flow

## API Documentation Structure
```yaml
# OpenAPI structure outline
openapi: 3.0.0
info:
  title: Heliotrope Imaginal Workshop API
  version: 2.0.0
  description: Dual-workshop platform API for AST and IA workshops

paths:
  # Authentication endpoints
  /api/auth/*:
    post: # Login, logout, profile management
    
  # AST Workshop endpoints  
  /api/ast/workshop-data/*:
    get, post, put: # AST-specific data operations
    
  # IA Workshop endpoints
  /api/ia/workshop-data/*:
    get, post, put: # IA-specific data operations
    
  # Admin endpoints
  /api/admin/*:
    get, post, delete: # Admin operations with proper security

components:
  schemas:
    # Workshop data schemas
    # User management schemas
    # Error response schemas
  securitySchemes:
    sessionAuth: # Session-based authentication
```

## Route Files to Document
```typescript
// Priority order for documentation
const routesToDocument = [
  // Authentication (highest priority)
  'server/routes/auth-routes.ts',
  
  // Workshop data (core functionality)
  'server/routes/workshop-data-routes.ts',
  
  // Admin functionality
  'server/routes/admin-routes.ts',
  
  // User management
  'server/routes/user-routes.ts',
  
  // Specialized routes
  'server/routes/feedback-routes.ts',
  'server/routes/report-routes.ts'
];
```

## Documentation Examples
```javascript
/**
 * @swagger
 * /api/ast/workshop-data/step:
 *   post:
 *     summary: Save AST workshop step data
 *     tags: [AST Workshop]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stepId:
 *                 type: string
 *                 pattern: '^[1-6]-[1-6]$'
 *                 example: '2-1'
 *               data:
 *                 type: object
 *                 description: Step-specific data
 *     responses:
 *       200:
 *         description: Data saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
```

## Schema Integration
```typescript
// Leverage existing Zod schemas for OpenAPI
const workshopDataSchema = {
  type: 'object',
  properties: {
    stepId: { 
      type: 'string', 
      pattern: '^(ia-)?[1-6]-[1-6]$',
      description: 'Workshop step identifier'
    },
    workshopType: {
      type: 'string',
      enum: ['ast', 'ia'],
      description: 'Workshop type identifier'
    },
    userId: {
      type: 'integer',
      description: 'User identifier'
    },
    data: {
      type: 'object',
      description: 'Step-specific workshop data'
    }
  },
  required: ['stepId', 'workshopType', 'userId', 'data']
};
```

## Workshop Separation Documentation
- **AST Endpoints:** `/api/ast/*` - AllStarTeams workshop operations
- **IA Endpoints:** `/api/ia/*` - Imaginal Agility workshop operations  
- **Shared Endpoints:** `/api/shared/*` - Cross-workshop functionality
- **Admin Endpoints:** `/api/admin/*` - Administrative operations
- **Auth Endpoints:** `/api/auth/*` - Authentication and user management

## Error Response Standardization
```typescript
// Standardized error response format
const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', description: 'Error message' },
    code: { type: 'string', description: 'Error code for client handling' },
    details: { type: 'object', description: 'Additional error context' }
  },
  required: ['success', 'error']
};
```

## Authentication Flow Documentation
```yaml
# Session-based authentication flow
components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: connect.sid
      description: |
        Session-based authentication using secure HTTP-only cookies.
        
        Authentication Flow:
        1. POST /api/auth/login with credentials
        2. Server sets secure session cookie
        3. Include cookie in subsequent requests
        4. POST /api/auth/logout to end session
```

## Development Integration
- **Route Annotations:** JSDoc comments in all route files
- **Schema Validation:** Integration with existing Zod schemas
- **Testing Integration:** Use OpenAPI spec for API testing
- **CI/CD:** Generate and validate docs in build process

## Documentation Deployment
- **Development:** Live-reload documentation at `/api-docs`
- **Staging:** Full documentation for testing and review
- **Production:** Public documentation with security considerations

## Files Requiring Documentation
1. **Core Routes** (immediate priority)
   - `server/routes/auth-routes.ts` - Authentication endpoints
   - `server/routes/workshop-data-routes.ts` - Workshop data operations
   - `server/routes/admin-routes.ts` - Admin functionality

2. **Secondary Routes**
   - `server/routes/user-routes.ts` - User management
   - `server/routes/feedback-routes.ts` - Feedback system
   - `server/routes/report-routes.ts` - Report generation

3. **Schema Files**
   - `shared/schema.ts` - Database schemas for OpenAPI conversion
   - Route-specific validation schemas

## Quality Gates
- All new endpoints must include OpenAPI documentation
- Documentation must be validated against actual API responses
- Breaking changes must be documented with version information
- Examples must be tested and verified

## Labels
- `documentation`
- `api`
- `openapi`
- `swagger`
- `developer-experience`

## Components
- Backend/API
- Documentation System
- Developer Tools
- Integration Testing