import { db } from '../db.js';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import type { SnapshotData } from '../../shared/schema.js';

/**
 * Snapshot service for demo account functionality
 * Captures and restores complete workshop data for demonstration purposes
 */
export class SnapshotService {
  /**
   * Check if user has completed AST workshop (modules 1-3)
   * @param userId The user ID to check
   * @returns Promise with completion status and missing items
   */
  public static async isAstWorkshopComplete(userId: number): Promise<{
    isComplete: boolean;
    missing: string[];
  }> {
    try {
      console.log(`Checking AST workshop completion for user ${userId}`);
      const missing: string[] = [];

      // Get all user assessments
      const assessments = await db
        .select()
        .from(schema.userAssessments)
        .where(eq(schema.userAssessments.userId, userId));

      const assessmentTypes = new Set(assessments.map(a => a.assessmentType));

      // Required AST assessments for modules 1-3
      const required = {
        'starCard': 'Star Card (Strengths Assessment)',
        'flowAttributes': 'Flow Assessment',
        'stepByStepReflection': 'Step-by-Step Reflection (all 6 steps)',
        'cantrilLadder': 'Cantril Ladder (Well-being)',
        'visualizingYou': 'Visualizing You (Future Self)',
        'roundingOut': 'Rounding Out Reflection'
      };

      // Check each required assessment
      for (const [type, name] of Object.entries(required)) {
        if (!assessmentTypes.has(type)) {
          console.log(`User ${userId} missing: ${name}`);
          missing.push(name);
        }
      }

      const isComplete = missing.length === 0;

      if (isComplete) {
        console.log(`User ${userId} has completed AST workshop (modules 1-3)`);
      } else {
        console.log(`User ${userId} incomplete. Missing: ${missing.join(', ')}`);
      }

      return { isComplete, missing };
    } catch (error) {
      console.error(`Error checking AST workshop completion for user ${userId}:`, error);
      return { isComplete: false, missing: ['Error checking completion status'] };
    }
  }

