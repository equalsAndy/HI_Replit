import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface SimilarChunk {
  chunkId: string;
  documentId: string;
  content: string;
  relevanceScore: number;
  documentTitle: string;
  documentType: string;
  rank: number;
}

interface SearchOptions {
  maxResults?: number;
  documentTypes?: string[];
  documentIds?: string[];
  minRelevanceScore?: number;
}

class TextSearchService {
  /**
   * Search for similar document chunks using PostgreSQL full-text search
   */
  async searchSimilarContent(
    query: string, 
    options: SearchOptions = {}
  ): Promise<SimilarChunk[]> {
    try {
      console.log('🔍 Performing text search for:', query.substring(0, 100) + '...');

      const maxResults = options.maxResults || 5;
      const minRelevanceScore = options.minRelevanceScore || 0.1;
      
      let typeFilter = '';
      const params: any[] = [query, maxResults];
      let paramIndex = 3;
      
      if (options.documentTypes && options.documentTypes.length > 0) {
        typeFilter += ` AND td.document_type = ANY($${paramIndex})`;
        params.push(options.documentTypes);
        paramIndex++;
      }
      
      if (options.documentIds && options.documentIds.length > 0) {
        typeFilter += ` AND td.id = ANY($${paramIndex})`;
        params.push(options.documentIds);
        paramIndex++;
      }
      
      // Use PostgreSQL full-text search with ranking
      const searchQuery = `
        SELECT 
          dc.id as chunk_id,
          dc.document_id,
          dc.content,
          ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $1)) as relevance_score,
          td.title as document_title,
          td.document_type,
          ROW_NUMBER() OVER (ORDER BY ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $1)) DESC) as rank
        FROM document_chunks dc
        JOIN training_documents td ON dc.document_id = td.id
        WHERE 
          td.status = 'active'
          AND to_tsvector('english', dc.content) @@ plainto_tsquery('english', $1)
          AND ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', $1)) >= $${paramIndex}
          ${typeFilter}
        ORDER BY relevance_score DESC
        LIMIT $2
      `;
      
      params.push(minRelevanceScore);
      
      console.log('🔍 Executing text search query...');
      const result = await pool.query(searchQuery, params);
      
      const chunks = result.rows.map(row => ({
        chunkId: row.chunk_id,
        documentId: row.document_id,
        content: row.content,
        relevanceScore: parseFloat(row.relevance_score),
        documentTitle: row.document_title,
        documentType: row.document_type,
        rank: parseInt(row.rank)
      }));

      console.log(`✅ Found ${chunks.length} relevant chunks`);
      return chunks;
      
    } catch (error) {
      console.error('❌ Error in text search:', error);
      throw error;
    }
  }

  /**
   * Search with keyword variations and synonyms
   */
  async searchWithVariations(
    query: string,
    options: SearchOptions = {}
  ): Promise<SimilarChunk[]> {
    try {
      // Generate keyword variations
      const variations = this.generateSearchVariations(query);
      console.log('🔍 Searching with variations:', variations);

      const allResults: SimilarChunk[] = [];
      const seenChunkIds = new Set<string>();

      // Search for each variation
      for (const variation of variations) {
        const results = await this.searchSimilarContent(variation, {
          ...options,
          maxResults: Math.ceil((options.maxResults || 5) / variations.length) + 2
        });

        // Add unique results
        for (const result of results) {
          if (!seenChunkIds.has(result.chunkId)) {
            allResults.push(result);
            seenChunkIds.add(result.chunkId);
          }
        }
      }

      // Sort by relevance score and take top results
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const topResults = allResults.slice(0, options.maxResults || 5);

      return topResults;

    } catch (error) {
      console.error('❌ Error in variation search:', error);
      throw error;
    }
  }

