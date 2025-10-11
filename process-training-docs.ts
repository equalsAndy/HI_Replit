#!/usr/bin/env npx tsx
import "dotenv/config";
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function processAllTrainingDocuments() {
  console.log('🔄 Processing Training Documents for Text Search');
  console.log('===============================================\n');

  try {
    // Get all active training documents
    const documentsResult = await pool.query(`
      SELECT id, title, content 
      FROM training_documents 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);

    console.log(`Found ${documentsResult.rows.length} training documents to process\n`);

    for (const doc of documentsResult.rows) {
      console.log(`📄 Processing: ${doc.title}`);
      
      try {
        // Check if already processed
        const existingChunks = await pool.query(
          'SELECT COUNT(*) as count FROM document_chunks WHERE document_id = $1',
          [doc.id]
        );

        if (existingChunks.rows[0].count > 0) {
          console.log(`  ⚠️  Already processed (${existingChunks.rows[0].count} chunks), skipping...`);
          continue;
        }

        // Create chunks
        const chunks = chunkDocumentText(doc.content);
        
        // Store chunks
        for (let i = 0; i < chunks.length; i++) {
          await pool.query(`
            INSERT INTO document_chunks (
              id, document_id, content, chunk_index, token_count, created_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, NOW()
            )
          `, [
            doc.id,
            chunks[i].content,
            chunks[i].chunkIndex,
            chunks[i].tokenCount
          ]);
        }

        console.log(`  ✅ Created ${chunks.length} searchable chunks`);

      } catch (error) {
        console.log(`  ❌ Failed to process: ${error.message}`);
      }
    }

    // Summary
    console.log('\n📊 Processing Summary');
    console.log('====================');
    
    const totalChunks = await pool.query(`
      SELECT COUNT(*) as count FROM document_chunks
    `);
    
    const chunksByDoc = await pool.query(`
      SELECT td.title, COUNT(dc.id) as chunk_count
      FROM training_documents td
      LEFT JOIN document_chunks dc ON td.id = dc.document_id
      WHERE td.status = 'active'
      GROUP BY td.id, td.title
      ORDER BY chunk_count DESC
    `);
    
    console.log(`Total Document Chunks: ${totalChunks.rows[0].count}`);
    console.log('\nChunks by Document:');
    chunksByDoc.rows.forEach(row => {
      console.log(`  - ${row.title}: ${row.chunk_count} chunks`);
    });

    console.log('\n✅ Training Document Processing Complete!');
    console.log('Talia can now access training documents during coaching and report generation.');

  } catch (error) {
    console.error('❌ Processing failed:', error);
  } finally {
    await pool.end();
  }
}

/**
 * Simple text chunking function
 */
function chunkDocumentText(content: string): Array<{
  content: string;
  chunkIndex: number;
  tokenCount: number;
}> {
  const chunks: Array<{ content: string; chunkIndex: number; tokenCount: number }> = [];
  
  // Split by paragraphs and combine into chunks
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const maxChunkSize = 1000; // characters
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    if (currentChunk.length + trimmedParagraph.length + 2 <= maxChunkSize) {
      // Add to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
    } else {
      // Save current chunk and start new one
      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          chunkIndex: chunkIndex++,
          tokenCount: Math.ceil(currentChunk.length / 4) // rough token estimate
        });
      }
      currentChunk = trimmedParagraph;
    }
  }
  
  // Add final chunk
  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      chunkIndex: chunkIndex++,
      tokenCount: Math.ceil(currentChunk.length / 4)
    });
  }
  
  return chunks;
}

processAllTrainingDocuments();