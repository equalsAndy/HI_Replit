/**
 * Upload the 4 specific documents that Reflection Talia has access to
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs/promises';

// Load environment variables
dotenv.config({ path: './server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Reflection Talia's vector store ID
const REFLECTION_VECTOR_STORE_ID = 'vs_688e55e74e68819190cca71d1fa54f52';

// The 4 documents Reflection Talia should have access to
const REFLECTION_DOCUMENTS = [
  {
    id: 'd359217d-2020-44e2-8f42-25cfe01e3a2b',
    name: 'Reflection Talia Training Doc',
    purpose: 'Core training for Reflection Talia role'
  },
  {
    id: 'f854dc9b-c353-4685-adde-8f4752f5b897',
    name: 'AST Compendium',
    purpose: 'Complete AST workshop knowledge base'
  },
  {
    id: '3577e1e1-2fad-45d9-8ad1-12698bc327e3', 
    name: 'AST Workshop Questions Database',
    purpose: 'Workshop questions and context for coaching'
  },
  {
    id: '9f73a4ee-7a69-490c-a530-59597825b58f',
    name: 'Talia Roles Overview',
    purpose: 'Understanding of different Talia roles'
  }
];

async function uploadReflectionDocuments() {
  try {
    console.log('📚 Uploading 4 documents for Reflection Talia to OpenAI...\n');
    
    // Check current vector store status
    const vectorStore = await openai.vectorStores.retrieve(REFLECTION_VECTOR_STORE_ID);
    console.log(`📁 Vector Store: "${vectorStore.name}"`);
    console.log(`📊 Current files: ${vectorStore.file_counts?.completed || 0} completed, ${vectorStore.file_counts?.in_progress || 0} in progress`);
    console.log('');
    
    for (const docConfig of REFLECTION_DOCUMENTS) {
      console.log(`🔍 Processing: ${docConfig.name}`);
      
      try {
        // Get document from database
        const result = await pool.query(`
          SELECT title, original_filename, content 
          FROM training_documents 
          WHERE id = $1
        `, [docConfig.id]);
        
        if (result.rows.length === 0) {
          console.log(`❌ Document not found: ${docConfig.name}`);
          continue;
        }
        
        const doc = result.rows[0];
        console.log(`   📄 Title: ${doc.title}`);
        console.log(`   📂 File: ${doc.original_filename || 'No filename'}`);
        console.log(`   📊 Size: ${(doc.content.length / 1024).toFixed(2)} KB`);
        console.log(`   🎯 Purpose: ${docConfig.purpose}`);
        
        // Create temp file
        const tempFilename = `/tmp/reflection_${docConfig.id}.md`;
        await fs.writeFile(tempFilename, doc.content, 'utf8');
        
        // Upload to OpenAI
        const fileBuffer = await fs.readFile(tempFilename);
        const filename = doc.original_filename || `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        
        const file = await openai.files.create({
          file: new File([fileBuffer], filename, { type: 'text/markdown' }),
          purpose: 'assistants'
        });
        
        console.log(`   ✅ Uploaded to OpenAI: ${file.id}`);
        
        // Add to vector store
        const vectorStoreFile = await openai.vectorStores.files.create(
          REFLECTION_VECTOR_STORE_ID,
          {
            file_id: file.id
          }
        );
        
        console.log(`   🗂️  Added to vector store: ${vectorStoreFile.id}`);
        
        // Clean up
        await fs.unlink(tempFilename);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (docError) {
        console.error(`   ❌ Error with ${docConfig.name}:`, docError.message);
      }
      
      console.log('');
    }
    
    // Final status check
    const finalVectorStore = await openai.vectorStores.retrieve(REFLECTION_VECTOR_STORE_ID);
    console.log('📊 Final Vector Store Status:');
    console.log(`   Completed files: ${finalVectorStore.file_counts?.completed || 0}`);
    console.log(`   In progress: ${finalVectorStore.file_counts?.in_progress || 0}`);
    console.log(`   Failed: ${finalVectorStore.file_counts?.failed || 0}`);
    
    console.log('\n🎉 Upload process complete!');
    console.log('');
    console.log('📋 Reflection Talia now has access to:');
    REFLECTION_DOCUMENTS.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.name} - ${doc.purpose}`);
    });
    
  } catch (error) {
    console.error('❌ Error uploading documents:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

uploadReflectionDocuments()
  .then(() => {
    console.log('\n✅ All uploads complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  });