#!/usr/bin/env node
/**
 * AST Coaching Chatbot Database Migration Runner
 * ============================================
 * 
 * Creates the coaching chatbot system tables and inserts default prompts.
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCoachingMigration() {
    console.log('🚀 Starting AST Coaching Chatbot Migration...');
    
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'ast_coaching',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || ''
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'migrations', 'add-coaching-chatbot-system.sql');
        
        if (!fs.existsSync(migrationPath)) {
            // Create the migration SQL inline if file doesn't exist
            const migrationSQL = `
-- AST AI Coaching Chatbot System Database Migration
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
    persona_type VARCHAR(50) NOT NULL DEFAULT 'talia_coach',
    workshop_step VARCHAR(20),
    conversation_title TEXT,
    context_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaching_messages table
CREATE TABLE IF NOT EXISTS coaching_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES coaching_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}',
    bedrock_request_id TEXT,
    bedrock_model VARCHAR(100),
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_coaching_preferences table
CREATE TABLE IF NOT EXISTS user_coaching_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_persona VARCHAR(50) DEFAULT 'talia_coach',
    coaching_style JSONB DEFAULT '{}',
    workshop_progress JSONB DEFAULT '{}',
    accessibility_options JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaching_prompts table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_user_id ON coaching_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_conversation_id ON coaching_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coaching_prompts_key ON coaching_prompts(prompt_key);

COMMIT;
            `;
            
            await client.query(migrationSQL);
            console.log('✅ Core tables created');
        } else {
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            await client.query(migrationSQL);
            console.log('✅ Migration executed from file');
        }

        // Insert default coaching prompts
        await insertDefaultPrompts(client);

        // Verify tables exist
        const result = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'coaching%'
            ORDER BY table_name;
        `);

        console.log('📊 Created tables:');
        result.rows.forEach(row => {
            console.log(`   ✅ ${row.table_name}`);
        });

        console.log('🎉 AST Coaching Chatbot Migration Complete!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

async function insertDefaultPrompts(client) {
    console.log('📝 Inserting default coaching prompts...');

    const prompts = [
        {
            prompt_key: 'workshop_intro',
            persona_type: 'workshop_assistant',
            workshop_step: 'step-1-1',
            prompt_template: 'Welcome to the AllStarTeams workshop! I\'m here to guide you through this transformative experience.',
            system_instructions: 'You are a supportive workshop assistant helping users navigate the AST workshop. Be encouraging and clear.',
            response_format: JSON.stringify({response_type: 'guidance', tone: 'encouraging'})
        },
        {
            prompt_key: 'talia_strengths_analysis',
            persona_type: 'talia_coach',
            workshop_step: null,
            prompt_template: 'Based on the AST Five Strengths framework, let me share some insights about your situation.',
            system_instructions: 'You are Talia, an expert AST coach with deep knowledge of the Five Strengths framework. Provide thoughtful, personalized insights.',
            response_format: JSON.stringify({response_type: 'coaching_insight', personalization_level: 'high'})
        },
        {
            prompt_key: 'team_advisor_collaboration',
            persona_type: 'team_advisor',
            workshop_step: 'step-5-4',
            prompt_template: 'Perfect! You have team access, so I can share our advanced collaboration strategies.',
            system_instructions: 'You are an experienced team advisor with access to advanced AST content. Provide sophisticated team development strategies.',
            response_format: JSON.stringify({response_type: 'advanced_team_guidance', access_level: 'team'})
        }
    ];

    for (const prompt of prompts) {
        try {
            await client.query(`
                INSERT INTO coaching_prompts (prompt_key, persona_type, workshop_step, prompt_template, system_instructions, response_format)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (prompt_key) DO UPDATE SET
                prompt_template = EXCLUDED.prompt_template,
                system_instructions = EXCLUDED.system_instructions,
                updated_at = NOW()
            `, [prompt.prompt_key, prompt.persona_type, prompt.workshop_step, prompt.prompt_template, prompt.system_instructions, prompt.response_format]);
            
            console.log(`   ✅ ${prompt.prompt_key}`);
        } catch (error) {
            console.log(`   ⚠️ Failed to insert ${prompt.prompt_key}: ${error.message}`);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCoachingMigration().catch(console.error);
}

export { runCoachingMigration };
