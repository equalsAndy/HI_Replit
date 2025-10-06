/**
 * AST Sectional Report Service
 * ============================
 * Enhanced section-by-section report generation system for AST workshop reports.
 * Provides improved reliability, progress tracking, and individual section regeneration.
 */

import { Pool } from 'pg';
import { astReportService } from './ast-report-service.js';
import { generateOpenAICoachingResponse } from './openai-api-service.js';
import { htmlTemplateService, type ReportSection, type ReportMetadata } from './html-template-service.js';
import { rmlProcessor } from './rml-processor.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Section definitions for AST reports
interface SectionDefinition {
  id: number;
  name: string;
  title: string;
  description: string;
  dependencies: number[];
  personalPrompt: string;
  professionalPrompt: string;
}

interface SectionStatus {
  id: number;
  name: string;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  content?: string;
  errorMessage?: string;
  completedAt?: Date;
  generationAttempts: number;
}

interface ReportProgress {
  userId: string;
  reportType: 'ast_personal' | 'ast_professional';
  overallStatus: 'pending' | 'generating' | 'in_progress' | 'completed' | 'failed' | 'partial_failure';
  progressPercentage: number;
  sectionsCompleted: number;
  sectionsFailed: number;
  totalSections: number;
  sections: SectionStatus[];
  estimatedCompletionTime?: number;
  startedAt?: Date;
  completedAt?: Date;
}

interface GenerationOptions {
  regenerate?: boolean;
  specificSections?: number[];
  qualityThreshold?: number;
}

class ASTSectionalReportService {
  /**
   * Maps sectional report types to holistic_reports table values
   */
  private mapToHolisticReportType(reportType: string): string {
    return reportType === 'ast_personal' ? 'personal' : 'standard';
  }

