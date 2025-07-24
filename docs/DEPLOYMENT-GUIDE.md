# Deployment Guide

## 🚀 AI Coaching System Deployment

This guide covers deployment procedures for the AI Coaching System built on the AllStarTeams platform.

## Overview

The AI Coaching System extends the existing AST deployment with:
- Additional PostgreSQL database tables
- ChromaDB vector database container
- Extended API routes for coaching functionality
- Vector search and AI recommendation capabilities

## Prerequisites

### Existing AST Infrastructure
- ✅ AWS Lightsail container service
- ✅ PostgreSQL database (RDS or Lightsail)
- ✅ Express.js application server
- ✅ React client application
- ✅ Domain configuration and SSL

### New Requirements for AI Coaching
- 🆕 ChromaDB container deployment
- 🆕 Additional database tables
- 🆕 Vector database service integration
- 🆕 Extended environment variables

## Environment Configuration

### Required Environment Variables

```bash
# Existing AST Variables (Required)
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-session-secret-key
PORT=8080
NODE_ENV=production

# New AI Coaching Variables
CHROMA_HOST=chroma-db-container-name
CHROMA_PORT=8000
AWS_BEDROCK_REGION=us-east-1  # Future use
```

### Development Environment
```bash
# .env file for local development
DATABASE_URL=postgresql://localhost:5432/ast_development
SESSION_SECRET=development-secret-key
CHROMA_HOST=localhost
CHROMA_PORT=8000
NODE_ENV=development
```

### Production Environment
```bash
# Environment variables in AWS Lightsail
DATABASE_URL=postgresql://prod-db-host:5432/ast_production
SESSION_SECRET=secure-production-secret
CHROMA_HOST=chroma-coaching
CHROMA_PORT=8000
NODE_ENV=production
```

## Database Setup

### 1. Create Coaching Tables

**Option A: API Endpoint (Recommended)**
```bash
# After deployment, call the setup endpoint
curl -X POST "https://your-domain.com/create-coaching-tables"
```

**Option B: Direct SQL Execution**
```sql
-- Connect to your PostgreSQL database and execute:

-- 1. Knowledge Base Table
CREATE TABLE coach_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Extended User Profiles
CREATE TABLE user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    strengths TEXT[],
    challenges TEXT[],
    values TEXT[],
    work_style VARCHAR(100),
    communication_style VARCHAR(100),
    goals TEXT[],
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 3. Coaching Sessions
CREATE TABLE coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Connection Suggestions
CREATE TABLE connection_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    suggested_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    reasoning TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    CONSTRAINT no_self_suggestion CHECK (user_id != suggested_user_id)
);

-- 5. Vector Embeddings Metadata
CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    embedding_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_knowledge_category ON coach_knowledge_base(category);
CREATE INDEX idx_profiles_user_id ON user_profiles_extended(user_id);
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_connections_user_id ON connection_suggestions(user_id);
CREATE INDEX idx_embeddings_content_id ON vector_embeddings(content_id);
```

### 2. Verify Table Creation
```bash
# Test the tables were created successfully
curl -X GET "https://your-domain.com/api/coaching/knowledge"
curl -X GET "https://your-domain.com/api/coaching/profiles"
```

## ChromaDB Deployment

### Docker Compose Configuration

Create or update `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - CHROMA_HOST=chroma-coaching
      - CHROMA_PORT=8000
    depends_on:
      - chroma-coaching
    networks:
      - coaching-network

  chroma-coaching:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/data
    environment:
      - CHROMA_HOST_PORT=8000
    networks:
      - coaching-network

volumes:
  chroma_data:

networks:
  coaching-network:
    driver: bridge
```

### AWS Lightsail Container Service

**Option A: Multi-Container Service**

1. **Update Container Definition**:
```json
{
  "containers": {
    "ast-app": {
      "image": "your-registry/ast-app:latest",
      "ports": {
        "8080": "HTTP"
      },
      "environment": {
        "DATABASE_URL": "postgresql://...",
        "SESSION_SECRET": "your-secret",
        "CHROMA_HOST": "chroma-coaching",
        "CHROMA_PORT": "8000"
      }
    },
    "chroma-coaching": {
      "image": "chromadb/chroma:latest",
      "ports": {
        "8000": "HTTP"
      },
      "environment": {
        "CHROMA_HOST_PORT": "8000"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "ast-app",
    "containerPort": 8080,
    "healthCheck": {
      "path": "/health"
    }
  }
}
```

