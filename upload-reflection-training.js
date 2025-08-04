/**
 * Upload Reflection Talia's specific training document to OpenAI
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

async function uploadReflectionTrainingDoc() {
  try {
    console.log('📚 Uploading Reflection Talia training document to OpenAI...\n');
    
    // Get the document from database
    console.log('🔍 Fetching Reflection Talia training document from database...');
    const result = await pool.query(`
      SELECT title, original_filename, content 
      FROM training_documents 
      WHERE id = 'd359217d-2020-44e2-8f42-25cfe01e3a2b'
    `);
    
    if (result.rows.length === 0) {
      throw new Error('Reflection Talia training document not found in database');
    }
    
    const doc = result.rows[0];
    console.log(`✅ Found: "${doc.title}"`);
    console.log(`📄 Filename: ${doc.original_filename}`);
    console.log(`📊 Content size: ${doc.content.length} characters`);
    console.log('');
    
    // Create temporary file for upload
    const tempFilename = `/tmp/reflection_talia_training.md`;
    await fs.writeFile(tempFilename, doc.content, 'utf8');
    console.log(`💾 Created temporary file: ${tempFilename}`);
    
    // Upload to OpenAI
    console.log('📤 Uploading to OpenAI...');
    
    // Check file size
    const stats = await fs.stat(tempFilename);
    console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    const fileBuffer = await fs.readFile(tempFilename);
    console.log(`📦 Buffer size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    
    // Create a File object for the upload
    const file = await openai.files.create({
      file: new File([fileBuffer], doc.original_filename, { type: 'text/markdown' }),
      purpose: 'assistants'
    });
    
    console.log(`✅ File uploaded to OpenAI: ${file.id}`);
    
    // Add to vector store
    console.log('🗂️  Adding to Reflection Talia vector store...');
    const vectorStoreFile = await openai.vectorStores.files.create(
      REFLECTION_VECTOR_STORE_ID,
      {
        file_id: file.id
      }
    );
    
    console.log(`✅ Added to vector store: ${vectorStoreFile.id}`);
    
    // Check vector store status
    const vectorStore = await openai.vectorStores.retrieve(REFLECTION_VECTOR_STORE_ID);
    console.log(`📊 Vector store now has: ${vectorStore.file_counts?.completed || 0} completed files`);
    
    // Clean up
    await fs.unlink(tempFilename);
    console.log('🧹 Cleaned up temporary file');
    
    console.log('\n🎉 Success! Reflection Talia now has access to her training document in OpenAI');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Test Reflection Talia to verify she can access the document');
    console.log('2. Check that her responses are improved with training context');
    
  } catch (error) {
    console.error('❌ Error uploading document:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

uploadReflectionTrainingDoc()
  .then(() => {
    console.log('\n✅ Upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  });