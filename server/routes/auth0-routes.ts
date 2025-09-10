import express from 'express';
import jwt from 'jsonwebtoken';
import { userManagementService } from '../services/user-management-service.ts';
import { PostLoginRouter, type UserRouteConfig } from '../utils/post-login-router.ts';

const router = express.Router();

// Shared handler to create session from Auth0 token
async function handleAuth0Session(req: express.Request, res: express.Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode the JWT token (Auth0 has already verified it)
    const decoded = jwt.decode(idToken) as any;
    console.log('🔐 Auth0-session called. Token decoded keys:', decoded ? Object.keys(decoded) : 'none');

    // Try common claim names for email
    const email = decoded?.email || decoded?.['https://schemas.auth0.com/email'] || decoded?.['https://auth0.io/email'];

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Auth0 user data:', { email, name: decoded.name, sub: decoded.sub });

    // Find user in database by email
    let user = email ? await findUserByEmail(email) : null;

    // Fallback: find by Auth0 subject if email not present
    if (!user && decoded?.sub) {
      try {
        const { db } = await import('../db.ts');
        const { users } = await import('../../shared/schema.ts');
        const { eq } = await import('drizzle-orm');
        const result = await db.select().from(users).where(eq(users.auth0Sub as any, decoded.sub));
        if (result && result.length > 0) {
          user = result[0] as any;
        }
      } catch (err) {
        console.warn('Auth0-sub lookup failed:', err);
      }
    }

    if (!user) {
      // Determine role for new Auth0 user
      let userRole = 'participant'; // Default role
      
      // Check for admin role in Auth0 metadata/roles
      const auth0Roles = decoded?.['https://schemas.auth0.com/roles'] || decoded?.roles || [];
      const auth0AppMetadata = decoded?.['https://schemas.auth0.com/app_metadata'] || decoded?.app_metadata || {};
      
      if (auth0Roles.includes('admin') || auth0AppMetadata.role === 'admin') {
        userRole = 'admin';
        console.log('🔐 Admin role detected from Auth0 metadata for:', email);
      }
      
      // Email-based admin detection as fallback
      const adminEmails = [
        'brad@heliotropeimaginal.com',
        'admin@heliotropeimaginal.com',
        'brad@allstarteams.co', // Dev admin access for AllStarTeams workshop
        // Add more admin emails here
      ];
      
      if (email && adminEmails.includes(email.toLowerCase())) {
        userRole = 'admin';
        console.log('🔐 Admin role assigned based on email:', email);
      }
      
      // Create new user from Auth0 data if they don't exist
      const createResult = await userManagementService.createUser({
        email: email || `${decoded.sub}@placeholder.local`,
        name: decoded.name || (email ? email.split('@')[0] : 'user'),
        username: email || decoded.sub, // Prefer email, fallback to sub
        password: `auth0-generated-${Math.random().toString(36)}`, // Random password for Auth0 users
        role: userRole, // Use determined role
        auth0Sub: decoded.sub,
        lastLoginAt: new Date(),
        organization: '',
        jobTitle: ''
      });

      if (!createResult.success) {
        return res.status(500).json({ error: 'Failed to create user account' });
      }

      user = createResult.user;
      console.log('Created new user from Auth0:', user.id);
    } else {
      // Check if existing user needs role update (for admin promotion)
      let needsRoleUpdate = false;
      let newRole = user.role;
      
      // Check for admin role in Auth0 metadata/roles
      const auth0Roles = decoded?.['https://schemas.auth0.com/roles'] || decoded?.roles || [];
      const auth0AppMetadata = decoded?.['https://schemas.auth0.com/app_metadata'] || decoded?.app_metadata || {};
      
      if (auth0Roles.includes('admin') || auth0AppMetadata.role === 'admin') {
        if (user.role !== 'admin') {
          newRole = 'admin';
          needsRoleUpdate = true;
          console.log('🔐 Promoting existing user to admin via Auth0 metadata:', user.email);
        }
      }
      
      // Email-based admin detection as fallback
      const adminEmails = [
        'brad@heliotropeimaginal.com',
        'admin@heliotropeimaginal.com',
        // Add more admin emails here
      ];
      
      if (email && adminEmails.includes(email.toLowerCase()) && user.role !== 'admin') {
        newRole = 'admin';
        needsRoleUpdate = true;
        console.log('🔐 Promoting existing user to admin via email:', email);
      }
      
      // Update user's Auth0 subject if not set and set last login
      const updateData: any = {
        lastLoginAt: new Date()
      };
      if (!user.auth0Sub) {
        updateData.auth0Sub = decoded.sub;
      }
      if (needsRoleUpdate) {
        updateData.role = newRole;
        user.role = newRole; // Update local object for session creation
      }
      await userManagementService.updateUser(user.id, updateData);
      console.log('Found existing user:', user.id, needsRoleUpdate ? `(promoted to ${newRole})` : '');
    }

    // Create session with enhanced user data
    req.session.userId = user.id;
    req.session.userRole = user.role; // Add userRole for middleware compatibility
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      astWorkshopCompleted: user.astWorkshopCompleted || false,
      iaWorkshopCompleted: user.iaWorkshopCompleted || false,
      cohortId: user.cohortId || null,
      lastLoginAt: user.lastLoginAt
    };

    // Determine post-login redirect route
    const userConfig: UserRouteConfig = {
      role: user.role as any,
      astCompleted: user.astWorkshopCompleted || false,
      iaCompleted: user.iaWorkshopCompleted || false,
      cohortId: user.cohortId || null,
      isFirstLogin: !user.lastLoginAt
    };

    const redirectRoute = PostLoginRouter.getEnvironmentAwareRoute(
      userConfig, 
      process.env.ENVIRONMENT || 'development'
    );

    console.log('Session created for user:', user.id, 'redirect:', redirectRoute);

    // IMPORTANT: Force session save before responding
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session creation failed' });
      }
      
      console.log('✅ Session saved successfully for user:', user.id);
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        redirectTo: redirectRoute
      });
    });
  } catch (error) {
    console.error('Auth0 session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

// Create session from Auth0 token (supported paths)
router.post('/auth0-session', handleAuth0Session);
router.post('/session', handleAuth0Session);

// Helper function to find user by email
async function findUserByEmail(email: string) {
  const result = await userManagementService.getUserByEmail(email);
  return result.success ? result.user : null;
}

export default router;
