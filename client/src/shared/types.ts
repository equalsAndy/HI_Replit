// Enhanced User Profile Types

export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}

export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  /** @deprecated Use firstName + lastName instead */
  name?: string;
  title?: string;
  organization?: string;
  avatarUrl?: string;
  progress?: number;
  // Enhanced profile fields (UI only)
  bio?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  facilitatorId?: number;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  title?: string;
  organization?: string;
  bio?: string;
  email?: string;
  phone?: string;
}

export interface Cohort {
  id: number;
  name: string;
  description?: string;
  facilitatorId?: number;
  facilitatorName?: string;
  memberCount?: number;
  cohortType?: 'leadership' | 'team' | 'standard';
  parentCohortId?: number;
  status?: 'active' | 'upcoming' | 'completed';
  startDate?: string;
  endDate?: string;
  astAccess?: boolean;
  iaAccess?: boolean;
  pmAccess?: boolean;
  organizationId?: string;
  participants?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Workshop {
  id: number;
  name: string;
  description?: string;
  date: string;
  cohortId: number;
  facilitatorId: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export interface ContentViewProps {
  currentContent: string;
  navigate?: any;
  markStepCompleted?: (stepId: string, options?: { autoAdvance?: boolean }) => void;
  setCurrentContent?: (content: string) => void;
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
  setIsAssessmentModalOpen?: (open: boolean) => void;
  isImaginalAgility?: boolean;
}