import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  import { Pool } from 'pg';
  
  interface PgSessionStoreOptions {
    pool?: Pool;
    pgPromise?: any;
    conString?: string;
    tableName?: string;
    schemaName?: string;
    createTableIfMissing?: boolean;
    pruneSessionInterval?: number;
    errorLog?: (...args: any[]) => void;
  }

  interface PgSessionStore {
    new (options?: PgSessionStoreOptions): Store;
    (session: any): {
      new (options?: PgSessionStoreOptions): Store;
    };
  }

  const connectPgSimple: PgSessionStore;
  export = connectPgSimple;
}

declare module 'express-session' {
  const session: any;
  export = session;
}

declare global {
  namespace Express {
    interface Request {
      session: import('express-session').Session & Partial<import('express-session').SessionData>;
      sessionID: string;
    }
  }
}
