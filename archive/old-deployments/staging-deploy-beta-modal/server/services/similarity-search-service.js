import { Pool } from 'pg';
import { textSearchService } from './text-search-service.js';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
class SimilaritySearchService {
    async searchSimilarContent(query, options = {}) {
        return await textSearchService.searchWithVariations(query, {
            maxResults: options.maxResults,
            documentTypes: options.documentTypes,
            minRelevanceScore: 0.1
        });
    }
    async generateContextForAI(queries, options = {}) {
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
                similarityScore: chunk.relevanceScore,
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
    async getAvailableDocumentTypes() {
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
        }
        catch (error) {
            console.error('❌ Error getting document types:', error);
            throw error;
        }
    }
    async testSimilaritySearch() {
        try {
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
        }
        catch (error) {
            return {
                isWorking: false,
                hasData: false,
                sampleResults: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
export const similaritySearchService = new SimilaritySearchService();
export default similaritySearchService;
