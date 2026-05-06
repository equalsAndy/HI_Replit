// Client-side environment-aware Auth0 configuration
export function getClientAuthConfig() {
  // Detect environment from URL
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  let environment: 'development' | 'staging' | 'production' = 'development';

  if (hostname === 'app2.heliotropeimaginal.com') {
    environment = 'production';
  } else if (hostname === 'staging.heliotropeimaginal.com') {
    environment = 'staging';
  } else if (hostname === 'localhost' && port === '8080') {
    environment = 'development';
  } else if (hostname === 'app.heliotropeimaginal.com') {
    console.warn('⚠️ Using deprecated production URL (app.heliotropeimaginal.com). Please use app2.heliotropeimaginal.com');
    environment = 'production'; // Still support it but warn
  } else {
    console.warn('Unknown environment, defaulting to development');
  }

  // Each environment has its own Auth0 tenant. Custom domain only on prod.
  const redirectUri = `${window.location.origin}/auth/callback`;

  const configs = {
    development: {
      domain: import.meta.env.VITE_AUTH0_DOMAIN_DEV || 'dev-y4g4ug6epxi167a4.us.auth0.com',
      audience: 'https://api.heliotropeimaginal.com',
      redirectUri,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID_DEV || import.meta.env.VITE_AUTH0_CLIENT_ID,
      environment: 'development'
    },
    staging: {
      domain: import.meta.env.VITE_AUTH0_DOMAIN_STAGING || 'selfactual-staging.us.auth0.com',
      audience: 'https://api.heliotropeimaginal.com',
      redirectUri,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID_STAGING || import.meta.env.VITE_AUTH0_CLIENT_ID,
      environment: 'staging'
    },
    production: {
      domain: import.meta.env.VITE_AUTH0_DOMAIN_PROD || 'auth.selfactual.ai',
      audience: 'https://api.heliotropeimaginal.com',
      redirectUri,
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
      config.domain.includes('prod')) {
    warnings.push('Non-production environment resolved to a production Auth0 tenant');
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
