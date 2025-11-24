import express from 'express';
import { userManagementService } from '../services/user-management-service.js';
import { createAuth0DbUser } from '../src/auth0/management.js';
import { inviteService } from '../services/invite-service.js';
import { z } from 'zod';
import { validateInviteCode, normalizeInviteCode } from '../utils/invite-code.js';
import { UserRole } from '../../shared/schema.js';

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
    res.json({
      success: true,
      invite: {
        email: result.invite?.email,
        role: result.invite?.role,
        name: result.invite?.name,
        isBetaTester: result.invite?.isBetaTester || result.invite?.is_beta_tester || false
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
    name: z.string().min(1, 'Name is required'),
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
    const inviteShowDemo = (inviteResult.invite as any)?.showDemoDataButtons ?? (inviteResult.invite as any)?.show_demo_data_buttons;

    const createResult = await userManagementService.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      role: inviteResult.invite.role as 'admin' | 'facilitator' | 'participant' | 'student',
      organization: data.organization,
      jobTitle: data.jobTitle,
      profilePicture: data.profilePicture,
      invitedBy: inviteResult.invite.createdBy,
      isBetaTester: inviteResult.invite.isBetaTester || inviteResult.invite.is_beta_tester || false,
      astAccess: inviteAstAccess !== undefined ? !!inviteAstAccess : true,
      iaAccess: inviteIaAccess !== undefined ? !!inviteIaAccess : true,
      showDemoDataButtons: inviteShowDemo !== undefined ? !!inviteShowDemo : false
    });
    
    if (!createResult.success) {
      return res.status(400).json(createResult);
    }
    
    // Provision Auth0 user if Management API is configured
    try {
      if (process.env.AUTH0_TENANT_DOMAIN || process.env.TENANT_DOMAIN) {
        const created = await createAuth0DbUser({ email: data.email, password: data.password, name: data.name });
        if (created?.user_id && createResult.user?.id) {
          await userManagementService.updateUser(createResult.user.id, { auth0Sub: created.user_id });
        }
      }
    } catch (auth0Err) {
      console.warn('⚠️ Auth0 provisioning failed (continuing with app user):', auth0Err instanceof Error ? auth0Err.message : String(auth0Err));
      // Continue; app user is already created. Optionally attach error details to response.
    }

    // Mark the invite as used
    await inviteService.markInviteAsUsed(normalizedCode, createResult.user?.id as number);
    
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
