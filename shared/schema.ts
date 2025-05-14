import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),  // "AllStarTeams" or "Imaginal Agility"
  slug: text("slug").notNull(),  // "allstarteams" or "imaginal-agility"
  description: text("description"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("indigo"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  title: text("title"),
  organization: text("organization"),
  avatarUrl: text("avatar_url"),
  progress: integer("progress").default(0),
  applicationId: integer("application_id").references(() => applications.id),
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
  thinking: integer("thinking").default(0),
  acting: integer("acting").default(0),
  feeling: integer("feeling").default(0),
  planning: integer("planning").default(0),
  createdAt: text("created_at"),
  imageUrl: text("image_url"),
  state: text("state").default('empty'),
});

export const flowAttributes = pgTable("flow_attributes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  attributes: jsonb("attributes").notNull(),
  flowScore: integer("flow_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wellbeingLevel: integer("wellbeing_level"),
  wellbeingFactors: text("wellbeing_factors"),
  oneYearVision: text("one_year_vision"),
  specificChanges: text("specific_changes"),
  quarterlyProgress: text("quarterly_progress"),
  quarterlyActions: text("quarterly_actions"),
  potentialImageUrls: jsonb("potential_image_urls"),
  imageMeaning: text("image_meaning"),
  futureVision: text("future_vision"),
  optimizedFlow: text("optimized_flow"),
  happyLifeAchievements: text("happy_life_achievements"),
  futureStatement: text("future_statement"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations between tables
export const usersRelations = relations(users, ({ one, many }) => ({
  starCard: one(starCards, {
    fields: [users.id],
    references: [starCards.userId],
  }),
  assessments: many(assessments),
  answers: many(answers),
  flowAttributes: one(flowAttributes, {
    fields: [users.id],
    references: [flowAttributes.userId],
  }),
  visualization: one(visualizations, {
    fields: [users.id],
    references: [visualizations.userId],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  user: one(users, {
    fields: [answers.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const starCardsRelations = relations(starCards, ({ one }) => ({
  user: one(users, {
    fields: [starCards.userId],
    references: [users.id],
  }),
}));

export const flowAttributesRelations = relations(flowAttributes, ({ one }) => ({
  user: one(users, {
    fields: [flowAttributes.userId],
    references: [users.id],
  }),
}));

export const visualizationsRelations = relations(visualizations, ({ one }) => ({
  user: one(users, {
    fields: [visualizations.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  title: true,
  organization: true,
  avatarUrl: true,
  progress: true,
  applicationId: true,
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
  thinking: true,
  acting: true,
  feeling: true,
  planning: true,
  createdAt: true,
  imageUrl: true,
  state: true,
});

export const insertFlowAttributesSchema = createInsertSchema(flowAttributes).pick({
  userId: true,
  attributes: true,
  flowScore: true,
  createdAt: true,
});

export const insertVisualizationSchema = createInsertSchema(visualizations).pick({
  userId: true,
  wellbeingLevel: true,
  wellbeingFactors: true,
  oneYearVision: true,
  specificChanges: true,
  quarterlyProgress: true,
  quarterlyActions: true,
  potentialImageUrls: true,
  imageMeaning: true,
  futureVision: true,
  optimizedFlow: true,
  happyLifeAchievements: true,
  futureStatement: true,
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

export enum AssessmentState {
  Empty = 'empty',        // No assessment data exists
  Partial = 'partial',    // Has assessment data (quadrant scores)
  Complete = 'complete'   // Has both assessment and flow attributes
}

export type InsertStarCard = z.infer<typeof insertStarCardSchema>;
export type StarCard = typeof starCards.$inferSelect & {
  assessmentState?: AssessmentState;
};

export type InsertFlowAttributes = z.infer<typeof insertFlowAttributesSchema>;
export type FlowAttributes = typeof flowAttributes.$inferSelect;

export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type Visualization = typeof visualizations.$inferSelect;

// Additional types for the frontend
export type QuadrantData = {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  pending?: boolean;
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
  answers: QuestionAnswer[];
};
