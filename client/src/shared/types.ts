import { StarCard as StarCardType } from '@shared/schema';

// Navigation section step type
export interface NavigationStep {
  id: string;
  label: string;
  path: string;
  type: string;
}

// Navigation section type
export interface NavigationSection {
  id: string;
  title: string;
  icon: any; // Icon component
  totalSteps: number;
  completedSteps: number;
  steps: NavigationStep[];
}

// Props for content views
export interface ContentViewProps {
  navigate: (to: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: StarCardType;
}