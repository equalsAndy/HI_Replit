// Enhanced user profile types with database compatibility

export enum UserRole {
  Admin = 'admin',
  Facilitator = 'facilitator',
  Participant = 'participant'
}

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  email?: string | null;
  title?: string | null;
  organization?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  progress?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ProfileUpdateRequest {
  name?: string;
  title?: string | null;
  organization?: string | null;
  email?: string | null;
  role?: UserRole;
}

export interface Cohort {
  id: number;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  cohortType?: string;
  parentCohortId?: number | null;
  facilitatorId?: number;
  memberCount?: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Workshop {
  id: number;
  name: string;
  description?: string | null;
  date: string;
  cohortId: number;
  facilitatorId: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export interface StarCard {
  id: number;
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  imageUrl?: string | null;
  state?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface FlowAttributesRecord {
  id: number;
  userId: number;
  attributes: any[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}