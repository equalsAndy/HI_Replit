# Beta Feedback Viewing Guide

## Overview

The Heliotrope platform includes a comprehensive feedback system for beta testers. This guide explains how to view and manage beta feedback submissions through the admin interface and API endpoints.

## Admin Access Requirements

**Admin Credentials:**
- Username: `admin`
- Password: `Heliotrope@2025`

**Required Role:** Admin role is required to access all feedback viewing endpoints.

## API Endpoints for Viewing Beta Feedback

### 1. Get Beta Tester Feedback Counts
**Endpoint:** `GET /api/feedback/beta-tester-counts`
**Purpose:** Shows all beta testers and their feedback submission counts
**Features:**
- Lists all users with `isBetaTester` or `isTestUser` flags
- Shows feedback count per user
- Includes total beta testers and total tickets

### 2. Get Feedback Statistics Overview
**Endpoint:** `GET /api/feedback/stats/overview`
**Purpose:** Comprehensive feedback analytics
**Data Includes:**
- Total feedback count
- Counts by status (new, read, in_progress, resolved, archived)
- Counts by workshop type (AST, IA)
- Counts by feedback type (bug, feature, content, general)
- Counts by priority (low, medium, high, blocker)
- Average experience rating
- Recent feedback count (last 7 days)

### 3. Get All Feedback List
**Endpoint:** `GET /api/feedback/list`
**Purpose:** Paginated, filterable list of all feedback
**Query Parameters:**
- `page=1` - Page number for pagination
- `limit=50` - Items per page (default 50)
- `status` - Filter by status (new, read, in_progress, resolved, archived)
- `workshopType` - Filter by workshop (ast, ia)
- `feedbackType` - Filter by type (bug, feature, content, general)
- `priority` - Filter by priority (low, medium, high, blocker)
- `search` - Search within message text
- `userId` - Filter by specific user ID

### 4. Get Individual Feedback Details
**Endpoint:** `GET /api/feedback/:id`
**Purpose:** Detailed view of specific feedback item
**Returns:** Complete feedback record with user information

### 5. Export Feedback to CSV
**Endpoint:** `POST /api/feedback/export/csv`
**Purpose:** Export filtered feedback data to CSV format
**Features:**
- Same filtering options as list endpoint
- Includes all fields for analysis
- Automatic filename with timestamp

## Feedback Data Fields

Each feedback submission contains:

### User Information
- User ID, name, email
- Beta tester status

### Context Information  
- Workshop type (AST or IA)
- Page context (current, other, general)
- Target page name
- Feedback type (bug, feature, content, general)
- Priority level (low, medium, high, blocker)

### Feedback Content
- Message text
- Experience rating (1-5 stars)
- System information (browser, OS, screen size)

### Administrative Fields
- Status (new, read, in_progress, resolved, archived)
- Tags (array)
- Admin notes
- Jira ticket ID (if created)
- Created/updated timestamps

## API Testing Commands

### Get Session Cookie
1. Login as admin at http://localhost:8080
2. Open browser dev tools → Application → Cookies
3. Copy the `connect.sid` cookie value
4. Use this value in the curl commands below

### Basic Commands

**Get Beta Tester Counts:**
```bash
curl -X GET http://localhost:8080/api/feedback/beta-tester-counts \
  -H 'Content-Type: application/json' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

**Get Feedback Statistics:**
```bash
curl -X GET http://localhost:8080/api/feedback/stats/overview \
  -H 'Content-Type: application/json' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

**Get All Feedback (First 10):**
```bash
curl -X GET 'http://localhost:8080/api/feedback/list?limit=10&page=1' \
  -H 'Content-Type: application/json' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

**Search Feedback:**
```bash
curl -X GET 'http://localhost:8080/api/feedback/list?search=beta' \
  -H 'Content-Type: application/json' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

**Export to CSV:**
```bash
curl -X POST http://localhost:8080/api/feedback/export/csv \
  -H 'Content-Type: application/json' \
  -d '{}' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE' \
  -o "beta-feedback-export-$(date +%Y%m%d).csv"
```

## Frontend Admin Interface

The system is designed to support an admin dashboard interface that would:

### Dashboard Overview
- Display beta tester counts
- Show feedback statistics with charts
- Highlight recent high-priority feedback
- Show average experience ratings

### Feedback Management
- Searchable and filterable feedback list
- Bulk operations (mark as read, update status)
- Individual feedback detail view
- Admin note taking and status updates
- Jira ticket creation integration

### Export and Reporting
- CSV export with custom filters
- Date range reporting
- User-specific feedback reports

## Database Access

### Direct Database Queries
For advanced analysis, you can query the feedback table directly:

**Local Development Database:**
```bash
psql heliotrope_dev -c "
SELECT 
  f.id,
  u.name as user_name,
  f.workshop_type,
  f.feedback_type,
  f.priority,
  f.experience_rating,
  f.message,
  f.created_at
FROM feedback f
LEFT JOIN users u ON f.user_id = u.id
WHERE u.is_beta_tester = true
ORDER BY f.created_at DESC
LIMIT 10;
"
```

**Production/Staging Database:**
```bash
  -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com \
  -U dbmasteruser -d postgres -c "
SELECT 
  f.id,
  u.name as user_name,
  f.workshop_type,
  f.feedback_type,
  f.priority,
  f.experience_rating,
  f.message,
  f.created_at
FROM feedback f
LEFT JOIN users u ON f.user_id = u.id
WHERE u.is_beta_tester = true
ORDER BY f.created_at DESC
LIMIT 10;
"
```

## Admin Management Actions

The API supports various admin actions:

### Update Feedback Status
```bash
curl -X PATCH http://localhost:8080/api/feedback/:id \
  -H 'Content-Type: application/json' \
  -d '{"status": "read", "adminNotes": "Reviewed by admin"}' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

### Bulk Mark as Read
```bash
curl -X PATCH http://localhost:8080/api/feedback/bulk/mark-read \
  -H 'Content-Type: application/json' \
  -d '{"feedbackIds": ["uuid1", "uuid2"]}' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

### Add Admin Notes
```bash
curl -X PATCH http://localhost:8080/api/feedback/:id \
  -H 'Content-Type: application/json' \
  -d '{"adminNotes": "Follow up required", "jiraTicketId": "KAN-123"}' \
  -b 'connect.sid=YOUR_ADMIN_SESSION_COOKIE'
```

## Security Considerations

- All feedback endpoints require admin authentication
- User PII is included in responses (handle securely)
- CSV exports contain sensitive information
- Admin session cookies should be kept secure
- Direct database access should be limited to development

## Integration with Jira

The system supports linking feedback to Jira tickets:
- `jiraTicketId` field for tracking
- Admin can update feedback with ticket references
- Supports workflow integration

---

**Last Updated:** 2025-08-08  
**Related Files:** 
- `server/routes/feedback-routes.ts`
- `shared/schema.ts` (feedback table definition)
- `tempClaudecomms/test-beta-feedback-viewing-2025-08-08.sh`
