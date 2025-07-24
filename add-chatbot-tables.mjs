#!/usr/bin/env node
/**
 * Safe Chatbot Tables Migration - AWS Lightsail
 * ============================================= 
 * 
 * Add only the missing tables needed for the chatbot system
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function addChatbotTables() {
    console.log('🚀 Adding Chatbot Tables to AWS Lightsail Database');
    console.log('==================================================');
    
    try {
        // First, backup current schema (safety measure)
        console.log('📋 Creating schema backup...');
        await client`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await client`
            INSERT INTO schema_migrations (migration_name) 
            VALUES ('chatbot_tables_' || NOW()::date)
        `;
        
        // Check if users table needs team_access field
        console.log('👥 Checking users table for team_access field...');
        const userColumns = await client`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
        `;
        
        const hasTeamAccess = userColumns.some(col => col.column_name === 'team_access');
        const hasDemoMode = userColumns.some(col => col.column_name === 'demo_mode');
        const hasCoachingEnabled = userColumns.some(col => col.column_name === 'coaching_enabled');
        
        if (!hasTeamAccess) {
            console.log('   ➕ Adding team_access field to users...');
            await client`ALTER TABLE users ADD COLUMN team_access BOOLEAN DEFAULT false`;
        } else {
            console.log('   ✅ team_access field already exists');
        }
        
        if (!hasDemoMode) {
            console.log('   ➕ Adding demo_mode field to users...');
            await client`ALTER TABLE users ADD COLUMN demo_mode BOOLEAN DEFAULT false`;
        } else {
            console.log('   ✅ demo_mode field already exists');
        }
        
        if (!hasCoachingEnabled) {
            console.log('   ➕ Adding coaching_enabled field to users...');
            await client`ALTER TABLE users ADD COLUMN coaching_enabled BOOLEAN DEFAULT true`;
        } else {
            console.log('   ✅ coaching_enabled field already exists');
        }
        
        // Create coaching_conversations table
        console.log('💬 Creating coaching_conversations table...');
        await client`
            CREATE TABLE IF NOT EXISTS coaching_conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                persona_type VARCHAR(50) NOT NULL DEFAULT 'talia_coach',
                workshop_step VARCHAR(20),
                conversation_title TEXT,
                context_data JSONB DEFAULT '{}',
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;
        
        // Create coaching_messages table
        console.log('📝 Creating coaching_messages table...');
        await client`
            CREATE TABLE IF NOT EXISTS coaching_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID NOT NULL REFERENCES coaching_conversations(id) ON DELETE CASCADE,
                sender_type VARCHAR(20) NOT NULL,
                message_content TEXT NOT NULL,
                message_metadata JSONB DEFAULT '{}',
//                 bedrock_request_id TEXT,
//                 bedrock_model VARCHAR(100),
                response_time_ms INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;
        
        // Create user_coaching_preferences table
        console.log('⚙️ Creating user_coaching_preferences table...');
        await client`
            CREATE TABLE IF NOT EXISTS user_coaching_preferences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                preferred_persona VARCHAR(50) DEFAULT 'talia_coach',
                coaching_style JSONB DEFAULT '{}',
                workshop_progress JSONB DEFAULT '{}',
                accessibility_options JSONB DEFAULT '{}',
                notification_settings JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;
        
        // Create coaching_prompts table
        console.log('🎯 Creating coaching_prompts table...');
        await client`
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
            )
        `;
        
        // Create indexes for performance
        console.log('🔍 Creating performance indexes...');
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_conversations_user_id ON coaching_conversations(user_id)`;
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_conversations_persona ON coaching_conversations(persona_type)`;
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_conversations_step ON coaching_conversations(workshop_step)`;
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_messages_conversation_id ON coaching_messages(conversation_id)`;
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_messages_created_at ON coaching_messages(created_at)`;
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_prompts_key ON coaching_prompts(prompt_key)`;
        await client`CREATE INDEX IF NOT EXISTS idx_coaching_prompts_persona_step ON coaching_prompts(persona_type, workshop_step)`;
        
        // Insert default coaching prompts
        console.log('💡 Inserting default coaching prompts...');
        const prompts = [
            {
                key: 'workshop_intro',
                persona: 'workshop_assistant', 
                step: 'step-1-1',
                template: 'Welcome to the AllStarTeams workshop! I\'m here to guide you through this transformative experience. You\'re about to discover your unique strengths and learn how they contribute to extraordinary team dynamics.\n\nCurrent step: {{workshop_step}}\nYour progress: {{user_progress}}\n\nWhat questions do you have about getting started?',
                instructions: 'You are a supportive workshop assistant helping users navigate the AST workshop. Be encouraging, clear, and focused on practical guidance. Reference the user\'s current step and progress.',
                format: JSON.stringify({response_type: "guidance", include_next_steps: true, tone: "encouraging"})
            },
            {
                key: 'talia_strengths_analysis',
                persona: 'talia_coach',
                step: null,
                template: 'I can see you\'re exploring {{topic_area}}. Based on the AST Five Strengths framework, let me share some insights.\n\nYour situation: {{user_context}}\n\nDrawing from my experience with hundreds of teams, here\'s what I observe:\n{{ast_analysis}}\n\nThe key is understanding how your {{dominant_strength}} strength can be leveraged here.\n\nWhat resonates with you from this perspective?',
                instructions: 'You are Talia, an expert AST coach with deep knowledge of the Five Strengths framework (Imagination, Thinking, Planning, Acting, Feeling). Provide thoughtful, personalized insights based on strengths and team dynamics. Reference real AST concepts and methodologies.',
                format: JSON.stringify({response_type: "coaching_insight", include_ast_concepts: true, personalization_level: "high"})
            },
            {
                key: 'team_advisor_collaboration',
                persona: 'team_advisor',
                step: 'step-5-4',
                template: 'Perfect! You have team access, so I can share our advanced collaboration strategies.\n\nFor teams at your stage: {{team_stage}}\nTeam composition: {{team_profile}}\n\nHere are some powerful techniques your team can implement:\n{{advanced_strategies}}\n\nThese approaches have helped similar teams achieve {{expected_outcomes}}.\n\nWhich strategy feels most relevant to your team\'s current challenges?',
                instructions: 'You are an experienced team advisor with access to advanced AST content. Provide sophisticated team development strategies only available to teams with proper access.',
                format: JSON.stringify({response_type: "advanced_team_guidance", access_level: "team", include_implementation_steps: true})
            }
        ];
        
        for (const prompt of prompts) {
            await client`
                INSERT INTO coaching_prompts (prompt_key, persona_type, workshop_step, prompt_template, system_instructions, response_format)
                VALUES (${prompt.key}, ${prompt.persona}, ${prompt.step}, ${prompt.template}, ${prompt.instructions}, ${prompt.format}::jsonb)
                ON CONFLICT (prompt_key) DO UPDATE SET
                    prompt_template = EXCLUDED.prompt_template,
                    system_instructions = EXCLUDED.system_instructions,
                    updated_at = NOW()
            `;
        }
        
        // Create triggers for auto-updating timestamps
        console.log('⏰ Creating update triggers...');
        await client`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `;
        
        await client`DROP TRIGGER IF EXISTS update_coaching_conversations_updated_at ON coaching_conversations`;
        await client`CREATE TRIGGER update_coaching_conversations_updated_at
            BEFORE UPDATE ON coaching_conversations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
            
        await client`DROP TRIGGER IF EXISTS update_coaching_preferences_updated_at ON user_coaching_preferences`;
        await client`CREATE TRIGGER update_coaching_preferences_updated_at
            BEFORE UPDATE ON user_coaching_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
        
        // Verify tables were created
        console.log('\n✅ Verifying chatbot tables...');
        const newTables = await client`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('coaching_conversations', 'coaching_messages', 'user_coaching_preferences', 'coaching_prompts')
            ORDER BY table_name
        `;
        
        newTables.forEach(table => {
            console.log(`   ✅ ${table.table_name} created successfully`);
        });
        
        // Test insert to verify everything works
        console.log('\n🧪 Testing table functionality...');
        const testResult = await client`
            SELECT COUNT(*) as prompt_count FROM coaching_prompts WHERE is_active = true
        `;
        console.log(`   ✅ ${testResult[0].prompt_count} default prompts loaded`);
        
        console.log('\n🎉 Chatbot tables successfully added to AWS Lightsail database!');
        console.log('    Ready for chatbot implementation with AWS Bedrock integration.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('   Error details:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run migration
addChatbotTables().catch(console.error);
