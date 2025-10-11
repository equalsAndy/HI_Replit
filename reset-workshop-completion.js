// Reset user 67's workshop completion status
// Run this from your project root with: node reset-workshop-completion.js

import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function resetWorkshopCompletion() {
  try {
    console.log('🔄 Resetting workshop completion for user 67...');
    
    // Reset workshop completion flags
    const result = await db
      .update(users)
      .set({
        astWorkshopCompleted: false,
        iaWorkshopCompleted: false,
        astCompletedAt: null,
        iaCompletedAt: null
      })
      .where(eq(users.id, 67))
      .returning();
    
    console.log('✅ Workshop completion reset successfully:', result[0]);
    console.log('🎯 User 67 can now access unlocked workshop content again');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting workshop completion:', error);
    process.exit(1);
  }
}

resetWorkshopCompletion();
