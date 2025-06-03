export type UserRole = 'admin' | 'facilitator' | 'participant';
export type WorkshopType = 'star_teams' | 'imaginal_agility';
export type VideoType = 'intro' | 'guide' | 'instruction' | 'activity' | 'reflection' | 'conclusion';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string | null;
  jobTitle?: string | null;
  profilePicture?: string | null;
  cohortId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  id: number;
  inviteCode: string;
  name?: string | null;
  email: string;
  role: UserRole;
  createdBy: number;
  cohortId?: number | null;
  createdAt: Date;
  expiresAt?: Date | null;
  usedAt?: Date | null;
  usedBy?: number | null;
}

export interface InviteVerificationResult {
  valid: boolean;
  error?: string;
  invite?: {
    id: number;
    inviteCode: string;
    name?: string;
    email: string;
    role: string;
    cohortId?: number;
  };
}

// Navigation and progression types
export interface NavigationStep {
  id: string;
  label: string;
  path: string;
  type: 'Learning' | 'Assessment' | 'Reflection' | 'Workshop';
  contentKey?: string;
  icon?: any;
  autoPlay?: boolean;
  minWatchPercent?: number;
  isModal?: boolean;
  requireAllAnswers?: boolean;
  requireAllInputs?: boolean;
  requireExactWords?: number;
  hasSliders?: boolean;
  downloadOnly?: boolean;
  estimatedTime?: number;
  locked?: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  path: string;
  icon: any;
  totalSteps: number;
  completedSteps: number;
  locked?: boolean;
  steps: NavigationStep[];
}

export interface ProgressionRules {
  sequentialUnlock: boolean;
  completionCriteria: {
    [stepId: string]: {
      type: 'video' | 'assessment' | 'reflection' | 'activity';
      requirements: {
        minWatchPercent?: number;
        allQuestionsAnswered?: boolean;
        exactWordCount?: number;
        slidersCompleted?: boolean;
        dataSubmitted?: boolean;
      };
    };
  };
}

// Content view component props interface
export interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
  setIsAssessmentModalOpen?: (open: boolean) => void;
}

// Star Card types
export interface StarCard {
  id?: number | null;
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  pending?: boolean;
  createdAt: string;
  imageUrl?: string | null;
  state?: string;
}

// Flow Attributes types
export interface FlowAttributesResponse {
  success: boolean;
  attributes: string[];
  flowScore: number;
  isEmpty?: boolean;
}

// Assessment View Props interface
export interface AssessmentViewProps extends ContentViewProps {
  setIsAssessmentModalOpen: (open: boolean) => void;
}

// Extended session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    userRole: UserRole;
  }
}