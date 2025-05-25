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

// Extended session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    userRole: UserRole;
  }
}