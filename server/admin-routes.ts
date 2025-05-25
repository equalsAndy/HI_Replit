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
    
    // For development, consider test users with certain IDs as admins or facilitators
    // In production, this would be replaced with proper role checking from the database
    const isAdmin = userId === 1; // Assuming user 1 is admin
    
    // Check if user has admin privileges
    if (!isAdmin) {
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
    
    // Add virtual role properties based on user IDs for development
    const usersWithRoles = users.map(user => {
      let role = UserRole.Participant; // Default role
      
      // For development/demo purposes:
      if (user.id === 1) {
        role = UserRole.Admin;
      } else if (user.id === 2 || user.id === 3) {
        role = UserRole.Facilitator;
      }
      
      return {
        ...user,
        role: role
      };
    });
    
    res.status(200).json(usersWithRoles);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get facilitators (for development purposes, consider users with IDs 2 and 3 as facilitators)
adminRouter.get('/facilitators', async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    // For development, users with IDs 2 and 3 are considered facilitators
    const facilitators = users.filter(user => user.id === 2 || user.id === 3);
    
    // Add a virtual "role" property to the response
    const facilitatorsWithRoles = facilitators.map(user => ({
      ...user,
      role: UserRole.Facilitator  // Add a virtual role property for the frontend
    }));
    
    res.status(200).json(facilitatorsWithRoles);
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
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email('Invalid email address').optional(),
      title: z.string().optional(),
      organization: z.string().optional(),
      userType: z.string().default('participant'), // Instead of role enum
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
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      email: parsedData.email,
      title: parsedData.title,
      organization: parsedData.organization,
      // We'll handle role/userType via frontend logic since
      // our database doesn't have a role column
      password: password,
    });
    
    // Don't return the password in the response
    res.status(201).json({
      ...newUser,
      // Add virtual role property in response for frontend
      role: parsedData.userType === 'admin' ? UserRole.Admin : 
            parsedData.userType === 'facilitator' ? UserRole.Facilitator : 
            UserRole.Participant,
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
      username: z.string().min(3, 'Username must be at least 3 characters').optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email('Invalid email address').optional(),
      title: z.string().optional(),
      organization: z.string().optional(),
      userType: z.string().optional(), // We use userType instead of role
      password: z.string().optional(),
    });
    
    const parsedData = UserUpdateSchema.parse(req.body);
    
    // Build update object with only supported fields
    const updateData: any = {};
    if (parsedData.name) updateData.name = parsedData.name;
    if (parsedData.username) updateData.username = parsedData.username;
    if (parsedData.firstName) updateData.firstName = parsedData.firstName;
    if (parsedData.lastName) updateData.lastName = parsedData.lastName;
    if (parsedData.email) updateData.email = parsedData.email;
    if (parsedData.title) updateData.title = parsedData.title;
    if (parsedData.organization) updateData.organization = parsedData.organization;
    if (parsedData.password) updateData.password = parsedData.password;
    
    // Update the user
    const updatedUser = await storage.updateUser(userId, updateData);
    
    // For the response, add the virtual role based on user ID
    let role = UserRole.Participant;
    if (userId === 1) {
      role = UserRole.Admin;
    } else if (userId === 2 || userId === 3) {
      role = UserRole.Facilitator;
    }
    
    res.status(200).json({
      ...updatedUser,
      role: role
    });
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

// Video Management Routes
// Get all videos
adminRouter.get('/videos', async (req: Request, res: Response) => {
  try {
    const videos = await storage.getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get videos by workshop type
adminRouter.get('/videos/workshop/:workshopType', async (req: Request, res: Response) => {
  try {
    const { workshopType } = req.params;
    const videos = await storage.getVideosByWorkshop(workshopType);
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos by workshop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get video by ID
adminRouter.get('/videos/:id', async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);
    
    if (isNaN(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }
    
    const video = await storage.getVideo(videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new video
adminRouter.post('/videos', async (req: Request, res: Response) => {
  try {
    const VideoSchema = z.object({
      title: z.string().min(2, 'Title must be at least 2 characters'),
      description: z.string().optional(),
      url: z.string().url('Invalid URL format'),
      editableId: z.string().optional(),
      workshopType: z.string(),
      section: z.string(),
      sortOrder: z.number().default(0)
    });
    
    const parsedData = VideoSchema.parse(req.body);
    
    const newVideo = await storage.createVideo(parsedData);
    
    res.status(201).json(newVideo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video by ID
adminRouter.put('/videos/:id', async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);
    
    if (isNaN(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }
    
    const existingVideo = await storage.getVideo(videoId);
    
    if (!existingVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const VideoUpdateSchema = z.object({
      title: z.string().min(2, 'Title must be at least 2 characters').optional(),
      description: z.string().optional(),
      url: z.string().url('Invalid URL format').optional(),
      editableId: z.string().optional(),
      workshopType: z.string().optional(),
      section: z.string().optional(),
      sortOrder: z.number().optional()
    });
    
    const parsedData = VideoUpdateSchema.parse(req.body);
    
    const updatedVideo = await storage.updateVideo(videoId, parsedData);
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video by ID
adminRouter.delete('/videos/:id', async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);
    
    if (isNaN(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }
    
    const result = await storage.deleteVideo(videoId);
    
    if (!result) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { adminRouter };