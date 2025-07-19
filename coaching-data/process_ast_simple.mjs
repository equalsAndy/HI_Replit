#!/usr/bin/env node
/**
 * AST Knowledge Processor - Node.js Version
 * ========================================
 * 
 * Process AST documents using the existing Node.js infrastructure.
 * This integrates with our current TypeScript/Express setup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ASTKnowledgeProcessor {
    constructor() {
        this.apiBase = 'http://localhost:8080/api/coaching';
        this.chromaBase = 'http://localhost:8000';
    }

    async processASTCompendium() {
        console.log('📚 Processing AST Compendium...');
        
        const compendiumPath = path.join(__dirname, 'source-files', 'AST_Compendium.md');
        
        if (!fs.existsSync(compendiumPath)) {
            console.log('❌ AST Compendium not found');
            return [];
        }

        const content = fs.readFileSync(compendiumPath, 'utf8');
        const chunks = this.parseIntoChunks(content, 'AST_Compendium');
        
        console.log(`📊 Extracted ${chunks.length} chunks from AST Compendium`);
        return chunks;
    }

    async processTeamProfiles() {
        console.log('👥 Processing team profiles...');
        
        const sourceDir = path.join(__dirname, 'source-files');
        const teamFiles = fs.readdirSync(sourceDir)
            .filter(file => file.includes('team') && file.endsWith('.md'));
            
        console.log(`📁 Found ${teamFiles.length} team profile files`);
        
        let allChunks = [];
        
        for (const file of teamFiles) {
            try {
                const filePath = path.join(sourceDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const chunks = this.parseIntoChunks(content, 'team_profiles', file);
                allChunks.push(...chunks);
            } catch (error) {
                console.log(`⚠️ Failed to process ${file}: ${error.message}`);
            }
        }
        
        console.log(`👥 Processed ${allChunks.length} team profile chunks`);
        return allChunks;
    }

    parseIntoChunks(content, source, filename = '') {
        const chunks = [];
        
        // Split by main sections (## headers)
        const sections = content.split(/\n## /);
        
        sections.forEach((section, index) => {
            if (!section.trim() || section.length < 100) return;
            
            const lines = section.split('\n');
            const title = lines[0].replace(/^#+\s*/, '').trim();
            const sectionContent = lines.slice(1).join('\n').trim();
            
            if (sectionContent.length < 50) return;
            
            const chunk = {
                id: this.generateId(),
                title: title,
                content: sectionContent,
                source: source,
                type: this.classifyContentType(title, sectionContent),
                metadata: {
                    source_file: filename || source,
                    section_title: title,
                    content_type: this.classifyContentType(title, sectionContent),
                    key_concepts: this.extractKeyConcepts(sectionContent),
                    word_count: sectionContent.split(' ').length,
                    section_number: index
                }
            };
            
            chunks.push(chunk);
        });
        
        return chunks;
    }

    classifyContentType(title, content) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('strength') || titleLower.includes('five strengths')) {
            return 'strengths_framework';
        } else if (titleLower.includes('flow')) {
            return 'flow_theory';
        } else if (titleLower.includes('team') || titleLower.includes('collaboration')) {
            return 'team_dynamics';
        } else if (titleLower.includes('foundation') || titleLower.includes('theory')) {
            return 'theoretical_foundation';
        } else if (titleLower.includes('assessment') || titleLower.includes('taro')) {
            return 'assessment_integration';
        } else {
            return 'methodology';
        }
    }

    extractKeyConcepts(content) {
        const astConcepts = [
            'imagination', 'thinking', 'planning', 'acting', 'feeling',
            'flow state', 'heliotropic effect', 'strengths profusion',
            'future self-continuity', 'self-awareness', 'telos', 'entelechy',
            'star card', 'constellation mapping', 'appreciative inquiry'
        ];
        
        const contentLower = content.toLowerCase();
        return astConcepts.filter(concept => contentLower.includes(concept));
    }

    generateId() {
        return 'ast_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    async storeInChromaDB(chunks) {
        console.log('🗂️ Storing content in ChromaDB...');
        
        try {
            // Ensure collections exist
            await this.ensureCollectionsExist();
            
            // Separate chunks by type
            const astChunks = chunks.filter(c => c.source === 'AST_Compendium');
            const teamChunks = chunks.filter(c => c.source === 'team_profiles');
            
            // Store AST methodology
            if (astChunks.length > 0) {
                await this.addToCollection('ast_methodology', astChunks);
            }
            
            // Store team profiles
            if (teamChunks.length > 0) {
                await this.addToCollection('team_profiles', teamChunks);
            }
            
            console.log('✅ ChromaDB storage complete');
            
        } catch (error) {
            console.log('❌ ChromaDB storage failed:', error.message);
            throw error;
        }
    }

    async ensureCollectionsExist() {
        try {
            // Check if collections exist, create if not
            const collections = ['ast_methodology', 'team_profiles'];
            
            for (const collectionName of collections) {
                try {
                    const response = await fetch(`${this.chromaBase}/api/v1/collections/${collectionName}`);
                    if (response.status === 404) {
                        // Create collection
                        await fetch(`${this.chromaBase}/api/v1/collections`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: collectionName,
                                metadata: { description: `${collectionName} for AST coaching` }
                            })
                        });
                        console.log(`✅ Created collection: ${collectionName}`);
                    }
                } catch (e) {
                    console.log(`⚠️ Collection handling for ${collectionName}: ${e.message}`);
                }
            }
        } catch (error) {
            console.log('⚠️ Collection setup error:', error.message);
        }
    }

    async addToCollection(collectionName, chunks) {
        try {
            // Prepare data for ChromaDB
            const documents = chunks.map(chunk => chunk.content);
            const metadatas = chunks.map(chunk => ({
                title: chunk.title,
                source: chunk.source,
                type: chunk.type,
                content_type: chunk.metadata.content_type,
                key_concepts: JSON.stringify(chunk.metadata.key_concepts),
                word_count: chunk.metadata.word_count.toString()
            }));
            const ids = chunks.map(chunk => chunk.id);
            
            // Add to ChromaDB collection
            const response = await fetch(`${this.chromaBase}/api/v1/collections/${collectionName}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documents: documents,
                    metadatas: metadatas,
                    ids: ids
                })
            });
            
            if (!response.ok) {
                throw new Error(`ChromaDB add failed: ${response.status}`);
            }
            
            console.log(`📚 Added ${chunks.length} chunks to ${collectionName}`);
            
        } catch (error) {
            console.log(`❌ Failed to add to ${collectionName}:`, error.message);
            throw error;
        }
    }

    async testSemanticSearch() {
        console.log('🔍 Testing semantic search...');
        
        const testQueries = [
            'How do I identify team strengths?',
            'What creates flow state?',
            'How to build trust in teams?',
            'Five strengths framework',
            'Team collaboration best practices'
        ];
        
        const results = {};
        
        for (const query of testQueries) {
            try {
                const response = await fetch(`${this.chromaBase}/api/v1/collections/ast_methodology/query`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query_texts: [query],
                        n_results: 3
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    results[query] = {
                        found: data.documents?.[0]?.length || 0,
                        top_match: data.documents?.[0]?.[0]?.substring(0, 100) + '...' || 'No match'
                    };
                } else {
                    results[query] = { error: `Search failed: ${response.status}` };
                }
                
            } catch (error) {
                results[query] = { error: error.message };
            }
        }
        
        // Save test results
        fs.writeFileSync(
            path.join(__dirname, 'semantic_search_test.json'),
            JSON.stringify(results, null, 2)
        );
        
        console.log('🔍 Semantic search testing complete');
    }

    async generateReport(astChunks, teamChunks) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total_chunks: astChunks.length + teamChunks.length,
                ast_methodology_chunks: astChunks.length,
                team_profile_chunks: teamChunks.length
            },
            ast_content_types: {},
            team_sources: {},
            total_word_count: 0
        };
        
        // Analyze AST content
        astChunks.forEach(chunk => {
            const contentType = chunk.metadata.content_type;
            report.ast_content_types[contentType] = (report.ast_content_types[contentType] || 0) + 1;
            report.total_word_count += chunk.metadata.word_count;
        });
        
        // Analyze team sources
        teamChunks.forEach(chunk => {
            const source = chunk.metadata.source_file;
            report.team_sources[source] = (report.team_sources[source] || 0) + 1;
        });
        
        // Save report
        fs.writeFileSync(
            path.join(__dirname, 'processing_report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📊 Processing Report Generated:');
        console.log(`   • Total chunks: ${report.summary.total_chunks}`);
        console.log(`   • AST methodology: ${report.summary.ast_methodology_chunks}`);
        console.log(`   • Team profiles: ${report.summary.team_profile_chunks}`);
        console.log(`   • Total words: ${report.total_word_count.toLocaleString()}`);
    }

    async processAll() {
        console.log('🚀 Starting AST Knowledge Processing...');
        console.log('=====================================');
        
        try {
            // Process documents
            const astChunks = await this.processASTCompendium();
            const teamChunks = await this.processTeamProfiles();
            
            const allChunks = [...astChunks, ...teamChunks];
            
            if (allChunks.length === 0) {
                console.log('❌ No content processed');
                return;
            }
            
            // Store in ChromaDB
            await this.storeInChromaDB(allChunks);
            
            // Test semantic search
            await this.testSemanticSearch();
            
            // Generate report
            await this.generateReport(astChunks, teamChunks);
            
            console.log('');
            console.log('🎉 AST Knowledge Processing Complete!');
            console.log('====================================');
            console.log('✅ Complete AST methodology processed and indexed');
            console.log('✅ Team profiles analyzed and stored');
            console.log('✅ Semantic search capabilities enabled');
            console.log('✅ Ready for AI coaching conversations!');
            
        } catch (error) {
            console.log('❌ Processing failed:', error.message);
            throw error;
        }
    }
}

// Run the processor
const processor = new ASTKnowledgeProcessor();
processor.processAll().catch(console.error);
