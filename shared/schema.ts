import { pgTable, serial, varchar, timestamp, text, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define the QuadrantData type for use in star card data
export interface QuadrantData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('participant'),
  organization: text('organization'),
  jobTitle: text('job_title'),
  profilePicture: text('profile_picture'),
  isTestUser: boolean('is_test_user').default(false).notNull(),
  navigationProgress: text('navigation_progress'), // JSON string storing navigation state
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schema for users  
export const insertUserSchema = createInsertSchema(users);

// Type definitions for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Videos table schema
export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  url: text('url').notNull(),
  editableId: varchar('editable_id', { length: 100 }),
  workshopType: varchar('workshop_type', { length: 50 }).notNull(),
  section: varchar('section', { length: 50 }).notNull(),
  stepId: varchar('step_id', { length: 20 }), // For navigation step identifiers like "1-1", "2-3"
  autoplay: boolean('autoplay').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schema for videos
export const insertVideoSchema = createInsertSchema(videos);

// Type definitions for videos
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

// Invite codes table schema
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  inviteCode: varchar('invite_code', { length: 12 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('participant'),
  name: text('name'),
  createdBy: serial('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  usedAt: timestamp('used_at'),
  usedBy: serial('used_by'),
});

// Create insert schema for invites
export const insertInviteSchema = createInsertSchema(invites);

// Type definitions for TypeScript
export type Invite = typeof invites.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;

// Session store for Express sessions
export const sessions = pgTable('sessions', {
  sid: varchar('sid', { length: 255 }).primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire').notNull(),
});

// Workshop participation table for tracking user progress
export const workshopParticipation = pgTable('workshop_participation', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull(),
  workshopId: serial('workshop_id').notNull(),
  progress: text('progress'),
  completed: boolean('completed').default(false),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
});

// User assessments table for tracking assessment results
export const userAssessments = pgTable('user_assessments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(),
  results: text('results').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create insert schema for user assessments
export const insertUserAssessmentSchema = createInsertSchema(userAssessments);

// Type definitions for user assessments
export type UserAssessment = typeof userAssessments.$inferSelect;
export type InsertUserAssessment = z.infer<typeof insertUserAssessmentSchema>;

// Growth plans table for quarterly planning
export const growthPlans = pgTable('growth_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  quarter: varchar('quarter', { length: 2 }).notNull(), // Q1, Q2, Q3, Q4
  year: integer('year').notNull(),
  starPowerReflection: text('star_power_reflection'),
  ladderCurrentLevel: integer('ladder_current_level'),
  ladderTargetLevel: integer('ladder_target_level'),
  ladderReflections: text('ladder_reflections'),
  strengthsExamples: text('strengths_examples'), // JSON string
  flowPeakHours: text('flow_peak_hours'), // JSON array of hours
  flowCatalysts: text('flow_catalysts'),
  visionStart: text('vision_start'),
  visionNow: text('vision_now'),
  visionNext: text('vision_next'),
  progressWorking: text('progress_working'),
  progressNeedHelp: text('progress_need_help'),
  teamFlowStatus: text('team_flow_status'),
  teamEnergySource: text('team_energy_source'),
  teamNextCheckin: text('team_next_checkin'),
  keyPriorities: text('key_priorities'), // JSON array
  successLooksLike: text('success_looks_like'),
  keyDates: text('key_dates'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schema for growth plans
export const insertGrowthPlanSchema = createInsertSchema(growthPlans);

// Type definitions for growth plans
export type GrowthPlan = typeof growthPlans.$inferSelect;
export type InsertGrowthPlan = z.infer<typeof insertGrowthPlanSchema>;

// Navigation progress table for tracking user progression
export const navigationProgress = pgTable('navigation_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  appType: varchar('app_type', { length: 10 }).notNull(), // 'ast' or 'ia'
  completedSteps: text('completed_steps').notNull(), // JSON array of step IDs
  currentStepId: varchar('current_step_id', { length: 20 }).notNull(),
  unlockedSteps: text('unlocked_steps').notNull(), // JSON array of step IDs
  videoProgress: text('video_progress'), // JSON object of video progress
  lastVisitedAt: timestamp('last_visited_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schema for navigation progress
export const insertNavigationProgressSchema = createInsertSchema(navigationProgress);

// Type definitions for navigation progress
export type NavigationProgress = typeof navigationProgress.$inferSelect;
export type InsertNavigationProgress = z.infer<typeof insertNavigationProgressSchema>;