/**
 * Check what documents are in Reflection Talia's OpenAI vector store
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function checkVectorStoreContents() {
  console.log('🔍 Checking Reflection Talia vector store contents...');

  const vectorStoreId = 'vs_688e55e74e68819190cca71d1fa54f52';

  try {
    // Get vector store info
    const response = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (response.ok) {
      const vectorStore = await response.json();
      console.log(`\n📊 Vector Store: ${vectorStore.name || 'Reflection Talia'}`);
      console.log(`- ID: ${vectorStore.id}`);
      console.log(`- Total files: ${vectorStore.file_counts.total}`);
      console.log(`- Completed: ${vectorStore.file_counts.completed}`);
      console.log(`- In progress: ${vectorStore.file_counts.in_progress}`);
      console.log(`- Failed: ${vectorStore.file_counts.failed}`);
    }

    // Get files in vector store
    const filesResponse = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (filesResponse.ok) {
      const filesData = await filesResponse.json();
      console.log(`\n📄 Files in vector store (${filesData.data.length}):`);
      
      for (const file of filesData.data) {
        try {
          // Get file details
          const fileDetailsResponse = await fetch(`https://api.openai.com/v1/files/${file.id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
          });
          
          if (fileDetailsResponse.ok) {
            const fileDetails = await fileDetailsResponse.json();
            console.log(`- ${fileDetails.filename} (${file.id})`);
            console.log(`  Status: ${file.status}, Size: ${fileDetails.bytes} bytes, Created: ${new Date(fileDetails.created_at * 1000).toLocaleDateString()}`);
          }
        } catch (error) {
          console.log(`- ${file.id} (Status: ${file.status})`);
        }
      }
    } else {
      console.error('❌ Failed to get files:', await filesResponse.text());
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n🎯 Check complete!');
}

checkVectorStoreContents().catch(console.error);