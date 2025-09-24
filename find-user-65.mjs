#!/usr/bin/env node
/**
 * Find User 65 and Check Report Generation Status
 * ==============================================
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function findUser65() {
    console.log('🔍 Looking for User 65 in RDS Database');
    console.log('=====================================');

    try {
        // Check database connection
        const dbInfo = await client`SELECT current_database()`;
        console.log(`✅ Connected to: ${dbInfo[0].current_database}`);

        // Look for user 65
        console.log('\n👤 Searching for User 65:');
        const user65 = await client`
            SELECT id, username, name, email, role, ast_workshop_completed, ia_workshop_completed, created_at
            FROM users
            WHERE id = 65
        `;

        if (user65.length === 0) {
            console.log('❌ User 65 not found');

            // Check what users exist around that range
            console.log('\n📊 Users in ID range 60-70:');
            const nearbyUsers = await client`
                SELECT id, username, name
                FROM users
                WHERE id BETWEEN 60 AND 70
                ORDER BY id
            `;

            if (nearbyUsers.length === 0) {
                console.log('❌ No users found in range 60-70');

                // Check highest user ID
                const maxUser = await client`
                    SELECT MAX(id) as max_id, COUNT(*) as total_users
                    FROM users
                `;
                console.log(`📈 Highest user ID: ${maxUser[0].max_id}, Total users: ${maxUser[0].total_users}`);

                // Show recent users
                console.log('\n📝 Last 5 users:');
                const recentUsers = await client`
                    SELECT id, username, name, created_at
                    FROM users
                    ORDER BY id DESC
                    LIMIT 5
                `;
                console.table(recentUsers);
            } else {
                console.table(nearbyUsers);
            }
        } else {
            console.log('✅ User 65 found!');
            console.table(user65);

            // Check for report generation status in various places
            console.log('\n📊 Checking report generation status...');

            // Check user_assessments table
            const assessments = await client`
                SELECT assessment_type, created_at
                FROM user_assessments
                WHERE user_id = 65
                ORDER BY created_at DESC
            `;

            if (assessments.length > 0) {
                console.log('\n📋 User Assessments:');
                console.table(assessments);
            } else {
                console.log('❌ No assessments found for user 65');
            }

            // Check any holistic report related tables
            console.log('\n🔍 Checking for holistic report tables...');
            const holisticTables = await client`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name LIKE '%holistic%' OR table_name LIKE '%report%'
            `;

            if (holisticTables.length > 0) {
                console.log('📋 Report-related tables found:');
                console.table(holisticTables);

                // Check each table for user 65
                for (const table of holisticTables) {
                    try {
                        const records = await client.unsafe(`
                            SELECT * FROM ${table.table_name}
                            WHERE user_id = 65
                        `);
                        if (records.length > 0) {
                            console.log(`\n📄 Records in ${table.table_name}:`);
                            console.table(records);
                        }
                    } catch (err) {
                        console.log(`⚠️ Could not query ${table.table_name}: ${err.message}`);
                    }
                }
            } else {
                console.log('❌ No holistic report tables found');
            }

            // Check workshop_step_data for completion status
            const stepData = await client`
                SELECT step_id, data, updated_at
                FROM workshop_step_data
                WHERE user_id = 65
                ORDER BY updated_at DESC
                LIMIT 10
            `;

            if (stepData.length > 0) {
                console.log('\n📊 Recent workshop step data:');
                console.table(stepData);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed');
    }
}

// Run the function
findUser65().catch(console.error);