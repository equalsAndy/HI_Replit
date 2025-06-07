import { db } from '../db';
import { users, userAssessments, workshopParticipation } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
        navigationProgress: user.navigationProgress ? 
          JSON.parse(user.navigationProgress) : null,
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
      // First pass: collect all assessments by type
      const assessmentsByType: Record<string, any[]> = {};
      assessments.forEach(assessment => {
        if (!assessmentsByType[assessment.assessmentType]) {
          assessmentsByType[assessment.assessmentType] = [];
        }
        assessmentsByType[assessment.assessmentType].push(assessment);
      });

      // Process each assessment type
      Object.entries(assessmentsByType).forEach(([assessmentType, typeAssessments]) => {
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
          } else if (assessmentType === 'cantrilLadder' || assessmentType === 'cantrilLadderReflection') {
            // Special handling for Cantril Ladder data - combine both types
            if (!exportData.assessments['cantrilLadder']) {
              exportData.assessments['cantrilLadder'] = {
                wellBeingLevel: 5,
                futureWellBeingLevel: 5,
                currentFactors: '',
                futureImprovements: '',
                specificChanges: '',
                quarterlyProgress: '',
                quarterlyActions: '',
                createdAt: ''
              };
            }

            // Process each assessment and merge data
            typeAssessments.forEach(assessment => {
              const results = JSON.parse(assessment.results);
              
              if (assessmentType === 'cantrilLadder') {
                // Handle ladder values
                exportData.assessments['cantrilLadder'].wellBeingLevel = results.wellBeingLevel || results.currentLevel || 5;
                exportData.assessments['cantrilLadder'].futureWellBeingLevel = results.futureWellBeingLevel || results.futureLevel || 5;
                exportData.assessments['cantrilLadder'].createdAt = assessment.createdAt.toISOString();
              } else if (assessmentType === 'cantrilLadderReflection') {
                // Handle reflection fields
                exportData.assessments['cantrilLadder'].currentFactors = results.currentFactors || '';
                exportData.assessments['cantrilLadder'].futureImprovements = results.futureImprovements || '';
                exportData.assessments['cantrilLadder'].specificChanges = results.specificChanges || '';
                exportData.assessments['cantrilLadder'].quarterlyProgress = results.quarterlyProgress || '';
                exportData.assessments['cantrilLadder'].quarterlyActions = results.quarterlyActions || '';
                // Update timestamp if reflection is newer
                const reflectionTime = new Date(assessment.createdAt).getTime();
                const currentTime = exportData.assessments['cantrilLadder'].createdAt ? 
                  new Date(exportData.assessments['cantrilLadder'].createdAt).getTime() : 0;
                if (reflectionTime > currentTime) {
                  exportData.assessments['cantrilLadder'].createdAt = assessment.createdAt.toISOString();
                }
              }
            });
            
            // Skip separate export of cantrilLadderReflection since it's merged into cantrilLadder
            return;
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
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        username: users.username,
        navigationProgress: users.navigationProgress 
      }).from(users).where(eq(users.id, userId));
      
      if (!userResult.length) {
        throw new Error('User not found');
      }

      // Get assessments count
      const assessments = await db.select()
        .from(userAssessments)
        .where(eq(userAssessments.userId, userId));

      return {
        userId,
        username: userResult[0].username,
        assessmentCount: assessments.length,
        assessmentTypes: assessments.map(a => a.assessmentType),
        hasNavigationProgress: !!userResult[0].navigationProgress,
        dataIntegrity: 'valid',
        lastUpdate: assessments.length > 0 ? 
          Math.max(...assessments.map(a => new Date(a.createdAt).getTime())) : null
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}