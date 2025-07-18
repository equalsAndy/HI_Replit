// Global type augmentations for Express session
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: 'admin' | 'facilitator' | 'participant';
      name: string;
      email: string;
    }

    interface Session {
      userId?: number;
      username?: string;
      userRole?: 'admin' | 'facilitator' | 'participant';
    }
  }
}

export {};
