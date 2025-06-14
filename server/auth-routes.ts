import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { storage } from './new-storage';
import { UserRole } from '@shared/types';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, inArray } from 'drizzle-orm';

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
    
    // Set cookie with user ID
    res.cookie('userId', user.id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = userWithRole;
    
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

// Get test users for development
authRouter.get('/test-users', async (req, res) => {
  try {
    // Return a list of test users with their roles
    const testUsers = [
      { username: 'admin', role: 'Admin', name: 'Admin User' },
      { username: 'facilitator', role: 'Facilitator', name: 'Facilitator User' },
      { username: 'user1', role: 'Participant', name: 'Participant One' },
      { username: 'user2', role: 'Participant', name: 'Participant Two' }
    ];
    
    res.json(testUsers);
  } catch (error) {
    console.error('Error getting test users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup test users (create or update with standard password)
authRouter.post('/setup-test-users', async (req, res) => {
  try {
    const standardPassword = 'password';
    
    // List of test users to create or update
    const testUsers = [
      { username: 'admin', name: 'Admin User', role: UserRole.Admin },
      { username: 'facilitator', name: 'Facilitator User', role: UserRole.Facilitator },
      { username: 'user1', name: 'Participant One', role: UserRole.Participant },
      { username: 'user2', name: 'Participant Two', role: UserRole.Participant }
    ];
    
    // Create or update each test user
    for (const userData of testUsers) {
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        console.log(`Updating existing user: ${userData.username} with role ${userData.role}`);
        
        // Hash the password directly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(standardPassword, salt);
        
        // Update existing user
        await db.update(schema.users)
          .set({
            name: userData.name,
            password: hashedPassword,
            updatedAt: new Date()
          })
          .where(eq(schema.users.id, existingUser.id));
          
        // Delete existing roles
        await db.delete(schema.userRoles)
          .where(eq(schema.userRoles.userId, existingUser.id));
          
        // Add new role
        await db.insert(schema.userRoles)
          .values({
            userId: existingUser.id,
            role: userData.role
          });
          
      } else {
        console.log(`Creating new user: ${userData.username} with role ${userData.role}`);
        
        // Hash the password directly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(standardPassword, salt);
        
        // Insert user directly
        const [newUser] = await db.insert(schema.users)
          .values({
            username: userData.username,
            password: hashedPassword,
            name: userData.name,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        // Insert role directly
        await db.insert(schema.userRoles)
          .values({
            userId: newUser.id,
            role: userData.role
          });
      }
    }
    
    res.status(200).json({ message: 'Test users setup complete' });
  } catch (error) {
    console.error('Error setting up test users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to check user roles
authRouter.get('/check-roles', async (req, res) => {
  try {
    // Get all users
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
      })
      .from(schema.users);
    
    // Get all roles
    const roles = await db
      .select()
      .from(schema.userRoles);
    
    // Map users with their roles
    const userRoles = users.map(user => {
      const userRoleRecords = roles.filter(role => role.userId === user.id);
      return {
        id: user.id,
        username: user.username,
        roles: userRoleRecords.map(r => r.role),
      };
    });
    
    console.log('User roles from database:', userRoles);
    
    res.json(userRoles);
  } catch (error) {
    console.error('Error checking roles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available test users
authRouter.get('/test-users', async (req, res) => {
  try {
    // Get all test users directly from the database
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name
      })
      .from(schema.users)
      .where(inArray(schema.users.username, ['admin', 'facilitator', 'user1', 'user2']));
    
    // Get all roles
    const userIds = users.map(user => user.id);
    const roles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map users with their roles
    const simplifiedUsers = users.map(user => {
      const userRole = roles.find(role => role.userId === user.id);
      return {
        username: user.username,
        role: userRole ? userRole.role : 'participant',
        name: user.name
      };
    });
    
    res.json(simplifiedUsers);
  } catch (error) {
    console.error('Error fetching test users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset a test user's data
authRouter.post('/test-users/reset/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    console.log(`Attempting to reset data for user ID: ${userId}`);
    
    // Get the user to verify they exist
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Reset user assessments data
    try {
      await db
        .delete(schema.userAssessments)
        .where(eq(schema.userAssessments.userId, userId));
      console.log(`Deleted user assessments data for user ${userId}`);
    } catch (error) {
      console.error('Error resetting user assessments data:', error);
    }
    
    // Reset workshop participation data
    try {
      await db
        .delete(schema.workshopParticipation)
        .where(eq(schema.workshopParticipation.userId, userId));
      console.log(`Deleted workshop participation data for user ${userId}`);
    } catch (error) {
      console.error('Error resetting workshop participation data:', error);
    }
    
    // Find and delete any user-specific data in other tables not defined in schema
    // This uses a more generic approach to reset other possible tables
    try {
      // Execute a direct SQL query to find all tables that have a userId column
      const query = `
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'user_id' 
        AND table_schema = 'public'
      `;
      
      // We use a direct db.execute() call to run custom SQL
      const tables = await db.execute(query);
      
      console.log('Found tables with user_id column:', tables);
      
      // For each table found, try to delete records with the user's ID
      for (const table of tables) {
        const tableName = table.table_name;
        try {
          await db.execute(`DELETE FROM "${tableName}" WHERE user_id = ${userId}`);
          console.log(`Deleted data from ${tableName} for user ${userId}`);
        } catch (tableError) {
          console.error(`Error deleting from ${tableName}:`, tableError);
        }
      }
    } catch (sqlError) {
      console.error('Error finding or deleting from user-related tables:', sqlError);
    }
    
    res.status(200).json({ 
      message: 'User data reset successful',
      userId: userId,
      username: user.username,
      resetTime: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ 
      message: 'Server error during reset', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export { authRouter };