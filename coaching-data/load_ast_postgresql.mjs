#!/usr/bin/env node
/**
 * AST Knowledge Loader for PostgreSQL
 * ===================================
 * 
 * Load AST content directly into our coaching database
 * Bypasses ChromaDB issues and uses our existing PostgreSQL setup
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

class ASTPostgreSQLLoader {
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
            .slice(0, 5); // Limit to first 5 for testing
            
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
                source: source,
                source_file: filename || source,
                content_type: this.classifyContentType(title, sectionContent),
                key_concepts: this.extractKeyConcepts(sectionContent),
                word_count: sectionContent.split(' ').length,
                section_number: index
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
        console.log('🗂️ Storing content in PostgreSQL database...');
        
        try {
            // Clear existing coach knowledge base content
            console.log('🧹 Clearing existing knowledge base...');
            await client`DELETE FROM coach_knowledge_base WHERE source_type IN ('AST_Compendium', 'team_profiles')`;
            
            // Insert new content
            console.log('📝 Inserting new content...');
            for (const chunk of chunks) {
                await client`
                    INSERT INTO coach_knowledge_base (
                        title, content, source_type, source_file, content_type,
                        metadata, created_at, updated_at
                    ) VALUES (
                        ${chunk.title},
                        ${chunk.content},
                        ${chunk.source},
                        ${chunk.source_file},
                        ${chunk.content_type},
                        ${JSON.stringify({
                            key_concepts: chunk.key_concepts,
                            word_count: chunk.word_count,
                            section_number: chunk.section_number
                        })}::jsonb,
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

    async testDatabaseSearch() {
        console.log('🔍 Testing database search...');
        
        const testQueries = [
            'strengths framework',
            'team collaboration',
            'flow state'
        ];
        
        for (const query of testQueries) {
            try {
                const results = await client`
                    SELECT title, content_type, LEFT(content, 100) as preview
                    FROM coach_knowledge_base 
                    WHERE content ILIKE ${'%' + query + '%'}
                    OR title ILIKE ${'%' + query + '%'}
                    LIMIT 3
                `;
                
                console.log(`   🔍 "${query}": ${results.length} matches`);
                results.forEach(result => {
                    console.log(`      • ${result.title} (${result.content_type})`);
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
            ast_content_types: {},
            team_sources: {},
            total_word_count: 0
        };
        
        // Analyze content
        [...astChunks, ...teamChunks].forEach(chunk => {
            const contentType = chunk.content_type;
            report.ast_content_types[contentType] = (report.ast_content_types[contentType] || 0) + 1;
            report.total_word_count += chunk.word_count;
        });
        
        console.log('📊 Final Report:');
        console.log(`   • Total chunks processed: ${report.summary.total_chunks}`);
        console.log(`   • Database records created: ${report.summary.database_records}`);
        console.log(`   • AST methodology: ${report.summary.ast_methodology_chunks}`);
        console.log(`   • Team profiles: ${report.summary.team_profile_chunks}`);
        console.log(`   • Total words: ${report.total_word_count.toLocaleString()}`);
        
        // Save report
        fs.writeFileSync(
            path.join(__dirname, 'postgresql_loading_report.json'),
            JSON.stringify(report, null, 2)
        );
    }

    async processAll() {
        console.log('🚀 Starting AST Knowledge Loading (PostgreSQL)...');
        console.log('===============================================');
        
        try {
            // Test database connection
            console.log('🔌 Testing database connection...');
            const testResult = await client`SELECT COUNT(*) as count FROM coach_knowledge_base`;
            console.log(`✅ Database connected. Current records: ${testResult[0].count}`);
            
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
            await this.testDatabaseSearch();
            
            // Generate report
            await this.generateReport(astChunks, teamChunks);
            
            console.log('');
            console.log('🎉 AST Knowledge Loading Complete!');
            console.log('==================================');
            console.log('✅ AST methodology loaded into coaching database');
            console.log('✅ Team profiles processed and stored');
            console.log('✅ Database search capabilities enabled');
            console.log('✅ Ready for AI coaching with knowledge base!');
            
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
const loader = new ASTPostgreSQLLoader();
loader.processAll().catch(console.error);
