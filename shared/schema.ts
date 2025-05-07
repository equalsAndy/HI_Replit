import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  title: text("title"),
  organization: text("organization"),
  avatarUrl: text("avatar_url"),
  progress: integer("progress").default(0),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  completed: boolean("completed").default(false),
  results: jsonb("results"),
  createdAt: text("created_at"),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  options: jsonb("options").notNull(),
  category: text("category").notNull(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  ranking: jsonb("ranking").notNull(),
});

export const starCards = pgTable("star_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  apexStrength: text("apex_strength"),
  thinking: integer("thinking").default(0),
  acting: integer("acting").default(0),
  feeling: integer("feeling").default(0),
  planning: integer("planning").default(0),
  createdAt: text("created_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  title: true,
  organization: true,
  avatarUrl: true,
  progress: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  userId: true,
  completed: true,
  results: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  text: true,
  options: true,
  category: true,
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  userId: true,
  questionId: true,
  ranking: true,
});

export const insertStarCardSchema = createInsertSchema(starCards).pick({
  userId: true,
  apexStrength: true,
  thinking: true,
  acting: true,
  feeling: true,
  planning: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;

export type InsertStarCard = z.infer<typeof insertStarCardSchema>;
export type StarCard = typeof starCards.$inferSelect;

// Additional types for the frontend
export type QuadrantData = {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  apexStrength: string;
};

export type ProfileData = {
  name: string;
  title: string;
  organization: string;
  avatarUrl?: string;
};

export type AssessmentOption = {
  id: string;
  text: string;
  category: 'thinking' | 'acting' | 'feeling' | 'planning';
};

export type AssessmentQuestion = {
  id: number;
  text: string;
  options: AssessmentOption[];
};

export type RankedOption = {
  optionId: string;
  rank: number; // 1 = most like me, 4 = least like me
};

export type QuestionAnswer = {
  questionId: number;
  rankings: RankedOption[];
};

export type AssessmentResult = {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  apexStrength: string;
  answers: QuestionAnswer[];
};
