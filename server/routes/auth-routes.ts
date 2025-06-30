import express from 'express';
import { userManagementService } from '../services/user-management-service';
import { requireAuth } from '../middleware/auth';
import { validateInviteCode } from '../utils/invite-code';

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

    // Set session data
    req.session.userId = result.user.id;
    req.session.username = result.user.username;
    req.session.userRole = result.user.role;

    // Save session and wait for completion
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to save session'
        });
      }
      
      console.log('Session saved successfully for user:', result.user.id);
      // Send the user data (without the password)
      res.json(result);
    });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
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