import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
class ConversationLearningService {
    async getOrCreateLearningDocument(personaId) {
        try {
            const learningDocTitle = `${personaId.charAt(0).toUpperCase() + personaId.slice(1)} - Conversation Learning Log`;
            const existingDoc = await pool.query('SELECT id FROM training_documents WHERE title = $1 AND document_type = $2', [learningDocTitle, 'conversation_learning']);
            if (existingDoc.rows.length > 0) {
                return existingDoc.rows[0].id;
            }
            const initialContent = this.generateInitialLearningDocument(personaId);
            const newDoc = await pool.query(`
        INSERT INTO training_documents (
          title, original_filename, content, document_type, category, status,
          word_count, content_preview, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `, [
                learningDocTitle,
                `${personaId}_learning_log.md`,
                initialContent,
                'conversation_learning',
                'Learning',
                'active',
                initialContent.split(/\s+/).length,
                'Auto-generated conversation learning document...'
            ]);
            const docId = newDoc.rows[0].id;
            await this.createDocumentChunks(docId, initialContent);
            console.log(`✅ Created learning document for ${personaId}: ${docId}`);
            return docId;
        }
        catch (error) {
            console.error(`❌ Error creating learning document for ${personaId}:`, error);
            throw error;
        }
    }
    generateInitialLearningDocument(personaId) {
        const personaName = personaId.charAt(0).toUpperCase() + personaId.slice(1);
        const currentDate = new Date().toISOString().split('T')[0];
        return `# ${personaName} - Conversation Learning Log
*Auto-generated learning document - Updated: ${currentDate}*

## 🎯 Purpose
This document automatically captures learnings from conversations to help ${personaName} improve over time. All content is editable by administrators.

## 📊 Learning Summary
- **Total Conversations**: 0
- **Last Updated**: ${currentDate}
- **Key Patterns Identified**: None yet
- **Success Rate**: Not yet measured

## 🧠 Key Learnings

### Effective Interaction Patterns
*Will be populated automatically from successful conversations*

### User Preferences Discovered
*Will be updated based on user feedback and interaction analysis*

### Conversation Techniques That Work
*Successful approaches will be documented here*

### Areas for Improvement
*Identified challenges and refinements needed*

## 📝 Recent Conversation Insights
*Most recent learnings appear here*

### [Date] - Conversation Analysis
*Learning insights will be added here automatically*

## 🎯 Persona Development Goals
Based on learnings, focus on:
- *Goals will be identified from conversation patterns*

## 📈 Evolution Tracking
*This section tracks how the persona improves over time*

---
*This document is automatically updated after each conversation and can be edited by administrators to refine the persona's learning.*`;
    }
    async createDocumentChunks(documentId, content) {
        const chunkSize = 1000;
        let chunkIndex = 0;
        let startIndex = 0;
        while (startIndex < content.length) {
            const endIndex = Math.min(startIndex + chunkSize, content.length);
            const chunkContent = content.slice(startIndex, endIndex);
            await pool.query(`
        INSERT INTO document_chunks (
          document_id, chunk_index, content, start_char, end_char,
          token_count, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
                documentId,
                chunkIndex,
                chunkContent,
                startIndex,
                endIndex - 1,
                Math.ceil(chunkContent.length / 4)
            ]);
            chunkIndex++;
            startIndex = endIndex;
        }
    }
    async analyzeConversation(personaId, userMessage, aiResponse, userFeedback, conversationContext) {
        const analysisPrompt = `Analyze this conversation for learning insights:

PERSONA: ${personaId}
USER MESSAGE: ${userMessage}
AI RESPONSE: ${aiResponse}
USER FEEDBACK: ${userFeedback || 'None provided'}
CONTEXT: ${JSON.stringify(conversationContext || {})}

Extract specific learnings in this format:
- INTERACTION_PATTERN: What pattern worked or didn't work in this exchange
- EFFECTIVE_TECHNIQUE: What approach was effective (if any)
- USER_FEEDBACK: What the user's response tells us about effectiveness
- REFINEMENT_NEEDED: What should be improved for similar future conversations

Be specific and actionable. Focus on what makes conversations more effective.`;
        try {
            const { generateClaudeCoachingResponse } = await import('./claude-api-service.js');
            const analysis = await generateClaudeCoachingResponse({
                userMessage: analysisPrompt,
                personaType: 'coaching',
                userName: 'System',
                contextData: { analysisMode: true },
                userId: 'system',
                sessionId: `analysis-${Date.now()}`,
                maxTokens: 1000
            });
            const learning = {
                interactionPattern: this.extractLearningSection(analysis, 'INTERACTION_PATTERN') || 'Pattern analysis pending',
                effectiveTechnique: this.extractLearningSection(analysis, 'EFFECTIVE_TECHNIQUE') || 'Technique analysis pending',
                userFeedback: this.extractLearningSection(analysis, 'USER_FEEDBACK') || 'Feedback analysis pending',
                refinementNeeded: this.extractLearningSection(analysis, 'REFINEMENT_NEEDED') || 'Refinement analysis pending',
                timestamp: new Date().toISOString()
            };
            return learning;
        }
        catch (error) {
            console.error('❌ Error analyzing conversation:', error);
            return {
                interactionPattern: 'Analysis failed - manual review needed',
                effectiveTechnique: 'Could not determine effectiveness',
                userFeedback: userFeedback || 'No feedback provided',
                refinementNeeded: 'Manual analysis required',
                timestamp: new Date().toISOString()
            };
        }
    }
    extractLearningSection(analysis, section) {
        const regex = new RegExp(`${section}:\\s*(.+?)(?=\\n\\w+:|$)`, 'i');
        const match = analysis.match(regex);
        return match ? match[1].trim() : null;
    }
    async updateLearningDocument(personaId, learning) {
        try {
            const docId = await this.getOrCreateLearningDocument(personaId);
            const currentDoc = await pool.query('SELECT content FROM training_documents WHERE id = $1', [docId]);
            if (currentDoc.rows.length === 0) {
                throw new Error('Learning document not found');
            }
            let content = currentDoc.rows[0].content;
            const newLearningSection = this.formatLearningForDocument(learning);
            const insertionPoint = content.indexOf('## 📝 Recent Conversation Insights');
            if (insertionPoint !== -1) {
                const afterSection = content.indexOf('\n## ', insertionPoint + 1);
                const insertPos = afterSection !== -1 ? afterSection : content.length;
                content = content.slice(0, insertPos) + '\n\n' + newLearningSection + '\n' + content.slice(insertPos);
            }
            else {
                content += '\n\n' + newLearningSection;
            }
            await pool.query('UPDATE training_documents SET content = $1, updated_at = NOW() WHERE id = $2', [content, docId]);
            await pool.query('DELETE FROM document_chunks WHERE document_id = $1', [docId]);
            await this.createDocumentChunks(docId, content);
            console.log(`✅ Updated learning document for ${personaId}`);
            try {
                const { javascriptVectorService } = await import('./javascript-vector-service.js');
                await javascriptVectorService.initialize();
                console.log('🔄 Vector service reinitialized with updated learning');
            }
            catch (vectorError) {
                console.warn('⚠️ Could not reinitialize vector service:', vectorError);
            }
        }
        catch (error) {
            console.error(`❌ Error updating learning document for ${personaId}:`, error);
            throw error;
        }
    }
    formatLearningForDocument(learning) {
        const date = new Date(learning.timestamp).toLocaleDateString();
        const time = new Date(learning.timestamp).toLocaleTimeString();
        return `### ${date} ${time} - Conversation Analysis

**Interaction Pattern**: ${learning.interactionPattern}

**Effective Technique**: ${learning.effectiveTechnique}

**User Feedback**: ${learning.userFeedback}

**Refinement Needed**: ${learning.refinementNeeded}

---`;
    }
    async getLearningDocumentId(personaId) {
        try {
            const learningDocTitle = `${personaId.charAt(0).toUpperCase() + personaId.slice(1)} - Conversation Learning Log`;
            const result = await pool.query('SELECT id FROM training_documents WHERE title = $1 AND document_type = $2', [learningDocTitle, 'conversation_learning']);
            return result.rows.length > 0 ? result.rows[0].id : null;
        }
        catch (error) {
            console.error(`❌ Error getting learning document for ${personaId}:`, error);
            return null;
        }
    }
    async initializeAllPersonaLearningDocuments() {
        try {
            console.log('🚀 Initializing learning documents for all personas...');
            const personas = await pool.query('SELECT id FROM talia_personas WHERE enabled = true');
            for (const persona of personas.rows) {
                await this.getOrCreateLearningDocument(persona.id);
                console.log(`✅ Learning document ready for persona: ${persona.id}`);
            }
            console.log(`🎉 Learning documents initialized for ${personas.rows.length} personas`);
        }
        catch (error) {
            console.error('❌ Error initializing persona learning documents:', error);
            throw error;
        }
    }
}
export const conversationLearningService = new ConversationLearningService();
