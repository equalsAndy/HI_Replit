import "dotenv/config";
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { router } from './routes.js';
import holisticReportRoutes from './routes/holistic-report-routes.js';
import adminUploadRoutes from './routes/admin-upload-routes.js';
import discernmentRoutes from './routes/discernment-routes.js';
import coachingRoutes from './routes/coaching-routes.js';
// import coachingChatRoutes from './routes/coaching-chat-routes.js';
import featureFlagRoutes from './routes/feature-flag-routes.js';
import jiraRoutes from './routes/jira-routes.js';
import feedbackRoutes from './routes/feedback-routes.js';
import trainingDocumentsRoutes from './routes/training-documents-routes.js';
import trainingRoutes from './routes/training-routes.js';
import aiManagementRoutes from './routes/ai-management-routes.js';
import personaManagementRoutes from './routes/persona-management-routes.js';
import betaTesterRoutes from './routes/beta-tester-routes.js';
import betaTesterNotesRoutes from './routes/beta-tester-notes-routes.js';
import metaliaRoutes from './routes/metalia-routes.js';
import growthPlanRoutes from './routes/growth-plan-routes.js';
import adminChatRoutes from './routes/admin-chat-routes.js';
import trainingUploadRoutes from './routes/training-upload-routes.js';
import taliaStatusRoutes from './routes/talia-status-routes.js';
import personaDocumentSyncRoutes from './routes/persona-document-sync-routes.js';
import { initializeDatabase } from './db.js';
import { db } from './db.js';
import { validateFlagsOnStartup } from './middleware/validateFlags.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
// Vite import removed for production builds
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
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
  
  // Environment Configuration Check
  console.log('🔧 Environment Configuration Check:', {
    NODE_ENV: process.env.NODE_ENV,
    ENVIRONMENT: process.env.ENVIRONMENT,
    claudeEnabled: process.env.ENVIRONMENT === 'development',
    personaEnvironment: process.env.ENVIRONMENT || process.env.NODE_ENV || 'development'
  });
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
    console.error('❌ Database connection failed:', typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error));
    return false;
  }
}

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Enhanced health endpoint with session testing
app.get('/health', async (req, res) => {
  try {
    // Read version info for health response
    let versionInfo = {
      version: 'unknown',
      build: 'unknown',
      environment: 'unknown',
      buildTimestamp: 'unknown'
    };
    
    try {
      const versionPath = path.join(__dirname, '../public/version.json');
      const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      versionInfo = {
        version: versionData.version || 'unknown',
        build: versionData.build || 'unknown',
        environment: versionData.environment || 'unknown',
        buildTimestamp: versionData.timestamp || 'unknown'
      };
      
      // Add version headers to health endpoint response
      res.setHeader('X-App-Version', versionInfo.version);
      res.setHeader('X-App-Build', versionInfo.build);
      res.setHeader('X-App-Environment', versionInfo.environment);
      res.setHeader('X-App-Timestamp', versionInfo.buildTimestamp);
    } catch (err) {
      // Keep default unknown values and set fallback headers
      res.setHeader('X-App-Version', 'unknown');
      res.setHeader('X-App-Build', 'unknown');
      res.setHeader('X-App-Environment', 'unknown');
    }

    const health = {
      status: 'ok',
      ...versionInfo,
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
  } catch (error: any) {
    // Include version info even in error responses
    let versionInfo = { version: 'unknown', build: 'unknown', environment: 'unknown' };
    try {
      const versionPath = path.join(__dirname, '../public/version.json');
      const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      versionInfo = {
        version: versionData.version || 'unknown',
        build: versionData.build || 'unknown',
        environment: versionData.environment || 'unknown'
      };
      
      // Add version headers to error response too
      res.setHeader('X-App-Version', versionInfo.version);
      res.setHeader('X-App-Build', versionInfo.build);
      res.setHeader('X-App-Environment', versionInfo.environment);
    } catch (err) {
      // Keep default values and set fallback headers
      res.setHeader('X-App-Version', 'unknown');
      res.setHeader('X-App-Build', 'unknown');
      res.setHeader('X-App-Environment', 'unknown');
    }

    res.status(500).json({ 
      status: 'unhealthy',
      ...versionInfo,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

// Vector Service test endpoint
app.get('/api/vector-status', async (req, res) => {
  try {
    const { javascriptVectorService } = await import('./services/javascript-vector-service.js');
    const stats = javascriptVectorService.getStats();
    
    // Test vector search with a simple query
    const testQuery = "personal development report coaching";
    const testResults = await javascriptVectorService.findSimilarContent(testQuery, {
      maxResults: 2,
      maxTokens: 500,
      minSimilarity: 0.1
    });
    
    res.status(200).json({
      status: 'healthy',
      service: 'JavaScript Vector Search',
      ...stats,
      testQuery,
      testResults: {
        count: testResults.length,
        totalTokens: testResults.reduce((sum, r) => sum + r.tokenCount, 0),
        topSimilarity: testResults[0]?.similarity || 0,
        documents: testResults.map(r => ({
          title: r.documentTitle,
          type: r.documentType,
          similarity: r.similarity.toFixed(3),
          tokens: r.tokenCount
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'JavaScript Vector Search',
      error: (error as Error).message,
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
      
      // Load persona configurations from database
      console.log('🤖 Loading persona configurations...');
      const { loadPersonasFromDatabase } = await import('./routes/persona-management-routes.js');
      await loadPersonasFromDatabase();
      console.log('✅ Persona configurations loaded from database');
      
      // Feature flag validation
      console.log('🚩 Validating feature flag configuration...');
      validateFlagsOnStartup();

      // Test database connection
      const dbReady = await testDatabaseConnection();
      if (!dbReady) {
        console.error('❌ Database not ready, exiting...');
        process.exit(1);
      }

      // Session configuration with proper error handling
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
      sessionStore.on('error', (error: unknown) => {
        console.error('❌ Session store error:', error);
      });

      // Middleware setup - CRITICAL ORDER: Body parsing before session
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true }));
      app.use(cookieParser());

      // Add version headers middleware for curl -I and all responses
      app.use((req, res, next) => {
        try {
          const versionPath = path.join(__dirname, '../public/version.json');
          const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
          
          res.setHeader('X-App-Version', versionData.version || 'unknown');
          res.setHeader('X-App-Build', versionData.build || 'unknown');
          res.setHeader('X-App-Environment', versionData.environment || 'unknown');
          res.setHeader('X-App-Timestamp', versionData.timestamp || 'unknown');
        } catch (err) {
          res.setHeader('X-App-Version', 'unknown');
          res.setHeader('X-App-Build', 'unknown');
          res.setHeader('X-App-Environment', 'unknown');
        }
        next();
      });

      // Add session debugging middleware - TEMPORARILY DISABLED
      // app.use((req, res, next) => {
      //   console.log('🔍 Session Debug:', {
      //     url: req.url,
      //     method: req.method,
      //     sessionID: req.sessionID,
      //     hasSession: !!req.session,
      //     cookies: req.headers.cookie
      //   });
      //   next();
      // });

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
      app.use('/api/reports/holistic', holisticReportRoutes);
      app.use('/api/admin', upload.single('file'), adminUploadRoutes);
      app.use('/api/discernment', discernmentRoutes);
      app.use('/api/coaching', coachingRoutes);
      // app.use('/api/coaching/chat', coachingChatRoutes);
      app.use('/api', featureFlagRoutes);
      app.use('/api/jira', jiraRoutes);
      app.use('/api/feedback', feedbackRoutes);
      app.use('/api/training-docs', trainingDocumentsRoutes);
      app.use('/api/training', trainingRoutes);
      app.use('/api/admin/ai', aiManagementRoutes);
      app.use('/api/admin/ai', personaManagementRoutes);
      app.use('/api/admin/chat', adminChatRoutes);
      app.use('/api/admin/ai', trainingUploadRoutes);
      app.use('/api/talia-status', taliaStatusRoutes);
      app.use('/api/admin/ai', personaDocumentSyncRoutes);
      app.use('/api/beta-tester', betaTesterRoutes);
      app.use('/api/beta-tester', betaTesterNotesRoutes);
      app.use('/api/metalia', metaliaRoutes);
  app.use('/api/growth-plan', growthPlanRoutes);

      // Changelog endpoint for test users (markdown)
      app.get('/changelog', async (req, res) => {
        try {
          const changelogPath = path.join(__dirname, '..', 'CHANGELOG-TEST-USERS.md');
          if (fs.existsSync(changelogPath)) {
            const changelog = fs.readFileSync(changelogPath, 'utf-8');
            res.setHeader('Content-Type', 'text/markdown');
            res.send(changelog);
          } else {
            res.status(404).send('Changelog not found');
          }
        } catch (error) {
          console.error('Error serving changelog:', error);
          res.status(500).send('Error loading changelog');
        }
      });

      // Changelog endpoint for test users (HTML formatted)
      app.get('/changelog-html', async (req, res) => {
        try {
          const changelogPath = path.join(__dirname, '..', 'CHANGELOG-TEST-USERS.md');
          if (fs.existsSync(changelogPath)) {
            const markdown = fs.readFileSync(changelogPath, 'utf-8');
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AllStarTeams & Imaginal Agility - Changelog</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
        h2 { color: #1d4ed8; margin-top: 2em; }
        h3 { color: #1e40af; }
        h4 { color: #3730a3; }
        code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; }
        blockquote { background: #f9fafb; border-left: 4px solid #60a5fa; padding: 10px 20px; margin: 20px 0; }
        .version { background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .emoji { font-size: 1.2em; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
    </style>
</head>
<body>
    <pre style="white-space: pre-wrap; font-family: inherit;">${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <footer style="margin-top: 3em; padding-top: 2em; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
        <p><strong>🔗 Quick Links:</strong></p>
        <p>
            <a href="/admin" style="color: #2563eb; text-decoration: none;">Admin Dashboard</a> | 
            <a href="/changelog" style="color: #2563eb; text-decoration: none;">Raw Markdown</a> | 
            <a href="/" style="color: #2563eb; text-decoration: none;">Back to Platform</a>
        </p>
    </footer>
</body>
</html>`;
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
          } else {
            res.status(404).send('<h1>Changelog not found</h1>');
          }
        } catch (error) {
          console.error('Error serving changelog HTML:', error);
          res.status(500).send('<h1>Error loading changelog</h1>');
        }
      });

      // Temporary endpoint to fix admin user test status
      app.post('/fix-admin-test-user', async (req, res) => {
        try {
          const { eq } = await import('drizzle-orm');
          const { users } = await import('../shared/schema.js');
          
          // Update admin user (ID 1) to be a test user
          const result = await db.update(users)
            .set({ isTestUser: true })
            .where(eq(users.id, 1))
            .returning({
              id: users.id,
              username: users.username,
              name: users.name,
              role: users.role,
              isTestUser: users.isTestUser
            });

          if (result.length > 0) {
            console.log('✅ Admin user updated to test user:', result[0]);
            res.json({
              success: true,
              message: 'Admin user successfully updated to test user',
              user: result[0]
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'Admin user not found'
            });
          }
        } catch (error) {
          console.error('❌ Error updating admin user:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to update admin user',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Debug endpoint to check user status
      app.get('/debug-user-status', async (req, res) => {
        try {
          const { eq } = await import('drizzle-orm');
          const { users } = await import('../shared/schema.js');
          
          // Get admin user (ID 1) current status
          const result = await db.select({
            id: users.id,
            username: users.username,
            name: users.name,
            role: users.role,
            isTestUser: users.isTestUser,
            astWorkshopCompleted: users.astWorkshopCompleted,
            astCompletedAt: users.astCompletedAt
          })
          .from(users)
          .where(eq(users.id, 1));

          if (result.length > 0) {
            console.log('🔍 Admin user current status:', result[0]);
            res.json({
              success: true,
              user: result[0],
              message: 'Current admin user status from database'
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'Admin user not found'
            });
          }
        } catch (error) {
          console.error('❌ Error checking user status:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to check user status',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Set user as workshop completed for testing
      app.post('/set-user-workshop-completed', async (req, res) => {
        try {
          const { eq } = await import('drizzle-orm');
          const { users } = await import('../shared/schema.js');
          
          const result = await db.update(users)
            .set({ 
              astWorkshopCompleted: true,
              astCompletedAt: new Date()
            })
            .where(eq(users.id, 1))
            .returning({
              id: users.id,
              username: users.username,
              name: users.name,
              astWorkshopCompleted: users.astWorkshopCompleted,
              astCompletedAt: users.astCompletedAt
            });

          if (result.length > 0) {
            console.log('✅ User 1 marked as workshop completed:', result[0]);
            res.json({
              success: true,
              user: result[0],
              message: 'User 1 marked as AST workshop completed'
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }
        } catch (error) {
          console.error('❌ Error updating user:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to update user status',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Refresh session data from database (debug endpoint)
      app.post('/refresh-session', async (req, res) => {
        try {
          const userId = (req.session as any)?.userId;
          if (!userId) {
            return res.status(401).json({
              success: false,
              error: 'Not logged in'
            });
          }

          const { eq } = await import('drizzle-orm');
          const { users } = await import('../shared/schema.js');
          
          // Get fresh user data from database
          const result = await db.select()
            .from(users)
            .where(eq(users.id, userId));

          if (result.length > 0) {
            const user = result[0];
            // Update session with fresh data
            (req.session as any).user = {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role,
              isTestUser: user.isTestUser,
              isBetaTester: user.isBetaTester,
              astWorkshopCompleted: user.astWorkshopCompleted,
              iaWorkshopCompleted: user.iaWorkshopCompleted
            };

            console.log('✅ Session refreshed for user:', user.username);
            res.json({
              success: true,
              message: 'Session refreshed with latest database values',
              user: (req.session as any).user
            });
          } else {
            res.status(404).json({
              success: false,
              error: 'User not found in database'
            });
          }
        } catch (error) {
          console.error('❌ Error refreshing session:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to refresh session',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Create holistic reports table endpoint
      app.post('/create-holistic-reports-table', async (req, res) => {
        try {
          console.log('🚀 Creating holistic reports table...');
          
          const createTableQuery = `
            -- Create holistic_reports table for storing generated PDF reports
            CREATE TABLE IF NOT EXISTS holistic_reports (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('standard', 'personal')),
              report_data JSONB NOT NULL,
              pdf_file_path VARCHAR(500),
              pdf_file_name VARCHAR(255),
              pdf_file_size INTEGER,
              generation_status VARCHAR(20) DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
              generated_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW(),
              error_message TEXT,
              generated_by_user_id INTEGER REFERENCES users(id),
              star_card_image_path VARCHAR(500),
              CONSTRAINT unique_user_report_type UNIQUE (user_id, report_type)
            )
          `;
          
          const indexQueries = [
            'CREATE INDEX IF NOT EXISTS idx_holistic_reports_user_id ON holistic_reports(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_holistic_reports_status ON holistic_reports(generation_status)',
            'CREATE INDEX IF NOT EXISTS idx_holistic_reports_type ON holistic_reports(report_type)',
            'CREATE INDEX IF NOT EXISTS idx_holistic_reports_generated_at ON holistic_reports(generated_at)'
          ];

          const results = [];
          
          // Create table
          try {
            await db.execute(createTableQuery);
            results.push('✅ holistic_reports table created successfully');
          } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
              results.push('⚠️ holistic_reports table already exists');
            } else {
              throw error;
            }
          }

          // Create indexes
          for (const query of indexQueries) {
            try {
              await db.execute(query);
              results.push('✅ Index created successfully');
            } catch (error) {
              if (error instanceof Error && error.message.includes('already exists')) {
                results.push('⚠️ Index already exists');
              } else {
                console.warn('Index creation warning:', error instanceof Error ? error.message : String(error));
                results.push('⚠️ Index creation warning');
              }
            }
          }

          console.log('✅ Holistic reports table creation completed');
          res.json({
            success: true,
            message: 'Holistic reports table created successfully',
            results: results
          });
          
        } catch (error) {
          console.error('❌ Error creating holistic reports table:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to create holistic reports table',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Create coaching tables endpoint
      app.post('/create-coaching-tables', async (req, res) => {
        try {
          console.log('🚀 Creating coaching system tables...');
          
          const createTableQueries = [
            `CREATE TABLE IF NOT EXISTS coach_knowledge_base (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              category VARCHAR(100) NOT NULL,
              content_type VARCHAR(100) NOT NULL,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              tags JSONB,
              metadata JSONB,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            
            `CREATE TABLE IF NOT EXISTS user_profiles_extended (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              company VARCHAR(255),
              department VARCHAR(255),
              role VARCHAR(255),
              ast_profile_summary JSONB,
              expertise_areas JSONB,
              project_experience JSONB,
              collaboration_preferences JSONB,
              availability_status VARCHAR(50) DEFAULT 'available',
              connection_opt_in BOOLEAN DEFAULT true,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            
            `CREATE TABLE IF NOT EXISTS coaching_sessions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              conversation JSONB NOT NULL,
              session_summary TEXT,
              context_used JSONB,
              session_type VARCHAR(50) DEFAULT 'general',
              session_length VARCHAR(50),
              user_satisfaction VARCHAR(20),
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            
            `CREATE TABLE IF NOT EXISTS connection_suggestions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              requestor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              suggested_collaborator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              reason_type VARCHAR(100) NOT NULL,
              reason_explanation TEXT NOT NULL,
              context TEXT,
              status VARCHAR(50) DEFAULT 'suggested',
              response_at TIMESTAMP,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`,
            
            `CREATE TABLE IF NOT EXISTS vector_embeddings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              source_table VARCHAR(100) NOT NULL,
              source_id VARCHAR(255) NOT NULL,
              vector_id VARCHAR(255) NOT NULL,
              embedding_type VARCHAR(100) NOT NULL,
              created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )`
          ];

          const indexQueries = [
            'CREATE INDEX IF NOT EXISTS idx_coach_knowledge_base_category ON coach_knowledge_base(category)',
            'CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_connection_suggestions_requestor ON connection_suggestions(requestor_id)',
            'CREATE INDEX IF NOT EXISTS idx_vector_embeddings_source ON vector_embeddings(source_table, source_id)'
          ];

          const results = [];
          
          // Create tables
          for (const query of createTableQueries) {
            try {
              await db.execute(query);
              results.push('✅ Table created successfully');
            } catch (error) {
              if (error instanceof Error && error.message.includes('already exists')) {
                results.push('⚠️ Table already exists');
              } else {
                throw error;
              }
            }
          }

          // Create indexes
          for (const query of indexQueries) {
            try {
              await db.execute(query);
              results.push('✅ Index created successfully');
            } catch (error) {
              if (error instanceof Error && error.message.includes('already exists')) {
                results.push('⚠️ Index already exists');
              } else {
                console.warn('Index creation warning:', error instanceof Error ? error.message : String(error));
                results.push('⚠️ Index creation warning');
              }
            }
          }

          console.log('✅ Coaching tables creation completed');
          res.json({
            success: true,
            message: 'Coaching system tables created successfully',
            results: results,
            tables: ['coach_knowledge_base', 'user_profiles_extended', 'coaching_sessions', 'connection_suggestions', 'vector_embeddings']
          });
          
        } catch (error) {
          console.error('❌ Error creating coaching tables:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to create coaching tables',
            details: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Static file serving for both production and development
      if (process.env.NODE_ENV === 'production') {
        // Production: serve from public (container path)
        const staticPath = path.join(__dirname, 'public');
        console.log('📁 Production: serving static files from:', staticPath);
        app.use(express.static(staticPath));
        
        // Catch-all handler for client-side routing (exclude API routes)
        app.get(/^(?!\/api).*/, (req, res) => {
          res.sendFile(path.join(__dirname, 'public/index.html'));
        });
        console.log('✅ Production static file serving ready');
      } else {
        // Development: serve from dist/public (local path)
        const devStaticPath = path.join(__dirname, '../dist/public');
        console.log('📁 Development: serving static files from:', devStaticPath);
        app.use(express.static(devStaticPath));
        
        app.get(/^(?!\/api).*/, (req, res) => {
          res.sendFile(path.join(__dirname, '../dist/public/index.html'));
        });
        console.log('✅ Development static file serving ready');
      }

      // Initialize JavaScript Vector Service for training document retrieval
      console.log('🔄 Initializing JavaScript Vector Service...');
      try {
        const { javascriptVectorService } = await import('./services/javascript-vector-service.js');
        await javascriptVectorService.initialize();
        console.log('✅ JavaScript Vector Service initialized');
      } catch (error) {
        console.warn('⚠️ Vector service initialization failed, will use fallback search:', error);
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
const shutdown = async (signal: string) => {
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
  
  // Set a timeout to force exit if graceful shutdown takes too long
  const forceExitTimeout = setTimeout(() => {
    console.log('⚠️  Graceful shutdown timed out, forcing exit...');
    process.exit(1);
  }, 10000); // 10 second timeout
  
  try {
    // Close the HTTP server
    console.log('🔒 Closing HTTP server...');
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error('❌ Error closing server:', err);
          reject(err);
        } else {
          console.log('✅ HTTP server closed');
          resolve();
        }
      });
    });

    // Close database connections
    console.log('🗄️  Closing database connections...');
    if (db && typeof db.end === 'function') {
      await db.end();
      console.log('✅ Database connections closed');
    }

    clearTimeout(forceExitTimeout);
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});
