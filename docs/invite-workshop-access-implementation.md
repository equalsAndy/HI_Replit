# Invite Workshop Access Control Implementation

**Date:** 2025-01-24
**Status:** ✅ Backend Complete, Frontend Pending

## Overview

Added workshop-specific access control columns to the `invites` table, allowing admins and facilitators to grant or restrict access to AST (AllStarTeams) and IA (Imaginal Agility) workshops at the invite level.

## Changes Made

### 1. Database Migration ✅

**File:** `server/migrations/add-workshop-access-to-invites.sql`

Added three new columns to the `invites` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `ast_access` | BOOLEAN | `true` | Grants access to AllStarTeams workshop |
| `ia_access` | BOOLEAN | `false` | Grants access to Imaginal Agility workshop |
| `show_demo_data_buttons` | BOOLEAN | `false` | Shows demo data buttons for testing |

**Migration Status:** ✅ Applied to development database

```bash
# To verify:
DATABASE_URL="postgresql://..." psql "$DATABASE_URL" -c "
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'invites'
AND column_name IN ('ast_access', 'ia_access', 'show_demo_data_buttons');"
```

### 2. Backend API ✅

#### Invite Service Updates

**File:** `server/services/invite-service.ts`

- ✅ `createInviteWithAssignment()` - Already handles workshop access fields (lines 48-61)
- ✅ `createInvite()` - Already handles workshop access fields (lines 137-150)
- ✅ **NEW:** `updateInvite()` - Added method to update pending invites (lines 443-546)

**Update Method Features:**
- Validates invite exists and is not already used
- Allows updating all invite fields including workshop access
- Dynamic SQL generation for flexible updates
- Returns updated invite data

#### API Routes

**File:** `server/routes/invite-routes.ts`

**Existing Routes:**
- ✅ `POST /api/invites` - Create invite (lines 14-56)
  - Already accepts `astAccess`, `iaAccess`, `showDemoDataButtons`
  - Defaults: `astAccess: true`, `iaAccess: true`, `showDemoDataButtons: false`

**New Routes:**
- ✅ `PATCH /api/invites/:id` - Update pending invite (lines 181-241)
  - Accessible to admins and facilitators
  - Prevents updating already-used invites
  - Facilitators restricted to participant/student roles only

**Example Update Request:**
```bash
curl -X PATCH http://localhost:8080/api/invites/123 \
  -H "Content-Type: application/json" \
  -d '{
    "astAccess": true,
    "iaAccess": true,
    "showDemoDataButtons": false,
    "name": "John Doe",
    "role": "participant"
  }'
```

### 3. Frontend Updates ⚠️ PENDING

The following frontend components need to be updated:

#### InviteManagement Component
**File:** `client/src/components/admin/InviteManagement.tsx` (863 lines)

**Required Changes:**

1. **Add fields to Invite interface** (around line 57):
```typescript
interface Invite {
  // ... existing fields ...
  ast_access?: boolean;
  ia_access?: boolean;
  show_demo_data_buttons?: boolean;
  astAccess?: boolean;  // camelCase alias
  iaAccess?: boolean;   // camelCase alias
  showDemoDataButtons?: boolean; // camelCase alias
}
```

2. **Add state for new invite form** (find existing state declarations):
```typescript
const [astAccess, setAstAccess] = useState(true);
const [iaAccess, setIaAccess] = useState(false);
const [showDemoDataButtons, setShowDemoDataButtons] = useState(false);
```

3. **Add checkboxes to create invite form** (find the form section):
```tsx
<div className="space-y-4">
  <div className="flex items-center space-x-2">
    <Checkbox
      id="astAccess"
      checked={astAccess}
      onCheckedChange={(checked) => setAstAccess(checked as boolean)}
    />
    <Label htmlFor="astAccess">AST (AllStarTeams) Access</Label>
  </div>

  <div className="flex items-center space-x-2">
    <Checkbox
      id="iaAccess"
      checked={iaAccess}
      onCheckedChange={(checked) => setIaAccess(checked as boolean)}
    />
    <Label htmlFor="iaAccess">IA (Imaginal Agility) Access</Label>
  </div>

  <div className="flex items-center space-x-2">
    <Checkbox
      id="showDemoDataButtons"
      checked={showDemoDataButtons}
      onCheckedChange={(checked) => setShowDemoDataButtons(checked as boolean)}
    />
    <Label htmlFor="showDemoDataButtons">Show Demo Data Buttons</Label>
  </div>
</div>
```

4. **Update createInvite function** (find the fetch call):
```typescript
const response = await fetch('/api/invites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email,
    role,
    name,
    expiresAt,
    cohortId,
    organizationId,
    isBetaTester,
    astAccess,          // Add this
    iaAccess,           // Add this
    showDemoDataButtons // Add this
  })
});
```

5. **Add columns to invites table** (find TableHeader section):
```tsx
<TableHead>AST</TableHead>
<TableHead>IA</TableHead>
<TableHead>Demo</TableHead>
```

