// Environment-aware Auth0 configuration manager
export interface AuthEnvironmentConfig {
  domain: string;
  clientId: string;
  audience: string;
  redirectUri: string;
  environment: 'development' | 'staging' | 'production';
  databaseType: string;
}

export class AuthEnvironmentManager {
  private static getEnvironment(): 'development' | 'staging' | 'production' {
    const env = process.env.ENVIRONMENT || process.env.NODE_ENV || 'development';
    
    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    
    
    return 'development';
  }

  public static getAuthConfig(): AuthEnvironmentConfig {
    const environment = this.getEnvironment();

    // Each environment has its own Auth0 tenant. Custom domain only on prod.
    const envConfigs = {
      development: {
        domain: process.env.VITE_AUTH0_DOMAIN_DEV || 'dev-y4g4ug6epxi167a4.us.auth0.com',
        audience: 'https://api.heliotropeimaginal.com',
        clientId: process.env.VITE_AUTH0_CLIENT_ID_DEV || process.env.VITE_AUTH0_CLIENT_ID || '',
        redirectUri: 'http://localhost:8080/auth/callback',
        environment: 'development' as const,
        databaseType: 'local'
      },
      staging: {
        domain: process.env.VITE_AUTH0_DOMAIN_STAGING || 'selfactual-staging.us.auth0.com',
        audience: 'https://api.heliotropeimaginal.com',
        clientId: process.env.VITE_AUTH0_CLIENT_ID_STAGING || process.env.VITE_AUTH0_CLIENT_ID || '',
        redirectUri: 'https://staging.heliotropeimaginal.com/auth/callback',
        environment: 'staging' as const,
        databaseType: 'aws-staging'
      },
      production: {
        domain: process.env.VITE_AUTH0_DOMAIN_PROD || 'auth.heliotropeimaginal.com',
        audience: 'https://api.heliotropeimaginal.com',
        clientId: process.env.VITE_AUTH0_CLIENT_ID_PROD || process.env.VITE_AUTH0_CLIENT_ID || '',
        redirectUri: 'https://app2.heliotropeimaginal.com/auth/callback',
        environment: 'production' as const,
        databaseType: 'aws-production'
      }
    };

    const config = envConfigs[environment];
    
    console.log(`🔧 Auth0 config loaded:`, {
      environment: config.environment,
      domain: config.domain,
      redirectUri: config.redirectUri,
      hasClientId: !!config.clientId,
      databaseType: config.databaseType
    });
    
    return config;
  }

  public static validateEnvironmentAlignment(): void {
    const environment = this.getEnvironment();
    const dbUrl = process.env.DATABASE_URL;
    
    const warnings: string[] = [];
    
    // Check for misaligned configurations
    if (environment === 'development' && dbUrl?.includes('amazonaws.com')) {
      warnings.push('Development environment using AWS database - treating as staging');
    }
    
    if (environment === 'production' && dbUrl?.includes('localhost')) {
      warnings.push('Production environment using local database');
    }
    
    // Verify the resolved Auth0 domain matches the expected tenant for this environment
    const config = this.getAuthConfig();
    if (environment === 'development' && config.domain.includes('prod')) {
      warnings.push('Development environment resolved to a production Auth0 tenant');
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Environment configuration warnings:', warnings);
    } else {
      console.log('✅ Environment configuration alignment validated');
    }
  }

  public static getSessionConfig() {
    const environment = this.getEnvironment();
    
    return {
      name: `HI_session_${environment}`,
      secret: process.env.SESSION_SECRET || `${environment}-secret-key-2025`,
      cookie: {
        secure: environment === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' as const,
        domain: environment === 'production' ? '.heliotropeimaginal.com' : undefined
      },
      rolling: true,
      saveUninitialized: false,
      resave: false
    };
  }
}
