/**
 * Targeted migration: create exercise_training_docs table only.
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
 *
 * Run: npx tsx server/scripts/create-training-docs-table.ts
 */

import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '../../.env') });

import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Creating exercise_training_docs table...');

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS exercise_training_docs (
      training_id  VARCHAR(50)  PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      content      TEXT         NOT NULL,
      updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
      updated_by   INTEGER      REFERENCES users(id)
    )
  `);

  console.log('✅ Table created (or already existed)');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
