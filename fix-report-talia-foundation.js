#!/usr/bin/env node

/**
 * Fix Report Talia Foundation
 * Ensures the 3 core documents are loaded and accessible to Report Talia
 */

import fs from 'fs/promises';
import path from 'path';

console.log('🔧 Fixing Report Talia Foundation...');

// The 3 core documents Report Talia needs
const CORE_DOCUMENTS = [
  {
    title: 'Talia Personal Report Generation Details',
    file: 'coaching-data/AST_Talia/samantha_personal_report.md',
    description: 'High-quality personal report example showing proper structure, tone, and personalization'
  },
  {
    title: 'Talia Professional Report Generation Details', 
    file: 'coaching-data/AST_Talia/samantha_lee_professional_profile.md',
    description: 'Professional report example demonstrating workplace-focused development insights'
  },
  {
    title: 'TALIA Report Generation Prompt',
    file: 'coaching-data/AST_Talia/talia_report_generation_prompt.md',
    description: 'Master template and instructions for generating high-quality reports'
  }
];

async function checkDocuments() {
  console.log('\n📋 Checking core documents:');
  
  for (const doc of CORE_DOCUMENTS) {
    try {
      const filePath = path.join(process.cwd(), doc.file);
      const content = await fs.readFile(filePath, 'utf8');
      console.log(`✅ ${doc.title} (${content.length} chars)`);
    } catch (error) {
      console.log(`❌ ${doc.title} - NOT FOUND: ${doc.file}`);
    }
  }
}

async function main() {
  await checkDocuments();
  
  console.log('\n🎯 Key Issues to Fix:');
  console.log('1. Ensure these 3 documents are in training_documents table');
  console.log('2. Ensure star_report persona is enabled');
  console.log('3. Ensure star_report has access to these documents');
  console.log('4. Test report generation without METAlia enhancements');
  
  console.log('\n💡 Expected Behavior:');
  console.log('- Report Talia should use the template structure from TALIA Report Generation Prompt');
  console.log('- Reports should match quality of Samantha Lee examples');
  console.log('- Should be personalized with actual user data');
  console.log('- Should follow 2nd person voice for personal reports');
}

main().catch(console.error);