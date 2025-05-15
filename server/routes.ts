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
    sameSite: 'lax' as const,
    secure: false // Allow cookies on non-HTTPS connections for development
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
        // Create a new star card with zero values and the image URL
        await storage.createStarCard({
          userId,
          thinking: 0,
          acting: 0,
          feeling: 0, 
          planning: 0,
          imageUrl,
          state: 'empty',
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
      console.log(`Login attempt for username: ${username}`);

      // For test accounts, use the test-users endpoint
      if (username.startsWith('user') && username.length <= 6) {
        // This is a test user, so let's get their data
        await storage.createTestUsers(); // Make sure test users exist
        const testUsers = await storage.getTestUsers();
        const testUser = testUsers.find(u => u.username === username);

        if (testUser) {
          // Found a matching test user, set their cookie
          res.cookie("userId", testUser.id.toString(), COOKIE_OPTIONS);
          console.log(`Test user login success: ${testUser.id} (${username}), cookie: userId=${testUser.id}`);
          console.log(`Cookie options:`, COOKIE_OPTIONS);

          // Return test user data
          return res.status(200).json({ 
            id: testUser.id, 
            username: testUser.username, 
            name: testUser.name,
            title: testUser.title,
            organization: testUser.organization,
            avatarUrl: testUser.avatarUrl,
            progress: testUser.progress || 0
          });
        }
      }

      // For regular users, check credentials
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Mock session by setting user info in a cookie
      // In a real app, use actual session management
      res.cookie("userId", user.id.toString(), COOKIE_OPTIONS);

      console.log(`Login successful for user ${user.id} (${username}), setting cookie userId=${user.id}`);
      console.log(`Cookie options:`, COOKIE_OPTIONS);

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
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      console.log('Logging out - Before clearing cookies:', req.cookies);
      
      // Clear all cookies that might be related to authentication
      res.clearCookie("userId", { path: '/' });
      res.clearCookie("connect.sid", { path: '/' });
      
      // Turn off auto-login for development
      if (process.env.NODE_ENV === 'development') {
        res.cookie('noAutoLogin', 'true', { path: '/' });
      }
      
      console.log('Cookies cleared');
      
      // Send success response
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Server error during logout" });
    }
  });

  app.get("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // Get userId from cookie
      let userId: number | undefined;

      try {
        // Try to get userId from cookie or query parameter
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : undefined;

        // Also check query parameter (useful for development)
        if (req.query.userId) {
          userId = parseInt(req.query.userId as string);
        }
      } catch (e) {
        userId = undefined; // Invalid user ID
      }

      console.log(`GET /api/user/profile - checking for userId from cookies/query:`, userId);
      console.log(`Cookies:`, req.cookies);

      // For development, allow falling back to a test user unless noAutoLogin is set
      if (!userId && process.env.NODE_ENV === 'development' && !req.cookies.noAutoLogin) {
        // Create test users if needed and use user1
        await storage.createTestUsers();
        userId = 1; // Default to the first test user
        console.log(`No userId in cookies, defaulting to test user 1 for development`);
      }

      // If still no userId (in production), return auth error
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
      console.error("Error fetching user profile:", error);
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
      const userId = req.cookies.userId ? parseInt(req.cookies.userId) : 
                    (process.env.NODE_ENV === 'development' ? 1 : null);

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check if user already has an assessment
      const existingAssessment = await storage.getAssessment(userId);

      // Also check if the user has a completed star card
      const existingStarCard = await storage.getStarCard(userId);
      const hasCompletedStarCard = existingStarCard && 
                                   existingStarCard.state !== 'empty' && 
                                   ((existingStarCard.thinking ?? 0) > 0 || 
                                    (existingStarCard.acting ?? 0) > 0 || 
                                    (existingStarCard.feeling ?? 0) > 0 || 
                                    (existingStarCard.planning ?? 0) > 0);

      // Check if user has any existing answers (partial assessment)
      const existingAnswers = await storage.getAnswers(userId);
      const hasAnswers = existingAnswers && existingAnswers.length > 0;

      // Prevent retaking assessment if:
      // 1. Assessment is marked as completed, OR
      // 2. Star card has values (completed assessment), OR
      // 3. User has already answered some questions (partial assessment)
      if ((existingAssessment && existingAssessment.completed) || hasCompletedStarCard || hasAnswers) {
        console.log(`Preventing assessment restart for user ${userId} - assessment completed or in progress`);
        return res.status(409).json({ message: "Assessment already completed or in progress" });
      }

      console.log(`Starting assessment for user ${userId}`);
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
      
      console.log("Saving answer for user:", userId, "with data:", req.body);
      
      // Extract the data we need from the request
      const { questionId, rankings } = req.body;
      
      if (!questionId || !rankings) {
        return res.status(400).json({ 
          message: "Invalid input", 
          details: "Missing required fields: questionId or rankings" 
        });
      }
      
      // Create the answer data with the correct structure
      const answerData = {
        userId,
        questionId: parseInt(String(questionId)), // Ensure questionId is a number
        ranking: Array.isArray(rankings) ? rankings : [] // Ensure rankings is always an array
      };
      
      console.log("Processed answer data:", answerData);
      
      // Save to database
      const answer = await storage.saveAnswer(answerData);
      console.log("Saved answer:", answer);

      res.status(201).json(answer);
    } catch (error) {
      console.error("Error saving answer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error: " + String(error) });
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

      console.log(`Processing assessment completion for user ${userId}...`);
      console.log(`Cookies:`, req.cookies);

      // Verify user exists first
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`User ${userId} not found in database`);
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's assessment
      let assessment = await storage.getAssessment(userId);

      // If no assessment exists, create one now to avoid errors
      if (!assessment) {
        console.log(`No assessment found for user ${userId}, creating one now`);
        assessment = await storage.createAssessment({
          userId,
          completed: false,
          createdAt: new Date().toISOString()
        });
      }

      console.log(`Assessment for user ${userId}: `, assessment);

      // Use the request data directly if provided, which is more reliable
      let scores: QuadrantData;

      if (req.body.quadrantData && 
          typeof req.body.quadrantData === 'object' &&
          Object.values(req.body.quadrantData).some(val => (val as number) > 0)) {
        // Use the client-calculated scores - these are already validated and reliable
        scores = req.body.quadrantData;
        console.log("Using client-provided quadrant data:", scores);
      } else {
        console.log("No valid quadrant data in request, checking for answers");

        // Fall back to server-side calculation
        // Get all answers
        const answers = await storage.getAnswers(userId);

        if (answers.length === 0) {
          console.log("No answers found in database");

          // If no answers and no scores provided, return specific error
          return res.status(400).json({ 
            message: "No assessment data found", 
            details: "No answers or quadrant data provided to complete assessment" 
          });
        }

        // Calculate quadrant scores
        scores = calculateQuadrantScores(answers);
        console.log("Server calculated scores from answers:", scores);

        // If all scores are zero, we'll leave them as zeros
        if (scores.thinking === 0 && scores.acting === 0 && scores.feeling === 0 && scores.planning === 0) {
          console.log("All assessment scores are zero");
          // Keep the zeros, don't modify them
        }
      }

      // Ensure total is 100% (only if there are non-zero scores)
      let total = scores.thinking + scores.acting + scores.feeling + scores.planning;
      
      // Only normalize if there are actual scores to normalize
      if (total > 0 && total !== 100) {
        const adjustmentFactor = 100 / total;
        scores = {
          thinking: Math.round(scores.thinking * adjustmentFactor),
          acting: Math.round(scores.acting * adjustmentFactor),
          feeling: Math.round(scores.feeling * adjustmentFactor),
          planning: Math.round(scores.planning * adjustmentFactor)
        };

        // Handle rounding errors (only if we have non-zero scores)
        total = scores.thinking + scores.acting + scores.feeling + scores.planning;
        if (total !== 100) {
          const diff = 100 - total;
          // Add difference to the highest value
          let highest = Math.max(scores.thinking, scores.acting, scores.feeling, scores.planning);
          if (highest === scores.thinking) scores.thinking += diff;
          else if (highest === scores.acting) scores.acting += diff;
          else if (highest === scores.feeling) scores.feeling += diff;
          else scores.planning += diff;
        }
      }

      console.log(`Final normalized quadrant scores: `, scores);

      // Step 1: ALWAYS update assessment with results, make sure completed=true
      const updatedAssessment = await storage.updateAssessment(assessment.id, {
        completed: true,
        results: scores
      });
      console.log("Updated assessment:", updatedAssessment);

      // Step 2: ALWAYS create or update star card with the SAME scores
      const existingStarCard = await storage.getStarCard(userId);

      console.log(`Updating Star Card for user ${userId} with scores:`, scores);

      let updatedStarCard;
      // If star card exists, update it
      if (existingStarCard && existingStarCard.id) {
        updatedStarCard = await storage.updateStarCard(existingStarCard.id, {
          thinking: scores.thinking,
          acting: scores.acting, 
          feeling: scores.feeling,
          planning: scores.planning,
          state: 'partial' // Set to partial after assessment
        });
        console.log("Updated existing Star Card:", updatedStarCard);
      } else {
        // Create a new star card with the scores
        updatedStarCard = await storage.createStarCard({
          userId,
          thinking: scores.thinking,
          acting: scores.acting, 
          feeling: scores.feeling,
          planning: scores.planning,
          state: 'partial', // Set to partial after assessment
          createdAt: new Date().toISOString()
        });
        console.log("Created new Star Card:", updatedStarCard);
      }

      // Step 3: Update user progress
      await storage.updateUser(userId, { progress: 67 }); // Profile + Assessment = 67%

      // Step 4: Return the COMPLETE STAR CARD OBJECT, not just scores
      // This ensures the client has all the data needed immediately
      res.status(200).json(updatedStarCard);
    } catch (error) {
      console.error("Error completing assessment:", error);
      res.status(500).json({ message: "Server error: " + String(error) });
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

      // For testing, use a default user ID if none found
      if (!userId) {
        // In development mode, allow default to user 1
        if (process.env.NODE_ENV === 'development') {
          userId = 1;
          console.log("No userId found in cookies, defaulting to user 1 for development");
        } else {
          return res.status(401).json({ message: "User not authenticated" });
        }
      }

      console.log(`Getting star card for user ${userId}, cookies:`, req.cookies);

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the star card for this user
      const starCard = await storage.getStarCard(userId);

      // If a star card exists, return it
      if (starCard) {
        console.log(`Returning existing star card for user ${userId}:`, starCard);
        return res.status(200).json(starCard);
      }

      // Get any assessment data
      const assessment = await storage.getAssessment(userId);
      console.log(`Assessment for user ${userId}:`, assessment);

      // If the assessment is completed but no star card exists, create one from assessment data
      if (assessment && assessment.completed && assessment.results) {
        try {
          console.log(`Creating star card from completed assessment for user ${userId}`);
          const scores = assessment.results as QuadrantData;

          // Create a new star card with the scores from assessment
          const newStarCard = await storage.createStarCard({
            userId,
            thinking: scores.thinking || 0,
            acting: scores.acting || 0,
            feeling: scores.feeling || 0,
            planning: scores.planning || 0,
            state: 'partial',
            createdAt: new Date().toISOString()
          });

          console.log(`Created new star card from assessment:`, newStarCard);
          return res.status(200).json(newStarCard);
        } catch (err) {
          console.error("Error creating star card from assessment:", err);
        }
      }

      // If no star card exists, return one with all zeros (no placeholders)
      const emptyCard = {
        id: null,
        userId,
        thinking: 0,
        acting: 0,
        feeling: 0,
        planning: 0,
        state: 'empty',
        createdAt: new Date().toISOString()
      };

      console.log(`Returning empty card for user ${userId}`);
      // Return the empty card
      res.status(200).json(emptyCard);
    } catch (error) {
      console.error("Error fetching star card:", error);
      res.status(500).json({ message: "Server error: " + String(error) });
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
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }

      if (!userId) {
        userId = 1; // Default to user ID 1 for development
        console.log("No userId found in cookies, defaulting to user 1 for development");
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get flow attributes for user
      const flowAttributes = await storage.getFlowAttributes(user.id);

      // Check if user has completed the assessment
      const starCard = await storage.getStarCard(user.id);
      const hasCompletedAssessment = starCard && starCard.state !== 'empty';

      if (flowAttributes) {
        // Return existing flow attributes
        return res.status(200).json(flowAttributes);
      }

      // Only create default flow attributes if user has completed assessment
      // This prevents auto-creating default attributes after a reset
      if (hasCompletedAssessment) {
        // If no flow attributes exist, create default ones
        const defaultAttributes = [
          { text: "Focused", color: "#4CAF50" },  // Green
          { text: "Creative", color: "#2196F3" }, // Blue
          { text: "Energized", color: "#FFC107" }, // Yellow
          { text: "Confident", color: "#F44336" }  // Red
        ];

        // Create flow attributes with default values
        const newFlowAttributes = await storage.createFlowAttributes({
          userId: user.id,
          flowScore: 0,
          attributes: defaultAttributes,
          // Let timestamp default value handle createdAt
        });

        return res.status(200).json(newFlowAttributes);
      }

      // Otherwise, return empty flow attributes
      return res.status(200).json({ 
        userId: user.id, 
        flowScore: 0, 
        attributes: [] 
      });
    } catch (error) {
      console.error("Error getting flow attributes:", error);
      res.status(500).json({ message: "Failed to get flow attributes" });
    }
  });

  // Save flow attributes for user
  app.post("/api/flow-attributes", async (req: Request, res: Response) => {
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
        console.log("No userId found in cookies, defaulting to user 1 for development");
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { flowScore, attributes } = req.body;

      // Check if user already has flow attributes
      const existingFlowAttributes = await storage.getFlowAttributes(user.id);

      // Get the user's star card
      const starCard = await storage.getStarCard(user.id);

      if (existingFlowAttributes) {
        // Update existing flow attributes
        const updatedFlowAttributes = await storage.updateFlowAttributes(
          existingFlowAttributes.id, 
          { 
            flowScore, 
            attributes: attributes 
          }
        );
        
        // Update star card state to 'complete' if it exists
        if (starCard && starCard.id) {
          await storage.updateStarCard(starCard.id, { state: 'complete' });
        }
        
        console.log("Updated flow attributes:", updatedFlowAttributes);
        return res.status(200).json(updatedFlowAttributes);
      } else {
        // Create new flow attributes
        const newFlowAttributes = await storage.createFlowAttributes({
          userId: user.id,
          flowScore,
          attributes: attributes,
          createdAt: new Date(),
        });
        
        // Update star card state to 'complete' if it exists
        if (starCard && starCard.id) {
          await storage.updateStarCard(starCard.id, { state: 'complete' });
        }
        
        console.log("Created new flow attributes:", newFlowAttributes);
        return res.status(201).json(newFlowAttributes);
      }
    } catch (error) {
      console.error("Error saving flow attributes:", error);
      res.status(500).json({ message: "Failed to save flow attributes" });
    }
  });

  // Debug helper route
  app.get("/api/debug", async (req: Request, res: Response) => {
    try {
      console.log("Debug route - cookies:", req.cookies);

      let userId = null;
      try {
        // This change consolidates user ID checking logic across multiple endpoints
        userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
      } catch (e) {
        userId = null;
      }

      console.log("Debug route - extracted userId:", userId);

      // Set a test cookie to verify cookie functionality
      res.cookie("testDebugCookie", "working", COOKIE_OPTIONS);

      // Get assessment and star card data for debugging
      let debugData: any = {
        cookies: req.cookies,
        parsedUserId: userId,
        cookieOptions: COOKIE_OPTIONS,
        message: "Debug info returned, check server logs"
      };

      // If we have a user ID, get more detailed data
      if (userId) {
        try {
          // Get detailed data for debug
          console.log("Debug route - getting detailed data for userId:", userId);
          const user = await storage.getUser(userId);
          const assessment = await storage.getAssessment(userId);
          const starCard = await storage.getStarCard(userId);
          
          const answers = await storage.getAnswers(userId);
          const answersCount = answers?.length || 0;
          
          const flowAttributes = await storage.getFlowAttributes(userId);
          
          // Log everything
          console.log("Debug - User:", user);
          console.log("Debug - Assessment:", assessment);
          console.log("Debug - Star Card:", starCard);
          console.log("Debug - Answers Count:", answersCount);
          console.log("Debug - Flow Attributes:", flowAttributes);
          
          // Include all the data in the debug response
          debugData = {
            ...debugData,
            user,
            assessment,
            starCard,
            answers,
            answersCount,
            flowAttributes
          };
        } catch (err) {
          console.error("Error getting debug data:", err);
          debugData.dataError = String(err);
        }
      }

      res.status(200).json(debugData);
    } catch (error) {
      console.error("Error in debug route:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Endpoint to get detailed user data for test modal
  app.get("/api/test-users/data/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      console.log(`Fetching detailed data for test user ${userId}`);
      
      // Get detailed data for this user
      const user = await storage.getUser(userId);
      const starCard = await storage.getStarCard(userId);
      const flowAttributes = await storage.getFlowAttributes(userId);
      
      res.status(200).json({
        user,
        starCard,
        flowAttributes
      });
    } catch (error) {
      console.error("Error fetching test user data:", error);
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
          hasFlowAttributes: flowAttributes ? true : false,
          hasImage: starCard && starCard.imageUrl ? true : false
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
  
  // Endpoint to generate random star card data for testing
  app.post("/api/test/randomize-star-card", async (req: Request, res: Response) => {
    try {
      // Try to get userId from cookie or query param
      let userId: number;
      try {
        userId = parseInt(req.cookies.userId || req.query.userId as string);
      } catch (e) {
        userId = 1; // Default to user ID 1 for development
      }
      
      if (!userId) {
        userId = 1; // Default to test user 1
      }
      
      console.log(`Randomizing star card for user ${userId}`);
      
      // Generate random values that sum to 100
      const randomScores = generateRandomScoresThatSumTo100();
      console.log(`Generated random scores:`, randomScores);
      
      // Get existing star card or create one
      const existingCard = await storage.getStarCard(userId);
      
      if (existingCard) {
        // Update existing star card with random scores
        const updatedCard = await storage.updateStarCard(existingCard.id, {
          thinking: randomScores.thinking,
          acting: randomScores.acting, 
          feeling: randomScores.feeling,
          planning: randomScores.planning,
          state: 'partial'
        });
        console.log(`Updated star card with random scores:`, updatedCard);
        return res.json(updatedCard);
      } else {
        // Create a new star card with random scores
        const newCard = await storage.createStarCard({
          userId,
          thinking: randomScores.thinking,
          acting: randomScores.acting,
          feeling: randomScores.feeling,
          planning: randomScores.planning,
          state: 'partial',
          createdAt: new Date().toISOString()
        });
        console.log(`Created new star card with random scores:`, newCard);
        return res.json(newCard);
      }
    } catch (error) {
      console.error("Error randomizing star card:", error);
      res.status(500).json({ error: "Failed to randomize star card" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate random scores that sum to 100
function generateRandomScoresThatSumTo100(): QuadrantData {
  // Generate 4 random numbers
  const r1 = Math.random();
  const r2 = Math.random();
  const r3 = Math.random();
  const r4 = Math.random();
  
  // Sum of the random numbers
  const sum = r1 + r2 + r3 + r4;
  
  // Normalize to sum to 100 and round to integers
  const thinking = Math.round((r1 / sum) * 100);
  const acting = Math.round((r2 / sum) * 100);
  const feeling = Math.round((r3 / sum) * 100);
  let planning = Math.round((r4 / sum) * 100);
  
  // Ensure they sum to exactly 100 (adjust the last value if needed)
  const currentSum = thinking + acting + feeling + planning;
  planning += (100 - currentSum);
  
  return { thinking, acting, feeling, planning };
}

function calculateQuadrantScores(answers: Answer[]): QuadrantData {
  console.log("Processing answers:", JSON.stringify(answers));

  // Initialize category counters
  let thinkingPoints = 0;
  let actingPoints = 0;
  let feelingPoints = 0;
  let planningPoints = 0;

  // Process each answer
  for (const answer of answers) {
    try {
      // Get the ranking data and ensure it's properly structured
      const rankings = answer.ranking as any[];

      if (!Array.isArray(rankings)) {
        console.error("Invalid ranking format, expected array:", rankings);
        continue;
      }

      // Log rankings to help diagnose issues
      console.log("Processing answer rankings:", JSON.stringify(rankings));

      // Assign points based on rankings (1=most like me, 4=least like me)
      for (const rank of rankings) {
        if (!rank || !rank.optionId) {
          console.error("Invalid ranking item:", rank);
          continue;
        }

        // Extract category information - we need to check for both formats:
        // 1. Format from client might be "thinking_1" (category_number)
        // 2. The ranking might already have the category field
        let category;
        if (rank.category) {
          category = rank.category;
        } else if (typeof rank.optionId === 'string' && rank.optionId.includes('_')) {
          const optionIdParts = rank.optionId.split('_');
          category = optionIdParts[0];
        } else {
          // Try to extract category from the known format in the client
          // Find the category from the optionId by parsing the assessment questions
          console.log("Trying alternative method to determine category for optionId:", rank.optionId);

          // We'll extract from the client data if available
          // But for now, handle the case where we can't determine category
          console.error("Cannot determine category from ranking:", rank);
          continue;
        }

        // Match the client-side scoring:
        // First choice (most like me): 3 points
        // Second choice: 2 points
        // Third choice: 1 point
        // Last choice (least like me): 0 points
        const points = 4 - rank.rank; // Convert rank to points: rank 1 = 3 points, rank 4 = 0 point

        console.log(`Adding ${points} points for ${category} (rank ${rank.rank})`);

        // Only add points for top 3 choices (ranks 1-3)
        if (points > 0) {
          switch (category) {
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
            default:
              console.error("Unknown category:", category, "from ranking:", JSON.stringify(rank));
          }
        }
      }
    } catch (error) {
      console.error("Error processing answer:", error, "Raw answer:", JSON.stringify(answer));
    }
  }

  // Log points before conversion for debugging
  console.log("Points before percentage conversion:", {
    thinkingPoints,
    actingPoints,
    feelingPoints, 
    planningPoints
  });

  // Calculate total points
  const totalPoints = thinkingPoints + actingPoints + feelingPoints + planningPoints;

  // Prevent division by zero
  if (totalPoints === 0) {
    // If there's no data, return all zeros
    console.log("No valid points calculated, returning zeros");
    return {
      thinking: 0,
      acting: 0,
      feeling: 0,
      planning: 0
    };
  }

  // Convert to percentages
  let thinking = Math.round((thinkingPoints / totalPoints) * 100);
  let acting = Math.round((actingPoints / totalPoints) * 100);
  let feeling = Math.round((feelingPoints / totalPoints) * 100);
  let planning = Math.round((planningPoints / totalPoints) * 100);

  // Check if percentages add up to 100 (they might not due to rounding)
  const total = thinking + acting + feeling + planning;

  // Adjust if needed to ensure we get exactly 100%
  if (total !== 100) {
    // Find highest value and adjust it
    const values = [
      { name: 'thinking', value: thinking }, 
      { name: 'acting', value: acting }, 
      { name: 'feeling', value: feeling }, 
      { name: 'planning', value: planning }
    ];

    // Sort by value (highest first)
    values.sort((a, b) => b.value - a.value);

    // Adjust the highest value to make total 100%
    const diff = 100 - total;

    if (values[0].name === 'thinking') {
      thinking += diff;
    } else if (values[0].name === 'acting') {
      acting += diff;
    } else if (values[0].name === 'feeling') {
      feeling += diff;
    } else {
      planning += diff;
    }
  }

  // Log final percentages
  console.log("Final calculated percentages:", {
    thinking,
    acting,
    feeling,
    planning,
    total: thinking + acting + feeling + planning // Should be 100
  });

  return {
    thinking,
    acting,
    feeling,
    planning
  };
}