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

### June 29, 2025 - Student Invite Creation "Invalid invite data" Error Fixed ✅
- **CRITICAL BUG RESOLUTION**: Fixed the "Invalid invite data" error that was preventing student invite creation in admin interface
- **DRIZZLE SCHEMA COMPILATION FIX**: Resolved TypeScript compilation errors caused by schema mismatches between Drizzle definitions and actual database structure
- **INVITE SERVICE RECONSTRUCTION**: Completely rebuilt the invite service with proper TypeScript syntax and error handling
- **RAW SQL IMPLEMENTATION**: Used raw SQL queries to bypass Drizzle schema compilation issues for reliable invite creation
- **COMPREHENSIVE ERROR HANDLING**: Added proper validation and error responses for all invite operations
- **STUDENT ROLE SUPPORT**: Confirmed full support for student role in invite creation system with purple badge styling in admin UI
- **DATABASE OPERATIONS**: Fixed all CRUD operations for invites including creation, retrieval, marking as used, and deletion
- **TECHNICAL SOLUTION**: Eliminated schema validation conflicts by using direct SQL execution with proper parameter binding

### June 29, 2025 - Role-Based Assessment Loading Implementation ✅
- **YOUTH ASSESSMENT CREATION**: Created comprehensive youth-focused assessment questions
  - Created `client/src/data/youthAssessmentQuestions.ts` with 22 age-appropriate scenarios
  - Adapted professional workplace scenarios to school/training contexts
  - Maintained identical assessment structure and scoring logic for compatibility
  - Questions focus on school projects, classmates, studying, and personal development
- **ROLE-BASED COMPONENT LOADING**: Implemented dynamic assessment loading based on user role
  - Modified AssessmentModal component to detect user role via `/api/user/profile` endpoint
  - Added role-based question set selection: students see youth scenarios, others see professional
  - Updated assessment page component with identical role-based loading logic
  - All scoring calculations use appropriate option category mapping for each question set
- **SEAMLESS INTEGRATION**: Maintained complete compatibility with existing assessment system
  - Same drag-and-drop ranking interface for both question sets
  - Identical scoring algorithm produces valid Star Cards for both assessments
  - Same assessment completion flow and result display for all user types
  - Backend API unchanged - role detection handled entirely in frontend components
- **TECHNICAL IMPLEMENTATION**: Clean separation of concerns with type-safe role detection
  - User role query integrated into both assessment components
  - Dynamic import and mapping selection based on role
  - All assessment references updated to use role-appropriate question sets
  - Maintains backward compatibility with existing professional assessments

### June 29, 2025 - Complete Student Role Integration & Invite System ✅
- **FULL STUDENT ROLE IMPLEMENTATION**: Successfully integrated student role across entire platform
  - Extended users table schema to support 'student' role with proper validation
  - Added 'student' to valid user roles: 'admin', 'facilitator', 'participant', 'student'
  - Created UserRoles constant and UserRole type for complete type safety
  - Enhanced insertUserSchema with proper role validation using z.enum()
- **ADMIN INVITE SYSTEM ENHANCEMENT**: Complete student invite creation functionality
  - Added "Student" option to admin role dropdown selection
  - Implemented purple badge styling for student role display in admin interface
  - Updated backend invite service to accept and validate 'student' role type
  - Modified invite routes to process student role with proper type casting
  - Enhanced error handling and debugging for invite creation process
- **ROLE-BASED ASSESSMENT INTEGRATION**: Students automatically receive appropriate content
  - Student users see youth-focused assessment questions (school/training contexts)
  - Other roles continue to see professional workplace scenarios
  - Same assessment interface and scoring logic maintained for consistency
  - Role detection happens automatically via `/api/user/profile` endpoint
- **COMPREHENSIVE VALIDATION & TESTING**: All functionality verified working
  - Schema accepts all four valid roles including student
  - Admin can create student invite codes through UI
  - Student registration works with existing invite system
  - TypeScript type safety ensures compile-time validation
  - Backward compatibility maintained for all existing functionality

### June 28, 2025 - IA Workshop Navigation & Assessment Results Complete Fix ✅
- **ASSESSMENT RESULTS RESTORATION**: Fixed Assessment Results page (ia-5-1) to display complete radar chart and interpretations
  - Fixed critical data parsing issue - assessment results stored as character-indexed objects instead of JSON strings
  - Implemented robust parsing that reconstructs JSON from character indices and handles both formats
  - Radar chart now displays actual user scores (Imagination 2.8, Curiosity 2.0, Empathy 1.5, Creativity 4.5, Courage 2.5)
  - Restored full interpretation guide with strengths (4.0+) and growth areas (below 3.5) analysis
  - Added comprehensive development recommendations with actionable guidance cards
