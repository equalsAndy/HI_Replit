// Video management constants
export interface StepDefinition {
  id: string;
  name: string;
  workshop: string;
  section?: string;
}

export interface WorkshopType {
  value: string;
  label: string;
  color: string;
}

// AST Step definitions with proper names
export const AST_STEPS: StepDefinition[] = [
  { id: '1-1', name: 'Self Awareness Gap', workshop: 'AST', section: 'foundation' },
  { id: '1-2', name: 'Self Awareness Opportunity', workshop: 'AST', section: 'foundation' },
  { id: '1-3', name: 'How to Use This Course', workshop: 'AST', section: 'foundation' },
  { id: '2-1', name: 'Star Strengths Assessment', workshop: 'AST', section: 'discovery' },
  { id: '2-2', name: 'Flow Patterns', workshop: 'AST', section: 'discovery' },
  { id: '2-3', name: 'Review Your Star Card', workshop: 'AST', section: 'discovery' },
  { id: '3-1', name: 'Well-Being Ladder', workshop: 'AST', section: 'application' },
  { id: '5-1', name: 'Future Self', workshop: 'AST', section: 'future' },
  { id: '6-1', name: 'Teamwork', workshop: 'AST', section: 'integration' },
  { id: '7-1', name: 'HI Background', workshop: 'AST', section: 'background' },
];

// IA Step definitions with proper names  
export const IA_STEPS: StepDefinition[] = [
  { id: 'ia-1-1', name: 'Introduction', workshop: 'IA', section: 'foundation' },
  { id: 'ia-1-2', name: 'Setup', workshop: 'IA', section: 'foundation' },
  { id: 'ia-2-1', name: 'Sensing', workshop: 'IA', section: 'practice' },
  { id: 'ia-2-2', name: 'Presencing', workshop: 'IA', section: 'practice' },
  { id: 'ia-2-3', name: 'Envisioning', workshop: 'IA', section: 'practice' },
  { id: 'ia-2-4', name: 'Enacting', workshop: 'IA', section: 'practice' },
  { id: 'ia-3-1', name: 'Integration', workshop: 'IA', section: 'integration' },
  { id: 'ia-3-2', name: 'Next Steps', workshop: 'IA', section: 'integration' },
];

// All steps combined
export const ALL_STEPS: StepDefinition[] = [...AST_STEPS, ...IA_STEPS];

// Workshop type definitions
export const WORKSHOP_TYPES: WorkshopType[] = [
  { value: 'allstarteams', label: 'AST - All Star Teams', color: 'blue' },
  { value: 'imaginal-agility', label: 'IA - Imaginal Agility', color: 'purple' },
  { value: 'general', label: 'General', color: 'gray' },
];