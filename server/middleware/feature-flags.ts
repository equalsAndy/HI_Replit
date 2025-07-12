import { Request, Response, NextFunction } from 'express';
import { isFeatureEnabled } from '../utils/feature-flags.js';

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

export function getFeatureStatus(req: Request, res: Response) {
  const environment = process.env.ENVIRONMENT || 'production';
  const features = Object.entries(require('../utils/feature-flags.js').featureFlags)
    .reduce((acc, [name, flag]) => {
      acc[name] = isFeatureEnabled(name, environment);
      return acc;
    }, {} as Record<string, boolean>);
    
  res.json({
    environment,
    features
  });
}

