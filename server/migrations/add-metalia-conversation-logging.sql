-- METAlia Conversation Logging System Migration
-- This migration creates the database schema for comprehensive conversation logging
-- and escalation management for all Talia personas

-- ==================================================
-- Table: talia_conversations
-- Comprehensive logging of all Talia conversations
-- ==================================================
CREATE TABLE IF NOT EXISTS talia_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic conversation metadata
  persona_type VARCHAR(50) NOT NULL, -- 'star_report', 'ast_reflection', 'talia_coach', 'metalia'
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255),
  
  -- Conversation content
  user_message TEXT NOT NULL,
  talia_response TEXT NOT NULL,
  
  -- Context and environment data
  context_data JSONB, -- Workshop step, selected user, admin mode, etc.
  request_data JSONB, -- Original request parameters
  response_metadata JSONB, -- Confidence, source, tokens used, etc.
  
  -- User feedback and interaction data
  user_feedback JSONB, -- Ratings, helpful/unhelpful, follow-up questions
  conversation_outcome VARCHAR(100), -- 'completed', 'abandoned', 'escalated', 'error'
  
  -- Performance and technical metadata
  response_time_ms INTEGER,
  tokens_used INTEGER,
  api_cost_estimate DECIMAL(10, 6),
  
  -- Training and analysis metadata
  training_notes TEXT, -- Admin notes about conversation quality
  effectiveness_score DECIMAL(3, 2), -- 0.00 to 1.00 effectiveness rating
  requires_review BOOLEAN DEFAULT FALSE,
  analyzed_by_metalia BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_talia_conversations_persona_type ON talia_conversations(persona_type);
CREATE INDEX IF NOT EXISTS idx_talia_conversations_user_id ON talia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_talia_conversations_created_at ON talia_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_talia_conversations_session_id ON talia_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_talia_conversations_requires_review ON talia_conversations(requires_review) WHERE requires_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_talia_conversations_persona_date ON talia_conversations(persona_type, created_at);