6. **Add cells to table rows** (find TableBody section):
```tsx
<TableCell>
  {invite.ast_access || invite.astAccess ?
    <Badge variant="success">✓</Badge> :
    <Badge variant="secondary">✗</Badge>
  }
</TableCell>
<TableCell>
  {invite.ia_access || invite.iaAccess ?
    <Badge variant="success">✓</Badge> :
    <Badge variant="secondary">✗</Badge>
  }
</TableCell>
<TableCell>
  {invite.show_demo_data_buttons || invite.showDemoDataButtons ?
    <Badge variant="warning">Demo</Badge> :
    <span className="text-gray-400">-</span>
  }
</TableCell>
```

7. **Add edit functionality** (create new modal/dialog):
```tsx
const [editingInvite, setEditingInvite] = useState<Invite | null>(null);
const [editAstAccess, setEditAstAccess] = useState(false);
const [editIaAccess, setEditIaAccess] = useState(false);
const [editShowDemo, setEditShowDemo] = useState(false);

const handleEditInvite = (invite: Invite) => {
  setEditingInvite(invite);
  setEditAstAccess(invite.ast_access || invite.astAccess || false);
  setEditIaAccess(invite.ia_access || invite.iaAccess || false);
  setEditShowDemo(invite.show_demo_data_buttons || invite.showDemoDataButtons || false);
};

const handleSaveEdit = async () => {
  if (!editingInvite) return;

  const response = await fetch(`/api/invites/${editingInvite.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      astAccess: editAstAccess,
      iaAccess: editIaAccess,
      showDemoDataButtons: editShowDemo
    })
  });

  if (response.ok) {
    toast({ title: 'Invite updated successfully' });
    loadInvites(); // Refresh the list
    setEditingInvite(null);
  }
};
```

#### Registration Flow Updates
**File:** `client/src/pages/invite-registration.tsx`

**Required Changes:**

1. **Fetch and store invite permissions during registration**
2. **Pass permissions to user creation endpoint**
3. **Update user record with workshop access settings**

**Note:** The registration flow may need updates to the user signup endpoint to accept and store these permissions on the user record.

### 4. User Registration Flow ⚠️ TODO

The user registration process needs to copy invite permissions to the user record. This may require:

1. Adding similar columns to the `users` table (or using existing access control)
2. Updating the signup/registration endpoint to copy permissions from invite
3. Checking workshop access in route guards

**Recommended Next Steps:**

1. Check if `users` table already has workshop access columns
2. If not, create a similar migration for the `users` table
3. Update the registration endpoint to copy permissions
4. Update route guards to check user workshop access

## Testing

### Manual Testing Steps

1. **Create Invite with Workshop Access:**
```bash
curl -X POST http://localhost:8080/api/invites \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "email": "test@example.com",
    "role": "participant",
    "name": "Test User",
    "astAccess": true,
    "iaAccess": false,
    "showDemoDataButtons": true
  }'
```

2. **Update Pending Invite:**
```bash
curl -X PATCH http://localhost:8080/api/invites/123 \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "astAccess": false,
    "iaAccess": true
  }'
```

3. **Query Database:**
```sql
SELECT
  invite_code,
  email,
  ast_access,
  ia_access,
  show_demo_data_buttons
FROM invites
WHERE used_at IS NULL
ORDER BY created_at DESC
LIMIT 5;
```

## File Changes Summary

| File | Status | Lines Changed |
|------|--------|---------------|
| `server/migrations/add-workshop-access-to-invites.sql` | ✅ Created | +17 |
| `server/services/invite-service.ts` | ✅ Updated | +107 |
| `server/routes/invite-routes.ts` | ✅ Updated | +65 |
| `client/src/components/admin/InviteManagement.tsx` | ⚠️ Pending | TBD |
| `client/src/pages/invite-registration.tsx` | ⚠️ Pending | TBD |
| User access control implementation | ⚠️ TODO | TBD |

## Next Actions

1. ✅ Database schema updated
2. ✅ Backend API endpoints created
3. ⚠️ **TODO:** Update InviteManagement UI to show and edit workshop access
4. ⚠️ **TODO:** Update registration flow to copy invite permissions to user
5. ⚠️ **TODO:** Add workshop access checks to route guards
6. ⚠️ **TODO:** Test end-to-end flow

## Notes

- The backend API is fully functional and ready to use
- Default values: `ast_access=true`, `ia_access=false`, `show_demo_data_buttons=false`
- Only pending (unused) invites can be updated
- Facilitators can update invites but are restricted to participant/student roles
- Workshop access is enforced at the invite level, but needs to be copied to user records during registration

## Questions for Consideration

1. Should `users` table have corresponding workshop access columns?
2. Should workshop access be enforced at the route level or component level?
3. Should there be a way to bulk-update workshop access for existing invites?
4. Should there be audit logging for workshop access changes?
