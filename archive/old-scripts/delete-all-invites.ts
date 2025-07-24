
import { db } from './server/db';
import { invites } from './shared/schema';

async function deleteAllInvites() {
  try {
    console.log('Deleting all invites from the database...');
    
    // Delete all invites
    const result = await db.delete(invites);
    
    console.log('✅ All invites have been deleted successfully');
    console.log('Database cleanup complete');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting invites:', error);
    process.exit(1);
  }
}

deleteAllInvites();
