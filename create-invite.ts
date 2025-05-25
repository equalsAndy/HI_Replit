import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { invites } from './shared/schema';
import { generateInviteCode } from './server/utils/invite-code';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(databaseUrl);
const db = drizzle(client);

async function createInvite() {
  try {
    // Generate a new invite code
    const inviteCode = generateInviteCode();
    
    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create the invite in the database
    const newInvite = await db.insert(invites).values({
      inviteCode: inviteCode,
      role: 'participant', // You can change this to 'facilitator' or 'admin' if needed
      email: 'newuser@example.com', // Optional: specify target email
      createdBy: 1, // Admin user ID
      expiresAt: expiresAt
    }).returning();
    
    console.log('Created new invite:');
    console.log('Invite Code:', newInvite[0].inviteCode);
    console.log('Role:', newInvite[0].role);
    console.log('Expires:', newInvite[0].expiresAt);
    
  } catch (error) {
    console.error('Error creating invite:', error);
  } finally {
    await client.end();
  }
}

createInvite()
  .then(() => {
    console.log('Invite creation completed.');
  })
  .catch((error) => {
    console.error('Script failed:', error);
  });