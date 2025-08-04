import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function getReflectionTaliaDocs() {
  try {
    const docs = await pool.query(`
      SELECT id, title, category, original_filename, openai_file_id
      FROM training_documents 
      WHERE title IN (
        'Reflection Talia Training Doc',
        'AST Workshop Compendium 2025', 
        'Talia AI Coach Training Manual',
        'Strengths-Based Coaching Principles'
      )
      AND status = 'active'
      ORDER BY title
    `);
    
    console.log('📚 Documents for Reflection Talia:');
    docs.rows.forEach(doc => {
      console.log('- ' + doc.title);
      console.log('  ID: ' + doc.id);
      console.log('  Category: ' + doc.category);
      console.log('  File: ' + (doc.original_filename || 'N/A'));
      console.log('  OpenAI File ID: ' + (doc.openai_file_id || 'N/A'));
      console.log('');
    });
    
    const docIds = docs.rows.map(doc => doc.id);
    console.log('Document IDs: ["' + docIds.join('", "') + '"]');
    
    const fileIds = docs.rows.filter(doc => doc.openai_file_id).map(doc => doc.openai_file_id);
    console.log('OpenAI File IDs: ["' + fileIds.join('", "') + '"]');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getReflectionTaliaDocs();