import { Request, Response, NextFunction } from 'express';
import { validateFlagConfiguration, featureFlags, isFeatureEnabled } from '../utils/feature-flags.js';

// Middleware to validate flag configuration on startup
export function validateFlagsOnStartup() {
  const validation = validateFlagConfiguration();
  
  if (!validation.valid) {
    console.error('❌ Feature flag configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    // In production, exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Exiting due to invalid feature flag configuration in production');
      process.exit(1);
    }
    
    // In development, log warnings but continue
    console.warn('⚠️  Continuing with invalid flag configuration (development mode)');
  } else {
    console.log('✅ Feature flag configuration is valid');
  }
}

// Middleware to prevent deployment with AI features enabled in production
export function validateProductionFlags(req: Request, res: Response, next: NextFunction) {
  const environment = process.env.ENVIRONMENT || 'production';
  
  // Only run in production builds
  if (environment !== 'production') {
    return next();
  }
  
  // Check for AI features enabled in production
  const aiFeatures = Object.entries(featureFlags)
    .filter(([_, flag]) => flag.aiRelated && isFeatureEnabled(_, environment))
    .map(([name]) => name);
  
  if (aiFeatures.length > 0) {
    console.error('🚨 AI features detected in production environment:', aiFeatures);
    return res.status(500).json({
      error: 'Invalid configuration: AI features are not allowed in production',
      features: aiFeatures,
      environment
    });
  }
  
  next();
}

// Middleware for development-only routes
export function requireDevelopment(req: Request, res: Response, next: NextFunction) {
  const environment = process.env.ENVIRONMENT || 'production';
  
  if (environment !== 'development') {
    return res.status(404).json({
      error: 'This endpoint is only available in development environment',
      environment
    });
  }
  
  next();
}

// Middleware to log feature flag access
export function logFeatureAccess(featureName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const environment = process.env.ENVIRONMENT || 'production';
    const enabled = isFeatureEnabled(featureName, environment);
    
    console.log(`🚩 Feature access: ${featureName} - ${enabled ? 'ENABLED' : 'DISABLED'} (${environment})`);
    
    if (!enabled) {
      return res.status(404).json({
        error: `Feature '${featureName}' is not available`,
        environment,
        feature: featureName
      });
    }
    
    next();
  };
}

// Middleware to validate flag dependencies before enabling
export function validateFlagDependencies(flagName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const flag = featureFlags[flagName];
    
    if (!flag) {
      return res.status(400).json({
        error: `Unknown feature flag: ${flagName}`
      });
    }
    
    if (flag.dependencies && flag.dependencies.length > 0) {
      const environment = process.env.ENVIRONMENT || 'production';
      const missingDeps = flag.dependencies.filter(dep => !isFeatureEnabled(dep, environment));
      
      if (missingDeps.length > 0) {
        return res.status(400).json({
          error: `Feature '${flagName}' requires the following features to be enabled: ${missingDeps.join(', ')}`,
          missingDependencies: missingDeps,
          environment
        });
      }
    }
    
    next();
  };
}