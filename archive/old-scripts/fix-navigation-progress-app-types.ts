/**
 * Fix Navigation Progress App Types
 * This script fixes the data inconsistency where IA steps were saved with appType "ast" instead of "ia"
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import * as schema from './shared/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function fixNavigationProgressAppTypes() {
  try {
    console.log('🔧 Starting navigation progress app type fix...');

    // Get all users with navigation progress
    const users = await db.select().from(schema.users);

    let fixedUsers = 0;
    let totalUsers = 0;

    for (const user of users) {
      totalUsers++;
      
      if (!user.navigationProgress) continue;

      try {
        const progress = JSON.parse(user.navigationProgress);
        const { completedSteps, currentStepId, appType } = progress;

        // Check if this progress has IA steps but wrong app type
        const hasIASteps = (completedSteps && completedSteps.some((step: string) => step.startsWith('ia-'))) ||
                          (currentStepId && currentStepId.startsWith('ia-'));

        if (hasIASteps && appType === 'ast') {
          console.log(`🔧 Fixing user ${user.id} (${user.username}): IA steps with AST app type`);
          
          // Update the app type to 'ia'
          const correctedProgress = {
            ...progress,
            appType: 'ia'
          };

          await db.update(schema.users)
            .set({
              navigationProgress: JSON.stringify(correctedProgress),
              updatedAt: new Date()
            })
            .where(eq(schema.users.id, user.id));

          // Also check if there's a separate navigation progress record that needs fixing
          const separateProgress = await db
            .select()
            .from(schema.navigationProgress)
            .where(and(
              eq(schema.navigationProgress.userId, user.id),
              eq(schema.navigationProgress.appType, 'ast')
            ));

          for (const record of separateProgress) {
            const recordSteps = JSON.parse(record.completedSteps);
            const recordHasIASteps = recordSteps.some((step: string) => step.startsWith('ia-')) ||
                                   record.currentStepId.startsWith('ia-');

            if (recordHasIASteps) {
              console.log(`🔧 Fixing separate navigation progress record ${record.id} for user ${user.id}`);
              
              await db.update(schema.navigationProgress)
                .set({
                  appType: 'ia',
                  updatedAt: new Date()
                })
                .where(eq(schema.navigationProgress.id, record.id));
            }
          }

          fixedUsers++;
          console.log(`✅ Fixed user ${user.id}: ${completedSteps.length} IA steps corrected to app type 'ia'`);
        } else if (!hasIASteps && appType === 'ia') {
          // Edge case: AST steps with IA app type (less likely but possible)
          console.log(`🔧 Fixing user ${user.id} (${user.username}): AST steps with IA app type`);
          
          const correctedProgress = {
            ...progress,
            appType: 'ast'
          };

          await db.update(schema.users)
            .set({
              navigationProgress: JSON.stringify(correctedProgress),
              updatedAt: new Date()
            })
            .where(eq(schema.users.id, user.id));

          fixedUsers++;
          console.log(`✅ Fixed user ${user.id}: AST steps corrected to app type 'ast'`);
        } else {
          console.log(`✓ User ${user.id} (${user.username}): App type is correct (${appType})`);
        }

      } catch (parseError) {
        console.error(`❌ Failed to parse navigation progress for user ${user.id}:`, parseError);
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`   Total users checked: ${totalUsers}`);
    console.log(`   Users fixed: ${fixedUsers}`);
    console.log(`   Users with correct data: ${totalUsers - fixedUsers}`);

    if (fixedUsers > 0) {
      console.log(`\n✅ Navigation progress app types have been fixed!`);
      console.log(`   IA steps are now correctly saved with appType: 'ia'`);
      console.log(`   AST steps are now correctly saved with appType: 'ast'`);
    } else {
      console.log(`\n✅ All navigation progress data is already correct!`);
    }

  } catch (error) {
    console.error('❌ Error fixing navigation progress app types:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
fixNavigationProgressAppTypes()
  .then(() => {
    console.log('\n🎉 Navigation progress app type fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });