# Future Features & Fixes Backlog

## 📋 About This Document

This file tracks feature requests, bugs, and improvements that come up during development but aren't addressed in the current chat session. Use this to maintain continuity across development sessions and ensure nothing gets lost.

## 🎯 How to Use This Document

### **For Development Sessions:**
- **Add items** when features/fixes are identified but not implemented
- **Move items** from "Backlog" to "In Progress" when working on them
- **Move items** to "Completed" when finished
- **Include context** about why the item is needed and any implementation notes

### **For Claude/AI Assistants:**
- **Always check this file** at the start of new development sessions
- **Ask the user** if they want to work on any backlog items
- **Update this file** when new items are discovered or completed
- **Reference this file** when planning development priorities

---

## ✅ **MAJOR INFRASTRUCTURE COMPLETION**

### **Dual Environment Development Workflow - COMPLETED (July 12, 2025)**

#### 🎯 **Infrastructure Complete:**
- ✅ **Development Database**: AWS Lightsail PostgreSQL isolated from production
- ✅ **Feature Flag System**: Environment-aware controls for safe development
- ✅ **Branch Strategy**: `development` branch for safe feature work, `main` for production
- ✅ **API Routing**: Fixed Vite middleware to properly handle /api routes
- ✅ **Environment Detection**: Working environment switching (development vs production)
- ✅ **Git Hygiene**: Clean working directory, sensitive files properly ignored

#### 🔧 **Technical Implementation:**
- **Feature Flags**: `workshopLocking: true`, `holisticReports: false`, `facilitatorConsole: false`
- **API Endpoint**: `/api/workshop-data/feature-status` returns environment and feature status
- **Database URLs**: Development (AWS Lightsail) vs Production (Neon PostgreSQL)
- **Environment Variables**: `ENVIRONMENT=development` in .env for local development
- **Branch Protection**: Production database only accessible from main branch

#### 🚀 **Ready for Safe Feature Development:**
- Workshop Locking System (feature flag enabled)
- Holistic Report System (Claude API integration)
- Facilitator Console & Cohort Management
- IA Progression Changes (next priority)

---

## 🚀 Feature Requests

### **High Priority**
*Features that would significantly improve user experience or functionality*

- [ ] **Real-time progress sync** - Currently progress only updates on page refresh

### **Medium Priority**
*Nice-to-have features that would enhance the platform*

- [ ] **Facilitator cohort management frontend** - Connect existing CohortManagement component to backend API (backend complete, needs API connection, currently in development)
- [ ] **Bulk user management** - Admin ability to import/export multiple users at once
- [ ] **Admin assessment management interface** - UI for admins to edit/create assessment questions and modify strength category mappings (assessment engine complete, needs admin editing UI)
- [ ] **Admin Video Management System** - Complete implementation of video CRUD operations in admin console ([See Development Guide](../docs/video-management-development-guide.md))
- [ ] **User profile pictures** - Allow users to upload and display profile photos
- [ ] **Workshop analytics dashboard** - Show completion rates, time spent, popular steps
- [ ] **Email notifications** - Notify users of progress milestones or admin messages
- [ ] **Workshop themes/branding** - Allow customization of colors and logos per organization
- [ ] **Student-specific orientation content** - Week-based structure content and different orientation video for student users
- [ ] **Week-based UI progress display** - Visual progress indicator showing weeks instead of steps for student users
- [ ] **Assessment variation system** - Framework for creating multiple assessment types with different questions/mappings
- [ ] **Additional workshop types for students** - IA workshop adaptation and other student-focused content

### **Low Priority**
*Future enhancements for consideration*

- [ ] **Database migration to AWS Lightsail** - Move from Neon PostgreSQL to Lightsail Managed Database for consolidated infrastructure control and predictable costs ($15-60/month vs usage-based pricing)
- [ ] **Workshop completion certificates** - Generate PDF certificates when users complete workshops (not currently discussed priority)
- [ ] **Mobile app** - Native iOS/Android apps for workshop access
- [ ] **Multi-language support** - Translate workshops into multiple languages
- [ ] **Workshop builder** - Allow admins to create custom workshop content
- [ ] **Integration APIs** - Connect with external HR/learning management systems

---

## 🐛 Bug Fixes & Technical Improvements

### **High Priority**
*Issues that affect core functionality*

