import { transformExportToAssistantInput, isLikelyGibberish } from '../transformExportToAssistantInput';

// Test fixtures
const validExportData = {
  userInfo: {
    userName: 'Testy Two',
    firstName: 'Testy',
    lastName: 'Two'
  },
  assessments: {
    starCard: {
      thinking: 18,
      feeling: 21,
      acting: 34,
      planning: 27
    },
    flowAssessment: {
      flowScore: 46
    },
    flowAttributes: {
      flowScore: 0, // Legacy score, should be ignored
      attributes: [
        { name: 'focus', order: 1 },
        { name: 'challenge', order: 2 },
        { name: 'skills', order: 3 }
      ]
    },
    stepByStepReflection: {
      strength1: 'I am good at problem solving',
      strength2: 'I work well under pressure',
      strength3: 'I communicate effectively',
      strength4: 'I am detail-oriented',
      teamValues: 'Trust and transparency',
      uniqueContribution: 'Strategic thinking and analysis'
    },
    roundingOutReflection: {
      strengths: 'I perform best in quiet environments',
      values: 'Interruptions and unclear requirements', // Actually blockers
      passions: 'Working on meaningful projects',
      growthAreas: 'Public speaking and presentation skills'
    },
    cantrilLadder: {
      wellBeingLevel: 7,
      futureWellBeingLevel: 9,
      currentFactors: 'Good work-life balance',
      futureImprovements: 'Better career growth',
      specificChanges: 'More leadership opportunities',
      quarterlyProgress: 'Complete certification',
      quarterlyActions: 'Take leadership course'
    },
    futureSelfReflection: {
      flowOptimizedLife: 'Leading a high-performing team',
      futureSelfDescription: 'Confident and inspiring leader',
      visualizationNotes: 'Standing in front of team presenting strategy',
      additionalNotes: 'Feeling energized and purposeful',
      imageData: {
        selectedImages: [
          {
            url: 'https://example.com/image1.jpg',
            credit: {
              photographer: 'John Doe',
              source: 'Unsplash'
            }
          },
          {
            url: 'https://example.com/image2.jpg',
            credit: {
              photographer: 'Jane Smith',
              source: 'Pexels'
            }
          }
        ],
        imageMeaning: 'These images represent growth and leadership'
      }
    },
    finalReflection: {
      futureLetterText: 'Dear future me, you have grown into the leader you always wanted to be.'
    }
  }
};

const gibberishExportData = {
  ...validExportData,
  assessments: {
    ...validExportData.assessments,
    stepByStepReflection: {
      strength1: 'xyzabc123!@#$%^&*()',
      strength2: 'qqqqqqqqqqqqqqqqqqqqq',
      strength3: 'a',
      strength4: 'normalresponsehere',
      teamValues: '!!!!!!!!!!!!!!!!!!!!',
      uniqueContribution: 'anothernormalresponse'
    },
    roundingOutReflection: {
      strengths: '########',
      values: 'asdfasdfasdfasdfasdfasdfasdfasdf',
      passions: 'b',
      growthAreas: 'validgrowtharea'
    }
  }
};

const missingDataExportData = {
  userInfo: {},
  assessments: {
    starCard: {},
    flowAssessment: { flowScore: 0 },
    flowAttributes: { flowScore: 0, attributes: [] },
    stepByStepReflection: {},
    roundingOutReflection: {},
    cantrilLadder: {},
    futureSelfReflection: {
      imageData: { selectedImages: [] }
    },
    finalReflection: {}
  }
};

const tiedStrengthsExportData = {
  ...validExportData,
  assessments: {
    ...validExportData.assessments,
    starCard: {
      thinking: 25,
      feeling: 25,
      acting: 25,
      planning: 25
    }
  }
};

