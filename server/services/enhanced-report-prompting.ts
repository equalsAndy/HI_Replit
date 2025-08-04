/**
 * Enhanced Report Prompting Service
 * ==================================
 * METAlia-driven improvement to Report Talia's prompting system
 * Generates sophisticated prompts that produce high-quality, personalized reports
 */

export interface UserAnalysisData {
  name: string;
  starCard: {
    thinking: number;
    feeling: number;
    acting: number;
    planning: number;
  };
  reflections: any;
  assessments: any[];
  futureVision?: any;
  flowData?: any;
  wellBeingData?: any;
}

export class EnhancedReportPrompting {

  /**
   * Generate sophisticated prompt for high-quality report generation
   */
  generateReportPrompt(userData: UserAnalysisData, reportType: 'personal' | 'professional'): string {
    const starCardAnalysis = this.analyzeStarCardSignature(userData.starCard);
    const keyInsights = this.extractKeyInsights(userData);
    
    return `# Advanced Personal Development Report Generation

You are an expert life coach and assessment analyst tasked with creating a sophisticated, deeply personalized development report. This should match the quality and depth of the best professional coaching reports.

## User Data Analysis

**User:** ${userData.name}

**Strengths Signature Analysis:**
${this.formatStarCardData(userData.starCard, starCardAnalysis)}

**Assessment Insights:**
${this.formatAssessmentInsights(keyInsights)}

**Personal Reflections and Examples:**
${this.formatPersonalReflections(userData.reflections)}

${userData.futureVision ? `**Future Vision Context:**
${this.formatFutureVision(userData.futureVision)}` : ''}

${userData.wellBeingData ? `**Well-being Context:**
${this.formatWellBeingData(userData.wellBeingData)}` : ''}

## Report Generation Instructions

Create a comprehensive Personal Development Report that:

### 1. PERSONALIZATION REQUIREMENTS (CRITICAL)
- Use ${userData.name}'s exact StarCard percentages: ${this.getExactPercentages(userData.starCard)}
- Reference specific quotes from their reflections (use quotation marks)
- Incorporate their actual examples and scenarios they described
- Use their own language and terminology where appropriate
- Connect insights to their specific goals and vision

### 2. STRUCTURE AND DEPTH
Follow this sophisticated structure:

**Executive Summary** (150-200 words)
- Identify their unique "signature" (combination of strengths)
- Highlight 2-3 key insights that will drive their development
- Preview the main recommendations

**Part I: Your Strengths Signature Deep Dive** (800-1000 words)
- Analyze how their specific percentages create a unique pattern
- Explain how their strengths work together in sequence
- Use their actual examples to illustrate concepts
- Identify their natural operating rhythm

**Part II: Optimizing Your Flow State** (600-800 words)
- Analyze their current flow patterns and barriers
- Provide specific, actionable flow optimization strategies
- Connect to their work/life context

**Part III: Bridging to Your Future Self** (600-800 words)
- Connect current signature to their stated future vision
- Provide specific development pathway
- Address their unique challenges and opportunities

**Part IV: Your Development Pathway** (500-700 words)
- Specific, actionable recommendations
- Timeline for implementation
- Success metrics

**Part V: Your Signature in Action** (400-500 words)
- Daily practices tailored to their signature
- Specific strategies for their challenges
- Integration with their goals

### 3. QUALITY STANDARDS
- **Specificity:** Every insight must connect to their actual data
- **Depth:** Go beyond surface observations to sophisticated analysis
- **Actionability:** Provide concrete next steps, not generic advice
- **Coherence:** Create a narrative thread throughout the report
- **Professional tone:** Sophisticated but accessible language

### 4. AVOID THESE COMMON ISSUES
- Generic percentages (like 35%, 25%, 20%) - use their EXACT data
- Template language that could apply to anyone
- Generic examples - use THEIR examples
- Vague recommendations - be specific and tactical

### 5. USE THESE PROVEN TECHNIQUES
- Quote their actual reflections to validate insights
- Reference specific situations they described
- Build on their stated goals and aspirations
- Use their assessment data as evidence for recommendations
- Create clear connections between different parts of their profile

## Expected Output
Generate a 3,000-4,000 word report that demonstrates deep understanding of this individual's unique profile. The report should feel personally crafted for ${userData.name}, incorporating their specific data, examples, and aspirations.

Begin the report now:`;
  }

  /**
   * Analyze StarCard signature to identify patterns
   */
  private analyzeStarCardSignature(starCard: any): any {
    const { thinking, feeling, acting, planning } = starCard;
    const total = thinking + feeling + acting + planning;
    
    const percentages = {
      thinking: ((thinking / total) * 100).toFixed(1),
      feeling: ((feeling / total) * 100).toFixed(1),
      acting: ((acting / total) * 100).toFixed(1),
      planning: ((planning / total) * 100).toFixed(1)
    };

    // Identify dominant strengths
    const strengths = [
      { name: 'Thinking', value: thinking, percentage: percentages.thinking },
      { name: 'Feeling', value: feeling, percentage: percentages.feeling },
      { name: 'Acting', value: acting, percentage: percentages.acting },
      { name: 'Planning', value: planning, percentage: percentages.planning }
    ].sort((a, b) => b.value - a.value);

    // Identify signature pattern
    const dominant = strengths[0];
    const secondary = strengths[1];
    
    let signatureType = '';
    if (dominant.name === 'Planning' && secondary.name === 'Feeling') {
      signatureType = 'Human-Centered Organization';
    } else if (dominant.name === 'Thinking' && secondary.name === 'Acting') {
      signatureType = 'Strategic Execution';
    } else if (dominant.name === 'Feeling' && secondary.name === 'Acting') {
      signatureType = 'Empathetic Leadership';
    } else {
      signatureType = `${dominant.name}-${secondary.name} Combination`;
    }

    return {
      percentages,
      strengths,
      signatureType,
      dominant,
      secondary
    };
  }

