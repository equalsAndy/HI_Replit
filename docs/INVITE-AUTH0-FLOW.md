# Invite System, Registration & Auth0 Integration Flow

## Overview

The Heliotrope Imaginal platform uses a comprehensive invite-based registration system integrated with Auth0 for authentication. This document explains the complete flow from invite creation through user authentication and profile setup.

## System Architecture

```
┌─────────────────┐
│ Admin/Facilitator│
│  Creates Invite  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Invite Code Generated & Stored     │
│  (invites table)                    │
│  - email, role, cohortId, orgId     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  User Receives Invite Email         │
│  Clicks Registration Link           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Auth0 Universal Login Page         │
│  (Signup or Login)                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Auth0 Callback Returns JWT Token   │
│  Contains: sub, email, name, roles  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Session Handler Processes Token    │
│  (auth0-routes.ts)                  │
│  - Decode JWT                       │
│  - Extract user info                │
│  - Check if user exists in DB       │
└────────┬────────────────────────────┘
         │
         ├─── User Exists ──────────────┐
         │                              │
         ├─── User Doesn't Exist ───┐   │
         │                          │   │
         ▼                          ▼   ▼
┌──────────────────┐      ┌─────────────────────┐
│  Create New User │      │  Load Existing User │
│  in Database     │      │  Update lastLoginAt │
│  (users table)   │      └──────────┬──────────┘
└────────┬─────────┘                 │
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │  Create Session     │
         │  - userId           │
         │  - userRole         │
         │  - user object      │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Redirect to App    │
         │  User Authenticated │
         └─────────────────────┘
```

## 1. Invite Creation

### Invite Table Schema

```typescript
invites {
  id: serial (primary key)
  inviteCode: varchar(12) (unique, auto-generated)
  email: varchar(255) (required)
  role: varchar(20) (default: 'participant')
  name: text (optional)
  createdBy: integer (required, references users.id)
  createdAt: timestamp (auto)
  expiresAt: timestamp (optional)
  usedAt: timestamp (set when invite is used)
  usedBy: integer (references users.id when used)
  cohortId: integer (optional, for cohort assignment)
  organizationId: varchar(255) (optional, for org assignment)
  isBetaTester: boolean (default: false)
}
```

### Invite Creation Endpoint

