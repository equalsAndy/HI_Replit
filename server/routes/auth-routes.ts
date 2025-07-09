import express from 'express';
import { userManagementService } from '../services/user-management-service.js';
import { requireAuth } from '../middleware/auth.js';
import { validateInviteCode } from '../utils/invite-code.js';

const router = express.Router();

/**
 * Login route
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  try {
    const result = await userManagementService.authenticateUser(username, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Debug session state before setting data
    console.log('🔍 Session state before setting data:', {
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionStore: !!req.session?.store
    });

    // Set session data
    req.session.userId = result.user.id;
    req.session.username = result.user.username;
    req.session.userRole = result.user.role;

    // Force session save with comprehensive error handling
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        console.error('❌ Session store type:', typeof req.session.store);
        console.error('❌ Session data:', {
          userId: req.session.userId,
          username: req.session.username,
          userRole: req.session.userRole
        });
        return res.status(500).json({
          success: false,
          error: 'Session creation failed',
          details: err.message
        });
      }
      
      console.log('✅ Session saved successfully for user:', result.user.id);
      console.log('✅ Session ID:', req.sessionID);
      
      // Send the user data (without the password)
      res.json(result);
    });
  } catch (error) {
    console.error('❌ Error in login route:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: error.message
    });
  }
});

/**
 * Logout route
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

/**
 * Get the current user
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await userManagementService.getUserById(req.session.userId!);

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
 * Get the current user profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const result = await userManagementService.getUserById(req.session.userId);

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

// Import registration routes
import registerRoutes from './auth-routes-register';
router.use(registerRoutes);

export default router;