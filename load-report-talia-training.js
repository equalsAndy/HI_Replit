#!/usr/bin/env node

/**
 * Load essential training documents for Report Talia
 * This script loads the foundational documents that Report Talia needs to generate high-quality reports
 */

import fs from 'fs/promises';
import path from 'path';

const TRAINING_DOCS_TO_LOAD = [
  {
    file: 'coaching-data/AST_Talia/samantha_personal_report.md',
    title: 'Samantha Lee Personal Report - High Quality Example',
    description: 'Complete high-quality personal development report example showing depth, personalization, and structure',
    category: 'example_reports',
    priority: 1
  },
  {
    file: 'coaching-data/AST_Talia/samantha_lee_professional_profile.md', 
    title: 'Samantha Lee Professional Report - High Quality Example',
    description: 'Complete high-quality professional development report example',
    category: 'example_reports',
    priority: 1
  },
  {
    file: 'coaching-data/AST_Talia/talia_professional_report_prompt.md',
    title: 'Talia Professional Report Generation Prompt',
    description: 'Master prompt template for generating professional reports',
    category: 'prompts',
    priority: 1
  },
  {
    file: 'coaching-data/AST_Talia/jacob_kim_personal_report.md',
    title: 'Jacob Kim Personal Report Example',
    description: 'Additional example of high-quality personal report',
    category: 'example_reports',
    priority: 2
  },
  {
    file: 'coaching-data/AST_Talia/olivia_wang_personal_report.md',
    title: 'Olivia Wang Personal Report Example', 
    description: 'Additional example of high-quality personal report',
    category: 'example_reports',
    priority: 2
  },
  {
    file: 'coaching-data/AST_Talia/samantha_lee_ast_workshop_responses.md',
    title: 'Samantha Lee Workshop Responses - Data Example',
    description: 'Example of user workshop data that leads to high-quality reports',
    category: 'data_examples',
    priority: 2
  },
  {
    file: 'coaching-data/AST_Talia/ast_questions_to_database_mapping.md',
    title: 'AST Questions to Database Mapping',
    description: 'Understanding how workshop questions map to database structure',
    category: 'technical',
    priority: 3
  }
];

async function main() {
  console.log('🚀 Loading Report Talia Foundation Documents...');
  
  const loadedDocs = [];
  
  for (const doc of TRAINING_DOCS_TO_LOAD) {
    try {
      console.log(`📄 Loading: ${doc.title}`);
      
      // Check if file exists
      const filePath = path.join(process.cwd(), doc.file);
      const content = await fs.readFile(filePath, 'utf8');
      
      loadedDocs.push({
        original_filename: path.basename(doc.file),
        title: doc.title,
        content: content,
        description: doc.description,
        category: doc.category,
        priority: doc.priority,
        status: 'active',
        file_size: content.length,
        content_type: 'text/markdown'
      });
      
      console.log(`✅ Loaded: ${doc.title} (${content.length} chars)`);
      
    } catch (error) {
      console.error(`❌ Failed to load ${doc.file}:`, error.message);
    }
  }
  
  // Save the documents data for import
  const outputFile = 'temp-report-talia-training-docs.json';
  await fs.writeFile(outputFile, JSON.stringify(loadedDocs, null, 2));
  
  console.log(`\n✅ Loaded ${loadedDocs.length} documents`);
  console.log(`📁 Saved to: ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Import these documents into the training_documents table');
  console.log('2. Enable star_report persona'); 
  console.log('3. Assign documents to star_report persona');
  console.log('4. Test report generation');
  
  return loadedDocs;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TRAINING_DOCS_TO_LOAD, main as loadTrainingDocs };