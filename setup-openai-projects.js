/**
 * Set up OpenAI projects with proper vector store organization
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './server/.env.development' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function setupOpenAIProjects() {
  try {
    console.log('🏗️ Setting up OpenAI project structure...\n');
    
    // Create vector stores for different projects
    const projectConfig = [
      {
        name: 'Reflection Talia - Interactive Coaching',
        description: 'Documents for Reflection Talia to help users during workshop steps',
        purpose: 'Interactive coaching and reflection guidance'
      },
      {
        name: 'Report Talia - Report Generation', 
        description: 'Documents for Report Talia to generate comprehensive reports',
        purpose: 'Holistic report generation and analysis'
      },
      {
        name: 'Admin Training - Cross-Project',
        description: 'Training documents for admin chat interface with cross-project awareness',
        purpose: 'Admin tools and persona training'
      },
      {
        name: 'Development Testing',
        description: 'Test documents for development and experimentation',
        purpose: 'Testing and development workflows'
      }
    ];
    
    // Check existing vector stores
    console.log('📚 Current Vector Stores:');
    const existingStores = await openai.vectorStores.list();
    existingStores.data.forEach((vs, index) => {
      console.log(`  ${index + 1}. ${vs.name} (${vs.file_counts?.completed || 0} files)`);
    });
    
    console.log('\n🆕 Creating new project vector stores:\n');
    
    const createdStores = [];
    
    for (const project of projectConfig) {
      // Check if store already exists
      const existing = existingStores.data.find(vs => 
        vs.name && vs.name.includes(project.name.split(' - ')[0])
      );
      
      if (existing) {
        console.log(`⚠️  Similar store exists: "${existing.name}" - skipping "${project.name}"`);
        createdStores.push(existing);
        continue;
      }
      
      try {
        const vectorStore = await openai.vectorStores.create({
          name: project.name,
          metadata: {
            purpose: project.purpose,
            created_by: 'openai_migration_script',
            project_type: project.name.split(' - ')[0].toLowerCase().replace(' ', '_')
          }
        });
        
        console.log(`✅ Created: "${vectorStore.name}" (ID: ${vectorStore.id})`);
        createdStores.push(vectorStore);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to create "${project.name}":`, error.message);
      }
    }
    
    console.log('\n📋 Project Summary:');
    console.log('==================');
    
    const finalStores = await openai.vectorStores.list();
    finalStores.data.forEach((vs, index) => {
      const projectType = vs.metadata?.project_type || 'legacy';
      const purpose = vs.metadata?.purpose || 'Existing vector store';
      
      console.log(`\n${index + 1}. **${vs.name}**`);
      console.log(`   ID: ${vs.id}`);
      console.log(`   Type: ${projectType}`);
      console.log(`   Purpose: ${purpose}`);
      console.log(`   Files: ${vs.file_counts?.completed || 0} documents`);
    });
    
    console.log('\n🔧 Next Steps:');
    console.log('==============');
    console.log('1. Copy documents from "Star Report Talia" to appropriate project stores');
    console.log('2. Update application to use project-specific vector stores');
    console.log('3. Create separate API keys for each project (optional)');
    console.log('4. Test Reflection Talia and Report Talia independently');
    
    return createdStores;
    
  } catch (error) {
    console.error('❌ Error setting up OpenAI projects:', error.message);
    throw error;
  }
}

setupOpenAIProjects()
  .then(() => {
    console.log('\n✅ OpenAI project setup complete!');
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });