import express from 'express';
import { userManagementService } from '../services/user-management-service.js';
import { requireAuth } from '../middleware/auth.js';
import { validateInviteCode } from '../utils/invite-code.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * Update the current user profile
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Extract allowed fields for profile update
    const {
      name,
      email,
      organization,
      jobTitle,
      profilePicture,
      contentAccess
    } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate required fields for profile updates (if updating profile fields, name and email are required)
    const isProfileUpdate = name !== undefined || email !== undefined || organization !== undefined || jobTitle !== undefined || profilePicture !== undefined;
    if (isProfileUpdate && (!name || !email)) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required for profile updates'
      });
    }

    // Validate email format if email is provided
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate contentAccess if provided
    if (contentAccess && !['student', 'professional'].includes(contentAccess)) {
      return res.status(400).json({
        success: false,
        error: 'Content access must be either "student" or "professional"'
      });
    }

    // Update the user profile
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (organization !== undefined) updateData.organization = organization;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (contentAccess !== undefined) {
      updateData.contentAccess = contentAccess;
      console.log(`🔧 Content Access Update: User ${userId} switching to ${contentAccess}`);
    }

    const result = await userManagementService.updateUser(userId, updateData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      user: result.user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile. Please try again later.',
      details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
    });
  }
});

/**
 * Login route
 */
router.post('/login', async (req, res) => {
  // Support both 'username' and 'identifier' in request body
  const { username, identifier, password } = req.body;
  const loginUsername = username || identifier;

  if (!loginUsername || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username/identifier and password are required'
    });
  }

  try {
    console.log('🔑 Login attempt:', { loginUsername });
    const result = await userManagementService.authenticateUser(loginUsername, password);

    if (!result.success) {
      console.log('❌ Login failed:', result.error);
      return res.status(401).json(result);
    }

    // Debug session state before setting data
    console.log('🔍 Session state before setting data:', {
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionStore: !!(req.session as any)?.store
    });

    // Set session data including full user object
    (req.session as any).userId = result.user?.id;
    (req.session as any).username = result.user?.username;
    (req.session as any).userRole = result.user?.role;
    (req.session as any).user = result.user; // Store full user object for beta tester access

    // Force session save with comprehensive error handling
    req.session.save((err: unknown) => {
      if (err) {
        console.error('❌ Session save error:', err);
        console.error('❌ Session store type:', typeof (req.session as any).store);
        console.error('❌ Session data:', {
          userId: (req.session as any).userId,
          username: (req.session as any).username,
          userRole: (req.session as any).userRole,
          userIsBetaTester: (req.session as any).user?.isBetaTester,
          fullUser: !!(req.session as any).user
        });
        return res.status(500).json({
          success: false,
          error: 'Session creation failed',
          details: typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err)
        });
      }
      
      console.log('✅ Session saved successfully for user:', result.user?.id);
      console.log('✅ Session ID:', req.sessionID);
      console.log('✅ Beta tester status:', result.user?.isBetaTester);
      console.log('✅ User role:', result.user?.role);
      
      // Send the user data (without the password)
      res.json(result);
    });
  } catch (error) {
    console.error('❌ Error in login route:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
    });
  }
});

/**
 * Logout route
 */
router.post('/logout', (req, res) => {
  const { reason } = req.body;
  
  req.session.destroy((err: unknown) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed',
        details: typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err)
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
      reason: reason || 'manual'
    });
  });
});

/**
 * Get the current user
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await userManagementService.getUserById((req.session as any).userId!);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

/**
 * Check session validity - lightweight endpoint for session checks
 */
router.get('/session-status', async (req, res) => {
  try {
    const sessionUserId = (req.session as any)?.userId;
    const cookieUserId = req.cookies?.userId;
    const userId = sessionUserId || (cookieUserId ? parseInt(cookieUserId) : null);

    if (!userId) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'No active session'
      });
    }

    // Basic validation - just check if session exists and has valid user ID
    res.json({
      success: true,
      valid: true,
      userId: userId,
      sessionId: req.sessionID
    });
  } catch (error) {
    console.error('Error checking session status:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Session validation failed'
    });
  }
});

/**
 * Get the current user profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    if (!(req.session as any).userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const result = await userManagementService.getUserById((req.session as any).userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user profile. Please try again later.'
    });
  }
});

/**
 * Get the current user profile (alias for /profile for compatibility)
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    if (!(req.session as any).userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const result = await userManagementService.getUserById((req.session as any).userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user profile. Please try again later.'
    });
  }
});

/**
 * Check if a username is available
 */
router.post('/check-username', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      success: false,
      error: 'Username is required'
    });
  }

  try {
    const available = await userManagementService.isUsernameAvailable(username);

    res.json({
      success: true,
      available
    });
  } catch (error) {
    console.error('Error checking username availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check username availability'
    });
  }
});

/**
 * Mark beta welcome as seen for current user
 */
router.post('/mark-beta-welcome-seen', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await userManagementService.markBetaWelcomeAsSeen(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Beta welcome marked as seen',
      user: result.user
    });
  } catch (error) {
    console.error('Error marking beta welcome as seen:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark beta welcome as seen'
    });
  }
});

/**
 * Change user password
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Get current user to verify current password
    const userResult = await userManagementService.getUserById(userId);
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.user;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const updateResult = await userManagementService.updateUserPassword(userId, hashedNewPassword);
    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password. Please try again later.'
    });
  }
});

// Import registration routes
import registerRoutes from './auth-routes-register.js';
router.use(registerRoutes);

export default router;