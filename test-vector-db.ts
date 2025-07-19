import { VectorDBService } from './server/services/vector-db.js';

async function testVectorDB() {
  console.log('🧪 Testing Vector Database Service...');
  
  const vectorDB = new VectorDBService();
  
  // Test 1: Connection
  console.log('\n1. Testing ChromaDB connection...');
  const connectionOk = await vectorDB.testConnection();
  console.log(`   Connection: ${connectionOk ? '✅' : '❌'}`);
  
  // Test 2: Initialize collections
  console.log('\n2. Initializing collections...');
  const collectionsOk = await vectorDB.initializeCollections();
  console.log(`   Collections: ${collectionsOk ? '✅' : '❌'}`);
  
  // Test 3: Add sample knowledge
  console.log('\n3. Adding sample knowledge content...');
  const sampleContent = "The AST methodology focuses on team dynamics and individual strengths to improve collaboration.";
  const knowledgeOk = await vectorDB.addKnowledgeContent(
    sampleContent,
    { source: 'ast_methodology', category: 'team_dynamics' },
    'ast-001'
  );
  console.log(`   Knowledge added: ${knowledgeOk ? '✅' : '❌'}`);
  
  // Test 4: Search knowledge
  console.log('\n4. Searching knowledge base...');
  const searchResults = await vectorDB.searchKnowledge('team collaboration', 3);
  console.log(`   Search results: ${searchResults ? '✅' : '❌'}`);
  if (searchResults.documents) {
    console.log(`   Found ${searchResults.documents[0]?.length || 0} results`);
  }
  
  // Test 5: Add sample team profile
  console.log('\n5. Adding sample team profile...');
  const sampleProfile = {
    strengths: ['communication', 'problem-solving', 'leadership'],
    challenges: ['time management', 'delegation'],
    values: ['collaboration', 'innovation', 'integrity'],
    work_style: 'collaborative',
    communication_style: 'direct'
  };
  const profileOk = await vectorDB.addTeamProfile(sampleProfile, 'team-001');
  console.log(`   Profile added: ${profileOk ? '✅' : '❌'}`);
  
  // Test 6: Find similar teams
  console.log('\n6. Finding similar teams...');
  const similarTeams = await vectorDB.findSimilarTeams(sampleProfile, 2);
  console.log(`   Similar teams found: ${similarTeams ? '✅' : '❌'}`);
  if (similarTeams.metadatas) {
    console.log(`   Found ${similarTeams.metadatas[0]?.length || 0} similar teams`);
  }
  
  console.log('\n🎉 Vector Database test completed!');
}

// Run the test
testVectorDB().catch(console.error);
