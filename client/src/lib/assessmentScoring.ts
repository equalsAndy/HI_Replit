import { QuadrantData } from '@shared/schema';

// Define a type for the ranked option
export type RankedOption = {
  optionId: string;
  rank: number; // 1 = most like me, 4 = least like me
};

/**
 * Calculates scores for the four strength quadrants based on user's rankings
 * 
 * Scoring methodology:
 * - First choice (most like me): 3 points
 * - Second choice: 2 points
 * - Third choice: 1 point
 * - Last choice (least like me): 0 points
 * 
 * @param answers Array of question answers with rankings
 * @returns Object with scores for each quadrant and the apex strength
 */
export function calculateQuadrantScores(
  answers: { questionId: number; rankings: RankedOption[] }[],
  categoryMapping: Record<string, 'thinking' | 'feeling' | 'acting' | 'planning'>
): QuadrantData {
  // Initialize scores
  const scores = {
    thinking: 0,
    feeling: 0,
    acting: 0,
    planning: 0
  };
  
  // Process each answer
  answers.forEach(answer => {
    // Sort rankings by rank (1 = most like me, 4 = least like me)
    const sortedRankings = [...answer.rankings].sort((a, b) => a.rank - b.rank);
    
    // Assign points based on rank
    sortedRankings.forEach((ranking, index) => {
      const points = 3 - index; // 3 points for rank 1, 2 for rank 2, 1 for rank 3, 0 for rank 4
      if (points > 0) { // Only add points for top 3 choices
        const optionId = ranking.optionId;
        const category = categoryMapping[optionId];
        
        if (category) {
          scores[category] += points;
        }
      }
    });
  });
  
  // Calculate total points
  const totalPoints = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  // Convert to percentages and round to nearest integer
  const percentages = {
    thinking: Math.round((scores.thinking / totalPoints) * 100),
    feeling: Math.round((scores.feeling / totalPoints) * 100),
    acting: Math.round((scores.acting / totalPoints) * 100),
    planning: Math.round((scores.planning / totalPoints) * 100)
  };
  
  // Normalize percentages to ensure they sum to 100
  const rawSum = percentages.thinking + percentages.feeling + percentages.acting + percentages.planning;
  if (rawSum !== 100) {
    const adjustmentFactor = 100 / rawSum;
    percentages.thinking = Math.round(percentages.thinking * adjustmentFactor);
    percentages.feeling = Math.round(percentages.feeling * adjustmentFactor);
    percentages.acting = Math.round(percentages.acting * adjustmentFactor);
    percentages.planning = Math.round(percentages.planning * adjustmentFactor);
    
    // Ensure they sum to exactly 100 by adjusting the largest percentage if needed
    const adjustedSum = percentages.thinking + percentages.feeling + percentages.acting + percentages.planning;
    const diff = 100 - adjustedSum;
    if (diff !== 0) {
      // Find the largest percentage and adjust it
      const largestCategory = Object.entries(percentages).reduce(
        (max, [category, value]) => value > max.value ? { category, value } : max,
        { category: '', value: 0 }
      );
      percentages[largestCategory.category as keyof typeof percentages] += diff;
    }
  }
  
  // Determine the apex strength (highest percentage)
  let apexStrength = 'thinking';
  let highestPercentage = percentages.thinking;
  
  if (percentages.feeling > highestPercentage) {
    apexStrength = 'feeling';
    highestPercentage = percentages.feeling;
  }
  
  if (percentages.acting > highestPercentage) {
    apexStrength = 'acting';
    highestPercentage = percentages.acting;
  }
  
  if (percentages.planning > highestPercentage) {
    apexStrength = 'planning';
    highestPercentage = percentages.planning;
  }
  
  return {
    thinking: percentages.thinking,
    feeling: percentages.feeling,
    acting: percentages.acting,
    planning: percentages.planning
  };
}

/**
 * Determines the placement of strengths on the Star Card based on their scores
 * Highest score goes upper right, then clockwise: lower right, lower left, upper left
 * 
 * @param quadrantData Object with scores for each quadrant and the apex strength
 * @returns Object mapping each position to the corresponding strength
 */
export function determineStarCardPlacement(quadrantData: QuadrantData): {
  upperRight: string;
  lowerRight: string;
  lowerLeft: string;
  upperLeft: string;
} {
  // Create an array of [category, score] pairs
  const scores = [
    ['thinking', quadrantData.thinking],
    ['feeling', quadrantData.feeling],
    ['acting', quadrantData.acting],
    ['planning', quadrantData.planning]
  ];
  
  // Sort in descending order by score
  scores.sort((a, b) => (b[1] as number) - (a[1] as number));
  
  // Map each position to the appropriate strength
  return {
    upperRight: scores[0][0] as string,
    lowerRight: scores[1][0] as string,
    lowerLeft: scores[2][0] as string,
    upperLeft: scores[3][0] as string
  };
}