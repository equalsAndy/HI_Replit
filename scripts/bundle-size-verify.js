#!/usr/bin/env node
/**
 * Bundle Size Verification Script
 * ================================
 * Run after `npm run build` to verify:
 *   1. Main bundle is under the 500 KB gzipped budget
 *   2. Vendor chunks exist for framer-motion, recharts, and @radix-ui
 *   3. IA step content is NOT in the main bundle (lives in its own chunk)
 *   4. The allstarteams chunk is still present (regression guard)
 *
 * Usage:
 *   npm run build && node scripts/bundle-size-verify.js
 *
 * Exit codes:
 *   0  All checks passed
 *   1  One or more checks failed
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_ASSETS = join(__dirname, '..', 'dist', 'assets');

// ── Budget ────────────────────────────────────────────────────────────────────
const MAIN_BUNDLE_GZ_BUDGET_KB = 500;

// ── Helpers ───────────────────────────────────────────────────────────────────

function gzippedKB(filePath) {
  const raw = readFileSync(filePath);
  return Math.round(gzipSync(raw).length / 1024);
}

function getJsFiles() {
  return readdirSync(DIST_ASSETS)
    .filter((f) => f.endsWith('.js'))
    .map((f) => ({
      name: f,
      path: join(DIST_ASSETS, f),
      gzKB: gzippedKB(join(DIST_ASSETS, f)),
    }));
}

// ── Run checks ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`  ✅  ${msg}`);
  passed++;
}

function fail(msg) {
  console.error(`  ❌  ${msg}`);
  failed++;
}

function check(label, predicate, detail) {
  predicate ? pass(`${label} — ${detail}`) : fail(`${label} — ${detail}`);
}

console.log('\n📦  Bundle Size Verification\n');

let files;
try {
  files = getJsFiles();
} catch (e) {
  console.error('❌  Could not read dist/assets — did you run `npm run build` first?');
  process.exit(1);
}

// ── 1. Main bundle budget ─────────────────────────────────────────────────────

const mainChunk = files.find(
  (f) => f.name.startsWith('index-') || f.name.startsWith('main-')
);

if (!mainChunk) {
  fail('Main bundle not found (expected index-*.js or main-*.js)');
} else {
  check(
    'Main bundle gzip size',
    mainChunk.gzKB <= MAIN_BUNDLE_GZ_BUDGET_KB,
    `${mainChunk.gzKB} KB / ${MAIN_BUNDLE_GZ_BUDGET_KB} KB budget (${mainChunk.name})`
  );
}

// ── 2. Vendor chunks present ──────────────────────────────────────────────────

const vendorMotion = files.find((f) => f.name.startsWith('vendor-motion'));
check(
  'vendor-motion chunk exists',
  !!vendorMotion,
  vendorMotion ? `${vendorMotion.gzKB} KB (${vendorMotion.name})` : 'not found'
);

const vendorCharts = files.find((f) => f.name.startsWith('vendor-charts'));
check(
  'vendor-charts chunk exists',
  !!vendorCharts,
  vendorCharts ? `${vendorCharts.gzKB} KB (${vendorCharts.name})` : 'not found'
);

const vendorRadix = files.find((f) => f.name.startsWith('vendor-radix'));
check(
  'vendor-radix chunk exists',
  !!vendorRadix,
  vendorRadix ? `${vendorRadix.gzKB} KB (${vendorRadix.name})` : 'not found'
);

// ── 3. IA content chunk exists (lazy split worked) ────────────────────────────

// IA steps/content will be in a dynamically-named async chunk — detect by
// checking that there's an async chunk that is NOT the main bundle.
const asyncChunks = files.filter(
  (f) =>
    !f.name.startsWith('index-') &&
    !f.name.startsWith('main-') &&
    !f.name.startsWith('vendor-') &&
    !f.name.startsWith('hls') &&
    !f.name.startsWith('ffmpeg') &&
    !f.name.startsWith('allstarteams')
);

check(
  'Async IA/page chunks exist (lazy split created separate files)',
  asyncChunks.length > 0,
  asyncChunks.length > 0
    ? `${asyncChunks.length} async chunk(s) found`
    : 'no async chunks — lazy splitting may have failed'
);

// ── 4. AST chunk regression guard ────────────────────────────────────────────

const astChunk = files.find((f) => f.name.startsWith('allstarteams'));
check(
  'AllStarTeams chunk still present (regression guard)',
  !!astChunk,
  astChunk ? `${astChunk.gzKB} KB (${astChunk.name})` : 'not found'
);

// ── 5. Main bundle does not contain IA step source ───────────────────────────

if (mainChunk) {
  const mainContent = readFileSync(mainChunk.path, 'utf8');
  // IA step components have distinctive string "IA_" or "imaginal-agility/steps/"
  // If any IA step module got inlined into the main bundle this string would appear.
  const iaStepInMain =
    mainContent.includes('ImaginalAgilityContent') &&
    mainContent.includes('IA_1_1') ; // rough heuristic

  check(
    'IA step components NOT inlined into main bundle',
    !iaStepInMain,
    iaStepInMain
      ? 'IA step code found in main bundle — React.lazy may have been removed'
      : 'main bundle is clean of IA step components'
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────');
console.log(`  ${passed} passed  |  ${failed} failed\n`);

if (failed > 0) {
  console.error('❌  Bundle verification FAILED\n');
  process.exit(1);
} else {
  console.log('✅  All bundle checks passed\n');
  process.exit(0);
}
