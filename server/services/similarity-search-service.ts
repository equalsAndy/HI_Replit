import { Pool } from 'pg';
import { textSearchService } from './text-search-service.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface SimilarChunk {
  chunkId: string;
  documentId: string;
  content: string;
  similarityScore: number;
  documentTitle: string;
  documentType: string;
}

interface SearchOptions {
  similarityThreshold?: number;
  maxResults?: number;
  documentTypes?: string[];
}

class SimilaritySearchService {
  /**
   * Search for similar document chunks based on a query
   */
  async searchSimilarContent(
    query: string, 
    options: SearchOptions = {}
  ): Promise<SimilarChunk[]> {
    // Delegate to text search service
    return await textSearchService.searchWithVariations(query, {
      maxResults: options.maxResults,
      documentTypes: options.documentTypes,
      minRelevanceScore: 0.1 // Convert similarity threshold to relevance score
    });
  }

  /**
   * Generate context for AI coaching or report generation
   */
  async generateContextForAI(
    queries: string[],
    options: {
      maxChunksPerQuery?: number;
      similarityThreshold?: number;
      documentTypes?: string[];
    } = {}
  ): Promise<{
    context: string;
    sourceChunks: SimilarChunk[];
    metadata: {
      totalQueries: number;
      totalChunks: number;
      documentsSources: string[];
    };
  }> {
    // Delegate to text search service
    const result = await textSearchService.generateContextForAI(queries, {
      maxChunksPerQuery: options.maxChunksPerQuery,
      documentTypes: options.documentTypes,
      contextStyle: 'detailed'
    });

    return {
      context: result.context,
      sourceChunks: result.sourceChunks.map(chunk => ({
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        content: chunk.content,
        similarityScore: chunk.relevanceScore, // Map relevance to similarity
        documentTitle: chunk.documentTitle,
        documentType: chunk.documentType
      })),
      metadata: {
        totalQueries: result.metadata.totalQueries,
        totalChunks: result.metadata.totalChunks,
        documentsSources: result.metadata.documentSources
      }
    };
  }

  // Note: Embedding functionality removed - using text search instead

  /**
   * Get available document types for filtering
   */
  async getAvailableDocumentTypes(): Promise<Array<{
    document_type: string;
    count: number;
    chunk_count: number;
  }>> {
    try {
      const result = await pool.query(`
        SELECT 
          td.document_type,
          COUNT(DISTINCT td.id) as count,
          COUNT(dc.id) as chunk_count
        FROM training_documents td
        LEFT JOIN document_chunks dc ON td.id = dc.document_id
        WHERE td.status = 'active'
        GROUP BY td.document_type
        ORDER BY chunk_count DESC
      `);

      return result.rows.map(row => ({
        document_type: row.document_type,
        count: parseInt(row.count),
        chunk_count: parseInt(row.chunk_count)
      }));
    } catch (error) {
      console.error('❌ Error getting document types:', error);
      throw error;
    }
  }

  /**
   * Test similarity search with sample queries
   */
  async testSimilaritySearch(): Promise<{
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
        return {
          isWorking: true,
          hasData: false,
          sampleResults: [],
          error: 'No document chunks available for testing'
        };
      }

      // Test with a simple query
      const testQuery = 'coaching strengths development';
      const results = await this.searchSimilarContent(testQuery, {
        maxResults: 3,
        similarityThreshold: 0.5
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
}

// Export singleton instance
export const similaritySearchService = new SimilaritySearchService();
export default similaritySearchService;