  /**
   * Generate context for AI coaching or report generation
   */
  async generateContextForAI(
    queries: string[],
    options: {
      maxChunksPerQuery?: number;
      documentTypes?: string[];
      contextStyle?: 'detailed' | 'summary' | 'bullet';
    } = {}
  ): Promise<{
    context: string;
    sourceChunks: SimilarChunk[];
    metadata: {
      totalQueries: number;
      totalChunks: number;
      documentSources: string[];
      searchTerms: string[];
    };
  }> {
    try {
      const maxChunksPerQuery = options.maxChunksPerQuery || 3;
      const allChunks: SimilarChunk[] = [];
      const seenChunkIds = new Set<string>();
      const allSearchTerms: string[] = [];

      // Search for each query with variations
      for (const query of queries) {
        allSearchTerms.push(query);
        
        const chunks = await this.searchWithVariations(query, {
          ...options,
          maxResults: maxChunksPerQuery
        });

        // Add unique chunks only
        for (const chunk of chunks) {
          if (!seenChunkIds.has(chunk.chunkId)) {
            allChunks.push(chunk);
            seenChunkIds.add(chunk.chunkId);
          }
        }
      }

      // Sort by relevance score and take top chunks
      allChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const topChunks = allChunks.slice(0, 8); // Max 8 chunks for context

      // Build context string based on style
      const context = this.formatContext(topChunks, options.contextStyle || 'detailed');

      // Get unique document sources
      const documentSources = [...new Set(topChunks.map(chunk => chunk.documentTitle))];

      return {
        context,
        sourceChunks: topChunks,
        metadata: {
          totalQueries: queries.length,
          totalChunks: topChunks.length,
          documentSources,
          searchTerms: allSearchTerms
        }
      };

    } catch (error) {
      console.error('❌ Error generating AI context:', error);
      throw error;
    }
  }