- **NAVIGATION LOGIC FIXES**: Fixed ia-3-1 and ia-4-1 navigation behavior and assessment button placement
  - ia-3-1 "Next: Self-Assessment" now navigates directly to ia-4-1 (simplified flow)
  - ia-4-1 contains "Take the Assessment" button that opens modal, changes to "Next: Assessment Results" after completion
  - Fixed green button to use content navigation instead of URL navigation
  - Modal finish button properly navigates to ia-5-1 results page
- **RESPONSIVE DESIGN ENHANCEMENT**: Fixed Five Core Capabilities graphics layout in ia-3-1
  - Changed from flex-wrap to responsive grid system for proper side-by-side display
  - Graphics display in optimal columns: 5 side-by-side on XL screens, 3 on large, 2 on small, 1 on mobile
  - Smooth responsive transition maintains visual hierarchy at all screen sizes
- **COMPLETE WORKSHOP BUTTON FIX**: Fixed ia-8-1 step completion tracking
  - Complete Workshop button now properly marks ia-8-1 as completed with green checkmark
  - Maintains existing completion modal functionality while triggering proper step completion
- **CRITICAL BACKEND DATA FIX**: Resolved assessment data storage issue causing character-indexed JSON
  - Fixed double-stringification in assessment save API call that stored each character individually
  - Assessment results now properly stored as JSON strings in database
  - Radar chart and results display now work correctly with proper data format

### June 28, 2025 - IA Workshop Complete Fixes & Graphics Enhancement ✅
- **COMPREHENSIVE IA WORKSHOP OVERHAUL**: Fixed all major IA workshop issues for seamless user experience
  - Removed logo/title headers from ALL content views - clean step titles only
  - Fixed graphics in ia-3-1 with correct /assets/ paths for all 5 capability images (Imagination, Curiosity, Creativity, Courage, Empathy)
  - Implemented complete step progression flow: ia-1-1 → ia-2-1 → ia-3-1 → ia-4-1 → ia-5-1 → ia-6-1 → ia-8-1
  - Removed non-existent ia-4-2 step completely from codebase
  - Fixed step content titles: ia-5-1 now "Assessment Results", ia-6-1 now "Teamwork Preparation"
- **NEXT BUTTON IMPLEMENTATION**: Added purple-themed Next buttons to all appropriate steps
  - ia-1-1: "Next: The Triple Challenge" → navigates to ia-2-1
  - ia-2-1: "Next: Imaginal Agility Solution" → navigates to ia-3-1  
  - ia-3-1: "Next: Self-Assessment" → triggers modal assessment (onOpenAssessment)
  - ia-5-1: "Next: Teamwork Preparation" → navigates to ia-6-1
  - ia-6-1: "Next: The Neuroscience" → navigates to ia-8-1
  - ia-8-1: "Complete Workshop" → triggers completion modal
- **GRAPHICS ENHANCEMENTS**: Enhanced Five Core Capabilities visual presentation
  - Removed all text labels from graphics - clean visual-only icons
  - Doubled graphics size to 40x40px (2x larger) for better visibility
  - Implemented responsive design: graphics maintain fixed size, text scales down on mobile
  - Added flex-shrink-0 to prevent graphics compression on smaller screens
- **STEP COMPLETION FIX**: Fixed ia-3-1 checkmark behavior
  - Step ia-3-1 now gets green checkmark immediately when assessment button is clicked
  - Assessment modal opening marks ia-3-1 as completed for proper progression tracking
- **COMPLETION MODAL**: Added professional purple-themed completion modal for ia-8-1 final step
  - Congratulations message with workshop accomplishments checklist
  - Purple IA branding throughout with proper close functionality

### June 28, 2025 - AST Star Card Responsive Width Standardization ✅
- **COMPREHENSIVE WIDTH COMPRESSION FIX**: Resolved star card width compression issues across all AST workshop components
  - Fixed DownloadStarCardView with flexbox layout and explicit 440px width constraints
  - Updated YourStarCardView container to prevent max-width restrictions cutting off visuals
  - Standardized FlowStarCardView star card container with proper width maintenance
  - Fixed StarCardResourceView responsive layout to prevent profile image cutoff
  - Applied consistent CARD_WIDTH (440px) and minWidth constraints across all components
- **RESPONSIVE LAYOUT IMPROVEMENTS**: Enhanced mobile and desktop star card display
  - Replaced restrictive grid layouts with flexible flexbox containers
  - Maintained proper 440px × 610px star card dimensions on all screen sizes
  - Ensured profile images and visual elements never get partially hidden
  - Improved container max-width from 4xl to 6xl for better space utilization
