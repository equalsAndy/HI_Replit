import { pgTable, text, integer, timestamp, serial, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define role types
export const userRoleEnum = pgEnum('user_role', ['admin', 'facilitator', 'participant']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('participant'),
  organization: text('organization'),
  jobTitle: text('job_title'),
  profilePicture: text('profile_picture'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Invites table
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  inviteCode: text('invite_code').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: userRoleEnum('role').notNull().default('participant'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  usedAt: timestamp('used_at'),
  usedBy: integer('used_by').references(() => users.id),
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInviteSchema = createInsertSchema(invites, {
  email: z.string().email("Invalid email address"),
  inviteCode: z.string().min(12).max(14),
  role: z.enum(['admin', 'facilitator', 'participant']),
}).omit({ id: true, createdAt: true, usedAt: true, usedBy: true });

// Type definitions for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Invite = typeof invites.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;

// Role type definition
export type UserRole = 'admin' | 'facilitator' | 'participant';