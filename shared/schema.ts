import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  primaryKey,
  serial,
  boolean,
  json,
  unique,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: varchar("email").unique(),
  title: varchar("title"),
  organization: varchar("organization"),
  avatarUrl: varchar("avatar_url"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles enum
export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}

// User roles table
export const userRoles = pgTable("user_roles", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull().$type<UserRole>(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.role] }),
}));

// Cohorts table
export const cohorts = pgTable("cohorts", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").notNull().default('upcoming'),
  cohortType: varchar("cohort_type").notNull().default('standard'),
  parentCohortId: integer("parent_cohort_id").references((): any => cohorts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cohort facilitators
export const cohortFacilitators = pgTable("cohort_facilitators", {
  cohortId: integer("cohort_id").notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  facilitatorId: integer("facilitator_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.cohortId, table.facilitatorId] }),
}));

// Cohort participants
export const cohortParticipants = pgTable("cohort_participants", {
  cohortId: integer("cohort_id").notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  participantId: integer("participant_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.cohortId, table.participantId] }),
}));

// Star Card table
export const starCards = pgTable("star_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  thinking: integer("thinking").default(0),
  acting: integer("acting").default(0),
  feeling: integer("feeling").default(0),
  planning: integer("planning").default(0),
  imageUrl: varchar("image_url"),
  state: varchar("state").default('incomplete'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flow attributes table
export const flowAttributes = pgTable("flow_attributes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  attributes: json("attributes").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  participatingCohorts: many(cohortParticipants),
  facilitatingCohorts: many(cohortFacilitators),
  starCard: many(starCards),
  flowAttributes: many(flowAttributes),
}));

export const cohortsRelations = relations(cohorts, ({ many, one }) => ({
  participants: many(cohortParticipants),
  facilitators: many(cohortFacilitators),
  parentCohort: one(cohorts, {
    fields: [cohorts.parentCohortId],
    references: [cohorts.id],
  }),
}));

// Define schemas for inserting data
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCohortSchema = createInsertSchema(cohorts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Define types
export type User = typeof users.$inferSelect & {
  // Include roles information that gets joined in queries
  roles?: { role: UserRole }[];
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = z.infer<typeof insertCohortSchema>;
export type StarCard = typeof starCards.$inferSelect;
export type FlowAttributesRecord = typeof flowAttributes.$inferSelect;

// Define a UserWithRole type for API responses
export type UserWithRole = User & {
  role: UserRole;
};