**Option B: Separate ChromaDB Service**

1. **Create ChromaDB Container Service**:
```bash
aws lightsail create-container-service \
    --service-name chroma-coaching \
    --power nano \
    --scale 1
```

2. **Deploy ChromaDB**:
```json
{
  "containers": {
    "chroma": {
      "image": "chromadb/chroma:latest",
      "ports": {
        "8000": "HTTP"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "chroma",
    "containerPort": 8000
  }
}
```

3. **Update Main App Environment**:
```bash
CHROMA_HOST=chroma-coaching-service.lightsail.amazonaws.com
CHROMA_PORT=443  # Use HTTPS in production
```

## Application Deployment

### 1. Update Dependencies

Ensure `package.json` includes new dependencies:
```json
{
  "dependencies": {
    "chromadb": "^3.0.9",
    "@chroma-core/default-embed": "^1.0.0",
    "uuid": "^11.1.0",
// //     "@aws-sdk/client-bedrock-runtime": "^3.848.0"
  },
  "devDependencies": {
    "@types/uuid": "^10.0.0"
  }
}
```

### 2. Build and Deploy

```bash
# Build the application
npm run build

# Build Docker image
docker build -t your-registry/ast-app:latest .

# Push to container registry
docker push your-registry/ast-app:latest

# Deploy to Lightsail
aws lightsail push-container-image \
    --service-name your-service-name \
    --label ast-app-latest \
    --image your-registry/ast-app:latest
```

### 3. Update Container Service

```bash
# Deploy updated container configuration
aws lightsail create-container-service-deployment \
    --service-name your-service-name \
    --containers file://container-config.json \
    --public-endpoint file://public-endpoint.json
```

## Post-Deployment Setup

### 1. Initialize Vector Database
```bash
# Initialize ChromaDB collections
curl -X POST "https://your-domain.com/api/coaching/vector/init"

# Verify vector database connectivity
curl -X GET "https://your-domain.com/api/coaching/vector/status"
```

### 2. Load Initial Data

**Option A: API Endpoints**
```bash
# Add sample knowledge base content
curl -X POST "https://your-domain.com/api/coaching/knowledge" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AST Methodology Overview",
    "content": "The AllStarTeams methodology...",
    "category": "foundation",
    "source": "AST Guide v1.0"
  }'
```

**Option B: Bulk Data Import**
```sql
-- Execute SQL scripts to populate initial data
-- Knowledge base content
-- Sample user profiles
-- Configuration data
```

### 3. Verify Deployment

Run the comprehensive test script:
```bash
# Download and run the integration test
curl -O https://your-domain.com/test-scripts/final-test.sh
chmod +x final-test.sh
./final-test.sh
```

Expected output:
```
🎯 AI Coaching System - Final Integration Test
==============================================

1. 🔍 Testing Vector Database Connection...
{"status":"connected","timestamp":"2025-07-19T06:15:00.447Z"}

2. 🚀 Ensuring Vector Collections are Initialized...
{"success":true,"message":"Vector DB initialized"}

3. 📊 Creating Database Tables...
{"success":true,"message":"Coaching system tables created successfully"...

✅ AI Coaching System Integration Test Complete!
```

## Monitoring and Health Checks

### Health Check Endpoints

Update your health check to include coaching system status:

```typescript
// Add to existing health check endpoint
app.get('/health', async (req, res) => {
  const checks = {
    server: 'healthy',
    database: 'unknown',
    vectorDB: 'unknown',
    timestamp: new Date().toISOString()
  };

  try {
    // Test database connection
    await db.execute('SELECT 1');
    checks.database = 'healthy';
  } catch (error) {
    checks.database = 'unhealthy';
  }

  try {
    // Test vector database connection
    const vectorDB = new VectorDBService();
    const connected = await vectorDB.testConnection();
    checks.vectorDB = connected ? 'healthy' : 'unhealthy';
  } catch (error) {
    checks.vectorDB = 'unhealthy';
  }

  const isHealthy = Object.values(checks).every(
    status => status === 'healthy' || status === new Date().toISOString()
  );

  res.status(isHealthy ? 200 : 503).json(checks);
});
```

