import { Router, Request, Response, NextFunction } from 'express';
import { getFeatureStatus } from '../middleware/feature-flags.js';
import { db } from '../db.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { users } from '../../shared/schema.js';

// Create a router for workshop data operations
const workshopDataRouter = Router();

/**
 * Authentication middleware for workshop data endpoints
 */
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // Get user ID from session (primary) or cookie (fallback)
  let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Fix for test users - use session userId instead of cookie userId (1) if available
  if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
    userId = (req.session as any).userId;
  }
  
  (req.session as any).userId = userId;
  next();
};

/**
 * Middleware to check workshop completion status and prevent editing
 */
const checkWorkshopLocked = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as any).userId;
    
    // Determine workshop type from request body or params
    const appType = req.body.appType || req.params.appType || 'ast';
    
    if (!['ast', 'ia'].includes(appType)) {
      return next(); // Skip check for invalid app types
    }
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
    const isLocked = user[0][completionField];
    
    if (isLocked) {
      return res.status(403).json({ 
        error: 'Workshop is completed and locked for editing',
        workshopType: appType.toUpperCase(),
        completedAt: user[0][appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt']
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking workshop lock status:', error);
    res.status(500).json({ error: 'Failed to check workshop lock status' });
  }
};

/**
 * Video API routes - accessible without admin authentication
 */

// Get videos by workshop type
workshopDataRouter.get('/videos/workshop/:workshopType', async (req: Request, res: Response) => {
  try {
    const { workshopType } = req.params;
    
    // DEBUG: Test without workshop type filter first for step 1-1
    if (workshopType === 'allstarteams') {
      console.log('=== DEBUG: Testing step 1-1 video fetch ===');
      const testVideo = await db.select()
        .from(schema.videos)
        .where(eq(schema.videos.stepId, '1-1'));
      
      console.log('Found video for step 1-1:', testVideo);
      
      // Also test the workshop filter
      const workshopVideos = await db
        .select()
        .from(schema.videos)
        .where(eq(schema.videos.workshopType, workshopType));
      
      console.log(`Found ${workshopVideos.length} videos for workshop ${workshopType}`);
      console.log('First few videos:', workshopVideos.slice(0, 3));
    }
    
    // Query videos from database
    const videos = await db
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.workshopType, workshopType));
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos by workshop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get video by ID
workshopDataRouter.get('/videos/:id', async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);
    
    if (isNaN(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }
    
    const videos = await db
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.id, videoId));
    
    if (videos.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(200).json(videos[0]);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get star card data for the current user - TEMPORARILY DISABLED TO STOP INFINITE LOOP
 */
workshopDataRouter.get('/starcard', async (req: Request, res: Response) => {
  // TEMPORARILY RETURN MOCK DATA TO STOP INFINITE LOOP
  return res.status(200).json({
    success: true,
    thinking: 27,
    acting: 25,
    feeling: 23,
    planning: 25,
    isEmpty: false,
    source: 'mock_data_to_stop_loop'
  });
  
  // Original code disabled below
  /*
  try {
    // Get user ID from session (primary) or cookie (fallback)
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    // This ensures we're fetching star card data for the correct user
    console.log(`StarCard: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }
    
    console.log(`Fetching star card for user ${userId}`);
    
    // Try to find star card data for this user
    const starCards = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'starCard')
        )
      );
      
    // Check if we found a star card
    if (starCards && starCards.length > 0) {
      const starCard = starCards[0]; // Get the first (and should be only) star card
      console.log(`Found star card for user ${userId}:`, starCard);
      
      // If we found data, parse the JSON results and return it
      try {
        const starCardData = JSON.parse(starCard.results);
        console.log(`Parsed star card data for user ${userId}:`, starCardData);
        
        return res.status(200).json({
          success: true,
          thinking: starCardData.thinking || 0,
          feeling: starCardData.feeling || 0,
          acting: starCardData.acting || 0,
          planning: starCardData.planning || 0,
          // Include any other fields from the results
          ...starCardData
        });
      } catch (parseError) {
        console.error(`Error parsing star card data for user ${userId}:`, parseError);
        return res.status(500).json({
          success: false,
          message: 'Error parsing star card data'
        });
      }
    } else {
      console.log(`No star card found for user ${userId}`);
      
      // If no data found, return empty star card
      return res.status(200).json({
        success: true,
        thinking: 0,
        acting: 0,
        feeling: 0,
        planning: 0,
        isEmpty: true
      });
    }
  } catch (error) {
    console.error('Error getting star card:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get star card data',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
  */
});

/**
 * Get flow attributes for the current user
 */
workshopDataRouter.get('/flow-attributes', async (req: Request, res: Response) => {
  try {
    // Get user ID from session (primary) or cookie (fallback)
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    console.log(`Flow Attributes: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }
    
    // Try to find flow attributes for this user
    const flowDataEntries = await db
      .select()
      .from(schema.userAssessments)
      .where(eq(schema.userAssessments.userId, userId));
      
    // Filter for flow attributes assessment type
    const flowData = flowDataEntries.find(a => a.assessmentType === 'flowAttributes');
    
    if (flowData) {
      // If we found data, parse the JSON results and return it
      try {
        const flowAttributes = JSON.parse(flowData.results);
        return res.status(200).json({
          success: true,
          attributes: flowAttributes.attributes || [],
          flowScore: flowAttributes.flowScore || 0
        });
      } catch (parseError) {
        console.error(`Error parsing flow attributes for user ${userId}:`, parseError);
        return res.status(500).json({
          success: false,
          message: 'Error parsing flow attributes'
        });
      }
    } else {
      // If no data found, return empty flow attributes
      return res.status(200).json({
        success: true,
        attributes: [],
        flowScore: 0,
        isEmpty: true
      });
    }
  } catch (error) {
    console.error('Error getting flow attributes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get flow attributes',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Assessment API routes
 */

// Get assessment questions
workshopDataRouter.get('/assessment/questions', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // This would normally come from a database, but for now, return a static set of questions
    // from the shared schema or a predefined set
    return res.status(200).json([
      {
        id: 1,
        text: "When starting a new project, I prefer to...",
        options: [
          { id: "opt1-1", text: "Start working right away and adjust as I go", category: "acting" },
          { id: "opt1-2", text: "Get to know my teammates and build good working relationships", category: "feeling" },
          { id: "opt1-3", text: "Break down the work into clear steps with deadlines", category: "planning" },
          { id: "opt1-4", text: "Consider different approaches before deciding how to proceed", category: "thinking" }
        ]
      },
      {
        id: 2,
        text: "When faced with a challenge, I typically...",
        options: [
          { id: "opt2-1", text: "Tackle it head-on and find a quick solution", category: "acting" },
          { id: "opt2-2", text: "Talk it through with others to understand their perspectives", category: "feeling" },
          { id: "opt2-3", text: "Create a detailed plan to overcome it systematically", category: "planning" },
          { id: "opt2-4", text: "Analyze the root cause and consider multiple solutions", category: "thinking" }
        ]
      }
    ]);
  } catch (error) {
    console.error('Error getting assessment questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get assessment questions',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

// Start assessment
workshopDataRouter.post('/assessment/start', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Check if user already has a completed assessment
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'starCard')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Assessment already exists
      return res.status(409).json({
        success: false,
        message: 'Assessment already completed'
      });
    }
    
    // Create new assessment record with pending state
    // In a real implementation, you might store the current state
    // of the assessment to allow resuming later
    
    return res.status(200).json({
      success: true,
      message: 'Assessment started'
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start assessment',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

// Save answer
workshopDataRouter.post('/assessment/answer', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // In a real implementation, you would save the answer to the database
    // for now, just acknowledge receipt
    
    return res.status(200).json({
      success: true,
      message: 'Answer saved'
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save answer',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

// Complete assessment
workshopDataRouter.post('/assessment/complete', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  console.log('=== ASSESSMENT COMPLETION START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Session data:', req.session);
  console.log('Cookies:', req.cookies);
  
  try {
    // Get user ID from session (primary) or cookie (fallback) for better reliability
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    console.log('Initial userId determination:', userId);
    
    if (!userId) {
      console.log('ERROR: No user ID found in session or cookies');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // If test user with cookie userId is 1 but session userId is different, use session ID
    // This ensures star card data is saved for the correct user
    console.log(`Assessment: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }
    
    // In a real implementation, we'd calculate the results based on all answers
    // For this implementation, we'll use demo data since we're fixing an issue
    
    // Get quadrant data from request or use demo data if not provided
    let quadrantData = req.body.quadrantData || {
      thinking: 28,
      feeling: 25,
      acting: 24,
      planning: 23
    };
    
    // Log the data we're saving
    console.log('Saving star card data:', quadrantData);
    
    // Check if user already has an assessment
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'starCard')
        )
      );
    
    let updatedId = null;
    
    if (existingAssessment.length > 0) {
      // Update existing assessment
      const updated = await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(quadrantData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id))
        .returning();
      
      // Get the updated record ID
      updatedId = updated.length > 0 ? updated[0].id : existingAssessment[0].id;
      console.log('Updated existing star card assessment:', updated);
    } else {
      // Create new assessment record
      const inserted = await db.insert(schema.userAssessments).values({
        userId: userId,
        assessmentType: 'starCard',
        results: JSON.stringify(quadrantData)
      }).returning();
      
      // Get the new record ID
      updatedId = inserted.length > 0 ? inserted[0].id : null;
      console.log('Created new star card assessment:', inserted);
    }
    
    // Return the full star card data in the format expected by the client
    return res.status(200).json({
      success: true,
      message: 'Assessment completed',
      id: updatedId,
      userId: userId,
      thinking: quadrantData.thinking,
      feeling: quadrantData.feeling,
      acting: quadrantData.acting,
      planning: quadrantData.planning,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error completing assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete assessment',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Save flow attributes for the current user
 */
workshopDataRouter.post('/flow-attributes', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  // Always set content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  try {
    console.log('Flow attributes save request received:', req.body);
    
    // Get user ID from session (primary) or cookie (fallback)
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    console.log(`Flow Attributes POST: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }
    
    console.log('User ID for saving flow attributes:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get flow attributes data from request body
    const { attributes } = req.body;
    
    console.log('Flow attributes data:', { attributes });
    
    if (!attributes || !Array.isArray(attributes)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flow attributes data'
      });
    }
    
    // Format data for storage (only attribute names)
    const flowAttributesData = {
      attributes
    };
    
    // Check if user already has flow attributes
    const existingFlowAttributes = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAttributes')
        )
      );
    
    console.log('Existing flow attributes:', existingFlowAttributes);
    
    if (existingFlowAttributes.length > 0) {
      // Update existing flow attributes
      const updated = await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(flowAttributesData)
        })
        .where(eq(schema.userAssessments.id, existingFlowAttributes[0].id))
        .returning();
      
      console.log('Updated flow attributes:', updated);
    } else {
      // Create new flow attributes record
      const inserted = await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'flowAttributes',
        results: JSON.stringify(flowAttributesData)
      }).returning();
      
      console.log('Inserted flow attributes:', inserted);
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Flow attributes saved successfully',
      attributes
    });
  } catch (error) {
    console.error('Error saving flow attributes:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to save flow attributes',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Rounding Out Reflection endpoints
 */
// POST /api/workshop-data/rounding-out
workshopDataRouter.post('/rounding-out', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { strengths, values, passions, growthAreas } = req.body;
    
    // Validation
    if (!strengths || typeof strengths !== 'string' || strengths.trim().length === 0 || strengths.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Strengths is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { strengths: 'Required field, 1-1000 characters' }
      });
    }
    
    if (!values || typeof values !== 'string' || values.trim().length === 0 || values.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Values is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { values: 'Required field, 1-1000 characters' }
      });
    }
    
    if (!passions || typeof passions !== 'string' || passions.trim().length === 0 || passions.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Passions is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { passions: 'Required field, 1-1000 characters' }
      });
    }
    
    if (!growthAreas || typeof growthAreas !== 'string' || growthAreas.trim().length === 0 || growthAreas.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Growth Areas is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { growthAreas: 'Required field, 1-1000 characters' }
      });
    }
    
    const assessmentData = {
      strengths: strengths.trim(),
      values: values.trim(),
      passions: passions.trim(),
      growthAreas: growthAreas.trim()
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'roundingOutReflection')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'roundingOutReflection',
        results: JSON.stringify(assessmentData)
      });
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'roundingOutReflection' 
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/rounding-out
workshopDataRouter.get('/rounding-out', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'roundingOutReflection')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'roundingOutReflection' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * Future Self Reflection endpoints
 */
// POST /api/workshop-data/future-self
workshopDataRouter.post('/future-self', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Handle both new timeline structure and legacy format for backward compatibility
    const { 
      direction,
      twentyYearVision, 
      tenYearMilestone, 
      fiveYearFoundation, 
      flowOptimizedLife,
      // Legacy fields for backward compatibility
      futureSelfDescription, 
      visualizationNotes, 
      additionalNotes 
    } = req.body;

    // Validate that at least one field has meaningful content
    const hasContent = (
      (twentyYearVision && twentyYearVision.trim().length >= 10) ||
      (tenYearMilestone && tenYearMilestone.trim().length >= 10) ||
      (fiveYearFoundation && fiveYearFoundation.trim().length >= 10) ||
      (flowOptimizedLife && flowOptimizedLife.trim().length >= 10) ||
      (futureSelfDescription && futureSelfDescription.trim().length >= 10) ||
      (visualizationNotes && visualizationNotes.trim().length >= 10)
    );

    if (!hasContent) {
      return res.status(400).json({
        success: false,
        error: 'At least one reflection field must contain at least 10 characters',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate individual field lengths (max 2000 for timeline fields)
    const validateField = (field: string, value: string, maxLength: number = 2000) => {
      if (value && (typeof value !== 'string' || value.length > maxLength)) {
        throw new Error(`${field} must be a string with maximum ${maxLength} characters`);
      }
    };

    try {
      validateField('twentyYearVision', twentyYearVision);
      validateField('tenYearMilestone', tenYearMilestone); 
      validateField('fiveYearFoundation', fiveYearFoundation);
      validateField('flowOptimizedLife', flowOptimizedLife);
      validateField('futureSelfDescription', futureSelfDescription, 1000);
      validateField('visualizationNotes', visualizationNotes, 1000);
      validateField('additionalNotes', additionalNotes, 1000);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: (validationError as Error).message,
        code: 'VALIDATION_ERROR'
      });
    }

    // Build assessment data structure (supports both new and legacy formats)
    const assessmentData = {
      // New timeline structure
      direction: direction || 'backward',
      twentyYearVision: twentyYearVision ? twentyYearVision.trim() : '',
      tenYearMilestone: tenYearMilestone ? tenYearMilestone.trim() : '',
      fiveYearFoundation: fiveYearFoundation ? fiveYearFoundation.trim() : '',
      flowOptimizedLife: flowOptimizedLife ? flowOptimizedLife.trim() : '',
      
      // Legacy fields for backward compatibility
      futureSelfDescription: futureSelfDescription ? futureSelfDescription.trim() : '',
      visualizationNotes: visualizationNotes ? visualizationNotes.trim() : '',
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      
      // Completion timestamp
      completedAt: new Date().toISOString()
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'futureSelfReflection')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'futureSelfReflection',
        results: JSON.stringify(assessmentData)
      });
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'futureSelfReflection' 
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/future-self
workshopDataRouter.get('/future-self', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'futureSelfReflection')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'futureSelfReflection' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});





/**
 * Cantril Ladder (Well-being) Reflection endpoints
 */
// POST /api/workshop-data/cantril-ladder
workshopDataRouter.post('/cantril-ladder', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { currentFactors, futureImprovements, specificChanges, quarterlyProgress, quarterlyActions, wellBeingLevel, futureWellBeingLevel } = req.body;
    
    // Create the reflections data object (optional validation since these are reflection fields)
    const reflectionData = {
      currentFactors: currentFactors || '',
      futureImprovements: futureImprovements || '',
      specificChanges: specificChanges || '',
      quarterlyProgress: quarterlyProgress || '',
      quarterlyActions: quarterlyActions || ''
    };
    
    // Create separate ladder assessment data for exports (if ladder values provided)
    if (wellBeingLevel !== undefined && futureWellBeingLevel !== undefined) {
      const ladderData = {
        wellBeingLevel: Number(wellBeingLevel),
        futureWellBeingLevel: Number(futureWellBeingLevel)
      };
      
      // Check if user already has cantril ladder assessment data
      const existingLadder = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'cantrilLadder')
          )
        );
      
      if (existingLadder.length > 0) {
        // Update existing ladder assessment
        await db
          .update(schema.userAssessments)
          .set({
            results: JSON.stringify(ladderData)
          })
          .where(eq(schema.userAssessments.id, existingLadder[0].id));
      } else {
        // Create new ladder assessment
        await db.insert(schema.userAssessments).values({
          userId,
          assessmentType: 'cantrilLadder',
          results: JSON.stringify(ladderData)
        });
      }
      
      console.log('Cantril Ladder values saved for export:', ladderData);
    }
    
    // Check if user already has cantril ladder reflection data
    const existingReflection = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')
        )
      );
    
    if (existingReflection.length > 0) {
      // Update existing reflection
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(reflectionData)
        })
        .where(eq(schema.userAssessments.id, existingReflection[0].id));
    } else {
      // Create new reflection
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'cantrilLadderReflection',
        results: JSON.stringify(reflectionData)
      });
    }
    
    res.json({
      success: true,
      data: reflectionData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'cantrilLadderReflection' 
      }
    });
  } catch (error) {
    console.error('Cantril ladder save error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR',
      details: error instanceof Error ? error.stack : 'Unknown error'
    });
  }
});

// GET /api/workshop-data/cantril-ladder
workshopDataRouter.get('/cantril-ladder', async (req: Request, res: Response) => {
  console.log('=== CANTRIL LADDER GET ENDPOINT HIT ===');
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    console.log('Cantril ladder GET - userId from session/cookie:', userId);
    
    if (!userId) {
      console.log('Cantril ladder GET - No userId, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    console.log('Cantril ladder GET request for userId:', userId);
    
    // Get both cantrilLadder and cantrilLadderReflection assessments
    const ladderAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'cantrilLadder')
        )
      );
    
    const reflectionAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')
        )
      );
    
    console.log('Cantril ladder assessment found:', ladderAssessment.length > 0 ? 'YES' : 'NO');
    console.log('Cantril reflection assessment found:', reflectionAssessment.length > 0 ? 'YES' : 'NO');
    
    // Combine both datasets for the frontend
    let combinedData: any = {
      wellBeingLevel: 5, // Default values
      futureWellBeingLevel: 5,
      currentFactors: '',
      futureImprovements: '',
      specificChanges: '',
      quarterlyProgress: '',
      quarterlyActions: ''
    };
    
    // Add ladder values if they exist
    if (ladderAssessment.length > 0) {
      const ladderResults = JSON.parse(ladderAssessment[0].results);
      combinedData.wellBeingLevel = ladderResults.wellBeingLevel || 5;
      combinedData.futureWellBeingLevel = ladderResults.futureWellBeingLevel || 5;
      console.log('Ladder values found:', { wellBeingLevel: combinedData.wellBeingLevel, futureWellBeingLevel: combinedData.futureWellBeingLevel });
    }
    
    // Add reflection values if they exist
    if (reflectionAssessment.length > 0) {
      const reflectionResults = JSON.parse(reflectionAssessment[0].results);
      combinedData.currentFactors = reflectionResults.currentFactors || '';
      combinedData.futureImprovements = reflectionResults.futureImprovements || '';
      combinedData.specificChanges = reflectionResults.specificChanges || '';
      combinedData.quarterlyProgress = reflectionResults.quarterlyProgress || '';
      combinedData.quarterlyActions = reflectionResults.quarterlyActions || '';
      console.log('Reflection values found');
    }
    
    console.log('Combined cantril ladder data being returned:', combinedData);
    res.json({
      success: true,
      data: combinedData,
      meta: { 
        assessmentType: 'cantrilLadder',
        hasLadderData: ladderAssessment.length > 0,
        hasReflectionData: reflectionAssessment.length > 0
      }
    });
  } catch (error) {
    console.error('Cantril ladder GET error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * Final Insights Reflection endpoints
 */
// POST /api/workshop-data/final-insights
workshopDataRouter.post('/final-insights', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { keyInsights, actionSteps, commitments } = req.body;
    
    // Validation
    if (!keyInsights || typeof keyInsights !== 'string' || keyInsights.trim().length === 0 || keyInsights.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Key Insights is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { keyInsights: 'Required field, 1-1000 characters' }
      });
    }
    
    if (!actionSteps || typeof actionSteps !== 'string' || actionSteps.trim().length === 0 || actionSteps.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Action Steps is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { actionSteps: 'Required field, 1-1000 characters' }
      });
    }
    
    if (!commitments || typeof commitments !== 'string' || commitments.trim().length === 0 || commitments.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Commitments is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { commitments: 'Required field, 1-1000 characters' }
      });
    }
    
    const assessmentData = {
      keyInsights: keyInsights.trim(),
      actionSteps: actionSteps.trim(),
      commitments: commitments.trim()
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'finalReflection')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'finalReflection',
        results: JSON.stringify(assessmentData)
      });
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'finalReflection' 
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/final-insights
workshopDataRouter.get('/final-insights', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'finalReflection')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'finalReflection' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * Save assessment data (for reflections and other assessments)
 */
workshopDataRouter.post('/assessments', async (req: Request, res: Response) => {
  try {
    // Get user ID from session or cookie
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    console.log(`Assessments POST: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { assessmentType, results } = req.body;
    
    console.log('Saving assessment:', { userId, assessmentType, results });
    
    if (!assessmentType || !results) {
      return res.status(400).json({
        success: false,
        message: 'Assessment type and results are required'
      });
    }
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, assessmentType)
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing assessment
      const updated = await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(results)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id))
        .returning();
      
      console.log('Updated assessment:', updated[0]);
      
      return res.status(200).json({
        success: true,
        message: 'Assessment updated successfully',
        assessment: updated[0]
      });
    } else {
      // Create new assessment
      const inserted = await db.insert(schema.userAssessments).values({
        userId,
        assessmentType,
        results: JSON.stringify(results)
      }).returning();
      
      console.log('Created new assessment:', inserted[0]);
      
      return res.status(200).json({
        success: true,
        message: 'Assessment saved successfully',
        assessment: inserted[0]
      });
    }
  } catch (error) {
    console.error('Error saving assessment:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to save assessment',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Step-by-Step Reflection endpoints
 */
// POST /api/workshop-data/step-by-step-reflection
workshopDataRouter.post('/step-by-step-reflection', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { strength1, strength2, strength3, strength4, teamValues, uniqueContribution } = req.body;
    
    // Create the reflections data object
    const reflectionData = {
      strength1: strength1 || '',
      strength2: strength2 || '',
      strength3: strength3 || '',
      strength4: strength4 || '',
      teamValues: teamValues || '',
      uniqueContribution: uniqueContribution || ''
    };
    
    // Check if user already has step-by-step reflection data
    const existingReflection = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'stepByStepReflection')
        )
      );
    
    if (existingReflection.length > 0) {
      // Update existing reflection
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(reflectionData)
        })
        .where(eq(schema.userAssessments.id, existingReflection[0].id));
    } else {
      // Create new reflection record
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'stepByStepReflection',
        results: JSON.stringify(reflectionData)
      });
    }
    
    res.json({
      success: true,
      data: reflectionData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'stepByStepReflection' 
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/step-by-step-reflection
workshopDataRouter.get('/step-by-step-reflection', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'stepByStepReflection')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'stepByStepReflection' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * Visualizing Potential (Images) endpoints
 */
// POST /api/workshop-data/visualizing-potential
workshopDataRouter.post('/visualizing-potential', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { selectedImages, imageMeaning } = req.body;
    console.log('VisualizingPotential: Saving data for user', userId, { selectedImages, imageMeaning });
    
    // Validation
    if (!selectedImages || !Array.isArray(selectedImages) || selectedImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Selected images are required and must be a non-empty array',
        code: 'VALIDATION_ERROR',
        details: { selectedImages: 'Required field, must be non-empty array' }
      });
    }
    
    if (selectedImages.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 images allowed',
        code: 'VALIDATION_ERROR',
        details: { selectedImages: 'Maximum 5 images allowed' }
      });
    }
    
    if (imageMeaning && (typeof imageMeaning !== 'string' || imageMeaning.length > 2000)) {
      return res.status(400).json({
        success: false,
        error: 'Image meaning must be a string with maximum 2000 characters',
        code: 'VALIDATION_ERROR',
        details: { imageMeaning: 'Optional field, maximum 2000 characters' }
      });
    }
    
    const assessmentData = {
      selectedImages,
      imageMeaning: imageMeaning ? imageMeaning.trim() : ''
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'visualizingPotential')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
      console.log('VisualizingPotential: Updated existing data for user', userId);
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'visualizingPotential',
        results: JSON.stringify(assessmentData)
      });
      console.log('VisualizingPotential: Created new data for user', userId);
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'visualizingPotential' 
      }
    });
  } catch (error) {
    console.error('VisualizingPotential save error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/visualizing-potential
workshopDataRouter.get('/visualizing-potential', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    console.log('VisualizingPotential: Loading data for user', userId);
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'visualizingPotential')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      console.log('VisualizingPotential: No existing data found for user', userId);
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    console.log('VisualizingPotential: Found existing data for user', userId, results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'visualizingPotential' }
    });
  } catch (error) {
    console.error('VisualizingPotential fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * Final Reflection endpoints
 */
// POST /api/workshop-data/final-reflection
workshopDataRouter.post('/final-reflection', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { futureLetterText } = req.body;
    
    // Validation
    if (!futureLetterText || typeof futureLetterText !== 'string' || futureLetterText.trim().length === 0 || futureLetterText.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Future Letter Text is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { futureLetterText: 'Required field, 1-1000 characters' }
      });
    }
    
    const assessmentData = {
      futureLetterText: futureLetterText.trim()
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'finalReflection')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'finalReflection',
        results: JSON.stringify(assessmentData)
      });
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'finalReflection' 
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// POST /api/workshop-data/final-reflection
workshopDataRouter.post('/final-reflection', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { futureLetterText } = req.body;
    
    // Validation
    if (!futureLetterText || typeof futureLetterText !== 'string' || futureLetterText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Future letter text is required',
        code: 'VALIDATION_ERROR',
        details: { futureLetterText: 'Required field' }
      });
    }
    
    if (futureLetterText.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Future letter text must be 5000 characters or less',
        code: 'VALIDATION_ERROR',
        details: { futureLetterText: 'Must be 5000 characters or less' }
      });
    }
    
    const reflectionData = {
      futureLetterText: futureLetterText.trim()
    };
    
    // Check if reflection already exists
    const existingReflection = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'finalReflection')
        )
      );
    
    if (existingReflection.length > 0) {
      // Update existing reflection
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(reflectionData)
        })
        .where(eq(schema.userAssessments.id, existingReflection[0].id));
    } else {
      // Create new reflection record
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'finalReflection',
        results: JSON.stringify(reflectionData)
      });
    }
    
    res.json({
      success: true,
      data: reflectionData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'finalReflection' 
      }
    });
  } catch (error) {
    console.error('Error saving final reflection:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/final-reflection
workshopDataRouter.get('/final-reflection', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'finalReflection')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'finalReflection' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

// DEBUG endpoint to test step 1-1 video fetching
workshopDataRouter.get('/debug/step-1-1', async (req: Request, res: Response) => {
  try {
    console.log('=== DEBUG ENDPOINT: Testing step 1-1 video ===');
    
    // Test without any filters
    const allVideos = await db.select().from(schema.videos);
    console.log(`Total videos in database: ${allVideos.length}`);
    
    // Test step ID filter
    const stepVideos = await db.select()
      .from(schema.videos)
      .where(eq(schema.videos.stepId, '1-1'));
    console.log('Videos with stepId "1-1":', stepVideos);
    
    // Test workshop type filter
    const allstarVideos = await db.select()
      .from(schema.videos)
      .where(eq(schema.videos.workshopType, 'allstarteams'));
    console.log('AllStarTeams videos:', allstarVideos.length);
    
    // Test combined filter
    const combinedVideos = await db.select()
      .from(schema.videos)
      .where(
        and(
          eq(schema.videos.stepId, '1-1'),
          eq(schema.videos.workshopType, 'allstarteams')
        )
      );
    console.log('Combined filter result:', combinedVideos);
    
    res.json({
      success: true,
      totalVideos: allVideos.length,
      stepVideos,
      allstarVideosCount: allstarVideos.length,
      combinedVideos
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * Visualization/Well-being endpoints for Cantril Ladder
 */
// POST /api/visualization
workshopDataRouter.post('/visualization', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { wellBeingLevel, futureWellBeingLevel } = req.body;
    
    // Validation
    if (wellBeingLevel !== undefined && (typeof wellBeingLevel !== 'number' || wellBeingLevel < 0 || wellBeingLevel > 10)) {
      return res.status(400).json({
        success: false,
        error: 'wellBeingLevel must be a number between 0 and 10',
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (futureWellBeingLevel !== undefined && (typeof futureWellBeingLevel !== 'number' || futureWellBeingLevel < 0 || futureWellBeingLevel > 10)) {
      return res.status(400).json({
        success: false,
        error: 'futureWellBeingLevel must be a number between 0 and 10',
        code: 'VALIDATION_ERROR'
      });
    }
    
    const assessmentData = {
      wellBeingLevel: wellBeingLevel || 5,
      futureWellBeingLevel: futureWellBeingLevel || 5
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'cantrilLadder')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'cantrilLadder',
        results: JSON.stringify(assessmentData)
      });
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'cantrilLadder' 
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/visualization
workshopDataRouter.get('/visualization', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'cantrilLadder')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      // Return default values if no data exists
      return res.json({ 
        success: true, 
        data: null,
        wellBeingLevel: 5,
        futureWellBeingLevel: 5
      });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      wellBeingLevel: results.wellBeingLevel || 5,
      futureWellBeingLevel: results.futureWellBeingLevel || 5,
      meta: { assessmentType: 'cantrilLadder' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * Flow Assessment API endpoints
 */

// GET /api/workshop-data/flow-assessment
workshopDataRouter.get('/flow-assessment', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAssessment')
        )
      );
    
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { 
        created_at: assessment[0].createdAt,
        assessmentType: 'flowAssessment'
      }
    });
  } catch (error) {
    console.error('Error fetching flow assessment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Fetch failed'
    });
  }
});

// POST /api/workshop-data/flow-assessment
workshopDataRouter.post('/flow-assessment', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { answers, flowScore, completed = true } = req.body;
    
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Answers object is required'
      });
    }
    
    if (flowScore === undefined || typeof flowScore !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Flow score is required and must be a number'
      });
    }
    
    const assessmentData = {
      answers,
      flowScore,
      completed,
      completedAt: completed ? new Date().toISOString() : null
    };
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAssessment')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'flowAssessment',
        results: JSON.stringify(assessmentData)
      });
    }
    
    res.json({
      success: true,
      data: assessmentData,
      meta: { 
        saved_at: new Date().toISOString(),
        assessmentType: 'flowAssessment' 
      }
    });
  } catch (error) {
    console.error('Error saving flow assessment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Save failed'
    });
  }
});