-- ==================================================
-- Table: talia_escalations
-- Escalation requests from Talia personas to METAlia
-- ==================================================
CREATE TABLE IF NOT EXISTS talia_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Escalation metadata
  requesting_persona VARCHAR(50) NOT NULL, -- Which Talia made the request
  escalation_type VARCHAR(100) NOT NULL, -- 'clarification', 'instruction_improvement', 'error_report'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Escalation content
  question TEXT NOT NULL, -- What the persona needs clarification on
  context_data JSONB, -- Original conversation context that triggered escalation
  user_message TEXT, -- Original user message that caused confusion
  attempted_response TEXT, -- What the persona tried to respond before escalating
  
  -- Resolution data
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_review', 'resolved', 'closed'
  admin_response TEXT, -- Admin's response to the escalation
  resolution_notes TEXT, -- Additional notes about resolution
  metalia_analysis JSONB, -- METAlia's analysis of the escalation
  
  -- Follow-up actions
  instruction_updates JSONB, -- Instructions that were updated as a result
  training_improvements JSONB, -- Training that was added/modified
  
  -- Assignee and resolution tracking
  assigned_to INTEGER REFERENCES users(id), -- Admin assigned to handle this
  resolved_by INTEGER REFERENCES users(id), -- Admin who resolved this
  resolved_at TIMESTAMP,
  
  -- Related data
  related_conversation_id UUID REFERENCES talia_conversations(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for escalation management
CREATE INDEX IF NOT EXISTS idx_talia_escalations_status ON talia_escalations(status);
CREATE INDEX IF NOT EXISTS idx_talia_escalations_requesting_persona ON talia_escalations(requesting_persona);
CREATE INDEX IF NOT EXISTS idx_talia_escalations_priority ON talia_escalations(priority);
CREATE INDEX IF NOT EXISTS idx_talia_escalations_assigned_to ON talia_escalations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_talia_escalations_created_at ON talia_escalations(created_at);

-- ==================================================
-- Table: metalia_analyses
-- METAlia's analyses and recommendations
-- ==================================================
CREATE TABLE IF NOT EXISTS metalia_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Analysis metadata
  analysis_type VARCHAR(100) NOT NULL, -- 'conversation_pattern', 'instruction_effectiveness', 'persona_performance'
  target_persona VARCHAR(50), -- Which persona was analyzed (null for system-wide)
  
  -- Analysis scope and parameters
  time_range_start TIMESTAMP,
  time_range_end TIMESTAMP,
  sample_size INTEGER, -- Number of conversations analyzed
  analysis_parameters JSONB, -- Configuration used for analysis
  
  -- Analysis results
  findings JSONB NOT NULL, -- Structured findings from the analysis
  recommendations JSONB, -- Recommended actions
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00 confidence in analysis
  
  -- Implementation tracking
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'implemented', 'rejected'
  admin_notes TEXT, -- Admin review notes
  implementation_notes TEXT, -- Notes about implementation
  
  -- Follow-up and effectiveness
  effectiveness_measured BOOLEAN DEFAULT FALSE,
  effectiveness_results JSONB, -- Results after implementation
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for METAlia analyses
CREATE INDEX IF NOT EXISTS idx_metalia_analyses_type ON metalia_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_metalia_analyses_target_persona ON metalia_analyses(target_persona);
CREATE INDEX IF NOT EXISTS idx_metalia_analyses_status ON metalia_analyses(status);
CREATE INDEX IF NOT EXISTS idx_metalia_analyses_created_at ON metalia_analyses(created_at);

-- ==================================================
-- Table: conversation_topics
-- Topic categorization for conversations
-- ==================================================
CREATE TABLE IF NOT EXISTS conversation_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES talia_conversations(id) ON DELETE CASCADE,
  
  -- Topic classification
  topic VARCHAR(100) NOT NULL, -- 'workshop_reflection', 'report_generation', 'coaching_advice', etc.
  subtopic VARCHAR(100), -- More specific categorization
  confidence DECIMAL(3, 2), -- AI confidence in topic classification
  
  -- Topic metadata
  keywords TEXT[], -- Extracted keywords
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  complexity_score DECIMAL(3, 2), -- How complex the topic/question was
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for topic analysis
CREATE INDEX IF NOT EXISTS idx_conversation_topics_conversation_id ON conversation_topics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_topics_topic ON conversation_topics(topic);
CREATE INDEX IF NOT EXISTS idx_conversation_topics_sentiment ON conversation_topics(sentiment);

-- ==================================================
-- Table: persona_performance_metrics
-- Aggregated performance metrics for each persona
-- ==================================================
CREATE TABLE IF NOT EXISTS persona_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Persona and time period
  persona_type VARCHAR(50) NOT NULL,
  date_period DATE NOT NULL, -- Daily aggregation
  
  -- Volume metrics
  total_conversations INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_response_time_ms BIGINT DEFAULT 0,
  
  -- Quality metrics
  average_effectiveness_score DECIMAL(3, 2),
  positive_feedback_count INTEGER DEFAULT 0,
  negative_feedback_count INTEGER DEFAULT 0,
  escalation_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  average_response_time_ms DECIMAL(8, 2),
  total_tokens_used INTEGER DEFAULT 0,
  total_api_cost DECIMAL(10, 6) DEFAULT 0,
  
  -- Topic distribution
  topic_distribution JSONB, -- {"workshop_reflection": 45, "report_generation": 30, ...}
  
  -- Quality indicators
  conversation_completion_rate DECIMAL(5, 4), -- Percentage of conversations that reached natural conclusion
  user_satisfaction_score DECIMAL(3, 2), -- Average user satisfaction (if available)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one record per persona per day
  UNIQUE(persona_type, date_period)
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_persona_performance_metrics_persona_type ON persona_performance_metrics(persona_type);
CREATE INDEX IF NOT EXISTS idx_persona_performance_metrics_date_period ON persona_performance_metrics(date_period);
CREATE INDEX IF NOT EXISTS idx_persona_performance_metrics_persona_date ON persona_performance_metrics(persona_type, date_period);

-- ==================================================
-- Functions and Triggers
-- ==================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating updated_at columns
CREATE TRIGGER update_talia_conversations_updated_at 
    BEFORE UPDATE ON talia_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talia_escalations_updated_at 
    BEFORE UPDATE ON talia_escalations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metalia_analyses_updated_at 
    BEFORE UPDATE ON metalia_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_performance_metrics_updated_at 
    BEFORE UPDATE ON persona_performance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- Initial Data and Configuration
-- ==================================================

-- Add METAlia persona to the personas table if it exists
INSERT INTO personas (id, name, enabled, behavior, token_limit, created_at, updated_at)
VALUES (
  'metalia',
  'METAlia',
  true,
  '{"role": "meta_trainer", "capabilities": ["conversation_analysis", "training_coordination", "escalation_handling", "instruction_optimization"], "access_level": "admin_only"}',
  4000,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  enabled = EXCLUDED.enabled,
  behavior = EXCLUDED.behavior,
  token_limit = EXCLUDED.token_limit,
  updated_at = NOW();

-- ==================================================
-- Comments for Documentation
-- ==================================================

COMMENT ON TABLE talia_conversations IS 'Comprehensive logging of all Talia persona conversations for analysis and training';
COMMENT ON TABLE talia_escalations IS 'Escalation requests from Talia personas when they need clarification or help';
COMMENT ON TABLE metalia_analyses IS 'METAlia analyses and recommendations for improving persona performance';
COMMENT ON TABLE conversation_topics IS 'Topic categorization and sentiment analysis for conversations';
COMMENT ON TABLE persona_performance_metrics IS 'Daily aggregated performance metrics for each Talia persona';

COMMENT ON COLUMN talia_conversations.persona_type IS 'Which Talia persona conducted this conversation';
COMMENT ON COLUMN talia_conversations.context_data IS 'Complete context data including workshop step, admin mode, selected user, etc.';
COMMENT ON COLUMN talia_conversations.user_feedback IS 'User ratings, helpful/unhelpful feedback, follow-up questions';
COMMENT ON COLUMN talia_conversations.effectiveness_score IS 'Admin or METAlia-assessed effectiveness score (0.00-1.00)';
COMMENT ON COLUMN talia_conversations.requires_review IS 'Flag for conversations that need human review';
COMMENT ON COLUMN talia_conversations.analyzed_by_metalia IS 'Whether METAlia has analyzed this conversation yet';

COMMENT ON COLUMN talia_escalations.escalation_type IS 'Type of escalation: clarification, instruction_improvement, error_report';
COMMENT ON COLUMN talia_escalations.context_data IS 'Original conversation context that triggered the escalation';
COMMENT ON COLUMN talia_escalations.metalia_analysis IS 'METAlia analysis of the escalation and suggested resolution';
COMMENT ON COLUMN talia_escalations.instruction_updates IS 'Record of instruction changes made as a result of this escalation';

COMMENT ON COLUMN metalia_analyses.analysis_type IS 'Type of analysis: conversation_pattern, instruction_effectiveness, persona_performance';
COMMENT ON COLUMN metalia_analyses.findings IS 'Structured findings from METAlia analysis';
COMMENT ON COLUMN metalia_analyses.recommendations IS 'Recommended actions based on analysis';
COMMENT ON COLUMN metalia_analyses.confidence_score IS 'METAlia confidence in the analysis (0.00-1.00)';

-- ==================================================
-- Migration Completion Log
-- ==================================================

-- Log this migration
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('add_metalia_conversation_logging', NOW()) 
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'METAlia Conversation Logging System migration completed successfully!';
    RAISE NOTICE 'Created tables: talia_conversations, talia_escalations, metalia_analyses, conversation_topics, persona_performance_metrics';
    RAISE NOTICE 'Added METAlia persona to personas table';
    RAISE NOTICE 'System ready for comprehensive conversation logging and analysis';
END $$;