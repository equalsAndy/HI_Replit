/**
 * Pure JavaScript Vector Search Service
 * ===================================
 * TF-IDF vectorization and cosine similarity for training document retrieval
 * Zero external API costs, container-friendly, optimized for token budgeting
 */

import { Pool } from 'pg';
// Simple cosine similarity implementation to avoid import issues
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface DocumentChunk {
  chunkId: string;
  documentId: string;
  content: string;
  documentTitle: string;
  documentType: string;
  vector?: number[];
  tokenCount?: number;
}

interface SimilarityResult {
  chunkId: string;
  content: string;
  similarity: number;
  documentTitle: string;
  documentType: string;
  tokenCount: number;
}

interface SearchOptions {
  maxResults?: number;
  maxTokens?: number;
  minSimilarity?: number;
  documentTypes?: string[];
  allowedDocumentIds?: string[];
}

class JavaScriptVectorService {
  private documentChunks: DocumentChunk[] = [];
  private vocabulary: Map<string, number> = new Map();
  private documentFrequency: Map<string, number> = new Map();
  private isInitialized = false;
  private totalDocuments = 0;

  /**
   * Initialize the vector service by loading and vectorizing all training documents
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('📊 Vector service already initialized');
      return;
    }

    console.log('🔄 Initializing JavaScript Vector Service...');
    const startTime = Date.now();

    try {
      // Load all active training document chunks
      const query = `
        SELECT 
          dc.id as chunk_id,
          dc.document_id,
          dc.content,
          td.title as document_title,
          td.document_type
        FROM document_chunks dc
        JOIN training_documents td ON dc.document_id = td.id
        WHERE td.status = 'active'
        ORDER BY td.title, dc.id
      `;

      const result = await pool.query(query);
      console.log(`📄 Loaded ${result.rows.length} document chunks from database`);

      // Convert to our format and calculate token counts
      this.documentChunks = result.rows.map(row => ({
        chunkId: row.chunk_id,
        documentId: row.document_id,
        content: row.content,
        documentTitle: row.document_title,
        documentType: row.document_type,
        tokenCount: Math.ceil(row.content.length / 4) // Rough token estimate
      }));

      this.totalDocuments = this.documentChunks.length;

      // Build vocabulary and document frequency
      this.buildVocabulary();
      
      // Create TF-IDF vectors for all documents
      this.vectorizeDocuments();

      const initTime = Date.now() - startTime;
      console.log(`✅ Vector service initialized in ${initTime}ms`);
      console.log(`📊 Stats: ${this.documentChunks.length} chunks, ${this.vocabulary.size} vocabulary terms`);
      
      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Failed to initialize vector service:', error);
      throw error;
    }
  }

  /**
   * Build vocabulary and calculate document frequency for TF-IDF
   */
  private buildVocabulary(): void {
    console.log('🔤 Building vocabulary and document frequency...');
    
    const wordCounts = new Map<string, Set<string>>();

    // Process each document to build vocabulary
    for (const chunk of this.documentChunks) {
      const words = this.tokenize(chunk.content);
      const uniqueWords = new Set(words);

      for (const word of uniqueWords) {
        if (!wordCounts.has(word)) {
          wordCounts.set(word, new Set());
        }
        wordCounts.get(word)!.add(chunk.chunkId);
      }
    }

    // Build vocabulary index and document frequency
    let vocabIndex = 0;
    for (const [word, documentSet] of wordCounts) {
      this.vocabulary.set(word, vocabIndex++);
      this.documentFrequency.set(word, documentSet.size);
    }

    console.log(`✅ Built vocabulary: ${this.vocabulary.size} unique terms`);
  }

  /**
   * Create TF-IDF vectors for all documents
   */
  private vectorizeDocuments(): void {
    console.log('🔢 Creating TF-IDF vectors for all documents...');

    for (const chunk of this.documentChunks) {
      chunk.vector = this.createTFIDFVector(chunk.content);
    }

    console.log(`✅ Created ${this.documentChunks.length} document vectors`);
  }

