/**
 * Simple approach to add files to vector store
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function addFilesToVectorStore() {
  console.log('🔍 Adding files to Reflection Talia vector store...');

  const vectorStoreId = 'vs_688e55e74e68819190cca71d1fa54f52';
  const fileIds = [
    'file-3JBYNNXpe6qTjhFEgjrF5D',
    'file-WckhRqAyzLzPGYY5fqdEZp', 
    'file-65AVr1MuQ7ENHMFNNithKZ',
    'file-3PtGj2Sanc4gnSLLTMHpwv'
  ];

  for (const fileId of fileIds) {
    try {
      const response = await fetch('https://api.openai.com/v1/vector_stores/' + vectorStoreId + '/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          file_id: fileId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added file ${fileId} to vector store`);
      } else {
        const error = await response.text();
        console.log(`⚠️  File ${fileId}: ${error}`);
      }
    } catch (error) {
      console.error(`❌ Error with ${fileId}:`, error.message);
    }
  }

  console.log('🎯 Vector store update complete!');
}

addFilesToVectorStore().catch(console.error);