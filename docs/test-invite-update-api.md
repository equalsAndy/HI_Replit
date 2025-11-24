# Testing Invite Update API Endpoint

## Endpoint Details

**URL:** `PATCH /api/invites/:id`
**Authentication:** Required (facilitator or admin)
**Purpose:** Update workshop access settings for pending (unused) invites

## Database Verification ✅

The columns exist in the database with correct defaults:

```
Column                  | Type    | Default
------------------------|---------|--------
ast_access             | boolean | true
ia_access              | boolean | false
show_demo_data_buttons | boolean | false
```

## Test Data Available

Pending invite IDs for testing:
- ID 135: gianluca.gambatesa+test5@gmail.com (ast_access=t, ia_access=f, show_demo=f)
- ID 134: julian.daher@ocsb.ca (ast_access=t, ia_access=f, show_demo=f)
- ID 133: sean.whately@ocsb.ca (ast_access=t, ia_access=f, show_demo=f)

## Manual Testing Steps

### 1. Login as Admin/Facilitator

Navigate to the admin panel and login with appropriate credentials.

### 2. Test via Browser Console

Open browser DevTools console on the invite management page:

```javascript
// Test updating invite ID 135 to grant IA access
fetch('/api/invites/135', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    astAccess: true,
    iaAccess: true,  // Enable IA
    showDemoDataButtons: false
  })
})
.then(r => r.json())
.then(data => console.log('Update result:', data))
.catch(err => console.error('Update error:', err));
```

### 3. Verify Database Update

```sql
SELECT id, email, ast_access, ia_access, show_demo_data_buttons
FROM invites
WHERE id = 135;
```

Expected result after update:
- `ast_access`: true
- `ia_access`: true (changed from false)
- `show_demo_data_buttons`: false

### 4. Test Error Cases

**Test 1: Update already-used invite (should fail)**
```javascript
// First, mark an invite as used in the database
// Then try to update it - should return error
fetch('/api/invites/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ iaAccess: true })
})
.then(r => r.json())
.then(data => console.log('Should fail:', data));
```

Expected: `{ success: false, error: "Cannot update an invite that has already been used" }`

**Test 2: Update non-existent invite**
```javascript
fetch('/api/invites/999999', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ iaAccess: true })
})
.then(r => r.json())
.then(data => console.log('Should fail:', data));
```

Expected: `{ success: false, error: "Invite not found" }`

**Test 3: No fields to update**
```javascript
fetch('/api/invites/135', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => console.log('Should fail:', data));
```

Expected: `{ success: false, error: "No fields to update" }`

## Using cURL (Alternative)

If you have a session cookie, you can test with cURL:

```bash
# Get session cookie from browser DevTools > Application > Cookies
SESSION_COOKIE="your-session-cookie-here"

# Test update
curl -X PATCH http://localhost:8080/api/invites/135 \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d '{
    "astAccess": true,
    "iaAccess": true,
    "showDemoDataButtons": true
  }'
```

## Expected Response Format

**Success:**
```json
{
  "success": true,
  "invite": {
    "id": 135,
    "email": "gianluca.gambatesa+test5@gmail.com",
    "ast_access": true,
    "ia_access": true,
    "show_demo_data_buttons": true,
    "role": "participant",
    "invite_code": "NR22P867Z92M",
    ...
  }
}
```

**Failure:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## UI Testing Checklist

Once you add an "Edit" button to the InviteManagement table:

1. ✅ Click "Edit" on a pending invite
2. ✅ Modal/dialog opens with current values pre-filled
3. ✅ Toggle workshop access checkboxes
4. ✅ Save changes
5. ✅ Table updates to show new values
6. ✅ Database reflects changes
7. ✅ Try editing a used invite - should show error or disable edit button

## Frontend Integration

The InviteManagement component now displays workshop access columns. To add edit functionality:

1. Add "Edit" button in Actions column for pending invites
2. Create edit modal/dialog with checkboxes
3. Call PATCH endpoint on save
4. Refresh invites list after successful update

## Troubleshooting

### Error: "Cannot update an invite that has already been used"
- This is expected behavior - only pending invites can be updated
- Check `used_at IS NULL` in the database

### Error: "Invite not found"
- Verify the invite ID exists in the database
- Check you're using the correct ID from the invites table

### Error: "No fields to update"
- Ensure you're sending at least one field in the request body
- Check that field names match: `astAccess`, `iaAccess`, `showDemoDataButtons`

### 403 Forbidden
- Ensure you're logged in as admin or facilitator
- Facilitators can only update participant/student roles

### Database column errors
- Verify columns exist: `SELECT * FROM invites LIMIT 1;`
- If missing, run migration: `server/migrations/add-workshop-access-to-invites.sql`
