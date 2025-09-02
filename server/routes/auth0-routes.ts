import express from 'express';
import jwt from 'jsonwebtoken';
import { userManagementService } from '../services/user-management-service.js';

const router = express.Router();

// Create session from Auth0 token
router.post('/auth0-session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode the JWT token (Auth0 has already verified it)
    const decoded = jwt.decode(idToken) as any;

    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Auth0 user data:', {
      email: decoded.email,
      name: decoded.name,
      sub: decoded.sub
    });

    // Find user in database by email
    let user = await findUserByEmail(decoded.email);

    if (!user) {
      // Create new user from Auth0 data if they don't exist
      const createResult = await userManagementService.createUser({
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        username: decoded.email, // Use email as username
        role: 'participant', // Default role
        auth0Sub: decoded.sub,
        organization: '',
        jobTitle: ''
      });

      if (!createResult.success) {
        return res.status(500).json({ error: 'Failed to create user account' });
      }

      user = createResult.user;
      console.log('Created new user from Auth0:', user.id);
    } else {
      // Update user's Auth0 subject if not set
      if (!user.auth0Sub) {
        await userManagementService.updateUser(user.id, {
          auth0Sub: decoded.sub
        });
      }
      console.log('Found existing user:', user.id);
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('Session created for user:', user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth0 session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Helper function to find user by email
async function findUserByEmail(email: string) {
  const result = await userManagementService.getUserByEmail(email);
  return result.success ? result.user : null;
}

export default router;
