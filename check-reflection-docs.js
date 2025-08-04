import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function findReflectionDocuments() {
  try {
    const coachingDocs = await pool.query(`
      SELECT id, title, category, document_type, status 
      FROM training_documents 
      WHERE category IN ('coaching_system', 'Talia_Training', 'AST_Training') 
      AND status = 'active' 
      ORDER BY category, title
    `);
    
    console.log('📚 Potential documents for Reflection Talia:');
    console.log('');
    
    let currentCategory = '';
    coachingDocs.rows.forEach(doc => {
      if (doc.category !== currentCategory) {
        console.log('📁 ' + doc.category + ':');
        console.log('----------------------------');
        currentCategory = doc.category;
      }
      console.log('- ' + doc.title);
      console.log('  ID: ' + doc.id);
      console.log('  Type: ' + doc.document_type);
      console.log('');
    });
    
    console.log('📊 Summary:');
    console.log('Total suitable documents:', coachingDocs.rows.length);
    
    const docIds = coachingDocs.rows.map(doc => doc.id);
    console.log('\nDocument IDs array:');
    console.log('[');
    console.log('  "' + docIds.join('",\n  "') + '"');
    console.log(']');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findReflectionDocuments();