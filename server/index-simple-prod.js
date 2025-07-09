// server/index-simple-prod.js
// Complete production server with essential API routes

import express from 'express';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Database client
const dbClient = new Client({
  connectionString: process.env.DATABASE_URL
});

// Connect to database
try {
  await dbClient.connect();
  console.log('🔗 Database: Connected');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session_aws'
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbClient ? 'connected' : 'disconnected'
  });
});

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await dbClient.query(
      'SELECT id, username, password, name, email, role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check auth status
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    userId: req.session.userId,
    username: req.session.username,
    role: req.session.userRole
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Serve static files
const distPath = path.resolve(__dirname, '../dist/public');
console.log(`📁 Looking for static files at: ${distPath}`);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not built.');
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Complete Production Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`🔐 Session store: PostgreSQL (table: session_aws)`);
});