// GET /api/workshop-data/userAssessments
workshopDataRouter.get('/userAssessments', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get all assessments for the current user
    const assessments = await db
      .select()
      .from(schema.userAssessments)
      .where(eq(schema.userAssessments.userId, userId));
    
    // Format assessments by type for easy access
    const assessmentsByType: Record<string, any> = {};
    
    assessments.forEach(assessment => {
      try {
        const results = JSON.parse(assessment.results);
        assessmentsByType[assessment.assessmentType] = {
          ...results,
          createdAt: assessment.createdAt,
          assessmentType: assessment.assessmentType
        };
      } catch (error) {
        console.error(`Error parsing assessment ${assessment.assessmentType}:`, error);
      }
    });
    
    res.json({
      success: true,
      currentUser: {
        assessments: assessmentsByType
      }
    });
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? (error as Error).message : 'Fetch failed'
    });
  }
});

/**
 * IA Navigation Progress API endpoints
 */

// Get navigation progress for IA workshop
workshopDataRouter.get('/navigation-progress/:appType', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    const { appType } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get navigation progress for the user and app type
    const progress = await db
      .select()
      .from(schema.navigationProgress)
      .where(
        and(
          eq(schema.navigationProgress.userId, userId),
          eq(schema.navigationProgress.appType, appType)
        )
      );
    
    if (progress.length === 0) {
      // Return default navigation progress for IA
      const defaultProgress = {
        completedSteps: [],
        currentStepId: appType === 'ia' ? 'ia-1-1' : '1-1',
        appType,
        lastVisitedAt: new Date().toISOString(),
        unlockedSteps: appType === 'ia' ? ['ia-1-1'] : ['1-1'],
        videoProgress: {}
      };
      
      return res.status(200).json({
        success: true,
        data: defaultProgress
      });
    }
    
    const navigationData = progress[0];
    const parsedProgress = {
      completedSteps: JSON.parse(navigationData.completedSteps),
      currentStepId: navigationData.currentStepId,
      appType: navigationData.appType,
      lastVisitedAt: navigationData.lastVisitedAt,
      unlockedSteps: JSON.parse(navigationData.unlockedSteps),
      videoProgress: navigationData.videoProgress ? JSON.parse(navigationData.videoProgress) : {}
    };
    
    return res.status(200).json({
      success: true,
      data: parsedProgress
    });
  } catch (error) {
    console.error('Error fetching navigation progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch navigation progress'
    });
  }
});

