-- AST AI Coaching Chatbot System Database Migration
-- Run Date: July 19, 2025

BEGIN;

-- Add team_access field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS team_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS coaching_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS demo_mode BOOLEAN DEFAULT false;

-- Create coaching_conversations table
CREATE TABLE IF NOT EXISTS coaching_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    persona_type VARCHAR(50) NOT NULL DEFAULT 'talia_coach', -- 'workshop_assistant', 'talia_coach', 'team_advisor'
    workshop_step VARCHAR(20), -- e.g., 'step-5-4', 'step-1-1'
    conversation_title TEXT,
    context_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaching_messages table
CREATE TABLE IF NOT EXISTS coaching_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES coaching_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'ai_coach'
    message_content TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}', -- response_type, confidence_score, prompt_used, etc.
// // // //     bedrock_request_id TEXT, -- AWS Bedrock request tracking
// // // //     bedrock_model VARCHAR(100), -- Model used for response
    response_time_ms INTEGER, -- Performance tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_coaching_preferences table
CREATE TABLE IF NOT EXISTS user_coaching_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_persona VARCHAR(50) DEFAULT 'talia_coach',
    coaching_style JSONB DEFAULT '{}', -- personality preferences, communication style
    workshop_progress JSONB DEFAULT '{}', -- completed steps, current focus areas
    accessibility_options JSONB DEFAULT '{}', -- text size, language preferences
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaching_prompts table for system prompts
CREATE TABLE IF NOT EXISTS coaching_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key VARCHAR(100) NOT NULL UNIQUE,
    persona_type VARCHAR(50) NOT NULL,
    workshop_step VARCHAR(20),
    prompt_template TEXT NOT NULL,
    system_instructions TEXT,
    response_format JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_user_id ON coaching_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_persona ON coaching_conversations(persona_type);
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_step ON coaching_conversations(workshop_step);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_conversation_id ON coaching_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_created_at ON coaching_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_coaching_prompts_key ON coaching_prompts(prompt_key);
CREATE INDEX IF NOT EXISTS idx_coaching_prompts_persona_step ON coaching_prompts(persona_type, workshop_step);

-- Insert default coaching prompts
INSERT INTO coaching_prompts (prompt_key, persona_type, workshop_step, prompt_template, system_instructions, response_format) VALUES

-- Workshop Assistant Prompts
('workshop_intro', 'workshop_assistant', 'step-1-1', 
'Welcome to the AllStarTeams workshop! I''m here to guide you through this transformative experience. You''re about to discover your unique strengths and learn how they contribute to extraordinary team dynamics.

Current step: {{workshop_step}}
Your progress: {{user_progress}}

What questions do you have about getting started?', 
'You are a supportive workshop assistant helping users navigate the AST workshop. Be encouraging, clear, and focused on practical guidance. Reference the user''s current step and progress.',
'{"response_type": "guidance", "include_next_steps": true, "tone": "encouraging"}'),

('workshop_step_guidance', 'workshop_assistant', null,
'Let me help you with {{workshop_step}}. This step focuses on {{step_description}}.

Based on your current progress: {{user_progress}}

Here''s what you need to know:
{{step_guidance}}

Would you like me to explain any specific part in more detail?',
'Provide clear, step-by-step guidance for workshop activities. Reference AST methodology and keep responses practical and actionable.',
'{"response_type": "step_guidance", "include_examples": true}'),

-- Talia Coach Prompts  
('talia_strengths_analysis', 'talia_coach', null,
'I can see you''re exploring {{topic_area}}. Based on the AST Five Strengths framework, let me share some insights.

Your situation: {{user_context}}

Drawing from my experience with hundreds of teams, here''s what I observe:
{{ast_analysis}}

The key is understanding how your {{dominant_strength}} strength can be leveraged here. 

What resonates with you from this perspective?',
'You are Talia, an expert AST coach with deep knowledge of the Five Strengths framework (Imagination, Thinking, Planning, Acting, Feeling). Provide thoughtful, personalized insights based on strengths and team dynamics. Reference real AST concepts and methodologies.',
'{"response_type": "coaching_insight", "include_ast_concepts": true, "personalization_level": "high"}'),

('talia_team_dynamics', 'talia_coach', null,
'Team dynamics are fascinating! What you''re describing reminds me of the {{ast_pattern}} pattern I often see.

Your team context: {{team_situation}}

From an AST perspective, this relates to:
- {{strength_distribution}}
- {{flow_patterns}}
- {{collaboration_opportunities}}

The Heliotropic Effect suggests your team will naturally move toward what gives life. What''s drawing energy in your current situation?',
'Channel Talia''s expertise in team dynamics and AST methodology. Focus on strengths, flow states, and positive team patterns. Use AST-specific language and concepts.',
'{"response_type": "team_coaching", "include_heliotropic_analysis": true}'),

-- Team Advisor Prompts
('team_advisor_collaboration', 'team_advisor', 'step-5-4',
'Perfect! You have team access, so I can share our advanced collaboration strategies.

For teams at your stage: {{team_stage}}
Team composition: {{team_profile}}

Here are some powerful techniques your team can implement:
{{advanced_strategies}}

These approaches have helped similar teams achieve {{expected_outcomes}}.

Which strategy feels most relevant to your team''s current challenges?',
'You are an experienced team advisor with access to advanced AST content. Provide sophisticated team development strategies only available to teams with proper access.',
'{"response_type": "advanced_team_guidance", "access_level": "team", "include_implementation_steps": true}'),

('team_advisor_assessment', 'team_advisor', null,
'Let''s analyze your team''s strengths constellation. Based on what you''ve shared:

Current team dynamics: {{team_assessment}}

I''m seeing opportunities for:
{{improvement_areas}}

The AST approach would suggest focusing on {{recommended_focus}} to enhance your team''s {{target_outcome}}.

Shall we dive deeper into any of these areas?',
'Provide expert team analysis using AST frameworks. Focus on practical team development recommendations.',
'{"response_type": "team_analysis", "include_action_items": true}')

ON CONFLICT (prompt_key) DO UPDATE SET
prompt_template = EXCLUDED.prompt_template,
system_instructions = EXCLUDED.system_instructions,
updated_at = NOW();

-- Create trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_coaching_conversations_updated_at ON coaching_conversations;
CREATE TRIGGER update_coaching_conversations_updated_at
    BEFORE UPDATE ON coaching_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coaching_preferences_updated_at ON user_coaching_preferences;
CREATE TRIGGER update_coaching_preferences_updated_at
    BEFORE UPDATE ON user_coaching_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coaching_prompts_updated_at ON coaching_prompts;
CREATE TRIGGER update_coaching_prompts_updated_at
    BEFORE UPDATE ON coaching_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Verify tables were created
\dt coaching*;