  /**
   * Process documents to create searchable chunks (without embeddings)
   */
  async processDocumentForSearch(documentId: string): Promise<void> {
    try {
      console.log(`🔄 Processing document for text search: ${documentId}`);

      // Get document content
      const documentResult = await pool.query(`
        SELECT id, title, content, document_type
        FROM training_documents
        WHERE id = $1 AND status = 'active'
      `, [documentId]);

      if (documentResult.rows.length === 0) {
        throw new Error(`Document ${documentId} not found`);
      }

      const document = documentResult.rows[0];

      // Create chunks (simple text chunking)
      const chunks = this.chunkDocumentText(document.content);

      // Store chunks in database (without embeddings)
      await this.storeDocumentChunks(documentId, chunks);

      console.log(`✅ Processed ${chunks.length} chunks for document: ${document.title}`);

    } catch (error) {
      console.error(`❌ Error processing document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Simple text chunking without token counting
   */
  private chunkDocumentText(content: string): Array<{
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
      
      // If adding this paragraph would exceed max size, save current chunk
      if (currentChunk.length > 0 && (currentChunk.length + trimmedParagraph.length) > maxChunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          chunkIndex,
          tokenCount: Math.ceil(currentChunk.length / 4) // Rough token estimate
        });
        
        chunkIndex++;
        currentChunk = trimmedParagraph;
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
        content: currentChunk.trim(),
        chunkIndex,
        tokenCount: Math.ceil(currentChunk.length / 4)
      });
    }

    return chunks;
  }

  /**
   * Store document chunks in database (without embeddings)
   */
  private async storeDocumentChunks(
    documentId: string, 
    chunks: Array<{ content: string; chunkIndex: number; tokenCount: number }>
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear any existing chunks for this document
      await client.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
      
      // Insert new chunks (without embeddings)
      for (const chunk of chunks) {
        await client.query(`
          INSERT INTO document_chunks (
            id, document_id, content, chunk_index, metadata, token_count, created_at
          ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
        `, [
          documentId,
          chunk.content,
          chunk.chunkIndex,
          JSON.stringify({
            type: 'text_chunk',
            processed_for: 'text_search',
            has_embeddings: false
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
   * Generate search variations and synonyms
   */
  private generateSearchVariations(query: string): string[] {
    const variations = [query]; // Start with original query
    
    // Common coaching/development synonyms
    const synonymMap: Record<string, string[]> = {
      'coaching': ['mentoring', 'guidance', 'development', 'training'],
      'strengths': ['talents', 'abilities', 'skills', 'capabilities'],
      'development': ['growth', 'improvement', 'progress', 'advancement'],
      'team': ['group', 'collaboration', 'teamwork', 'collective'],
      'leadership': ['management', 'guidance', 'direction', 'supervision'],
      'assessment': ['evaluation', 'analysis', 'review', 'measurement'],
      'feedback': ['input', 'response', 'evaluation', 'criticism'],
      'performance': ['achievement', 'results', 'effectiveness', 'productivity']
    };
    
    // Add variations with synonyms
    const words = query.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (synonymMap[word]) {
        for (const synonym of synonymMap[word]) {
          const variation = query.replace(new RegExp(word, 'gi'), synonym);
          if (!variations.includes(variation)) {
            variations.push(variation);
          }
        }
      }
    }
    
    return variations.slice(0, 3); // Limit to 3 variations to avoid too many queries
  }

  /**
   * Format context based on style preference
   */
  private formatContext(chunks: SimilarChunk[], style: 'detailed' | 'summary' | 'bullet'): string {
    switch (style) {
      case 'bullet':
        return chunks
          .map((chunk, index) => `• ${chunk.documentTitle}: ${chunk.content}`)
          .join('\n');
      
      case 'summary':
        return chunks
          .map((chunk, index) => `**${chunk.documentTitle}**\n${chunk.content.substring(0, 200)}...`)
          .join('\n\n');
      
      case 'detailed':
      default:
        return chunks
          .map((chunk, index) => `## Reference ${index + 1}: ${chunk.documentTitle}\n${chunk.content}`)
          .join('\n\n');
    }
  }

  /**
   * Process all pending documents for text search
   */
  async processPendingDocuments(): Promise<void> {
    try {
      console.log('🔄 Processing documents for text search...');
      
      // Find documents that don't have chunks yet
      const pendingDocsResult = await pool.query(`
        SELECT td.id, td.title
        FROM training_documents td
        LEFT JOIN document_chunks dc ON td.id = dc.document_id
        WHERE td.status = 'active' AND dc.id IS NULL
        ORDER BY td.created_at ASC
      `);
      
      console.log(`📋 Found ${pendingDocsResult.rows.length} document(s) to process`);
      
      for (const doc of pendingDocsResult.rows) {
        try {
          await this.processDocumentForSearch(doc.id);
        } catch (error) {
          console.error(`❌ Failed to process document ${doc.title}:`, error);
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
   * Test text search functionality
   */
  async testTextSearch(): Promise<{
    isWorking: boolean;
    hasData: boolean;
    sampleResults: SimilarChunk[];
    error?: string;
  }> {
    try {
      // Check if we have any chunks
      const chunkCountResult = await pool.query('SELECT COUNT(*) as count FROM document_chunks');
      const chunkCount = parseInt(chunkCountResult.rows[0].count);

      if (chunkCount === 0) {
        // Try to process pending documents
        await this.processPendingDocuments();
        
        // Check again
        const newCountResult = await pool.query('SELECT COUNT(*) as count FROM document_chunks');
        const newChunkCount = parseInt(newCountResult.rows[0].count);
        
        if (newChunkCount === 0) {
          return {
            isWorking: true,
            hasData: false,
            sampleResults: [],
            error: 'No document chunks available for testing'
          };
        }
      }

      // Test with a simple query
      const testQuery = 'coaching strengths development';
      const results = await this.searchSimilarContent(testQuery, {
        maxResults: 3,
        minRelevanceScore: 0.01 // Lower threshold for testing
      });

      return {
        isWorking: true,
        hasData: true,
        sampleResults: results
      };

    } catch (error) {
      return {
        isWorking: false,
        hasData: false,
        sampleResults: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<{
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
      console.error('❌ Error getting search stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const textSearchService = new TextSearchService();
export default textSearchService;