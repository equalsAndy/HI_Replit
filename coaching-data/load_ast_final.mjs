#!/usr/bin/env node
/**
 * AST Knowledge Loader - Adapted for Existing Schema
 * ==================================================
 * 
 * Load AST content into existing coach_knowledge_base table structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = postgres(process.env.DATABASE_URL);

class ASTKnowledgeLoader {
    constructor() {
        this.processedCount = 0;
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
            .filter(file => file.includes('team') && file.endsWith('.md'))
            .slice(0, 5); // Process first 5 for faster loading
            
        console.log(`📁 Processing ${teamFiles.length} team profile files`);
        
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
                title: title,
                content: sectionContent,
                category: source === 'AST_Compendium' ? 'ast_methodology' : 'team_profiles',
                content_type: this.classifyContentType(title, sectionContent),
                tags: this.extractKeyConcepts(sectionContent),
                metadata: {
                    source: source,
                    source_file: filename || source,
                    word_count: sectionContent.split(' ').length,
                    section_number: index,
                    key_concepts: this.extractKeyConcepts(sectionContent)
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

    async storeInDatabase(chunks) {
        console.log('🗂️ Storing content in existing coach_knowledge_base table...');
        
        try {
            // Clear existing AST content based on category
            console.log('🧹 Clearing existing AST knowledge...');
            await client`DELETE FROM coach_knowledge_base WHERE category IN ('ast_methodology', 'team_profiles')`;
            
            // Insert new content using existing schema
            console.log('📝 Inserting new content...');
            for (const chunk of chunks) {
                await client`
                    INSERT INTO coach_knowledge_base (
                        id, category, content_type, title, content, tags, metadata, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(),
                        ${chunk.category},
                        ${chunk.content_type},
                        ${chunk.title},
                        ${chunk.content},
                        ${JSON.stringify(chunk.tags)}::jsonb,
                        ${JSON.stringify(chunk.metadata)}::jsonb,
                        NOW(),
                        NOW()
                    )
                `;
                this.processedCount++;
                
                if (this.processedCount % 10 === 0) {
                    console.log(`   📚 Processed ${this.processedCount} chunks...`);
                }
            }
            
            console.log('✅ Database storage complete');
            
        } catch (error) {
            console.log('❌ Database storage failed:', error.message);
            throw error;
        }
    }

    async testSearch() {
        console.log('🔍 Testing knowledge base search...');
        
        const testQueries = [
            'strengths framework',
            'team collaboration', 
            'flow state',
            'imagination',
            'planning'
        ];
        
        for (const query of testQueries) {
            try {
                // Simple text search using ILIKE
                const results = await client`
                    SELECT 
                        title, 
                        content_type,
                        category,
                        LEFT(content, 120) as preview
                    FROM coach_knowledge_base 
                    WHERE 
                        content ILIKE ${'%' + query + '%'} 
                        OR title ILIKE ${'%' + query + '%'}
                        OR tags::text ILIKE ${'%' + query + '%'}
                    ORDER BY 
                        CASE WHEN title ILIKE ${'%' + query + '%'} THEN 1 ELSE 2 END,
                        LENGTH(content) DESC
                    LIMIT 3
                `;
                
                console.log(`   🔍 "${query}": ${results.length} matches`);
                results.forEach((result, i) => {
                    console.log(`      ${i+1}. ${result.title} (${result.content_type})`);
                });
            } catch (error) {
                console.log(`   ❌ Search error for "${query}": ${error.message}`);
            }
        }
    }

    async generateReport(astChunks, teamChunks) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total_chunks: astChunks.length + teamChunks.length,
                ast_methodology_chunks: astChunks.length,
                team_profile_chunks: teamChunks.length,
                database_records: this.processedCount
            },
            content_types: {},
            total_word_count: 0
        };
        
        // Analyze content
        [...astChunks, ...teamChunks].forEach(chunk => {
            const contentType = chunk.content_type;
            report.content_types[contentType] = (report.content_types[contentType] || 0) + 1;
            report.total_word_count += chunk.metadata.word_count;
        });
        
        console.log('📊 Final Report:');
        console.log(`   • Total chunks processed: ${report.summary.total_chunks}`);
        console.log(`   • Database records created: ${report.summary.database_records}`);
        console.log(`   • AST methodology: ${report.summary.ast_methodology_chunks}`);
        console.log(`   • Team profiles: ${report.summary.team_profile_chunks}`);
        console.log(`   • Total words: ${report.total_word_count.toLocaleString()}`);
        
        // Content breakdown
        console.log(`   • Content types:`);
        Object.entries(report.content_types).forEach(([type, count]) => {
            console.log(`     - ${type}: ${count} chunks`);
        });
        
        // Save report
        fs.writeFileSync(
            path.join(__dirname, 'ast_loading_success.json'),
            JSON.stringify(report, null, 2)
        );
    }

    async processAll() {
        console.log('🚀 Starting AST Knowledge Loading (Existing Schema)...');
        console.log('====================================================');
        
        try {
            // Test database connection
            console.log('🔌 Testing database connection...');
            const testResult = await client`SELECT COUNT(*) as existing_records FROM coach_knowledge_base`;
            console.log(`✅ Database connected. Existing records: ${testResult[0].existing_records}`);
            
            // Process documents
            const astChunks = await this.processASTCompendium();
            const teamChunks = await this.processTeamProfiles();
            
            const allChunks = [...astChunks, ...teamChunks];
            
            if (allChunks.length === 0) {
                console.log('❌ No content processed');
                return;
            }
            
            // Store in database
            await this.storeInDatabase(allChunks);
            
            // Test search
            await this.testSearch();
            
            // Generate report
            await this.generateReport(astChunks, teamChunks);
            
            console.log('');
            console.log('🎉 AST Knowledge Loading Complete!');
            console.log('==================================');
            console.log('✅ AST methodology loaded into coaching database');
            console.log('✅ Team profiles processed and stored');
            console.log('✅ Knowledge base search capabilities enabled');
            console.log('✅ Your AI chatbot now has AST knowledge access!');
            console.log('');
            console.log('🔗 Test your chatbot with AST-powered responses:');
            console.log('   curl http://localhost:8080/api/coaching/chat/test');
            
        } catch (error) {
            console.log('❌ Loading failed:', error.message);
            console.error('Full error:', error);
            throw error;
        } finally {
            await client.end();
        }
    }
}

// Run the loader
const loader = new ASTKnowledgeLoader();
loader.processAll().catch(console.error);
