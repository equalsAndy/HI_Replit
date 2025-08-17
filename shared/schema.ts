import { pgTable, serial, varchar, timestamp, text, boolean, integer, jsonb, index, unique, uuid, primaryKey } from 'drizzle-orm/pg-core';
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
export const users: any = pgTable('users', {
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
  isBetaTester: boolean('is_beta_tester').default(false).notNull(),
  hasSeenBetaWelcome: boolean('has_seen_beta_welcome').default(false).notNull(),
  showDemoDataButtons: boolean('show_demo_data_buttons').default(false).notNull(), // Admin-granted permission for demo data access
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
  assignedFacilitatorId: integer('assigned_facilitator_id'),
  cohortId: integer('cohort_id'),
  teamId: integer('team_id'),
  // Invite tracking field
  invitedBy: integer('invited_by'),
  // Talia training access control
  canTrainTalia: boolean('can_train_talia').default(false).notNull(),
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
  iaWorkshopCompleted: z.boolean().default(false),
  canTrainTalia: z.boolean().default(false)
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
  // Video management enhancements
  contentMode: varchar('content_mode', { length: 20 }).default('both').notNull(), // 'student', 'professional', 'both'
  requiredWatchPercentage: integer('required_watch_percentage').default(75).notNull(), // Percentage required to unlock next step
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

// Cohort participants junction table
export const cohortParticipants = pgTable('cohort_participants', {
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  participantId: integer('participant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.cohortId, table.participantId] }),
}));

// Create insert schema for cohort facilitators
export const insertCohortFacilitatorSchema = createInsertSchema(cohortFacilitators);

// Type definitions for cohort facilitators
export type CohortFacilitator = typeof cohortFacilitators.$inferSelect;
export type InsertCohortFacilitator = z.infer<typeof insertCohortFacilitatorSchema>;

// Create insert schema for cohort participants
export const insertCohortParticipantSchema = createInsertSchema(cohortParticipants);

// Type definitions for cohort participants
export type CohortParticipant = typeof cohortParticipants.$inferSelect;
export type InsertCohortParticipant = z.infer<typeof insertCohortParticipantSchema>;

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
  cohortId: integer('cohort_id'),
  organizationId: varchar('organization_id', { length: 255 }),
  isBetaTester: boolean('is_beta_tester').default(false).notNull(),
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

// Workshop step data table for storing all workshop input data
export const workshopStepData = pgTable('workshop_step_data', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workshopType: varchar('workshop_type', { length: 10 }).notNull(), // 'ast' or 'ia'
  stepId: varchar('step_id', { length: 20 }).notNull(), // e.g., 'ia-3-4', '2-1'
  data: jsonb('data').notNull(), // Flexible JSON storage for any step data
  version: integer('version').default(1).notNull(), // For future versioning support
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // NULL = active, timestamp = soft deleted
}, (table) => ({
  // Unique constraint ensures one record per user/workshop/step
  userWorkshopStepIdx: unique('workshop_step_data_user_workshop_step_unique').on(table.userId, table.workshopType, table.stepId),
  // Index for fast lookups
  userWorkshopIdx: index('idx_workshop_step_data_user_workshop').on(table.userId, table.workshopType),
}));

// Create insert schemas
export const insertNavigationProgressSchema = createInsertSchema(navigationProgress);
export const insertWorkshopStepDataSchema = createInsertSchema(workshopStepData);

// Type definitions
export type NavigationProgress = typeof navigationProgress.$inferSelect;
export type WorkshopStepData = typeof workshopStepData.$inferSelect;
export type InsertWorkshopStepData = typeof workshopStepData.$inferInsert;
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

// Star cards table for user assessment results
export const starCards = pgTable('star_cards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  thinking: integer('thinking').notNull(),
  acting: integer('acting').notNull(),
  feeling: integer('feeling').notNull(),
  planning: integer('planning').notNull(),
  imageUrl: text('image_url'),
  state: text('state'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flow attributes table for user flow assessment data
export const flowAttributes = pgTable('flow_attributes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  attributes: jsonb('attributes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Knowledge Base for the Coach
export const coachKnowledgeBase = pgTable('coach_knowledge_base', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    source: varchar('source', { length: 255 }),
    category: varchar('category', { length: 100 }),
    metadata: jsonb('metadata'), // For storing section_title, key_concepts, etc.
    searchVector: text('search_vector'), // This will be a tsvector type in the DB
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        categoryIndex: index('knowledge_category_idx').on(table.category),
        // A GIN index for full-text search will be created manually in a migration
    };
});

// Extended user profiles for team connections and collaboration
export const userProfilesExtended = pgTable('user_profiles_extended', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Company/Team Info
  company: varchar('company', { length: 255 }),
  department: varchar('department', { length: 255 }),
  role: varchar('role', { length: 255 }),
  
  // AST Profile Summary (derived from workshop data)
  astProfileSummary: jsonb('ast_profile_summary'), // processed Star Card + flow data
  
  // Expertise and Experience
  expertiseAreas: jsonb('expertise_areas'), // array of skills/domains
  projectExperience: jsonb('project_experience'), // past projects and roles
  collaborationPreferences: jsonb('collaboration_preferences'), // work style preferences
  
  // Team Connection Data
  availabilityStatus: varchar('availability_status', { length: 50 }).default('available'),
  connectionOptIn: boolean('connection_opt_in').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Coaching conversation sessions
export const coachingSessions = pgTable('coaching_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Conversation Data
  conversation: jsonb('conversation').notNull(), // full message history
  sessionSummary: text('session_summary'), // AI-generated summary of key topics
  contextUsed: jsonb('context_used'), // what knowledge base content was referenced
  
  // Session Metadata
  sessionType: varchar('session_type', { length: 50 }).default('general'),
  sessionLength: varchar('session_length', { length: 50 }),
  userSatisfaction: varchar('user_satisfaction', { length: 20 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team connection suggestions and tracking
export const connectionSuggestions = pgTable('connection_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestorId: integer('requestor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  suggestedCollaboratorId: integer('suggested_collaborator_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Connection Logic
  reasonType: varchar('reason_type', { length: 100 }).notNull(),
  reasonExplanation: text('reason_explanation').notNull(),
  context: text('context'),
  
  // Status Tracking
  status: varchar('status', { length: 50 }).default('suggested'),
  responseAt: timestamp('response_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vector embeddings references (for linking to external vector DB)
export const vectorEmbeddings = pgTable('vector_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceTable: varchar('source_table', { length: 100 }).notNull(),
  sourceId: varchar('source_id', { length: 255 }).notNull(),
  vectorId: varchar('vector_id', { length: 255 }).notNull(),
  embeddingType: varchar('embedding_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create insert schemas for star cards and flow attributes
export const insertStarCardSchema = createInsertSchema(starCards);
export const insertFlowAttributesSchema = createInsertSchema(flowAttributes);

// Create insert schemas for new coaching tables
export const insertCoachKnowledgeBaseSchema = createInsertSchema(coachKnowledgeBase);
export const insertUserProfilesExtendedSchema = createInsertSchema(userProfilesExtended);
export const insertCoachingSessionsSchema = createInsertSchema(coachingSessions);
export const insertConnectionSuggestionsSchema = createInsertSchema(connectionSuggestions);
export const insertVectorEmbeddingsSchema = createInsertSchema(vectorEmbeddings);

// Type definitions for star cards and flow attributes
export type StarCard = typeof starCards.$inferSelect;
export type InsertStarCard = z.infer<typeof insertStarCardSchema>;
export type FlowAttributesRecord = typeof flowAttributes.$inferSelect;
export type InsertFlowAttributes = z.infer<typeof insertFlowAttributesSchema>;

// AST AI Coaching Chatbot Tables
export const coachingConversations = pgTable('coaching_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'set null' }),
  personaType: varchar('persona_type', { length: 50 }).notNull(), // 'workshop_assistant', 'talia_coach', 'team_advisor'
  workshopStep: varchar('workshop_step', { length: 100 }),
  title: varchar('title', { length: 255 }),
  contextData: jsonb('context_data'), // Store workshop context, team context, etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const coachingMessages = pgTable('coaching_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => coachingConversations.id, { onDelete: 'cascade' }).notNull(),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // 'user' or 'ai'
  messageContent: text('message_content').notNull(),
// //   bedrockRequestId: varchar('bedrock_request_id', { length: 255 }), // Track AWS Bedrock requests
  attachments: jsonb('attachments'), // File attachments, images, etc.
  messageMetadata: jsonb('message_metadata'), // Additional context, tokens used, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userCoachingPreferences = pgTable('user_coaching_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  preferredPersona: varchar('preferred_persona', { length: 50 }).default('workshop_assistant'),
  coachingStyle: varchar('coaching_style', { length: 50 }).default('supportive'), // 'supportive', 'direct', 'exploratory'
  workshopProgress: jsonb('workshop_progress'), // Track progress through AST workshops
  notificationSettings: jsonb('notification_settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const coachingPrompts = pgTable('coaching_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  promptKey: varchar('prompt_key', { length: 100 }).notNull().unique(),
  personaType: varchar('persona_type', { length: 50 }).notNull(),
  systemInstructions: text('system_instructions').notNull(),
  contextTemplate: text('context_template'), // Template for injecting dynamic context
  isActive: boolean('is_active').default(true).notNull(),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schemas for chatbot tables
export const insertCoachingConversationSchema = createInsertSchema(coachingConversations);
export const insertCoachingMessageSchema = createInsertSchema(coachingMessages);
export const insertUserCoachingPreferencesSchema = createInsertSchema(userCoachingPreferences);
export const insertCoachingPromptSchema = createInsertSchema(coachingPrompts);

// Type definitions for new coaching tables
export type CoachKnowledgeBase = typeof coachKnowledgeBase.$inferSelect;
export type InsertCoachKnowledgeBase = z.infer<typeof insertCoachKnowledgeBaseSchema>;
export type UserProfileExtended = typeof userProfilesExtended.$inferSelect;
export type InsertUserProfileExtended = z.infer<typeof insertUserProfilesExtendedSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionsSchema>;
export type ConnectionSuggestion = typeof connectionSuggestions.$inferSelect;
export type InsertConnectionSuggestion = z.infer<typeof insertConnectionSuggestionsSchema>;
export type VectorEmbedding = typeof vectorEmbeddings.$inferSelect;
export type InsertVectorEmbedding = z.infer<typeof insertVectorEmbeddingsSchema>;

// Type definitions for chatbot tables
export type CoachingConversation = typeof coachingConversations.$inferSelect;
export type InsertCoachingConversation = z.infer<typeof insertCoachingConversationSchema>;
export type CoachingMessage = typeof coachingMessages.$inferSelect;
export type InsertCoachingMessage = z.infer<typeof insertCoachingMessageSchema>;
export type UserCoachingPreferences = typeof userCoachingPreferences.$inferSelect;
export type InsertUserCoachingPreferences = z.infer<typeof insertUserCoachingPreferencesSchema>;
export type CoachingPrompt = typeof coachingPrompts.$inferSelect;
export type InsertCoachingPrompt = z.infer<typeof insertCoachingPromptSchema>;

// Feedback System Tables
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // Allow anonymous feedback
  workshopType: varchar('workshop_type', { length: 20 }).notNull(), // 'ast' or 'ia'
  pageContext: varchar('page_context', { length: 20 }).notNull(), // 'current', 'other', 'general'
  targetPage: varchar('target_page', { length: 100 }), // Specific page name or null for general
  feedbackType: varchar('feedback_type', { length: 20 }).notNull(), // 'bug', 'feature', 'content', 'general'
  priority: varchar('priority', { length: 10 }).notNull().default('low'), // 'low', 'medium', 'high', 'blocker'
  message: text('message').notNull(),
  experienceRating: integer('experience_rating'), // 1-5 rating
  status: varchar('status', { length: 20 }).notNull().default('new'), // 'new', 'read', 'in_progress', 'resolved', 'archived'
  tags: jsonb('tags').default('[]'), // Array of tags
  systemInfo: jsonb('system_info').notNull(), // Browser, OS, screen size, etc.
  adminNotes: text('admin_notes'), // Admin notes and comments
  jiraTicketId: varchar('jira_ticket_id', { length: 50 }), // Reference to created Jira ticket
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_feedback_user_id').on(table.userId),
  workshopTypeIdx: index('idx_feedback_workshop_type').on(table.workshopType),
  statusIdx: index('idx_feedback_status').on(table.status),
  createdAtIdx: index('idx_feedback_created_at').on(table.createdAt),
}));

// Create insert schema for feedback
export const insertFeedbackSchema = createInsertSchema(feedback).extend({
  workshopType: z.enum(['ast', 'ia']),
  pageContext: z.enum(['current', 'other', 'general']),
  feedbackType: z.enum(['bug', 'feature', 'content', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'blocker']).default('low'),
  status: z.enum(['new', 'in_progress', 'resolved', 'archived']).default('new'),
  experienceRating: z.number().min(1).max(5).optional(),
});

// Type definitions for feedback
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;