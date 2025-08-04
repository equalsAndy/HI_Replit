/**
 * Check OpenAI files and add them to Reflection Talia vector store
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const REFLECTION_TALIA_VECTOR_STORE_ID = 'vs_688e55e74e68819190cca71d1fa54f52';

async function checkAndAddFiles() {
  console.log('🔍 Checking uploaded files...');

  const fileIds = [
    'file-3JBYNNXpe6qTjhFEgjrF5D', // Reflection Talia Training Doc
    'file-WckhRqAyzLzPGYY5fqdEZp', // AST Workshop Compendium 2025
    'file-65AVr1MuQ7ENHMFNNithKZ', // Talia AI Coach Training Manual
    'file-3PtGj2Sanc4gnSLLTMHpwv'  // Strengths-Based Coaching Principles
  ];

  for (const fileId of fileIds) {
    try {
      // Check if file exists
      const file = await openai.files.retrieve(fileId);
      console.log(`✅ File exists: ${file.filename} (${fileId})`);

      // Add to vector store
      const vectorStoreFile = await openai.beta.vectorStores.files.create(
        REFLECTION_TALIA_VECTOR_STORE_ID, 
        { file_id: fileId }
      );
      
      console.log(`📁 Added to vector store: ${file.filename}`);
      
    } catch (error) {
      if (error.status === 400 && error.message?.includes('already exists')) {
        console.log(`⚠️  File ${fileId} already in vector store`);
      } else {
        console.error(`❌ Error with ${fileId}:`, error.message);
      }
    }
  }

  // Check vector store status
  try {
    const vectorStore = await openai.beta.vectorStores.retrieve(REFLECTION_TALIA_VECTOR_STORE_ID);
    console.log(`\n📊 Vector Store Status:`);
    console.log(`- Total files: ${vectorStore.file_counts.total}`);
    console.log(`- Completed: ${vectorStore.file_counts.completed}`);
    console.log(`- In progress: ${vectorStore.file_counts.in_progress}`);
    console.log(`- Failed: ${vectorStore.file_counts.failed}`);
  } catch (error) {
    console.error('❌ Error checking vector store:', error.message);
  }

  console.log('🎯 Check complete!');
}

checkAndAddFiles().catch(console.error);