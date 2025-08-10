import { featureFlags, isFeatureEnabled, validateFlagConfiguration, getAIFeatures, getFlagsByEnvironment } from './feature-flags.js';
export const testSuites = {
    aiSafety: {
        name: 'AI Safety Tests',
        tests: [
            {
                name: 'AI features disabled in production',
                flag: 'holisticReports',
                environment: 'production',
                expectedEnabled: false,
                description: 'AI holistic reports should be disabled in production'
            },
            {
                name: 'AI coaching disabled in production',
                flag: 'aiCoaching',
                environment: 'production',
                expectedEnabled: false,
                description: 'AI coaching should be disabled in production'
            },
            {
                name: 'AI features available in development',
                flag: 'holisticReports',
                environment: 'development',
                expectedEnabled: false,
                description: 'AI features should be available for development testing'
            }
        ]
    },
    dependencies: {
        name: 'Dependency Validation Tests',
        tests: [
            {
                name: 'AI coaching requires holistic reports',
                flag: 'aiCoaching',
                environment: 'development',
                expectedEnabled: false,
                description: 'AI coaching should be disabled when holisticReports is disabled'
            }
        ]
    },
    environmentSeparation: {
        name: 'Environment Separation Tests',
        tests: [
            {
                name: 'Debug panel only in development',
                flag: 'debugPanel',
                environment: 'production',
                expectedEnabled: false,
                description: 'Debug panel should only be available in development'
            },
            {
                name: 'Debug panel enabled in development',
                flag: 'debugPanel',
                environment: 'development',
                expectedEnabled: true,
                description: 'Debug panel should be enabled in development'
            },
            {
                name: 'Video management available everywhere',
                flag: 'videoManagement',
                environment: 'production',
                expectedEnabled: true,
                description: 'Video management should work in all environments'
            },
            {
                name: 'Video management in staging',
                flag: 'videoManagement',
                environment: 'staging',
                expectedEnabled: true,
                description: 'Video management should work in staging'
            }
        ]
    }
};
export function runFlagTest(test) {
    try {
        const enabled = isFeatureEnabled(test.flag, test.environment);
        const passed = enabled === test.expectedEnabled;
        return {
            flagName: test.flag,
            environment: test.environment,
            enabled,
            expected: test.expectedEnabled,
            passed,
            error: passed ? undefined : `Expected ${test.expectedEnabled}, got ${enabled}`
        };
    }
    catch (error) {
        return {
            flagName: test.flag,
            environment: test.environment,
            enabled: false,
            expected: test.expectedEnabled,
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
export function runTestSuite(suiteName) {
    const suite = testSuites[suiteName];
    if (!suite) {
        throw new Error(`Test suite '${suiteName}' not found`);
    }
    const results = suite.tests.map(runFlagTest);
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    return { results, passed, failed };
}
export function runAllTests() {
    const allResults = {};
    for (const suiteName of Object.keys(testSuites)) {
        allResults[suiteName] = runTestSuite(suiteName);
    }
    return allResults;
}
export function generateFlagReport() {
    const validation = validateFlagConfiguration();
    const aiFeatures = getAIFeatures();
    const environments = {
        development: getFlagsByEnvironment('development'),
        staging: getFlagsByEnvironment('staging'),
        production: getFlagsByEnvironment('production')
    };
    const testResults = runAllTests();
    return {
        validation,
        aiFeatures,
        environments,
        testResults
    };
}
export function simulateFlagChange(flagName, enabled, environment) {
    const originalFlag = featureFlags[flagName];
    if (!originalFlag) {
        throw new Error(`Flag '${flagName}' does not exist`);
    }
    const tempFlag = { ...originalFlag, enabled };
    featureFlags[flagName] = tempFlag;
    try {
        const relevantTests = [];
        relevantTests.push({
            name: `${flagName} simulation`,
            flag: flagName,
            environment,
            expectedEnabled: enabled,
            description: `Simulating ${flagName} as ${enabled ? 'enabled' : 'disabled'}`
        });
        Object.entries(featureFlags).forEach(([name, flag]) => {
            if (flag.dependencies && flag.dependencies.includes(flagName)) {
                relevantTests.push({
                    name: `${name} dependency check`,
                    flag: name,
                    environment,
                    expectedEnabled: enabled && flag.enabled,
                    description: `Testing ${name} which depends on ${flagName}`
                });
            }
        });
        return relevantTests.map(runFlagTest);
    }
    finally {
        featureFlags[flagName] = originalFlag;
    }
}
export function enableAIFeaturesForDevelopment() {
    const environment = process.env.ENVIRONMENT || 'production';
    if (environment !== 'development') {
        return {
            success: false,
            message: 'AI features can only be enabled in development environment',
            changes: []
        };
    }
    const changes = [];
    const aiFeatureNames = Object.keys(getAIFeatures());
    aiFeatureNames.forEach(flagName => {
        const flag = featureFlags[flagName];
        if (flag && !flag.enabled) {
            featureFlags[flagName] = { ...flag, enabled: true };
            changes.push(`Enabled ${flagName} for development`);
        }
    });
    const validation = validateFlagConfiguration();
    if (!validation.valid) {
        return {
            success: false,
            message: `Failed to enable AI features: ${validation.errors.join(', ')}`,
            changes: []
        };
    }
    return {
        success: true,
        message: 'AI features enabled for development',
        changes
    };
}
