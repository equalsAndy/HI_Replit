import "dotenv/config";
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './routes.js';
import reportRoutes from './routes/report-routes.js';
import adminUploadRoutes from './routes/admin-upload-routes.js';
import discernmentRoutes from './routes/discernment-routes.js';
import { initializeDatabase } from './db.js';
import { db } from './db.js';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
// Vite import removed for production builds
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const server = createServer(app);

// Environment variable validation
function validateEnvironment() {
  const required = ['DATABASE_URL', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
  console.log('📊 DATABASE_URL configured:', !!process.env.DATABASE_URL);
  console.log('🔑 SESSION_SECRET configured:', !!process.env.SESSION_SECRET);
}

// Database connection test
async function testDatabaseConnection() {
  try {
    const testQuery = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection test successful');
    
    // Test session table specifically
    const sessionTest = await db.execute('SELECT COUNT(*) FROM session_aws');
    console.log('✅ Session table accessible');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error));
    return false;
  }
}

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Enhanced health endpoint with session testing
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      initialized: isInitialized,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'unknown',
      sessionTable: 'unknown'
    };

    // Test database connection if initialized
    if (isInitialized) {
      try {
        await db.execute('SELECT 1');
        health.database = 'connected';
        
        // Test session table
        await db.execute('SELECT COUNT(*) FROM session_aws');
        health.sessionTable = 'accessible';
      } catch (error) {
        health.database = 'error';
        health.sessionTable = 'error';
      }
    }

    res.status(200).json(health);
  } catch (error: any) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Lazy initialization function
async function initializeApp() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🔄 Starting application initialization...');
      
      // Validate environment variables first
      validateEnvironment();
      
      // Database initialization
      console.log('📊 Initializing database connection...');
      await initializeDatabase();
      console.log('✅ Database connection successful');

      // Test database connection
      const dbReady = await testDatabaseConnection();
      if (!dbReady) {
        console.error('❌ Database not ready, exiting...');
        process.exit(1);
      }

      // Session configuration with proper error handling
      const PgSession = connectPgSimple(session);
      
      const sessionStore = new PgSession({
        conString: process.env.SESSION_DATABASE_URL || process.env.DATABASE_URL,
        tableName: 'session_aws',
        createTableIfMissing: false, // Table already exists

        // Simplified configuration for better compatibility
        schemaName: 'public',
        pruneSessionInterval: 60 * 15, // 15 minutes
      });

      // Add session store error handling
      sessionStore.on('error', (error: unknown) => {
        console.error('❌ Session store error:', error);
      });

      // Middleware setup - CRITICAL ORDER: Body parsing before session
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser());

      // Add session debugging middleware - TEMPORARILY DISABLED
      // app.use((req, res, next) => {
      //   console.log('🔍 Session Debug:', {
      //     url: req.url,
      //     method: req.method,
      //     sessionID: req.sessionID,
      //     hasSession: !!req.session,
      //     cookies: req.headers.cookie
      //   });
      //   next();
      // });

      // Session middleware MUST come after body parsing but before routes
      app.use(session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET || 'aws-production-secret-2025',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production' ? false : false, // HTTP for now
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: 'lax'
        },
        name: 'sessionId' // Custom session name
      }));

      // Configure multer for file uploads
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
      });

      // Routes come AFTER session middleware
      app.use('/api', router);
      app.use('/api/reports', reportRoutes);
      app.use('/api/admin', upload.single('file'), adminUploadRoutes);
      app.use('/api/discernment', discernmentRoutes);

      // Static file serving for both production and development
      if (process.env.NODE_ENV === 'production') {
        // Production: serve from dist/public
        console.log('📁 Production: serving static files from dist/public...');
        app.use(express.static(path.join(__dirname, '../dist/public')));
        
        // Catch-all handler for client-side routing (exclude API routes)
        app.get(/^(?!\/api).*/, (req, res) => {
          res.sendFile(path.join(__dirname, '../dist/public/index.html'));
        });
        console.log('✅ Production static file serving ready');
      } else {
        // Development: serve from dist/public (same as production)
        console.log('📁 Development: serving static files from dist/public...');
        app.use(express.static(path.join(__dirname, '../dist/public')));
        
        app.get(/^(?!\/api).*/, (req, res) => {
          res.sendFile(path.join(__dirname, '../dist/public/index.html'));
        });
        console.log('✅ Development static file serving ready');
      }

      isInitialized = true;
      console.log('✅ Application initialization complete');
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      throw error;
    }
  })();

  return initializationPromise;
}

// Middleware to ensure initialization before handling non-health requests
app.use(async (req, res, next) => {
  // Skip initialization check for health endpoint
  if (req.path === '/health') {
    return next();
  }

  // Initialize app if not already done
  if (!isInitialized) {
    try {
      await initializeApp();
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
  }

  next();
});

async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    // Start server immediately - initialization happens lazily
    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server successfully started on port ${port}`);
      console.log(`🌐 Access your app at: http://0.0.0.0:${port}`);
      console.log(`❤️  Health check available at: http://0.0.0.0:${port}/health`);
      
      // Start background initialization
      initializeApp().catch(error => {
        console.error('❌ Background initialization failed:', error);
      });
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is busy`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
const shutdown = () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
