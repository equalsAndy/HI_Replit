import { validateFlagConfiguration, featureFlags, isFeatureEnabled } from '../utils/feature-flags.js';
export function validateFlagsOnStartup() {
    const validation = validateFlagConfiguration();
    if (!validation.valid) {
        console.error('❌ Feature flag configuration validation failed:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        if (process.env.NODE_ENV === 'production') {
            console.error('🚨 Exiting due to invalid feature flag configuration in production');
            process.exit(1);
        }
        console.warn('⚠️  Continuing with invalid flag configuration (development mode)');
    }
    else {
        console.log('✅ Feature flag configuration is valid');
    }
}
export function validateProductionFlags(req, res, next) {
    const environment = process.env.ENVIRONMENT || 'production';
    if (environment !== 'production') {
        return next();
    }
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
export function requireDevelopment(req, res, next) {
    const environment = process.env.ENVIRONMENT || 'production';
    if (environment !== 'development') {
        return res.status(404).json({
            error: 'This endpoint is only available in development environment',
            environment
        });
    }
    next();
}
export function logFeatureAccess(featureName) {
    return (req, res, next) => {
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
export function validateFlagDependencies(flagName) {
    return (req, res, next) => {
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
