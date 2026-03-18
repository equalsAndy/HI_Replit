import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { users } from '../../shared/schema.js';

// Shared PostgreSQL pool for raw SQL queries
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Generate and store StarCard PNG in photo service after workshop completion
 */
export async function generateAndStoreStarCard(userId: number): Promise<void> {
  try {
    console.log(`🎨 Generating StarCard PNG for user ${userId}...`);

    // Import photo storage service
    const { photoStorageService } = await import('../services/photo-storage-service.js');

    // Get user's assessment data for StarCard generation
    const assessments = await db
      .select()
      .from(schema.userAssessments)
      .where(eq(schema.userAssessments.userId, userId));

    // Find the starCard assessment
    const starCardAssessment = assessments.find(a => a.assessmentType === 'starCard');
    let starCardData;

    if (!starCardAssessment) {
      console.warn(`⚠️ No StarCard assessment found for user ${userId}, using default values`);
      starCardData = { thinking: 25, acting: 25, feeling: 25, planning: 25 };
    } else {
      try {
        starCardData = JSON.parse(starCardAssessment.results);
        console.log(`📊 Found StarCard data for user ${userId}:`, starCardData);
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse StarCard data for user ${userId}, using defaults:`, parseError);
        starCardData = { thinking: 25, acting: 25, feeling: 25, planning: 25 };
      }
    }

    const starCardImageBuffer = await createStarCardImagePlaceholder(userId, starCardData);
    const base64Data = `data:image/png;base64,${starCardImageBuffer.toString('base64')}`;
    const photoId = await photoStorageService.storeStarCard(userId, base64Data, starCardData);

    console.log(`✅ StarCard PNG generated and stored separately for user ${userId} with photo ID: ${photoId}`);

  } catch (error) {
    console.error(`❌ Failed to generate StarCard for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Create a placeholder StarCard image (until proper generation is built)
 */
export async function createStarCardImagePlaceholder(userId: number, starCardData: any): Promise<Buffer> {
  const placeholderBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5E, 0x5D, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  console.log(`📝 Created placeholder StarCard image (${placeholderBuffer.length} bytes)`);
  return placeholderBuffer;
}

/**
 * Authentication middleware for workshop data endpoints
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
    userId = (req.session as any).userId;
  }

  (req.session as any).userId = userId;
  next();
};

/**
 * Helper function to determine which module a step belongs to
 */
export const getStepModule = (stepId: string): 1 | 2 | 3 | 4 | 5 | null => {
  if (!stepId) return null;

  if (stepId.match(/^[1-5]-[1-9]$/)) {
    return parseInt(stepId.split('-')[0]) as 1 | 2 | 3 | 4 | 5;
  }

  if (stepId.match(/^ia-[1-5]-[1-9]$/)) {
    return parseInt(stepId.split('-')[1]) as 1 | 2 | 3 | 4 | 5;
  }

  return null;
};

/**
 * Helper function to check if a module should be locked
 */
export const isModuleLocked = (module: number, isWorkshopCompleted: boolean, workshopType: string = 'ast'): boolean => {
  if (module >= 1 && module <= 3) {
    return isWorkshopCompleted;
  } else if (module >= 4 && module <= 5) {
    if (workshopType === 'ia') return false;
    return !isWorkshopCompleted;
  }
  return false;
};

/**
 * Enhanced middleware to check workshop completion status with module-specific locking
 */
export const checkWorkshopLocked = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as any).userId;
    const appType = req.body.workshopType || req.body.appType || req.params.appType || 'ast';

    if (!['ast', 'ia'].includes(appType)) {
      return next();
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
    const isWorkshopCompleted = user[0][completionField as keyof typeof user[0]] as boolean;
    const stepId = req.body.stepId || req.params.stepId || req.body.data?.stepId;

    if (stepId) {
      const module = getStepModule(stepId);

      if (module && isModuleLocked(module, isWorkshopCompleted, appType)) {
        const lockReason = isWorkshopCompleted
          ? `Module ${module} is locked because the workshop is completed`
          : `Module ${module} is locked until the workshop is completed`;

        return res.status(403).json({
          error: lockReason,
          workshopType: appType.toUpperCase(),
          stepId,
          module,
          isWorkshopCompleted,
          completedAt: user[0][appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt' as keyof typeof user[0]]
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error checking workshop lock status:', error);
    res.status(500).json({ error: 'Failed to check workshop lock status' });
  }
};