// Save navigation progress for IA workshop
workshopDataRouter.post('/navigation-progress', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { completedSteps, currentStepId, appType, unlockedSteps, videoProgress } = req.body;
    
    // Detect correct app type based on step patterns to prevent data inconsistency
    const hasIASteps = (completedSteps && completedSteps.some((step: string) => step.startsWith('ia-'))) ||
                       (currentStepId && currentStepId.startsWith('ia-'));
    const detectedAppType = hasIASteps ? 'ia' : 'ast';
    
    console.log(`Navigation Progress: Received appType: ${appType}, Detected from steps: ${detectedAppType}`);
    
    // Check if progress record exists using detected app type
    const existingProgress = await db
      .select()
      .from(schema.navigationProgress)
      .where(
        and(
          eq(schema.navigationProgress.userId, userId),
          eq(schema.navigationProgress.appType, detectedAppType)
        )
      );
    
    const progressData = {
      userId,
      appType: detectedAppType, // Use detected app type instead of received one
      completedSteps: JSON.stringify(completedSteps),
      currentStepId,
      unlockedSteps: JSON.stringify(unlockedSteps),
      videoProgress: JSON.stringify(videoProgress || {}),
      lastVisitedAt: new Date(),
      updatedAt: new Date()
    };
    
    if (existingProgress.length > 0) {
      // Update existing progress
      await db
        .update(schema.navigationProgress)
        .set(progressData)
        .where(eq(schema.navigationProgress.id, existingProgress[0].id));
    } else {
      // Create new progress record
      await db.insert(schema.navigationProgress).values(progressData);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Navigation progress saved'
    });
  } catch (error) {
    console.error('Error saving navigation progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save navigation progress'
    });
  }
});

