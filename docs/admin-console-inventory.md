
# Admin Console Complete Inventory

## Overview
This document provides a complete overview of all admin-related files, components, routes, and functionality in the AllStarTeams/Imaginal Agility workshop platform.

## Admin Dashboard/Console Files

### Frontend Components (`client/src/components/admin/`)

#### Core Admin Components
- **`UserManagement.tsx`** - Main user management interface
  - User table with sorting, filtering, search
  - User role management (admin, facilitator, participant, student)
  - Test user status toggle
  - User data deletion and account deletion
  - Pagination and bulk operations

- **`InviteManagement.tsx`** - Invite code management system
  - Create individual invites with role assignment
  - Batch invite generation (up to 50 codes)
  - View all invites with status tracking
  - Invite expiration management
  - Formatted invite code display

- **`UserUploader.tsx`** - Bulk user creation and test data generation
  - CSV user upload functionality
  - Generate test users with complete workshop data
  - Bulk operations for user creation
  - Test data population for demo purposes

#### Video Management Components
- **`SimpleVideoManagement.tsx`** - Streamlined video management interface
  - Basic video editing capabilities
  - Workshop-specific video organization
  - Simple URL updates

- **`VideoDirectManagement.tsx`** - Advanced video management
  - Full video CRUD operations
  - Direct database video editing
  - Workshop type filtering
  - Detailed video metadata management

#### Data Management Components
- **`CohortManagement.tsx`** - User group management
  - Organize users into cohorts
  - Bulk user operations by cohort
  - Progress tracking by group

- **`ResetUserDataButton.tsx`** - Individual user data reset
  - Reset specific user's workshop progress
  - Preserve profile while clearing progress data
  - Confirmation dialogs for safety

### Admin Pages (`client/src/pages/admin/`)

#### Main Admin Interface
- **`dashboard.tsx`** - Primary admin dashboard
  - System overview statistics
  - User management interface
  - Quick access to all admin functions
  - Real-time user activity monitoring

- **`reset-all-users.tsx`** - Bulk data reset interface
  - Reset all user progress data
  - System-wide data cleanup
  - Emergency reset functionality

### Backend Routes (`server/routes/`)

#### Primary Admin Routes (`admin-routes.ts`)
```typescript
// User Management Endpoints
GET    /api/admin/users                    // Get all users
POST   /api/admin/users                    // Create new user
PUT    /api/admin/users/:id                // Update user info
PUT    /api/admin/users/:id/role           // Change user role
DELETE /api/admin/users/:id                // Delete user completely
DELETE /api/admin/users/:id/data           // Delete user data only
PUT    /api/admin/users/:id/test-status    // Toggle test user status

// Invite Management Endpoints
GET    /api/admin/invites                  // Get all invites
POST   /api/admin/invites/batch            // Generate batch invites

// Video Management Endpoints
GET    /api/admin/videos                   // Get all videos
GET    /api/admin/videos/workshop/:type    // Get videos by workshop
PUT    /api/admin/videos/:id               // Update video

// Data Export Endpoints
GET    /api/admin/users/:id/export         // Export user data
GET    /api/admin/users/:id/validate       // Validate user data

// Test User Management
GET    /api/admin/test-users               // Get all test users
```

#### Admin Upload Routes (`admin-upload-routes.ts`)
```typescript
POST   /api/admin/upload-users             // Bulk user upload via CSV
POST   /api/admin/generate-test-user       // Generate test user with data
```

#### Reset Routes (`reset-routes.ts`)
```typescript
POST   /api/admin/reset-all-users          // Reset all user data
POST   /api/admin/reset-user/:id           // Reset specific user
DELETE /api/admin/delete-all-data          // Emergency data deletion
```

### Middleware (`server/middleware/`)

#### Authentication Middleware (`auth.ts`)
```typescript
requireAuth()        // Validates session/cookie authentication
attachUser()         // Adds user object to request
```

#### Role-Based Access Control (`roles.ts`)
```typescript
isAdmin()            // Admin-only access (includes user ID 1 auto-grant)
isFacilitator()      // Facilitator-only access
isFacilitatorOrAdmin() // Combined admin/facilitator access
isParticipant()      // Participant-only access
```

#### Test User Authentication (`test-user-auth.ts`)
```typescript
requireTestUser()    // Validates test user status for demo features
```

### Services (`server/services/`)

#### User Management Service (`user-management-service.ts`)
- Complete user CRUD operations
- Role management and validation
- Test user status management
- Video management operations
- Progress data management

