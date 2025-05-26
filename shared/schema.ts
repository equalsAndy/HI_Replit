import { pgTable, serial, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';
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
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(100),
  password: z.string().min(8),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'facilitator', 'participant']),
  organization: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  isTestUser: z.boolean().default(false),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Type definitions for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
export const insertInviteSchema = createInsertSchema(invites, {
  inviteCode: z.string().length(12),
  email: z.string().email(),
  role: z.enum(['admin', 'facilitator', 'participant']),
  name: z.string().nullable().optional(),
  createdBy: z.number(),
  expiresAt: z.date().nullable().optional(),
}).omit({ id: true, createdAt: true, usedAt: true, usedBy: true });

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
  userId: serial('user_id').notNull(),
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(),
  results: text('results').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});