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

// Workshop Data Routes - Core Assessment Functionality
app.get('/api/workshop-data/starcard', requireAuth, async (req, res) => {
  try {
    const result = await dbClient.query(
      'SELECT starcard_data FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const starcardData = result.rows[0].starcard_data || {};
    res.json(starcardData);
  } catch (error) {
    console.error('Error fetching starcard:', error);
    res.status(500).json({ error: 'Failed to fetch starcard data' });
  }
});

app.post('/api/workshop-data/starcard', requireAuth, async (req, res) => {
  try {
    const { thinking, feeling, acting, planning, ...otherData } = req.body;
    
    const starcardData = {
      thinking: thinking || 0,
      feeling: feeling || 0,
      acting: acting || 0,
      planning: planning || 0,
      ...otherData,
      updatedAt: new Date().toISOString()
    };
    
    await dbClient.query(
      'UPDATE users SET starcard_data = $1 WHERE id = $2',
      [JSON.stringify(starcardData), req.session.userId]
    );
    
    res.json({ success: true, data: starcardData });
  } catch (error) {
    console.error('Error saving starcard:', error);
    res.status(500).json({ error: 'Failed to save starcard data' });
  }
});

app.get('/api/workshop-data/flow-attributes', requireAuth, async (req, res) => {
  try {
    const result = await dbClient.query(
      'SELECT flow_attributes FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    const flowAttributes = result.rows[0]?.flow_attributes || [];
    res.json({ attributes: flowAttributes });
  } catch (error) {
    console.error('Error fetching flow attributes:', error);
    res.status(500).json({ error: 'Failed to fetch flow attributes' });
  }
});

app.post('/api/workshop-data/flow-attributes', requireAuth, async (req, res) => {
  try {
    const { attributes } = req.body;
    
    await dbClient.query(
      'UPDATE users SET flow_attributes = $1 WHERE id = $2',
      [JSON.stringify(attributes), req.session.userId]
    );
    
    res.json({ success: true, attributes });
  } catch (error) {
    console.error('Error saving flow attributes:', error);
    res.status(500).json({ error: 'Failed to save flow attributes' });
  }
});

// Navigation Progress Route
app.get('/api/workshop-data/navigation-progress/:appType', requireAuth, async (req, res) => {
  try {
    const { appType } = req.params;
    const column = appType === 'ast' ? 'ast_progress' : 'ia_progress';
    
    const result = await dbClient.query(
      `SELECT ${column} FROM users WHERE id = $1`,
      [req.session.userId]
    );
    
    const progress = result.rows[0]?.[column] || { completedSteps: [] };
    res.json(progress);
  } catch (error) {
    console.error('Error fetching navigation progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.post('/api/workshop-data/navigation-progress/:appType', requireAuth, async (req, res) => {
  try {
    const { appType } = req.params;
    const { completedSteps } = req.body;
    const column = appType === 'ast' ? 'ast_progress' : 'ia_progress';
    
    const progressData = {
      completedSteps: completedSteps || [],
      updatedAt: new Date().toISOString()
    };
    
    await dbClient.query(
      `UPDATE users SET ${column} = $1 WHERE id = $2`,
      [JSON.stringify(progressData), req.session.userId]
    );
    
    res.json({ success: true, progress: progressData });
  } catch (error) {
    console.error('Error saving navigation progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Admin Routes - User Management
app.get('/api/admin/users', requireAuth, async (req, res) => {
  try {
    // Simple admin check - you can enhance this later
    const adminCheck = await dbClient.query(
      'SELECT username FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (adminCheck.rows[0]?.username !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await dbClient.query(`
      SELECT 
        id, 
        username, 
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/dashboard-stats', requireAuth, async (req, res) => {
  try {
    const adminCheck = await dbClient.query(
      'SELECT username FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (adminCheck.rows[0]?.username !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await dbClient.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN ast_workshop_completed = true THEN 1 END) as ast_completed,
        COUNT(CASE WHEN ia_workshop_completed = true THEN 1 END) as ia_completed
      FROM users
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
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
