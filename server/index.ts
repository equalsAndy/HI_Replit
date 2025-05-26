import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './routes';
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
const port = parseInt(process.env.PORT || '3000');

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

// API routes
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// In production, serve static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist/public');
  console.log('Production mode - serving static files from:', distPath);

  // Serve static files with proper cache headers
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: false
  }));

  // Catch-all handler for client-side routing (must be after API routes)
  app.get('*', (req, res) => {
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

// In development mode, use Vite to serve the client
if (process.env.NODE_ENV === 'development') {
  import('./vite').then(({ setupVite }) => {
    setupVite(app, server).then(() => {
      console.log('Vite middleware setup complete');

      // The catch-all route is already handled by Vite middleware in server/vite.ts
      // We don't need to add another one here

    }).catch(err => {
      console.error('Failed to setup Vite:', err);
    });
  }).catch(err => {
    console.error('Failed to import Vite setup:', err);
  });
}

// Start the server on the configured port
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});