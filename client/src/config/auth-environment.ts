// Client-side environment-aware Auth0 configuration
export function getClientAuthConfig() {
  // Detect environment from URL
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  let environment: 'development' | 'staging' | 'production' = 'development';

  if (hostname === 'app2.heliotropeimaginal.com') {
    environment = 'production';
  } else if (hostname === 'localhost' && port === '8080') {
    environment = 'development';
  } else if (hostname === 'app.heliotropeimaginal.com') {
    console.warn('⚠️ Using deprecated production URL (app.heliotropeimaginal.com). Please use app2.heliotropeimaginal.com');
    environment = 'production'; // Still support it but warn
  } else {
    console.warn('Unknown environment, defaulting to development');
  }

  // All environments use the same custom domain
  const baseConfig = {
    domain: 'auth.heliotropeimaginal.com',
    audience: 'https://api.heliotropeimaginal.com',
    redirectUri: `${window.location.origin}/auth/callback`
  };

  const configs = {
    development: {
      ...baseConfig,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID_DEV || import.meta.env.VITE_AUTH0_CLIENT_ID,
      environment: 'development'
    },
    staging: {
      ...baseConfig,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID_STAGING || import.meta.env.VITE_AUTH0_CLIENT_ID,
      environment: 'staging'
    },
    production: {
      ...baseConfig,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID_PROD || import.meta.env.VITE_AUTH0_CLIENT_ID,
      environment: 'production'
    }
  };

  const config = configs[environment];
  
  console.log(`🔧 Client Auth0 config loaded:`, {
    environment: config.environment,
    domain: config.domain,
    redirectUri: config.redirectUri,
    hasClientId: !!config.clientId
  });
  
  return config;
}

export function validateClientEnvironment() {
  const config = getClientAuthConfig();
  const warnings: string[] = [];
  
  // Check for production domain in non-production environment
  if (window.location.hostname !== 'app2.heliotropeimaginal.com' && 
      config.domain === 'auth.heliotropeimaginal.com') {
    warnings.push('Non-production environment using production Auth0 domain');
  }
  
  // Check for localhost with production config
  if (window.location.hostname === 'localhost' && 
      config.environment !== 'development') {
    warnings.push('Localhost detected but not using development config');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Client environment configuration warnings:', warnings);
  }
  
  return { config, warnings };
}