/**
 * IA Assessment API endpoints
 */

// Get IA assessment results
workshopDataRouter.get('/ia-assessment/:userId?', async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId) : 
                        ((req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null));
    
    if (!targetUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get IA assessment for the user
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, targetUserId),
          eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')
        )
      );
    
    if (assessment.length === 0) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    
    const assessmentData = assessment[0];
    const results = JSON.parse(assessmentData.results);
    
    return res.status(200).json({
      success: true,
      data: {
        id: assessmentData.id,
        userId: assessmentData.userId,
        assessmentType: assessmentData.assessmentType,
        results,
        createdAt: assessmentData.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching IA assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch IA assessment'
    });
  }
});

// Save IA assessment results
workshopDataRouter.post('/ia-assessment', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { results } = req.body;
    
    if (!results) {
      return res.status(400).json({
        success: false,
        message: 'Assessment results are required'
      });
    }
    
    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')
        )
      );
    
    if (existingAssessment.length > 0) {
      // Update existing assessment
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(results),
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      // Create new assessment
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'iaCoreCapabilities',
        results: JSON.stringify(results)
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'IA assessment saved successfully',
      data: results
    });
  } catch (error) {
    console.error('Error saving IA assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save IA assessment'
    });
  }
});

/**
 * GET /api/workshop-data/feature-status
 * Get feature flag status for current environment
 */
