/**
 * Workshop Responses Service
 * ===========================
 * Extracts and formats all workshop questions and answers for user review.
 * Excludes strength assessment questions, but includes strength percentages and results.
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface WorkshopResponsesData {
  participant: {
    id: number;
    name: string;
    email: string;
  };
  strengths: {
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
    ranked: string[];
    shape: {
      label: string;
      roles: {
        dominant: string[];
        supporting: string[];
        quieter: string[];
      };
    };
  };
  strengthReflections: Array<{
    question: string;
    answer: string;
  }>;
  flowAssessment: {
    totalScore: number;
    interpretation: string;
  };
  flowAttributes: Array<{
    name: string;
    order: number;
  }>;
  flowReflections: Array<{
    question: string;
    answer: string;
  }>;
  wellbeing: {
    currentLevel: number;
    futureLevel: number;
    reflections: Array<{
      question: string;
      answer: string;
    }>;
  };
  futureSelf: {
    images: any[];
    reflections: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalReflection: {
    question: string;
    answer: string;
  };
}

class WorkshopResponsesService {

  /**
   * Get all workshop responses for a user
   */
  async getWorkshopResponses(userId: string): Promise<WorkshopResponsesData> {
    console.log(`📋 Fetching workshop responses for user ${userId}`);

    // Get participant info
    const participantResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (!participantResult.rows[0]) {
      throw new Error('User not found');
    }

    const participant = participantResult.rows[0];

    // Get all assessments
    const assessmentsResult = await pool.query(
      `SELECT assessment_type, results, created_at
       FROM user_assessments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Organize assessments by type (get most recent of each)
    const assessmentsByType = new Map();
    for (const row of assessmentsResult.rows) {
      if (!assessmentsByType.has(row.assessment_type)) {
        assessmentsByType.set(row.assessment_type, JSON.parse(row.results));
      }
    }

    // Build response data
    const data: WorkshopResponsesData = {
      participant: {
        id: participant.id,
        name: participant.name || 'Participant',
        email: participant.email || ''
      },
      strengths: await this.buildStrengthsData(assessmentsByType),
      strengthReflections: this.buildStrengthReflections(assessmentsByType),
      flowAssessment: this.buildFlowAssessment(assessmentsByType),
      flowAttributes: this.buildFlowAttributes(assessmentsByType),
      flowReflections: this.buildFlowReflections(assessmentsByType),
      wellbeing: this.buildWellbeingData(assessmentsByType),
      futureSelf: this.buildFutureSelfData(assessmentsByType),
      finalReflection: this.buildFinalReflection(assessmentsByType)
    };

    console.log(`✅ Workshop responses compiled for ${participant.name}`);
    return data;
  }

  /**
   * Build strengths data with percentages and shape
   */
  private async buildStrengthsData(assessments: Map<string, any>): Promise<any> {
    const starCardData = assessments.get('starCard');

    if (!starCardData) {
      throw new Error('No strength assessment found');
    }

    const { thinking, acting, feeling, planning } = starCardData;

    // Calculate ranked order
    const strengthsArray = [
      { name: 'thinking', value: thinking },
      { name: 'acting', value: acting },
      { name: 'feeling', value: feeling },
      { name: 'planning', value: planning }
    ];
    strengthsArray.sort((a, b) => b.value - a.value);
    const ranked = strengthsArray.map(s => s.name);

    // Calculate shape
    const margin = 2;
    const highest = strengthsArray[0].value;
    const lowest = strengthsArray[3].value;
    const spread = highest - lowest;

    // Determine label first
    let label = 'Balanced';
    let dominant: string[] = [];
    let quieter: string[] = [];
    let supporting: string[] = [];

    if (spread <= margin * 2) {
      // All strengths within 4% - truly balanced
      label = 'Balanced';
      supporting = strengthsArray.map(v => v.name);
    } else {
      // Not balanced - identify dominant and quieter
      dominant = strengthsArray.filter(v => v.value >= highest - margin).map(v => v.name);
      quieter = strengthsArray.filter(v => v.value <= lowest + margin).map(v => v.name);
      supporting = strengthsArray.filter(v => !dominant.includes(v.name) && !quieter.includes(v.name)).map(v => v.name);

      // Determine label based on roles
      if (dominant.length === 1 && quieter.length === 1) {
        label = 'One High';
      } else if (dominant.length === 2) {
        label = 'Two Dominant';
      } else if (quieter.length === 1) {
        label = 'One Quiet';
      }
    }

    return {
      thinking,
      acting,
      feeling,
      planning,
      ranked,
      shape: {
        label,
        roles: { dominant, supporting, quieter }
      }
    };
  }

  /**
   * Build strength reflections (7 questions)
   */
  private buildStrengthReflections(assessments: Map<string, any>): Array<any> {
    const data = assessments.get('stepByStepReflection') || {};

    return [
      {
        question: 'How and when do you use your thinking strength?',
        answer: data.strength1 || 'No response provided'
      },
      {
        question: 'How and when do you use your acting strength?',
        answer: data.strength2 || 'No response provided'
      },
      {
        question: 'How and when do you use your feeling strength?',
        answer: data.strength3 || 'No response provided'
      },
      {
        question: 'How and when do you use your planning strength?',
        answer: data.strength4 || 'No response provided'
      },
      {
        question: 'Your Apex Strength is Imagination - How do you experience it?',
        answer: data.imaginationReflection || 'No response provided'
      },
      {
        question: 'What You Value Most in Team Environments',
        answer: data.teamValues || 'No response provided'
      },
      {
        question: 'Your Unique Contribution',
        answer: data.uniqueContribution || 'No response provided'
      }
    ];
  }

  /**
   * Build flow assessment score and interpretation
   */
  private buildFlowAssessment(assessments: Map<string, any>): any {
    const flowData = assessments.get('flowAssessment') || {};
    const score = flowData.flowScore || 0;

    let interpretation = 'Flow Aware';
    if (score >= 50) interpretation = 'Flow Fluent';
    else if (score >= 39) interpretation = 'Flow Aware';
    else if (score >= 26) interpretation = 'Flow Blocked';
    else interpretation = 'Flow Distant';

    return {
      totalScore: score,
      interpretation
    };
  }

  /**
   * Build flow attributes (selected words)
   */
  private buildFlowAttributes(assessments: Map<string, any>): Array<any> {
    const attributesData = assessments.get('flowAttributes') || {};
    return attributesData.attributes || [];
  }

  /**
   * Build flow reflections (4 questions)
   */
  private buildFlowReflections(assessments: Map<string, any>): Array<any> {
    const data = assessments.get('roundingOutReflection') || {};

    return [
      {
        question: 'When does flow happen most naturally for you?',
        answer: data.strengths || 'No response provided'
      },
      {
        question: 'What typically blocks or interrupts your flow state?',
        answer: data.values || 'No response provided'
      },
      {
        question: 'What conditions help you get into flow more easily?',
        answer: data.passions || 'No response provided'
      },
      {
        question: 'How could you create more opportunities for flow?',
        answer: data.growthAreas || 'No response provided'
      }
    ];
  }

  /**
   * Build wellbeing data (ladder + reflections)
   */
  private buildWellbeingData(assessments: Map<string, any>): any {
    const ladderData = assessments.get('cantrilLadder') || {};
    const reflectionData = assessments.get('cantrilLadderReflection') || {};

    // Merge both data sources
    const merged = { ...ladderData, ...reflectionData };

    return {
      currentLevel: merged.currentLevel || merged.wellBeingLevel || 5,
      futureLevel: merged.futureLevel || merged.futureWellBeingLevel || 7,
      reflections: [
        {
          question: 'What factors shape your current well-being rating?',
          answer: merged.currentFactors || 'No response provided'
        },
        {
          question: 'What improvements do you envision in one year?',
          answer: merged.futureImprovements || 'No response provided'
        },
        {
          question: 'What will be noticeably different in your experience?',
          answer: merged.specificChanges || 'No response provided'
        },
        {
          question: 'What progress would you expect in 3 months?',
          answer: merged.quarterlyProgress || 'No response provided'
        },
        {
          question: 'What actions will you commit to this quarter?',
          answer: merged.quarterlyActions || 'No response provided'
        }
      ]
    };
  }

  /**
   * Build future self data (images + reflections)
   */
  private buildFutureSelfData(assessments: Map<string, any>): any {
    const data = assessments.get('futureSelfReflection') || {};

    return {
      // Support both imageData.selectedImages (new) and direct images array (legacy)
      images: data.imageData?.selectedImages || data.images || [],
      reflections: [
        {
          question: 'What does your selected image mean to you?',
          answer: data.imageData?.imageMeaning || data.imageMeaning || 'No response provided'
        },
        {
          question: 'Describe Your Future Self',
          answer: data.flowOptimizedLife || 'No response provided'
        }
      ]
    };
  }

  /**
   * Build final reflection
   */
  private buildFinalReflection(assessments: Map<string, any>): any {
    const data = assessments.get('finalReflection') || {};

    return {
      question: "What's the one insight you want to carry forward?",
      answer: data.futureLetterText || 'No response provided'
    };
  }
}

export const workshopResponsesService = new WorkshopResponsesService();
