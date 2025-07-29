#!/usr/bin/env npx tsx
import "dotenv/config";
import { textSearchService } from './server/services/text-search-service.ts';

async function processASTDocuments() {
  console.log('🔄 Processing AST Training Documents for Search');
  console.log('==============================================\n');

  try {
    // Process all pending documents
    await textSearchService.processPendingDocuments();
    
    // Get updated stats
    const stats = await textSearchService.getSearchStats();
    console.log('\n📊 Final Statistics:');
    console.log(`  - Total Chunks: ${stats.totalChunks}`);
    console.log(`  - Processed Documents: ${stats.processedDocuments}`);
    console.log(`  - Average Chunks per Document: ${stats.averageChunksPerDocument.toFixed(1)}`);
    
    // Test search with AST-specific terms
    console.log('\n🔍 Testing AST-Specific Search');
    console.log('===============================');
    
    const astSearches = [
      'strengths constellation analysis',
      'flow state optimization',
      'future self continuity',
      'talia coaching approach',
      'professional profile report'
    ];
    
    for (const query of astSearches) {
      const results = await textSearchService.searchSimilarContent(query, {
        maxResults: 3,
        minRelevanceScore: 0.1
      });
      
      console.log(`\n📝 "${query}": ${results.length} results`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.documentTitle} (${result.relevanceScore.toFixed(3)})`);
      });
    }
    
    console.log('\n✅ AST Document Processing Complete!');
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
  }
}

processASTDocuments();