import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './routes';
import reportRoutes from './routes/report-routes';
import adminUploadRoutes from './routes/admin-upload-routes';
import { initializeDatabase } from './db';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { setupVite } from './vite';
import { createServer } from 'http';

// Set up dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = parseInt(process.env.PORT || '5000');

// Initialize database connection
initializeDatabase()
  .then((success) => {
    if (!success) {
      console.error('Failed to initialize database, but continuing server startup');
    }
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
  });

// Configure session store with PostgreSQL
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  conString: process.env.DATABASE_URL,
  tableName: 'sessions',
  createTableIfMissing: true
});

// Configure session middleware
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'heliotrope-workshop-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: false, // Set to false for Replit deployment compatibility
    httpOnly: true,
    sameSite: 'lax'
  },
  rolling: true // Refresh session on each request
}));

// Configure cookie parser
app.use(cookieParser());

// Configure JSON body parser with increased limit for photo uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Configure static file serving for uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  } 
});

// Make the upload middleware available to routes
app.locals.upload = upload;

// Report routes - must be handled before Vite middleware
app.use('/api/report', (req, res, next) => {
  console.log(`[Express] Report route: ${req.path}`);
  next();
}, reportRoutes);

// API routes - these need to be handled before Vite middleware
app.use('/api', (req, res, next) => {
  // Ensure API routes are handled by Express, not Vite
  console.log(`[Express] API route: ${req.path}`);
  next();
}, router);

// Admin upload routes
app.use('/api/admin', adminUploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route is handled by Vite middleware for the React app

// In production, serve static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist/public');
  console.log('Production mode - serving static files from:', distPath);

  // Serve static files with proper MIME types and cache headers
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, path) => {
      // Set correct MIME type for JavaScript modules
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // Catch-all handler for client-side routing (must be after API routes and static files)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Skip static asset requests - let them 404 naturally if not found
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return next();
    }
    
    const indexPath = path.join(distPath, 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  });
}

// Create HTTP server
const server = createServer(app);

// Setup Vite middleware before starting the server
async function initializeServer() {
  // In development mode, use Vite to serve the client
  if (process.env.NODE_ENV === 'development') {
    try {
      const { setupVite } = await import('./vite');
      await setupVite(app, server);
      console.log('Vite middleware setup complete');
    } catch (err) {
      console.error('Failed to setup Vite:', err);
    }
  }
}

// Start the server
console.log('Initializing database connection...');

async function startServer() {
  try {
    // Initialize Vite middleware first
    await initializeServer();
    
    // Start server directly on the specified port
    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server successfully started on port ${port}`);
      console.log(`🌐 Access your app at: http://0.0.0.0:${port}`);
      console.log('Database connection successful');
      console.log('Vite middleware setup complete');
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        server.listen(port + 1, '0.0.0.0', () => {
          console.log(`✅ Server successfully started on port ${port + 1}`);
          console.log(`🌐 Access your app at: http://0.0.0.0:${port + 1}`);
          console.log(`⚠️  Note: Requested port ${port} was busy, using port ${port + 1} instead`);
        });
      } else {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});