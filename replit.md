# AllStarTeams & Imaginal Agility Workshop Platform

## Overview

This is a dual-application learning platform built with React, Express, and PostgreSQL that hosts two distinct workshop experiences:

1. **AllStarTeams Workshop** - Team collaboration and strengths discovery
2. **Imaginal Agility Workshop** - Individual development and agility training

The platform provides a guided, step-by-step learning experience with assessments, reflections, and personalized reports. Users progress through sequential modules with content including videos, interactive assessments, and self-reflection exercises.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Styling**: TailwindCSS with Radix UI components for consistent design
- **State Management**: React hooks and context for local state, TanStack Query for server state
- **Routing**: Wouter library for client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with cookie-based authentication
- **File Structure**: Modular API routes with service layer separation

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Comprehensive user management, assessment tracking, and progress persistence
- **Key Tables**: users, user_assessments, invites, applications, discernment_scenarios, user_discernment_progress

## Key Components

### User Management System
- Role-based access control (admin, facilitator, participant)
- Invite-code based registration system
- Session-based authentication with persistent login
- User profile management with organization and job title tracking

### Workshop Navigation System
- Sequential step progression with completion tracking
- Navigation progress persistence in database
- Conditional step unlocking based on assessment completion
- Support for both linear and branched learning paths

### Assessment Engine
- Multiple assessment types: strengths (starCard), flow, well-being (cantrilLadder)
- JSON-based response storage with flexible schema
- Real-time validation and completion tracking
- Integration with visual reporting (pie charts, star cards)

### Content Management
- Video integration with completion tracking
- Interactive assessments with modal interfaces
- Step-by-step reflection exercises
- Resource downloads and personalized reports

### Administrative Tools
- User data management and reset capabilities
- Invite generation and management
- Progress monitoring and analytics
- Bulk operations for user management

## Data Flow

### User Registration & Authentication
1. Admin generates invite codes with specific roles
2. Users register using invite codes, creating account with role assignment
3. Session-based authentication persists login state
4. Navigation progress tracks user's current position in workshop

### Workshop Progression
1. Users start at step 1-1 and progress sequentially
2. Video steps require minimal engagement to unlock next step
3. Assessment steps block progression until completed
4. Results stored in user_assessments table with JSON schema
5. Navigation progress updated in real-time

### Assessment & Reporting
1. User completes interactive assessments (modal-based UI)
2. Responses validated and stored as JSON in database
3. Calculation engines generate scores and insights
4. Visual reports generated (star cards, charts) using assessment data
5. AI-powered comprehensive reports synthesize all user data

## External Dependencies

### Core Framework Dependencies
- React ecosystem: react, react-dom, @types/react
- Vite build tool with TypeScript support
- Express.js with TypeScript for backend API

### Database & ORM
- PostgreSQL as primary database
- Drizzle ORM for type-safe database operations
- Database migrations and schema management

### UI & Styling
- TailwindCSS for utility-first styling
- Radix UI for accessible component primitives
- Recharts for data visualization components
- Lucide React for consistent iconography

### Authentication & Session Management
- bcryptjs for password hashing
- express-session for session management
- cookie-parser for cookie handling

### Development & Build Tools
- TypeScript for type safety
- ESBuild for production bundling
- PostCSS for CSS processing

## Deployment Strategy

### Environment Configuration
- Replit-optimized configuration with proper port handling
- Environment-specific database connections
- Production build process using Vite and ESBuild

### Database Setup
- PostgreSQL instance with proper schema initialization
- Migration scripts for schema updates
- Test data utilities for development

### Port Configuration
- Frontend development server: Port 3000
- Backend API server: Port 5000
- Database: Standard PostgreSQL port
- Configured for Replit's port forwarding system

### Build Process
1. Frontend: Vite builds React app to dist/public
2. Backend: ESBuild bundles TypeScript server to dist/index.js
3. Production: Single Node.js process serves both frontend and API

## Recent Changes

### June 27, 2025 - Test User UI Improvements Complete ✅
- **TASK 1 COMPLETE**: Fixed test user toggle visual bug in admin dialog
  - Added local state management for immediate visual feedback
  - Toggle now moves smoothly when clicked and reflects database state
  - Implemented error handling to revert visual state on API failure
