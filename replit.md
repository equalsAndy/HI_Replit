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
- **Key Tables**: users, user_assessments, invites, applications

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

## Changelog
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.