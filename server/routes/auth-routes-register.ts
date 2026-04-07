import express from 'express';
import { userManagementService } from '../services/user-management-service.js';
import { createAuth0DbUser, getAuth0UserByEmail } from '../src/auth0/management.js';
import { inviteService } from '../services/invite-service.js';
import { z } from 'zod';
import { validateInviteCode, normalizeInviteCode } from '../utils/invite-code.js';
import { UserRole } from '../../shared/schema.js';
import { provisionIfNeeded } from '../services/vault-client.js';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

/**
 * Validate an invite code
 */
router.post('/validate-invite', async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return res.status(400).json({
      success: false,
      error: 'Invite code is required'
    });
  }

  // Validate the format of the invite code
  if (!validateInviteCode(inviteCode)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid invite code format'
    });
  }

  try {
    // Normalize the invite code (remove hyphens, convert to uppercase)
    const normalizedCode = normalizeInviteCode(inviteCode);
    
    // Check if the invite code exists and is valid
    const result = await inviteService.getInviteByCode(normalizedCode);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invite code'
      });
    }

    // Check if the invite code has already been used
    if (result.invite?.usedAt) {
      return res.status(400).json({
        success: false,
        error: 'This invite code has already been used'
      });
    }

    // Return the invite details (excluding sensitive data)
    // Note: Drizzle returns snake_case field names from database
    const invite: any = result.invite;
    console.log('📋 Invite data from DB:', JSON.stringify(invite, null, 2));
    console.log('🔍 job_title field:', invite?.job_title);
    console.log('🔍 organization field:', invite?.organization);

    res.json({
      success: true,
      invite: {
        email: invite?.email,
        role: invite?.role,
        name: invite?.name,
        jobTitle: invite?.jobTitle || invite?.job_title,
        organization: invite?.organization,
        isBetaTester: invite?.isBetaTester || invite?.is_beta_tester || false
      }
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate invite code'
    });
  }
});

/**
 * Register a new user with an invite code
 */
