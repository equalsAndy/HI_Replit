import { pgTable, serial, varchar, timestamp, text, boolean, integer, jsonb, index, unique, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define the QuadrantData type for use in star card data
export interface QuadrantData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

// Define valid user roles
export const UserRoles = ['admin', 'facilitator', 'participant', 'student'] as const;
export type UserRole = typeof UserRoles[number];

// Define valid content access types
export const ContentAccessTypes = ['student', 'professional', 'both'] as const;
export type ContentAccess = typeof ContentAccessTypes[number];

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cohorts table (using existing integer ID structure)
export const cohorts = pgTable('cohorts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 50 }),
  cohortType: varchar('cohort_type', { length: 50 }),
  parentCohortId: integer('parent_cohort_id'),
  // New facilitator console fields
  facilitatorId: integer('facilitator_id').references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  astAccess: boolean('ast_access').default(false).notNull(),
  iaAccess: boolean('ia_access').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Teams table
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  cohortId: integer('cohort_id').references(() => cohorts.id, { onDelete: 'cascade' }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
  // Access control fields
  contentAccess: varchar('content_access', { length: 20 }).notNull().default('professional'), // student, professional, both
  astAccess: boolean('ast_access').default(true).notNull(), // AllStarTeams workshop access
  iaAccess: boolean('ia_access').default(true).notNull(), // Imaginal Agility workshop access
  // Workshop completion tracking
  astWorkshopCompleted: boolean('ast_workshop_completed').default(false).notNull(),
  iaWorkshopCompleted: boolean('ia_workshop_completed').default(false).notNull(),
  astCompletedAt: timestamp('ast_completed_at'),
  iaCompletedAt: timestamp('ia_completed_at'),
  // Facilitator console fields
  assignedFacilitatorId: integer('assigned_facilitator_id').references(() => users.id, { onDelete: 'set null' }),
  cohortId: integer('cohort_id').references(() => cohorts.id, { onDelete: 'set null' }),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'set null' }),
  // Invite tracking field
  invitedBy: integer('invited_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schemas for all tables
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertCohortSchema = createInsertSchema(cohorts);
export const insertTeamSchema = createInsertSchema(teams);

export const insertUserSchema = createInsertSchema(users).extend({
  role: z.enum(['admin', 'facilitator', 'participant', 'student']).default('participant'),
  contentAccess: z.enum(['student', 'professional', 'both']).default('professional'),
  astAccess: z.boolean().default(true),
  iaAccess: z.boolean().default(true),
  astWorkshopCompleted: z.boolean().default(false),
  iaWorkshopCompleted: z.boolean().default(false)
});

// Type definitions for TypeScript
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = z.infer<typeof insertCohortSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
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

// Cohort facilitators junction table
export const cohortFacilitators = pgTable('cohort_facilitators', {
  id: serial('id').primaryKey(),
  cohortId: integer('cohort_id').references(() => cohorts.id, { onDelete: 'cascade' }),
  facilitatorId: integer('facilitator_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create insert schema for cohort facilitators
export const insertCohortFacilitatorSchema = createInsertSchema(cohortFacilitators);

// Type definitions for cohort facilitators
export type CohortFacilitator = typeof cohortFacilitators.$inferSelect;
export type InsertCohortFacilitator = z.infer<typeof insertCohortFacilitatorSchema>;

// Invite codes table schema
export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  inviteCode: varchar('invite_code', { length: 12 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('participant'),
  name: text('name'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  usedAt: timestamp('used_at'),
  usedBy: integer('used_by'),
});

// Create insert schema for invites with role validation
export const insertInviteSchema = createInsertSchema(invites).extend({
  role: z.enum(['admin', 'facilitator', 'participant', 'student']).default('participant')
});

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

// Discernment scenarios table for discernment training exercises
export const discernmentScenarios = pgTable('discernment_scenarios', {
  id: serial('id').primaryKey(),
  exerciseType: varchar('exercise_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  questions: jsonb('questions').notNull(),
  metadata: jsonb('metadata').default('{}'),
  difficultyLevel: integer('difficulty_level').default(1),
  tags: text('tags').array(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// User discernment progress tracking table
export const userDiscernmentProgress = pgTable('user_discernment_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scenariosSeen: jsonb('scenarios_seen').default('[]'),
  lastSessionAt: timestamp('last_session_at').defaultNow(),
  totalSessions: integer('total_sessions').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  userIdIdx: index('idx_user_discernment_progress_user_id').on(table.userId),
  userIdUnique: unique().on(table.userId)
}));

// Create insert schemas for discernment tables
export const insertDiscernmentScenarioSchema = createInsertSchema(discernmentScenarios);
export const insertUserDiscernmentProgressSchema = createInsertSchema(userDiscernmentProgress);

// Type definitions for discernment tables
export type DiscernmentScenario = typeof discernmentScenarios.$inferSelect;
export type InsertDiscernmentScenario = z.infer<typeof insertDiscernmentScenarioSchema>;
export type UserDiscernmentProgress = typeof userDiscernmentProgress.$inferSelect;
export type InsertUserDiscernmentProgress = z.infer<typeof insertUserDiscernmentProgressSchema>;

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

// Final reflections table for storing user insights
export const finalReflections = pgTable('final_reflections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  insight: text('insight').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schema for final reflections
export const insertFinalReflectionSchema = createInsertSchema(finalReflections);

// Type definitions for final reflections
export type FinalReflection = typeof finalReflections.$inferSelect;
export type InsertFinalReflection = z.infer<typeof insertFinalReflectionSchema>;