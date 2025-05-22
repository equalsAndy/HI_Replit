import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dbStorage } from "./dbStorage";
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
      const user = await dbStorage.getUser(userId);
      
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
      const updatedUser = await dbStorage.updateUser(userId, userData);
      
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

  // Serve static files
  app.use('/api/uploads', express.static(uploadsDir));

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}