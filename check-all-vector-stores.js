/**
 * Check all vector stores and their documents
 */

import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env.development' });

const personas = [
  {
    name: 'Reflection Talia',
    vectorStoreId: 'vs_688e55e74e68819190cca71d1fa54f52'
  },
  {
    name: 'Report Talia',
    vectorStoreId: 'vs_688e2bf0d94c81918b50080064684bde'
  },
  {
    name: 'Admin Training',
    vectorStoreId: 'vs_688e55e81e6c8191af100194c2ac9512'
  }
];

async function checkAllVectorStores() {
  console.log('🔍 Checking all vector stores and their documents...\n');

  for (const persona of personas) {
    try {
      console.log(`\n📋 ${persona.name} (${persona.vectorStoreId})`);
      console.log('=' + '='.repeat(persona.name.length + 30));

      // Get vector store info
      const response = await fetch(`https://api.openai.com/v1/vector_stores/${persona.vectorStoreId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (response.ok) {
        const vectorStore = await response.json();
        console.log(`📊 Status: ${vectorStore.file_counts.total} total, ${vectorStore.file_counts.completed} completed, ${vectorStore.file_counts.failed} failed`);
      }

      // Get files in vector store
      const filesResponse = await fetch(`https://api.openai.com/v1/vector_stores/${persona.vectorStoreId}/files`, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        
        if (filesData.data.length === 0) {
          console.log('📄 No documents');
        } else {
          console.log(`📄 Documents (${filesData.data.length}):`);
          
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
                const sizeKB = Math.round(fileDetails.bytes / 1024);
                console.log(`   • ${fileDetails.filename} (${sizeKB}KB, ${file.status})`);
              }
            } catch (error) {
              console.log(`   • ${file.id} (${file.status})`);
            }
          }
        }
      } else {
        console.error('❌ Failed to get files');
      }

    } catch (error) {
      console.error(`❌ Error checking ${persona.name}:`, error.message);
    }
  }

  console.log('\n🎯 Check complete!');
}

checkAllVectorStores().catch(console.error);