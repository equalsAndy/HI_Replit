import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, userAssessments } from '../../shared/schema';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

router.post('/users/upload', async (req, res) => {
  try {
    const { userInfo, password, navigationProgress: navProgress, assessments: userAssessments } = req.body;

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

    // Create user
    const [newUser] = await db.insert(users).values({
      username: userInfo.username,
      name: userInfo.name,
      email: userInfo.email,
      password: hashedPassword,
      role: userInfo.role || 'participant',
      organization: userInfo.organization || '',
      jobTitle: userInfo.jobTitle || '',
      isTestUser: userInfo.isTestUser || true,
      profilePicture: userInfo.profilePicture || null,
      navigationProgress: navProgress ? JSON.stringify(navProgress) : null
    }).returning();

    let createdAssessments = [];

    // Create assessments if provided
    if (userAssessments) {
      for (const [assessmentType, assessmentData] of Object.entries(userAssessments)) {
        if (assessmentData && typeof assessmentData === 'object') {
          try {
            const [assessment] = await db.insert(userAssessments).values({
              userId: newUser.id,
              assessmentType: assessmentType === 'starCard' ? 'star_card' : 
                           assessmentType === 'stepByStepReflection' ? 'step_by_step_reflection' :
                           assessmentType === 'flowAssessment' ? 'flow_assessment' :
                           assessmentType === 'flowAttributes' ? 'flow_attributes' :
                           assessmentType === 'roundingOutReflection' ? 'rounding_out_reflection' :
                           assessmentType === 'cantrilLadder' ? 'cantril_ladder' :
                           assessmentType === 'futureSelfReflection' ? 'future_self_reflection' :
                           assessmentType === 'finalReflection' ? 'final_reflection' :
                           assessmentType,
              results: JSON.stringify(assessmentData),
              createdAt: (assessmentData as any).createdAt ? new Date((assessmentData as any).createdAt) : new Date()
            }).returning();
            
            createdAssessments.push(assessment);
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
      navigationProgressCreated: !!createdNavProgress
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