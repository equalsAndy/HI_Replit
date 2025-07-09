import { db } from '../db.js';
import { users, userAssessments, workshopParticipation, navigationProgress } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

export interface ExportData {
  userInfo: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    organization?: string | null;
    jobTitle?: string | null;
    profilePicture?: string | null;
    isTestUser: boolean;
    createdAt: string;
    updatedAt: string;
  };
  navigationProgress: any;
  assessments: Record<string, any>;
  workshopParticipation: any[];
  exportMetadata: {
    exportedAt: string;
    exportedBy: string;
    dataVersion: string;
    workshopSteps: string;
    totalAssessments: number;
  };
}

export class ExportService {
  /**
   * Export all user data including assessments, navigation progress, and workshop participation
   * @param userId The user ID to export data for
   * @param exportedBy The username or name of the admin performing the export
   * @returns Promise resolving to complete user export data
   */
  public static async exportUserData(userId: number, exportedBy: string): Promise<ExportData> {
    try {
      // Get user info
      const userResult = await db.select().from(users).where(eq(users.id, userId));
      if (!userResult.length) {
        throw new Error('User not found');
      }

      const user = userResult[0];

      // Get all assessments for the user
      const assessments = await db.select()
        .from(userAssessments)
        .where(eq(userAssessments.userId, userId));

      // Get workshop participation data
      const participation = await db.select()
        .from(workshopParticipation)
        .where(eq(workshopParticipation.userId, userId));

      // Get navigation progress from dedicated navigationProgress table
      const astProgressRecords = await db.select()
        .from(navigationProgress)
        .where(and(
          eq(navigationProgress.userId, userId),
          eq(navigationProgress.appType, 'ast')
        ));

      const iaProgressRecords = await db.select()
        .from(navigationProgress)
        .where(and(
          eq(navigationProgress.userId, userId),
          eq(navigationProgress.appType, 'ia')
        ));

      // Build navigation progress object
      let navProgress: any = null;
      if (astProgressRecords.length > 0 || iaProgressRecords.length > 0) {
        navProgress = {};
        
        if (astProgressRecords.length > 0) {
          const astRecord = astProgressRecords[0];
          navProgress.ast = {
            currentStepId: astRecord.currentStepId,
            completedSteps: JSON.parse(astRecord.completedSteps),
            unlockedSteps: astRecord.unlockedSteps ? JSON.parse(astRecord.unlockedSteps) : [],
            videoProgress: astRecord.videoProgress ? JSON.parse(astRecord.videoProgress) : {},
            lastVisitedAt: astRecord.lastVisitedAt?.toISOString()
          };
        }
        
        if (iaProgressRecords.length > 0) {
          const iaRecord = iaProgressRecords[0];
          navProgress.ia = {
            currentStepId: iaRecord.currentStepId,
            completedSteps: JSON.parse(iaRecord.completedSteps),
            unlockedSteps: iaRecord.unlockedSteps ? JSON.parse(iaRecord.unlockedSteps) : [],
            videoProgress: iaRecord.videoProgress ? JSON.parse(iaRecord.videoProgress) : {},
            lastVisitedAt: iaRecord.lastVisitedAt?.toISOString()
          };
        }
      }

      // Structure the export data according to the specification
      const exportData: ExportData = {
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          jobTitle: user.jobTitle,
          profilePicture: user.profilePicture,
          isTestUser: user.isTestUser,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        navigationProgress: navProgress,
        assessments: {},
        workshopParticipation: participation.map(p => ({
          workshopId: p.workshopId,
          progress: p.progress,
          completed: p.completed,
          startedAt: p.startedAt.toISOString(),
          completedAt: p.completedAt ? p.completedAt.toISOString() : null,
          lastAccessedAt: p.lastAccessedAt.toISOString()
        })),
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: exportedBy,
          dataVersion: '2.0',
          workshopSteps: '2-1 through 4-5',
          totalAssessments: assessments.length
        }
      };

      // Process assessments by type with actual field structures
      // Initialize combined Cantril Ladder data structure
      let cantrilLadderData = {
        wellBeingLevel: 5,
        futureWellBeingLevel: 5,
        currentFactors: '',
        futureImprovements: '',
        specificChanges: '',
        quarterlyProgress: '',
        quarterlyActions: '',
        createdAt: ''
      };

      // First pass: collect all assessments by type
      const assessmentsByType: Record<string, any[]> = {};
      assessments.forEach(assessment => {
        if (!assessmentsByType[assessment.assessmentType]) {
          assessmentsByType[assessment.assessmentType] = [];
        }
        assessmentsByType[assessment.assessmentType].push(assessment);
      });

      // Process Cantril Ladder assessments first to merge them
      if (assessmentsByType['cantrilLadder']) {
        assessmentsByType['cantrilLadder'].forEach(assessment => {
          try {
            const results = JSON.parse(assessment.results);
            cantrilLadderData.wellBeingLevel = results.wellBeingLevel || results.currentLevel || 5;
            cantrilLadderData.futureWellBeingLevel = results.futureWellBeingLevel || results.futureLevel || 5;
            cantrilLadderData.createdAt = assessment.createdAt.toISOString();
          } catch (error) {
            console.error('Error parsing cantrilLadder assessment:', error);
          }
        });
      }

      if (assessmentsByType['cantrilLadderReflection']) {
        assessmentsByType['cantrilLadderReflection'].forEach(assessment => {
          try {
            const results = JSON.parse(assessment.results);
            cantrilLadderData.currentFactors = results.currentFactors || '';
            cantrilLadderData.futureImprovements = results.futureImprovements || '';
            cantrilLadderData.specificChanges = results.specificChanges || '';
            cantrilLadderData.quarterlyProgress = results.quarterlyProgress || '';
            cantrilLadderData.quarterlyActions = results.quarterlyActions || '';
            // Update timestamp if reflection is newer
            const reflectionTime = new Date(assessment.createdAt).getTime();
            const currentTime = cantrilLadderData.createdAt ? 
              new Date(cantrilLadderData.createdAt).getTime() : 0;
            if (reflectionTime > currentTime) {
              cantrilLadderData.createdAt = assessment.createdAt.toISOString();
            }
          } catch (error) {
            console.error('Error parsing cantrilLadderReflection assessment:', error);
          }
        });
      }

      // Add merged Cantril Ladder data if we have any Cantril assessments
      if (assessmentsByType['cantrilLadder'] || assessmentsByType['cantrilLadderReflection']) {
        exportData.assessments['cantrilLadder'] = cantrilLadderData;
      }

      // Process all other assessment types (excluding Cantril types since they're already handled)
      Object.entries(assessmentsByType).forEach(([assessmentType, typeAssessments]) => {
        if (assessmentType === 'cantrilLadder' || assessmentType === 'cantrilLadderReflection') {
          return; // Skip - already processed above
        }

        try {
          if (assessmentType === 'flowAttributes') {
            // Special handling for flow attributes
            const latest = typeAssessments[typeAssessments.length - 1];
            const results = JSON.parse(latest.results);
            exportData.assessments[assessmentType] = {
              flowScore: results.flowScore || 0,
              attributes: results.attributes || [],
              createdAt: latest.createdAt.toISOString()
            };
          } else {
            // Standard assessment handling
            const latest = typeAssessments[typeAssessments.length - 1];
            const results = JSON.parse(latest.results);
            exportData.assessments[assessmentType] = {
              ...results,
              createdAt: latest.createdAt.toISOString()
            };
          }
        } catch (error) {
          console.error(`Error parsing assessment ${assessmentType} for user ${userId}:`, error);
          // Include raw data if JSON parsing fails
          const latest = typeAssessments[typeAssessments.length - 1];
          exportData.assessments[assessmentType] = {
            rawData: latest.results,
            createdAt: latest.createdAt.toISOString(),
            parseError: 'Failed to parse JSON'
          };
        }
      });

      return exportData;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`);
    }
  }

  /**
   * Get a summary of exportable data for a user (for validation)
   * @param userId The user ID to validate
   * @returns Promise resolving to validation summary
   */
  public static async validateUserData(userId: number) {
    try {
      // Get user info
      const userResult = await db.select({ 
        username: users.username
      }).from(users).where(eq(users.id, userId));
      
      if (!userResult.length) {
        throw new Error('User not found');
      }

      // Get assessments count
      const assessments = await db.select()
        .from(userAssessments)
        .where(eq(userAssessments.userId, userId));

      // Check for navigation progress in dedicated table
      const navProgressRecords = await db.select()
        .from(navigationProgress)
        .where(eq(navigationProgress.userId, userId));

      return {
        userId,
        username: userResult[0].username,
        assessmentCount: assessments.length,
        assessmentTypes: assessments.map(a => a.assessmentType),
        hasNavigationProgress: navProgressRecords.length > 0,
        navigationProgressTypes: navProgressRecords.map(r => r.appType),
        dataIntegrity: 'valid',
        lastUpdate: assessments.length > 0 ? 
          Math.max(...assessments.map(a => new Date(a.createdAt).getTime())) : null
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error instanceof Error ? (error as Error).message : 'Unknown error'}`);
    }
  }
}