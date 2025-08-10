import { isFeatureEnabled, featureFlags, validateFlagConfiguration, getAIFeatures } from '../utils/feature-flags.js';
import { generateFlagReport, runAllTests, enableAIFeaturesForDevelopment } from '../utils/flagTesting.js';
export function requireFeature(featureName) {
    return (req, res, next) => {
        if (isFeatureEnabled(featureName, process.env.ENVIRONMENT)) {
            next();
        }
        else {
            res.status(404).json({
                error: `Feature '${featureName}' not available in current environment`,
                environment: process.env.ENVIRONMENT || 'production'
            });
        }
    };
}
export function getFeatureStatus(req, res) {
    const environment = process.env.ENVIRONMENT || 'production';
    const features = Object.entries(featureFlags)
        .reduce((acc, [name, flag]) => {
        acc[name] = {
            enabled: isFeatureEnabled(name, environment),
            environment: flag.environment,
            description: flag.description,
            aiRelated: flag.aiRelated || false,
            dependencies: flag.dependencies || []
        };
        return acc;
    }, {});
    res.json({
        environment,
        features,
        validation: validateFlagConfiguration(),
        aiFeatures: getAIFeatures()
    });
}
export function getDetailedFlagStatus(req, res) {
    try {
        const report = generateFlagReport();
        res.json(report);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to generate flag report',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export function runFlagTests(req, res) {
    const environment = process.env.ENVIRONMENT || 'production';
    if (environment !== 'development') {
        return res.status(403).json({
            error: 'Flag testing is only available in development environment'
        });
    }
    try {
        const results = runAllTests();
        const totalTests = Object.values(results).reduce((sum, suite) => sum + suite.results.length, 0);
        const totalPassed = Object.values(results).reduce((sum, suite) => sum + suite.passed, 0);
        const totalFailed = totalTests - totalPassed;
        res.json({
            summary: {
                totalTests,
                passed: totalPassed,
                failed: totalFailed,
                successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) + '%' : '0%'
            },
            results
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to run flag tests',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
export function enableAIFeatures(req, res) {
    const environment = process.env.ENVIRONMENT || 'production';
    if (environment !== 'development') {
        return res.status(403).json({
            error: 'AI features can only be enabled in development environment'
        });
    }
    try {
        const result = enableAIFeaturesForDevelopment();
        if (result.success) {
            res.json({
                message: result.message,
                changes: result.changes,
                aiFeatures: getAIFeatures()
            });
        }
        else {
            res.status(400).json({
                error: result.message,
                changes: result.changes
            });
        }
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to enable AI features',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
