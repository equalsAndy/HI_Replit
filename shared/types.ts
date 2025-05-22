// Enhanced user profile types

export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}

export interface User {
  id: number;
  name: string;
  username?: string;
  email?: string;
  title?: string;
  organization?: string;
  avatarUrl?: string | null;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
  facilitatorId?: number; // ID of the facilitator assigned to this user
  lastLogin?: string;
  progress?: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  title?: string;
  organization?: string;
  email?: string;
  role?: UserRole;
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