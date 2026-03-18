import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { exerciseTrainingDocs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../training-docs');

// File fallback map — used only if the DB row doesn't exist
const TRAINING_DOC_FILES: Record<string, string> = {
  'ia-3-7-summarize': 'ia-3-7-summarize.md',
  'ia-3-7-tailor': 'ia-3-7-tailor.md',
  'ia-4-2': 'ia-4-2-reframe.md',
  'ia-4-3': 'ia-4-3-stretch.md',
  'ia-4-4': 'ia-4-4-global-purpose-bridge.md',
  'ia-4-5': 'ia-4-5-advanced-inspiration.md',
};

const SEED_MAP: Array<{ trainingId: string; title: string; filename: string }> = [
  { trainingId: 'ia-3-7-summarize', title: 'Module 3-7 Summarize',    filename: 'ia-3-7-summarize.md' },
  { trainingId: 'ia-3-7-tailor',    title: 'Module 3-7 Tailor',       filename: 'ia-3-7-tailor.md' },
  { trainingId: 'ia-4-2',           title: 'Guided Reframe',           filename: 'ia-4-2-reframe.md' },
  { trainingId: 'ia-4-3',           title: 'Visualization Stretch',    filename: 'ia-4-3-stretch.md' },
  { trainingId: 'ia-4-4',           title: 'Global Purpose Bridge',    filename: 'ia-4-4-global-purpose-bridge.md' },
  { trainingId: 'ia-4-5',           title: 'Inviting the Muse',        filename: 'ia-4-5-advanced-inspiration.md' },
  { trainingId: 'ia-4-5-action',    title: 'Action Planning',          filename: 'ia-4-5-action-planning.md' },
];

/**
 * Get training doc content for a given training ID.
 * Reads from the database first; falls back to the markdown file on miss or DB error.
 * Called on every AI request — no caching, so in-browser edits take effect immediately.
 */
export async function getTrainingDoc(trainingId: string): Promise<string | null> {
  try {
    const [row] = await db
      .select({ content: exerciseTrainingDocs.content })
      .from(exerciseTrainingDocs)
      .where(eq(exerciseTrainingDocs.trainingId, trainingId))
      .limit(1);

    if (row?.content) {
      return row.content;
    }
  } catch (err) {
    console.warn(`[training-docs] DB read failed for ${trainingId}, falling back to file:`, err);
  }

  // Fall back to file
  const filename = TRAINING_DOC_FILES[trainingId];
  if (!filename) return null;

  try {
    const filePath = path.join(DOCS_DIR, filename);
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Seed the database from markdown files if the table is empty.
 * Called once at server startup after the DB connection is established.
 */
export async function seedTrainingDocsIfEmpty(): Promise<void> {
  try {
    const existing = await db
      .select({ trainingId: exerciseTrainingDocs.trainingId })
      .from(exerciseTrainingDocs);

    if (existing.length > 0) {
      console.log(`[training-docs] ${existing.length} docs already in database, skipping seed`);
      return;
    }

    console.log('[training-docs] Database empty, seeding from files...');
    let seeded = 0;

    for (const entry of SEED_MAP) {
      const filePath = path.join(DOCS_DIR, entry.filename);
      let content: string;
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch {
        console.warn(`[training-docs] Could not read ${filePath} — skipping`);
        continue;
      }

      await db.execute(sql`
        INSERT INTO exercise_training_docs (training_id, title, content, updated_at)
        VALUES (${entry.trainingId}, ${entry.title}, ${content}, NOW())
        ON CONFLICT (training_id) DO NOTHING
      `);
      console.log(`[training-docs] Seeded ${entry.trainingId} (${content.length} chars)`);
      seeded++;
    }

    console.log(`[training-docs] Seeded ${seeded} docs`);
  } catch (err) {
    console.warn('[training-docs] Failed to seed training docs (non-fatal):', err);
  }
}
