import type { Express, Request, Response } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.cookie("userId", user.id, { httpOnly: true });
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

  app.get("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // In a real app, this would come from session
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
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
      // In a real app, this would come from session
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { name, title, organization, avatarUrl } = req.body;
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
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/user/progress", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
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
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
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
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
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
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
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
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const starCard = await storage.getStarCard(userId);
      
      if (!starCard) {
        return res.status(404).json({ message: "Star card not found" });
      }
      
      res.status(200).json(starCard);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/starcard/reviewed", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.cookies.userId || req.query.userId as string);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Update user progress
      await storage.updateUser(userId, { progress: 100 }); // Set to 100% when star card is reviewed
      
      res.status(200).json({ success: true });
    } catch (error) {
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
