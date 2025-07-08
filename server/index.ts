import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './routes';
import reportRoutes from './routes/report-routes';
import adminUploadRoutes from './routes/admin-upload-routes';
import discernmentRoutes from './routes/discernment-routes';
import { initializeDatabase } from './db';
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

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// FAST HEALTH ENDPOINT - Responds immediately without waiting for full initialization
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    initialized: isInitialized,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Lazy initialization function
async function initializeApp() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🔄 Starting application initialization...');
      
      // Database initialization
      console.log('📊 Initializing database connection...');
      await initializeDatabase();
      console.log('✅ Database connection successful');

      // Session configuration
      const PgSession = connectPgSimple(session);
      
      app.use(session({
        store: new PgSession({
          conString: process.env.DATABASE_URL,
          tableName: 'session',
          createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      }));

      // Middleware setup
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser());

      // Configure multer for file uploads
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
      });

      // Routes
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
        app.use(express.static(path.join(__dirname, '../client/dist')));
        
        // Catch-all handler for client-side routing
        app.get('*', (req, res) => {
          res.sendFile(path.join(__dirname, '../client/dist/index.html'));
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
