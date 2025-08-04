/**
 * Embedding Service
 * =================
 * Generates and manages vector embeddings for semantic search using OpenAI's embedding API
 */

import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  model: string;
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  category: string;
}

export class EmbeddingService {
  private readonly openaiApiKey: string;
  private readonly model = 'text-embedding-3-small';
  private readonly embeddingDimensions = 1536;

  constructor() {
    // Use Claude API key as OpenAI key since we need embeddings
    // Note: In production, you'd want a separate OpenAI API key
    this.openaiApiKey = process.env.CLAUDE_API_KEY || '';
    if (!this.openaiApiKey) {
      throw new Error('API key required for embedding generation');
    }
  }

  /**
   * Generate embedding for text using OpenAI API
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      console.log(`🔤 Generating embedding for text (${text.length} chars)`);
      
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: this.model,
          dimensions: this.embeddingDimensions
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      return {
        embedding: data.data[0].embedding,
        tokens: data.usage.total_tokens,
        model: this.model
      };
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for all training documents without embeddings
   */
  async generateTrainingDocumentEmbeddings(): Promise<void> {
    console.log('🚀 Generating embeddings for training documents...');
    
    // Get documents without embeddings
    const result = await pool.query(`
      SELECT id, title, content 
      FROM training_documents 
      WHERE status = 'active' 
        AND content_embedding IS NULL 
        AND LENGTH(content) > 100
      ORDER BY title
    `);

    console.log(`📄 Found ${result.rows.length} documents needing embeddings`);

    for (const doc of result.rows) {
      try {
        console.log(`🔤 Processing: ${doc.title}`);
        
        // Generate embedding
        const embeddingResult = await this.generateEmbedding(doc.content);
        
        // Store in database
        await pool.query(`
          UPDATE training_documents 
          SET 
            content_embedding = $1::vector,
            embedding_model = $2,
            embedding_generated_at = NOW(),
            embedding_tokens = $3
          WHERE id = $4
        `, [
          `[${embeddingResult.embedding.join(',')}]`,
          embeddingResult.model,
          embeddingResult.tokens,
          doc.id
        ]);

        console.log(`✅ Embedded: ${doc.title} (${embeddingResult.tokens} tokens)`);
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to embed ${doc.title}:`, error);
      }
    }

    console.log('🎉 Embedding generation complete!');
  }

  /**
   * Search training documents using semantic similarity
   */
  async searchTrainingDocuments(
    query: string, 
    maxResults: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<SemanticSearchResult[]> {
    try {
      console.log(`🔍 Semantic search: "${query}" (threshold: ${similarityThreshold})`);
      
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search using pgvector
      const result = await pool.query(`
        SELECT 
          id::text,
          title,
          content,
          1 - (content_embedding <=> $1::vector) as similarity,
          category
        FROM training_documents
        WHERE 
          status = 'active' 
          AND content_embedding IS NOT NULL
          AND (1 - (content_embedding <=> $1::vector)) >= $2
        ORDER BY content_embedding <=> $1::vector
        LIMIT $3
      `, [
        `[${queryEmbedding.embedding.join(',')}]`,
        similarityThreshold,
        maxResults
      ]);

      console.log(`📊 Found ${result.rows.length} similar documents`);
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        similarity: parseFloat(row.similarity),
        category: row.category
      }));
      
    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return [];
    }
  }

  /**
   * Get the most relevant training content for a specific report type and user data
   */
  async getRelevantTrainingContent(
    reportType: 'personal' | 'professional',
    userContext: string,
    maxTokens: number = 8000
  ): Promise<string> {
    try {
      const searchQueries = [
        `${reportType} development report template structure`,
        `strengths signature analysis ${reportType}`,
        userContext,
        `flow optimization ${reportType} report`
      ];

      let relevantContent = '';
      let totalTokens = 0;

      for (const query of searchQueries) {
        const results = await this.searchTrainingDocuments(query, 2, 0.6);
        
        for (const result of results) {
          // Estimate tokens (rough: 4 chars per token)
          const estimatedTokens = result.content.length / 4;
          
          if (totalTokens + estimatedTokens < maxTokens) {
            relevantContent += `\n## ${result.title} (Similarity: ${(result.similarity * 100).toFixed(1)}%)\n`;
            relevantContent += result.content.substring(0, 2000) + '\n'; // Limit content length
            totalTokens += estimatedTokens;
          }
        }
        
        if (totalTokens >= maxTokens * 0.8) break; // Stop when near limit
      }

      console.log(`📝 Assembled ${relevantContent.length} chars of relevant training content`);
      return relevantContent;
      
    } catch (error) {
      console.error('❌ Failed to get relevant training content:', error);
      return '';
    }
  }
}

// Create singleton instance
export const embeddingService = new EmbeddingService();

// Default export
export default embeddingService;