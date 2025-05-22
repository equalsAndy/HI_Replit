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
  type: 'Learning' | 'Assessment' | 'Reflection' | 'Resource' | 'Workshop';
  contentKey?: string;
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

// Role types for user profiles
export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}

// User type
export interface User {
  id: number;
  name: string;
  title?: string;
  organization?: string;
  progress?: number;
  avatarUrl?: string;
  // New fields for enhanced profiles - will be handled in UI until DB is updated
  role?: UserRole;
  email?: string;
  bio?: string;
  phone?: string;
  facilitatorId?: number; // ID of the facilitator assigned to this user
}

// Base props for content view components
export interface ContentViewProps {
  navigate: (to: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: StarCard;
  user?: User;
  isImaginalAgility?: boolean;
  flowAttributesData?: {
    id?: number;
    userId?: number;
    flowScore?: number;
    attributes?: Array<{ name: string; score: number; }>;
  };
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

// Flow Attributes response from API
export interface FlowAttributesResponse {
  id?: number;
  userId?: number;
  attributes?: Array<{ name: string; score: number; }>;
  flowScore?: number;
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