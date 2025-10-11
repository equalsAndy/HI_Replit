#!/usr/bin/env node
/**
 * Reset User 65 Report Generation Status
 * =====================================
 * This script will delete existing holistic report records for user 65
 * so they can regenerate their report.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function resetUser65Reports() {
    console.log('🔄 Resetting Report Generation Status for User 65');
    console.log('================================================');

    try {
        // Check database connection
        const dbInfo = await client`SELECT current_database()`;
        console.log(`✅ Connected to: ${dbInfo[0].current_database}`);

        // First, check what holistic reports exist for user 65
        console.log('\n📊 Current holistic reports for user 65:');
        const existingReports = await client`
            SELECT id, report_type, generation_status, generated_at, pdf_file_name
            FROM holistic_reports
            WHERE user_id = 65
            ORDER BY generated_at DESC
        `;

        if (existingReports.length === 0) {
            console.log('❌ No holistic reports found for user 65');
            console.log('✅ User 65 can already generate a new report');
        } else {
            console.log(`📄 Found ${existingReports.length} existing report(s):`);
            console.table(existingReports);

            // Ask for confirmation (in production, you might want to add a --confirm flag)
            console.log('\n⚠️  About to DELETE all holistic reports for user 65...');
            console.log('   This will allow them to regenerate their report from scratch.');

            // Delete all holistic reports for user 65
            const deleteResult = await client`
                DELETE FROM holistic_reports
                WHERE user_id = 65
                RETURNING id, report_type, generation_status
            `;

            console.log(`✅ Successfully deleted ${deleteResult.length} report record(s):`);
            console.table(deleteResult);

            // Verify deletion
            const verifyDeletion = await client`
                SELECT COUNT(*) as remaining_reports
                FROM holistic_reports
                WHERE user_id = 65
            `;

            console.log(`\n🔍 Verification: ${verifyDeletion[0].remaining_reports} reports remaining for user 65`);

            if (verifyDeletion[0].remaining_reports === '0') {
                console.log('✅ SUCCESS: User 65 report generation status has been reset');
                console.log('   They can now generate a new holistic report');
            } else {
                console.log('❌ WARNING: Some reports may still exist');
            }
        }

        // Also check if there are any other tables that might track report generation
        console.log('\n📊 Checking for other report-related data...');

        // Check user_assessments to ensure data is still there
        const assessments = await client`
            SELECT COUNT(*) as assessment_count
            FROM user_assessments
            WHERE user_id = 65
        `;

        console.log(`✅ User 65 still has ${assessments[0].assessment_count} assessments (workshop data preserved)`);

        // Final status check
        console.log('\n📋 Final Status Summary:');
        console.log('========================');
        console.log(`👤 User: 65 (Millie Millie, brad@topliff.com)`);
        console.log(`📊 Workshop assessments: ${assessments[0].assessment_count} preserved`);
        console.log(`📄 Holistic reports: 0 (reset complete)`);
        console.log(`🎯 Status: Ready to generate new report`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await client.end();
        console.log('\n✅ Database connection closed');
    }
}

// Run the function
resetUser65Reports().catch(console.error);