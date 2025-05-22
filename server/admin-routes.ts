import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { UserRole, User } from '@shared/types';
import { nanoid } from 'nanoid';

// Create a router for admin routes
const adminRouter = Router();

// Middleware to check if user has admin role
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user details
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user has admin role
    if (user.role !== UserRole.Admin) {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    
    // If user is admin, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Error in admin authentication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply admin middleware to all routes in this router
adminRouter.use(requireAdmin);

// Get all users
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get facilitators (users with Facilitator role)
adminRouter.get('/facilitators', async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    const facilitators = users.filter(user => user.role === UserRole.Facilitator);
    res.status(200).json(facilitators);
  } catch (error) {
    console.error('Error fetching facilitators:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
adminRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const UserSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      username: z.string().min(3, 'Username must be at least 3 characters').optional(),
      email: z.string().email('Invalid email address').optional(),
      title: z.string().optional(),
      organization: z.string().optional(),
      role: z.nativeEnum(UserRole).default(UserRole.Participant),
      password: z.string().optional(),
      generatePassword: z.boolean().optional(),
    });

    const parsedData = UserSchema.parse(req.body);
    
    // Generate username if not provided
    if (!parsedData.username) {
      const nameParts = parsedData.name.toLowerCase().split(' ');
      const baseUsername = nameParts.join('.');
      parsedData.username = `${baseUsername}-${nanoid(4)}`;
    }
    
    // Generate password if requested or not provided
    const generatePassword = parsedData.generatePassword !== false;
    const password = parsedData.password || nanoid(10);
    
    // Create the user
    const newUser = await storage.createUser({
      name: parsedData.name,
      username: parsedData.username,
      title: parsedData.title,
      organization: parsedData.organization,
      role: parsedData.role,
      // Hash the password before saving (this should be implemented in storage.ts)
      password: password,
      createdAt: new Date().toISOString(),
    });
    
    // Don't return the password in the response
    res.status(201).json({
      ...newUser,
      temporaryPassword: generatePassword ? password : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user by ID
adminRouter.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Existing user check
    const existingUser = await storage.getUser(userId);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const UserUpdateSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      email: z.string().email('Invalid email address').optional(),
      title: z.string().optional(),
      organization: z.string().optional(),
      role: z.nativeEnum(UserRole).optional(),
      password: z.string().optional(),
    });
    
    const parsedData = UserUpdateSchema.parse(req.body);
    
    // Update the user
    const updatedUser = await storage.updateUser(userId, {
      ...parsedData,
      updatedAt: new Date().toISOString(),
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cohorts (placeholder - to be implemented)
adminRouter.get('/cohorts', async (req: Request, res: Response) => {
  try {
    // Placeholder response until cohort functionality is implemented
    res.status(200).json([
      {
        id: 1,
        name: 'AllStarTeams Workshop - Spring 2025',
        description: 'Spring 2025 workshop for leadership teams',
        startDate: '2025-05-01',
        endDate: '2025-06-30',
        status: 'active',
        facilitatorId: 2,
        facilitatorName: 'Test User 2',
        memberCount: 12
      },
      {
        id: 2,
        name: 'Imaginal Agility Workshop - Summer 2025',
        description: 'Summer 2025 workshop focusing on agility training',
        startDate: '2025-07-15',
        endDate: '2025-08-30',
        status: 'upcoming',
        facilitatorId: 2,
        facilitatorName: 'Test User 2',
        memberCount: 8
      }
    ]);
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { adminRouter };