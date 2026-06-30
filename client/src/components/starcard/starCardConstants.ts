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

// Attribute categorization — kept in sync with FlowStarCardView.tsx and FindYourFlowContent.tsx
const THINKING_ATTRIBUTES = [
  'Abstract', 'Analytic', 'Analytical', 'Astute',
  'Big Picture', 'Big-picture', 'Clever', 'Curious',
  'Focussed', 'Focused', 'Innovative', 'Insightful',
  'Investigative', 'Logical', 'Precise', 'Rational',
  'Reflective', 'Sensible', 'Strategic', 'Thoughtful',
].map(a => a.toLowerCase());

const FEELING_ATTRIBUTES = [
  'Accepting', 'Authentic', 'Calm', 'Caring',
  'Collaborative', 'Compassionate', 'Connected', 'Considerate',
  'Creative', 'Diplomatic', 'Emotional', 'Empathetic', 'Empathic',
  'Encouraging', 'Expressive', 'Friendly', 'Generous', 'Gentle',
  'Grateful', 'Harmonious', 'Helpful', 'Inclusive', 'Inspiring',
  'Intuitive', 'Kind', 'Objective', 'Open', 'Open-minded',
  'Passionate', 'Positive', 'Receptive', 'Sociable', 'Supportive', 'Vulnerable',
].map(a => a.toLowerCase());

const PLANNING_ATTRIBUTES = [
  'Attentive', 'Careful', 'Conscientious', 'Consistent', 'Controlled',
  'Dependable', 'Detail-Oriented', 'Detail-oriented', 'Detailed',
  'Diligent', 'Immersed', 'Industrious', 'Methodical', 'Meticulous',
  'Orderly', 'Organized', 'Practical', 'Punctual', 'Reliable',
  'Responsible', 'Straightforward', 'Structured', 'Systematic',
  'Thorough', 'Tidy', 'Trustworthy',
].map(a => a.toLowerCase());

const ACTING_ATTRIBUTES = [
  'Adaptable', 'Adventuresome', 'Adventurous', 'Assertive',
  'Bold', 'Brave', 'Capable', 'Challenging', 'Competitive',
  'Confident', 'Courageous', 'Decisive', 'Dynamic', 'Effortless',
  'Energetic', 'Engaged', 'Fearless', 'Funny', 'Motivating',
  'Open-Minded', 'Optimistic', 'Persistent', 'Persuasive',
  'Physical', 'Proactive', 'Resilient', 'Resolute', 'Resourceful',
  'Spontaneous', 'Strong', 'Vigorous',
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