- [ ] **Enhanced Claude System Instructions** - Implement project-aware Claude instructions with workshop separation rules, error prevention, and Heliotrope-specific workflows to reduce development session setup time
- [ ] **Development Documentation Consolidation** - Create single quick-reference guide to reduce fragmentation across multiple docs (brad-development-guide.md, claude-development-workflow.md, heliotrope-project-knowledge.md)
- [ ] **Session timeout handling** - Better UX when user sessions expire
- [ ] **Error boundary improvements** - More graceful error handling throughout app
- [ ] **Database performance optimization** - Query optimization for large user bases
- [ ] **Workshop Card button logic consistency** - Consider standardizing "Go to Workshop" vs "Continue Workshop" vs "Switch to Workshop" logic across different user states

### **Medium Priority**
*Issues that occasionally cause problems*

- [ ] **Logo sizing consistency** - IA and AST logos have different aspect ratios causing inconsistent appearance when using height-based sizing
- [ ] **Loading state consistency** - Standardize loading indicators across all components
- [ ] **Mobile responsive design** - Improve mobile experience for smaller screens
- [ ] **Browser compatibility** - Test and fix issues with older browsers

### **Low Priority**
*Minor issues or code quality improvements*

- [ ] **TypeScript strict mode** - Improve type safety throughout codebase
- [ ] **Code documentation** - Add JSDoc comments to all major functions
- [ ] **Test coverage** - Add unit and integration tests for critical paths
- [ ] **Performance monitoring** - Add metrics and monitoring for production

---

## ✅ Completed Items

### **Recent Completions** *(Move items here when finished)*

- ✅ **Facilitator invite permissions** *(2025-06-30)* - Complete implementation allowing facilitators to create participant/student invites only, with automatic cohort assignment and role restrictions enforced in UI and backend
- ✅ **Facilitator cohort management backend** *(2025-06-30)* - Full API implementation in server/routes/facilitator-routes.ts allowing facilitators to create/manage cohorts and organizations
- ✅ **Test user progress indicators refresh bug** *(2025-06-30)* - Fixed through enhanced TestUserBanner.tsx and ResetUserDataButton.tsx with proper state updates and query invalidation
- ✅ **Student user type database schema** *(2025-06-29)* - Added 'student' role to users table with full type safety and validation
- ✅ **Youth assessment question mapping** *(2025-06-29)* - Created 22 school/training scenarios mapped to same 4 strength categories
- ✅ **Role-based assessment loading** *(2025-06-29)* - Assessment component now loads youth scenarios for students, professional questions for others
- ✅ **Logo routing and display issues** *(2025-06-27)* - Fixed IA workshop showing AST logo due to incorrect routing, implemented proper workshop detection
- ✅ **Logo dev vs deployed environment paths** *(2025-06-27)* - Resolved logo path inconsistencies by standardizing Logo component usage across all navigation
- ✅ **Test user progress display bug** *(2025-06-28)* - Fixed step ID mapping to show correct sequential progress (4-1 → step 10 of 14)
- ✅ **Admin export permissions** *(2025-06-28)* - Allow admins to access any user data while maintaining security for self-access
- ✅ **Data export consistency** *(2025-06-28)* - Unified admin and test user export formats to use identical structure
- ✅ **Function hoisting error** *(2025-06-28)* - Fixed "Cannot access before initialization" error by moving helper functions before usage
- ✅ **Step number calculation** *(2025-06-28)* - Created proper mapping from AST step IDs to sequential positions (1-1=1, 2-1=2, ..., 4-1=10)
- ✅ **Admin role detection** *(2025-06-28)* - Fixed permission check to use session.userRole instead of session.role
- ✅ **Workshop step count accuracy** *(2025-06-28)* - Corrected AST workshop to show 14 steps instead of 19 (removed non-workshop steps from count)

---

## 📝 Implementation Notes

### **Youth Participant Implementation Notes** *(June 2025)*
- **Database Schema**: 'student' role implemented with UserRoles constant and UserRole type for type safety
- **Assessment Architecture**: Role-based loading system allows different question sets while maintaining identical interface and scoring
- **Question Structure**: Youth scenarios follow same 4-category mapping (thinking/acting/feeling/planning) as professional assessment
- **Testing Limitation**: Full student flow testing requires admin invite creation UI to generate student invite codes
- **Future Expansion**: Assessment variation framework established for additional user types or question sets