  private sectionDefinitions: SectionDefinition[] = [
    {
      id: 0,
      name: 'introduction',
      title: 'Introduction & Overview',
      description: 'Personal introduction with strengths constellation overview',
      dependencies: [],
      personalPrompt: `Generate the INTRODUCTION section for a Personal Development Report. This section should:
- Welcome the user by name and introduce the report's purpose
- Provide an overview of their unique strengths constellation
- Set the tone for the comprehensive development analysis
- Reference their specific percentages and archetype
- Be warm, encouraging, and personally engaging
- Length: 300-400 words`,
      professionalPrompt: `Generate the INTRODUCTION section for a Professional Profile Report. This section should:
- Introduce the user professionally and outline the profile's purpose
- Provide an overview of their working style and strengths constellation
- Set expectations for how colleagues can use this information
- Reference their specific percentages and professional archetype
- Be professional yet approachable
- Length: 250-350 words`
    },
    {
      id: 1,
      name: 'strengths_imagination',
      title: 'Strengths Profile & Imagination',
      description: 'Detailed strengths analysis with creative constellation archetype',
      dependencies: [0],
      personalPrompt: `Generate the STRENGTHS PROFILE & IMAGINATION section for a Personal Development Report. This section should:
- Provide detailed analysis of their unique strengths constellation
- Explain how their specific percentages create their natural patterns
- Create and elaborate on their constellation archetype name
- Connect strengths to personal development opportunities
- Include specific examples from their reflections
- Be insightful and deeply personal
- Length: 600-800 words`,
      professionalPrompt: `Generate the STRENGTHS PROFILE section for a Professional Profile Report. This section should:
- Detail how each strength manifests in professional settings
- Explain their natural working style and collaboration preferences
- Provide specific examples of how colleagues can leverage their strengths
- Include their constellation archetype and what it means for team dynamics
- Focus on practical workplace applications
- Length: 500-700 words`
    },
    {
      id: 2,
      name: 'flow_experiences',
      title: 'Flow State Analysis & Optimization',
      description: 'Flow score interpretation, triggers, blockers, and optimization strategies',
      dependencies: [0, 1],
      personalPrompt: `Generate the FLOW STATE ANALYSIS section for a Personal Development Report. This section should:
- Interpret their specific flow score and category
- Analyze their flow triggers, blockers, and optimal conditions
- Connect flow insights to their strengths constellation
- Provide personalized flow optimization strategies
- Include their flow attributes and insights from their reflections
- Offer practical steps for enhancing flow experiences
- Length: 600-800 words`,
      professionalPrompt: `Generate the PERFORMANCE OPTIMIZATION section for a Professional Profile Report. This section should:
- Explain their flow triggers and optimal work conditions
- Provide specific environmental and collaboration recommendations
- Detail how their flow state manifests in professional settings
- Offer guidance for managers and teammates
- Include productivity and performance optimization strategies
- Focus on workplace flow enhancement
- Length: 500-700 words`
    },
    {
      id: 3,
      name: 'strengths_flow_together',
      title: 'Strengths & Flow Integration',
      description: 'How strengths and flow work together for optimal performance',
      dependencies: [1, 2],
      personalPrompt: `Generate the STRENGTHS & FLOW INTEGRATION section for a Personal Development Report. This section should:
- Explore how their strengths constellation amplifies their flow experiences
- Identify synergies between their dominant strengths and flow triggers
- Provide strategies for using strengths to overcome flow blockers
- Create a personalized framework for optimal performance
- Include specific examples from their workshop reflections
- Offer actionable integration strategies
- Length: 500-700 words`,
      professionalPrompt: `Generate the TEAM INTEGRATION STRATEGIES section for a Professional Profile Report. This section should:
- Explain how their strengths and flow patterns create their leadership style
- Detail their natural team contributions and collaboration approach
- Provide guidance for optimal team positioning and project assignments
- Include their development trajectory and growth areas
- Offer specific strategies for maximizing their team impact
- Focus on professional team dynamics
- Length: 500-700 words`
    },
    {
      id: 4,
      name: 'wellbeing_future_self',
      title: 'Well-being & Future Self Development',
      description: 'Well-being analysis, future vision, and development pathway',
      dependencies: [0, 1, 2],
      personalPrompt: `Generate the WELL-BEING & FUTURE SELF DEVELOPMENT section for a Personal Development Report. This section should:
- Analyze their current well-being level and future aspirations
- Connect their Cantril Ladder responses to actionable development plans
- Explore their future vision and flow-optimized life goals
- Provide specific strategies for well-being enhancement
- Include their quarterly progress framework and action plans
- Offer life integration strategies
- Length: 700-900 words`,
      professionalPrompt: `Generate the COLLABORATION GUIDELINES section for a Professional Profile Report. This section should:
- Provide specific communication preferences and meeting dynamics
- Detail how to give them feedback and recognition effectively
- Explain their stress triggers and support needs
- Offer guidance for managers on optimal leadership approaches
- Include professional development recommendations
- Focus on day-to-day collaboration optimization
- Length: 400-600 words`
    },
    {
      id: 5,
      name: 'collaboration_closing',
      title: 'Collaboration & Next Steps',
      description: 'Final insights, key takeaways, and actionable next steps',
      dependencies: [0, 1, 2, 3, 4],
      personalPrompt: `Generate the KEY TAKEAWAYS & NEXT STEPS section for a Personal Development Report. This section should:
- Summarize the most important insights from their assessment
- Provide a clear development roadmap with immediate, medium, and long-term goals
- Create actionable quarterly milestones
- Reinforce their unique value and growth potential
- End with encouragement and next steps for continued development
- Be inspiring and motivational
- Length: 400-600 words`,
      professionalPrompt: `Generate the WORKING TOGETHER & OPTIMIZATION section for a Professional Profile Report. This section should:
- Provide final recommendations for effective collaboration
- Summarize key points for colleagues and managers
- Offer specific strategies for professional optimization
- Include guidance for ongoing development support
- End with practical next steps for team integration
- Be actionable and colleague-focused
- Length: 300-500 words`
    }
  ];