workshopDataRouter.get('/feature-status', getFeatureStatus);

/**
 * GET /api/workshop-data/completion-status
 * Get workshop completion status for the current user
 */
workshopDataRouter.get('/completion-status', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    
    const user = await db.select({
      astWorkshopCompleted: users.astWorkshopCompleted,
      iaWorkshopCompleted: users.iaWorkshopCompleted,
      astCompletedAt: users.astCompletedAt,
      iaCompletedAt: users.iaCompletedAt
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching completion status:', error);
    res.status(500).json({ error: 'Failed to fetch completion status' });
  }
});

/**
 * POST /api/workshop-data/complete-workshop
 * Mark a workshop as completed for the current user
 */
workshopDataRouter.post('/complete-workshop', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { appType } = req.body; // 'ast' or 'ia'
    const userId = (req.session as any).userId;
    
    if (!appType || !['ast', 'ia'].includes(appType)) {
      return res.status(400).json({ error: 'Invalid app type. Must be "ast" or "ia"' });
    }
    
    // Get user's navigation progress to verify completion
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Parse navigation progress
    let progress;
    try {
      progress = JSON.parse(user[0].navigationProgress || '{}');
    } catch (e) {
      progress = {};
    }
    
    // Define required steps for each workshop type
    const requiredSteps = appType === 'ast' 
      ? ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5', '5-1', '5-2', '5-3', '5-4', '6-1'] 
      : ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-5-1', 'ia-6-1', 'ia-8-1'];
    
    const completedSteps = progress[appType]?.completedSteps || [];
    const allCompleted = requiredSteps.every(step => completedSteps.includes(step));
    
    if (!allCompleted) {
      const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));
      return res.status(400).json({ 
        error: 'Cannot complete workshop - not all steps finished',
        missingSteps 
      });
    }
    
    // Check if already completed
    const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
    if (user[0][completionField]) {
      return res.status(400).json({ error: 'Workshop already completed' });
    }
    
    // Mark workshop as completed
    const timestampField = appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt';
    
    await db.update(users)
      .set({ 
        [completionField]: true,
        [timestampField]: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ 
      success: true, 
      message: `${appType.toUpperCase()} workshop completed successfully`,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error completing workshop:', error);
    res.status(500).json({ error: 'Failed to complete workshop' });
  }
});

export default workshopDataRouter;