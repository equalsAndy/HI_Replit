import express from 'express';
import multer from 'multer';
import { userManagementService } from '../services/user-management-service';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import * as schema from '../../shared/schema';

const router = express.Router();

// Configure multer for photo uploads (1MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Get the current user's profile
 */
router.get('/profile', async (req, res) => {
  try {
    console.log('Profile request - Session data:', req.session);
    console.log('Profile request - Cookies:', req.cookies);
    
    // Check session or cookie authentication - prioritize session over cookie
    let userId = req.session?.userId;
    
    console.log('Session userId:', req.session?.userId);
    console.log('Cookie userId:', req.cookies?.userId);
    
    // Only use cookie as fallback if no session exists
    if (!userId && req.cookies?.userId) {
      userId = parseInt(req.cookies.userId);
      console.log('Using cookie fallback, userId:', userId);
    } else if (userId) {
      console.log('Using session userId:', userId);
    }
    
    console.log(`Profile request - Resolved user ID: ${userId}`);
    
    if (!userId) {
      console.log('Profile request - No user ID found, authentication failed');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    console.log(`Fetching user profile for user ID: ${userId}`);
    
    const result = await userManagementService.getUserById(userId);

    if (!result.success) {
      console.log(`User profile not found for ID: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    console.log(`Raw user data from service:`, result.user);

    // Return the user profile with additional fields
    const userProfile = {
      ...result.user,
      // Add any additional user data from other services if needed
      progress: 0,  // Default progress value
      title: result.user?.jobTitle || '',  // Map jobTitle to title for backward compatibility
      isTestUser: result.user?.isTestUser || false, // Ensure isTestUser field is included
    };

    console.log(`Final user profile being returned:`, userProfile);

    // Return user data wrapped in success object for NavBar compatibility
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
 * Get user navigation progress
 */
router.get('/navigation-progress', requireAuth, async (req, res) => {
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
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      progress: result.user?.navigationProgress || null
    });
  } catch (error) {
    console.error('Error getting navigation progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load navigation progress. Please try again later.'
    });
  }
});

/**
 * Update user navigation progress
 */
router.put('/navigation-progress', requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const { navigationProgress } = req.body;
    
    if (!navigationProgress || typeof navigationProgress !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Navigation progress must be a valid JSON string'
      });
    }
    
    // Validate JSON
    try {
      JSON.parse(navigationProgress);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Navigation progress must be valid JSON'
      });
    }
    
    const result = await userManagementService.updateUser(req.session.userId, {
      navigationProgress
    });
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update navigation progress'
      });
    }
    
    res.json({
      success: true,
      message: 'Navigation progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating navigation progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update navigation progress. Please try again later.'
    });
  }
});

/**
 * Update user progress (legacy endpoint for compatibility)
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
    
    // This endpoint is kept for compatibility but doesn't actually store anything
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

/**
 * Upload profile photo
 */
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    // Check session or cookie authentication
    let userId = req.session?.userId;
    
    if (!userId && req.cookies?.userId) {
      userId = parseInt(req.cookies.userId);
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Handle file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Convert file to base64 for database storage
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    console.log(`Uploading photo for user ${userId}, size: ${req.file.size} bytes`);
    
    // Update user's profile picture
    const result = await userManagementService.updateUser(userId, {
      profilePicture: base64Image
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to save profile picture'
      });
    }

    console.log(`Photo uploaded successfully for user ${userId}`);
    
    res.json({
      success: true,
      profilePicture: base64Image
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;