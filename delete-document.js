/**
 * Delete Strengths_Based_Coaching_Principles.txt from Reflection Talia vector store
 */

import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env.development' });

const REFLECTION_TALIA_VECTOR_STORE_ID = 'vs_688e55e74e68819190cca71d1fa54f52';
const FILE_ID_TO_DELETE = 'file-3PtGj2Sanc4gnSLLTMHpwv'; // Strengths_Based_Coaching_Principles.txt

async function deleteDocument() {
  console.log('🗑️  Deleting Strengths_Based_Coaching_Principles.txt from OpenAI...');

  try {
    // First, remove from vector store
    const vectorStoreResponse = await fetch(
      `https://api.openai.com/v1/vector_stores/${REFLECTION_TALIA_VECTOR_STORE_ID}/files/${FILE_ID_TO_DELETE}`, 
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );

    if (vectorStoreResponse.ok) {
      console.log('✅ Removed from Reflection Talia vector store');
    } else {
      const error = await vectorStoreResponse.text();
      console.log(`⚠️  Vector store removal: ${error}`);
    }

    // Then delete the file completely from OpenAI
    const fileResponse = await fetch(
      `https://api.openai.com/v1/files/${FILE_ID_TO_DELETE}`, 
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    if (fileResponse.ok) {
      const result = await fileResponse.json();
      console.log('✅ File deleted from OpenAI:', result);
    } else {
      const error = await fileResponse.text();
      console.error('❌ File deletion failed:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('🎯 Deletion process complete!');
}

deleteDocument().catch(console.error);