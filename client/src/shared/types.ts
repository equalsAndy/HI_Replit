import { LucideIcon } from "lucide-react";

// Type for navigation sections
export interface NavigationSection {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  totalSteps: number;
  completedSteps: number;
  steps: NavigationStep[];
}

// Type for navigation steps
export interface NavigationStep {
  id: string;
  label: string;
  path: string;
  type: 'Learning' | 'Assessment' | 'Reflection';
  required?: boolean;
}

// Star Card type
export interface StarCard {
  id?: number;
  userId?: number;
  thinking: number | null;
  feeling: number | null;
  acting: number | null;
  planning: number | null;
  imageUrl: string | null;
  createdAt?: string | null;
  state?: string | null;
}

// Base props for content view components
export interface ContentViewProps {
  navigate: (to: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: StarCard;
}

// Flow Assessment related types
export interface FlowAttribute {
  text: string;
  score: number;
  category: string;
}

export interface FlowAssessmentData {
  id?: number;
  userId?: number;
  attributes: FlowAttribute[];
  flowScore?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Reflection data types
export interface ReflectionData {
  id?: number;
  userId?: number;
  wellbeingLevel?: number | null;
  wellbeingFactors?: string | null;
  oneYearVision?: string | null;
  challenges?: string | null;
  strengths?: string | null;
  resourcesNeeded?: string | null;
  actionSteps?: string | null;
  selfCompassion?: string | null;
  measureSuccess?: string | null;
  supportNetwork?: string | null;
  futureLetterText?: string | null;
  showInstructions?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}