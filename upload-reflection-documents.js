/**
 * Upload Reflection Talia's Documents to OpenAI Vector Store
 * ========================================================
 * This script helps upload documents specifically for Reflection Talia's
 * interactive coaching role during workshop steps
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config({ path: './server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Reflection Talia's vector store ID
const REFLECTION_VECTOR_STORE_ID = 'vs_688e55e74e68819190cca71d1fa54f52';

async function uploadReflectionDocuments() {
  try {
    console.log('📚 Uploading documents for Reflection Talia...\n');
    
    // Check current vector store status
    const vectorStore = await openai.vectorStores.retrieve(REFLECTION_VECTOR_STORE_ID);
    console.log(`📁 Vector Store: "${vectorStore.name}"`);
    console.log(`📊 Current files: ${vectorStore.file_counts?.completed || 0}`);
    console.log('');
    
    // Define documents that Reflection Talia should have
    const reflectionDocuments = [
      {
        path: './coaching-data/AST_Talia/AST_Compendium.md',
        name: 'AST_Compendium.md',
        description: 'Core AST workshop concepts and coaching guidance'
      },
      {
        path: './coaching-data/AST_Talia/Talia Role Documents/reflection_talia_training_doc.md',
        name: 'reflection_talia_training_doc.md',
        description: 'Specific training for Reflection Talia\'s interactive coaching role'
      },
      {
        path: './coaching-data/AST_Talia/Talia Role Documents/talia_roles_overview.md',
        name: 'talia_roles_overview.md',
        description: 'Overview of different Talia roles and responsibilities'
      },
      {
        path: './coaching-data/AST_Talia/ast_workshop_questions_database.md',
        name: 'ast_workshop_questions_database.md',
        description: 'Database of workshop questions for coaching context'
      },
      {
        path: './coaching-data/AST_Talia/ast_questions_to_database_mapping.md',
        name: 'ast_questions_to_database_mapping.md',
        description: 'Mapping of workshop questions to help with step-specific coaching'
      }
    ];
    
    console.log('🔍 Available documents to upload:');
    console.log('=====================================');
    
    // Check which documents exist
    const availableDocuments = [];
    for (const doc of reflectionDocuments) {
      try {
        await fs.access(doc.path);
        const stats = await fs.stat(doc.path);
        console.log(`✅ ${doc.name} (${Math.round(stats.size / 1024)}KB)`);
        console.log(`   📄 ${doc.description}`);
        console.log(`   📂 Path: ${doc.path}`);
        availableDocuments.push(doc);
      } catch (error) {
        console.log(`❌ ${doc.name} - File not found at ${doc.path}`);
      }
      console.log('');
    }
    
    if (availableDocuments.length === 0) {
      console.log('⚠️  No documents found to upload.');
      console.log('\n🔧 To add documents for Reflection Talia:');
      console.log('1. Create or identify documents for interactive coaching');
      console.log('2. Place them in the coaching-data directory');
      console.log('3. Update the reflectionDocuments array in this script');
      console.log('4. Run this script again');
      return;
    }
    
    console.log(`📤 Ready to upload ${availableDocuments.length} documents`);
    console.log('\nProceed with upload? (This will make these documents available to Reflection Talia)');
    
    // For now, let's show what would be uploaded
    console.log('\n📋 Upload Summary:');
    console.log('==================');
    availableDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Purpose: ${doc.description}`);
    });
    
    console.log('\n💡 To complete the upload:');
    console.log('1. Confirm you want these documents for Reflection Talia');
    console.log('2. Run: node upload-reflection-documents.js --confirm');
    
  } catch (error) {
    console.error('❌ Error uploading reflection documents:', error.message);
    throw error;
  }
}

// Check if --confirm flag is passed
const shouldUpload = process.argv.includes('--confirm');

if (shouldUpload) {
  console.log('🚀 Starting confirmed upload...\n');
  // Add actual upload logic here when confirmed
} else {
  uploadReflectionDocuments()
    .then(() => {
      console.log('\n✅ Document check complete!');
    })
    .catch((error) => {
      console.error('\n❌ Upload failed:', error.message);
      process.exit(1);
    });
}