# Beta Tester System - Manual Testing Instructions

## Overview
Both critical fixes have been deployed and verified:
- ✅ **Authentication Fix**: Admin users can now access beta tester endpoints  
- ✅ **Context Update Fix**: Real-time context updates when navigating between steps

## Testing Procedure

### Phase 1: Authentication Fix Test
**Goal**: Verify admin users can save notes without 403 errors

1. Open browser to: http://localhost:8080
2. Login as admin:
   - Username: `admin`
   - Password: `Heliotrope@2025`
3. Navigate to AST workshop → step 2-2 (Star Strengths Self-Assessment)
4. Click the purple FAB (floating action button) in bottom-right corner
5. Fill out note form:
   - Note Type: `General Note` (default)
   - Content: `Testing authentication fix - admin user access`
6. Click "Save Note"
7. **Expected Result**: Success message appears (no 403 error in console)

### Phase 2: Context Update Fix Test  
**Goal**: Verify context updates automatically when navigating between steps

1. Navigate to step 2-2 (Star Strengths Self-Assessment)
2. Click FAB to open modal
3. Note the current context display:
   - Should show: `Step: 2-2 (Star Strengths Self-Assessment)`
4. **Without closing the modal**: Navigate to step 2-4 (Strength Reflection)
   - Use navigation menu or URL bar
5. Context should automatically update to show:
   - `Step: 2-4 (Strength Reflection)`
6. Check browser console (F12) for these logs:
   - `🔄 URL changed, forcing context update`
   - `🔄 Updating context for step: 2-4 URL: /workshop/ast/2-4`

### Phase 3: Full System Test
Test the complete note-taking workflow:

1. Navigate through multiple steps with modal open:
   - 2-4: Strength Reflection
   - 3-2: Flow Assessment  
   - 4-1: Ladder of Well-being
2. For each step verify:
   - Context updates automatically
   - Step ID and title are correct
   - Question context captures relevant content
3. Create notes with different types:
   - Bug Report
   - General Note  
   - Improvement suggestion
4. Test "not relevant" context control
5. Save notes successfully

## Success Criteria

### ✅ Authentication Fix Success:
- Admin users can save notes without 403 errors
- FAB is visible for admin users
- All API endpoints accept admin role

### ✅ Context Update Fix Success:
- Context updates immediately when navigating (no page refresh needed)
- Console shows proper update logs
- Multiple navigation works smoothly

## Troubleshooting

### If 403 errors still occur:
- Check browser console for exact error message
- Verify admin session: check Network tab for session data
- Try fresh login session

### If context doesn't update:
- Check console for URL change logs
- Verify different navigation methods (menu vs URL bar)
- Try closing and reopening modal

## Expected Console Logs
When navigating with modal open, you should see:
```
🔄 URL changed, forcing context update
🔄 Updating context for step: [step-id] URL: [url-path]
🔍 detectCurrentPage called with: {currentStepId: [step-id], ...}
✅ Found step mapping for [step-id]
```

---
**Result**: Both authentication and context updating should work perfectly, providing a smooth beta testing experience.