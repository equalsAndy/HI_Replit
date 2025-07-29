import { 
  HolisticReportData, 
  ParticipantInfo, 
  StrengthsProfile, 
  FlowAnalysis, 
  VisionTimeline, 
  GrowthPathway, 
  PersonalReflections,
  ReportType,
  MockDataService,
  FlowAttribute
} from '../../shared/holistic-report-types';

/**
 * Mock data service for generating realistic holistic report content
 * This service provides varied, realistic mock data while the system is in development
 */
export class MockReportDataService implements MockDataService {
  
  private strengthInsightTemplates = [
    "Your analytical thinking strength enables you to break down complex problems systematically",
    "You demonstrate strong execution skills when implementing solutions",
    "Your emotional intelligence helps you navigate team dynamics effectively",
    "Your strategic planning abilities help you see the bigger picture",
    "You excel at connecting ideas and seeing patterns others might miss",
    "Your decisive nature helps teams move forward when facing uncertainty",
    "You bring empathy and understanding to challenging situations",
    "Your organizational skills create structure that benefits the entire team"
  ];

  private flowInsightTemplates = [
    "You achieve flow state most easily when working on complex analytical challenges",
    "Collaborative environments energize you and enhance your performance",
    "You thrive when given autonomy to approach problems creatively",
    "Structured workflows help you maintain focus and momentum",
    "You perform best when balancing independent work with team collaboration",
    "Clear goals and feedback loops are essential for your optimal performance",
    "You excel in environments that value both innovation and execution",
    "Variety in your work keeps you engaged and motivated"
  ];

  private developmentActionTemplates = [
    "Practice active listening in team meetings to strengthen collaboration",
    "Seek out cross-functional projects to broaden your perspective",
    "Set aside dedicated time for strategic thinking and planning",
    "Develop your coaching skills to help others grow",
    "Create systems to track and celebrate small wins",
    "Build stronger relationships across different departments",
    "Improve your presentation skills to share insights more effectively",
    "Learn new tools and technologies to enhance your capabilities"
  ];

  private workStyleTemplates = [
    "Prefers structured approaches with clear timelines",
    "Thrives in collaborative, team-oriented environments",
    "Works best with autonomy and minimal micromanagement",
    "Enjoys tackling complex, challenging problems",
    "Values continuous learning and skill development",
    "Performs optimally with regular feedback and recognition",
    "Prefers variety and diverse types of work",
    "Excels when given leadership opportunities"
  ];

  private obstacleTemplates = [
    "Perfectionism sometimes slows down decision-making",
    "Difficulty saying no to additional commitments",
    "Tendency to take on too much responsibility",
    "Need for more confidence in presenting ideas",
    "Balancing multiple priorities and deadlines",
    "Overcoming impostor syndrome in new situations",
    "Managing stress during high-pressure periods",
    "Building stronger boundaries between work and personal life"
  ];

  private wellBeingFactors = [
    "Regular exercise and physical activity",
    "Quality time with family and friends",
    "Pursuing creative hobbies and interests",
    "Maintaining work-life balance",
    "Continuous learning and personal growth",
    "Contributing to meaningful causes",
    "Building strong professional relationships",
    "Taking breaks and practicing mindfulness"
  ];

  private challengeTemplates = [
    "Learning to delegate more effectively",
    "Managing multiple competing priorities",
    "Building confidence in leadership roles",
    "Improving work-life integration",
    "Developing resilience during setbacks",
    "Communicating ideas more persuasively",
    "Building stronger professional networks",
    "Managing perfectionist tendencies"
  ];

  private reflectionQuotes = [
    "I realize I'm most energized when working on projects that directly impact others",
    "My biggest growth opportunity is learning to trust my instincts more",
    "I've discovered that my analytical nature is actually a leadership strength",
    "Building relationships with colleagues has become more important than I initially thought",
    "I'm learning that vulnerability in leadership actually builds stronger teams",
    "My best work happens when I can balance independent thinking with collaborative execution",
    "I've realized that my empathy is just as valuable as my technical skills",
    "Taking time for reflection has helped me become more intentional about my career choices"
  ];

  async generateMockReportData(userId: number, reportType: ReportType): Promise<HolisticReportData> {
    // In a real implementation, this would fetch actual user data
    // For now, we'll generate varied mock data based on user ID
    const seed = userId; // Use userId to create consistent but varied data
    
    const participant = await this.generateMockParticipant(seed);
    const strengths = this.generateMockStrengths(seed);
    const flow = this.generateMockFlow(seed);
    const vision = this.generateMockVision(seed);
    const growth = this.generateMockGrowth(seed);
    
    const reportData: HolisticReportData = {
      participant,
      strengths,
      flow,
      vision,
      growth,
      reportType,
      generatedAt: new Date(),
      workshopVersion: "AST v2.1.0"
    };

    // Add personal reflections only for personal reports
    if (reportType === 'personal') {
      reportData.personalReflections = this.generateMockPersonalReflections(seed);
    }

    return reportData;
  }