router.post('/register', async (req, res) => {
  const registerSchema = z.object({
    inviteCode: z.string().min(12, 'Invite code is required'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address'),
    organization: z.string().optional().nullable(),
    jobTitle: z.string().optional().nullable(),
    profilePicture: z.string().optional().nullable()
  });

  try {
    const data = registerSchema.parse(req.body);
    
    // Prevent creating a duplicate user
    const existingUser = await userManagementService.getUserByEmail(data.email);
    if (existingUser.success) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }
    // Normalize the invite code
    const normalizedCode = normalizeInviteCode(data.inviteCode);
    
    // Verify the invite code
    const inviteResult = await inviteService.getInviteByCode(normalizedCode);
    
    if (!inviteResult.success || inviteResult.invite?.usedAt) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or already used invite code'
      });
    }
    

    
    // Check if the email matches the invite
    if (data.email.toLowerCase() !== inviteResult.invite?.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Email does not match the invite'
      });
    }
    
    // Create the user with invite creator tracking, workshop access, and demo permissions
    const inviteAstAccess = (inviteResult.invite as any)?.astAccess ?? (inviteResult.invite as any)?.ast_access;
    const inviteIaAccess = (inviteResult.invite as any)?.iaAccess ?? (inviteResult.invite as any)?.ia_access;
    const invitePmAccess = (inviteResult.invite as any)?.pmAccess ?? (inviteResult.invite as any)?.pm_access;
    const inviteShowDemo = (inviteResult.invite as any)?.showDemoDataButtons ?? (inviteResult.invite as any)?.show_demo_data_buttons;

    const createResult = await userManagementService.createUser({
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: inviteResult.invite.role as 'admin' | 'facilitator' | 'participant' | 'student',
      organization: data.organization,
      jobTitle: data.jobTitle,
      profilePicture: data.profilePicture,
      invitedBy: inviteResult.invite.createdBy,
      isBetaTester: inviteResult.invite.isBetaTester || (inviteResult.invite as any).is_beta_tester || false,
      astAccess: inviteAstAccess !== undefined ? !!inviteAstAccess : true,
      iaAccess: inviteIaAccess !== undefined ? !!inviteIaAccess : true,
      pmAccess: invitePmAccess !== undefined ? !!invitePmAccess : false,
      showDemoDataButtons: inviteShowDemo !== undefined ? !!inviteShowDemo : false
    });
    
    if (!createResult.success) {
      return res.status(400).json(createResult);
    }
    
    // Resolve Auth0 identity: check for existing account first (shared tenant),
    // then create only if none exists. This prevents duplicate Auth0 accounts when
    // a user already has a SelfActual identity on the shared Auth0 tenant.
    let auth0Sub: string | undefined;
    try {
      if (process.env.AUTH0_TENANT_DOMAIN || process.env.TENANT_DOMAIN) {
        // Check if Auth0 account already exists for this email
        const existingAuth0 = await getAuth0UserByEmail(data.email);
        if (existingAuth0?.user_id) {
          auth0Sub = existingAuth0.user_id;
          console.log(`🔐 Existing Auth0 account found for ${data.email}: ${auth0Sub}`);
        } else {
          // No Auth0 account — create one
          const created = await createAuth0DbUser({ email: data.email, password: data.password, name: `${data.firstName} ${data.lastName || ''}`.trim() });
          if (created?.user_id) {
            auth0Sub = created.user_id;
            console.log(`🔐 New Auth0 account created for ${data.email}: ${auth0Sub}`);
          }
        }
        // Link the auth0Sub to the local user record
        if (auth0Sub && createResult.user?.id) {
          await userManagementService.updateUser(createResult.user.id, { auth0Sub });
        }
      }
    } catch (auth0Err) {
      console.warn('⚠️ Auth0 provisioning failed (continuing with app user):', auth0Err instanceof Error ? auth0Err.message : String(auth0Err));
    }

    // Provision Solid Pod vault — checks for existing vault before provisioning
    if (createResult.user?.id) {
      const sub = auth0Sub || `app|${createResult.user.id}`;
      provisionIfNeeded(sub, createResult.user.id, `${data.firstName} ${data.lastName || ''}`.trim())
        .then(result => {
          if (result?.skipped) return;
          console.log('🔐 Vault provisioned for new user:', result?.status || 'sent');
        })
        .catch(err => console.error('���� Vault provisioning failed (non-blocking):', err.message));
    }

    // Mark the invite as used
    await inviteService.markInviteAsUsed(normalizedCode, createResult.user?.id as number);

    // If the invite is cohort-scoped, add the user to cohort_participants
    const inviteCohortId = inviteResult.invite?.cohortId;
    if (inviteCohortId && createResult.user?.id) {
      try {
        await db.execute(sql`
          INSERT INTO cohort_participants (cohort_id, participant_id, joined_at)
          VALUES (${inviteCohortId}, ${createResult.user.id}, NOW())
          ON CONFLICT DO NOTHING
        `);
        console.log(`✅ Added user ${createResult.user.id} to cohort ${inviteCohortId}`);
      } catch (cohortErr) {
        console.warn('⚠️ Failed to add user to cohort_participants (non-blocking):', cohortErr);
      }
    }

    // Set session data with proper error handling
    (req.session as any).userId = createResult.user?.id as number;
    (req.session as any).username = createResult.user?.username as string;
    (req.session as any).userRole = createResult.user?.role as any;
    
    // Force session save with comprehensive error handling
    req.session.save((err: unknown) => {
      if (err) {
        console.error('❌ Session save error during registration:', err);
        console.error('❌ Session data:', {
          userId: (req.session as any).userId,
          username: (req.session as any).username,
          userRole: (req.session as any).userRole
        });
        return res.status(500).json({
          success: false,
          error: 'Session creation failed',
          details: typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err)
        });
      }
      
      console.log('✅ Session saved successfully for new user:', createResult.user?.id);
      console.log('✅ Session ID:', req.sessionID);
      
      // Return the user data
      res.json(createResult);
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }
    
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

export default router;
