// Card dimensions - standardize all cards to same size
export const CARD_WIDTH = '440px';
export const CARD_HEIGHT = '610px';

// Quadrant colors - official AST workshop colors
export const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red  
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

export const DEFAULT_COLOR = 'rgb(229, 231, 235)'; // Gray for empty state

// Consolidated attribute categorization (merge all existing versions)
const THINKING_ATTRIBUTES = [
  'Abstract', 'Analytical', 'Astute', 'Big-picture', 'Curious',
  'Focussed', 'Insightful', 'Logical', 'Precise', 'Rational',
  'Reflective', 'Sensible', 'Strategic', 'Thoughtful'
].map(a => a.toLowerCase());

const FEELING_ATTRIBUTES = [
  'Collaborative', 'Compassionate', 'Creative', 'Encouraging', 'Empathic',
  'Engaged', 'Expressive', 'Inclusive', 'Intuitive', 'Open-minded',
  'Positive', 'Receptive', 'Resilient', 'Supportive'
].map(a => a.toLowerCase());

const PLANNING_ATTRIBUTES = [
  'Attentive', 'Conscientious', 'Detail-oriented', 'Diligent', 'Methodical',
  'Organized', 'Practical', 'Reliable', 'Responsible', 'Straightforward',
  'Structured', 'Systematic', 'Thorough', 'Tidy'
].map(a => a.toLowerCase());

const ACTING_ATTRIBUTES = [
  'Adventurous', 'Competitive', 'Dynamic', 'Effortless', 'Energetic',
  'Funny', 'Inspiring', 'Motivating', 'Optimistic', 'Passionate',
  'Persuasive', 'Spontaneous', 'Vigorous'
].map(a => a.toLowerCase());

// Single source of truth for attribute colors
export const getAttributeColor = (text: string): string => {
  if (!text) return 'rgb(156, 163, 175)'; // Default gray

  const lowerText = text.toLowerCase().trim();

  if (THINKING_ATTRIBUTES.includes(lowerText)) return QUADRANT_COLORS.thinking;
  if (FEELING_ATTRIBUTES.includes(lowerText)) return QUADRANT_COLORS.feeling;
  if (PLANNING_ATTRIBUTES.includes(lowerText)) return QUADRANT_COLORS.planning;
  if (ACTING_ATTRIBUTES.includes(lowerText)) return QUADRANT_COLORS.acting;

  return 'rgb(156, 163, 175)'; // Default gray for unrecognized
};