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
    
    // Execute a query to get all user assessment records
    const allAssessments = await db
      .select()
      .from(schema.userAssessments);
      
    // Parse the results to make them more readable
    const formattedAssessments = allAssessments.map(assessment => {
      try {
        // Try to parse the JSON results
        let parsedResults = {};
        try {
          parsedResults = JSON.parse(assessment.results);
        } catch (e) {
          parsedResults = { error: "Failed to parse results JSON" };
        }
        
        // Format the assessment record
        return {
          id: assessment.id,
          userId: assessment.userId,
          type: assessment.assessmentType,
          created: assessment.createdAt,
          formattedResults: parsedResults
        };
      } catch (e) {
        return {
          id: assessment.id,
          userId: assessment.userId,
          error: "Failed to process assessment record"
        };
      }
    });
    
    // Group by user ID for better organization
    const assessmentsByUser: Record<number, any[]> = {};
    formattedAssessments.forEach(assessment => {
      const userId = assessment.userId;
      if (!assessmentsByUser[userId]) {
        assessmentsByUser[userId] = [];
      }
      assessmentsByUser[userId].push(assessment);
    });
    
    // Format by assessment type for the current user
    const currentUserAssessments = formattedAssessments
      .filter(a => a.userId === sessionUserId)
      .reduce((result: Record<string, any>, assessment) => {
        const type = assessment.type;
        result[type] = assessment;
        return result;
      }, {});
      
    // Get star card data specifically
    const starCardData = currentUserAssessments.starCard?.formattedResults || null;
    
    // Return formatted data that's easy to read in the UI
    // Only include current user's data for privacy/clarity
    res.json({
      success: true,
      userInfo: {
        sessionUserId,
        cookieUserId
      },
      currentUser: {
        assessments: currentUserAssessments,
        starCard: starCardData
      },
      // Only include current user's assessments in allUsers
      allUsers: { [sessionUserId]: assessmentsByUser[sessionUserId] || [] },
      // Limited raw data for developers - only current user
      raw: {
        assessmentCount: formattedAssessments.filter(a => a.userId === sessionUserId).length,
        allAssessments: formattedAssessments.filter(a => a.userId === sessionUserId)
      }
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
 * Save user assessment data (flow assessment, etc.)
 */
router.post('/assessments', requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { assessmentType, results } = req.body;
    
    if (!assessmentType || !results) {
      return res.status(400).json({
        success: false,
        error: 'Assessment type and results are required'
      });
    }

    // Save the assessment to the userAssessments table
    const newAssessment = await db.insert(schema.userAssessments).values({
      userId: req.session.userId,
      assessmentType,
      results: JSON.stringify(results),
      createdAt: new Date()
    }).returning();

    console.log(`Saved ${assessmentType} assessment for user ${req.session.userId}:`, results);

    res.json({
      success: true,
      assessment: newAssessment[0]
    });
  } catch (error) {
    console.error('Error saving user assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save assessment. Please try again later.'
    });
  }
});

/**
 * Update user progress
 */
router.put('/progress', requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
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