import express from 'express';
import { z } from 'zod';
import { inviteService } from '../services/invite-service';
import { userManagementService } from '../services/user-management-service';
import { isValidInviteCodeFormat } from '../utils/invite-code';

// Create the auth registration router
export const authRegisterRouter = express.Router();

// Schema for validating username availability
const usernameCheckSchema = z.object({
  username: z.string().min(3).max(50)
});

// Schema for validating registration with invite
const registerWithInviteSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  name: z.string().min(2),
  email: z.string().email(),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  inviteCode: z.string().min(12).max(12)
    .refine(code => isValidInviteCodeFormat(code), {
      message: 'Invalid invite code format'
    }),
  role: z.enum(['admin', 'facilitator', 'participant'])
});

// Check if a username is available
authRegisterRouter.post('/check-username', async (req, res) => {
  try {
    const { username } = usernameCheckSchema.parse(req.body);
    
    const available = await userManagementService.isUsernameAvailable(username);
    
    return res.status(200).json({ available });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error checking username:', error);
    return res.status(500).json({ error: 'An error occurred while checking username availability' });
  }
});

// Register with invite code
authRegisterRouter.post('/register-with-invite', async (req, res) => {
  try {
    // Validate the request data
    const validatedData = registerWithInviteSchema.parse(req.body);
    
    // Verify the invite
    const verification = await inviteService.verifyInvite(validatedData.inviteCode);
    
    if (!verification.valid || !verification.invite) {
      return res.status(400).json({ 
        error: verification.error || 'Invalid invite code' 
      });
    }
    
    // Check that email matches the invite
    if (verification.invite.email.toLowerCase() !== validatedData.email.toLowerCase()) {
      return res.status(400).json({ 
        error: 'Email does not match the invite'
      });
    }
    
    // Check that the role matches the invite
    if (verification.invite.role !== validatedData.role) {
      return res.status(400).json({ 
        error: 'Role does not match the invite'
      });
    }
    
    // Check if username is available
    const isUsernameAvailable = await userManagementService.isUsernameAvailable(validatedData.username);
    
    if (!isUsernameAvailable) {
      return res.status(400).json({ 
        error: 'Username is already taken'
      });
    }
    
    // Create the user
    const newUser = await userManagementService.createUser({
      username: validatedData.username,
      password: validatedData.password,
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      organization: validatedData.organization,
      jobTitle: validatedData.jobTitle
    });
    
    // Mark the invite as used
    await inviteService.markInviteAsUsed(validatedData.inviteCode, newUser.id);
    
    // Log the user in
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.userRole = newUser.role;
    
    // Return the user (excluding password)
    const { password, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
});