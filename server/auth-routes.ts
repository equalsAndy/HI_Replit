import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { storage } from './new-storage';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

// Create router for authentication routes
const authRouter = Router();

// User login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const loginSchema = z.object({
      identifier: z.string().min(1, 'Username or email is required'),
      password: z.string().min(1, 'Password is required'),
    });
    
    const { identifier, password } = loginSchema.parse(req.body);
    
    console.log(`Login attempt for identifier: ${identifier}`);
    
    // Try to find user by username or email
    const isEmail = identifier.includes('@');
    
    // Get user from database based on identifier (username or email)
    const [user] = isEmail 
      ? await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, identifier))
      : await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.username, identifier));
    
    if (!user) {
      console.log(`User not found: ${identifier}`);
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log(`Invalid password for user: ${identifier}`);
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }
    
    // User already has a role column directly in the users table now
    console.log(`User has role: ${user.role}`);
    
    // Create the user object with the role directly from the user record
    const userWithRole = {
      ...user,
      role: user.role || 'participant'
    };
    
    // Store user in session
    (req.session as any).userId = user.id;
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = userWithRole as any;
    
    console.log(`Login successful for user with role: ${userDataWithoutPassword.role}`);
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
      role: 'participant', // Default role for new users
    });
    
    // Store user in session
    (req.session as any).userId = newUser.id;
    
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
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Get current user
authRouter.get('/user', async (req: Request, res: Response) => {
  try {
    // Get user ID from session
    const userId = (req.session as any)?.userId;
    
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