describe('transformExportToAssistantInput', () => {
  test('transforms valid export data correctly', () => {
    const result = transformExportToAssistantInput(validExportData);

    expect(result.participant_name).toBe('Testy Two');
    expect(result.report_type).toBe('personal');
    expect(result.imagination_mode).toBe('default');

    // Strengths should be grouped without numbers
    expect(result.strengths.leading).toContain('acting');
    expect(result.strengths.supporting).toContain('planning');
    expect(result.strengths.quieter).toContain('thinking');
    expect(result.strengths.leading).not.toContain('34');

    // Flow score should come from flowAssessment, not flowAttributes
    expect(result.flow.flowScore).toBe(46);
    expect(result.flow.flowAttributes).toEqual(['focus', 'challenge', 'skills']);

    // Reflections should map correctly
    expect(result.reflections.strength1).toBe('I am good at problem solving');
    expect(result.reflections.flowNatural).toBe('I perform best in quiet environments');
    expect(result.reflections.flowBlockers).toBe('Interruptions and unclear requirements');
    expect(result.reflections.flowConditions).toBe('Working on meaningful projects');

    // Images should have combined credit
    expect(result.futureSelf.selectedImages).toHaveLength(2);
    expect(result.futureSelf.selectedImages[0].credit).toBe('John Doe, Unsplash');

    // Final reflection should map correctly
    expect(result.finalReflection.keyInsight).toBe('Dear future me, you have grown into the leader you always wanted to be.');

    // Should not have reflections_invalid flag
    expect(result.reflections_invalid).toBeUndefined();
  });

  test('handles gibberish reflections correctly', () => {
    const result = transformExportToAssistantInput(gibberishExportData);

    expect(result.reflections_invalid).toBe(true);
    // Should still include all reflection fields
    expect(result.reflections.strength1).toBe('xyzabc123!@#$%^&*()');
    expect(result.reflections.strength4).toBe('normalresponsehere');
  });

  test('handles missing data gracefully', () => {
    const result = transformExportToAssistantInput(missingDataExportData);

    expect(result.participant_name).toBe('Participant'); // Default
    expect(result.strengths.leading).toEqual([]);
    expect(result.flow.flowScore).toBe(0);
    expect(result.reflections.strength1).toBe('');
    expect(result.cantrilLadder.wellBeingLevel).toBe(0);
    expect(result.futureSelf.selectedImages).toEqual([]);
  });

  test('handles tied strengths correctly', () => {
    const result = transformExportToAssistantInput(tiedStrengthsExportData);

    // All strengths are tied, should distribute evenly
    const allStrengths = [
      ...result.strengths.leading,
      ...result.strengths.supporting,
      ...result.strengths.quieter
    ];
    expect(allStrengths).toHaveLength(4);
    expect(allStrengths.sort()).toEqual(['acting', 'feeling', 'planning', 'thinking']);
  });

  test('respects options parameters', () => {
    const result = transformExportToAssistantInput(validExportData, {
      report_type: 'sharable',
      imagination_mode: 'low'
    });

    expect(result.report_type).toBe('sharable');
    expect(result.imagination_mode).toBe('low');
  });

  test('prefers flowAssessment score over flowAttributes score', () => {
    const testData = {
      ...validExportData,
      assessments: {
        ...validExportData.assessments,
        flowAssessment: { flowScore: 55 },
        flowAttributes: { ...validExportData.assessments.flowAttributes, flowScore: 22 }
      }
    };

    const result = transformExportToAssistantInput(testData);
    expect(result.flow.flowScore).toBe(55);
  });

  test('validates output schema', () => {
    expect(() => {
      transformExportToAssistantInput(validExportData);
    }).not.toThrow();
  });

  test('throws error for invalid output', () => {
    // Mock validation failure by removing required field
    const invalidData = { ...validExportData };
    delete invalidData.userInfo;

    expect(() => {
      transformExportToAssistantInput(invalidData);
    }).toThrow(/validation failed/i);
  });
});

describe('gibberish detection', () => {

  test('detects short text as gibberish', () => {
    expect(isLikelyGibberish('abc')).toBe(true);
    expect(isLikelyGibberish('')).toBe(true);
  });

  test('detects low alphabetic ratio as gibberish', () => {
    expect(isLikelyGibberish('123!@#$%^&*()')).toBe(true);
    expect(isLikelyGibberish('abc123!@#$%^&*()def')).toBe(true);
  });

  test('detects long non-letter runs as gibberish', () => {
    expect(isLikelyGibberish('hello123456!@#$%^world')).toBe(true);
  });

  test('detects very long average token length as gibberish', () => {
    const longTokens = Array(15).fill('superlongwordthatexceedsfifteencharacters').join(' ');
    expect(isLikelyGibberish(longTokens)).toBe(true);
  });

  test('accepts normal text', () => {
    expect(isLikelyGibberish('This is a normal reflection about my strengths')).toBe(false);
    expect(isLikelyGibberish('I work well in teams and enjoy collaborative projects')).toBe(false);
  });
});

describe('strengths transformation', () => {
  test('handles empty star card', () => {
    const result = transformExportToAssistantInput({
      ...validExportData,
      assessments: {
        ...validExportData.assessments,
        starCard: {}
      }
    });

    expect(result.strengths.leading).toEqual([]);
    expect(result.strengths.supporting).toEqual([]);
    expect(result.strengths.quieter).toEqual([]);
  });

  test('distributes strengths proportionally', () => {
    const testData = {
      ...validExportData,
      assessments: {
        ...validExportData.assessments,
        starCard: {
          strength1: 40,
          strength2: 30,
          strength3: 20,
          strength4: 10,
          strength5: 5,
          strength6: 3
        }
      }
    };

    const result = transformExportToAssistantInput(testData);

    // Should have roughly equal distribution
    expect(result.strengths.leading.length).toBeGreaterThan(0);
    expect(result.strengths.supporting.length).toBeGreaterThan(0);
    expect(result.strengths.quieter.length).toBeGreaterThan(0);

    // Total should equal input
    const total = result.strengths.leading.length +
                  result.strengths.supporting.length +
                  result.strengths.quieter.length;
    expect(total).toBe(6);
  });
});