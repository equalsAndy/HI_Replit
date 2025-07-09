import express from "express";
import path from "path";
import * as fs from "fs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes using relative paths for container compatibility
import { router } from './routes.js';
import reportRoutes from './routes/report-routes.js';
import adminUploadRoutes from './routes/admin-upload-routes.js';
import discernmentRoutes from './routes/discernment-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET not set, using fallback (not recommended for production)');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS headers for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session configuration with enhanced production settings
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session_aws',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  },
  rolling: true
}));

// Routes
app.use('/api', router);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminUploadRoutes);
app.use('/api/discernment', discernmentRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { db } = await import('./db.js');
    await db.execute('SELECT 1');
    
    // Test session table accessibility
    const sessionCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'session_aws'
      );
    `);
    
    res.json({ 
      status: 'ok',
      initialized: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      sessionTable: 'accessible'
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown error'
    });
  }
});

// Serve static files from dist/public
const distPath = path.resolve(__dirname, '../dist/public');
console.log(`📁 Looking for static files at: ${distPath}`);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
  }));
  
  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not found. Please build the client first.');
    }
  });
} else {
  console.error(`❌ Build directory not found at: ${distPath}`);
  app.get('*', (req, res) => {
    res.status(500).json({
      error: 'Build directory not found',
      path: distPath,
      message: 'Please build the client first with: npm run build'
    });
  });
}

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 Session store: PostgreSQL (table: session_aws)`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});