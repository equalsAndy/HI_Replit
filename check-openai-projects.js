/**
 * Check existing OpenAI projects and vector stores
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function checkOpenAIResources() {
  try {
    console.log('🔍 Checking OpenAI resources...\n');
    
    // Check API key first
    console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
    
    // Check vector stores
    console.log('📚 Vector Stores:');
    const vectorStores = await openai.vectorStores.list();
    
    if (vectorStores.data.length === 0) {
      console.log('  No vector stores found');
    } else {
      vectorStores.data.forEach((vs, index) => {
        console.log(`  ${index + 1}. ${vs.name || 'Unnamed'} (ID: ${vs.id})`);
        console.log(`     Files: ${vs.file_counts?.completed || 0} completed, ${vs.file_counts?.in_progress || 0} in progress`);
        console.log(`     Created: ${new Date(vs.created_at * 1000).toLocaleDateString()}`);
        console.log('');
      });
    }
    
    // Check files in each vector store
    for (const vs of vectorStores.data) {
      console.log(`📁 Files in "${vs.name || 'Unnamed'}" (${vs.id}):`);
      try {
        const files = await openai.vectorStores.files.list(vs.id);
        if (files.data.length === 0) {
          console.log('   No files found');
        } else {
          files.data.forEach((file, index) => {
            console.log(`   ${index + 1}. File ID: ${file.id}, Status: ${file.status}`);
          });
        }
      } catch (error) {
        console.log(`   Error listing files: ${error.message}`);
      }
      console.log('');
    }
    
    // Check available models
    console.log('🤖 Available Models:');
    const models = await openai.models.list();
    const gptModels = models.data.filter(m => m.id.includes('gpt')).slice(0, 5);
    gptModels.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.id}`);
    });
    
    console.log('\n✅ OpenAI resource check complete');
    
  } catch (error) {
    console.error('❌ Error checking OpenAI resources:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure OPENAI_API_KEY is set in server/.env.development');
    }
  }
}

checkOpenAIResources();