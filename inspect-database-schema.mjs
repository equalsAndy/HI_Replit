#!/usr/bin/env node
/**
 * Database Schema Inspector
 * ========================
 * 
 * Safely inspect current database schema and plan the chatbot migration
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

async function inspectDatabase() {
    console.log('🔍 SAFE DATABASE INSPECTION');
    console.log('===========================');
    
    const client = postgres(process.env.DATABASE_URL);
    
    try {
        // Check basic connection
        const dbInfo = await client`SELECT current_database(), version()`;
        console.log('✅ Connected to:', dbInfo[0].current_database);
        console.log('📊 PostgreSQL version:', dbInfo[0].version.split(' ')[1]);
        
        // List all tables
        const tables = await client`
            SELECT table_name, table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        console.log('\n📋 EXISTING TABLES:');
        console.log('==================');
        tables.forEach(table => {
            console.log(`  • ${table.table_name} (${table.table_type})`);
        });
        
        // Check if users table has the fields we need for chatbot
        const userColumns = await client`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        console.log('\n👤 USERS TABLE STRUCTURE:');
        console.log('=========================');
        userColumns.forEach(col => {
            console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
        });
        
        // Check for chatbot-specific fields in users table
        const chatbotFields = ['team_access', 'coaching_enabled', 'demo_mode'];
        const missingFields = chatbotFields.filter(field => 
            !userColumns.some(col => col.column_name === field)
        );
        
        console.log('\n🤖 CHATBOT FIELD STATUS:');
        console.log('========================');
        chatbotFields.forEach(field => {
            const exists = userColumns.some(col => col.column_name === field);
            console.log(`  • ${field}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });
        
        // Check for chatbot tables
        const chatbotTables = [
            'coaching_conversations',
            'coaching_messages', 
            'user_coaching_preferences',
            'coaching_prompts'
        ];
        
        console.log('\n💬 CHATBOT TABLE STATUS:');
        console.log('========================');
        chatbotTables.forEach(tableName => {
            const exists = tables.some(table => table.table_name === tableName);
            console.log(`  • ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });
        
        // Count records in existing tables to understand data volume
        console.log('\n📊 DATA VOLUME CHECK:');
        console.log('====================');
        
        for (const table of tables) {
            try {
                const count = await client`SELECT COUNT(*) as count FROM ${client(table.table_name)}`;
                console.log(`  • ${table.table_name}: ${count[0].count} records`);
            } catch (error) {
                console.log(`  • ${table.table_name}: Error counting records`);
            }
        }
        
        // Generate migration plan
        console.log('\n📝 MIGRATION PLAN:');
        console.log('==================');
        
        if (missingFields.length > 0) {
            console.log('🔧 REQUIRED USER TABLE UPDATES:');
            missingFields.forEach(field => {
                console.log(`  • ADD COLUMN ${field} (safe operation)`);
            });
        }
        
        const missingTables = chatbotTables.filter(tableName => 
            !tables.some(table => table.table_name === tableName)
        );
        
        if (missingTables.length > 0) {
            console.log('🆕 TABLES TO CREATE:');
            missingTables.forEach(table => {
                console.log(`  • CREATE TABLE ${table} (safe operation - new table)`);
            });
        }
        
        console.log('\n✅ SAFETY ASSESSMENT:');
        console.log('=====================');
        console.log('• All proposed changes are SAFE (additive only)');
        console.log('• No existing data will be modified or deleted');
        console.log('• All changes are backward compatible');
        console.log('• System can continue running during migration');
        
        if (missingFields.length === 0 && missingTables.length === 0) {
            console.log('\n🎉 DATABASE IS READY!');
            console.log('All required tables and fields already exist.');
        } else {
            console.log('\n🚧 MIGRATION NEEDED');
            console.log('Safe additive migration required.');
        }
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error.message);
    } finally {
        await client.end();
    }
}

inspectDatabase().catch(console.error);
