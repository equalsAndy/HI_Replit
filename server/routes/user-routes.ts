import express from 'express';
import { userManagementService } from '../services/user-management-service';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

/**
 * Get the current user's profile
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

    // Return the user profile with additional fields
    const userProfile = {
      ...result.user,
      // Add any additional user data from other services if needed
      progress: 0,  // Default progress value
      title: result.user?.jobTitle || '',  // Map jobTitle to title for backward compatibility
    };

    res.json({
      success: true,
      user: userProfile
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
 * Update the current user's profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const { name, email, organization, jobTitle, profilePicture } = req.body;
    
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (organization !== undefined) updateData.organization = organization;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    
    const result = await userManagementService.updateUser(req.session.userId, updateData);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update user profile'
      });
    }

    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile. Please try again later.'
    });
  }
});

export default router;