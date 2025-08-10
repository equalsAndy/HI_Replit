import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
export class PgvectorSearchService {
    async searchTrainingDocuments(query, reportType, maxResults = 3) {
        try {
            console.log(`🔍 pgvector search: "${query}" (${reportType} focus)`);
            const searchTerms = [
                query,
                reportType,
                'strengths signature',
                'development',
                'template'
            ].join(' | ');
            const result = await pool.query(`
        SELECT 
          id::text,
          title,
          content,
          category,
          ts_rank_cd(
            to_tsvector('english', title || ' ' || content), 
            plainto_tsquery('english', $1)
          ) as relevance_score,
          ts_headline(
            'english',
            content,
            plainto_tsquery('english', $1),
            'MaxWords=50, MinWords=20'
          ) as excerpt
        FROM training_documents
        WHERE 
          status = 'active'
          AND (
            to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
            OR title ILIKE $2
            OR category ILIKE $3
          )
        ORDER BY 
          CASE 
            WHEN title ILIKE $4 THEN 1
            WHEN category = 'example_reports' THEN 2
            WHEN category = 'prompts' THEN 3
            ELSE 4
          END,
          relevance_score DESC
        LIMIT $5
      `, [
                searchTerms,
                `%${reportType}%`,
                `%report%`,
                `%${reportType}%`,
                maxResults
            ]);
            console.log(`📊 Found ${result.rows.length} relevant documents`);
            return result.rows.map(row => ({
                id: row.id,
                title: row.title,
                content: row.content,
                relevanceScore: parseFloat(row.relevance_score || 0),
                category: row.category,
                excerpt: row.excerpt || row.content.substring(0, 200) + '...'
            }));
        }
        catch (error) {
            console.error('❌ pgvector search failed:', error);
            return [];
        }
    }
    async getOptimalTrainingPrompt(reportType, userContext) {
        try {
            console.log(`🎯 Getting optimal training prompt for ${reportType} report`);
            console.log(`🔍 User context received:`, JSON.stringify(userContext, null, 2));
            console.log(`🔧 Using simplified vector database approach instead of full documents`);
            const vectorDbPrompt = `# OpenAI Vector Database Report Generation Request

You are Report Talia. Use this user's assessment data to generate a comprehensive ${reportType === 'personal' ? 'Personal Development Report' : 'Professional Profile Report'}.

## Instructions:
1. **READ THE PRIMARY PROMPT**: Use the "TALIA_Report_Generation_PRIMARY_Prompt" document that is already in your vector database for complete generation instructions
2. **REFERENCE SUPPORTING DOCUMENTS**: Use all supporting training documents already in your vector database for examples and enhanced personalization
3. **USE THE MAPPING DOCUMENT**: There is a mapping document in your vector database to help understand the assessment data structure
4. **APPLY TO USER DATA**: Use the specific user data provided below to create a personalized report

## Report Type: 
${reportType === 'personal' ? 'Personal Development Report' : 'Professional Profile Report'}

## User Context Data:
Name: ${userContext.name}
Strengths: ${JSON.stringify(userContext.strengths, null, 2)}
Reflections: ${JSON.stringify(userContext.reflections, null, 2)}
Flow Data: ${JSON.stringify(userContext.flowData, null, 2)}

## Generation Requirements:
- Follow ALL instructions from the TALIA_Report_Generation_PRIMARY_Prompt in your vector database
- Use 2nd person voice ("You possess...")
- Reference the user's exact assessment data and percentages
- Quote their actual reflections and responses
- Create a signature name that captures their unique pattern
- Use supporting documents from your vector database for enhanced personalization

Generate the complete report now using your vector database knowledge and this user's data.`;
            console.log(`📏 Vector DB prompt length: ${vectorDbPrompt.length} characters (optimized from ~94,000)`);
            return vectorDbPrompt;
        }
        catch (error) {
            console.error('❌ Failed to get optimal training prompt:', error);
            return this.getFallbackPrompt(reportType);
        }
    }
    extractPromptSections(fullPrompt, sections) {
        let extractedContent = '';
        for (const section of sections) {
            const sectionStart = fullPrompt.indexOf(section);
            if (sectionStart !== -1) {
                const nextSectionPattern = /^##[^#]/gm;
                nextSectionPattern.lastIndex = sectionStart + section.length;
                const nextMatch = nextSectionPattern.exec(fullPrompt);
                const sectionEnd = nextMatch ? nextMatch.index : sectionStart + 2000;
                const sectionContent = fullPrompt.substring(sectionStart, sectionEnd);
                extractedContent += sectionContent + '\n\n';
            }
        }
        return extractedContent;
    }
    async buildUserContextPrompt(userContext, reportType) {
        try {
            const personalizationResult = await pool.query(`
        SELECT title, content 
        FROM training_documents 
        WHERE title IN ('Report Personalization Instructions', 'Report Personalization Templates', 'Report Data Processing Instructions')
          AND status = 'active'
        ORDER BY 
          CASE title
            WHEN 'Report Personalization Instructions' THEN 1
            WHEN 'Report Personalization Templates' THEN 2
            WHEN 'Report Data Processing Instructions' THEN 3
          END
      `);
            let documentBasedInstructions = '';
            if (personalizationResult.rows.length > 0) {
                documentBasedInstructions = personalizationResult.rows
                    .map(doc => `## ${doc.title}\n\n${doc.content}`)
                    .join('\n\n');
                console.log(`📋 Using ${personalizationResult.rows.length} document-based personalization instructions`);
            }
            const strengths = userContext.strengths || {};
            const strengthEntries = Object.entries(strengths).map(([key, value]) => [key, Number(value)]);
            const dominantStrength = strengthEntries.length > 0 ?
                strengthEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] : 'unknown';
            const totalStrengths = strengthEntries.reduce((sum, [_, value]) => sum + Number(value), 0);
            const strengthPercentages = strengthEntries.map(([key, value]) => `${key}: ${((Number(value) / totalStrengths) * 100).toFixed(1)}%`).join(', ');
            const sortedStrengths = strengthEntries.sort((a, b) => Number(b[1]) - Number(a[1]));
            const secondStrength = sortedStrengths.length > 1 ? sortedStrengths[1][0] : dominantStrength;
            const dominantPercentage = ((Number(strengths[dominantStrength] || 0) / totalStrengths) * 100).toFixed(1);
            const secondPercentage = ((Number(strengths[secondStrength] || 0) / totalStrengths) * 100).toFixed(1);
            const signatureMap = {
                'thinking_acting': 'Strategic Implementation',
                'feeling_planning': 'Human-Centered Organization',
                'acting_planning': 'Execution Excellence',
                'thinking_feeling': 'Empathetic Analysis',
                'thinking_planning': 'Strategic Planning',
                'feeling_acting': 'Values-Driven Action',
                'acting_thinking': 'Analytical Execution',
                'planning_thinking': 'Systematic Analysis',
                'planning_feeling': 'Purposeful Organization',
                'acting_feeling': 'Compassionate Action'
            };
            const signatureKey = `${dominantStrength}_${secondStrength}`;
            const reversedKey = `${secondStrength}_${dominantStrength}`;
            const signatureName = signatureMap[signatureKey] || signatureMap[reversedKey] || `${dominantStrength.charAt(0).toUpperCase() + dominantStrength.slice(1)} Excellence`;
            const flowScore = userContext.flowData?.flowScore || 0;
            const flowLevel = flowScore >= 50 ? 'Flow Fluent' :
                flowScore >= 39 ? 'Flow Aware' :
                    flowScore >= 26 ? 'Flow Blocked' : 'Flow Distant';
            return `
WRITE REPORT NOW. START IMMEDIATELY WITH:

"# Your Personal Development Report

## Executive Summary

You possess a rare combination of extremely high ${dominantStrength} at ${dominantPercentage}% combined with ${secondStrength} at ${secondPercentage}%, creating what we call an '${signatureName}' signature. Your strengths create a natural rhythm where ${userContext.reflections?.uniqueContribution || 'you contribute uniquely to your teams'}."

CONTINUE WRITING THE FULL REPORT USING THESE EXACT REQUIREMENTS:

${documentBasedInstructions}

MANDATORY USER DATA TO REFERENCE THROUGHOUT:
- ${userContext.name}'s exact strengths: ${strengthPercentages}
- Flow Score: ${flowScore}/60 (${flowLevel})
- Signature: ${signatureName}
- Quote their words: "${userContext.reflections?.uniqueContribution || ''}"
- Quote their values: "${userContext.reflections?.teamValues || ''}"
- Quote action example: "${userContext.reflections?.strength1 || ''}"
- Quote thinking example: "${userContext.reflections?.strength2 || ''}"

WRITE THE COMPLETE PERSONALIZED REPORT NOW. USE 2ND PERSON VOICE THROUGHOUT.
`;
        }
        catch (error) {
            console.error('❌ Error building document-based user context:', error);
            return this.buildSimpleUserContext(userContext, reportType);
        }
    }
    buildSimpleUserContext(userContext, reportType) {
        const strengths = userContext.strengths || {};
        const strengthEntries = Object.entries(strengths).map(([key, value]) => [key, Number(value)]);
        const dominantStrength = strengthEntries.length > 0 ?
            strengthEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] : 'unknown';
        return `
Generate a highly personalized ${reportType} development report for ${userContext.name}.

CRITICAL REQUIREMENTS:
- Use 2nd person voice ("You possess...")
- Reference exact percentages from their data
- Quote their exact words from reflections
- Create a unique signature name
- NO generic professional development language

User Data:
- Name: ${userContext.name}
- Dominant Strength: ${dominantStrength}
- Flow Score: ${userContext.flowData?.flowScore || 'N/A'}/60
- Reflections: ${JSON.stringify(userContext.reflections, null, 2)}
- Strengths: ${JSON.stringify(userContext.strengths, null, 2)}
`;
    }
    getFallbackPrompt(reportType) {
        return `You are Report Talia. Generate a comprehensive ${reportType} development report following these requirements:

1. Use 2nd person voice for personal reports ("You possess...")
2. Use 3rd person voice for professional reports ("[Name] brings...")
3. Include specific user data and percentages
4. Follow a structured format with clear sections
5. Provide actionable insights and recommendations
6. Reference their actual reflections and examples

Generate the complete report immediately without explanation.`;
    }
    async getExampleReports(reportType) {
        try {
            const result = await pool.query(`
        SELECT content 
        FROM training_documents 
        WHERE category = 'example_reports'
          AND title ILIKE $1
          AND status = 'active'
        LIMIT 1
      `, [`%${reportType}%`]);
            if (result.rows.length > 0) {
                const example = result.rows[0].content;
                return example.substring(0, 3000) + '\n\n[Use this as quality reference for structure and tone]';
            }
            return '';
        }
        catch (error) {
            console.error('❌ Failed to get example reports:', error);
            return '';
        }
    }
}
export const pgvectorSearchService = new PgvectorSearchService();
export default pgvectorSearchService;
