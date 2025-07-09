import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './routes';
import reportRoutes from './routes/report-routes';
import adminUploadRoutes from './routes/admin-upload-routes';
import discernmentRoutes from './routes/discernment-routes';
import { initializeDatabase } from './db';
import { db } from './db';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { setupVite } from './vite';
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
    console.error('❌ Database connection failed:', error);
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
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
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
        conString: process.env.DATABASE_URL,
        tableName: 'session_aws',
        createTableIfMissing: false, // Table already exists
        errorOnUnknownOptions: false,
        // Simplified configuration for better compatibility
        schemaName: 'public',
        pruneSessionInterval: 60 * 15, // 15 minutes
      });

      // Add session store error handling
      sessionStore.on('error', (error) => {
        console.error('❌ Session store error:', error);
      });

      // Middleware setup - CRITICAL ORDER: Body parsing before session
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser());

      // Add session debugging middleware
      app.use((req, res, next) => {
        console.log('🔍 Session Debug:', {
          sessionID: req.sessionID,
          hasSession: !!req.session,
          cookies: req.headers.cookie
        });
        next();
      });

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

      // Only setup Vite in development or when needed
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Setting up Vite middleware...');
        await setupVite(app);
        console.log('✅ Vite middleware ready');
      } else {
        // Serve static files in production
        app.use(express.static(path.join(__dirname, '../dist/public')));
        
        // Catch-all handler for client-side routing
        app.get('*', (req, res) => {
          res.sendFile(path.join(__dirname, '../dist/public/index.html'));
        });
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
