// Enhanced User Profile Types

export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}

export interface User {
  id: number;
  username: string;
  name: string;
  title?: string;
  organization?: string;
  avatarUrl?: string;
  progress?: number;
  // Enhanced profile fields (UI only)
  bio?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export interface ProfileUpdateRequest {
  name?: string;
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
  facilitatorId: number;
  participants: number[]; // User IDs
  createdAt?: string;
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
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
  starCard?: any;
}