- **TASK 2 COMPLETE**: Added test user indicator to header navigation
  - "Test User" badge appears for test users (non-admin) in yellow header
  - Maintains priority system: Admin status takes precedence over test user status
  - Consistent styling with existing admin indicator
- **TASK 3 COMPLETE**: Added data reset functionality for test users
  - Self-service data reset available in profile dialog for test users only
  - Comprehensive confirmation dialog with detailed list of data to be deleted
  - Security validation ensures users can only reset their own data
  - Preserves user account and test status while clearing all workshop progress
  - Proper error handling and user feedback with automatic redirect

### June 27, 2025 - Critical Admin User Data Delete Function Fix ✅
- **CRITICAL BUG FIX**: Fixed admin user data delete function that was targeting non-existent database tables
- **ROOT CAUSE**: Function was trying to delete from `star_cards` and `flow_attributes` tables that don't exist in schema
- **SOLUTION**: Updated to target correct tables where data is actually stored as JSON in `user_assessments`
- **COMPREHENSIVE DELETION**: Now properly deletes from all existing tables:
  - `user_assessments` (star cards, flow data, reflections stored as JSON)
  - `navigation_progress` table and `users.navigation_progress` field
  - `workshop_participation`, `growth_plans`, `final_reflections`, `user_discernment_progress`
- **IMPROVED ERROR HANDLING**: Added detailed logging and comprehensive deletion tracking
- **TESTING VERIFIED**: Successfully tested with real data - deleted 4 assessment records, 4 navigation records, 1 growth plan
- **ADMIN PANEL**: Data deletion now works correctly for admins managing user workshop data

### June 27, 2025 - Phase 1 Complete: Comprehensive Demo Security Implementation ✅
- **SECURITY MILESTONE**: Successfully secured all 11 demo features across the entire platform
- **COMPREHENSIVE PROTECTION**: Implemented standardized security architecture for all demo functionality
- **COMPONENTS SECURED**: All 11 discovered demo features now require authenticated test users
  - ImaginalAgilityAssessmentModal, FlowAssessment, AssessmentModal, StepByStepReflection
  - ReflectionView, ImaginationAssessmentContent, Assessment page, Find Your Flow page
  - ImaginalAgilityAssessment, DemoModeProvider (global infrastructure secured)
- **SECURITY ARCHITECTURE**: Database-only validation using `useTestUser` hook with function-level guards and UI conditional rendering
- **ELIMINATED VULNERABILITIES**: Removed all username pattern matching, implemented consistent test user validation
- **GLOBAL INFRASTRUCTURE**: Secured DemoModeProvider with integrated test user validation
- **DOCUMENTATION**: Created comprehensive demo functionality inventory with complete security tracking
- **100% COVERAGE**: All demo features now require authenticated test users with database verification

### June 25, 2025 - Comprehensive Icon Modernization Complete
- Modernized all learning content icons from BookOpen to Presentation (multimedia metaphor)
- Enhanced IA workshop with 4 specialized step types: assessment, viewing, collaboration, activity
- Implemented 10+ functional icon types with meaningful color coding across both workshops
- Established cross-workshop consistency with modern visual language
- All video and content steps now display blue Presentation icons for better user expectations

### June 25, 2025 - Invite Code Expiration Removal
- Removed expiration checks from invite code validation in auth routes
- Updated invite management UI to remove expiration-related columns and status indicators
- All existing invite codes will continue to work indefinitely
- Simplified invite status to only show "Used" vs "Active" states

### December 24, 2025 - Phase 1A: Discernment Database Foundation
- Added new database tables: `discernment_scenarios` and `user_discernment_progress`
- Created API endpoints: `/api/discernment/scenarios/:exerciseType` and `/api/discernment/progress`
- Seeded database with 9 scenarios (3 each: reality_check, visual_detection, toolkit_practice)
- Implemented user progress tracking with scenario randomization
- Prepared foundation for Phase 1B modal integration into IA workshop step ia-6-1

## Changelog
- June 17, 2025. Initial setup
- December 24, 2025. Phase 1A Discernment Training Database Foundation completed

## User Preferences

Preferred communication style: Simple, everyday language.