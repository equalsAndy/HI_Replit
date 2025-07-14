import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    // Add other custom session properties here
  }
}

declare global {
  namespace Express {
    interface Request {
      session: import('express-session').Session & Partial<import('express-session').SessionData>;
      sessionID: string;
    }
  }
}

export {};
