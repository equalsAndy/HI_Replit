import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../training-docs');

const TRAINING_DOC_FILES: Record<string, string> = {
  'ia-4-2': 'ia-4-2-reframe.md',
  'ia-4-3': 'ia-4-3-stretch.md',
  'ia-4-4': 'ia-4-4-global-purpose-bridge.md',
  'ia-4-5': 'ia-4-5-action-planning.md',
};

// Load all docs at startup
const trainingDocs: Record<string, string> = {};
for (const [id, filename] of Object.entries(TRAINING_DOC_FILES)) {
  const filePath = path.join(DOCS_DIR, filename);
  try {
    trainingDocs[id] = fs.readFileSync(filePath, 'utf-8');
    console.log(`[training-docs] Loaded training doc for ${id} (${trainingDocs[id].length} chars)`);
  } catch (err) {
    console.warn(`[training-docs] Could not load training doc for ${id}: ${filePath}`);
  }
}

export function getTrainingDoc(trainingId: string): string | null {
  return trainingDocs[trainingId] ?? null;
}
