import { pgTable, serial, varchar, timestamp, text, boolean, integer, jsonb, index, unique, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const UserRoles = ['admin', 'facilitator', 'participant', 'student'];
export const ContentAccessTypes = ['student', 'professional', 'both'];
export const organizations = pgTable('organizations', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const cohorts = pgTable('cohorts', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    status: varchar('status', { length: 50 }),
    cohortType: varchar('cohort_type', { length: 50 }),
    parentCohortId: integer('parent_cohort_id'),
    facilitatorId: integer('facilitator_id').references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
    astAccess: boolean('ast_access').default(false).notNull(),
    iaAccess: boolean('ia_access').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const teams = pgTable('teams', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    cohortId: integer('cohort_id').references(() => cohorts.id, { onDelete: 'cascade' }),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
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
    isBetaTester: boolean('is_beta_tester').default(false).notNull(),
    hasSeenBetaWelcome: boolean('has_seen_beta_welcome').default(false).notNull(),
    showDemoDataButtons: boolean('show_demo_data_buttons').default(true).notNull(),
    navigationProgress: text('navigation_progress'),
    contentAccess: varchar('content_access', { length: 20 }).notNull().default('professional'),
    astAccess: boolean('ast_access').default(true).notNull(),
    iaAccess: boolean('ia_access').default(true).notNull(),
    astWorkshopCompleted: boolean('ast_workshop_completed').default(false).notNull(),
    iaWorkshopCompleted: boolean('ia_workshop_completed').default(false).notNull(),
    astCompletedAt: timestamp('ast_completed_at'),
    iaCompletedAt: timestamp('ia_completed_at'),
    assignedFacilitatorId: integer('assigned_facilitator_id'),
    cohortId: integer('cohort_id'),
    teamId: integer('team_id'),
    invitedBy: integer('invited_by'),
    canTrainTalia: boolean('can_train_talia').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
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
export const videos = pgTable('videos', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    url: text('url').notNull(),
    editableId: varchar('editable_id', { length: 100 }),
    workshopType: varchar('workshop_type', { length: 50 }).notNull(),
    section: varchar('section', { length: 50 }).notNull(),
    stepId: varchar('step_id', { length: 20 }),
    autoplay: boolean('autoplay').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    contentMode: varchar('content_mode', { length: 20 }).default('both').notNull(),
    requiredWatchPercentage: integer('required_watch_percentage').default(75).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertVideoSchema = createInsertSchema(videos);
export const cohortFacilitators = pgTable('cohort_facilitators', {
    id: serial('id').primaryKey(),
    cohortId: integer('cohort_id').references(() => cohorts.id, { onDelete: 'cascade' }),
    facilitatorId: integer('facilitator_id').references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const cohortParticipants = pgTable('cohort_participants', {
    cohortId: integer('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
    participantId: integer('participant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.cohortId, table.participantId] }),
}));
export const insertCohortFacilitatorSchema = createInsertSchema(cohortFacilitators);
export const insertCohortParticipantSchema = createInsertSchema(cohortParticipants);
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
export const insertInviteSchema = createInsertSchema(invites).extend({
    role: z.enum(['admin', 'facilitator', 'participant', 'student']).default('participant')
});
export const sessions = pgTable('sessions', {
    sid: varchar('sid', { length: 255 }).primaryKey(),
    sess: text('sess').notNull(),
    expire: timestamp('expire').notNull(),
});
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
export const userAssessments = pgTable('user_assessments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    assessmentType: varchar('assessment_type', { length: 50 }).notNull(),
    results: text('results').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const insertUserAssessmentSchema = createInsertSchema(userAssessments);
export const growthPlans = pgTable('growth_plans', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    quarter: varchar('quarter', { length: 2 }).notNull(),
    year: integer('year').notNull(),
    starPowerReflection: text('star_power_reflection'),
    ladderCurrentLevel: integer('ladder_current_level'),
    ladderTargetLevel: integer('ladder_target_level'),
    ladderReflections: text('ladder_reflections'),
    strengthsExamples: text('strengths_examples'),
    flowPeakHours: text('flow_peak_hours'),
    flowCatalysts: text('flow_catalysts'),
    visionStart: text('vision_start'),
    visionNow: text('vision_now'),
    visionNext: text('vision_next'),
    progressWorking: text('progress_working'),
    progressNeedHelp: text('progress_need_help'),
    teamFlowStatus: text('team_flow_status'),
    teamEnergySource: text('team_energy_source'),
    teamNextCheckin: text('team_next_checkin'),
    keyPriorities: text('key_priorities'),
    successLooksLike: text('success_looks_like'),
    keyDates: text('key_dates'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertGrowthPlanSchema = createInsertSchema(growthPlans);
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
export const insertDiscernmentScenarioSchema = createInsertSchema(discernmentScenarios);
export const insertUserDiscernmentProgressSchema = createInsertSchema(userDiscernmentProgress);
export const navigationProgress = pgTable('navigation_progress', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    appType: varchar('app_type', { length: 10 }).notNull(),
    completedSteps: text('completed_steps').notNull(),
    currentStepId: varchar('current_step_id', { length: 20 }).notNull(),
    unlockedSteps: text('unlocked_steps').notNull(),
    videoProgress: text('video_progress'),
    lastVisitedAt: timestamp('last_visited_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const workshopStepData = pgTable('workshop_step_data', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    workshopType: varchar('workshop_type', { length: 10 }).notNull(),
    stepId: varchar('step_id', { length: 20 }).notNull(),
    data: jsonb('data').notNull(),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    userWorkshopStepIdx: unique('workshop_step_data_user_workshop_step_unique').on(table.userId, table.workshopType, table.stepId),
    userWorkshopIdx: index('idx_workshop_step_data_user_workshop').on(table.userId, table.workshopType),
}));
export const insertNavigationProgressSchema = createInsertSchema(navigationProgress);
export const insertWorkshopStepDataSchema = createInsertSchema(workshopStepData);
export const finalReflections = pgTable('final_reflections', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    insight: text('insight').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertFinalReflectionSchema = createInsertSchema(finalReflections);
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
export const flowAttributes = pgTable('flow_attributes', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    attributes: jsonb('attributes').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const coachKnowledgeBase = pgTable('coach_knowledge_base', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    source: varchar('source', { length: 255 }),
    category: varchar('category', { length: 100 }),
    metadata: jsonb('metadata'),
    searchVector: text('search_vector'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        categoryIndex: index('knowledge_category_idx').on(table.category),
    };
});
export const userProfilesExtended = pgTable('user_profiles_extended', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    company: varchar('company', { length: 255 }),
    department: varchar('department', { length: 255 }),
    role: varchar('role', { length: 255 }),
    astProfileSummary: jsonb('ast_profile_summary'),
    expertiseAreas: jsonb('expertise_areas'),
    projectExperience: jsonb('project_experience'),
    collaborationPreferences: jsonb('collaboration_preferences'),
    availabilityStatus: varchar('availability_status', { length: 50 }).default('available'),
    connectionOptIn: boolean('connection_opt_in').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const coachingSessions = pgTable('coaching_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    conversation: jsonb('conversation').notNull(),
    sessionSummary: text('session_summary'),
    contextUsed: jsonb('context_used'),
    sessionType: varchar('session_type', { length: 50 }).default('general'),
    sessionLength: varchar('session_length', { length: 50 }),
    userSatisfaction: varchar('user_satisfaction', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const connectionSuggestions = pgTable('connection_suggestions', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestorId: integer('requestor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    suggestedCollaboratorId: integer('suggested_collaborator_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    reasonType: varchar('reason_type', { length: 100 }).notNull(),
    reasonExplanation: text('reason_explanation').notNull(),
    context: text('context'),
    status: varchar('status', { length: 50 }).default('suggested'),
    responseAt: timestamp('response_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const vectorEmbeddings = pgTable('vector_embeddings', {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceTable: varchar('source_table', { length: 100 }).notNull(),
    sourceId: varchar('source_id', { length: 255 }).notNull(),
    vectorId: varchar('vector_id', { length: 255 }).notNull(),
    embeddingType: varchar('embedding_type', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const insertStarCardSchema = createInsertSchema(starCards);
export const insertFlowAttributesSchema = createInsertSchema(flowAttributes);
export const insertCoachKnowledgeBaseSchema = createInsertSchema(coachKnowledgeBase);
export const insertUserProfilesExtendedSchema = createInsertSchema(userProfilesExtended);
export const insertCoachingSessionsSchema = createInsertSchema(coachingSessions);
export const insertConnectionSuggestionsSchema = createInsertSchema(connectionSuggestions);
export const insertVectorEmbeddingsSchema = createInsertSchema(vectorEmbeddings);
export const coachingConversations = pgTable('coaching_conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    teamId: integer('team_id').references(() => teams.id, { onDelete: 'set null' }),
    personaType: varchar('persona_type', { length: 50 }).notNull(),
    workshopStep: varchar('workshop_step', { length: 100 }),
    title: varchar('title', { length: 255 }),
    contextData: jsonb('context_data'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const coachingMessages = pgTable('coaching_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => coachingConversations.id, { onDelete: 'cascade' }).notNull(),
    senderType: varchar('sender_type', { length: 20 }).notNull(),
    messageContent: text('message_content').notNull(),
    attachments: jsonb('attachments'),
    messageMetadata: jsonb('message_metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const userCoachingPreferences = pgTable('user_coaching_preferences', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
    preferredPersona: varchar('preferred_persona', { length: 50 }).default('workshop_assistant'),
    coachingStyle: varchar('coaching_style', { length: 50 }).default('supportive'),
    workshopProgress: jsonb('workshop_progress'),
    notificationSettings: jsonb('notification_settings'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const coachingPrompts = pgTable('coaching_prompts', {
    id: uuid('id').primaryKey().defaultRandom(),
    promptKey: varchar('prompt_key', { length: 100 }).notNull().unique(),
    personaType: varchar('persona_type', { length: 50 }).notNull(),
    systemInstructions: text('system_instructions').notNull(),
    contextTemplate: text('context_template'),
    isActive: boolean('is_active').default(true).notNull(),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertCoachingConversationSchema = createInsertSchema(coachingConversations);
export const insertCoachingMessageSchema = createInsertSchema(coachingMessages);
export const insertUserCoachingPreferencesSchema = createInsertSchema(userCoachingPreferences);
export const insertCoachingPromptSchema = createInsertSchema(coachingPrompts);
export const feedback = pgTable('feedback', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    workshopType: varchar('workshop_type', { length: 20 }).notNull(),
    pageContext: varchar('page_context', { length: 20 }).notNull(),
    targetPage: varchar('target_page', { length: 100 }),
    feedbackType: varchar('feedback_type', { length: 20 }).notNull(),
    priority: varchar('priority', { length: 10 }).notNull().default('low'),
    message: text('message').notNull(),
    experienceRating: integer('experience_rating'),
    status: varchar('status', { length: 20 }).notNull().default('new'),
    tags: jsonb('tags').default('[]'),
    systemInfo: jsonb('system_info').notNull(),
    adminNotes: text('admin_notes'),
    jiraTicketId: varchar('jira_ticket_id', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('idx_feedback_user_id').on(table.userId),
    workshopTypeIdx: index('idx_feedback_workshop_type').on(table.workshopType),
    statusIdx: index('idx_feedback_status').on(table.status),
    createdAtIdx: index('idx_feedback_created_at').on(table.createdAt),
}));
export const insertFeedbackSchema = createInsertSchema(feedback).extend({
    workshopType: z.enum(['ast', 'ia']),
    pageContext: z.enum(['current', 'other', 'general']),
    feedbackType: z.enum(['bug', 'feature', 'content', 'general']),
    priority: z.enum(['low', 'medium', 'high', 'blocker']).default('low'),
    status: z.enum(['new', 'in_progress', 'resolved', 'archived']).default('new'),
    experienceRating: z.number().min(1).max(5).optional(),
});
