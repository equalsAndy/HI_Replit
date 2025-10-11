import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkUserContentAccess() {
  try {
    const result = await db.select({
      id: users.id,
      name: users.name,
      role: users.role,
      contentAccess: users.contentAccess
    }).from(users).where(eq(users.role, 'admin'));

    console.log('Admin users:', result);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkUserContentAccess();