  private async generateMockParticipant(seed: number): Promise<ParticipantInfo> {
    const names = ["Alex Johnson", "Taylor Smith", "Jordan Brown", "Casey Wilson", "Riley Davis"];
    const titles = ["Senior Developer", "Product Manager", "Team Lead", "UX Designer", "Data Analyst"];
    const orgs = ["TechCorp Inc.", "Innovation Labs", "Global Solutions", "Creative Studios", "Future Systems"];
    
    return {
      name: names[seed % names.length],
      title: titles[seed % titles.length],
      organization: orgs[seed % orgs.length],
      completedAt: new Date()
    };
  }

  generateMockStrengths(seed: number = 1): StrengthsProfile {
    // Generate varied but realistic strength distributions
    const base = [25, 25, 25, 25];
    const variations = [
      [35, 30, 20, 15], // Thinking dominant
      [20, 35, 25, 20], // Acting dominant  
      [25, 20, 35, 20], // Feeling dominant
      [20, 25, 20, 35], // Planning dominant
      [30, 25, 25, 20], // Balanced with thinking edge
    ];
    
    const profile = variations[seed % variations.length];
    const strengthNames = ["Strategic Thinking", "Execution Excellence", "Relationship Building", "Systems Planning"];
    
    return {
      thinking: profile[0],
      acting: profile[1], 
      feeling: profile[2],
      planning: profile[3],
      topStrengths: this.selectRandomItems(strengthNames, 2, seed),
      strengthInsights: this.selectRandomItems(this.strengthInsightTemplates, 3, seed)
    };
  }

  generateMockFlow(): FlowAnalysis {
    const attributeOptions = [
      { name: "Deep Focus", description: "Ability to concentrate deeply", category: "cognitive" },
      { name: "Creative Problem-Solving", description: "Innovative approach to challenges", category: "creative" },
      { name: "Team Collaboration", description: "Effective teamwork and communication", category: "social" },
      { name: "Analytical Thinking", description: "Systematic analysis and reasoning", category: "cognitive" },
      { name: "Adaptive Learning", description: "Quick skill acquisition", category: "learning" },
      { name: "Leadership Presence", description: "Natural leadership qualities", category: "social" }
    ];

    return {
      attributes: this.selectRandomItems(attributeOptions, 4),
      flowInsights: this.selectRandomItems(this.flowInsightTemplates, 3),
      preferredWorkStyle: this.selectRandomItems(this.workStyleTemplates, 3)
    };
  }

  generateMockVision(): VisionTimeline {
    return {
      currentState: "Currently focused on developing technical leadership skills while maintaining hands-on involvement in key projects",
      futureVision: "Leading a high-performing team that delivers innovative solutions while fostering a culture of continuous learning and collaboration",
      obstacles: this.selectRandomItems(this.obstacleTemplates, 3),
      strengths: ["Strong analytical thinking", "Natural mentor", "Excellent communication skills"],
      actionSteps: this.selectRandomItems(this.developmentActionTemplates, 4)
    };
  }

  generateMockGrowth(): GrowthPathway {
    return {
      developmentAreas: ["Leadership Communication", "Strategic Planning", "Team Development"],
      recommendedActions: this.selectRandomItems(this.developmentActionTemplates, 5),
      teamCollaborationTips: [
        "Schedule regular one-on-ones with team members",
        "Create opportunities for cross-functional collaboration", 
        "Practice active listening in all team interactions",
        "Celebrate team wins and individual contributions"
      ]
    };
  }

  generateMockPersonalReflections(seed: number = 1): PersonalReflections {
    return {
      challenges: this.selectRandomItems(this.challengeTemplates, 3, seed),
      wellBeingFactors: this.selectRandomItems(this.wellBeingFactors, 4, seed),
      personalGrowthAreas: ["Emotional resilience", "Work-life integration", "Authentic leadership"],
      privateInsights: [
        "Learning to embrace vulnerability as a strength",
        "Recognizing the importance of self-care in sustainable performance",
        "Understanding that perfectionism can hinder progress"
      ],
      reflectionQuotes: this.selectRandomItems(this.reflectionQuotes, 2, seed)
    };
  }

  private selectRandomItems<T>(items: T[], count: number, seed: number = 1): T[] {
    // Simple seeded selection for consistent results
    const selected: T[] = [];
    for (let i = 0; i < count && i < items.length; i++) {
      const index = (seed + i * 7) % items.length;
      if (!selected.includes(items[index])) {
        selected.push(items[index]);
      }
    }
    return selected;
  }
}

export const mockReportDataService = new MockReportDataService();