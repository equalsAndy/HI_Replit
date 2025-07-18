// Development server with Vite HMR integration
import "dotenv/config";
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './server/routes.js';
import reportRoutes from './server/routes/report-routes.js';
import adminUploadRoutes from './server/routes/admin-upload-routes.js';
import discernmentRoutes from './server/routes/discernment-routes.js';
import authRoutes from './server/routes/auth-routes.js';
import { initializeDatabase } from './server/db.js';
import { db } from './server/db.js';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Force NODE_TLS_REJECT_UNAUTHORIZED to match production setting if it's used
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Environment setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

async function startDevServer() {
  console.log('🚀 Starting development server with HMR...');

  // Create Express app
  const app = express();
  const httpServer = createServer(app);

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, 'client'),
  });

  // Environment variable validation
  console.log('✅ Environment variables validated');
  console.log('📊 DATABASE_URL configured:', !!process.env.DATABASE_URL);
  console.log('🔑 SESSION_SECRET configured:', !!process.env.SESSION_SECRET);
  
  // Basic middleware setup
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Initialize database
  console.log('📊 Initializing database connection...');
  await initializeDatabase();
  console.log('✅ Database connection successful');
  
  // Setup session middleware with proper error handling
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
  sessionStore.on('error', (error) => {
    console.error('❌ Session store error:', error);
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
  
  // API routes - Make sure we include auth routes
  app.use('/api', router);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', upload.single('file'), adminUploadRoutes);
  app.use('/api/discernment', discernmentRoutes);
  app.use('/api/auth', authRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'development',
      hmr: 'active'
    });
  });

  // Apply Vite middleware AFTER API routes
  // This ensures API requests are handled by Express
  app.use(vite.middlewares);
  
  // Start the server
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`✅ Development server running with HMR at http://localhost:${port}`);
    console.log(`💻 Client served from: ${path.resolve(__dirname, 'client')}`);
    console.log(`🔄 Hot Module Replacement (HMR) is ACTIVE`);
    console.log(`❤️  Health check available at: http://localhost:${port}/health`);
  });
  
  // Graceful shutdown
  const shutdown = () => {
    console.log('🛑 Shutting down gracefully...');
    httpServer.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startDevServer().catch(error => {
  console.error('❌ Failed to start dev server:', error);
  process.exit(1);
});
