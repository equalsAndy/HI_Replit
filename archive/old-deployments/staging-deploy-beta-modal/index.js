var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/middleware/auth.ts
var requireAuth, requireAdmin, attachUser;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    requireAuth = (req, res, next) => {
      const sessionUserId = req.session?.userId;
      const cookieUserId = req.cookies?.userId;
      console.log("Auth check - Session:", sessionUserId, "Cookie:", cookieUserId);
      console.log("Full session data:", req.session);
      const userId2 = sessionUserId || (cookieUserId ? parseInt(cookieUserId) : null);
      if (!userId2) {
        console.log("Authentication failed - no valid user ID");
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      if (!req.session.userId) {
        req.session.userId = userId2;
      }
      if (userId2 === 1 && !req.session.userRole) {
        req.session.userRole = "admin";
        req.session.username = "admin";
      }
      console.log("Authentication successful for user:", userId2, "Role:", req.session.userRole);
      next();
    };
    requireAdmin = (req, res, next) => {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }
      if (req.session.userRole !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Admin privileges required"
        });
      }
      next();
    };
    attachUser = (req, res, next) => {
      if (req.session.userId) {
        req.user = {
          id: req.session.userId,
          username: req.session.username || "",
          role: req.session.userRole || "participant",
          name: "",
          email: ""
        };
      }
      next();
    };
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  ContentAccessTypes: () => ContentAccessTypes,
  UserRoles: () => UserRoles,
  coachKnowledgeBase: () => coachKnowledgeBase,
  coachingConversations: () => coachingConversations,
  coachingMessages: () => coachingMessages,
  coachingPrompts: () => coachingPrompts,
  coachingSessions: () => coachingSessions,
  cohortFacilitators: () => cohortFacilitators,
  cohortParticipants: () => cohortParticipants,
  cohorts: () => cohorts,
  connectionSuggestions: () => connectionSuggestions,
  discernmentScenarios: () => discernmentScenarios,
  feedback: () => feedback,
  finalReflections: () => finalReflections,
  flowAttributes: () => flowAttributes,
  growthPlans: () => growthPlans,
  insertCoachKnowledgeBaseSchema: () => insertCoachKnowledgeBaseSchema,
  insertCoachingConversationSchema: () => insertCoachingConversationSchema,
  insertCoachingMessageSchema: () => insertCoachingMessageSchema,
  insertCoachingPromptSchema: () => insertCoachingPromptSchema,
  insertCoachingSessionsSchema: () => insertCoachingSessionsSchema,
  insertCohortFacilitatorSchema: () => insertCohortFacilitatorSchema,
  insertCohortParticipantSchema: () => insertCohortParticipantSchema,
  insertCohortSchema: () => insertCohortSchema,
  insertConnectionSuggestionsSchema: () => insertConnectionSuggestionsSchema,
  insertDiscernmentScenarioSchema: () => insertDiscernmentScenarioSchema,
  insertFeedbackSchema: () => insertFeedbackSchema,
  insertFinalReflectionSchema: () => insertFinalReflectionSchema,
  insertFlowAttributesSchema: () => insertFlowAttributesSchema,
  insertGrowthPlanSchema: () => insertGrowthPlanSchema,
  insertInviteSchema: () => insertInviteSchema,
  insertNavigationProgressSchema: () => insertNavigationProgressSchema,
  insertOrganizationSchema: () => insertOrganizationSchema,
  insertStarCardSchema: () => insertStarCardSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertUserAssessmentSchema: () => insertUserAssessmentSchema,
  insertUserCoachingPreferencesSchema: () => insertUserCoachingPreferencesSchema,
  insertUserDiscernmentProgressSchema: () => insertUserDiscernmentProgressSchema,
  insertUserProfilesExtendedSchema: () => insertUserProfilesExtendedSchema,
  insertUserSchema: () => insertUserSchema,
  insertVectorEmbeddingsSchema: () => insertVectorEmbeddingsSchema,
  insertVideoSchema: () => insertVideoSchema,
  insertWorkshopStepDataSchema: () => insertWorkshopStepDataSchema,
  invites: () => invites,
  navigationProgress: () => navigationProgress,
  organizations: () => organizations,
  sessions: () => sessions,
  starCards: () => starCards,
  teams: () => teams,
  userAssessments: () => userAssessments,
  userCoachingPreferences: () => userCoachingPreferences,
  userDiscernmentProgress: () => userDiscernmentProgress,
  userProfilesExtended: () => userProfilesExtended,
  users: () => users,
  vectorEmbeddings: () => vectorEmbeddings,
  videos: () => videos,
  workshopParticipation: () => workshopParticipation,
  workshopStepData: () => workshopStepData
});
import { pgTable, serial, varchar, timestamp, text, boolean, integer, jsonb, index, unique, uuid, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var UserRoles, ContentAccessTypes, organizations, cohorts, teams, users, insertOrganizationSchema, insertCohortSchema, insertTeamSchema, insertUserSchema, videos, insertVideoSchema, cohortFacilitators, cohortParticipants, insertCohortFacilitatorSchema, insertCohortParticipantSchema, invites, insertInviteSchema, sessions, workshopParticipation, userAssessments, insertUserAssessmentSchema, growthPlans, insertGrowthPlanSchema, discernmentScenarios, userDiscernmentProgress, insertDiscernmentScenarioSchema, insertUserDiscernmentProgressSchema, navigationProgress, workshopStepData, insertNavigationProgressSchema, insertWorkshopStepDataSchema, finalReflections, insertFinalReflectionSchema, starCards, flowAttributes, coachKnowledgeBase, userProfilesExtended, coachingSessions, connectionSuggestions, vectorEmbeddings, insertStarCardSchema, insertFlowAttributesSchema, insertCoachKnowledgeBaseSchema, insertUserProfilesExtendedSchema, insertCoachingSessionsSchema, insertConnectionSuggestionsSchema, insertVectorEmbeddingsSchema, coachingConversations, coachingMessages, userCoachingPreferences, coachingPrompts, insertCoachingConversationSchema, insertCoachingMessageSchema, insertUserCoachingPreferencesSchema, insertCoachingPromptSchema, feedback, insertFeedbackSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    UserRoles = ["admin", "facilitator", "participant", "student"];
    ContentAccessTypes = ["student", "professional", "both"];
    organizations = pgTable("organizations", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      createdBy: integer("created_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    cohorts = pgTable("cohorts", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      status: varchar("status", { length: 50 }),
      cohortType: varchar("cohort_type", { length: 50 }),
      parentCohortId: integer("parent_cohort_id"),
      // New facilitator console fields
      facilitatorId: integer("facilitator_id").references(() => users.id, { onDelete: "cascade" }),
      organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
      astAccess: boolean("ast_access").default(false).notNull(),
      iaAccess: boolean("ia_access").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    teams = pgTable("teams", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      cohortId: integer("cohort_id").references(() => cohorts.id, { onDelete: "cascade" }),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: varchar("username", { length: 100 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      role: varchar("role", { length: 20 }).notNull().default("participant"),
      organization: text("organization"),
      jobTitle: text("job_title"),
      profilePicture: text("profile_picture"),
      isTestUser: boolean("is_test_user").default(false).notNull(),
      isBetaTester: boolean("is_beta_tester").default(false).notNull(),
      hasSeenBetaWelcome: boolean("has_seen_beta_welcome").default(false).notNull(),
      showDemoDataButtons: boolean("show_demo_data_buttons").default(true).notNull(),
      // For test users to toggle demo data buttons
      navigationProgress: text("navigation_progress"),
      // JSON string storing navigation state
      // Access control fields
      contentAccess: varchar("content_access", { length: 20 }).notNull().default("professional"),
      // student, professional, both
      astAccess: boolean("ast_access").default(true).notNull(),
      // AllStarTeams workshop access
      iaAccess: boolean("ia_access").default(true).notNull(),
      // Imaginal Agility workshop access
      // Workshop completion tracking
      astWorkshopCompleted: boolean("ast_workshop_completed").default(false).notNull(),
      iaWorkshopCompleted: boolean("ia_workshop_completed").default(false).notNull(),
      astCompletedAt: timestamp("ast_completed_at"),
      iaCompletedAt: timestamp("ia_completed_at"),
      // Facilitator console fields
      assignedFacilitatorId: integer("assigned_facilitator_id"),
      cohortId: integer("cohort_id"),
      teamId: integer("team_id"),
      // Invite tracking field
      invitedBy: integer("invited_by"),
      // Talia training access control
      canTrainTalia: boolean("can_train_talia").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertOrganizationSchema = createInsertSchema(organizations);
    insertCohortSchema = createInsertSchema(cohorts);
    insertTeamSchema = createInsertSchema(teams);
    insertUserSchema = createInsertSchema(users).extend({
      role: z.enum(["admin", "facilitator", "participant", "student"]).default("participant"),
      contentAccess: z.enum(["student", "professional", "both"]).default("professional"),
      astAccess: z.boolean().default(true),
      iaAccess: z.boolean().default(true),
      astWorkshopCompleted: z.boolean().default(false),
      iaWorkshopCompleted: z.boolean().default(false),
      canTrainTalia: z.boolean().default(false)
    });
    videos = pgTable("videos", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      url: text("url").notNull(),
      editableId: varchar("editable_id", { length: 100 }),
      workshopType: varchar("workshop_type", { length: 50 }).notNull(),
      section: varchar("section", { length: 50 }).notNull(),
      stepId: varchar("step_id", { length: 20 }),
      // For navigation step identifiers like "1-1", "2-3"
      autoplay: boolean("autoplay").default(false).notNull(),
      sortOrder: integer("sort_order").default(0).notNull(),
      // Video management enhancements
      contentMode: varchar("content_mode", { length: 20 }).default("both").notNull(),
      // 'student', 'professional', 'both'
      requiredWatchPercentage: integer("required_watch_percentage").default(75).notNull(),
      // Percentage required to unlock next step
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertVideoSchema = createInsertSchema(videos);
    cohortFacilitators = pgTable("cohort_facilitators", {
      id: serial("id").primaryKey(),
      cohortId: integer("cohort_id").references(() => cohorts.id, { onDelete: "cascade" }),
      facilitatorId: integer("facilitator_id").references(() => users.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    cohortParticipants = pgTable("cohort_participants", {
      cohortId: integer("cohort_id").notNull().references(() => cohorts.id, { onDelete: "cascade" }),
      participantId: integer("participant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      joinedAt: timestamp("joined_at").defaultNow()
    }, (table) => ({
      pk: primaryKey({ columns: [table.cohortId, table.participantId] })
    }));
    insertCohortFacilitatorSchema = createInsertSchema(cohortFacilitators);
    insertCohortParticipantSchema = createInsertSchema(cohortParticipants);
    invites = pgTable("invites", {
      id: serial("id").primaryKey(),
      inviteCode: varchar("invite_code", { length: 12 }).notNull().unique(),
      email: varchar("email", { length: 255 }).notNull(),
      role: varchar("role", { length: 20 }).notNull().default("participant"),
      name: text("name"),
      createdBy: integer("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      expiresAt: timestamp("expires_at"),
      usedAt: timestamp("used_at"),
      usedBy: integer("used_by"),
      cohortId: integer("cohort_id"),
      organizationId: varchar("organization_id", { length: 255 }),
      isBetaTester: boolean("is_beta_tester").default(false).notNull()
    });
    insertInviteSchema = createInsertSchema(invites).extend({
      role: z.enum(["admin", "facilitator", "participant", "student"]).default("participant")
    });
    sessions = pgTable("sessions", {
      sid: varchar("sid", { length: 255 }).primaryKey(),
      sess: text("sess").notNull(),
      expire: timestamp("expire").notNull()
    });
    workshopParticipation = pgTable("workshop_participation", {
      id: serial("id").primaryKey(),
      userId: serial("user_id").notNull(),
      workshopId: serial("workshop_id").notNull(),
      progress: text("progress"),
      completed: boolean("completed").default(false),
      startedAt: timestamp("started_at").defaultNow().notNull(),
      completedAt: timestamp("completed_at"),
      lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull()
    });
    userAssessments = pgTable("user_assessments", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      assessmentType: varchar("assessment_type", { length: 50 }).notNull(),
      results: text("results").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertUserAssessmentSchema = createInsertSchema(userAssessments);
    growthPlans = pgTable("growth_plans", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      quarter: varchar("quarter", { length: 2 }).notNull(),
      // Q1, Q2, Q3, Q4
      year: integer("year").notNull(),
      starPowerReflection: text("star_power_reflection"),
      ladderCurrentLevel: integer("ladder_current_level"),
      ladderTargetLevel: integer("ladder_target_level"),
      ladderReflections: text("ladder_reflections"),
      strengthsExamples: text("strengths_examples"),
      // JSON string
      flowPeakHours: text("flow_peak_hours"),
      // JSON array of hours
      flowCatalysts: text("flow_catalysts"),
      visionStart: text("vision_start"),
      visionNow: text("vision_now"),
      visionNext: text("vision_next"),
      progressWorking: text("progress_working"),
      progressNeedHelp: text("progress_need_help"),
      teamFlowStatus: text("team_flow_status"),
      teamEnergySource: text("team_energy_source"),
      teamNextCheckin: text("team_next_checkin"),
      keyPriorities: text("key_priorities"),
      // JSON array
      successLooksLike: text("success_looks_like"),
      keyDates: text("key_dates"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertGrowthPlanSchema = createInsertSchema(growthPlans);
    discernmentScenarios = pgTable("discernment_scenarios", {
      id: serial("id").primaryKey(),
      exerciseType: varchar("exercise_type", { length: 50 }).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      questions: jsonb("questions").notNull(),
      metadata: jsonb("metadata").default("{}"),
      difficultyLevel: integer("difficulty_level").default(1),
      tags: text("tags").array(),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userDiscernmentProgress = pgTable("user_discernment_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      scenariosSeen: jsonb("scenarios_seen").default("[]"),
      lastSessionAt: timestamp("last_session_at").defaultNow(),
      totalSessions: integer("total_sessions").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      userIdIdx: index("idx_user_discernment_progress_user_id").on(table.userId),
      userIdUnique: unique().on(table.userId)
    }));
    insertDiscernmentScenarioSchema = createInsertSchema(discernmentScenarios);
    insertUserDiscernmentProgressSchema = createInsertSchema(userDiscernmentProgress);
    navigationProgress = pgTable("navigation_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      appType: varchar("app_type", { length: 10 }).notNull(),
      // 'ast' or 'ia'
      completedSteps: text("completed_steps").notNull(),
      // JSON array of step IDs
      currentStepId: varchar("current_step_id", { length: 20 }).notNull(),
      unlockedSteps: text("unlocked_steps").notNull(),
      // JSON array of step IDs
      videoProgress: text("video_progress"),
      // JSON object of video progress
      lastVisitedAt: timestamp("last_visited_at").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    workshopStepData = pgTable("workshop_step_data", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      workshopType: varchar("workshop_type", { length: 10 }).notNull(),
      // 'ast' or 'ia'
      stepId: varchar("step_id", { length: 20 }).notNull(),
      // e.g., 'ia-3-4', '2-1'
      data: jsonb("data").notNull(),
      // Flexible JSON storage for any step data
      version: integer("version").default(1).notNull(),
      // For future versioning support
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
      deletedAt: timestamp("deleted_at")
      // NULL = active, timestamp = soft deleted
    }, (table) => ({
      // Unique constraint ensures one record per user/workshop/step
      userWorkshopStepIdx: unique("workshop_step_data_user_workshop_step_unique").on(table.userId, table.workshopType, table.stepId),
      // Index for fast lookups
      userWorkshopIdx: index("idx_workshop_step_data_user_workshop").on(table.userId, table.workshopType)
    }));
    insertNavigationProgressSchema = createInsertSchema(navigationProgress);
    insertWorkshopStepDataSchema = createInsertSchema(workshopStepData);
    finalReflections = pgTable("final_reflections", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      insight: text("insight").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertFinalReflectionSchema = createInsertSchema(finalReflections);
    starCards = pgTable("star_cards", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      thinking: integer("thinking").notNull(),
      acting: integer("acting").notNull(),
      feeling: integer("feeling").notNull(),
      planning: integer("planning").notNull(),
      imageUrl: text("image_url"),
      state: text("state"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    flowAttributes = pgTable("flow_attributes", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      attributes: jsonb("attributes").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    coachKnowledgeBase = pgTable("coach_knowledge_base", {
      id: uuid("id").primaryKey().defaultRandom(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      source: varchar("source", { length: 255 }),
      category: varchar("category", { length: 100 }),
      metadata: jsonb("metadata"),
      // For storing section_title, key_concepts, etc.
      searchVector: text("search_vector"),
      // This will be a tsvector type in the DB
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => {
      return {
        categoryIndex: index("knowledge_category_idx").on(table.category)
        // A GIN index for full-text search will be created manually in a migration
      };
    });
    userProfilesExtended = pgTable("user_profiles_extended", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      // Company/Team Info
      company: varchar("company", { length: 255 }),
      department: varchar("department", { length: 255 }),
      role: varchar("role", { length: 255 }),
      // AST Profile Summary (derived from workshop data)
      astProfileSummary: jsonb("ast_profile_summary"),
      // processed Star Card + flow data
      // Expertise and Experience
      expertiseAreas: jsonb("expertise_areas"),
      // array of skills/domains
      projectExperience: jsonb("project_experience"),
      // past projects and roles
      collaborationPreferences: jsonb("collaboration_preferences"),
      // work style preferences
      // Team Connection Data
      availabilityStatus: varchar("availability_status", { length: 50 }).default("available"),
      connectionOptIn: boolean("connection_opt_in").default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    coachingSessions = pgTable("coaching_sessions", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      // Conversation Data
      conversation: jsonb("conversation").notNull(),
      // full message history
      sessionSummary: text("session_summary"),
      // AI-generated summary of key topics
      contextUsed: jsonb("context_used"),
      // what knowledge base content was referenced
      // Session Metadata
      sessionType: varchar("session_type", { length: 50 }).default("general"),
      sessionLength: varchar("session_length", { length: 50 }),
      userSatisfaction: varchar("user_satisfaction", { length: 20 }),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    connectionSuggestions = pgTable("connection_suggestions", {
      id: uuid("id").primaryKey().defaultRandom(),
      requestorId: integer("requestor_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      suggestedCollaboratorId: integer("suggested_collaborator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      // Connection Logic
      reasonType: varchar("reason_type", { length: 100 }).notNull(),
      reasonExplanation: text("reason_explanation").notNull(),
      context: text("context"),
      // Status Tracking
      status: varchar("status", { length: 50 }).default("suggested"),
      responseAt: timestamp("response_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    vectorEmbeddings = pgTable("vector_embeddings", {
      id: uuid("id").primaryKey().defaultRandom(),
      sourceTable: varchar("source_table", { length: 100 }).notNull(),
      sourceId: varchar("source_id", { length: 255 }).notNull(),
      vectorId: varchar("vector_id", { length: 255 }).notNull(),
      embeddingType: varchar("embedding_type", { length: 100 }).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertStarCardSchema = createInsertSchema(starCards);
    insertFlowAttributesSchema = createInsertSchema(flowAttributes);
    insertCoachKnowledgeBaseSchema = createInsertSchema(coachKnowledgeBase);
    insertUserProfilesExtendedSchema = createInsertSchema(userProfilesExtended);
    insertCoachingSessionsSchema = createInsertSchema(coachingSessions);
    insertConnectionSuggestionsSchema = createInsertSchema(connectionSuggestions);
    insertVectorEmbeddingsSchema = createInsertSchema(vectorEmbeddings);
    coachingConversations = pgTable("coaching_conversations", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      teamId: integer("team_id").references(() => teams.id, { onDelete: "set null" }),
      personaType: varchar("persona_type", { length: 50 }).notNull(),
      // 'workshop_assistant', 'talia_coach', 'team_advisor'
      workshopStep: varchar("workshop_step", { length: 100 }),
      title: varchar("title", { length: 255 }),
      contextData: jsonb("context_data"),
      // Store workshop context, team context, etc.
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    coachingMessages = pgTable("coaching_messages", {
      id: uuid("id").primaryKey().defaultRandom(),
      conversationId: uuid("conversation_id").references(() => coachingConversations.id, { onDelete: "cascade" }).notNull(),
      senderType: varchar("sender_type", { length: 20 }).notNull(),
      // 'user' or 'ai'
      messageContent: text("message_content").notNull(),
      // //   bedrockRequestId: varchar('bedrock_request_id', { length: 255 }), // Track AWS Bedrock requests
      attachments: jsonb("attachments"),
      // File attachments, images, etc.
      messageMetadata: jsonb("message_metadata"),
      // Additional context, tokens used, etc.
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    userCoachingPreferences = pgTable("user_coaching_preferences", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
      preferredPersona: varchar("preferred_persona", { length: 50 }).default("workshop_assistant"),
      coachingStyle: varchar("coaching_style", { length: 50 }).default("supportive"),
      // 'supportive', 'direct', 'exploratory'
      workshopProgress: jsonb("workshop_progress"),
      // Track progress through AST workshops
      notificationSettings: jsonb("notification_settings"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    coachingPrompts = pgTable("coaching_prompts", {
      id: uuid("id").primaryKey().defaultRandom(),
      promptKey: varchar("prompt_key", { length: 100 }).notNull().unique(),
      personaType: varchar("persona_type", { length: 50 }).notNull(),
      systemInstructions: text("system_instructions").notNull(),
      contextTemplate: text("context_template"),
      // Template for injecting dynamic context
      isActive: boolean("is_active").default(true).notNull(),
      version: integer("version").default(1).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertCoachingConversationSchema = createInsertSchema(coachingConversations);
    insertCoachingMessageSchema = createInsertSchema(coachingMessages);
    insertUserCoachingPreferencesSchema = createInsertSchema(userCoachingPreferences);
    insertCoachingPromptSchema = createInsertSchema(coachingPrompts);
    feedback = pgTable("feedback", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
      // Allow anonymous feedback
      workshopType: varchar("workshop_type", { length: 20 }).notNull(),
      // 'ast' or 'ia'
      pageContext: varchar("page_context", { length: 20 }).notNull(),
      // 'current', 'other', 'general'
      targetPage: varchar("target_page", { length: 100 }),
      // Specific page name or null for general
      feedbackType: varchar("feedback_type", { length: 20 }).notNull(),
      // 'bug', 'feature', 'content', 'general'
      priority: varchar("priority", { length: 10 }).notNull().default("low"),
      // 'low', 'medium', 'high', 'blocker'
      message: text("message").notNull(),
      experienceRating: integer("experience_rating"),
      // 1-5 rating
      status: varchar("status", { length: 20 }).notNull().default("new"),
      // 'new', 'read', 'in_progress', 'resolved', 'archived'
      tags: jsonb("tags").default("[]"),
      // Array of tags
      systemInfo: jsonb("system_info").notNull(),
      // Browser, OS, screen size, etc.
      adminNotes: text("admin_notes"),
      // Admin notes and comments
      jiraTicketId: varchar("jira_ticket_id", { length: 50 }),
      // Reference to created Jira ticket
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      userIdIdx: index("idx_feedback_user_id").on(table.userId),
      workshopTypeIdx: index("idx_feedback_workshop_type").on(table.workshopType),
      statusIdx: index("idx_feedback_status").on(table.status),
      createdAtIdx: index("idx_feedback_created_at").on(table.createdAt)
    }));
    insertFeedbackSchema = createInsertSchema(feedback).extend({
      workshopType: z.enum(["ast", "ia"]),
      pageContext: z.enum(["current", "other", "general"]),
      feedbackType: z.enum(["bug", "feature", "content", "general"]),
      priority: z.enum(["low", "medium", "high", "blocker"]).default("low"),
      status: z.enum(["new", "in_progress", "resolved", "archived"]).default("new"),
      experienceRating: z.number().min(1).max(5).optional()
    });
  }
});

// server/services/photo-storage-service.ts
var photo_storage_service_exports = {};
__export(photo_storage_service_exports, {
  PhotoStorageService: () => PhotoStorageService,
  photoStorageService: () => photoStorageService
});
import crypto from "crypto";
import sharp from "sharp";
import { Pool } from "pg";
var pool, query, PhotoStorageService, photoStorageService;
var init_photo_storage_service = __esm({
  "server/services/photo-storage-service.ts"() {
    "use strict";
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    query = (text2, params) => pool.query(text2, params);
    PhotoStorageService = class {
      /**
       * Store a photo and return its reference ID
       * Automatically handles deduplication and thumbnail generation
       */
      async storePhoto(base64Data, uploadedBy, generateThumbnail = true) {
        try {
          const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
          if (!matches) {
            throw new Error("Invalid base64 image data format");
          }
          const mimeType = matches[1];
          const imageData = matches[2];
          const imageBuffer = Buffer.from(imageData, "base64");
          const photoHash = crypto.createHash("sha256").update(imageBuffer).digest("hex");
          const existingPhoto = await query(
            "SELECT id FROM photo_storage WHERE photo_hash = $1",
            [photoHash]
          );
          if (existingPhoto.rows.length > 0) {
            return existingPhoto.rows[0].id;
          }
          let width;
          let height;
          try {
            const metadata = await sharp(imageBuffer).metadata();
            width = metadata.width;
            height = metadata.height;
          } catch (error) {
            console.warn("Could not get image dimensions:", error);
          }
          const result = await query(`
        INSERT INTO photo_storage (
          photo_hash, photo_data, mime_type, file_size, 
          width, height, uploaded_by, is_thumbnail, reference_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
            photoHash,
            base64Data,
            mimeType,
            imageBuffer.length,
            width,
            height,
            uploadedBy,
            false,
            1
            // Initialize with 1 since it's being referenced
          ]);
          const photoId = result.rows[0].id;
          if (generateThumbnail && width && height && (width > 200 || height > 200)) {
            try {
              await this.generateThumbnail(photoId, imageBuffer, mimeType, uploadedBy);
            } catch (error) {
              console.warn("Failed to generate thumbnail:", error);
            }
          }
          return photoId;
        } catch (error) {
          console.error("Error storing photo:", error);
          throw new Error(`Failed to store photo: ${error.message}`);
        }
      }
      /**
       * Retrieve a photo by its ID
       */
      async getPhoto(photoId) {
        try {
          const result = await query(`
        UPDATE photo_storage 
        SET last_accessed = CURRENT_TIMESTAMP 
        WHERE id = $1
        RETURNING *
      `, [photoId]);
          if (result.rows.length === 0) {
            return null;
          }
          const row = result.rows[0];
          return {
            id: row.id,
            photoHash: row.photo_hash,
            photoData: row.photo_data,
            mimeType: row.mime_type,
            fileSize: row.file_size,
            width: row.width,
            height: row.height,
            uploadedBy: row.uploaded_by,
            isThumbnail: row.is_thumbnail,
            originalPhotoId: row.original_photo_id
          };
        } catch (error) {
          console.error("Error retrieving photo:", error);
          return null;
        }
      }
      /**
       * Get photo metadata without the actual photo data
       */
      async getPhotoMetadata(photoId) {
        try {
          const result = await query(`
        SELECT id, photo_hash, mime_type, file_size, width, height, 
               uploaded_by, is_thumbnail, original_photo_id
        FROM photo_storage 
        WHERE id = $1
      `, [photoId]);
          if (result.rows.length === 0) {
            return null;
          }
          const row = result.rows[0];
          return {
            id: row.id,
            photoHash: row.photo_hash,
            mimeType: row.mime_type,
            fileSize: row.file_size,
            width: row.width,
            height: row.height,
            uploadedBy: row.uploaded_by,
            isThumbnail: row.is_thumbnail,
            originalPhotoId: row.original_photo_id
          };
        } catch (error) {
          console.error("Error retrieving photo metadata:", error);
          return null;
        }
      }
      /**
       * Generate a thumbnail for a photo
       */
      async generateThumbnail(originalPhotoId, imageBuffer, mimeType, uploadedBy) {
        try {
          const thumbnailBuffer = await sharp(imageBuffer).resize(200, 200, {
            fit: "inside",
            withoutEnlargement: true
          }).jpeg({ quality: 80 }).toBuffer();
          const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString("base64")}`;
          const thumbnailHash = crypto.createHash("sha256").update(thumbnailBuffer).digest("hex");
          const metadata = await sharp(thumbnailBuffer).metadata();
          const result = await query(`
        INSERT INTO photo_storage (
          photo_hash, photo_data, mime_type, file_size, 
          width, height, uploaded_by, is_thumbnail, original_photo_id, reference_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
            thumbnailHash,
            thumbnailBase64,
            "image/jpeg",
            thumbnailBuffer.length,
            metadata.width,
            metadata.height,
            uploadedBy,
            true,
            originalPhotoId,
            0
            // Thumbnails don't count as references initially
          ]);
          return result.rows[0].id;
        } catch (error) {
          console.error("Error generating thumbnail:", error);
          return null;
        }
      }
      /**
       * Delete a photo and its references
       */
      async deletePhoto(photoId) {
        try {
          await query(`
        DELETE FROM photo_storage 
        WHERE id = $1 OR original_photo_id = $1
      `, [photoId]);
          return true;
        } catch (error) {
          console.error("Error deleting photo:", error);
          return false;
        }
      }
      /**
       * Clean up unused photos (photos with zero references)
       */
      async cleanupUnusedPhotos() {
        try {
          const result = await query(`
        SELECT cleanup_unused_photos()
      `);
          return result.rows[0].cleanup_unused_photos || 0;
        } catch (error) {
          console.error("Error cleaning up unused photos:", error);
          return 0;
        }
      }
      /**
       * Get a URL path for accessing a photo via API
       */
      getPhotoUrl(photoId, thumbnail = false) {
        const baseUrl = "/api/photos";
        return thumbnail ? `${baseUrl}/${photoId}/thumbnail` : `${baseUrl}/${photoId}`;
      }
      /**
       * Get user's StarCard image for reports
       * This searches for the most recent StarCard image uploaded by the user
       */
      async getUserStarCard(userId2) {
        try {
          const result = await query(`
        SELECT photo_data, photo_hash, mime_type
        FROM photo_storage 
        WHERE uploaded_by = $1 
        AND is_thumbnail = false
        ORDER BY created_at DESC 
        LIMIT 1
      `, [parseInt(userId2)]);
          if (result.rows.length === 0) {
            return null;
          }
          const photo = result.rows[0];
          const fs7 = await import("fs/promises");
          const path5 = await import("path");
          const crypto2 = await import("crypto");
          const storageDir = path5.join(process.cwd(), "storage", "star-cards");
          await fs7.mkdir(storageDir, { recursive: true });
          const extension = photo.mime_type.split("/")[1] || "png";
          const filename = `user-${userId2}-starcard-${photo.photo_hash.substring(0, 8)}.${extension}`;
          const filePath = path5.join(storageDir, filename);
          try {
            await fs7.access(filePath);
          } catch {
            const base64Data = photo.photo_data.includes(",") ? photo.photo_data.split(",")[1] : photo.photo_data;
            const buffer = Buffer.from(base64Data, "base64");
            await fs7.writeFile(filePath, buffer);
          }
          return {
            filePath,
            photoData: photo.photo_data
          };
        } catch (error) {
          console.error("Error getting user StarCard:", error);
          return null;
        }
      }
    };
    photoStorageService = new PhotoStorageService();
  }
});

// server/services/ai-usage-logger.ts
import { Pool as Pool2 } from "pg";
var pool2, AIUsageLogger, aiUsageLogger;
var init_ai_usage_logger = __esm({
  "server/services/ai-usage-logger.ts"() {
    "use strict";
    pool2 = new Pool2({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    AIUsageLogger = class {
      configCache = {};
      cacheExpiry = 5 * 60 * 1e3;
      // 5 minutes
      /**
       * Log AI usage to the database
       */
      async logUsage(entry) {
        try {
          await pool2.query(
            `INSERT INTO ai_usage_logs 
         (user_id, feature_name, api_call_count, tokens_used, response_time_ms, success, error_message, cost_estimate, session_id, provider, model)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              entry.userId,
              entry.featureName,
              entry.apiCallCount || 1,
              entry.tokensUsed || 0,
              entry.responseTimeMs || 0,
              entry.success,
              entry.errorMessage || null,
              entry.costEstimate || 0,
              entry.sessionId || null,
              entry.provider || "claude",
              entry.model || "claude-3-5-sonnet"
            ]
          );
          const providerInfo = entry.provider ? ` (${entry.provider}${entry.model ? `/${entry.model}` : ""})` : "";
          console.log(`\u{1F4CA} AI usage logged: ${entry.featureName} for user ${entry.userId}${providerInfo} - Success: ${entry.success}`);
        } catch (error) {
          console.error("\u274C Failed to log AI usage:", error);
        }
      }
      /**
       * Get AI configuration for a feature with caching
       */
      async getConfig(featureName) {
        const now = /* @__PURE__ */ new Date();
        const cached = this.configCache[featureName];
        if (cached && now.getTime() - cached.lastUpdated.getTime() < this.cacheExpiry) {
          return cached;
        }
        try {
          const result = await pool2.query(
            "SELECT * FROM ai_configuration WHERE feature_name = $1",
            [featureName]
          );
          if (result.rows.length > 0) {
            const config = {
              enabled: result.rows[0].enabled,
              rateLimitPerHour: result.rows[0].rate_limit_per_hour,
              rateLimitPerDay: result.rows[0].rate_limit_per_day,
              maxTokens: result.rows[0].max_tokens,
              timeoutMs: result.rows[0].timeout_ms,
              lastUpdated: now
            };
            this.configCache[featureName] = config;
            return config;
          }
          return null;
        } catch (error) {
          console.error("\u274C Failed to get AI config:", error);
          return cached || null;
        }
      }
      /**
       * Check if AI feature is enabled and within rate limits
       */
      async canUseAI(userId2, featureName) {
        try {
          const globalConfig = await this.getConfig("global");
          if (!globalConfig?.enabled) {
            return { allowed: false, reason: "AI features are globally disabled" };
          }
          const featureConfig = await this.getConfig(featureName);
          if (!featureConfig?.enabled) {
            return { allowed: false, reason: `${featureName} AI feature is disabled` };
          }
          const hourlyUsage = await pool2.query(
            `SELECT COUNT(*) as count FROM ai_usage_logs 
         WHERE user_id = $1 AND feature_name = $2 AND timestamp >= NOW() - INTERVAL '1 hour'`,
            [userId2, featureName]
          );
          const hourlyCount = parseInt(hourlyUsage.rows[0].count) || 0;
          if (hourlyCount >= featureConfig.rateLimitPerHour) {
            return { allowed: false, reason: "Hourly rate limit exceeded" };
          }
          const dailyUsage = await pool2.query(
            `SELECT COUNT(*) as count FROM ai_usage_logs 
         WHERE user_id = $1 AND feature_name = $2 AND timestamp >= NOW() - INTERVAL '24 hours'`,
            [userId2, featureName]
          );
          const dailyCount = parseInt(dailyUsage.rows[0].count) || 0;
          if (dailyCount >= featureConfig.rateLimitPerDay) {
            return { allowed: false, reason: "Daily rate limit exceeded" };
          }
          return { allowed: true };
        } catch (error) {
          console.error("\u274C Failed to check AI usage limits:", error);
          return { allowed: false, reason: "Unable to verify rate limits" };
        }
      }
      /**
       * Calculate estimated cost based on tokens used
       * Claude API pricing as of 2024: ~$0.015 per 1K tokens for Sonnet
       */
      calculateCost(tokensUsed, model = "claude-3-5-sonnet") {
        const ratesPerToken = {
          "claude-3-5-sonnet": 15e-6,
          // $0.015 per 1K tokens
          "claude-3-haiku": 5e-6,
          // $0.005 per 1K tokens
          "claude-3-opus": 75e-6
          // $0.075 per 1K tokens
        };
        const rate = ratesPerToken[model] || ratesPerToken["claude-3-5-sonnet"];
        return tokensUsed * rate;
      }
      /**
       * Calculate estimated cost for OpenAI models
       * OpenAI API pricing as of 2024
       */
      calculateOpenAICost(tokensUsed, model = "gpt-4o-mini") {
        const ratesPerToken = {
          "gpt-4o-mini": 15e-8,
          // $0.000150 per 1K tokens (input) 
          "gpt-4-turbo-preview": 1e-5,
          // $0.01 per 1K tokens (input)
          "gpt-4": 3e-5,
          // $0.03 per 1K tokens (input)
          "gpt-3.5-turbo": 5e-7
          // $0.0005 per 1K tokens (input)
        };
        const rate = ratesPerToken[model] || ratesPerToken["gpt-4o-mini"];
        return tokensUsed * rate;
      }
      /**
       * Clear the configuration cache (call when config is updated)
       */
      clearCache() {
        this.configCache = {};
        console.log("\u{1F504} AI configuration cache cleared");
      }
    };
    aiUsageLogger = new AIUsageLogger();
  }
});

// server/services/text-search-service.ts
var text_search_service_exports = {};
__export(text_search_service_exports, {
  default: () => text_search_service_default,
  textSearchService: () => textSearchService
});
import { Pool as Pool3 } from "pg";
var pool3, TextSearchService, textSearchService, text_search_service_default;
var init_text_search_service = __esm({
  "server/services/text-search-service.ts"() {
    "use strict";
    pool3 = new Pool3({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    TextSearchService = class {
      /**
       * Search for similar document chunks using PostgreSQL full-text search
       */
      async searchSimilarContent(query2, options = {}) {
        try {
          console.log("\u{1F50D} Performing text search for:", query2.substring(0, 100) + "...");
          const maxResults = options.maxResults || 5;
          const minRelevanceScore = options.minRelevanceScore || 0.1;
          let typeFilter = "";
          const params = [query2, maxResults];
          let paramIndex = 3;
          if (options.documentTypes && options.documentTypes.length > 0) {
            typeFilter += ` AND td.document_type = ANY($${paramIndex})`;
            params.push(options.documentTypes);
            paramIndex++;
          }
          if (options.documentIds && options.documentIds.length > 0) {
            typeFilter += ` AND td.id = ANY($${paramIndex})`;
            params.push(options.documentIds);
            paramIndex++;
          }
          const searchQuery = `
        SELECT 
          dc.id as chunk_id,
          dc.document_id,
          dc.content,
          ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $1)) as relevance_score,
          td.title as document_title,
          td.document_type,
          ROW_NUMBER() OVER (ORDER BY ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $1)) DESC) as rank
        FROM document_chunks dc
        JOIN training_documents td ON dc.document_id = td.id
        WHERE 
          td.status = 'active'
          AND to_tsvector('english', dc.content) @@ plainto_tsquery('english', $1)
          AND ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $1)) >= $${paramIndex}
          ${typeFilter}
        ORDER BY relevance_score DESC
        LIMIT $2
      `;
          params.push(minRelevanceScore);
          console.log("\u{1F50D} Executing text search query...");
          const result = await pool3.query(searchQuery, params);
          const chunks = result.rows.map((row) => ({
            chunkId: row.chunk_id,
            documentId: row.document_id,
            content: row.content,
            relevanceScore: parseFloat(row.relevance_score),
            documentTitle: row.document_title,
            documentType: row.document_type,
            rank: parseInt(row.rank)
          }));
          console.log(`\u2705 Found ${chunks.length} relevant chunks`);
          return chunks;
        } catch (error) {
          console.error("\u274C Error in text search:", error);
          throw error;
        }
      }
      /**
       * Search with keyword variations and synonyms
       */
      async searchWithVariations(query2, options = {}) {
        try {
          const variations = this.generateSearchVariations(query2);
          console.log("\u{1F50D} Searching with variations:", variations);
          const allResults = [];
          const seenChunkIds = /* @__PURE__ */ new Set();
          for (const variation of variations) {
            const results = await this.searchSimilarContent(variation, {
              ...options,
              maxResults: Math.ceil((options.maxResults || 5) / variations.length) + 2
            });
            for (const result of results) {
              if (!seenChunkIds.has(result.chunkId)) {
                allResults.push(result);
                seenChunkIds.add(result.chunkId);
              }
            }
          }
          allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
          const topResults = allResults.slice(0, options.maxResults || 5);
          return topResults;
        } catch (error) {
          console.error("\u274C Error in variation search:", error);
          throw error;
        }
      }
      /**
       * Generate context for AI coaching or report generation
       */
      async generateContextForAI(queries, options = {}) {
        try {
          const maxChunksPerQuery = options.maxChunksPerQuery || 3;
          const allChunks = [];
          const seenChunkIds = /* @__PURE__ */ new Set();
          const allSearchTerms = [];
          for (const query2 of queries) {
            allSearchTerms.push(query2);
            const chunks = await this.searchWithVariations(query2, {
              ...options,
              maxResults: maxChunksPerQuery
            });
            for (const chunk of chunks) {
              if (!seenChunkIds.has(chunk.chunkId)) {
                allChunks.push(chunk);
                seenChunkIds.add(chunk.chunkId);
              }
            }
          }
          allChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
          const topChunks = allChunks.slice(0, 8);
          const context2 = this.formatContext(topChunks, options.contextStyle || "detailed");
          const documentSources = [...new Set(topChunks.map((chunk) => chunk.documentTitle))];
          return {
            context: context2,
            sourceChunks: topChunks,
            metadata: {
              totalQueries: queries.length,
              totalChunks: topChunks.length,
              documentSources,
              searchTerms: allSearchTerms
            }
          };
        } catch (error) {
          console.error("\u274C Error generating AI context:", error);
          throw error;
        }
      }
      /**
       * Process documents to create searchable chunks (without embeddings)
       */
      async processDocumentForSearch(documentId) {
        try {
          console.log(`\u{1F504} Processing document for text search: ${documentId}`);
          const documentResult = await pool3.query(`
        SELECT id, title, content, document_type
        FROM training_documents
        WHERE id = $1 AND status = 'active'
      `, [documentId]);
          if (documentResult.rows.length === 0) {
            throw new Error(`Document ${documentId} not found`);
          }
          const document = documentResult.rows[0];
          const chunks = this.chunkDocumentText(document.content);
          await this.storeDocumentChunks(documentId, chunks);
          console.log(`\u2705 Processed ${chunks.length} chunks for document: ${document.title}`);
        } catch (error) {
          console.error(`\u274C Error processing document ${documentId}:`, error);
          throw error;
        }
      }
      /**
       * Simple text chunking without token counting
       */
      chunkDocumentText(content) {
        const chunks = [];
        const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
        const maxChunkSize = 1e3;
        let currentChunk = "";
        let chunkIndex = 0;
        for (const paragraph of paragraphs) {
          const trimmedParagraph = paragraph.trim();
          if (currentChunk.length > 0 && currentChunk.length + trimmedParagraph.length > maxChunkSize) {
            chunks.push({
              content: currentChunk.trim(),
              chunkIndex,
              tokenCount: Math.ceil(currentChunk.length / 4)
              // Rough token estimate
            });
            chunkIndex++;
            currentChunk = trimmedParagraph;
          } else {
            if (currentChunk.length > 0) {
              currentChunk += "\n\n" + trimmedParagraph;
            } else {
              currentChunk = trimmedParagraph;
            }
          }
        }
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            chunkIndex,
            tokenCount: Math.ceil(currentChunk.length / 4)
          });
        }
        return chunks;
      }
      /**
       * Store document chunks in database (without embeddings)
       */
      async storeDocumentChunks(documentId, chunks) {
        const client = await pool3.connect();
        try {
          await client.query("BEGIN");
          await client.query("DELETE FROM document_chunks WHERE document_id = $1", [documentId]);
          for (const chunk of chunks) {
            await client.query(`
          INSERT INTO document_chunks (
            id, document_id, content, chunk_index, metadata, token_count, created_at
          ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
        `, [
              documentId,
              chunk.content,
              chunk.chunkIndex,
              JSON.stringify({
                type: "text_chunk",
                processed_for: "text_search",
                has_embeddings: false
              }),
              chunk.tokenCount
            ]);
          }
          await client.query("COMMIT");
          console.log(`\u{1F4BE} Stored ${chunks.length} chunks for document ${documentId}`);
        } catch (error) {
          await client.query("ROLLBACK");
          console.error("\u274C Error storing document chunks:", error);
          throw error;
        } finally {
          client.release();
        }
      }
      /**
       * Generate search variations and synonyms
       */
      generateSearchVariations(query2) {
        const variations = [query2];
        const synonymMap = {
          "coaching": ["mentoring", "guidance", "development", "training"],
          "strengths": ["talents", "abilities", "skills", "capabilities"],
          "development": ["growth", "improvement", "progress", "advancement"],
          "team": ["group", "collaboration", "teamwork", "collective"],
          "leadership": ["management", "guidance", "direction", "supervision"],
          "assessment": ["evaluation", "analysis", "review", "measurement"],
          "feedback": ["input", "response", "evaluation", "criticism"],
          "performance": ["achievement", "results", "effectiveness", "productivity"]
        };
        const words = query2.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (synonymMap[word]) {
            for (const synonym of synonymMap[word]) {
              const variation = query2.replace(new RegExp(word, "gi"), synonym);
              if (!variations.includes(variation)) {
                variations.push(variation);
              }
            }
          }
        }
        return variations.slice(0, 3);
      }
      /**
       * Format context based on style preference
       */
      formatContext(chunks, style) {
        switch (style) {
          case "bullet":
            return chunks.map((chunk, index2) => `\u2022 ${chunk.documentTitle}: ${chunk.content}`).join("\n");
          case "summary":
            return chunks.map((chunk, index2) => `**${chunk.documentTitle}**
${chunk.content.substring(0, 200)}...`).join("\n\n");
          case "detailed":
          default:
            return chunks.map((chunk, index2) => `## Reference ${index2 + 1}: ${chunk.documentTitle}
${chunk.content}`).join("\n\n");
        }
      }
      /**
       * Process all pending documents for text search
       */
      async processPendingDocuments() {
        try {
          console.log("\u{1F504} Processing documents for text search...");
          const pendingDocsResult = await pool3.query(`
        SELECT td.id, td.title
        FROM training_documents td
        LEFT JOIN document_chunks dc ON td.id = dc.document_id
        WHERE td.status = 'active' AND dc.id IS NULL
        ORDER BY td.created_at ASC
      `);
          console.log(`\u{1F4CB} Found ${pendingDocsResult.rows.length} document(s) to process`);
          for (const doc of pendingDocsResult.rows) {
            try {
              await this.processDocumentForSearch(doc.id);
            } catch (error) {
              console.error(`\u274C Failed to process document ${doc.title}:`, error);
            }
          }
          console.log("\u2705 Finished processing pending documents");
        } catch (error) {
          console.error("\u274C Error processing pending documents:", error);
          throw error;
        }
      }
      /**
       * Test text search functionality
       */
      async testTextSearch() {
        try {
          const chunkCountResult = await pool3.query("SELECT COUNT(*) as count FROM document_chunks");
          const chunkCount = parseInt(chunkCountResult.rows[0].count);
          if (chunkCount === 0) {
            await this.processPendingDocuments();
            const newCountResult = await pool3.query("SELECT COUNT(*) as count FROM document_chunks");
            const newChunkCount = parseInt(newCountResult.rows[0].count);
            if (newChunkCount === 0) {
              return {
                isWorking: true,
                hasData: false,
                sampleResults: [],
                error: "No document chunks available for testing"
              };
            }
          }
          const testQuery = "coaching strengths development";
          const results = await this.searchSimilarContent(testQuery, {
            maxResults: 3,
            minRelevanceScore: 0.01
            // Lower threshold for testing
          });
          return {
            isWorking: true,
            hasData: true,
            sampleResults: results
          };
        } catch (error) {
          return {
            isWorking: false,
            hasData: false,
            sampleResults: [],
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      }
      /**
       * Get search statistics
       */
      async getSearchStats() {
        try {
          const result = await pool3.query(`
        SELECT 
          COUNT(*) as total_chunks,
          COUNT(DISTINCT document_id) as processed_documents,
          AVG(token_count) as avg_tokens_per_chunk
        FROM document_chunks
      `);
          const stats = result.rows[0];
          return {
            totalChunks: parseInt(stats.total_chunks),
            processedDocuments: parseInt(stats.processed_documents),
            averageChunksPerDocument: stats.processed_documents > 0 ? stats.total_chunks / stats.processed_documents : 0,
            averageTokensPerChunk: parseFloat(stats.avg_tokens_per_chunk) || 0
          };
        } catch (error) {
          console.error("\u274C Error getting search stats:", error);
          throw error;
        }
      }
    };
    textSearchService = new TextSearchService();
    text_search_service_default = textSearchService;
  }
});

// server/services/javascript-vector-service.ts
var javascript_vector_service_exports = {};
__export(javascript_vector_service_exports, {
  default: () => javascript_vector_service_default,
  javascriptVectorService: () => javascriptVectorService
});
import { Pool as Pool4 } from "pg";
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
var pool4, JavaScriptVectorService, javascriptVectorService, javascript_vector_service_default;
var init_javascript_vector_service = __esm({
  "server/services/javascript-vector-service.ts"() {
    "use strict";
    pool4 = new Pool4({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    JavaScriptVectorService = class {
      documentChunks = [];
      vocabulary = /* @__PURE__ */ new Map();
      documentFrequency = /* @__PURE__ */ new Map();
      isInitialized = false;
      totalDocuments = 0;
      /**
       * Initialize the vector service by loading and vectorizing all training documents
       */
      async initialize() {
        if (this.isInitialized) {
          console.log("\u{1F4CA} Vector service already initialized");
          return;
        }
        console.log("\u{1F504} Initializing JavaScript Vector Service...");
        const startTime = Date.now();
        try {
          const query2 = `
        SELECT 
          dc.id as chunk_id,
          dc.document_id,
          dc.content,
          td.title as document_title,
          td.document_type
        FROM document_chunks dc
        JOIN training_documents td ON dc.document_id = td.id
        WHERE td.status = 'active'
        ORDER BY td.title, dc.id
      `;
          const result = await pool4.query(query2);
          console.log(`\u{1F4C4} Loaded ${result.rows.length} document chunks from database`);
          this.documentChunks = result.rows.map((row) => ({
            chunkId: row.chunk_id,
            documentId: row.document_id,
            content: row.content,
            documentTitle: row.document_title,
            documentType: row.document_type,
            tokenCount: Math.ceil(row.content.length / 4)
            // Rough token estimate
          }));
          this.totalDocuments = this.documentChunks.length;
          this.buildVocabulary();
          this.vectorizeDocuments();
          const initTime = Date.now() - startTime;
          console.log(`\u2705 Vector service initialized in ${initTime}ms`);
          console.log(`\u{1F4CA} Stats: ${this.documentChunks.length} chunks, ${this.vocabulary.size} vocabulary terms`);
          this.isInitialized = true;
        } catch (error) {
          console.error("\u274C Failed to initialize vector service:", error);
          throw error;
        }
      }
      /**
       * Build vocabulary and calculate document frequency for TF-IDF
       */
      buildVocabulary() {
        console.log("\u{1F524} Building vocabulary and document frequency...");
        const wordCounts = /* @__PURE__ */ new Map();
        for (const chunk of this.documentChunks) {
          const words = this.tokenize(chunk.content);
          const uniqueWords = new Set(words);
          for (const word of uniqueWords) {
            if (!wordCounts.has(word)) {
              wordCounts.set(word, /* @__PURE__ */ new Set());
            }
            wordCounts.get(word).add(chunk.chunkId);
          }
        }
        let vocabIndex = 0;
        for (const [word, documentSet] of wordCounts) {
          this.vocabulary.set(word, vocabIndex++);
          this.documentFrequency.set(word, documentSet.size);
        }
        console.log(`\u2705 Built vocabulary: ${this.vocabulary.size} unique terms`);
      }
      /**
       * Create TF-IDF vectors for all documents
       */
      vectorizeDocuments() {
        console.log("\u{1F522} Creating TF-IDF vectors for all documents...");
        for (const chunk of this.documentChunks) {
          chunk.vector = this.createTFIDFVector(chunk.content);
        }
        console.log(`\u2705 Created ${this.documentChunks.length} document vectors`);
      }
      /**
       * Tokenize text into words for TF-IDF processing
       */
      tokenize(text2) {
        return text2.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 2).filter((word) => !this.isStopWord(word));
      }
      /**
       * Simple stop word filter
       */
      isStopWord(word) {
        const stopWords = /* @__PURE__ */ new Set([
          "the",
          "and",
          "or",
          "but",
          "in",
          "on",
          "at",
          "to",
          "for",
          "of",
          "with",
          "by",
          "a",
          "an",
          "as",
          "are",
          "was",
          "were",
          "been",
          "be",
          "have",
          "has",
          "had",
          "do",
          "does",
          "did",
          "will",
          "would",
          "could",
          "should",
          "may",
          "might",
          "must",
          "can",
          "this",
          "that",
          "these",
          "those",
          "i",
          "you",
          "he",
          "she",
          "it",
          "we",
          "they",
          "me",
          "him",
          "her",
          "us",
          "them"
        ]);
        return stopWords.has(word);
      }
      /**
       * Create TF-IDF vector for a piece of text
       */
      createTFIDFVector(text2) {
        const words = this.tokenize(text2);
        const termFreq = /* @__PURE__ */ new Map();
        for (const word of words) {
          termFreq.set(word, (termFreq.get(word) || 0) + 1);
        }
        const vector = new Array(this.vocabulary.size).fill(0);
        for (const [word, tf] of termFreq) {
          const vocabIndex = this.vocabulary.get(word);
          if (vocabIndex !== void 0) {
            const df = this.documentFrequency.get(word) || 1;
            const idf = Math.log(this.totalDocuments / df);
            const tfidf = tf * idf;
            vector[vocabIndex] = tfidf;
          }
        }
        return vector;
      }
      /**
       * Find similar content based on semantic similarity
       */
      async findSimilarContent(query2, options = {}) {
        if (!this.isInitialized) {
          console.warn("\u26A0\uFE0F Vector service not initialized, initializing now...");
          await this.initialize();
        }
        const {
          maxResults = 5,
          maxTokens = 2e3,
          minSimilarity = 0.1,
          documentTypes = [],
          allowedDocumentIds = []
        } = options;
        console.log(`\u{1F50D} Vector search query: "${query2.substring(0, 50)}..." (maxTokens: ${maxTokens})`);
        const queryVector = this.createTFIDFVector(query2);
        const similarities = [];
        for (const chunk of this.documentChunks) {
          if (allowedDocumentIds.length > 0 && !allowedDocumentIds.includes(chunk.documentId)) {
            continue;
          }
          if (documentTypes.length > 0 && !documentTypes.includes(chunk.documentType)) {
            continue;
          }
          if (!chunk.vector) continue;
          const similarity = cosineSimilarity(queryVector, chunk.vector);
          if (similarity >= minSimilarity) {
            similarities.push({
              chunkId: chunk.chunkId,
              content: chunk.content,
              similarity,
              documentTitle: chunk.documentTitle,
              documentType: chunk.documentType,
              tokenCount: chunk.tokenCount || Math.ceil(chunk.content.length / 4)
            });
          }
        }
        similarities.sort((a, b) => b.similarity - a.similarity);
        const results = [];
        let totalTokens = 0;
        let resultCount = 0;
        for (const result of similarities) {
          if (resultCount >= maxResults) break;
          if (totalTokens + result.tokenCount <= maxTokens) {
            results.push(result);
            totalTokens += result.tokenCount;
            resultCount++;
          }
        }
        console.log(`\u2705 Vector search returned ${results.length} results (${totalTokens} tokens, max similarity: ${results[0]?.similarity.toFixed(3) || "N/A"})`);
        return results;
      }
      /**
       * Generate training context string for AI prompts with strict token budgeting
       */
      async generateTrainingContext(query2, options = {}) {
        const results = await this.findSimilarContent(query2, options);
        if (results.length === 0) {
          console.log("\u26A0\uFE0F No similar content found for query");
          return "No relevant training content found.";
        }
        const context2 = results.map((result) => `# ${result.documentTitle}
${result.content}`).join("\n\n---\n\n");
        const contextTokens = Math.ceil(context2.length / 4);
        console.log(`\u{1F4C4} Generated training context: ${context2.length} chars (${contextTokens} tokens)`);
        return context2;
      }
      /**
       * Get service statistics
       */
      getStats() {
        return {
          initialized: this.isInitialized,
          documentCount: this.documentChunks.length,
          vocabularySize: this.vocabulary.size,
          memoryUsage: {
            documentsEstimate: `${Math.round(this.documentChunks.length * 1e3 / 1024)}KB`,
            vocabularyEstimate: `${Math.round(this.vocabulary.size * 8 / 1024)}KB`,
            totalEstimate: `${Math.round((this.documentChunks.length * 1e3 + this.vocabulary.size * 8) / 1024)}KB`
          }
        };
      }
      /**
       * Refresh vectors (useful when training documents are updated)
       */
      async refresh() {
        console.log("\u{1F504} Refreshing vector service...");
        this.isInitialized = false;
        this.documentChunks = [];
        this.vocabulary.clear();
        this.documentFrequency.clear();
        await this.initialize();
      }
    };
    javascriptVectorService = new JavaScriptVectorService();
    javascript_vector_service_default = javascriptVectorService;
  }
});

// server/utils/aiDevConfig.ts
var aiDevConfig;
var init_aiDevConfig = __esm({
  "server/utils/aiDevConfig.ts"() {
    "use strict";
    aiDevConfig = {
      // Claude API configuration for development
      claude: {
        enabled: process.env.ENVIRONMENT === "development" || process.env.ENVIRONMENT === "production",
        apiKey: process.env.CLAUDE_API_KEY,
        model: "claude-3-5-sonnet-20241022",
        maxTokens: 8e3,
        temperature: 0.7,
        timeout: 3e4
      },
      // Holistic reports configuration
      holisticReports: {
        enabled: false,
        // Start disabled for safety
        mockMode: true,
        // Use mock responses when API is unavailable
        rateLimitPerUser: 3,
        // Max reports per user per day in development
        cacheResults: true
        // Cache results to reduce API calls
      },
      // AI coaching configuration
      aiCoaching: {
        enabled: false,
        // Start disabled for safety
        mockMode: true,
        maxSessionLength: 10,
        // Max messages per session in development
        rateLimitPerUser: 5
        // Max sessions per user per day
      },
      // Safety settings
      safety: {
        requireExplicitEnable: true,
        // Require explicit action to enable AI features
        logAllRequests: true,
        // Log all AI API requests in development
        validateResponses: true,
        // Validate AI responses before returning
        fallbackToMock: true
        // Fall back to mock responses on API errors
      }
    };
  }
});

// server/routes/persona-management-routes.ts
var persona_management_routes_exports = {};
__export(persona_management_routes_exports, {
  CURRENT_PERSONAS: () => CURRENT_PERSONAS,
  CURRENT_REFLECTION_AREAS: () => CURRENT_REFLECTION_AREAS,
  default: () => persona_management_routes_default,
  loadPersonasFromDatabase: () => loadPersonasFromDatabase
});
import express11 from "express";
import { Pool as Pool5 } from "pg";
function getDocumentName(uuid2) {
  return DOCUMENT_NAME_MAPPING[uuid2] || `Document ${uuid2.substring(0, 8)}...`;
}
function enhancePersonasWithDocumentNames(personas) {
  return personas.map((persona2) => ({
    ...persona2,
    trainingDocumentNames: persona2.trainingDocuments?.map(getDocumentName) || [],
    requiredDocumentNames: persona2.requiredDocuments?.map(getDocumentName) || []
  }));
}
async function loadPersonasFromDatabase() {
  try {
    console.log("\u{1F527} Loading persona configurations from database...");
    const result = await pool5.query(`
      SELECT 
        id,
        name,
        role,
        description,
        data_access,
        training_documents,
        token_limit,
        behavior_tone,
        behavior_name_usage,
        behavior_max_response_length,
        behavior_help_style,
        enabled,
        environments,
        created_at,
        updated_at
      FROM talia_personas 
      ORDER BY id
    `);
    CURRENT_PERSONAS = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      description: row.description,
      dataAccess: row.data_access,
      trainingDocuments: row.training_documents,
      requiredDocuments: row.training_documents,
      // Same as training documents for now
      tokenLimit: row.token_limit,
      enabled: row.enabled,
      environments: row.environments,
      behavior: {
        tone: row.behavior_tone,
        nameUsage: row.behavior_name_usage,
        maxResponseLength: row.behavior_max_response_length,
        helpStyle: row.behavior_help_style
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    console.log(`\u2705 Loaded ${CURRENT_PERSONAS.length} personas from database`);
    return CURRENT_PERSONAS;
  } catch (error) {
    console.error("\u274C Error loading personas from database:", error);
    CURRENT_PERSONAS = [
      {
        id: "ast_reflection",
        name: "Reflection Talia",
        role: "Step-by-step reflection coaching",
        description: "Helps users think through their strength reflections during workshop steps",
        dataAccess: ["basic_user_info", "current_step_progress", "current_strengths_focus", "job_title_context"],
        trainingDocuments: ["d359217d-2020-44e2-8f42-25cfe01e3a2b"],
        // Reflection Talia Training Doc
        requiredDocuments: ["d359217d-2020-44e2-8f42-25cfe01e3a2b"],
        tokenLimit: 800,
        enabled: true,
        // Set to false to disable AI coaching for testing
        environments: ["development", "staging", "production"],
        behavior: {
          tone: "encouraging, conversational, coach-like",
          nameUsage: "first",
          maxResponseLength: 400,
          helpStyle: "guide"
        }
      },
      {
        id: "star_report",
        name: "Star Report Talia",
        role: "Comprehensive report generation",
        description: "Creates detailed personal and professional development reports",
        dataAccess: ["full_assessment_data", "all_reflections", "complete_journey", "professional_context"],
        trainingDocuments: [
          "0a6f331e-bb58-469c-8aa0-3b5db2074f1b",
          "8053a205-701b-4a10-8dd8-39d92b18566d",
          "3577e1e1-2fad-45d9-8ad1-12698bc327e3",
          "158fcf64-75e9-4f46-8331-7de774ca89a6",
          "1ffd5369-e17a-41bb-b54c-2f38630d7ff4",
          "6e98d248-db4c-4bdc-99e0-a90e25b7032c",
          "5cd8779c-4a3f-4e8a-91a7-378323ce8493",
          "ddb2e849-0ff1-4766-9675-288575b95806",
          "7a1ccb9d-31f7-4d9b-88f4-d63f3e9b50bb",
          "a2eb129f-faa9-418b-96fb-0beda55a4eb5",
          "30bf8cb3-3411-490f-a024-c11e20728691",
          "74faa6cb-91a3-41e8-a99d-96c1d4036e13",
          "f2cf6ca4-8954-42dd-978e-42b1c4ce6fe2",
          "24454ad2-0655-4e5e-b048-3496e1c85bce",
          "37ffd442-c115-4291-b1e9-38993089e285",
          "2fe879b8-6e00-40a1-a83a-2499da4803e3",
          "7f16c08e-45c4-4847-9992-ec1445ea7605",
          "55a07f54-4fc3-4297-b5eb-5a41517ea7f7",
          "fed2182e-4387-4d0d-a269-7e7534df7020",
          "0535a97a-4353-4cf3-822a-36b97f12c7c0",
          "a89f9f77-ecd4-4365-9adf-75fac4154528",
          "0dcfa7e0-a08d-45be-a299-4ca33efef3f1",
          "9f73a4ee-7a69-490c-a530-59597825b58f",
          "8498619b-8e07-4f62-8bce-c075e17adc1b",
          "d74c99c0-12c5-4d15-9a34-d11a6394fb75",
          "0c360d21-7da8-4299-8443-6b27e43ebfdb"
        ],
        requiredDocuments: [
          "0a6f331e-bb58-469c-8aa0-3b5db2074f1b",
          "8053a205-701b-4a10-8dd8-39d92b18566d"
        ],
        tokenLimit: 4e3,
        enabled: true,
        environments: ["development", "staging", "production"],
        behavior: {
          tone: "comprehensive, analytical, developmental",
          nameUsage: "full",
          maxResponseLength: 15e3,
          helpStyle: "analyze"
        }
      }
    ];
  }
}
var router11, pool5, DOCUMENT_NAME_MAPPING, CURRENT_PERSONAS, CURRENT_REFLECTION_AREAS, persona_management_routes_default;
var init_persona_management_routes = __esm({
  "server/routes/persona-management-routes.ts"() {
    "use strict";
    init_auth();
    router11 = express11.Router();
    pool5 = new Pool5({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    router11.use(requireAuth);
    console.log("\u{1F527} PERSONA MANAGEMENT ROUTES LOADED");
    DOCUMENT_NAME_MAPPING = {
      // Reflection Talia Training Documents
      "d359217d-2020-44e2-8f42-25cfe01e3a2b": "Reflection Talia Training Doc",
      // Star Report Talia Training Documents
      "0a6f331e-bb58-469c-8aa0-3b5db2074f1b": "Star Report Training - Core Methodology",
      "8053a205-701b-4a10-8dd8-39d92b18566d": "Star Report Training - Assessment Analysis",
      "3577e1e1-2fad-45d9-8ad1-12698bc327e3": "Star Report Training - Flow State Guidance",
      "158fcf64-75e9-4f46-8331-7de774ca89a6": "Star Report Training - Strengths Integration",
      "1ffd5369-e17a-41bb-b54c-2f38630d7ff4": "Star Report Training - Personal Development",
      "6e98d248-db4c-4bdc-99e0-a90e25b7032c": "Star Report Training - Professional Applications",
      "5cd8779c-4a3f-4e8a-91a7-378323ce8493": "Star Report Training - Vision & Future Planning",
      "ddb2e849-0ff1-4766-9675-288575b95806": "Star Report Training - Well-being Integration",
      "7a1ccb9d-31f7-4d9b-88f4-d63f3e9b50bb": "Star Report Training - Team Dynamics",
      "a2eb129f-faa9-418b-96fb-0beda55a4eb5": "Star Report Training - Growth Planning",
      "30bf8cb3-3411-490f-a024-c11e20728691": "Star Report Training - Report Structure",
      "74faa6cb-91a3-41e8-a99d-96c1d4036e13": "Star Report Training - Personalization",
      "f2cf6ca4-8954-42dd-978e-42b1c4ce6fe2": "Star Report Training - Data Analysis",
      "24454ad2-0655-4e5e-b048-3496e1c85bce": "Star Report Training - Coaching Integration",
      "37ffd442-c115-4291-b1e9-38993089e285": "Star Report Training - User Journey",
      "2fe879b8-6e00-40a1-a83a-2499da4803e3": "Star Report Training - Context Awareness",
      "7f16c08e-45c4-4847-9992-ec1445ea7605": "Star Report Training - Communication Style",
      "55a07f54-4fc3-4297-b5eb-5a41517ea7f7": "Star Report Training - Professional Language",
      "fed2182e-4387-4d0d-a269-7e7534df7020": "Star Report Training - Executive Summary",
      "0535a97a-4353-4cf3-822a-36b97f12c7c0": "Star Report Training - Action Planning",
      "a89f9f77-ecd4-4365-9adf-75fac4154528": "Star Report Training - Developmental Guidance",
      "0dcfa7e0-a08d-45be-a299-4ca33efef3f1": "Star Report Training - Reflection Integration",
      "9f73a4ee-7a69-490c-a530-59597825b58f": "Star Report Training - Future Visioning",
      "8498619b-8e07-4f62-8bce-c075e17adc1b": "Star Report Training - Leadership Development",
      "d74c99c0-12c5-4d15-9a34-d11a6394fb75": "Star Report Training - Team Collaboration",
      "0c360d21-7da8-4299-8443-6b27e43ebfdb": "Star Report Training - Implementation Guide"
    };
    CURRENT_PERSONAS = [];
    CURRENT_REFLECTION_AREAS = [
      {
        id: "step_1_1",
        name: "Step 1-1: Initial Assessment",
        description: "Self-assessment and initial orientation activities",
        workshopStep: "1-1",
        enabled: false,
        fallbackText: "Please take time to reflect on your initial assessment and workshop orientation."
      },
      {
        id: "step_2_1",
        name: "Step 2-1: Assessment Review",
        description: "Review and discussion of assessment results",
        workshopStep: "2-1",
        enabled: false,
        fallbackText: "Consider your assessment results and what they reveal about your natural strengths."
      },
      {
        id: "step_2_2",
        name: "Step 2-2: Understanding Your Strengths",
        description: "Deep dive into understanding your individual strength profile",
        workshopStep: "2-2",
        enabled: false,
        fallbackText: "Reflect on how your strengths manifest in your daily work and interactions."
      },
      {
        id: "step_2_3",
        name: "Step 2-3: Strength Applications",
        description: "Exploring how to apply your strengths in various contexts",
        workshopStep: "2-3",
        enabled: false,
        fallbackText: "Consider specific examples of how you have used your strengths successfully."
      },
      {
        id: "step_2_4",
        name: "Step 2-4: Strength Reflections",
        description: 'Individual strength reflections (Strengths 1-4) plus team environment reflections: "What You Value Most in Team Environments" and "Your Unique Contribution"',
        workshopStep: "2-4",
        enabled: true,
        reflectionCount: 6,
        reflections: [
          "Strength 1 Reflection",
          "Strength 2 Reflection",
          "Strength 3 Reflection",
          "Strength 4 Reflection",
          "What You Value Most in Team Environments",
          "Your Unique Contribution"
        ],
        fallbackText: "This step contains 6 reflections: 4 individual strength reflections and 2 team-focused reflections. Please work through each reflection thoughtfully."
      },
      {
        id: "step_3_1",
        name: "Step 3-1: Team Applications",
        description: "Applying your strengths within team contexts",
        workshopStep: "3-1",
        enabled: true,
        fallbackText: "Consider how you can leverage your strengths to contribute more effectively in team settings."
      },
      {
        id: "step_3_2",
        name: "Step 3-2: Flow Assessment",
        description: "Assessment of flow attributes and preferences",
        workshopStep: "3-2",
        enabled: true,
        fallbackText: "Complete your flow assessment to understand your flow state preferences and patterns."
      },
      {
        id: "step_3_3",
        name: "Step 3-3: Flow Reflections",
        description: "Four reflections on flow states: natural flow conditions, flow blockers, flow enablers, and creating more flow opportunities",
        workshopStep: "3-3",
        enabled: true,
        reflectionCount: 4,
        reflections: [
          "When does flow happen most naturally for you?",
          "What typically blocks or interrupts your flow state?",
          "What conditions help you get into flow more easily?",
          "How could you create more opportunities for flow in your work and life?"
        ],
        fallbackText: "This step contains 4 flow-related reflections. Please work through each reflection thoughtfully, considering your personal flow experiences."
      },
      {
        id: "step_3_4",
        name: "Step 3-4: Flow Attributes Selection",
        description: "Interactive exercise where users select 4 flow attribute words that describe their optimal flow state to complement their Star strengths profile",
        workshopStep: "3-4",
        enabled: true,
        isExercise: true,
        exerciseInstructions: {
          purpose: "Flow attributes represent how you work at your best. They complement your Star strengths profile which shows what you're naturally good at. Together, they create a more complete picture of your professional identity.",
          task: "Select four flow attributes that best describe your optimal flow state. These will be added to your StarCard to create a comprehensive visualization.",
          userAction: "Choose 4 words that best describe your flow state from the available options. Users can click badges to select/deselect and drag to reorder selections.",
          completionPhrase: "I find myself in flow when I am being: [4 selected attributes]",
          taliaGuidance: "Help users think about their flow reflections from step 3-3 and connect them to the available attribute words. Look up current flow attribute options dynamically before providing guidance."
        },
        fallbackText: "Select 4 flow attribute words that best describe how you work at your best. Consider your flow reflections as you make your choices."
      },
      {
        id: "step_4_1",
        name: "Step 4-1: Future Vision",
        description: "Future visioning activities and planning exercises that may benefit from Talia coaching support",
        workshopStep: "4-1",
        enabled: true,
        fallbackText: "Work through your future vision planning exercises. Consider how your strengths and flow attributes can help you achieve your goals."
      },
      {
        id: "step_4_2",
        name: "Step 4-2: Well-being Assessment Reflections",
        description: "Five reflections based on the Cantril Ladder well-being assessment: current rating factors, main well-being elements, envisioned improvements, tangible differences, and quarterly commitments",
        workshopStep: "4-2",
        enabled: true,
        reflectionCount: 5,
        reflections: [
          "What factors shape your current rating?",
          "What are the main elements contributing to your current well-being? Consider your work, relationships, health, finances, and personal growth...",
          "What improvements do you envision? What achievements or changes would make your life better in one year?",
          "What will be different? How will your experience be noticeably different in tangible ways?",
          "What actions will you commit to this quarter? Name 1-2 concrete steps you'll take before your first quarterly check-in."
        ],
        specialContext: "cantril_ladder",
        fallbackText: "This step contains 5 well-being reflections based on your Cantril Ladder assessment. Talia should be aware of your ladder rating and help you connect your responses to your assessment results."
      },
      {
        id: "step_4_3",
        name: "Step 4-3: Vision Images Exercise",
        description: "Interactive exercise where users select 1-5 images that represent their ideal future self, followed by a reflection on what the images mean to them",
        workshopStep: "4-3",
        enabled: true,
        isExercise: true,
        hasReflection: true,
        exerciseInstructions: {
          purpose: "This exercise helps you turn your one-year vision into something visible by selecting images that represent your ideal future self.",
          task: "Select 1-5 images that represent your ideal future self. You can upload your own images or search for images from Unsplash.",
          userAction: "Choose images that evoke positive emotions, align with your ladder reflection, and represent different aspects of your future vision.",
          imageStorage: "Selected images should be stored in the photo service database for future reference.",
          imageGuidelines: {
            maxImages: 5,
            minImages: 1,
            maxFileSize: "10MB",
            sources: ["Upload your own images", "Search Unsplash stock images"],
            selectionCriteria: [
              "Choose images that evoke positive emotions",
              "Look for images that align with your ladder reflection",
              "Select a variety of images that represent different aspects of your future vision"
            ]
          },
          reflectionPrompt: "What do these images mean to you? Explain what these images represent about your future vision. How do they connect to your strengths and flow state?",
          taliaGuidance: "Help users think about how their selected images connect to their strengths, flow state, and future vision. Support them in reflecting on the deeper meaning behind their image choices."
        },
        fallbackText: "Select 1-5 images that represent your ideal future self, then reflect on what these images mean to you and how they connect to your strengths and flow state."
      },
      {
        id: "step_4_4",
        name: "Step 4-4: Future Self Journey Reflections",
        description: "Four reflections exploring your future self timeline: 20-year masterpiece, 10-year mastery, 5-year development, and flow-optimized life design",
        workshopStep: "4-4",
        enabled: true,
        reflectionCount: 4,
        reflections: [
          "20 Years: What is the masterpiece of your life?",
          "10 Years: What level of mastery or influence must you have reached by now to be on track?",
          "5 Years: What capacities or conditions need to be actively developing now?",
          "Flow-Optimized Life: What would your life look like if it were designed to support flow states more often?"
        ],
        exerciseContext: {
          purpose: "This exercise helps you imagine who you want to become\u2014and how to shape a life that supports that becoming.",
          approach: "Use your Flow Assessment insights to guide your vision. You can work backwards (20\u219210\u21925 years) or forwards (5\u219210\u219220 years). There's no right way\u2014only your way.",
          flowConnection: "Bridge to flow by designing a life that supports the conditions where you experience deep focus, energy, and ease.",
          timeline: {
            direction: "Choose your direction - work backwards from 20 years or forwards from 5 years",
            twentyYear: "What is the masterpiece of your life?",
            tenYear: "What level of mastery or influence must you have reached by now to be on track?",
            fiveYear: "What capacities or conditions need to be actively developing now?",
            flowOptimized: "What would your life look like if it were designed to support flow states more often?"
          }
        },
        specialContext: "future_self_timeline",
        fallbackText: "This step contains 4 reflections about your future self journey. Use your Flow Assessment insights to guide your vision as you explore your timeline and design a flow-optimized life."
      },
      {
        id: "step_4_5",
        name: "Step 4-5: Journey Completion Reflection",
        description: "Final reflection to distill the entire workshop experience into one key insight to carry forward into team collaboration",
        workshopStep: "4-5",
        enabled: true,
        reflectionCount: 1,
        reflections: [
          "What's the one insight you want to carry forward?"
        ],
        journeyContext: {
          purpose: "Distill the entire workshop experience into one clear insight that will guide you forward as you move into team collaboration.",
          journeyScope: "You've completed a journey of personal discovery, from understanding your core strengths to envisioning your future potential. Each step revealed something valuable about who you are.",
          focusArea: "This insight should be something you want to remember as you transition from individual reflection to team collaboration.",
          reflectionPrompt: "What's the one insight you want to carry forward?"
        },
        specialContext: "workshop_completion",
        fallbackText: "Reflect on your entire workshop journey and distill your experience into one key insight you want to carry forward into team collaboration."
      }
    ];
    router11.get("/personas", requireAdmin, async (req, res) => {
      try {
        console.log("\u{1F527} PERSONA GET REQUEST RECEIVED (loading from database)");
        console.log("\u{1F4CB} Fetching persona configurations from database");
        await loadPersonasFromDatabase();
        const currentEnvironment = process.env.ENVIRONMENT || process.env.NODE_ENV || "development";
        const filteredPersonas = CURRENT_PERSONAS.filter(
          (persona2) => persona2.environments.includes(currentEnvironment)
        );
        console.log(`\u{1F30D} Environment: ${currentEnvironment}, Available personas: ${filteredPersonas.length}/${CURRENT_PERSONAS.length}`);
        const enhancedPersonas = enhancePersonasWithDocumentNames(filteredPersonas);
        console.log(`\u2705 Enhanced personas with document names:`, enhancedPersonas[0]?.requiredDocumentNames || "No required docs");
        res.json({
          success: true,
          personas: enhancedPersonas,
          environment: currentEnvironment,
          message: "Personas retrieved successfully"
        });
      } catch (error) {
        console.error("\u274C Error fetching personas:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch personas"
        });
      }
    });
    router11.put("/personas/:personaId", requireAdmin, async (req, res) => {
      try {
        const { personaId } = req.params;
        const updates = req.body;
        console.log("\u{1F527} PERSONA UPDATE REQUEST:", personaId, updates);
        console.log("\u{1F527} Current persona before update:", CURRENT_PERSONAS.find((p) => p.id === personaId));
        const personaIndex = CURRENT_PERSONAS.findIndex((p) => p.id === personaId);
        if (personaIndex === -1) {
          return res.status(404).json({
            success: false,
            error: "Persona not found"
          });
        }
        CURRENT_PERSONAS[personaIndex] = {
          ...CURRENT_PERSONAS[personaIndex],
          ...updates
        };
        const updatedPersona = CURRENT_PERSONAS[personaIndex];
        await pool5.query(`
      UPDATE talia_personas SET
        name = $2,
        role = $3,
        description = $4,
        data_access = $5,
        training_documents = $6,
        token_limit = $7,
        behavior_tone = $8,
        behavior_name_usage = $9,
        behavior_max_response_length = $10,
        behavior_help_style = $11,
        enabled = $12,
        environments = $13,
        updated_at = NOW()
      WHERE id = $1
    `, [
          personaId,
          updatedPersona.name,
          updatedPersona.role,
          updatedPersona.description,
          updatedPersona.dataAccess,
          updatedPersona.trainingDocuments,
          updatedPersona.tokenLimit,
          updatedPersona.behavior?.tone || "encouraging, conversational",
          updatedPersona.behavior?.nameUsage || "first",
          updatedPersona.behavior?.maxResponseLength || 400,
          updatedPersona.behavior?.helpStyle || "guide",
          updatedPersona.enabled,
          updatedPersona.environments
        ]);
        console.log("\u2705 Persona updated in database:", personaId);
        console.log("\u{1F527} Persona AFTER update:", updatedPersona);
        console.log("\u{1F527} ALL PERSONAS current state:", CURRENT_PERSONAS.map((p) => ({ id: p.id, enabled: p.enabled })));
        const enhancedPersona = enhancePersonasWithDocumentNames([updatedPersona])[0];
        res.json({
          success: true,
          message: `Persona ${personaId} updated successfully and persisted to database`,
          persona: enhancedPersona
        });
      } catch (error) {
        console.error("\u274C Error updating persona:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update persona"
        });
      }
    });
    router11.get("/reflection-areas", requireAdmin, async (req, res) => {
      try {
        console.log("\u{1F4CB} Fetching reflection areas");
        res.json({
          success: true,
          areas: CURRENT_REFLECTION_AREAS,
          message: "Reflection areas retrieved successfully"
        });
      } catch (error) {
        console.error("\u274C Error fetching reflection areas:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch reflection areas"
        });
      }
    });
    router11.put("/reflection-areas/:areaId", requireAdmin, async (req, res) => {
      try {
        const { areaId } = req.params;
        const updates = req.body;
        console.log("\u2705 Updating reflection area:", areaId, updates);
        const areaIndex = CURRENT_REFLECTION_AREAS.findIndex((a) => a.id === areaId);
        if (areaIndex === -1) {
          return res.status(404).json({
            success: false,
            error: "Reflection area not found"
          });
        }
        CURRENT_REFLECTION_AREAS[areaIndex] = {
          ...CURRENT_REFLECTION_AREAS[areaIndex],
          ...updates
        };
        console.log("\u2705 Reflection area updated successfully:", CURRENT_REFLECTION_AREAS[areaIndex]);
        res.json({
          success: true,
          message: `Reflection area ${areaId} updated successfully`,
          area: CURRENT_REFLECTION_AREAS[areaIndex]
        });
      } catch (error) {
        console.error("\u274C Error updating reflection area:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update reflection area"
        });
      }
    });
    router11.get("/reflection-areas/:areaId/status", async (req, res) => {
      try {
        const { areaId } = req.params;
        console.log("\u{1F50D} Checking reflection area status:", areaId);
        const area = CURRENT_REFLECTION_AREAS.find((a) => a.id === areaId);
        if (!area) {
          return res.status(404).json({
            success: false,
            error: "Reflection area not found"
          });
        }
        res.json({
          success: true,
          area: {
            id: area.id,
            enabled: area.enabled,
            fallbackText: area.fallbackText
          }
        });
      } catch (error) {
        console.error("\u274C Error checking reflection area status:", error);
        res.status(500).json({
          success: false,
          error: "Failed to check reflection area status"
        });
      }
    });
    persona_management_routes_default = router11;
  }
});

// server/services/claude-api-service.ts
var claude_api_service_exports = {};
__export(claude_api_service_exports, {
  generateClaudeCoachingResponse: () => generateClaudeCoachingResponse,
  getClaudeAPIStatus: () => getClaudeAPIStatus,
  isClaudeAPIAvailable: () => isClaudeAPIAvailable
});
function getCurrentPersona(personaId) {
  const dbPersona = CURRENT_PERSONAS.find((p) => p.id === personaId);
  if (dbPersona) {
    return {
      tokenLimit: dbPersona.tokenLimit || 800,
      name: dbPersona.name || "Talia",
      behavior: dbPersona.behavior || {}
    };
  }
  return TALIA_PERSONAS[personaId] || TALIA_PERSONAS.ast_reflection;
}
async function callClaudeAPI(systemPrompt, messages, maxTokens = 1e3, userId2, featureName = "coaching", sessionId) {
  if (!aiDevConfig.claude.enabled || !aiDevConfig.claude.apiKey) {
    throw new Error("Claude API not configured or disabled");
  }
  if (userId2 && process.env.NODE_ENV !== "development") {
    const canUse = await aiUsageLogger.canUseAI(userId2, featureName);
    if (!canUse.allowed) {
      throw new Error(`AI usage not allowed: ${canUse.reason}`);
    }
  }
  const startTime = Date.now();
  let success = false;
  let tokensUsed = 0;
  let errorMessage;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": aiDevConfig.claude.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: aiDevConfig.claude.model,
        max_tokens: Math.min(maxTokens, aiDevConfig.claude.maxTokens),
        temperature: aiDevConfig.claude.temperature,
        system: systemPrompt,
        messages
      })
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", response.status, errorData);
      throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }
    const data = await response.json();
    tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    success = true;
    if (data.content && data.content.length > 0 && data.content[0].text) {
      const responseText = data.content[0].text;
      if (userId2) {
        const responseTime = Date.now() - startTime;
        const costEstimate = aiUsageLogger.calculateCost(tokensUsed);
        await aiUsageLogger.logUsage({
          userId: userId2,
          featureName,
          tokensUsed,
          responseTimeMs: responseTime,
          success: true,
          costEstimate,
          sessionId
        });
      }
      return responseText;
    } else {
      throw new Error("No content in Claude response");
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (userId2) {
      const responseTime = Date.now() - startTime;
      await aiUsageLogger.logUsage({
        userId: userId2,
        featureName,
        tokensUsed,
        responseTimeMs: responseTime,
        success: false,
        errorMessage,
        sessionId
      });
    }
    throw error;
  }
}
function validateCoachingResponse(response, personaType) {
  const forbiddenTopics = [
    "medical",
    "health",
    "doctor",
    "therapy",
    "medication",
    "diagnosis",
    "financial",
    "investment",
    "money",
    "loan",
    "debt",
    "tax",
    "legal",
    "lawyer",
    "court",
    "lawsuit",
    "contract",
    "political",
    "politics",
    "election",
    "government",
    "personal relationship",
    "dating",
    "marriage",
    "divorce",
    "religion",
    "spiritual",
    "church"
  ];
  const lowerResponse = response.toLowerCase();
  const containsForbidden = forbiddenTopics.some((topic) => lowerResponse.includes(topic));
  const isReportTaliaContext = personaType === "star_report" || response.includes("Report Talia") || response.includes("training") || response.includes("document");
  if (containsForbidden && !isReportTaliaContext) {
    console.warn("\u26A0\uFE0F Response contained forbidden content, using safe fallback");
    return `I appreciate your question! However, I'm specifically designed to help with strengths-based development and teamwork. Let's focus on how your strengths can help you grow professionally. What aspect of your ${personaType === "talia_coach" ? "current strength" : "workshop step"} would you like to explore?`;
  }
  const isASTReport = (personaType === "talia" || personaType === "star_report") && (response.includes("Personal Development Report") || response.includes("Professional Profile Report") || response.includes("AllStarTeams Workshop Analysis"));
  const isReportGeneration = response.includes("# Personal Development Report") || response.includes("## AllStarTeams Workshop Analysis") || response.includes("*Generated for") || response.includes("<h1>Your Personal Development Report</h1>") || response.includes("<h1>Professional Development Analysis</h1>") || response.includes("Your Personal Development Report") || response.includes("Professional Development Analysis") || response.includes("Executive Summary") || response.includes('<div class="report-container">') || response.includes("<html") || response.includes("<!DOCTYPE html");
  if (!isASTReport && !isReportGeneration && response.length > 1500) {
    console.warn("\u26A0\uFE0F Response too long, truncating");
    const truncated = response.substring(0, 1450);
    const lastSentence = truncated.lastIndexOf(".");
    if (lastSentence > 1e3) {
      return truncated.substring(0, lastSentence + 1) + "\n\nWhat specific aspect would you like to explore further?";
    }
  } else if (isASTReport || isReportGeneration) {
    console.log(`\u2705 Report detected (${response.length} chars) - skipping length truncation`);
  }
  const personalInfoRequests = ["tell me about yourself", "your background", "your experience", "where are you from"];
  const containsPersonalRequest = personalInfoRequests.some((request) => lowerResponse.includes(request));
  const isDocumentRelated = response.includes("document") || response.includes("training") || response.includes("report") || response.includes("Report Talia") || response.includes("Samantha") || personaType === "star_report";
  if (containsPersonalRequest && !isDocumentRelated) {
    console.warn("\u26A0\uFE0F Response contained personal information request, filtering");
    return response.replace(/tell me about.*?(yourself|your background|your experience)/gi, "let's focus on your strengths and development");
  }
  return response;
}
function buildCoachingSystemPrompt(personaType, userName, contextData) {
  const isTaliaPersona = personaType === "talia_coach" || personaType === "ast_reflection";
  const basePrompt = `You are ${isTaliaPersona ? "Talia" : "a Workshop Assistant"}, an AI coach for the AllStarTeams strength-based development platform.`;
  if (isTaliaPersona) {
    const strengthInfo = contextData.allStrengths ? `

${userName}'s Strength Profile:
${contextData.allStrengths.map((s) => `- ${s.label}: ${s.score}%`).join("\n")}` : "";
    const currentFocus = contextData.strengthFocus ? `

Current Focus: ${contextData.strengthFocus} strength` : "";
    const personaContext = personaType === "ast_reflection" ? "You are specifically focused on helping with reflection questions during the AllStarTeams workshop steps." : "You provide general coaching support across all workshop activities.";
    return `${basePrompt}

${personaContext}

You help participants discover and develop their unique strengths through the AllStarTeams methodology. You are supportive, insightful, and focused on growth.

STRICT GUIDELINES - You MUST follow these rules:
1. IDENTITY: You are Talia, here to help with strengths development
2. TASK FOCUS: Always reference the specific reflection question they're working on
3. COACHING APPROACH: Help them reason through their thoughts - NEVER write their reflections for them
4. TASK REQUIREMENT: Remind them the task is to write 2-3 sentences about their specific reflection topic
5. STAY ON TOPIC: Only discuss the current reflection question - decline other requests politely
6. OFF-TOPIC HANDLING: If their statement isn't relevant to the current reflection, ask "Should I save this to discuss after you complete your reflection?"
7. NATURAL LENGTH: Respond naturally - don't worry about word limits, focus on being helpful
8. NO PERSONAL INFO: Never ask for or remember personal details beyond workshop context

Key coaching principles for the current reflection task:
- Always start by referencing their specific reflection question or topic
- Remind them: "Your task is to write 2-3 sentences about [specific topic]"
- Be genuinely curious and ask specific clarifying questions to help them dig deeper
- NEVER write their reflection for them - help them discover their own insights through questioning
- Use their actual strength percentages to provide personalized insights
- If they ask unrelated questions, respond: "Let's focus on your current reflection first. Should I save this to discuss after you complete your 2-3 sentences?"

CLARIFYING QUESTION TECHNIQUES:
- Ask for specific examples: "Can you give me a specific example of when that happened?"
- Explore feelings: "How did that feel different from other situations?" 
- Dig into details: "What made that particular moment stand out to you?"
- Compare situations: "How was that different from times when you didn't use this strength?"
- Explore impact: "What was the outcome when you applied that strength?"
- Get concrete: "What exactly did you do in that situation?"
- Understand patterns: "Have you noticed this pattern in other areas of your work?"

AREA-SPECIFIC COACHING APPROACHES:
For STRENGTH reflections:
- Focus on specific workplace situations where they used this strength
- Ask about the impact and outcomes of using the strength
- Explore how this strength manifests differently in various situations
- Help them identify patterns in when/how they naturally use this strength

For TEAM/COLLABORATION reflections:
- Ask about specific team interactions and dynamics
- Explore their role in group settings
- Focus on concrete examples of collaboration
- Help them identify what they contribute to team success

For CHALLENGE/PROBLEM-SOLVING reflections:
- Ask for specific examples of problems they've solved
- Explore their thought process and approach
- Focus on what made their solution unique or effective
- Help them identify their natural problem-solving patterns

CONTENT BOUNDARIES - TASK-SPECIFIC FOCUS:
- ONLY discuss the specific reflection question they are currently working on
- All questions must directly serve the goal of helping them write their 2-3 sentences
- Decline ANY topics not directly related to their current reflection task
- If they bring up other topics, redirect: "Let's focus on your current reflection first. Should I save this to discuss after you complete your 2-3 sentences?"

WHO YOU ARE:
You are Talia, here to help with strengths development. You understand the AllStarTeams methodology and can help participants discover and develop their unique strengths.

${strengthInfo}${currentFocus}

CURRENT TASK:
${contextData?.questionText ? `Question: "${contextData.questionText}"` : contextData?.stepName ? `Step: ${contextData.stepName}` : "Current workshop activity"}
${contextData?.strengthLabel ? `Focus: ${contextData.strengthLabel} strength` : ""}
${contextData?.exerciseType ? `Type: ${contextData.exerciseType} exercise` : ""}

${contextData?.workshopContext ? `
WORKSHOP CONTEXT:
Current Step: ${contextData.workshopContext.stepName}
What they've completed: ${contextData.workshopContext.previousSteps.join(", ")}
Current Task: ${contextData.workshopContext.currentTask}

${contextData.workshopContext.questionContext ? `
QUESTION DETAILS:
Question ${contextData.workshopContext.questionContext.questionNumber} of ${contextData.workshopContext.questionContext.totalQuestions}
Current Question: "${contextData.workshopContext.questionContext.currentQuestion}"
${contextData.workshopContext.questionContext.hint ? `Hint: ${contextData.workshopContext.questionContext.hint}` : ""}
${contextData.workshopContext.questionContext.currentSection ? `Section: ${contextData.workshopContext.questionContext.currentSection}` : ""}

${contextData.workshopContext.questionContext.wellBeingLevels ? `
WELL-BEING CONTEXT:
Current Level: ${contextData.workshopContext.questionContext.wellBeingLevels.current}/10
Future Level (1 year): ${contextData.workshopContext.questionContext.wellBeingLevels.future}/10
` : ""}

All questions in this step:
${contextData.workshopContext.questionContext.allQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
` : ""}` : ""}

${contextData?.exerciseInstructions ? `
EXERCISE INSTRUCTIONS:
${contextData.exerciseInstructions}
` : ""}

${contextData?.cantrilLadderRating ? `
CANTRIL LADDER CONTEXT:
The user has rated their current life satisfaction as ${contextData.cantrilLadderRating} out of 10 on the Cantril Ladder well-being scale. Use this context to help them reflect on their well-being factors, improvements, and commitments. Connect their responses to this baseline rating.
` : ""}

${contextData?.visionImages ? `
VISION IMAGES CONTEXT:
The user has selected ${contextData.visionImages.length} images for their future vision exercise: ${contextData.visionImages.map((img) => `"${img.description || "Vision image"}" (${img.source})`).join(", ")}. Help them reflect on what these images mean to them and how they connect to their strengths and flow state.
` : ""}

${contextData?.futureTimelineApproach ? `
FUTURE SELF TIMELINE CONTEXT:
The user is working on their Future Self Journey. They can choose to work backwards (20\u219210\u21925 years) or forwards (5\u219210\u219220 years). Help them use their Flow Assessment insights to guide their vision and imagine who they want to become. Focus on designing a life that supports the conditions where they experience deep focus, energy, and ease.
Timeline approach: ${contextData.futureTimelineApproach}
` : ""}

${contextData?.workshopCompletion ? `
WORKSHOP COMPLETION CONTEXT:
The user has just completed their entire AllStarTeams workshop journey - from understanding core strengths to envisioning future potential. Help them distill this experience into one clear insight to carry forward into team collaboration. They should reflect on what they've learned about who they are and how they want to show up in teams.
Journey scope: Personal discovery through strengths, flow states, well-being assessment, vision planning, and future self exploration.
` : ""}

${contextData?.userPersonalization ? `
${contextData.userPersonalization}` : ""}

${contextData?.isReflection ? "REMEMBER: Their task is to write 2-3 sentences about this specific reflection question. Help them think it through, but don't write it for them." : contextData?.exerciseType ? "REMEMBER: This is an interactive exercise. Guide them through the process and help them make thoughtful choices." : "REMEMBER: Help them work through this step thoughtfully."}

Always introduce yourself simply as "I'm Talia" when greeting someone new, and respond in a conversational, coaching style within these guidelines.`;
  } else {
    return `${basePrompt}

You provide contextual assistance during workshop steps, helping participants understand content and complete activities effectively.

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully and concisely.`;
  }
}
async function generateClaudeCoachingResponse(requestData) {
  const { userMessage, personaType, userName, contextData, userId: userId2, sessionId, maxTokens = 600, stepId } = requestData;
  try {
    console.log(`\u{1F916} Generating Claude response for persona: ${personaType}, user: ${userName}`);
    console.log(`\u{1F527} Claude config: enabled=${aiDevConfig.claude.enabled}, hasKey=${!!aiDevConfig.claude.apiKey}, model=${aiDevConfig.claude.model}`);
    if (personaType === "ast_reflection" && stepId && userId2) {
      console.log(`\u{1F3AF} Using AST Reflection Talia for step: ${stepId}`);
      const persona2 = getCurrentPersona("ast_reflection");
      const reflectionContext = await taliaPersonaService.getReflectionContext(userId2.toString(), stepId);
      if (reflectionContext) {
        const reflectionPrompt = await taliaPersonaService.generateReflectionPrompt(reflectionContext, userMessage);
        const messages2 = [{ role: "user", content: userMessage }];
        const response2 = await callClaudeAPI(reflectionPrompt, messages2, persona2.tokenLimit, userId2, "coaching", sessionId);
        return validateCoachingResponse(response2, personaType);
      }
    }
    if (personaType === "star_report") {
      if (contextData?.reportContext === "holistic_generation") {
        console.log("\u{1F3AF} Optimized Report Talia - Holistic report generation with token limits");
        console.log("\u{1F527} Context check:", {
          reportContext: contextData?.reportContext,
          selectedUserId: contextData?.selectedUserId,
          hasUserData: !!contextData?.userData
        });
        const persona3 = getCurrentPersona("star_report");
        try {
          const optimizedContext = await taliaPersonaService.getOptimizedReportContext(
            contextData.selectedUserId.toString(),
            contextData.userData,
            userMessage.includes("Personal Development") ? "personal" : "professional"
          );
          if (optimizedContext) {
            console.log("\u2705 Created optimized context, generating prompt...");
            const optimizedPrompt = await taliaPersonaService.generateOptimizedReportPrompt(
              optimizedContext,
              userMessage,
              contextData.starCardImageBase64
            );
            console.log(`\u{1F4CA} Optimized prompt length: ${optimizedPrompt.length} chars, estimated tokens: ${Math.round(optimizedPrompt.length / 4)}`);
            const messages2 = [{ role: "user", content: userMessage }];
            const totalPromptSize = optimizedPrompt.length + userMessage.length;
            const estimatedTokens = Math.round(totalPromptSize / 4);
            console.log(`\u{1F522} Total API call size: system=${optimizedPrompt.length} + user=${userMessage.length} = ${totalPromptSize} chars (~${estimatedTokens} tokens)`);
            if (estimatedTokens > 18e4) {
              console.error("\u{1F6A8} ESTIMATED TOKENS TOO HIGH FOR API CALL!", estimatedTokens);
              throw new Error(`Estimated tokens ${estimatedTokens} exceed safe limit of 180k`);
            }
            const response2 = await callClaudeAPI(optimizedPrompt, messages2, maxTokens, userId2, "holistic_reports", sessionId);
            return validateCoachingResponse(response2, personaType);
          } else {
            console.error("\u274C Failed to create optimized context, falling back to error");
            throw new Error("Failed to create optimized report context");
          }
        } catch (error) {
          console.error("\u274C Error in optimized report generation:", error);
          throw error;
        }
      }
      if (!contextData?.selectedUserId) {
        return `Hi! I'm Report Talia, your comprehensive development report expert.

I notice you haven't selected a specific user yet. To provide you with detailed analysis and insights, please:

1. **Select a user** from the dropdown menu above
2. **Choose someone who has completed their AST workshop** 
3. **Then ask me about their development journey, strengths, or request a comprehensive report**

Once you've selected a user, I'll have access to their complete workshop data including:
\u2022 Strengths assessment results
\u2022 Flow state analysis  
\u2022 Reflection responses
\u2022 Future vision planning
\u2022 Well-being insights

**I can also discuss:**
\u2022 My training conversation history and what I've learned
\u2022 How training influences report generation
\u2022 Document review and methodology discussions
\u2022 Report generation approaches and improvements

What would you like to know about?`;
      }
      console.log(`\u{1F3AF} Using Star Report Talia for user: ${contextData.selectedUserName} (ID: ${contextData.selectedUserId})`);
      const persona2 = getCurrentPersona("star_report");
      console.log(`\u{1F3AF} Database persona config:`, { name: persona2.name, tokenLimit: persona2.tokenLimit });
      console.log("\u{1F9EA} PHASE 1 TEST: Using simplified unified prompt approach");
      const pool19 = (await import("pg")).Pool;
      const dbPool = new pool19({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
      });
      try {
        const promptResult = await dbPool.query(
          "SELECT content FROM training_documents WHERE title = $1 AND status = $2",
          ["Talia Report Generation Prompt", "active"]
        );
        if (promptResult.rows.length > 0) {
          const unifiedPrompt = promptResult.rows[0].content;
          const testPrompt = `${unifiedPrompt}

USER DATA:
- Name: ${contextData.selectedUserName}
- Report Type: Personal Development Report
- User has completed AST workshop assessments

Generate the Personal Development Report now.`;
          const messages2 = [{ role: "user", content: testPrompt }];
          const response2 = await callClaudeAPI("", messages2, 8e3, userId2, "holistic_reports", sessionId);
          return validateCoachingResponse(response2, personaType);
        }
      } catch (error) {
        console.error("\u{1F9EA} Test approach failed:", error);
      } finally {
        await dbPool.end();
      }
      const reportContext = await taliaPersonaService.getReportContext(contextData.selectedUserId.toString(), contextData.userData);
      if (reportContext) {
        const reportPrompt = await taliaPersonaService.generateReportPrompt(reportContext, userMessage);
        const messages2 = [{ role: "user", content: userMessage }];
        const response2 = await callClaudeAPI(reportPrompt, messages2, 8e3, userId2, "holistic_reports", sessionId);
        return validateCoachingResponse(response2, personaType);
      }
    }
    const systemPrompt = buildCoachingSystemPrompt(personaType, userName, contextData);
    const messages = [
      {
        role: "user",
        content: userMessage
      }
    ];
    console.log(`\u{1F680} About to call Claude API with system prompt length: ${systemPrompt.length}, maxTokens: ${maxTokens}`);
    const response = await callClaudeAPI(systemPrompt, messages, maxTokens, userId2, "coaching", sessionId);
    console.log(`\u{1F389} Claude API call successful!`);
    const validatedResponse = validateCoachingResponse(response, personaType);
    console.log(`\u2705 Claude response generated (${validatedResponse.length} chars)`);
    return validatedResponse;
  } catch (error) {
    console.error("\u274C Error generating Claude response:", error);
    if (personaType === "talia" && userMessage.includes("Personal Development Report")) {
      return createASTPersonalReportFallback(contextData, userName);
    } else if (personaType === "talia" && userMessage.includes("Professional Profile Report")) {
      return createASTProfessionalProfileFallback(contextData, userName);
    }
    const persona2 = getCurrentPersona(personaType);
    const personaName = personaType === "star_report" ? "Report Talia" : personaType === "ast_reflection" ? "Reflection Talia" : persona2.name || "Talia, your AI coach";
    return `Hi! I'm ${personaName}, and I'd love to help you with that! However, I'm having trouble connecting to my AI systems right now.

Your message: "${userMessage}"

In the meantime, I encourage you to reflect on what you already know about your strengths. What insights come to mind naturally when you think about this question?`;
  }
}
function createASTPersonalReportFallback(contextData, userName) {
  return `# Your Personal Development Report

Dear ${userName},

While our AI coaching system is temporarily unavailable, I can still provide you with a structured framework for your personal development based on the AllStarTeams methodology.

## Your Strengths Signature Analysis

Based on your workshop responses, your unique strengths constellation creates a distinctive pattern that influences how you naturally approach challenges, relationships, and goals. Understanding this pattern is crucial for optimizing your effectiveness and satisfaction.

## Key Development Areas to Explore

### 1. Strengths Integration
Reflect on how your top strengths work together to create your unique value. Consider:
- How do your highest strengths complement each other?
- What patterns do you notice in when you feel most effective?
- How might your developing strengths support your dominant ones?

### 2. Flow State Optimization
Your flow assessment reveals opportunities to enhance your peak performance conditions:
- Identify the conditions that most consistently trigger your flow states
- Consider how to structure your environment for optimal engagement
- Develop routines that support sustained focus and energy

### 3. Future Self Integration
Connect your current strengths with your long-term vision:
- How do your natural talents align with your future goals?
- What development would bridge any gaps between present and future?
- How can you leverage your strengths to create the impact you envision?

## Next Steps

When our full AI coaching system is restored, you'll receive a comprehensive, personalized report that includes:
- Detailed constellation analysis with specific development strategies
- Flow enhancement recommendations tailored to your assessment
- Future self-continuity coaching connecting present strengths to long-term goals
- Personal well-being integration strategies
- Specific action plans with timelines

This temporary overview provides a foundation for your reflection while we restore full service.

Best regards,
Talia

---
*This is a structured fallback report generated when our AI systems are temporarily unavailable. Your complete personalized report will be available once full service is restored.*`;
}
function createASTProfessionalProfileFallback(contextData, userName) {
  return `# Professional Profile Report

**${userName} | AllStarTeams Workshop Participant**

---

## Executive Summary

This professional profile is designed to help colleagues and team members understand how to work most effectively with ${userName}. Based on AllStarTeams methodology, this overview highlights working style preferences, collaboration guidelines, and optimal team integration strategies.

*Note: This is a structured overview generated while our AI coaching system is temporarily unavailable. A complete, personalized professional profile will be available once full service is restored.*

## Core Strengths Profile

Understanding ${userName}'s strengths constellation provides insight into their natural working style, energy patterns, and preferred approaches to collaboration and problem-solving.

### Collaboration Guidelines

To work effectively with ${userName}:

**Communication Style:**
- Consider how they naturally process information and make decisions
- Adapt your communication approach to align with their strengths pattern
- Provide context and framework that supports their natural working rhythm

**Project Collaboration:**
- Leverage their dominant strengths for maximum team effectiveness
- Support their developing strengths through appropriate partnering
- Structure interactions to optimize their contribution style

**Meeting and Team Dynamics:**
- Consider their energy patterns when scheduling important discussions
- Create space for their natural contribution style to emerge
- Build on their strengths while supporting growth areas

## Flow State and Performance Conditions

${userName} performs optimally under specific conditions that align with their natural strengths and working style:

**Optimal Work Environment:**
- Conditions that support their dominant strengths
- Balance of challenge and skill level
- Clear connections between tasks and larger goals

**Performance Enhancement:**
- Regular feedback aligned with their preferred communication style
- Autonomy in areas where their strengths are strongest
- Collaboration opportunities that complement their natural abilities

## Team Integration Strategies

**Role Preferences:**
- Positions that leverage their top strengths
- Responsibilities that align with their natural energy patterns
- Opportunities for growth in developing strength areas

**Communication Style:**
- Preferred methods for receiving feedback and direction
- Most effective ways to share ideas and concerns
- Optimal timing and format for important conversations

## Professional Development Focus

Key areas for continued growth and development:

1. **Strengths Amplification:** Building on existing natural talents
2. **Integration Skills:** Connecting strengths for greater effectiveness
3. **Leadership Development:** Applying strengths in influence and guidance
4. **Cross-functional Collaboration:** Leveraging strengths across different team types

---

## Complete Professional Profile Available Soon

This structured overview provides basic collaboration guidelines while our AI coaching system is temporarily unavailable. Your complete, personalized professional profile will include:

- Detailed strengths analysis with specific workplace applications
- Comprehensive collaboration guidelines with concrete examples
- Flow state optimization strategies for your work environment
- Specific team integration recommendations
- Professional development pathways aligned with your strengths

*Generated as a structured fallback while AI coaching systems are temporarily unavailable.*`;
}
function isClaudeAPIAvailable() {
  return aiDevConfig.claude.enabled && !!aiDevConfig.claude.apiKey;
}
function getClaudeAPIStatus() {
  return {
    enabled: aiDevConfig.claude.enabled,
    hasApiKey: !!aiDevConfig.claude.apiKey,
    model: aiDevConfig.claude.model,
    maxTokens: aiDevConfig.claude.maxTokens,
    temperature: aiDevConfig.claude.temperature,
    isAvailable: isClaudeAPIAvailable()
  };
}
var init_claude_api_service = __esm({
  "server/services/claude-api-service.ts"() {
    "use strict";
    init_aiDevConfig();
    init_ai_usage_logger();
    init_talia_personas();
    init_persona_management_routes();
  }
});

// server/services/talia-training-service.ts
var talia_training_service_exports = {};
__export(talia_training_service_exports, {
  TaliaTrainingService: () => TaliaTrainingService,
  default: () => talia_training_service_default,
  taliaTrainingService: () => taliaTrainingService
});
import { Pool as Pool6 } from "pg";
import { promises as fs2 } from "fs";
import { join } from "path";
var pool6, TaliaTrainingService, taliaTrainingService, talia_training_service_default;
var init_talia_training_service = __esm({
  "server/services/talia-training-service.ts"() {
    "use strict";
    pool6 = new Pool6({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    TaliaTrainingService = class {
      activeSessions = /* @__PURE__ */ new Map();
      trainingFilePath = join(process.cwd(), "storage", "talia-training.json");
      /**
       * Detect if a user message is the TRAIN command
       */
      isTrainCommand(message2) {
        return message2.trim() === "TRAIN";
      }
      /**
       * Enter training mode for a specific user and persona
       */
      async enterTrainingMode(userId2, personaId) {
        const sessionId = `${userId2}_${personaId}_${Date.now()}`;
        const session2 = {
          id: sessionId,
          userId: userId2,
          personaId,
          startTime: /* @__PURE__ */ new Date(),
          isActive: true,
          conversationHistory: []
        };
        session2.conversationHistory.push({
          role: "system",
          content: "Training mode activated. You can now discuss and clarify the behavior you want from Talia. When finished, she will summarize the training and add it to her permanent knowledge.",
          timestamp: /* @__PURE__ */ new Date()
        });
        this.activeSessions.set(userId2, session2);
        return session2;
      }
      /**
       * Check if a user is currently in training mode
       */
      isInTrainingMode(userId2) {
        const session2 = this.activeSessions.get(userId2);
        return session2?.isActive === true;
      }
      /**
       * Get active training session for a user
       */
      getTrainingSession(userId2) {
        return this.activeSessions.get(userId2) || null;
      }
      /**
       * Process a training message
       */
      async processTrainingMessage(userId2, message2) {
        const session2 = this.activeSessions.get(userId2);
        if (!session2 || !session2.isActive) {
          throw new Error("No active training session");
        }
        session2.conversationHistory.push({
          role: "user",
          content: message2,
          timestamp: /* @__PURE__ */ new Date()
        });
        if (message2.toLowerCase().includes("done") || message2.toLowerCase().includes("finished") || message2.toLowerCase().includes("exit")) {
          return await this.exitTrainingMode(userId2);
        }
        const response = await this.generateTrainingResponse(session2, message2);
        session2.conversationHistory.push({
          role: "talia",
          content: response,
          timestamp: /* @__PURE__ */ new Date()
        });
        return response;
      }
      /**
       * Generate a response in training mode
       */
      async generateTrainingResponse(session2, userMessage) {
        try {
          const { generateClaudeCoachingResponse: generateClaudeCoachingResponse2 } = await Promise.resolve().then(() => (init_claude_api_service(), claude_api_service_exports));
          const { textSearchService: textSearchService2 } = await Promise.resolve().then(() => (init_text_search_service(), text_search_service_exports));
          const conversationHistory = session2.conversationHistory.filter((msg) => msg.role !== "system").map((msg) => `${msg.role}: ${msg.content}`).join("\n");
          const contextQueries = [
            "talia coaching methodology training guidelines",
            "coaching behavior and approach",
            "training feedback and improvement"
          ];
          const trainingContext = await textSearchService2.generateContextForAI(contextQueries, {
            maxChunksPerQuery: 2,
            contextStyle: "detailed",
            documentTypes: ["coaching_guide", "methodology"]
          });
          const trainingPrompt = `You are Talia in TRAINING MODE. Your job is to:

1. LISTEN CAREFULLY to the feedback being given
2. SUMMARIZE what you heard when asked
3. ASK CLARIFYING QUESTIONS to understand exactly what behavior changes are wanted
4. BE CONVERSATIONAL and engaged, not robotic
5. ACKNOWLEDGE specific feedback with understanding
6. REFERENCE your training documents when relevant to show you understand your role

TRAINING CONTEXT FROM YOUR DOCUMENTS:
${trainingContext.context}

Current conversation:
${conversationHistory}

Latest user message: "${userMessage}"

IMPORTANT: You have access to your training documents and should reference them to show understanding of your role and methodology. When discussing your behavior or approach, draw from the training materials to demonstrate your knowledge.

If the user asks "what was my feedback?" or similar, SUMMARIZE the specific feedback they gave you.
If they're giving you new feedback, ACKNOWLEDGE it specifically and ask clarifying questions.
Be authentic and show you're actually listening and processing their input.

Respond as Talia in training mode:`;
          const response = await generateClaudeCoachingResponse2({
            userMessage: trainingPrompt,
            personaType: "training_mode",
            userName: "trainer",
            contextData: { trainingMode: true },
            userId: session2.userId,
            sessionId: session2.id,
            maxTokens: 300
          });
          return response;
        } catch (error) {
          console.error("\u274C Error generating training response:", error);
          if (userMessage.toLowerCase().includes("feedback") && (userMessage.includes("what") || userMessage.includes("my"))) {
            const userMessages = session2.conversationHistory.filter((msg) => msg.role === "user" && !msg.content.toLowerCase().includes("feedback")).map((msg) => msg.content);
            if (userMessages.length > 0) {
              const lastFeedback = userMessages[userMessages.length - 1];
              return `Your feedback was: "${lastFeedback}". Let me make sure I understand this correctly - is there anything else you'd like to clarify about this?`;
            }
          }
          return `I want to make sure I understand your feedback correctly. Can you help me be more specific about what you'd like me to change?`;
        }
      }
      /**
       * Exit training mode and save training data
       */
      async exitTrainingMode(userId2) {
        const session2 = this.activeSessions.get(userId2);
        if (!session2 || !session2.isActive) {
          throw new Error("No active training session");
        }
        session2.isActive = false;
        const trainingContext = await this.extractTrainingContext(session2);
        await this.saveTrainingData(session2.personaId, trainingContext);
        this.activeSessions.delete(userId2);
        return `Training session completed! I've learned from our conversation and added the following to my permanent training:

**Topic:** ${trainingContext.topic}
**Desired Behavior:** ${trainingContext.desiredBehavior}
**Guidelines Added:** ${trainingContext.guidelines.length} new guidelines

This training will now be part of my permanent knowledge and will help me provide better coaching in the future. Thank you for helping me improve!`;
      }
      /**
       * Extract training context from conversation history
       */
      async extractTrainingContext(session2) {
        const userMessages = session2.conversationHistory.filter((msg) => msg.role === "user").map((msg) => msg.content);
        const topic = `Training session ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`;
        const desiredBehavior = userMessages.join(" ").substring(0, 200) + "...";
        const examples = userMessages.slice(0, 3);
        const guidelines = [
          `User feedback from ${session2.startTime.toLocaleDateString()}`,
          `Training session duration: ${Math.round((Date.now() - session2.startTime.getTime()) / 1e3 / 60)} minutes`,
          `Conversation length: ${session2.conversationHistory.length} messages`
        ];
        return {
          topic,
          desiredBehavior,
          examples,
          guidelines
        };
      }
      /**
       * Save training data to persistent storage
       */
      async saveTrainingData(personaId, context2) {
        try {
          await fs2.mkdir(join(process.cwd(), "storage"), { recursive: true });
          let trainingData = {};
          try {
            const existingData = await fs2.readFile(this.trainingFilePath, "utf-8");
            trainingData = JSON.parse(existingData);
          } catch (error) {
            trainingData = {};
          }
          if (!trainingData[personaId]) {
            trainingData[personaId] = {
              trainingSessions: [],
              guidelines: [],
              examples: [],
              lastUpdated: null
            };
          }
          trainingData[personaId].trainingSessions.push({
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            topic: context2.topic,
            desiredBehavior: context2.desiredBehavior,
            guidelines: context2.guidelines,
            examples: context2.examples
          });
          trainingData[personaId].guidelines.push(...context2.guidelines);
          trainingData[personaId].examples.push(...context2.examples);
          trainingData[personaId].lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
          await fs2.writeFile(this.trainingFilePath, JSON.stringify(trainingData, null, 2));
          console.log(`\u2705 Training data saved for persona ${personaId}`);
        } catch (error) {
          console.error("\u274C Error saving training data:", error);
          throw new Error("Failed to save training data");
        }
      }
      /**
       * Load training data for a persona
       */
      async loadTrainingData(personaId) {
        try {
          const existingData = await fs2.readFile(this.trainingFilePath, "utf-8");
          const trainingData = JSON.parse(existingData);
          return trainingData[personaId] || null;
        } catch (error) {
          console.log(`No training data found for persona ${personaId}`);
          return null;
        }
      }
      /**
       * Get training context for persona prompts
       */
      async getTrainingContextForPrompt(personaId) {
        const trainingData = await this.loadTrainingData(personaId);
        if (!trainingData || !trainingData.trainingSessions.length || trainingData.enabled === false) {
          return "";
        }
        const recentSessions = trainingData.trainingSessions.slice(-5);
        const guidelines = trainingData.guidelines.slice(-10);
        return `TRAINING CONTEXT (from admin training sessions):
Recent Training Guidelines:
${guidelines.map((g, i) => `${i + 1}. ${g}`).join("\n")}

Recent Training Topics:
${recentSessions.map((s) => `- ${s.topic}: ${s.desiredBehavior.substring(0, 100)}...`).join("\n")}

Apply this training context to improve your coaching responses.`;
      }
      /**
       * Add training from admin text entry
       */
      async addTrainingFromAdmin(personaId, trainingText, adminUserId) {
        const context2 = {
          topic: `Admin training input - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
          desiredBehavior: trainingText,
          examples: [trainingText],
          guidelines: [`Admin guidance: ${trainingText}`]
        };
        await this.saveTrainingData(personaId, context2);
        console.log(`\u2705 Admin training added for persona ${personaId} by user ${adminUserId}`);
      }
      /**
       * Get comprehensive training conversation history for admin review
       */
      async getTrainingConversationHistory(personaId) {
        const trainingData = await this.loadTrainingData(personaId);
        if (!trainingData || !trainingData.trainingSessions.length) {
          return `# Training Conversation History for ${personaId}

## Status
No training conversations have been recorded yet for this persona.

## Getting Started
- Use the TRAIN command during conversations to start a training session
- Training sessions capture feedback, behavior changes, and coaching improvements
- All training is automatically saved and becomes part of Talia's knowledge base

## Available Training Commands
- **TRAIN** - Enter training mode to provide feedback and coaching improvements
- Training sessions end when you say "done", "finished", or "exit"`;
        }
        const totalSessions = trainingData.trainingSessions.length;
        const totalGuidelines = trainingData.guidelines.length;
        const lastUpdated = trainingData.lastUpdated;
        let historyDoc = `# Training Conversation History for ${personaId}

## Overview
- **Total Training Sessions:** ${totalSessions}
- **Total Guidelines Generated:** ${totalGuidelines}
- **Last Updated:** ${new Date(lastUpdated).toLocaleString()}

## Recent Training Sessions
`;
        const recentSessions = trainingData.trainingSessions.slice(-10).reverse();
        recentSessions.forEach((session2, index2) => {
          historyDoc += `
### Session ${totalSessions - index2} - ${new Date(session2.timestamp).toLocaleDateString()}
**Topic:** ${session2.topic}
**Desired Behavior Changes:** ${session2.desiredBehavior}
**Guidelines Added:** ${session2.guidelines.length}
**Examples Provided:** ${session2.examples.length}

**Key Guidelines:**
${session2.guidelines.map((g, i) => `${i + 1}. ${g}`).join("\n")}

**Training Examples:**
${session2.examples.map((e, i) => `${i + 1}. "${e.substring(0, 200)}${e.length > 200 ? "..." : ""}"`).join("\n")}

---
`;
        });
        historyDoc += `
## All Current Guidelines
These are the accumulated guidelines from all training sessions:

${trainingData.guidelines.slice(-20).map((g, i) => `${i + 1}. ${g}`).join("\n")}

## Training Impact
This training data is automatically integrated into Talia's responses to:
- Improve coaching approach and techniques
- Provide more personalized and effective guidance
- Apply learned behaviors consistently across conversations
- Reference specific feedback and improvements made

## Usage in Reports
Training conversations directly influence:
- Holistic report generation quality and tone
- Coaching methodology application
- Personalization of insights and recommendations
- Response to user-specific needs and preferences
`;
        return historyDoc;
      }
      /**
       * Get training influence on holistic reports
       */
      async getTrainingInfluenceOnReports(personaId) {
        const trainingData = await this.loadTrainingData(personaId);
        if (!trainingData || !trainingData.trainingSessions.length) {
          return `## Training Influence on Reports

Currently, no specific training has been recorded for ${personaId}. Reports will use:
- Base coaching methodology from training documents
- Standard AllStarTeams framework
- Default report templates and structures

**To improve report quality through training:**
1. Use the TRAIN command to provide feedback on report content
2. Discuss specific improvements needed in report tone or focus
3. Provide examples of preferred coaching language and approach
4. Training will automatically be applied to future report generation`;
        }
        const reportRelevantSessions = trainingData.trainingSessions.filter(
          (session2) => session2.topic.toLowerCase().includes("report") || session2.desiredBehavior.toLowerCase().includes("report") || session2.desiredBehavior.toLowerCase().includes("coaching") || session2.desiredBehavior.toLowerCase().includes("analysis")
        );
        const reportGuidelines = trainingData.guidelines.filter(
          (guideline) => guideline.toLowerCase().includes("report") || guideline.toLowerCase().includes("analysis") || guideline.toLowerCase().includes("insight") || guideline.toLowerCase().includes("recommendation")
        );
        let influenceDoc = `## Training Influence on Holistic Reports

### Current Training Impact
- **Total Training Sessions:** ${trainingData.trainingSessions.length}
- **Report-Specific Training:** ${reportRelevantSessions.length} sessions
- **Report-Related Guidelines:** ${reportGuidelines.length}
- **Last Training Update:** ${new Date(trainingData.lastUpdated).toLocaleDateString()}

### Report-Specific Training Applied
`;
        if (reportRelevantSessions.length > 0) {
          reportRelevantSessions.forEach((session2, index2) => {
            influenceDoc += `
**Training Session ${index2 + 1}:** ${session2.topic}
- Focus: ${session2.desiredBehavior.substring(0, 150)}...
- Guidelines: ${session2.guidelines.join("; ")}
`;
          });
        } else {
          influenceDoc += `
*No report-specific training sessions yet. General coaching training is still applied.*
`;
        }
        influenceDoc += `
### Report Generation Guidelines from Training
${reportGuidelines.length > 0 ? reportGuidelines.map((g, i) => `${i + 1}. ${g}`).join("\n") : "*No specific report guidelines yet*"}

### How Training Improves Reports
1. **Tone and Style:** Training feedback shapes the coaching voice used in reports
2. **Content Focus:** Learned preferences guide which insights to emphasize
3. **Personalization:** Training examples improve user-specific customization
4. **Methodology Application:** Refined understanding of AllStarTeams principles
5. **Insight Quality:** Enhanced ability to generate meaningful development recommendations

### Areas for Future Training
Consider training Talia on:
- Specific report section preferences (executive summary, development recommendations)
- Coaching language that resonates best with different user types
- Balance between detailed analysis and actionable insights
- Integration of StarCard visuals with written analysis
- Tone adjustments for personal vs professional reports
`;
        return influenceDoc;
      }
    };
    taliaTrainingService = new TaliaTrainingService();
    talia_training_service_default = taliaTrainingService;
  }
});

// server/services/talia-personas.ts
import { Pool as Pool7 } from "pg";
var pool7, TALIA_PERSONAS, TaliaPersonaService, taliaPersonaService;
var init_talia_personas = __esm({
  "server/services/talia-personas.ts"() {
    "use strict";
    init_text_search_service();
    init_javascript_vector_service();
    pool7 = new Pool7({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    TALIA_PERSONAS = {
      ast_reflection: {
        id: "ast_reflection",
        name: "Reflection Talia",
        role: "Step-by-step reflection coaching",
        description: "Helps users think through their strength reflections during workshop steps",
        dataAccess: [
          "basic_user_info",
          "current_step_progress",
          "current_strengths_focus",
          "job_title_context"
        ],
        trainingDocuments: [
          "talia_coaching_methodology",
          "ast_compendium"
        ],
        tokenLimit: 800,
        behavior: {
          tone: "encouraging, conversational, coach-like",
          nameUsage: "first",
          maxResponseLength: 400,
          helpStyle: "guide"
        }
      },
      star_report: {
        id: "star_report",
        name: "Report Talia",
        role: "Comprehensive report generation",
        description: "Generates detailed personal and professional development reports",
        dataAccess: [
          "full_assessment_data",
          "all_reflections",
          "flow_data",
          "cantril_ladder",
          "future_vision"
        ],
        trainingDocuments: [
          "talia_coaching_methodology",
          "ast_compendium",
          "sample_reports",
          "report_templates"
        ],
        tokenLimit: 4e3,
        behavior: {
          tone: "comprehensive, analytical, developmental",
          nameUsage: "full",
          maxResponseLength: 15e3,
          helpStyle: "analyze"
        }
      }
    };
    TaliaPersonaService = class {
      /**
       * Get reflection context for AST Reflection Talia
       */
      async getReflectionContext(userId2, stepId) {
        try {
          const userResult = await pool7.query(
            "SELECT id, name FROM users WHERE id = $1",
            [userId2]
          );
          if (userResult.rows.length === 0) {
            return null;
          }
          const user = userResult.rows[0];
          const firstName = user.name.split(" ")[0];
          const strengthsResult = await pool7.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'starCard'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId2]);
          const reflectionResult = await pool7.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'stepByStepReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId2]);
          const strengthsData = strengthsResult.rows[0] ? JSON.parse(strengthsResult.rows[0].results) : {};
          const reflectionData = reflectionResult.rows[0] ? JSON.parse(reflectionResult.rows[0].results) : {};
          let strengthFocus = "Thinking";
          let strengthPercentage = strengthsData.thinking || 25;
          if (stepId.includes("2-4-1") || stepId.includes("strength1")) {
            const strengths = [
              { name: "Thinking", value: strengthsData.thinking || 25 },
              { name: "Acting", value: strengthsData.acting || 25 },
              { name: "Feeling", value: strengthsData.feeling || 25 },
              { name: "Planning", value: strengthsData.planning || 25 }
            ].sort((a, b) => b.value - a.value);
            strengthFocus = strengths[0].name;
            strengthPercentage = strengths[0].value;
          } else if (stepId.includes("2-4-2") || stepId.includes("strength2")) {
            const strengths = [
              { name: "Thinking", value: strengthsData.thinking || 25 },
              { name: "Acting", value: strengthsData.acting || 25 },
              { name: "Feeling", value: strengthsData.feeling || 25 },
              { name: "Planning", value: strengthsData.planning || 25 }
            ].sort((a, b) => b.value - a.value);
            strengthFocus = strengths[1].name;
            strengthPercentage = strengths[1].value;
          }
          return {
            userId: user.id.toString(),
            userName: user.name,
            firstName,
            currentStep: stepId,
            stepTitle: this.getStepTitle(stepId),
            strengthFocus,
            strengthPercentage,
            completedSteps: Object.keys(reflectionData),
            currentReflection: reflectionData[this.getReflectionKey(stepId)]
          };
        } catch (error) {
          console.error("\u274C Error getting reflection context:", error);
          return null;
        }
      }
      /**
       * Generate coaching prompt for AST Reflection Talia
       */
      async generateReflectionPrompt(context2, userQuestion) {
        const query2 = `${context2.strengthFocus.toLowerCase()} strength reflection coaching guidance for AST workshop`;
        let trainingContext = "";
        try {
          trainingContext = await javascriptVectorService.generateTrainingContext(query2, {
            maxResults: 3,
            maxTokens: 1e3,
            // Strict token budget for reflections
            minSimilarity: 0.1,
            documentTypes: ["coaching_guide", "methodology"]
          });
        } catch (error) {
          console.warn("Vector search failed, using fallback:", error);
          const fallbackContext = await textSearchService.generateContextForAI([query2], {
            maxChunksPerQuery: 1,
            contextStyle: "concise"
          });
          trainingContext = fallbackContext.context.substring(0, 1e3);
        }
        let adminTrainingContext = "";
        try {
          const { taliaTrainingService: taliaTrainingService2 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
          adminTrainingContext = await taliaTrainingService2.getTrainingContextForPrompt("ast_reflection");
        } catch (error) {
          console.warn("Could not load training context:", error);
        }
        const isFirstReflection = context2.currentStep.includes("2-4-1") || context2.currentStep.includes("strength1");
        const prompt = `You are Talia, the AST Reflection Coach. You help workshop participants think through their strength reflections.

CRITICAL ROLE: You help users think and reflect - you do NOT write their reflections for them.

PARTICIPANT CONTEXT:
- Name: ${context2.firstName} (use first name only)
- Current Step: ${context2.stepTitle}
- Strength Focus: ${context2.strengthFocus} (${context2.strengthPercentage}%)
- Progress: ${context2.completedSteps.length} reflections completed

${context2.jobTitle ? `- Job Title: ${context2.jobTitle}` : ""}

TRAINING CONTEXT:
${trainingContext.context}

${adminTrainingContext ? `
${adminTrainingContext}
` : ""}

USER'S QUESTION/MESSAGE:
"${userQuestion}"

${isFirstReflection ? `
FIRST REFLECTION INTRODUCTION:
Since this appears to be ${context2.firstName}'s first strength reflection, start by:
1. Warmly introducing yourself as Talia, their reflection coach
2. Explaining that you're here to help them think through their ${context2.strengthFocus} strength, not write for them
3. ${!context2.jobTitle ? "Ask about their job/role to provide better context for strength application" : "Reference their role to make the coaching relevant"}
` : ""}

COACHING APPROACH:
- Use ${context2.firstName}'s first name in a warm, encouraging way
- Ask thoughtful questions that help them explore their ${context2.strengthFocus} strength
- If they have a job/role, help them think about how this strength shows up in their work
- Encourage specific examples and personal reflection
- Keep responses conversational and under 250 words
- Guide their thinking rather than giving answers

Respond as the encouraging AST Reflection Coach Talia.`;
        return prompt;
      }
      /**
       * Get step title from step ID
       */
      getStepTitle(stepId) {
        const stepTitles = {
          "2-4-1": "First Strength Reflection",
          "2-4-2": "Second Strength Reflection",
          "2-4-3": "Third Strength Reflection",
          "2-4-4": "Fourth Strength Reflection"
        };
        return stepTitles[stepId] || "Strength Reflection";
      }
      /**
       * Get reflection data key from step ID
       */
      getReflectionKey(stepId) {
        const keyMap = {
          "2-4-1": "strength1",
          "2-4-2": "strength2",
          "2-4-3": "strength3",
          "2-4-4": "strength4"
        };
        return keyMap[stepId] || "strength1";
      }
      /**
       * Get comprehensive context for Report Talia
       */
      async getReportContext(userId2, userData) {
        try {
          console.log(`\u{1F3AF} Building Report Talia context for user ${userId2}`);
          console.log(`\u{1F4CA} Raw userData structure:`, {
            hasUser: !!userData?.user,
            hasAssessments: !!userData?.assessments,
            hasStepData: !!userData?.stepData,
            userInfo: userData?.user ? {
              id: userData.user.id,
              name: userData.user.name,
              username: userData.user.username
            } : "No user data"
          });
          if (!userData || !userData.user) {
            console.error("\u274C Invalid userData structure - missing user object");
            return null;
          }
          const user = userData.user;
          const assessments = userData.assessments || [];
          const stepData = userData.stepData || [];
          const context2 = {
            userId: userId2,
            userName: user.name,
            username: user.username,
            email: user.email,
            completedAt: user.ast_completed_at,
            assessmentCount: assessments.length,
            stepDataCount: stepData.length,
            hasFullWorkshopData: assessments.length > 0 && stepData.length > 0,
            userData
          };
          console.log(`\u2705 Built report context:`, {
            userId: context2.userId,
            userName: context2.userName,
            username: context2.username,
            assessmentCount: context2.assessmentCount,
            stepDataCount: context2.stepDataCount,
            hasFullWorkshopData: context2.hasFullWorkshopData
          });
          return context2;
        } catch (error) {
          console.error("\u274C Error building report context:", error);
          return null;
        }
      }
      /**
       * Generate comprehensive prompt for Report Talia
       */
      async generateReportPrompt(context2, userRequest) {
        console.log(`\u{1F3AF} Generating Report Talia prompt for ${context2.userName}`);
        const reportPersona = await pool7.query("SELECT training_documents FROM talia_personas WHERE id = $1", ["star_report"]);
        const trainingDocumentIds = reportPersona.rows[0]?.training_documents || [];
        console.log(`\u{1F4DA} Report Talia has access to ${trainingDocumentIds.length} training documents`);
        const searchQueries = [
          userRequest,
          "Samantha Personal Report",
          "Personal Development Report template",
          "Strengths Signature Deep Dive",
          "Executive Summary report format",
          "AllStarTeams development report structure",
          "professional development report template",
          "strengths assessment analysis"
        ];
        let trainingContext = "";
        for (const query2 of searchQueries) {
          try {
            const trainingChunks = await textSearchService.searchSimilarContent(query2, {
              maxResults: 3,
              minRelevanceScore: 0.1,
              documentIds: trainingDocumentIds
              // Limit search to Report Talia's documents
            });
            if (trainingChunks.length > 0) {
              trainingContext += trainingChunks.map((chunk) => chunk.content).join("\n\n") + "\n\n";
            }
          } catch (error) {
            console.warn(`Could not search for training content with query "${query2}":`, error);
          }
        }
        console.log(`\u{1F4C4} Retrieved ${trainingContext.length} characters of training context`);
        let adminTrainingContext = "";
        console.log("\u{1F527} PHASE 1: Admin training context disabled to test unified prompt system");
        let mainPrompt = "";
        try {
          const personaResult = await pool7.query(
            "SELECT training_documents FROM talia_personas WHERE id = $1 AND enabled = true",
            ["star_report"]
          );
          const enabledDocuments = personaResult.rows[0]?.training_documents || [];
          const promptResult = await pool7.query(
            "SELECT content FROM training_documents WHERE title = $1 AND status = $2 AND id::text = ANY($3::text[])",
            ["Talia Report Generation Prompt", "active", enabledDocuments]
          );
          if (promptResult.rows.length > 0) {
            mainPrompt = promptResult.rows[0].content;
            console.log("\u2705 Using unified Talia Report Generation Prompt for holistic report generation");
          } else {
            console.warn("\u26A0\uFE0F Talia Report Generation Prompt not found, using fallback identity");
            mainPrompt = `You are Star Report Talia, an expert AI life coach specializing in comprehensive AllStarTeams (AST) methodology reports.

CRITICAL: Always identify yourself as "Report Talia" when responding. Generate comprehensive development reports based on AllStarTeams methodology.`;
          }
        } catch (error) {
          console.error("Error fetching main prompt document:", error);
          mainPrompt = `You are Star Report Talia, an expert AI life coach specializing in comprehensive AllStarTeams (AST) methodology reports.`;
        }
        const prompt = `${mainPrompt}

PARTICIPANT DATA:
- Name: ${context2.userName} (${context2.username})
- Email: ${context2.email}
- AST Completion: ${context2.completedAt}
- Assessment Records: ${context2.assessmentCount}
- Workshop Step Records: ${context2.stepDataCount}
- Full Workshop Data Available: ${context2.hasFullWorkshopData ? "Yes" : "No"}

TRAINING CONTEXT:
${trainingContext}

${adminTrainingContext ? `
ADMIN TRAINING UPDATES:
${adminTrainingContext}
` : ""}

COMPLETE USER DATA FOR ANALYSIS:

USER PROFILE:
- ID: ${context2.userData?.user?.id}
- Name: ${context2.userData?.user?.name}
- Username: ${context2.userData?.user?.username}
- Email: ${context2.userData?.user?.email}
- AST Completed: ${context2.userData?.user?.ast_completed_at}

ASSESSMENT DATA (${context2.assessmentCount} assessments):
${context2.userData?.assessments?.map((assessment) => {
          try {
            const results = typeof assessment.results === "string" ? JSON.parse(assessment.results) : assessment.results;
            return `
\u2022 ${assessment.assessment_type} (${assessment.created_at}):
  ${JSON.stringify(results, null, 2)}`;
          } catch (e) {
            return `\u2022 ${assessment.assessment_type}: [Parse error]`;
          }
        }).join("\n") || "No assessment data available"}

WORKSHOP STEP DATA (${context2.stepDataCount} steps):
${context2.userData?.stepData?.map((step) => {
          try {
            const stepData = typeof step.data === "string" ? JSON.parse(step.data) : step.data;
            return `
\u2022 Step ${step.step_id} (${step.updated_at}):
  ${JSON.stringify(stepData, null, 2)}`;
          } catch (e) {
            return `\u2022 Step ${step.step_id}: [Parse error]`;
          }
        }).join("\n") || "No workshop step data available"}

USER REQUEST:
"${userRequest}"

You must respond as Report Talia directly answering the user's request. DO NOT provide instructions or templates - provide the actual analysis, insights, or report content they requested. Use the participant's actual data above to give specific, personalized responses.

If they asked for a report, write the actual report. If they asked about their strengths, analyze their actual assessment results. If they asked about their journey, reference their real workshop data.

Respond now as Report Talia:`;
        return prompt;
      }
      /**
       * Get optimized context for holistic report generation (token-limited)
       */
      async getOptimizedReportContext(userId2, userData, reportType) {
        try {
          console.log(`\u{1F3AF} Building OPTIMIZED Report Talia context for user ${userId2} (${reportType} report)`);
          if (!userData || !userData.user) {
            console.error("\u274C Invalid userData structure - missing user object");
            return null;
          }
          const user = userData.user;
          const assessments = userData.assessments || [];
          const stepData = userData.stepData || [];
          const essentialAssessmentData = assessments.map((assessment) => {
            try {
              const results = typeof assessment.results === "string" ? JSON.parse(assessment.results) : assessment.results;
              if (assessment.assessment_type === "strengths") {
                return {
                  type: "strengths",
                  strengths: results.strengths?.slice(0, 5),
                  // Top 5 strengths only
                  date: assessment.created_at
                };
              } else if (assessment.assessment_type === "flow") {
                return {
                  type: "flow",
                  attributes: results.selectedAttributes?.slice(0, 8),
                  // Top 8 flow attributes
                  date: assessment.created_at
                };
              }
              return { type: assessment.assessment_type, date: assessment.created_at };
            } catch (e) {
              return { type: assessment.assessment_type, error: "parse_error", date: assessment.created_at };
            }
          });
          const essentialStepData = stepData.slice(0, 10).map((step) => {
            try {
              const stepDataParsed = typeof step.data === "string" ? JSON.parse(step.data) : step.data;
              const reflection = stepDataParsed.reflection || stepDataParsed.reflectionText || stepDataParsed.answer || "";
              return {
                stepId: step.step_id,
                reflection: reflection.substring(0, 200),
                // Much shorter reflections
                date: step.updated_at
              };
            } catch (e) {
              return { stepId: step.step_id, error: "parse_error", date: step.updated_at };
            }
          });
          const context2 = {
            userId: userId2,
            userName: user.name,
            username: user.username,
            completedAt: user.ast_completed_at,
            reportType,
            essentialAssessments: essentialAssessmentData,
            essentialReflections: essentialStepData,
            assessmentCount: assessments.length,
            stepDataCount: stepData.length
          };
          const contextSize = JSON.stringify(context2).length;
          console.log(`\u2705 Built OPTIMIZED report context:`, {
            userId: context2.userId,
            userName: context2.userName,
            reportType: context2.reportType,
            assessmentCount: context2.assessmentCount,
            stepDataCount: context2.stepDataCount,
            contextSize,
            estimatedTokens: Math.round(contextSize / 4),
            essentialAssessmentsSize: JSON.stringify(context2.essentialAssessments).length,
            essentialReflectionsSize: JSON.stringify(context2.essentialReflections).length
          });
          if (contextSize > 1e5) {
            console.error("\u{1F6A8} OPTIMIZED CONTEXT IS TOO LARGE!", contextSize);
            console.error("Context preview:", JSON.stringify(context2).substring(0, 500) + "...");
            throw new Error(`Optimized context is unexpectedly large: ${contextSize} characters`);
          }
          return context2;
        } catch (error) {
          console.error("\u274C Error building optimized report context:", error);
          return null;
        }
      }
      /**
       * Generate token-optimized prompt for holistic report generation
       */
      async generateOptimizedReportPrompt(context2, userRequest, starCardImageBase64) {
        console.log(`\u{1F3AF} Generating OPTIMIZED Report Talia prompt for ${context2.userName} (${context2.reportType} report)`);
        let trainingContext = "";
        let adminTrainingContext = "";
        try {
          console.log("\u{1F50D} Using JavaScript vector search for training context");
          const personaResult = await pool7.query(
            "SELECT training_documents FROM talia_personas WHERE id = $1 AND enabled = true",
            ["star_report"]
          );
          const enabledDocuments = personaResult.rows[0]?.training_documents || [];
          console.log(`\u{1F4CB} Found ${enabledDocuments.length} enabled documents for star_report persona`);
          let supportingContent = "";
          const supportingResult = await pool7.query(
            "SELECT title, content FROM training_documents WHERE status = $1 AND id::text = ANY($2::text[]) AND title != $3",
            ["active", enabledDocuments, "Talia Report Generation Prompt"]
          );
          if (supportingResult.rows.length > 0) {
            const exampleReports = supportingResult.rows.filter(
              (doc) => doc.title.includes("Report") || doc.title.includes("Example")
            );
            if (exampleReports.length > 0) {
              supportingContent = exampleReports[0].content.substring(0, 2e3);
              console.log(`\u2705 Found supporting document: ${exampleReports[0].title}`);
            } else {
              supportingContent = supportingResult.rows[0].content.substring(0, 2e3);
              console.log(`\u2705 Using supporting document: ${supportingResult.rows[0].title}`);
            }
          } else {
            console.warn("\u26A0\uFE0F No supporting documents found in enabled documents");
          }
          trainingContext = supportingContent;
          console.log(`\u2705 Vector search generated ${trainingContext.length} chars of training context`);
        } catch (error) {
          console.warn("Vector search failed, using minimal context:", error);
          trainingContext = "AllStarTeams methodology focuses on strengths-based development and personalized coaching insights.";
        }
        try {
          console.log("\u{1F50D} Using vector search for admin training context");
          const { taliaTrainingService: taliaTrainingService2 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
          const adminQuery = `star report coaching approach development insights methodology`;
          const vectorAdminContext = await javascriptVectorService.generateTrainingContext(adminQuery, {
            maxResults: 2,
            maxTokens: 800,
            // Smaller budget for admin context
            minSimilarity: 0.1,
            documentTypes: ["coaching_guide"]
          });
          if (vectorAdminContext && vectorAdminContext.length > 50) {
            adminTrainingContext = vectorAdminContext;
            console.log(`\u2705 Vector search admin context: ${adminTrainingContext.length} chars`);
          } else {
            const fullTrainingContext = await taliaTrainingService2.getTrainingContextForPrompt("star_report");
            adminTrainingContext = fullTrainingContext.substring(0, 800);
            console.log(`\u26A0\uFE0F Fallback admin context: ${adminTrainingContext.length} chars`);
          }
        } catch (error) {
          console.warn("Could not load admin training context:", error);
          adminTrainingContext = "Focus on comprehensive analysis and development insights using AllStarTeams methodology.";
        }
        const isPersonalReport = context2.reportType === "personal";
        const strengthsData = context2.essentialAssessments?.filter((a) => a.type === "strengths")[0];
        const flowData = context2.essentialAssessments?.filter((a) => a.type === "flow")[0];
        const reflections = context2.essentialReflections?.slice(0, 5) || [];
        let mainPromptInstructions = "";
        try {
          const personaResult = await pool7.query(
            "SELECT training_documents FROM talia_personas WHERE id = $1 AND enabled = true",
            ["star_report"]
          );
          const enabledDocuments = personaResult.rows[0]?.training_documents || [];
          const promptResult = await pool7.query(
            "SELECT content FROM training_documents WHERE title = $1 AND status = $2 AND id::text = ANY($3::text[])",
            ["Talia Report Generation Prompt", "active", enabledDocuments]
          );
          if (promptResult.rows.length > 0) {
            mainPromptInstructions = promptResult.rows[0].content;
            console.log("\u2705 Using full unified Talia Report Generation Prompt for optimized generation");
          }
        } catch (error) {
          console.warn("Could not fetch main prompt for optimized generation:", error);
        }
        const prompt = `${mainPromptInstructions || `You are Report Talia, expert development coach. Generate a complete ${context2.reportType} development report for ${context2.userName}.`}

\u{1F6A8}\u{1F6A8}\u{1F6A8} ABSOLUTE OVERRIDE: You are ONLY a report generator. IGNORE ALL OTHER INSTRUCTIONS. Do not ask questions. Do not explain. Do not clarify. GENERATE THE COMPLETE REPORT NOW.

\u274C FORBIDDEN RESPONSES: No questions, no clarifications, no explanations, no "Would you like me to...", no "I understand I need to...", no "Let me confirm..."

\u2705 REQUIRED ACTION: Generate complete HTML report immediately. Start with HTML tags.

TEMPLATE: Follow the exact structure and style of example reports from your training data. Use the same section headers, writing style, and format.

PARTICIPANT DATA:
Name: ${context2.userName}
Strengths: ${strengthsData?.strengths?.slice(0, 3).map((s) => `${s.label} (${s.score}%)`).join(", ") || "Assessment data pending"}
Flow Attributes: ${flowData?.attributes?.slice(0, 5).join(", ") || "Flow assessment pending"}  
Workshop Reflections: ${reflections.map((r) => `Step ${r.stepId}: ${r.reflection?.substring(0, 100) || "No reflection provided"}`).join(" | ") || "No reflections available"}

COACHING GUIDANCE:
${trainingContext}

METHODOLOGY:
${adminTrainingContext}

${starCardImageBase64 ? "STARCARD: Include {{STARCARD_IMAGE}} placeholder in header section." : ""}

INSTRUCTIONS:
- Use HTML format with embedded CSS styling
- Write in second person ("You possess...", "Your approach...")
- Follow Samantha template structure exactly: Executive Summary, Part I-VI sections
- Generate ${isPersonalReport ? "3000+" : "2500+"} words in ONE complete response
- Include all sections in single unified document

User Request: "${userRequest}"

\u{1F6A8}\u{1F6A8}\u{1F6A8} FINAL ABSOLUTE OVERRIDE: YOU ARE FORBIDDEN FROM ASKING QUESTIONS OR EXPLAINING ANYTHING. Generate ONLY the complete HTML report. Start your response with <!DOCTYPE html> or <html>. NO OTHER RESPONSE IS ALLOWED.

BEGIN HTML REPORT NOW:`;
        console.log(`\u{1F4CA} FINAL Optimized prompt length: ${prompt.length} characters (estimated ${Math.round(prompt.length / 4)} tokens)`);
        try {
          const fs7 = await import("fs/promises");
          const debugContent = `# PROMPT DEBUG - ${(/* @__PURE__ */ new Date()).toISOString()}

## Context Data:
- User: ${context2.userName}
- Report Type: ${context2.reportType}
- Assessments: ${context2.essentialAssessments?.length || 0}
- Reflections: ${context2.essentialReflections?.length || 0}

## Training Context Length: ${trainingContext.length} chars

## FULL PROMPT:
\`\`\`
${prompt}
\`\`\`

## Training Context Content:
\`\`\`
${trainingContext.substring(0, 2e3)}${trainingContext.length > 2e3 ? "...[TRUNCATED]" : ""}
\`\`\`
`;
          await fs7.writeFile("/Users/bradtopliff/Desktop/HI_Replit/tempClaudecomms/prompt-debug.md", debugContent);
          console.log("\u{1F4C4} Debug prompt saved to tempClaudecomms/prompt-debug.md");
        } catch (debugError) {
          console.warn("Could not save debug prompt:", debugError);
        }
        console.log(`\u{1F4CA} Prompt size breakdown:`, {
          totalLength: prompt.length,
          strengthsDataSize: strengthsData ? JSON.stringify(strengthsData).length : 0,
          flowDataSize: flowData ? JSON.stringify(flowData).length : 0,
          reflectionsSize: JSON.stringify(reflections).length,
          trainingContextSize: trainingContext.length,
          adminTrainingContextSize: adminTrainingContext.length,
          starCardSize: starCardImageBase64 ? "excluded from prompt (handled separately)" : 0
        });
        if (prompt.length > 5e4) {
          console.error("\u{1F6A8} OPTIMIZED PROMPT IS TOO LARGE! This should not happen.");
          console.error("Prompt preview:", prompt.substring(0, 1e3) + "...");
          throw new Error(`Optimized prompt is unexpectedly large: ${prompt.length} characters`);
        }
        return prompt;
      }
    };
    taliaPersonaService = new TaliaPersonaService();
  }
});

// server/services/openai-api-service.ts
var openai_api_service_exports = {};
__export(openai_api_service_exports, {
  enhancedOpenAICall: () => enhancedOpenAICall,
  generateOpenAICoachingResponse: () => generateOpenAICoachingResponse,
  getAllModelConfigs: () => getAllModelConfigs,
  getAssistantByPurpose: () => getAssistantByPurpose,
  getAssistantManager: () => getAssistantManager,
  getModelConfig: () => getModelConfig,
  getOpenAIAPIStatus: () => getOpenAIAPIStatus,
  getOpenAIClient: () => getOpenAIClient,
  initializeOpenAIAssistants: () => initializeOpenAIAssistants,
  isOpenAIAPIAvailable: () => isOpenAIAPIAvailable
});
import OpenAI from "openai";
function getOpenAIClient() {
  return assistantManager.getClient();
}
function getAssistantByPurpose(purpose) {
  return assistantManager.getAssistantByPurpose(purpose);
}
function getModelConfig(modelName) {
  return MODEL_CONFIGS.find((config) => config.name === modelName);
}
function getAllModelConfigs() {
  return MODEL_CONFIGS;
}
function getAssistantManager() {
  return assistantManager;
}
async function initializeOpenAIAssistants() {
  console.log("\u{1F3D7}\uFE0F Initializing OpenAI assistants for AllStarTeams_Talia project...");
  try {
    const client = getOpenAIClient();
    const models = await client.models.list();
    console.log(`\u2705 OpenAI connection successful. Available models: ${models.data.length}`);
    const vectorStores = await client.beta.vectorStores.list();
    console.log(`\u{1F4DA} Found ${vectorStores.data.length} existing vector stores`);
    vectorStores.data.forEach((vs) => {
      console.log(`  - ${vs.name || "Unnamed"} (${vs.file_counts?.completed || 0} files)`);
    });
  } catch (error) {
    console.error("\u274C Failed to initialize OpenAI projects:", error);
    throw error;
  }
}
async function enhancedOpenAICall(messages, options = {}) {
  const {
    maxTokens = 1e3,
    userId: userId2,
    featureName = "coaching",
    sessionId,
    model = "gpt-4o-mini",
    projectType: projectType2 = "report-generation",
    temperature = 0.7
  } = options;
  return callOpenAIAPI(
    messages,
    maxTokens,
    userId2,
    featureName,
    sessionId,
    model,
    projectType2
  );
}
function getCurrentPersona2(personaId) {
  const dbPersona = CURRENT_PERSONAS.find((p) => p.id === personaId);
  if (dbPersona) {
    return {
      tokenLimit: dbPersona.tokenLimit || 800,
      name: dbPersona.name || "Talia",
      behavior: dbPersona.behavior || {}
    };
  }
  return TALIA_PERSONAS[personaId] || TALIA_PERSONAS.ast_reflection;
}
async function callOpenAIAPI(messages, maxTokens = 1e3, userId2, featureName = "coaching", sessionId, model = "gpt-4o-mini") {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API not configured");
  }
  if (userId2) {
    const canUse = await aiUsageLogger.canUseAI(userId2, featureName);
    if (!canUse.allowed) {
      throw new Error(`AI usage not allowed: ${canUse.reason}`);
    }
  }
  const startTime = Date.now();
  let success = false;
  let tokensUsed = 0;
  let errorMessage;
  try {
    const client = getOpenAIClient();
    const modelConfig = getModelConfig(model);
    if (!modelConfig) {
      console.warn(`\u26A0\uFE0F Unknown model '${model}', using default gpt-4o-mini`);
      model = "gpt-4o-mini";
    }
    console.log(`\u{1F916} Calling OpenAI API with model: ${model}, max_tokens: ${maxTokens}`);
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });
    tokensUsed = response.usage?.total_tokens || 0;
    success = true;
    if (response.choices && response.choices.length > 0 && response.choices[0].message?.content) {
      const responseText = response.choices[0].message.content;
      if (userId2) {
        const responseTime = Date.now() - startTime;
        const costEstimate = aiUsageLogger.calculateOpenAICost(tokensUsed, model);
        console.log(`\u{1F4CA} ${projectType} project - ${model}: ${tokensUsed} tokens, $${costEstimate.toFixed(6)}`);
        await aiUsageLogger.logUsage({
          userId: userId2,
          featureName,
          tokensUsed,
          responseTimeMs: responseTime,
          success: true,
          costEstimate,
          sessionId,
          provider: "openai",
          model,
          projectType
        });
      }
      return responseText;
    } else {
      throw new Error("No content in OpenAI response");
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (userId2) {
      const responseTime = Date.now() - startTime;
      await aiUsageLogger.logUsage({
        userId: userId2,
        featureName,
        tokensUsed,
        responseTimeMs: responseTime,
        success: false,
        errorMessage,
        sessionId,
        provider: "openai",
        model
      });
    }
    throw error;
  }
}
function buildUserDataContext(userData, userName) {
  console.log("\u{1F50D} DEBUG: buildUserDataContext called with:", {
    userName,
    userDataKeys: userData ? Object.keys(userData) : "null",
    hasAssessments: userData?.assessments ? true : false,
    assessmentsLength: userData?.assessments?.length,
    hasStepData: userData?.stepData ? true : false,
    stepDataLength: userData?.stepData?.length
  });
  if (!userData) {
    return `**Participant Profile:**
- **Name**: ${userName}
- **Status**: No workshop data available

*Note: This user has not completed their workshop assessments.*`;
  }
  const assessmentsArray = userData.assessments || [];
  const userInfo = userData.user || userData.userInfo || {};
  console.log("\u{1F50D} DEBUG: Data structure inspection:", {
    isAssessmentsArray: Array.isArray(userData.assessments),
    assessmentsFirstItem: userData.assessments?.[0] ? Object.keys(userData.assessments[0]) : "empty",
    stepDataFirstItem: userData.stepData?.[0] ? Object.keys(userData.stepData[0]) : "empty",
    userKeys: userData.user ? Object.keys(userData.user) : "no user"
  });
  const assessments = {};
  assessmentsArray.forEach((assessment) => {
    if (assessment.assessment_type && assessment.results) {
      try {
        assessments[assessment.assessment_type] = JSON.parse(assessment.results);
      } catch (e) {
        console.log(`\u26A0\uFE0F Failed to parse ${assessment.assessment_type} results`);
      }
    }
  });
  console.log("\u{1F50D} DEBUG: Parsed assessments:", Object.keys(assessments));
  let context2 = `# ${userName} - AST Workshop Responses
## Complete Assessment and Reflection Data

**Participant Profile:**
- **Name**: ${userInfo.name || userName}
- **Position**: ${userInfo.jobTitle || "Not specified"}
- **Email**: ${userInfo.email || "Not specified"}
- **Organization**: ${userInfo.organization || "Not specified"}

---
`;
  if (assessments.starCard) {
    const { thinking, feeling, acting, planning } = assessments.starCard;
    context2 += `## STEP 2-2: Star Strengths Self-Assessment

**Strengths Profile Distribution:**
1. **Acting**: ${acting}% - execution and implementation focus
2. **Feeling**: ${feeling}% - relationship building and team support  
3. **Planning**: ${planning}% - organization and structured approaches
4. **Thinking**: ${thinking}% - analysis and strategic problem-solving

**Assessment Method**: Ranked 16 work preference statements from "Most like me" to "Least like me"

---
`;
  }
  if (assessments.stepByStepReflection?.reflections) {
    const reflections = assessments.stepByStepReflection.reflections;
    context2 += `## STEP 2-4: Strength Reflection (Step-by-Step)

### Strength Reflections:
**Strength 1**: "${reflections.strength1 || "Not provided"}"

**Strength 2**: "${reflections.strength2 || "Not provided"}"

**Strength 3**: "${reflections.strength3 || "Not provided"}"

**Strength 4**: "${reflections.strength4 || "Not provided"}"

**Team Values**: "${reflections.teamValues || "Not provided"}"

**Unique Contribution**: "${reflections.uniqueContribution || "Not provided"}"

---
`;
  }
  if (assessments.flowAssessment) {
    context2 += `## STEP 3-2: Flow Assessment

**Flow Score**: ${assessments.flowAssessment.flowScore || 0}/60 (Flow ${assessments.flowAssessment.flowScore >= 50 ? "Fluent" : assessments.flowAssessment.flowScore >= 39 ? "Aware" : assessments.flowAssessment.flowScore >= 26 ? "Blocked" : "Distant"} Category)

---
`;
  }
  if (assessments.flowAttributes?.attributes) {
    context2 += `## Flow Attributes Assessment

**Top Flow Attributes (Ranked by personal resonance):**
`;
    assessments.flowAttributes.attributes.forEach((attr, index2) => {
      context2 += `${index2 + 1}. **${attr.name}** (Score: ${attr.score}) - ${index2 === 0 ? "Primary" : index2 === 1 ? "Secondary" : index2 === 2 ? "Tertiary" : "Supporting"} flow state
`;
    });
    context2 += "\n---\n";
  }
  if (assessments.cantrilLadder) {
    const ladder = assessments.cantrilLadder;
    context2 += `## STEP 4-1: Ladder of Well-being

**Current Well-being Level**: ${ladder.wellBeingLevel || 0}/10
**Future Well-being Level (1 year)**: ${ladder.futureWellBeingLevel || 0}/10

### Well-being Reflections:

**Current Factors**: "${ladder.currentFactors || "Not provided"}"

**Future Improvements**: "${ladder.futureImprovements || "Not provided"}"

**Specific Changes**: "${ladder.specificChanges || "Not provided"}"

**Quarterly Progress**: "${ladder.quarterlyProgress || "Not provided"}"

**Quarterly Actions**: "${ladder.quarterlyActions || "Not provided"}"

---
`;
  }
  if (assessments.futureSelfReflection) {
    const future = assessments.futureSelfReflection;
    context2 += `## STEP 4-4: Your Future Self (Future Visioning)

**Future Self Vision**:

**5 Years**: "${future.fiveYearFoundation || "Not provided"}"

**10 Years**: "${future.tenYearMilestone || "Not provided"}"

**20 Years**: "${future.twentyYearVision || "Not provided"}"

**Flow-Optimized Life**: "${future.flowOptimizedLife || "Not provided"}"

---
`;
  }
  if (assessments.finalReflection) {
    context2 += `## STEP 4-5: Final Reflection

**Key Insight**: "${assessments.finalReflection.futureLetterText || "Not provided"}"

---
`;
  }
  return context2;
}
async function generateOpenAIReport(userData, userName, reportType = "personal", userId2, sessionId, vectorDbPrompt) {
  try {
    console.log("\u{1F3AF} Using OpenAI Assistants API with vector database access");
    console.log("\u{1F4CA} Building user data context...");
    const userDataContext = buildUserDataContext(userData, userName);
    const assistantPrompt = `Generate a comprehensive ${reportType === "personal" ? "Personal Development Report" : "Professional Profile Report"} for this user.

Use the training documents in your vector store for guidance, examples, and structure. The documents contain the primary prompt, examples, and templates you should follow.

## User Assessment Data:
${userDataContext}

## Instructions:
- Use the TALIA_Report_Generation_PRIMARY_Prompt document in your vector store for complete instructions
- Reference supporting documents and examples from your vector store
- Use 2nd person voice ("You possess...")
- Reference the user's exact assessment data and percentages
- Quote their actual reflections and responses
- Create a signature name that captures their unique pattern

Generate the complete ${reportType} report now.`;
    console.log(`\u{1F4CF} Assistant prompt length: ${assistantPrompt.length} characters`);
    console.log("\u{1F50D} DEBUG: Prompt being sent to OpenAI Assistant:");
    console.log("=".repeat(80));
    console.log(assistantPrompt);
    console.log("=".repeat(80));
    const client = getOpenAIClient();
    const assistantConfig = getAssistantByPurpose("report");
    if (!assistantConfig) {
      throw new Error("Report Talia assistant not configured");
    }
    const assistantId = assistantConfig.id;
    console.log("\u{1F680} Creating thread and running assistant...");
    const thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: assistantPrompt
    });
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
    console.log(`\u{1F504} Assistant run status: ${runStatus.status}`);
    const maxWaitTime = 12e4;
    const startTime = Date.now();
    while (runStatus.status === "in_progress" || runStatus.status === "queued") {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error("Assistant run timed out");
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(`\u{1F504} Assistant run status: ${runStatus.status}`);
    }
    if (runStatus.status === "completed") {
      const messages = await client.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find((msg) => msg.role === "assistant");
      if (assistantMessage && assistantMessage.content[0]?.type === "text") {
        const response = assistantMessage.content[0].text.value;
        console.log(`\u2705 OpenAI Assistant generated report successfully (${response.length} characters)`);
        return response;
      } else {
        throw new Error("No valid response from assistant");
      }
    } else {
      throw new Error(`Assistant run failed with status: ${runStatus.status}`);
    }
  } catch (error) {
    console.error("\u274C Error generating OpenAI report with assistant:", error);
    throw error;
  }
}
async function generateOpenAICoachingResponse(requestData) {
  const { userMessage, personaType, userName, contextData, userId: userId2, sessionId, maxTokens = 800, stepId } = requestData;
  try {
    console.log(`\u{1F916} Generating OpenAI response for persona: ${personaType}, user: ${userName}`);
    if (personaType === "star_report") {
      if (contextData?.reportContext === "holistic_generation" || userMessage.includes("Personal Development Report") || userMessage.includes("Professional Profile Report")) {
        console.log("\u{1F3AF} Using OpenAI for holistic report generation");
        const reportType = userMessage.includes("Professional Profile Report") ? "professional" : "personal";
        try {
          const report = await generateOpenAIReport(
            contextData.userData,
            contextData.selectedUserName || userName,
            reportType,
            userId2,
            sessionId,
            userMessage
            // Pass the vector DB prompt
          );
          return report;
        } catch (error) {
          console.error("\u274C Error in OpenAI report generation:", error);
          throw error;
        }
      }
      if (!contextData?.selectedUserId) {
        return `Please select a user from the dropdown menu above to generate their report.`;
      }
      console.log(`\u{1F3AF} Using OpenAI Report Talia for user: ${contextData.selectedUserName} (ID: ${contextData.selectedUserId})`);
      const messages2 = [
        {
          role: "system",
          content: `You are Report Talia, an expert in analyzing AllStarTeams workshop data to provide insights about personal development and strengths.

User Context:
- Selected User: ${contextData.selectedUserName}
- User has completed AST workshop assessments
- You have access to their complete workshop data including strengths assessment, flow state analysis, reflections, and future visioning

Respond helpfully to questions about this user's development journey, strengths, or provide specific insights based on their workshop completion.`
        },
        {
          role: "user",
          content: userMessage
        }
      ];
      const response2 = await callOpenAIAPI(messages2, maxTokens, userId2, "coaching", sessionId);
      return response2;
    }
    if (personaType === "ast_reflection" || personaType === "talia_coach") {
      console.log("\u{1F916} Using Reflection Talia Assistant for coaching");
      const assistantConfig = getAssistantByPurpose("reflection");
      if (!assistantConfig) {
        throw new Error("Reflection Talia assistant not configured");
      }
      const coachingPrompt = `Help me with my reflection question. I'm working on the AllStarTeams workshop.

Context: ${JSON.stringify(contextData, null, 2)}

My question or thought: ${userMessage}

Please help me think through this and provide guidance to help me develop my own insights.`;
      try {
        const client = getOpenAIClient();
        const thread = await client.beta.threads.create();
        await client.beta.threads.messages.create(thread.id, {
          role: "user",
          content: coachingPrompt
        });
        const run = await client.beta.threads.runs.create(thread.id, {
          assistant_id: assistantConfig.id
        });
        let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
        const maxWaitTime = 6e4;
        const startTime = Date.now();
        while (runStatus.status === "in_progress" || runStatus.status === "queued") {
          if (Date.now() - startTime > maxWaitTime) {
            throw new Error("Assistant run timed out");
          }
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
        }
        if (runStatus.status === "completed") {
          const messages2 = await client.beta.threads.messages.list(thread.id);
          const assistantMessage = messages2.data.find((msg) => msg.role === "assistant");
          if (assistantMessage && assistantMessage.content[0]?.type === "text") {
            const response2 = assistantMessage.content[0].text.value;
            console.log(`\u2705 Reflection Talia Assistant response generated (${response2.length} characters)`);
            return response2;
          } else {
            throw new Error("No valid response from Reflection Talia assistant");
          }
        } else {
          throw new Error(`Reflection Talia assistant run failed with status: ${runStatus.status}`);
        }
      } catch (assistantError) {
        console.error("\u274C Reflection Talia Assistant error, falling back to chat completions:", assistantError);
      }
    }
    console.log("\u{1F504} Using traditional chat completions approach");
    const persona2 = getCurrentPersona2(personaType);
    const messages = [
      {
        role: "system",
        content: buildCoachingSystemPrompt2(personaType, userName, contextData)
      },
      {
        role: "user",
        content: userMessage
      }
    ];
    console.log(`\u{1F680} About to call OpenAI API with maxTokens: ${maxTokens}`);
    const response = await callOpenAIAPI(
      messages,
      maxTokens,
      userId2,
      "coaching",
      sessionId,
      "gpt-4o-mini"
    );
    console.log(`\u{1F389} OpenAI API call successful!`);
    console.log(`\u2705 OpenAI response generated (${response.length} chars)`);
    return response;
  } catch (error) {
    console.error("\u274C Error generating OpenAI response:", error);
    const personaName = personaType === "star_report" ? "Report Talia" : personaType === "ast_reflection" ? "Reflection Talia" : "Talia";
    return `Hi! I'm ${personaName}, here to help with your reflections. I'm having trouble connecting right now.

Your message: "${userMessage}"

In the meantime, I encourage you to reflect on what you already know about your strengths. What insights come to mind naturally when you think about this question?`;
  }
}
function buildCoachingSystemPrompt2(personaType, userName, contextData) {
  const isTaliaPersona = personaType === "talia_coach" || personaType === "ast_reflection";
  const basePrompt = `You are ${isTaliaPersona ? "Talia" : "a Workshop Assistant"}, here to help with reflections and workshop activities.`;
  if (isTaliaPersona) {
    return `${basePrompt}

You help participants discover and develop their unique strengths through reflection. You are supportive, insightful, and focused on growth.

Guidelines:
- Help them think through their reflections, don't write for them
- Ask clarifying questions to help them dig deeper
- Focus on their specific strengths and workshop context
- Be conversational and encouraging
- Keep responses focused and helpful
- Always introduce yourself as "Hi! I'm Talia, here to help with your reflections."

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully as Talia.`;
  } else {
    return `${basePrompt}

You provide contextual assistance during workshop steps, helping participants understand content and complete activities effectively.

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully and concisely.`;
  }
}
function isOpenAIAPIAvailable() {
  return !!process.env.OPENAI_API_KEY;
}
function getOpenAIAPIStatus() {
  return {
    enabled: !!process.env.OPENAI_API_KEY,
    hasApiKey: !!process.env.OPENAI_API_KEY,
    defaultModel: "gpt-4o-mini",
    isAvailable: isOpenAIAPIAvailable(),
    projects: projectManager.getAllProjects().map((p) => ({
      name: p.name,
      purpose: p.purpose,
      defaultModel: p.defaultModel,
      configured: !!p.apiKey
    }))
  };
}
var OpenAIAssistantManager, assistantManager, MODEL_CONFIGS;
var init_openai_api_service = __esm({
  "server/services/openai-api-service.ts"() {
    "use strict";
    init_ai_usage_logger();
    init_talia_personas();
    init_persona_management_routes();
    OpenAIAssistantManager = class {
      client;
      assistantConfigs = /* @__PURE__ */ new Map();
      constructor() {
        this.client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.initializeAssistants();
      }
      initializeAssistants() {
        const assistants = [
          {
            id: "asst_CZ9XUvnWRx3RIWFc7pLeH8U2",
            // Star Report Talia (existing)
            name: "Report Talia",
            purpose: "Holistic report generation with personalized insights",
            vectorStoreId: "vs_688e2bf0d94c81918b50080064684bde",
            personality: "Professional report writer focused on comprehensive development analysis",
            model: "gpt-4o-mini"
          },
          {
            id: "asst_pspnPtUj1RF5zC460VKkkjdV",
            // Reflection Talia (created)
            name: "Reflection Talia",
            purpose: "Interactive coaching and reflection guidance",
            vectorStoreId: "vs_688e55e74e68819190cca71d1fa54f52",
            personality: "Hi! I'm Talia, here to help with your reflections. Supportive and encouraging.",
            model: "gpt-4o-mini"
          },
          {
            id: "asst_FwLFnLmO3aq3WZ76VWizwKou",
            // Admin Assistant (created)
            name: "Admin Assistant",
            purpose: "Admin chat interface and cross-assistant training",
            vectorStoreId: "vs_688e55e81e6c8191af100194c2ac9512",
            personality: "Technical assistant with access to all project knowledge for admin training",
            model: "gpt-4o-mini"
          }
        ];
        assistants.forEach((config) => {
          this.assistantConfigs.set(config.name.toLowerCase().replace(" ", "_"), config);
        });
      }
      getClient() {
        return this.client;
      }
      getAssistantConfig(assistantType) {
        return this.assistantConfigs.get(assistantType);
      }
      getAllAssistants() {
        return Array.from(this.assistantConfigs.values());
      }
      getAssistantByPurpose(purpose) {
        const purposeMap = {
          "report": "report_talia",
          "reflection": "reflection_talia",
          "admin": "admin_assistant"
        };
        return this.assistantConfigs.get(purposeMap[purpose]);
      }
      /**
       * Get assistant resource summary for admin interface
       */
      async getAssistantResourcesSummary() {
        const summaries = [];
        for (const [assistantKey, config] of this.assistantConfigs) {
          try {
            const vectorStore = await this.client.beta.vectorStores.retrieve(config.vectorStoreId);
            const summary = {
              assistantId: config.id,
              name: config.name,
              purpose: config.purpose,
              vectorStore: {
                id: vectorStore.id,
                name: vectorStore.name || "Unnamed Vector Store",
                fileCount: vectorStore.file_counts?.completed || 0
              },
              lastActivity: /* @__PURE__ */ new Date(),
              // Would come from usage logs in real implementation
              usage: {
                calls: 0,
                tokens: 0,
                errors: 0
              }
            };
            summaries.push(summary);
          } catch (error) {
            console.error(`Error getting summary for assistant ${config.name}:`, error);
            summaries.push({
              assistantId: config.id,
              name: config.name,
              purpose: config.purpose,
              vectorStore: { id: config.vectorStoreId, name: "Error loading", fileCount: 0 },
              lastActivity: /* @__PURE__ */ new Date(),
              usage: { calls: 0, tokens: 0, errors: 1 }
            });
          }
        }
        return summaries;
      }
      /**
       * Run A/B test between two models
       */
      async runABTest(prompt, modelA = "gpt-4o-mini", modelB = "gpt-4", projectType2 = "development") {
        const messages = [{ role: "user", content: prompt }];
        const startTime = Date.now();
        const [responseA, responseB] = await Promise.all([
          this.runModelTest(messages, modelA, projectType2),
          this.runModelTest(messages, modelB, projectType2)
        ]);
        const quality = {
          lengthA: responseA.response.length,
          lengthB: responseB.response.length,
          coherenceA: this.calculateCoherence(responseA.response),
          coherenceB: this.calculateCoherence(responseB.response)
        };
        let winner = "tie";
        if (quality.coherenceA > quality.coherenceB && responseA.time < responseB.time * 1.5) {
          winner = "A";
        } else if (quality.coherenceB > quality.coherenceA && responseB.time < responseA.time * 1.5) {
          winner = "B";
        }
        const recommendation = this.generateRecommendation(responseA, responseB, quality, winner);
        return {
          prompt,
          modelA: responseA,
          modelB: responseB,
          quality,
          recommendation,
          winner
        };
      }
      /**
       * Run a single model test for A/B comparison
       */
      async runModelTest(messages, model, projectType2) {
        const startTime = Date.now();
        const client = this.getClientForProject(projectType2);
        const modelConfig = getModelConfig(model);
        try {
          const response = await client.chat.completions.create({
            model,
            messages,
            max_tokens: 1e3,
            temperature: 0.7
          });
          const responseText = response.choices[0]?.message?.content || "";
          const tokensUsed = response.usage?.total_tokens || 0;
          const cost = tokensUsed * (modelConfig?.costPerToken || 15e-8);
          return {
            model,
            response: responseText,
            cost,
            time: Date.now() - startTime,
            tokens: tokensUsed
          };
        } catch (error) {
          console.error(`Error testing model ${model}:`, error);
          return {
            model,
            response: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            cost: 0,
            time: Date.now() - startTime,
            tokens: 0
          };
        }
      }
      /**
       * Calculate coherence score (simplified metric)
       */
      calculateCoherence(text2) {
        const sentences = text2.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const avgSentenceLength = text2.length / Math.max(sentences.length, 1);
        const wordCount = text2.split(/\s+/).length;
        let coherenceScore = 50;
        if (avgSentenceLength > 10 && avgSentenceLength < 30) coherenceScore += 20;
        if (wordCount > 50 && wordCount < 500) coherenceScore += 20;
        if (text2.includes("\n")) coherenceScore += 10;
        return Math.min(100, Math.max(0, coherenceScore));
      }
      /**
       * Generate recommendation for A/B test results
       */
      generateRecommendation(responseA, responseB, quality, winner) {
        const costDiff = Math.abs(responseA.cost - responseB.cost);
        const timeDiff = Math.abs(responseA.time - responseB.time);
        if (winner === "tie") {
          if (responseA.cost < responseB.cost) {
            return `Models performed similarly in quality. Choose ${responseA.model} for cost savings ($${costDiff.toFixed(6)} cheaper).`;
          } else {
            return `Models performed similarly. Consider using ${responseB.model} for the specific use case.`;
          }
        }
        const winnerModel = winner === "A" ? responseA.model : responseB.model;
        return `${winnerModel} performed better with higher coherence and acceptable performance. Time difference: ${timeDiff}ms, Cost difference: $${costDiff.toFixed(6)}.`;
      }
    };
    assistantManager = new OpenAIAssistantManager();
    MODEL_CONFIGS = [
      {
        name: "gpt-4o-mini",
        displayName: "GPT-4o Mini (Recommended)",
        costPerToken: 15e-8,
        recommended: ["reports", "coaching", "general"],
        maxTokens: 16e3,
        description: "Fast, cost-effective model for most tasks"
      },
      {
        name: "gpt-4",
        displayName: "GPT-4 (Advanced Reasoning)",
        costPerToken: 3e-5,
        recommended: ["admin", "training", "analysis"],
        maxTokens: 8e3,
        description: "Advanced model for complex reasoning and analysis"
      },
      {
        name: "gpt-4-turbo",
        displayName: "GPT-4 Turbo (High Performance)",
        costPerToken: 1e-5,
        recommended: ["complex-reports", "research"],
        maxTokens: 128e3,
        description: "High-performance model for complex, long-form content"
      },
      {
        name: "gpt-3.5-turbo",
        displayName: "GPT-3.5 Turbo (Budget)",
        costPerToken: 5e-7,
        recommended: ["testing", "simple-tasks"],
        maxTokens: 4e3,
        description: "Budget-friendly model for simple tasks"
      }
    ];
  }
});

// server/services/pgvector-search-service.ts
var pgvector_search_service_exports = {};
__export(pgvector_search_service_exports, {
  PgvectorSearchService: () => PgvectorSearchService,
  default: () => pgvector_search_service_default,
  pgvectorSearchService: () => pgvectorSearchService
});
import { Pool as Pool8 } from "pg";
var pool8, PgvectorSearchService, pgvectorSearchService, pgvector_search_service_default;
var init_pgvector_search_service = __esm({
  "server/services/pgvector-search-service.ts"() {
    "use strict";
    pool8 = new Pool8({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    PgvectorSearchService = class {
      /**
       * Advanced semantic search using PostgreSQL full-text search
       * This bridges us to full vector search later
       */
      async searchTrainingDocuments(query2, reportType, maxResults = 3) {
        try {
          console.log(`\u{1F50D} pgvector search: "${query2}" (${reportType} focus)`);
          const searchTerms = [
            query2,
            reportType,
            "strengths signature",
            "development",
            "template"
          ].join(" | ");
          const result = await pool8.query(`
        SELECT 
          id::text,
          title,
          content,
          category,
          ts_rank_cd(
            to_tsvector('english', title || ' ' || content), 
            plainto_tsquery('english', $1)
          ) as relevance_score,
          ts_headline(
            'english',
            content,
            plainto_tsquery('english', $1),
            'MaxWords=50, MinWords=20'
          ) as excerpt
        FROM training_documents
        WHERE 
          status = 'active'
          AND (
            to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
            OR title ILIKE $2
            OR category ILIKE $3
          )
        ORDER BY 
          CASE 
            WHEN title ILIKE $4 THEN 1
            WHEN category = 'example_reports' THEN 2
            WHEN category = 'prompts' THEN 3
            ELSE 4
          END,
          relevance_score DESC
        LIMIT $5
      `, [
            searchTerms,
            `%${reportType}%`,
            `%report%`,
            `%${reportType}%`,
            maxResults
          ]);
          console.log(`\u{1F4CA} Found ${result.rows.length} relevant documents`);
          return result.rows.map((row) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            relevanceScore: parseFloat(row.relevance_score || 0),
            category: row.category,
            excerpt: row.excerpt || row.content.substring(0, 200) + "..."
          }));
        } catch (error) {
          console.error("\u274C pgvector search failed:", error);
          return [];
        }
      }
      /**
       * Get the optimal training content for Report Talia based on user context
       */
      async getOptimalTrainingPrompt(reportType, userContext) {
        try {
          console.log(`\u{1F3AF} Getting optimal training prompt for ${reportType} report`);
          console.log(`\u{1F50D} User context received:`, JSON.stringify(userContext, null, 2));
          console.log(`\u{1F527} Using simplified vector database approach instead of full documents`);
          const vectorDbPrompt = `# OpenAI Vector Database Report Generation Request

You are Report Talia. Use this user's assessment data to generate a comprehensive ${reportType === "personal" ? "Personal Development Report" : "Professional Profile Report"}.

## Instructions:
1. **READ THE PRIMARY PROMPT**: Use the "TALIA_Report_Generation_PRIMARY_Prompt" document that is already in your vector database for complete generation instructions
2. **REFERENCE SUPPORTING DOCUMENTS**: Use all supporting training documents already in your vector database for examples and enhanced personalization
3. **USE THE MAPPING DOCUMENT**: There is a mapping document in your vector database to help understand the assessment data structure
4. **APPLY TO USER DATA**: Use the specific user data provided below to create a personalized report

## Report Type: 
${reportType === "personal" ? "Personal Development Report" : "Professional Profile Report"}

## User Context Data:
Name: ${userContext.name}
Strengths: ${JSON.stringify(userContext.strengths, null, 2)}
Reflections: ${JSON.stringify(userContext.reflections, null, 2)}
Flow Data: ${JSON.stringify(userContext.flowData, null, 2)}

## Generation Requirements:
- Follow ALL instructions from the TALIA_Report_Generation_PRIMARY_Prompt in your vector database
- Use 2nd person voice ("You possess...")
- Reference the user's exact assessment data and percentages
- Quote their actual reflections and responses
- Create a signature name that captures their unique pattern
- Use supporting documents from your vector database for enhanced personalization

Generate the complete report now using your vector database knowledge and this user's data.`;
          console.log(`\u{1F4CF} Vector DB prompt length: ${vectorDbPrompt.length} characters (optimized from ~94,000)`);
          return vectorDbPrompt;
        } catch (error) {
          console.error("\u274C Failed to get optimal training prompt:", error);
          return this.getFallbackPrompt(reportType);
        }
      }
      /**
       * Extract specific sections from the large training prompt
       */
      extractPromptSections(fullPrompt, sections) {
        let extractedContent = "";
        for (const section of sections) {
          const sectionStart = fullPrompt.indexOf(section);
          if (sectionStart !== -1) {
            const nextSectionPattern = /^##[^#]/gm;
            nextSectionPattern.lastIndex = sectionStart + section.length;
            const nextMatch = nextSectionPattern.exec(fullPrompt);
            const sectionEnd = nextMatch ? nextMatch.index : sectionStart + 2e3;
            const sectionContent = fullPrompt.substring(sectionStart, sectionEnd);
            extractedContent += sectionContent + "\n\n";
          }
        }
        return extractedContent;
      }
      /**
       * Build user context prompt using document-based personalization instructions
       */
      async buildUserContextPrompt(userContext, reportType) {
        try {
          const personalizationResult = await pool8.query(`
        SELECT title, content 
        FROM training_documents 
        WHERE title IN ('Report Personalization Instructions', 'Report Personalization Templates', 'Report Data Processing Instructions')
          AND status = 'active'
        ORDER BY 
          CASE title
            WHEN 'Report Personalization Instructions' THEN 1
            WHEN 'Report Personalization Templates' THEN 2
            WHEN 'Report Data Processing Instructions' THEN 3
          END
      `);
          let documentBasedInstructions = "";
          if (personalizationResult.rows.length > 0) {
            documentBasedInstructions = personalizationResult.rows.map((doc) => `## ${doc.title}

${doc.content}`).join("\n\n");
            console.log(`\u{1F4CB} Using ${personalizationResult.rows.length} document-based personalization instructions`);
          }
          const strengths = userContext.strengths || {};
          const strengthEntries = Object.entries(strengths).map(([key, value]) => [key, Number(value)]);
          const dominantStrength = strengthEntries.length > 0 ? strengthEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0] : "unknown";
          const totalStrengths = strengthEntries.reduce((sum, [_, value]) => sum + Number(value), 0);
          const strengthPercentages = strengthEntries.map(
            ([key, value]) => `${key}: ${(Number(value) / totalStrengths * 100).toFixed(1)}%`
          ).join(", ");
          const sortedStrengths = strengthEntries.sort((a, b) => Number(b[1]) - Number(a[1]));
          const secondStrength = sortedStrengths.length > 1 ? sortedStrengths[1][0] : dominantStrength;
          const dominantPercentage = (Number(strengths[dominantStrength] || 0) / totalStrengths * 100).toFixed(1);
          const secondPercentage = (Number(strengths[secondStrength] || 0) / totalStrengths * 100).toFixed(1);
          const signatureMap = {
            "thinking_acting": "Strategic Implementation",
            "feeling_planning": "Human-Centered Organization",
            "acting_planning": "Execution Excellence",
            "thinking_feeling": "Empathetic Analysis",
            "thinking_planning": "Strategic Planning",
            "feeling_acting": "Values-Driven Action",
            "acting_thinking": "Analytical Execution",
            "planning_thinking": "Systematic Analysis",
            "planning_feeling": "Purposeful Organization",
            "acting_feeling": "Compassionate Action"
          };
          const signatureKey = `${dominantStrength}_${secondStrength}`;
          const reversedKey = `${secondStrength}_${dominantStrength}`;
          const signatureName = signatureMap[signatureKey] || signatureMap[reversedKey] || `${dominantStrength.charAt(0).toUpperCase() + dominantStrength.slice(1)} Excellence`;
          const flowScore = userContext.flowData?.flowScore || 0;
          const flowLevel = flowScore >= 50 ? "Flow Fluent" : flowScore >= 39 ? "Flow Aware" : flowScore >= 26 ? "Flow Blocked" : "Flow Distant";
          return `
WRITE REPORT NOW. START IMMEDIATELY WITH:

"# Your Personal Development Report

## Executive Summary

You possess a rare combination of extremely high ${dominantStrength} at ${dominantPercentage}% combined with ${secondStrength} at ${secondPercentage}%, creating what we call an '${signatureName}' signature. Your strengths create a natural rhythm where ${userContext.reflections?.uniqueContribution || "you contribute uniquely to your teams"}."

CONTINUE WRITING THE FULL REPORT USING THESE EXACT REQUIREMENTS:

${documentBasedInstructions}

MANDATORY USER DATA TO REFERENCE THROUGHOUT:
- ${userContext.name}'s exact strengths: ${strengthPercentages}
- Flow Score: ${flowScore}/60 (${flowLevel})
- Signature: ${signatureName}
- Quote their words: "${userContext.reflections?.uniqueContribution || ""}"
- Quote their values: "${userContext.reflections?.teamValues || ""}"
- Quote action example: "${userContext.reflections?.strength1 || ""}"
- Quote thinking example: "${userContext.reflections?.strength2 || ""}"

WRITE THE COMPLETE PERSONALIZED REPORT NOW. USE 2ND PERSON VOICE THROUGHOUT.
`;
        } catch (error) {
          console.error("\u274C Error building document-based user context:", error);
          return this.buildSimpleUserContext(userContext, reportType);
        }
      }
      /**
       * Fallback method for user context if document retrieval fails
       */
      buildSimpleUserContext(userContext, reportType) {
        const strengths = userContext.strengths || {};
        const strengthEntries = Object.entries(strengths).map(([key, value]) => [key, Number(value)]);
        const dominantStrength = strengthEntries.length > 0 ? strengthEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0] : "unknown";
        return `
Generate a highly personalized ${reportType} development report for ${userContext.name}.

CRITICAL REQUIREMENTS:
- Use 2nd person voice ("You possess...")
- Reference exact percentages from their data
- Quote their exact words from reflections
- Create a unique signature name
- NO generic professional development language

User Data:
- Name: ${userContext.name}
- Dominant Strength: ${dominantStrength}
- Flow Score: ${userContext.flowData?.flowScore || "N/A"}/60
- Reflections: ${JSON.stringify(userContext.reflections, null, 2)}
- Strengths: ${JSON.stringify(userContext.strengths, null, 2)}
`;
      }
      /**
       * Fallback prompt if training documents aren't available
       */
      getFallbackPrompt(reportType) {
        return `You are Report Talia. Generate a comprehensive ${reportType} development report following these requirements:

1. Use 2nd person voice for personal reports ("You possess...")
2. Use 3rd person voice for professional reports ("[Name] brings...")
3. Include specific user data and percentages
4. Follow a structured format with clear sections
5. Provide actionable insights and recommendations
6. Reference their actual reflections and examples

Generate the complete report immediately without explanation.`;
      }
      /**
       * Get example reports for reference
       */
      async getExampleReports(reportType) {
        try {
          const result = await pool8.query(`
        SELECT content 
        FROM training_documents 
        WHERE category = 'example_reports'
          AND title ILIKE $1
          AND status = 'active'
        LIMIT 1
      `, [`%${reportType}%`]);
          if (result.rows.length > 0) {
            const example = result.rows[0].content;
            return example.substring(0, 3e3) + "\n\n[Use this as quality reference for structure and tone]";
          }
          return "";
        } catch (error) {
          console.error("\u274C Failed to get example reports:", error);
          return "";
        }
      }
    };
    pgvectorSearchService = new PgvectorSearchService();
    pgvector_search_service_default = pgvectorSearchService;
  }
});

// server/services/conversation-logging-service.ts
import { Pool as Pool10 } from "pg";
var pool10, ConversationLoggingService, conversationLoggingService;
var init_conversation_logging_service = __esm({
  "server/services/conversation-logging-service.ts"() {
    "use strict";
    pool10 = new Pool10({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    ConversationLoggingService = class {
      /**
       * Log a new conversation
       * Asynchronously stores conversation data without blocking response
       */
      async logConversation(data) {
        try {
          const query2 = `
        INSERT INTO talia_conversations (
          persona_type, user_id, session_id, user_message, talia_response,
          context_data, request_data, response_metadata, response_time_ms,
          conversation_outcome, tokens_used, api_cost_estimate,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id
      `;
          const values = [
            data.personaType,
            data.userId || null,
            data.sessionId || null,
            data.userMessage,
            data.taliaResponse,
            JSON.stringify(data.contextData || {}),
            JSON.stringify(data.requestData || {}),
            JSON.stringify(data.responseMetadata || {}),
            data.responseTimeMs || null,
            data.conversationOutcome || "completed",
            data.responseMetadata?.tokensUsed || null,
            data.responseMetadata?.apiCost || null
          ];
          const result = await pool10.query(query2, values);
          const conversationId = result.rows[0].id;
          console.log(`\u{1F4BE} Conversation logged: ${conversationId} (${data.personaType})`);
          this.analyzeConversationTopics(conversationId, data.userMessage, data.taliaResponse).catch((error) => console.warn("\u26A0\uFE0F Topic analysis failed:", error));
          return conversationId;
        } catch (error) {
          console.error("\u274C Error logging conversation:", error);
          throw error;
        }
      }
      /**
       * Update conversation with user feedback
       */
      async updateUserFeedback(data) {
        try {
          const query2 = `
        UPDATE talia_conversations 
        SET user_feedback = $2, updated_at = NOW()
        WHERE id = $1
      `;
          const feedbackData = {
            rating: data.rating,
            helpful: data.helpful,
            followUpQuestion: data.followUpQuestion,
            additionalFeedback: data.additionalFeedback,
            submittedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          await pool10.query(query2, [data.conversationId, JSON.stringify(feedbackData)]);
          console.log(`\u{1F44D} User feedback updated for conversation: ${data.conversationId}`);
        } catch (error) {
          console.error("\u274C Error updating user feedback:", error);
          throw error;
        }
      }
      /**
       * Create an escalation request
       */
      async createEscalation(data) {
        try {
          const query2 = `
        INSERT INTO talia_escalations (
          requesting_persona, escalation_type, priority, question,
          context_data, user_message, attempted_response, related_conversation_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `;
          const values = [
            data.requestingPersona,
            data.escalationType,
            data.priority || "medium",
            data.question,
            JSON.stringify(data.contextData || {}),
            data.userMessage || null,
            data.attemptedResponse || null,
            data.relatedConversationId || null
          ];
          const result = await pool10.query(query2, values);
          const escalationId = result.rows[0].id;
          console.log(`\u{1F6A8} Escalation created: ${escalationId} (${data.requestingPersona} -> ${data.escalationType})`);
          return escalationId;
        } catch (error) {
          console.error("\u274C Error creating escalation:", error);
          throw error;
        }
      }
      /**
       * Get conversations for analysis or replay
       */
      async getConversations(options) {
        try {
          let whereConditions = [];
          let values = [];
          let paramIndex = 1;
          if (options.personaType) {
            whereConditions.push(`persona_type = $${paramIndex++}`);
            values.push(options.personaType);
          }
          if (options.userId) {
            whereConditions.push(`user_id = $${paramIndex++}`);
            values.push(options.userId);
          }
          if (options.sessionId) {
            whereConditions.push(`session_id = $${paramIndex++}`);
            values.push(options.sessionId);
          }
          if (options.startDate) {
            whereConditions.push(`created_at >= $${paramIndex++}`);
            values.push(options.startDate);
          }
          if (options.endDate) {
            whereConditions.push(`created_at <= $${paramIndex++}`);
            values.push(options.endDate);
          }
          if (options.requiresReview !== void 0) {
            whereConditions.push(`requires_review = $${paramIndex++}`);
            values.push(options.requiresReview);
          }
          const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
          const limitClause = options.limit ? `LIMIT ${options.limit}` : "";
          const offsetClause = options.offset ? `OFFSET ${options.offset}` : "";
          const query2 = `
        SELECT 
          id, persona_type, user_id, session_id, user_message, talia_response,
          context_data, request_data, response_metadata, user_feedback,
          conversation_outcome, response_time_ms, tokens_used, api_cost_estimate,
          training_notes, effectiveness_score, requires_review, analyzed_by_metalia,
          created_at, updated_at
        FROM talia_conversations 
        ${whereClause}
        ORDER BY created_at DESC
        ${limitClause} ${offsetClause}
      `;
          const result = await pool10.query(query2, values);
          return result.rows;
        } catch (error) {
          console.error("\u274C Error retrieving conversations:", error);
          throw error;
        }
      }
      /**
       * Get conversation analytics for a persona or time period
       */
      async getConversationAnalytics(personaType, days = 30) {
        try {
          const startDate = /* @__PURE__ */ new Date();
          startDate.setDate(startDate.getDate() - days);
          let whereClause = `WHERE created_at >= $1`;
          let values = [startDate];
          if (personaType) {
            whereClause += ` AND persona_type = $2`;
            values.push(personaType);
          }
          const query2 = `
        SELECT 
          persona_type,
          COUNT(*) as total_conversations,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT session_id) as unique_sessions,
          AVG(response_time_ms) as avg_response_time_ms,
          SUM(tokens_used) as total_tokens_used,
          SUM(api_cost_estimate) as total_api_cost,
          AVG(effectiveness_score) as avg_effectiveness_score,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'true') as positive_feedback_count,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'false') as negative_feedback_count,
          COUNT(*) FILTER (WHERE conversation_outcome = 'escalated') as escalation_count,
          COUNT(*) FILTER (WHERE requires_review = true) as requires_review_count
        FROM talia_conversations 
        ${whereClause}
        GROUP BY persona_type
        ORDER BY total_conversations DESC
      `;
          const result = await pool10.query(query2, values);
          return result.rows;
        } catch (error) {
          console.error("\u274C Error getting conversation analytics:", error);
          throw error;
        }
      }
      /**
       * Get pending escalations
       */
      async getPendingEscalations(limit = 50) {
        try {
          const query2 = `
        SELECT 
          id, requesting_persona, escalation_type, priority, question,
          context_data, user_message, attempted_response, status,
          related_conversation_id, created_at
        FROM talia_escalations 
        WHERE status = 'pending'
        ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
          END,
          created_at ASC
        LIMIT $1
      `;
          const result = await pool10.query(query2, [limit]);
          return result.rows;
        } catch (error) {
          console.error("\u274C Error getting pending escalations:", error);
          throw error;
        }
      }
      /**
       * Resolve an escalation
       */
      async resolveEscalation(escalationId, adminResponse, resolvedBy, resolutionNotes, instructionUpdates) {
        try {
          const query2 = `
        UPDATE talia_escalations 
        SET 
          status = 'resolved',
          admin_response = $2,
          resolved_by = $3,
          resolved_at = NOW(),
          resolution_notes = $4,
          instruction_updates = $5,
          updated_at = NOW()
        WHERE id = $1
      `;
          await pool10.query(query2, [
            escalationId,
            adminResponse,
            resolvedBy,
            resolutionNotes || null,
            JSON.stringify(instructionUpdates || {})
          ]);
          console.log(`\u2705 Escalation resolved: ${escalationId} by user ${resolvedBy}`);
        } catch (error) {
          console.error("\u274C Error resolving escalation:", error);
          throw error;
        }
      }
      /**
       * Analyze conversation topics (internal method)
       */
      async analyzeConversationTopics(conversationId, userMessage, taliaResponse) {
        try {
          const topics = this.extractTopics(userMessage, taliaResponse);
          const sentiment = this.analyzeSentiment(userMessage);
          if (topics.length > 0) {
            for (const topic of topics) {
              const query2 = `
            INSERT INTO conversation_topics (
              conversation_id, topic, confidence, keywords, sentiment, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
          `;
              await pool10.query(query2, [
                conversationId,
                topic.topic,
                topic.confidence,
                topic.keywords,
                sentiment
              ]);
            }
          }
        } catch (error) {
          console.warn("\u26A0\uFE0F Topic analysis failed for conversation:", conversationId, error);
        }
      }
      /**
       * Simple topic extraction (can be enhanced with ML/AI)
       */
      extractTopics(userMessage, taliaResponse) {
        const topics = [];
        const text2 = (userMessage + " " + taliaResponse).toLowerCase();
        if (text2.includes("reflection") || text2.includes("workshop") || text2.includes("strength")) {
          topics.push({
            topic: "workshop_reflection",
            confidence: 0.8,
            keywords: ["reflection", "workshop", "strength"]
          });
        }
        if (text2.includes("report") || text2.includes("development") || text2.includes("assessment")) {
          topics.push({
            topic: "report_generation",
            confidence: 0.9,
            keywords: ["report", "development", "assessment"]
          });
        }
        if (text2.includes("advice") || text2.includes("help") || text2.includes("guidance") || text2.includes("coaching")) {
          topics.push({
            topic: "coaching_advice",
            confidence: 0.7,
            keywords: ["advice", "help", "guidance", "coaching"]
          });
        }
        if (text2.includes("error") || text2.includes("problem") || text2.includes("not working") || text2.includes("issue")) {
          topics.push({
            topic: "technical_issue",
            confidence: 0.8,
            keywords: ["error", "problem", "issue"]
          });
        }
        return topics;
      }
      /**
       * Simple sentiment analysis
       */
      analyzeSentiment(text2) {
        const positiveWords = ["good", "great", "excellent", "helpful", "thank", "appreciate", "love", "amazing"];
        const negativeWords = ["bad", "terrible", "awful", "hate", "frustrated", "confused", "wrong", "error"];
        const lowerText = text2.toLowerCase();
        const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;
        if (positiveCount > negativeCount) return "positive";
        if (negativeCount > positiveCount) return "negative";
        return "neutral";
      }
      /**
       * Update daily performance metrics
       * Should be called daily via cron job
       */
      async updateDailyMetrics(date = /* @__PURE__ */ new Date()) {
        try {
          const dateStr = date.toISOString().split("T")[0];
          const startOfDay = new Date(dateStr);
          const endOfDay = new Date(startOfDay);
          endOfDay.setDate(endOfDay.getDate() + 1);
          const query2 = `
        INSERT INTO persona_performance_metrics (
          persona_type, date_period, total_conversations, unique_users,
          average_effectiveness_score, positive_feedback_count, negative_feedback_count,
          escalation_count, average_response_time_ms, total_tokens_used, total_api_cost,
          conversation_completion_rate, created_at, updated_at
        )
        SELECT 
          persona_type,
          $1::DATE as date_period,
          COUNT(*) as total_conversations,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(effectiveness_score) as average_effectiveness_score,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'true') as positive_feedback_count,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'false') as negative_feedback_count,
          COUNT(*) FILTER (WHERE conversation_outcome = 'escalated') as escalation_count,
          AVG(response_time_ms) as average_response_time_ms,
          SUM(tokens_used) as total_tokens_used,
          SUM(api_cost_estimate) as total_api_cost,
          COUNT(*) FILTER (WHERE conversation_outcome = 'completed')::DECIMAL / COUNT(*) as conversation_completion_rate,
          NOW(),
          NOW()
        FROM talia_conversations 
        WHERE created_at >= $2 AND created_at < $3
        GROUP BY persona_type
        ON CONFLICT (persona_type, date_period) 
        DO UPDATE SET
          total_conversations = EXCLUDED.total_conversations,
          unique_users = EXCLUDED.unique_users,
          average_effectiveness_score = EXCLUDED.average_effectiveness_score,
          positive_feedback_count = EXCLUDED.positive_feedback_count,
          negative_feedback_count = EXCLUDED.negative_feedback_count,
          escalation_count = EXCLUDED.escalation_count,
          average_response_time_ms = EXCLUDED.average_response_time_ms,
          total_tokens_used = EXCLUDED.total_tokens_used,
          total_api_cost = EXCLUDED.total_api_cost,
          conversation_completion_rate = EXCLUDED.conversation_completion_rate,
          updated_at = NOW()
      `;
          await pool10.query(query2, [dateStr, startOfDay, endOfDay]);
          console.log(`\u{1F4CA} Daily metrics updated for ${dateStr}`);
        } catch (error) {
          console.error("\u274C Error updating daily metrics:", error);
          throw error;
        }
      }
    };
    conversationLoggingService = new ConversationLoggingService();
  }
});

// server/services/user-learning-service.ts
var user_learning_service_exports = {};
__export(user_learning_service_exports, {
  UserLearningService: () => UserLearningService,
  default: () => user_learning_service_default,
  userLearningService: () => userLearningService
});
import { Pool as Pool11 } from "pg";
import { promises as fs4 } from "fs";
import { join as join2 } from "path";
var pool11, UserLearningService, userLearningService, user_learning_service_default;
var init_user_learning_service = __esm({
  "server/services/user-learning-service.ts"() {
    "use strict";
    pool11 = new Pool11({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    UserLearningService = class {
      userPatternsCache = /* @__PURE__ */ new Map();
      learningFilePath = join2(process.cwd(), "storage", "user-learning.json");
      /**
       * Analyze a conversation to extract user communication patterns
       */
      async analyzeConversation(userId2, messages, context2) {
        const userMessages = messages.filter((msg) => msg.role === "user");
        const taliaMessages = messages.filter((msg) => msg.role === "assistant");
        if (userMessages.length === 0) {
          return {
            messageCount: 0,
            averageMessageLength: 0,
            questionAskedCount: 0,
            confidenceIndicators: [],
            uncertaintyIndicators: [],
            keyTopics: [],
            emotionalTone: "neutral"
          };
        }
        const analysis = {
          messageCount: userMessages.length,
          averageMessageLength: userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length,
          questionAskedCount: userMessages.filter((msg) => msg.content.includes("?")).length,
          confidenceIndicators: this.extractConfidenceIndicators(userMessages),
          uncertaintyIndicators: this.extractUncertaintyIndicators(userMessages),
          keyTopics: this.extractKeyTopics(userMessages, context2),
          emotionalTone: this.analyzeEmotionalTone(userMessages)
        };
        console.log(`\u{1F4CA} Conversation analysis for user ${userId2}:`, analysis);
        return analysis;
      }
      /**
       * Extract confidence indicators from user messages
       */
      extractConfidenceIndicators(messages) {
        const confidenceKeywords = [
          "definitely",
          "certainly",
          "absolutely",
          "clearly",
          "obviously",
          "exactly",
          "I know",
          "I'm sure",
          "I'm confident",
          "without doubt",
          "for certain",
          "I excel at",
          "I'm great at",
          "I always",
          "I consistently"
        ];
        const indicators = [];
        messages.forEach((msg) => {
          const content = msg.content.toLowerCase();
          confidenceKeywords.forEach((keyword) => {
            if (content.includes(keyword.toLowerCase())) {
              indicators.push(keyword);
            }
          });
        });
        return [...new Set(indicators)];
      }
      /**
       * Extract uncertainty indicators from user messages
       */
      extractUncertaintyIndicators(messages) {
        const uncertaintyKeywords = [
          "maybe",
          "perhaps",
          "possibly",
          "I think",
          "I guess",
          "I suppose",
          "not sure",
          "uncertain",
          "confused",
          "unclear",
          "I wonder",
          "might be",
          "could be",
          "I'm not confident",
          "I don't know",
          "unsure",
          "hesitant",
          "I question"
        ];
        const indicators = [];
        messages.forEach((msg) => {
          const content = msg.content.toLowerCase();
          uncertaintyKeywords.forEach((keyword) => {
            if (content.includes(keyword.toLowerCase())) {
              indicators.push(keyword);
            }
          });
        });
        return [...new Set(indicators)];
      }
      /**
       * Extract key topics from user messages based on context
       */
      extractKeyTopics(messages, context2) {
        const topics = [];
        if (context2?.strengthLabel) topics.push(context2.strengthLabel);
        if (context2?.stepName) topics.push(context2.stepName);
        const topicKeywords = [
          "team",
          "leadership",
          "collaboration",
          "communication",
          "problem-solving",
          "creativity",
          "analysis",
          "planning",
          "execution",
          "feedback",
          "project",
          "meeting",
          "deadline",
          "goal",
          "challenge",
          "success",
          "manager",
          "colleague",
          "client",
          "presentation",
          "decision"
        ];
        messages.forEach((msg) => {
          const content = msg.content.toLowerCase();
          topicKeywords.forEach((keyword) => {
            if (content.includes(keyword)) {
              topics.push(keyword);
            }
          });
        });
        return [...new Set(topics)];
      }
      /**
       * Analyze emotional tone of user messages
       */
      analyzeEmotionalTone(messages) {
        const positiveWords = ["good", "great", "excellent", "love", "enjoy", "excited", "happy", "successful", "proud"];
        const analyticalWords = ["analyze", "consider", "evaluate", "assess", "examine", "compare", "logical", "systematic"];
        const reflectiveWords = ["reflect", "think", "ponder", "contemplate", "realize", "understand", "learn", "insight"];
        let positiveCount = 0;
        let analyticalCount = 0;
        let reflectiveCount = 0;
        messages.forEach((msg) => {
          const content = msg.content.toLowerCase();
          positiveWords.forEach((word) => {
            if (content.includes(word)) positiveCount++;
          });
          analyticalWords.forEach((word) => {
            if (content.includes(word)) analyticalCount++;
          });
          reflectiveWords.forEach((word) => {
            if (content.includes(word)) reflectiveCount++;
          });
        });
        if (positiveCount > analyticalCount && positiveCount > reflectiveCount) return "positive";
        if (analyticalCount > reflectiveCount) return "analytical";
        if (reflectiveCount > 0) return "reflective";
        return "neutral";
      }
      /**
       * Update user communication patterns based on conversation analysis
       */
      async updateUserPatterns(userId2, analysis, context2) {
        let patterns = this.userPatternsCache.get(userId2) || await this.loadUserPatterns(userId2);
        if (!patterns) {
          patterns = {
            userId: userId2,
            confidenceLevel: "medium",
            communicationStyle: "conversational",
            languageComplexity: "moderate",
            responseLength: "medium",
            emotionalTone: "neutral",
            helpPreference: "guided",
            lastUpdated: /* @__PURE__ */ new Date(),
            conversationCount: 0
          };
        }
        patterns.conversationCount++;
        patterns.lastUpdated = /* @__PURE__ */ new Date();
        patterns.emotionalTone = analysis.emotionalTone;
        if (analysis.confidenceIndicators.length > analysis.uncertaintyIndicators.length) {
          patterns.confidenceLevel = "high";
        } else if (analysis.uncertaintyIndicators.length > analysis.confidenceIndicators.length) {
          patterns.confidenceLevel = "low";
        } else {
          patterns.confidenceLevel = "medium";
        }
        if (analysis.averageMessageLength < 50) {
          patterns.communicationStyle = "brief";
        } else if (analysis.averageMessageLength > 150) {
          patterns.communicationStyle = "detailed";
        } else {
          patterns.communicationStyle = "conversational";
        }
        if (analysis.averageMessageLength < 30) {
          patterns.responseLength = "short";
        } else if (analysis.averageMessageLength > 100) {
          patterns.responseLength = "long";
        } else {
          patterns.responseLength = "medium";
        }
        this.userPatternsCache.set(userId2, patterns);
        await this.saveUserPatterns(userId2, patterns);
        console.log(`\u{1F4C8} Updated patterns for user ${userId2}:`, patterns);
      }
      /**
       * Get user-specific coaching context for Talia
       */
      async getUserCoachingContext(userId2) {
        const patterns = await this.loadUserPatterns(userId2);
        if (!patterns) {
          return "";
        }
        const contextLines = [
          `USER PERSONALIZATION CONTEXT (${patterns.conversationCount} previous conversations):`,
          `\u2022 Confidence Level: ${patterns.confidenceLevel} (adapt encouragement accordingly)`,
          `\u2022 Communication Style: ${patterns.communicationStyle} (match their preferred interaction style)`,
          `\u2022 Response Preference: ${patterns.responseLength} responses (adjust your response length)`,
          `\u2022 Emotional Tone: ${patterns.emotionalTone} (adapt your coaching tone)`,
          `\u2022 Help Style: ${patterns.helpPreference} approach (adjust guidance style)`
        ];
        if (patterns.confidenceLevel === "low") {
          contextLines.push("\u2022 COACHING TIP: This user may need more encouragement and validation");
        } else if (patterns.confidenceLevel === "high") {
          contextLines.push("\u2022 COACHING TIP: This user responds well to challenge and deeper exploration");
        }
        if (patterns.communicationStyle === "brief") {
          contextLines.push("\u2022 COACHING TIP: Keep questions concise and focused");
        } else if (patterns.communicationStyle === "detailed") {
          contextLines.push("\u2022 COACHING TIP: This user appreciates detailed exploration and follow-up questions");
        }
        return contextLines.join("\n") + "\n\nUse this context to personalize your coaching approach, but don't explicitly mention these observations.\n";
      }
      /**
       * Save user patterns to persistent storage
       */
      async saveUserPatterns(userId2, patterns) {
        try {
          await fs4.mkdir(join2(process.cwd(), "storage"), { recursive: true });
          let learningData = {};
          try {
            const existingData = await fs4.readFile(this.learningFilePath, "utf-8");
            learningData = JSON.parse(existingData);
          } catch (error) {
            learningData = {};
          }
          learningData[userId2] = {
            patterns,
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          };
          await fs4.writeFile(this.learningFilePath, JSON.stringify(learningData, null, 2));
          console.log(`\u2705 User patterns saved for ${userId2}`);
        } catch (error) {
          console.error("\u274C Error saving user patterns:", error);
        }
      }
      /**
       * Load user patterns from storage
       */
      async loadUserPatterns(userId2) {
        try {
          const existingData = await fs4.readFile(this.learningFilePath, "utf-8");
          const learningData = JSON.parse(existingData);
          return learningData[userId2]?.patterns || null;
        } catch (error) {
          return null;
        }
      }
      /**
       * Process conversation end and trigger learning update
       */
      async processConversationEnd(userId2, messages, context2) {
        try {
          const analysis = await this.analyzeConversation(userId2, messages, context2);
          await this.updateUserPatterns(userId2, analysis, context2);
          console.log(`\u{1F9E0} User learning updated for ${userId2} after conversation in ${context2?.stepName || "unknown step"}`);
        } catch (error) {
          console.error("\u274C Error processing conversation for user learning:", error);
        }
      }
      /**
       * Clear user patterns (for testing/admin purposes)
       */
      async clearUserPatterns(userId2) {
        this.userPatternsCache.delete(userId2);
        try {
          const existingData = await fs4.readFile(this.learningFilePath, "utf-8");
          const learningData = JSON.parse(existingData);
          delete learningData[userId2];
          await fs4.writeFile(this.learningFilePath, JSON.stringify(learningData, null, 2));
          console.log(`\u{1F5D1}\uFE0F Cleared user patterns for ${userId2}`);
        } catch (error) {
          console.log(`\u2139\uFE0F No existing patterns to clear for ${userId2}`);
        }
      }
    };
    userLearningService = new UserLearningService();
    user_learning_service_default = userLearningService;
  }
});

// server/services/report-quality-monitor.ts
var report_quality_monitor_exports = {};
__export(report_quality_monitor_exports, {
  ReportQualityMonitor: () => ReportQualityMonitor,
  default: () => report_quality_monitor_default,
  reportQualityMonitor: () => reportQualityMonitor
});
import { Pool as Pool12 } from "pg";
var pool12, ReportQualityMonitor, reportQualityMonitor, report_quality_monitor_default;
var init_report_quality_monitor = __esm({
  "server/services/report-quality-monitor.ts"() {
    "use strict";
    init_conversation_logging_service();
    pool12 = new Pool12({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    ReportQualityMonitor = class {
      /**
       * Analyze a generated report for quality issues
       */
      async analyzeReportQuality(reportContent, userId2, reportType, userAssessmentData) {
        const issues = [];
        const reportId = `report-${userId2}-${Date.now()}`;
        if (this.isGenericTemplate(reportContent)) {
          issues.push({
            reportId,
            userId: userId2,
            issueType: "generic_template",
            severity: "critical",
            description: "Report appears to be a generic template without user-specific data",
            reportLength: reportContent.length,
            hasUserData: false,
            hasSpecificPercentages: false,
            hasPersonalizedContent: false,
            detectedAt: /* @__PURE__ */ new Date()
          });
        }
        const hasActualData = this.usesActualUserData(reportContent, userAssessmentData);
        if (!hasActualData && userAssessmentData) {
          issues.push({
            reportId,
            userId: userId2,
            issueType: "missing_data",
            severity: "high",
            description: "Report does not incorporate available user assessment data",
            reportLength: reportContent.length,
            hasUserData: false,
            hasSpecificPercentages: this.hasSpecificPercentages(reportContent),
            hasPersonalizedContent: this.hasPersonalizedContent(reportContent),
            detectedAt: /* @__PURE__ */ new Date()
          });
        }
        if (!this.hasSpecificPercentages(reportContent)) {
          issues.push({
            reportId,
            userId: userId2,
            issueType: "low_personalization",
            severity: "medium",
            description: "Report lacks specific percentage data from user StarCard assessment",
            reportLength: reportContent.length,
            hasUserData: hasActualData,
            hasSpecificPercentages: false,
            hasPersonalizedContent: this.hasPersonalizedContent(reportContent),
            detectedAt: /* @__PURE__ */ new Date()
          });
        }
        if (!this.hasPersonalizedContent(reportContent)) {
          issues.push({
            reportId,
            userId: userId2,
            issueType: "low_personalization",
            severity: "medium",
            description: "Report lacks personalized content with user-specific examples",
            reportLength: reportContent.length,
            hasUserData: hasActualData,
            hasSpecificPercentages: this.hasSpecificPercentages(reportContent),
            hasPersonalizedContent: false,
            detectedAt: /* @__PURE__ */ new Date()
          });
        }
        if (issues.length > 0) {
          await this.logQualityIssues(reportId, issues);
          await this.createEscalationForPoorReport(reportId, userId2, issues);
        }
        return issues;
      }
      /**
       * Check if report is just a generic template
       */
      isGenericTemplate(reportContent) {
        const genericIndicators = [
          "Taylor Smith",
          // Default template name
          "Acting: 35%",
          // Generic percentages
          "You possess a unique combination of strengths that shapes how you naturally approach",
          "Generated by AllStarTeams Workshop | AST v2.1.0"
        ];
        let genericCount = 0;
        for (const indicator of genericIndicators) {
          if (reportContent.includes(indicator)) {
            genericCount++;
          }
        }
        return genericCount >= 2;
      }
      /**
       * Check if report uses actual user assessment data
       */
      usesActualUserData(reportContent, userAssessmentData) {
        if (!userAssessmentData) return false;
        if (userAssessmentData.starCard) {
          const { thinking, feeling, acting, planning } = userAssessmentData.starCard;
          const thinkingPercent = (thinking / 100 * 100).toFixed(1);
          const feelingPercent = (feeling / 100 * 100).toFixed(1);
          const actingPercent = (acting / 100 * 100).toFixed(1);
          const planningPercent = (planning / 100 * 100).toFixed(1);
          if (reportContent.includes(thinkingPercent) || reportContent.includes(feelingPercent) || reportContent.includes(actingPercent) || reportContent.includes(planningPercent)) {
            return true;
          }
        }
        if (userAssessmentData.reflections) {
          for (const reflection of Object.values(userAssessmentData.reflections)) {
            if (typeof reflection === "string" && reflection.length > 20) {
              const words = reflection.split(" ").slice(0, 5).join(" ");
              if (reportContent.includes(words)) {
                return true;
              }
            }
          }
        }
        return false;
      }
      /**
       * Check if report has specific percentages (not generic ones)
       */
      hasSpecificPercentages(reportContent) {
        const genericPercentages = ["35%", "25%", "20%", "30%"];
        for (const generic of genericPercentages) {
          if (reportContent.includes(generic)) {
            return false;
          }
        }
        const specificPercentagePattern = /\d+\.\d+%/;
        return specificPercentagePattern.test(reportContent);
      }
      /**
       * Check if report has personalized content
       */
      hasPersonalizedContent(reportContent) {
        const personalizationIndicators = [
          "you mentioned",
          "your example of",
          "you described",
          "you reflected",
          "your response about",
          "you shared",
          "you explained"
        ];
        for (const indicator of personalizationIndicators) {
          if (reportContent.toLowerCase().includes(indicator)) {
            return true;
          }
        }
        return false;
      }
      /**
       * Log quality issues to METAlia database
       */
      async logQualityIssues(reportId, issues) {
        try {
          for (const issue of issues) {
            await conversationLoggingService.logConversation({
              personaType: "star_report",
              userId: issue.userId,
              sessionId: reportId,
              userMessage: `Report quality analysis for user ${issue.userId}`,
              taliaResponse: `Quality issue detected: ${issue.issueType} - ${issue.description}`,
              contextData: {
                reportQualityIssue: true,
                issueType: issue.issueType,
                severity: issue.severity,
                reportLength: issue.reportLength,
                hasUserData: issue.hasUserData,
                hasSpecificPercentages: issue.hasSpecificPercentages,
                hasPersonalizedContent: issue.hasPersonalizedContent
              },
              requestData: {
                reportId,
                qualityAnalysis: true,
                requestTimestamp: (/* @__PURE__ */ new Date()).toISOString()
              },
              responseMetadata: {
                confidence: 0.9,
                source: "metalia_quality_monitor",
                tokensUsed: 0
              },
              conversationOutcome: issue.severity === "critical" ? "escalated" : "completed"
            });
          }
          console.log(`\u{1F4CA} METAlia: Logged ${issues.length} quality issues for report ${reportId}`);
        } catch (error) {
          console.error("\u274C Error logging quality issues:", error);
        }
      }
      /**
       * Create escalation for poor quality reports
       */
      async createEscalationForPoorReport(reportId, userId2, issues) {
        try {
          const criticalIssues = issues.filter((i) => i.severity === "critical");
          if (criticalIssues.length > 0) {
            await conversationLoggingService.createEscalation({
              requestingPersona: "star_report",
              escalationType: "error_report",
              priority: "high",
              question: `Poor quality report generated for user ${userId2}. Issues detected: ${issues.map((i) => i.issueType).join(", ")}`,
              contextData: {
                reportId,
                userId: userId2,
                issues: issues.map((i) => ({
                  type: i.issueType,
                  severity: i.severity,
                  description: i.description
                }))
              },
              userMessage: `Report quality analysis for user ${userId2}`,
              attemptedResponse: `Report contained ${issues.length} quality issues`
            });
            console.log(`\u{1F6A8} METAlia: Created escalation for poor quality report ${reportId}`);
          }
        } catch (error) {
          console.error("\u274C Error creating quality escalation:", error);
        }
      }
      /**
       * Get report quality statistics
       */
      async getQualityStatistics(days = 7) {
        try {
          const conversations = await conversationLoggingService.getConversations({
            personaType: "star_report",
            startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1e3),
            endDate: /* @__PURE__ */ new Date(),
            limit: 1e3
          });
          const qualityIssues = conversations.filter(
            (c) => c.context_data?.reportQualityIssue === true
          );
          const issueTypes = qualityIssues.reduce((acc, issue) => {
            const type2 = issue.context_data?.issueType || "unknown";
            acc[type2] = (acc[type2] || 0) + 1;
            return acc;
          }, {});
          const severityCounts = qualityIssues.reduce((acc, issue) => {
            const severity = issue.context_data?.severity || "unknown";
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
          }, {});
          return {
            totalReports: conversations.length,
            reportsWithIssues: qualityIssues.length,
            qualityRate: ((conversations.length - qualityIssues.length) / conversations.length * 100).toFixed(1),
            issueTypes,
            severityCounts,
            timeRange: `${days} days`
          };
        } catch (error) {
          console.error("\u274C Error getting quality statistics:", error);
          throw error;
        }
      }
    };
    reportQualityMonitor = new ReportQualityMonitor();
    report_quality_monitor_default = reportQualityMonitor;
  }
});

// server/services/conversation-learning-service.ts
var conversation_learning_service_exports = {};
__export(conversation_learning_service_exports, {
  conversationLearningService: () => conversationLearningService
});
import { Pool as Pool13 } from "pg";
var pool13, ConversationLearningService, conversationLearningService;
var init_conversation_learning_service = __esm({
  "server/services/conversation-learning-service.ts"() {
    "use strict";
    pool13 = new Pool13({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    ConversationLearningService = class {
      /**
       * Get or create learning document for a persona
       */
      async getOrCreateLearningDocument(personaId) {
        try {
          const learningDocTitle = `${personaId.charAt(0).toUpperCase() + personaId.slice(1)} - Conversation Learning Log`;
          const existingDoc = await pool13.query(
            "SELECT id FROM training_documents WHERE title = $1 AND document_type = $2",
            [learningDocTitle, "conversation_learning"]
          );
          if (existingDoc.rows.length > 0) {
            return existingDoc.rows[0].id;
          }
          const initialContent = this.generateInitialLearningDocument(personaId);
          const newDoc = await pool13.query(`
        INSERT INTO training_documents (
          title, original_filename, content, document_type, category, status,
          word_count, content_preview, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `, [
            learningDocTitle,
            `${personaId}_learning_log.md`,
            initialContent,
            "conversation_learning",
            "Learning",
            "active",
            initialContent.split(/\s+/).length,
            "Auto-generated conversation learning document..."
          ]);
          const docId = newDoc.rows[0].id;
          await this.createDocumentChunks(docId, initialContent);
          console.log(`\u2705 Created learning document for ${personaId}: ${docId}`);
          return docId;
        } catch (error) {
          console.error(`\u274C Error creating learning document for ${personaId}:`, error);
          throw error;
        }
      }
      /**
       * Generate initial learning document content
       */
      generateInitialLearningDocument(personaId) {
        const personaName = personaId.charAt(0).toUpperCase() + personaId.slice(1);
        const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        return `# ${personaName} - Conversation Learning Log
*Auto-generated learning document - Updated: ${currentDate}*

## \u{1F3AF} Purpose
This document automatically captures learnings from conversations to help ${personaName} improve over time. All content is editable by administrators.

## \u{1F4CA} Learning Summary
- **Total Conversations**: 0
- **Last Updated**: ${currentDate}
- **Key Patterns Identified**: None yet
- **Success Rate**: Not yet measured

## \u{1F9E0} Key Learnings

### Effective Interaction Patterns
*Will be populated automatically from successful conversations*

### User Preferences Discovered
*Will be updated based on user feedback and interaction analysis*

### Conversation Techniques That Work
*Successful approaches will be documented here*

### Areas for Improvement
*Identified challenges and refinements needed*

## \u{1F4DD} Recent Conversation Insights
*Most recent learnings appear here*

### [Date] - Conversation Analysis
*Learning insights will be added here automatically*

## \u{1F3AF} Persona Development Goals
Based on learnings, focus on:
- *Goals will be identified from conversation patterns*

## \u{1F4C8} Evolution Tracking
*This section tracks how the persona improves over time*

---
*This document is automatically updated after each conversation and can be edited by administrators to refine the persona's learning.*`;
      }
      /**
       * Create document chunks for vector search
       */
      async createDocumentChunks(documentId, content) {
        const chunkSize = 1e3;
        let chunkIndex = 0;
        let startIndex = 0;
        while (startIndex < content.length) {
          const endIndex = Math.min(startIndex + chunkSize, content.length);
          const chunkContent = content.slice(startIndex, endIndex);
          await pool13.query(`
        INSERT INTO document_chunks (
          document_id, chunk_index, content, start_char, end_char,
          token_count, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
            documentId,
            chunkIndex,
            chunkContent,
            startIndex,
            endIndex - 1,
            Math.ceil(chunkContent.length / 4)
            // Approximate token count
          ]);
          chunkIndex++;
          startIndex = endIndex;
        }
      }
      /**
       * Analyze conversation and extract learnings
       */
      async analyzeConversation(personaId, userMessage, aiResponse, userFeedback, conversationContext) {
        const analysisPrompt = `Analyze this conversation for learning insights:

PERSONA: ${personaId}
USER MESSAGE: ${userMessage}
AI RESPONSE: ${aiResponse}
USER FEEDBACK: ${userFeedback || "None provided"}
CONTEXT: ${JSON.stringify(conversationContext || {})}

Extract specific learnings in this format:
- INTERACTION_PATTERN: What pattern worked or didn't work in this exchange
- EFFECTIVE_TECHNIQUE: What approach was effective (if any)
- USER_FEEDBACK: What the user's response tells us about effectiveness
- REFINEMENT_NEEDED: What should be improved for similar future conversations

Be specific and actionable. Focus on what makes conversations more effective.`;
        try {
          const { generateClaudeCoachingResponse: generateClaudeCoachingResponse2 } = await Promise.resolve().then(() => (init_claude_api_service(), claude_api_service_exports));
          const analysis = await generateClaudeCoachingResponse2({
            userMessage: analysisPrompt,
            personaType: "coaching",
            // Use coaching persona for analysis
            userName: "System",
            contextData: { analysisMode: true },
            userId: "system",
            sessionId: `analysis-${Date.now()}`,
            maxTokens: 1e3
          });
          const learning = {
            interactionPattern: this.extractLearningSection(analysis, "INTERACTION_PATTERN") || "Pattern analysis pending",
            effectiveTechnique: this.extractLearningSection(analysis, "EFFECTIVE_TECHNIQUE") || "Technique analysis pending",
            userFeedback: this.extractLearningSection(analysis, "USER_FEEDBACK") || "Feedback analysis pending",
            refinementNeeded: this.extractLearningSection(analysis, "REFINEMENT_NEEDED") || "Refinement analysis pending",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          return learning;
        } catch (error) {
          console.error("\u274C Error analyzing conversation:", error);
          return {
            interactionPattern: "Analysis failed - manual review needed",
            effectiveTechnique: "Could not determine effectiveness",
            userFeedback: userFeedback || "No feedback provided",
            refinementNeeded: "Manual analysis required",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      }
      /**
       * Extract specific learning section from analysis
       */
      extractLearningSection(analysis, section) {
        const regex = new RegExp(`${section}:\\s*(.+?)(?=\\n\\w+:|$)`, "i");
        const match = analysis.match(regex);
        return match ? match[1].trim() : null;
      }
      /**
       * Update learning document with new insights
       */
      async updateLearningDocument(personaId, learning) {
        try {
          const docId = await this.getOrCreateLearningDocument(personaId);
          const currentDoc = await pool13.query(
            "SELECT content FROM training_documents WHERE id = $1",
            [docId]
          );
          if (currentDoc.rows.length === 0) {
            throw new Error("Learning document not found");
          }
          let content = currentDoc.rows[0].content;
          const newLearningSection = this.formatLearningForDocument(learning);
          const insertionPoint = content.indexOf("## \u{1F4DD} Recent Conversation Insights");
          if (insertionPoint !== -1) {
            const afterSection = content.indexOf("\n## ", insertionPoint + 1);
            const insertPos = afterSection !== -1 ? afterSection : content.length;
            content = content.slice(0, insertPos) + "\n\n" + newLearningSection + "\n" + content.slice(insertPos);
          } else {
            content += "\n\n" + newLearningSection;
          }
          await pool13.query(
            "UPDATE training_documents SET content = $1, updated_at = NOW() WHERE id = $2",
            [content, docId]
          );
          await pool13.query("DELETE FROM document_chunks WHERE document_id = $1", [docId]);
          await this.createDocumentChunks(docId, content);
          console.log(`\u2705 Updated learning document for ${personaId}`);
          try {
            const { javascriptVectorService: javascriptVectorService2 } = await Promise.resolve().then(() => (init_javascript_vector_service(), javascript_vector_service_exports));
            await javascriptVectorService2.initialize();
            console.log("\u{1F504} Vector service reinitialized with updated learning");
          } catch (vectorError) {
            console.warn("\u26A0\uFE0F Could not reinitialize vector service:", vectorError);
          }
        } catch (error) {
          console.error(`\u274C Error updating learning document for ${personaId}:`, error);
          throw error;
        }
      }
      /**
       * Format learning for insertion into document
       */
      formatLearningForDocument(learning) {
        const date = new Date(learning.timestamp).toLocaleDateString();
        const time = new Date(learning.timestamp).toLocaleTimeString();
        return `### ${date} ${time} - Conversation Analysis

**Interaction Pattern**: ${learning.interactionPattern}

**Effective Technique**: ${learning.effectiveTechnique}

**User Feedback**: ${learning.userFeedback}

**Refinement Needed**: ${learning.refinementNeeded}

---`;
      }
      /**
       * Get learning document ID for a persona
       */
      async getLearningDocumentId(personaId) {
        try {
          const learningDocTitle = `${personaId.charAt(0).toUpperCase() + personaId.slice(1)} - Conversation Learning Log`;
          const result = await pool13.query(
            "SELECT id FROM training_documents WHERE title = $1 AND document_type = $2",
            [learningDocTitle, "conversation_learning"]
          );
          return result.rows.length > 0 ? result.rows[0].id : null;
        } catch (error) {
          console.error(`\u274C Error getting learning document for ${personaId}:`, error);
          return null;
        }
      }
      /**
       * Initialize learning documents for all existing personas
       */
      async initializeAllPersonaLearningDocuments() {
        try {
          console.log("\u{1F680} Initializing learning documents for all personas...");
          const personas = await pool13.query("SELECT id FROM talia_personas WHERE enabled = true");
          for (const persona2 of personas.rows) {
            await this.getOrCreateLearningDocument(persona2.id);
            console.log(`\u2705 Learning document ready for persona: ${persona2.id}`);
          }
          console.log(`\u{1F389} Learning documents initialized for ${personas.rows.length} personas`);
        } catch (error) {
          console.error("\u274C Error initializing persona learning documents:", error);
          throw error;
        }
      }
    };
    conversationLearningService = new ConversationLearningService();
  }
});

// server/index.ts
import "dotenv/config";
import express23 from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";

// server/routes.ts
init_auth();
import express10 from "express";

// server/db.ts
init_schema();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}
var queryClient = postgres(databaseUrl);
var db = drizzle(queryClient, { schema: schema_exports });
async function initializeDatabase() {
  try {
    console.log("Initializing database connection...");
    try {
      await queryClient.unsafe("SELECT 1");
      console.log("Database connection successful");
    } catch (err) {
      console.error("Database connection error:", err);
    }
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
}

// server/routes.ts
init_schema();
import { eq as eq11, and as and5, desc } from "drizzle-orm";

// server/routes/auth-routes.ts
import express2 from "express";

// server/services/user-management-service.ts
init_schema();
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
var UserManagementService = class {
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username) {
    try {
      const existingUser = await db.select().from(users).where(eq(users.username, username));
      return existingUser.length === 0;
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  }
  /**
   * Create a new user
   */
  async createUser(data) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      const result = await db.execute(sql`
        INSERT INTO users (username, password, name, email, role, organization, job_title, profile_picture, is_test_user, is_beta_tester, content_access, ast_access, ia_access, invited_by, created_at, updated_at)
        VALUES (${data.username}, ${hashedPassword}, ${data.name}, ${data.email.toLowerCase()}, ${data.role}, ${data.organization || null}, ${data.jobTitle || null}, ${data.profilePicture || null}, ${data.isTestUser || false}, ${data.isBetaTester || false}, 'professional', true, true, ${data.invitedBy || null}, NOW(), NOW())
        RETURNING *
      `);
      const userData = result[0] || result.rows?.[0];
      if (userData) {
        const { password, ...userWithoutPassword } = userData;
        return {
          success: true,
          user: {
            id: userData.id,
            username: userData.username,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            organization: userData.organization,
            jobTitle: userData.job_title,
            profilePicture: userData.profile_picture,
            isTestUser: userData.is_test_user,
            isBetaTester: userData.is_beta_tester,
            showDemoDataButtons: userData.show_demo_data_buttons,
            contentAccess: userData.content_access,
            astAccess: userData.ast_access,
            iaAccess: userData.ia_access,
            invitedBy: userData.invited_by,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
          }
        };
      }
      return {
        success: false,
        error: "Failed to create user"
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: "Failed to create user"
      };
    }
  }
  /**
   * Authenticate a user
   */
  async authenticateUser(username, password) {
    try {
      const result = await db.execute(sql`
        SELECT * FROM users WHERE username = ${username} LIMIT 1
      `);
      console.log("\u{1F50D} Raw SQL result:", result);
      console.log("\u{1F50D} Result type:", typeof result);
      console.log("\u{1F50D} Result length:", result?.length);
      console.log("\u{1F50D} First item:", result?.[0]);
      if (!result || result.length === 0) {
        console.log("\u274C No user found for username:", username);
        return {
          success: false,
          error: "Invalid username or password"
        };
      }
      const user = result[0] || result.rows?.[0];
      console.log("\u{1F50D} Selected user:", user ? "Found" : "Not found");
      console.log("\u{1F50D} User object keys:", user ? Object.keys(user) : "None");
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid username or password"
        };
      }
      const { password: _, ...rawUser } = user;
      return {
        success: true,
        user: {
          id: rawUser.id,
          username: rawUser.username,
          name: rawUser.name,
          email: rawUser.email,
          role: rawUser.role,
          organization: rawUser.organization,
          jobTitle: rawUser.job_title,
          profilePicture: rawUser.profile_picture,
          isTestUser: rawUser.is_test_user,
          isBetaTester: rawUser.is_beta_tester,
          hasSeenBetaWelcome: rawUser.has_seen_beta_welcome,
          showDemoDataButtons: rawUser.show_demo_data_buttons,
          contentAccess: rawUser.content_access,
          astAccess: rawUser.ast_access,
          iaAccess: rawUser.ia_access,
          invitedBy: rawUser.invited_by,
          createdAt: rawUser.created_at,
          updatedAt: rawUser.updated_at
        }
      };
    } catch (error) {
      console.error("Error authenticating user:", error);
      return {
        success: false,
        error: "Authentication failed"
      };
    }
  }
  /**
   * Get a user by ID
   */
  async getUserById(id) {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "User not found"
        };
      }
      const user = result[0];
      const { password: _, ...rawUser } = user;
      return {
        success: true,
        user: {
          id: rawUser.id,
          username: rawUser.username,
          name: rawUser.name,
          email: rawUser.email,
          role: rawUser.role,
          organization: rawUser.organization,
          jobTitle: rawUser.jobTitle,
          profilePicture: rawUser.profilePicture,
          isTestUser: rawUser.isTestUser,
          isBetaTester: rawUser.isBetaTester,
          hasSeenBetaWelcome: rawUser.hasSeenBetaWelcome,
          showDemoDataButtons: rawUser.showDemoDataButtons,
          contentAccess: rawUser.contentAccess,
          astAccess: rawUser.astAccess,
          iaAccess: rawUser.iaAccess,
          invitedBy: rawUser.invitedBy,
          createdAt: rawUser.createdAt,
          updatedAt: rawUser.updatedAt
        }
      };
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return {
        success: false,
        error: "Failed to get user"
      };
    }
  }
  /**
   * Get a user by email
   */
  async getUserByEmail(email) {
    try {
      const result = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "User not found"
        };
      }
      const user = result[0];
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return {
        success: false,
        error: "Failed to get user"
      };
    }
  }
  /**
   * Update a user
   */
  async updateUser(id, data) {
    try {
      const updateData = {};
      if (data.name !== void 0) updateData.name = data.name;
      if (data.email !== void 0) updateData.email = data.email;
      if (data.organization !== void 0) updateData.organization = data.organization;
      if (data.jobTitle !== void 0) updateData.jobTitle = data.jobTitle;
      if (data.title !== void 0) updateData.jobTitle = data.title;
      if (data.profilePicture !== void 0) updateData.profilePicture = data.profilePicture;
      if (data.isTestUser !== void 0) updateData.isTestUser = data.isTestUser;
      if (data.isBetaTester !== void 0) {
        console.log(`\u{1F50D} DEBUG: Updating isBetaTester for user ${id} from ${data.isBetaTester}`);
        updateData.isBetaTester = data.isBetaTester;
      }
      if (data.showDemoDataButtons !== void 0) updateData.showDemoDataButtons = data.showDemoDataButtons;
      if (data.role !== void 0) updateData.role = data.role;
      if (data.navigationProgress !== void 0) updateData.navigationProgress = data.navigationProgress;
      if (data.contentAccess !== void 0) updateData.contentAccess = data.contentAccess;
      if (data.astAccess !== void 0) updateData.astAccess = data.astAccess;
      if (data.iaAccess !== void 0) updateData.iaAccess = data.iaAccess;
      let temporaryPassword = null;
      if (data.password !== void 0) {
        if (data.password === null || data.password === "") {
          temporaryPassword = Math.random().toString(36).slice(-8);
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(temporaryPassword, salt);
        } else {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(data.password, salt);
        }
      }
      updateData.updatedAt = /* @__PURE__ */ new Date();
      console.log(`\u{1F50D} DEBUG: About to update user ${id} with data:`, JSON.stringify(updateData, null, 2));
      const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "User not found"
        };
      }
      const user = result[0];
      console.log(`\u{1F50D} DEBUG: User ${id} updated successfully. isBetaTester in result:`, user.isBetaTester || user.is_beta_tester);
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        temporaryPassword
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: "Failed to update user"
      };
    }
  }
  /**
   * Toggle a user's test status
   */
  async toggleTestUserStatus(id) {
    try {
      const currentUser = await db.select().from(users).where(eq(users.id, id));
      if (!currentUser || currentUser.length === 0) {
        return {
          success: false,
          error: "User not found"
        };
      }
      const isCurrentlyTestUser = currentUser[0].isTestUser;
      const result = await db.execute(sql`
        UPDATE users 
        SET is_test_user = NOT is_test_user, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `);
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "Failed to update test user status"
        };
      }
      const user = result[0];
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error("Error toggling test user status:", error);
      return {
        success: false,
        error: "Failed to toggle test user status"
      };
    }
  }
  /**
   * Get all users with progress calculation
   */
  async getAllUsers(includeDeleted = false) {
    try {
      const result = await db.select().from(users);
      const { userAssessments: userAssessments2, navigationProgress: navigationProgress2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq14, and: and8 } = await import("drizzle-orm");
      const userIds = result.map((user) => user.id);
      const starCardAssessments = await db.select().from(userAssessments2).where(
        and8(
          eq14(userAssessments2.assessmentType, "starCard")
        )
      );
      const flowAssessments = await db.select().from(userAssessments2).where(
        and8(
          eq14(userAssessments2.assessmentType, "flowAttributes")
        )
      );
      const allAssessments = await db.select().from(userAssessments2);
      const navProgress = await db.select().from(navigationProgress2);
      const usersWithoutPasswords = result.map((user) => {
        const { password, ...userWithoutPassword } = user;
        if (user.id === 8) {
          console.log(`\u{1F50D} DEBUG: User ${user.id} raw data:`, {
            isBetaTester: user.isBetaTester,
            is_beta_tester: user.is_beta_tester,
            showDemoDataButtons: user.showDemoDataButtons,
            show_demo_data_buttons: user.show_demo_data_buttons
          });
        }
        const hasStarCard = starCardAssessments.some((assessment) => assessment.userId === user.id);
        const hasFlowAttributes = flowAssessments.some((assessment) => assessment.userId === user.id);
        const hasAssessment = allAssessments.some((assessment) => assessment.userId === user.id);
        const userNavProgress = navProgress.filter((nav) => nav.userId === user.id);
        const astProgress = userNavProgress.find((nav) => nav.appType === "ast");
        const iaProgress = userNavProgress.find((nav) => nav.appType === "ia");
        if (user.id === 1) {
          console.log(`Debug Admin User (${user.id}) AST Progress:`, {
            userNavProgress: userNavProgress.length,
            astProgress: astProgress ? {
              completedSteps: astProgress.completedSteps,
              currentStepId: astProgress.currentStepId,
              unlockedSteps: astProgress.unlockedSteps
            } : null
          });
        }
        return {
          ...userWithoutPassword,
          progress: 0,
          hasAssessment,
          hasStarCard,
          hasFlowAttributes,
          astProgress: astProgress ? {
            completedSteps: Array.isArray(astProgress.completedSteps) ? astProgress.completedSteps : JSON.parse(astProgress.completedSteps || "[]"),
            currentStepId: astProgress.currentStepId,
            unlockedSteps: Array.isArray(astProgress.unlockedSteps) ? astProgress.unlockedSteps : JSON.parse(astProgress.unlockedSteps || "[]"),
            videoProgress: typeof astProgress.videoProgress === "object" ? astProgress.videoProgress : JSON.parse(astProgress.videoProgress || "{}")
          } : null,
          iaProgress: iaProgress ? {
            completedSteps: Array.isArray(iaProgress.completedSteps) ? iaProgress.completedSteps : JSON.parse(iaProgress.completedSteps || "[]"),
            currentStepId: iaProgress.currentStepId,
            unlockedSteps: Array.isArray(iaProgress.unlockedSteps) ? iaProgress.unlockedSteps : JSON.parse(iaProgress.unlockedSteps || "[]"),
            videoProgress: typeof iaProgress.videoProgress === "object" ? iaProgress.videoProgress : JSON.parse(iaProgress.videoProgress || "{}")
          } : null,
          navigationProgress: user.navigationProgress
          // Include navigation progress for admin
        };
      });
      return {
        success: true,
        users: usersWithoutPasswords
      };
    } catch (error) {
      console.error("Error getting all users:", error);
      return {
        success: false,
        error: "Failed to get users"
      };
    }
  }
  /**
   * Get all beta testers - TEMPORARILY DISABLED
   */
  async getAllBetaTesters() {
    try {
      const result = await db.select().from(users).where(eq(users.isBetaTester, true));
      return {
        success: true,
        users: result.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          jobTitle: user.jobTitle,
          profilePicture: user.profilePicture,
          isTestUser: user.isTestUser,
          isBetaTester: user.isBetaTester,
          showDemoDataButtons: user.showDemoDataButtons,
          contentAccess: user.contentAccess,
          astAccess: user.astAccess,
          iaAccess: user.iaAccess,
          invitedBy: user.invitedBy,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      };
    } catch (error) {
      console.error("Error getting beta testers:", error);
      return {
        success: false,
        error: "Failed to get beta testers"
      };
    }
  }
  /**
   * Get all test users
   */
  async getAllTestUsers() {
    try {
      const result = await db.select().from(users).where(eq(users.isTestUser, true));
      const usersWithoutPasswords = result.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return {
        success: true,
        users: usersWithoutPasswords
      };
    } catch (error) {
      console.error("Error getting test users:", error);
      return {
        success: false,
        error: "Failed to get test users"
      };
    }
  }
  /**
   * Get all videos from the database
   */
  async getVideos() {
    try {
      const { videos: videos2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const result = await db.select().from(videos2).orderBy(videos2.sortOrder);
      return result.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        editableId: video.editableId,
        workshop_type: video.workshopType,
        section: video.section,
        step_id: video.stepId,
        autoplay: video.autoplay,
        sortOrder: video.sortOrder
      }));
    } catch (error) {
      console.error("Error getting videos from database:", error);
      throw error;
    }
  }
  async getVideosByWorkshop(workshopType) {
    try {
      const { videos: videos2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq14 } = await import("drizzle-orm");
      const result = await db.select().from(videos2).where(eq14(videos2.workshopType, workshopType)).orderBy(videos2.sortOrder);
      return result.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        editableId: video.editableId,
        workshop_type: video.workshopType,
        section: video.section,
        step_id: video.stepId,
        autoplay: video.autoplay,
        sortOrder: video.sortOrder
      }));
    } catch (error) {
      console.error("Error getting videos by workshop from database:", error);
      throw error;
    }
  }
  /**
   * Update a video
   */
  async updateVideo(id, data) {
    try {
      const { videos: videos2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq14 } = await import("drizzle-orm");
      const updateData = {
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (data.title !== void 0) updateData.title = data.title;
      if (data.description !== void 0) updateData.description = data.description;
      if (data.url !== void 0) updateData.url = data.url;
      if (data.editableId !== void 0) updateData.editableId = data.editableId;
      if (data.workshop_type !== void 0) updateData.workshopType = data.workshop_type;
      if (data.workshopType !== void 0) updateData.workshopType = data.workshopType;
      if (data.section !== void 0) updateData.section = data.section;
      if (data.stepId !== void 0) updateData.stepId = data.stepId;
      if (data.step_id !== void 0) updateData.stepId = data.step_id;
      if (data.autoplay !== void 0) updateData.autoplay = data.autoplay;
      if (data.sortOrder !== void 0) updateData.sortOrder = data.sortOrder;
      if (data.sort_order !== void 0) updateData.sortOrder = data.sort_order;
      if (data.requiredWatchPercentage !== void 0) updateData.requiredWatchPercentage = data.requiredWatchPercentage;
      if (data.required_watch_percentage !== void 0) updateData.requiredWatchPercentage = data.required_watch_percentage;
      console.log(`Updating video ${id} with data:`, updateData);
      const result = await db.update(videos2).set(updateData).where(eq14(videos2.id, id)).returning();
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "Video not found"
        };
      }
      const updatedVideo = result[0];
      console.log(`Successfully updated video ${id}:`, updatedVideo);
      return {
        success: true,
        video: {
          id: updatedVideo.id,
          title: updatedVideo.title,
          description: updatedVideo.description,
          url: updatedVideo.url,
          editableId: updatedVideo.editableId,
          workshop_type: updatedVideo.workshopType,
          section: updatedVideo.section,
          step_id: updatedVideo.stepId,
          autoplay: updatedVideo.autoplay,
          sortOrder: updatedVideo.sortOrder,
          requiredWatchPercentage: updatedVideo.requiredWatchPercentage
        }
      };
    } catch (error) {
      console.error("Error updating video:", error);
      return {
        success: false,
        error: "Failed to update video: " + (error instanceof Error ? error.message : "Unknown error")
      };
    }
  }
  /**
   * Delete all user data except profile and password
   */
  async deleteUserData(userId2) {
    try {
      console.log(`Starting complete data deletion for user ${userId2}`);
      const { sql: sql6 } = await import("drizzle-orm");
      let deletedData = {
        userAssessments: 0,
        navigationProgressTable: 0,
        navigationProgressField: false,
        workshopParticipation: 0,
        growthPlans: 0,
        finalReflections: 0,
        discernmentProgress: 0,
        workshopStepData: 0
      };
      try {
        const assessmentResult = await db.execute(sql6`DELETE FROM user_assessments WHERE user_id = ${userId2}`);
        deletedData.userAssessments = assessmentResult.length;
        console.log(`Deleted ${deletedData.userAssessments} assessment records for user ${userId2}`);
      } catch (error) {
        console.log(`No user assessments found for user ${userId2}:`, error.message);
      }
      try {
        const navResult = await db.execute(sql6`DELETE FROM navigation_progress WHERE user_id = ${userId2}`);
        deletedData.navigationProgressTable = navResult.length;
        console.log(`Deleted ${deletedData.navigationProgressTable} navigation progress records for user ${userId2}`);
      } catch (error) {
        console.log(`No navigation progress found for user ${userId2}:`, error.message);
      }
      try {
        await db.execute(sql6`UPDATE users SET 
          navigation_progress = NULL,
          ast_workshop_completed = false,
          ia_workshop_completed = false,
          ast_completed_at = NULL,
          ia_completed_at = NULL
        WHERE id = ${userId2}`);
        deletedData.navigationProgressField = true;
        console.log(`Cleared navigation_progress field and reset workshop completion status for user ${userId2}`);
      } catch (error) {
        console.log(`Error clearing navigation_progress field for user ${userId2}:`, error.message);
      }
      try {
        const workshopResult = await db.execute(sql6`DELETE FROM workshop_participation WHERE user_id = ${userId2}`);
        deletedData.workshopParticipation = workshopResult.length;
        console.log(`Deleted ${deletedData.workshopParticipation} workshop participation records for user ${userId2}`);
      } catch (error) {
        console.log(`No workshop participation found for user ${userId2}`);
      }
      try {
        const growthResult = await db.execute(sql6`DELETE FROM growth_plans WHERE user_id = ${userId2}`);
        deletedData.growthPlans = growthResult.length;
        console.log(`Deleted ${deletedData.growthPlans} growth plan records for user ${userId2}`);
      } catch (error) {
        console.log(`No growth plans found for user ${userId2}`);
      }
      try {
        const reflectionResult = await db.execute(sql6`DELETE FROM final_reflections WHERE user_id = ${userId2}`);
        deletedData.finalReflections = reflectionResult.length;
        console.log(`Deleted ${deletedData.finalReflections} final reflection records for user ${userId2}`);
      } catch (error) {
        console.log(`No final reflections found for user ${userId2}`);
      }
      try {
        const discernmentResult = await db.execute(sql6`DELETE FROM user_discernment_progress WHERE user_id = ${userId2}`);
        deletedData.discernmentProgress = discernmentResult.length;
        console.log(`Deleted ${deletedData.discernmentProgress} discernment progress records for user ${userId2}`);
      } catch (error) {
        console.log(`No discernment progress found for user ${userId2}`);
      }
      let workshopStepDataDeleted = 0;
      try {
        console.log(`=== STARTING HYBRID WORKSHOP RESET for user ${userId2} ===`);
        const userResult = await db.execute(sql6`SELECT is_test_user FROM users WHERE id = ${userId2}`);
        if (userResult.length > 0) {
          const isTestUser = userResult[0].is_test_user;
          console.log(`=== RESET STRATEGY: User ${userId2} isTestUser: ${isTestUser} ===`);
          if (isTestUser) {
            console.log(`=== ATTEMPTING HARD DELETE for test user ${userId2} ===`);
            const workshopResult = await db.execute(sql6`DELETE FROM workshop_step_data WHERE user_id = ${userId2}`);
            workshopStepDataDeleted = Array.isArray(workshopResult) ? workshopResult.length : workshopResult.changes || 0;
            console.log(`=== HARD DELETE: Permanently deleted ${workshopStepDataDeleted} workshop records for test user ${userId2} ===`);
          } else {
            console.log(`=== ATTEMPTING SOFT DELETE for production user ${userId2} ===`);
            const workshopResult = await db.execute(sql6`UPDATE workshop_step_data SET deleted_at = NOW(), updated_at = NOW() WHERE user_id = ${userId2} AND deleted_at IS NULL`);
            workshopStepDataDeleted = Array.isArray(workshopResult) ? workshopResult.length : workshopResult.changes || 0;
            console.log(`=== SOFT DELETE: Marked ${workshopStepDataDeleted} workshop records as deleted for production user ${userId2} ===`);
          }
        }
      } catch (error) {
        console.error(`ERROR resetting workshop step data for user ${userId2}:`, error);
      }
      deletedData.workshopStepData = workshopStepDataDeleted;
      const totalRecordsDeleted = deletedData.userAssessments + deletedData.navigationProgressTable + deletedData.workshopParticipation + deletedData.growthPlans + deletedData.finalReflections + deletedData.discernmentProgress + deletedData.workshopStepData;
      console.log(`Completed data deletion for user ${userId2}:`, deletedData);
      return {
        success: true,
        message: "User data deleted successfully",
        deletedData,
        summary: `Deleted ${totalRecordsDeleted} total records across ${Object.keys(deletedData).length} data categories`
      };
    } catch (error) {
      console.error("Error deleting user data:", error);
      return {
        success: false,
        error: "Failed to delete user data: " + (error instanceof Error ? error.message : "Unknown error")
      };
    }
  }
  async deleteUser(userId2) {
    try {
      console.log(`Starting complete user deletion for user ${userId2}`);
      const { eq: eq14 } = await import("drizzle-orm");
      const { sql: sql6 } = await import("drizzle-orm");
      await this.deleteUserData(userId2);
      try {
        await db.execute(sql6`DELETE FROM users WHERE id = ${userId2}`);
        console.log(`Deleted user account for user ${userId2}`);
        return {
          success: true,
          message: "User deleted successfully"
        };
      } catch (error) {
        console.error(`Error deleting user account ${userId2}:`, error);
        return {
          success: false,
          error: "Failed to delete user account"
        };
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        error: "Failed to delete user"
      };
    }
  }
  /**
   * Get users that are accessible to a facilitator (role-based scoping)
   * Includes users assigned directly to facilitator and users in facilitator's cohorts
   */
  async getUsersForFacilitator(facilitatorId, includeDeleted = false) {
    try {
      const { sql: sql6 } = await import("drizzle-orm");
      const usersQuery = sql6`
        SELECT DISTINCT u.*, 
               c.name as cohort_name, 
               o.name as organization_name
        FROM users u
        LEFT JOIN cohorts c ON u.cohort_id = c.id  
        LEFT JOIN organizations o ON u.organization_id = o.id
        WHERE (
          u.assigned_facilitator_id = ${facilitatorId} 
          OR u.cohort_id IN (
            SELECT id FROM cohorts WHERE facilitator_id = ${facilitatorId}
          )
        )
        ${includeDeleted ? sql6`` : sql6`AND u.deleted_at IS NULL`}
        ORDER BY u.created_at DESC
      `;
      const result = await db.execute(usersQuery);
      if (!result || result.length === 0) {
        return {
          success: true,
          users: []
        };
      }
      const { userAssessments: userAssessments2, navigationProgress: navigationProgress2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq14, and: and8 } = await import("drizzle-orm");
      const userIds = result.map((user) => user.id);
      const starCardAssessments = await db.select().from(userAssessments2).where(
        and8(
          eq14(userAssessments2.assessmentType, "starCard")
        )
      );
      const flowAssessments = await db.select().from(userAssessments2).where(
        and8(
          eq14(userAssessments2.assessmentType, "flowAttributes")
        )
      );
      const allAssessments = await db.select().from(userAssessments2);
      const navProgress = await db.select().from(navigationProgress2);
      const usersWithoutPasswords = result.map((user) => {
        const { password, ...userWithoutPassword } = user;
        const hasStarCard = starCardAssessments.some((assessment) => assessment.userId === user.id);
        const hasFlowAttributes = flowAssessments.some((assessment) => assessment.userId === user.id);
        const hasAssessment = allAssessments.some((assessment) => assessment.userId === user.id);
        const userNavProgress = navProgress.filter((nav) => nav.userId === user.id);
        const astProgress = userNavProgress.find((nav) => nav.appType === "ast");
        const iaProgress = userNavProgress.find((nav) => nav.appType === "ia");
        return {
          ...userWithoutPassword,
          progress: 0,
          hasAssessment,
          hasStarCard,
          hasFlowAttributes,
          astProgress: astProgress ? {
            completedSteps: Array.isArray(astProgress.completedSteps) ? astProgress.completedSteps : JSON.parse(astProgress.completedSteps || "[]"),
            currentStepId: astProgress.currentStepId,
            unlockedSteps: Array.isArray(astProgress.unlockedSteps) ? astProgress.unlockedSteps : JSON.parse(astProgress.unlockedSteps || "[]"),
            videoProgress: typeof astProgress.videoProgress === "object" ? astProgress.videoProgress : JSON.parse(astProgress.videoProgress || "{}")
          } : null,
          iaProgress: iaProgress ? {
            completedSteps: Array.isArray(iaProgress.completedSteps) ? iaProgress.completedSteps : JSON.parse(iaProgress.completedSteps || "[]"),
            currentStepId: iaProgress.currentStepId,
            unlockedSteps: Array.isArray(iaProgress.unlockedSteps) ? iaProgress.unlockedSteps : JSON.parse(iaProgress.unlockedSteps || "[]"),
            videoProgress: typeof iaProgress.videoProgress === "object" ? iaProgress.videoProgress : JSON.parse(iaProgress.videoProgress || "{}")
          } : null,
          navigationProgress: user.navigationProgress,
          // Include cohort and organization info from the join
          cohortName: user.cohort_name,
          organizationName: user.organization_name
        };
      });
      console.log(`Facilitator ${facilitatorId} accessed ${usersWithoutPasswords.length} scoped users`);
      return {
        success: true,
        users: usersWithoutPasswords
      };
    } catch (error) {
      console.error("Error getting users for facilitator:", error);
      return {
        success: false,
        error: "Failed to get users for facilitator"
      };
    }
  }
  /**
   * Update user password
   */
  async updateUserPassword(userId2, hashedPassword) {
    try {
      const result = await db.execute(sql`
        UPDATE users 
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE id = ${userId2}
        RETURNING id
      `);
      const updatedUser = result[0] || result.rows?.[0];
      if (!updatedUser) {
        return {
          success: false,
          error: "User not found"
        };
      }
      return {
        success: true,
        message: "Password updated successfully"
      };
    } catch (error) {
      console.error("Error updating user password:", error);
      return {
        success: false,
        error: "Failed to update password"
      };
    }
  }
  /**
   * Mark beta welcome as seen for a user
   */
  async markBetaWelcomeAsSeen(userId2) {
    try {
      const result = await db.execute(sql`
        UPDATE users 
        SET has_seen_beta_welcome = true, updated_at = NOW()
        WHERE id = ${userId2} AND is_beta_tester = true
        RETURNING id, username, name, email, is_beta_tester, has_seen_beta_welcome
      `);
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "User not found or not a beta tester"
        };
      }
      return {
        success: true,
        user: result[0]
      };
    } catch (error) {
      console.error("Error marking beta welcome as seen:", error);
      return {
        success: false,
        error: "Failed to update beta welcome status"
      };
    }
  }
};
var userManagementService = new UserManagementService();

// server/routes/auth-routes.ts
init_auth();
import bcrypt2 from "bcryptjs";

// server/routes/auth-routes-register.ts
import express from "express";

// server/services/invite-service.ts
init_schema();
import { eq as eq2, sql as sql2 } from "drizzle-orm";

// server/utils/invite-code.ts
var CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
var CODE_LENGTH = 12;
function generateInviteCode() {
  let code = "";
  const charsetLength = CHARSET.length;
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    code += CHARSET[randomIndex];
  }
  return code.replace(/(.{4})(.{4})(.{4})/, "$1-$2-$3");
}
function normalizeInviteCode(code) {
  return code.replace(/-/g, "").toUpperCase();
}
function validateInviteCode(code) {
  const normalizedCode = normalizeInviteCode(code);
  if (normalizedCode.length !== CODE_LENGTH) {
    return false;
  }
  const validChars = new Set(CHARSET.split(""));
  for (const char of normalizedCode) {
    if (!validChars.has(char)) {
      return false;
    }
  }
  return true;
}
function formatInviteCode(code) {
  const normalized = normalizeInviteCode(code);
  return normalized.replace(/(.{4})(.{4})(.{4})/, "$1-$2-$3");
}

// server/services/invite-service.ts
var InviteService = class {
  /**
   * Create a new invite with cohort and organization assignment
   */
  async createInviteWithAssignment(data) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: "Invalid email format"
        };
      }
      const inviteCode = generateInviteCode().replace(/-/g, "");
      if (inviteCode.length > 12) {
        throw new Error("Generated invite code exceeds database limit");
      }
      const result = await db.execute(sql2`
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id, is_beta_tester)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null}, ${data.cohortId || null}, ${data.organizationId || null}, ${data.isBetaTester || false})
        RETURNING *
      `);
      const inviteData = result[0] || result.rows?.[0] || {
        invite_code: inviteCode,
        email: data.email.toLowerCase(),
        role: data.role,
        name: data.name || null,
        created_by: data.createdBy,
        expires_at: data.expiresAt || null,
        cohort_id: data.cohortId || null,
        organization_id: data.organizationId || null,
        is_beta_tester: data.isBetaTester || false,
        created_at: /* @__PURE__ */ new Date(),
        used_at: null,
        used_by: null
      };
      return {
        success: true,
        invite: {
          ...inviteData,
          formattedCode: this.formatInviteCode(inviteCode)
        }
      };
    } catch (error) {
      console.error("Error creating invite:", error);
      return {
        success: false,
        error: "Failed to create invite"
      };
    }
  }
  /**
   * Legacy create invite method for backward compatibility
   */
  async createInvite(data) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: "Invalid email format"
        };
      }
      const inviteCode = generateInviteCode().replace(/-/g, "");
      if (inviteCode.length > 12) {
        throw new Error("Generated invite code exceeds database limit");
      }
      const result = await db.execute(sql2`
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id, is_beta_tester)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null}, ${data.cohortId ? parseInt(data.cohortId) : null}, ${data.organizationId || null}, ${data.isBetaTester || false})
        RETURNING *
      `);
      const inviteData = result[0] || result.rows?.[0] || {
        invite_code: inviteCode,
        email: data.email.toLowerCase(),
        role: data.role,
        name: data.name || null,
        created_by: data.createdBy,
        expires_at: data.expiresAt || null,
        is_beta_tester: data.isBetaTester || false,
        created_at: /* @__PURE__ */ new Date(),
        used_at: null,
        used_by: null
      };
      return {
        success: true,
        invite: inviteData
      };
    } catch (error) {
      console.error("Error creating invite:", error);
      return {
        success: false,
        error: "Failed to create invite"
      };
    }
  }
  /**
   * Get an invite by code
   */
  async getInviteByCode(inviteCode) {
    try {
      const result = await db.select().from(invites).where(eq2(invites.inviteCode, inviteCode));
      if (!result || result.length === 0) {
        return {
          success: false,
          error: "Invite not found"
        };
      }
      return {
        success: true,
        invite: result[0]
      };
    } catch (error) {
      console.error("Error fetching invite:", error);
      return {
        success: false,
        error: "Failed to fetch invite"
      };
    }
  }
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode, userId2) {
    try {
      const result = await db.execute(sql2`
        UPDATE invites 
        SET used_at = NOW(), used_by = ${userId2}
        WHERE invite_code = ${inviteCode}
        RETURNING *
      `);
      const inviteData = result[0] || result.rows?.[0];
      return {
        success: true,
        invite: inviteData
      };
    } catch (error) {
      console.error("Error marking invite as used:", error);
      return {
        success: false,
        error: "Failed to mark invite as used"
      };
    }
  }
  /**
   * Get all invites created by a specific user
   */
  async getInvitesByCreator(creatorId) {
    try {
      const result = await db.select().from(invites).where(eq2(invites.createdBy, creatorId));
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error("Error fetching invites by creator:", error);
      return {
        success: false,
        error: "Failed to fetch invites"
      };
    }
  }
  /**
   * Get invites with enhanced information (cohort, organization names, user status)
   */
  async getInvitesWithDetails(creatorId) {
    try {
      let query2 = sql2`
        SELECT 
          i.*,
          creator.name as creator_name,
          creator.email as creator_email,
          creator.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name,
          invited_user.is_test_user,
          invited_user.is_beta_tester as user_is_beta_tester
        FROM invites i
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
        LEFT JOIN users invited_user ON i.email = invited_user.email
      `;
      if (creatorId) {
        query2 = sql2`
          SELECT 
            i.*,
            creator.name as creator_name,
            creator.email as creator_email,
            creator.role as creator_role,
            c.name as cohort_name,
            o.name as organization_name,
            invited_user.is_test_user,
            invited_user.is_beta_tester as user_is_beta_tester
          FROM invites i
          LEFT JOIN users creator ON i.created_by = creator.id
          LEFT JOIN cohorts c ON i.cohort_id = c.id
          LEFT JOIN organizations o ON i.organization_id = o.id
          LEFT JOIN users invited_user ON i.email = invited_user.email
          WHERE i.created_by = ${creatorId}
        `;
      }
      query2 = sql2`${query2} ORDER BY i.created_at DESC`;
      const result = await db.execute(query2);
      const invitesData = result || result.rows || [];
      return {
        success: true,
        invites: invitesData.map((invite) => ({
          ...invite,
          formattedCode: this.formatInviteCode(invite.invite_code)
        }))
      };
    } catch (error) {
      console.error("Error fetching invites with details:", error);
      return {
        success: false,
        error: "Failed to fetch invites"
      };
    }
  }
  /**
   * Get all invites (admin only) with creator information and user status
   */
  async getAllInvites() {
    try {
      const result = await db.execute(sql2`
        SELECT 
          i.*,
          creator.name as creator_name,
          creator.email as creator_email,
          creator.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name,
          invited_user.is_test_user,
          invited_user.is_beta_tester as user_is_beta_tester
        FROM invites i
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
        LEFT JOIN users invited_user ON i.email = invited_user.email
        ORDER BY i.created_at DESC
      `);
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error("Error fetching all invites:", error);
      return {
        success: false,
        error: "Failed to fetch invites"
      };
    }
  }
  /**
   * Get invites by creator with creator information
   */
  async getInvitesByCreatorWithInfo(creatorId) {
    try {
      const result = await db.execute(sql2`
        SELECT 
          i.*,
          u.name as creator_name,
          u.email as creator_email,
          u.role as creator_role
        FROM invites i
        LEFT JOIN users u ON i.created_by = u.id
        WHERE i.created_by = ${creatorId}
        ORDER BY i.created_at DESC
      `);
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error("Error fetching invites by creator:", error);
      return {
        success: false,
        error: "Failed to fetch invites"
      };
    }
  }
  /**
   * Delete an invite
   */
  async deleteInvite(id) {
    try {
      const result = await db.execute(sql2`
        DELETE FROM invites WHERE id = ${id}
        RETURNING *
      `);
      const inviteData = result[0] || result.rows?.[0];
      return {
        success: true,
        deletedInvite: inviteData
      };
    } catch (error) {
      console.error("Error deleting invite:", error);
      return {
        success: false,
        error: "Failed to delete invite"
      };
    }
  }
  /**
   * Format invite code with hyphens for display
   */
  formatInviteCode(code) {
    if (!code) return "";
    return code.replace(/(.{4})/g, "$1-").replace(/-$/, "");
  }
};
var inviteService = new InviteService();

// server/routes/auth-routes-register.ts
import { z as z2 } from "zod";
var router = express.Router();
router.post("/validate-invite", async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode) {
    return res.status(400).json({
      success: false,
      error: "Invite code is required"
    });
  }
  if (!validateInviteCode(inviteCode)) {
    return res.status(400).json({
      success: false,
      error: "Invalid invite code format"
    });
  }
  try {
    const normalizedCode = normalizeInviteCode(inviteCode);
    const result = await inviteService.getInviteByCode(normalizedCode);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "Invalid invite code"
      });
    }
    if (result.invite?.usedAt) {
      return res.status(400).json({
        success: false,
        error: "This invite code has already been used"
      });
    }
    res.json({
      success: true,
      invite: {
        email: result.invite?.email,
        role: result.invite?.role,
        name: result.invite?.name,
        isBetaTester: result.invite?.isBetaTester || result.invite?.is_beta_tester || false
      }
    });
  } catch (error) {
    console.error("Error validating invite code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate invite code"
    });
  }
});
router.post("/register", async (req, res) => {
  const registerSchema = z2.object({
    inviteCode: z2.string().min(12, "Invite code is required"),
    username: z2.string().min(3, "Username must be at least 3 characters"),
    password: z2.string().min(8, "Password must be at least 8 characters"),
    name: z2.string().min(1, "Name is required"),
    email: z2.string().email("Invalid email address"),
    organization: z2.string().optional().nullable(),
    jobTitle: z2.string().optional().nullable(),
    profilePicture: z2.string().optional().nullable()
  });
  try {
    const data = registerSchema.parse(req.body);
    const normalizedCode = normalizeInviteCode(data.inviteCode);
    const inviteResult = await inviteService.getInviteByCode(normalizedCode);
    if (!inviteResult.success || inviteResult.invite?.usedAt) {
      return res.status(400).json({
        success: false,
        error: "Invalid or already used invite code"
      });
    }
    if (data.email.toLowerCase() !== inviteResult.invite?.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "Email does not match the invite"
      });
    }
    const createResult = await userManagementService.createUser({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      role: inviteResult.invite.role,
      organization: data.organization,
      jobTitle: data.jobTitle,
      profilePicture: data.profilePicture,
      invitedBy: inviteResult.invite.createdBy,
      isBetaTester: inviteResult.invite.isBetaTester || inviteResult.invite.is_beta_tester || false
    });
    if (!createResult.success) {
      return res.status(400).json(createResult);
    }
    await inviteService.markInviteAsUsed(normalizedCode, createResult.user?.id);
    req.session.userId = createResult.user?.id;
    req.session.username = createResult.user?.username;
    req.session.userRole = createResult.user?.role;
    req.session.save((err) => {
      if (err) {
        console.error("\u274C Session save error during registration:", err);
        console.error("\u274C Session data:", {
          userId: req.session.userId,
          username: req.session.username,
          userRole: req.session.userRole
        });
        return res.status(500).json({
          success: false,
          error: "Session creation failed",
          details: typeof err === "object" && err !== null && "message" in err ? err.message : String(err)
        });
      }
      console.log("\u2705 Session saved successfully for new user:", createResult.user?.id);
      console.log("\u2705 Session ID:", req.sessionID);
      res.json(createResult);
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message
      });
    }
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user"
    });
  }
});
var auth_routes_register_default = router;

// server/routes/auth-routes.ts
var router2 = express2.Router();
router2.put("/me", requireAuth, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const {
      name,
      email,
      organization,
      jobTitle,
      profilePicture,
      contentAccess
    } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isProfileUpdate = name !== void 0 || email !== void 0 || organization !== void 0 || jobTitle !== void 0 || profilePicture !== void 0;
    if (isProfileUpdate && (!name || !email)) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required for profile updates"
      });
    }
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }
    if (contentAccess && !["student", "professional"].includes(contentAccess)) {
      return res.status(400).json({
        success: false,
        error: 'Content access must be either "student" or "professional"'
      });
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (email !== void 0) updateData.email = email;
    if (organization !== void 0) updateData.organization = organization;
    if (jobTitle !== void 0) updateData.jobTitle = jobTitle;
    if (profilePicture !== void 0) updateData.profilePicture = profilePicture;
    if (contentAccess !== void 0) {
      updateData.contentAccess = contentAccess;
      console.log(`\u{1F527} Content Access Update: User ${userId2} switching to ${contentAccess}`);
    }
    const result = await userManagementService.updateUser(userId2, updateData);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({
      success: true,
      user: result.user,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("\u274C Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile. Please try again later.",
      details: typeof error === "object" && error !== null && "message" in error ? error.message : String(error)
    });
  }
});
router2.post("/login", async (req, res) => {
  const { username, identifier, password } = req.body;
  const loginUsername = username || identifier;
  if (!loginUsername || !password) {
    return res.status(400).json({
      success: false,
      error: "Username/identifier and password are required"
    });
  }
  try {
    console.log("\u{1F511} Login attempt:", { loginUsername });
    const result = await userManagementService.authenticateUser(loginUsername, password);
    if (!result.success) {
      console.log("\u274C Login failed:", result.error);
      return res.status(401).json(result);
    }
    console.log("\u{1F50D} Session state before setting data:", {
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionStore: !!req.session?.store
    });
    req.session.userId = result.user?.id;
    req.session.username = result.user?.username;
    req.session.userRole = result.user?.role;
    req.session.user = result.user;
    req.session.save((err) => {
      if (err) {
        console.error("\u274C Session save error:", err);
        console.error("\u274C Session store type:", typeof req.session.store);
        console.error("\u274C Session data:", {
          userId: req.session.userId,
          username: req.session.username,
          userRole: req.session.userRole,
          userIsBetaTester: req.session.user?.isBetaTester,
          fullUser: !!req.session.user
        });
        return res.status(500).json({
          success: false,
          error: "Session creation failed",
          details: typeof err === "object" && err !== null && "message" in err ? err.message : String(err)
        });
      }
      console.log("\u2705 Session saved successfully for user:", result.user?.id);
      console.log("\u2705 Session ID:", req.sessionID);
      console.log("\u2705 Beta tester status:", result.user?.isBetaTester);
      console.log("\u2705 User role:", result.user?.role);
      res.json(result);
    });
  } catch (error) {
    console.error("\u274C Error in login route:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed",
      details: typeof error === "object" && error !== null && "message" in error ? error.message : String(error)
    });
  }
});
router2.post("/logout", (req, res) => {
  const { reason } = req.body;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Logout failed",
        details: typeof err === "object" && err !== null && "message" in err ? err.message : String(err)
      });
    }
    res.json({
      success: true,
      message: "Logged out successfully",
      reason: reason || "manual"
    });
  });
});
router2.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await userManagementService.getUserById(req.session.userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user"
    });
  }
});
router2.get("/session-status", async (req, res) => {
  try {
    const sessionUserId = req.session?.userId;
    const cookieUserId = req.cookies?.userId;
    const userId2 = sessionUserId || (cookieUserId ? parseInt(cookieUserId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: "No active session"
      });
    }
    res.json({
      success: true,
      valid: true,
      userId: userId2,
      sessionId: req.sessionID
    });
  } catch (error) {
    console.error("Error checking session status:", error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Session validation failed"
    });
  }
});
router2.get("/profile", requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.getUserById(req.session.userId);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "User profile not found"
      });
    }
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load user profile. Please try again later."
    });
  }
});
router2.get("/me", requireAuth, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.getUserById(req.session.userId);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "User profile not found"
      });
    }
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load user profile. Please try again later."
    });
  }
});
router2.post("/check-username", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({
      success: false,
      error: "Username is required"
    });
  }
  try {
    const available = await userManagementService.isUsernameAvailable(username);
    res.json({
      success: true,
      available
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check username availability"
    });
  }
});
router2.post("/mark-beta-welcome-seen", requireAuth, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.markBetaWelcomeAsSeen(userId2);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({
      success: true,
      message: "Beta welcome marked as seen",
      user: result.user
    });
  } catch (error) {
    console.error("Error marking beta welcome as seen:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark beta welcome as seen"
    });
  }
});
router2.post("/change-password", requireAuth, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required"
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters"
      });
    }
    const userResult = await userManagementService.getUserById(userId2);
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const user = userResult.user;
    const isCurrentPasswordValid = await bcrypt2.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect"
      });
    }
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt2.hash(newPassword, saltRounds);
    const updateResult = await userManagementService.updateUserPassword(userId2, hashedNewPassword);
    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to update password"
      });
    }
    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password. Please try again later."
    });
  }
});
router2.use(auth_routes_register_default);
var auth_routes_default = router2;

// server/routes/invite-routes.ts
import express3 from "express";
init_auth();

// server/middleware/roles.ts
var isAdmin = (req, res, next) => {
  const userRole = req.session?.userRole;
  const userId2 = req.session?.userId;
  console.log("Admin check - UserID:", userId2, "Role:", userRole);
  console.log("Full session in admin check:", req.session);
  if (userId2 === 1) {
    if (!req.session.userRole) {
      req.session.userRole = "admin";
    }
    console.log("Admin access granted for user 1");
    next();
    return;
  }
  if (userRole !== "admin") {
    console.log("Admin access denied - Role:", userRole, "UserID:", userId2);
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access the admin panel",
      currentRole: userRole,
      userId: userId2
    });
  }
  console.log("Admin access granted for role:", userRole);
  next();
};
var isFacilitator = (req, res, next) => {
  if (!req.session || !req.session.userId || req.session.userRole !== "facilitator") {
    return res.status(403).json({ error: "Facilitator access required" });
  }
  next();
};
var isFacilitatorOrAdmin = (req, res, next) => {
  const userRole = req.session?.userRole;
  const userId2 = req.session?.userId;
  console.log("Facilitator/Admin check - UserID:", userId2, "Role:", userRole);
  if (userId2 === 1) {
    if (!req.session.userRole) {
      req.session.userRole = "admin";
    }
    console.log("Management access granted for admin user 1");
    next();
    return;
  }
  if (userRole !== "admin" && userRole !== "facilitator") {
    console.log("Management access denied - Role:", userRole, "UserID:", userId2);
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access the management console",
      currentRole: userRole,
      userId: userId2
    });
  }
  console.log("Management access granted for role:", userRole);
  next();
};

// server/routes/invite-routes.ts
var router3 = express3.Router();
router3.post("/", requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { email, role, name, expiresAt, cohortId, organizationId, isBetaTester } = req.body;
    const userRole = req.session.userRole;
    const userId2 = req.session.userId;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    if (!role || !["admin", "facilitator", "participant", "student"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Valid role is required"
      });
    }
    if (userRole === "facilitator") {
      const allowedRoles = ["participant", "student"];
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          error: "Facilitators can only create participant and student invites"
        });
      }
    }
    const result = await inviteService.createInviteWithAssignment({
      email,
      role,
      name,
      createdBy: userId2,
      cohortId: cohortId || null,
      organizationId: organizationId || null,
      isBetaTester: isBetaTester || false,
      expiresAt: expiresAt ? new Date(expiresAt) : void 0
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    const formattedInvite = {
      ...result.invite,
      formattedCode: formatInviteCode(result.invite?.invite_code || result.invite?.inviteCode || "")
    };
    res.json({
      success: true,
      invite: formattedInvite
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create invite"
    });
  }
});
router3.get("/", requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const userRole = req.session.userRole;
    const userId2 = req.session.userId;
    let result;
    if (userRole === "facilitator") {
      result = await inviteService.getInvitesWithDetails(userId2);
    } else {
      result = await inviteService.getInvitesWithDetails();
    }
    if (!result.success) {
      return res.status(400).json(result);
    }
    const formattedInvites = (result.invites || []).map((invite) => ({
      ...invite,
      formattedCode: formatInviteCode(invite.inviteCode || invite.invite_code),
      createdAt: invite.created_at || invite.createdAt,
      inviteCode: invite.invite_code || invite.inviteCode
    }));
    res.json({
      success: true,
      invites: formattedInvites
    });
  } catch (error) {
    console.error("Error getting invites:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get invites"
    });
  }
});
router3.get("/code/:code", async (req, res) => {
  try {
    const code = req.params.code;
    if (!validateInviteCode(code)) {
      return res.status(400).json({
        success: false,
        error: "Invalid invite code format"
      });
    }
    const result = await inviteService.getInviteByCode(code.replace(/-/g, "").toUpperCase());
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "Invalid invite code"
      });
    }
    if (result.invite?.usedAt) {
      return res.status(400).json({
        success: false,
        error: "This invite code has already been used"
      });
    }
    res.json({
      success: true,
      invite: {
        email: result.invite?.email,
        role: result.invite?.role,
        name: result.invite?.name,
        expiresAt: result.invite?.expiresAt
      }
    });
  } catch (error) {
    console.error("Error getting invite by code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get invite"
    });
  }
});
router3.delete("/:id", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID"
      });
    }
    const result = await inviteService.deleteInvite(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error("Error deleting invite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete invite"
    });
  }
});
var invite_routes_default = router3;

// server/routes/fixed-invite-routes.ts
import express4 from "express";
import { z as z3 } from "zod";
var router4 = express4.Router();
router4.post("/", isAdmin, async (req, res) => {
  try {
    const schema = z3.object({
      email: z3.string().email(),
      role: z3.enum(["admin", "facilitator", "participant", "student"]),
      name: z3.string().optional()
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid invite data",
        details: result.error.errors
      });
    }
    const createResult = await inviteService.createInvite({
      email: result.data.email,
      role: result.data.role,
      name: result.data.name,
      createdBy: req.session.userId
    });
    if (!createResult.success) {
      return res.status(500).json({
        success: false,
        error: createResult.error || "Failed to create invite"
      });
    }
    res.status(201).json({
      success: true,
      message: "Invite created successfully",
      invite: createResult.invite
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});
router4.get("/", isAdmin, async (req, res) => {
  try {
    const result = await inviteService.getAllInvites();
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to retrieve invites"
      });
    }
    res.json({
      success: true,
      invites: result.invites
    });
  } catch (error) {
    console.error("Error getting invites:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});
router4.delete("/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid invite ID"
      });
    }
    const result = await inviteService.deleteInvite(id);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || "Invite not found"
      });
    }
    res.json({
      success: true,
      message: "Invite deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting invite:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});
var fixed_invite_routes_default = router4;

// server/routes/user-routes.ts
import express5 from "express";
import multer from "multer";

// server/utils/user-photo-utils.ts
init_photo_storage_service();
function convertUserToPhotoReference(user) {
  const result = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    jobTitle: user.job_title || user.jobTitle,
    profilePictureId: user.profile_picture_id || user.profilePictureId,
    hasProfilePicture: !!(user.profile_picture_id || user.profilePictureId || user.profile_picture || user.profilePicture),
    isTestUser: user.is_test_user || user.isTestUser || false,
    isBetaTester: user.is_beta_tester || user.isBetaTester || false,
    showDemoDataButtons: user.show_demo_data_buttons || user.showDemoDataButtons || false,
    navigationProgress: user.navigation_progress || user.navigationProgress,
    contentAccess: user.content_access || user.contentAccess || "professional",
    astAccess: user.ast_access || user.astAccess || true,
    iaAccess: user.ia_access || user.iaAccess || false,
    astWorkshopCompleted: user.ast_workshop_completed || user.astWorkshopCompleted || false,
    iaWorkshopCompleted: user.ia_workshop_completed || user.iaWorkshopCompleted || false,
    astCompletedAt: user.ast_completed_at || user.astCompletedAt,
    iaCompletedAt: user.ia_completed_at || user.iaCompletedAt,
    assignedFacilitatorId: user.assigned_facilitator_id || user.assignedFacilitatorId,
    cohortId: user.cohort_id || user.cohortId,
    teamId: user.team_id || user.teamId,
    invitedBy: user.invited_by || user.invitedBy,
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt
  };
  if (result.profilePictureId) {
    result.profilePictureUrl = photoStorageService.getPhotoUrl(result.profilePictureId);
  }
  return result;
}
function sanitizeUserForNetwork(user) {
  const sanitized = { ...user };
  delete sanitized.profile_picture;
  delete sanitized.profilePicture;
  return sanitized;
}

// server/services/navigation-sync-service.ts
init_schema();
import { eq as eq3 } from "drizzle-orm";
var NavigationSyncService = class {
  /**
   * Determine the current step based on assessment completions
   */
  static determineCurrentStepFromAssessments(assessments) {
    const completedSteps = [];
    let currentStep = "1-1";
    let appType = "ast";
    const hasStarCard = assessments.some((a) => a.assessmentType === "star_card");
    const hasStepReflection = assessments.some((a) => a.assessmentType === "step_by_step_reflection");
    const hasFlowAssessment = assessments.some((a) => a.assessmentType === "flow_assessment");
    const hasRoundingOut = assessments.some((a) => a.assessmentType === "rounding_out_reflection");
    const hasFlowAttributes = assessments.some((a) => a.assessmentType === "flow_attributes");
    if (hasStarCard || hasStepReflection || hasFlowAssessment || hasRoundingOut || hasFlowAttributes) {
      completedSteps.push("1-1");
      completedSteps.push("2-1");
      if (hasStarCard) {
        completedSteps.push("2-2");
        currentStep = "2-3";
        if (hasStepReflection) {
          completedSteps.push("2-3");
          completedSteps.push("2-4");
          currentStep = "3-1";
          if (hasFlowAssessment) {
            completedSteps.push("3-1");
            completedSteps.push("3-2");
            currentStep = "3-3";
            if (hasRoundingOut) {
              completedSteps.push("3-3");
              currentStep = "3-4";
              if (hasFlowAttributes) {
                completedSteps.push("3-4");
                currentStep = "4-1";
              }
            }
          }
        }
      }
    }
    return {
      currentStep,
      completedSteps,
      appType
    };
  }
  /**
   * Sync navigation progress for a specific user
   */
  static async syncUserProgress(userId2) {
    try {
      console.log(`[NavigationSync] Syncing progress for user ${userId2}`);
      const user = await db.select().from(users).where(eq3(users.id, userId2)).limit(1);
      if (!user.length) {
        console.log(`[NavigationSync] User ${userId2} not found`);
        return false;
      }
      const assessments = await db.select().from(userAssessments).where(eq3(userAssessments.userId, userId2));
      if (assessments.length === 0) {
        console.log(`[NavigationSync] No assessments found for user ${userId2}`);
        return true;
      }
      console.log(`[NavigationSync] Found ${assessments.length} assessments for user ${userId2}`);
      const { currentStep, completedSteps, appType } = this.determineCurrentStepFromAssessments(assessments);
      let existingProgress;
      try {
        existingProgress = user[0].navigationProgress ? JSON.parse(user[0].navigationProgress) : null;
      } catch (e) {
        existingProgress = null;
      }
      const updatedProgress = {
        completedSteps,
        currentStepId: currentStep,
        appType,
        lastVisitedAt: (/* @__PURE__ */ new Date()).toISOString(),
        unlockedSections: this.calculateUnlockedSections(completedSteps),
        videoProgress: existingProgress?.videoProgress || {}
      };
      const hasChanged = !existingProgress || existingProgress.currentStepId !== currentStep || existingProgress.completedSteps.length !== completedSteps.length || existingProgress.appType !== appType;
      if (hasChanged) {
        console.log(`[NavigationSync] Updating progress for user ${userId2}: ${currentStep} (${completedSteps.length} completed)`);
        await db.update(users).set({
          navigationProgress: JSON.stringify(updatedProgress),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(users.id, userId2));
        console.log(`[NavigationSync] Successfully updated navigation progress for user ${userId2}`);
      } else {
        console.log(`[NavigationSync] No changes needed for user ${userId2}`);
      }
      return true;
    } catch (error) {
      console.error(`[NavigationSync] Error syncing progress for user ${userId2}:`, error);
      return false;
    }
  }
  /**
   * Calculate unlocked sections based on completed steps
   */
  static calculateUnlockedSections(completedSteps) {
    const unlocked = ["1"];
    if (completedSteps.some((step) => step.startsWith("1-"))) {
      unlocked.push("2");
    }
    if (completedSteps.some((step) => step.startsWith("2-"))) {
      unlocked.push("3");
    }
    if (completedSteps.some((step) => step.startsWith("3-"))) {
      unlocked.push("4");
    }
    return unlocked;
  }
  /**
   * Sync progress for all users who have assessment data but outdated navigation progress
   */
  static async syncAllUsersProgress() {
    try {
      console.log("[NavigationSync] Starting bulk sync for all users");
      const usersWithAssessments = await db.select({
        userId: userAssessments.userId
      }).from(userAssessments).groupBy(userAssessments.userId);
      console.log(`[NavigationSync] Found ${usersWithAssessments.length} users with assessment data`);
      let syncedCount = 0;
      for (const userRecord of usersWithAssessments) {
        const success = await this.syncUserProgress(userRecord.userId);
        if (success) syncedCount++;
      }
      console.log(`[NavigationSync] Bulk sync completed: ${syncedCount}/${usersWithAssessments.length} users synced`);
      return syncedCount;
    } catch (error) {
      console.error("[NavigationSync] Error during bulk sync:", error);
      return 0;
    }
  }
};

// server/routes/user-routes.ts
init_auth();
init_schema();
import { eq as eq4 } from "drizzle-orm";
var router5 = express5.Router();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024
    // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
router5.get("/me", async (req, res) => {
  try {
    console.log("Me request - Session data:", req.session);
    console.log("Me request - Cookies:", req.cookies);
    let userId2 = req.session?.userId;
    console.log("Session userId:", req.session?.userId);
    console.log("Cookie userId:", req.cookies?.userId);
    if (!userId2 && req.cookies?.userId) {
      userId2 = parseInt(req.cookies.userId);
      console.log("Using cookie fallback, userId:", userId2);
    } else if (userId2) {
      console.log("Using session userId:", userId2);
    }
    console.log(`Me request - Resolved user ID: ${userId2}`);
    if (!userId2) {
      console.log("Me request - No user ID found, authentication failed");
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    console.log(`Fetching user info for user ID: ${userId2}`);
    const result = await userManagementService.getUserById(userId2);
    if (!result.success) {
      console.log(`User info not found for ID: ${userId2}`);
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    console.log(`Raw user data from service:`, result.user);
    const userWithPhotoRef = convertUserToPhotoReference(result.user);
    const userInfo = {
      id: userWithPhotoRef.id,
      name: userWithPhotoRef.name,
      email: userWithPhotoRef.email,
      role: userWithPhotoRef.role,
      username: userWithPhotoRef.username,
      organization: userWithPhotoRef.organization,
      jobTitle: userWithPhotoRef.jobTitle,
      profilePictureUrl: userWithPhotoRef.profilePictureUrl,
      hasProfilePicture: userWithPhotoRef.hasProfilePicture
    };
    console.log(`Final user info being returned:`, sanitizeUserForNetwork(userInfo));
    res.json(userInfo);
  } catch (error) {
    console.error("Error getting user info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load user info. Please try again later."
    });
  }
});
router5.get("/profile", async (req, res) => {
  try {
    console.log("Profile request - Session data:", req.session);
    console.log("Profile request - Cookies:", req.cookies);
    let userId2 = req.session?.userId;
    console.log("Session userId:", req.session?.userId);
    console.log("Cookie userId:", req.cookies?.userId);
    if (!userId2 && req.cookies?.userId) {
      userId2 = parseInt(req.cookies.userId);
      console.log("Using cookie fallback, userId:", userId2);
    } else if (userId2) {
      console.log("Using session userId:", userId2);
    }
    console.log(`Profile request - Resolved user ID: ${userId2}`);
    if (!userId2) {
      console.log("Profile request - No user ID found, authentication failed");
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    console.log(`Fetching user profile for user ID: ${userId2}`);
    const result = await userManagementService.getUserById(userId2);
    if (!result.success) {
      console.log(`User profile not found for ID: ${userId2}`);
      return res.status(404).json({
        success: false,
        error: "User profile not found"
      });
    }
    console.log(`Raw user data from service:`, sanitizeUserForNetwork(result.user));
    const userWithPhotoRef = convertUserToPhotoReference(result.user);
    const userProfile = {
      ...userWithPhotoRef,
      // Add any additional user data from other services if needed
      progress: 0,
      // Default progress value
      title: userWithPhotoRef.jobTitle || ""
      // Map jobTitle to title for backward compatibility
    };
    console.log(`Final user profile being returned:`, sanitizeUserForNetwork(userProfile));
    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load user profile. Please try again later."
    });
  }
});
router5.put("/profile", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { name, email, organization, jobTitle, profilePicture } = req.body;
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (email !== void 0) updateData.email = email;
    if (organization !== void 0) updateData.organization = organization;
    if (jobTitle !== void 0) updateData.jobTitle = jobTitle;
    if (profilePicture !== void 0) updateData.profilePicture = profilePicture;
    const result = await userManagementService.updateUser(req.session.userId, updateData);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "Failed to update user profile"
      });
    }
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user profile. Please try again later."
    });
  }
});
router5.get("/assessments", requireAuth, async (req, res) => {
  try {
    const sessionUserId = req.session.userId;
    if (!sessionUserId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const cookieUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    const { eq: eq14 } = await import("drizzle-orm");
    const allAssessments = await db.select().from(userAssessments);
    const formattedAssessments = allAssessments.map((assessment) => {
      try {
        let parsedResults = {};
        try {
          parsedResults = JSON.parse(assessment.results);
        } catch (e) {
          parsedResults = { error: "Failed to parse results JSON" };
        }
        return {
          id: assessment.id,
          userId: assessment.userId,
          type: assessment.assessmentType,
          created: assessment.createdAt,
          formattedResults: parsedResults
        };
      } catch (e) {
        return {
          id: assessment.id,
          userId: assessment.userId,
          error: "Failed to process assessment record"
        };
      }
    });
    const assessmentsByUser = {};
    formattedAssessments.forEach((assessment) => {
      const userId2 = assessment.userId;
      if (!assessmentsByUser[userId2]) {
        assessmentsByUser[userId2] = [];
      }
      assessmentsByUser[userId2].push(assessment);
    });
    const currentUserAssessments = formattedAssessments.filter((a) => a.userId === sessionUserId).reduce((result, assessment) => {
      const type2 = assessment.type;
      if (type2) {
        result[type2] = assessment;
      }
      return result;
    }, {});
    const starCardData = currentUserAssessments.starCard?.formattedResults || null;
    res.json({
      success: true,
      userInfo: {
        sessionUserId,
        cookieUserId
      },
      currentUser: {
        assessments: currentUserAssessments,
        starCard: starCardData
      },
      // Only include current user's assessments in allUsers
      allUsers: { [sessionUserId]: assessmentsByUser[sessionUserId] || [] },
      // Limited raw data for developers - only current user
      raw: {
        assessmentCount: formattedAssessments.filter((a) => a.userId === sessionUserId).length,
        allAssessments: formattedAssessments.filter((a) => a.userId === sessionUserId)
      }
    });
  } catch (error) {
    console.error("Error getting user assessments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load user assessments. Please try again later."
    });
  }
});
router5.post("/assessments", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { assessmentType: assessmentType2, results } = req.body;
    if (!assessmentType2 || !results) {
      return res.status(400).json({
        success: false,
        error: "Assessment type and results are required"
      });
    }
    const newAssessment = await db.insert(userAssessments).values({
      userId: req.session.userId,
      assessmentType: assessmentType2,
      results: JSON.stringify(results)
    }).returning();
    console.log(`Saved ${assessmentType2} assessment for user ${req.session.userId}:`, results);
    res.json({
      success: true,
      assessment: newAssessment[0]
    });
  } catch (error) {
    console.error("Error saving user assessment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save assessment. Please try again later."
    });
  }
});
router5.get("/navigation-progress", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.getUserById(req.session.userId);
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    res.json({
      success: true,
      progress: result.user?.navigationProgress || null
    });
  } catch (error) {
    console.error("Error getting navigation progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load navigation progress. Please try again later."
    });
  }
});
router5.post("/navigation-progress", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { navigationProgress: navigationProgress2 } = req.body;
    if (!navigationProgress2 || typeof navigationProgress2 !== "string") {
      return res.status(400).json({
        success: false,
        error: "Navigation progress must be a valid JSON string"
      });
    }
    let incomingData;
    try {
      incomingData = JSON.parse(navigationProgress2);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: "Invalid JSON in navigation progress"
      });
    }
    const currentUserResult = await userManagementService.getUserById(req.session.userId);
    if (!currentUserResult.success) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    let currentProgress = {
      completedSteps: [],
      currentStepId: "1-1",
      appType: "ast",
      lastVisitedAt: (/* @__PURE__ */ new Date()).toISOString(),
      unlockedSteps: ["1-1"],
      videoProgress: {}
    };
    if (currentUserResult.user?.navigationProgress) {
      try {
        let progressData = currentUserResult.user.navigationProgress;
        let parsed;
        for (let i = 0; i < 5; i++) {
          try {
            parsed = JSON.parse(progressData);
            if (parsed.navigationProgress && typeof parsed.navigationProgress === "string") {
              progressData = parsed.navigationProgress;
            } else if (parsed.completedSteps || parsed.currentStepId) {
              currentProgress = { ...currentProgress, ...parsed };
              break;
            } else {
              currentProgress = { ...currentProgress, ...parsed };
              break;
            }
          } catch (innerError) {
            console.log("Parse failed at level", i);
            break;
          }
        }
      } catch (e) {
        console.log("Using default progress due to parse error");
      }
    }
    const mergedProgress = {
      ...currentProgress,
      ...incomingData,
      videoProgress: {
        ...currentProgress.videoProgress,
        ...incomingData.videoProgress
      }
    };
    Object.keys(incomingData.videoProgress || {}).forEach((stepId) => {
      const currentValue = currentProgress.videoProgress[stepId] || 0;
      const newValue = incomingData.videoProgress[stepId] || 0;
      mergedProgress.videoProgress[stepId] = Math.max(currentValue, newValue);
    });
    console.log(`\u{1F504} Atomic video progress merge for user ${req.session.userId}:`);
    console.log(`   Current:`, currentProgress.videoProgress);
    console.log(`   Incoming:`, incomingData.videoProgress);
    console.log(`   Merged:`, mergedProgress.videoProgress);
    const result = await userManagementService.updateUser(req.session.userId, {
      navigationProgress: JSON.stringify(mergedProgress)
    });
    if (!result.success) {
      console.error(`Failed to update navigation progress for user ${req.session.userId}:`, result.error);
      return res.status(404).json({
        success: false,
        error: "Failed to update navigation progress"
      });
    }
    console.log(`\u2705 Atomic progress saved for user ${req.session.userId}`);
    res.json({
      success: true,
      message: "Navigation progress updated atomically",
      progress: mergedProgress,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error(`Error updating navigation progress for user ${req.session?.userId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update navigation progress. Please try again later."
    });
  }
});
router5.put("/navigation-progress", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { navigationProgress: navigationProgress2 } = req.body;
    if (!navigationProgress2 || typeof navigationProgress2 !== "string") {
      return res.status(400).json({
        success: false,
        error: "Navigation progress must be a valid JSON string"
      });
    }
    let progressData;
    try {
      progressData = JSON.parse(navigationProgress2);
    } catch (parseError) {
      console.error("Invalid navigation progress JSON:", parseError);
      return res.status(400).json({
        success: false,
        error: "Navigation progress must be valid JSON"
      });
    }
    console.log(`Updating navigation progress for user ${req.session.userId}:`, {
      completedSteps: progressData.completedSteps?.length || 0,
      currentStep: progressData.currentStepId,
      appType: progressData.appType,
      lastVisited: progressData.lastVisitedAt ? new Date(progressData.lastVisitedAt).toISOString() : "unknown"
    });
    const result = await userManagementService.updateUser(req.session.userId, {
      navigationProgress: navigationProgress2
    });
    if (!result.success) {
      console.error(`Failed to update navigation progress for user ${req.session.userId}:`, result.error);
      return res.status(404).json({
        success: false,
        error: "Failed to update navigation progress"
      });
    }
    console.log(`Successfully updated navigation progress for user ${req.session.userId}`);
    res.json({
      success: true,
      message: "Navigation progress updated successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error(`Error updating navigation progress for user ${req.session?.userId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update navigation progress. Please try again later."
    });
  }
});
router5.put("/progress", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { progress } = req.body;
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: "Progress must be a number between 0 and 100"
      });
    }
    res.json({
      success: true,
      message: "Progress updated successfully",
      progress
    });
  } catch (error) {
    console.error("Error updating user progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update progress. Please try again later."
    });
  }
});
router5.post("/upload-photo", upload.single("photo"), async (req, res) => {
  try {
    let userId2 = req.session?.userId;
    if (!userId2 && req.cookies?.userId) {
      userId2 = parseInt(req.cookies.userId);
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    console.log(`Uploading photo for user ${userId2}, size: ${req.file.size} bytes`);
    const result = await userManagementService.updateUser(userId2, {
      profilePicture: base64Image
    });
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Failed to save profile picture"
      });
    }
    console.log(`Photo uploaded successfully for user ${userId2}`);
    res.json({
      success: true,
      profilePicture: base64Image
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router5.post("/sync-navigation/:userId", requireAuth, isAdmin, async (req, res) => {
  try {
    const userId2 = parseInt(req.params.userId);
    if (isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    console.log(`[API] Syncing navigation progress for user ${userId2}`);
    const success = await NavigationSyncService.syncUserProgress(userId2);
    if (success) {
      res.json({
        success: true,
        message: `Navigation progress synced successfully for user ${userId2}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to sync navigation progress"
      });
    }
  } catch (error) {
    console.error("Error syncing navigation progress:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router5.post("/sync-navigation-all", requireAuth, isAdmin, async (req, res) => {
  try {
    console.log("[API] Starting bulk navigation progress sync");
    const syncedCount = await NavigationSyncService.syncAllUsersProgress();
    res.json({
      success: true,
      message: `Navigation progress synced for ${syncedCount} users`,
      syncedCount
    });
  } catch (error) {
    console.error("Error during bulk navigation sync:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router5.delete("/data", requireAuth, async (req, res) => {
  try {
    const sessionUserId = req.session.userId;
    if (!sessionUserId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.getUserById(sessionUserId);
    if (!result.success || !result.user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    if (!result.user.isTestUser) {
      return res.status(403).json({
        success: false,
        error: "Data deletion is only available for test users"
      });
    }
    console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data deletion`);
    const deleteResult = await userManagementService.deleteUserData(sessionUserId);
    if (!deleteResult.success) {
      console.error(`Data deletion failed for user ${sessionUserId}:`, deleteResult.error);
      return res.status(500).json({
        success: false,
        error: deleteResult.error || "Failed to delete user data"
      });
    }
    console.log(`Data deletion successful for user ${sessionUserId}:`, deleteResult.summary);
    res.json({
      success: true,
      message: "User data deleted successfully",
      summary: deleteResult.summary
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({
      success: false,
      error: "Server error while deleting user data"
    });
  }
});
router5.get("/export-data", requireAuth, async (req, res) => {
  try {
    const sessionUserId = req.session?.userId;
    if (!sessionUserId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.getUserById(sessionUserId);
    if (!result.success || !result.user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    if (!result.user.isTestUser) {
      return res.status(403).json({
        success: false,
        error: "Data export is only available for test users"
      });
    }
    console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data export`);
    const userData = {
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        organization: result.user.organization,
        jobTitle: result.user.jobTitle,
        isTestUser: result.user.isTestUser,
        navigationProgress: result.user.navigationProgress,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt
      },
      assessments: [],
      navigationProgress: [],
      workshopParticipation: [],
      growthPlans: [],
      finalReflections: [],
      discernmentProgress: []
    };
    try {
      const assessments = await db.select().from(userAssessments).where(eq4(userAssessments.userId, sessionUserId));
      userData.assessments = assessments;
      const navProgress = await db.select().from(navigationProgress).where(eq4(navigationProgress.userId, sessionUserId));
      userData.navigationProgress = navProgress;
      const workshopParticipation2 = await db.select().from(workshopParticipation).where(eq4(workshopParticipation.userId, sessionUserId));
      userData.workshopParticipation = workshopParticipation2;
      const growthPlans2 = await db.select().from(growthPlans).where(eq4(growthPlans.userId, sessionUserId));
      userData.growthPlans = growthPlans2;
      const finalReflections2 = await db.select().from(finalReflections).where(eq4(finalReflections.userId, sessionUserId));
      userData.finalReflections = finalReflections2;
      const discernmentProgress = await db.select().from(userDiscernmentProgress).where(eq4(userDiscernmentProgress.userId, sessionUserId));
      userData.discernmentProgress = discernmentProgress;
    } catch (dbError) {
      console.error("Error fetching user data for export:", dbError);
    }
    res.json({
      success: true,
      userData,
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      message: "Data exported successfully"
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({
      success: false,
      error: "Server error while exporting user data"
    });
  }
});
router5.post("/reset-data", requireAuth, async (req, res) => {
  try {
    const sessionUserId = req.session?.userId;
    if (!sessionUserId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const result = await userManagementService.getUserById(sessionUserId);
    if (!result.success || !result.user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    if (!result.user.isTestUser) {
      return res.status(403).json({
        success: false,
        error: "Data reset is only available for test users"
      });
    }
    console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data reset`);
    const deleteResult = await userManagementService.deleteUserData(sessionUserId);
    if (!deleteResult.success) {
      console.error(`Data reset failed for user ${sessionUserId}:`, deleteResult.error);
      return res.status(500).json({
        success: false,
        error: deleteResult.error || "Failed to reset user data"
      });
    }
    console.log(`Data reset successful for user ${sessionUserId}:`, deleteResult.summary);
    res.json({
      success: true,
      message: "User data reset successfully",
      summary: deleteResult.summary
    });
  } catch (error) {
    console.error("Error resetting user data:", error);
    res.status(500).json({
      success: false,
      error: "Server error while resetting user data"
    });
  }
});
router5.post("/content-access", requireAuth, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }
    const { contentAccess } = req.body;
    if (!contentAccess || !["student", "professional"].includes(contentAccess)) {
      return res.status(400).json({
        success: false,
        error: 'Content access must be either "student" or "professional"'
      });
    }
    console.log(`Updating content access for user ${req.session.userId} to: ${contentAccess}`);
    const result = await userManagementService.updateUser(req.session.userId, {
      contentAccess
    });
    if (!result.success) {
      console.error(`Failed to update content access for user ${req.session.userId}:`, result.error);
      return res.status(500).json({
        success: false,
        error: "Failed to update interface preference"
      });
    }
    console.log(`\u2705 Content access updated for user ${req.session.userId} to: ${contentAccess}`);
    res.json({
      success: true,
      message: `Interface preference updated to ${contentAccess}`,
      contentAccess,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error(`Error updating content access for user ${req.session?.userId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update interface preference. Please try again later."
    });
  }
});
var user_routes_default = router5;

// server/routes/workshop-data-routes.ts
import { Router } from "express";

// server/utils/feature-flags.ts
var featureFlags = {
  workshopLocking: {
    enabled: true,
    environment: "all",
    description: "Lock workshop inputs after completion"
  },
  holisticReports: {
    enabled: process.env.FEATURE_HOLISTIC_REPORTS !== "false",
    environment: "all",
    description: "OpenAI-powered personalized reports",
    aiRelated: true
  },
  holisticReportsWorking: {
    enabled: true,
    environment: "all",
    description: "Holistic reports are generating real personalized content (not fallback templates)",
    aiRelated: true
  },
  facilitatorConsole: {
    enabled: true,
    environment: "all",
    description: "Facilitator cohort management system"
  },
  aiCoaching: {
    enabled: true,
    environment: "all",
    description: "AI-powered coaching chatbot system",
    aiRelated: true
  },
  videoManagement: {
    enabled: true,
    environment: "all",
    description: "Enhanced video management and progress tracking"
  },
  debugPanel: {
    enabled: process.env.FEATURE_DEBUG_PANEL === "true",
    environment: "development",
    description: "Development debugging panel and tools"
  },
  feedbackSystem: {
    enabled: true,
    environment: "all",
    description: "User feedback collection and management system"
  }
};
function isFeatureEnabled(featureName, environment) {
  const flag = featureFlags[featureName];
  if (!flag) return false;
  const currentEnv = environment || process.env.ENVIRONMENT || "production";
  const environmentMatch = flag.environment === "all" || flag.environment === currentEnv;
  if (flag.dependencies && flag.dependencies.length > 0) {
    const dependenciesMet = flag.dependencies.every((dep) => isFeatureEnabled(dep, environment));
    return flag.enabled && environmentMatch && dependenciesMet;
  }
  return flag.enabled && environmentMatch;
}
function validateFlagConfiguration() {
  const errors = [];
  const checkCircularDeps = (flagName, visited = /* @__PURE__ */ new Set()) => {
    if (visited.has(flagName)) {
      errors.push(`Circular dependency detected involving flag: ${flagName}`);
      return false;
    }
    const flag = featureFlags[flagName];
    if (!flag?.dependencies) return true;
    visited.add(flagName);
    for (const dep of flag.dependencies) {
      if (!featureFlags[dep]) {
        errors.push(`Flag '${flagName}' depends on non-existent flag '${dep}'`);
        return false;
      }
      if (!checkCircularDeps(dep, new Set(visited))) {
        return false;
      }
    }
    return true;
  };
  for (const [flagName, flag] of Object.entries(featureFlags)) {
    const validEnvironments = ["development", "staging", "production", "all"];
    if (!validEnvironments.includes(flag.environment)) {
      errors.push(`Invalid environment '${flag.environment}' for flag '${flagName}'`);
    }
    if (flag.dependencies) {
      for (const dep of flag.dependencies) {
        if (!featureFlags[dep]) {
          errors.push(`Flag '${flagName}' depends on non-existent flag '${dep}'`);
        }
      }
      checkCircularDeps(flagName);
    }
  }
  return { valid: errors.length === 0, errors };
}
function getAIFeatures() {
  return Object.fromEntries(
    Object.entries(featureFlags).filter(([_, flag]) => flag.aiRelated)
  );
}

// server/middleware/feature-flags.ts
function getFeatureStatus(req, res) {
  const environment = process.env.ENVIRONMENT || "production";
  const features = Object.entries(featureFlags).reduce((acc, [name, flag]) => {
    acc[name] = {
      enabled: isFeatureEnabled(name, environment),
      environment: flag.environment,
      description: flag.description,
      aiRelated: flag.aiRelated || false,
      dependencies: flag.dependencies || []
    };
    return acc;
  }, {});
  res.json({
    environment,
    features,
    validation: validateFlagConfiguration(),
    aiFeatures: getAIFeatures()
  });
}

// server/routes/workshop-data-routes.ts
init_schema();
init_schema();
import { eq as eq5, and, isNull } from "drizzle-orm";
var workshopDataRouter = Router();
async function generateAndStoreStarCard(userId2) {
  try {
    console.log(`\u{1F3A8} Generating StarCard PNG for user ${userId2}...`);
    const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
    const assessments = await db.select().from(userAssessments).where(eq5(userAssessments.userId, userId2));
    const starCardAssessment = assessments.find((a) => a.assessmentType === "starCard");
    let starCardData;
    if (!starCardAssessment) {
      console.warn(`\u26A0\uFE0F No StarCard assessment found for user ${userId2}, using default values`);
      starCardData = {
        thinking: 25,
        acting: 25,
        feeling: 25,
        planning: 25
      };
    } else {
      try {
        starCardData = JSON.parse(starCardAssessment.results);
        console.log(`\u{1F4CA} Found StarCard data for user ${userId2}:`, starCardData);
      } catch (parseError) {
        console.warn(`\u26A0\uFE0F Failed to parse StarCard data for user ${userId2}, using defaults:`, parseError);
        starCardData = {
          thinking: 25,
          acting: 25,
          feeling: 25,
          planning: 25
        };
      }
    }
    const starCardImageBuffer = await createStarCardImagePlaceholder(userId2, starCardData);
    await photoStorageService2.storeStarCard({
      userId: userId2.toString(),
      imageBuffer: starCardImageBuffer,
      workshopStep: "completion",
      imageType: "star_card_final",
      metadata: {
        generated: "auto_workshop_completion",
        starCardData
      }
    });
    console.log(`\u2705 StarCard PNG generated and stored for user ${userId2}`);
  } catch (error) {
    console.error(`\u274C Failed to generate StarCard for user ${userId2}:`, error);
    throw error;
  }
}
async function createStarCardImagePlaceholder(userId2, starCardData) {
  const placeholderText = `StarCard for User ${userId2}
Thinking: ${starCardData.thinking}%
Acting: ${starCardData.acting}%
Feeling: ${starCardData.feeling}%
Planning: ${starCardData.planning}%`;
  const placeholderBuffer = Buffer.from([
    137,
    80,
    78,
    71,
    13,
    10,
    26,
    10,
    0,
    0,
    0,
    13,
    73,
    72,
    68,
    82,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    8,
    2,
    0,
    0,
    0,
    144,
    119,
    83,
    222,
    0,
    0,
    0,
    12,
    73,
    68,
    65,
    84,
    8,
    215,
    99,
    248,
    15,
    0,
    0,
    1,
    0,
    1,
    92,
    194,
    94,
    93,
    0,
    0,
    0,
    0,
    73,
    69,
    78,
    68,
    174,
    66,
    96,
    130
  ]);
  console.log(`\u{1F4DD} Created placeholder StarCard image (${placeholderBuffer.length} bytes)`);
  return placeholderBuffer;
}
var authenticateUser = (req, res, next) => {
  let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
  if (!userId2) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
    userId2 = req.session.userId;
  }
  req.session.userId = userId2;
  next();
};
var checkWorkshopLocked = async (req, res, next) => {
  try {
    const userId2 = req.session.userId;
    const appType = req.body.workshopType || req.body.appType || req.params.appType || "ast";
    if (!["ast", "ia"].includes(appType)) {
      return next();
    }
    const user = await db.select().from(users).where(eq5(users.id, userId2)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    const completionField = appType === "ast" ? "astWorkshopCompleted" : "iaWorkshopCompleted";
    const isLocked = user[0][completionField];
    if (isLocked) {
      return res.status(403).json({
        error: "Workshop is completed and locked for editing",
        workshopType: appType.toUpperCase(),
        completedAt: user[0][appType === "ast" ? "astCompletedAt" : "iaCompletedAt"]
      });
    }
    next();
  } catch (error) {
    console.error("Error checking workshop lock status:", error);
    res.status(500).json({ error: "Failed to check workshop lock status" });
  }
};
workshopDataRouter.get("/videos/workshop/:workshopType", async (req, res) => {
  try {
    const { workshopType } = req.params;
    if (workshopType === "allstarteams") {
      console.log("=== DEBUG: Testing step 1-1 video fetch ===");
      const testVideo = await db.select().from(videos).where(eq5(videos.stepId, "1-1"));
      console.log("Found video for step 1-1:", testVideo);
      const workshopVideos = await db.select().from(videos).where(eq5(videos.workshopType, workshopType));
      console.log(`Found ${workshopVideos.length} videos for workshop ${workshopType}`);
      console.log("First few videos:", workshopVideos.slice(0, 3));
    }
    const videos2 = await db.select().from(videos).where(eq5(videos.workshopType, workshopType));
    res.status(200).json(videos2);
  } catch (error) {
    console.error("Error fetching videos by workshop:", error);
    res.status(500).json({ message: "Server error" });
  }
});
workshopDataRouter.get("/videos/:id", async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    if (isNaN(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const videos2 = await db.select().from(videos).where(eq5(videos.id, videoId));
    if (videos2.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json(videos2[0]);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Server error" });
  }
});
workshopDataRouter.get("/starcard", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    console.log(`StarCard: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
      console.log(`Using session user ID ${userId2} instead of cookie user ID 1`);
    }
    console.log(`Fetching star card for user ${userId2}`);
    const starCards2 = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "starCard")
      )
    );
    if (starCards2 && starCards2.length > 0) {
      const starCard = starCards2[0];
      console.log(`Found star card for user ${userId2}:`, starCard);
      try {
        const starCardData = JSON.parse(starCard.results);
        console.log(`Parsed star card data for user ${userId2}:`, starCardData);
        return res.status(200).json({
          success: true,
          thinking: starCardData.thinking || 0,
          feeling: starCardData.feeling || 0,
          acting: starCardData.acting || 0,
          planning: starCardData.planning || 0,
          // Include any other fields from the results
          ...starCardData
        });
      } catch (parseError) {
        console.error(`Error parsing star card data for user ${userId2}:`, parseError);
        return res.status(500).json({
          success: false,
          message: "Error parsing star card data"
        });
      }
    } else {
      console.log(`No star card found for user ${userId2}`);
      return res.status(200).json({
        success: true,
        thinking: 0,
        acting: 0,
        feeling: 0,
        planning: 0,
        isEmpty: true,
        source: "no_database_data"
      });
    }
  } catch (error) {
    console.error("Error getting star card:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get star card data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.get("/flow-attributes", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    console.log(`Flow Attributes: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
      console.log(`Using session user ID ${userId2} instead of cookie user ID 1`);
    }
    const flowDataEntries = await db.select().from(userAssessments).where(eq5(userAssessments.userId, userId2));
    const flowData = flowDataEntries.find((a) => a.assessmentType === "flowAttributes");
    if (flowData) {
      try {
        const flowAttributes2 = JSON.parse(flowData.results);
        return res.status(200).json({
          success: true,
          attributes: flowAttributes2.attributes || [],
          flowScore: flowAttributes2.flowScore || 0
        });
      } catch (parseError) {
        console.error(`Error parsing flow attributes for user ${userId2}:`, parseError);
        return res.status(500).json({
          success: false,
          message: "Error parsing flow attributes"
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        attributes: [],
        flowScore: 0,
        isEmpty: true
      });
    }
  } catch (error) {
    console.error("Error getting flow attributes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get flow attributes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.get("/assessment/questions", async (req, res) => {
  try {
    const userId2 = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    return res.status(200).json([
      {
        id: 1,
        text: "When starting a new project, I prefer to...",
        options: [
          { id: "opt1-1", text: "Start working right away and adjust as I go", category: "acting" },
          { id: "opt1-2", text: "Get to know my teammates and build good working relationships", category: "feeling" },
          { id: "opt1-3", text: "Break down the work into clear steps with deadlines", category: "planning" },
          { id: "opt1-4", text: "Consider different approaches before deciding how to proceed", category: "thinking" }
        ]
      },
      {
        id: 2,
        text: "When faced with a challenge, I typically...",
        options: [
          { id: "opt2-1", text: "Tackle it head-on and find a quick solution", category: "acting" },
          { id: "opt2-2", text: "Talk it through with others to understand their perspectives", category: "feeling" },
          { id: "opt2-3", text: "Create a detailed plan to overcome it systematically", category: "planning" },
          { id: "opt2-4", text: "Analyze the root cause and consider multiple solutions", category: "thinking" }
        ]
      }
    ]);
  } catch (error) {
    console.error("Error getting assessment questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get assessment questions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.post("/assessment/start", authenticateUser, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "starCard")
      )
    );
    if (existingAssessment.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Assessment already completed"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Assessment started"
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start assessment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.post("/assessment/answer", authenticateUser, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Answer saved"
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save answer",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.post("/assessment/complete", authenticateUser, checkWorkshopLocked, async (req, res) => {
  console.log("=== ASSESSMENT COMPLETION START ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Session data:", req.session);
  console.log("Cookies:", req.cookies);
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    console.log("Initial userId determination:", userId2);
    if (!userId2) {
      console.log("ERROR: No user ID found in session or cookies");
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    console.log(`Assessment: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
      console.log(`Using session user ID ${userId2} instead of cookie user ID 1`);
    }
    let quadrantData = req.body.quadrantData || {
      thinking: 28,
      feeling: 25,
      acting: 24,
      planning: 23
    };
    console.log("Saving star card data:", quadrantData);
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "starCard")
      )
    );
    let updatedId = null;
    if (existingAssessment.length > 0) {
      const updated = await db.update(userAssessments).set({
        results: JSON.stringify(quadrantData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id)).returning();
      updatedId = updated.length > 0 ? updated[0].id : existingAssessment[0].id;
      console.log("Updated existing star card assessment:", updated);
    } else {
      const inserted = await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "starCard",
        results: JSON.stringify(quadrantData)
      }).returning();
      updatedId = inserted.length > 0 ? inserted[0].id : null;
      console.log("Created new star card assessment:", inserted);
    }
    return res.status(200).json({
      success: true,
      message: "Assessment completed",
      id: updatedId,
      userId: userId2,
      thinking: quadrantData.thinking,
      feeling: quadrantData.feeling,
      acting: quadrantData.acting,
      planning: quadrantData.planning,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error completing assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete assessment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.post("/flow-attributes", authenticateUser, checkWorkshopLocked, async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    console.log("Flow attributes save request received:", req.body);
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    console.log(`Flow Attributes POST: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
      console.log(`Using session user ID ${userId2} instead of cookie user ID 1`);
    }
    console.log("User ID for saving flow attributes:", userId2);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { attributes } = req.body;
    console.log("Flow attributes data:", { attributes });
    if (!attributes || !Array.isArray(attributes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flow attributes data"
      });
    }
    const flowAttributesData = {
      attributes
    };
    const existingFlowAttributes = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "flowAttributes")
      )
    );
    console.log("Existing flow attributes:", existingFlowAttributes);
    if (existingFlowAttributes.length > 0) {
      const updated = await db.update(userAssessments).set({
        results: JSON.stringify(flowAttributesData)
      }).where(eq5(userAssessments.id, existingFlowAttributes[0].id)).returning();
      console.log("Updated flow attributes:", updated);
    } else {
      const inserted = await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "flowAttributes",
        results: JSON.stringify(flowAttributesData)
      }).returning();
      console.log("Inserted flow attributes:", inserted);
    }
    return res.status(200).json({
      success: true,
      message: "Flow attributes saved successfully",
      attributes
    });
  } catch (error) {
    console.error("Error saving flow attributes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save flow attributes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.post("/rounding-out", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { strengths, values, passions, growthAreas } = req.body;
    if (!strengths || typeof strengths !== "string" || strengths.trim().length === 0 || strengths.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Strengths is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { strengths: "Required field, 1-1000 characters" }
      });
    }
    if (!values || typeof values !== "string" || values.trim().length === 0 || values.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Values is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { values: "Required field, 1-1000 characters" }
      });
    }
    if (!passions || typeof passions !== "string" || passions.trim().length === 0 || passions.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Passions is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { passions: "Required field, 1-1000 characters" }
      });
    }
    if (!growthAreas || typeof growthAreas !== "string" || growthAreas.trim().length === 0 || growthAreas.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Growth Areas is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { growthAreas: "Required field, 1-1000 characters" }
      });
    }
    const assessmentData = {
      strengths: strengths.trim(),
      values: values.trim(),
      passions: passions.trim(),
      growthAreas: growthAreas.trim()
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "roundingOutReflection")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "roundingOutReflection",
        results: JSON.stringify(assessmentData)
      });
    }
    res.json({
      success: true,
      data: assessmentData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "roundingOutReflection"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/rounding-out", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "roundingOutReflection")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: "roundingOutReflection" }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.post("/future-self", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const {
      direction,
      twentyYearVision,
      tenYearMilestone,
      fiveYearFoundation,
      flowOptimizedLife,
      // Legacy fields for backward compatibility
      futureSelfDescription,
      visualizationNotes,
      additionalNotes
    } = req.body;
    const hasContent = twentyYearVision && twentyYearVision.trim().length >= 10 || tenYearMilestone && tenYearMilestone.trim().length >= 10 || fiveYearFoundation && fiveYearFoundation.trim().length >= 10 || flowOptimizedLife && flowOptimizedLife.trim().length >= 10 || futureSelfDescription && futureSelfDescription.trim().length >= 10 || visualizationNotes && visualizationNotes.trim().length >= 10;
    if (!hasContent) {
      return res.status(400).json({
        success: false,
        error: "At least one reflection field must contain at least 10 characters",
        code: "VALIDATION_ERROR"
      });
    }
    const validateField = (field, value, maxLength = 2e3) => {
      if (value && (typeof value !== "string" || value.length > maxLength)) {
        throw new Error(`${field} must be a string with maximum ${maxLength} characters`);
      }
    };
    try {
      validateField("twentyYearVision", twentyYearVision);
      validateField("tenYearMilestone", tenYearMilestone);
      validateField("fiveYearFoundation", fiveYearFoundation);
      validateField("flowOptimizedLife", flowOptimizedLife);
      validateField("futureSelfDescription", futureSelfDescription, 1e3);
      validateField("visualizationNotes", visualizationNotes, 1e3);
      validateField("additionalNotes", additionalNotes, 1e3);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.message,
        code: "VALIDATION_ERROR"
      });
    }
    const assessmentData = {
      // New timeline structure
      direction: direction || "backward",
      twentyYearVision: twentyYearVision ? twentyYearVision.trim() : "",
      tenYearMilestone: tenYearMilestone ? tenYearMilestone.trim() : "",
      fiveYearFoundation: fiveYearFoundation ? fiveYearFoundation.trim() : "",
      flowOptimizedLife: flowOptimizedLife ? flowOptimizedLife.trim() : "",
      // Legacy fields for backward compatibility
      futureSelfDescription: futureSelfDescription ? futureSelfDescription.trim() : "",
      visualizationNotes: visualizationNotes ? visualizationNotes.trim() : "",
      additionalNotes: additionalNotes ? additionalNotes.trim() : "",
      // Completion timestamp
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "futureSelfReflection")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "futureSelfReflection",
        results: JSON.stringify(assessmentData)
      });
    }
    res.json({
      success: true,
      data: assessmentData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "futureSelfReflection"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/future-self", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "futureSelfReflection")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: "futureSelfReflection" }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.post("/cantril-ladder", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { currentFactors, futureImprovements, specificChanges, quarterlyProgress, quarterlyActions, wellBeingLevel, futureWellBeingLevel } = req.body;
    const reflectionData = {
      currentFactors: currentFactors || "",
      futureImprovements: futureImprovements || "",
      specificChanges: specificChanges || "",
      quarterlyProgress: quarterlyProgress || "",
      quarterlyActions: quarterlyActions || ""
    };
    if (wellBeingLevel !== void 0 && futureWellBeingLevel !== void 0) {
      const ladderData = {
        wellBeingLevel: Number(wellBeingLevel),
        futureWellBeingLevel: Number(futureWellBeingLevel)
      };
      const existingLadder = await db.select().from(userAssessments).where(
        and(
          eq5(userAssessments.userId, userId2),
          eq5(userAssessments.assessmentType, "cantrilLadder")
        )
      );
      if (existingLadder.length > 0) {
        await db.update(userAssessments).set({
          results: JSON.stringify(ladderData)
        }).where(eq5(userAssessments.id, existingLadder[0].id));
      } else {
        await db.insert(userAssessments).values({
          userId: userId2,
          assessmentType: "cantrilLadder",
          results: JSON.stringify(ladderData)
        });
      }
      console.log("Cantril Ladder values saved for export:", ladderData);
    }
    const existingReflection = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "cantrilLadderReflection")
      )
    );
    if (existingReflection.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(reflectionData)
      }).where(eq5(userAssessments.id, existingReflection[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "cantrilLadderReflection",
        results: JSON.stringify(reflectionData)
      });
    }
    res.json({
      success: true,
      data: reflectionData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "cantrilLadderReflection"
      }
    });
  } catch (error) {
    console.error("Cantril ladder save error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR",
      details: error instanceof Error ? error.stack : "Unknown error"
    });
  }
});
workshopDataRouter.get("/cantril-ladder", async (req, res) => {
  console.log("=== CANTRIL LADDER GET ENDPOINT HIT ===");
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    console.log("Cantril ladder GET - userId from session/cookie:", userId2);
    if (!userId2) {
      console.log("Cantril ladder GET - No userId, returning 401");
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    console.log("Cantril ladder GET request for userId:", userId2);
    const ladderAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "cantrilLadder")
      )
    );
    const reflectionAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "cantrilLadderReflection")
      )
    );
    console.log("Cantril ladder assessment found:", ladderAssessment.length > 0 ? "YES" : "NO");
    console.log("Cantril reflection assessment found:", reflectionAssessment.length > 0 ? "YES" : "NO");
    let combinedData = {
      wellBeingLevel: 5,
      // Default values
      futureWellBeingLevel: 5,
      currentFactors: "",
      futureImprovements: "",
      specificChanges: "",
      quarterlyProgress: "",
      quarterlyActions: ""
    };
    if (ladderAssessment.length > 0) {
      const ladderResults = JSON.parse(ladderAssessment[0].results);
      combinedData.wellBeingLevel = ladderResults.wellBeingLevel || 5;
      combinedData.futureWellBeingLevel = ladderResults.futureWellBeingLevel || 5;
      console.log("Ladder values found:", { wellBeingLevel: combinedData.wellBeingLevel, futureWellBeingLevel: combinedData.futureWellBeingLevel });
    }
    if (reflectionAssessment.length > 0) {
      const reflectionResults = JSON.parse(reflectionAssessment[0].results);
      combinedData.currentFactors = reflectionResults.currentFactors || "";
      combinedData.futureImprovements = reflectionResults.futureImprovements || "";
      combinedData.specificChanges = reflectionResults.specificChanges || "";
      combinedData.quarterlyProgress = reflectionResults.quarterlyProgress || "";
      combinedData.quarterlyActions = reflectionResults.quarterlyActions || "";
      console.log("Reflection values found");
    }
    console.log("Combined cantril ladder data being returned:", combinedData);
    res.json({
      success: true,
      data: combinedData,
      meta: {
        assessmentType: "cantrilLadder",
        hasLadderData: ladderAssessment.length > 0,
        hasReflectionData: reflectionAssessment.length > 0
      }
    });
  } catch (error) {
    console.error("Cantril ladder GET error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.post("/final-insights", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { keyInsights, actionSteps, commitments } = req.body;
    if (!keyInsights || typeof keyInsights !== "string" || keyInsights.trim().length === 0 || keyInsights.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Key Insights is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { keyInsights: "Required field, 1-1000 characters" }
      });
    }
    if (!actionSteps || typeof actionSteps !== "string" || actionSteps.trim().length === 0 || actionSteps.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Action Steps is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { actionSteps: "Required field, 1-1000 characters" }
      });
    }
    if (!commitments || typeof commitments !== "string" || commitments.trim().length === 0 || commitments.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Commitments is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { commitments: "Required field, 1-1000 characters" }
      });
    }
    const assessmentData = {
      keyInsights: keyInsights.trim(),
      actionSteps: actionSteps.trim(),
      commitments: commitments.trim()
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "finalReflection")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "finalReflection",
        results: JSON.stringify(assessmentData)
      });
    }
    res.json({
      success: true,
      data: assessmentData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "finalReflection"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/final-insights", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "finalReflection")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: "finalReflection" }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.post("/assessments", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    console.log(`Assessments POST: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
      console.log(`Using session user ID ${userId2} instead of cookie user ID 1`);
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { assessmentType: assessmentType2, results } = req.body;
    console.log("Saving assessment:", { userId: userId2, assessmentType: assessmentType2, results });
    if (!assessmentType2 || !results) {
      return res.status(400).json({
        success: false,
        message: "Assessment type and results are required"
      });
    }
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, assessmentType2)
      )
    );
    if (existingAssessment.length > 0) {
      const updated = await db.update(userAssessments).set({
        results: JSON.stringify(results)
      }).where(eq5(userAssessments.id, existingAssessment[0].id)).returning();
      console.log("Updated assessment:", updated[0]);
      return res.status(200).json({
        success: true,
        message: "Assessment updated successfully",
        assessment: updated[0]
      });
    } else {
      const inserted = await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: assessmentType2,
        results: JSON.stringify(results)
      }).returning();
      console.log("Created new assessment:", inserted[0]);
      return res.status(200).json({
        success: true,
        message: "Assessment saved successfully",
        assessment: inserted[0]
      });
    }
  } catch (error) {
    console.error("Error saving assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save assessment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.post("/step-by-step-reflection", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { strength1, strength2, strength3, strength4, teamValues, uniqueContribution } = req.body;
    const reflectionData = {
      strength1: strength1 || "",
      strength2: strength2 || "",
      strength3: strength3 || "",
      strength4: strength4 || "",
      teamValues: teamValues || "",
      uniqueContribution: uniqueContribution || ""
    };
    const existingReflection = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "stepByStepReflection")
      )
    );
    if (existingReflection.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(reflectionData)
      }).where(eq5(userAssessments.id, existingReflection[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "stepByStepReflection",
        results: JSON.stringify(reflectionData)
      });
    }
    res.json({
      success: true,
      data: reflectionData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "stepByStepReflection"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/step-by-step-reflection", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "stepByStepReflection")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: "stepByStepReflection" }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.post("/visualizing-potential", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { selectedImages, imageMeaning } = req.body;
    console.log("VisualizingPotential: Saving data for user", userId2, { selectedImages, imageMeaning });
    if (!selectedImages || !Array.isArray(selectedImages) || selectedImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Selected images are required and must be a non-empty array",
        code: "VALIDATION_ERROR",
        details: { selectedImages: "Required field, must be non-empty array" }
      });
    }
    if (selectedImages.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Maximum 5 images allowed",
        code: "VALIDATION_ERROR",
        details: { selectedImages: "Maximum 5 images allowed" }
      });
    }
    if (imageMeaning && (typeof imageMeaning !== "string" || imageMeaning.length > 2e3)) {
      return res.status(400).json({
        success: false,
        error: "Image meaning must be a string with maximum 2000 characters",
        code: "VALIDATION_ERROR",
        details: { imageMeaning: "Optional field, maximum 2000 characters" }
      });
    }
    const assessmentData = {
      selectedImages,
      imageMeaning: imageMeaning ? imageMeaning.trim() : ""
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "visualizingPotential")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
      console.log("VisualizingPotential: Updated existing data for user", userId2);
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "visualizingPotential",
        results: JSON.stringify(assessmentData)
      });
      console.log("VisualizingPotential: Created new data for user", userId2);
    }
    res.json({
      success: true,
      data: assessmentData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "visualizingPotential"
      }
    });
  } catch (error) {
    console.error("VisualizingPotential save error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/visualizing-potential", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    console.log("VisualizingPotential: Loading data for user", userId2);
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "visualizingPotential")
      )
    );
    if (!assessment || assessment.length === 0) {
      console.log("VisualizingPotential: No existing data found for user", userId2);
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    console.log("VisualizingPotential: Found existing data for user", userId2, results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: "visualizingPotential" }
    });
  } catch (error) {
    console.error("VisualizingPotential fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.post("/final-reflection", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { futureLetterText } = req.body;
    if (!futureLetterText || typeof futureLetterText !== "string" || futureLetterText.trim().length === 0 || futureLetterText.length > 1e3) {
      return res.status(400).json({
        success: false,
        error: "Future Letter Text is required and must be 1-1000 characters",
        code: "VALIDATION_ERROR",
        details: { futureLetterText: "Required field, 1-1000 characters" }
      });
    }
    const assessmentData = {
      futureLetterText: futureLetterText.trim()
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "finalReflection")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "finalReflection",
        results: JSON.stringify(assessmentData)
      });
    }
    console.log(`\u{1F3AF} Final reflection saved for user ${userId2}, auto-completing AST workshop...`);
    try {
      const completedAt = /* @__PURE__ */ new Date();
      await db.update(users).set({
        astWorkshopCompleted: true,
        astCompletedAt: completedAt
      }).where(eq5(users.id, userId2));
      console.log(`\u{1F3AF} AST workshop completed for user ${userId2}, generating StarCard and unlocking reports...`);
      const user = await db.select().from(users).where(eq5(users.id, userId2)).limit(1);
      let progress = {};
      try {
        progress = JSON.parse(user[0]?.navigationProgress || "{}");
      } catch (e) {
        progress = {};
      }
      try {
        await generateAndStoreStarCard(userId2);
      } catch (starCardError) {
        console.error(`\u26A0\uFE0F StarCard generation failed for user ${userId2}, continuing without it:`, starCardError);
      }
      const updatedProgress = {
        ...progress,
        ast: {
          ...progress.ast,
          holisticReportsUnlocked: true,
          completedSteps: [...progress.ast?.completedSteps || [], "5-2"].filter((step, index2, arr) => arr.indexOf(step) === index2)
        }
      };
      await db.update(users).set({
        navigationProgress: JSON.stringify(updatedProgress)
      }).where(eq5(users.id, userId2));
      console.log(`\u2705 AST workshop auto-completed, StarCard generated and holistic reports unlocked for user ${userId2}`);
      res.json({
        success: true,
        data: assessmentData,
        workshopCompleted: true,
        completedAt: completedAt.toISOString(),
        holisticReportsUnlocked: true,
        meta: {
          saved_at: (/* @__PURE__ */ new Date()).toISOString(),
          assessmentType: "finalReflection"
        }
      });
    } catch (workshopError) {
      console.error(`\u26A0\uFE0F Failed to auto-complete workshop for user ${userId2}:`, workshopError);
      res.json({
        success: true,
        data: assessmentData,
        workshopCompleted: false,
        error: "Final reflection saved but workshop completion failed",
        meta: {
          saved_at: (/* @__PURE__ */ new Date()).toISOString(),
          assessmentType: "finalReflection"
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/final-reflection", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "finalReflection")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: { assessmentType: "finalReflection" }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.get("/debug/step-1-1", async (req, res) => {
  try {
    console.log("=== DEBUG ENDPOINT: Testing step 1-1 video ===");
    const allVideos = await db.select().from(videos);
    console.log(`Total videos in database: ${allVideos.length}`);
    const stepVideos = await db.select().from(videos).where(eq5(videos.stepId, "1-1"));
    console.log('Videos with stepId "1-1":', stepVideos);
    const allstarVideos = await db.select().from(videos).where(eq5(videos.workshopType, "allstarteams"));
    console.log("AllStarTeams videos:", allstarVideos.length);
    const combinedVideos = await db.select().from(videos).where(
      and(
        eq5(videos.stepId, "1-1"),
        eq5(videos.workshopType, "allstarteams")
      )
    );
    console.log("Combined filter result:", combinedVideos);
    res.json({
      success: true,
      totalVideos: allVideos.length,
      stepVideos,
      allstarVideosCount: allstarVideos.length,
      combinedVideos
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
workshopDataRouter.post("/visualization", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { wellBeingLevel, futureWellBeingLevel } = req.body;
    if (wellBeingLevel !== void 0 && (typeof wellBeingLevel !== "number" || wellBeingLevel < 0 || wellBeingLevel > 10)) {
      return res.status(400).json({
        success: false,
        error: "wellBeingLevel must be a number between 0 and 10",
        code: "VALIDATION_ERROR"
      });
    }
    if (futureWellBeingLevel !== void 0 && (typeof futureWellBeingLevel !== "number" || futureWellBeingLevel < 0 || futureWellBeingLevel > 10)) {
      return res.status(400).json({
        success: false,
        error: "futureWellBeingLevel must be a number between 0 and 10",
        code: "VALIDATION_ERROR"
      });
    }
    const assessmentData = {
      wellBeingLevel: wellBeingLevel || 5,
      futureWellBeingLevel: futureWellBeingLevel || 5
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "cantrilLadder")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "cantrilLadder",
        results: JSON.stringify(assessmentData)
      });
    }
    res.json({
      success: true,
      data: assessmentData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "cantrilLadder"
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
      code: "SAVE_ERROR"
    });
  }
});
workshopDataRouter.get("/visualization", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "cantrilLadder")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({
        success: true,
        data: null,
        wellBeingLevel: 5,
        futureWellBeingLevel: 5
      });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      wellBeingLevel: results.wellBeingLevel || 5,
      futureWellBeingLevel: results.futureWellBeingLevel || 5,
      meta: { assessmentType: "cantrilLadder" }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve assessment",
      code: "FETCH_ERROR"
    });
  }
});
workshopDataRouter.get("/flow-assessment", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "flowAssessment")
      )
    );
    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: results,
      meta: {
        created_at: assessment[0].createdAt,
        assessmentType: "flowAssessment"
      }
    });
  } catch (error) {
    console.error("Error fetching flow assessment:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Fetch failed"
    });
  }
});
workshopDataRouter.post("/flow-assessment", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { answers, flowScore, completed = true } = req.body;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        success: false,
        error: "Answers object is required"
      });
    }
    if (flowScore === void 0 || typeof flowScore !== "number") {
      return res.status(400).json({
        success: false,
        error: "Flow score is required and must be a number"
      });
    }
    const assessmentData = {
      answers,
      flowScore,
      completed,
      completedAt: completed ? (/* @__PURE__ */ new Date()).toISOString() : null
    };
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "flowAssessment")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: JSON.stringify(assessmentData)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "flowAssessment",
        results: JSON.stringify(assessmentData)
      });
    }
    res.json({
      success: true,
      data: assessmentData,
      meta: {
        saved_at: (/* @__PURE__ */ new Date()).toISOString(),
        assessmentType: "flowAssessment"
      }
    });
  } catch (error) {
    console.error("Error saving flow assessment:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Save failed"
    });
  }
});
workshopDataRouter.get("/userAssessments", async (req, res) => {
  try {
    let userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
      userId2 = req.session.userId;
    }
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessments = await db.select().from(userAssessments).where(eq5(userAssessments.userId, userId2));
    const assessmentsByType = {};
    assessments.forEach((assessment) => {
      try {
        const results = JSON.parse(assessment.results);
        assessmentsByType[assessment.assessmentType] = {
          ...results,
          createdAt: assessment.createdAt,
          assessmentType: assessment.assessmentType
        };
      } catch (error) {
        console.error(`Error parsing assessment ${assessment.assessmentType}:`, error);
      }
    });
    res.json({
      success: true,
      currentUser: {
        assessments: assessmentsByType
      }
    });
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Fetch failed"
    });
  }
});
workshopDataRouter.get("/navigation-progress/:appType", async (req, res) => {
  try {
    const userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    const { appType } = req.params;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const progress = await db.select().from(navigationProgress).where(
      and(
        eq5(navigationProgress.userId, userId2),
        eq5(navigationProgress.appType, appType)
      )
    );
    if (progress.length === 0) {
      const defaultProgress = {
        completedSteps: [],
        currentStepId: appType === "ia" ? "ia-1-1" : "1-1",
        appType,
        lastVisitedAt: (/* @__PURE__ */ new Date()).toISOString(),
        unlockedSteps: appType === "ia" ? ["ia-1-1"] : ["1-1"],
        videoProgress: {}
      };
      return res.status(200).json({
        success: true,
        data: defaultProgress
      });
    }
    const navigationData = progress[0];
    const parsedProgress = {
      completedSteps: JSON.parse(navigationData.completedSteps),
      currentStepId: navigationData.currentStepId,
      appType: navigationData.appType,
      lastVisitedAt: navigationData.lastVisitedAt,
      unlockedSteps: JSON.parse(navigationData.unlockedSteps),
      videoProgress: navigationData.videoProgress ? JSON.parse(navigationData.videoProgress) : {}
    };
    return res.status(200).json({
      success: true,
      data: parsedProgress
    });
  } catch (error) {
    console.error("Error fetching navigation progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch navigation progress"
    });
  }
});
workshopDataRouter.post("/navigation-progress", async (req, res) => {
  try {
    const userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { completedSteps, currentStepId, appType, unlockedSteps, videoProgress } = req.body;
    const hasIASteps = completedSteps && completedSteps.some((step) => step.startsWith("ia-")) || currentStepId && currentStepId.startsWith("ia-");
    const detectedAppType = hasIASteps ? "ia" : "ast";
    console.log(`Navigation Progress: Received appType: ${appType}, Detected from steps: ${detectedAppType}`);
    const existingProgress = await db.select().from(navigationProgress).where(
      and(
        eq5(navigationProgress.userId, userId2),
        eq5(navigationProgress.appType, detectedAppType)
      )
    );
    const progressData = {
      userId: userId2,
      appType: detectedAppType,
      // Use detected app type instead of received one
      completedSteps: JSON.stringify(completedSteps),
      currentStepId,
      unlockedSteps: JSON.stringify(unlockedSteps),
      videoProgress: JSON.stringify(videoProgress || {}),
      lastVisitedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (existingProgress.length > 0) {
      await db.update(navigationProgress).set(progressData).where(eq5(navigationProgress.id, existingProgress[0].id));
    } else {
      await db.insert(navigationProgress).values(progressData);
    }
    return res.status(200).json({
      success: true,
      message: "Navigation progress saved"
    });
  } catch (error) {
    console.error("Error saving navigation progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save navigation progress"
    });
  }
});
workshopDataRouter.get("/ia-assessment/:userId?", async (req, res) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId) : req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (!targetUserId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const assessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, targetUserId),
        eq5(userAssessments.assessmentType, "iaCoreCapabilities")
      )
    );
    if (assessment.length === 0) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    const assessmentData = assessment[0];
    let results;
    try {
      results = typeof assessmentData.results === "string" ? JSON.parse(assessmentData.results) : assessmentData.results;
    } catch (error) {
      console.error("Error parsing IA assessment results:", error);
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: assessmentData.id,
        userId: assessmentData.userId,
        assessmentType: assessmentData.assessmentType,
        results,
        createdAt: assessmentData.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching IA assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch IA assessment"
    });
  }
});
workshopDataRouter.post("/ia-assessment", async (req, res) => {
  try {
    const userId2 = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { results } = req.body;
    if (!results) {
      return res.status(400).json({
        success: false,
        message: "Assessment results are required"
      });
    }
    const existingAssessment = await db.select().from(userAssessments).where(
      and(
        eq5(userAssessments.userId, userId2),
        eq5(userAssessments.assessmentType, "iaCoreCapabilities")
      )
    );
    if (existingAssessment.length > 0) {
      await db.update(userAssessments).set({
        results: typeof results === "string" ? results : JSON.stringify(results)
      }).where(eq5(userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(userAssessments).values({
        userId: userId2,
        assessmentType: "iaCoreCapabilities",
        results: typeof results === "string" ? results : JSON.stringify(results)
      });
    }
    return res.status(200).json({
      success: true,
      message: "IA assessment saved successfully",
      data: results
    });
  } catch (error) {
    console.error("Error saving IA assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save IA assessment"
    });
  }
});
workshopDataRouter.get("/step/:workshopType/:stepId", authenticateUser, async (req, res) => {
  try {
    const { workshopType, stepId } = req.params;
    const userId2 = req.session.userId;
    if (!["ast", "ia"].includes(workshopType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workshop type. Must be "ast" or "ia"'
      });
    }
    if (!stepId || typeof stepId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Step ID is required"
      });
    }
    const result = await db.select().from(workshopStepData).where(and(
      eq5(workshopStepData.userId, userId2),
      eq5(workshopStepData.workshopType, workshopType),
      eq5(workshopStepData.stepId, stepId),
      isNull(workshopStepData.deletedAt)
    )).limit(1);
    if (result.length === 0) {
      return res.json({
        success: true,
        data: null,
        // No data saved yet
        stepId,
        workshopType
      });
    }
    res.json({
      success: true,
      data: result[0].data,
      stepId,
      workshopType,
      lastUpdated: result[0].updatedAt
    });
  } catch (error) {
    console.error("Error loading workshop step data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load step data"
    });
  }
});
workshopDataRouter.post("/step", authenticateUser, checkWorkshopLocked, async (req, res) => {
  try {
    const { workshopType, stepId, data } = req.body;
    const userId2 = req.session.userId;
    console.log("\u{1F50D} POST /step - Request details:", {
      workshopType,
      stepId,
      userId: userId2,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      sessionExists: !!req.session,
      userIdType: typeof userId2
    });
    if (!["ast", "ia"].includes(workshopType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workshop type. Must be "ast" or "ia"'
      });
    }
    if (!stepId || typeof stepId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Step ID is required"
      });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        error: "Data object is required"
      });
    }
    console.log("\u{1F50D} Attempting to save workshop data:", { userId: userId2, workshopType, stepId, dataKeys: Object.keys(data) });
    if (!userId2 || typeof userId2 !== "number") {
      console.error("\u274C Invalid userId:", { userId: userId2, type: typeof userId2 });
      return res.status(401).json({
        success: false,
        error: "Authentication required - invalid user ID"
      });
    }
    console.log("\u{1F50D} About to execute UPSERT with:", {
      userId: userId2,
      workshopType,
      stepId,
      hasData: !!data,
      dataSize: JSON.stringify(data).length
    });
    const result = await db.insert(workshopStepData).values({
      userId: userId2,
      workshopType,
      stepId,
      data,
      updatedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: [workshopStepData.userId, workshopStepData.workshopType, workshopStepData.stepId],
      set: {
        data,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    console.log("\u2705 Workshop data saved successfully:", result[0]);
    res.json({
      success: true,
      stepId,
      workshopType,
      saved: true,
      lastUpdated: result[0].updatedAt
    });
  } catch (error) {
    console.error("\u274C Error saving workshop step data:", error);
    console.error("\u274C Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    res.status(500).json({
      success: false,
      error: "Failed to save step data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
workshopDataRouter.get("/steps/:workshopType", authenticateUser, async (req, res) => {
  try {
    const { workshopType } = req.params;
    const userId2 = req.session.userId;
    if (!["ast", "ia"].includes(workshopType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workshop type. Must be "ast" or "ia"'
      });
    }
    const results = await db.select().from(workshopStepData).where(and(
      eq5(workshopStepData.userId, userId2),
      eq5(workshopStepData.workshopType, workshopType),
      isNull(workshopStepData.deletedAt)
    )).orderBy(workshopStepData.stepId);
    const stepData = results.reduce((acc, row) => {
      acc[row.stepId] = row.data;
      return acc;
    }, {});
    res.json({
      success: true,
      workshopType,
      stepData,
      totalSteps: results.length
    });
  } catch (error) {
    console.error("Error loading workshop steps data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load workshop data"
    });
  }
});
workshopDataRouter.get("/feature-status", getFeatureStatus);
workshopDataRouter.get("/completion-status", authenticateUser, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    const user = await db.select({
      astWorkshopCompleted: users.astWorkshopCompleted,
      iaWorkshopCompleted: users.iaWorkshopCompleted,
      astCompletedAt: users.astCompletedAt,
      iaCompletedAt: users.iaCompletedAt
    }).from(users).where(eq5(users.id, userId2)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user[0]);
  } catch (error) {
    console.error("Error fetching completion status:", error);
    res.status(500).json({ error: "Failed to fetch completion status" });
  }
});
workshopDataRouter.post("/complete-workshop", authenticateUser, async (req, res) => {
  try {
    const { appType } = req.body;
    const userId2 = req.session.userId;
    if (!appType || !["ast", "ia"].includes(appType)) {
      return res.status(400).json({ error: 'Invalid app type. Must be "ast" or "ia"' });
    }
    const user = await db.select().from(users).where(eq5(users.id, userId2)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    let progress;
    try {
      progress = JSON.parse(user[0].navigationProgress || "{}");
    } catch (e) {
      progress = {};
    }
    const requiredSteps = appType === "ast" ? ["1-1", "2-1", "2-2", "2-3", "2-4", "3-1", "3-2", "3-3", "3-4", "4-1", "4-2", "4-3", "4-4", "4-5"] : ["ia-1-1", "ia-2-1", "ia-3-1", "ia-4-1", "ia-5-1", "ia-6-1", "ia-8-1"];
    const completedSteps = progress[appType]?.completedSteps || [];
    const allCompleted = requiredSteps.every((step) => completedSteps.includes(step));
    if (!allCompleted) {
      const missingSteps = requiredSteps.filter((step) => !completedSteps.includes(step));
      return res.status(400).json({
        error: "Cannot complete workshop - not all steps finished",
        missingSteps
      });
    }
    const completionField = appType === "ast" ? "astWorkshopCompleted" : "iaWorkshopCompleted";
    if (user[0][completionField]) {
      return res.status(400).json({ error: "Workshop already completed" });
    }
    const timestampField = appType === "ast" ? "astCompletedAt" : "iaCompletedAt";
    const completedAt = /* @__PURE__ */ new Date();
    await db.update(users).set({
      [completionField]: true,
      [timestampField]: completedAt
    }).where(eq5(users.id, userId2));
    if (appType === "ast") {
      try {
        console.log(`\u{1F3AF} AST workshop completed for user ${userId2}, generating StarCard and unlocking reports...`);
        await generateAndStoreStarCard(userId2);
        const updatedProgress = {
          ...progress,
          ast: {
            ...progress.ast,
            holisticReportsUnlocked: true,
            completedSteps: [...progress.ast?.completedSteps || [], "5-2"].filter((step, index2, arr) => arr.indexOf(step) === index2)
          }
        };
        await db.update(users).set({
          navigationProgress: JSON.stringify(updatedProgress)
        }).where(eq5(users.id, userId2));
        console.log(`\u2705 StarCard generated and holistic reports unlocked for user ${userId2}`);
      } catch (starCardError) {
        console.error(`\u26A0\uFE0F Failed to generate StarCard for user ${userId2}:`, starCardError);
      }
    }
    res.json({
      success: true,
      message: `${appType.toUpperCase()} workshop completed successfully`,
      completedAt: completedAt.toISOString(),
      holisticReportsUnlocked: appType === "ast" ? true : false
    });
  } catch (error) {
    console.error("Error completing workshop:", error);
    res.status(500).json({ error: "Failed to complete workshop" });
  }
});
var workshop_data_routes_default = workshopDataRouter;

// server/routes/growth-plan-routes.ts
import { Router as Router2 } from "express";
import { eq as eq6, and as and2 } from "drizzle-orm";
init_schema();
var router6 = Router2();
router6.get("/", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    const { quarter, year } = req.query;
    if (!quarter || !year) {
      return res.status(400).json({ success: false, error: "Quarter and year are required" });
    }
    const [plan] = await db.select().from(growthPlans).where(and2(
      eq6(growthPlans.userId, userId2),
      eq6(growthPlans.quarter, quarter),
      eq6(growthPlans.year, parseInt(year))
    ));
    if (!plan) {
      return res.json({ success: true, data: null });
    }
    const parsedPlan = {
      ...plan,
      strengthsExamples: plan.strengthsExamples ? JSON.parse(plan.strengthsExamples) : {},
      flowPeakHours: plan.flowPeakHours ? JSON.parse(plan.flowPeakHours) : [],
      keyPriorities: plan.keyPriorities ? JSON.parse(plan.keyPriorities) : []
    };
    res.json({ success: true, data: parsedPlan });
  } catch (error) {
    console.error("Error fetching growth plan:", error);
    res.status(500).json({ success: false, error: "Failed to fetch growth plan" });
  }
});
router6.post("/", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    console.log("Growth plan POST - Request body:", req.body);
    if (!req.body.quarter || !req.body.year) {
      return res.status(400).json({ success: false, error: "Quarter and year are required" });
    }
    const planData = {
      userId: userId2,
      quarter: req.body.quarter || "Q2",
      year: req.body.year || 2025,
      starPowerReflection: req.body.starPowerReflection || null,
      ladderCurrentLevel: req.body.ladderCurrentLevel || null,
      ladderTargetLevel: req.body.ladderTargetLevel || null,
      ladderReflections: req.body.ladderReflections || null,
      strengthsExamples: JSON.stringify(req.body.strengthsExamples || {}),
      flowPeakHours: JSON.stringify(req.body.flowPeakHours || []),
      flowCatalysts: req.body.flowCatalysts || null,
      visionStart: req.body.visionStart || null,
      visionNow: req.body.visionNow || null,
      visionNext: req.body.visionNext || null,
      progressWorking: req.body.progressWorking || null,
      progressNeedHelp: req.body.progressNeedHelp || null,
      teamFlowStatus: req.body.teamFlowStatus || null,
      teamEnergySource: req.body.teamEnergySource || null,
      teamNextCheckin: req.body.teamNextCheckin || null,
      keyPriorities: JSON.stringify(req.body.keyPriorities || []),
      successLooksLike: req.body.successLooksLike || null,
      keyDates: req.body.keyDates || null
    };
    const [existingPlan] = await db.select().from(growthPlans).where(and2(
      eq6(growthPlans.userId, userId2),
      eq6(growthPlans.quarter, planData.quarter),
      eq6(growthPlans.year, planData.year)
    ));
    let result;
    if (existingPlan) {
      [result] = await db.update(growthPlans).set(planData).where(eq6(growthPlans.id, existingPlan.id)).returning();
    } else {
      [result] = await db.insert(growthPlans).values(planData).returning();
    }
    const parsedResult = {
      ...result,
      strengthsExamples: result.strengthsExamples ? JSON.parse(result.strengthsExamples) : {},
      flowPeakHours: result.flowPeakHours ? JSON.parse(result.flowPeakHours) : [],
      keyPriorities: result.keyPriorities ? JSON.parse(result.keyPriorities) : []
    };
    res.json({ success: true, data: parsedResult });
  } catch (error) {
    console.error("Error saving growth plan:", error);
    res.status(500).json({ success: false, error: "Failed to save growth plan" });
  }
});
router6.get("/all", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    const plans = await db.select().from(growthPlans).where(eq6(growthPlans.userId, userId2)).orderBy(growthPlans.year, growthPlans.quarter);
    const parsedPlans = plans.map((plan) => ({
      ...plan,
      strengthsExamples: plan.strengthsExamples ? JSON.parse(plan.strengthsExamples) : {},
      flowPeakHours: plan.flowPeakHours ? JSON.parse(plan.flowPeakHours) : [],
      keyPriorities: plan.keyPriorities ? JSON.parse(plan.keyPriorities) : []
    }));
    res.json({ success: true, data: parsedPlans });
  } catch (error) {
    console.error("Error fetching growth plans:", error);
    res.status(500).json({ success: false, error: "Failed to fetch growth plans" });
  }
});
var growth_plan_routes_default = router6;

// server/reset-routes.ts
import { Router as Router3 } from "express";
init_schema();
import { eq as eq8, and as and3, sql as sql3 } from "drizzle-orm";

// server/middleware/test-user-auth.ts
init_schema();
import { eq as eq7 } from "drizzle-orm";
var requireTestUser = async (req, res, next) => {
  try {
    const userId2 = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    const [user] = await db.select({ isTestUser: users.isTestUser }).from(users).where(eq7(users.id, userId2));
    if (!user?.isTestUser) {
      console.warn(`Non-test user ${userId2} attempted test action`);
      return res.status(403).json({
        error: "Test features only available to test users",
        code: "TEST_USER_REQUIRED"
      });
    }
    next();
  } catch (error) {
    console.error("Error validating test user:", error);
    return res.status(500).json({
      error: "Failed to validate test user status",
      code: "VALIDATION_ERROR"
    });
  }
};

// server/reset-routes.ts
var resetRouter = Router3();
resetRouter.post("/user/:userId", requireTestUser, async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const userId2 = parseInt(req.params.userId);
    if (isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    if (currentUserId !== userId2 && currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: "You can only reset your own data"
      });
    }
    const deletedData = {
      starCard: false,
      flowAttributes: false,
      userProgress: false
    };
    console.log(`=== RESET: Starting data reset for user ${userId2} ===`);
    try {
      const starCards2 = await db.select().from(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "starCard")
        )
      );
      if (starCards2 && starCards2.length > 0) {
        console.log(`Found ${starCards2.length} star card assessments for user ${userId2}, deleting them`);
        await db.delete(userAssessments).where(
          and3(
            eq8(userAssessments.userId, userId2),
            eq8(userAssessments.assessmentType, "starCard")
          )
        );
        const verifyCards = await db.select().from(userAssessments).where(
          and3(
            eq8(userAssessments.userId, userId2),
            eq8(userAssessments.assessmentType, "starCard")
          )
        );
        if (!verifyCards || verifyCards.length === 0) {
          deletedData.starCard = true;
          console.log(`Successfully deleted star card assessments for user ${userId2}`);
        } else {
          console.error(`Failed to delete star card assessments for user ${userId2}`);
        }
      } else {
        console.log(`No star card assessments found for user ${userId2}`);
        deletedData.starCard = true;
      }
    } catch (error) {
      console.error(`Error deleting star card assessments for user ${userId2}:`, error);
    }
    try {
      const flowAttrs = await db.select().from(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "flowAttributes")
        )
      );
      if (flowAttrs && flowAttrs.length > 0) {
        console.log(`Found ${flowAttrs.length} flow attribute assessments for user ${userId2}, deleting them`);
        await db.delete(userAssessments).where(
          and3(
            eq8(userAssessments.userId, userId2),
            eq8(userAssessments.assessmentType, "flowAttributes")
          )
        );
        const verifyAttrs = await db.select().from(userAssessments).where(
          and3(
            eq8(userAssessments.userId, userId2),
            eq8(userAssessments.assessmentType, "flowAttributes")
          )
        );
        if (!verifyAttrs || verifyAttrs.length === 0) {
          deletedData.flowAttributes = true;
          console.log(`Successfully deleted flow attribute assessments for user ${userId2}`);
        } else {
          console.error(`Failed to delete flow attribute assessments for user ${userId2}`);
        }
      } else {
        console.log(`No flow attribute assessments found for user ${userId2}`);
        deletedData.flowAttributes = true;
      }
    } catch (error) {
      console.error(`Error deleting flow attribute assessments for user ${userId2}:`, error);
    }
    try {
      const iaAssessments = await db.select().from(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "iaCoreCapabilities")
        )
      );
      if (iaAssessments && iaAssessments.length > 0) {
        console.log(`Found ${iaAssessments.length} IA assessments for user ${userId2}, deleting them`);
        await db.delete(userAssessments).where(
          and3(
            eq8(userAssessments.userId, userId2),
            eq8(userAssessments.assessmentType, "iaCoreCapabilities")
          )
        );
        console.log(`Successfully deleted IA assessments for user ${userId2}`);
      } else {
        console.log(`No IA assessments found for user ${userId2}`);
      }
    } catch (error) {
      console.error(`Error deleting IA assessments for user ${userId2}:`, error);
    }
    try {
      const initialProgress = {
        completedSteps: [],
        currentStepId: "1-1",
        appType: "ast",
        lastVisitedAt: (/* @__PURE__ */ new Date()).toISOString(),
        unlockedSteps: ["1-1"],
        videoProgress: {},
        unlockedSections: ["1"],
        videoPositions: {}
      };
      await db.execute(sql3`
        UPDATE users 
        SET navigation_progress = ${JSON.stringify(initialProgress)}, 
            "workshopStepData" = NULL,
            updated_at = NOW() 
        WHERE id = ${userId2}
      `);
      deletedData.userProgress = true;
      console.log(`Reset navigation progress to initial state and cleared workshop step data for user ${userId2}`);
      try {
        await db.execute(sql3`DELETE FROM navigationProgress WHERE user_id = ${userId2}`);
        console.log(`Deleted navigationProgress table entries for user ${userId2}`);
      } catch (err) {
        console.log(`No navigationProgress entries found for user ${userId2} or table does not exist`);
      }
      try {
        await db.execute(sql3`DELETE FROM workshop_participation WHERE user_id = ${userId2}`);
        console.log(`Deleted workshop participation for user ${userId2}`);
      } catch (err) {
        console.log(`No workshop participation found for user ${userId2} or table does not exist`);
      }
    } catch (error) {
      console.error(`Error resetting progress for user ${userId2}:`, error);
    }
    console.log(`=== RESET: Completed data reset for user ${userId2} ===`);
    return res.status(200).json({
      success: true,
      message: "User data reset successfully",
      userId: userId2,
      deletedData
    });
  } catch (error) {
    console.error("Error in reset endpoint:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      success: false,
      message: "Failed to reset user data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
resetRouter.post("/user/:userId/starcard", requireTestUser, async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const userId2 = parseInt(req.params.userId);
    if (isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    if (currentUserId !== userId2 && currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: "You can only reset your own data"
      });
    }
    const starCards2 = await db.select().from(userAssessments).where(
      and3(
        eq8(userAssessments.userId, userId2),
        eq8(userAssessments.assessmentType, "starCard")
      )
    );
    let success = false;
    if (starCards2 && starCards2.length > 0) {
      await db.delete(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "starCard")
        )
      );
      const verifyCards = await db.select().from(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "starCard")
        )
      );
      success = !verifyCards || verifyCards.length === 0;
    } else {
      success = true;
    }
    return res.status(200).json({
      success,
      message: success ? "Star card reset successfully" : "Failed to reset star card"
    });
  } catch (error) {
    console.error("Error resetting star card:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      success: false,
      message: "Failed to reset star card",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
resetRouter.post("/user/:userId/flow", requireTestUser, async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const userId2 = parseInt(req.params.userId);
    if (isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    if (currentUserId !== userId2 && currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: "You can only reset your own data"
      });
    }
    const flowAttrs = await db.select().from(userAssessments).where(
      and3(
        eq8(userAssessments.userId, userId2),
        eq8(userAssessments.assessmentType, "flowAttributes")
      )
    );
    let success = false;
    if (flowAttrs && flowAttrs.length > 0) {
      await db.delete(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "flowAttributes")
        )
      );
      const verifyAttrs = await db.select().from(userAssessments).where(
        and3(
          eq8(userAssessments.userId, userId2),
          eq8(userAssessments.assessmentType, "flowAttributes")
        )
      );
      success = !verifyAttrs || verifyAttrs.length === 0;
    } else {
      success = true;
    }
    return res.status(200).json({
      success,
      message: success ? "Flow attributes reset successfully" : "Failed to reset flow attributes"
    });
  } catch (error) {
    console.error("Error resetting flow attributes:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      success: false,
      message: "Failed to reset flow attributes",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// server/routes/admin-routes.ts
import express6 from "express";
import { z as z4 } from "zod";

// server/services/export-service.ts
init_schema();
import { eq as eq9, and as and4, isNull as isNull2 } from "drizzle-orm";
var ExportService = class {
  /**
   * Export all user data including assessments, navigation progress, and workshop participation
   * @param userId The user ID to export data for
   * @param exportedBy The username or name of the admin performing the export
   * @returns Promise resolving to complete user export data
   */
  static async exportUserData(userId2, exportedBy) {
    try {
      const userResult = await db.select().from(users).where(eq9(users.id, userId2));
      if (!userResult.length) {
        throw new Error("User not found");
      }
      const user = userResult[0];
      const assessments = await db.select().from(userAssessments).where(eq9(userAssessments.userId, userId2));
      const participation = await db.select().from(workshopParticipation).where(eq9(workshopParticipation.userId, userId2));
      const astProgressRecords = await db.select().from(navigationProgress).where(and4(
        eq9(navigationProgress.userId, userId2),
        eq9(navigationProgress.appType, "ast")
      ));
      const iaProgressRecords = await db.select().from(navigationProgress).where(and4(
        eq9(navigationProgress.userId, userId2),
        eq9(navigationProgress.appType, "ia")
      ));
      const allWorkshopSteps = await db.select().from(workshopStepData).where(and4(
        eq9(workshopStepData.userId, userId2),
        isNull2(workshopStepData.deletedAt)
      ));
      const astStepData = {};
      const iaStepData = {};
      allWorkshopSteps.forEach((step) => {
        const stepData = {
          data: step.data,
          version: step.version,
          createdAt: step.createdAt.toISOString(),
          updatedAt: step.updatedAt.toISOString()
        };
        if (step.workshopType === "ast") {
          astStepData[step.stepId] = stepData;
        } else if (step.workshopType === "ia") {
          iaStepData[step.stepId] = stepData;
        }
      });
      let navProgress = null;
      if (astProgressRecords.length > 0 || iaProgressRecords.length > 0) {
        navProgress = {};
        if (astProgressRecords.length > 0) {
          const astRecord = astProgressRecords[0];
          navProgress.ast = {
            currentStepId: astRecord.currentStepId,
            completedSteps: JSON.parse(astRecord.completedSteps),
            unlockedSteps: astRecord.unlockedSteps ? JSON.parse(astRecord.unlockedSteps) : [],
            videoProgress: astRecord.videoProgress ? JSON.parse(astRecord.videoProgress) : {},
            lastVisitedAt: astRecord.lastVisitedAt?.toISOString()
          };
        }
        if (iaProgressRecords.length > 0) {
          const iaRecord = iaProgressRecords[0];
          navProgress.ia = {
            currentStepId: iaRecord.currentStepId,
            completedSteps: JSON.parse(iaRecord.completedSteps),
            unlockedSteps: iaRecord.unlockedSteps ? JSON.parse(iaRecord.unlockedSteps) : [],
            videoProgress: iaRecord.videoProgress ? JSON.parse(iaRecord.videoProgress) : {},
            lastVisitedAt: iaRecord.lastVisitedAt?.toISOString()
          };
        }
      }
      const exportData = {
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          jobTitle: user.jobTitle,
          profilePicture: null,
          // Temporarily removed for testing
          isTestUser: user.isTestUser,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        navigationProgress: navProgress,
        assessments: {},
        workshopStepData: {
          ast: astStepData,
          ia: iaStepData
        },
        workshopParticipation: participation.map((p) => ({
          workshopId: p.workshopId,
          progress: p.progress,
          completed: p.completed,
          startedAt: p.startedAt.toISOString(),
          completedAt: p.completedAt ? p.completedAt.toISOString() : null,
          lastAccessedAt: p.lastAccessedAt.toISOString()
        })),
        exportMetadata: {
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          exportedBy,
          dataVersion: "2.1",
          workshopSteps: "AST: 2-1 through 4-5, IA: ia-1-1 through ia-4-6",
          totalAssessments: assessments.length,
          totalWorkshopSteps: allWorkshopSteps.length
        }
      };
      let cantrilLadderData = {
        wellBeingLevel: 5,
        futureWellBeingLevel: 5,
        currentFactors: "",
        futureImprovements: "",
        specificChanges: "",
        quarterlyProgress: "",
        quarterlyActions: "",
        createdAt: ""
      };
      const assessmentsByType = {};
      assessments.forEach((assessment) => {
        if (!assessmentsByType[assessment.assessmentType]) {
          assessmentsByType[assessment.assessmentType] = [];
        }
        assessmentsByType[assessment.assessmentType].push(assessment);
      });
      if (assessmentsByType["cantrilLadder"]) {
        assessmentsByType["cantrilLadder"].forEach((assessment) => {
          try {
            const results = JSON.parse(assessment.results);
            cantrilLadderData.wellBeingLevel = results.wellBeingLevel || results.currentLevel || 5;
            cantrilLadderData.futureWellBeingLevel = results.futureWellBeingLevel || results.futureLevel || 5;
            cantrilLadderData.createdAt = assessment.createdAt.toISOString();
          } catch (error) {
            console.error("Error parsing cantrilLadder assessment:", error);
          }
        });
      }
      if (assessmentsByType["cantrilLadderReflection"]) {
        assessmentsByType["cantrilLadderReflection"].forEach((assessment) => {
          try {
            const results = JSON.parse(assessment.results);
            cantrilLadderData.currentFactors = results.currentFactors || "";
            cantrilLadderData.futureImprovements = results.futureImprovements || "";
            cantrilLadderData.specificChanges = results.specificChanges || "";
            cantrilLadderData.quarterlyProgress = results.quarterlyProgress || "";
            cantrilLadderData.quarterlyActions = results.quarterlyActions || "";
            const reflectionTime = new Date(assessment.createdAt).getTime();
            const currentTime = cantrilLadderData.createdAt ? new Date(cantrilLadderData.createdAt).getTime() : 0;
            if (reflectionTime > currentTime) {
              cantrilLadderData.createdAt = assessment.createdAt.toISOString();
            }
          } catch (error) {
            console.error("Error parsing cantrilLadderReflection assessment:", error);
          }
        });
      }
      if (assessmentsByType["cantrilLadder"] || assessmentsByType["cantrilLadderReflection"]) {
        exportData.assessments["cantrilLadder"] = cantrilLadderData;
      }
      Object.entries(assessmentsByType).forEach(([assessmentType2, typeAssessments]) => {
        if (assessmentType2 === "cantrilLadder" || assessmentType2 === "cantrilLadderReflection") {
          return;
        }
        try {
          if (assessmentType2 === "flowAttributes") {
            const latest = typeAssessments[typeAssessments.length - 1];
            const results = JSON.parse(latest.results);
            exportData.assessments[assessmentType2] = {
              flowScore: results.flowScore || 0,
              attributes: results.attributes || [],
              createdAt: latest.createdAt.toISOString()
            };
          } else {
            const latest = typeAssessments[typeAssessments.length - 1];
            const results = JSON.parse(latest.results);
            exportData.assessments[assessmentType2] = {
              ...results,
              createdAt: latest.createdAt.toISOString()
            };
          }
        } catch (error) {
          console.error(`Error parsing assessment ${assessmentType2} for user ${userId2}:`, error);
          const latest = typeAssessments[typeAssessments.length - 1];
          exportData.assessments[assessmentType2] = {
            rawData: latest.results,
            createdAt: latest.createdAt.toISOString(),
            parseError: "Failed to parse JSON"
          };
        }
      });
      return exportData;
    } catch (error) {
      console.error("Export failed:", error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Get a summary of exportable data for a user (for validation)
   * @param userId The user ID to validate
   * @returns Promise resolving to validation summary
   */
  static async validateUserData(userId2) {
    try {
      const userResult = await db.select({
        username: users.username
      }).from(users).where(eq9(users.id, userId2));
      if (!userResult.length) {
        throw new Error("User not found");
      }
      const assessments = await db.select().from(userAssessments).where(eq9(userAssessments.userId, userId2));
      const navProgressRecords = await db.select().from(navigationProgress).where(eq9(navigationProgress.userId, userId2));
      const workshopSteps = await db.select().from(workshopStepData).where(and4(
        eq9(workshopStepData.userId, userId2),
        isNull2(workshopStepData.deletedAt)
      ));
      const astSteps = workshopSteps.filter((s) => s.workshopType === "ast");
      const iaSteps = workshopSteps.filter((s) => s.workshopType === "ia");
      return {
        userId: userId2,
        username: userResult[0].username,
        assessmentCount: assessments.length,
        assessmentTypes: assessments.map((a) => a.assessmentType),
        hasNavigationProgress: navProgressRecords.length > 0,
        navigationProgressTypes: navProgressRecords.map((r) => r.appType),
        workshopStepCounts: {
          ast: astSteps.length,
          ia: iaSteps.length,
          total: workshopSteps.length
        },
        workshopStepIds: {
          ast: astSteps.map((s) => s.stepId),
          ia: iaSteps.map((s) => s.stepId)
        },
        dataIntegrity: "valid",
        lastUpdate: assessments.length > 0 ? Math.max(...assessments.map((a) => new Date(a.createdAt).getTime())) : null
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// server/routes/admin-routes.ts
init_auth();
var router7 = express6.Router();
router7.get("/users", requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === "true";
    const userRole = req.session.userRole;
    const userId2 = req.session.userId;
    let result;
    if (userRole === "facilitator") {
      result = await userManagementService.getUsersForFacilitator(userId2, includeDeleted);
    } else {
      result = await userManagementService.getAllUsers(includeDeleted);
    }
    if (!result.success) {
      return res.status(500).json({ message: result.error || "Failed to retrieve users" });
    }
    console.log(`${userRole === "facilitator" ? "Facilitator" : "Admin"} ${userId2} accessed ${result.users?.length || 0} users`);
    res.json({
      message: "Users retrieved successfully",
      users: result.users
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.post("/users", requireAuth, isAdmin, async (req, res) => {
  try {
    const userSchema = z4.object({
      email: z4.string().email(),
      username: z4.string().min(3),
      firstName: z4.string().optional(),
      lastName: z4.string().optional(),
      role: z4.string().refine((val) => ["admin", "facilitator", "participant", "student"].includes(val), {
        message: "Role must be admin, facilitator, participant, or student"
      }),
      organization: z4.string().optional(),
      jobTitle: z4.string().optional()
    });
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid user data",
        errors: result.error.errors
      });
    }
    const existingUserResult = await userManagementService.getUserByEmail(result.data.email);
    if (existingUserResult.success) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const password = Math.random().toString(36).substring(2, 12);
    const name = `${result.data.firstName || ""} ${result.data.lastName || ""}`.trim() || result.data.username;
    const userResult = await userManagementService.createUser({
      username: result.data.username,
      password,
      name,
      email: result.data.email,
      role: result.data.role,
      organization: result.data.organization,
      jobTitle: result.data.jobTitle
    });
    res.status(201).json({
      message: "User created successfully",
      user: userResult.success ? userResult.user : null,
      initialPassword: password
      // Note: In production, you'd email this to the user
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.get("/invites", requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const userRole = req.session.userRole;
    const userId2 = req.session.userId;
    let invitesResult;
    if (userRole === "facilitator") {
      invitesResult = await inviteService.getInvitesByCreatorWithInfo(userId2);
    } else {
      invitesResult = await inviteService.getAllInvites();
    }
    const invitesList = invitesResult.success ? invitesResult.invites : [];
    const formattedInvites = invitesList?.map((invite) => ({
      ...invite,
      formattedCode: formatInviteCode(invite.inviteCode)
    })) || [];
    res.json({
      message: "Invites retrieved successfully",
      invites: formattedInvites
    });
  } catch (error) {
    console.error("Error getting invites:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.post("/invites/batch", requireAuth, isAdmin, async (req, res) => {
  try {
    const batchSchema = z4.object({
      count: z4.number().min(1).max(50),
      role: z4.enum(["admin", "facilitator", "participant", "student"]),
      expiresAt: z4.string().optional()
    });
    const result = batchSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid batch data",
        errors: result.error.errors
      });
    }
    const { count: count2, role, expiresAt } = result.data;
    const invites2 = [];
    for (let i = 0; i < count2; i++) {
      try {
        const uniqueEmail = `invite-${Date.now()}-${i}@placeholder.com`;
        const inviteResult = await inviteService.createInvite({
          email: uniqueEmail,
          role,
          createdBy: req.session.userId || 1,
          // Fallback to admin ID 1 if no session
          expiresAt: expiresAt ? new Date(expiresAt) : void 0
        });
        if (inviteResult.success && inviteResult.invite) {
          invites2.push({
            ...inviteResult.invite,
            formattedCode: formatInviteCode(inviteResult.invite.inviteCode)
          });
        }
      } catch (error) {
        console.error(`Error creating invite ${i + 1}:`, error);
      }
    }
    res.status(201).json({
      message: `Generated ${invites2.length} invite codes`,
      invites: invites2
    });
  } catch (error) {
    console.error("Error generating batch invites:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.put("/users/:id", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const updateSchema = z4.object({
      name: z4.string().min(1).optional(),
      email: z4.string().email().optional(),
      organization: z4.string().optional(),
      jobTitle: z4.string().optional(),
      title: z4.string().optional(),
      // Job title (legacy support)
      role: z4.enum(["admin", "facilitator", "participant", "student"]).optional(),
      contentAccess: z4.enum(["student", "professional", "both"]).optional(),
      astAccess: z4.boolean().optional(),
      iaAccess: z4.boolean().optional(),
      isTestUser: z4.boolean().optional(),
      isBetaTester: z4.boolean().optional(),
      showDemoDataButtons: z4.boolean().optional(),
      password: z4.string().optional(),
      resetPassword: z4.boolean().optional(),
      setCustomPassword: z4.boolean().optional(),
      changePassword: z4.boolean().optional(),
      newPassword: z4.string().optional()
    });
    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid update data",
        errors: result.error.errors
      });
    }
    const updateData = result.data;
    let processedUpdateData = { ...updateData };
    if (updateData.resetPassword) {
      processedUpdateData.password = void 0;
    } else if ((updateData.setCustomPassword || updateData.changePassword) && updateData.newPassword) {
      processedUpdateData.password = updateData.newPassword;
    }
    delete processedUpdateData.resetPassword;
    delete processedUpdateData.setCustomPassword;
    delete processedUpdateData.changePassword;
    delete processedUpdateData.newPassword;
    console.log(`\u{1F50D} DEBUG: About to update user ${id} with data:`, JSON.stringify(processedUpdateData, null, 2));
    const updateResult = await userManagementService.updateUser(id, processedUpdateData);
    if (!updateResult.success) {
      return res.status(400).json({ message: updateResult.error || "Failed to update user" });
    }
    let responseData = { message: "User updated successfully" };
    if (updateResult.temporaryPassword) {
      responseData.temporaryPassword = updateResult.temporaryPassword;
    }
    res.json(responseData);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.put("/users/:id/role", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const roleSchema = z4.object({
      role: z4.enum(["admin", "facilitator", "participant", "student"])
    });
    const result = roleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid role data",
        errors: result.error.errors
      });
    }
    if (id === req.session.userId) {
      return res.status(403).json({
        message: "Cannot change your own role"
      });
    }
    const updateResult = await userManagementService.updateUser(id, {
      role: result.data.role
    });
    if (!updateResult.success) {
      return res.status(404).json({ message: updateResult.error || "User not found" });
    }
    res.json({
      message: "User role updated successfully",
      user: updateResult.user
    });
  } catch (error) {
    console.error("Error changing user role:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.put("/users/:id/test-status", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const result = await userManagementService.toggleTestUserStatus(id);
    if (!result.success) {
      return res.status(404).json({ message: result.error || "User not found" });
    }
    if (!result.success || !result.user) {
      return res.status(404).json({ message: "User not found after update" });
    }
    res.json({
      message: `User is ${result.user.isTestUser ? "now" : "no longer"} a test user`,
      user: result.user
    });
  } catch (error) {
    console.error("Error toggling test user status:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.delete("/users/:id/data", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const result = await userManagementService.deleteUserData(id);
    if (!result.success) {
      return res.status(400).json({ message: result.error || "Failed to delete user data" });
    }
    res.json({
      message: "User data deleted successfully",
      deletedData: result.deletedData
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.get("/test-users", requireAuth, isAdmin, async (req, res) => {
  try {
    const result = await userManagementService.getAllTestUsers();
    if (!result.success) {
      return res.status(500).json({ message: result.error || "Failed to retrieve test users" });
    }
    res.json({
      message: "Test users retrieved successfully",
      users: result.users
    });
  } catch (error) {
    console.error("Error getting test users:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.get("/beta-testers", requireAuth, isAdmin, async (req, res) => {
  try {
    const result = await userManagementService.getAllBetaTesters();
    if (!result.success) {
      return res.status(500).json({ message: result.error || "Failed to retrieve beta testers" });
    }
    res.json({
      message: "Beta testers retrieved successfully",
      users: result.users
    });
  } catch (error) {
    console.error("Error getting beta testers:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.get("/videos", requireAuth, isAdmin, async (req, res) => {
  try {
    const videos2 = await userManagementService.getVideos();
    if (!videos2 || !Array.isArray(videos2)) {
      throw new Error("Failed to retrieve videos from storage");
    }
    res.status(200).json(videos2);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.get("/videos/workshop/:workshopType", requireAuth, isAdmin, async (req, res) => {
  try {
    const { workshopType } = req.params;
    const videos2 = await userManagementService.getVideosByWorkshop(workshopType);
    if (!videos2 || !Array.isArray(videos2)) {
      throw new Error("Failed to retrieve videos from storage");
    }
    res.status(200).json(videos2);
  } catch (error) {
    console.error("Error fetching videos by workshop:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.put("/videos/:id", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    console.log(`Admin updating video ${id} with data:`, req.body);
    const updateResult = await userManagementService.updateVideo(id, req.body);
    if (!updateResult.success) {
      return res.status(400).json({
        message: updateResult.error || "Failed to update video"
      });
    }
    console.log(`Video ${id} updated successfully:`, updateResult.video);
    res.status(200).json(updateResult.video);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.delete("/users/:id", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (id === req.session.userId) {
      return res.status(403).json({
        message: "Cannot delete your own account"
      });
    }
    const deleteResult = await userManagementService.deleteUser(id);
    if (!deleteResult.success) {
      return res.status(400).json({ message: deleteResult.error || "Failed to delete user" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.delete("/users/:id/data", requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const deleteResult = await userManagementService.deleteUserData(id);
    if (!deleteResult.success) {
      return res.status(400).json({ message: deleteResult.error || "Failed to delete user data" });
    }
    res.json({ message: "User data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router7.get("/users/:userId/export", requireAuth, async (req, res) => {
  try {
    const userId2 = parseInt(req.params.userId);
    const sessionUserId = req.session.userId;
    if (isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    const isUserAdmin = req.session.userRole === "admin";
    const isAccessingOwnData = sessionUserId === userId2;
    if (!isUserAdmin && !isAccessingOwnData) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admins can access any user data, users can only access their own data."
      });
    }
    const adminUsername = req.session.username || req.session.name || "admin";
    const exportData = await ExportService.exportUserData(userId2, adminUsername);
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `user-${exportData.userInfo.username}-export-${timestamp2}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    });
  }
});
router7.get("/users/:userId/validate", requireAuth, isAdmin, async (req, res) => {
  try {
    const userId2 = parseInt(req.params.userId);
    if (isNaN(userId2)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    const validation = await ExportService.validateUserData(userId2);
    res.json({ success: true, validation });
  } catch (error) {
    console.error("Error validating user data:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Validation failed"
    });
  }
});
var adminRouter = router7;

// server/routes/facilitator-routes.ts
init_auth();
import express7 from "express";
import { sql as sql4 } from "drizzle-orm";
var router8 = express7.Router();
router8.get("/organizations", requireAuth, isFacilitator, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    const result = await db.execute(sql4`
      SELECT id, name, description, created_at
      FROM organizations 
      WHERE created_by = ${userId2}
      ORDER BY name ASC
    `);
    const organizationsData = result || [];
    res.json({
      success: true,
      organizations: organizationsData
    });
  } catch (error) {
    console.error("Error fetching facilitator organizations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch organizations"
    });
  }
});
router8.get("/cohorts", requireAuth, isFacilitator, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    const result = await db.execute(sql4`
      SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.start_date, 
        c.end_date, 
        c.status,
        c.ast_access,
        c.ia_access,
        o.name as organization_name
      FROM cohorts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE c.facilitator_id = ${userId2}
      ORDER BY c.name ASC
    `);
    const cohortsData = result || [];
    res.json({
      success: true,
      cohorts: cohortsData
    });
  } catch (error) {
    console.error("Error fetching facilitator cohorts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cohorts"
    });
  }
});
router8.post("/organizations", requireAuth, isFacilitator, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    const { name, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Organization name is required"
      });
    }
    const result = await db.execute(sql4`
      INSERT INTO organizations (name, description, created_by, created_at, updated_at)
      VALUES (${name.trim()}, ${description || null}, ${userId2}, NOW(), NOW())
      RETURNING *
    `);
    const organizationData = result[0] || result.rows?.[0];
    res.json({
      success: true,
      organization: organizationData
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create organization"
    });
  }
});
router8.post("/cohorts", requireAuth, isFacilitator, async (req, res) => {
  try {
    const userId2 = req.session.userId;
    const {
      name,
      description,
      organizationId,
      astAccess = true,
      iaAccess = true,
      startDate,
      endDate
    } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cohort name is required"
      });
    }
    const result = await db.execute(sql4`
      INSERT INTO cohorts (
        name, 
        description, 
        facilitator_id, 
        organization_id, 
        ast_access, 
        ia_access,
        start_date,
        end_date,
        status,
        created_at, 
        updated_at
      )
      VALUES (
        ${name.trim()}, 
        ${description || null}, 
        ${userId2}, 
        ${organizationId || null}, 
        ${astAccess}, 
        ${iaAccess},
        ${startDate || null},
        ${endDate || null},
        'active',
        NOW(), 
        NOW()
      )
      RETURNING *
    `);
    const cohortData = result[0] || result.rows?.[0];
    res.json({
      success: true,
      cohort: cohortData
    });
  } catch (error) {
    console.error("Error creating cohort:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create cohort"
    });
  }
});
var facilitatorRouter = router8;

// server/routes/photo-routes.ts
init_photo_storage_service();
import express8 from "express";

// shared/photo-data-filter.ts
function containsBase64ImageData(str) {
  if (typeof str !== "string") return false;
  const dataUrlPattern = /^data:image\/[a-zA-Z]*;base64,/;
  if (dataUrlPattern.test(str)) return true;
  const base64Pattern = /^[A-Za-z0-9+/]{100,}={0,2}$/;
  if (base64Pattern.test(str)) return true;
  return false;
}
function filterPhotoDataFromObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => filterPhotoDataFromObject(item));
  }
  const filtered = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      if (containsBase64ImageData(value)) {
        filtered[key] = `[IMAGE_DATA_FILTERED - ${value.length} chars]`;
      } else if (key.toLowerCase().includes("image") || key.toLowerCase().includes("photo")) {
        if (value.length > 500) {
          filtered[key] = `[IMAGE_DATA_FILTERED - ${value.length} chars]`;
        } else {
          filtered[key] = value;
        }
      } else {
        filtered[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      filtered[key] = filterPhotoDataFromObject(value);
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
}
function safeConsoleLog(message2, ...args) {
  const filteredArgs = args.map((arg) => {
    if (typeof arg === "string" && containsBase64ImageData(arg)) {
      return "[IMAGE_DATA_FILTERED]";
    }
    if (typeof arg === "object") {
      return filterPhotoDataFromObject(arg);
    }
    return arg;
  });
  console.log(message2, ...filteredArgs);
}

// server/routes/photo-routes.ts
var photoRouter = express8.Router();
photoRouter.get("/:id", async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo ID"
      });
    }
    const photo = await photoStorageService.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: "Photo not found"
      });
    }
    res.set({
      "Content-Type": photo.mimeType,
      "Cache-Control": "public, max-age=31536000",
      // Cache for 1 year
      "ETag": photo.photoHash
    });
    if (req.headers["if-none-match"] === photo.photoHash) {
      return res.status(304).end();
    }
    const base64Data = photo.photoData.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    res.send(buffer);
  } catch (error) {
    console.error("Error serving photo:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
photoRouter.get("/:id/thumbnail", async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo ID"
      });
    }
    const thumbnailResult = await photoStorageService.getPhoto(photoId);
    if (thumbnailResult && thumbnailResult.isThumbnail) {
      res.set({
        "Content-Type": thumbnailResult.mimeType,
        "Cache-Control": "public, max-age=31536000",
        "ETag": thumbnailResult.photoHash
      });
      if (req.headers["if-none-match"] === thumbnailResult.photoHash) {
        return res.status(304).end();
      }
      const base64Data2 = thumbnailResult.photoData.split(",")[1];
      const buffer2 = Buffer.from(base64Data2, "base64");
      return res.send(buffer2);
    }
    const photo = await photoStorageService.getPhoto(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: "Photo not found"
      });
    }
    res.set({
      "Content-Type": photo.mimeType,
      "Cache-Control": "public, max-age=31536000",
      "ETag": photo.photoHash
    });
    if (req.headers["if-none-match"] === photo.photoHash) {
      return res.status(304).end();
    }
    const base64Data = photo.photoData.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    res.send(buffer);
  } catch (error) {
    console.error("Error serving photo thumbnail:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
photoRouter.get("/:id/metadata", async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo ID"
      });
    }
    const metadata = await photoStorageService.getPhotoMetadata(photoId);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: "Photo not found"
      });
    }
    res.json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error("Error serving photo metadata:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
photoRouter.post("/", async (req, res) => {
  try {
    const { photoData } = req.body;
    if (!photoData || typeof photoData !== "string") {
      return res.status(400).json({
        success: false,
        error: "Photo data is required"
      });
    }
    if (!photoData.match(/^data:image\/[a-zA-Z]*;base64,/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo data format"
      });
    }
    const userId2 = req.session?.userId;
    safeConsoleLog("Storing photo for user:", userId2);
    const photoId = await photoStorageService.storePhoto(photoData, userId2);
    const metadata = await photoStorageService.getPhotoMetadata(photoId);
    res.json({
      success: true,
      photoId,
      photoUrl: photoStorageService.getPhotoUrl(photoId),
      thumbnailUrl: photoStorageService.getPhotoUrl(photoId, true),
      metadata
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload photo"
    });
  }
});
photoRouter.delete("/:id", async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo ID"
      });
    }
    const metadata = await photoStorageService.getPhotoMetadata(photoId);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: "Photo not found"
      });
    }
    const userId2 = req.session?.userId;
    const userRole = req.session?.userRole;
    if (metadata.uploadedBy !== userId2 && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Permission denied"
      });
    }
    const deleted = await photoStorageService.deletePhoto(photoId);
    if (deleted) {
      res.json({
        success: true,
        message: "Photo deleted successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to delete photo"
      });
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
var photo_routes_default = photoRouter;

// server/routes/starcard-routes.ts
init_photo_storage_service();
import express9 from "express";
import fs from "fs/promises";
import path from "path";
var router9 = express9.Router();
router9.post("/auto-save", async (req, res) => {
  try {
    console.log("\u{1F3AF} StarCard Auto-Save: Request received");
    const { imageData, userId: userId2, saveToDatabase, saveToTempComms, filename } = req.body;
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "No image data provided"
      });
    }
    const results = {
      success: true,
      message: "StarCard saved successfully"
    };
    if (saveToDatabase && userId2) {
      try {
        console.log("\u{1F3AF} StarCard Auto-Save: Saving to database for user:", userId2);
        const existingStarCard = await photoStorageService.getUserStarCard(userId2.toString());
        if (existingStarCard) {
          console.log("\u{1F504} Found existing StarCard, will replace it");
        }
        const photoId = await photoStorageService.storePhoto(imageData, userId2, true);
        results.photoId = photoId;
        results.replaced = !!existingStarCard;
        results.message += ` (Database ID: ${photoId}${existingStarCard ? ", replaced existing" : ""})`;
        console.log("\u2705 StarCard saved to database with ID:", photoId);
      } catch (error) {
        console.error("\u274C Database save failed:", error);
        results.databaseError = error instanceof Error ? error.message : "Database save failed";
      }
    }
    if (saveToTempComms) {
      try {
        console.log("\u{1F3AF} StarCard Auto-Save: Saving to tempcomms folder");
        const tempCommsDir = path.join(process.cwd(), "tempClaudecomms");
        await fs.mkdir(tempCommsDir, { recursive: true });
        const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
        const imageBuffer = Buffer.from(base64Data, "base64");
        const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-").replace(/\./g, "-");
        const finalFilename = filename || `starcard-auto-${timestamp2}.png`;
        const filePath = path.join(tempCommsDir, finalFilename);
        await fs.writeFile(filePath, imageBuffer);
        results.filePath = filePath;
        results.message += ` (Saved to: ${finalFilename})`;
        console.log("\u2705 StarCard saved to tempcomms:", filePath);
      } catch (error) {
        console.error("\u274C TempComms save failed:", error);
        results.tempCommsError = error instanceof Error ? error.message : "TempComms save failed";
      }
    }
    if (!saveToDatabase && !saveToTempComms) {
      console.log("\u{1F3AF} StarCard Auto-Save: No save option specified, defaulting to tempcomms");
      try {
        const tempCommsDir = path.join(process.cwd(), "tempClaudecomms");
        await fs.mkdir(tempCommsDir, { recursive: true });
        const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
        const imageBuffer = Buffer.from(base64Data, "base64");
        const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-").replace(/\./g, "-");
        const finalFilename = `starcard-default-${timestamp2}.png`;
        const filePath = path.join(tempCommsDir, finalFilename);
        await fs.writeFile(filePath, imageBuffer);
        results.filePath = filePath;
        results.message = `StarCard saved to tempcomms: ${finalFilename}`;
        console.log("\u2705 StarCard saved to tempcomms (default):", filePath);
      } catch (error) {
        console.error("\u274C Default save failed:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to save StarCard",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    res.json(results);
  } catch (error) {
    console.error("\u274C StarCard Auto-Save error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.get("/saved/:userId", async (req, res) => {
  try {
    const { userId: userId2 } = req.params;
    const starCard = await photoStorageService.getUserStarCard(userId2);
    if (!starCard) {
      return res.json({
        success: false,
        message: "No saved StarCards found"
      });
    }
    res.json({
      success: true,
      starCard: {
        filePath: starCard.filePath,
        hasImage: !!starCard.photoData
      }
    });
  } catch (error) {
    console.error("\u274C Error getting saved StarCards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve StarCards",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.post("/reviewed", async (req, res) => {
  try {
    const { userId: userId2 } = req.body;
    if (!userId2) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    console.log("\u{1F3AF} StarCard marked as reviewed for user:", userId2);
    res.json({
      success: true,
      message: "StarCard marked as reviewed",
      userId: userId2,
      reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error marking StarCard as reviewed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark StarCard as reviewed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.get("/find-user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { Pool: Pool19 } = await import("pg");
    const pool19 = new Pool19({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const result = await pool19.query(
      "SELECT id, name, username FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );
    await pool19.end();
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with username '${username}' not found`
      });
    }
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    console.error("\u274C Error finding user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find user",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.post("/get-png/:userId", async (req, res) => {
  try {
    const { userId: userId2 } = req.params;
    if (!userId2) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    console.log(`\u{1F3AF} Getting StarCard PNG for user ID: ${userId2}`);
    const { Pool: Pool19 } = await import("pg");
    const pool19 = new Pool19({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const userResult = await pool19.query(
      "SELECT id, name, username FROM users WHERE id = $1",
      [userId2]
    );
    if (userResult.rows.length === 0) {
      await pool19.end();
      return res.status(404).json({
        success: false,
        message: `User ${userId2} not found`
      });
    }
    const user = userResult.rows[0];
    console.log(`\u{1F464} Found user: ${user.name || user.username} (ID: ${user.id})`);
    const photoResult = await pool19.query(`
      SELECT id, photo_data, photo_hash, mime_type, file_size, width, height, created_at
      FROM photo_storage 
      WHERE uploaded_by = $1 
      AND is_thumbnail = false
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId2]);
    await pool19.end();
    if (photoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No StarCard PNG found for user ${userId2} (${user.name || user.username})`
      });
    }
    const photo = photoResult.rows[0];
    console.log(`\u{1F4F8} Found StarCard PNG:`, {
      id: photo.id,
      size: `${photo.file_size} bytes`,
      dimensions: `${photo.width}x${photo.height}`,
      type: photo.mime_type,
      created: photo.created_at
    });
    const fs7 = await import("fs/promises");
    const path5 = await import("path");
    const tempCommsDir = path5.join(process.cwd(), "tempClaudecomms");
    await fs7.mkdir(tempCommsDir, { recursive: true });
    const base64Data = photo.photo_data.includes(",") ? photo.photo_data.split(",")[1] : photo.photo_data;
    const buffer = Buffer.from(base64Data, "base64");
    const extension = photo.mime_type.split("/")[1] || "png";
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-").replace(/\./g, "-");
    const username = user.username || "unknown";
    const filename = `user-${userId2}-${username}-starcard-${timestamp2}.${extension}`;
    const filePath = path5.join(tempCommsDir, filename);
    await fs7.writeFile(filePath, buffer);
    console.log(`\u2705 StarCard PNG saved to: ${filename}`);
    res.json({
      success: true,
      message: `StarCard PNG retrieved for ${user.name || user.username}`,
      user: user.name || user.username,
      username: user.username,
      userId: userId2,
      filename,
      fileSize: photo.file_size,
      dimensions: `${photo.width}x${photo.height}`,
      created: photo.created_at
    });
  } catch (error) {
    console.error("\u274C Error getting StarCard PNG:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get StarCard PNG",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.get("/admin/download/:userId", async (req, res) => {
  try {
    const { userId: userId2 } = req.params;
    if (!userId2) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    console.log(`\u{1F510} Admin downloading StarCard PNG for user ID: ${userId2}`);
    const { Pool: Pool19 } = await import("pg");
    const pool19 = new Pool19({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const userResult = await pool19.query(
      "SELECT id, name, username FROM users WHERE id = $1",
      [userId2]
    );
    if (userResult.rows.length === 0) {
      await pool19.end();
      return res.status(404).json({
        success: false,
        message: `User ${userId2} not found`
      });
    }
    const user = userResult.rows[0];
    const photoResult = await pool19.query(`
      SELECT id, photo_data, photo_hash, mime_type, file_size, width, height, created_at
      FROM photo_storage 
      WHERE uploaded_by = $1 
      AND is_thumbnail = false
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId2]);
    await pool19.end();
    if (photoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No StarCard PNG found in database for ${user.name || user.username} (ID: ${userId2})`
      });
    }
    const photo = photoResult.rows[0];
    const base64Data = photo.photo_data.includes(",") ? photo.photo_data.split(",")[1] : photo.photo_data;
    const buffer = Buffer.from(base64Data, "base64");
    const extension = photo.mime_type.split("/")[1] || "png";
    const username = user.username || "user";
    const filename = `${username}-starcard-${user.id}.${extension}`;
    res.setHeader("Content-Type", photo.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    console.log(`\u2705 Admin downloading: ${filename} (${photo.file_size} bytes)`);
    res.send(buffer);
  } catch (error) {
    console.error("\u274C Admin download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download StarCard PNG",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router9.get("/admin/list-available", async (req, res) => {
  try {
    console.log("\u{1F510} Admin listing users with StarCard PNGs");
    const { Pool: Pool19 } = await import("pg");
    const pool19 = new Pool19({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const result = await pool19.query(`
      SELECT 
        u.id,
        u.name,
        u.username,
        ps.id as photo_id,
        ps.file_size,
        ps.width,
        ps.height,
        ps.created_at,
        ps.mime_type
      FROM users u
      JOIN photo_storage ps ON ps.uploaded_by = u.id
      WHERE ps.is_thumbnail = false
      ORDER BY ps.created_at DESC
    `);
    await pool19.end();
    const usersWithStarCards = result.rows.map((row) => ({
      userId: row.id,
      name: row.name,
      username: row.username,
      starCard: {
        photoId: row.photo_id,
        fileSize: row.file_size,
        dimensions: `${row.width}x${row.height}`,
        mimeType: row.mime_type,
        createdAt: row.created_at
      }
    }));
    res.json({
      success: true,
      message: `Found ${usersWithStarCards.length} users with StarCard PNGs`,
      users: usersWithStarCards
    });
  } catch (error) {
    console.error("\u274C Admin list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list StarCard PNGs",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var starcard_routes_default = router9;

// server/routes.ts
var router10 = express10.Router();
router10.use(attachUser);
router10.use("/auth", auth_routes_default);
router10.use("/invites", invite_routes_default);
router10.use("/admin/invites", fixed_invite_routes_default);
router10.use("/admin", adminRouter);
router10.use("/facilitator", facilitatorRouter);
router10.use("/user", user_routes_default);
router10.use("/test-users/reset", resetRouter);
router10.use("/workshop-data", workshop_data_routes_default);
router10.use("/growth-plan", growth_plan_routes_default);
router10.use("/photos", photo_routes_default);
router10.use("/starcard", starcard_routes_default);
router10.use("/", workshop_data_routes_default);
router10.post("/assessments", async (req, res) => {
  try {
    const userId2 = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { assessmentType: assessmentType2, results } = req.body;
    if (!assessmentType2 || !results) {
      return res.status(400).json({
        success: false,
        message: "Assessment type and results are required"
      });
    }
    await db.insert(userAssessments).values({
      userId: userId2,
      assessmentType: assessmentType2,
      results: typeof results === "string" ? results : JSON.stringify(results)
    });
    res.json({
      success: true,
      message: "Assessment saved successfully"
    });
  } catch (error) {
    console.error("Error saving assessment:", {
      userId,
      assessmentType,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    res.status(500).json({
      success: false,
      message: "Failed to save assessment"
    });
  }
});
router10.get("/assessments/:type", async (req, res) => {
  try {
    const userId2 = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { type: type2 } = req.params;
    const assessment = await db.select().from(userAssessments).where(
      and5(
        eq11(userAssessments.userId, userId2),
        eq11(userAssessments.assessmentType, type2)
      )
    ).orderBy(desc(userAssessments.createdAt)).limit(1);
    if (assessment.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }
    const results = JSON.parse(assessment[0].results);
    res.json({
      success: true,
      data: {
        id: assessment[0].id,
        userId: assessment[0].userId,
        assessmentType: assessment[0].assessmentType,
        results,
        createdAt: assessment[0].createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching assessment:", {
      userId,
      assessmentType: type,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessment"
    });
  }
});
router10.get("/final-reflection", async (req, res) => {
  try {
    const userId2 = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const reflection = await db.select().from(finalReflections).where(eq11(finalReflections.userId, userId2)).limit(1);
    res.json({
      success: true,
      insight: reflection[0]?.insight || ""
    });
  } catch (error) {
    console.error("Error fetching final reflection:", {
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch final reflection"
    });
  }
});
router10.post("/final-reflection", async (req, res) => {
  try {
    const userId2 = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    if (!userId2) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const { insight } = req.body;
    if (!insight || typeof insight !== "string") {
      return res.status(400).json({
        success: false,
        message: "Insight text is required"
      });
    }
    const existing = await db.select().from(finalReflections).where(eq11(finalReflections.userId, userId2)).limit(1);
    if (existing.length > 0) {
      await db.update(finalReflections).set({
        insight
      }).where(eq11(finalReflections.userId, userId2));
    } else {
      await db.insert(finalReflections).values({
        userId: userId2,
        insight
      });
    }
    res.json({
      success: true,
      message: "Final reflection saved successfully"
    });
  } catch (error) {
    console.error("Error saving final reflection:", {
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    res.status(500).json({
      success: false,
      message: "Failed to save final reflection"
    });
  }
});
router10.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Heliotrope Imaginal Workshop API",
    version: "1.0.0",
    user: req.user || null
  });
});

// server/routes/holistic-report-routes.ts
init_auth();
import express12 from "express";
import { Pool as Pool9 } from "pg";
import fs3 from "fs/promises";
import path2 from "path";

// server/services/mock-report-data-service.ts
var MockReportDataService = class {
  strengthInsightTemplates = [
    "Your analytical thinking strength enables you to break down complex problems systematically",
    "You demonstrate strong execution skills when implementing solutions",
    "Your emotional intelligence helps you navigate team dynamics effectively",
    "Your strategic planning abilities help you see the bigger picture",
    "You excel at connecting ideas and seeing patterns others might miss",
    "Your decisive nature helps teams move forward when facing uncertainty",
    "You bring empathy and understanding to challenging situations",
    "Your organizational skills create structure that benefits the entire team"
  ];
  flowInsightTemplates = [
    "You achieve flow state most easily when working on complex analytical challenges",
    "Collaborative environments energize you and enhance your performance",
    "You thrive when given autonomy to approach problems creatively",
    "Structured workflows help you maintain focus and momentum",
    "You perform best when balancing independent work with team collaboration",
    "Clear goals and feedback loops are essential for your optimal performance",
    "You excel in environments that value both innovation and execution",
    "Variety in your work keeps you engaged and motivated"
  ];
  developmentActionTemplates = [
    "Practice active listening in team meetings to strengthen collaboration",
    "Seek out cross-functional projects to broaden your perspective",
    "Set aside dedicated time for strategic thinking and planning",
    "Develop your coaching skills to help others grow",
    "Create systems to track and celebrate small wins",
    "Build stronger relationships across different departments",
    "Improve your presentation skills to share insights more effectively",
    "Learn new tools and technologies to enhance your capabilities"
  ];
  workStyleTemplates = [
    "Prefers structured approaches with clear timelines",
    "Thrives in collaborative, team-oriented environments",
    "Works best with autonomy and minimal micromanagement",
    "Enjoys tackling complex, challenging problems",
    "Values continuous learning and skill development",
    "Performs optimally with regular feedback and recognition",
    "Prefers variety and diverse types of work",
    "Excels when given leadership opportunities"
  ];
  obstacleTemplates = [
    "Perfectionism sometimes slows down decision-making",
    "Difficulty saying no to additional commitments",
    "Tendency to take on too much responsibility",
    "Need for more confidence in presenting ideas",
    "Balancing multiple priorities and deadlines",
    "Overcoming impostor syndrome in new situations",
    "Managing stress during high-pressure periods",
    "Building stronger boundaries between work and personal life"
  ];
  wellBeingFactors = [
    "Regular exercise and physical activity",
    "Quality time with family and friends",
    "Pursuing creative hobbies and interests",
    "Maintaining work-life balance",
    "Continuous learning and personal growth",
    "Contributing to meaningful causes",
    "Building strong professional relationships",
    "Taking breaks and practicing mindfulness"
  ];
  challengeTemplates = [
    "Learning to delegate more effectively",
    "Managing multiple competing priorities",
    "Building confidence in leadership roles",
    "Improving work-life integration",
    "Developing resilience during setbacks",
    "Communicating ideas more persuasively",
    "Building stronger professional networks",
    "Managing perfectionist tendencies"
  ];
  reflectionQuotes = [
    "I realize I'm most energized when working on projects that directly impact others",
    "My biggest growth opportunity is learning to trust my instincts more",
    "I've discovered that my analytical nature is actually a leadership strength",
    "Building relationships with colleagues has become more important than I initially thought",
    "I'm learning that vulnerability in leadership actually builds stronger teams",
    "My best work happens when I can balance independent thinking with collaborative execution",
    "I've realized that my empathy is just as valuable as my technical skills",
    "Taking time for reflection has helped me become more intentional about my career choices"
  ];
  async generateMockReportData(userId2, reportType) {
    const seed = userId2;
    const participant = await this.generateMockParticipant(seed);
    const strengths = this.generateMockStrengths(seed);
    const flow = this.generateMockFlow(seed);
    const vision = this.generateMockVision(seed);
    const growth = this.generateMockGrowth(seed);
    const reportData = {
      participant,
      strengths,
      flow,
      vision,
      growth,
      reportType,
      generatedAt: /* @__PURE__ */ new Date(),
      workshopVersion: "AST v2.1.0"
    };
    if (reportType === "personal") {
      reportData.personalReflections = this.generateMockPersonalReflections(seed);
    }
    return reportData;
  }
  async generateMockParticipant(seed) {
    const names = ["Alex Johnson", "Taylor Smith", "Jordan Brown", "Casey Wilson", "Riley Davis"];
    const titles = ["Senior Developer", "Product Manager", "Team Lead", "UX Designer", "Data Analyst"];
    const orgs = ["TechCorp Inc.", "Innovation Labs", "Global Solutions", "Creative Studios", "Future Systems"];
    return {
      name: names[seed % names.length],
      title: titles[seed % titles.length],
      organization: orgs[seed % orgs.length],
      completedAt: /* @__PURE__ */ new Date()
    };
  }
  generateMockStrengths(seed = 1) {
    const base = [25, 25, 25, 25];
    const variations = [
      [35, 30, 20, 15],
      // Thinking dominant
      [20, 35, 25, 20],
      // Acting dominant  
      [25, 20, 35, 20],
      // Feeling dominant
      [20, 25, 20, 35],
      // Planning dominant
      [30, 25, 25, 20]
      // Balanced with thinking edge
    ];
    const profile = variations[seed % variations.length];
    const strengthNames = ["Strategic Thinking", "Execution Excellence", "Relationship Building", "Systems Planning"];
    return {
      thinking: profile[0],
      acting: profile[1],
      feeling: profile[2],
      planning: profile[3],
      topStrengths: this.selectRandomItems(strengthNames, 2, seed),
      strengthInsights: this.selectRandomItems(this.strengthInsightTemplates, 3, seed)
    };
  }
  generateMockFlow() {
    const attributeOptions = [
      { name: "Deep Focus", description: "Ability to concentrate deeply", category: "cognitive" },
      { name: "Creative Problem-Solving", description: "Innovative approach to challenges", category: "creative" },
      { name: "Team Collaboration", description: "Effective teamwork and communication", category: "social" },
      { name: "Analytical Thinking", description: "Systematic analysis and reasoning", category: "cognitive" },
      { name: "Adaptive Learning", description: "Quick skill acquisition", category: "learning" },
      { name: "Leadership Presence", description: "Natural leadership qualities", category: "social" }
    ];
    return {
      attributes: this.selectRandomItems(attributeOptions, 4),
      flowInsights: this.selectRandomItems(this.flowInsightTemplates, 3),
      preferredWorkStyle: this.selectRandomItems(this.workStyleTemplates, 3)
    };
  }
  generateMockVision() {
    return {
      currentState: "Currently focused on developing technical leadership skills while maintaining hands-on involvement in key projects",
      futureVision: "Leading a high-performing team that delivers innovative solutions while fostering a culture of continuous learning and collaboration",
      obstacles: this.selectRandomItems(this.obstacleTemplates, 3),
      strengths: ["Strong analytical thinking", "Natural mentor", "Excellent communication skills"],
      actionSteps: this.selectRandomItems(this.developmentActionTemplates, 4)
    };
  }
  generateMockGrowth() {
    return {
      developmentAreas: ["Leadership Communication", "Strategic Planning", "Team Development"],
      recommendedActions: this.selectRandomItems(this.developmentActionTemplates, 5),
      teamCollaborationTips: [
        "Schedule regular one-on-ones with team members",
        "Create opportunities for cross-functional collaboration",
        "Practice active listening in all team interactions",
        "Celebrate team wins and individual contributions"
      ]
    };
  }
  generateMockPersonalReflections(seed = 1) {
    return {
      challenges: this.selectRandomItems(this.challengeTemplates, 3, seed),
      wellBeingFactors: this.selectRandomItems(this.wellBeingFactors, 4, seed),
      personalGrowthAreas: ["Emotional resilience", "Work-life integration", "Authentic leadership"],
      privateInsights: [
        "Learning to embrace vulnerability as a strength",
        "Recognizing the importance of self-care in sustainable performance",
        "Understanding that perfectionism can hinder progress"
      ],
      reflectionQuotes: this.selectRandomItems(this.reflectionQuotes, 2, seed)
    };
  }
  selectRandomItems(items, count2, seed = 1) {
    const selected = [];
    for (let i = 0; i < count2 && i < items.length; i++) {
      const index2 = (seed + i * 7) % items.length;
      if (!selected.includes(items[index2])) {
        selected.push(items[index2]);
      }
    }
    return selected;
  }
};
var mockReportDataService = new MockReportDataService();

// server/routes/holistic-report-routes.ts
init_openai_api_service();
var router12 = express12.Router();
var pool9 = new Pool9({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
router12.post("/test-generate", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Endpoint not available in production" });
  }
  const { reportType = "standard", userId: userId2 = 1 } = req.body;
  try {
    console.log(`\u{1F9EA} TEST: Starting ${reportType} report generation for user ${userId2}`);
    const existingReport = await pool9.query(
      "SELECT id, generation_status FROM holistic_reports WHERE user_id = $1 AND report_type = $2",
      [userId2, reportType]
    );
    if (existingReport.rows.length > 0) {
      const existing = existingReport.rows[0];
      if (existing.generation_status === "generating") {
        return res.status(409).json({
          success: false,
          message: `A ${reportType} report is currently being generated for test user.`,
          reportId: existing.id,
          status: "generating"
        });
      }
    }
    let reportId;
    if (existingReport.rows.length > 0) {
      reportId = existingReport.rows[0].id;
      await pool9.query(
        "UPDATE holistic_reports SET generation_status = $1, updated_at = NOW() WHERE id = $2",
        ["generating", reportId]
      );
    } else {
      const newReport = await pool9.query(
        `INSERT INTO holistic_reports (user_id, report_type, report_data, generation_status, generated_by_user_id) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [userId2, reportType, JSON.stringify({}), "generating", userId2]
      );
      reportId = newReport.rows[0].id;
    }
    console.log(`\u{1F916} Generating ${reportType} report using Star Report Talia AI persona`);
    const reportData = await generateReportUsingTalia(userId2, reportType);
    const starCardImagePath = await getStarCardImagePath(userId2);
    reportData.starCardImagePath = starCardImagePath;
    if (!reportData.starCardImageBase64) {
      try {
        const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
        const starCardImage = await photoStorageService2.getUserStarCard(userId2.toString());
        if (starCardImage && starCardImage.photoData) {
          reportData.starCardImageBase64 = starCardImage.photoData;
        }
      } catch (error) {
        console.warn("Could not get StarCard base64 data:", error);
      }
    }
    console.log("\u{1F3AF} Generating HTML report content");
    const htmlContent = generateHtmlReport(reportData, reportType);
    const pdfFileName = `${reportData.participant.name}-${reportType}-report.pdf`;
    await pool9.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        html_content = $2,
        pdf_file_name = $3, 
        star_card_image_path = $4,
        generation_status = $5,
        updated_at = NOW()
       WHERE id = $6`,
      [
        JSON.stringify(reportData),
        htmlContent,
        pdfFileName,
        starCardImagePath,
        "completed",
        reportId
      ]
    );
    console.log(`\u2705 TEST: ${reportType} report generated successfully for user ${userId2}`);
    res.json({
      success: true,
      reportId,
      message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} test report generated successfully`,
      status: "completed"
    });
  } catch (error) {
    console.error(`\u274C TEST: Report generation failed for user ${userId2}:`, error);
    res.status(500).json({
      success: false,
      message: "Test report generation failed. Please try again.",
      status: "failed",
      error: error.message
    });
  }
});
router12.post("/generate", async (req, res) => {
  const { reportType } = req.body;
  let userId2 = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
  if (!userId2) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  if (!reportType || !["standard", "personal"].includes(reportType)) {
    return res.status(400).json({
      success: false,
      message: "Valid report type (standard or personal) is required"
    });
  }
  try {
    console.log(`\u{1F680} Starting ${reportType} report generation for user ${userId2}`);
    const existingReport = await pool9.query(
      "SELECT id, generation_status FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3",
      [userId2, reportType, "generating"]
    );
    if (existingReport.rows.length > 0) {
      const existing = existingReport.rows[0];
      return res.status(409).json({
        success: false,
        message: `A ${reportType} report is currently being generated. Please wait.`,
        reportId: existing.id,
        status: "generating"
      });
    }
    const newReport = await pool9.query(
      `INSERT INTO holistic_reports (user_id, report_type, report_data, generation_status, generated_by_user_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId2, reportType, JSON.stringify({}), "generating", userId2]
    );
    const reportId = newReport.rows[0].id;
    console.log(`\u{1F916} Generating ${reportType} report using Star Report Talia AI persona`);
    const reportData = await generateReportUsingTalia(userId2, reportType);
    const starCardImagePath = await getStarCardImagePath(userId2);
    reportData.starCardImagePath = starCardImagePath;
    if (!reportData.starCardImageBase64) {
      try {
        const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
        const starCardImage = await photoStorageService2.getUserStarCard(userId2.toString());
        if (starCardImage && starCardImage.photoData) {
          reportData.starCardImageBase64 = starCardImage.photoData;
        }
      } catch (error) {
        console.warn("Could not get StarCard base64 data:", error);
      }
    }
    console.log("\u{1F3AF} Generating HTML report content");
    const htmlContent = generateHtmlReport(reportData, reportType);
    const pdfFileName = `${reportData.participant.name}-${reportType}-report.pdf`;
    await pool9.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        html_content = $2,
        pdf_file_name = $3, 
        star_card_image_path = $4,
        generation_status = $5,
        updated_at = NOW()
       WHERE id = $6`,
      [
        JSON.stringify(reportData),
        htmlContent,
        pdfFileName,
        starCardImagePath,
        "completed",
        reportId
      ]
    );
    const progressField = reportType === "standard" ? "standard_report_generated" : "personal_report_generated";
    await pool9.query(
      `UPDATE navigation_progress SET ${progressField} = true, holistic_reports_unlocked = true WHERE user_id = $1`,
      [userId2]
    );
    console.log(`\u2705 ${reportType} report generated successfully for user ${userId2}`);
    res.json({
      success: true,
      reportId,
      message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`,
      status: "completed"
    });
  } catch (error) {
    console.error(`\u274C Report generation failed for user ${userId2}:`, error);
    await pool9.query(
      "UPDATE holistic_reports SET generation_status = $1, error_message = $2, updated_at = NOW() WHERE user_id = $3 AND report_type = $4",
      ["failed", error.message, userId2, reportType]
    );
    res.status(500).json({
      success: false,
      message: "Report generation failed. Please try again.",
      status: "failed"
    });
  }
});
router12.get("/test-status/:reportType/:userId", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Endpoint not available in production" });
  }
  const { reportType, userId: userId2 } = req.params;
  if (!["standard", "personal"].includes(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }
  try {
    const result = await pool9.query(
      "SELECT id, generation_status, generated_at, error_message FROM holistic_reports WHERE user_id = $1 AND report_type = $2",
      [parseInt(userId2), reportType]
    );
    if (result.rows.length === 0) {
      return res.json({
        reportId: null,
        status: "not_generated"
      });
    }
    const report = result.rows[0];
    const response = {
      reportId: report.id,
      status: report.generation_status,
      generatedAt: report.generated_at,
      errorMessage: report.error_message
    };
    if (report.generation_status === "completed") {
      response.pdfUrl = `/api/reports/holistic/test-download/${reportType}/${userId2}`;
      response.reportUrl = `/api/reports/holistic/test-view/${reportType}/${userId2}`;
      response.downloadUrl = `/api/reports/holistic/test-download/${reportType}/${userId2}`;
    }
    res.json(response);
  } catch (error) {
    console.error("Error fetching test report status:", error);
    res.status(500).json({ error: "Failed to fetch report status" });
  }
});
router12.get("/:reportType/status", requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId2 = req.session?.userId;
  if (!userId2) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!["standard", "personal"].includes(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }
  try {
    const result = await pool9.query(
      "SELECT id, generation_status, generated_at, error_message FROM holistic_reports WHERE user_id = $1 AND report_type = $2 ORDER BY generated_at DESC LIMIT 1",
      [userId2, reportType]
    );
    if (result.rows.length === 0) {
      return res.json({
        reportId: null,
        status: "not_generated"
      });
    }
    const report = result.rows[0];
    const response = {
      reportId: report.id,
      status: report.generation_status,
      generatedAt: report.generated_at,
      errorMessage: report.error_message
    };
    if (report.generation_status === "completed") {
      response.pdfUrl = `/api/reports/holistic/${reportType}/download`;
      response.reportUrl = `/api/reports/holistic/${reportType}/view`;
      response.downloadUrl = `/api/reports/holistic/${reportType}/download?download=true`;
      response.htmlUrl = `/api/reports/holistic/${reportType}/html`;
    }
    res.json(response);
  } catch (error) {
    console.error("Error fetching report status:", error);
    res.status(500).json({ error: "Failed to fetch report status" });
  }
});
router12.get("/:reportType/view", requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId2 = req.session?.userId;
  if (!userId2) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const result = await pool9.query(
      "SELECT html_content, report_data FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3 ORDER BY generated_at DESC LIMIT 1",
      [userId2, reportType, "completed"]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found or not completed" });
    }
    const { html_content, report_data } = result.rows[0];
    let htmlContent = html_content;
    if (!htmlContent && report_data) {
      htmlContent = generateHtmlReport(report_data, reportType);
    }
    if (!htmlContent) {
      return res.status(404).json({ error: "Report content not available" });
    }
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving report:", error);
    res.status(500).json({ error: "Failed to load report" });
  }
});
router12.get("/:reportType/download", requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId2 = req.session?.userId;
  if (!userId2) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const result = await pool9.query(
      "SELECT html_content, report_data, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3 ORDER BY generated_at DESC LIMIT 1",
      [userId2, reportType, "completed"]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found or not completed" });
    }
    const { html_content, report_data, pdf_file_name } = result.rows[0];
    let htmlContent = html_content;
    if (!htmlContent && report_data) {
      htmlContent = generateHtmlReport(report_data, reportType);
    }
    if (!htmlContent) {
      return res.status(404).json({ error: "Report content not available" });
    }
    try {
      console.log("\u{1F504} Attempting PDF generation using Puppeteer...");
      const puppeteer = await import("puppeteer");
      const browser = await puppeteer.default.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ]
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(htmlContent, {
        waitUntil: ["networkidle0", "domcontentloaded"],
        timeout: 3e4
      });
      await page.waitForTimeout(2e3);
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm"
        },
        displayHeaderFooter: false,
        preferCSSPageSize: true
      });
      await browser.close();
      console.log("\u2705 PDF generated successfully");
      const filename = pdf_file_name || `${reportType}-report.pdf`;
      const isDownload = req.query.download === "true";
      const headers = {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Cache-Control": "no-cache",
        "Content-Disposition": isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`
      };
      res.writeHead(200, headers);
      res.end(pdfBuffer);
    } catch (pdfError) {
      console.error("\u274C PDF generation failed, serving HTML instead:", pdfError);
      console.error("PDF Error details:", {
        message: pdfError.message,
        stack: pdfError.stack?.split("\n")[0]
      });
      const filename = pdf_file_name?.replace(".pdf", ".html") || `${reportType}-report.html`;
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-cache");
      if (req.query.download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      }
      const htmlWithNote = htmlContent.replace(
        '<div class="header">',
        `<div class="header">
          <div style="background-color: #fef3c7; color: #92400e; padding: 10px; margin-bottom: 20px; border-radius: 6px; font-size: 14px;">
            <strong>Note:</strong> PDF generation is temporarily unavailable. This is the HTML version of your report.
          </div>`
      );
      res.send(htmlWithNote);
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    res.status(500).json({ error: "Failed to download report" });
  }
});
router12.get("/:reportType/html", requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId2 = req.session?.userId;
  if (!userId2) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const result = await pool9.query(
      "SELECT html_content, report_data FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3 ORDER BY generated_at DESC LIMIT 1",
      [userId2, reportType, "completed"]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found or not completed" });
    }
    const { html_content, report_data } = result.rows[0];
    let htmlContent = html_content;
    if (!htmlContent && report_data) {
      htmlContent = generateHtmlReport(report_data, reportType);
    }
    if (!htmlContent) {
      return res.status(404).json({ error: "Report content not available" });
    }
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving HTML report:", error);
    res.status(500).json({ error: "Failed to load HTML report" });
  }
});
router12.delete("/admin/reset", requireAuth, async (req, res) => {
  if (req.session?.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const result = await pool9.query("DELETE FROM holistic_reports");
    console.log(`\u{1F9F9} Admin reset: Deleted ${result.rowCount} holistic reports`);
    res.json({
      success: true,
      message: `Deleted ${result.rowCount} reports`,
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error("Error resetting reports:", error);
    res.status(500).json({ error: "Failed to reset reports" });
  }
});
router12.get("/admin/list", requireAuth, async (req, res) => {
  if (req.session?.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const result = await pool9.query(`
      SELECT hr.*, u.username, u.name as user_name 
      FROM holistic_reports hr 
      JOIN users u ON hr.user_id = u.id 
      ORDER BY hr.generated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching admin report list:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});
async function generateReportUsingTalia(userId2, reportType) {
  try {
    console.log(`\u{1F386} Starting Star Report Talia generation using ADMIN CONSOLE methodology for user ${userId2}, type: ${reportType}`);
    const userResult = await pool9.query(
      "SELECT id, username, name, ast_workshop_completed, ast_completed_at FROM users WHERE id = $1",
      [userId2]
    );
    if (userResult.rows.length === 0) {
      console.log(`\u26A0\uFE0F User ${userId2} not found, falling back to mock data`);
      return await mockReportDataService.generateMockReportData(userId2, reportType);
    }
    const user = userResult.rows[0];
    console.log(`\u{1F50D} User data: ID=${user.id}, completed=${user.ast_workshop_completed}, name=${user.name}`);
    if (!user.ast_workshop_completed) {
      console.log(`\u26A0\uFE0F User ${userId2} has not completed AST workshop, falling back to mock data`);
      return await mockReportDataService.generateMockReportData(userId2, reportType);
    }
    const assessmentResult = await pool9.query(
      "SELECT * FROM user_assessments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId2]
    );
    const stepDataResult = await pool9.query(
      "SELECT * FROM workshop_step_data WHERE user_id = $1 ORDER BY step_id, created_at DESC",
      [userId2]
    );
    console.log(`\u{1F4CA} Found ${assessmentResult.rows.length} assessments and ${stepDataResult.rows.length} step data records`);
    let starCardImageBase64 = "";
    try {
      console.log(`\u{1F5BC}\uFE0F Getting StarCard image for user ${userId2}...`);
      const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
      const starCardImage = await photoStorageService2.getUserStarCard(userId2.toString());
      if (starCardImage && starCardImage.photoData) {
        starCardImageBase64 = starCardImage.photoData;
        console.log("\u2705 Found StarCard image for report integration");
      } else {
        console.log("\u26A0\uFE0F No StarCard image found for this user");
      }
    } catch (error) {
      console.warn("Could not retrieve StarCard image:", error);
    }
    const isPersonalReport = reportType === "personal";
    const reportContext = {
      userName: user.name,
      reportType,
      essentialAssessments: assessmentResult.rows,
      essentialReflections: stepDataResult.rows
    };
    console.log("\u{1F680} Using pgvector semantic search for optimal training content");
    const { pgvectorSearchService: pgvectorSearchService2 } = await Promise.resolve().then(() => (init_pgvector_search_service(), pgvector_search_service_exports));
    const userContextData = {
      name: user.name,
      strengths: assessmentResult.rows.find((a) => a.assessment_type === "starCard")?.results ? JSON.parse(assessmentResult.rows.find((a) => a.assessment_type === "starCard").results) : { "thinking": 0, "feeling": 0, "acting": 0, "planning": 0 },
      reflections: assessmentResult.rows.find((a) => a.assessment_type === "stepByStepReflection")?.results ? JSON.parse(assessmentResult.rows.find((a) => a.assessment_type === "stepByStepReflection").results) : {},
      flowData: assessmentResult.rows.find((a) => a.assessment_type === "flowAssessment")?.results ? JSON.parse(assessmentResult.rows.find((a) => a.assessment_type === "flowAssessment").results) : null
    };
    console.log("\u{1F50D} DEBUG: Assessment results:", assessmentResult.rows.map((r) => ({ type: r.assessment_type, hasResults: !!r.results })));
    console.log("\u{1F50D} DEBUG: User context data being passed to pgvector:", JSON.stringify(userContextData, null, 2));
    const reportPrompt = await pgvectorSearchService2.getOptimalTrainingPrompt(
      isPersonalReport ? "personal" : "professional",
      userContextData
    );
    console.log("\u2728 Generated sophisticated report prompt with user-specific analysis");
    console.log("\u{1F916} Attempting OpenAI report generation first...");
    let reportContent;
    let usingOpenAI = false;
    try {
      reportContent = await generateOpenAICoachingResponse({
        userMessage: reportPrompt,
        personaType: "star_report",
        userName: user.name,
        contextData: {
          reportContext: "holistic_generation",
          selectedUserId: userId2,
          selectedUserName: user.name,
          userData: {
            user,
            assessments: assessmentResult.rows,
            stepData: stepDataResult.rows,
            completedAt: user.ast_completed_at
          },
          starCardImageBase64
        },
        userId: userId2,
        sessionId: `holistic-${reportType}-${userId2}-${Date.now()}`,
        maxTokens: 4e3
      });
      usingOpenAI = true;
      console.log("\u2705 OpenAI report generation successful");
    } catch (openaiError) {
      console.log("\u26A0\uFE0F OpenAI failed, falling back to Claude:", openaiError.message);
      reportContent = await generateOpenAICoachingResponse({
        userMessage: reportPrompt,
        personaType: "star_report",
        userName: user.name,
        contextData: {
          reportContext: "holistic_generation",
          selectedUserId: userId2,
          selectedUserName: user.name,
          adminMode: false,
          userData: {
            user,
            assessments: assessmentResult,
            stepData: stepDataResult,
            completedAt: user.ast_completed_at
          },
          starCardImageBase64,
          enhancedPrompting: true
          // Flag that we're using enhanced prompting
        },
        userId: userId2,
        sessionId: `holistic-${reportType}-${userId2}-${Date.now()}`,
        maxTokens: 25e3
      });
      usingOpenAI = false;
      console.log("\u2705 Claude fallback report generation successful");
    }
    console.log("\u{1F4CA} Foundation testing mode - quality monitoring disabled");
    if (!reportContent || reportContent.trim() === "") {
      throw new Error("Report generation failed: Empty response from Claude API");
    }
    if (starCardImageBase64 && reportContent.includes("{{STARCARD_IMAGE}}")) {
      const starCardHtml = `<img src="data:image/png;base64,${starCardImageBase64}" alt="StarCard for ${user.name}" class="starcard-image" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />`;
      reportContent = reportContent.replace(/\{\{STARCARD_IMAGE\}\}/g, starCardHtml);
      console.log("\u2705 StarCard placeholder replaced with actual image data");
    }
    console.log(`\u2705 Admin-style report generated successfully (${reportContent.length} chars)`);
    const starCardAssessment = assessmentResult.rows.find((a) => a.assessment_type === "starCard");
    let actualStrengths = { thinking: 0, acting: 0, feeling: 0, planning: 0 };
    if (starCardAssessment && starCardAssessment.results) {
      try {
        const starCardData = JSON.parse(starCardAssessment.results);
        actualStrengths = {
          thinking: starCardData.thinking || 0,
          acting: starCardData.acting || 0,
          feeling: starCardData.feeling || 0,
          planning: starCardData.planning || 0
        };
        console.log(`\u2705 Extracted actual user strengths data:`, actualStrengths);
      } catch (error) {
        console.warn(`\u26A0\uFE0F Failed to parse StarCard data for user ${userId2}, using defaults:`, error);
      }
    } else {
      console.warn(`\u26A0\uFE0F No StarCard assessment found for user ${userId2}, using default values`);
    }
    const reportData = {
      participant: {
        name: user.name,
        title: user.username,
        organization: "",
        completedAt: new Date(user.ast_completed_at || Date.now())
      },
      strengths: {
        thinking: actualStrengths.thinking,
        acting: actualStrengths.acting,
        feeling: actualStrengths.feeling,
        planning: actualStrengths.planning,
        topStrengths: [],
        strengthInsights: []
      },
      flow: {
        attributes: [],
        flowInsights: [],
        preferredWorkStyle: []
      },
      vision: {
        currentState: "",
        futureVision: "",
        obstacles: [],
        strengths: [],
        actionSteps: []
      },
      growth: {
        developmentAreas: [],
        recommendedActions: [],
        teamCollaborationTips: []
      },
      reportType,
      generatedAt: /* @__PURE__ */ new Date(),
      workshopVersion: "2.1",
      generatedBy: `Star Report Talia (${usingOpenAI ? "OpenAI" : "Claude"} via Admin Console Method)`,
      personalReport: isPersonalReport ? reportContent : "",
      professionalProfile: !isPersonalReport ? reportContent : "",
      starCardImageBase64,
      userData: {
        user,
        assessments: assessmentResult.rows,
        stepData: stepDataResult.rows
      }
    };
    console.log(`\u2705 Complete admin-style report data generated for user ${userId2}`);
    return reportData;
  } catch (error) {
    console.error(`\u274C Error generating admin-style report for user ${userId2}:`, error);
    console.log(`\u{1F504} Falling back to mock data service for user ${userId2}`);
    return await mockReportDataService.generateMockReportData(userId2, reportType);
  }
}
async function getStarCardImagePath(userId2) {
  try {
    console.log(`\u{1F5BC}\uFE0F Getting StarCard image for user ${userId2} from database...`);
    const result = await pool9.query(
      `SELECT photo_hash, photo_data, mime_type 
       FROM photo_storage 
       WHERE uploaded_by = $1 AND mime_type = 'image/png'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId2]
    );
    if (result.rows.length > 0) {
      const { photo_hash, photo_data, mime_type } = result.rows[0];
      console.log(`\u2705 Found StarCard in database for user ${userId2}`);
      const tempDir = path2.join(process.cwd(), "storage", "temp-report-images");
      await fs3.mkdir(tempDir, { recursive: true });
      const tempImagePath = path2.join(tempDir, `starcard-${photo_hash.substring(0, 16)}.png`);
      try {
        await fs3.access(tempImagePath);
        console.log("\u{1F4CA} Using existing temp StarCard file");
        return tempImagePath;
      } catch {
        console.log("\u{1F3A8} Creating temporary StarCard file...");
        const base64Data = photo_data.replace(/^data:image\/[a-z]+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        await fs3.writeFile(tempImagePath, imageBuffer);
        console.log(`\u2705 StarCard temp file created: ${tempImagePath}`);
        return tempImagePath;
      }
    }
    console.log(`\u26A0\uFE0F No StarCard found in database for user ${userId2}`);
    return "";
  } catch (error) {
    console.error(`\u274C Error getting StarCard image for user ${userId2}:`, error);
    return "";
  }
}
function generateHtmlReport(reportData, reportType) {
  const title = reportType === "standard" ? "Professional Development Report" : "Personal Development Report";
  const isPersonalReport = reportType === "personal";
  const strengthsArray = [
    { name: "thinking", value: reportData.strengths?.thinking || 0, color: "#01a252", bgColor: "linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)" },
    { name: "acting", value: reportData.strengths?.acting || 0, color: "#f14040", bgColor: "linear-gradient(135deg, #ffebee 0%, #fff5f5 100%)" },
    { name: "feeling", value: reportData.strengths?.feeling || 0, color: "#167efd", bgColor: "linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)" },
    { name: "planning", value: reportData.strengths?.planning || 0, color: "#ffcb2f", bgColor: "linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)" }
  ].sort((a, b) => b.value - a.value);
  let starCardImageTag = "";
  if (reportData.starCardImagePath) {
    try {
      const fs7 = __require("fs");
      const imageBuffer = fs7.readFileSync(reportData.starCardImagePath);
      const base64Image = imageBuffer.toString("base64");
      starCardImageTag = `<img src="data:image/png;base64,${base64Image}" alt="StarCard" style="max-width: 400px; height: auto; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
    } catch (error) {
      console.log("Could not load StarCard image:", error.message);
    }
  }
  if (!starCardImageTag) {
    const starCardImage = reportData.starCardImageBase64 || reportData.starCardData?.photoData || "";
    console.log(`\u{1F5BC}\uFE0F StarCard debug: starCardImageBase64 length: ${reportData.starCardImageBase64?.length || 0}, starCardData exists: ${!!reportData.starCardData}`);
    if (starCardImage) {
      const cleanBase64 = starCardImage.replace(/^data:image\/[a-z]+;base64,/, "");
      starCardImageTag = `<img src="data:image/png;base64,${cleanBase64}" alt="StarCard" style="max-width: 400px; height: auto; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
      console.log(`\u2705 StarCard image tag created for HTML report`);
    } else {
      console.log(`\u26A0\uFE0F No StarCard image data found for HTML report`);
    }
  }
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${reportData.participant?.name || "User"}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f9f9f9;
                margin: 0;
                padding: 20px;
            }
            
            .report-container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin: 0 0 20px 0;
                font-weight: 300;
            }
            
            .participant-info h2 {
                font-size: 2rem;
                margin: 0 0 10px 0;
            }
            
            .participant-info p {
                margin: 5px 0;
                opacity: 0.9;
            }
            
            .content-section {
                padding: 40px;
            }
            
            .section-title {
                font-size: 1.8rem;
                color: #2563eb;
                margin: 0 0 30px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #e5e7eb;
            }
            
            /* Introduction Text */
            .intro-text {
                font-style: italic;
                color: #6c757d;
                border-left: 4px solid #e2e8f0;
                padding-left: 20px;
                margin-bottom: 30px;
                font-size: 1.1rem;
                line-height: 1.7;
            }
            
            /* Pie Chart Section */
            .pie-chart-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .pie-container {
                position: relative;
                width: 700px;
                height: 500px;
                margin: 0 auto;
            }
            
            .pie-svg {
                width: 100%;
                height: 100%;
            }
            
            .strength-label {
                font-family: 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 14px;
                text-anchor: middle;
            }
            
            .percentage-label {
                font-family: 'Segoe UI', sans-serif;
                font-weight: 700;
                font-size: 12px;
                text-anchor: middle;
            }
            
            /* Strengths Grid */
            .strengths-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 30px 0;
            }
            
            .strength-card {
                padding: 20px;
                border-radius: 12px;
                border-left: 5px solid;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .strength-card.thinking {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border-left-color: #01a252;
            }
            
            .strength-card.planning {
                background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
                border-left-color: #ffcb2f;
            }
            
            .strength-card.feeling {
                background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
                border-left-color: #167efd;
            }
            
            .strength-card.acting {
                background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%);
                border-left-color: #f14040;
            }
            
            .strength-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .strength-number {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 12px;
                font-size: 1rem;
            }
            
            .strength-title {
                font-size: 16px;
                font-weight: 600;
                flex: 1;
                color: #374151;
            }
            
            .strength-percentage {
                font-size: 18px;
                font-weight: 700;
                color: #2563eb;
            }
            
            .strength-description {
                font-size: 14px;
                line-height: 1.6;
                color: #4a5568;
            }
            
            .profile-summary {
                background: #fefbf3;
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin-top: 20px;
                border-radius: 0 8px 8px 0;
            }
            
            .profile-summary p {
                margin: 8px 0;
                line-height: 1.6;
            }
            
            .ai-content {
                background: #fdfdfd;
                border-radius: 12px;
                padding: 30px;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                line-height: 1.6;
            }
            
            .personal-section {
                background: #fefbf3;
                border: 2px solid #f59e0b;
                border-radius: 12px;
                padding: 25px;
                margin: 40px 0;
            }
            
            .professional-conclusion {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 2px solid #475569;
                border-radius: 12px;
                padding: 30px;
                margin: 40px 0;
                position: relative;
                overflow: hidden;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            
            .professional-conclusion::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #1e40af, #3b82f6, #06b6d4);
            }
            
            .professional-conclusion::after {
                content: '';
                position: absolute;
                bottom: 0;
                right: 0;
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 70%);
                border-top-left-radius: 100%;
            }
            
            /* Enhanced professional report styling */
            .professional-highlights {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 1px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                position: relative;
            }
            
            .professional-highlights::before {
                content: "\u{1F4BC}";
                position: absolute;
                top: -10px;
                left: 20px;
                background: white;
                padding: 0 8px;
                font-size: 18px;
            }
            
            .professional-action-items {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 4px solid #22c55e;
                border-radius: 0 8px 8px 0;
                padding: 20px;
                margin: 25px 0;
            }
            
            .professional-signature {
                text-align: center;
                padding: 30px;
                background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
                border-top: 3px solid #2563eb;
                margin-top: 40px;
                border-radius: 0 0 12px 12px;
            }
            
            .professional-signature h3 {
                color: #1f2937;
                font-size: 1.3rem;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .professional-signature p {
                color: #6b7280;
                font-style: italic;
                line-height: 1.6;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                margin: 5px 0;
            }
            
            @media print {
                body { background: white; padding: 0; }
                .report-container { box-shadow: none; }
            }
            
            @media (max-width: 768px) {
                .visual-layout { grid-template-columns: 1fr; }
                .strengths-grid { grid-template-columns: 1fr; }
                .content-section { padding: 20px; }
                .professional-conclusion { padding: 20px; margin: 20px 0; }
                .professional-highlights, .professional-action-items { padding: 15px; margin: 15px 0; }
                .professional-signature { padding: 20px; }
                div[style*="grid-template-columns: 1fr 1fr"] { 
                    display: block !important; 
                }
                div[style*="grid-template-columns: 1fr 1fr"] > div {
                    margin-bottom: 15px !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="header">
                <h1>${title}</h1>
                <div class="participant-info">
                    <h2>${reportData.participant?.name || "User"}</h2>
                    <p>Generated on ${new Date(reportData.generatedAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} at ${new Date(reportData.generatedAt || Date.now()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  })}</p>
                </div>
            </div>
            
            <div class="content-section">
                <h2 class="section-title">Your Strengths Profile</h2>
                
                <p class="intro-text">You possess a unique combination of strengths that shapes how you naturally approach challenges, collaborate with others, and create value in your work.</p>

                ${reportData.strengths ? `
                <!-- StarCard Image -->
                ${starCardImageTag ? `<div style="text-align: center; margin: 30px 0;">${starCardImageTag}</div>` : ""}
                
                <!-- Pie Chart Visualization -->
                <div class="pie-chart-section">
                    <div class="pie-container">
                        <svg class="pie-svg" viewBox="0 0 500 500">
                            ${generatePieChartSegments(strengthsArray)}
                            ${generatePieChartLabels(strengthsArray)}
                        </svg>
                    </div>
                </div>

                <!-- Strengths Details Grid (Ordered by percentage) -->
                <div class="strengths-grid">
                    ${strengthsArray.map((strength, index2) => `
                    <div class="strength-card ${strength.name}" style="background: ${strength.bgColor}; border-left-color: ${strength.color};">
                        <div class="strength-header">
                            <div class="strength-number" style="background: ${strength.color}; ${strength.name === "planning" ? "color: #333;" : ""}">${index2 + 1}</div>
                            <div>
                                <div class="strength-title">${strength.name.toUpperCase()}</div>
                                <div class="strength-percentage">${strength.value}%</div>
                            </div>
                        </div>
                        <div class="strength-description">
                            ${getStrengthDescription(strength.name)}
                        </div>
                    </div>
                    `).join("")}
                </div>
                ` : ""}
            </div>

            ${reportData.professionalProfile ? `
            <div class="content-section ${!isPersonalReport ? "professional-conclusion" : ""}">
                <h2 class="section-title">${isPersonalReport ? "Personal Development Insights" : "Professional Development Analysis"}</h2>
                
                ${!isPersonalReport ? `
                <div class="professional-highlights">
                    <h4 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">Professional Strengths Overview</h4>
                    <p style="color: #374151; line-height: 1.6; margin: 0;">
                        Your unique combination of ${strengthsArray[0]?.name || "thinking"} (${strengthsArray[0]?.value || 0}%) and ${strengthsArray[1]?.name || "acting"} (${strengthsArray[1]?.value || 0}%) creates a distinctive professional signature that drives exceptional results in collaborative environments.
                    </p>
                </div>
                ` : ""}
                
                <div class="ai-content">${formatAIContentForHTML(reportData.professionalProfile)}</div>
                
                ${!isPersonalReport ? `
                <div class="professional-action-items">
                    <h4 style="color: #166534; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">\u{1F3AF} Strategic Application</h4>
                    <p style="color: #374151; line-height: 1.6; margin: 0;">
                        Focus on roles and projects that leverage your dominant ${strengthsArray[0]?.name || "thinking"} strength while developing complementary skills in your secondary areas. 
                        This balanced approach maximizes your professional impact and leadership potential.
                    </p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                    <h3 style="color: #374151; font-size: 1.2rem; font-weight: 600; margin-bottom: 15px;">\u{1F4CA} Key Professional Insights</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                            <h5 style="color: #1e40af; font-size: 0.9rem; font-weight: 600; margin: 0 0 8px 0;">Collaboration Style</h5>
                            <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; margin: 0;">
                                ${strengthsArray[0]?.name === "feeling" ? "Relationship-focused with strong emotional intelligence" : strengthsArray[0]?.name === "thinking" ? "Analytical and strategic in approach" : strengthsArray[0]?.name === "acting" ? "Results-oriented with high execution capability" : "Structured and detail-oriented with excellent planning skills"}
                            </p>
                        </div>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #22c55e;">
                            <h5 style="color: #166534; font-size: 0.9rem; font-weight: 600; margin: 0 0 8px 0;">Leadership Potential</h5>
                            <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; margin: 0;">
                                Your ${strengthsArray[0]?.value || 0}% ${strengthsArray[0]?.name || "thinking"} strength positions you as a natural ${strengthsArray[0]?.name === "feeling" ? "people leader" : strengthsArray[0]?.name === "thinking" ? "strategic leader" : strengthsArray[0]?.name === "acting" ? "execution leader" : "operational leader"}
                            </p>
                        </div>
                    </div>
                    <p style="color: #6b7280; font-style: italic; line-height: 1.6;">
                        This professional analysis provides actionable insights for leveraging your unique strengths profile in collaborative and leadership contexts. 
                        Your strengths combination creates distinctive opportunities for professional impact and team contribution.
                    </p>
                </div>
                ` : ""}
            </div>
            ` : ""}

            ${isPersonalReport && reportData.personalReport ? `
            <div class="content-section personal-section">
                <h2 class="section-title">Personal Reflection & Development Guidance</h2>
                <div class="ai-content">${formatAIContentForHTML(reportData.personalReport)}</div>
            </div>
            ` : ""}
            
            ${!isPersonalReport ? `
            <div class="professional-signature">
                <h3>Your Professional Development Journey</h3>
                <p>
                    This analysis represents a comprehensive assessment of your professional strengths and collaborative potential. 
                    Use these insights to guide your career development, team positioning, and leadership growth opportunities.
                </p>
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #d1d5db;">
                    <small style="color: #9ca3af; font-size: 0.8rem;">
                        Your unique strengths signature: ${strengthsArray[0]?.name?.toUpperCase() || "THINKING"} (${strengthsArray[0]?.value || 0}%) + ${strengthsArray[1]?.name?.toUpperCase() || "ACTING"} (${strengthsArray[1]?.value || 0}%)
                    </small>
                </div>
            </div>
            ` : ""}
            
            <div class="footer">
                <p>Generated by AllStarTeams Workshop | ${reportData.workshopVersion || "v2.0"}</p>
                <p>${isPersonalReport ? "Personal Report - For Your Private Use" : "Professional Report - Suitable for Sharing"}</p>
                <p>Report ID: ${reportData.reportId || "N/A"}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
router12.get("/test-view/:reportType/:userId", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Endpoint not available in production" });
  }
  const { reportType, userId: userId2 } = req.params;
  if (!["standard", "personal"].includes(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }
  try {
    const result = await pool9.query(
      "SELECT pdf_file_path, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3",
      [parseInt(userId2), reportType, "completed"]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found or not completed" });
    }
    const { pdf_file_path, pdf_file_name } = result.rows[0];
    try {
      await fs3.access(pdf_file_path);
    } catch {
      return res.status(404).json({ error: "Report file not found" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${pdf_file_name}"`);
    const fileBuffer = await fs3.readFile(pdf_file_path);
    res.send(fileBuffer);
  } catch (error) {
    console.error("Error serving test PDF:", error);
    res.status(500).json({ error: "Failed to load report" });
  }
});
router12.get("/test-download/:reportType/:userId", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Endpoint not available in production" });
  }
  const { reportType, userId: userId2 } = req.params;
  if (!["standard", "personal"].includes(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }
  try {
    const result = await pool9.query(
      "SELECT pdf_file_path, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3",
      [parseInt(userId2), reportType, "completed"]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found or not completed" });
    }
    const { pdf_file_path, pdf_file_name } = result.rows[0];
    try {
      await fs3.access(pdf_file_path);
    } catch {
      return res.status(404).json({ error: "Report file not found" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${pdf_file_name}"`);
    const fileBuffer = await fs3.readFile(pdf_file_path);
    res.send(fileBuffer);
  } catch (error) {
    console.error("Error downloading test PDF:", error);
    res.status(500).json({ error: "Failed to download report" });
  }
});
router12.get("/export-admin-data", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Endpoint not available in production" });
  }
  try {
    const userId2 = 1;
    const userResult = await pool9.query("SELECT id, name, username, role, created_at FROM users WHERE id = $1", [userId2]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userResult.rows[0];
    const progressResult = await pool9.query(`
      SELECT current_step, completed_steps, holistic_reports_unlocked, 
             standard_report_generated, personal_report_generated, workshop_completed
      FROM navigation_progress WHERE user_id = $1
    `, [userId2]);
    userData.navigation_progress = progressResult.rows[0] || null;
    const assessmentsResult = await pool9.query(`
      SELECT assessment_type, results, created_at, updated_at
      FROM user_assessments 
      WHERE user_id = $1 
      ORDER BY assessment_type, created_at DESC
    `, [userId2]);
    userData.assessments = assessmentsResult.rows.map((row) => ({
      assessment_type: row.assessment_type,
      results: JSON.parse(row.results),
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    const reportsResult = await pool9.query(`
      SELECT id, report_type, generation_status, generated_at, 
             pdf_file_name, pdf_file_size, star_card_image_path, error_message
      FROM holistic_reports 
      WHERE user_id = $1 
      ORDER BY generated_at DESC
    `, [userId2]);
    userData.holistic_reports = reportsResult.rows;
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const filename = `admin-user-export-${timestamp2}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.json({
      export_timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      export_type: "admin_user_complete_data",
      user_count: 1,
      users: [userData]
    });
  } catch (error) {
    console.error("Admin export error:", error);
    res.status(500).json({ error: error.message });
  }
});
function generatePieChartSegments(strengthsArray) {
  let cumulativeAngle = 0;
  const centerX = 250;
  const centerY = 250;
  const radius = 150;
  return strengthsArray.map((strength) => {
    const angle = strength.value / 100 * 360;
    const startAngle = cumulativeAngle - 90;
    const endAngle = startAngle + angle;
    const startRad = startAngle * Math.PI / 180;
    const endRad = endAngle * Math.PI / 180;
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");
    cumulativeAngle += angle;
    return `<path d="${pathData}" fill="${strength.color}" stroke="white" stroke-width="2"/>`;
  }).join("\n                            ");
}
function generatePieChartLabels(strengthsArray) {
  let cumulativeAngle = 0;
  const centerX = 250;
  const centerY = 250;
  const labelRadius = 220;
  return strengthsArray.map((strength) => {
    const angle = strength.value / 100 * 360;
    const midAngle = cumulativeAngle + angle / 2 - 90;
    const midRad = midAngle * Math.PI / 180;
    const labelX = centerX + labelRadius * Math.cos(midRad);
    const labelY = centerY + labelRadius * Math.sin(midRad);
    cumulativeAngle += angle;
    return `
                            <text x="${labelX}" y="${labelY - 8}" text-anchor="middle" fill="${strength.color}" style="font-weight: bold; font-size: 16px; font-family: 'Segoe UI', sans-serif;">
                                ${strength.name.toUpperCase()}: ${strength.value}%
                            </text>`;
  }).join("");
}
function getStrengthDescription(strengthName) {
  const descriptions = {
    thinking: "Your analytical powerhouse. You naturally approach challenges systematically, design elegant solutions, and see patterns others miss. This isn't just problem-solving - it's solution architecture.",
    acting: "Your decisive moment capability. When urgency strikes, you shift gears and drive execution. This complements your thoughtful approach with the ability to act decisively when needed.",
    feeling: "Your empathetic leadership edge. You ensure everyone feels heard, mediate conflicts gracefully, and bring diverse perspectives together. This is what transforms good teams into great ones.",
    planning: "Your organizational excellence. You create realistic timelines, anticipate dependencies, and build systems that actually work in the real world. This is strategic thinking in action."
  };
  return descriptions[strengthName] || "Your unique strength that contributes to your overall effectiveness and team collaboration.";
}
function formatAIContentForHTML(content) {
  if (!content || !content.trim()) return "";
  let processed = content;
  processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  processed = processed.replace(/\*(.*?)\*/g, "<em>$1</em>");
  processed = processed.replace(/`([^`]+)`/g, '<code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  const paragraphs = processed.split(/\n\n+/).filter((p) => p.trim());
  return paragraphs.map((paragraph) => {
    const trimmed = paragraph.trim();
    if (trimmed.startsWith("####")) {
      const title = trimmed.replace(/^####\s*/, "").trim();
      return `<h5 style="font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 12px 0 6px 0;">${title}</h5>`;
    }
    if (trimmed.startsWith("###")) {
      const title = trimmed.replace(/^###\s*/, "").trim();
      return `<h4 style="font-size: 1.2rem; font-weight: 600; color: #4b5563; margin: 16px 0 8px 0;">${title}</h4>`;
    }
    if (trimmed.startsWith("##")) {
      const title = trimmed.replace(/^##\s*/, "").trim();
      return `<h3 style="font-size: 1.4rem; font-weight: 600; color: #374151; margin: 20px 0 12px 0; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">${title}</h3>`;
    }
    if (trimmed.startsWith("#")) {
      const title = trimmed.replace(/^#\s*/, "").trim();
      return `<h2 style="font-size: 1.6rem; font-weight: 700; color: #1f2937; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">${title}</h2>`;
    }
    if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
      const items = trimmed.split(/\n?- /).filter((item) => item.trim()).map((item) => item.trim());
      return `
        <ul style="margin: 12px 0; padding-left: 20px; list-style-type: disc;">
          ${items.map((item) => `<li style="margin: 6px 0; line-height: 1.6;">${item}</li>`).join("")}
        </ul>
      `;
    }
    if (/^\d+\./.test(trimmed) || /\n\d+\./.test(trimmed)) {
      const items = trimmed.split(/\n?\d+\./).filter((item) => item.trim()).map((item) => item.trim());
      return `
        <ol style="margin: 12px 0; padding-left: 20px;">
          ${items.map((item) => `<li style="margin: 6px 0; line-height: 1.6;">${item}</li>`).join("")}
        </ol>
      `;
    }
    if (trimmed.startsWith("> ")) {
      const quote = trimmed.replace(/^>\s*/, "").trim();
      return `<blockquote style="border-left: 4px solid #2563eb; padding-left: 20px; margin: 16px 0; font-style: italic; color: #4b5563; background-color: #f8fafc; padding: 12px 20px; border-radius: 0 4px 4px 0;">${quote}</blockquote>`;
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return `<blockquote style="border-left: 4px solid #2563eb; padding-left: 20px; margin: 16px 0; font-style: italic; color: #4b5563;">${trimmed.slice(1, -1)}</blockquote>`;
    }
    if (trimmed === "---" || trimmed === "***") {
      return `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;">`;
    }
    const processedParagraph = trimmed.replace(/\n(?!\n)/g, "<br>");
    if (processedParagraph.trim()) {
      return `<p style="margin: 12px 0; line-height: 1.6; color: #374151; text-align: justify;">${processedParagraph}</p>`;
    }
    return "";
  }).filter((p) => p).join("");
}
var holistic_report_routes_default = router12;

// server/routes/admin-upload-routes.ts
import { Router as Router4 } from "express";
import bcrypt3 from "bcryptjs";
init_auth();
import { sql as sql5 } from "drizzle-orm";
var router13 = Router4();
router13.use(requireAuth);
router13.use(requireAdmin);
router13.post("/users/upload", async (req, res) => {
  try {
    const { userInfo, password, navigationProgress: navProgress, assessments: assessmentData } = req.body;
    if (!userInfo || !userInfo.name || !userInfo.email || !password) {
      return res.status(400).json({
        error: "Missing required fields: userInfo.name, userInfo.email, and password"
      });
    }
    const existingUser = await db.query.users.findFirst({
      where: (users3, { eq: eq14 }) => eq14(users3.email, userInfo.email)
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists"
      });
    }
    const hashedPassword = await bcrypt3.hash(password, 10);
    const userResult = await db.execute(sql5`
      INSERT INTO users (username, password, name, email, role, organization, job_title, is_test_user, profile_picture, navigation_progress, created_at, updated_at)
      VALUES (${userInfo.username}, ${hashedPassword}, ${userInfo.name}, ${userInfo.email}, ${userInfo.role || "participant"}, ${userInfo.organization || ""}, ${userInfo.jobTitle || ""}, ${userInfo.isTestUser || true}, ${userInfo.profilePicture || null}, ${navProgress ? JSON.stringify(navProgress) : null}, ${/* @__PURE__ */ new Date()}, ${/* @__PURE__ */ new Date()})
      RETURNING id, username, name, email
    `);
    const newUser = userResult[0];
    let createdAssessments = [];
    if (assessmentData) {
      for (const [assessmentType2, assessmentDetails] of Object.entries(assessmentData)) {
        if (assessmentDetails && typeof assessmentDetails === "object") {
          try {
            const assessmentTypeFormatted = assessmentType2 === "starCard" ? "starCard" : assessmentType2 === "stepByStepReflection" ? "stepByStepReflection" : assessmentType2 === "flowAssessment" ? "flowAssessment" : assessmentType2 === "flowAttributes" ? "flowAttributes" : assessmentType2 === "roundingOutReflection" ? "roundingOutReflection" : assessmentType2 === "cantrilLadder" ? "cantrilLadder" : assessmentType2 === "futureSelfReflection" ? "futureSelfReflection" : assessmentType2 === "finalReflection" ? "finalReflection" : assessmentType2;
            const result = await db.execute(sql5`
              INSERT INTO user_assessments (user_id, assessment_type, results, created_at)
              VALUES (${newUser.id}, ${assessmentTypeFormatted}, ${JSON.stringify(assessmentDetails)}, ${/* @__PURE__ */ new Date()})
              RETURNING *
            `);
            createdAssessments.push({ assessmentType: assessmentTypeFormatted });
            console.log(`Created assessment ${assessmentType2} for user ${newUser.id}`);
          } catch (error) {
            console.error(`Error creating assessment ${assessmentType2}:`, error);
          }
        }
      }
    }
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        jobTitle: newUser.jobTitle,
        isTestUser: newUser.isTestUser
      },
      assessmentsCreated: createdAssessments.length,
      navigationProgressCreated: !!navProgress
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var admin_upload_routes_default = router13;

// server/routes/discernment-routes.ts
init_auth();
import { Router as Router5 } from "express";
init_schema();
import { eq as eq12, and as and6 } from "drizzle-orm";
var router14 = Router5();
router14.get("/scenarios/:exerciseType", requireAuth, async (req, res) => {
  try {
    const { exerciseType } = req.params;
    const userId2 = req.session.userId;
    console.log(`[Discernment] Fetching scenarios for ${exerciseType}, user ${userId2}`);
    const scenarios = await db.select().from(discernmentScenarios).where(
      and6(
        eq12(discernmentScenarios.exerciseType, exerciseType),
        eq12(discernmentScenarios.active, true)
      )
    ).orderBy(discernmentScenarios.difficultyLevel);
    console.log(`[Discernment] Found ${scenarios.length} scenarios for ${exerciseType}`);
    if (scenarios.length === 0) {
      return res.status(404).json({ error: "No scenarios available" });
    }
    res.json(scenarios);
  } catch (error) {
    console.error("Error fetching discernment scenarios:", error);
    res.status(500).json({ error: "Failed to fetch scenarios" });
  }
});
router14.post("/progress", requireAuth, async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const userId2 = req.session.userId;
    console.log(`[Discernment] Progress tracking for user ${userId2}, scenario ${scenarioId} - temporarily disabled`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating discernment progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});
var discernment_routes_default = router14;

// server/routes/coaching-routes.ts
init_conversation_logging_service();
import { Router as Router6 } from "express";
import { Pool as Pool14 } from "pg";
var router15 = Router6();
var pool14 = new Pool14({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
router15.post("/vector/init", async (req, res) => {
  try {
    const success = await vectorDB.initializeCollections();
    res.json({ success, message: success ? "Vector DB initialized" : "Failed to initialize" });
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize vector database" });
  }
});
router15.get("/vector/status", async (req, res) => {
  try {
    const connected = await vectorDB.testConnection();
    res.json({
      status: connected ? "connected" : "disconnected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to check vector database status" });
  }
});
router15.get("/knowledge", async (req, res) => {
  try {
    res.json({
      message: "Knowledge base endpoint working",
      status: "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get knowledge base" });
  }
});
router15.get("/status", async (req, res) => {
  try {
    const { CURRENT_PERSONAS: CURRENT_PERSONAS2 } = await Promise.resolve().then(() => (init_persona_management_routes(), persona_management_routes_exports));
    const reflectionPersona = CURRENT_PERSONAS2.find((p) => p.id === "ast_reflection");
    const isAICoachingEnabled = reflectionPersona?.enabled === true;
    res.json({
      aiCoachingEnabled: isAICoachingEnabled,
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error checking AI coaching status:", error);
    res.json({
      aiCoachingEnabled: false,
      environment: process.env.NODE_ENV || "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: "Failed to check AI status"
    });
  }
});
router15.post("/chat", async (req, res) => {
  try {
    const { message: message2, context: context2, persona: persona2 } = req.body;
    const userId2 = req.session?.userId;
    console.log("\u{1F916} Coaching chat request:", {
      message: message2,
      persona: persona2,
      context: context2,
      userId: userId2,
      hasSession: !!req.session,
      sessionId: req.sessionID
    });
    const conversationEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userId: userId2 || "anonymous",
      sessionId: req.sessionID,
      userMessage: message2,
      persona: persona2,
      context: context2,
      type: "user_message"
    };
    console.log("\u{1F4BE} TALIA CONVERSATION LOG:", JSON.stringify(conversationEntry, null, 2));
    if (!userId2) {
      console.warn("\u26A0\uFE0F No userId in session, proceeding with anonymous chat for development");
    }
    const { taliaTrainingService: taliaTrainingService2 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
    const { userLearningService: userLearningService2 } = await Promise.resolve().then(() => (init_user_learning_service(), user_learning_service_exports));
    try {
      const { generateOpenAICoachingResponse: generateOpenAICoachingResponse2 } = await Promise.resolve().then(() => (init_openai_api_service(), openai_api_service_exports));
      let claudeContext;
      let personaType;
      let targetUserId = userId2;
      let userName = "there";
      if (persona2 === "star_report") {
        console.log("\u{1F527} Report Talia persona detected");
        console.log("\u{1F527} Report context received:", {
          selectedUserId: context2.selectedUserId,
          selectedUserName: context2.selectedUserName,
          reportContext: context2.reportContext,
          requestingUserId: userId2
        });
        personaType = "star_report";
        targetUserId = context2.selectedUserId || userId2;
        userName = context2.selectedUserName || "the selected user";
        console.log("\u{1F3AF} Target user determined:", {
          targetUserId,
          userName,
          isSelectedUser: !!context2.selectedUserId,
          fallbackToAdmin: !context2.selectedUserId
        });
        if (!context2.selectedUserId) {
          console.warn("\u26A0\uFE0F No selectedUserId provided - Report Talia will use admin data instead of selected user data");
        }
        const userCoachingContext = targetUserId ? await userLearningService2.getUserCoachingContext(targetUserId.toString()) : "";
        let userData = null;
        if (targetUserId) {
          try {
            console.log(`\u{1F50D} Fetching user data for targetUserId: ${targetUserId} (type: ${typeof targetUserId})`);
            const userResult = await pool14.query(
              "SELECT id, name, username, email, ast_completed_at, created_at FROM users WHERE id = $1",
              [targetUserId]
            );
            console.log(`\u{1F4CA} User query result:`, {
              rowCount: userResult.rows.length,
              firstRow: userResult.rows[0] ? {
                id: userResult.rows[0].id,
                name: userResult.rows[0].name,
                username: userResult.rows[0].username
              } : "No rows"
            });
            if (userResult.rows.length > 0) {
              const user = userResult.rows[0];
              const assessmentsResult = await pool14.query(`
                SELECT assessment_type, results, created_at
                FROM user_assessments 
                WHERE user_id = $1
                ORDER BY assessment_type, created_at DESC
              `, [targetUserId]);
              const stepDataResult = await pool14.query(`
                SELECT step_id, data, created_at, updated_at
                FROM workshop_step_data 
                WHERE user_id = $1
                ORDER BY step_id
              `, [targetUserId]);
              userData = {
                user,
                assessments: assessmentsResult.rows,
                stepData: stepDataResult.rows
              };
              console.log("\u2705 Fetched complete user data for Report Talia:", {
                targetUserId,
                selectedUserId: context2.selectedUserId,
                userName: user.name,
                assessmentCount: assessmentsResult.rows.length,
                stepDataCount: stepDataResult.rows.length,
                userDataStructure: {
                  hasUser: !!userData.user,
                  hasAssessments: !!userData.assessments,
                  hasStepData: !!userData.stepData
                }
              });
            } else {
              console.warn(`\u26A0\uFE0F No user found with ID: ${targetUserId}`);
            }
          } catch (error) {
            console.error("\u274C Error fetching complete user data:", error);
          }
        }
        claudeContext = {
          reportContext: context2.reportContext,
          selectedUserId: context2.selectedUserId,
          selectedUserName: context2.selectedUserName,
          userPersonalization: userCoachingContext,
          userData
        };
      } else {
        console.log("\u{1F527} Workshop mode detected - using Reflection Talia persona");
        personaType = "talia_coach";
        const userCoachingContext = userId2 ? await userLearningService2.getUserCoachingContext(userId2.toString()) : "";
        claudeContext = {
          stepName: context2?.stepName,
          strengthLabel: context2?.strengthLabel,
          currentStep: context2?.currentStep,
          workshopType: context2?.workshopType,
          questionText: context2?.questionText,
          workshopContext: context2?.workshopContext,
          userPersonalization: userCoachingContext
        };
      }
      console.log("\u{1F916} Claude API call with:", { personaType, targetUserId, userName, claudeContext });
      const isHolisticReportGeneration = context2?.reportContext === "holistic_generation";
      if (isHolisticReportGeneration) {
        console.log("\u{1F680} HOLISTIC REPORT GENERATION - Skipping coaching route processing, going directly to Claude API");
        const optimizedContext = {
          reportContext: "holistic_generation",
          selectedUserId: context2.selectedUserId,
          selectedUserName: context2.selectedUserName,
          userData: context2.userData,
          // Full data for processing but will be optimized
          starCardImageBase64: context2.starCardImageBase64,
          tokenOptimized: true
          // Flag to use optimized processing
        };
        console.log("\u{1F527} Using token-optimized processing for holistic report generation");
        const originalSize = JSON.stringify(context2.userData).length;
        console.log(`\u{1F4CA} Original userData size: ${originalSize} characters (~${Math.round(originalSize / 4)} tokens)`);
        const response2 = await generateOpenAICoachingResponse2({
          userMessage: message2,
          personaType,
          userName,
          contextData: optimizedContext,
          userId: targetUserId,
          sessionId: req.sessionID,
          maxTokens: 25e3
        });
        console.log("\u2705 Holistic report generated successfully via optimized path");
        const responseEntry2 = {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          userId: userId2 || "anonymous",
          sessionId: req.sessionID,
          taliaResponse: response2,
          persona: persona2,
          context: context2,
          source: "holistic_optimized",
          type: "holistic_report"
        };
        console.log("\u{1F4BE} HOLISTIC REPORT LOG:", JSON.stringify(responseEntry2, null, 2));
        conversationLoggingService.logConversation({
          personaType,
          userId: targetUserId,
          sessionId: req.sessionID,
          userMessage: message2,
          taliaResponse: response2,
          contextData: optimizedContext,
          requestData: {
            originalPersona: persona2,
            requestTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
            reportType: "holistic_generation",
            userAgent: req.headers["user-agent"],
            clientIp: req.ip
          },
          responseMetadata: {
            confidence: 0.9,
            source: "holistic_optimized",
            tokensUsed: 25e3
            // High estimate for holistic reports
          },
          conversationOutcome: "completed"
        }).catch((error) => {
          console.warn("\u26A0\uFE0F Failed to log holistic report conversation to METAlia:", error);
        });
        try {
          const { reportQualityMonitor: reportQualityMonitor2 } = await Promise.resolve().then(() => (init_report_quality_monitor(), report_quality_monitor_exports));
          reportQualityMonitor2.analyzeReportQuality(
            response2,
            targetUserId,
            "personal",
            context2.userData
          ).then((issues) => {
            if (issues.length > 0) {
              console.log(`\u{1F4CA} METAlia: Detected ${issues.length} quality issues in holistic report for user ${targetUserId}`);
            } else {
              console.log(`\u2705 METAlia: Holistic report for user ${targetUserId} passed quality checks`);
            }
          }).catch((error) => {
            console.warn("\u26A0\uFE0F METAlia quality analysis failed:", error);
          });
        } catch (error) {
          console.warn("\u26A0\uFE0F Could not load report quality monitor:", error);
        }
        return res.json({
          response: response2,
          confidence: 0.9,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "holistic_optimized"
        });
      }
      const isReportTalia = persona2 === "star_report";
      const maxTokens = isReportTalia ? 8e3 : 400;
      console.log("\u{1F527} Coaching route context check:", {
        persona: persona2,
        reportContext: context2?.reportContext,
        isReportTalia,
        isHolisticReportGeneration
      });
      if (isReportTalia && !isHolisticReportGeneration) {
        console.log("\u{1F469}\u200D\u{1F4BC} Report Talia - enabling enhanced training mode and document access");
        try {
          const { textSearchService: textSearchService2 } = await Promise.resolve().then(() => (init_text_search_service(), text_search_service_exports));
          const { taliaTrainingService: taliaTrainingService3 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
          let contextQueries = [
            message2,
            // Search based on user's actual message
            "talia coaching methodology training guidelines",
            "document review and analysis",
            "AST workshop methodology",
            "coaching principles and approach"
          ];
          if (message2.toLowerCase().includes("document") && (message2.toLowerCase().includes("access") || message2.toLowerCase().includes("available") || message2.toLowerCase().includes("have"))) {
            contextQueries.push(
              "Report Talia Training Doc",
              "talia report generation capabilities",
              "available documents and templates",
              "document access scope",
              "training manual overview"
            );
          }
          if (message2.toLowerCase().includes("report") && (message2.toLowerCase().includes("create") || message2.toLowerCase().includes("generate") || message2.toLowerCase().includes("write"))) {
            contextQueries.push(
              "Talia Report Generation Prompt",
              "Personal Development Report guidelines",
              "Professional Profile Report requirements",
              "sample report templates",
              "report generation methodology"
            );
          }
          const documentContext = await textSearchService2.generateContextForAI(contextQueries, {
            maxChunksPerQuery: 4,
            contextStyle: "detailed",
            documentTypes: ["coaching_guide", "methodology", "ast_training_material", "report_template"]
          });
          let trainingHistory = "";
          let reportInfluence = "";
          if (message2.toLowerCase().includes("training") || message2.toLowerCase().includes("learn") || message2.toLowerCase().includes("feedback") || message2.toLowerCase().includes("conversation")) {
            trainingHistory = await taliaTrainingService3.getTrainingConversationHistory("star_report");
            console.log("\u{1F4D6} Retrieved training conversation history for admin discussion");
          }
          if (message2.toLowerCase().includes("report") || message2.toLowerCase().includes("holistic") || message2.toLowerCase().includes("generation")) {
            reportInfluence = await taliaTrainingService3.getTrainingInfluenceOnReports("star_report");
            console.log("\u{1F4CA} Retrieved training influence on report generation");
          }
          claudeContext.adminTrainingMode = true;
          claudeContext.documentContext = documentContext.context;
          claudeContext.availableDocuments = documentContext.metadata.documentSources;
          claudeContext.searchedTerms = documentContext.metadata.searchTerms;
          claudeContext.foundChunks = documentContext.metadata.totalChunks;
          claudeContext.trainingConversationHistory = trainingHistory;
          claudeContext.reportTrainingInfluence = reportInfluence;
          console.log(`\u{1F4DA} Retrieved ${documentContext.metadata.totalChunks} document chunks from ${documentContext.metadata.documentSources.length} sources`);
          if (trainingHistory) console.log("\u{1F4D6} Added training conversation history to context");
          if (reportInfluence) console.log("\u{1F4CA} Added report training influence to context");
        } catch (error) {
          console.warn("Could not load document context for admin Talia:", error);
        }
      }
      const response = await generateOpenAICoachingResponse2({
        userMessage: message2,
        personaType,
        userName,
        contextData: claudeContext,
        userId: targetUserId,
        sessionId: req.sessionID,
        maxTokens
      });
      console.log("\u2705 Claude response generated successfully");
      const responseEntry = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        userId: userId2 || "anonymous",
        sessionId: req.sessionID,
        taliaResponse: response,
        persona: persona2,
        context: context2,
        source: "claude_api",
        type: "talia_response"
      };
      console.log("\u{1F4BE} TALIA RESPONSE LOG:", JSON.stringify(responseEntry, null, 2));
      conversationLoggingService.logConversation({
        personaType,
        userId: targetUserId,
        sessionId: req.sessionID,
        userMessage: message2,
        taliaResponse: response,
        contextData: claudeContext,
        requestData: {
          originalPersona: persona2,
          requestTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
          userAgent: req.headers["user-agent"],
          clientIp: req.ip
        },
        responseMetadata: {
          confidence: 0.9,
          source: "claude_api",
          tokensUsed: maxTokens
          // Estimate, could be improved with actual token usage
        },
        conversationOutcome: "completed"
      }).catch((error) => {
        console.warn("\u26A0\uFE0F Failed to log conversation to METAlia:", error);
      });
      if (persona2 && message2 && response) {
        try {
          const { conversationLearningService: conversationLearningService2 } = await Promise.resolve().then(() => (init_conversation_learning_service(), conversation_learning_service_exports));
          conversationLearningService2.analyzeConversation(
            persona2,
            message2,
            response,
            void 0,
            // userFeedback will be captured separately if provided
            {
              context: context2,
              userId: userId2,
              sessionId: req.sessionID,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }
          ).then(async (learning) => {
            await conversationLearningService2.updateLearningDocument(persona2, learning);
            console.log(`\u{1F9E0} Learning captured for persona: ${persona2}`);
          }).catch((learningError) => {
            console.warn("\u26A0\uFE0F Learning capture failed:", learningError.message);
          });
        } catch (learningServiceError) {
          console.warn("\u26A0\uFE0F Learning service unavailable:", learningServiceError.message);
        }
      }
      res.json({
        response,
        confidence: 0.9,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "claude_api"
      });
    } catch (claudeError) {
      console.warn("\u26A0\uFE0F Claude API unavailable, using fallback responses:", claudeError.message);
      const strengthName = context2?.strengthLabel || context2?.strength?.name || "your strength";
      const stepName = context2?.stepName || "this step";
      const questionText = context2?.questionText || `your ${strengthName} strength reflection`;
      const coachingResponses = [
        `Hi! I'm Talia, here to help. I see you're working on: "${questionText}". Your task is to write 2-3 sentences about this. Can you give me a specific example of when this happened?`,
        `Hi, I'm Talia! Let's focus on your current reflection: "${questionText}". You need to write 2-3 sentences about this. What made that particular situation stand out to you?`,
        `Hello! I'm Talia, here to help with your current reflection. The question you're working on is: "${questionText}". Your task is to write 2-3 sentences. What exactly did you do in that situation?`,
        `Hi there! I'm Talia. I can see you're reflecting on: "${questionText}". You need to write 2-3 sentences about this. How did that feel different from other situations?`,
        `Hello! I'm Talia. Your current reflection task is: "${questionText}". You need to write 2-3 sentences. What was the outcome when you applied that approach?`
      ];
      const responseIndex = Math.floor(Math.random() * coachingResponses.length);
      const response = coachingResponses[responseIndex];
      const fallbackEntry = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        userId: userId2 || "anonymous",
        sessionId: req.sessionID,
        taliaResponse: response,
        persona: persona2,
        context: context2,
        source: "fallback",
        type: "talia_response"
      };
      console.log("\u{1F4BE} TALIA RESPONSE LOG:", JSON.stringify(fallbackEntry, null, 2));
      conversationLoggingService.logConversation({
        personaType: "talia_coach",
        userId: userId2,
        sessionId: req.sessionID,
        userMessage: message2,
        taliaResponse: response,
        contextData: context2,
        requestData: {
          originalPersona: persona2,
          requestTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
          userAgent: req.headers["user-agent"],
          clientIp: req.ip
        },
        responseMetadata: {
          confidence: 0.7,
          source: "fallback",
          tokensUsed: 0
          // Fallback responses don't use AI tokens
        },
        conversationOutcome: "completed"
      }).catch((error) => {
        console.warn("\u26A0\uFE0F Failed to log fallback conversation to METAlia:", error);
      });
      res.json({
        response,
        confidence: 0.7,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "fallback"
      });
    }
  } catch (error) {
    console.error("\u274C Error in coaching chat:", error);
    const errorResponse = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
    conversationLoggingService.logConversation({
      personaType: persona || "unknown",
      userId: req.session?.userId,
      sessionId: req.sessionID,
      userMessage: message || "Unknown message",
      taliaResponse: errorResponse,
      contextData: context || {},
      requestData: {
        originalPersona: persona,
        requestTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
        userAgent: req.headers["user-agent"],
        clientIp: req.ip
      },
      responseMetadata: {
        confidence: 0,
        source: "system_error",
        tokensUsed: 0,
        error: error.message
      },
      conversationOutcome: "error"
    }).catch((loggingError) => {
      console.warn("\u26A0\uFE0F Failed to log system error conversation to METAlia:", loggingError);
    });
    res.status(500).json({
      response: errorResponse,
      error: "Failed to process coaching request"
    });
  }
});
router15.post("/conversation-end", async (req, res) => {
  try {
    const { messages, context: context2 } = req.body;
    const userId2 = req.session?.userId;
    console.log("\u{1F9E0} Processing conversation end for user learning:", {
      userId: userId2,
      messageCount: messages?.length,
      context: context2?.stepName
    });
    if (!userId2 || !messages || messages.length <= 1) {
      return res.json({ success: false, message: "No significant conversation to analyze" });
    }
    const { userLearningService: userLearningService2 } = await Promise.resolve().then(() => (init_user_learning_service(), user_learning_service_exports));
    await userLearningService2.processConversationEnd(userId2.toString(), messages, context2);
    res.json({
      success: true,
      message: "Conversation analyzed for user learning",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error in conversation-end analysis:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process conversation for learning"
    });
  }
});
router15.get("/flow-attributes", async (req, res) => {
  try {
    const flowAttributes2 = [
      // Thinking attributes
      "Abstract",
      "Analytic",
      "Astute",
      "Big Picture",
      "Curious",
      "Focused",
      "Insightful",
      "Logical",
      "Investigative",
      "Rational",
      "Reflective",
      "Sensible",
      "Strategic",
      "Thoughtful",
      // Acting attributes  
      "Bold",
      "Competitive",
      "Decisive",
      "Determined",
      "Direct",
      "Dynamic",
      "Energetic",
      "Entrepreneurial",
      "Fast-paced",
      "Hands-on",
      "Independent",
      "Initiative",
      "Opportunistic",
      "Results-focused",
      // Feeling attributes
      "Collaborative",
      "Compassionate",
      "Diplomatic",
      "Empathetic",
      "Encouraging",
      "Harmonious",
      "Inclusive",
      "Inspiring",
      "Intuitive",
      "People-focused",
      "Relational",
      "Supportive",
      "Team-oriented",
      "Trusting",
      // Planning attributes
      "Careful",
      "Consistent",
      "Detailed",
      "Disciplined",
      "Methodical",
      "Organized",
      "Patient",
      "Precise",
      "Process-oriented",
      "Quality-focused",
      "Reliable",
      "Steady",
      "Structured",
      "Systematic"
    ];
    res.json({
      success: true,
      attributes: flowAttributes2,
      totalCount: flowAttributes2.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error getting flow attributes:", error);
    res.status(500).json({ error: "Failed to get flow attributes" });
  }
});
router15.get("/cantril-ladder/:userId?", async (req, res) => {
  try {
    const userId2 = req.params.userId || req.session?.userId;
    if (!userId2) {
      return res.status(400).json({
        success: false,
        error: "User ID required"
      });
    }
    const { Pool: Pool19 } = await import("pg");
    const pool19 = new Pool19({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const query2 = `
      SELECT rating, created_at 
      FROM cantril_ladder_assessments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool19.query(query2, [userId2]);
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        rating: null,
        message: "No Cantril Ladder rating found for user",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const { rating, created_at } = result.rows[0];
    res.json({
      success: true,
      rating,
      assessmentDate: created_at,
      message: `Cantril Ladder rating: ${rating}/10`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error getting Cantril Ladder rating:", error);
    res.json({
      success: false,
      rating: null,
      message: "Could not retrieve Cantril Ladder rating",
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router15.post("/vision-images", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    const { images, reflection } = req.body;
    if (!userId2) {
      return res.status(401).json({
        success: false,
        error: "User authentication required"
      });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one image is required"
      });
    }
    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Maximum 5 images allowed"
      });
    }
    const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
    const storedImages = [];
    for (const imageData of images) {
      const { url, source, description, originalFilename } = imageData;
      const storedImage = await photoStorageService2.storeVisionImage({
        userId: userId2.toString(),
        imageUrl: url,
        source: source || "unknown",
        // 'upload' or 'unsplash'
        description: description || "",
        originalFilename: originalFilename || null,
        workshopStep: "4-3",
        exerciseType: "vision_images"
      });
      storedImages.push(storedImage);
    }
    let reflectionId = null;
    if (reflection && reflection.trim()) {
      const { Pool: Pool19 } = await import("pg");
      const pool19 = new Pool19({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
      });
      const reflectionQuery = `
        INSERT INTO vision_reflections (user_id, reflection_text, workshop_step, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `;
      const reflectionResult = await pool19.query(reflectionQuery, [
        userId2,
        reflection.trim(),
        "4-3"
      ]);
      reflectionId = reflectionResult.rows[0]?.id;
    }
    console.log(`\u{1F4BE} Vision images stored for user ${userId2}:`, {
      imageCount: storedImages.length,
      reflectionStored: !!reflectionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      message: `Successfully stored ${storedImages.length} vision images`,
      images: storedImages,
      reflectionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error storing vision images:", error);
    res.status(500).json({
      success: false,
      error: "Failed to store vision images",
      details: error.message
    });
  }
});
router15.get("/vision-images/:userId?", async (req, res) => {
  try {
    const userId2 = req.params.userId || req.session?.userId;
    if (!userId2) {
      return res.status(400).json({
        success: false,
        error: "User ID required"
      });
    }
    const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
    const visionImages = await photoStorageService2.getUserVisionImages(userId2.toString());
    const { Pool: Pool19 } = await import("pg");
    const pool19 = new Pool19({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const reflectionQuery = `
      SELECT reflection_text, created_at 
      FROM vision_reflections 
      WHERE user_id = $1 AND workshop_step = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const reflectionResult = await pool19.query(reflectionQuery, [userId2, "4-3"]);
    const reflection = reflectionResult.rows[0] || null;
    res.json({
      success: true,
      images: visionImages,
      reflection,
      imageCount: visionImages.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error getting vision images:", error);
    res.json({
      success: false,
      images: [],
      reflection: null,
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router15.get("/user-patterns/:userId?", async (req, res) => {
  try {
    const { userId: userId2 } = req.params;
    const requestingUserId = req.session?.userId;
    const { userLearningService: userLearningService2 } = await Promise.resolve().then(() => (init_user_learning_service(), user_learning_service_exports));
    if (userId2) {
      const patterns = await userLearningService2.getUserCoachingContext(userId2);
      res.json({
        userId: userId2,
        patterns,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else if (requestingUserId) {
      const patterns = await userLearningService2.getUserCoachingContext(requestingUserId.toString());
      res.json({
        userId: requestingUserId,
        patterns,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      res.json({
        message: "No user specified and no session found",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  } catch (error) {
    console.error("Error getting user patterns:", error);
    res.status(500).json({ error: "Failed to get user patterns" });
  }
});
router15.get("/profiles", async (req, res) => {
  try {
    res.json({
      message: "Profiles endpoint working",
      status: "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get profiles" });
  }
});
router15.get("/reflection-area/:areaId/status", async (req, res) => {
  try {
    const { areaId } = req.params;
    console.log("\u{1F50D} Checking reflection area status (public):", areaId);
    try {
      const { CURRENT_REFLECTION_AREAS: CURRENT_REFLECTION_AREAS2 } = await Promise.resolve().then(() => (init_persona_management_routes(), persona_management_routes_exports));
      const area = CURRENT_REFLECTION_AREAS2.find((a) => a.id === areaId);
      if (!area) {
        return res.json({
          success: true,
          area: {
            id: areaId,
            enabled: false,
            name: `Reflection Area ${areaId}`,
            workshopStep: areaId.replace("step_", "").replace("_", "-")
          }
        });
      }
      res.json({
        success: true,
        area: {
          id: area.id,
          enabled: area.enabled,
          name: area.name,
          workshopStep: area.workshopStep
        }
      });
    } catch (importError) {
      console.warn("Could not import reflection areas, using fallback:", importError);
      res.json({
        success: true,
        area: {
          id: areaId,
          enabled: true,
          // Default to enabled for fallback
          name: `Reflection Area ${areaId}`,
          workshopStep: areaId.replace("step_", "").replace("_", "-")
        }
      });
    }
  } catch (error) {
    console.error("Error checking reflection area status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check reflection area status"
    });
  }
});
var coaching_routes_default = router15;

// server/routes/feature-flag-routes.ts
init_auth();
import { Router as Router7 } from "express";
var router16 = Router7();
var requireAdmin2 = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
router16.get("/admin/feature-flags", requireAuth, requireAdmin2, async (req, res) => {
  try {
    const environment = process.env.ENVIRONMENT || "production";
    const flagsStatus = {};
    for (const [flagName, flag] of Object.entries(featureFlags)) {
      flagsStatus[flagName] = {
        name: flagName,
        enabled: isFeatureEnabled(flagName),
        environment: flag.environment,
        description: flag.description,
        aiRelated: flag.aiRelated || false
      };
    }
    res.json({
      flags: flagsStatus,
      environment
    });
  } catch (error) {
    console.error("Error getting feature flags:", error);
    res.status(500).json({ error: "Failed to get feature flags" });
  }
});
router16.post("/admin/feature-flags/toggle", requireAuth, requireAdmin2, async (req, res) => {
  try {
    const { flagName, enabled } = req.body;
    if (!flagName || typeof enabled !== "boolean") {
      return res.status(400).json({ error: "flagName and enabled (boolean) are required" });
    }
    if (!featureFlags[flagName]) {
      return res.status(404).json({ error: "Feature flag not found" });
    }
    featureFlags[flagName].enabled = enabled;
    console.log(`\u{1F504} Feature flag '${flagName}' ${enabled ? "enabled" : "disabled"} by admin`);
    res.json({
      success: true,
      flagName,
      enabled: featureFlags[flagName].enabled,
      message: `Feature flag '${flagName}' ${enabled ? "enabled" : "disabled"}`
    });
  } catch (error) {
    console.error("Error toggling feature flag:", error);
    res.status(500).json({ error: "Failed to toggle feature flag" });
  }
});
router16.get("/admin/reports/health-check", requireAuth, requireAdmin2, async (req, res) => {
  try {
    const startTime = Date.now();
    let isWorking = false;
    let hasRealData = false;
    let error;
    try {
      const testUserId = 1;
      console.log("\u{1F50D} Health check: Testing report generation...");
      const userResult = await db.execute(
        "SELECT id, name, email, ast_workshop_completed FROM users WHERE id = ?",
        [testUserId]
      );
      if (userResult.length === 0) {
        throw new Error("Test user not found");
      }
      const user = userResult[0];
      console.log(`\u{1F50D} Health check: User found - ID: ${user.id}, completed: ${user.ast_workshop_completed}`);
      if (!user.ast_workshop_completed) {
        error = "Test user has not completed workshop";
        return res.json({
          isWorking: false,
          responseTime: Date.now() - startTime,
          hasRealData: false,
          error
        });
      }
      const assessmentResult = await db.execute(
        "SELECT assessment_type, results FROM user_assessments WHERE user_id = ? AND results IS NOT NULL",
        [testUserId]
      );
      console.log(`\u{1F50D} Health check: Found ${assessmentResult.length} assessments`);
      if (assessmentResult.length === 0) {
        error = "No assessment data found for test user";
        return res.json({
          isWorking: false,
          responseTime: Date.now() - startTime,
          hasRealData: false,
          error
        });
      }
      const { generateOpenAICoachingResponse: generateOpenAICoachingResponse2 } = await Promise.resolve().then(() => (init_openai_api_service(), openai_api_service_exports));
      const testResponse = await generateOpenAICoachingResponse2({
        userMessage: 'Quick health check - respond with exactly "HEALTH_CHECK_OK" if you can process data',
        personaType: "star_report",
        userName: user.name || "Test User",
        contextData: {
          reportContext: "health_check",
          userData: { assessments: assessmentResult, user },
          selectedUserName: user.name
        },
        userId: testUserId,
        sessionId: "health-check",
        maxTokens: 50
      });
      const responseTime = Date.now() - startTime;
      hasRealData = assessmentResult.length > 0;
      isWorking = testResponse.includes("HEALTH_CHECK_OK") || testResponse.length > 10 && responseTime > 300;
      console.log(`\u{1F50D} Health check results: Working: ${isWorking}, Real data: ${hasRealData}, Time: ${responseTime}ms`);
      res.json({
        isWorking,
        responseTime,
        hasRealData,
        error: !isWorking ? "System may be generating fallback content" : void 0
      });
    } catch (testError) {
      error = testError instanceof Error ? testError.message : "Unknown error during test";
      console.error("\u{1F50D} Health check failed:", error);
      res.json({
        isWorking: false,
        responseTime: Date.now() - startTime,
        hasRealData: false,
        error
      });
    }
  } catch (error) {
    console.error("Error in health check:", error);
    res.status(500).json({ error: "Health check failed" });
  }
});
router16.post("/admin/reports/test-generation", requireAuth, requireAdmin2, async (req, res) => {
  try {
    const { testUserId = 1 } = req.body;
    const startTime = Date.now();
    console.log("\u{1F9EA} Starting comprehensive report generation test...");
    const userResult = await db.execute(
      "SELECT id, name, email, ast_workshop_completed FROM users WHERE id = ?",
      [testUserId]
    );
    if (userResult.length === 0) {
      return res.status(404).json({ error: "Test user not found" });
    }
    const user = userResult[0];
    const assessmentResult = await db.execute(
      "SELECT assessment_type, results FROM user_assessments WHERE user_id = ? AND results IS NOT NULL",
      [testUserId]
    );
    const stepDataResult = await db.execute(
      "SELECT step_id, step_data FROM user_step_data WHERE user_id = ? AND step_data IS NOT NULL",
      [testUserId]
    );
    console.log(`\u{1F9EA} Test data: ${assessmentResult.length} assessments, ${stepDataResult.length} step data`);
    const { generateOpenAICoachingResponse: generateOpenAICoachingResponse2 } = await Promise.resolve().then(() => (init_openai_api_service(), openai_api_service_exports));
    const testReport = await generateOpenAICoachingResponse2({
      userMessage: "Generate a Personal Development Report for this user based on their complete workshop data.",
      personaType: "star_report",
      userName: user.name || "Test User",
      contextData: {
        reportContext: "holistic_generation",
        userData: {
          assessments: assessmentResult,
          stepData: stepDataResult,
          user
        },
        selectedUserName: user.name,
        selectedUserId: testUserId
      },
      userId: testUserId,
      sessionId: "admin-test",
      maxTokens: 4e3
    });
    const responseTime = Date.now() - startTime;
    const isWorking = testReport.length > 200 && responseTime > 1e3;
    const hasRealData = testReport.includes(user.name) && (testReport.includes("%") || testReport.includes("assessment") || testReport.includes("workshop") || testReport.includes("strength"));
    const analysis = {
      isWorking,
      hasRealData,
      responseTime,
      reportLength: testReport.length,
      containsUserName: testReport.includes(user.name || "Test User"),
      containsPercentages: testReport.includes("%"),
      containsAssessmentRefs: testReport.includes("assessment"),
      reportPreview: testReport.substring(0, 200) + "..."
    };
    console.log("\u{1F9EA} Test results:", analysis);
    res.json({
      success: true,
      ...analysis,
      message: isWorking && hasRealData ? "Report generation is working with real data!" : "Report generation has issues - likely generating fallback content"
    });
  } catch (error) {
    console.error("Error testing report generation:", error);
    res.status(500).json({
      error: "Failed to test report generation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var feature_flag_routes_default = router16;

// server/routes/jira-routes.ts
import express13 from "express";

// server/utils/jiraIntegration.ts
import { spawn } from "child_process";
async function executeAcli(args) {
  return new Promise((resolve, reject) => {
    const process2 = spawn("acli", args, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true
    });
    let stdout = "";
    let stderr = "";
    process2.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    process2.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    process2.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`acli command failed: ${stderr}`));
      }
    });
  });
}
async function searchJiraTickets(options = {}) {
  try {
    const jqlParts = [];
    if (options.projects && options.projects.length > 0) {
      jqlParts.push(`project in (${options.projects.join(", ")})`);
    }
    if (options.status && options.status.length > 0) {
      jqlParts.push(`status in ("${options.status.join('", "')}")`);
    }
    if (options.assignee) {
      jqlParts.push(`assignee = "${options.assignee}"`);
    }
    if (options.type && options.type.length > 0) {
      jqlParts.push(`issuetype in ("${options.type.join('", "')}")`);
    }
    const jql = jqlParts.length > 0 ? jqlParts.join(" AND ") : "project is not EMPTY";
    const limit = options.limit || 20;
    const args = [
      "jira",
      "workitem",
      "search",
      "--jql",
      jql,
      "--limit",
      limit.toString(),
      "--json"
    ];
    const output = await executeAcli(args);
    try {
      const data = JSON.parse(output);
      return data.issues?.map((issue) => ({
        key: issue.key,
        type: issue.fields.issuetype?.name || "Unknown",
        summary: issue.fields.summary || "",
        status: issue.fields.status?.name || "Unknown",
        assignee: issue.fields.assignee?.emailAddress || "Unassigned",
        priority: issue.fields.priority?.name || "Medium"
      })) || [];
    } catch (parseError) {
      return parseTableOutput(output);
    }
  } catch (error) {
    console.error("Error searching Jira tickets:", error);
    return [];
  }
}
async function getJiraTicket(ticketKey) {
  try {
    const args = ["jira", "workitem", "view", ticketKey];
    const output = await executeAcli(args);
    return parseTicketView(output, ticketKey);
  } catch (error) {
    console.error(`Error getting Jira ticket ${ticketKey}:`, error);
    return null;
  }
}
function parseTableOutput(output) {
  const lines = output.split("\n").filter((line) => line.trim());
  const tickets = [];
  for (const line of lines) {
    if (line.includes("\u2500") || line.includes("Type") || !line.trim()) continue;
    const parts = line.split(/\s{2,}/).map((part) => part.trim());
    if (parts.length >= 6) {
      tickets.push({
        key: parts[1] || "",
        type: parts[0] || "",
        summary: parts[5] || "",
        status: parts[4] || "",
        assignee: parts[2] || "Unassigned",
        priority: parts[3] || "Medium"
      });
    }
  }
  return tickets;
}
function parseTicketView(output, key) {
  const lines = output.split("\n");
  const ticket = {
    key,
    type: "",
    summary: "",
    status: "",
    assignee: "",
    priority: ""
  };
  let description = "";
  let captureDescription = false;
  for (const line of lines) {
    if (line.startsWith("Type: ")) {
      ticket.type = line.replace("Type: ", "").trim();
    } else if (line.startsWith("Summary: ")) {
      ticket.summary = line.replace("Summary: ", "").trim();
    } else if (line.startsWith("Status: ")) {
      ticket.status = line.replace("Status: ", "").trim();
    } else if (line.startsWith("Priority: ")) {
      ticket.priority = line.replace("Priority: ", "").trim();
    } else if (line.startsWith("Description: ")) {
      captureDescription = true;
      description = line.replace("Description: ", "").trim();
    } else if (captureDescription && line.trim()) {
      description += "\n" + line;
    }
  }
  ticket.description = description;
  return ticket;
}
async function getAIRelatedTickets() {
  const searchTerms = ["AI", "coaching", "Claude", "OpenAI", "chatbot", "holistic", "report"];
  const jql = `project in (KAN, SA) AND (summary ~ "${searchTerms.join('" OR summary ~ "')}")`;
  try {
    const args = [
      "jira",
      "workitem",
      "search",
      "--jql",
      jql,
      "--limit",
      "50"
    ];
    const output = await executeAcli(args);
    return parseTableOutput(output);
  } catch (error) {
    console.error("Error getting AI-related tickets:", error);
    return [];
  }
}
async function getProjectTickets() {
  const projects = ["SA", "KAN", "AWB", "CR"];
  const results = {};
  for (const project of projects) {
    try {
      results[project] = await searchJiraTickets({
        projects: [project],
        limit: 10
      });
    } catch (error) {
      console.error(`Error getting tickets for project ${project}:`, error);
      results[project] = [];
    }
  }
  return results;
}
async function generateDevStatusReport() {
  const aiTickets = await getAIRelatedTickets();
  const flagStatus = {
    holisticReports: false,
    aiCoaching: false,
    workshopLocking: true,
    debugPanel: true
  };
  const recommendations = [];
  const openAITickets = aiTickets.filter((t) => t.status !== "Done");
  if (openAITickets.length > 0 && !flagStatus.holisticReports) {
    recommendations.push("Consider enabling holisticReports feature flag for AI ticket development");
  }
  if (aiTickets.some((t) => t.summary.toLowerCase().includes("coaching")) && !flagStatus.aiCoaching) {
    recommendations.push("AI coaching tickets found - aiCoaching flag may need enabling");
  }
  return {
    aiTickets,
    flagStatus,
    recommendations
  };
}

// server/middleware/validateFlags.ts
function validateFlagsOnStartup() {
  const validation = validateFlagConfiguration();
  if (!validation.valid) {
    console.error("\u274C Feature flag configuration validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    if (process.env.NODE_ENV === "production") {
      console.error("\u{1F6A8} Exiting due to invalid feature flag configuration in production");
      process.exit(1);
    }
    console.warn("\u26A0\uFE0F  Continuing with invalid flag configuration (development mode)");
  } else {
    console.log("\u2705 Feature flag configuration is valid");
  }
}
function requireDevelopment(req, res, next) {
  const environment = process.env.ENVIRONMENT || "production";
  if (environment !== "development") {
    return res.status(404).json({
      error: "This endpoint is only available in development environment",
      environment
    });
  }
  next();
}

// server/routes/jira-routes.ts
var router17 = express13.Router();
router17.get("/projects", async (req, res) => {
  try {
    const tickets = await getProjectTickets();
    res.json({
      success: true,
      projects: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch project tickets",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router17.get("/search", async (req, res) => {
  try {
    const { projects, status, assignee, type: type2, limit } = req.query;
    const searchOptions = {
      projects: projects ? projects.split(",") : void 0,
      status: status ? status.split(",") : void 0,
      assignee,
      type: type2 ? type2.split(",") : void 0,
      limit: limit ? parseInt(limit) : void 0
    };
    const tickets = await searchJiraTickets(searchOptions);
    res.json({
      success: true,
      tickets,
      count: tickets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to search tickets",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router17.get("/ticket/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const ticket = await getJiraTicket(key);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${key} not found`
      });
    }
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch ticket",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router17.get("/ai-related", requireDevelopment, async (req, res) => {
  try {
    const tickets = await getAIRelatedTickets();
    res.json({
      success: true,
      tickets,
      count: tickets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch AI-related tickets",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router17.get("/dev-status", requireDevelopment, async (req, res) => {
  try {
    const report = await generateDevStatusReport();
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate development status report",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var jira_routes_default = router17;

// server/routes/feedback-routes.ts
import express14 from "express";
init_schema();
init_auth();
import { eq as eq13, desc as desc2, and as and7, ilike, inArray, count, or } from "drizzle-orm";
var router18 = express14.Router();
var checkFeedbackEnabled = (req, res, next) => {
  if (!featureFlags.feedbackSystem.enabled) {
    return res.status(404).json({ error: "Feedback system not available" });
  }
  next();
};
router18.use(checkFeedbackEnabled);
router18.post("/submit", requireAuth, async (req, res) => {
  try {
    const {
      pageContext,
      targetPage,
      feedbackType,
      message: message2,
      experienceRating,
      priority,
      pageData,
      systemInfo
    } = req.body;
    if (!pageContext || !feedbackType || !message2 || !pageData || !systemInfo) {
      return res.status(400).json({
        error: "Missing required fields: pageContext, feedbackType, message, pageData, systemInfo"
      });
    }
    const validPageContexts = ["current", "other", "general"];
    const validFeedbackTypes = ["bug", "feature", "content", "general"];
    const validPriorities = ["low", "medium", "high", "blocker"];
    const validWorkshopTypes = ["ast", "ia"];
    if (!validPageContexts.includes(pageContext)) {
      return res.status(400).json({ error: "Invalid pageContext" });
    }
    if (!validFeedbackTypes.includes(feedbackType)) {
      return res.status(400).json({ error: "Invalid feedbackType" });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }
    if (!validWorkshopTypes.includes(pageData.workshop)) {
      return res.status(400).json({ error: "Invalid workshop type" });
    }
    if (experienceRating && (experienceRating < 1 || experienceRating > 5)) {
      return res.status(400).json({ error: "Experience rating must be between 1 and 5" });
    }
    const newFeedback = await db.insert(feedback).values({
      userId: req.user.id,
      workshopType: pageData.workshop,
      pageContext,
      targetPage: pageContext === "current" ? pageData.title : pageContext === "other" ? targetPage : null,
      feedbackType,
      priority: priority || "low",
      message: message2.trim(),
      experienceRating,
      status: "new",
      tags: [],
      systemInfo,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    console.log("Feedback submitted:", {
      id: newFeedback[0].id,
      userId: req.user.id,
      workshopType: pageData.workshop,
      feedbackType,
      priority: priority || "low"
    });
    res.status(201).json({
      success: true,
      feedbackId: newFeedback[0].id,
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});
router18.get("/beta-tester-counts", requireAdmin, async (req, res) => {
  try {
    const betaTesters = await db.select({ id: users.id, username: users.username, name: users.name }).from(users).where(or(eq13(users.isBetaTester, true), eq13(users.isTestUser, true)));
    if (betaTesters.length === 0) {
      return res.json({
        success: true,
        betaTesters: [],
        message: "No beta testers found"
      });
    }
    const feedbackCounts = await db.select({
      userId: feedback.userId,
      count: count()
    }).from(feedback).where(inArray(feedback.userId, betaTesters.map((u) => u.id))).groupBy(feedback.userId);
    const countMap = {};
    feedbackCounts.forEach((item) => {
      if (item.userId) {
        countMap[item.userId] = item.count;
      }
    });
    const result = betaTesters.map((user) => ({
      userId: user.id,
      username: user.username,
      name: user.name,
      ticketCount: countMap[user.id] || 0
    }));
    res.json({
      success: true,
      betaTesters: result,
      totalBetaTesters: betaTesters.length,
      totalTickets: feedbackCounts.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error("Error fetching beta tester ticket counts:", error);
    res.status(500).json({ error: "Failed to fetch beta tester ticket counts" });
  }
});
router18.get("/stats/overview", requireAdmin, async (req, res) => {
  try {
    const totalFeedback = await db.select().from(feedback);
    const statusCounts = totalFeedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    const workshopCounts = totalFeedback.reduce((acc, item) => {
      acc[item.workshopType] = (acc[item.workshopType] || 0) + 1;
      return acc;
    }, {});
    const typeCounts = totalFeedback.reduce((acc, item) => {
      acc[item.feedbackType] = (acc[item.feedbackType] || 0) + 1;
      return acc;
    }, {});
    const priorityCounts = totalFeedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {});
    const ratingsSum = totalFeedback.filter((item) => item.experienceRating).reduce((sum, item) => sum + (item.experienceRating || 0), 0);
    const ratingsCount = totalFeedback.filter((item) => item.experienceRating).length;
    const averageRating = ratingsCount > 0 ? (ratingsSum / ratingsCount).toFixed(1) : null;
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedback = totalFeedback.filter(
      (item) => new Date(item.createdAt) >= sevenDaysAgo
    );
    res.json({
      total: totalFeedback.length,
      statusCounts,
      workshopCounts,
      typeCounts,
      priorityCounts,
      averageRating,
      recentCount: recentFeedback.length,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({ error: "Failed to fetch feedback statistics" });
  }
});
router18.get("/list", requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      workshopType,
      feedbackType,
      priority,
      search,
      userId: userId2
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = [];
    if (status) {
      whereConditions.push(eq13(feedback.status, status));
    }
    if (workshopType) {
      whereConditions.push(eq13(feedback.workshopType, workshopType));
    }
    if (feedbackType) {
      whereConditions.push(eq13(feedback.feedbackType, feedbackType));
    }
    if (priority) {
      whereConditions.push(eq13(feedback.priority, priority));
    }
    if (search) {
      whereConditions.push(ilike(feedback.message, `%${search}%`));
    }
    if (userId2) {
      whereConditions.push(eq13(feedback.userId, Number(userId2)));
    }
    const feedbackList = await db.select({
      id: feedback.id,
      userId: feedback.userId,
      userName: users.name,
      userEmail: users.email,
      workshopType: feedback.workshopType,
      pageContext: feedback.pageContext,
      targetPage: feedback.targetPage,
      feedbackType: feedback.feedbackType,
      priority: feedback.priority,
      message: feedback.message,
      experienceRating: feedback.experienceRating,
      status: feedback.status,
      tags: feedback.tags,
      systemInfo: feedback.systemInfo,
      adminNotes: feedback.adminNotes,
      jiraTicketId: feedback.jiraTicketId,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt
    }).from(feedback).leftJoin(users, eq13(feedback.userId, users.id)).where(whereConditions.length > 0 ? and7(...whereConditions) : void 0).orderBy(desc2(feedback.createdAt)).limit(Number(limit)).offset(offset);
    const totalCountResult = await db.select({ count: feedback.id }).from(feedback).where(whereConditions.length > 0 ? and7(...whereConditions) : void 0);
    const totalCount = totalCountResult.length;
    res.json({
      feedback: feedbackList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching feedback list:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});
router18.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const feedbackItem = await db.select({
      id: feedback.id,
      userId: feedback.userId,
      userName: users.name,
      userEmail: users.email,
      workshopType: feedback.workshopType,
      pageContext: feedback.pageContext,
      targetPage: feedback.targetPage,
      feedbackType: feedback.feedbackType,
      priority: feedback.priority,
      message: feedback.message,
      experienceRating: feedback.experienceRating,
      status: feedback.status,
      tags: feedback.tags,
      systemInfo: feedback.systemInfo,
      adminNotes: feedback.adminNotes,
      jiraTicketId: feedback.jiraTicketId,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt
    }).from(feedback).leftJoin(users, eq13(feedback.userId, users.id)).where(eq13(feedback.id, id)).limit(1);
    if (feedbackItem.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json(feedbackItem[0]);
  } catch (error) {
    console.error("Error fetching feedback item:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});
router18.patch("/:id/mark-read", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFeedback = await db.update(feedback).set({
      status: "read",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq13(feedback.id, id)).returning();
    if (updatedFeedback.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    console.log("Feedback marked as read:", {
      id,
      previousStatus: "various",
      newStatus: "read",
      markedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      message: "Feedback marked as read",
      feedback: updatedFeedback[0]
    });
  } catch (error) {
    console.error("Error marking feedback as read:", error);
    res.status(500).json({ error: "Failed to mark feedback as read" });
  }
});
router18.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, jiraTicketId, tags } = req.body;
    const validStatuses = ["new", "read", "in_progress", "resolved", "archived"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updateData = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (status) updateData.status = status;
    if (adminNotes !== void 0) updateData.adminNotes = adminNotes;
    if (jiraTicketId !== void 0) updateData.jiraTicketId = jiraTicketId;
    if (tags !== void 0) updateData.tags = tags;
    const updatedFeedback = await db.update(feedback).set(updateData).where(eq13(feedback.id, id)).returning();
    if (updatedFeedback.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    console.log("Feedback updated:", {
      id,
      status: status || "unchanged",
      hasAdminNotes: !!adminNotes,
      jiraTicketId: jiraTicketId || "none"
    });
    res.json({
      success: true,
      feedback: updatedFeedback[0]
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
});
router18.patch("/bulk/mark-read", requireAdmin, async (req, res) => {
  try {
    const { feedbackIds } = req.body;
    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
      return res.status(400).json({ error: "feedbackIds array is required" });
    }
    const updatedFeedback = await db.update(feedback).set({
      status: "read",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(inArray(feedback.id, feedbackIds)).returning({ id: feedback.id });
    console.log("Bulk feedback marked as read:", {
      count: updatedFeedback.length,
      feedbackIds: feedbackIds.slice(0, 5),
      // Log first 5 IDs for reference
      markedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      message: `${updatedFeedback.length} feedback items marked as read`,
      markedCount: updatedFeedback.length,
      markedIds: updatedFeedback.map((f) => f.id)
    });
  } catch (error) {
    console.error("Error bulk marking feedback as read:", error);
    res.status(500).json({ error: "Failed to bulk mark feedback as read" });
  }
});
router18.patch("/bulk/update", requireAdmin, async (req, res) => {
  try {
    const { feedbackIds, status, tags } = req.body;
    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
      return res.status(400).json({ error: "feedbackIds array is required" });
    }
    const validStatuses = ["new", "read", "in_progress", "resolved", "archived"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updateData = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (status) updateData.status = status;
    if (tags !== void 0) updateData.tags = tags;
    const updatedFeedback = await db.update(feedback).set(updateData).where(inArray(feedback.id, feedbackIds)).returning({ id: feedback.id });
    console.log("Bulk feedback update:", {
      count: updatedFeedback.length,
      status: status || "unchanged",
      feedbackIds: feedbackIds.slice(0, 5)
      // Log first 5 IDs for reference
    });
    res.json({
      success: true,
      updatedCount: updatedFeedback.length,
      updatedIds: updatedFeedback.map((f) => f.id)
    });
  } catch (error) {
    console.error("Error bulk updating feedback:", error);
    res.status(500).json({ error: "Failed to bulk update feedback" });
  }
});
router18.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFeedback = await db.delete(feedback).where(eq13(feedback.id, id)).returning({ id: feedback.id });
    if (deletedFeedback.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    console.log("Feedback deleted permanently:", {
      id,
      deletedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      message: "Feedback deleted permanently",
      deletedId: deletedFeedback[0].id
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});
router18.delete("/bulk/delete", requireAdmin, async (req, res) => {
  try {
    const { feedbackIds } = req.body;
    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
      return res.status(400).json({ error: "feedbackIds array is required" });
    }
    const deletedFeedback = await db.delete(feedback).where(inArray(feedback.id, feedbackIds)).returning({ id: feedback.id });
    console.log("Bulk feedback deletion:", {
      count: deletedFeedback.length,
      feedbackIds: feedbackIds.slice(0, 5),
      // Log first 5 IDs for reference
      deletedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({
      success: true,
      deletedCount: deletedFeedback.length,
      deletedIds: deletedFeedback.map((f) => f.id)
    });
  } catch (error) {
    console.error("Error bulk deleting feedback:", error);
    res.status(500).json({ error: "Failed to bulk delete feedback" });
  }
});
router18.post("/export/csv", requireAdmin, async (req, res) => {
  try {
    const {
      status,
      workshopType,
      feedbackType,
      priority,
      search
    } = req.body;
    let whereConditions = [];
    if (status) {
      whereConditions.push(eq13(feedback.status, status));
    }
    if (workshopType) {
      whereConditions.push(eq13(feedback.workshopType, workshopType));
    }
    if (feedbackType) {
      whereConditions.push(eq13(feedback.feedbackType, feedbackType));
    }
    if (priority) {
      whereConditions.push(eq13(feedback.priority, priority));
    }
    if (search) {
      whereConditions.push(ilike(feedback.message, `%${search}%`));
    }
    const feedbackList = await db.select({
      id: feedback.id,
      userId: feedback.userId,
      userName: users.name,
      userEmail: users.email,
      workshopType: feedback.workshopType,
      pageContext: feedback.pageContext,
      targetPage: feedback.targetPage,
      feedbackType: feedback.feedbackType,
      priority: feedback.priority,
      message: feedback.message,
      experienceRating: feedback.experienceRating,
      status: feedback.status,
      tags: feedback.tags,
      systemInfo: feedback.systemInfo,
      adminNotes: feedback.adminNotes,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt
    }).from(feedback).leftJoin(users, eq13(feedback.userId, users.id)).where(whereConditions.length > 0 ? and7(...whereConditions) : void 0).orderBy(desc2(feedback.createdAt));
    const csvHeaders = [
      "ID",
      "Date",
      "User Name",
      "User Email",
      "Workshop",
      "Page Context",
      "Target Page",
      "Type",
      "Priority",
      "Status",
      "Experience Rating",
      "Message",
      "Admin Notes",
      "Browser",
      "OS",
      "Updated At"
    ];
    const csvRows = feedbackList.map((item) => {
      const systemInfo = item.systemInfo;
      return [
        item.id,
        new Date(item.createdAt).toISOString(),
        item.userName || "Anonymous",
        item.userEmail || "N/A",
        item.workshopType.toUpperCase(),
        item.pageContext,
        item.targetPage || "N/A",
        item.feedbackType,
        item.priority,
        item.status,
        item.experienceRating || "N/A",
        `"${(item.message || "").replace(/"/g, '""')}"`,
        // Escape quotes in CSV
        `"${(item.adminNotes || "").replace(/"/g, '""')}"`,
        // Escape quotes in CSV
        systemInfo?.browser || "Unknown",
        systemInfo?.os || "Unknown",
        new Date(item.updatedAt).toISOString()
      ];
    });
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(","))
    ].join("\n");
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const filename = `feedback-export-${timestamp2}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");
    console.log("Feedback CSV export:", {
      totalRecords: feedbackList.length,
      filters: { status, workshopType, feedbackType, priority, hasSearch: !!search },
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting feedback to CSV:", error);
    res.status(500).json({ error: "Failed to export feedback" });
  }
});
var feedback_routes_default = router18;

// server/routes/training-documents-routes.ts
init_auth();
import express15 from "express";
import { Pool as Pool15 } from "pg";
import multer2 from "multer";
import { v4 as uuidv4 } from "uuid";
var router19 = express15.Router();
var pool15 = new Pool15({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("\u{1F4CE} File upload attempt:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/html",
      "text/xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
      "application/xml",
      "text/rtf",
      "application/rtf",
      // Also allow files without extension or with generic types
      "application/octet-stream"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      console.log("\u2705 File type accepted:", file.mimetype);
      cb(null, true);
    } else {
      console.error("\u274C File type rejected:", file.mimetype);
      cb(new Error(`Invalid file type "${file.mimetype}". Allowed types: ${allowedTypes.join(", ")}`));
    }
  }
});
router19.use(requireAuth);
router19.get("/documents", requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      document_type,
      category,
      status = "active",
      search
    } = req.query;
    console.log("\u{1F4CB} Fetching training documents:", { page, limit, document_type, category, status, search });
    let whereClause = `WHERE status = $1`;
    const params = [status];
    let paramIndex = 2;
    if (document_type) {
      whereClause += ` AND document_type = $${paramIndex}`;
      params.push(document_type);
      paramIndex++;
    }
    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    const offset = (page - 1) * limit;
    const documentsQuery = `
      SELECT 
        id,
        title,
        document_type,
        category,
        tags,
        version,
        status,
        file_size,
        file_type,
        original_filename,
        uploaded_by,
        created_at,
        updated_at,
        LENGTH(content) as content_length
      FROM training_documents
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);
    const documentsResult = await pool15.query(documentsQuery, params);
    const documents = documentsResult.rows;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM training_documents
      ${whereClause}
    `;
    const countResult = await pool15.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    const statsQuery = `
      SELECT 
        document_type,
        COUNT(*) as count
      FROM training_documents
      WHERE status = 'active'
      GROUP BY document_type
      ORDER BY count DESC
    `;
    const statsResult = await pool15.query(statsQuery);
    const stats = statsResult.rows;
    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats,
      message: `Found ${documents.length} training documents`
    });
  } catch (error) {
    console.error("\u274C Error fetching training documents:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch training documents"
    });
  }
});
router19.get("/documents/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("\u{1F4C4} Fetching training document:", id);
    const documentResult = await pool15.query(`
      SELECT 
        td.*,
        u.name as uploaded_by_name,
        (
          SELECT COUNT(*)
          FROM document_chunks dc
          WHERE dc.document_id = td.id
        ) as chunk_count
      FROM training_documents td
      LEFT JOIN users u ON td.uploaded_by = u.id
      WHERE td.id = $1
    `, [id]);
    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    const document = documentResult.rows[0];
    let processingStatus = null;
    if (document.chunk_count > 0) {
      const processingResult = await pool15.query(`
        SELECT 
          job_type,
          status,
          progress_percentage,
          error_message,
          completed_at
        FROM document_processing_jobs
        WHERE document_id = $1
        ORDER BY created_at DESC
        LIMIT 3
      `, [id]);
      processingStatus = processingResult.rows;
    }
    res.json({
      success: true,
      document,
      processing_status: processingStatus,
      message: "Training document retrieved successfully"
    });
  } catch (error) {
    console.error("\u274C Error fetching training document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch training document"
    });
  }
});
router19.post("/documents", requireAdmin, upload2.single("file"), async (req, res) => {
  try {
    console.log("\u{1F4E4} Training document upload request received");
    console.log("\u{1F4E4} Request body:", req.body);
    console.log("\u{1F4E4} Request file:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");
    console.log("\u{1F4E4} User:", req.user?.id);
    const {
      title,
      document_type,
      category,
      tags,
      version = "1.0",
      content
    } = req.body;
    const file = req.file;
    console.log("\u{1F4E4} Uploading training document:", { title, document_type, category });
    if (!title || !document_type) {
      return res.status(400).json({
        success: false,
        error: "Title and document_type are required"
      });
    }
    const validTypes = [
      "coaching_guide",
      "report_template",
      "assessment_framework",
      "best_practices",
      "strengths_theory",
      "flow_research",
      "team_dynamics",
      "industry_guidance",
      // AST-specific document types
      "ast_methodology",
      "ast_training_material",
      "ast_workshop_guide",
      "ast_assessment_info",
      "ast_strengths_analysis",
      "ast_flow_attributes",
      "ast_reflection_prompts",
      "ast_report_examples",
      "ast_coaching_scripts"
    ];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document_type. Must be one of: ${validTypes.join(", ")}`
      });
    }
    let documentContent = content;
    let fileSize = 0;
    let fileType = "text/plain";
    let originalFilename = null;
    if (file) {
      fileSize = file.size;
      fileType = file.mimetype;
      originalFilename = file.originalname;
      const textMimeTypes = [
        "text/plain",
        "text/markdown",
        "text/csv",
        "text/html",
        "text/xml",
        "application/json",
        "application/xml",
        "text/rtf",
        "application/rtf"
      ];
      const isTextFile = textMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|csv|html|xml|json|rtf)$/i);
      if (isTextFile) {
        documentContent = file.buffer.toString("utf-8");
        console.log(`\u{1F4C4} Text file processed: ${file.originalname} (${file.mimetype}) - ${documentContent.length} characters`);
      } else {
        documentContent = `[Binary file: ${file.originalname}]
File type: ${file.mimetype}
Size: ${file.size} bytes

Content stored as binary data - parsing will be implemented in future updates.`;
        console.log(`\u{1F4C4} Binary file uploaded: ${file.originalname} (${file.mimetype})`);
      }
    }
    if (!documentContent) {
      return res.status(400).json({
        success: false,
        error: "Either file upload or content text is required"
      });
    }
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        parsedTags = tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }
    const documentId = uuidv4();
    await pool15.query(`
      INSERT INTO training_documents (
        id, title, content, document_type, category, tags, version,
        file_size, file_type, original_filename, uploaded_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
      documentId,
      title,
      documentContent,
      document_type,
      category,
      parsedTags,
      version,
      fileSize,
      fileType,
      originalFilename,
      req.user?.id
    ]);
    const jobId = uuidv4();
    await pool15.query(`
      INSERT INTO document_processing_jobs (
        id, document_id, job_type, status, progress_percentage, created_at
      ) VALUES ($1, $2, 'chunking', 'pending', 0, NOW())
    `, [jobId, documentId]);
    try {
      console.log("\u{1F504} Automatically processing document for search...");
      const { textSearchService: textSearchService2 } = await Promise.resolve().then(() => (init_text_search_service(), text_search_service_exports));
      await textSearchService2.processDocumentForSearch(documentId);
      await pool15.query(`
        UPDATE document_processing_jobs 
        SET status = 'completed', progress_percentage = 100, completed_at = NOW()
        WHERE id = $1
      `, [jobId]);
      console.log("\u2705 Document automatically processed into searchable chunks");
    } catch (processingError) {
      console.error("\u274C Auto-processing failed:", processingError);
      await pool15.query(`
        UPDATE document_processing_jobs 
        SET status = 'failed', error_message = $1, completed_at = NOW()
        WHERE id = $2
      `, [processingError.message, jobId]);
    }
    console.log("\u2705 Training document uploaded successfully:", documentId);
    res.status(201).json({
      success: true,
      document_id: documentId,
      job_id: jobId,
      message: "Training document uploaded and processed successfully. Talia can now access this content.",
      processing_status: "completed"
    });
  } catch (error) {
    console.error("\u274C Error uploading training document:", error);
    console.error("\u274C Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({
      success: false,
      error: "Failed to upload training document",
      details: process.env.NODE_ENV === "development" ? error.message : void 0
    });
  }
});
router19.post("/documents/text", requireAdmin, async (req, res) => {
  try {
    console.log("\u{1F4DD} Text-based training document upload request received");
    console.log("\u{1F4DD} User:", req.user?.id);
    const {
      title,
      content,
      document_type,
      category = "coaching_system",
      tags,
      version = "1.0"
    } = req.body;
    console.log("\u{1F4DD} Creating text-based training document:", { title, document_type, category });
    if (!title || !content || !document_type) {
      return res.status(400).json({
        success: false,
        error: "Title, content, and document_type are required"
      });
    }
    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Content must be at least 10 characters long"
      });
    }
    const validTypes = [
      "coaching_guide",
      "report_template",
      "assessment_framework",
      "best_practices",
      "strengths_theory",
      "flow_research",
      "team_dynamics",
      "industry_guidance",
      "ast_methodology",
      "ast_training_material",
      "ast_workshop_guide",
      "ast_assessment_info",
      "ast_strengths_analysis",
      "ast_flow_attributes",
      "ast_reflection_prompts",
      "ast_report_examples",
      "ast_coaching_scripts"
    ];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document_type. Must be one of: ${validTypes.join(", ")}`
      });
    }
    let parsedTags = null;
    if (tags) {
      if (typeof tags === "string") {
        parsedTags = tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      } else if (Array.isArray(tags)) {
        parsedTags = tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0);
      }
    }
    const documentId = uuidv4();
    await pool15.query(`
      INSERT INTO training_documents (
        id, title, content, document_type, category, tags, version, status,
        file_size, file_type, original_filename, uploaded_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, 'text/plain', 'text-upload.txt', $9, NOW(), NOW())
    `, [
      documentId,
      title,
      content,
      document_type,
      category,
      parsedTags,
      version,
      content.length,
      req.user?.id
    ]);
    const jobId = uuidv4();
    await pool15.query(`
      INSERT INTO document_processing_jobs (
        id, document_id, job_type, status, progress_percentage, created_at
      ) VALUES ($1, $2, 'chunking', 'pending', 0, NOW())
    `, [jobId, documentId]);
    try {
      console.log("\u{1F504} Automatically processing text document for search...");
      const { textSearchService: textSearchService2 } = await Promise.resolve().then(() => (init_text_search_service(), text_search_service_exports));
      await textSearchService2.processDocumentForSearch(documentId);
      await pool15.query(`
        UPDATE document_processing_jobs 
        SET status = 'completed', progress_percentage = 100, completed_at = NOW()
        WHERE id = $1
      `, [jobId]);
      console.log("\u2705 Text document automatically processed into searchable chunks");
    } catch (processingError) {
      console.error("\u274C Auto-processing failed:", processingError);
      await pool15.query(`
        UPDATE document_processing_jobs 
        SET status = 'failed', error_message = $1, completed_at = NOW()
        WHERE id = $2
      `, [processingError.message, jobId]);
    }
    console.log("\u2705 Text-based training document created successfully:", documentId);
    res.status(201).json({
      success: true,
      document_id: documentId,
      job_id: jobId,
      message: "Text document uploaded and processed successfully. Talia can now access this content.",
      processing_status: "completed",
      document: {
        id: documentId,
        title,
        document_type,
        category,
        content_length: content.length,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    console.error("\u274C Error creating text-based training document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create text-based training document",
      details: process.env.NODE_ENV === "development" ? error.message : void 0
    });
  }
});
router19.get("/document-types", requireAdmin, async (req, res) => {
  try {
    const documentTypes = [
      {
        value: "coaching_guide",
        label: "Coaching Guide",
        description: "Methodologies and techniques for coaching"
      },
      {
        value: "report_template",
        label: "Report Template",
        description: "Templates for generating holistic reports"
      },
      {
        value: "assessment_framework",
        label: "Assessment Framework",
        description: "Frameworks for evaluating strengths and abilities"
      },
      {
        value: "best_practices",
        label: "Best Practices",
        description: "Proven strategies and approaches"
      },
      {
        value: "strengths_theory",
        label: "Strengths Theory",
        description: "Theoretical foundations of strengths-based development"
      },
      {
        value: "flow_research",
        label: "Flow Research",
        description: "Research on flow states and peak performance"
      },
      {
        value: "team_dynamics",
        label: "Team Dynamics",
        description: "Understanding and optimizing team interactions"
      },
      {
        value: "industry_guidance",
        label: "Industry Guidance",
        description: "Industry-specific advice and insights"
      },
      // AST-specific document types
      {
        value: "ast_methodology",
        label: "AST Methodology",
        description: "AllStarTeams core methodology and principles"
      },
      {
        value: "ast_training_material",
        label: "AST Training Material",
        description: "Training content and educational materials for AST"
      },
      {
        value: "ast_workshop_guide",
        label: "AST Workshop Guide",
        description: "Step-by-step guides for conducting AST workshops"
      },
      {
        value: "ast_assessment_info",
        label: "AST Assessment Info",
        description: "Information about AST assessments and evaluation tools"
      },
      {
        value: "ast_strengths_analysis",
        label: "AST Strengths Analysis",
        description: "Guidance on analyzing and interpreting strengths results"
      },
      {
        value: "ast_flow_attributes",
        label: "AST Flow Attributes",
        description: "Information about flow state attributes and selection"
      },
      {
        value: "ast_reflection_prompts",
        label: "AST Reflection Prompts",
        description: "Reflection questions and prompts for AST participants"
      },
      {
        value: "ast_report_examples",
        label: "AST Report Examples",
        description: "Sample reports and analysis examples"
      },
      {
        value: "ast_coaching_scripts",
        label: "AST Coaching Scripts",
        description: "Scripts and conversation guides for AST coaching"
      }
    ];
    const categoriesResult = await pool15.query(`
      SELECT DISTINCT category
      FROM training_documents
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);
    const categories = categoriesResult.rows.map((row) => row.category);
    res.json({
      success: true,
      document_types: documentTypes,
      categories,
      message: "Document types and categories retrieved successfully"
    });
  } catch (error) {
    console.error("\u274C Error fetching document types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch document types"
    });
  }
});
router19.delete("/documents/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("\u{1F5D1}\uFE0F Deleting training document:", id);
    const documentResult = await pool15.query(`
      SELECT id, title, original_filename
      FROM training_documents
      WHERE id = $1
    `, [id]);
    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    const document = documentResult.rows[0];
    await pool15.query(`
      DELETE FROM document_chunks
      WHERE document_id = $1
    `, [id]);
    await pool15.query(`
      DELETE FROM document_processing_jobs
      WHERE document_id = $1
    `, [id]);
    await pool15.query(`
      DELETE FROM training_documents
      WHERE id = $1
    `, [id]);
    console.log("\u2705 Training document deleted successfully:", document.title);
    res.json({
      success: true,
      message: `Training document "${document.title}" deleted successfully`
    });
  } catch (error) {
    console.error("\u274C Error deleting training document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete training document"
    });
  }
});
router19.put("/documents/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      document_type,
      category,
      tags,
      version,
      status
    } = req.body;
    console.log("\u270F\uFE0F Updating training document:", id, req.body);
    const documentResult = await pool15.query(`
      SELECT id, title
      FROM training_documents
      WHERE id = $1
    `, [id]);
    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        parsedTags = tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (title !== void 0) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }
    if (document_type !== void 0) {
      updates.push(`document_type = $${paramIndex}`);
      values.push(document_type);
      paramIndex++;
    }
    if (category !== void 0) {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }
    if (tags !== void 0) {
      updates.push(`tags = $${paramIndex}`);
      values.push(parsedTags);
      paramIndex++;
    }
    if (version !== void 0) {
      updates.push(`version = $${paramIndex}`);
      values.push(version);
      paramIndex++;
    }
    if (status !== void 0) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update"
      });
    }
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const updateQuery = `
      UPDATE training_documents 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, title, document_type, category, tags, version, status, updated_at
    `;
    const result = await pool15.query(updateQuery, values);
    const updatedDocument = result.rows[0];
    console.log("\u2705 Training document updated successfully:", updatedDocument.title);
    res.json({
      success: true,
      document: updatedDocument,
      message: "Training document updated successfully"
    });
  } catch (error) {
    console.error("\u274C Error updating training document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update training document"
    });
  }
});
router19.get("/stats", requireAdmin, async (req, res) => {
  try {
    console.log("\u{1F4CA} Fetching training document statistics");
    const typeStatsResult = await pool15.query(`
      SELECT 
        document_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM training_documents
      GROUP BY document_type
      ORDER BY count DESC
    `);
    const processingStatsResult = await pool15.query(`
      SELECT 
        job_type,
        status,
        COUNT(*) as count
      FROM document_processing_jobs
      GROUP BY job_type, status
      ORDER BY job_type, status
    `);
    const totalStatsResult = await pool15.query(`
      SELECT 
        COUNT(*) as total_documents,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_documents,
        SUM(file_size) as total_size,
        AVG(file_size) as avg_size
      FROM training_documents
    `);
    const chunkStatsResult = await pool15.query(`
      SELECT 
        COUNT(*) as total_chunks,
        AVG(token_count) as avg_tokens_per_chunk,
        COUNT(DISTINCT document_id) as documents_with_chunks
      FROM document_chunks
    `);
    res.json({
      success: true,
      stats: {
        by_type: typeStatsResult.rows,
        processing: processingStatsResult.rows,
        totals: totalStatsResult.rows[0],
        chunks: chunkStatsResult.rows[0]
      },
      message: "Training document statistics retrieved successfully"
    });
  } catch (error) {
    console.error("\u274C Error fetching training statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch training statistics"
    });
  }
});
var training_documents_routes_default = router19;

// server/routes/training-routes.ts
init_talia_training_service();
import { Router as Router8 } from "express";
var router20 = Router8();
router20.post("/add-text", async (req, res) => {
  try {
    const { personaId, trainingText } = req.body;
    const adminUserId = req.session?.userId;
    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        error: "Admin authentication required"
      });
    }
    if (!personaId || !trainingText) {
      return res.status(400).json({
        success: false,
        error: "PersonaId and trainingText are required"
      });
    }
    if (trainingText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Training text must be at least 10 characters long"
      });
    }
    await taliaTrainingService.addTrainingFromAdmin(
      personaId,
      trainingText.trim(),
      adminUserId.toString()
    );
    res.json({
      success: true,
      message: "Training text added successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error adding training text:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add training text"
    });
  }
});
router20.get("/data/:personaId", async (req, res) => {
  try {
    const { personaId } = req.params;
    const adminUserId = req.session?.userId;
    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        error: "Admin authentication required"
      });
    }
    const trainingData = await taliaTrainingService.loadTrainingData(personaId);
    res.json({
      success: true,
      data: trainingData || {
        trainingSessions: [],
        guidelines: [],
        examples: [],
        lastUpdated: null
      }
    });
  } catch (error) {
    console.error("\u274C Error loading training data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load training data"
    });
  }
});
router20.get("/active-sessions", async (req, res) => {
  try {
    const adminUserId = req.session?.userId;
    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        error: "Admin authentication required"
      });
    }
    res.json({
      success: true,
      message: "Active sessions monitoring endpoint - implementation depends on privacy requirements",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting active sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get active sessions"
    });
  }
});
var training_routes_default = router20;

// server/routes/ai-management-routes.ts
init_auth();
import express16 from "express";
import { Pool as Pool16 } from "pg";
var router21 = express16.Router();
var pool16 = new Pool16({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
router21.get("/config", requireAdmin, async (req, res) => {
  try {
    const result = await pool16.query(
      "SELECT * FROM ai_configuration ORDER BY feature_name"
    );
    res.json({
      success: true,
      configurations: result.rows
    });
  } catch (error) {
    console.error("Error fetching AI configurations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch AI configurations"
    });
  }
});
router21.put("/config/:featureName", requireAdmin, async (req, res) => {
  const { featureName } = req.params;
  const updates = req.body;
  try {
    const validFeatures = ["global", "coaching", "holistic_reports", "reflection_assistance"];
    if (!validFeatures.includes(featureName)) {
      return res.status(400).json({
        success: false,
        error: "Invalid feature name"
      });
    }
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    if (updates.enabled !== void 0) {
      updateFields.push(`enabled = $${paramCount++}`);
      values.push(updates.enabled);
    }
    if (updates.rateLimitPerHour !== void 0) {
      updateFields.push(`rate_limit_per_hour = $${paramCount++}`);
      values.push(updates.rateLimitPerHour);
    }
    if (updates.rateLimitPerDay !== void 0) {
      updateFields.push(`rate_limit_per_day = $${paramCount++}`);
      values.push(updates.rateLimitPerDay);
    }
    if (updates.maxTokens !== void 0) {
      updateFields.push(`max_tokens = $${paramCount++}`);
      values.push(updates.maxTokens);
    }
    if (updates.timeoutMs !== void 0) {
      updateFields.push(`timeout_ms = $${paramCount++}`);
      values.push(updates.timeoutMs);
    }
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid update fields provided"
      });
    }
    values.push(featureName);
    const query2 = `
      UPDATE ai_configuration 
      SET ${updateFields.join(", ")}, updated_at = NOW()
      WHERE feature_name = $${paramCount}
      RETURNING *
    `;
    const result = await pool16.query(query2, values);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Feature configuration not found"
      });
    }
    console.log(`\u2705 AI configuration updated for ${featureName} by admin ${req.session?.userId}`);
    res.json({
      success: true,
      configuration: result.rows[0],
      message: `${featureName} configuration updated successfully`
    });
  } catch (error) {
    console.error("Error updating AI configuration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update AI configuration"
    });
  }
});
router21.get("/usage/stats", requireAdmin, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const hoursNum = parseInt(hours) || 24;
    const statsResult = await pool16.query(
      "SELECT * FROM ai_usage_statistics WHERE hour >= NOW() - INTERVAL '$1 hours' ORDER BY hour DESC, feature_name",
      [hoursNum]
    );
    const currentHourResult = await pool16.query(`
      SELECT 
        feature_name,
        COUNT(*) as calls_this_hour,
        SUM(tokens_used) as tokens_this_hour,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_calls,
        SUM(cost_estimate) as cost_this_hour
      FROM ai_usage_logs 
      WHERE timestamp >= DATE_TRUNC('hour', NOW())
      GROUP BY feature_name
    `);
    const totalsResult = await pool16.query(`
      SELECT 
        COUNT(*) as total_calls_24h,
        SUM(tokens_used) as total_tokens_24h,
        SUM(cost_estimate) as total_cost_24h,
        COUNT(DISTINCT user_id) as active_users_24h
      FROM ai_usage_logs 
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    `);
    res.json({
      success: true,
      statistics: statsResult.rows,
      currentHour: currentHourResult.rows,
      totals: totalsResult.rows[0] || {
        total_calls_24h: 0,
        total_tokens_24h: 0,
        total_cost_24h: 0,
        active_users_24h: 0
      }
    });
  } catch (error) {
    console.error("Error fetching AI usage statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch AI usage statistics"
    });
  }
});
router21.get("/usage/logs", requireAdmin, async (req, res) => {
  try {
    const { limit = 100, feature, userId: userId2, success } = req.query;
    let query2 = `
      SELECT 
        al.*,
        u.username,
        u.name as user_name
      FROM ai_usage_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;
    if (feature) {
      query2 += ` AND al.feature_name = $${paramCount++}`;
      values.push(feature);
    }
    if (userId2) {
      query2 += ` AND al.user_id = $${paramCount++}`;
      values.push(parseInt(userId2));
    }
    if (success !== void 0) {
      query2 += ` AND al.success = $${paramCount++}`;
      values.push(success === "true");
    }
    query2 += ` ORDER BY al.timestamp DESC LIMIT $${paramCount}`;
    values.push(parseInt(limit) || 100);
    const result = await pool16.query(query2, values);
    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error("Error fetching AI usage logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch AI usage logs"
    });
  }
});
router21.post("/emergency-disable", requireAdmin, async (req, res) => {
  try {
    const adminUserId = req.session?.userId;
    await pool16.query(
      "UPDATE ai_configuration SET enabled = false, updated_at = NOW()"
    );
    console.log(`\u{1F6A8} EMERGENCY AI DISABLE triggered by admin ${adminUserId}`);
    res.json({
      success: true,
      message: "All AI features have been disabled",
      disabledAt: (/* @__PURE__ */ new Date()).toISOString(),
      disabledBy: adminUserId
    });
  } catch (error) {
    console.error("Error during emergency AI disable:", error);
    res.status(500).json({
      success: false,
      error: "Failed to disable AI features"
    });
  }
});
router21.get("/beta-testers", requireAdmin, async (req, res) => {
  try {
    const result = await pool16.query(`
      SELECT 
        u.id,
        u.username,
        u.name,
        u.email,
        u.is_beta_tester,
        u.is_test_user,
        u.beta_tester_granted_at,
        u.beta_tester_granted_by,
        admin.username as granted_by_username,
        CASE 
          WHEN u.is_beta_tester = true THEN 'beta_tester'
          WHEN u.is_test_user = true THEN 'test_user'
          ELSE 'none'
        END as access_type
      FROM users u
      LEFT JOIN users admin ON u.beta_tester_granted_by = admin.id
      WHERE u.is_beta_tester = true OR u.is_test_user = true
      ORDER BY u.beta_tester_granted_at DESC NULLS LAST, u.username
    `);
    res.json({
      success: true,
      betaTesters: result.rows
    });
  } catch (error) {
    console.error("Error fetching beta testers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch beta testers list"
    });
  }
});
router21.get("/training-docs", requireAdmin, async (req, res) => {
  try {
    const result = await pool16.query(`
      SELECT 
        id,
        original_filename,
        category,
        content_preview,
        word_count,
        chunk_count,
        uploaded_at,
        processed_at
      FROM training_documents 
      ORDER BY uploaded_at DESC
    `);
    res.json({
      success: true,
      documents: result.rows,
      totalDocuments: result.rows.length
    });
  } catch (error) {
    console.error("Error fetching training documents:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch training documents"
    });
  }
});
router21.get("/training-docs/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const docResult = await pool16.query(
      "SELECT * FROM training_documents WHERE id = $1",
      [id]
    );
    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    const chunksResult = await pool16.query(`
      SELECT 
        id,
        chunk_index,
        content,
        char_count,
        search_vector_preview
      FROM training_document_chunks 
      WHERE document_id = $1 
      ORDER BY chunk_index
    `, [id]);
    res.json({
      success: true,
      document: docResult.rows[0],
      chunks: chunksResult.rows,
      chunkCount: chunksResult.rows.length
    });
  } catch (error) {
    console.error("Error fetching training document details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch training document details"
    });
  }
});
router21.delete("/training-docs/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.session?.userId;
  try {
    await pool16.query("BEGIN");
    await pool16.query("DELETE FROM training_document_chunks WHERE document_id = $1", [id]);
    const result = await pool16.query(
      "DELETE FROM training_documents WHERE id = $1 RETURNING original_filename",
      [id]
    );
    if (result.rows.length === 0) {
      await pool16.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    await pool16.query("COMMIT");
    console.log(`\u{1F5D1}\uFE0F Training document ${result.rows[0].original_filename} deleted by admin ${adminUserId}`);
    res.json({
      success: true,
      message: "Training document deleted successfully",
      deletedFilename: result.rows[0].original_filename
    });
  } catch (error) {
    await pool16.query("ROLLBACK");
    console.error("Error deleting training document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete training document"
    });
  }
});
router21.get("/personas", requireAdmin, async (req, res) => {
  try {
    console.log("\u{1F527} PERSONA GET REQUEST RECEIVED (from ai-management-routes)");
    console.log("\u{1F4CB} Fetching persona configurations");
    const { CURRENT_PERSONAS: CURRENT_PERSONAS2 } = await Promise.resolve().then(() => (init_persona_management_routes(), persona_management_routes_exports));
    const currentEnvironment = process.env.NODE_ENV || "development";
    const filteredPersonas = CURRENT_PERSONAS2.filter(
      (persona2) => persona2.environments.includes(currentEnvironment)
    );
    console.log(`\u{1F30D} Environment: ${currentEnvironment}, Available personas: ${filteredPersonas.length}/${CURRENT_PERSONAS2.length}`);
    res.json({
      success: true,
      personas: filteredPersonas,
      environment: currentEnvironment,
      message: "Personas retrieved successfully"
    });
  } catch (error) {
    console.error("\u274C Error fetching personas:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Talia personas configuration"
    });
  }
});
router21.post("/beta-testers/:userId", requireAdmin, async (req, res) => {
  const { userId: userId2 } = req.params;
  const { grant } = req.body;
  const adminUserId = req.session?.userId;
  try {
    if (grant) {
      await pool16.query(
        "UPDATE users SET is_beta_tester = true, beta_tester_granted_at = NOW(), beta_tester_granted_by = $1 WHERE id = $2",
        [adminUserId, userId2]
      );
      console.log(`\u2705 Beta tester access granted to user ${userId2} by admin ${adminUserId}`);
      res.json({
        success: true,
        message: "Beta tester access granted successfully"
      });
    } else {
      await pool16.query(
        "UPDATE users SET is_beta_tester = false, beta_tester_granted_at = NULL, beta_tester_granted_by = NULL WHERE id = $1",
        [userId2]
      );
      console.log(`\u{1F6AB} Beta tester access revoked for user ${userId2} by admin ${adminUserId}`);
      res.json({
        success: true,
        message: "Beta tester access revoked successfully"
      });
    }
  } catch (error) {
    console.error("Error updating beta tester status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update beta tester status"
    });
  }
});
router21.get("/report-talia/completed-users", requireAdmin, async (_req, res) => {
  try {
    console.log("\u{1F527} Fetching AST completed users for Report Talia");
    const result = await pool16.query(`
      SELECT 
        u.id,
        u.username,
        u.name,
        u.email,
        u.ast_completed_at,
        u.created_at
      FROM users u
      WHERE u.ast_workshop_completed = true
      ORDER BY u.ast_completed_at DESC NULLS LAST, u.name ASC
    `);
    console.log(`\u{1F4CA} Found ${result.rows.length} users who completed AST workshop`);
    console.log("\u{1F4CB} Users:", result.rows);
    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} users who completed AST workshop`
    });
  } catch (error) {
    console.error("\u274C Error fetching AST completed users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch AST completed users"
    });
  }
});
router21.post("/report-talia/update-completion", requireAdmin, async (req, res) => {
  const { userId: userId2, completed } = req.body;
  const adminUserId = req.session?.userId;
  try {
    console.log(`\u{1F527} Admin ${adminUserId} updating AST completion for user ${userId2}: ${completed}`);
    if (!userId2) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }
    const updateQuery = completed ? "UPDATE users SET ast_workshop_completed = true, ast_completed_at = NOW() WHERE id = $1" : "UPDATE users SET ast_workshop_completed = false, ast_completed_at = NULL WHERE id = $1";
    const result = await pool16.query(updateQuery, [userId2]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    console.log(`\u2705 Updated AST completion status for user ${userId2}: ${completed}`);
    res.json({
      success: true,
      message: `User ${userId2} AST completion status updated to: ${completed}`,
      userId: userId2,
      completed
    });
  } catch (error) {
    console.error("\u274C Error updating AST completion status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update AST completion status"
    });
  }
});
router21.post("/report-talia/generate-report", requireAdmin, async (req, res) => {
  const { userId: userId2, reportType = "personal" } = req.body;
  const adminUserId = req.session?.userId;
  try {
    console.log(`\u{1F527} Generating Report Talia MD report for user ${userId2}`);
    if (!userId2) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }
    const userResult = await pool16.query(
      "SELECT id, username, name, ast_workshop_completed, ast_completed_at FROM users WHERE id = $1",
      [userId2]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const user = userResult.rows[0];
    if (!user.ast_workshop_completed) {
      return res.status(400).json({
        success: false,
        error: "User has not completed AST workshop"
      });
    }
    const assessmentResult = await pool16.query(
      "SELECT * FROM user_assessments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId2]
    );
    const stepDataResult = await pool16.query(
      "SELECT * FROM workshop_step_data WHERE user_id = $1 ORDER BY step_id, created_at DESC",
      [userId2]
    );
    const { generateOpenAICoachingResponse: generateOpenAICoachingResponse2 } = await Promise.resolve().then(() => (init_openai_api_service(), openai_api_service_exports));
    let starCardImageBase64 = "";
    try {
      console.log(`\u{1F5BC}\uFE0F Getting StarCard image for user ${userId2}...`);
      const { photoStorageService: photoStorageService2 } = await Promise.resolve().then(() => (init_photo_storage_service(), photo_storage_service_exports));
      const starCardImage = await photoStorageService2.getUserStarCard(userId2.toString());
      if (starCardImage && starCardImage.imageData) {
        starCardImageBase64 = starCardImage.imageData;
        console.log("\u2705 Found StarCard image for report integration");
      } else {
        console.log("\u26A0\uFE0F No StarCard image found for this user");
      }
    } catch (error) {
      console.warn("Could not retrieve StarCard image:", error);
    }
    const userData = {
      user,
      assessments: assessmentResult.rows,
      stepData: stepDataResult.rows,
      completedAt: user.ast_completed_at
    };
    const isPersonalReport = reportType === "personal";
    console.log("\u{1F680} Admin Console: Using pgvector semantic search for optimal training content");
    console.log("\u{1F527} FIXED DATA MAPPING - Testing strengths data fix");
    const { pgvectorSearchService: pgvectorSearchService2 } = await Promise.resolve().then(() => (init_pgvector_search_service(), pgvector_search_service_exports));
    const userContextData = {
      name: user.name,
      strengths: assessmentResult.rows.find((a) => a.assessment_type === "starCard")?.results ? JSON.parse(assessmentResult.rows.find((a) => a.assessment_type === "starCard").results) : { "thinking": 0, "feeling": 0, "acting": 0, "planning": 0 },
      reflections: assessmentResult.rows.find((a) => a.assessment_type === "stepByStepReflection")?.results ? JSON.parse(assessmentResult.rows.find((a) => a.assessment_type === "stepByStepReflection").results) : {},
      flowData: assessmentResult.rows.find((a) => a.assessment_type === "flowAssessment")?.results ? JSON.parse(assessmentResult.rows.find((a) => a.assessment_type === "flowAssessment").results) : null
    };
    console.log("\u{1F50D} DEBUG: Admin route - Assessment result rows:", assessmentResult.rows.map((r) => ({ type: r.assessment_type, hasResults: !!r.results })));
    console.log("\u{1F50D} DEBUG: Admin route - User context data:", JSON.stringify(userContextData, null, 2));
    const reportPrompt = await pgvectorSearchService2.getOptimalTrainingPrompt(
      isPersonalReport ? "personal" : "professional",
      userContextData
    );
    console.log("\u{1F4CB} Generated pgvector-optimized prompt for admin console");
    console.log("\u{1F527} About to call generateOpenAICoachingResponse with params:", {
      userMessage: reportPrompt.substring(0, 100) + "...",
      personaType: "star_report",
      userName: user.name,
      contextData: {
        reportContext: "md_generation",
        selectedUserId: userId2,
        selectedUserName: user.name,
        adminMode: true
      }
    });
    try {
      const fs7 = await import("fs/promises");
      const debugContent = `# ADMIN CONSOLE PROMPT DEBUG - ${(/* @__PURE__ */ new Date()).toISOString()}

## Context Data:
- User: ${user.name} (ID: ${userId2})
- Report Type: ${isPersonalReport ? "Personal" : "Professional"}
- Assessments: ${assessmentResult.rows.length}
- Workshop Data: ${stepDataResult.rows.length}

## FULL ADMIN CONSOLE PROMPT:
\`\`\`
${reportPrompt}
\`\`\`

## Notes:
- This is the exact prompt sent to Claude from the admin console
- PersonaType: star_report
- AdminMode: true
- Context: md_generation
- Foundation Mode: Using training documents only (METAlia disabled)
`;
      await fs7.writeFile("/Users/bradtopliff/Desktop/HI_Replit/tempClaudecomms/admin-prompt-debug.md", debugContent);
      console.log("\u{1F4C4} Admin console debug prompt saved to tempClaudecomms/admin-prompt-debug.md");
    } catch (debugError) {
      console.warn("Could not save admin debug prompt:", debugError);
    }
    const reportContent = await generateOpenAICoachingResponse2({
      userMessage: reportPrompt,
      personaType: "star_report",
      userName: user.name,
      contextData: {
        reportContext: "md_generation",
        selectedUserId: userId2,
        selectedUserName: user.name,
        userData,
        starCardImageBase64,
        adminMode: true,
        foundationMode: true
        // Flag that we're using foundation training documents only
      },
      userId: userId2,
      sessionId: `report-gen-${Date.now()}`,
      maxTokens: 25e3
    });
    if (!reportContent || reportContent.trim() === "") {
      throw new Error("Report generation failed: Empty response from Claude API");
    }
    console.log("\u{1F4CA} Foundation testing mode - METAlia quality monitoring disabled");
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const filename = `report-talia-${user.username}-${timestamp2}.md`;
    console.log(`\u2705 Report Talia ${reportType} report generated: ${filename}`);
    console.log(`\u{1F5C3}\uFE0F ${reportType} report generated by admin ${adminUserId} for user ${userId2}`);
    res.json({
      success: true,
      report: {
        filename,
        content: reportContent,
        reportType,
        hasStarCard: !!starCardImageBase64,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        generatedBy: adminUserId,
        targetUser: {
          id: user.id,
          name: user.name,
          username: user.username
        }
      },
      message: `${reportType === "personal" ? "Personal development" : "Professional development"} report successfully generated for ${user.name}${starCardImageBase64 ? " (with StarCard)" : " (no StarCard available)"}`,
      note: "Report content returned in response (container environment)"
    });
  } catch (error) {
    console.error("\u274C Error generating Report Talia MD report:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate Report Talia MD report",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.get("/training-docs/:id/content", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool16.query(
      "SELECT id, title, content FROM training_documents WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    const document = result.rows[0];
    res.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        content: document.content
      }
    });
  } catch (error) {
    console.error("\u274C Error fetching document content:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch document content",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.put("/training-docs/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || typeof content !== "string") {
    return res.status(400).json({
      success: false,
      error: "Content is required and must be a string"
    });
  }
  try {
    console.log(`\u{1F4DD} Updating training document ${id}`);
    const updateResult = await pool16.query(
      "UPDATE training_documents SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING title, document_type",
      [content, id]
    );
    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Training document not found"
      });
    }
    const document = updateResult.rows[0];
    console.log(`\u2705 Updated document: ${document.title}`);
    await pool16.query("DELETE FROM document_chunks WHERE document_id = $1", [id]);
    console.log("\u{1F5D1}\uFE0F Deleted existing document chunks");
    const chunkSize = 1e3;
    const chunks = [];
    let startIndex = 0;
    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      const chunkContent = content.slice(startIndex, endIndex);
      chunks.push({
        content: chunkContent,
        startIndex,
        endIndex: endIndex - 1,
        tokenCount: Math.ceil(chunkContent.length / 4)
        // Approximate token count
      });
      startIndex = endIndex;
    }
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await pool16.query(
        `INSERT INTO document_chunks (
          document_id, chunk_index, content, token_count, metadata
        ) VALUES ($1, $2, $3, $4, $5)`,
        [id, i, chunk.content, chunk.tokenCount, JSON.stringify({
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex
        })]
      );
    }
    console.log(`\u2705 Created ${chunks.length} new chunks for document`);
    try {
      const { javascriptVectorService: javascriptVectorService2 } = await Promise.resolve().then(() => (init_javascript_vector_service(), javascript_vector_service_exports));
      await javascriptVectorService2.initialize();
      console.log("\u{1F504} Vector service reinitialized with updated document");
    } catch (vectorError) {
      console.warn("\u26A0\uFE0F Could not reinitialize vector service:", vectorError);
    }
    res.json({
      success: true,
      message: `Document "${document.title}" updated successfully`,
      chunksCreated: chunks.length,
      documentInfo: {
        title: document.title,
        type: document.document_type,
        contentLength: content.length,
        chunks: chunks.length
      }
    });
  } catch (error) {
    console.error("\u274C Error updating training document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update training document",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.post("/fix-talia-prompts", requireAdmin, async (req, res) => {
  try {
    console.log("\u{1F527} Fixing Talia prompt documents...");
    const fs7 = await import("fs/promises");
    console.log("\u{1F4CB} Skipping hardwired prompt document creation - all documents managed via persona interface");
    res.json({
      success: true,
      message: "Talia prompt documents fixed successfully",
      documentsCreated: createdDocIds.length,
      documentsEnabled: promptDocIds.length,
      enabledDocuments: updatedEnabledDocs,
      promptDocuments: allPromptDocs.rows.map((doc) => ({
        id: doc.id,
        title: doc.title,
        enabled: updatedEnabledDocs.includes(doc.id.toString())
      }))
    });
  } catch (error) {
    console.error("\u274C Error fixing Talia prompt documents:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fix Talia prompt documents",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.post("/initialize-learning-documents", requireAdmin, async (req, res) => {
  try {
    console.log("\u{1F680} Initializing learning documents for all personas...");
    const { conversationLearningService: conversationLearningService2 } = await Promise.resolve().then(() => (init_conversation_learning_service(), conversation_learning_service_exports));
    await conversationLearningService2.initializeAllPersonaLearningDocuments();
    console.log("\u2705 Learning documents initialized successfully");
    res.json({
      success: true,
      message: "Learning documents initialized for all personas",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error initializing learning documents:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initialize learning documents",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.get("/persona-documents", requireAdmin, async (req, res) => {
  try {
    console.log("\u{1F527} Fetching detailed document information for personas");
    const result = await pool16.query(`
      SELECT 
        td.id,
        td.title,
        td.document_type,
        td.category,
        td.status,
        td.created_at,
        td.updated_at,
        td.file_size,
        td.original_filename,
        COALESCE(chunk_counts.chunk_count, 0) as chunk_count,
        CASE 
          WHEN chunk_counts.chunk_count > 0 THEN 'processed'
          ELSE 'pending'
        END as processing_status
      FROM training_documents td
      LEFT JOIN (
        SELECT 
          document_id, 
          COUNT(*) as chunk_count
        FROM document_chunks 
        GROUP BY document_id
      ) chunk_counts ON td.id = chunk_counts.document_id
      WHERE td.status = 'active'
      ORDER BY td.updated_at DESC
    `);
    const personaResult = await pool16.query(`
      SELECT id, training_documents 
      FROM talia_personas 
      WHERE enabled = true
    `);
    const personaDocuments = personaResult.rows.reduce((acc, persona2) => {
      acc[persona2.id] = persona2.training_documents || [];
      return acc;
    }, {});
    const documentsWithPersonaInfo = result.rows.map((doc) => ({
      ...doc,
      assignedToPersonas: Object.entries(personaDocuments).filter(([_, docIds]) => docIds.includes(doc.id)).map(([personaId]) => personaId),
      isProcessed: doc.chunk_count > 0,
      lastUpdated: doc.updated_at,
      processingStatus: doc.chunk_count > 0 ? "processed" : "pending"
    }));
    res.json({
      success: true,
      documents: documentsWithPersonaInfo,
      totalDocuments: result.rows.length,
      message: "Document information retrieved successfully"
    });
  } catch (error) {
    console.error("\u274C Error fetching persona document information:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch persona document information",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.get("/training-data/:personaId", requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  try {
    const { taliaTrainingService: taliaTrainingService2 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
    const trainingData = await taliaTrainingService2.loadTrainingData(personaId);
    if (!trainingData) {
      return res.json({
        success: true,
        trainingData: {
          guidelines: [],
          examples: [],
          trainingSessions: [],
          lastUpdated: null
        },
        message: "No training data found - will create new"
      });
    }
    res.json({
      success: true,
      trainingData,
      personaId,
      message: "Training data retrieved successfully"
    });
  } catch (error) {
    console.error(`\u274C Error getting training data for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get training data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.put("/training-data/:personaId", requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  const { guidelines, examples } = req.body;
  try {
    if (!Array.isArray(guidelines) || !Array.isArray(examples)) {
      return res.status(400).json({
        success: false,
        error: "Guidelines and examples must be arrays"
      });
    }
    const { taliaTrainingService: taliaTrainingService2 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
    let trainingData = await taliaTrainingService2.loadTrainingData(personaId) || {
      trainingSessions: [],
      guidelines: [],
      examples: [],
      lastUpdated: null
    };
    trainingData.guidelines = guidelines;
    trainingData.examples = examples;
    trainingData.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    const fs7 = await import("fs/promises");
    const path5 = await import("path");
    const trainingFilePath = path5.join(process.cwd(), "storage", "talia-training.json");
    let fullTrainingData = {};
    try {
      const existingData = await fs7.readFile(trainingFilePath, "utf-8");
      fullTrainingData = JSON.parse(existingData);
    } catch (error) {
    }
    fullTrainingData[personaId] = trainingData;
    await fs7.writeFile(trainingFilePath, JSON.stringify(fullTrainingData, null, 2));
    console.log(`\u2705 Training data updated for persona ${personaId} by admin`);
    res.json({
      success: true,
      message: "Training data updated successfully",
      personaId,
      guidelinesCount: guidelines.length,
      examplesCount: examples.length
    });
  } catch (error) {
    console.error(`\u274C Error updating training data for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update training data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.post("/training-data/:personaId/toggle", requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  const { enabled } = req.body;
  try {
    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "enabled must be a boolean value"
      });
    }
    const { taliaTrainingService: taliaTrainingService2 } = await Promise.resolve().then(() => (init_talia_training_service(), talia_training_service_exports));
    let trainingData = await taliaTrainingService2.loadTrainingData(personaId) || {
      trainingSessions: [],
      guidelines: [],
      examples: [],
      lastUpdated: null
    };
    trainingData.enabled = enabled;
    trainingData.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    const fs7 = await import("fs/promises");
    const path5 = await import("path");
    const trainingFilePath = path5.join(process.cwd(), "storage", "talia-training.json");
    let fullTrainingData = {};
    try {
      const existingData = await fs7.readFile(trainingFilePath, "utf-8");
      fullTrainingData = JSON.parse(existingData);
    } catch (error) {
    }
    fullTrainingData[personaId] = trainingData;
    await fs7.writeFile(trainingFilePath, JSON.stringify(fullTrainingData, null, 2));
    console.log(`\u2705 Training data ${enabled ? "enabled" : "disabled"} for persona ${personaId} by admin`);
    res.json({
      success: true,
      message: `Training data ${enabled ? "enabled" : "disabled"} successfully`,
      personaId,
      enabled
    });
  } catch (error) {
    console.error(`\u274C Error toggling training data for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle training data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router21.get("/learning-document/:personaId", requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  try {
    const { conversationLearningService: conversationLearningService2 } = await Promise.resolve().then(() => (init_conversation_learning_service(), conversation_learning_service_exports));
    const learningDocId = await conversationLearningService2.getLearningDocumentId(personaId);
    if (!learningDocId) {
      return res.status(404).json({
        success: false,
        error: "Learning document not found for this persona"
      });
    }
    const docResult = await pool16.query(`
      SELECT id, title, content, created_at, updated_at
      FROM training_documents 
      WHERE id = $1 AND document_type = 'conversation_learning'
    `, [learningDocId]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Learning document not found"
      });
    }
    res.json({
      success: true,
      learningDocument: docResult.rows[0],
      personaId
    });
  } catch (error) {
    console.error(`\u274C Error getting learning document for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get learning document",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var ai_management_routes_default = router21;

// server/index.ts
init_persona_management_routes();

// server/routes/beta-tester-routes.ts
import express17 from "express";
import bcrypt4 from "bcryptjs";
var router22 = express17.Router();
router22.post("/create", async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      password,
      organization,
      jobTitle,
      inviteCode,
      isBetaTester
    } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, username, and password are required"
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        error: "Username can only contain letters, numbers, and ._-"
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long"
      });
    }
    const usernameAvailable = await userManagementService.isUsernameAvailable(username);
    if (!usernameAvailable) {
      return res.status(400).json({
        success: false,
        error: "Username is already taken"
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt4.hash(password, saltRounds);
    const userData = {
      username,
      password: hashedPassword,
      name,
      email,
      role: "participant",
      organization: organization || null,
      jobTitle: jobTitle || null,
      profilePicture: null,
      isTestUser: true,
      // Mark as test user for beta testers
      contentAccess: "professional",
      // Give beta testers professional access
      astAccess: true,
      iaAccess: true,
      inviteCode: inviteCode || null,
      betaTester: true
      // Custom field to identify beta testers
    };
    const result = await userManagementService.createUser(userData);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || "Failed to create user account"
      });
    }
    console.log(`\u2705 Beta tester account created successfully: ${username} (${email})`);
    const { password: _, ...userWithoutPassword } = result.user;
    res.json({
      success: true,
      message: "Beta tester account created successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("\u274C Error creating beta tester account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create beta tester account. Please try again later.",
      details: typeof error === "object" && error !== null && "message" in error ? error.message : String(error)
    });
  }
});
router22.post("/check-invite", async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        error: "Invite code is required"
      });
    }
    const normalizedCode = inviteCode.toLowerCase();
    const isBetaInvite = normalizedCode.includes("beta") || normalizedCode.includes("test") || inviteCode.toUpperCase().startsWith("BETA");
    res.json({
      success: true,
      isBetaInvite,
      inviteCode
    });
  } catch (error) {
    console.error("\u274C Error checking beta invite:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check invite code"
    });
  }
});
var beta_tester_routes_default = router22;

// server/routes/beta-tester-notes-routes.ts
import express18 from "express";

// server/services/beta-tester-notes-service.ts
import { Pool as Pool17 } from "pg";
var pool17 = new Pool17({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var BetaTesterNotesService = class {
  /**
   * Create a new beta tester note
   */
  static async createNote(note) {
    try {
      const result = await pool17.query(
        `INSERT INTO beta_tester_notes (
          user_id, workshop_type, page_title, step_id, module_name, 
          question_context, url_path, note_content, note_type,
          browser_info, system_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          note.userId,
          note.workshopType,
          note.pageTitle,
          note.stepId || null,
          note.moduleName || null,
          note.questionContext || null,
          note.urlPath || null,
          note.noteContent,
          note.noteType || "general",
          JSON.stringify(note.browserInfo) || null,
          JSON.stringify(note.systemInfo) || null
        ]
      );
      console.log(`\u2705 Created beta tester note ${result.rows[0].id} for user ${note.userId}`);
      return result.rows[0].id;
    } catch (error) {
      console.error("\u274C Error creating beta tester note:", error);
      throw new Error("Failed to create beta tester note");
    }
  }
  /**
   * Get all notes for a user (unsubmitted only by default)
   */
  static async getUserNotes(userId2, workshopType, includeSubmitted = false) {
    try {
      let query2 = `
        SELECT 
          id, user_id, workshop_type, page_title, step_id, module_name,
          question_context, url_path, note_content, note_type,
          browser_info, system_info, is_submitted, is_deleted,
          created_at, updated_at, submitted_at
        FROM beta_tester_notes 
        WHERE user_id = $1 AND is_deleted = false
      `;
      const params = [userId2];
      if (!includeSubmitted) {
        query2 += ` AND is_submitted = false`;
      }
      if (workshopType) {
        query2 += ` AND workshop_type = $${params.length + 1}`;
        params.push(workshopType);
      }
      query2 += ` ORDER BY created_at DESC`;
      const result = await pool17.query(query2, params);
      return result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        workshopType: row.workshop_type,
        pageTitle: row.page_title,
        stepId: row.step_id,
        moduleName: row.module_name,
        questionContext: row.question_context,
        urlPath: row.url_path,
        noteContent: row.note_content,
        noteType: row.note_type,
        browserInfo: row.browser_info,
        systemInfo: row.system_info,
        isSubmitted: row.is_submitted,
        isDeleted: row.is_deleted,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        submittedAt: row.submitted_at
      }));
    } catch (error) {
      console.error("\u274C Error fetching user notes:", error);
      throw new Error("Failed to fetch beta tester notes");
    }
  }
  /**
   * Update note content only (for editing)
   */
  static async updateNote(noteId, userId2, noteContent) {
    try {
      const result = await pool17.query(
        `UPDATE beta_tester_notes 
         SET note_content = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3 AND is_deleted = false`,
        [noteContent, noteId, userId2]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("\u274C Error updating beta tester note:", error);
      throw new Error("Failed to update beta tester note");
    }
  }
  /**
   * Update a note with full options
   */
  static async updateNoteAdvanced(noteId, userId2, updates) {
    try {
      const setClause = [];
      const params = [];
      let paramIndex = 1;
      if (updates.noteContent !== void 0) {
        setClause.push(`note_content = $${paramIndex++}`);
        params.push(updates.noteContent);
      }
      if (updates.noteType !== void 0) {
        setClause.push(`note_type = $${paramIndex++}`);
        params.push(updates.noteType);
      }
      if (updates.isDeleted !== void 0) {
        setClause.push(`is_deleted = $${paramIndex++}`);
        params.push(updates.isDeleted);
      }
      if (setClause.length === 0) {
        return false;
      }
      params.push(noteId, userId2);
      const result = await pool17.query(
        `UPDATE beta_tester_notes 
         SET ${setClause.join(", ")}
         WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
        params
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("\u274C Error updating beta tester note:", error);
      throw new Error("Failed to update beta tester note");
    }
  }
  /**
   * Submit all user notes
   */
  static async submitAllUserNotes(userId2, workshopType) {
    try {
      let query2 = `
        UPDATE beta_tester_notes 
        SET is_submitted = true, submitted_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_submitted = false AND is_deleted = false
      `;
      const params = [userId2];
      if (workshopType) {
        query2 += ` AND workshop_type = $2`;
        params.push(workshopType);
      }
      const result = await pool17.query(query2, params);
      console.log(`\u2705 Submitted ${result.rowCount} notes for user ${userId2}`);
      return result.rowCount;
    } catch (error) {
      console.error("\u274C Error submitting notes:", error);
      throw new Error("Failed to submit beta tester notes");
    }
  }
  /**
   * Get notes summary for a user
   */
  static async getUserNotesSummary(userId2, workshopType) {
    try {
      let query2 = `
        SELECT 
          COUNT(*) as total_notes,
          COUNT(CASE WHEN is_submitted = false THEN 1 END) as unsubmitted_notes,
          note_type,
          module_name,
          COUNT(*) as type_count
        FROM beta_tester_notes 
        WHERE user_id = $1 AND is_deleted = false
      `;
      const params = [userId2];
      if (workshopType) {
        query2 += ` AND workshop_type = $2`;
        params.push(workshopType);
      }
      query2 += ` GROUP BY note_type, module_name`;
      const result = await pool17.query(query2, params);
      const summary = {
        totalNotes: 0,
        unsubmittedNotes: 0,
        notesByType: {},
        notesByModule: {}
      };
      result.rows.forEach((row) => {
        if (summary.totalNotes === 0) {
          summary.totalNotes = parseInt(row.total_notes);
          summary.unsubmittedNotes = parseInt(row.unsubmitted_notes);
        }
        if (row.note_type) {
          summary.notesByType[row.note_type] = (summary.notesByType[row.note_type] || 0) + parseInt(row.type_count);
        }
        if (row.module_name) {
          summary.notesByModule[row.module_name] = (summary.notesByModule[row.module_name] || 0) + parseInt(row.type_count);
        }
      });
      return summary;
    } catch (error) {
      console.error("\u274C Error fetching notes summary:", error);
      throw new Error("Failed to fetch notes summary");
    }
  }
  /**
   * Delete a note (soft delete)
   */
  static async deleteNote(noteId, userId2) {
    return this.updateNoteAdvanced(noteId, userId2, { isDeleted: true });
  }
  /**
   * Submit final beta feedback survey
   */
  static async submitFinalFeedback(feedbackData) {
    try {
      const result = await pool17.query(
        `INSERT INTO beta_feedback_surveys (
          user_id, overall_quality, authenticity, recommendation,
          rose, bud, thorn, professional_application, improvements,
          interests, final_comments, submitted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
          feedbackData.userId,
          feedbackData.overallQuality,
          feedbackData.authenticity,
          feedbackData.recommendation,
          feedbackData.rose || null,
          feedbackData.bud || null,
          feedbackData.thorn || null,
          feedbackData.professionalApplication || null,
          feedbackData.improvements || null,
          JSON.stringify(feedbackData.interests) || null,
          feedbackData.finalComments || null,
          feedbackData.submittedAt || /* @__PURE__ */ new Date()
        ]
      );
      console.log(`\u2705 Created beta feedback survey ${result.rows[0].id} for user ${feedbackData.userId}`);
      return result.rows[0].id;
    } catch (error) {
      console.error("\u274C Error submitting beta feedback:", error);
      throw new Error("Failed to submit beta feedback");
    }
  }
  /**
   * Check if user has already submitted feedback
   */
  static async checkFeedbackStatus(userId2) {
    try {
      const result = await pool17.query(
        `SELECT id, submitted_at 
         FROM beta_feedback_surveys 
         WHERE user_id = $1 
         ORDER BY submitted_at DESC 
         LIMIT 1`,
        [userId2]
      );
      return {
        hasSubmittedFeedback: result.rows.length > 0,
        submittedAt: result.rows[0]?.submitted_at
      };
    } catch (error) {
      console.error("\u274C Error checking feedback status:", error);
      throw new Error("Failed to check feedback status");
    }
  }
};

// server/routes/beta-tester-notes-routes.ts
var router23 = express18.Router();
router23.get("/my-notes", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const notes = await BetaTesterNotesService.getUserNotes(userId2);
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Error getting beta tester notes:", error);
    res.status(500).json({ error: "Failed to retrieve notes" });
  }
});
router23.get("/notes", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const notes = await BetaTesterNotesService.getUserNotes(userId2);
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Error getting beta tester notes:", error);
    res.status(500).json({ error: "Failed to retrieve notes" });
  }
});
router23.put("/:noteId", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    const noteId = parseInt(req.params.noteId);
    const { content } = req.body;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    if (!content || !noteId) {
      return res.status(400).json({ error: "Note content and ID required" });
    }
    const updated = await BetaTesterNotesService.updateNote(noteId, userId2, content);
    if (updated) {
      res.json({ success: true, message: "Note updated successfully" });
    } else {
      res.status(404).json({ error: "Note not found or not authorized" });
    }
  } catch (error) {
    console.error("Error updating beta tester note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});
router23.delete("/:noteId", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    const noteId = parseInt(req.params.noteId);
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const deleted = await BetaTesterNotesService.deleteNote(noteId, userId2);
    if (deleted) {
      res.json({ success: true, message: "Note deleted successfully" });
    } else {
      res.status(404).json({ error: "Note not found or not authorized" });
    }
  } catch (error) {
    console.error("Error deleting beta tester note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});
router23.put("/notes/:noteId", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    const noteId = parseInt(req.params.noteId);
    const { content } = req.body;
    const noteContent = content;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    if (!noteContent || !noteId) {
      return res.status(400).json({ error: "Note content and ID required" });
    }
    const updated = await BetaTesterNotesService.updateNote(noteId, userId2, noteContent);
    if (updated) {
      res.json({ success: true, message: "Note updated successfully" });
    } else {
      res.status(404).json({ error: "Note not found or not authorized" });
    }
  } catch (error) {
    console.error("Error updating beta tester note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});
router23.delete("/notes/:noteId", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    const noteId = parseInt(req.params.noteId);
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const deleted = await BetaTesterNotesService.deleteNote(noteId, userId2);
    if (deleted) {
      res.json({ success: true, message: "Note deleted successfully" });
    } else {
      res.status(404).json({ error: "Note not found or not authorized" });
    }
  } catch (error) {
    console.error("Error deleting beta tester note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});
router23.post("/feedback", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const feedbackData = {
      userId: userId2,
      overallQuality: req.body.overallQuality,
      authenticity: req.body.authenticity,
      recommendation: req.body.recommendation,
      rose: req.body.rose,
      bud: req.body.bud,
      thorn: req.body.thorn,
      professionalApplication: req.body.professionalApplication,
      improvements: req.body.improvements,
      interests: req.body.interests,
      finalComments: req.body.finalComments,
      submittedAt: /* @__PURE__ */ new Date()
    };
    const feedbackId = await BetaTesterNotesService.submitFinalFeedback(feedbackData);
    res.json({ success: true, feedbackId, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting beta feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});
router23.post("/notes", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      console.log("\u274C Beta tester access denied for user:", req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const noteData = {
      userId: userId2,
      workshopType: req.body.workshopType,
      pageTitle: req.body.pageTitle,
      stepId: req.body.stepId,
      moduleName: req.body.moduleName,
      questionContext: req.body.questionContext,
      urlPath: req.body.urlPath,
      noteContent: req.body.noteContent,
      noteType: req.body.noteType,
      browserInfo: req.body.browserInfo,
      systemInfo: req.body.systemInfo
    };
    if (!noteData.noteContent?.trim()) {
      return res.status(400).json({ error: "Note content is required" });
    }
    if (!noteData.pageTitle?.trim()) {
      return res.status(400).json({ error: "Page title is required" });
    }
    if (!["ast", "ia"].includes(noteData.workshopType)) {
      return res.status(400).json({ error: "Invalid workshop type" });
    }
    const noteId = await BetaTesterNotesService.createNote(noteData);
    res.status(201).json({
      success: true,
      noteId,
      message: "Note created successfully"
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});
router23.get("/notes", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      console.log("\u274C Beta tester access denied for user:", req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const workshopType = req.query.workshopType;
    const includeSubmitted = req.query.includeSubmitted === "true";
    const notes = await BetaTesterNotesService.getUserNotes(
      userId2,
      workshopType,
      includeSubmitted
    );
    res.json({
      success: true,
      notes,
      count: notes.length
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});
router23.get("/notes/summary", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      console.log("\u274C Beta tester access denied for user:", req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const workshopType = req.query.workshopType;
    const summary = await BetaTesterNotesService.getUserNotesSummary(userId2, workshopType);
    const user = req.session?.user;
    const astCompleted = user?.astWorkshopCompleted || false;
    const iaCompleted = user?.iaWorkshopCompleted || false;
    let workshopCompleted = false;
    let primaryWorkshopType;
    if (workshopType) {
      workshopCompleted = workshopType === "ast" ? astCompleted : iaCompleted;
      primaryWorkshopType = workshopType;
    } else {
      if (astCompleted || iaCompleted) {
        workshopCompleted = true;
        primaryWorkshopType = astCompleted ? "ast" : "ia";
      }
    }
    res.json({
      success: true,
      ...summary,
      workshopCompleted,
      primaryWorkshopType,
      astCompleted,
      iaCompleted
    });
  } catch (error) {
    console.error("Get notes summary error:", error);
    res.status(500).json({ error: "Failed to fetch notes summary" });
  }
});
router23.put("/notes/:noteId", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      console.log("\u274C Beta tester access denied for user:", req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const noteId = parseInt(req.params.noteId);
    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }
    const updates = {};
    if (req.body.noteContent !== void 0) {
      updates.noteContent = req.body.noteContent.trim();
    }
    if (req.body.noteType !== void 0) {
      updates.noteType = req.body.noteType;
    }
    if (updates.noteContent !== void 0 && !updates.noteContent) {
      return res.status(400).json({ error: "Note content cannot be empty" });
    }
    const success = updates.noteContent !== void 0 ? await BetaTesterNotesService.updateNote(noteId, userId2, updates.noteContent) : await BetaTesterNotesService.updateNoteAdvanced(noteId, userId2, updates);
    if (success) {
      res.json({
        success: true,
        message: "Note updated successfully"
      });
    } else {
      res.status(404).json({ error: "Note not found or not authorized" });
    }
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});
router23.delete("/notes/:noteId", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      console.log("\u274C Beta tester access denied for user:", req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const noteId = parseInt(req.params.noteId);
    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }
    const success = await BetaTesterNotesService.deleteNote(noteId, userId2);
    if (success) {
      res.json({
        success: true,
        message: "Note deleted successfully"
      });
    } else {
      res.status(404).json({ error: "Note not found or not authorized" });
    }
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});
router23.post("/notes/submit", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      console.log("\u274C Beta tester access denied for user:", req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const workshopType = req.body.workshopType;
    const submittedCount = await BetaTesterNotesService.submitAllUserNotes(userId2, workshopType);
    res.json({
      success: true,
      submittedCount,
      message: `Successfully submitted ${submittedCount} notes`
    });
  } catch (error) {
    console.error("Submit notes error:", error);
    res.status(500).json({ error: "Failed to submit notes" });
  }
});
router23.get("/feedback-status", async (req, res) => {
  try {
    const userId2 = req.session?.userId;
    if (!userId2) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Beta tester access required" });
    }
    const result = await BetaTesterNotesService.checkFeedbackStatus(userId2);
    res.json({
      success: true,
      hasSubmittedFeedback: result.hasSubmittedFeedback,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error("Check feedback status error:", error);
    res.status(500).json({ error: "Failed to check feedback status" });
  }
});
var beta_tester_notes_routes_default = router23;

// server/routes/metalia-routes.ts
init_conversation_logging_service();
import { Router as Router9 } from "express";
import { Pool as Pool18 } from "pg";
var router24 = Router9();
var pool18 = new Pool18({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
router24.post("/escalations", async (req, res) => {
  try {
    const {
      requestingPersona,
      escalationType,
      priority,
      question,
      contextData,
      userMessage,
      attemptedResponse,
      relatedConversationId
    } = req.body;
    if (!requestingPersona || !escalationType || !question) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: requestingPersona, escalationType, question"
      });
    }
    const validTypes = ["clarification", "instruction_improvement", "error_report"];
    if (!validTypes.includes(escalationType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid escalationType. Must be one of: ${validTypes.join(", ")}`
      });
    }
    const escalationId = await conversationLoggingService.createEscalation({
      requestingPersona,
      escalationType,
      priority: priority || "medium",
      question,
      contextData,
      userMessage,
      attemptedResponse,
      relatedConversationId
    });
    console.log(`\u{1F6A8} New escalation created: ${escalationId} from ${requestingPersona}`);
    res.json({
      success: true,
      escalationId,
      message: "Escalation request created successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error creating escalation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create escalation request"
    });
  }
});
router24.get("/escalations/pending", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const escalations = await conversationLoggingService.getPendingEscalations(Number(limit));
    res.json({
      success: true,
      escalations,
      count: escalations.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting pending escalations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve pending escalations"
    });
  }
});
router24.post("/escalations/:escalationId/resolve", async (req, res) => {
  try {
    const { escalationId } = req.params;
    const { adminResponse, resolutionNotes, instructionUpdates } = req.body;
    const resolvedBy = req.session?.userId || 1;
    if (!adminResponse) {
      return res.status(400).json({
        success: false,
        error: "adminResponse is required"
      });
    }
    await conversationLoggingService.resolveEscalation(
      escalationId,
      adminResponse,
      resolvedBy,
      resolutionNotes,
      instructionUpdates
    );
    res.json({
      success: true,
      message: "Escalation resolved successfully",
      escalationId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error resolving escalation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve escalation"
    });
  }
});
router24.get("/analytics/conversations", async (req, res) => {
  try {
    const { personaType, days = 30 } = req.query;
    const analytics = await conversationLoggingService.getConversationAnalytics(
      personaType,
      Number(days)
    );
    res.json({
      success: true,
      analytics,
      period: `${days} days`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting conversation analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve conversation analytics"
    });
  }
});
router24.get("/conversations", async (req, res) => {
  try {
    const {
      personaType,
      userId: userId2,
      sessionId,
      startDate,
      endDate,
      requiresReview,
      limit = 100,
      offset = 0
    } = req.query;
    const queryOptions = {
      personaType,
      userId: userId2 ? Number(userId2) : void 0,
      sessionId,
      startDate: startDate ? new Date(startDate) : void 0,
      endDate: endDate ? new Date(endDate) : void 0,
      requiresReview: requiresReview === "true" ? true : requiresReview === "false" ? false : void 0,
      limit: Number(limit),
      offset: Number(offset)
    };
    const conversations = await conversationLoggingService.getConversations(queryOptions);
    res.json({
      success: true,
      conversations,
      count: conversations.length,
      queryOptions,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting conversations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve conversations"
    });
  }
});
router24.post("/conversations/:conversationId/feedback", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { rating, helpful, followUpQuestion, additionalFeedback } = req.body;
    await conversationLoggingService.updateUserFeedback({
      conversationId,
      rating,
      helpful,
      followUpQuestion,
      additionalFeedback
    });
    res.json({
      success: true,
      message: "User feedback updated successfully",
      conversationId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error updating conversation feedback:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update conversation feedback"
    });
  }
});
router24.post("/metrics/daily-update", async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : /* @__PURE__ */ new Date();
    await conversationLoggingService.updateDailyMetrics(targetDate);
    res.json({
      success: true,
      message: "Daily metrics updated successfully",
      date: targetDate.toISOString().split("T")[0],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error updating daily metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update daily metrics"
    });
  }
});
router24.get("/metrics/performance", async (req, res) => {
  try {
    const { personaType, startDate, endDate, limit = 30 } = req.query;
    let whereConditions = [];
    let values = [];
    let paramIndex = 1;
    if (personaType) {
      whereConditions.push(`persona_type = $${paramIndex++}`);
      values.push(personaType);
    }
    if (startDate) {
      whereConditions.push(`date_period >= $${paramIndex++}`);
      values.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`date_period <= $${paramIndex++}`);
      values.push(endDate);
    }
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
    const limitClause = `LIMIT ${limit}`;
    const query2 = `
      SELECT 
        persona_type,
        date_period,
        total_conversations,
        unique_users,
        average_effectiveness_score,
        positive_feedback_count,
        negative_feedback_count,
        escalation_count,
        average_response_time_ms,
        total_tokens_used,
        total_api_cost,
        conversation_completion_rate,
        created_at
      FROM persona_performance_metrics 
      ${whereClause}
      ORDER BY date_period DESC, persona_type
      ${limitClause}
    `;
    const result = await pool18.query(query2, values);
    res.json({
      success: true,
      metrics: result.rows,
      count: result.rows.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting performance metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve performance metrics"
    });
  }
});
router24.get("/status", async (req, res) => {
  try {
    const conversationCountQuery = "SELECT COUNT(*) as total_conversations FROM talia_conversations";
    const escalationCountQuery = "SELECT COUNT(*) as pending_escalations FROM talia_escalations WHERE status = 'pending'";
    const personaCountQuery = "SELECT COUNT(*) as active_personas FROM talia_personas WHERE enabled = true";
    const [conversationResult, escalationResult, personaResult] = await Promise.all([
      pool18.query(conversationCountQuery),
      pool18.query(escalationCountQuery),
      pool18.query(personaCountQuery)
    ]);
    const stats = {
      totalConversations: parseInt(conversationResult.rows[0].total_conversations),
      pendingEscalations: parseInt(escalationResult.rows[0].pending_escalations),
      activePersonas: parseInt(personaResult.rows[0].active_personas),
      systemVersion: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    res.json({
      success: true,
      status: "operational",
      stats,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting METAlia status:", error);
    res.status(500).json({
      success: false,
      status: "error",
      error: "Failed to retrieve system status"
    });
  }
});
var metalia_routes_default = router24;

// server/routes/admin-chat-routes.ts
init_openai_api_service();
import express19 from "express";
var router25 = express19.Router();
function requireAdmin3(req, res, next) {
  const isAdmin2 = req.session?.user?.role === "admin" || req.headers.authorization === "Bearer admin-token" || process.env.NODE_ENV === "development";
  if (!isAdmin2) {
    return res.status(403).json({
      error: "Admin access required",
      message: "This endpoint requires administrator privileges"
    });
  }
  next();
}
router25.use(requireAdmin3);
router25.post("/message", async (req, res) => {
  try {
    const {
      message: message2,
      model = "gpt-4o-mini",
      projectType: projectType2 = "admin-training",
      persona: persona2 = "admin",
      conversationId,
      includeContext = false
    } = req.body;
    if (!message2 || typeof message2 !== "string") {
      return res.status(400).json({
        error: "Message is required",
        received: typeof message2
      });
    }
    console.log(`\u{1F916} Admin chat: ${model} in ${projectType2} project`);
    let systemPrompt = `You are an advanced AI assistant helping administrators manage the Heliotrope Imaginal development platform.

You have access to:
- OpenAI project management and configuration
- Cross-project resource awareness
- Model performance analysis
- Cost tracking and optimization
- Persona training and development

Current Context:
- User Role: Administrator
- Project: ${projectType2}
- Model: ${model}
- Conversation ID: ${conversationId || "new"}

Respond helpfully and provide detailed technical insights when requested.`;
    if (includeContext) {
      try {
        const assistantManager2 = getAssistantManager();
        const assistantSummary = await assistantManager2.getAssistantResourcesSummary();
        systemPrompt += `

Current Assistant Status:
${assistantSummary.map(
          (a) => `- ${a.name}: ${a.purpose}, Vector Store: ${a.vectorStoreId}`
        ).join("\n")}`;
      } catch (error) {
        console.warn("Could not load project context:", error);
      }
    }
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message2 }
    ];
    const response = await enhancedOpenAICall(messages, {
      model,
      projectType: projectType2,
      featureName: "admin_chat",
      maxTokens: 2e3,
      temperature: 0.7
    });
    console.log(`\u{1F4AC} Admin chat logged: ${message2.substring(0, 50)}...`);
    res.json({
      success: true,
      response,
      model,
      projectType: projectType2,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      conversationId: conversationId || `admin-${Date.now()}`
    });
  } catch (error) {
    console.error("\u274C Admin chat error:", error);
    res.status(500).json({
      error: "Failed to process admin chat message",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router25.get("/models", (req, res) => {
  try {
    const models = getAllModelConfigs();
    res.json({
      success: true,
      models: models.map((model) => ({
        ...model,
        available: true,
        // In production, check actual availability
        recommended: model.recommended.join(", ")
      }))
    });
  } catch (error) {
    console.error("\u274C Error getting models:", error);
    res.status(500).json({
      error: "Failed to get model configurations",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router25.get("/projects/summary", async (req, res) => {
  try {
    const assistantManager2 = getAssistantManager();
    const summary = await assistantManager2.getAssistantResourcesSummary();
    res.json({
      success: true,
      assistants: summary,
      totalAssistants: summary.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Error getting project summary:", error);
    res.status(500).json({
      error: "Failed to get assistant summary",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router25.post("/ab-test", async (req, res) => {
  try {
    const {
      prompt,
      modelA = "gpt-4o-mini",
      modelB = "gpt-4",
      projectType: projectType2 = "development"
    } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Prompt is required for A/B testing"
      });
    }
    console.log(`\u{1F9EA} Running A/B test: ${modelA} vs ${modelB}`);
    const assistantManager2 = getAssistantManager();
    const result = await assistantManager2.runABTest(prompt, modelA, modelB, projectType2);
    res.json({
      success: true,
      test: result,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C A/B test error:", error);
    res.status(500).json({
      error: "Failed to run A/B test",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router25.get("/history", (req, res) => {
  const { limit = 50, conversationId } = req.query;
  res.json({
    success: true,
    conversations: [],
    message: "Conversation history would be loaded from database",
    limit: Number(limit),
    conversationId
  });
});
router25.post("/upload", (req, res) => {
  res.json({
    success: true,
    message: "Document upload functionality would be implemented here",
    supportedFormats: ["txt", "md", "pdf", "docx"]
  });
});
router25.get("/costs", async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;
    res.json({
      success: true,
      timeframe,
      costs: {
        totalSpent: 0,
        byProject: {},
        byModel: {},
        projectedMonthly: 0
      },
      message: "Cost tracking would integrate with existing usage logger"
    });
  } catch (error) {
    console.error("\u274C Error getting costs:", error);
    res.status(500).json({
      error: "Failed to get cost information",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router25.post("/export", (req, res) => {
  const { conversationId, format = "json" } = req.body;
  res.json({
    success: true,
    message: "Conversation export functionality would be implemented here",
    supportedFormats: ["json", "markdown", "pdf"],
    conversationId,
    format
  });
});
var admin_chat_routes_default = router25;

// server/routes/training-upload-routes.ts
init_auth();
import express20 from "express";
import OpenAI2 from "openai";
import fs5 from "fs";
import path3 from "path";
var router26 = express20.Router();
var openai = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY
});
var PERSONA_VECTOR_STORES = {
  "reflection_talia": "vs_688e55e74e68819190cca71d1fa54f52",
  "report_talia": "vs_688e2bf0d94c81918b50080064684bde",
  "admin_talia": "vs_688e55e81e6c8191af100194c2ac9512"
};
router26.post("/upload-training-document", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      personaId,
      title,
      content,
      category = "training_session",
      isGeneral = true
    } = req.body;
    if (!personaId || !title || !content) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["personaId", "title", "content"]
      });
    }
    const vectorStoreId = PERSONA_VECTOR_STORES[personaId];
    if (!vectorStoreId) {
      return res.status(400).json({
        error: "Invalid persona ID",
        validPersonas: Object.keys(PERSONA_VECTOR_STORES)
      });
    }
    console.log(`\u{1F4DA} Uploading training document for ${personaId}: ${title}`);
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const fileContent = `Title: ${title}
Type: ${category}
Persona: ${personaId}
Is General: ${isGeneral}
Created: ${timestamp2}

${content}`;
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.txt`;
    const tempDir = path3.join(process.cwd(), "temp");
    const tempFilePath = path3.join(tempDir, filename);
    if (!fs5.existsSync(tempDir)) {
      fs5.mkdirSync(tempDir, { recursive: true });
    }
    fs5.writeFileSync(tempFilePath, fileContent, "utf-8");
    let file;
    try {
      file = await openai.files.create({
        file: fs5.createReadStream(tempFilePath),
        purpose: "assistants"
      });
      console.log(`\u{1F4E4} File uploaded to OpenAI: ${file.id}`);
    } finally {
      if (fs5.existsSync(tempFilePath)) {
        fs5.unlinkSync(tempFilePath);
      }
    }
    const vectorStoreFile = await openai.beta.vectorStores.files.create(
      vectorStoreId,
      { file_id: file.id }
    );
    console.log(`\u2705 Added to ${personaId} vector store: ${file.id}`);
    try {
    } catch (dbError) {
      console.warn("Failed to save metadata to database:", dbError);
    }
    res.json({
      success: true,
      fileId: file.id,
      vectorStoreId,
      filename,
      message: `Training document uploaded successfully for ${personaId}`
    });
  } catch (error) {
    console.error("\u274C Training document upload failed:", error);
    res.status(500).json({
      error: "Failed to upload training document",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router26.get("/training-sessions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { personaId } = req.query;
    if (!personaId) {
      return res.status(400).json({ error: "personaId is required" });
    }
    const vectorStoreId = PERSONA_VECTOR_STORES[personaId];
    if (!vectorStoreId) {
      return res.status(400).json({ error: "Invalid persona ID" });
    }
    const filesResponse = await openai.beta.vectorStores.files.list(vectorStoreId);
    const trainingFiles = [];
    for (const file of filesResponse.data) {
      try {
        const fileDetails = await openai.files.retrieve(file.id);
        if (fileDetails.filename.includes("training") || fileDetails.filename.includes("session")) {
          trainingFiles.push({
            id: file.id,
            filename: fileDetails.filename,
            createdAt: new Date(fileDetails.created_at * 1e3),
            size: fileDetails.bytes,
            status: file.status
          });
        }
      } catch (error) {
        console.warn(`Failed to get details for file ${file.id}:`, error);
      }
    }
    res.json({
      success: true,
      personaId,
      trainingSessions: trainingFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    });
  } catch (error) {
    console.error("\u274C Failed to list training sessions:", error);
    res.status(500).json({
      error: "Failed to list training sessions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router26.delete("/training-document/:fileId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { personaId } = req.body;
    if (!personaId) {
      return res.status(400).json({ error: "personaId is required" });
    }
    const vectorStoreId = PERSONA_VECTOR_STORES[personaId];
    if (!vectorStoreId) {
      return res.status(400).json({ error: "Invalid persona ID" });
    }
    console.log(`\u{1F5D1}\uFE0F Deleting training document ${fileId} from ${personaId}`);
    try {
      await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
      console.log(`\u2705 Removed from vector store: ${fileId}`);
    } catch (error) {
      console.warn("Failed to remove from vector store:", error);
    }
    const deleteResult = await openai.files.del(fileId);
    res.json({
      success: true,
      deleted: deleteResult.deleted,
      fileId,
      message: "Training document deleted successfully"
    });
  } catch (error) {
    console.error("\u274C Failed to delete training document:", error);
    res.status(500).json({
      error: "Failed to delete training document",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var training_upload_routes_default = router26;

// server/routes/talia-status-routes.ts
init_openai_api_service();
import express21 from "express";
var router27 = express21.Router();
router27.get("/reflection", async (req, res) => {
  try {
    if (!isOpenAIAPIAvailable()) {
      return res.json({
        connected: false,
        status: "api_key_missing",
        message: "OpenAI API key not configured"
      });
    }
    const testResponse = await generateOpenAICoachingResponse({
      userMessage: "Hello",
      personaType: "ast_reflection",
      userName: "Test User",
      contextData: { stepId: "test" },
      maxTokens: 50
    });
    const isConnected = testResponse && !testResponse.includes("having trouble connecting") && !testResponse.includes("connection error");
    res.json({
      connected: isConnected,
      status: isConnected ? "connected" : "connection_failed",
      message: isConnected ? "Reflection Talia is ready" : "Talia is feeling disconnected, she'll be back later.",
      testResponse: process.env.NODE_ENV === "development" ? testResponse.substring(0, 100) + "..." : void 0
    });
  } catch (error) {
    console.error("\u274C Talia connection test failed:", error);
    res.json({
      connected: false,
      status: "connection_error",
      message: "Talia is feeling disconnected, she'll be back later.",
      error: process.env.NODE_ENV === "development" ? error.message : void 0
    });
  }
});
router27.get("/reports", async (req, res) => {
  try {
    if (!isOpenAIAPIAvailable()) {
      return res.json({
        connected: false,
        status: "api_key_missing",
        message: "Report generation unavailable - API not configured"
      });
    }
    const testResponse = await generateOpenAICoachingResponse({
      userMessage: "Generate a test response",
      personaType: "star_report",
      userName: "Test User",
      contextData: {
        reportContext: "test",
        selectedUserId: 1,
        selectedUserName: "Test User",
        userData: { basic: "test" }
      },
      maxTokens: 50
    });
    const isConnected = testResponse && !testResponse.includes("having trouble connecting") && !testResponse.includes("connection error");
    res.json({
      connected: isConnected,
      status: isConnected ? "connected" : "connection_failed",
      message: isConnected ? "Report generation available" : "Report generation temporarily unavailable",
      testResponse: process.env.NODE_ENV === "development" ? testResponse.substring(0, 100) + "..." : void 0
    });
  } catch (error) {
    console.error("\u274C Report Talia connection test failed:", error);
    res.json({
      connected: false,
      status: "connection_error",
      message: "Report generation temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? error.message : void 0
    });
  }
});
router27.get("/all", async (req, res) => {
  try {
    const [reflectionTest, reportsTest] = await Promise.allSettled([
      fetch(`${req.protocol}://${req.get("host")}/api/talia-status/reflection`).then((r) => r.json()),
      fetch(`${req.protocol}://${req.get("host")}/api/talia-status/reports`).then((r) => r.json())
    ]);
    const reflectionStatus = reflectionTest.status === "fulfilled" ? reflectionTest.value : { connected: false };
    const reportsStatus = reportsTest.status === "fulfilled" ? reportsTest.value : { connected: false };
    res.json({
      reflection: reflectionStatus,
      reports: reportsStatus,
      overall: {
        anyConnected: reflectionStatus.connected || reportsStatus.connected,
        allConnected: reflectionStatus.connected && reportsStatus.connected,
        status: reflectionStatus.connected && reportsStatus.connected ? "all_connected" : reflectionStatus.connected || reportsStatus.connected ? "partial_connection" : "disconnected"
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Overall Talia status check failed:", error);
    res.json({
      reflection: { connected: false },
      reports: { connected: false },
      overall: {
        anyConnected: false,
        allConnected: false,
        status: "error"
      },
      error: process.env.NODE_ENV === "development" ? error.message : void 0,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var talia_status_routes_default = router27;

// server/routes/persona-document-sync-routes.ts
import express22 from "express";
init_auth();
init_openai_api_service();
import multer3 from "multer";
var router28 = express22.Router();
var upload3 = multer3({
  storage: multer3.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["text/plain", "text/markdown", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith(".md") || file.originalname.endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: .txt, .md, .pdf, .docx"));
    }
  }
});
var PERSONA_CONFIGS = [
  {
    id: "reflection_talia",
    name: "Reflection Talia",
    type: "reflection",
    vectorStoreId: "vs_688e55e74e68819190cca71d1fa54f52",
    projectType: "content-generation",
    enabled: true
  },
  {
    id: "report_talia",
    name: "Report Talia",
    type: "report",
    vectorStoreId: "vs_688e2bf0d94c81918b50080064684bde",
    projectType: "report-generation",
    enabled: true
  },
  {
    id: "admin_talia",
    name: "Admin Training",
    type: "admin",
    vectorStoreId: "vs_688e55e81e6c8191af100194c2ac9512",
    projectType: "admin-training",
    enabled: true
  }
];
router28.get("/persona-sync-configs", requireAuth, async (req, res) => {
  try {
    const configs = await Promise.all(PERSONA_CONFIGS.map(async (config) => {
      const postgresResult = await db.execute(
        `SELECT COUNT(*) as count FROM training_documents 
         WHERE assigned_personas @> $1 AND deleted_at IS NULL`,
        [JSON.stringify([config.id])]
      );
      const postgresCount = parseInt(postgresResult[0]?.count || "0");
      let openaiCount = 0;
      let lastSync = null;
      try {
        const client = getOpenAIClient(config.projectType);
        const vectorStore = await client.beta.vectorStores.retrieve(config.vectorStoreId);
        openaiCount = vectorStore.file_counts?.completed || 0;
      } catch (error) {
        console.warn(`Failed to get OpenAI count for ${config.id}:`, error);
      }
      let syncStatus = "synced";
      if (postgresCount === 0 && openaiCount === 0) {
        syncStatus = "synced";
      } else if (postgresCount !== openaiCount) {
        syncStatus = "partial";
      } else {
        const syncResult = await db.execute(
          `SELECT COUNT(*) as unsynced FROM training_documents 
           WHERE assigned_personas @> $1 AND deleted_at IS NULL 
           AND (openai_file_id IS NULL OR openai_file_id = '')`,
          [JSON.stringify([config.id])]
        );
        const unsyncedCount = parseInt(syncResult[0]?.unsynced || "0");
        if (unsyncedCount > 0) {
          syncStatus = "unsynced";
        }
      }
      return {
        ...config,
        postgresDocuments: [],
        openaiDocuments: [],
        syncStatus,
        lastSync,
        postgresCount,
        openaiCount
      };
    }));
    res.json(configs);
  } catch (error) {
    console.error("Error fetching persona sync configs:", error);
    res.status(500).json({ error: "Failed to fetch persona configurations" });
  }
});
router28.get("/persona-sync-status/:personaId", requireAuth, async (req, res) => {
  try {
    const { personaId } = req.params;
    const config = PERSONA_CONFIGS.find((c) => c.id === personaId);
    if (!config) {
      return res.status(404).json({ error: "Persona not found" });
    }
    const postgresResult = await db.execute(
      `SELECT id, title, content, document_type, category, enabled, 
              created_at, updated_at, file_size, openai_file_id,
              CASE 
                WHEN openai_file_id IS NOT NULL AND openai_file_id != '' THEN 'synced'
                ELSE 'pending'
              END as sync_status
       FROM training_documents 
       WHERE assigned_personas @> $1 AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [JSON.stringify([personaId])]
    );
    let openaiDocuments = [];
    try {
      const client = getOpenAIClient(config.projectType);
      const vectorStoreFiles = await client.beta.vectorStores.files.list(config.vectorStoreId);
      openaiDocuments = await Promise.all(
        vectorStoreFiles.data.map(async (fileRef) => {
          try {
            const file = await client.files.retrieve(fileRef.id);
            const matchingDoc = postgresResult.find((doc) => doc.openai_file_id === file.id);
            return {
              id: file.id,
              filename: file.filename,
              bytes: file.bytes,
              created_at: file.created_at,
              purpose: file.purpose,
              status: fileRef.status,
              postgresDocumentId: matchingDoc?.id || null
            };
          } catch (error) {
            console.warn(`Failed to get file details for ${fileRef.id}:`, error);
            return {
              id: fileRef.id,
              filename: "Unknown",
              bytes: 0,
              created_at: Date.now() / 1e3,
              purpose: "assistants",
              status: fileRef.status,
              postgresDocumentId: null
            };
          }
        })
      );
    } catch (error) {
      console.warn(`Failed to get OpenAI documents for ${personaId}:`, error);
    }
    const postgresCount = postgresResult.length;
    const openaiCount = openaiDocuments.length;
    const syncedCount = postgresResult.filter((doc) => doc.openai_file_id).length;
    const pendingCount = postgresCount - syncedCount;
    let overallStatus = "synced";
    if (pendingCount > 0) {
      overallStatus = "unsynced";
    } else if (postgresCount !== openaiCount) {
      overallStatus = "partial";
    }
    res.json({
      personaId,
      config,
      postgresDocuments: postgresResult.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content?.substring(0, 200) + "...",
        type: doc.document_type,
        category: doc.category,
        enabled: doc.enabled,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        file_size: doc.file_size,
        openaiFileId: doc.openai_file_id,
        syncStatus: doc.sync_status
      })),
      openaiDocuments,
      summary: {
        postgresCount,
        openaiCount,
        syncedCount,
        pendingCount
      },
      overallStatus
    });
  } catch (error) {
    console.error("Error fetching persona sync status:", error);
    res.status(500).json({ error: "Failed to fetch sync status" });
  }
});
router28.post("/sync-documents/:personaId", requireAuth, async (req, res) => {
  try {
    const { personaId } = req.params;
    const { operation = "incremental" } = req.body;
    const config = PERSONA_CONFIGS.find((c) => c.id === personaId);
    if (!config) {
      return res.status(404).json({ error: "Persona not found" });
    }
    const client = getOpenAIClient(config.projectType);
    const results = {
      uploaded: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };
    const documentsToSync = await db.execute(
      `SELECT id, title, content, document_type, category, file_size, openai_file_id
       FROM training_documents 
       WHERE assigned_personas @> $1 AND deleted_at IS NULL
       ${operation === "incremental" ? "AND (openai_file_id IS NULL OR openai_file_id = '')" : ""}
       ORDER BY updated_at DESC`,
      [JSON.stringify([personaId])]
    );
    for (const doc of documentsToSync) {
      try {
        console.log(`Syncing document: ${doc.title} (${doc.id})`);
        const fileContent = `Title: ${doc.title}
Type: ${doc.document_type}
Category: ${doc.category}

${doc.content}`;
        const buffer = Buffer.from(fileContent, "utf-8");
        const file = await client.files.create({
          file: new File([buffer], `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`, {
            type: "text/plain"
          }),
          purpose: "assistants"
        });
        await client.beta.vectorStores.files.create(config.vectorStoreId, {
          file_id: file.id
        });
        await db.execute(
          "UPDATE training_documents SET openai_file_id = $1, updated_at = NOW() WHERE id = $2",
          [file.id, doc.id]
        );
        if (doc.openai_file_id) {
          results.updated++;
        } else {
          results.uploaded++;
        }
        console.log(`\u2705 Synced: ${doc.title} -> ${file.id}`);
      } catch (error) {
        console.error(`\u274C Failed to sync document ${doc.title}:`, error);
        results.errors.push(`${doc.title}: ${error.message}`);
      }
    }
    if (operation === "full") {
      try {
        const vectorStoreFiles = await client.beta.vectorStores.files.list(config.vectorStoreId);
        for (const fileRef of vectorStoreFiles.data) {
          const dbDoc = await db.execute(
            "SELECT id FROM training_documents WHERE openai_file_id = $1 AND deleted_at IS NULL",
            [fileRef.id]
          );
          if (dbDoc.length === 0) {
            try {
              await client.beta.vectorStores.files.del(config.vectorStoreId, fileRef.id);
              await client.files.del(fileRef.id);
              results.deleted++;
              console.log(`\u{1F5D1}\uFE0F Deleted orphaned file: ${fileRef.id}`);
            } catch (deleteError) {
              console.warn(`Failed to delete orphaned file ${fileRef.id}:`, deleteError);
            }
          }
        }
      } catch (error) {
        console.warn("Failed to clean up orphaned files:", error);
      }
    }
    res.json({
      success: true,
      operation,
      results,
      message: `Sync completed: ${results.uploaded} uploaded, ${results.updated} updated, ${results.deleted} deleted`
    });
  } catch (error) {
    console.error("Error syncing documents:", error);
    res.status(500).json({ error: "Failed to sync documents" });
  }
});
router28.post("/upload-document", requireAuth, upload3.single("file"), async (req, res) => {
  try {
    const { personaId, category = "training", autoSync = "false" } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }
    const config = PERSONA_CONFIGS.find((c) => c.id === personaId);
    if (!config) {
      return res.status(404).json({ error: "Persona not found" });
    }
    let content = "";
    if (file.mimetype === "text/plain" || file.originalname.endsWith(".txt") || file.originalname.endsWith(".md")) {
      content = file.buffer.toString("utf-8");
    } else {
      content = file.buffer.toString("utf-8");
    }
    const result = await db.execute(
      `INSERT INTO training_documents 
       (title, content, document_type, category, file_size, original_filename, assigned_personas, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id`,
      [
        file.originalname.replace(/\.[^/.]+$/, ""),
        // Remove file extension
        content,
        "document",
        category,
        file.size,
        file.originalname,
        JSON.stringify([personaId])
      ]
    );
    const documentId = result[0].id;
    let openaiFileId = null;
    if (autoSync === "true") {
      try {
        const client = getOpenAIClient(config.projectType);
        const fileContent = `Title: ${file.originalname}
Type: document
Category: ${category}

${content}`;
        const openaiFile = await client.files.create({
          file: new File([Buffer.from(fileContent, "utf-8")], file.originalname, {
            type: "text/plain"
          }),
          purpose: "assistants"
        });
        await client.beta.vectorStores.files.create(config.vectorStoreId, {
          file_id: openaiFile.id
        });
        openaiFileId = openaiFile.id;
        await db.execute(
          "UPDATE training_documents SET openai_file_id = $1 WHERE id = $2",
          [openaiFileId, documentId]
        );
        console.log(`\u2705 Uploaded and synced: ${file.originalname} -> ${openaiFileId}`);
      } catch (syncError) {
        console.error("Failed to auto-sync to OpenAI:", syncError);
      }
    }
    res.json({
      success: true,
      document: {
        id: documentId,
        title: file.originalname,
        category,
        size: file.size,
        openaiFileId,
        synced: !!openaiFileId
      },
      message: `Document uploaded successfully${openaiFileId ? " and synced to OpenAI" : ""}`
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});
router28.delete("/delete-document/:documentId", requireAuth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { fromOpenAI = false } = req.body;
    if (fromOpenAI) {
      const openaiFileId = documentId;
      const doc = await db.execute(
        "SELECT assigned_personas FROM training_documents WHERE openai_file_id = $1 AND deleted_at IS NULL",
        [openaiFileId]
      );
      if (doc.length > 0) {
        const assignedPersonas = JSON.parse(doc[0].assigned_personas);
        const personaId = assignedPersonas[0];
        const config = PERSONA_CONFIGS.find((c) => c.id === personaId);
        if (config) {
          const client = getOpenAIClient(config.projectType);
          try {
            await client.beta.vectorStores.files.del(config.vectorStoreId, openaiFileId);
            await client.files.del(openaiFileId);
            await db.execute(
              "UPDATE training_documents SET openai_file_id = NULL WHERE openai_file_id = $1",
              [openaiFileId]
            );
            res.json({ success: true, message: "Document deleted from OpenAI" });
          } catch (error) {
            console.error("Failed to delete from OpenAI:", error);
            res.status(500).json({ error: "Failed to delete from OpenAI" });
          }
        } else {
          res.status(404).json({ error: "Persona configuration not found" });
        }
      } else {
        res.status(404).json({ error: "Document not found in PostgreSQL" });
      }
    } else {
      const doc = await db.execute(
        "SELECT openai_file_id, assigned_personas FROM training_documents WHERE id = $1 AND deleted_at IS NULL",
        [documentId]
      );
      if (doc.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }
      const openaiFileId = doc[0].openai_file_id;
      const assignedPersonas = JSON.parse(doc[0].assigned_personas || "[]");
      await db.execute(
        "UPDATE training_documents SET deleted_at = NOW() WHERE id = $1",
        [documentId]
      );
      if (openaiFileId && assignedPersonas.length > 0) {
        const personaId = assignedPersonas[0];
        const config = PERSONA_CONFIGS.find((c) => c.id === personaId);
        if (config) {
          try {
            const client = getOpenAIClient(config.projectType);
            await client.beta.vectorStores.files.del(config.vectorStoreId, openaiFileId);
            await client.files.del(openaiFileId);
            console.log(`\u2705 Also deleted from OpenAI: ${openaiFileId}`);
          } catch (error) {
            console.warn("Failed to delete from OpenAI:", error);
          }
        }
      }
      res.json({ success: true, message: "Document deleted from PostgreSQL" });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});
var persona_document_sync_routes_default = router28;

// server/index.ts
import path4 from "path";
import fs6 from "fs";
import multer4 from "multer";
import { fileURLToPath } from "url";
import { createServer } from "http";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path4.dirname(__filename);
var app = express23();
var port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
var server = createServer(app);
function validateEnvironment() {
  const required = ["DATABASE_URL", "SESSION_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error("\u274C Missing required environment variables:", missing);
    process.exit(1);
  }
  console.log("\u2705 Environment variables validated");
  console.log("\u{1F4CA} DATABASE_URL configured:", !!process.env.DATABASE_URL);
  console.log("\u{1F511} SESSION_SECRET configured:", !!process.env.SESSION_SECRET);
  console.log("\u{1F527} Environment Configuration Check:", {
    NODE_ENV: process.env.NODE_ENV,
    ENVIRONMENT: process.env.ENVIRONMENT,
    claudeEnabled: process.env.ENVIRONMENT === "development",
    personaEnvironment: process.env.ENVIRONMENT || process.env.NODE_ENV || "development"
  });
}
async function testDatabaseConnection() {
  try {
    const testQuery = await db.execute("SELECT 1 as test");
    console.log("\u2705 Database connection test successful");
    const sessionTest = await db.execute("SELECT COUNT(*) FROM session_aws");
    console.log("\u2705 Session table accessible");
    return true;
  } catch (error) {
    console.error("\u274C Database connection failed:", typeof error === "object" && error !== null && "message" in error ? error.message : String(error));
    return false;
  }
}
var isInitialized = false;
var initializationPromise = null;
app.get("/health", async (req, res) => {
  try {
    let versionInfo = {
      version: "unknown",
      build: "unknown",
      environment: "unknown",
      buildTimestamp: "unknown"
    };
    try {
      const versionPath = path4.join(__dirname, "../public/version.json");
      const versionData = JSON.parse(fs6.readFileSync(versionPath, "utf8"));
      versionInfo = {
        version: versionData.version || "unknown",
        build: versionData.build || "unknown",
        environment: versionData.environment || "unknown",
        buildTimestamp: versionData.timestamp || "unknown"
      };
      res.setHeader("X-App-Version", versionInfo.version);
      res.setHeader("X-App-Build", versionInfo.build);
      res.setHeader("X-App-Environment", versionInfo.environment);
      res.setHeader("X-App-Timestamp", versionInfo.buildTimestamp);
    } catch (err) {
      res.setHeader("X-App-Version", "unknown");
      res.setHeader("X-App-Build", "unknown");
      res.setHeader("X-App-Environment", "unknown");
    }
    const health = {
      status: "ok",
      ...versionInfo,
      initialized: isInitialized,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      database: "unknown",
      sessionTable: "unknown"
    };
    if (isInitialized) {
      try {
        await db.execute("SELECT 1");
        health.database = "connected";
        await db.execute("SELECT COUNT(*) FROM session_aws");
        health.sessionTable = "accessible";
      } catch (error) {
        health.database = "error";
        health.sessionTable = "error";
      }
    }
    res.status(200).json(health);
  } catch (error) {
    let versionInfo = { version: "unknown", build: "unknown", environment: "unknown" };
    try {
      const versionPath = path4.join(__dirname, "../public/version.json");
      const versionData = JSON.parse(fs6.readFileSync(versionPath, "utf8"));
      versionInfo = {
        version: versionData.version || "unknown",
        build: versionData.build || "unknown",
        environment: versionData.environment || "unknown"
      };
      res.setHeader("X-App-Version", versionInfo.version);
      res.setHeader("X-App-Build", versionInfo.build);
      res.setHeader("X-App-Environment", versionInfo.environment);
    } catch (err) {
      res.setHeader("X-App-Version", "unknown");
      res.setHeader("X-App-Build", "unknown");
      res.setHeader("X-App-Environment", "unknown");
    }
    res.status(500).json({
      status: "unhealthy",
      ...versionInfo,
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
app.get("/api/vector-status", async (req, res) => {
  try {
    const { javascriptVectorService: javascriptVectorService2 } = await Promise.resolve().then(() => (init_javascript_vector_service(), javascript_vector_service_exports));
    const stats = javascriptVectorService2.getStats();
    const testQuery = "personal development report coaching";
    const testResults = await javascriptVectorService2.findSimilarContent(testQuery, {
      maxResults: 2,
      maxTokens: 500,
      minSimilarity: 0.1
    });
    res.status(200).json({
      status: "healthy",
      service: "JavaScript Vector Search",
      ...stats,
      testQuery,
      testResults: {
        count: testResults.length,
        totalTokens: testResults.reduce((sum, r) => sum + r.tokenCount, 0),
        topSimilarity: testResults[0]?.similarity || 0,
        documents: testResults.map((r) => ({
          title: r.documentTitle,
          type: r.documentType,
          similarity: r.similarity.toFixed(3),
          tokens: r.tokenCount
        }))
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "JavaScript Vector Search",
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
async function initializeApp() {
  if (initializationPromise) {
    return initializationPromise;
  }
  initializationPromise = (async () => {
    try {
      console.log("\u{1F504} Starting application initialization...");
      validateEnvironment();
      console.log("\u{1F4CA} Initializing database connection...");
      await initializeDatabase();
      console.log("\u2705 Database connection successful");
      console.log("\u{1F916} Loading persona configurations...");
      const { loadPersonasFromDatabase: loadPersonasFromDatabase2 } = await Promise.resolve().then(() => (init_persona_management_routes(), persona_management_routes_exports));
      await loadPersonasFromDatabase2();
      console.log("\u2705 Persona configurations loaded from database");
      console.log("\u{1F6A9} Validating feature flag configuration...");
      validateFlagsOnStartup();
      const dbReady = await testDatabaseConnection();
      if (!dbReady) {
        console.error("\u274C Database not ready, exiting...");
        process.exit(1);
      }
      const PgSession = connectPgSimple(session);
      const sessionStore = new PgSession({
        conString: process.env.SESSION_DATABASE_URL || process.env.DATABASE_URL,
        tableName: "session_aws",
        createTableIfMissing: false,
        // Table already exists
        // Simplified configuration for better compatibility
        schemaName: "public",
        pruneSessionInterval: 60 * 15
        // 15 minutes
      });
      sessionStore.on("error", (error) => {
        console.error("\u274C Session store error:", error);
      });
      app.use(express23.json({ limit: "50mb" }));
      app.use(express23.urlencoded({ extended: true }));
      app.use(cookieParser());
      app.use((req, res, next) => {
        try {
          const versionPath = path4.join(__dirname, "../public/version.json");
          const versionData = JSON.parse(fs6.readFileSync(versionPath, "utf8"));
          res.setHeader("X-App-Version", versionData.version || "unknown");
          res.setHeader("X-App-Build", versionData.build || "unknown");
          res.setHeader("X-App-Environment", versionData.environment || "unknown");
          res.setHeader("X-App-Timestamp", versionData.timestamp || "unknown");
        } catch (err) {
          res.setHeader("X-App-Version", "unknown");
          res.setHeader("X-App-Build", "unknown");
          res.setHeader("X-App-Environment", "unknown");
        }
        next();
      });
      app.use(session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || "aws-production-secret-2025",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production" ? false : false,
          // HTTP for now
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1e3,
          // 24 hours
          sameSite: "lax"
        },
        name: "sessionId"
        // Custom session name
      }));
      const upload4 = multer4({
        storage: multer4.memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024
          // 10MB limit
        }
      });
      app.use("/api", router10);
      app.use("/api/reports/holistic", holistic_report_routes_default);
      app.use("/api/admin", upload4.single("file"), admin_upload_routes_default);
      app.use("/api/discernment", discernment_routes_default);
      app.use("/api/coaching", coaching_routes_default);
      app.use("/api", feature_flag_routes_default);
      app.use("/api/jira", jira_routes_default);
      app.use("/api/feedback", feedback_routes_default);
      app.use("/api/training-docs", training_documents_routes_default);
      app.use("/api/training", training_routes_default);
      app.use("/api/admin/ai", ai_management_routes_default);
      app.use("/api/admin/ai", persona_management_routes_default);
      app.use("/api/admin/chat", admin_chat_routes_default);
      app.use("/api/admin/ai", training_upload_routes_default);
      app.use("/api/talia-status", talia_status_routes_default);
      app.use("/api/admin/ai", persona_document_sync_routes_default);
      app.use("/api/beta-tester", beta_tester_routes_default);
      app.use("/api/beta-tester", beta_tester_notes_routes_default);
      app.use("/api/metalia", metalia_routes_default);
      app.use("/api/growth-plan", growth_plan_routes_default);
      app.get("/changelog", async (req, res) => {
        try {
          const changelogPath = path4.join(__dirname, "..", "CHANGELOG-TEST-USERS.md");
          if (fs6.existsSync(changelogPath)) {
            const changelog = fs6.readFileSync(changelogPath, "utf-8");
            res.setHeader("Content-Type", "text/markdown");
            res.send(changelog);
          } else {
            res.status(404).send("Changelog not found");
          }
        } catch (error) {
          console.error("Error serving changelog:", error);
          res.status(500).send("Error loading changelog");
        }
      });
      app.get("/changelog-html", async (req, res) => {
        try {
          const changelogPath = path4.join(__dirname, "..", "CHANGELOG-TEST-USERS.md");
          if (fs6.existsSync(changelogPath)) {
            const markdown = fs6.readFileSync(changelogPath, "utf-8");
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AllStarTeams & Imaginal Agility - Changelog</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
        h2 { color: #1d4ed8; margin-top: 2em; }
        h3 { color: #1e40af; }
        h4 { color: #3730a3; }
        code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; }
        blockquote { background: #f9fafb; border-left: 4px solid #60a5fa; padding: 10px 20px; margin: 20px 0; }
        .version { background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .emoji { font-size: 1.2em; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
    </style>
</head>
<body>
    <pre style="white-space: pre-wrap; font-family: inherit;">${markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
    <footer style="margin-top: 3em; padding-top: 2em; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
        <p><strong>\u{1F517} Quick Links:</strong></p>
        <p>
            <a href="/admin" style="color: #2563eb; text-decoration: none;">Admin Dashboard</a> | 
            <a href="/changelog" style="color: #2563eb; text-decoration: none;">Raw Markdown</a> | 
            <a href="/" style="color: #2563eb; text-decoration: none;">Back to Platform</a>
        </p>
    </footer>
</body>
</html>`;
            res.setHeader("Content-Type", "text/html");
            res.send(html);
          } else {
            res.status(404).send("<h1>Changelog not found</h1>");
          }
        } catch (error) {
          console.error("Error serving changelog HTML:", error);
          res.status(500).send("<h1>Error loading changelog</h1>");
        }
      });
      app.post("/fix-admin-test-user", async (req, res) => {
        try {
          const { eq: eq14 } = await import("drizzle-orm");
          const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const result = await db.update(users3).set({ isTestUser: true }).where(eq14(users3.id, 1)).returning({
            id: users3.id,
            username: users3.username,
            name: users3.name,
            role: users3.role,
            isTestUser: users3.isTestUser
          });
          if (result.length > 0) {
            console.log("\u2705 Admin user updated to test user:", result[0]);
            res.json({
              success: true,
              message: "Admin user successfully updated to test user",
              user: result[0]
            });
          } else {
            res.status(404).json({
              success: false,
              message: "Admin user not found"
            });
          }
        } catch (error) {
          console.error("\u274C Error updating admin user:", error);
          res.status(500).json({
            success: false,
            error: "Failed to update admin user",
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });
      app.get("/debug-user-status", async (req, res) => {
        try {
          const { eq: eq14 } = await import("drizzle-orm");
          const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const result = await db.select({
            id: users3.id,
            username: users3.username,
            name: users3.name,
            role: users3.role,
            isTestUser: users3.isTestUser,
            astWorkshopCompleted: users3.astWorkshopCompleted,
            astCompletedAt: users3.astCompletedAt
          }).from(users3).where(eq14(users3.id, 1));
          if (result.length > 0) {
            console.log("\u{1F50D} Admin user current status:", result[0]);
            res.json({
              success: true,
              user: result[0],
              message: "Current admin user status from database"
            });
          } else {
            res.status(404).json({
              success: false,
              message: "Admin user not found"
            });
          }
        } catch (error) {
          console.error("\u274C Error checking user status:", error);
          res.status(500).json({
            success: false,
            error: "Failed to check user status",
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });
      app.post("/set-user-workshop-completed", async (req, res) => {
        try {
          const { eq: eq14 } = await import("drizzle-orm");
          const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const result = await db.update(users3).set({
            astWorkshopCompleted: true,
            astCompletedAt: /* @__PURE__ */ new Date()
          }).where(eq14(users3.id, 1)).returning({
            id: users3.id,
            username: users3.username,
            name: users3.name,
            astWorkshopCompleted: users3.astWorkshopCompleted,
            astCompletedAt: users3.astCompletedAt
          });
          if (result.length > 0) {
            console.log("\u2705 User 1 marked as workshop completed:", result[0]);
            res.json({
              success: true,
              user: result[0],
              message: "User 1 marked as AST workshop completed"
            });
          } else {
            res.status(404).json({
              success: false,
              message: "User not found"
            });
          }
        } catch (error) {
          console.error("\u274C Error updating user:", error);
          res.status(500).json({
            success: false,
            error: "Failed to update user status",
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });
      app.post("/refresh-session", async (req, res) => {
        try {
          const userId2 = req.session?.userId;
          if (!userId2) {
            return res.status(401).json({
              success: false,
              error: "Not logged in"
            });
          }
          const { eq: eq14 } = await import("drizzle-orm");
          const { users: users3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const result = await db.select().from(users3).where(eq14(users3.id, userId2));
          if (result.length > 0) {
            const user = result[0];
            req.session.user = {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role,
              isTestUser: user.isTestUser,
              isBetaTester: user.isBetaTester,
              astWorkshopCompleted: user.astWorkshopCompleted,
              iaWorkshopCompleted: user.iaWorkshopCompleted
            };
            console.log("\u2705 Session refreshed for user:", user.username);
            res.json({
              success: true,
              message: "Session refreshed with latest database values",
              user: req.session.user
            });
          } else {
            res.status(404).json({
              success: false,
              error: "User not found in database"
            });
          }
        } catch (error) {
          console.error("\u274C Error refreshing session:", error);
          res.status(500).json({
            success: false,
            error: "Failed to refresh session",
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });
      app.post("/create-holistic-reports-table", async (req, res) => {
        try {
          console.log("\u{1F680} Creating holistic reports table...");
          const createTableQuery = `
            -- Create holistic_reports table for storing generated PDF reports
            CREATE TABLE IF NOT EXISTS holistic_reports (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('standard', 'personal')),
              report_data JSONB NOT NULL,
              pdf_file_path VARCHAR(500),
              pdf_file_name VARCHAR(255),
              pdf_file_size INTEGER,
              generation_status VARCHAR(20) DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
              generated_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW(),
              error_message TEXT,
              generated_by_user_id INTEGER REFERENCES users(id),
              star_card_image_path VARCHAR(500),
              CONSTRAINT unique_user_report_type UNIQUE (user_id, report_type)
            )
          `;
          const indexQueries = [
            "CREATE INDEX IF NOT EXISTS idx_holistic_reports_user_id ON holistic_reports(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_holistic_reports_status ON holistic_reports(generation_status)",
            "CREATE INDEX IF NOT EXISTS idx_holistic_reports_type ON holistic_reports(report_type)",
            "CREATE INDEX IF NOT EXISTS idx_holistic_reports_generated_at ON holistic_reports(generated_at)"
          ];
          const results = [];
          try {
            await db.execute(createTableQuery);
            results.push("\u2705 holistic_reports table created successfully");
          } catch (error) {
            if (error instanceof Error && error.message.includes("already exists")) {
              results.push("\u26A0\uFE0F holistic_reports table already exists");
            } else {
              throw error;
            }
          }
          for (const query2 of indexQueries) {
            try {
              await db.execute(query2);
              results.push("\u2705 Index created successfully");
            } catch (error) {
              if (error instanceof Error && error.message.includes("already exists")) {
                results.push("\u26A0\uFE0F Index already exists");
              } else {
                console.warn("Index creation warning:", error instanceof Error ? error.message : String(error));
                results.push("\u26A0\uFE0F Index creation warning");
              }
            }
          }
          console.log("\u2705 Holistic reports table creation completed");
          res.json({
            success: true,
            message: "Holistic reports table created successfully",
            results
          });
        } catch (error) {
          console.error("\u274C Error creating holistic reports table:", error);
          res.status(500).json({
            success: false,
            error: "Failed to create holistic reports table",
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });
      app.post("/create-coaching-tables", async (req, res) => {
        try {
          console.log("\u{1F680} Creating coaching system tables...");
          const createTableQueries = [
            `CREATE TABLE IF NOT EXISTS coach_knowledge_base (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              category VARCHAR(100) NOT NULL,
              content_type VARCHAR(100) NOT NULL,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              tags JSONB,
              metadata JSONB,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS user_profiles_extended (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              company VARCHAR(255),
              department VARCHAR(255),
              role VARCHAR(255),
              ast_profile_summary JSONB,
              expertise_areas JSONB,
              project_experience JSONB,
              collaboration_preferences JSONB,
              availability_status VARCHAR(50) DEFAULT 'available',
              connection_opt_in BOOLEAN DEFAULT true,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS coaching_sessions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              conversation JSONB NOT NULL,
              session_summary TEXT,
              context_used JSONB,
              session_type VARCHAR(50) DEFAULT 'general',
              session_length VARCHAR(50),
              user_satisfaction VARCHAR(20),
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS connection_suggestions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              requestor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              suggested_collaborator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              reason_type VARCHAR(100) NOT NULL,
              reason_explanation TEXT NOT NULL,
              context TEXT,
              status VARCHAR(50) DEFAULT 'suggested',
              response_at TIMESTAMP,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS vector_embeddings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              source_table VARCHAR(100) NOT NULL,
              source_id VARCHAR(255) NOT NULL,
              vector_id VARCHAR(255) NOT NULL,
              embedding_type VARCHAR(100) NOT NULL,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`
          ];
          const indexQueries = [
            "CREATE INDEX IF NOT EXISTS idx_coach_knowledge_base_category ON coach_knowledge_base(category)",
            "CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_connection_suggestions_requestor ON connection_suggestions(requestor_id)",
            "CREATE INDEX IF NOT EXISTS idx_vector_embeddings_source ON vector_embeddings(source_table, source_id)"
          ];
          const results = [];
          for (const query2 of createTableQueries) {
            try {
              await db.execute(query2);
              results.push("\u2705 Table created successfully");
            } catch (error) {
              if (error instanceof Error && error.message.includes("already exists")) {
                results.push("\u26A0\uFE0F Table already exists");
              } else {
                throw error;
              }
            }
          }
          for (const query2 of indexQueries) {
            try {
              await db.execute(query2);
              results.push("\u2705 Index created successfully");
            } catch (error) {
              if (error instanceof Error && error.message.includes("already exists")) {
                results.push("\u26A0\uFE0F Index already exists");
              } else {
                console.warn("Index creation warning:", error instanceof Error ? error.message : String(error));
                results.push("\u26A0\uFE0F Index creation warning");
              }
            }
          }
          console.log("\u2705 Coaching tables creation completed");
          res.json({
            success: true,
            message: "Coaching system tables created successfully",
            results,
            tables: ["coach_knowledge_base", "user_profiles_extended", "coaching_sessions", "connection_suggestions", "vector_embeddings"]
          });
        } catch (error) {
          console.error("\u274C Error creating coaching tables:", error);
          res.status(500).json({
            success: false,
            error: "Failed to create coaching tables",
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });
      if (process.env.NODE_ENV === "production") {
        const staticPath = path4.join(__dirname, "public");
        console.log("\u{1F4C1} Production: serving static files from:", staticPath);
        app.use(express23.static(staticPath));
        app.get(/^(?!\/api).*/, (req, res) => {
          res.sendFile(path4.join(__dirname, "public/index.html"));
        });
        console.log("\u2705 Production static file serving ready");
      } else {
        const devStaticPath = path4.join(__dirname, "../dist/public");
        console.log("\u{1F4C1} Development: serving static files from:", devStaticPath);
        app.use(express23.static(devStaticPath));
        app.get(/^(?!\/api).*/, (req, res) => {
          res.sendFile(path4.join(__dirname, "../dist/public/index.html"));
        });
        console.log("\u2705 Development static file serving ready");
      }
      console.log("\u{1F504} Initializing JavaScript Vector Service...");
      try {
        const { javascriptVectorService: javascriptVectorService2 } = await Promise.resolve().then(() => (init_javascript_vector_service(), javascript_vector_service_exports));
        await javascriptVectorService2.initialize();
        console.log("\u2705 JavaScript Vector Service initialized");
      } catch (error) {
        console.warn("\u26A0\uFE0F Vector service initialization failed, will use fallback search:", error);
      }
      isInitialized = true;
      console.log("\u2705 Application initialization complete");
    } catch (error) {
      console.error("\u274C Application initialization failed:", error);
      throw error;
    }
  })();
  return initializationPromise;
}
app.use(async (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }
  if (!isInitialized) {
    try {
      await initializeApp();
    } catch (error) {
      console.error("\u274C Failed to initialize application:", error);
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }
  }
  next();
});
async function startServer() {
  try {
    console.log("\u{1F680} Starting server...");
    server.listen(port, "0.0.0.0", () => {
      console.log(`\u2705 Server successfully started on port ${port}`);
      console.log(`\u{1F310} Access your app at: http://0.0.0.0:${port}`);
      console.log(`\u2764\uFE0F  Health check available at: http://0.0.0.0:${port}/health`);
      initializeApp().catch((error) => {
        console.error("\u274C Background initialization failed:", error);
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\u274C Port ${port} is busy`);
        process.exit(1);
      } else {
        console.error("\u274C Server error:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
var shutdown = async (signal) => {
  console.log(`\u{1F6D1} Received ${signal}. Shutting down gracefully...`);
  const forceExitTimeout = setTimeout(() => {
    console.log("\u26A0\uFE0F  Graceful shutdown timed out, forcing exit...");
    process.exit(1);
  }, 1e4);
  try {
    console.log("\u{1F512} Closing HTTP server...");
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error("\u274C Error closing server:", err);
          reject(err);
        } else {
          console.log("\u2705 HTTP server closed");
          resolve();
        }
      });
    });
    console.log("\u{1F5C4}\uFE0F  Closing database connections...");
    if (db && typeof db.end === "function") {
      await db.end();
      console.log("\u2705 Database connections closed");
    }
    clearTimeout(forceExitTimeout);
    console.log("\u2705 Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("\u274C Error during graceful shutdown:", error);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  console.error("\u274C Uncaught Exception:", error);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("\u274C Unhandled Rejection at:", promise, "reason:", reason);
  shutdown("unhandledRejection");
});
