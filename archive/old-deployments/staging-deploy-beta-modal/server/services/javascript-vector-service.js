import { Pool } from 'pg';
function cosineSimilarity(vecA, vecB) {
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
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
class JavaScriptVectorService {
    documentChunks = [];
    vocabulary = new Map();
    documentFrequency = new Map();
    isInitialized = false;
    totalDocuments = 0;
    async initialize() {
        if (this.isInitialized) {
            console.log('📊 Vector service already initialized');
            return;
        }
        console.log('🔄 Initializing JavaScript Vector Service...');
        const startTime = Date.now();
        try {
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
            this.documentChunks = result.rows.map(row => ({
                chunkId: row.chunk_id,
                documentId: row.document_id,
                content: row.content,
                documentTitle: row.document_title,
                documentType: row.document_type,
                tokenCount: Math.ceil(row.content.length / 4)
            }));
            this.totalDocuments = this.documentChunks.length;
            this.buildVocabulary();
            this.vectorizeDocuments();
            const initTime = Date.now() - startTime;
            console.log(`✅ Vector service initialized in ${initTime}ms`);
            console.log(`📊 Stats: ${this.documentChunks.length} chunks, ${this.vocabulary.size} vocabulary terms`);
            this.isInitialized = true;
        }
        catch (error) {
            console.error('❌ Failed to initialize vector service:', error);
            throw error;
        }
    }
    buildVocabulary() {
        console.log('🔤 Building vocabulary and document frequency...');
        const wordCounts = new Map();
        for (const chunk of this.documentChunks) {
            const words = this.tokenize(chunk.content);
            const uniqueWords = new Set(words);
            for (const word of uniqueWords) {
                if (!wordCounts.has(word)) {
                    wordCounts.set(word, new Set());
                }
                wordCounts.get(word).add(chunk.chunkId);
            }
        }
        let vocabIndex = 0;
        for (const [word, documentSet] of wordCounts) {
            this.vocabulary.set(word, vocabIndex++);
            this.documentFrequency.set(word, documentSet.size);
        }
        console.log(`✅ Built vocabulary: ${this.vocabulary.size} unique terms`);
    }
    vectorizeDocuments() {
        console.log('🔢 Creating TF-IDF vectors for all documents...');
        for (const chunk of this.documentChunks) {
            chunk.vector = this.createTFIDFVector(chunk.content);
        }
        console.log(`✅ Created ${this.documentChunks.length} document vectors`);
    }
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !this.isStopWord(word));
    }
    isStopWord(word) {
        const stopWords = new Set([
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
            'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
            'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
            'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
        ]);
        return stopWords.has(word);
    }
    createTFIDFVector(text) {
        const words = this.tokenize(text);
        const termFreq = new Map();
        for (const word of words) {
            termFreq.set(word, (termFreq.get(word) || 0) + 1);
        }
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
    async findSimilarContent(query, options = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ Vector service not initialized, initializing now...');
            await this.initialize();
        }
        const { maxResults = 5, maxTokens = 2000, minSimilarity = 0.1, documentTypes = [], allowedDocumentIds = [] } = options;
        console.log(`🔍 Vector search query: "${query.substring(0, 50)}..." (maxTokens: ${maxTokens})`);
        const queryVector = this.createTFIDFVector(query);
        const similarities = [];
        for (const chunk of this.documentChunks) {
            if (allowedDocumentIds.length > 0 && !allowedDocumentIds.includes(chunk.documentId)) {
                continue;
            }
            if (documentTypes.length > 0 && !documentTypes.includes(chunk.documentType)) {
                continue;
            }
            if (!chunk.vector)
                continue;
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
        similarities.sort((a, b) => b.similarity - a.similarity);
        const results = [];
        let totalTokens = 0;
        let resultCount = 0;
        for (const result of similarities) {
            if (resultCount >= maxResults)
                break;
            if (totalTokens + result.tokenCount <= maxTokens) {
                results.push(result);
                totalTokens += result.tokenCount;
                resultCount++;
            }
        }
        console.log(`✅ Vector search returned ${results.length} results (${totalTokens} tokens, max similarity: ${results[0]?.similarity.toFixed(3) || 'N/A'})`);
        return results;
    }
    async generateTrainingContext(query, options = {}) {
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
    getStats() {
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
    async refresh() {
        console.log('🔄 Refreshing vector service...');
        this.isInitialized = false;
        this.documentChunks = [];
        this.vocabulary.clear();
        this.documentFrequency.clear();
        await this.initialize();
    }
}
export const javascriptVectorService = new JavaScriptVectorService();
export default javascriptVectorService;
