import express from 'express';
import { z } from 'zod';
import { userManagementService } from '../services/user-management-service';

// Create the auth router
export const authRouter = express.Router();

// Login route
authRouter.post('/login', async (req, res) => {
  const schema = z.object({
    username: z.string(),
    password: z.string()
  });
  
  try {
    const { username, password } = schema.parse(req.body);
    
    // Verify credentials
    const verification = await userManagementService.verifyPassword(username, password);
    
    if (!verification.valid || !verification.user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set session data
    req.session.userId = verification.user.id;
    req.session.username = verification.user.username;
    req.session.userRole = verification.user.role;
    
    // Return user data
    return res.status(200).json({
      message: 'Login successful',
      user: verification.user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Logout route
authRouter.post('/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'An error occurred during logout' });
    }
    
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logout successful' });
  });
});

// Check authentication status
authRouter.get('/status', (req, res) => {
  if (!req.session.userId) {
    return res.status(200).json({ 
      authenticated: false 
    });
  }
  
  return res.status(200).json({
    authenticated: true,
    userId: req.session.userId,
    username: req.session.username,
    role: req.session.userRole
  });
});