  /**
   * Capture complete AST workshop data snapshot
   * @param userId The user ID whose data to capture
   * @param capturedBy The admin user ID performing the capture
   * @returns Promise resolving to snapshot ID and metadata
   */
  public static async captureAstSnapshot(
    userId: number,
    capturedBy: number
  ): Promise<{
    success: boolean;
    message: string;
    snapshotId?: number;
    metadata?: {
      assessments: number;
      reflections: number;
      stepData: number;
      reports: number;
    };
    error?: string;
  }> {
    console.log(`=== SNAPSHOT SERVICE: Capturing AST snapshot for user ${userId} ===`);

    try {
      // Verify workshop is complete
      const completionStatus = await this.isAstWorkshopComplete(userId);
      if (!completionStatus.isComplete) {
        const missingItems = completionStatus.missing.join(', ');
        return {
          success: false,
          message: `AST workshop incomplete. Missing: ${missingItems}`,
          error: `User must complete all AST workshop components (modules 1-3) before creating a demo account. Missing: ${missingItems}`
        };
      }

      // Step 1: Capture all user assessments
      const assessments = await db
        .select()
        .from(schema.userAssessments)
        .where(eq(schema.userAssessments.userId, userId));

      console.log(`Captured ${assessments.length} assessments for user ${userId}`);

      // Step 2: Capture all reflection responses
      const reflections = await db
        .select()
        .from(schema.reflectionResponses)
        .where(eq(schema.reflectionResponses.userId, userId));

      console.log(`Captured ${reflections.length} reflection responses for user ${userId}`);

      // Step 3: Capture all workshop step data
      const stepData = await db
        .select()
        .from(schema.workshopStepData)
        .where(eq(schema.workshopStepData.userId, userId));

      console.log(`Captured ${stepData.length} workshop step data entries for user ${userId}`);

      // Step 4: Capture navigation progress
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      const navigationProgress = user[0]?.navigationProgress
        ? JSON.parse(user[0].navigationProgress)
        : {};

      console.log(`Captured navigation progress for user ${userId}`);

      // Step 5: Capture holistic reports (if any)
      const reports = await db
        .select()
        .from(schema.holisticReports)
        .where(eq(schema.holisticReports.userId, userId));

      console.log(`Captured ${reports.length} holistic reports for user ${userId}`);

      // Construct snapshot data
      const snapshotData: SnapshotData = {
        userAssessments: assessments.map(a => ({
          assessmentType: a.assessmentType,
          results: a.results,
          answers: undefined, // TODO: Extract from results if available
        })),
        reflectionResponses: reflections.map(r => ({
          reflectionSetId: r.reflectionSetId,
          reflectionId: r.reflectionId,
          response: r.response || '',
          completed: r.completed,
        })),
        workshopStepData: stepData.map(s => ({
          stepId: s.stepId,
          data: s.data,
        })),
        navigationProgress,
        holisticReports: reports.map(r => ({
          reportType: r.reportType,
          htmlContent: r.htmlContent || '',
          generatedAt: r.createdAt?.toISOString() || new Date().toISOString(),
        })),
      };

      // Step 6: Upsert snapshot to database
      // Check if snapshot already exists
      const existingSnapshot = await db
        .select()
        .from(schema.demoSnapshots)
        .where(
          and(
            eq(schema.demoSnapshots.userId, userId),
            eq(schema.demoSnapshots.workshopType, 'ast')
          )
        )
        .limit(1);

      let snapshotId: number;

      if (existingSnapshot.length > 0) {
        // Update existing snapshot
        await db
          .update(schema.demoSnapshots)
          .set({
            snapshotData: snapshotData as any,
            createdAt: new Date(),
            createdBy: capturedBy,
          })
          .where(eq(schema.demoSnapshots.id, existingSnapshot[0].id));

        snapshotId = existingSnapshot[0].id;
        console.log(`Updated existing AST snapshot ${snapshotId} for user ${userId}`);
      } else {
        // Insert new snapshot
        const result = await db
          .insert(schema.demoSnapshots)
          .values({
            userId,
            workshopType: 'ast',
            snapshotData: snapshotData as any,
            createdBy: capturedBy,
          })
          .returning({ id: schema.demoSnapshots.id });

        snapshotId = result[0].id;
        console.log(`Created new AST snapshot ${snapshotId} for user ${userId}`);
      }

      const metadata = {
        assessments: assessments.length,
        reflections: reflections.length,
        stepData: stepData.length,
        reports: reports.length,
      };

      console.log(`=== SNAPSHOT SERVICE: Successfully captured AST snapshot ${snapshotId} ===`);

      return {
        success: true,
        message: 'AST snapshot captured successfully',
        snapshotId,
        metadata,
      };
    } catch (error) {
      console.error(`Error capturing AST snapshot for user ${userId}:`, error);
      return {
        success: false,
        message: 'Failed to capture AST snapshot',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load AST snapshot data for a demo account
   * @param userId The demo account user ID
   * @param stepId Optional step ID to filter data
   * @returns Promise resolving to snapshot data
   */
  public static async loadAstSnapshot(
    userId: number,
    stepId?: string
  ): Promise<{
    success: boolean;
    data?: SnapshotData;
    error?: string;
  }> {
    try {
      console.log(`Loading AST snapshot for user ${userId}${stepId ? ` at step ${stepId}` : ''}`);

      const snapshot = await db
        .select()
        .from(schema.demoSnapshots)
        .where(
          and(
            eq(schema.demoSnapshots.userId, userId),
            eq(schema.demoSnapshots.workshopType, 'ast')
          )
        )
        .limit(1);

      if (snapshot.length === 0) {
        console.log(`No AST snapshot found for user ${userId}`);
        return {
          success: false,
          error: 'No snapshot available',
        };
      }

      const snapshotData = snapshot[0].snapshotData as SnapshotData;

      // If stepId is provided, filter data relevant to that step
      // For now, return all data - component can filter as needed

      console.log(`Successfully loaded AST snapshot for user ${userId}`);
      return {
        success: true,
        data: snapshotData,
      };
    } catch (error) {
      console.error(`Error loading AST snapshot for user ${userId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Restore demo account from AST snapshot
   * Delete current workshop data and repopulate from snapshot
   * @param userId The demo account user ID
   * @returns Promise resolving to success status
   */
  public static async restoreFromAstSnapshot(
    userId: number
  ): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    console.log(`=== SNAPSHOT SERVICE: Restoring user ${userId} from AST snapshot ===`);

    try {
      // Load the snapshot first
      const snapshotResult = await this.loadAstSnapshot(userId);

      if (!snapshotResult.success || !snapshotResult.data) {
        return {
          success: false,
          message: 'No snapshot available to restore from',
          error: snapshotResult.error,
        };
      }

      const snapshotData = snapshotResult.data;

      // Step 1: Delete existing workshop data
      await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM reflection_responses WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM workshop_step_data WHERE user_id = ${userId}`);
      await db.execute(sql`DELETE FROM holistic_reports WHERE user_id = ${userId}`);

      console.log(`Deleted existing workshop data for user ${userId}`);

      // Step 2: Restore assessments
      for (const assessment of snapshotData.userAssessments) {
        await db.insert(schema.userAssessments).values({
          userId,
          assessmentType: assessment.assessmentType,
          results: assessment.results,
        });
      }
      console.log(`Restored ${snapshotData.userAssessments.length} assessments`);

      // Step 3: Restore reflections
      for (const reflection of snapshotData.reflectionResponses) {
        await db.insert(schema.reflectionResponses).values({
          userId,
          reflectionSetId: reflection.reflectionSetId,
          reflectionId: reflection.reflectionId,
          response: reflection.response,
          completed: reflection.completed,
        });
      }
      console.log(`Restored ${snapshotData.reflectionResponses.length} reflections`);

      // Step 4: Restore workshop step data
      for (const step of snapshotData.workshopStepData) {
        await db.insert(schema.workshopStepData).values({
          userId,
          stepId: step.stepId,
          data: step.data as any,
        });
      }
      console.log(`Restored ${snapshotData.workshopStepData.length} workshop steps`);

      // Step 5: Restore navigation progress
      await db
        .update(schema.users)
        .set({ navigationProgress: JSON.stringify(snapshotData.navigationProgress) })
        .where(eq(schema.users.id, userId));

      console.log(`Restored navigation progress`);

      console.log(`=== SNAPSHOT SERVICE: Successfully restored user ${userId} from snapshot ===`);

      return {
        success: true,
        message: 'Workshop data restored from snapshot successfully',
      };
    } catch (error) {
      console.error(`Error restoring from AST snapshot for user ${userId}:`, error);
      return {
        success: false,
        message: 'Failed to restore from snapshot',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
