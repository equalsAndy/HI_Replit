import express from 'express';
import multer from 'multer';
import { userManagementService } from '../services/user-management-service.js';
import { convertUserToPhotoReference, sanitizeUserForNetwork } from '../utils/user-photo-utils.js';
import { NavigationSyncService } from '../services/navigation-sync-service.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';
import { db } from '../db.js';
import * as schema from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Configure multer for photo uploads (2.5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2.5 * 1024 * 1024, // 2.5MB limit
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
 * Get the current user's basic info (alias for /profile for frontend compatibility)
 */
router.get('/me', async (req, res) => {
  try {
    // Log session data safely (sanitized to avoid base64 profile pictures)
    const sessionCopy = { ...req.session };
    if (sessionCopy.user?.profilePicture && sessionCopy.user.profilePicture.length > 100) {
      sessionCopy.user.profilePicture = `[Base64 Data - ${sessionCopy.user.profilePicture.length} characters]`;
    }
    console.log('Me request - Session data:', sessionCopy);
    console.log('Me request - Cookies:', req.cookies);

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

    console.log(`Me request - Resolved user ID: ${userId}`);

    if (!userId) {
      console.log('Me request - No user ID found, authentication failed');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log(`Fetching user info for user ID: ${userId}`);

    const result = await userManagementService.getUserById(userId);

    if (!result.success) {
      console.log(`User info not found for ID: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`Raw user data from service:`, result.user);

    // Convert user data to use photo references instead of base64 data
    const userWithPhotoRef = convertUserToPhotoReference(result.user);
    
    // Return simplified user info for /me endpoint
    const userInfo = {
      id: userWithPhotoRef.id,
      name: userWithPhotoRef.name,
      email: userWithPhotoRef.email,
      role: userWithPhotoRef.role,
      username: userWithPhotoRef.username,
      organization: userWithPhotoRef.organization,
      jobTitle: userWithPhotoRef.jobTitle,
      profilePictureUrl: userWithPhotoRef.profilePictureUrl,
      hasProfilePicture: userWithPhotoRef.hasProfilePicture
    };

    console.log(`Final user info being returned:`, sanitizeUserForNetwork(userInfo));

    // Return user data directly (not wrapped in success object for /me endpoint)
    res.json(userInfo);
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user info. Please try again later.'
    });
  }
});

/**
 * Get the current user's profile
 */
router.get('/profile', async (req, res) => {
  try {
    // Log session data safely (sanitized to avoid base64 profile pictures)
    const sessionCopy = { ...req.session };
    if (sessionCopy.user?.profilePicture && sessionCopy.user.profilePicture.length > 100) {
      sessionCopy.user.profilePicture = `[Base64 Data - ${sessionCopy.user.profilePicture.length} characters]`;
    }
    console.log('Profile request - Session data:', sessionCopy);
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

    console.log(`Raw user data from service:`, sanitizeUserForNetwork(result.user));

    // Convert user data to use photo references instead of base64 data
    const userWithPhotoRef = convertUserToPhotoReference(result.user);

    // Return the user profile with additional fields
    const userProfile = {
      ...userWithPhotoRef,
      // Add any additional user data from other services if needed
      progress: 0,  // Default progress value
      title: userWithPhotoRef.jobTitle || '',  // Map jobTitle to title for backward compatibility
    };

    console.log(`Final user profile being returned:`, sanitizeUserForNetwork(userProfile));

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
    if (!(req.session as any)?.userId) {
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

    const result = await userManagementService.updateUser((req.session as any).userId, updateData);

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
    const sessionUserId = (req.session as any).userId;
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
        if (type) {
          (result as any)[type] = assessment;
        }
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
    if (!(req.session as any)?.userId) {
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
      userId: (req.session as any).userId!,
      assessmentType,
      results: JSON.stringify(results)
    }).returning();

    console.log(`Saved ${assessmentType} assessment for user ${(req.session as any).userId}:`, results);

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
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await userManagementService.getUserById((req.session as any).userId);

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
 * Update user navigation progress with atomic video progress handling
 */
router.post('/navigation-progress', requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
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

    // Parse the incoming progress data
    let incomingData;
    try {
      incomingData = JSON.parse(navigationProgress);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in navigation progress'
      });
    }

    // Get current user data to perform atomic merge
    const currentUserResult = await userManagementService.getUserById((req.session as any).userId);
    if (!currentUserResult.success) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Parse current navigation progress
    let currentProgress = {
      completedSteps: [],
      currentStepId: '1-1',
      appType: 'ast',
      lastVisitedAt: new Date().toISOString(),
      unlockedSteps: ['1-1'],
      videoProgress: {}
    };

    if (currentUserResult.user?.navigationProgress) {
      try {
        let progressData = currentUserResult.user.navigationProgress;
        let parsed;

        // Handle deeply nested JSON by parsing until we get actual progress data
        for (let i = 0; i < 5; i++) {
          try {
            parsed = JSON.parse(progressData);

            // If this has navigationProgress as a string, parse deeper
            if (parsed.navigationProgress && typeof parsed.navigationProgress === 'string') {
              progressData = parsed.navigationProgress;
            } else if (parsed.completedSteps || parsed.currentStepId) {
              // Found actual progress data
              currentProgress = { ...currentProgress, ...parsed };
              break;
            } else {
              // This might be the progress data itself
              currentProgress = { ...currentProgress, ...parsed };
              break;
            }
          } catch (innerError) {
            console.log('Parse failed at level', i);
            break;
          }
        }
      } catch (e) {
        console.log('Using default progress due to parse error');
      }
    }

    // Perform atomic merge with highest video progress values
    const mergedProgress = {
      ...currentProgress,
      ...incomingData,
      videoProgress: {
        ...currentProgress.videoProgress,
        ...incomingData.videoProgress
      }
    };

    // Ensure video progress always maintains highest values and records watch history
    Object.keys(incomingData.videoProgress || {}).forEach(stepId => {
      const currentValue = (currentProgress.videoProgress as any)[stepId];
      const newValue = incomingData.videoProgress[stepId];

      // Handle both legacy (number) and new (object) format
      let currentMax = 0;
      let currentData: any = { watchHistory: [] };

      if (typeof currentValue === 'number') {
        // Legacy format - convert to new format
        currentMax = currentValue;
        currentData = {
          maxPercentage: currentValue,
          lastWatchedAt: new Date().toISOString(),
          watchHistory: [],
          completed: false
        };
      } else if (currentValue && typeof currentValue === 'object') {
        // New format
        currentMax = currentValue.maxPercentage || 0;
        currentData = { ...currentValue };
      }

      let newMax = 0;
      let newData: any = {};

      if (typeof newValue === 'number') {
        // Legacy format from client
        newMax = newValue;
        newData = {
          maxPercentage: newValue,
          lastWatchedAt: new Date().toISOString(),
          watchHistory: [
            ...(currentData.watchHistory || []),
            {
              percentage: newValue,
              timestamp: new Date().toISOString()
            }
          ],
          completed: false
        };
      } else if (newValue && typeof newValue === 'object') {
        // New format from client
        newMax = newValue.maxPercentage || newValue.percentage || 0;
        newData = {
          ...currentData,
          ...newValue,
          maxPercentage: Math.max(currentMax, newValue.maxPercentage || newValue.percentage || 0),
          lastWatchedAt: new Date().toISOString(),
          watchHistory: [
            ...(currentData.watchHistory || []),
            {
              percentage: newValue.percentage || newValue.maxPercentage || 0,
              timestamp: new Date().toISOString(),
              duration: newValue.duration
            }
          ]
        };
      }

      // Keep the highest percentage
      mergedProgress.videoProgress[stepId] = {
        ...newData,
        maxPercentage: Math.max(currentMax, newMax)
      };

      // Limit watch history to last 50 entries to prevent bloat
      if (mergedProgress.videoProgress[stepId].watchHistory?.length > 50) {
        mergedProgress.videoProgress[stepId].watchHistory =
          mergedProgress.videoProgress[stepId].watchHistory.slice(-50);
      }
    });

    console.log(`🔄 Atomic video progress merge for user ${(req.session as any).userId}:`);
    console.log(`   Current:`, currentProgress.videoProgress);
    console.log(`   Incoming:`, incomingData.videoProgress);
    console.log(`   Merged:`, mergedProgress.videoProgress);

    // Save the atomically merged progress (single stringify only)
    const result = await userManagementService.updateUser((req.session as any).userId, {
      navigationProgress: JSON.stringify(mergedProgress)
    });

    if (!result.success) {
      console.error(`Failed to update navigation progress for user ${(req.session as any).userId}:`, result.error);
      return res.status(404).json({
        success: false,
        error: 'Failed to update navigation progress'
      });
    }

    console.log(`✅ Atomic progress saved for user ${(req.session as any).userId}`);

    res.json({
      success: true,
      message: 'Navigation progress updated atomically',
      progress: mergedProgress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating navigation progress for user ${req.session?.userId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update navigation progress. Please try again later.'
    });
  }
});

/**
 * Update user navigation progress (PUT endpoint)
 */
router.put('/navigation-progress', requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
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

    // Validate and parse JSON
    let progressData;
    try {
      progressData = JSON.parse(navigationProgress);
    } catch (parseError) {
      console.error('Invalid navigation progress JSON:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Navigation progress must be valid JSON'
      });
    }

    // Log progress update for debugging
    console.log(`Updating navigation progress for user ${(req.session as any).userId}:`, {
      completedSteps: progressData.completedSteps?.length || 0,
      currentStep: progressData.currentStepId,
      appType: progressData.appType,
      lastVisited: progressData.lastVisitedAt ? new Date(progressData.lastVisitedAt).toISOString() : 'unknown'
    });

    const result = await userManagementService.updateUser((req.session as any).userId, {
      navigationProgress
    });

    if (!result.success) {
      console.error(`Failed to update navigation progress for user ${(req.session as any).userId}:`, result.error);
      return res.status(404).json({
        success: false,
        error: 'Failed to update navigation progress'
      });
    }

    console.log(`Successfully updated navigation progress for user ${(req.session as any).userId}`);

    res.json({
      success: true,
      message: 'Navigation progress updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating navigation progress for user ${req.session?.userId}:`, error);
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
    if (!req.session?.userId) {
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

    // Convert file to base64 for photo storage system
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log(`Uploading photo for user ${userId}, size: ${req.file.size} bytes`);

    // Import photo storage service
    const { photoStorageService } = await import('../services/photo-storage-service.js');

    try {
      // Store photo and get photo ID
      const photoId = await photoStorageService.storePhoto(base64Image, userId, true);
      console.log(`Photo stored with ID ${photoId} for user ${userId}`);

      // Update user's profile picture ID
      const result = await userManagementService.updateUserProfilePictureId(userId, photoId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Failed to save profile picture reference'
        });
      }

      console.log(`Photo uploaded successfully for user ${userId} with photo ID ${photoId}`);

      // Generate photo URL for response
      const photoUrl = photoStorageService.getPhotoUrl(photoId);

      res.json({
        success: true,
        profilePicture: base64Image, // For compatibility
        profilePictureId: photoId,
        profilePictureUrl: photoUrl
      });
    } catch (error) {
      console.error('Error storing photo:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to store profile picture'
      });
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Sync navigation progress for a specific user (Admin only)
 */
router.post('/sync-navigation/:userId', requireAuth, isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    console.log(`[API] Syncing navigation progress for user ${userId}`);

    const success = await NavigationSyncService.syncUserProgress(userId);

    if (success) {
      res.json({
        success: true,
        message: `Navigation progress synced successfully for user ${userId}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to sync navigation progress'
      });
    }
  } catch (error) {
    console.error('Error syncing navigation progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Sync navigation progress for all users (Admin only)
 */
router.post('/sync-navigation-all', requireAuth, isAdmin, async (req, res) => {
  try {
    console.log('[API] Starting bulk navigation progress sync');

    const syncedCount = await NavigationSyncService.syncAllUsersProgress();

    res.json({
      success: true,
      message: `Navigation progress synced for ${syncedCount} users`,
      syncedCount
    });
  } catch (error) {
    console.error('Error during bulk navigation sync:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete user data endpoint for test users (self-service)
router.delete('/data', requireAuth, async (req: any, res: any) => {
  try {
    const sessionUserId = (req.session as any).userId;

    if (!sessionUserId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Get user to verify they exist and are a test user
    const result = await userManagementService.getUserById(sessionUserId);
    if (!result.success || !result.user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Only allow deletion for test users
    if (!result.user.isTestUser) {
      return res.status(403).json({ 
        success: false, 
        error: 'Data deletion is only available for test users' 
      });
    }

    console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data deletion`);

    // Delete user data using the service
    const deleteResult = await userManagementService.deleteUserData(sessionUserId);

    if (!deleteResult.success) {
      console.error(`Data deletion failed for user ${sessionUserId}:`, deleteResult.error);
      return res.status(500).json({ 
        success: false, 
        error: deleteResult.error || 'Failed to delete user data' 
      });
    }

    console.log(`Data deletion successful for user ${sessionUserId}:`, deleteResult.summary);

    res.json({
      success: true,
      message: 'User data deleted successfully',
      summary: deleteResult.summary
    });

  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while deleting user data' 
    });
  }
});

/**
 * Export user data for test users (self-service)
 */
router.get('/export-data', requireAuth, async (req, res) => {
  try {
    const sessionUserId = (req.session as any)?.userId;

    if (!sessionUserId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Get user to verify they exist and are a test user
    const result = await userManagementService.getUserById(sessionUserId);
    if (!result.success || !result.user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Only allow export for test users
    if (!result.user.isTestUser) {
      return res.status(403).json({ 
        success: false, 
        error: 'Data export is only available for test users' 
      });
    }

    console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data export`);

    // Get all user data from database
    const userData = {
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        organization: result.user.organization,
        jobTitle: result.user.jobTitle,
        isTestUser: result.user.isTestUser,
        navigationProgress: result.user.navigationProgress,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt
      },
      assessments: [],
      navigationProgress: [],
      workshopParticipation: [],
      workshopStepData: [],
      growthPlans: [],
      finalReflections: [],
      discernmentProgress: [],
      userPhotos: []
    };

    try {
      // Get user assessments
      const assessments = await db.select()
        .from(schema.userAssessments)
        .where(eq(schema.userAssessments.userId, sessionUserId));
      (userData as any).assessments = assessments;

      // Get navigation progress
      const navProgress = await db.select()
        .from(schema.navigationProgress)
        .where(eq(schema.navigationProgress.userId, sessionUserId));
      (userData as any).navigationProgress = navProgress;

      // Get workshop participation
      const workshopParticipation = await db.select()
        .from(schema.workshopParticipation)
        .where(eq(schema.workshopParticipation.userId, sessionUserId));
      (userData as any).workshopParticipation = workshopParticipation;

      // Get workshop step data (includes IA-3-5 and other step data)
      const workshopStepData = await db.select()
        .from(schema.workshopStepData)
        .where(eq(schema.workshopStepData.userId, sessionUserId));
      (userData as any).workshopStepData = workshopStepData;

      // Get growth plans
      const growthPlans = await db.select()
        .from(schema.growthPlans)
        .where(eq(schema.growthPlans.userId, sessionUserId));
      (userData as any).growthPlans = growthPlans;

      // Get final reflections
      const finalReflections = await db.select()
        .from(schema.finalReflections)
        .where(eq(schema.finalReflections.userId, sessionUserId));
      (userData as any).finalReflections = finalReflections;

      // Get discernment progress
      const discernmentProgress = await db.select()
        .from(schema.userDiscernmentProgress)
        .where(eq(schema.userDiscernmentProgress.userId, sessionUserId));
      (userData as any).discernmentProgress = discernmentProgress;

      // Get user photos (from photo_storage table)
      try {
        const { Pool } = await import('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        const photosResult = await pool.query(
          'SELECT id, photo_hash, mime_type, file_size, width, height, is_thumbnail, original_photo_id, created_at FROM photo_storage WHERE uploaded_by = $1 ORDER BY created_at DESC',
          [sessionUserId]
        );
        
        (userData as any).userPhotos = photosResult.rows;
        pool.end();
      } catch (photoError) {
        console.warn('Could not fetch user photos for export:', photoError);
        (userData as any).userPhotos = [];
      }

    } catch (dbError) {
      console.error('Error fetching user data for export:', dbError);
      // Continue with basic user data even if some tables fail
    }

    res.json({
      success: true,
      userData: userData,
      exportDate: new Date().toISOString(),
      message: 'Data exported successfully'
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while exporting user data' 
    });
  }
});

/**
 * Reset user data for test users (self-service)
 */
router.post('/reset-data', requireAuth, async (req, res) => {
  try {
    const sessionUserId = (req.session as any)?.userId;

    if (!sessionUserId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Get user to verify they exist and are a test user
    const result = await userManagementService.getUserById(sessionUserId);
    if (!result.success || !result.user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Only allow reset for test users
    if (!result.user.isTestUser) {
      return res.status(403).json({ 
        success: false, 
        error: 'Data reset is only available for test users' 
      });
    }

    console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data reset`);

    // Delete user data using the service
    const deleteResult = await userManagementService.deleteUserData(sessionUserId);

    if (!deleteResult.success) {
      console.error(`Data reset failed for user ${sessionUserId}:`, deleteResult.error);
      return res.status(500).json({ 
        success: false, 
        error: deleteResult.error || 'Failed to reset user data' 
      });
    }

    console.log(`Data reset successful for user ${sessionUserId}:`, deleteResult.summary);

    res.json({
      success: true,
      message: 'User data reset successfully',
      summary: deleteResult.summary
    });

  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while resetting user data' 
    });
  }
});

/**
 * Update user content access preference (student/professional interface)
 */
router.post('/content-access', requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { contentAccess } = req.body;

    // Validate content access value
    if (!contentAccess || !['student', 'professional'].includes(contentAccess)) {
      return res.status(400).json({
        success: false,
        error: 'Content access must be either "student" or "professional"'
      });
    }

    console.log(`Updating content access for user ${(req.session as any).userId} to: ${contentAccess}`);

    // Update user's content access preference
    const result = await userManagementService.updateUser((req.session as any).userId, {
      contentAccess: contentAccess
    });

    if (!result.success) {
      console.error(`Failed to update content access for user ${(req.session as any).userId}:`, result.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update interface preference'
      });
    }

    console.log(`✅ Content access updated for user ${(req.session as any).userId} to: ${contentAccess}`);

    res.json({
      success: true,
      message: `Interface preference updated to ${contentAccess}`,
      contentAccess: contentAccess,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating content access for user ${req.session?.userId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update interface preference. Please try again later.'
    });
  }
});

export default router;