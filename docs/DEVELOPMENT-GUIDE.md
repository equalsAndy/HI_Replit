# Development Guide

## 🛠️ AI Coaching System Development

This guide covers development procedures, best practices, and workflows for extending the AI Coaching System.

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database access
- Docker for ChromaDB
- Git for version control
- VS Code or preferred IDE

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd HI_Replit

# Install dependencies
npm install

# Install AI Coaching System dependencies
npm install chromadb @chroma-core/default-embed uuid @aws-sdk/client-bedrock-runtime
npm install -D @types/uuid

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration
```bash
# .env file for development
DATABASE_URL=postgresql://localhost:5432/ast_development
SESSION_SECRET=development-secret-key
CHROMA_HOST=localhost
CHROMA_PORT=8000
NODE_ENV=development
```

### Start Development Services

```bash
# Start ChromaDB container
docker run -d -p 8000:8000 --name chroma-coaching chromadb/chroma

# Start the development server
npm run dev

# In another terminal, initialize the system
curl -X POST "http://localhost:8080/create-coaching-tables"
curl -X POST "http://localhost:8080/api/coaching/vector/init"

# Run integration tests
./final-test.sh
```

## Project Structure

### Key Files and Directories

```
HI_Replit/
├── server/
│   ├── routes/
│   │   ├── coaching-routes.ts          # Main coaching API routes
│   │   └── coaching-routes-complex.ts  # Full implementation backup
│   ├── services/
│   │   ├── vector-db.ts               # ChromaDB service
│   │   └── vector-db-placeholder.ts   # Development fallback
│   ├── middleware/
│   │   └── auth.ts                    # Authentication middleware
│   ├── db/
│   │   └── db.ts                      # Database connection
│   └── index.ts                       # Main server file
├── shared/
│   └── schema.ts                      # Database schema (extended)
├── client/
│   └── (existing React application)
├── docs/
│   ├── AI-COACHING-SYSTEM-DOCUMENTATION.md
│   ├── API-ROUTES.md
│   ├── DATABASE-SCHEMA.md
│   ├── VECTOR-DATABASE-SERVICE.md
│   ├── DEPLOYMENT-GUIDE.md
│   └── DEVELOPMENT-GUIDE.md (this file)
├── tests/
│   ├── test-vector-db.ts              # Vector database tests
│   ├── test-coaching-system.sh        # Integration tests
│   └── final-test.sh                  # Complete system test
└── package.json                       # Dependencies and scripts
```

### Database Schema Files

**`shared/schema.ts`** - Extended with coaching tables:
```typescript
// Existing AST tables
export const users = pgTable('users', { ... });
export const assessments = pgTable('assessments', { ... });
export const userProgress = pgTable('user_progress', { ... });

// New coaching tables
export const coachKnowledgeBase = pgTable('coach_knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  tags: text('tags').array(),
  source: varchar('source', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const userProfilesExtended = pgTable('user_profiles_extended', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id),
  strengths: text('strengths').array(),
  challenges: text('challenges').array(),
  values: text('values').array(),
  workStyle: varchar('work_style', { length: 100 }),
  communicationStyle: varchar('communication_style', { length: 100 }),
  goals: text('goals').array(),
  preferences: jsonb('preferences'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Additional coaching tables...
```

