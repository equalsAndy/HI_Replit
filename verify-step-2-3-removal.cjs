#!/usr/bin/env node

/**
 * Automated Verification Script for Module 2 Step 2-3 Removal
 *
 * This script verifies that:
 * 1. Step 2-3 has been removed from navigationData.ts
 * 2. Navigation sequence properly chains 2-2 → 2-4
 * 3. No active code references to FlowRoundingOutView
 * 4. FlowRoundingOutView exists in archive
 * 5. Archive README exists
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

let passedChecks = 0;
let failedChecks = 0;
const issues = [];

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkFile(description, filePath, checkFn) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = checkFn(content);

    if (result.pass) {
      log(`✓ ${description}`, 'green');
      passedChecks++;
    } else {
      log(`✗ ${description}`, 'red');
      log(`  Reason: ${result.reason}`, 'yellow');
      failedChecks++;
      issues.push({ description, reason: result.reason });
    }
  } catch (error) {
    log(`✗ ${description}`, 'red');
    log(`  Error: ${error.message}`, 'yellow');
    failedChecks++;
    issues.push({ description, reason: error.message });
  }
}

function checkFileExists(description, filePath) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}`, 'green');
    passedChecks++;
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    log(`  File not found: ${filePath}`, 'yellow');
    failedChecks++;
    issues.push({ description, reason: `File not found: ${filePath}` });
    return false;
  }
}

function checkFileNotExists(description, filePath) {
  if (!fs.existsSync(filePath)) {
    log(`✓ ${description}`, 'green');
    passedChecks++;
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    log(`  File still exists: ${filePath}`, 'yellow');
    failedChecks++;
    issues.push({ description, reason: `File should not exist: ${filePath}` });
    return false;
  }
}

log('\n' + '='.repeat(60), 'blue');
log('AST Module 2 Step 2-3 Removal - Verification Script', 'bold');
log('='.repeat(60) + '\n', 'blue');

// ============================================================================
// STRUCTURE CHECKS
// ============================================================================
log('[STRUCTURE CHECKS]', 'blue');

checkFile(
  'Module 2 has exactly 3 steps in navigationData.ts',
  'client/src/components/navigation/navigationData.ts',
  (content) => {
    // Find Module 2 section - match the whole object
    const module2Pattern = /\{\s*id:\s*['"]2['"]\s*,[\s\S]*?steps:\s*\[([\s\S]*?)\]\s*\}/;
    const module2Match = content.match(module2Pattern);

    if (!module2Match) {
      return { pass: false, reason: 'Could not find Module 2 section' };
    }

    const stepsSection = module2Match[1];

    // Count step IDs like { id: '2-1', ... }
    const stepMatches = stepsSection.match(/\{\s*id:\s*['"]2-\d+['"]/g) || [];
    const stepCount = stepMatches.length;

    if (stepCount !== 3) {
      return { pass: false, reason: `Found ${stepCount} steps, expected 3` };
    }

    // Check that 2-3 is NOT present
    if (stepsSection.includes("'2-3'") || stepsSection.includes('"2-3"')) {
      return { pass: false, reason: 'Step 2-3 still present in Module 2' };
    }

    return { pass: true };
  }
);

checkFile(
  'Step 2-3 removed from navigation items',
  'client/src/components/navigation/navigationData.ts',
  (content) => {
    const module2Pattern = /\{\s*id:\s*['"]2['"]\s*,[\s\S]*?steps:\s*\[([\s\S]*?)\]\s*\}/;
    const module2Match = content.match(module2Pattern);

    if (!module2Match) {
      return { pass: false, reason: 'Could not find Module 2 section' };
    }

    const stepsSection = module2Match[1];

    // Should have 2-1 and 2-2 and 2-4
    const has21 = stepsSection.includes("'2-1'") || stepsSection.includes('"2-1"');
    const has22 = stepsSection.includes("'2-2'") || stepsSection.includes('"2-2"');
    const has24 = stepsSection.includes("'2-4'") || stepsSection.includes('"2-4"');
    const has23 = stepsSection.includes("'2-3'") || stepsSection.includes('"2-3"');

    if (!has21 || !has22 || !has24) {
      return { pass: false, reason: 'Missing expected steps 2-1, 2-2, or 2-4' };
    }

    if (has23) {
      return { pass: false, reason: 'Step 2-3 still present' };
    }

    return { pass: true };
  }
);

checkFile(
  'Navigation sequence updated (2-2 → 2-4)',
  'client/src/components/workshops/AllStarTeamsWorkshop.tsx',
  (content) => {
    // Check that 2-2 next points to 2-4
    const step22Match = content.match(/'2-2':\s*\{\s*prev:\s*'2-1',\s*next:\s*'([^']+)'/);
    if (!step22Match) {
      return { pass: false, reason: 'Could not find step 2-2 in navigationSequence' };
    }

    if (step22Match[1] !== '2-4') {
      return { pass: false, reason: `Step 2-2 next is '${step22Match[1]}', expected '2-4'` };
    }

    // Check that 2-4 prev points to 2-2
    const step24Match = content.match(/'2-4':\s*\{\s*prev:\s*'([^']+)',\s*next:\s*'3-1'/);
    if (!step24Match) {
      return { pass: false, reason: 'Could not find step 2-4 in navigationSequence' };
    }

    if (step24Match[1] !== '2-2') {
      return { pass: false, reason: `Step 2-4 prev is '${step24Match[1]}', expected '2-2'` };
    }

    // Check that 2-3 is NOT in navigationSequence
    if (content.includes("'2-3':")) {
      return { pass: false, reason: 'Step 2-3 still present in navigationSequence' };
    }

    return { pass: true };
  }
);

checkFile(
  'Content switch case removed for "rounding-out"',
  'client/src/components/content/allstarteams/AllStarTeamsContent.tsx',
  (content) => {
    if (content.includes("case 'rounding-out':")) {
      return { pass: false, reason: 'Case for "rounding-out" still present' };
    }
    return { pass: true };
  }
);

checkFile(
  'FlowRoundingOutView import removed from AllStarTeamsContent.tsx',
  'client/src/components/content/allstarteams/AllStarTeamsContent.tsx',
  (content) => {
    if (content.includes("import FlowRoundingOutView")) {
      return { pass: false, reason: 'Import statement still present' };
    }
    if (content.includes("FlowRoundingOutView")) {
      return { pass: false, reason: 'FlowRoundingOutView reference still present' };
    }
    return { pass: true };
  }
);

checkFile(
  'IntroToFlowView.tsx navigates to module-2-recap (not rounding-out)',
  'client/src/components/content/IntroToFlowView.tsx',
  (content) => {
    // Check that setCurrentContent points to module-2-recap
    if (content.includes("setCurrentContent('rounding-out')")) {
      return { pass: false, reason: 'Still navigating to "rounding-out"' };
    }
    if (content.includes('setCurrentContent("rounding-out")')) {
      return { pass: false, reason: 'Still navigating to "rounding-out"' };
    }
    if (content.includes("setCurrentContent('flow-rounding-out')")) {
      return { pass: false, reason: 'Still navigating to "flow-rounding-out"' };
    }

    // Check that it navigates to module-2-recap instead
    if (!content.includes("setCurrentContent('module-2-recap')")) {
      return { pass: false, reason: 'Not navigating to "module-2-recap"' };
    }

    return { pass: true };
  }
);

// ============================================================================
// FILE CHECKS
// ============================================================================
log('\n[FILE CHECKS]', 'blue');

checkFileNotExists(
  'FlowRoundingOutView.tsx removed from active codebase',
  'client/src/components/content/FlowRoundingOutView.tsx'
);

checkFileExists(
  'FlowRoundingOutView.tsx archived',
  'archived-components/module-2-step-2-3/FlowRoundingOutView.tsx'
);

checkFileExists(
  'Archive README.md exists',
  'archived-components/module-2-step-2-3/README.md'
);

checkFile(
  'Archive README contains restoration instructions',
  'archived-components/module-2-step-2-3/README.md',
  (content) => {
    if (!content.includes('Restoration Instructions')) {
      return { pass: false, reason: 'Missing restoration instructions section' };
    }
    if (!content.includes('navigationData.ts')) {
      return { pass: false, reason: 'Missing navigationData.ts restoration steps' };
    }
    if (!content.includes('AllStarTeamsWorkshop.tsx')) {
      return { pass: false, reason: 'Missing AllStarTeamsWorkshop.tsx restoration steps' };
    }
    return { pass: true };
  }
);

// ============================================================================
// SUMMARY
// ============================================================================
log('\n' + '='.repeat(60), 'blue');
log('SUMMARY', 'bold');
log('='.repeat(60), 'blue');
log(`Passed: ${passedChecks}/${passedChecks + failedChecks} checks`, 'green');
log(`Failed: ${failedChecks}/${passedChecks + failedChecks} checks`, failedChecks > 0 ? 'red' : 'green');

if (issues.length > 0) {
  log('\nIssues Found:', 'red');
  issues.forEach((issue, index) => {
    log(`  ${index + 1}. ${issue.description}`, 'yellow');
    log(`     → ${issue.reason}`, 'yellow');
  });
  log('\nAction required: Fix the issues listed above', 'yellow');
  process.exit(1);
} else {
  log('\n✓ All checks passed! Step 2-3 removal is complete.', 'green');
  process.exit(0);
}
