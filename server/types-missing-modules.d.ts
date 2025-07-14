// Custom type declarations for missing modules

declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  import { Pool } from 'pg';

  export interface PgSessionStoreOptions {
    pool?: Pool;
    pgPromise?: any;
    conString?: string;
    tableName?: string;
    schemaName?: string;
    createTableIfMissing?: boolean;
    pruneSessionInterval?: number;
    errorLog?: (...args: any[]) => void;
    ttl?: number;
  }

  function connectPgSimple(session: any): any;
  export = connectPgSimple;
}

declare module 'express-session';
declare module '@vitejs/plugin-react';
declare module '@replit/vite-plugin-runtime-error-modal';
declare module '@replit/vite-plugin-cartographer';

// Extend Express Request for user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
