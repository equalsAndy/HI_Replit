# Feedback System Test Guide

## ✅ System Status
- **Server**: Running on http://localhost:8080
- **Database**: Feedback table created successfully
- **Feature Flag**: Enabled in development environment
- **API Endpoints**: Active and requiring authentication

## 🧪 Testing Steps

### 1. Access Workshop Pages
The feedback button (floating action button) should appear on:
- **AST Workshop**: http://localhost:8080/allstarteams  
- **IA Workshop**: http://localhost:8080/imaginal-agility

### 2. Test Feedback Submission
1. Click the floating feedback button (bottom-right corner)
2. The modal should match the design with:
   - Purple gradient header
   - Auto-detected workshop context
   - Emoji ratings
   - Color-coded priorities
   - System info auto-captured

### 3. Access Admin Dashboard
1. Login as admin: http://localhost:8080/login
   - Username: `admin`
   - Password: `Heliotrope@2025`
2. Navigate to: http://localhost:8080/admin
3. Click on "Feedback Management" tab (admin-only)

### 4. Verify Admin Features
- View submitted feedback
- Filter by status, workshop, type, priority
- Click "View Details" to see full feedback
- Update status, add admin notes, link Jira tickets

## 📝 Current Implementation Status

✅ **Phase 1 Complete**:
- Database schema with all fields
- Full API endpoints (submit, list, manage, stats)
- FeedbackModal matching UI design
- Auto-detection of workshop pages
- Admin dashboard integration
- Floating action buttons on workshops
- Feature flagged for dev environment

## 🔍 Troubleshooting

If feedback button doesn't appear:
1. Check browser console for errors
2. Verify you're in development environment
3. Ensure you're on a workshop page (AST or IA)

If submission fails:
1. Check network tab for API errors
2. Verify you're logged in
3. Check server logs: `tail -f /tmp/hi-server.log`

## 🛑 Stop Servers
To stop the development servers:
```bash
# Find and kill the server process
ps aux | grep "tsx server/index.ts" | grep -v grep
kill [PID]
```