  /**
   * Extract key insights from all assessment data
   */
  private extractKeyInsights(userData: UserAnalysisData): any {
    const insights = [];

    // Analyze flow data if available
    if (userData.flowData) {
      const flowScore = userData.flowData.flowScore || 0;
      if (flowScore < 40) {
        insights.push('Flow optimization is a key development opportunity');
      } else if (flowScore > 55) {
        insights.push('Strong natural flow capabilities to build upon');
      }
    }

    // Analyze well-being data
    if (userData.wellBeingData) {
      const currentLevel = userData.wellBeingData.wellBeingLevel || 0;
      const futureLevel = userData.wellBeingData.futureWellBeingLevel || 0;
      if (futureLevel > currentLevel) {
        insights.push(`Clear growth trajectory from ${currentLevel} to ${futureLevel} on well-being ladder`);
      }
    }

    // Analyze reflection patterns
    if (userData.reflections) {
      const reflectionTexts = Object.values(userData.reflections).join(' ').toLowerCase();
      if (reflectionTexts.includes('team') || reflectionTexts.includes('collaboration')) {
        insights.push('Strong collaborative orientation evident in reflections');
      }
      if (reflectionTexts.includes('process') || reflectionTexts.includes('system')) {
        insights.push('Systems thinking approach visible in examples');
      }
    }

    return insights;
  }

  /**
   * Format StarCard data with sophisticated analysis
   */
  private formatStarCardData(starCard: any, analysis: any): string {
    return `
**Current Strengths Distribution:**
- Thinking: ${analysis.percentages.thinking}% (${starCard.thinking} points)
- Feeling: ${analysis.percentages.feeling}% (${starCard.feeling} points) 
- Acting: ${analysis.percentages.acting}% (${starCard.acting} points)
- Planning: ${analysis.percentages.planning}% (${starCard.planning} points)

**Signature Type:** ${analysis.signatureType}
**Dominant Strength:** ${analysis.dominant.name} (${analysis.dominant.percentage}%)
**Supporting Strength:** ${analysis.secondary.name} (${analysis.secondary.percentage}%)

This creates a unique operating pattern where ${analysis.dominant.name.toLowerCase()} provides the primary energy flow, supported by ${analysis.secondary.name.toLowerCase()} capabilities.`;
  }

  /**
   * Format assessment insights
   */
  private formatAssessmentInsights(insights: any[]): string {
    if (insights.length === 0) return 'Standard assessment profile completed.';
    
    return insights.map((insight, index) => `${index + 1}. ${insight}`).join('\n');
  }

  /**
   * Format personal reflections with specific examples
   */
  private formatPersonalReflections(reflections: any): string {
    if (!reflections) return 'No detailed reflections available.';

    let formatted = 'Key reflections and examples provided:\n';
    
    Object.entries(reflections).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 10) {
        formatted += `- ${key}: "${value}"\n`;
      }
    });

    return formatted;
  }

  /**
   * Format future vision data
   */
  private formatFutureVision(futureVision: any): string {
    let formatted = '';
    
    if (futureVision.twentyYearVision) {
      formatted += `**20-Year Vision:** "${futureVision.twentyYearVision}"\n`;
    }
    if (futureVision.tenYearMilestone) {
      formatted += `**10-Year Milestone:** "${futureVision.tenYearMilestone}"\n`;
    }
    if (futureVision.fiveYearFoundation) {
      formatted += `**5-Year Foundation:** "${futureVision.fiveYearFoundation}"\n`;
    }

    return formatted;
  }

  /**
   * Format well-being data
   */
  private formatWellBeingData(wellBeingData: any): string {
    return `Current Well-being Level: ${wellBeingData.wellBeingLevel}/10
Future Target Level: ${wellBeingData.futureWellBeingLevel}/10`;
  }

  /**
   * Get exact percentages for verification
   */
  private getExactPercentages(starCard: any): string {
    const { thinking, feeling, acting, planning } = starCard;
    const total = thinking + feeling + acting + planning;
    
    return `Thinking: ${((thinking / total) * 100).toFixed(1)}%, Feeling: ${((feeling / total) * 100).toFixed(1)}%, Acting: ${((acting / total) * 100).toFixed(1)}%, Planning: ${((planning / total) * 100).toFixed(1)}%`;
  }

  /**
   * Generate prompt for professional profile reports
   */
  generateProfessionalPrompt(userData: UserAnalysisData): string {
    // Similar structure but focused on professional context
    return `# Professional Profile Report Generation

Create a professional-focused report for ${userData.name} using their strengths signature analysis...

[Professional-specific prompting would go here]`;
  }
}

// Create singleton instance
export const enhancedReportPrompting = new EnhancedReportPrompting();

// Default export
export default enhancedReportPrompting;