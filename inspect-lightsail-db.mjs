#!/usr/bin/env node
/**
 * Database Inspector - Check Lightsail Database Schema
 * ==================================================
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function inspectDatabase() {
    console.log('🔍 Inspecting AWS Lightsail Database');
    console.log('====================================');
    
    try {
        // Check database connection
        const dbInfo = await client`SELECT current_database(), version()`;
        console.log(`✅ Connected to: ${dbInfo[0].current_database}`);
        console.log(`📊 PostgreSQL Version: ${dbInfo[0].version.split(' ')[1]}`);
        
        // List all tables
        console.log('\n📋 Current Tables:');
        const tables = await client`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `;
        
        if (tables.length === 0) {
            console.log('   No tables found in public schema');
        } else {
            tables.forEach(table => {
                console.log(`   • ${table.table_name} (${table.table_type})`);
            });
        }
        
        // Check for coaching-related tables specifically
        console.log('\n🤖 Coaching System Tables:');
        const coachingTables = tables.filter(t => 
            t.table_name.includes('coaching') || 
            t.table_name.includes('coach') ||
            t.table_name.includes('vector')
        );
        
        if (coachingTables.length === 0) {
            console.log('   ❌ No coaching tables found - need to create them');
        } else {
            coachingTables.forEach(table => {
                console.log(`   ✅ ${table.table_name}`);
            });
        }
        
        // Check for users table (needed for chatbot)
        console.log('\n👥 User Management:');
        const userTables = tables.filter(t => t.table_name.includes('user'));
        if (userTables.length === 0) {
            console.log('   ❌ No user tables found');
        } else {
            userTables.forEach(table => {
                console.log(`   ✅ ${table.table_name}`);
            });
            
            // Check users table structure
            const userColumns = await client`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'users' AND table_schema = 'public'
                ORDER BY ordinal_position
            `;
            
            if (userColumns.length > 0) {
                console.log('\n   👤 Users Table Structure:');
                userColumns.forEach(col => {
                    console.log(`      • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
                });
            }
        }
        
        // Check database size and stats
        console.log('\n📊 Database Statistics:');
        const stats = await client`
            SELECT 
                pg_size_pretty(pg_database_size(current_database())) as db_size,
                (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
        `;
        console.log(`   Database Size: ${stats[0].db_size}`);
        console.log(`   Total Tables: ${stats[0].table_count}`);
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error.message);
    } finally {
        await client.end();
    }
}

// Run inspection
inspectDatabase();
