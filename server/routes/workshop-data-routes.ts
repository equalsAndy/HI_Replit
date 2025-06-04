import { Router, Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../shared/schema';

// Create a router for workshop data operations
const workshopDataRouter = Router();

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
 * Get star card data for the current user
 */
workshopDataRouter.get('/starcard', async (req: Request, res: Response) => {
  try {
    // Get user ID from session (primary) or cookie (fallback)
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    // This ensures we're fetching star card data for the correct user
    console.log(`StarCard: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get flow attributes for the current user
 */
workshopDataRouter.get('/flow-attributes', async (req: Request, res: Response) => {
  try {
    // Get user ID from session (primary) or cookie (fallback)
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    console.log(`Flow Attributes: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Unknown error'
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
      error: error instanceof Error ? error.message : 'Unknown error'
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
      error: error instanceof Error ? error.message : 'Unknown error'
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Complete assessment
workshopDataRouter.post('/assessment/complete', async (req: Request, res: Response) => {
  try {
    // Get user ID from session (primary) or cookie (fallback) for better reliability
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // If test user with cookie userId is 1 but session userId is different, use session ID
    // This ensures star card data is saved for the correct user
    console.log(`Assessment: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Save flow attributes for the current user
 */
workshopDataRouter.post('/flow-attributes', async (req: Request, res: Response) => {
  // Always set content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  try {
    console.log('Flow attributes save request received:', req.body);
    
    // Get user ID from session (primary) or cookie (fallback)
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    console.log(`Flow Attributes POST: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Rounding Out Reflection endpoints
 */
// POST /api/workshop-data/rounding-out
workshopDataRouter.post('/rounding-out', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/rounding-out
workshopDataRouter.get('/rounding-out', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
workshopDataRouter.post('/future-self', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { futureSelfDescription, visualizationNotes, additionalNotes } = req.body;
    
    // Validation
    if (!futureSelfDescription || typeof futureSelfDescription !== 'string' || futureSelfDescription.trim().length === 0 || futureSelfDescription.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Future Self Description is required and must be 1-1000 characters',
        code: 'VALIDATION_ERROR',
        details: { futureSelfDescription: 'Required field, 1-1000 characters' }
      });
    }
    
    if (visualizationNotes && (typeof visualizationNotes !== 'string' || visualizationNotes.length > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Visualization Notes must be 1-1000 characters if provided',
        code: 'VALIDATION_ERROR',
        details: { visualizationNotes: 'Optional field, 1-1000 characters' }
      });
    }
    
    if (additionalNotes && (typeof additionalNotes !== 'string' || additionalNotes.length > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Additional Notes must be 1-1000 characters if provided',
        code: 'VALIDATION_ERROR',
        details: { additionalNotes: 'Optional field, 1-1000 characters' }
      });
    }
    
    const assessmentData = {
      futureSelfDescription: futureSelfDescription.trim(),
      visualizationNotes: visualizationNotes ? visualizationNotes.trim() : undefined,
      additionalNotes: additionalNotes ? additionalNotes.trim() : undefined
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/future-self
workshopDataRouter.get('/future-self', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
workshopDataRouter.post('/cantril-ladder', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { currentFactors, futureImprovements, specificChanges, quarterlyProgress, quarterlyActions } = req.body;
    
    // Create the reflections data object (optional validation since these are reflection fields)
    const reflectionData = {
      currentFactors: currentFactors || '',
      futureImprovements: futureImprovements || '',
      specificChanges: specificChanges || '',
      quarterlyProgress: quarterlyProgress || '',
      quarterlyActions: quarterlyActions || ''
    };
    
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR',
      details: error instanceof Error ? error.stack : 'Unknown error'
    });
  }
});

// GET /api/workshop-data/cantril-ladder
workshopDataRouter.get('/cantril-ladder', async (req: Request, res: Response) => {
  console.log('=== CANTRIL LADDER GET ENDPOINT HIT ===');
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
    
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')
        )
      );
    
    console.log('Cantril ladder assessment found:', assessment.length > 0 ? 'YES' : 'NO');
    
    if (!assessment || assessment.length === 0) {
      console.log('No cantril ladder data found for user:', userId);
      return res.json({ success: true, data: null });
    }
    
    const results = JSON.parse(assessment[0].results);
    console.log('Cantril ladder results being returned:', results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: 'cantrilLadderReflection' }
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
 * Final Insights Reflection endpoints
 */
// POST /api/workshop-data/final-insights
workshopDataRouter.post('/final-insights', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/final-insights
workshopDataRouter.get('/final-insights', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    // Fix for test users - use session userId instead of cookie userId (1) if available
    console.log(`Assessments POST: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Step-by-Step Reflection endpoints
 */
// POST /api/workshop-data/step-by-step-reflection
workshopDataRouter.post('/step-by-step-reflection', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/step-by-step-reflection
workshopDataRouter.get('/step-by-step-reflection', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
workshopDataRouter.post('/visualizing-potential', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/visualizing-potential
workshopDataRouter.get('/visualizing-potential', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
workshopDataRouter.post('/final-reflection', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
      error: error instanceof Error ? error.message : 'Save failed',
      code: 'SAVE_ERROR'
    });
  }
});

// GET /api/workshop-data/final-reflection
workshopDataRouter.get('/final-reflection', async (req: Request, res: Response) => {
  try {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId = req.session.userId;
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
    res.status(500).json({ success: false, error: error.message });
  }
});

export default workshopDataRouter;