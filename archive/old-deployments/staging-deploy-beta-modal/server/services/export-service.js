import { db } from '../db.js';
import { users, userAssessments, workshopParticipation, navigationProgress, workshopStepData } from '../../shared/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
export class ExportService {
    static async exportUserData(userId, exportedBy) {
        try {
            const userResult = await db.select().from(users).where(eq(users.id, userId));
            if (!userResult.length) {
                throw new Error('User not found');
            }
            const user = userResult[0];
            const assessments = await db.select()
                .from(userAssessments)
                .where(eq(userAssessments.userId, userId));
            const participation = await db.select()
                .from(workshopParticipation)
                .where(eq(workshopParticipation.userId, userId));
            const astProgressRecords = await db.select()
                .from(navigationProgress)
                .where(and(eq(navigationProgress.userId, userId), eq(navigationProgress.appType, 'ast')));
            const iaProgressRecords = await db.select()
                .from(navigationProgress)
                .where(and(eq(navigationProgress.userId, userId), eq(navigationProgress.appType, 'ia')));
            const allWorkshopSteps = await db.select()
                .from(workshopStepData)
                .where(and(eq(workshopStepData.userId, userId), isNull(workshopStepData.deletedAt)));
            const astStepData = {};
            const iaStepData = {};
            allWorkshopSteps.forEach(step => {
                const stepData = {
                    data: step.data,
                    version: step.version,
                    createdAt: step.createdAt.toISOString(),
                    updatedAt: step.updatedAt.toISOString()
                };
                if (step.workshopType === 'ast') {
                    astStepData[step.stepId] = stepData;
                }
                else if (step.workshopType === 'ia') {
                    iaStepData[step.stepId] = stepData;
                }
            });
            let navProgress = null;
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
            const exportData = {
                userInfo: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    jobTitle: user.jobTitle,
                    profilePicture: null,
                    isTestUser: user.isTestUser,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString()
                },
                navigationProgress: navProgress,
                assessments: {},
                workshopStepData: {
                    ast: astStepData,
                    ia: iaStepData
                },
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
                    dataVersion: '2.1',
                    workshopSteps: 'AST: 2-1 through 4-5, IA: ia-1-1 through ia-4-6',
                    totalAssessments: assessments.length,
                    totalWorkshopSteps: allWorkshopSteps.length
                }
            };
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
            const assessmentsByType = {};
            assessments.forEach(assessment => {
                if (!assessmentsByType[assessment.assessmentType]) {
                    assessmentsByType[assessment.assessmentType] = [];
                }
                assessmentsByType[assessment.assessmentType].push(assessment);
            });
            if (assessmentsByType['cantrilLadder']) {
                assessmentsByType['cantrilLadder'].forEach(assessment => {
                    try {
                        const results = JSON.parse(assessment.results);
                        cantrilLadderData.wellBeingLevel = results.wellBeingLevel || results.currentLevel || 5;
                        cantrilLadderData.futureWellBeingLevel = results.futureWellBeingLevel || results.futureLevel || 5;
                        cantrilLadderData.createdAt = assessment.createdAt.toISOString();
                    }
                    catch (error) {
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
                        const reflectionTime = new Date(assessment.createdAt).getTime();
                        const currentTime = cantrilLadderData.createdAt ?
                            new Date(cantrilLadderData.createdAt).getTime() : 0;
                        if (reflectionTime > currentTime) {
                            cantrilLadderData.createdAt = assessment.createdAt.toISOString();
                        }
                    }
                    catch (error) {
                        console.error('Error parsing cantrilLadderReflection assessment:', error);
                    }
                });
            }
            if (assessmentsByType['cantrilLadder'] || assessmentsByType['cantrilLadderReflection']) {
                exportData.assessments['cantrilLadder'] = cantrilLadderData;
            }
            Object.entries(assessmentsByType).forEach(([assessmentType, typeAssessments]) => {
                if (assessmentType === 'cantrilLadder' || assessmentType === 'cantrilLadderReflection') {
                    return;
                }
                try {
                    if (assessmentType === 'flowAttributes') {
                        const latest = typeAssessments[typeAssessments.length - 1];
                        const results = JSON.parse(latest.results);
                        exportData.assessments[assessmentType] = {
                            flowScore: results.flowScore || 0,
                            attributes: results.attributes || [],
                            createdAt: latest.createdAt.toISOString()
                        };
                    }
                    else {
                        const latest = typeAssessments[typeAssessments.length - 1];
                        const results = JSON.parse(latest.results);
                        exportData.assessments[assessmentType] = {
                            ...results,
                            createdAt: latest.createdAt.toISOString()
                        };
                    }
                }
                catch (error) {
                    console.error(`Error parsing assessment ${assessmentType} for user ${userId}:`, error);
                    const latest = typeAssessments[typeAssessments.length - 1];
                    exportData.assessments[assessmentType] = {
                        rawData: latest.results,
                        createdAt: latest.createdAt.toISOString(),
                        parseError: 'Failed to parse JSON'
                    };
                }
            });
            return exportData;
        }
        catch (error) {
            console.error('Export failed:', error);
            throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static async validateUserData(userId) {
        try {
            const userResult = await db.select({
                username: users.username
            }).from(users).where(eq(users.id, userId));
            if (!userResult.length) {
                throw new Error('User not found');
            }
            const assessments = await db.select()
                .from(userAssessments)
                .where(eq(userAssessments.userId, userId));
            const navProgressRecords = await db.select()
                .from(navigationProgress)
                .where(eq(navigationProgress.userId, userId));
            const workshopSteps = await db.select()
                .from(workshopStepData)
                .where(and(eq(workshopStepData.userId, userId), isNull(workshopStepData.deletedAt)));
            const astSteps = workshopSteps.filter(s => s.workshopType === 'ast');
            const iaSteps = workshopSteps.filter(s => s.workshopType === 'ia');
            return {
                userId,
                username: userResult[0].username,
                assessmentCount: assessments.length,
                assessmentTypes: assessments.map(a => a.assessmentType),
                hasNavigationProgress: navProgressRecords.length > 0,
                navigationProgressTypes: navProgressRecords.map(r => r.appType),
                workshopStepCounts: {
                    ast: astSteps.length,
                    ia: iaSteps.length,
                    total: workshopSteps.length
                },
                workshopStepIds: {
                    ast: astSteps.map(s => s.stepId),
                    ia: iaSteps.map(s => s.stepId)
                },
                dataIntegrity: 'valid',
                lastUpdate: assessments.length > 0 ?
                    Math.max(...assessments.map(a => new Date(a.createdAt).getTime())) : null
            };
        }
        catch (error) {
            throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