**Endpoint**: `POST /api/invites`
**Authentication**: Requires `requireAuth` middleware
**Permissions**:
- Admins can create any role
- Facilitators can only create participant/student invites

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "participant",
  "cohortId": 5,
  "organizationId": "acme-corp",
  "isBetaTester": false
}
```

**Process**:
1. Validate user has permission to create invite
2. Generate unique 12-character invite code
3. Store invite in database with creator's ID
4. Return invite object with invite code

**Key Code** ([server/routes/invite-routes.ts](server/routes/invite-routes.ts)):
```typescript
router.post('/', requireAuth, async (req, res) => {
  const { email, role, name, cohortId, organizationId, isBetaTester } = req.body;
  const createdBy = req.session.userId;
  const userRole = req.session.userRole;

  // Permission check
  if (userRole === 'facilitator' && !['participant', 'student'].includes(role)) {
    return res.status(403).json({
      error: 'Facilitators can only create participant or student invites'
    });
  }

  // Generate unique invite code
  const inviteCode = generateInviteCode();

  // Store in database
  const result = await pool.query(`
    INSERT INTO invites (
      invite_code, email, role, name, created_by,
      cohort_id, organization_id, is_beta_tester
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [inviteCode, email, role, name, createdBy, cohortId, organizationId, isBetaTester]);
});
```

## 2. Invite Code Validation

### Validation Endpoint

**Endpoint**: `GET /api/invites/validate/:code`
**Authentication**: Not required (public endpoint for registration)

**Process**:
1. Look up invite code in database
2. Check if code exists and hasn't been used
3. Check if code hasn't expired
4. Return invite details or error

**Response**:
```json
{
  "valid": true,
  "invite": {
    "email": "user@example.com",
    "role": "participant",
    "name": "John Doe",
    "cohortId": 5,
    "organizationId": "acme-corp"
  }
}
```

## 3. Auth0 Authentication Flow

### Auth0 Configuration

**Environment Variables**:
- `AUTH0_DOMAIN`: Auth0 tenant domain
- `AUTH0_CLIENT_ID`: Application client ID
- `AUTH0_CLIENT_SECRET`: Application client secret
- `VITE_AUTH0_CLIENT_ID`: Client-side client ID
- `VITE_AUTH0_DOMAIN`: Client-side domain

### Authentication Process

1. **User Clicks Registration/Login Link**
   - Redirected to Auth0 Universal Login page
   - User creates account or logs in with existing credentials

2. **Auth0 Callback** (`/api/auth/callback`)
   - Auth0 redirects back with authorization code
   - Server exchanges code for JWT tokens (ID token + Access token)

3. **JWT Token Decoding**
   - Extract user information from ID token claims
   - Standard claims: `sub`, `email`, `name`
   - Custom claims: `https://schemas.auth0.com/email`, `https://schemas.auth0.com/roles`

### Key Code ([server/routes/auth0-routes.ts](server/routes/auth0-routes.ts)):

```typescript
async function handleAuth0Session(req, res) {
  const { id_token: idToken } = req.query;

  // Decode JWT token
  const decoded = jwt.decode(idToken);

  // Extract email from standard or custom claims
  const email = decoded?.email || decoded?.['https://schemas.auth0.com/email'];
  const auth0Sub = decoded.sub;
  const name = decoded.name || email?.split('@')[0];

  // Check if user exists in our database
  let user = email ? await findUserByEmail(email) : null;

  if (!user) {
    // Create new user (see section 4)
    const createResult = await userManagementService.createUser({...});
    user = createResult.user;
  } else {
    // Update last login time
    await pool.query(`
      UPDATE users
      SET last_login_at = NOW(), auth0_sub = $1
      WHERE id = $2
    `, [auth0Sub, user.id]);
  }

  // Create session
  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    // ... other fields
  };

  // Save session and redirect
  req.session.save(() => {
    res.redirect('/workshop/ast/welcome');
  });
}
```

## 4. User Profile Creation

### User Table Schema

```typescript
users {
  // Core Identity
  id: serial (primary key)
  username: varchar(100) (unique, required)
  password: varchar(255) (required, hashed for local auth)
  name: varchar(255) (required)
  email: varchar(255) (unique, required)

  // Role & Access
  role: varchar(20) (default: 'participant')
  astAccess: boolean (default: true)
  iaAccess: boolean (default: true)
  contentAccess: jsonb (default: {})
  isBetaTester: boolean (default: false)

  // Profile Information
  organization: text (from invite or Auth0)
  jobTitle: text
  profilePicture: text (URL)
  profilePictureId: integer (references photo_storage)

  // Workshop Progress
  astWorkshopCompleted: boolean (default: false)
  iaWorkshopCompleted: boolean (default: false)
  completedSteps: jsonb (default: [])
  currentStep: varchar(10)

  // Relationships
  cohortId: integer (from invite)
  teamId: integer (optional)
  invitedBy: integer (references users.id)
  assignedFacilitatorId: integer (references users.id)

  // Auth0 Integration
  auth0Sub: varchar(255) (Auth0 user ID)
  lastLoginAt: timestamp

  // Timestamps
  createdAt: timestamp (auto)
  updatedAt: timestamp (auto)

  // Additional Fields
  bio: text
  strengths: text[]
  interests: text[]
  pronouns: varchar(50)
  timezone: varchar(100)
  // ... many more workshop-specific fields
}
```

### Profile Field Population from Auth0

When a new user is created from Auth0 authentication, the following fields are populated:

**From Auth0 JWT Token**:
- `email`: From `email` or `https://schemas.auth0.com/email` claim
- `name`: From `name` claim or derived from email
- `username`: Set to email or Auth0 sub ID
- `auth0Sub`: From `sub` claim (Auth0 user ID)
- `lastLoginAt`: Set to current timestamp

**From Invite Record** (if invite code was used):
- `role`: From invite.role
- `cohortId`: From invite.cohortId
- `organization`: From invite.organizationId
- `isBetaTester`: From invite.isBetaTester
- `invitedBy`: From invite.createdBy

**Role Assignment Logic**:

1. **Check Auth0 Roles** (highest priority):
   ```typescript
   const auth0Roles = decoded?.['https://schemas.auth0.com/roles'] || [];
   if (auth0Roles.includes('admin')) {
     userRole = 'admin';
   }
   ```

2. **Check Email Domain** (for admin detection):
   ```typescript
   if (email?.endsWith('@heliotropeimaginal.com')) {
     userRole = 'admin';
   }
   ```

3. **Use Invite Role** (if provided):
   ```typescript
   if (inviteRecord?.role) {
     userRole = inviteRecord.role;
   }
   ```

4. **Default to Participant**:
   ```typescript
   userRole = userRole || 'participant';
   ```

**Default Values**:
- `password`: Generated random string (not used for Auth0 users)
- `astAccess`: `true`
- `iaAccess`: `true`
- `contentAccess`: `{}`
- `astWorkshopCompleted`: `false`
- `iaWorkshopCompleted`: `false`
- `completedSteps`: `[]`

### User Creation Code

**Key Code** ([server/routes/auth0-routes.ts](server/routes/auth0-routes.ts)):

```typescript
// Determine role for new Auth0 user
let userRole = 'participant';

// Check Auth0 roles metadata
const auth0Roles = decoded?.['https://schemas.auth0.com/roles'] || [];
if (auth0Roles.includes('admin')) {
  userRole = 'admin';
}

// Check email domain for admin
if (email?.endsWith('@heliotropeimaginal.com')) {
  userRole = 'admin';
}

// Create user with Auth0 info
const createResult = await userManagementService.createUser({
  email: email || `${decoded.sub}@placeholder.local`,
  name: decoded.name || email?.split('@')[0] || 'User',
  username: email || decoded.sub,
  password: `auth0-generated-${Math.random().toString(36).substring(2)}`,
  role: userRole,
  auth0Sub: decoded.sub,
  lastLoginAt: new Date(),
  organization: '', // Can be set from invite or updated later
  jobTitle: ''      // Can be updated by user
});
```

## 5. Session Management

### Session Storage

Sessions are stored using `express-session` with the following structure:

```typescript
req.session = {
  userId: number,
  userRole: string,
  user: {
    id: number,
    email: string,
    name: string,
    role: string,
    username: string,
    organization: string,
    cohortId: number,
    teamId: number,
    isBetaTester: boolean,
    astAccess: boolean,
    iaAccess: boolean,
    contentAccess: object,
    profilePicture: string,
    // ... other user fields
  }
}
```

### Session Lifecycle

1. **Session Creation**: After successful Auth0 authentication
2. **Session Validation**: `requireAuth` middleware checks `req.session.userId`
3. **Session Refresh**: User data refreshed on each request if needed
4. **Session Destruction**: On logout or session timeout

### Authentication Middleware

**Key Code** ([server/middleware/auth.ts](server/middleware/auth.ts)):

```typescript
export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

## 6. Complete Flow Example

### Scenario: New Participant Registration via Invite

**Step 1: Admin Creates Invite**
```bash
POST /api/invites
{
  "email": "sarah@acme.com",
  "name": "Sarah Johnson",
  "role": "participant",
  "cohortId": 12,
  "organizationId": "acme-corp"
}

Response: { inviteCode: "ABC123XYZ789" }
```

**Step 2: Sarah Receives Email with Invite Link**
```
https://app.heliotropeimaginal.com/register?code=ABC123XYZ789
```

**Step 3: Sarah Clicks Link → Validates Invite**
```bash
GET /api/invites/validate/ABC123XYZ789

Response: {
  "valid": true,
  "invite": {
    "email": "sarah@acme.com",
    "role": "participant",
    "cohortId": 12,
    "organizationId": "acme-corp"
  }
}
```

**Step 4: Sarah Redirected to Auth0 Universal Login**
- Creates Auth0 account with email sarah@acme.com
- Sets password and completes Auth0 signup

**Step 5: Auth0 Callback with JWT Token**
```
GET /api/auth/callback?code=...&state=...

Auth0 returns JWT token with:
{
  "sub": "auth0|507f1f77bcf86cd799439011",
  "email": "sarah@acme.com",
  "name": "Sarah Johnson",
  "https://schemas.auth0.com/roles": []
}
```

**Step 6: Session Handler Creates User**
```typescript
// Decode token
const email = "sarah@acme.com"
const auth0Sub = "auth0|507f1f77bcf86cd799439011"

// User doesn't exist, create new
await userManagementService.createUser({
  email: "sarah@acme.com",
  name: "Sarah Johnson",
  username: "sarah@acme.com",
  password: "auth0-generated-xyz",
  role: "participant",        // From invite
  auth0Sub: "auth0|507f1f77bcf86cd799439011",
  lastLoginAt: new Date(),
  organization: "acme-corp",  // From invite
  cohortId: 12,              // From invite
  invitedBy: 1,              // Admin who created invite
  astAccess: true,
  iaAccess: true
})
```

**Step 7: Mark Invite as Used**
```sql
UPDATE invites
SET used_at = NOW(), used_by = 47
WHERE invite_code = 'ABC123XYZ789'
```

**Step 8: Create Session**
```typescript
req.session.userId = 47
req.session.userRole = 'participant'
req.session.user = {
  id: 47,
  email: "sarah@acme.com",
  name: "Sarah Johnson",
  role: "participant",
  organization: "acme-corp",
  cohortId: 12,
  // ... other fields
}
```

**Step 9: Redirect to Workshop**
```
Redirect: /workshop/ast/welcome
Sarah is now authenticated and can start the workshop!
```

## 7. Direct Auth0 Login (Without Invite)

For users who login directly via Auth0 without an invite code:

1. **Auth0 Login** → User authenticates
2. **Email Lookup** → Check if user exists by email
3. **User Exists** → Load user, update `lastLoginAt`, create session
4. **User Doesn't Exist** → Create new user with:
   - Role determined by Auth0 metadata or email domain
   - Default values for cohort, organization (empty)
   - Default access permissions
5. **Session Created** → Redirect to workshop

**Role Assignment Priority** (without invite):
1. Auth0 roles metadata (`https://schemas.auth0.com/roles`)
2. Email domain (`@heliotropeimaginal.com` → admin)
3. Default to `participant`

## 8. Security Considerations

### Password Handling
- **Local Auth**: Passwords hashed with bcrypt before storage
- **Auth0 Users**: Password field populated with random string but never used (Auth0 handles authentication)

### Session Security
- Session secret stored in `SESSION_SECRET` environment variable
- Sessions expire after inactivity
- HTTPS required for production
- Secure cookie flags enabled

### Invite Security
- Invite codes are 12 characters, randomly generated
- Invites can have expiration dates
- Invites are single-use (marked as used when consumed)
- Role-based permissions for invite creation

### Auth0 Token Validation
- JWT tokens validated using Auth0 public keys
- Token expiration checked
- Claims verified against expected values

## 9. Troubleshooting

### User Can't Login
- **Check**: Does user exist in database?
- **Check**: Is `auth0Sub` field populated correctly?
- **Check**: Is session being created properly?
- **Check**: Are Auth0 credentials correct in `.env`?

### Invite Code Not Working
- **Check**: Has invite already been used? (`used_at` is not null)
- **Check**: Has invite expired? (`expires_at < NOW()`)
- **Check**: Does invite exist in database?

### Role Not Assigned Correctly
- **Check**: Auth0 roles metadata in JWT token
- **Check**: Email domain for admin detection
- **Check**: Invite record role value
- **Check**: User creation logs for role assignment

### Session Not Persisting
- **Check**: `SESSION_SECRET` environment variable set
- **Check**: Session store configuration
- **Check**: Cookie settings (secure, sameSite, domain)
- **Check**: CORS configuration for cross-origin requests

## 10. API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/invites` | POST | Required (admin/facilitator) | Create new invite |
| `/api/invites` | GET | Required (admin/facilitator) | List all invites |
| `/api/invites/validate/:code` | GET | Public | Validate invite code |
| `/api/invites/:id` | DELETE | Required (admin) | Delete invite |
| `/api/auth/callback` | GET | Public | Auth0 callback handler |
| `/api/auth/logout` | POST | Public | Logout and destroy session |
| `/api/auth/session` | GET | Public | Get current session info |

## 11. Database Relationships

```
invites.created_by → users.id (who created the invite)
invites.used_by → users.id (who used the invite)
invites.cohort_id → cohorts.id (cohort assignment)

users.invited_by → users.id (who invited this user)
users.cohort_id → cohorts.id (user's cohort)
users.team_id → teams.id (user's team)
users.assigned_facilitator_id → users.id (facilitator)
```

## 12. Environment Variables Reference

### Required for Auth0 Integration
```bash
# Server-side Auth0 config
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Client-side Auth0 config
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id

# Session management
SESSION_SECRET=your_very_secret_random_string

# Database
DATABASE_URL=postgresql://...

# Node environment
NODE_ENV=development|staging|production
```

---

**Last Updated**: January 2025
**Related Documentation**:
- [API Routes](API-ROUTES.md)
- [Deployment Guide](deployment/aws-lightsail-deployment-guide.md)
- [User Management](USER-MANAGEMENT.md)
