-- Add team access field to users table
ALTER TABLE users ADD COLUMN team_access BOOLEAN DEFAULT true NOT NULL;

-- AI Coaching Conversations table
CREATE TABLE coaching_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) NOT NULL, -- 'workshop_assistant', 'post_workshop_coach', 'team_prep'
  context VARCHAR(100), -- workshop step or context info
  conversation_data JSONB NOT NULL DEFAULT '[]', -- array of messages
  session_started_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coaching messages table for individual messages
CREATE TABLE coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES coaching_conversations(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  context_used JSONB, -- what knowledge was used for this response
  workshop_step VARCHAR(20), -- current step when message was sent
  timestamp TIMESTAMP DEFAULT NOW(),
  demo_mode BOOLEAN DEFAULT false
);

-- Coaching preferences for users
CREATE TABLE user_coaching_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  coaching_enabled BOOLEAN DEFAULT true,
  preferred_coach_persona VARCHAR(50) DEFAULT 'talia', -- 'talia', 'mentor', 'advisor'
  interaction_style VARCHAR(50) DEFAULT 'supportive', -- 'direct', 'supportive', 'analytical'
  reminder_frequency VARCHAR(50) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'none'
  topics_of_interest JSONB DEFAULT '[]', -- array of topics user wants coaching on
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coaching knowledge prompts (specific prompts for different scenarios)
CREATE TABLE coaching_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type VARCHAR(100) NOT NULL, -- 'workshop_assistant', 'strength_coaching', 'flow_guidance'
  context VARCHAR(100), -- workshop step or situation
  system_prompt TEXT NOT NULL,
  example_responses JSONB, -- example good responses
  constraints JSONB, -- what the AI should/shouldn't do
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_coaching_conversations_user_id ON coaching_conversations(user_id);
CREATE INDEX idx_coaching_conversations_type ON coaching_conversations(conversation_type);
CREATE INDEX idx_coaching_messages_conversation_id ON coaching_messages(conversation_id);
CREATE INDEX idx_coaching_messages_timestamp ON coaching_messages(timestamp);
CREATE INDEX idx_user_coaching_preferences_user_id ON user_coaching_preferences(user_id);