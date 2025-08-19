# KAN-XXX: Admin Holistic Report Management and Failed Report Handling

## Project
KAN (Development)

## Issue Type
Story

## Priority
Medium

## Summary
Implement admin interface for holistic report management with failed report detection and regeneration capabilities

## Description

### Problem Statement
Currently, admins cannot see the status of holistic reports across users, and when reports fail (logged only in server logs), users see no indication of failure and view/download buttons remain active but non-functional.

### Current State
- Holistic reports have database status tracking (generating/completed/failed, error_message)
- Failed reports are only visible in server console logs
- Users have no indication when their report generation fails
- No admin interface exists for report management
- Failed reports cannot be easily regenerated

### Requirements

#### Admin Interface Requirements
1. **Report Status Dashboard**
   - View all users and their report generation status
   - Filter by status (completed/failed/generating)
   - Display error messages in user-friendly format
   - Show generation timestamps and user details

2. **Report Management Actions**
   - Regenerate failed reports for any user
   - View report details and error logs
   - Export report status data for analysis

#### User Experience Improvements
3. **Failed Report Handling**
   - Display friendly error message when report generation fails
   - Disable view/download buttons for failed reports
   - Show "Regenerate Report" option for failed reports
   - Clear status indicators (success/failed/generating states)

### Technical Implementation

#### Database Schema
- Existing `holistic_reports` table already supports status tracking
- Fields: `generation_status`, `error_message`, `generated_at`, `updated_at`

#### API Endpoints (New)
- `GET /api/reports/holistic/admin/list` - List all user reports with status
- `POST /api/reports/holistic/admin/regenerate/:userId/:reportType` - Admin regeneration
- `GET /api/reports/holistic/admin/status/:userId/:reportType` - Detailed status check

#### Components (New/Updated)
- **New**: `AdminReportManagement.tsx` - Main admin interface
- **Updated**: `HolisticReportView.tsx` - Enhanced status handling
- **Updated**: Admin dashboard integration

### User Stories

**As an admin**, I want to:
- See which users have failed report generation so I can help them
- Regenerate failed reports without requiring users to repeat the process
- Monitor overall system health for report generation
- Access error details to troubleshoot generation issues

**As a user**, I want to:
- Know immediately if my report generation failed
- Understand what went wrong in friendly language
- Have my report regenerated without losing my progress
- See clear status of my report (generating/completed/failed)

### Acceptance Criteria

#### Admin Interface
- [ ] Admin dashboard shows list of all users with report status
- [ ] Failed reports are clearly highlighted with error details
- [ ] Admin can regenerate any user's failed report with one click
- [ ] Status updates in real-time during regeneration
- [ ] Export functionality for report status data

#### User Experience  
- [ ] Failed reports show friendly error message instead of generic failure
- [ ] View/download buttons are disabled for failed reports
- [ ] Users can initiate report regeneration for failed reports
- [ ] Loading states clearly indicate report generation in progress
- [ ] Success states clearly show when reports are ready

#### Technical Requirements
- [ ] All new endpoints require admin authentication
- [ ] Error logging maintains detailed technical info for admins
- [ ] Report regeneration preserves user assessment data
- [ ] Status polling doesn't overwhelm the server
- [ ] Backward compatibility with existing report functionality

### Testing Requirements
- Unit tests for new API endpoints
- Integration tests for admin report management workflow  
- User acceptance testing for failed report scenarios
- Performance testing for status polling and large user lists

### Definition of Done
- [ ] Admin interface implemented and integrated
- [ ] User interface enhanced with proper error handling
- [ ] All API endpoints implemented with proper authentication
- [ ] Comprehensive testing completed
- [ ] Documentation updated
- [ ] Code reviewed and deployed to staging
- [ ] User acceptance testing completed

## Labels
- `admin-interface`
- `error-handling` 
- `holistic-reports`
- `user-experience`

## Components
- Server/API
- Client/Admin Interface
- Client/User Interface

## Assignee
Development Team

## Reporter
System Administrator

## Created
January 2025

---

**Technical Notes:**
- Leverage existing database schema and status tracking
- Maintain backward compatibility with current report generation flow  
- Consider rate limiting for admin regeneration actions
- Implement proper audit logging for admin actions on user reports