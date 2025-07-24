#!/usr/bin/env python3
"""
Enhanced AST Knowledge Processor with AWS Bedrock Integration
===========================================================

Advanced processing pipeline with AWS Bedrock Titan embeddings for superior semantic search.
Includes batch processing, error recovery, and production-ready features.
"""

import os
import json
import boto3
import asyncio
import aiohttp
from typing import List, Dict, Any
import logging
from datetime import datetime
import numpy as np

from process_ast_knowledge import ASTKnowledgeProcessor

logger = logging.getLogger(__name__)

class EnhancedASTProcessor(ASTKnowledgeProcessor):
    """Enhanced processor with AWS Bedrock integration and advanced features."""
    
    def __init__(self):
        super().__init__()
// //         self.bedrock_client = None
        self.embedding_model = "amazon.titan-embed-text-v2:0"
        self.batch_size = 25
        self.max_retries = 3
        
    async def initialize(self):
        """Initialize with AWS Bedrock client."""
        await super().initialize()
        
        try:
            # Initialize AWS Bedrock client
// //             self.bedrock_client = boto3.client(
// //                 service_name='bedrock-runtime',
                region_name=os.getenv('AWS_BEDROCK_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
            )
            
            logger.info("✅ AWS Bedrock client initialized")
            
        except Exception as e:
            logger.warning(f"⚠️ AWS Bedrock initialization failed: {e}")
            logger.info("📝 Falling back to default embeddings")
            
    async def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings using AWS Bedrock Titan or fallback."""
// //         if self.bedrock_client:
// //             return await self._create_bedrock_embeddings(texts)
        else:
            return await self._create_default_embeddings(texts)
            
// //     async def _create_bedrock_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings using AWS Bedrock Titan."""
        embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
// //             batch_embeddings = await self._process_bedrock_batch(batch)
            embeddings.extend(batch_embeddings)
            
            # Rate limiting
            await asyncio.sleep(0.1)
            
        return embeddings
        
// //     async def _process_bedrock_batch(self, texts: List[str]) -> List[List[float]]:
        """Process a batch of texts with Bedrock."""
        embeddings = []
        
        for text in texts:
            for attempt in range(self.max_retries):
                try:
                    # Prepare request for Titan
                    body = json.dumps({
                        "inputText": text[:8000],  # Titan limit
                        "dimensions": 1024,
                        "normalize": True
                    })
                    
                    # Call Bedrock
