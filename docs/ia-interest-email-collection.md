# IA Interest Email Collection Feature

## Overview
Added email collection functionality to AST step 5-3 (Introduction to Imaginal Agility) to capture interest from users who want to learn more about the full IA workshop.

## Changes Made

### 1. Database Migration
**File**: `server/migrations/add-ia-interest-collection.sql`

Created new table `ia_interest_emails` with the following structure:
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, references users table)
- `email` (VARCHAR(255), required)
- `email_type` (VARCHAR(20), either 'organization' or 'personal')
- `submitted_at` (TIMESTAMP, defaults to current timestamp)
- `workshop_completed` (BOOLEAN, defaults to false - for future tracking)
- `notes` (TEXT, for admin notes)

**Indexes**:
- Primary key on `id`
- Index on `user_id` for fast lookups
- Index on `submitted_at` for chronological queries
- Unique constraint on `(user_id, email)` to prevent duplicate submissions

**Migration Status**: ✅ Successfully applied to development database

### 2. API Routes
**File**: `server/routes/ia-interest-routes.ts`

Created two endpoints:

#### POST `/api/ia-interest/submit`
- Accepts email and emailType ('organization' or 'personal')
- Validates email format
- Prevents duplicate submissions
- Returns success/error response

#### GET `/api/ia-interest/check`
- Returns whether the current user has already submitted an email
- Used to check submission status

**Route Registration**: Added to `server/index.ts` at line 504

### 3. UI Component Updates
**File**: `client/src/components/content/allstarteams/IntroIAView.tsx`

**Removed**:
- "Ready to Explore?" amber-colored information section
- Standalone "Complete Step" button at bottom

**Added**:
- Email collection form with purple theme (matching IA branding)
- Email input field with validation
- Radio button group to select between "Work/Organization email" or "Personal email" (defaults to organization)
- Submit button with loading state (full width)
- Success message after submission

**User Flow**:
1. User watches video and reads content
2. User sees email collection form at bottom
3. User enters email address
4. User selects email type using radio buttons (defaults to "Work/Organization email")
5. User submits → Shows success message → Click "Complete Step"

### 4. Dependencies
- Uses native `fetch` API (no new dependencies)
- Integrates with existing authentication middleware
- Uses existing UI components (Card, Button, Input, Label, RadioGroup, RadioGroupItem)

## Testing

### Database Testing
```bash
# Verify table creation
psql "$DATABASE_URL" -c "\d ia_interest_emails"

# Check for test data (after manual testing)
psql "$DATABASE_URL" -c "SELECT * FROM ia_interest_emails;"
```

### Build Testing
```bash
npm run build  # ✅ Passed
```

### Manual Testing Checklist
- [ ] Navigate to AST step 5-3
- [ ] Verify "Ready to Explore?" section is removed
- [ ] Verify email form is visible with purple theme
- [ ] Verify radio buttons show "Work/Organization email" (default) and "Personal email"
- [ ] Enter email and submit with organization type selected
- [ ] Verify success message appears
- [ ] Verify "Complete Step" button appears after submission
- [ ] Check database for submitted record
- [ ] Try submitting same email again (should show error)
- [ ] Test selecting "Personal email" radio button
- [ ] Verify form validation (empty email should disable submit button)

## Data Access

### Query All Interest Emails
```sql
SELECT
  ie.id,
  ie.email,
  ie.email_type,
  ie.submitted_at,
  u.username,
  u.email as user_email
FROM ia_interest_emails ie
LEFT JOIN users u ON ie.user_id = u.id
ORDER BY ie.submitted_at DESC;
```

### Export for Outreach
```sql
SELECT
  email,
  email_type,
  submitted_at
FROM ia_interest_emails
WHERE workshop_completed = false
ORDER BY submitted_at DESC;
```

## Future Enhancements

1. **Admin Dashboard**: Add view to see all interested users
2. **Email Notifications**: Send automated follow-up emails
3. **Workshop Tracking**: Update `workshop_completed` flag when users complete IA workshop
4. **Analytics**: Track conversion rates from interest to workshop completion
5. **Export Function**: Add admin endpoint to export email list as CSV

## Security Considerations

- ✅ Email validation on both client and server
- ✅ Authentication required (user must be logged in)
- ✅ Duplicate prevention via unique constraint
- ✅ SQL injection protection via parameterized queries
- ✅ Basic rate limiting via unique constraint (one email per user)

## Workshop Separation Compliance

✅ **AST-specific**: This feature is only in AST workshop step 5-3
✅ **No cross-workshop contamination**: Table and routes are clearly IA-interest specific
✅ **Clear naming**: All components use "IA" or "Imaginal Agility" in names

## Files Changed

1. `server/migrations/add-ia-interest-collection.sql` (NEW)
2. `server/routes/ia-interest-routes.ts` (NEW)
3. `server/index.ts` (MODIFIED - added route import and registration)
4. `client/src/components/content/allstarteams/IntroIAView.tsx` (MODIFIED)
5. `docs/ia-interest-email-collection.md` (NEW - this file)

## Deployment Notes

When deploying to production:

1. Run migration:
   ```bash
   psql "$PRODUCTION_DATABASE_URL" -f server/migrations/add-ia-interest-collection.sql
   ```

2. Verify route is registered in production build

3. Test email submission in production environment

4. Monitor logs for any errors: Look for `📧 IA Interest submission` logs

## Support

For issues or questions:
- Check server logs for `📧 IA Interest` or `❌ Error submitting IA interest` messages
- Verify database connection and table existence
- Check browser console for client-side errors