### **Development Workflow Improvements Identified** *(June 2025)*
- **Claude System Instructions Enhancement**: Need project-aware instructions that include workshop separation rules, error prevention patterns, and Heliotrope-specific constraints to eliminate architecture re-explanation in each session
- **Documentation Structure Optimization**: Current docs have overlapping information across three files - could benefit from hierarchy with quick-reference sheet for common operations
- **Workflow Decision Framework**: Three hats analysis revealed need for better error prevention (Black Hat), workflow optimization (Yellow Hat), and creative development approaches (Green Hat)
- **Automatic Workshop Identification**: Claude should verify AST vs IA context before making any changes to prevent cross-workshop contamination
- **Built-in Quality Assurance**: System instructions should include verification steps and success criteria for each type of change

### **Development Patterns Established**
- Use precision prompts for complex multi-file changes
- Claude direct editing for simple 1-2 file modifications
- Always test both admin and test user workflows when making changes
- Maintain separation between AST and IA workshop logic
- Enhanced Claude instructions should include automatic workshop identification and verification steps
- **Logo troubleshooting pattern**: Route detection → Component prop flow → Logo component type → Console debugging → Systematic fix
- **Routing architecture**: Separate page components for workshops (/imaginal-agility → imaginal-agility.tsx, /allstarteams → allstarteams.tsx)

### **Database Migration Implementation Notes** *(July 2025)*
- **Current Setup**: Neon PostgreSQL (AWS-based, serverless, usage-based pricing)
- **Target Setup**: AWS Lightsail Managed Database (predictable costs, same datacenter as container)
- **Migration Process**: pg_dump export → Lightsail import → connection string update → thorough testing
- **Cost Analysis**: Lightsail $15-60/month vs Neon usage-based (need to evaluate current costs)
- **Benefits**: Infrastructure consolidation, predictable costs, lower latency, more database control
- **Considerations**: Migration complexity, potential downtime, current Neon setup already working well
- **Recommendation**: Evaluate current Neon costs first, plan migration during low-usage period

### **Architecture Decisions**
- Test users use admin export endpoint with self-access permissions (session.userRole === 'admin' OR sessionUserId === requestedUserId)
- Workshop step IDs map to sequential numbers for display (4-1 → step 10 of 14) using astStepOrder lookup table
- Navigation progress stored separately for AST and IA workshops in navigationProgress.ast and navigationProgress.ia objects
- Shared components use `isImaginalAgility` prop for workshop differentiation
- AST workshop has 14 actual steps (1-1 through 4-5), not 19 as originally implemented
- Helper functions must be defined before useMemo hooks that reference them to avoid hoisting errors
- **Logo component architecture**: Centralized Logo.tsx component handles all three logo types (allstarteams, imaginal-agility, heliotrope) with proper Vite asset bundling
- **Workshop routing separation**: Each workshop has dedicated page component that sets correct currentApp state for proper logo detection
- **Logo sizing approach**: Width-based responsive sizing (w-48 h-auto) instead of height-based to accommodate different aspect ratios
- **Student assessment architecture**: Same assessment interface and scoring system with role-based question loading for seamless user experience

### **Testing Checklist Template**
When implementing new features, test:
- [ ] Admin user functionality
- [ ] Test user functionality  
- [ ] AST workshop behavior
- [ ] IA workshop behavior
- [ ] Mobile responsiveness
- [ ] Data export/import consistency
- [ ] Student user role functionality (when invite creation UI complete)

---

## 🔄 Recurring Development Tasks

### **Regular Maintenance**
- Review and update this backlog monthly
- Check for security updates in dependencies
- Monitor user feedback for new feature requests
- Performance review and optimization

### **Before Major Releases**
- Full regression testing across all user types
- Data export/import validation
- Mobile device testing
- Documentation updates

---

**Last Updated:** June 29, 2025  
**Next Review:** July 29, 2025
## Database Infrastructure - COMPLETED (July 12, 2025)

### ✅ Achievements This Session:
- **Development Database**: AWS Lightsail PostgreSQL configured and working
- **Schema Import**: All 21 production tables replicated to development database  
- **Environment Configuration**: dotenv, SSL settings, session store configured
- **Admin User**: Created admin/Heliotrope@2025 with successful login
- **Database Isolation**: Complete separation - zero production risk during development
- **Documentation**: Dual environment workflow strategy created

### 🔧 Technical Implementation:
- Database URL: AWS Lightsail PostgreSQL with SSL bypass for development
- Session Store: Modified to use SESSION_DATABASE_URL for compatibility
- Admin Creation: create-admin.ts script working with environment variables

### 📊 Current Status:
- Local development: Running on development database (port 5001)
- Production: Still on Neon PostgreSQL  
- Next: Implement dual-environment workflow with feature flags