## Development Workflows

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-coaching-feature
   ```

2. **Implement Changes**
   - Update database schema if needed
   - Create/modify API endpoints
   - Add vector database operations
   - Write tests

3. **Test Changes**
   ```bash
   # Run integration tests
   ./final-test.sh
   
   # Test specific components
   npx tsx test-vector-db.ts
   
   # Manual API testing
   curl -X GET "http://localhost:8080/api/coaching/knowledge"
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new coaching feature"
   git push origin feature/new-coaching-feature
   ```

### Database Schema Changes

1. **Update Schema File**
   ```typescript
   // In shared/schema.ts
   export const newTable = pgTable('new_table', {
     id: uuid('id').primaryKey().defaultRandom(),
     // ... field definitions
   });
   ```

2. **Create Migration Script**
   ```sql
   -- In a new migration file
   CREATE TABLE new_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     -- ... field definitions
   );
   ```

3. **Update Server Setup**
   ```typescript
   // In server/index.ts, add table creation to the endpoint
   const createTables = [
     // ... existing tables
     `CREATE TABLE IF NOT EXISTS new_table (...)`
   ];
   ```

4. **Test Migration**
   ```bash
   curl -X POST "http://localhost:8080/create-coaching-tables"
   ```

### API Endpoint Development

1. **Define Route**
   ```typescript
   // In server/routes/coaching-routes.ts
   router.get('/new-endpoint', async (req, res) => {
     try {
       // Implementation
       res.json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ error: 'Failed to process request' });
     }
   });
   ```

2. **Add Authentication (if needed)**
   ```typescript
   import { requireAuth } from '../middleware/auth';
   
   router.get('/protected-endpoint', requireAuth, async (req, res) => {
     // Endpoint implementation
   });
   ```

3. **Test Endpoint**
   ```bash
   curl -X GET "http://localhost:8080/api/coaching/new-endpoint"
   ```

### Vector Database Operations

1. **Add to VectorDBService**
   ```typescript
   // In server/services/vector-db.ts
   class VectorDBService {
     async newVectorOperation(data: any) {
       try {
         const collection = await this.client.getCollection({
           name: 'collection_name',
           embeddingFunction: this.embeddingFunction
         });
         
         // Vector operation
         return result;
       } catch (error) {
         console.error('Vector operation failed:', error);
         return null;
       }
     }
   }
   ```

2. **Test Vector Operations**
   ```typescript
   // In test file
   const vectorDB = new VectorDBService();
   const result = await vectorDB.newVectorOperation(testData);
   console.log('Result:', result);
   ```

## Testing Guidelines

### Unit Tests

```typescript
// Example test file: tests/vector-db.test.ts
import { VectorDBService } from '../server/services/vector-db';

describe('VectorDBService', () => {
  let vectorDB: VectorDBService;
  
  beforeEach(() => {
    vectorDB = new VectorDBService();
  });
  
  test('should connect to ChromaDB', async () => {
    const connected = await vectorDB.testConnection();
    expect(connected).toBe(true);
  });
  
  test('should add knowledge content', async () => {
    const result = await vectorDB.addKnowledgeContent(
      'Test content',
      { category: 'test' },
      'test-id'
    );
    expect(result).toBe(true);
  });
});
```

### Integration Tests

```bash
#!/bin/bash
# tests/integration-test.sh

echo "Running integration tests..."

# Test server health
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ $response -eq 200 ]; then
  echo "✅ Server health check passed"
else
  echo "❌ Server health check failed"
  exit 1
fi

# Test vector database
response=$(curl -s -X GET "http://localhost:8080/api/coaching/vector/status")
if echo "$response" | grep -q "connected"; then
  echo "✅ Vector database connection test passed"
else
  echo "❌ Vector database connection test failed"
  exit 1
fi

echo "All integration tests passed!"
```

### API Testing

```bash
# Manual API testing script
#!/bin/bash

BASE_URL="http://localhost:8080"

echo "Testing API endpoints..."

# Test vector status
echo "1. Vector database status:"
curl -s -X GET "$BASE_URL/api/coaching/vector/status" | jq .

# Test knowledge endpoint
echo "2. Knowledge base endpoint:"
curl -s -X GET "$BASE_URL/api/coaching/knowledge" | jq .

# Test profiles endpoint
echo "3. Profiles endpoint:"
curl -s -X GET "$BASE_URL/api/coaching/profiles" | jq .

echo "API testing complete!"
```

## Debugging

### Common Issues and Solutions

1. **ChromaDB Connection Failed**
   ```bash
   # Check if container is running
   docker ps | grep chroma
   
   # Check container logs
   docker logs chroma-coaching
   
   # Restart container
   docker restart chroma-coaching
   ```

2. **Database Connection Issues**
   ```typescript
   // Add debug logging
   console.log('DATABASE_URL:', process.env.DATABASE_URL);
   
   // Test connection manually
   const testConnection = async () => {
     try {
       await db.execute('SELECT 1');
       console.log('Database connection successful');
     } catch (error) {
       console.error('Database connection failed:', error);
     }
   };
   ```

3. **TypeScript Compilation Errors**
   ```bash
   # Check TypeScript errors
   npx tsc --noEmit
   
   # Fix common issues
   npm install @types/node @types/express
   ```

4. **Vector Embedding Errors**
   ```bash
   # Check if embedding function is installed
   npm list @chroma-core/default-embed
   
   # Reinstall if needed
   npm install @chroma-core/default-embed
   ```

### Debug Logging

```typescript
// Add debug logging to vector operations
class VectorDBService {
  private debug = process.env.NODE_ENV === 'development';
  
