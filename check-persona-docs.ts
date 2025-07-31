import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkPersonaDocs() {
  try {
    // Check Report Talia's current training documents
    const reportPersona = await pool.query('SELECT id, name, training_documents FROM talia_personas WHERE id = $1', ['star_report']);
    
    console.log('📊 Report Talia Configuration:');
    console.log('=============================');
    if (reportPersona.rows.length > 0) {
      const persona = reportPersona.rows[0];
      console.log(`Name: ${persona.name}`);
      console.log(`Training Documents: ${JSON.stringify(persona.training_documents, null, 2)}`);
      console.log(`Number of assigned documents: ${persona.training_documents?.length || 0}`);
    } else {
      console.log('❌ Report Talia persona not found');
    }
    
    // Show available report template documents
    console.log('\n📄 Available Report Template Documents:');
    console.log('======================================');
    const templates = await pool.query('SELECT id, title FROM training_documents WHERE document_type = $1', ['report_template']);
    templates.rows.forEach(doc => {
      console.log(`  ${doc.id}: ${doc.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPersonaDocs();
EOF < /dev/null