  /**
   * Initiate section-by-section report generation
   */
  async initiateReportGeneration(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    options: GenerationOptions = {}
  ): Promise<{ success: boolean; message: string; reportId?: string }> {
    try {
      console.log(`🚀 Initiating sectional report generation for user ${userId}, type: ${reportType}`);

      // Check if user has necessary AST data
      const userData = await astReportService.getUserASTData(userId);
      console.log(`🔍 DEBUG: getUserASTData returned for user ${userId}:`, userData ? 'DATA FOUND' : 'NULL');
      if (userData) {
        console.log(`🔍 DEBUG: userData keys:`, Object.keys(userData));
        console.log(`🔍 DEBUG: starStrengths:`, userData.starStrengths);
      }
      if (!userData) {
        return { success: false, message: 'User AST data not found' };
      }

      // Check for existing report
      const existingReport = await this.getExistingReport(userId, reportType);
      if (existingReport && !options.regenerate) {
        return {
          success: false,
          message: 'Report already exists. Use regenerate option to create new report.',
          reportId: existingReport.id
        };
      }

      // Check if generation is already in progress
      const progress = await this.getReportProgress(userId, reportType);
      if (progress.overallStatus === 'generating' && !options.regenerate) {
        return {
          success: false,
          message: 'Report generation is already in progress. Please wait for the current generation to complete.',
          reportId: existingReport?.id
        };
      }

      // Create or update holistic_reports entry
      const reportId = await this.createOrUpdateReport(userId, reportType, options.regenerate);

      // Clear existing sections if regenerating
      if (options.regenerate) {
        await this.clearExistingSections(userId, reportType);
      }

      // Initialize sections
      await this.initializeSections(userId, reportType, options.specificSections);

      // Start async generation
      this.generateSectionsAsync(userId, reportType, userData, options)
        .catch(error => {
          console.error(`❌ Error in async generation for user ${userId}:`, error);
        });

      return {
        success: true,
        message: 'Report generation initiated successfully',
        reportId
      };

    } catch (error) {
      console.error('❌ Error initiating report generation:', error);
      return { success: false, message: 'Failed to initiate report generation' };
    }
  }

  /**
   * Generate sections asynchronously
   */
  private async generateSectionsAsync(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    userData: any,
    options: GenerationOptions
  ): Promise<void> {
    try {
      console.log(`📝 Starting async section generation for user ${userId}`);

      // Update report status to generating
      await this.updateReportStatus(userId, reportType, 'generating');

      // Get sections to generate (all sections or specific ones)
      // NOTE: Skipping section 0 (Introduction & Overview) - app provides static "About This Report" intro
      const sectionsToGenerate = options.specificSections || [1, 2, 3, 4, 5];

      // Sort sections by dependencies
      const sortedSections = this.sortSectionsByDependencies(sectionsToGenerate);

      // Generate sections sequentially to respect dependencies and rate limits
      for (const sectionId of sortedSections) {
        try {
          await this.generateSingleSection(userId, reportType, sectionId, userData);

          // Small delay between sections to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`❌ Error generating section ${sectionId} for user ${userId}:`, error);

          // Mark section as failed but continue with others
          await this.markSectionFailed(userId, reportType, sectionId, error.message);
        }
      }

      // Check if all sections completed successfully
      const progress = await this.getReportProgress(userId, reportType);

      if (progress.progressPercentage === 100) {
        // Assemble final report
        await this.assembleFinalReport(userId, reportType);
        await this.updateReportStatus(userId, reportType, 'completed');
        console.log(`✅ Report generation completed for user ${userId}`);
      } else if (progress.sectionsFailed > 0) {
        await this.updateReportStatus(userId, reportType, 'failed');
        console.log(`⚠️ Report generation partially failed for user ${userId}`);
      }

    } catch (error) {
      console.error(`❌ Error in async section generation for user ${userId}:`, error);
      await this.updateReportStatus(userId, reportType, 'failed');
    }
  }

