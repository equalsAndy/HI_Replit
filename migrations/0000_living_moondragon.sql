CREATE TABLE "coach_knowledge_base" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(100) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"conversation" jsonb NOT NULL,
	"session_summary" text,
	"context_used" jsonb,
	"session_type" varchar(50) DEFAULT 'general',
	"session_length" varchar(50),
	"user_satisfaction" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohort_facilitators" (
	"id" serial PRIMARY KEY NOT NULL,
	"cohort_id" integer,
	"facilitator_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohort_participants" (
	"cohort_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "cohort_participants_cohort_id_participant_id_pk" PRIMARY KEY("cohort_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" varchar(50),
	"cohort_type" varchar(50),
	"parent_cohort_id" integer,
	"facilitator_id" integer,
	"organization_id" uuid,
	"ast_access" boolean DEFAULT false NOT NULL,
	"ia_access" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connection_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requestor_id" integer NOT NULL,
	"suggested_collaborator_id" integer NOT NULL,
	"reason_type" varchar(100) NOT NULL,
	"reason_explanation" text NOT NULL,
	"context" text,
	"status" varchar(50) DEFAULT 'suggested',
	"response_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discernment_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"questions" jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"difficulty_level" integer DEFAULT 1,
	"tags" text[],
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "final_reflections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"insight" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flow_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"attributes" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quarter" varchar(2) NOT NULL,
	"year" integer NOT NULL,
	"star_power_reflection" text,
	"ladder_current_level" integer,
	"ladder_target_level" integer,
	"ladder_reflections" text,
	"strengths_examples" text,
	"flow_peak_hours" text,
	"flow_catalysts" text,
	"vision_start" text,
	"vision_now" text,
	"vision_next" text,
	"progress_working" text,
	"progress_need_help" text,
	"team_flow_status" text,
	"team_energy_source" text,
	"team_next_checkin" text,
	"key_priorities" text,
	"success_looks_like" text,
	"key_dates" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"invite_code" varchar(12) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'participant' NOT NULL,
	"name" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"used_at" timestamp,
	"used_by" integer,
	CONSTRAINT "invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "navigation_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"app_type" varchar(10) NOT NULL,
	"completed_steps" text NOT NULL,
	"current_step_id" varchar(20) NOT NULL,
	"unlocked_steps" text NOT NULL,
	"video_progress" text,
	"last_visited_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar(255) PRIMARY KEY NOT NULL,
	"sess" text NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "star_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"thinking" integer NOT NULL,
	"acting" integer NOT NULL,
	"feeling" integer NOT NULL,
	"planning" integer NOT NULL,
	"image_url" text,
	"state" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cohort_id" integer,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"assessment_type" varchar(50) NOT NULL,
	"results" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_discernment_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenarios_seen" jsonb DEFAULT '[]',
	"last_session_at" timestamp DEFAULT now(),
	"total_sessions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_discernment_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles_extended" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"company" varchar(255),
	"department" varchar(255),
	"role" varchar(255),
	"ast_profile_summary" jsonb,
	"expertise_areas" jsonb,
	"project_experience" jsonb,
	"collaboration_preferences" jsonb,
	"availability_status" varchar(50) DEFAULT 'available',
	"connection_opt_in" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'participant' NOT NULL,
	"organization" text,
	"job_title" text,
	"profile_picture" text,
	"is_test_user" boolean DEFAULT false NOT NULL,
	"navigation_progress" text,
	"content_access" varchar(20) DEFAULT 'professional' NOT NULL,
	"ast_access" boolean DEFAULT true NOT NULL,
	"ia_access" boolean DEFAULT true NOT NULL,
	"ast_workshop_completed" boolean DEFAULT false NOT NULL,
	"ia_workshop_completed" boolean DEFAULT false NOT NULL,
	"ast_completed_at" timestamp,
	"ia_completed_at" timestamp,
	"assigned_facilitator_id" integer,
	"cohort_id" integer,
	"team_id" integer,
	"invited_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vector_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_table" varchar(100) NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"vector_id" varchar(255) NOT NULL,
	"embedding_type" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"editable_id" varchar(100),
	"workshop_type" varchar(50) NOT NULL,
	"section" varchar(50) NOT NULL,
	"step_id" varchar(20),
	"autoplay" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content_mode" varchar(20) DEFAULT 'both' NOT NULL,
	"required_watch_percentage" integer DEFAULT 75 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_participation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"workshop_id" serial NOT NULL,
	"progress" text,
	"completed" boolean DEFAULT false,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_facilitators" ADD CONSTRAINT "cohort_facilitators_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_facilitators" ADD CONSTRAINT "cohort_facilitators_facilitator_id_users_id_fk" FOREIGN KEY ("facilitator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_participants" ADD CONSTRAINT "cohort_participants_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_participants" ADD CONSTRAINT "cohort_participants_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_facilitator_id_users_id_fk" FOREIGN KEY ("facilitator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_suggestions" ADD CONSTRAINT "connection_suggestions_requestor_id_users_id_fk" FOREIGN KEY ("requestor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_suggestions" ADD CONSTRAINT "connection_suggestions_suggested_collaborator_id_users_id_fk" FOREIGN KEY ("suggested_collaborator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discernment_progress" ADD CONSTRAINT "user_discernment_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles_extended" ADD CONSTRAINT "user_profiles_extended_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_discernment_progress_user_id" ON "user_discernment_progress" USING btree ("user_id");