- **STANDARDIZED ARCHITECTURE**: Completed centralized star card styling system
  - All 8 AST star card components now use unified starCardConstants.ts
  - Consistent attribute color mapping: Analytical=green, Empathetic=blue, Organized=yellow, Energetic=red
  - Removed all duplicate getAttributeColor functions across components
  - Single source of truth for star card dimensions and styling

### June 28, 2025 - Future Self Exercise Complete Rebuild ✅
- **INTERACTIVE TIMELINE DESIGN**: Completely rebuilt Future Self exercise (step 4-4) with new engaging interface
  - Full-width layout removing sidebar for maximum writing space
  - Interactive direction toggle: backward planning (20→10→5 years) vs forward planning (5→10→20 years)
  - Timeline graphic from public folder positioned near instructions with proper sizing
  - Vertical card layout with color-coded reflections (purple/blue/emerald)
  - Enhanced animations with spring transitions and full-page re-rendering when switching directions
- **ENHANCED USER EXPERIENCE**: Improved usability and engagement features
  - Demo button providing contextually appropriate sample data for both directions
  - Auto-save functionality with real-time status indicator (Saving/Saved/Error)
  - Responsive design optimized for mobile, tablet, and desktop
  - Flow bridge section connecting future vision to previous Flow Assessment insights
  - Streamlined instructional text removing unnecessary phrases
  - Blue-themed Next button for visual consistency
- **BACKEND API MODERNIZATION**: Updated data structure with backward compatibility
  - New timeline-specific fields: direction, twentyYearVision, tenYearMilestone, fiveYearFoundation, flowOptimizedLife
  - Legacy field support for existing users: futureSelfDescription, visualizationNotes, additionalNotes
  - Enhanced validation allowing flexible content requirements (minimum 10 characters in any field)
  - Improved error handling and user feedback
- **TECHNICAL IMPROVEMENTS**: Robust architecture with smooth animations
  - Framer Motion integration for timeline transitions and card entrances
  - Debounced auto-save preventing data loss
  - Comprehensive form validation and error states
  - Backward compatible data migration from legacy format
- **FINAL REFLECTION TIMER FIX**: Resolved dual timer issue in Final Reflection modal
  - Removed unnecessary 5-second countdown timer from content view
  - Kept only the essential 20-second auto-close timer within the modal
  - Users now see clean "View Options" button instead of countdown on completed steps

### June 27, 2025 - Complete Test User Page Implementation ✅
- **COMPREHENSIVE TEST USER DASHBOARD**: Created dedicated `/testuser` route with full workshop management
  - Simplified workshop buttons to "Go to AllStarTeams Workshop" and "Go to Imaginal Agility Workshop"
  - Removed complex Continue/Switch logic for cleaner user experience
  - Real-time progress tracking showing actual step numbers and completion status
  - Proper logo display with correctly sized workshop images (64x64px)
- **PROFILE INFORMATION SECTION**: Added user profile display with logout functionality
  - Clean card format showing logged-in user name, email, role, and username
  - Integrated logout button with proper session management
  - Positioned prominently at top of test user page for easy access
- **PROFILE MODAL ENHANCEMENTS**: Added "Test User Dashboard" navigation for test users
  - Prominent blue-to-purple gradient button for easy access to test user features
  - Automatic modal closure and navigation to `/testuser` route
  - Removed redundant reset data functionality from profile modal
- **DATA MANAGEMENT CONSOLIDATION**: Centralized all test user data operations
  - Export functionality for downloading complete user data as JSON
  - Comprehensive reset functionality with detailed confirmation dialogs
  - Security validation ensuring users can only manage their own data
- **LOGO AND ASSET FIXES**: Resolved all workshop logo display issues
  - Fixed AST logo path: `/all-star-teams-logo-square.png` (properly copied to public)
  - Fixed IA logo path: `/IA_sq.png` (properly copied to public)
  - Removed fallback icons in favor of actual workshop logos
- **ROUTING FIXES**: Fixed critical navigation issues
  - Updated landing page to redirect test users to `/testuser` instead of non-existent `/dashboard`
  - Eliminated "Cannot GET /dashboard" errors for test users
  - Proper fallback routing based on user type and authentication status
- **STATIC FILE SERVING FIX**: Resolved logo display issue
  - Added Express static file serving for public directory before Vite middleware
  - Workshop logos now display correctly as images instead of HTML fallbacks
  - Fixed Content-Type headers for PNG files (image/png instead of text/html)
  - AST and IA workshop cards now show actual logo images at 64x64px size

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