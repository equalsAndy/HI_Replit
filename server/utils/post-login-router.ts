// Post-login routing logic based on user role and state
export interface UserRouteConfig {
  role: 'admin' | 'facilitator' | 'participant' | 'student';
  astCompleted?: boolean;
  iaCompleted?: boolean;
  cohortId?: string | null;
  isFirstLogin?: boolean;
}

export class PostLoginRouter {
  /**
   * Determines the correct route for a user after successful Auth0 login
   */
  static getRedirectRoute(user: UserRouteConfig): string {
    const { role, astCompleted, iaCompleted, cohortId, isFirstLogin } = user;

    // Admin users always go to admin dashboard
    if (role === 'admin') {
      return '/admin';
    }

    // Facilitator users go to facilitator console
    if (role === 'facilitator') {
      return '/facilitator';
    }

    // For participants and students, determine workshop access
    const hasTeamFeatures = cohortId !== null;
    
    // First login - send to welcome/onboarding
    if (isFirstLogin) {
      return hasTeamFeatures ? '/welcome?team=true' : '/welcome';
    }

    // Determine workshop status
    const bothCompleted = astCompleted && iaCompleted;
    const astInProgress = !astCompleted;
    const iaInProgress = !iaCompleted;
    
    // If both workshops completed, go to dashboard
    if (bothCompleted) {
      return hasTeamFeatures ? '/team-dashboard' : '/dashboard';
    }

    // If AST not started or in progress, continue with AST
    if (astInProgress) {
      return '/ast/1-1'; // Continue AST workshop
    }

    // If AST completed but IA not started, go to IA
    if (astCompleted && iaInProgress) {
      return '/ia/1-1'; // Start IA workshop  
    }

    // Default fallback
    return hasTeamFeatures ? '/team-dashboard' : '/dashboard';
  }

  /**
   * Enhanced routing with environment context
   */
  static getEnvironmentAwareRoute(user: UserRouteConfig, environment: string): string {
    const baseRoute = this.getRedirectRoute(user);
    
    // Add environment-specific query parameters if needed
    const params = new URLSearchParams();
    
    if (environment !== 'production') {
      params.append('env', environment);
    }
    
    // Add first login indicator
    if (user.isFirstLogin) {
      params.append('welcome', 'true');
    }
    
    const queryString = params.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  /**
   * Validates that the user can access the requested route
   */
  static canAccessRoute(user: UserRouteConfig, requestedRoute: string): boolean {
    const { role, cohortId } = user;
    
    // Admin can access everything
    if (role === 'admin') {
      return true;
    }
    
    // Facilitator route restrictions
    if (role === 'facilitator') {
      const facilitatorRoutes = ['/facilitator', '/profile', '/settings'];
      return facilitatorRoutes.some(route => requestedRoute.startsWith(route));
    }
    
    // Team feature restrictions
    const hasTeamFeatures = cohortId !== null;
    const teamRoutes = ['/team-dashboard', '/team-', '/cohort-'];
    const isTeamRoute = teamRoutes.some(route => requestedRoute.includes(route));
    
    if (isTeamRoute && !hasTeamFeatures) {
      return false;
    }
    
    return true;
  }

  /**
   * Get fallback route when access is denied
   */
  static getFallbackRoute(user: UserRouteConfig): string {
    return this.getRedirectRoute({ ...user, isFirstLogin: false });
  }
}

// Express middleware for post-login routing
export function createPostLoginRedirectMiddleware() {
  return (req: any, res: any, next: any) => {
    // Only apply to successful Auth0 callback
    if (!req.path.includes('/auth/callback')) {
      return next();
    }

    const user = req.session?.user;
    if (!user) {
      return next();
    }

    const userConfig: UserRouteConfig = {
      role: user.role,
      astCompleted: user.astWorkshopCompleted,
      iaCompleted: user.iaWorkshopCompleted, 
      cohortId: user.cohortId,
      isFirstLogin: user.lastLoginAt ? false : true
    };

    const redirectRoute = PostLoginRouter.getEnvironmentAwareRoute(
      userConfig, 
      process.env.ENVIRONMENT || 'development'
    );

    console.log(`🔄 Post-login redirect for ${user.role}:`, redirectRoute);
    
    // Set redirect target in session for client to pick up
    req.session.postLoginRedirect = redirectRoute;
    
    next();
  };
}