#### Export Service (`export-service.ts`)
- User data export functionality
- Data validation and formatting
- PDF report generation integration

#### Invite Service (`invite-service.ts`)
- Invite code generation and validation
- Email-based invite workflows
- Expiration and usage tracking

#### Reset Service (`reset-service.ts`)
- User data reset operations
- System-wide reset functionality
- Data preservation logic

## Admin Interface Structure

### Current Navigation Flow
```
/admin (main dashboard)
├── User Management Tab
│   ├── User Table with Actions
│   ├── Role Assignment
│   ├── Test User Toggle
│   └── Data Export
├── Invite Management Tab
│   ├── Create Individual Invites
│   ├── Batch Invite Generation
│   └── Invite Status Tracking
├── Video Management Tab
│   ├── Workshop Video Organization
│   ├── URL Management
│   └── Video Metadata Editing
└── System Management Tab
    ├── Bulk Data Reset
    ├── Test User Generation
    └── System Statistics
```

### User Management Table Component

#### Data Fetching Pattern
```typescript
// React Query for real-time user data
const { data: users, refetch } = useQuery({
  queryKey: ['admin', 'users'],
  queryFn: () => fetch('/api/admin/users').then(res => res.json())
});
```

#### Table Features
- **Sorting**: By name, email, role, creation date
- **Filtering**: By role, test user status, organization
- **Search**: Real-time search across all user fields
- **Pagination**: Server-side pagination for large datasets
- **Actions**: Role change, test toggle, data export, deletion

#### Data Structure
```typescript
interface AdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'facilitator' | 'participant' | 'student';
  organization?: string;
  jobTitle?: string;
  isTestUser: boolean;
  createdAt: Date;
  updatedAt: Date;
  progress?: number;
}
```

## Components to be Modified for Facilitator Console

### System Overview Component (TO BE REMOVED)
- **Location**: `client/src/pages/admin/dashboard.tsx`
- **Current Function**: Shows system-wide statistics, total users, workshop completion rates
- **Removal Reason**: Facilitators should not see system-wide data, only their assigned participants

### User Upload Component (TO BE HIDDEN)
- **Location**: `client/src/components/admin/UserUploader.tsx`
- **Current Function**: Bulk user creation, test data generation
- **Access Control**: Should be admin-only, hidden from facilitator console

### Video Management (TO BE RESTRICTED)
- **Location**: `client/src/components/admin/SimpleVideoManagement.tsx`
- **Current Function**: Edit video URLs and metadata
- **Access Control**: Should be admin-only, facilitators get read-only access

## Security Patterns

### Route Protection
```typescript
// Admin-only routes
router.get('/admin/*', requireAuth, isAdmin, handler);

// Facilitator-or-admin routes
router.get('/facilitator/*', requireAuth, isFacilitatorOrAdmin, handler);
```

### Component-Level Security
```typescript
// Role-based conditional rendering
{user?.role === 'admin' && <SystemOverview />}
{(['admin', 'facilitator'].includes(user?.role)) && <UserManagement />}
```

### API Endpoint Security
- All admin endpoints protected by `requireAuth + isAdmin`
- Data filtering based on user role
- Session-based authentication with role validation
- Input validation and sanitization

## Database Schema

### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE,
  name VARCHAR,
  email VARCHAR UNIQUE,
  role ENUM('admin', 'facilitator', 'participant', 'student'),
  organization VARCHAR,
  jobTitle VARCHAR,
  isTestUser BOOLEAN DEFAULT false,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Key Admin-Related Tables
- **invites**: Invite code management
- **sessions**: Authentication sessions
- **navigationProgress**: User progress tracking
- **videos**: Workshop video metadata

## Current State Analysis

### Working Features
- ✅ User management with full CRUD operations
- ✅ Role-based access control
- ✅ Invite system with batch generation
- ✅ Test user functionality
- ✅ Data export capabilities
- ✅ Video management (basic)

### Facilitator Console Requirements
- 🔄 Clone admin interface for facilitator access
- 🔄 Remove system-wide statistics
- 🔄 Filter user data to facilitator's assigned participants
- 🔄 Hide bulk user creation tools
- 🔄 Restrict video management to read-only
- 🔄 Implement participant assignment system
- 🔄 Add facilitator-specific reporting

### Security Considerations
- All routes must maintain role-based access control
- Data filtering must happen at API level, not just UI
- Session validation required for all protected endpoints
- Test user functionality must remain secure and isolated

---

**Document Created**: December 2024  
**Last Updated**: Based on current codebase analysis  
**Status**: Ready for facilitator console implementation
