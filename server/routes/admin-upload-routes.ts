import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { users, userAssessments } from '../../shared/schema.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sql } from 'drizzle-orm';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

router.post('/users/upload', async (req, res) => {
  try {
    const { userInfo, password, navigationProgress: navProgress, assessments: assessmentData } = req.body;

    // Validate required fields
    if (!userInfo || !userInfo.name || !userInfo.email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: userInfo.name, userInfo.email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userInfo.email)
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using direct SQL to ensure proper field mapping
    const userResult = await db.execute(sql`
      INSERT INTO users (username, password, name, email, role, organization, job_title, is_test_user, profile_picture, navigation_progress, created_at, updated_at)
      VALUES (${userInfo.username}, ${hashedPassword}, ${userInfo.name}, ${userInfo.email}, ${userInfo.role || 'participant'}, ${userInfo.organization || ''}, ${userInfo.jobTitle || ''}, ${userInfo.isTestUser || true}, ${userInfo.profilePicture || null}, ${navProgress ? JSON.stringify(navProgress) : null}, ${new Date()}, ${new Date()})
      RETURNING id, username, name, email
    `);
    
    const newUser = userResult[0] as { id: number; username: string; name: string; email: string };

    let createdAssessments = [];

    // Create assessments if provided
    if (assessmentData) {
      for (const [assessmentType, assessmentDetails] of Object.entries(assessmentData)) {
        if (assessmentDetails && typeof assessmentDetails === 'object') {
          try {
            // Use the exact assessment type names expected by the StarCard service
            const assessmentTypeFormatted = assessmentType === 'starCard' ? 'starCard' : 
                           assessmentType === 'stepByStepReflection' ? 'stepByStepReflection' :
                           assessmentType === 'flowAssessment' ? 'flowAssessment' :
                           assessmentType === 'flowAttributes' ? 'flowAttributes' :
                           assessmentType === 'roundingOutReflection' ? 'roundingOutReflection' :
                           assessmentType === 'cantrilLadder' ? 'cantrilLadder' :
                           assessmentType === 'futureSelfReflection' ? 'futureSelfReflection' :
                           assessmentType === 'finalReflection' ? 'finalReflection' :
                           assessmentType;

            const result = await db.execute(sql`
              INSERT INTO user_assessments (user_id, assessment_type, results, created_at)
              VALUES (${newUser.id}, ${assessmentTypeFormatted}, ${JSON.stringify(assessmentDetails)}, ${new Date()})
              RETURNING *
            `);
            
            createdAssessments.push({ assessmentType: assessmentTypeFormatted });
            console.log(`Created assessment ${assessmentType} for user ${newUser.id}`);
          } catch (error) {
            console.error(`Error creating assessment ${assessmentType}:`, error);
          }
        }
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        jobTitle: newUser.jobTitle,
        isTestUser: newUser.isTestUser
      },
      assessmentsCreated: createdAssessments.length,
      navigationProgressCreated: !!navProgress
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;