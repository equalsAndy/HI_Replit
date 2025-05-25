import express from 'express';
import bcrypt from 'bcryptjs';
import { userManagementService } from '../services/user-management-service';
import { inviteService } from '../services/invite-service';
import { isValidInviteCodeFormat } from '../utils/invite-code';
import { z } from 'zod';

export const authRouter = express.Router();

// Login route
authRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Validate credentials
    const user = await userManagementService.validateCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set up session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    
    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
      message: 'Login successful',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Logout route
authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Get current user info
authRouter.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await userManagementService.getUserById(req.session.userId);
    
    if (!user) {
      // Session exists but user doesn't - clear the invalid session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying invalid session:', err);
        }
      });
      
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});