/**
 * Upload Reflection Talia training documents directly to OpenAI
 */

import { readFileSync } from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Reflection Talia's vector store ID (from the persona configurations)
const REFLECTION_TALIA_VECTOR_STORE_ID = 'vs_688e55e74e68819190cca71d1fa54f52';

async function uploadToOpenAI() {
  console.log('🤖 Uploading Reflection Talia documents to OpenAI...');

  const documents = [
    {
      title: 'Reflection Talia Training Doc',
      file: 'coaching-data/AST_Talia/talia_training_doc.md',
      category: 'Talia_Training'
    },
    {
      title: 'AST Workshop Compendium 2025',  
      file: 'coaching-data/AST_Talia/AST_Compendium.md',
      category: 'coaching_system'
    },
    {
      title: 'Talia AI Coach Training Manual',
      file: 'coaching-data/AST_Talia/Talia Role Documents/reflection_talia_training_doc.md', 
      category: 'coaching_system'
    },
    {
      title: 'Strengths-Based Coaching Principles',
      file: 'coaching-data/AST_Talia/Flow Attributes by Strength Quadrant .txt',
      category: 'Strengths Development'
    }
  ];

  for (const doc of documents) {
    try {
      console.log(`📄 Processing: ${doc.title}`);
      
      // Read file content
      const content = readFileSync(doc.file, 'utf-8');
      
      // Create file content with metadata
      const fileContent = `Title: ${doc.title}
Type: ${doc.category}
Category: ${doc.category}

${content}`;

      // Create a buffer from the content
      const buffer = Buffer.from(fileContent, 'utf-8');
      
      // Upload to OpenAI
      const file = await openai.files.create({
        file: new File([buffer], `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, {
          type: 'text/plain'
        }),
        purpose: 'assistants'
      });

      console.log(`📤 File uploaded to OpenAI: ${file.id}`);

      // Add to Reflection Talia's vector store
      await openai.beta.vectorStores.files.create(REFLECTION_TALIA_VECTOR_STORE_ID, {
        file_id: file.id
      });

      console.log(`✅ Added to Reflection Talia vector store: ${doc.title}`);
      
    } catch (error) {
      console.error(`❌ Failed to upload ${doc.title}:`, error.message);
    }
  }

  console.log('🎯 OpenAI upload complete!');
}

uploadToOpenAI().catch(console.error);