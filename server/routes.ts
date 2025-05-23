import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./new-storage";
import { insertUserSchema } from "@shared/schema";
import { UserRole } from "@shared/types";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import cookieParser from "cookie-parser";
import { adminRouter } from "./admin-routes";
import { testAdminRouter } from "./test-admin-routes";
import { authRouter } from "./auth-routes";
import { participantRouter } from "./participant-routes";
import { db } from "./db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

// Set up uploads directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = nanoid(8);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({
  storage: storage2,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up middleware for JSON parsing
  app.use(express.json());

  // Add cookie parser middleware to parse cookies from requests
  app.use(cookieParser());
  
  // Register admin routes under the /api/admin path
  app.use('/api/admin', adminRouter);
  
  // Register test routes for development purposes
  app.use('/api/test', testAdminRouter);
  
  // Register authentication routes
  app.use('/api/auth', authRouter);
  
  // Register participant management routes
  app.use('/api/participants', participantRouter);

  // Define cookie options for consistent use across endpoints
  const COOKIE_OPTIONS = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict' as const,
  };

  // Star Card image upload
  app.post('/api/upload/starcard', upload.single('image'), async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get file path
      const filePath = req.file?.path;
      
      if (!filePath) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Update user's star card with image path
      // For now, just return the file path
      res.status(200).json({ 
        filePath: filePath,
        url: `/api/uploads/${path.basename(filePath)}`
      });
    } catch (error) {
      console.error('Error uploading star card image:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete star card image
  app.delete('/api/upload/starcard', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Delete file if it exists (in a real application, we would get the file path from the database)
      // For now, just return success
      res.status(200).json({ message: 'Star card image deleted successfully' });
    } catch (error) {
      console.error('Error deleting star card image:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // User profile routes
  app.get("/api/user/profile", async (req: Request, res: Response) => {
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
      const { password, ...userDataWithoutPassword } = user;
      
      res.status(200).json(userDataWithoutPassword);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update user profile
  app.put("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Validate request body
      const updateProfileSchema = z.object({
        name: z.string().optional(),
        email: z.string().email().optional().nullable(),
        title: z.string().optional().nullable(),
        organization: z.string().optional().nullable(),
      });
      
      const userData = updateProfileSchema.parse(req.body);
      
      // Update user
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated user data (excluding password)
      const { password, ...userDataWithoutPassword } = updatedUser;
      
      res.status(200).json(userDataWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // StarCard API endpoints
  app.get('/api/starcard', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get user's star card
      const starCard = await storage.getStarCard(userId);
      
      // If star card doesn't exist, create an empty one
      if (!starCard) {
        const newStarCard = await db
          .insert(schema.starCards)
          .values({
            userId,
            thinking: 0,
            acting: 0,
            feeling: 0,
            planning: 0,
            state: 'incomplete',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return res.status(200).json(newStarCard[0]);
      }
      
      // Return star card
      res.status(200).json(starCard);
    } catch (error) {
      console.error('Error getting star card:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Assessment endpoints
  app.post('/api/assessment/start', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get existing star card
      const starCard = await storage.getStarCard(userId);
      
      // If star card exists with scores, return 409
      if (starCard && 
          (starCard.thinking !== null && starCard.thinking > 0 || 
           starCard.acting !== null && starCard.acting > 0 || 
           starCard.feeling !== null && starCard.feeling > 0 || 
           starCard.planning !== null && starCard.planning > 0)) {
        return res.status(409).json({ message: 'Assessment already completed' });
      }
      
      // Initialize or reset the star card
      if (starCard) {
        // Reset the star card
        await db
          .update(schema.starCards)
          .set({
            thinking: 0,
            acting: 0,
            feeling: 0,
            planning: 0,
            state: 'in-progress',
            updatedAt: new Date(),
          })
          .where(eq(schema.starCards.userId, userId));
      } else {
        // Create a new star card
        await db
          .insert(schema.starCards)
          .values({
            userId,
            thinking: 0,
            acting: 0,
            feeling: 0,
            planning: 0,
            state: 'in-progress',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
      }
      
      // Return success
      res.status(200).json({ message: 'Assessment started' });
    } catch (error) {
      console.error('Error starting assessment:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Complete assessment
  app.post('/api/assessment/complete', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Log incoming data for debugging
      console.log("Assessment completion request data:", JSON.stringify(req.body));
      
      // Extract and sanitize quadrant data - handle either a direct object or nested
      let quadrantData = req.body.quadrantData || req.body;
      
      // Ensure all values are numbers
      const thinking = Number(quadrantData.thinking) || 0;
      const acting = Number(quadrantData.acting) || 0;
      const feeling = Number(quadrantData.feeling) || 0;
      const planning = Number(quadrantData.planning) || 0;
      
      // Log processed data
      console.log("Processed quadrant data:", { thinking, acting, feeling, planning });
      
      // Get existing star card
      const existingStarCard = await storage.getStarCard(userId);
      
      if (existingStarCard) {
        // Update existing star card
        const updatedStarCard = await db
          .update(schema.starCards)
          .set({
            thinking,
            acting, 
            feeling,
            planning,
            state: 'complete',
            updatedAt: new Date()
          })
          .where(eq(schema.starCards.userId, userId))
          .returning();
          
        console.log("Updated star card:", updatedStarCard[0]);
        return res.status(200).json(updatedStarCard[0]);
      } else {
        // Create new star card
        const newStarCard = await db
          .insert(schema.starCards)
          .values({
            userId,
            thinking,
            acting,
            feeling,
            planning,
            state: 'complete',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
          
        console.log("Created new star card:", newStarCard[0]);
        return res.status(200).json(newStarCard[0]);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      
      // Send a more helpful error response
      res.status(500).json({ 
        message: 'Error processing star card data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Flow attributes endpoints
  app.get('/api/flow-attributes', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get user's flow attributes
      const flowAttributes = await storage.getFlowAttributes(userId);
      
      // If flow attributes don't exist, create empty ones
      if (!flowAttributes) {
        const [newFlowAttributes] = await db
          .insert(schema.flowAttributes)
          .values({
            userId,
            attributes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return res.status(200).json(newFlowAttributes);
      }
      
      // Return flow attributes
      res.status(200).json(flowAttributes);
    } catch (error) {
      console.error('Error getting flow attributes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update flow attributes
  app.post('/api/flow-attributes', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Validate request body
      const updateFlowAttributesSchema = z.object({
        attributes: z.array(z.any()),
      });
      
      const { attributes } = updateFlowAttributesSchema.parse(req.body);
      
      // Update flow attributes
      const updatedFlowAttributes = await storage.updateFlowAttributes(userId, {
        attributes,
      });
      
      if (!updatedFlowAttributes) {
        // If update failed, create new flow attributes
        const [newFlowAttributes] = await db
          .insert(schema.flowAttributes)
          .values({
            userId,
            attributes,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return res.status(200).json(newFlowAttributes);
      }
      
      // Return updated flow attributes
      res.status(200).json(updatedFlowAttributes);
    } catch (error) {
      console.error('Error updating flow attributes:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update user progress
  app.put('/api/user/progress', async (req: Request, res: Response) => {
    try {
      // Get user ID from cookie
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Validate request body
      const updateProgressSchema = z.object({
        progress: z.number().min(0).max(100),
      });
      
      const { progress } = updateProgressSchema.parse(req.body);
      
      // Update user's progress
      const [updatedUser] = await db
        .update(schema.users)
        .set({ progress, updatedAt: new Date() })
        .where(eq(schema.users.id, userId))
        .returning();
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return success
      res.status(200).json({ message: 'Progress updated successfully' });
    } catch (error) {
      console.error('Error updating progress:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Serve static files
  app.use('/api/uploads', express.static(uploadsDir));

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}