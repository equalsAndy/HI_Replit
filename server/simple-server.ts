import express from 'express';
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { db } from './db.js';
import { router } from './routes.js';
import { sessionStore } from './session-store.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'heliotrope-workshop-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to database
console.log('Initializing database connection...');
// Database connection handled by Drizzle ORM automatically

// API routes
app.use('/api', router);

// Serve static files from the client/dist directory in production
if (process.env.NODE_ENV === 'production') {
  const clientDistDir = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDistDir));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

// Create HTTP server
const server = createServer(app);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server };