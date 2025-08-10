import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { featureFlags, isFeatureEnabled } from '../utils/feature-flags.js';
import { db } from '../db.js';
const router = Router();
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
router.get('/admin/feature-flags', requireAuth, requireAdmin, async (req, res) => {
    try {
        const environment = process.env.ENVIRONMENT || 'production';
        const flagsStatus = {};
        for (const [flagName, flag] of Object.entries(featureFlags)) {
            flagsStatus[flagName] = {
                name: flagName,
                enabled: isFeatureEnabled(flagName),
                environment: flag.environment,
                description: flag.description,
                aiRelated: flag.aiRelated || false
            };
        }
        res.json({
            flags: flagsStatus,
            environment
        });
    }
    catch (error) {
        console.error('Error getting feature flags:', error);
        res.status(500).json({ error: 'Failed to get feature flags' });
    }
});
router.post('/admin/feature-flags/toggle', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { flagName, enabled } = req.body;
        if (!flagName || typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'flagName and enabled (boolean) are required' });
        }
        if (!featureFlags[flagName]) {
            return res.status(404).json({ error: 'Feature flag not found' });
        }
        featureFlags[flagName].enabled = enabled;
        console.log(`🔄 Feature flag '${flagName}' ${enabled ? 'enabled' : 'disabled'} by admin`);
        res.json({
            success: true,
            flagName,
            enabled: featureFlags[flagName].enabled,
            message: `Feature flag '${flagName}' ${enabled ? 'enabled' : 'disabled'}`
        });
    }
    catch (error) {
        console.error('Error toggling feature flag:', error);
        res.status(500).json({ error: 'Failed to toggle feature flag' });
    }
});
router.get('/admin/reports/health-check', requireAuth, requireAdmin, async (req, res) => {
    try {
        const startTime = Date.now();
        let isWorking = false;
        let hasRealData = false;
        let error;
        try {
            const testUserId = 1;
            console.log('🔍 Health check: Testing report generation...');
            const userResult = await db.execute('SELECT id, name, email, ast_workshop_completed FROM users WHERE id = ?', [testUserId]);
            if (userResult.length === 0) {
                throw new Error('Test user not found');
            }
            const user = userResult[0];
            console.log(`🔍 Health check: User found - ID: ${user.id}, completed: ${user.ast_workshop_completed}`);
            if (!user.ast_workshop_completed) {
                error = 'Test user has not completed workshop';
                return res.json({
                    isWorking: false,
                    responseTime: Date.now() - startTime,
                    hasRealData: false,
                    error
                });
            }
            const assessmentResult = await db.execute('SELECT assessment_type, results FROM user_assessments WHERE user_id = ? AND results IS NOT NULL', [testUserId]);
            console.log(`🔍 Health check: Found ${assessmentResult.length} assessments`);
            if (assessmentResult.length === 0) {
                error = 'No assessment data found for test user';
                return res.json({
                    isWorking: false,
                    responseTime: Date.now() - startTime,
                    hasRealData: false,
                    error
                });
            }
            const { generateOpenAICoachingResponse } = await import('../services/openai-api-service.js');
            const testResponse = await generateOpenAICoachingResponse({
                userMessage: 'Quick health check - respond with exactly "HEALTH_CHECK_OK" if you can process data',
                personaType: 'star_report',
                userName: user.name || 'Test User',
                contextData: {
                    reportContext: 'health_check',
                    userData: { assessments: assessmentResult, user },
                    selectedUserName: user.name
                },
                userId: testUserId,
                sessionId: 'health-check',
                maxTokens: 50
            });
            const responseTime = Date.now() - startTime;
            hasRealData = assessmentResult.length > 0;
            isWorking = testResponse.includes('HEALTH_CHECK_OK') ||
                (testResponse.length > 10 && responseTime > 300);
            console.log(`🔍 Health check results: Working: ${isWorking}, Real data: ${hasRealData}, Time: ${responseTime}ms`);
            res.json({
                isWorking,
                responseTime,
                hasRealData,
                error: !isWorking ? 'System may be generating fallback content' : undefined
            });
        }
        catch (testError) {
            error = testError instanceof Error ? testError.message : 'Unknown error during test';
            console.error('🔍 Health check failed:', error);
            res.json({
                isWorking: false,
                responseTime: Date.now() - startTime,
                hasRealData: false,
                error
            });
        }
    }
    catch (error) {
        console.error('Error in health check:', error);
        res.status(500).json({ error: 'Health check failed' });
    }
});
router.post('/admin/reports/test-generation', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { testUserId = 1 } = req.body;
        const startTime = Date.now();
        console.log('🧪 Starting comprehensive report generation test...');
        const userResult = await db.execute('SELECT id, name, email, ast_workshop_completed FROM users WHERE id = ?', [testUserId]);
        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Test user not found' });
        }
        const user = userResult[0];
        const assessmentResult = await db.execute('SELECT assessment_type, results FROM user_assessments WHERE user_id = ? AND results IS NOT NULL', [testUserId]);
        const stepDataResult = await db.execute('SELECT step_id, step_data FROM user_step_data WHERE user_id = ? AND step_data IS NOT NULL', [testUserId]);
        console.log(`🧪 Test data: ${assessmentResult.length} assessments, ${stepDataResult.length} step data`);
        const { generateOpenAICoachingResponse } = await import('../services/openai-api-service.js');
        const testReport = await generateOpenAICoachingResponse({
            userMessage: 'Generate a Personal Development Report for this user based on their complete workshop data.',
            personaType: 'star_report',
            userName: user.name || 'Test User',
            contextData: {
                reportContext: 'holistic_generation',
                userData: {
                    assessments: assessmentResult,
                    stepData: stepDataResult,
                    user
                },
                selectedUserName: user.name,
                selectedUserId: testUserId
            },
            userId: testUserId,
            sessionId: 'admin-test',
            maxTokens: 4000
        });
        const responseTime = Date.now() - startTime;
        const isWorking = testReport.length > 200 && responseTime > 1000;
        const hasRealData = testReport.includes(user.name) &&
            (testReport.includes('%') ||
                testReport.includes('assessment') ||
                testReport.includes('workshop') ||
                testReport.includes('strength'));
        const analysis = {
            isWorking,
            hasRealData,
            responseTime,
            reportLength: testReport.length,
            containsUserName: testReport.includes(user.name || 'Test User'),
            containsPercentages: testReport.includes('%'),
            containsAssessmentRefs: testReport.includes('assessment'),
            reportPreview: testReport.substring(0, 200) + '...'
        };
        console.log('🧪 Test results:', analysis);
        res.json({
            success: true,
            ...analysis,
            message: isWorking && hasRealData ?
                'Report generation is working with real data!' :
                'Report generation has issues - likely generating fallback content'
        });
    }
    catch (error) {
        console.error('Error testing report generation:', error);
        res.status(500).json({
            error: 'Failed to test report generation',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
