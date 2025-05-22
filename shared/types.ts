// Enhanced user profile types

export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
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