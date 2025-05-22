import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { storage } from './new-storage';
import { UserRole } from '@shared/types';

// Create router for authentication routes
const authRouter = Router();

// User login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const loginSchema = z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
    });
    
    const { username, password } = loginSchema.parse(req.body);
    
    // Authenticate user
    const user = await storage.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Set cookie with user ID
    res.cookie('userId', user.id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = user;
    
    res.status(200).json(userDataWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User registration
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const registerSchema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email').optional().nullable(),
      title: z.string().optional().nullable(),
      organization: z.string().optional().nullable(),
    });
    
    const userData = registerSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: UserRole.Participant, // Default role for new users
    });
    
    // Set cookie with user ID
    res.cookie('userId', newUser.id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = newUser;
    
    res.status(201).json(userDataWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User logout
authRouter.post('/logout', (req: Request, res: Response) => {
  // Clear user ID cookie
  res.clearCookie('userId');
  
  res.status(200).json({ message: 'Logged out successfully' });
});

// Get current user
authRouter.get('/user', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user details
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = user;
    
    res.status(200).json(userDataWithoutPassword);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { authRouter };