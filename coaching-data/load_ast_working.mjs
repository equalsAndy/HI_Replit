#!/usr/bin/env node
/**
 * AST Knowledge Loader - PostgreSQL with Semantic Search
 * =====================================================
 * 
 * Load AST content into PostgreSQL with full-text search capabilities
 * This bypasses ChromaDB issues and gives immediate working results
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
            .slice(0, 10); // Process first 10 for faster loading
            
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

    async checkDatabaseSchema() {
        console.log('🔍 Checking database schema...');
        
        // Check if coach_knowledge_base table exists and get its structure
        const tableExists = await client`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'coach_knowledge_base'
            )
        `;
        
        if (tableExists[0].exists) {
            const columns = await client`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'coach_knowledge_base' 
                ORDER BY ordinal_position
            `;
            console.log('✅ coach_knowledge_base table exists with columns:');
            columns.forEach(col => console.log(`   • ${col.column_name} (${col.data_type})`));
            return columns.map(c => c.column_name);
        } else {
            console.log('❌ coach_knowledge_base table does not exist');
            return null;
        }
    }

    async createKnowledgeTable() {
        console.log('🛠️ Creating coach_knowledge_base table...');
        
        await client`
            CREATE TABLE IF NOT EXISTS coach_knowledge_base (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                source TEXT NOT NULL,
                source_file TEXT,
                content_type TEXT,
                metadata JSONB DEFAULT '{}',
                search_vector tsvector,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;
        
        // Create full-text search index
        await client`
            CREATE INDEX IF NOT EXISTS coach_knowledge_search_idx 
            ON coach_knowledge_base USING GIN(search_vector)
        `;
        
        // Create trigger to auto-update search vector
        await client`
            CREATE OR REPLACE FUNCTION update_search_vector() 
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.search_vector := to_tsvector('english', 
                    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '')
                );
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        `;
        
        await client`
            DROP TRIGGER IF EXISTS update_coach_knowledge_search_vector ON coach_knowledge_base
        `;
        
        await client`
            CREATE TRIGGER update_coach_knowledge_search_vector
            BEFORE INSERT OR UPDATE ON coach_knowledge_base
            FOR EACH ROW EXECUTE FUNCTION update_search_vector()
        `;
        
        console.log('✅ coach_knowledge_base table created with full-text search');
    }

    async storeInDatabase(chunks) {
        console.log('🗂️ Storing content in PostgreSQL database...');
        
        try {
            // Check if table exists, create if not
            const existingColumns = await this.checkDatabaseSchema();
            if (!existingColumns) {
                await this.createKnowledgeTable();
            }
            
            // Clear existing content
            console.log('🧹 Clearing existing AST knowledge...');
            await client`DELETE FROM coach_knowledge_base WHERE source IN ('AST_Compendium', 'team_profiles')`;
            
            // Insert new content
            console.log('📝 Inserting new content...');
            for (const chunk of chunks) {
                await client`
                    INSERT INTO coach_knowledge_base (
                        title, content, source, source_file, content_type, metadata
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
                        })}::jsonb
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

    async testSemanticSearch() {
        console.log('🔍 Testing full-text search...');
        
        const testQueries = [
            'strengths framework',
            'team collaboration',
            'flow state',
            'imagination strength',
            'planning thinking'
        ];
        
        for (const query of testQueries) {
            try {
                const results = await client`
                    SELECT 
                        title, 
                        content_type, 
                        ts_rank(search_vector, plainto_tsquery('english', ${query})) as rank,
                        LEFT(content, 150) as preview
                    FROM coach_knowledge_base 
                    WHERE search_vector @@ plainto_tsquery('english', ${query})
                    ORDER BY rank DESC
                    LIMIT 3
                `;
                
                console.log(`   🔍 "${query}": ${results.length} matches`);
                results.forEach((result, i) => {
                    console.log(`      ${i+1}. ${result.title} (${result.content_type}) - Score: ${result.rank.toFixed(3)}`);
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
            path.join(__dirname, 'knowledge_loading_report.json'),
            JSON.stringify(report, null, 2)
        );
    }

    async processAll() {
        console.log('🚀 Starting AST Knowledge Loading (PostgreSQL + Search)...');
        console.log('=======================================================');
        
        try {
            // Test database connection
            console.log('🔌 Testing database connection...');
            const testResult = await client`SELECT NOW() as connected_at`;
            console.log(`✅ Database connected at: ${testResult[0].connected_at}`);
            
            // Process documents
            const astChunks = await this.processASTCompendium();
            const teamChunks = await this.processTeamProfiles();
            
            const allChunks = [...astChunks, ...teamChunks];
            
            if (allChunks.length === 0) {
                console.log('❌ No content processed');
                return;
            }
            
            // Store in database with search capabilities
            await this.storeInDatabase(allChunks);
            
            // Test full-text search
            await this.testSemanticSearch();
            
            // Generate report
            await this.generateReport(astChunks, teamChunks);
            
            console.log('');
            console.log('🎉 AST Knowledge Loading Complete!');
            console.log('==================================');
            console.log('✅ AST methodology loaded with full-text search');
            console.log('✅ Team profiles processed and searchable');
            console.log('✅ PostgreSQL-based semantic search ready');
            console.log('✅ Your AI chatbot now has access to AST knowledge!');
            
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