  /**
   * Generate a single section
   */
  async generateSingleSection(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    sectionId: number,
    userData: any
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      console.log(`📄 Generating section ${sectionId} for user ${userId}`);

      const sectionDef = this.sectionDefinitions.find(s => s.id === sectionId);
      if (!sectionDef) {
        throw new Error(`Section definition not found for section ${sectionId}`);
      }

      // Update section status to generating
      await this.updateSectionStatus(userId, reportType, sectionId, 'generating');

      // Build section-specific prompt
      const prompt = this.buildSectionPrompt(sectionDef, reportType, userData);

      // Generate content via OpenAI directly (simplified approach)
      console.log(`🎯 Generating section content directly via OpenAI for section ${sectionId}`);

      const rawContent = await this.generateSectionContentDirectly(prompt, userData, sectionDef);

      // Save raw content only (no processed content yet - that happens at viewing time)
      // Pass rawContent as both parameters to maintain section_content for backwards compatibility
      // The saveSectionContent method will store raw_content and set section_content to the same value
      await this.saveSectionContent(userId, reportType, sectionId, sectionDef.title, rawContent);

      console.log(`✅ Section ${sectionId} generated and raw content saved for user ${userId}`);
      return { success: true, content: rawContent };

    } catch (error) {
      console.error(`❌ Error generating section ${sectionId} for user ${userId}:`, error);

      // Mark section as failed
      await this.markSectionFailed(userId, reportType, sectionId, error.message);

      return { success: false, error: error.message };
    }
  }

  /**
   * Get report generation progress
   */
  async getReportProgress(userId: string, reportType: 'ast_personal' | 'ast_professional'): Promise<ReportProgress> {
    try {
      // Get sections status
      const sectionsResult = await pool.query(`
        SELECT section_id, section_name, section_title, status, section_content,
               error_message, completed_at, generation_attempts, created_at
        FROM report_sections
        WHERE user_id = $1 AND report_type = $2
        ORDER BY section_id
      `, [userId, reportType]);

      // Get report overview
      const holisticReportType = this.mapToHolisticReportType(reportType);
      const reportResult = await pool.query(`
        SELECT generation_status, sectional_progress, sections_completed,
               sections_failed, total_sections, generated_at, updated_at
        FROM holistic_reports
        WHERE user_id = $1 AND report_type = $2 AND generation_mode = 'sectional'
        ORDER BY updated_at DESC
        LIMIT 1
      `, [userId, holisticReportType]);

      const sections: SectionStatus[] = sectionsResult.rows.map(row => ({
        id: row.section_id,
        name: row.section_name,
        title: row.section_title,
        status: row.status,
        content: row.section_content,
        errorMessage: row.error_message,
        completedAt: row.completed_at,
        generationAttempts: row.generation_attempts
      }));

      const reportData = reportResult.rows[0];
      const totalSections = 5; // Sections 1-5 (section 0 skipped, static intro used)
      const sectionsCompleted = sections.filter(s => s.status === 'completed').length;
      const sectionsFailed = sections.filter(s => s.status === 'failed').length;
      const progressPercentage = totalSections > 0 ? Math.round((sectionsCompleted / totalSections) * 100) : 0;

      // Determine overall status
      let overallStatus: ReportProgress['overallStatus'] = 'pending';
      const hasGeneratingSection = sections.some(s => s.status === 'generating');

      if (sectionsCompleted === totalSections) {
        overallStatus = 'completed';
      } else if (sectionsFailed > 0 && sectionsCompleted > 0) {
        overallStatus = 'partial_failure';
      } else if (sectionsFailed > 0 && !hasGeneratingSection) {
        overallStatus = 'failed';
      } else if (hasGeneratingSection || (reportData?.generation_status === 'generating')) {
        overallStatus = 'generating';
      } else if (sectionsCompleted > 0) {
        overallStatus = 'in_progress';
      }

      return {
        userId,
        reportType,
        overallStatus,
        progressPercentage,
        sectionsCompleted,
        sectionsFailed,
        totalSections,
        sections,
        startedAt: reportData?.generated_at,
        completedAt: overallStatus === 'completed' ? reportData?.updated_at : undefined
      };

    } catch (error) {
      console.error('❌ Error getting report progress:', error);
      throw error;
    }
  }

  /**
   * Regenerate a specific section
   */
  async regenerateSection(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    sectionId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Regenerating section ${sectionId} for user ${userId}`);

      // Get user data
      const userData = await astReportService.getUserASTData(userId);
      if (!userData) {
        return { success: false, message: 'User AST data not found' };
      }

      // Increment generation attempts
      await pool.query(`
        UPDATE report_sections
        SET generation_attempts = generation_attempts + 1,
            status = 'pending',
            error_message = NULL,
            updated_at = NOW()
        WHERE user_id = $1 AND report_type = $2 AND section_id = $3
      `, [userId, reportType, sectionId]);

      // Generate the section
      const result = await this.generateSingleSection(userId, reportType, sectionId, userData);

      if (result.success) {
        return { success: true, message: 'Section regenerated successfully' };
      } else {
        return { success: false, message: result.error || 'Failed to regenerate section' };
      }

    } catch (error) {
      console.error('❌ Error regenerating section:', error);
      return { success: false, message: 'Failed to regenerate section' };
    }
  }

  /**
   * Get assembled final report
   */
  async getAssembledReport(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    format: 'html' | 'json' | 'text' = 'html'
  ): Promise<{ success: boolean; content?: string; metadata?: any }> {
    try {
      // Check if report is complete
      const progress = await this.getReportProgress(userId, reportType);

      if (progress.progressPercentage < 100) {
        return {
          success: false,
          content: 'Report is not yet complete. Current progress: ' + progress.progressPercentage + '%'
        };
      }

      // Get all sections with raw content for RML processing
      const sectionsResult = await pool.query(`
        SELECT section_id, section_title, section_content, raw_content
        FROM report_sections
        WHERE user_id = $1 AND report_type = $2 AND status = 'completed'
        ORDER BY section_id
      `, [userId, reportType]);

      // Process sections: Use raw_content if available, otherwise fall back to section_content
      // Then process through RML to render visual components
      console.log(`🎨 Processing ${sectionsResult.rows.length} sections through RML system...`);
      const sections = sectionsResult.rows.map(row => {
        const contentToProcess = row.raw_content || row.section_content;
        const processedContent = rmlProcessor.processContent(contentToProcess, {
          sectionId: row.section_id,
          userId: userId
        });

        return {
          section_id: row.section_id,
          section_title: row.section_title,
          section_content: processedContent
        };
      });
      console.log(`✅ RML processing complete for all sections`);

      if (format === 'json') {
        return {
          success: true,
          content: JSON.stringify({
            reportType,
            userId,
            sections: sections.map(s => ({
              id: s.section_id,
              title: s.section_title,
              content: s.section_content
            })),
            generatedAt: new Date().toISOString()
          }, null, 2)
        };
      }

      if (format === 'text') {
        const textContent = sections
          .map(s => `${s.section_title}\n${'='.repeat(s.section_title.length)}\n\n${s.section_content}`)
          .join('\n\n');

        return { success: true, content: textContent };
      }

      // HTML format with rich visual integration
      const htmlContent = await this.generateRichHtmlReport(userId, reportType, sections);

      return { success: true, content: htmlContent };

    } catch (error) {
      console.error('❌ Error assembling final report:', error);
      return { success: false, content: 'Error assembling report' };
    }
  }

  /**
   * Generate section content directly via OpenAI (simplified approach)
   */
  private async generateSectionContentDirectly(prompt: string, userData: any, sectionDef: any): Promise<string> {
    try {
      // Use the existing OpenAI assistant for AST reports
      const OpenAI = (await import('openai')).default;

      // Use robust API key resolution logic (same as openai-api-service.ts)
      let apiKey = process.env.OPENAI_API_KEY?.trim();

      // If OPENAI_API_KEY doesn't exist or is placeholder, try alternatives
      if (!apiKey || apiKey.startsWith('YOUR_') || apiKey === 'YOUR_KEY') {
        apiKey = process.env.REPORT_OPENAI_API_KEY?.trim() ||
                 process.env.OPENAI_KEY_TALIA_V1?.trim() ||
                 process.env.OPENAI_KEY_TALIA_V2?.trim();
      }

      // Final validation - ensure key exists and looks valid
      if (!apiKey ||
          apiKey.startsWith('YOUR_') ||
          apiKey === 'YOUR_KEY' ||
          apiKey.includes('YOUR_KEY') ||
          !apiKey.startsWith('sk-')) {
        throw new Error(
          `Missing or invalid OpenAI API key for sectional reports. Checked: OPENAI_API_KEY${process.env.OPENAI_API_KEY ? ' (invalid format)' : ' (missing)'}, REPORT_OPENAI_API_KEY${process.env.REPORT_OPENAI_API_KEY ? ' (invalid format)' : ' (missing)'}, OPENAI_KEY_TALIA_V1, OPENAI_KEY_TALIA_V2`
        );
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      // Use the Star Report Talia assistant for AST reports
      const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_mTHLtTXri8cI1wtUwgDGsWhp';

      // Create a thread for this section generation
      const thread = await openai.beta.threads.create();

      // Add the user message with the data - assistant has its own instructions
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
      });

      // Wait for completion
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${runStatus.status}`);
      }

      // Get the response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

      if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== 'text') {
        throw new Error('No text content generated from assistant');
      }

      const content = assistantMessage.content[0].text.value;

      // Clean up the thread
      await openai.beta.threads.del(thread.id);

      console.log(`✅ Generated ${content.length} characters (raw content) for section ${sectionDef.id}`);

      // 🎨 NOTE: RML processing is now deferred to report viewing time
      // This allows us to store the raw OpenAI response in the database
      // and process visuals only when the report is rendered
      console.log('📦 Storing raw OpenAI content (RML processing deferred to viewing time)');

      return content;

    } catch (error) {
      console.error(`❌ Error generating section content directly:`, error);
      throw error;
    }
  }

  // Helper methods

  private async getExistingReport(userId: string, reportType: string) {
    const holisticReportType = this.mapToHolisticReportType(reportType);
    const result = await pool.query(`
      SELECT id FROM holistic_reports
      WHERE user_id = $1 AND report_type = $2
      ORDER BY updated_at DESC
      LIMIT 1
    `, [userId, holisticReportType]);

    return result.rows[0] || null;
  }

  private async createOrUpdateReport(userId: string, reportType: string, regenerate: boolean): Promise<string> {
    const holisticReportType = this.mapToHolisticReportType(reportType);

    if (regenerate) {
      // Update existing report
      const result = await pool.query(`
        UPDATE holistic_reports
        SET generation_mode = 'sectional',
            generation_status = 'generating',
            sectional_progress = 0,
            sections_completed = 0,
            sections_failed = 0,
            updated_at = NOW()
        WHERE user_id = $1 AND report_type = $2
        RETURNING id
      `, [userId, holisticReportType]);

      if (result.rows.length > 0) {
        return result.rows[0].id;
      }
    }

    // Create new report
    const result = await pool.query(`
      INSERT INTO holistic_reports (
        user_id, report_type, generation_mode, generation_status,
        report_data, sectional_progress, sections_completed, sections_failed, total_sections
      ) VALUES ($1, $2, 'sectional', 'pending', '{}', 0, 0, 0, 5)
      RETURNING id
    `, [userId, holisticReportType]);

    return result.rows[0].id;
  }

  private async clearExistingSections(userId: string, reportType: string): Promise<void> {
    await pool.query(`
      DELETE FROM report_sections
      WHERE user_id = $1 AND report_type = $2
    `, [userId, reportType]);
  }

  private async initializeSections(userId: string, reportType: string, specificSections?: number[]): Promise<void> {
    const sectionsToInit = specificSections || [1, 2, 3, 4, 5]; // Skip section 0

    for (const sectionId of sectionsToInit) {
      const sectionDef = this.sectionDefinitions.find(s => s.id === sectionId);
      if (sectionDef) {
        await pool.query(`
          INSERT INTO report_sections (
            user_id, report_type, section_id, section_name, section_title, status
          ) VALUES ($1, $2, $3, $4, $5, 'pending')
          ON CONFLICT (user_id, report_type, section_id)
          DO UPDATE SET status = 'pending', updated_at = NOW()
        `, [userId, reportType, sectionId, sectionDef.name, sectionDef.title]);
      }
    }
  }

  private sortSectionsByDependencies(sectionIds: number[]): number[] {
    // Simple topological sort based on dependencies
    const sorted: number[] = [];
    const remaining = [...sectionIds];

    while (remaining.length > 0) {
      const canProcess = remaining.filter(id => {
        const section = this.sectionDefinitions.find(s => s.id === id);
        return section && section.dependencies.every(dep => sorted.includes(dep));
      });

      if (canProcess.length === 0) {
        // Break circular dependencies by adding the first remaining
        sorted.push(remaining[0]);
        remaining.splice(0, 1);
      } else {
        // Add sections that have all dependencies satisfied
        canProcess.forEach(id => {
          sorted.push(id);
          const index = remaining.indexOf(id);
          if (index > -1) remaining.splice(index, 1);
        });
      }
    }

    return sorted;
  }


  private buildSectionPrompt(
    sectionDef: SectionDefinition,
    reportType: 'ast_personal' | 'ast_professional',
    userData: any
  ): string {
    const isPersonal = reportType === 'ast_personal';

    // Send only data as JSON - Assistant has its own instructions
    const dataPayload = {
      type: 'ast_sectional_report',
      section_id: sectionDef.id,
      section_name: sectionDef.name,
      section_title: sectionDef.title,
      report_type: isPersonal ? 'personal' : 'professional',
      participant_name: userData.userName,
      strengths: {
        thinking: userData.starStrengths?.thinking || 0,
        acting: userData.starStrengths?.acting || 0,
        feeling: userData.starStrengths?.feeling || 0,
        planning: userData.starStrengths?.planning || 0
      },
      flow: {
        flowScore: userData.flowScore || 0,
        triggers: userData.flowInsights?.triggers || '',
        blockers: userData.flowInsights?.blockers || '',
        conditions: userData.flowInsights?.conditions || '',
        improvements: userData.flowInsights?.improvements || ''
      },
      reflections: userData.stepReflections || {},
      wellbeing: {
        current_level: userData.cantrilLadder?.currentLevel || 0,
        future_level: userData.cantrilLadder?.futureLevel || 0,
        current_factors: userData.cantrilLadder?.currentFactors || '',
        future_improvements: userData.cantrilLadder?.futureImprovements || '',
        specific_changes: userData.cantrilLadder?.specificChanges || ''
      }
    };

    return JSON.stringify(dataPayload, null, 2);
  }

  private async updateSectionStatus(
    userId: string,
    reportType: string,
    sectionId: number,
    status: string
  ): Promise<void> {
    await pool.query(`
      UPDATE report_sections
      SET status = $1, updated_at = NOW()
      WHERE user_id = $2 AND report_type = $3 AND section_id = $4
    `, [status, userId, reportType, sectionId]);
  }

  private async saveSectionContent(
    userId: string,
    reportType: string,
    sectionId: number,
    sectionTitle: string,
    rawContent: string,
    processedContent?: string
  ): Promise<void> {
    // If processedContent is not provided, set it same as rawContent (for backwards compatibility)
    const contentToStore = processedContent !== undefined ? processedContent : rawContent;

    await pool.query(`
      UPDATE report_sections
      SET raw_content = $1,
          section_content = $2,
          section_title = $3,
          status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $4 AND report_type = $5 AND section_id = $6
    `, [rawContent, contentToStore, sectionTitle, userId, reportType, sectionId]);
  }

  private async markSectionFailed(
    userId: string,
    reportType: string,
    sectionId: number,
    errorMessage: string
  ): Promise<void> {
    await pool.query(`
      UPDATE report_sections
      SET status = 'failed',
          error_message = $1,
          generation_attempts = generation_attempts + 1,
          updated_at = NOW()
      WHERE user_id = $2 AND report_type = $3 AND section_id = $4
    `, [errorMessage, userId, reportType, sectionId]);
  }

  private async updateReportStatus(
    userId: string,
    reportType: string,
    status: string
  ): Promise<void> {
    const holisticReportType = this.mapToHolisticReportType(reportType);
    await pool.query(`
      UPDATE holistic_reports
      SET generation_status = $1, updated_at = NOW()
      WHERE user_id = $2 AND report_type = $3 AND generation_mode = 'sectional'
    `, [status, userId, holisticReportType]);
  }

  private async assembleFinalReport(userId: string, reportType: 'ast_personal' | 'ast_professional'): Promise<void> {
    try {
      // Get all completed sections
      const sectionsResult = await pool.query(`
        SELECT section_content
        FROM report_sections
        WHERE user_id = $1 AND report_type = $2 AND status = 'completed'
        ORDER BY section_id
      `, [userId, reportType]);

      // Combine all sections into final report
      const finalContent = sectionsResult.rows
        .map(row => row.section_content)
        .join('\n\n---\n\n');

      // Get HTML version
      const htmlResult = await this.getAssembledReport(userId, reportType, 'html');
      const htmlContent = htmlResult.success ? htmlResult.content : '';

      // Update holistic_reports with final content
      const holisticReportType = this.mapToHolisticReportType(reportType);
      await pool.query(`
        UPDATE holistic_reports
        SET report_data = $1,
            html_content = $2,
            generation_status = 'completed',
            updated_at = NOW()
        WHERE user_id = $3 AND report_type = $4 AND generation_mode = 'sectional'
      `, [
        JSON.stringify({ content: finalContent, sections: sectionsResult.rows.length }),
        htmlContent,
        userId,
        holisticReportType
      ]);

      console.log(`✅ Final report assembled for user ${userId}, type: ${reportType}`);

    } catch (error) {
      console.error('❌ Error assembling final report:', error);
      throw error;
    }
  }

  /**
   * Generate rich HTML report using professional template service
   */
  private async generateRichHtmlReport(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    sections: any[]
  ): Promise<string> {
    try {
      console.log(`🎨 Generating professional HTML report for user ${userId}, type: ${reportType}`);

      // Get user info from database
      const userResult = await pool.query(
        'SELECT id, username, name FROM users WHERE id = $1',
        [userId]
      );

      const user = userResult.rows[0];
      if (!user) {
        throw new Error('User not found');
      }

      // Transform sections for template service
      const reportSections: ReportSection[] = sections.map(s => ({
        id: s.section_id,
        title: s.section_title,
        content: s.section_content
      }));

      // Create metadata for template service
      const metadata: ReportMetadata = {
        userName: user.name,
        reportType: reportType,
        generatedAt: new Date(),
        subtitle: reportType === 'ast_personal'
          ? 'Personal Development Insights'
          : 'Professional Profile Analysis',
        userId: userId
      };

      // Generate professional HTML using template service
      return htmlTemplateService.generateReportHTML(reportSections, metadata);

    } catch (error) {
      console.error('❌ Error generating professional HTML report:', error);

      // Fallback to basic HTML if template service fails
      const basicHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportType === 'ast_personal' ? 'Personal Development Report' : 'Professional Profile Report'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <h1>${reportType === 'ast_personal' ? 'Personal Development Report' : 'Professional Profile Report'}</h1>
    ${sections.map(s => `
        <div class="section">
            <h2>${s.section_title}</h2>
            <div>${s.section_content}</div>
        </div>
    `).join('')}
</body>
</html>`;

      return basicHtml;
    }
  }


  // Helper methods from original service
  private analyzeStrengthsConstellation(strengths: any) {
    const strengthsArray = [
      { name: 'Thinking', value: strengths.thinking },
      { name: 'Acting', value: strengths.acting },
      { name: 'Feeling', value: strengths.feeling },
      { name: 'Planning', value: strengths.planning }
    ].sort((a, b) => b.value - a.value);

    const highest = strengthsArray[0];
    const second = strengthsArray[1];

    return {
      name: `The ${this.getConstellationArchetype(highest.name, second.name)}`,
      pattern: highest.value >= 40 ? 'Dominant Profile' : 'Balanced Profile',
      percentages: `${highest.name} ${highest.value}%, ${second.name} ${second.value}%, ${strengthsArray[2].name} ${strengthsArray[2].value}%, ${strengthsArray[3].name} ${strengthsArray[3].value}%`
    };
  }

  private getConstellationArchetype(primary: string, secondary: string): string {
    const archetypes: Record<string, string> = {
      'Thinking-Acting': 'Strategic Executor',
      'Thinking-Feeling': 'Empathetic Analyst',
      'Thinking-Planning': 'Systems Architect',
      'Acting-Thinking': 'Dynamic Problem Solver',
      'Acting-Feeling': 'People-Focused Driver',
      'Acting-Planning': 'Dynamic Organizer',
      'Feeling-Thinking': 'Analytical Collaborator',
      'Feeling-Acting': 'Relationship Builder',
      'Feeling-Planning': 'Structured Supporter',
      'Planning-Thinking': 'Methodical Analyst',
      'Planning-Acting': 'Organized Implementer',
      'Planning-Feeling': 'Process Facilitator'
    };

    return archetypes[`${primary}-${secondary}`] || 'Unique Constellation';
  }

  private categorizeFlowScore(score: number): string {
    if (score >= 50) return 'Flow Fluent';
    if (score >= 39) return 'Flow Aware';
    if (score >= 26) return 'Flow Blocked';
    return 'Flow Distant';
  }
}

// Export singleton instance
export const astSectionalReportService = new ASTSectionalReportService();
export default astSectionalReportService;