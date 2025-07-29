import { Pool } from 'pg';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: any;
}

interface ChunkingOptions {
  maxTokens: number;
  overlapTokens: number;
  preserveContext: boolean;
}

interface EmbeddingOptions {
  model: string;
  batchSize: number;
}

class DocumentEmbeddingService {
  private readonly DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
    maxTokens: 500,
    overlapTokens: 50,
    preserveContext: true
  };

  private readonly DEFAULT_EMBEDDING_OPTIONS: EmbeddingOptions = {
    model: 'text-embedding-ada-002',
    batchSize: 10
  };

  /**
   * Process a document: chunk it and generate embeddings
   */
  async processDocument(documentId: string, options?: Partial<ChunkingOptions & EmbeddingOptions>): Promise<void> {
    const config = { 
      ...this.DEFAULT_CHUNKING_OPTIONS, 
      ...this.DEFAULT_EMBEDDING_OPTIONS, 
      ...options 
    };

    try {
      console.log(`🔄 Starting document processing for ${documentId}`);

      // Create or update processing job
      const jobId = await this.createProcessingJob(documentId, 'chunking');

      // Get document content
      const document = await this.getDocument(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      await this.updateJobStatus(jobId, 'processing', 10);

      // Step 1: Chunk the document
      console.log(`📄 Chunking document: ${document.title}`);
      const chunks = await this.chunkDocument(document.content, config);
      
      await this.updateJobStatus(jobId, 'processing', 30);

      // Step 2: Generate embeddings
      console.log(`🧠 Generating embeddings for ${chunks.length} chunks`);
      const chunksWithEmbeddings = await this.generateEmbeddings(chunks, config);
      
      await this.updateJobStatus(jobId, 'processing', 70);

      // Step 3: Store chunks with embeddings
      console.log(`💾 Storing ${chunksWithEmbeddings.length} chunks in database`);
      await this.storeDocumentChunks(documentId, chunksWithEmbeddings);
      
      await this.updateJobStatus(jobId, 'completed', 100);

      console.log(`✅ Document processing completed for ${documentId}`);

    } catch (error) {
      console.error(`❌ Error processing document ${documentId}:`, error);
      
      // Find the most recent processing job for this document
      const jobResult = await pool.query(`
        SELECT id FROM document_processing_jobs
        WHERE document_id = $1 AND job_type = 'chunking'
        ORDER BY created_at DESC
        LIMIT 1
      `, [documentId]);

      if (jobResult.rows.length > 0) {
        await this.updateJobStatus(
          jobResult.rows[0].id, 
          'failed', 
          0, 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      throw error;
    }
  }

  /**
   * Chunk a document into smaller pieces
   */
  private async chunkDocument(content: string, options: ChunkingOptions): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    
    // Simple text chunking by characters (can be enhanced with token counting)
    const approximateTokens = (text: string) => Math.ceil(text.length / 4); // Rough approximation
    const maxChars = options.maxTokens * 4; // Rough approximation
    const overlapChars = options.overlapTokens * 4;

    // Split by paragraphs first to preserve context
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      // If adding this paragraph would exceed max length, save current chunk
      if (currentChunk.length > 0 && (currentChunk.length + trimmedParagraph.length) > maxChars) {
        chunks.push({
          id: uuidv4(),
          documentId: '', // Will be set when storing
          content: currentChunk.trim(),
          chunkIndex,
          tokenCount: approximateTokens(currentChunk),
          metadata: {
            type: 'paragraph_chunk',
            startsParagraph: true,
            preserveContext: options.preserveContext
          }
        });
        
        chunkIndex++;
        
        // Start new chunk with overlap if enabled
        if (options.preserveContext && overlapChars > 0) {
          const overlapText = currentChunk.slice(-overlapChars);
          currentChunk = overlapText + '\n\n' + trimmedParagraph;
        } else {
          currentChunk = trimmedParagraph;
        }
      } else {
        // Add paragraph to current chunk
        if (currentChunk.length > 0) {
          currentChunk += '\n\n' + trimmedParagraph;
        } else {
          currentChunk = trimmedParagraph;
        }
      }
    }
    
    // Add final chunk if there's content
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: uuidv4(),
        documentId: '', // Will be set when storing
        content: currentChunk.trim(),
        chunkIndex,
        tokenCount: approximateTokens(currentChunk),
        metadata: {
          type: 'paragraph_chunk',
          startsParagraph: true,
          preserveContext: options.preserveContext
        }
      });
    }

    console.log(`📄 Created ${chunks.length} chunks from document`);
    return chunks;
  }

  /**
   * Generate embeddings for document chunks
   */
  private async generateEmbeddings(chunks: DocumentChunk[], options: EmbeddingOptions): Promise<DocumentChunk[]> {
    const chunksWithEmbeddings: DocumentChunk[] = [];
    
    // Process chunks in batches to avoid rate limits
    for (let i = 0; i < chunks.length; i += options.batchSize) {
      const batch = chunks.slice(i, i + options.batchSize);
      
      console.log(`🧠 Processing embedding batch ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(chunks.length / options.batchSize)}`);
      
      try {
        // Prepare input texts
        const inputTexts = batch.map(chunk => chunk.content);
        
        // Generate embeddings using OpenAI
        const response = await openai.embeddings.create({
          model: options.model,
          input: inputTexts,
        });

        // Combine chunks with their embeddings
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const embedding = response.data[j]?.embedding;
          
          if (!embedding) {
            throw new Error(`No embedding returned for chunk ${chunk.chunkIndex}`);
          }
          
          chunksWithEmbeddings.push({
            ...chunk,
            metadata: {
              ...chunk.metadata,
              embedding: embedding,
              embeddingModel: options.model,
              embeddingDimensions: embedding.length
            }
          });
        }
        
        // Small delay to respect rate limits
        if (i + options.batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Error generating embeddings for batch ${Math.floor(i / options.batchSize) + 1}:`, error);
        throw error;
      }
    }
    
    console.log(`✅ Generated embeddings for ${chunksWithEmbeddings.length} chunks`);
    return chunksWithEmbeddings;
  }

  /**
   * Store document chunks with embeddings in the database
   */
  private async storeDocumentChunks(documentId: string, chunks: DocumentChunk[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear any existing chunks for this document
      await client.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
      
      // Insert new chunks
      for (const chunk of chunks) {
        const embedding = chunk.metadata.embedding;
        
        await client.query(`
          INSERT INTO document_chunks (
            id, document_id, content, chunk_index, embeddings, metadata, token_count, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
          chunk.id,
          documentId,
          chunk.content,
          chunk.chunkIndex,
          `[${embedding.join(',')}]`, // Convert array to PostgreSQL vector format
          JSON.stringify({
            type: chunk.metadata.type,
            embeddingModel: chunk.metadata.embeddingModel,
            embeddingDimensions: chunk.metadata.embeddingDimensions,
            preserveContext: chunk.metadata.preserveContext
          }),
          chunk.tokenCount
        ]);
      }
      
      await client.query('COMMIT');
      console.log(`💾 Stored ${chunks.length} chunks for document ${documentId}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error storing document chunks:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find similar document chunks using cosine similarity
   */
  async findSimilarChunks(
    queryText: string, 
    options: {
      similarityThreshold?: number;
      maxResults?: number;
      documentTypes?: string[];
    } = {}
  ): Promise<Array<{
    chunkId: string;
    documentId: string;
    content: string;
    similarityScore: number;
    documentTitle: string;
    documentType: string;
  }>> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateQueryEmbedding(queryText);
      
      // Search for similar chunks
      const similarityThreshold = options.similarityThreshold || 0.7;
      const maxResults = options.maxResults || 5;
      
      let typeFilter = '';
      const params: any[] = [
        `[${queryEmbedding.join(',')}]`,
        similarityThreshold,
        maxResults
      ];
      
      if (options.documentTypes && options.documentTypes.length > 0) {
        typeFilter = 'AND td.document_type = ANY($4)';
        params.push(options.documentTypes);
      }
      
      const query = `
        SELECT 
          dc.id as chunk_id,
          dc.document_id,
          dc.content,
          1 - (dc.embeddings <=> $1::vector) as similarity_score,
          td.title as document_title,
          td.document_type
        FROM document_chunks dc
        JOIN training_documents td ON dc.document_id = td.id
        WHERE 
          td.status = 'active'
          AND (1 - (dc.embeddings <=> $1::vector)) >= $2
          ${typeFilter}
        ORDER BY similarity_score DESC
        LIMIT $3
      `;
      
      const result = await pool.query(query, params);
      
      return result.rows.map(row => ({
        chunkId: row.chunk_id,
        documentId: row.document_id,
        content: row.content,
        similarityScore: parseFloat(row.similarity_score),
        documentTitle: row.document_title,
        documentType: row.document_type
      }));
      
    } catch (error) {
      console.error('❌ Error finding similar chunks:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a query text
   */
  private async generateQueryEmbedding(queryText: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.DEFAULT_EMBEDDING_OPTIONS.model,
        input: queryText,
      });
      
      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned for query');
      }
      
      return embedding;
    } catch (error) {
      console.error('❌ Error generating query embedding:', error);
      throw error;
    }
  }

  /**
   * Get document from database
   */
  private async getDocument(documentId: string): Promise<{
    id: string;
    title: string;
    content: string;
    document_type: string;
  } | null> {
    try {
      const result = await pool.query(`
        SELECT id, title, content, document_type
        FROM training_documents
        WHERE id = $1 AND status = 'active'
      `, [documentId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting document:', error);
      throw error;
    }
  }

  /**
   * Create a processing job
   */
  private async createProcessingJob(documentId: string, jobType: string): Promise<string> {
    try {
      const jobId = uuidv4();
      await pool.query(`
        INSERT INTO document_processing_jobs (
          id, document_id, job_type, status, progress_percentage, created_at
        ) VALUES ($1, $2, $3, 'pending', 0, NOW())
      `, [jobId, documentId, jobType]);
      
      return jobId;
    } catch (error) {
      console.error('❌ Error creating processing job:', error);
      throw error;
    }
  }

  /**
   * Update processing job status
   */
  private async updateJobStatus(
    jobId: string, 
    status: string, 
    progressPercentage: number, 
    errorMessage?: string
  ): Promise<void> {
    try {
      const completedAt = status === 'completed' || status === 'failed' ? new Date() : null;
      
      await pool.query(`
        UPDATE document_processing_jobs
        SET status = $1, progress_percentage = $2, error_message = $3, 
            ${completedAt ? 'completed_at = $4,' : ''} updated_at = NOW()
        WHERE id = ${completedAt ? '$5' : '$4'}
      `, completedAt ? 
        [status, progressPercentage, errorMessage, completedAt, jobId] :
        [status, progressPercentage, errorMessage, jobId]
      );
    } catch (error) {
      console.error('❌ Error updating job status:', error);
      throw error;
    }
  }

  /**
   * Process all pending documents
   */
  async processPendingDocuments(): Promise<void> {
    try {
      console.log('🔄 Checking for pending document processing jobs...');
      
      const pendingJobs = await pool.query(`
        SELECT document_id, MIN(created_at) as earliest_created_at
        FROM document_processing_jobs
        WHERE status = 'pending' AND job_type = 'chunking'
        GROUP BY document_id
        ORDER BY earliest_created_at ASC
      `);
      
      console.log(`📋 Found ${pendingJobs.rows.length} pending document(s) to process`);
      
      for (const job of pendingJobs.rows) {
        try {
          await this.processDocument(job.document_id);
        } catch (error) {
          console.error(`❌ Failed to process document ${job.document_id}:`, error);
          // Continue with next document
        }
      }
      
      console.log('✅ Finished processing pending documents');
    } catch (error) {
      console.error('❌ Error processing pending documents:', error);
      throw error;
    }
  }

  /**
   * Get embedding statistics
   */
  async getEmbeddingStats(): Promise<{
    totalChunks: number;
    processedDocuments: number;
    averageChunksPerDocument: number;
    averageTokensPerChunk: number;
  }> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_chunks,
          COUNT(DISTINCT document_id) as processed_documents,
          AVG(token_count) as avg_tokens_per_chunk
        FROM document_chunks
      `);
      
      const stats = result.rows[0];
      
      return {
        totalChunks: parseInt(stats.total_chunks),
        processedDocuments: parseInt(stats.processed_documents),
        averageChunksPerDocument: stats.processed_documents > 0 ? 
          stats.total_chunks / stats.processed_documents : 0,
        averageTokensPerChunk: parseFloat(stats.avg_tokens_per_chunk) || 0
      };
    } catch (error) {
      console.error('❌ Error getting embedding stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const documentEmbeddingService = new DocumentEmbeddingService();
export default documentEmbeddingService;