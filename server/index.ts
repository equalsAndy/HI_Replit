import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { router } from './routes';
import { db } from './db';
import { connectToDatabase } from './db';
import path from 'path';
import cookieParser from 'cookie-parser';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Database connection
connectToDatabase().then(() => {
  console.log('Database connection initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize database connection:', error);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup with PostgreSQL
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'heliotrope-workshop-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Use API routes
app.use('/api', router);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});