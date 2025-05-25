import express from 'express';
import { inviteService } from '../services/invite-service';
import { userManagementService } from '../services/user-management-service';
import { isValidInviteCodeFormat } from '../utils/invite-code';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const registerRouter = express.Router();

// Register with invite code
registerRouter.post('/register-with-invite', async (req, res) => {
  try {
    // Define validation schema for registration
    const registerSchema = z.object({
      inviteCode: z.string().min(12).max(12),
      username: z.string().min(3).max(20),
      password: z.string().min(8),
      name: z.string().min(2),
      email: z.string().email(),
      organization: z.string().optional(),
      jobTitle: z.string().optional(),
      role: z.string(),
      cohortId: z.number().optional(),
    });
    
    // Validate the request body
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid registration data', 
        details: validation.error.format() 
      });
    }
    
    const userData = validation.data;
    
    // Verify the invite code
    const verification = await inviteService.verifyInviteCode(userData.inviteCode);
    
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }
    
    // Verify that the email matches the invite email
    if (verification.invite?.email !== userData.email) {
      return res.status(400).json({ 
        error: 'Email does not match the invited email address' 
      });
    }
    
    // Check if username is available
    const isUsernameAvailable = await userManagementService.isUsernameAvailable(userData.username);
    
    if (!isUsernameAvailable) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    
    // Create the user
    const user = await userManagementService.createUser({
      username: userData.username,
      password: userData.password,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      organization: userData.organization,
      jobTitle: userData.jobTitle,
      cohortId: userData.cohortId,
    });
    
    // Mark the invite as used
    await inviteService.markInviteAsUsed(userData.inviteCode, user.id);
    
    // Set up session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    
    // Return the user (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    return res.status(201).json({ 
      message: 'Registration successful',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Check username availability
registerRouter.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const isAvailable = await userManagementService.isUsernameAvailable(username);
    
    return res.status(200).json({ available: isAvailable });
  } catch (error) {
    console.error('Username check error:', error);
    return res.status(500).json({ error: 'An error occurred while checking username availability' });
  }
});