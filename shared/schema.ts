import { InferSelectModel, relations, sql } from 'drizzle-orm';
import { boolean, date, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==================== USER RELATED SCHEMAS ====================

export const users = pgTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().$type<'admin' | 'facilitator' | 'participant'>(),
  organization: varchar('organization', { length: 100 }),
  jobTitle: varchar('job_title', { length: 100 }),
  profilePicture: varchar('profile_picture', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles)
}));

// Schema for invites
export const invites = pgTable('invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inviteCode: varchar('invite_code', { length: 12 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().$type<'admin' | 'facilitator' | 'participant'>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: integer('created_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at'),
  usedAt: timestamp('used_at'),
  usedBy: integer('used_by').references(() => users.id)
});

// ==================== COHORT RELATED SCHEMAS ====================

export const cohorts = pgTable('cohorts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const cohortsRelations = relations(cohorts, ({ many }) => ({
  cohortParticipants: many(cohortParticipants),
  cohortFacilitators: many(cohortFacilitators)
}));

export const cohortParticipants = pgTable('cohort_participants', {
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  addedAt: timestamp('added_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.cohortId, table.userId] })
  };
});

export const cohortParticipantsRelations = relations(cohortParticipants, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortParticipants.cohortId],
    references: [cohorts.id]
  }),
  user: one(users, {
    fields: [cohortParticipants.userId],
    references: [users.id]
  })
}));

export const cohortFacilitators = pgTable('cohort_facilitators', {
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  addedAt: timestamp('added_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.cohortId, table.userId] })
  };
});

export const cohortFacilitatorsRelations = relations(cohortFacilitators, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortFacilitators.cohortId],
    references: [cohorts.id]
  }),
  user: one(users, {
    fields: [cohortFacilitators.userId],
    references: [users.id]
  })
}));

export const userRoles = pgTable('user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 20 }).notNull().$type<'admin' | 'facilitator' | 'participant'>(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id]
  })
}));

// ==================== VIDEO RELATED SCHEMAS ====================

export const videos = pgTable('videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  url: varchar('url', { length: 255 }).notNull(),
  workshopType: varchar('workshop_type', { length: 50 }).notNull(),
  section: varchar('section', { length: 50 }).notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ==================== SESSION RELATED SCHEMAS ====================

export const sessions = pgTable('sessions', {
  sid: varchar('sid', { length: 255 }).primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire', { withTimezone: true }).notNull(),
});

// ==================== TYPES AND SCHEMAS ====================

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type UserRole = InferSelectModel<typeof userRoles>;

// Invite types
export type Invite = InferSelectModel<typeof invites>;
export type NewInvite = z.infer<typeof insertInviteSchema>;

// Cohort types
export type Cohort = InferSelectModel<typeof cohorts>;
export type NewCohort = z.infer<typeof insertCohortSchema>;

// Video types
export type Video = InferSelectModel<typeof videos>;
export type NewVideo = z.infer<typeof insertVideoSchema>;

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(['admin', 'facilitator', 'participant']),
  email: z.string().email(),
  password: z.string().min(8)
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInviteSchema = createInsertSchema(invites, {
  role: z.enum(['admin', 'facilitator', 'participant']),
  email: z.string().email(),
  inviteCode: z.string().length(12)
}).omit({ id: true, createdAt: true, usedAt: true, usedBy: true });

export const insertCohortSchema = createInsertSchema(cohorts).omit({ id: true, createdAt: true, updatedAt: true });

export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true, updatedAt: true });