  /**
   * Tokenize text into words for TF-IDF processing
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter short words
      .filter(word => !this.isStopWord(word)); // Remove stop words
  }

  /**
   * Simple stop word filter
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
    return stopWords.has(word);
  }

  /**
   * Create TF-IDF vector for a piece of text
   */
  private createTFIDFVector(text: string): number[] {
    const words = this.tokenize(text);
    const termFreq = new Map<string, number>();
    
    // Calculate term frequency
    for (const word of words) {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    }

    // Create vector
    const vector = new Array(this.vocabulary.size).fill(0);
    
    for (const [word, tf] of termFreq) {
      const vocabIndex = this.vocabulary.get(word);
      if (vocabIndex !== undefined) {
        const df = this.documentFrequency.get(word) || 1;
        const idf = Math.log(this.totalDocuments / df);
        const tfidf = tf * idf;
        vector[vocabIndex] = tfidf;
      }
    }

    return vector;
  }

  /**
   * Find similar content based on semantic similarity
   */
  async findSimilarContent(query: string, options: SearchOptions = {}): Promise<SimilarityResult[]> {
    if (!this.isInitialized) {
      console.warn('⚠️ Vector service not initialized, initializing now...');
      await this.initialize();
    }

    const {
      maxResults = 5,
      maxTokens = 2000,
      minSimilarity = 0.1,
      documentTypes = [],
      allowedDocumentIds = []
    } = options;

    console.log(`🔍 Vector search query: "${query.substring(0, 50)}..." (maxTokens: ${maxTokens})`);

    // Convert query to vector
    const queryVector = this.createTFIDFVector(query);

    // Calculate similarities
    const similarities: SimilarityResult[] = [];
    
    for (const chunk of this.documentChunks) {
      // Filter by allowed document IDs if specified
      if (allowedDocumentIds.length > 0 && !allowedDocumentIds.includes(chunk.documentId)) {
        continue;
      }
      
      // Filter by document type if specified
      if (documentTypes.length > 0 && !documentTypes.includes(chunk.documentType)) {
        continue;
      }

      if (!chunk.vector) continue;

      const similarity = cosineSimilarity(queryVector, chunk.vector);
      
      if (similarity >= minSimilarity) {
        similarities.push({
          chunkId: chunk.chunkId,
          content: chunk.content,
          similarity,
          documentTitle: chunk.documentTitle,
          documentType: chunk.documentType,
          tokenCount: chunk.tokenCount || Math.ceil(chunk.content.length / 4)
        });
      }
    }

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Apply token budgeting
    const results: SimilarityResult[] = [];
    let totalTokens = 0;
    let resultCount = 0;

    for (const result of similarities) {
      if (resultCount >= maxResults) break;
      if (totalTokens + result.tokenCount <= maxTokens) {
        results.push(result);
        totalTokens += result.tokenCount;
        resultCount++;
      }
    }

    console.log(`✅ Vector search returned ${results.length} results (${totalTokens} tokens, max similarity: ${results[0]?.similarity.toFixed(3) || 'N/A'})`);

    return results;
  }

  /**
   * Generate training context string for AI prompts with strict token budgeting
   */
  async generateTrainingContext(query: string, options: SearchOptions = {}): Promise<string> {
    const results = await this.findSimilarContent(query, options);
    
    if (results.length === 0) {
      console.log('⚠️ No similar content found for query');
      return 'No relevant training content found.';
    }

    const context = results
      .map(result => `# ${result.documentTitle}\n${result.content}`)
      .join('\n\n---\n\n');

    const contextTokens = Math.ceil(context.length / 4);
    console.log(`📄 Generated training context: ${context.length} chars (${contextTokens} tokens)`);

    return context;
  }

  /**
   * Get service statistics
   */
  getStats(): any {
    return {
      initialized: this.isInitialized,
      documentCount: this.documentChunks.length,
      vocabularySize: this.vocabulary.size,
      memoryUsage: {
        documentsEstimate: `${Math.round(this.documentChunks.length * 1000 / 1024)}KB`,
        vocabularyEstimate: `${Math.round(this.vocabulary.size * 8 / 1024)}KB`,
        totalEstimate: `${Math.round((this.documentChunks.length * 1000 + this.vocabulary.size * 8) / 1024)}KB`
      }
    };
  }

  /**
   * Refresh vectors (useful when training documents are updated)
   */
  async refresh(): Promise<void> {
    console.log('🔄 Refreshing vector service...');
    this.isInitialized = false;
    this.documentChunks = [];
    this.vocabulary.clear();
    this.documentFrequency.clear();
    await this.initialize();
  }
}

// Export singleton instance
export const javascriptVectorService = new JavaScriptVectorService();
export default javascriptVectorService;