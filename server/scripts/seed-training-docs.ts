/**
 * Seed exercise training docs from markdown files into the database.
 *
 * Run manually: npx tsx server/scripts/seed-training-docs.ts
 *
 * Uses ON CONFLICT DO NOTHING so running it multiple times is safe.
 * Existing rows are left unchanged — this only inserts missing ones.
 */

import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env (contains DATABASE_URL)
config({ path: path.join(__dirname, '../../.env') });

import { db } from '../db.js';
import { exerciseTrainingDocs } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

const DOCS_DIR = path.join(__dirname, '../training-docs');

interface SeedEntry {
  trainingId: string;
  title: string;
  filename: string;
}

const SEED_MAP: SeedEntry[] = [
  { trainingId: 'ia-3-7-summarize', title: 'Module 3-7 Summarize',    filename: 'ia-3-7-summarize.md' },
  { trainingId: 'ia-3-7-tailor',    title: 'Module 3-7 Tailor',       filename: 'ia-3-7-tailor.md' },
  { trainingId: 'ia-4-2',           title: 'Guided Reframe',           filename: 'ia-4-2-reframe.md' },
  { trainingId: 'ia-4-3',           title: 'Visualization Stretch',    filename: 'ia-4-3-stretch.md' },
  { trainingId: 'ia-4-4',           title: 'Global Purpose Bridge',    filename: 'ia-4-4-global-purpose-bridge.md' },
  { trainingId: 'ia-4-5',           title: 'Inviting the Muse',        filename: 'ia-4-5-advanced-inspiration.md' },
  { trainingId: 'ia-4-5-action',    title: 'Action Planning',          filename: 'ia-4-5-action-planning.md' },
];

async function seedTrainingDocs(): Promise<void> {
  console.log('[seed-training-docs] Starting seed...');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of SEED_MAP) {
    const filePath = path.join(DOCS_DIR, entry.filename);

    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      console.warn(`[seed-training-docs] Could not read file: ${filePath} — skipping`);
      errors++;
      continue;
    }

    try {
      // ON CONFLICT DO NOTHING — safe to run multiple times
      await db.execute(sql`
        INSERT INTO exercise_training_docs (training_id, title, content, updated_at)
        VALUES (${entry.trainingId}, ${entry.title}, ${content}, NOW())
        ON CONFLICT (training_id) DO NOTHING
      `);
      console.log(`[seed-training-docs] Inserted ${entry.trainingId} (${content.length} chars)`);
      inserted++;
    } catch (err: any) {
      // Row already exists (race condition) or other DB error
      if (err?.message?.includes('already exists') || err?.code === '23505') {
        console.log(`[seed-training-docs] Skipped ${entry.trainingId} (already exists)`);
        skipped++;
      } else {
        console.error(`[seed-training-docs] Failed to insert ${entry.trainingId}:`, err?.message);
        errors++;
      }
    }
  }

  console.log(`[seed-training-docs] Done — inserted: ${inserted}, skipped: ${skipped}, errors: ${errors}`);
  process.exit(errors > 0 ? 1 : 0);
}

seedTrainingDocs().catch((err) => {
  console.error('[seed-training-docs] Fatal error:', err);
  process.exit(1);
});