  async addKnowledgeContent(content: string, metadata: any, id: string) {
    if (this.debug) {
      console.log('Adding knowledge content:', { id, metadata });
    }
    
    try {
      // Implementation
      if (this.debug) {
        console.log('Knowledge content added successfully:', id);
      }
    } catch (error) {
      console.error('Failed to add knowledge content:', error);
    }
  }
}
```

## Code Quality Standards

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git Hooks

```bash
# Pre-commit hook
#!/bin/sh
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Please fix errors before committing."
  exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix failing tests before committing."
  exit 1
fi

echo "Pre-commit checks passed!"
```

## Performance Optimization

### Database Performance

```sql
-- Monitor slow queries
EXPLAIN ANALYZE SELECT * FROM coach_knowledge_base WHERE category = 'team_dynamics';

-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_knowledge_category ON coach_knowledge_base(category);
CREATE INDEX CONCURRENTLY idx_profiles_user_id ON user_profiles_extended(user_id);
```

### Vector Database Performance

```typescript
// Batch operations for better performance
async addMultipleKnowledgeItems(items: KnowledgeItem[]) {
  const collection = await this.client.getCollection({
    name: 'ast_knowledge_base',
    embeddingFunction: this.embeddingFunction
  });
  
  const ids = items.map(item => item.id);
  const documents = items.map(item => item.content);
  const metadatas = items.map(item => item.metadata);
  
  await collection.add({
    ids,
    documents,
    metadatas
  });
}
```

### API Response Optimization

```typescript
// Implement response caching for expensive operations
const cache = new Map();

router.get('/expensive-operation', async (req, res) => {
  const cacheKey = `expensive-${JSON.stringify(req.query)}`;
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const result = await performExpensiveOperation(req.query);
  cache.set(cacheKey, result);
  
  // Cache for 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  res.json(result);
});
```

## Security Best Practices

### Input Validation

```typescript
import Joi from 'joi';

const knowledgeSchema = Joi.object({
  title: Joi.string().required().max(255),
  content: Joi.string().required().max(10000),
  category: Joi.string().max(100),
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  source: Joi.string().max(255)
});

router.post('/knowledge', async (req, res) => {
  const { error, value } = knowledgeSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details 
    });
  }
  
  // Process validated input
});
```

### Authentication Integration

```typescript
// Integrate with existing AST authentication
import { requireAuth, requireRole } from '../middleware/auth';

// Protected endpoint
router.post('/admin/knowledge', requireAuth, requireRole('admin'), async (req, res) => {
  // Admin-only operation
});

// User-specific endpoint
router.get('/profiles/me', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  // Return user's own profile
});
```

### Data Sanitization

```typescript
import DOMPurify from 'dompurify';

// Sanitize user input
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

router.post('/knowledge', async (req, res) => {
  const sanitizedContent = sanitizeInput(req.body.content);
  // Process sanitized content
});
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Adds content to the AST knowledge base and generates vector embeddings
 * @param content - The text content to be added
 * @param metadata - Additional metadata including category, tags, source
 * @param id - Unique identifier for the content
 * @returns Promise<boolean> - Success status of the operation
 * @throws {Error} When vector database is unavailable
 * @example
 * ```typescript
 * const success = await vectorDB.addKnowledgeContent(
 *   "Team dynamics content...",
 *   { category: "team_dynamics", source: "AST Guide" },
 *   "ast-001"
 * );
 * ```
 */
async addKnowledgeContent(
  content: string, 
  metadata: any, 
  id: string
): Promise<boolean> {
  // Implementation
}
```

### API Documentation

```typescript
/**
 * @swagger
 * /api/coaching/knowledge:
 *   post:
 *     summary: Add knowledge base content
 *     tags: [Knowledge Base]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               content:
 *                 type: string
 *                 maxLength: 10000
 *               category:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: Content added successfully
 *       400:
 *         description: Validation error
 */
```

## Future Development Roadmap

### Phase 1: Core Functionality (Completed)
- ✅ Database schema extension
- ✅ Vector database integration
- ✅ Basic API endpoints
- ✅ Development environment setup

### Phase 2: Enhanced Features
- [ ] AWS Bedrock integration for advanced embeddings
- [ ] Full CRUD operations for all endpoints
- [ ] Advanced search and filtering capabilities
- [ ] User authentication integration

### Phase 3: AI Capabilities
- [ ] Personalized coaching recommendations
- [ ] Team composition optimization
- [ ] Predictive analytics for team performance
- [ ] Natural language interaction capabilities

### Phase 4: Advanced Features
- [ ] Real-time collaboration insights
- [ ] Mobile application support
- [ ] Advanced analytics dashboard
- [ ] Machine learning model training

This development guide provides the foundation for extending and maintaining the AI Coaching System while following best practices for scalability, security, and maintainability.
