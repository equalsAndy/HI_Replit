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
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));
  
  // File upload endpoint for star card image
  app.post('/api/upload/starcard', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get user ID
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default for development
      }
      
      if (!userId) {
        userId = 1; // Default for development
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
          apexStrength: "Balanced",
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
      // Get user ID
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default for development
      }
      
      if (!userId) {
        userId = 1; // Default for development
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
      res.cookie("userId", user.id.toString(), { 
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
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
      // Clear the cookie
      res.clearCookie("userId");
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
      
      if (existingStarCard) {
        await storage.updateStarCard(existingStarCard.id, scores);
      } else {
        await storage.createStarCard({
          userId,
          ...scores,
          createdAt: new Date().toISOString()
        });
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
      
      try {
        let starCard = await storage.getStarCard(userId);
        
        // If no star card exists, create a sample one for development
        if (!starCard) {
          starCard = await storage.createStarCard({
            userId,
            thinking: 25,
            acting: 35,
            feeling: 20,
            planning: 20,
            apexStrength: "Acting",
            createdAt: new Date().toISOString()
          });
        }
        
        res.status(200).json(starCard);
      } catch (err) {
        console.error("Error creating or fetching star card:", err);
        // Send back a fallback star card as a last resort
        res.status(200).json({
          id: 999,
          userId,
          thinking: 25,
          acting: 35,
          feeling: 20,
          planning: 20,
          apexStrength: "Acting",
          createdAt: new Date().toISOString()
        });
      }
      
      return;
    } catch (error) {
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

  // Test User Routes
  app.get("/api/test-users", async (req: Request, res: Response) => {
    try {
      // Create test users if they don't exist yet
      await storage.createTestUsers();
      
      // Get all test users
      const testUsers = await storage.getTestUsers();
      
      // Return users with their current progress
      res.status(200).json(testUsers.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        title: user.title,
        organization: user.organization,
        progress: user.progress || 0,
      })));
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
      
      // Return updated user
      const updatedUser = await storage.getUser(userId);
      res.status(200).json({
        id: updatedUser?.id,
        username: updatedUser?.username,
        name: updatedUser?.name,
        progress: updatedUser?.progress || 0,
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
      const points = 5 - rank.rank; // Convert rank to points: rank 1 = 4 points, rank 4 = 1 point
      
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
    });
  });
  
  // Calculate total points
  const totalPoints = thinkingPoints + actingPoints + feelingPoints + planningPoints;
  
  // Convert to percentages
  const thinking = Math.round((thinkingPoints / totalPoints) * 100);
  const acting = Math.round((actingPoints / totalPoints) * 100);
  const feeling = Math.round((feelingPoints / totalPoints) * 100);
  const planning = Math.round((planningPoints / totalPoints) * 100);
  
  // Determine apex strength
  const scores = [
    { name: 'thinking', value: thinking },
    { name: 'acting', value: acting },
    { name: 'feeling', value: feeling },
    { name: 'planning', value: planning }
  ];
  
  // Sort by score descending
  scores.sort((a, b) => b.value - a.value);
  
  // Get the highest scoring category
  const apexStrength = scores[0].name.charAt(0).toUpperCase() + scores[0].name.slice(1);
  
  return {
    thinking,
    acting,
    feeling,
    planning,
    apexStrength
  };
}
