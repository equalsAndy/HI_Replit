import { pgTable, pgEnum, serial, text, timestamp, varchar, integer, boolean, date, json, jsonb, uuid, unique, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'facilitator', 'participant']);
export const workshopTypeEnum = pgEnum('workshop_type', ['star_teams', 'imaginal_agility']);
export const videoTypeEnum = pgEnum('video_type', ['intro', 'guide', 'instruction', 'activity', 'reflection', 'conclusion']);

// User Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  email: varchar('email', { length: 100 }).unique(),
  organization: varchar('organization', { length: 100 }),
  jobTitle: varchar('job_title', { length: 100 }),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  role: userRoleEnum('role').notNull().default('participant'),
  inviteCode: varchar('invite_code', { length: 12 }).unique(),
  codeUsed: boolean('code_used').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  lastLogin: timestamp('last_login'),
  createdByFacilitator: integer('created_by_facilitator').references(() => users.id),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  role: userRoleEnum('role').notNull().default('participant'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => ({
  userRoleUnique: unique().on(table.userId, table.role),
}));

export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  inviteCode: varchar('invite_code', { length: 12 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  usedBy: integer('used_by').references(() => users.id),
  role: userRoleEnum('role').notNull().default('participant'),
  cohortId: integer('cohort_id').references(() => cohorts.id),
});

// Workshop Tables
export const workshops = pgTable('workshops', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  workshopType: workshopTypeEnum('workshop_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  thumbnail: text('thumbnail'),
  order: integer('order').default(0).notNull(),
});

export const workshopModules = pgTable('workshop_modules', {
  id: serial('id').primaryKey(),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const workshopSections = pgTable('workshop_sections', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').notNull().references(() => workshopModules.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Cohort Tables
export const cohorts = pgTable('cohorts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  facilitatorId: integer('facilitator_id').references(() => users.id),
  workshopId: integer('workshop_id').references(() => workshops.id),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  organizationName: varchar('organization_name', { length: 100 }),
});

export const cohortParticipants = pgTable('cohort_participants', {
  id: serial('id').primaryKey(),
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id),
  participantId: integer('participant_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  progress: integer('progress').default(0).notNull(),
}, table => ({
  cohortParticipantUnique: unique().on(table.cohortId, table.participantId),
}));

// Video Resources
export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  url: text('url').notNull(),
  workshopType: workshopTypeEnum('workshop_type'),
  videoType: videoTypeEnum('video_type'),
  duration: integer('duration'),
  section: varchar('section', { length: 100 }),
  sectionOrder: integer('section_order').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Progress
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  moduleId: integer('module_id').references(() => workshopModules.id),
  sectionId: integer('section_id').references(() => workshopSections.id),
  completedAt: timestamp('completed_at'),
  progress: integer('progress').default(0).notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  notes: text('notes'),
}, table => ({
  userWorkshopUnique: unique().on(table.userId, table.workshopId),
}));

// User Assessment and Profiles
export const userAssessments = pgTable('user_assessments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  workshopId: integer('workshop_id').notNull().references(() => workshops.id),
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(),
  assessmentData: jsonb('assessment_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userStarProfiles = pgTable('user_star_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  dominantType: varchar('dominant_type', { length: 10 }).notNull(),
  secondaryType: varchar('secondary_type', { length: 10 }),
  starData: jsonb('star_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userFlowStates = pgTable('user_flow_states', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  flowData: jsonb('flow_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  assessments: many(userAssessments),
  starProfiles: many(userStarProfiles),
  flowStates: many(userFlowStates),
  progress: many(userProgress),
  facilitatedCohorts: many(cohorts, { relationName: 'facilitator' }),
  participatedCohorts: many(cohortParticipants, { relationName: 'participant' }),
  createdInvites: many(invites, { relationName: 'creator' }),
}));

export const cohortsRelations = relations(cohorts, ({ one, many }) => ({
  facilitator: one(users, {
    fields: [cohorts.facilitatorId],
    references: [users.id],
    relationName: 'facilitator',
  }),
  workshop: one(workshops, {
    fields: [cohorts.workshopId],
    references: [workshops.id],
  }),
  participants: many(cohortParticipants),
}));

export const workshopsRelations = relations(workshops, ({ many }) => ({
  modules: many(workshopModules),
  cohorts: many(cohorts),
  progress: many(userProgress),
}));

export const workshopModulesRelations = relations(workshopModules, ({ one, many }) => ({
  workshop: one(workshops, {
    fields: [workshopModules.workshopId],
    references: [workshops.id],
  }),
  sections: many(workshopSections),
  progress: many(userProgress),
}));

export const workshopSectionsRelations = relations(workshopSections, ({ one, many }) => ({
  module: one(workshopModules, {
    fields: [workshopSections.moduleId],
    references: [workshopModules.id],
  }),
  progress: many(userProgress),
}));

export const cohortParticipantsRelations = relations(cohortParticipants, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortParticipants.cohortId],
    references: [cohorts.id],
  }),
  participant: one(users, {
    fields: [cohortParticipants.participantId],
    references: [users.id],
    relationName: 'participant',
  }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
  creator: one(users, {
    fields: [invites.createdBy],
    references: [users.id],
    relationName: 'creator',
  }),
  user: one(users, {
    fields: [invites.usedBy],
    references: [users.id],
    relationName: 'user',
  }),
  cohort: one(cohorts, {
    fields: [invites.cohortId],
    references: [cohorts.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email('Invalid email format'),
  username: (schema) => schema.username.min(3, 'Username must be at least 3 characters'),
  password: (schema) => schema.password.min(8, 'Password must be at least 8 characters'),
}).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true, lastLogin: true });

export const insertInviteSchema = createInsertSchema(invites, {
  email: (schema) => schema.email.email('Invalid email format'),
  inviteCode: (schema) => schema.inviteCode.length(12, 'Invite code must be 12 characters'),
}).omit({ id: true, createdAt: true, usedAt: true, usedBy: true });

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true, updatedAt: true });

export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCohortSchema = createInsertSchema(cohorts).omit({ id: true, createdAt: true, updatedAt: true });

export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type UserRole = z.infer<typeof userRoleEnum.enum>;
export type WorkshopType = z.infer<typeof workshopTypeEnum.enum>;
export type VideoType = z.infer<typeof videoTypeEnum.enum>;
export type Invite = typeof invites.$inferSelect;
export type Workshop = typeof workshops.$inferSelect;
export type Cohort = typeof cohorts.$inferSelect;
export type Video = typeof videos.$inferSelect;

// Custom Types
export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}