/**
 * AST Report Content Loader
 * =========================
 * Loads and assembles the 12 active content files (master prompt, section instructions,
 * compendiums, reference docs) into cached system prompt strings for Claude API calls.
 *
 * All content is loaded once at startup and kept in memory as immutable strings.
 * This ensures cache key stability for Claude's prompt caching.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../ast-report-content');

// Base files shared across ALL sections — order matters for readability
const BASE_FILES = [
  'ast_master_prompt_v24.3.md',
  'rml_visual_tag_instructions_v2.md',
  'ast_data_mapping_active_v3.md',
  'strengths_patterns_and_shapes_active_v2.md',
  'hi_neuroscience_compendium_2025_active.md',
  'hi_method_compendium_active.md',
  'allstarteams_compendium_2025_active.md',
];

// Section-specific instruction files
const SECTION_INSTRUCTIONS: Record<number, string> = {
  1: 'section1_strengths_imagination_instruction_active_v11.md',
  2: 'section2_flow_experiences_instruction_active_v21.md',
  3: 'section3_strengths_flow_instruction_active_v11.md',
  4: 'section4_wellbeing_future_instruction_active_v15.md',
  5: 'section5_collaboration_closing_instruction_active_v8.md',
};

// ─── Cached Content ──────────────────────────────────────────────────────────

let basePrompt: string | null = null;
let sectionInstructions: Record<number, string> = {};
let fullSystemPrompt: string | null = null; // All sections combined (for Option B caching)

function loadFile(filename: string): string {
  const filePath = path.join(CONTENT_DIR, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`[ast-report-content] Loaded ${filename} (${content.length} chars)`);
    return content;
  } catch (err) {
    console.error(`[ast-report-content] FAILED to load ${filename}: ${filePath}`);
    throw new Error(`Missing required AST report content file: ${filename}`);
  }
}

function initialize(): void {
  if (basePrompt !== null) return; // Already initialized

  console.log('[ast-report-content] Loading AST report content files...');

  // Load base files
  const baseContents = BASE_FILES.map(f => {
    const content = loadFile(f);
    return `--- ${f} ---\n${content}`;
  });
  basePrompt = baseContents.join('\n\n');

  // Load section instructions
  for (const [sectionId, filename] of Object.entries(SECTION_INSTRUCTIONS)) {
    sectionInstructions[Number(sectionId)] = loadFile(filename);
  }

  // Build full system prompt with ALL section instructions (Option B — best for caching)
  const allSectionContents = Object.entries(SECTION_INSTRUCTIONS).map(([id, filename]) => {
    return `--- SECTION ${id} INSTRUCTION: ${filename} ---\n${sectionInstructions[Number(id)]}`;
  });
  fullSystemPrompt = basePrompt + '\n\n' + allSectionContents.join('\n\n');

  const totalSize = fullSystemPrompt.length;
  const estimatedTokens = Math.round(totalSize / 4);
  console.log(`[ast-report-content] All content loaded. Full system prompt: ${totalSize} chars (~${estimatedTokens} tokens)`);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the full system prompt with ALL section instructions included.
 * This is the recommended approach for Claude prompt caching (Option B):
 * the system prompt is identical across all 5 sections, so sections 2-5
 * get full cache hits.
 *
 * The user message should specify which section to generate.
 */
export function getFullReportSystemPrompt(): string {
  initialize();
  return fullSystemPrompt!;
}

/**
 * Get a section-specific system prompt (base + one section instruction).
 * Use this for Option A caching where each section has a different system prompt.
 * Cache efficiency is lower (~90% prefix match) but prompt is smaller.
 */
export function getSectionSystemPrompt(sectionNumber: number): string {
  initialize();
  const instruction = sectionInstructions[sectionNumber];
  if (!instruction) {
    throw new Error(`No section instruction found for section ${sectionNumber}`);
  }
  return basePrompt + '\n\n--- CURRENT SECTION INSTRUCTION ---\n' + instruction;
}

/**
 * Get the base prompt without any section instructions (for other uses).
 */
export function getBasePrompt(): string {
  initialize();
  return basePrompt!;
}

/**
 * Get content stats for diagnostics.
 */
export function getContentStats(): {
  basePromptChars: number;
  fullPromptChars: number;
  sectionCount: number;
  estimatedBaseTokens: number;
  estimatedFullTokens: number;
} {
  initialize();
  return {
    basePromptChars: basePrompt!.length,
    fullPromptChars: fullSystemPrompt!.length,
    sectionCount: Object.keys(sectionInstructions).length,
    estimatedBaseTokens: Math.round(basePrompt!.length / 4),
    estimatedFullTokens: Math.round(fullSystemPrompt!.length / 4),
  };
}
