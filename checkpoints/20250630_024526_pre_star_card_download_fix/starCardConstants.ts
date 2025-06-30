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
  'Analytical', 'Strategic', 'Thoughtful', 'Clever', 'Innovative', 'Investigative',
  'Abstract', 'Analytic', 'Astute', 'Big Picture', 'Curious', 'Focussed', 'Focused',
  'Insightful', 'Logical', 'Rational', 'Reflective', 'Sensible'
].map(a => a.toLowerCase());

const FEELING_ATTRIBUTES = [
  'Empathetic', 'Friendly', 'Supportive', 'Compassionate', 'Intuitive', 'Empathic',
  'Accepting', 'Authentic', 'Calm', 'Caring', 'Connected', 'Considerate', 'Diplomatic',
  'Emotional', 'Generous', 'Gentle', 'Grateful', 'Harmonious', 'Helpful', 'Kind', 
  'Open', 'Sociable', 'Vulnerable', 'Passionate', 'Creative', 'Receptive',
  'Collaborative', 'Encouraging', 'Expressive', 'Inspiring', 'Objective', 'Positive'
].map(a => a.toLowerCase());

const PLANNING_ATTRIBUTES = [
  'Organized', 'Meticulous', 'Reliable', 'Consistent', 'Practical', 'Careful',
  'Controlled', 'Dependable', 'Detailed', 'Detail-Oriented', 'Diligent', 'Methodical',
  'Orderly', 'Precise', 'Punctual', 'Responsible', 'Thorough', 'Trustworthy', 
  'Immersed', 'Industrious', 'Straightforward', 'Tidy', 'Systematic'
].map(a => a.toLowerCase());

const ACTING_ATTRIBUTES = [
  'Energetic', 'Bold', 'Decisive', 'Proactive', 'Persistent', 'Physical', 'Confident',
  'Adaptable', 'Adventurous', 'Adventuresome', 'Assertive', 'Brave', 'Capable', 
  'Challenging', 'Courageous', 'Dynamic', 'Fearless', 'Resolute', 'Resourceful', 
  'Strong', 'Competitive', 'Effortless', 'Engaged', 'Funny', 'Persuasive', 
  'Open-Minded', 'Optimistic', 'Resilient', 'Spontaneous', 'Vigorous'
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