// //                     response = self.bedrock_client.invoke_model(
                        body=body,
                        modelId=self.embedding_model,
                        accept='application/json',
                        contentType='application/json'
                    )
                    
                    # Parse response
                    response_body = json.loads(response.get('body').read())
                    embedding = response_body.get('embedding')
                    
                    if embedding:
                        embeddings.append(embedding)
                        break
                        
                except Exception as e:
                    if attempt == self.max_retries - 1:
                        logger.error(f"❌ Bedrock embedding failed after {self.max_retries} attempts: {e}")
                        # Create a zero vector as fallback
                        embeddings.append([0.0] * 1024)
                    else:
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                        
        return embeddings
        
    async def _create_default_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings using default ChromaDB embeddings."""
        # ChromaDB will handle embeddings automatically
        # Return None to indicate ChromaDB should handle it
        return None
        
    async def store_in_chromadb_with_embeddings(self, chunks: List[Dict[str, Any]]):
        """Store chunks in ChromaDB with custom embeddings."""
        logger.info("🧠 Creating embeddings and storing in ChromaDB...")
        
        # Separate chunks by type
        ast_chunks = [c for c in chunks if c['source'] == 'AST_Compendium']
        team_chunks = [c for c in chunks if c['source'] == 'team_profiles']
        
        # Process AST methodology chunks
        if ast_chunks:
            await self._store_with_embeddings(ast_chunks, self.ast_collection, "AST methodology")
            
        # Process team profile chunks
        if team_chunks:
            await self._store_with_embeddings(team_chunks, self.teams_collection, "team profiles")
            
        logger.info("✅ Enhanced ChromaDB storage complete")
        
    async def _store_with_embeddings(self, chunks: List[Dict[str, Any]], collection, collection_name: str):
        """Store chunks with embeddings in ChromaDB collection."""
        try:
            # Prepare texts for embedding
            texts = [chunk['content'] for chunk in chunks]
            
            # Create embeddings
            logger.info(f"🧠 Creating embeddings for {len(texts)} {collection_name} chunks...")
            embeddings = await self.create_embeddings(texts)
            
            # Prepare data for ChromaDB
            ids = [chunk['id'] for chunk in chunks]
            documents = texts
            metadatas = []
            
            for chunk in chunks:
                metadata = {
                    'title': chunk['title'],
                    'source': chunk['source'],
                    'type': chunk['type'],
                    **chunk['metadata']
                }
                
                # Convert complex types to strings
                for key, value in metadata.items():
                    if isinstance(value, (list, dict)):
                        metadata[key] = json.dumps(value)
                        
                metadatas.append(metadata)
                
            # Add to collection
            if embeddings:
                # Use custom embeddings
                collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings
                )
            else:
                # Let ChromaDB handle embeddings
                collection.add(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas
                )
                
            logger.info(f"📚 Stored {len(chunks)} enhanced chunks in {collection_name}")
            
        except Exception as e:
            logger.error(f"❌ Enhanced storage failed for {collection_name}: {e}")
            raise
            
    async def test_semantic_search(self):
        """Test semantic search capabilities."""
        logger.info("🔍 Testing semantic search capabilities...")
        
        test_queries = [
            "How do I identify my core strengths?",
            "What creates flow state in teams?",
            "How can teams work better together?",
            "What are the five strengths in AST?",
            "How do you build trust in remote teams?",
            "What makes a high-performing engineering team?",
            "How do you coach someone with thinking strengths?",
            "What are best practices for hybrid team collaboration?"
        ]
        
        results = {}
        
        for query in test_queries:
            try:
                # Search AST methodology
                ast_results = self.ast_collection.query(
                    query_texts=[query],
                    n_results=3
                )
                
                # Search team profiles
                team_results = self.teams_collection.query(
                    query_texts=[query],
                    n_results=3
                )
                
                results[query] = {
                    'ast_results': len(ast_results['documents'][0]),
                    'team_results': len(team_results['documents'][0]),
                    'top_ast_match': ast_results['documents'][0][0][:100] + "..." if ast_results['documents'][0] else None,
                    'top_team_match': team_results['documents'][0][0][:100] + "..." if team_results['documents'][0] else None
                }
                
            except Exception as e:
                logger.warning(f"⚠️ Search failed for '{query}': {e}")
                results[query] = {'error': str(e)}
                
        # Save test results
        with open('coaching-data/semantic_search_test.json', 'w') as f:
            json.dump(results, f, indent=2)
            
        logger.info("🔍 Semantic search testing complete - results saved")
        
    async def validate_data_quality(self, chunks: List[Dict[str, Any]]):
        """Validate the quality of processed data."""
        logger.info("🔍 Validating data quality...")
        
        quality_report = {
            'total_chunks': len(chunks),
            'validation_results': {},
            'issues_found': [],
            'recommendations': []
        }
        
        # Check content length distribution
        content_lengths = [len(chunk['content']) for chunk in chunks]
        avg_length = np.mean(content_lengths)
        min_length = min(content_lengths)
        max_length = max(content_lengths)
        
        quality_report['validation_results']['content_length'] = {
            'average': avg_length,
            'minimum': min_length,
            'maximum': max_length,
            'very_short_chunks': len([l for l in content_lengths if l < 100])
        }
        
        # Check metadata completeness
        metadata_completeness = {}
        for chunk in chunks:
            for key in chunk['metadata']:
                if key not in metadata_completeness:
                    metadata_completeness[key] = 0
                if chunk['metadata'][key]:
                    metadata_completeness[key] += 1
                    
        quality_report['validation_results']['metadata_completeness'] = {
            key: (count / len(chunks)) * 100 
            for key, count in metadata_completeness.items()
        }
        
        # Check for duplicates
        content_hashes = set()
        duplicates = 0
        for chunk in chunks:
            content_hash = hash(chunk['content'])
            if content_hash in content_hashes:
                duplicates += 1
            content_hashes.add(content_hash)
            
        quality_report['validation_results']['duplicates'] = duplicates
        
        # Generate recommendations
        if quality_report['validation_results']['content_length']['very_short_chunks'] > len(chunks) * 0.1:
            quality_report['issues_found'].append("High number of very short content chunks")
            quality_report['recommendations'].append("Consider combining short chunks or filtering them out")
            
        if duplicates > 0:
            quality_report['issues_found'].append(f"Found {duplicates} duplicate content chunks")
            quality_report['recommendations'].append("Implement deduplication logic")
            
        # Save quality report
        with open('coaching-data/data_quality_report.json', 'w') as f:
            json.dump(quality_report, f, indent=2)
            
        logger.info(f"📊 Data quality validation complete:")
        logger.info(f"   • Total chunks: {quality_report['total_chunks']}")
        logger.info(f"   • Average content length: {avg_length:.0f} characters")
        logger.info(f"   • Issues found: {len(quality_report['issues_found'])}")
        
    async def process_with_enhancements(self):
        """Enhanced processing pipeline with all features."""
        logger.info("🚀 Starting Enhanced AST Knowledge Processing...")
        
        try:
            # Initialize with Bedrock
            await self.initialize()
            
            # Process data (same as base class)
            compendium_path = "coaching-data/source-files/AST_Compendium.md"
            if os.path.exists(compendium_path):
                ast_chunks = self.parse_ast_compendium(compendium_path)
            else:
                logger.warning(f"⚠️ AST Compendium not found at {compendium_path}")
                ast_chunks = []
                
            team_pattern = "coaching-data/source-files/*team*.md"
            team_chunks = self.parse_team_profiles(team_pattern)
            all_chunks = ast_chunks + team_chunks
            
            if not all_chunks:
                logger.error("❌ No content processed")
                return
                
            # Validate data quality
            await self.validate_data_quality(all_chunks)
            
            # Enhanced storage with embeddings
            await self.store_in_chromadb_with_embeddings(all_chunks)
            
            # Store in PostgreSQL
            await self.store_in_postgresql(all_chunks)
            
            # Test semantic search
            await self.test_semantic_search()
            
            # Generate enhanced report
            self._generate_enhanced_report(ast_chunks, team_chunks)
            
            logger.info("🎉 Enhanced AST knowledge processing completed!")
            
        except Exception as e:
            logger.error(f"❌ Enhanced processing failed: {e}")
            raise
        finally:
            if self.pg_connection:
                self.pg_connection.close()
                
    def _generate_enhanced_report(self, ast_chunks: List[Dict], team_chunks: List[Dict]):
        """Generate enhanced processing report."""
        # Call parent method
        self._generate_processing_report(ast_chunks, team_chunks)
        
        # Add enhancement details
        enhancement_report = {
            "timestamp": datetime.now().isoformat(),
            "enhancements": {
// //                 "bedrock_integration": self.bedrock_client is not None,
                "embedding_model": self.embedding_model,
                "batch_size": self.batch_size,
                "semantic_search_tested": True,
                "data_quality_validated": True
            },
            "files_generated": [
                "coaching-data/processing_report.json",
                "coaching-data/data_quality_report.json", 
                "coaching-data/semantic_search_test.json"
            ]
        }
        
        with open('coaching-data/enhancement_report.json', 'w') as f:
            json.dump(enhancement_report, f, indent=2)
            
        logger.info("📊 Enhanced processing report generated")

async def main():
    """Run enhanced processing."""
    processor = EnhancedASTProcessor()
    await processor.process_with_enhancements()

if __name__ == "__main__":
    asyncio.run(main())
