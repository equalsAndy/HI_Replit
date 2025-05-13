import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertAnswerSchema, 
  insertAssessmentSchema,
  insertStarCardSchema,
  Answer,
  QuadrantData
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import cookieParser from "cookie-parser";

// Set up uploads directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueId = nanoid(10);
    cb(null, `${uniqueId}${fileExt}`);
  }
});

const upload = multer({
  storage: storage2,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
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
  
  // Define cookie options for consistent use across endpoints
  const COOKIE_OPTIONS = {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' as const
  };
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));
  
  // File upload endpoint for star card image
  app.post('/api/upload/starcard', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get userId from cookie
      let userId: number | undefined;
      
      try {
        // Try to get userId from cookie
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : undefined;
      } catch (e) {
        userId = undefined; // Invalid user ID
      }
      
      // If no cookie set, user is not logged in
      if (!userId) {
        // Return 401 to indicate user is not authenticated
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Generate the URL for the uploaded image
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      // Check if the user has a star card
      const starCard = await storage.getStarCard(userId);
      
      // If there's an existing image, delete it
      if (starCard && starCard.imageUrl) {
        const oldImagePath = starCard.imageUrl.split('/uploads/')[1];
        if (oldImagePath) {
          const oldImageFullPath = path.join(uploadsDir, oldImagePath);
          // Check if file exists before attempting to delete
          if (fs.existsSync(oldImageFullPath)) {
            fs.unlinkSync(oldImageFullPath);
          }
        }
      }
      
      if (starCard) {
        // Update the existing star card with the new image URL
        await storage.updateStarCard(starCard.id, { imageUrl });
      } else {
        // Create a new star card with default values and the image URL
        await storage.createStarCard({
          userId,
          thinking: 25,
          acting: 25,
          feeling: 25, 
          planning: 25,
          imageUrl,
          createdAt: new Date().toISOString()
        });
      }
      
      res.status(200).json({ 
        success: true, 
        imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload image' 
      });
    }
  });
  
  // Delete image endpoint for star card
  app.delete('/api/upload/starcard', async (req: Request, res: Response) => {
    try {
      // Get userId from cookie
      let userId: number | undefined;
      
      try {
        // Try to get userId from cookie
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : undefined;
      } catch (e) {
        userId = undefined; // Invalid user ID
      }
      
      // If no cookie set, user is not logged in
      if (!userId) {
        // Return 401 to indicate user is not authenticated
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if the user has a star card
      const starCard = await storage.getStarCard(userId);
      
      if (!starCard || !starCard.imageUrl) {
        return res.status(404).json({ message: 'No image found to delete' });
      }
      
      // Extract the filename from the URL
      const imageFilename = starCard.imageUrl.split('/uploads/')[1];
      if (imageFilename) {
        const imageFullPath = path.join(uploadsDir, imageFilename);
        
        // Delete the file if it exists
        if (fs.existsSync(imageFullPath)) {
          fs.unlinkSync(imageFullPath);
        }
      }
      
      // Update the star card to remove the image URL
      await storage.updateStarCard(starCard.id, { imageUrl: null });
      
      res.status(200).json({
        success: true,
        message: 'Image removed successfully'
      });
    } catch (error) {
      console.error('Error removing image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove image'
      });
    }
  });
  // Auth endpoints
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(data.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(data);
      res.status(201).json({ id: user.id, username: user.username, name: user.name });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Mock session by setting user info in a cookie
      // In a real app, use actual session management
      res.cookie("userId", user.id.toString(), COOKIE_OPTIONS);
      
      console.log(`Login successful for user ${user.id} (${username}), setting cookie userId=${user.id}`);
      
      res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        name: user.name,
        title: user.title,
        organization: user.organization,
        avatarUrl: user.avatarUrl,
        progress: user.progress
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      // Clear the cookie with same path option
      res.clearCookie("userId", { path: '/' });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // Get userId from cookie
      let userId: number | undefined;
      
      try {
        // Try to get userId from cookie
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : undefined;
      } catch (e) {
        userId = undefined; // Invalid user ID
      }
      
      // If no cookie set, user is not logged in
      if (!userId) {
        // Return 401 to indicate user is not authenticated
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Try to get user
      const user = await storage.getUser(userId);
      
      // If user not found, return 401
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user data
      res.status(200).json({
        id: user.id,
        name: user.name,
        title: user.title,
        organization: user.organization,
        avatarUrl: user.avatarUrl,
        progress: user.progress
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // Get userId from cookie
      let userId: number | undefined;
      
      try {
        // Try to get userId from cookie
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : undefined;
      } catch (e) {
        userId = undefined; // Invalid user ID
      }
      
      // If no cookie set, user is not logged in
      if (!userId) {
        // Return 401 to indicate user is not authenticated
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { name, title, organization, avatarUrl } = req.body;
      
      console.log(`Updating profile for user ${userId} with name=${name}, title=${title}, org=${organization}`);
      console.log("Avatar data: " + (avatarUrl ? `${avatarUrl.substring(0, 30)}... (${avatarUrl.length} chars)` : "No avatar"));
      
      // Validate that we have actual data
      if (name === undefined || title === undefined || organization === undefined) {
        return res.status(400).json({ message: "Missing required profile fields" });
      }
      
      const updatedUser = await storage.updateUser(userId, { name, title, organization, avatarUrl });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        title: updatedUser.title,
        organization: updatedUser.organization,
        avatarUrl: updatedUser.avatarUrl,
        progress: updatedUser.progress
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Server error: " + String(error) });
    }
  });

  app.put("/api/user/progress", async (req: Request, res: Response) => {
    try {
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }
      
      if (!userId) {
        userId = 1; // Default to user ID 1 for development
      }
      
      const { progress } = req.body;
      const updatedUser = await storage.updateUser(userId, { progress });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ progress: updatedUser.progress });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Assessment endpoints
  app.get("/api/assessment/questions", async (req: Request, res: Response) => {
    try {
      const questions = await storage.getQuestions();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/assessment/start", async (req: Request, res: Response) => {
    try {
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }
      
      if (!userId) {
        userId = 1; // Default to user ID 1 for development
      }
      
      // Check if user already has an assessment
      const existingAssessment = await storage.getAssessment(userId);
      
      if (existingAssessment && existingAssessment.completed) {
        return res.status(409).json({ message: "Assessment already completed" });
      }
      
      const assessment = existingAssessment || await storage.createAssessment({
        userId,
        completed: false,
        results: null,
        createdAt: new Date().toISOString()
      });
      
      res.status(200).json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/assessment/answer", async (req: Request, res: Response) => {
    try {
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }
      
      if (!userId) {
        userId = 1; // Default to user ID 1 for development
      }
      
      const answerData = insertAnswerSchema.parse({ ...req.body, userId });
      const answer = await storage.saveAnswer(answerData);
      
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/assessment/complete", async (req: Request, res: Response) => {
    try {
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }
      
      if (!userId) {
        userId = 1; // Default to user ID 1 for development
      }
      
      // Get user's assessment
      const assessment = await storage.getAssessment(userId);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      // Get all answers
      const answers = await storage.getAnswers(userId);
      
      if (answers.length === 0) {
        return res.status(400).json({ message: "No answers found" });
      }
      
      // Calculate quadrant scores
      const scores = calculateQuadrantScores(answers);
      
      // Update assessment with results
      const updatedAssessment = await storage.updateAssessment(assessment.id, {
        completed: true,
        results: scores
      });
      
      // Create or update star card
      const existingStarCard = await storage.getStarCard(userId);
      
      console.log(`Updating Star Card for user ${userId} with scores:`, scores);
      
      let updatedStarCard;
      if (existingStarCard && existingStarCard.id) {
        updatedStarCard = await storage.updateStarCard(existingStarCard.id, {
          thinking: scores.thinking,
          acting: scores.acting, 
          feeling: scores.feeling,
          planning: scores.planning,
          pending: false // Explicitly set to false after assessment
        });
        console.log("Updated existing Star Card:", updatedStarCard);
      } else {
        updatedStarCard = await storage.createStarCard({
          userId,
          thinking: scores.thinking,
          acting: scores.acting, 
          feeling: scores.feeling,
          planning: scores.planning,
          pending: false, // Explicitly set to false after assessment
          createdAt: new Date().toISOString()
        });
        console.log("Created new Star Card:", updatedStarCard);
      }
      
      // Update user progress
      await storage.updateUser(userId, { progress: 67 }); // Profile + Assessment = 67%
      
      res.status(200).json({ ...scores, completed: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/starcard", async (req: Request, res: Response) => {
    try {
      // Get userId from cookie or query param
      let userId: number | undefined;
      try {
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : undefined;
        if (req.query.userId) {
          userId = parseInt(req.query.userId as string);
        }
      } catch (e) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Ensure we have a valid userId
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the star card for this user
      const starCard = await storage.getStarCard(userId);
      
      // If a star card exists, return it
      if (starCard) {
        return res.status(200).json(starCard);
      }
      
      // If no star card exists but user has completed assessment, this is an error
      const assessment = await storage.getAssessment(userId);
      if (assessment && assessment.completed) {
        return res.status(500).json({ 
          message: "Star Card creation error", 
          details: "Assessment is complete but no star card was created" 
        });
      }
      
      // If no star card exists, return one with all zeros (no placeholders)
      const emptyCard = {
        id: null,
        userId,
        thinking: 0,
        acting: 0,
        feeling: 0,
        planning: 0,
        pending: true, // Flag to indicate this is empty/pending
        createdAt: new Date().toISOString()
      };
      
      // Return the empty card
      res.status(200).json(emptyCard);
    } catch (error) {
      console.error("Error fetching star card:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/starcard/reviewed", async (req: Request, res: Response) => {
    try {
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }
      
      if (!userId) {
        userId = 1; // Default to user ID 1 for development
      }
      
      // Update user progress
      await storage.updateUser(userId, { progress: 100 }); // Set to 100% when star card is reviewed
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Flow attributes endpoints
  app.get("/api/flow-attributes", async (req: Request, res: Response) => {
    try {
      // Get user ID from session/auth
      const userId = req.cookies.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get flow attributes for user
      const flowAttributes = await storage.getFlowAttributes(user.id);
      
      if (!flowAttributes) {
        return res.status(404).json({ message: "Flow attributes not found" });
      }
      
      res.status(200).json(flowAttributes);
    } catch (error) {
      console.error("Error getting flow attributes:", error);
      res.status(500).json({ message: "Failed to get flow attributes" });
    }
  });
  
  // Save flow attributes for user
  app.post("/api/flow-attributes", async (req: Request, res: Response) => {
    try {
      // Get user ID from session/auth
      const userId = req.cookies.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { flowScore, attributes } = req.body;
      
      // Check if user already has flow attributes
      const existingFlowAttributes = await storage.getFlowAttributes(user.id);
      
      if (existingFlowAttributes) {
        // Update existing flow attributes
        const updatedFlowAttributes = await storage.updateFlowAttributes(
          existingFlowAttributes.id, 
          { 
            flowScore, 
            attributes: JSON.stringify(attributes) 
          }
        );
        return res.status(200).json(updatedFlowAttributes);
      } else {
        // Create new flow attributes
        const newFlowAttributes = await storage.createFlowAttributes({
          userId: user.id,
          flowScore,
          attributes: JSON.stringify(attributes),
          createdAt: new Date(),
        });
        return res.status(201).json(newFlowAttributes);
      }
    } catch (error) {
      console.error("Error saving flow attributes:", error);
      res.status(500).json({ message: "Failed to save flow attributes" });
    }
  });
  
  // Test User Routes
  app.get("/api/test-users", async (req: Request, res: Response) => {
    try {
      // Create test users if they don't exist yet
      await storage.createTestUsers();
      
      // Get all test users
      const testUsers = await storage.getTestUsers();
      
      // Prepare response array
      const enhancedUsers = [];
      
      // Add data status for each user
      for (const user of testUsers) {
        // Check if user has assessment data
        const assessment = await storage.getAssessment(user.id);
        
        // Check if user has star card
        const starCard = await storage.getStarCard(user.id);
        
        // Check if user has flow attributes
        const flowAttributes = await storage.getFlowAttributes(user.id);
        
        // Add enhanced user data
        enhancedUsers.push({
          id: user.id,
          username: user.username,
          name: user.name,
          title: user.title,
          organization: user.organization,
          progress: user.progress || 0,
          hasAssessment: assessment ? true : false,
          hasStarCard: starCard ? true : false,
          hasFlowAttributes: flowAttributes ? true : false
        });
      }
      
      res.status(200).json(enhancedUsers);
    } catch (error) {
      console.error("Error fetching test users:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/test-users/reset/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Reset all user data
      await storage.resetUserData(userId);
      
      // Return updated user with data status
      const updatedUser = await storage.getUser(userId);
      
      // All statuses should be false after reset, but verify anyway
      const assessment = await storage.getAssessment(userId);
      const starCard = await storage.getStarCard(userId);
      const flowAttributes = await storage.getFlowAttributes(userId);
      
      res.status(200).json({
        id: updatedUser?.id,
        username: updatedUser?.username,
        name: updatedUser?.name,
        title: updatedUser?.title,
        organization: updatedUser?.organization,
        progress: updatedUser?.progress || 0,
        hasAssessment: assessment ? true : false,
        hasStarCard: starCard ? true : false,
        hasFlowAttributes: flowAttributes ? true : false,
        message: "User data has been reset successfully"
      });
    } catch (error) {
      console.error("Error resetting user data:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateQuadrantScores(answers: Answer[]): QuadrantData {
  // Initialize category counters
  let thinkingPoints = 0;
  let actingPoints = 0;
  let feelingPoints = 0;
  let planningPoints = 0;
  
  // Process each answer
  answers.forEach(answer => {
    const rankings = answer.ranking as any[];
    
    // Assign points based on rankings (1=most like me, 4=least like me)
    rankings.forEach(rank => {
      // Match the client-side scoring:
      // First choice (most like me): 3 points
      // Second choice: 2 points
      // Third choice: 1 point
      // Last choice (least like me): 0 points
      const points = 4 - rank.rank; // Convert rank to points: rank 1 = 3 points, rank 4 = 0 point
      
      // Only add points for top 3 choices (ranks 1-3)
      if (points > 0) {
        switch (rank.category) {
          case 'thinking':
            thinkingPoints += points;
            break;
          case 'acting':
            actingPoints += points;
            break;
          case 'feeling':
            feelingPoints += points;
            break;
          case 'planning':
            planningPoints += points;
            break;
        }
      }
    });
  });
  
  // Calculate total points
  const totalPoints = thinkingPoints + actingPoints + feelingPoints + planningPoints;
  
  // Convert to percentages
  const thinking = Math.round((thinkingPoints / totalPoints) * 100);
  const acting = Math.round((actingPoints / totalPoints) * 100);
  const feeling = Math.round((feelingPoints / totalPoints) * 100);
  const planning = Math.round((planningPoints / totalPoints) * 100);
  
  return {
    thinking,
    acting,
    feeling,
    planning
  };
}
