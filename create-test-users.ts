import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(databaseUrl);
const db = drizzle(client);

async function createTestUsers() {
  console.log('Creating test users...');

  // Hash passwords
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  // List of users to create
  const testUsers = [
    {
      username: 'facilitator1',
      password: passwordHash,
      name: 'Facilitator One',
      email: 'facilitator1@example.com',
      role: 'facilitator' as const,
      organization: 'Test Organization',
      jobTitle: 'Lead Facilitator'
    },
    {
      username: 'facilitator2',
      password: passwordHash,
      name: 'Facilitator Two',
      email: 'facilitator2@example.com',
      role: 'facilitator' as const,
      organization: 'Test Organization',
      jobTitle: 'Assistant Facilitator'
    },
    {
      username: 'participant1',
      password: passwordHash,
      name: 'Participant One',
      email: 'participant1@example.com',
      role: 'participant' as const,
      organization: 'Client Company A',
      jobTitle: 'Team Member'
    },
    {
      username: 'participant2',
      password: passwordHash,
      name: 'Participant Two',
      email: 'participant2@example.com',
      role: 'participant' as const,
      organization: 'Client Company B',
      jobTitle: 'Product Manager'
    },
    {
      username: 'participant3',
      password: passwordHash,
      name: 'Participant Three',
      email: 'participant3@example.com',
      role: 'participant' as const,
      organization: 'Client Company A',
      jobTitle: 'Developer'
    }
  ];

  // Create users one by one
  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, userData.username)).limit(1);
      
      if (existingUser.length > 0) {
        console.log(`User ${userData.username} already exists. Skipping...`);
        continue;
      }
      
      // Create the user
      const result = await db.insert(users).values(userData).returning();
      console.log(`Created user: ${userData.username} (${userData.role})`);
    } catch (error) {
      console.error(`Error creating user ${userData.username}:`, error);
    }
  }

  console.log('Test users creation completed.');
  client.end();
}

createTestUsers()
  .then(() => {
    console.log('Script completed successfully');
  })
  .catch((error) => {
    console.error('Script failed:', error);
  });