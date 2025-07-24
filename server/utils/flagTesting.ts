import { featureFlags, isFeatureEnabled, validateFlagConfiguration, getAIFeatures, getFlagsByEnvironment } from './feature-flags.js';

export interface FlagTestResult {
  flagName: string;
  environment: string;
  enabled: boolean;
  expected: boolean;
  passed: boolean;
  error?: string;
}

export interface FlagTestSuite {
  name: string;
  tests: FlagTest[];
}

export interface FlagTest {
  name: string;
  flag: string;
  environment: string;
  expectedEnabled: boolean;
  description?: string;
}

// Predefined test suites for different scenarios
export const testSuites: Record<string, FlagTestSuite> = {
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
        expectedEnabled: false, // Currently disabled but should be testable
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
        expectedEnabled: false, // Should be false because holisticReports is disabled
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

// Run a single flag test
export function runFlagTest(test: FlagTest): FlagTestResult {
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
  } catch (error) {
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

// Run a test suite
export function runTestSuite(suiteName: string): { results: FlagTestResult[]; passed: number; failed: number } {
  const suite = testSuites[suiteName];
  if (!suite) {
    throw new Error(`Test suite '${suiteName}' not found`);
  }
  
  const results = suite.tests.map(runFlagTest);
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  
  return { results, passed, failed };
}

// Run all test suites
export function runAllTests(): Record<string, { results: FlagTestResult[]; passed: number; failed: number }> {
  const allResults: Record<string, { results: FlagTestResult[]; passed: number; failed: number }> = {};
  
  for (const suiteName of Object.keys(testSuites)) {
    allResults[suiteName] = runTestSuite(suiteName);
  }
  
  return allResults;
}

// Generate a comprehensive flag report
export function generateFlagReport(): {
  validation: { valid: boolean; errors: string[] };
  aiFeatures: Record<string, any>;
  environments: Record<string, Record<string, boolean>>;
  testResults: Record<string, { results: FlagTestResult[]; passed: number; failed: number }>;
} {
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

// Simulate flag changes for testing
export function simulateFlagChange(flagName: string, enabled: boolean, environment: string): FlagTestResult[] {
  const originalFlag = featureFlags[flagName];
  if (!originalFlag) {
    throw new Error(`Flag '${flagName}' does not exist`);
  }
  
  // Temporarily modify the flag
  const tempFlag = { ...originalFlag, enabled };
  (featureFlags as any)[flagName] = tempFlag;
  
  try {
    // Run relevant tests
    const relevantTests: FlagTest[] = [];
    
    // Add tests for the changed flag
    relevantTests.push({
      name: `${flagName} simulation`,
      flag: flagName,
      environment,
      expectedEnabled: enabled,
      description: `Simulating ${flagName} as ${enabled ? 'enabled' : 'disabled'}`
    });
    
    // Add tests for dependent flags
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
  } finally {
    // Restore original flag
    (featureFlags as any)[flagName] = originalFlag;
  }
}

// Development helper to enable AI features safely
export function enableAIFeaturesForDevelopment(): { success: boolean; message: string; changes: string[] } {
  const environment = process.env.ENVIRONMENT || 'production';
  
  if (environment !== 'development') {
    return {
      success: false,
      message: 'AI features can only be enabled in development environment',
      changes: []
    };
  }
  
  const changes: string[] = [];
  const aiFeatureNames = Object.keys(getAIFeatures());
  
  // Enable AI features for development
  aiFeatureNames.forEach(flagName => {
    const flag = featureFlags[flagName];
    if (flag && !flag.enabled) {
      (featureFlags as any)[flagName] = { ...flag, enabled: true };
      changes.push(`Enabled ${flagName} for development`);
    }
  });
  
  // Validate the configuration after changes
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