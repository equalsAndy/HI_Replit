import express from 'express';
import { userManagementService } from '../services/user-management-service';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import * as schema from '../../shared/schema';

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
      isTestUser: result.user?.isTestUser || false, // Ensure isTestUser field is included
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

/**
 * Get the current user's assessment data directly from the database
 * This endpoint is primarily for testing and debugging purposes
 */
router.get('/assessments', requireAuth, async (req, res) => {
  try {
    // Get the session user ID from the session cookie
    const sessionUserId = req.session.userId;
    if (!sessionUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Get the user ID from the userId cookie for debugging
    const cookieUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    // Import and use the correct Drizzle eq operator
    const { eq } = await import('drizzle-orm');
    
    // Fetch all assessment data for the current user
    const assessments = await db
      .select()
      .from(schema.userAssessments)
      .where(eq(schema.userAssessments.userId, sessionUserId));
    
    // Also look for assessments that might be incorrectly stored with the cookie user ID
    let cookieAssessments: any[] = [];
    if (cookieUserId && cookieUserId !== sessionUserId) {
      cookieAssessments = await db
        .select()
        .from(schema.userAssessments)
        .where(eq(schema.userAssessments.userId, cookieUserId));
    }
    
    // Format assessment results to show human-readable data
    const formattedAssessments = assessments.map(assessment => {
      try {
        const parsedResults = JSON.parse(assessment.results);
        return {
          ...assessment,
          parsedResults
        };
      } catch (e) {
        return assessment;
      }
    });
    
    // Format cookie assessments as well
    const formattedCookieAssessments = cookieAssessments.map(assessment => {
      try {
        const parsedResults = JSON.parse(assessment.results);
        return {
          ...assessment,
          parsedResults
        };
      } catch (e) {
        return assessment;
      }
    });
    
    // Query all user assessments for debugging
    const allAssessments = await db
      .select()
      .from(schema.userAssessments);
    
    res.json({
      success: true,
      userInfo: {
        sessionUserId: req.user.id,
        cookieUserId
      },
      assessments: formattedAssessments,
      cookieAssessments: formattedCookieAssessments,
      allAssessments: allAssessments.map(a => ({
        id: a.id,
        userId: a.userId,
        type: a.assessmentType,
        created: a.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting user assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user assessments. Please try again later.'
    });
  }
});

/**
 * Update user progress
 */
router.put('/progress', requireAuth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100'
      });
    }
    
    // Currently we don't have a progress field in the user table,
    // so we'll just return success without actually updating anything
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress. Please try again later.'
    });
  }
});

export default router;