### Monitoring Recommendations

1. **Application Monitoring**:
   - Monitor `/health` endpoint
   - Track API response times
   - Monitor memory usage (vector operations can be memory intensive)

2. **Database Monitoring**:
   - PostgreSQL connection pool health
   - Query performance for new coaching tables
   - Storage usage growth

3. **Vector Database Monitoring**:
   - ChromaDB container health
   - Vector operation response times
   - Collection size and growth

### Logging Configuration

```typescript
// Enhanced logging for coaching system
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log coaching system operations
logger.info('Vector database initialized', { service: 'coaching' });
logger.error('Failed to add knowledge content', { error, contentId });
```

## Troubleshooting

### Common Issues

1. **ChromaDB Connection Failed**
   ```bash
   # Check container status
   docker ps | grep chroma
   
   # Check container logs
   docker logs chroma-coaching
   
   # Restart container
   docker restart chroma-coaching
   ```

2. **Database Table Creation Failed**
   ```bash
   # Check database permissions
   # Ensure user has CREATE TABLE privileges
   # Verify DATABASE_URL is correct
   ```

3. **API Endpoints Not Responding**
   ```bash
   # Check application logs
   docker logs your-app-container
   
   # Verify routing configuration
   curl -X GET "https://your-domain.com/api/coaching/vector/status"
   ```

4. **Vector Operations Timeout**
   ```bash
   # Check ChromaDB resource allocation
   # Monitor memory usage
   # Consider scaling ChromaDB container
   ```

### Rollback Procedures

1. **Application Rollback**:
   ```bash
   # Deploy previous container version
   aws lightsail create-container-service-deployment \
       --service-name your-service-name \
       --containers file://previous-config.json
   ```

2. **Database Rollback**:
   ```sql
   -- Remove coaching tables if needed
   DROP TABLE IF EXISTS vector_embeddings;
   DROP TABLE IF EXISTS connection_suggestions;
   DROP TABLE IF EXISTS coaching_sessions;
   DROP TABLE IF EXISTS user_profiles_extended;
   DROP TABLE IF EXISTS coach_knowledge_base;
   ```

3. **ChromaDB Rollback**:
   ```bash
   # Remove ChromaDB container
   docker stop chroma-coaching
   docker rm chroma-coaching
   ```

## Security Considerations

### Network Security
- Ensure ChromaDB is not publicly accessible
- Use internal networking between containers
- Configure proper firewall rules

### Data Security
- Encrypt sensitive coaching data
- Implement proper access controls
- Regular security audits for new endpoints

### API Security
- Rate limiting for vector operations
- Authentication for all coaching endpoints
- Input validation and sanitization

## Performance Optimization

### Database Optimization
- Monitor query performance on new tables
- Optimize indexes based on usage patterns
- Consider partitioning for large datasets

### Vector Database Optimization
- Monitor embedding generation performance
- Optimize collection size and structure
- Consider batch operations for large datasets

### Application Optimization
- Cache frequent vector searches
- Optimize API response payloads
- Monitor memory usage for vector operations

## Backup and Disaster Recovery

### Database Backups
```bash
# Include coaching tables in backup routine
pg_dump --include-table=coach_knowledge_base \
        --include-table=user_profiles_extended \
        --include-table=coaching_sessions \
        --include-table=connection_suggestions \
        --include-table=vector_embeddings \
        your-database > coaching-backup.sql
```

### ChromaDB Backups
```bash
# Backup ChromaDB data volume
docker run --rm -v chroma_data:/data -v $(pwd):/backup \
    ubuntu tar czf /backup/chroma-backup.tar.gz /data
```

### Recovery Procedures
1. Restore database from backup
2. Restore ChromaDB data volume
3. Redeploy application containers
4. Reinitialize vector collections
5. Verify system functionality

This deployment guide ensures a smooth rollout of the AI coaching system while maintaining the existing AST platform functionality.
