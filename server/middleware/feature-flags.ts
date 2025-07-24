import { Request, Response, NextFunction } from 'express';
import { isFeatureEnabled, featureFlags, validateFlagConfiguration, getAIFeatures, getFlagsByEnvironment } from '../utils/feature-flags.js';
import { generateFlagReport, runAllTests, enableAIFeaturesForDevelopment } from '../utils/flagTesting.js';

export function requireFeature(featureName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isFeatureEnabled(featureName, process.env.ENVIRONMENT)) {
      next();
    } else {
      res.status(404).json({ 
        error: `Feature '${featureName}' not available in current environment`,
        environment: process.env.ENVIRONMENT || 'production'
      });
    }
  };
}

// Enhanced feature status endpoint
export function getFeatureStatus(req: Request, res: Response) {
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
    }, {} as Record<string, any>);
    
  res.json({
    environment,
    features,
    validation: validateFlagConfiguration(),
    aiFeatures: getAIFeatures()
  });
}

// Comprehensive flag monitoring endpoint
export function getDetailedFlagStatus(req: Request, res: Response) {
  try {
    const report = generateFlagReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate flag report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Development endpoint to run flag tests
export function runFlagTests(req: Request, res: Response) {
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
  } catch (error) {
    res.status(500).json({
      error: 'Failed to run flag tests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Development endpoint to safely enable AI features
export function enableAIFeatures(req: Request, res: Response) {
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
    } else {
      res.status(400).json({
        error: result.message,
        changes: result.changes
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to enable AI features',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
