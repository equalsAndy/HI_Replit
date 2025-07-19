# AI Coaching System Documentation

## 🎯 Overview

The AI Coaching System is a comprehensive platform built on top of the AllStarTeams (AST) methodology to provide intelligent coaching recommendations, team matching, and knowledge management. The system leverages vector databases for semantic search and machine learning capabilities for personalized coaching experiences.

## 🏗️ System Architecture

### Core Components

1. **Express.js Server** - Main application server with RESTful API
2. **PostgreSQL Database** - Primary data storage with extended coaching schema
3. **ChromaDB Vector Database** - Semantic search and AI embeddings
4. **React Client** - Frontend application (existing AST system)
5. **AWS Infrastructure** - Cloud deployment and services

### Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (AWS RDS/Lightsail), ChromaDB
- **ORM**: Drizzle ORM
- **Vector DB**: ChromaDB with default embeddings
- **Deployment**: Docker, AWS Lightsail
- **Development**: TSX, Vite, npm

## 📊 Database Schema

### Existing Tables (AST System)
- `users` - User accounts and authentication
- `assessments` - Star Card and other assessment results
- `user_progress` - Workshop progress tracking
- `videos` - AST methodology content
- `session_aws` - Express session storage

### New Coaching Tables

#### 1. `coach_knowledge_base`
```sql
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
```
**Purpose**: Store AST methodology content, coaching guides, and knowledge articles for semantic search.

#### 2. `user_profiles_extended`
```sql
CREATE TABLE user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    strengths TEXT[],
    challenges TEXT[],
    values TEXT[],
    work_style VARCHAR(100),
    communication_style VARCHAR(100),
    goals TEXT[],
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Extended user profiles for detailed coaching and team matching.

#### 3. `coaching_sessions`
```sql
CREATE TABLE coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    session_type VARCHAR(100),
    content JSONB,
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Track coaching sessions, recommendations, and user interactions.

#### 4. `connection_suggestions`
```sql
CREATE TABLE connection_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    suggested_user_id INTEGER REFERENCES users(id),
    similarity_score DECIMAL(3,2),
    reasoning TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: AI-generated team member connection suggestions based on compatibility.

#### 5. `vector_embeddings`
```sql
CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID,
    content_type VARCHAR(100),
    embedding_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Store vector embeddings metadata and references for semantic search.

## 🔌 API Endpoints

### Vector Database Endpoints
- `POST /api/coaching/vector/init` - Initialize ChromaDB collections
- `GET /api/coaching/vector/status` - Check vector database connection

### Knowledge Management
- `GET /api/coaching/knowledge` - Retrieve knowledge base entries
- `POST /api/coaching/knowledge` - Add new knowledge content
- `GET /api/coaching/knowledge/search` - Semantic search in knowledge base

### User Profiles
- `GET /api/coaching/profiles` - Get user profiles
- `POST /api/coaching/profiles` - Create/update user profile
- `GET /api/coaching/profiles/:id` - Get specific user profile

### System Administration
- `POST /create-coaching-tables` - Create all coaching tables (one-time setup)

## 🧠 Vector Database (ChromaDB)

### Collections

#### 1. `ast_knowledge_base`
- **Purpose**: AST methodology content and coaching materials
- **Embedding Function**: DefaultEmbeddingFunction
- **Content**: Text documents with metadata
- **Use Case**: Semantic search for coaching recommendations

#### 2. `team_profiles`
- **Purpose**: User profile embeddings for team matching
- **Embedding Function**: DefaultEmbeddingFunction  
- **Content**: Processed profile text with metadata
- **Use Case**: Find similar team members and compatibility

### Vector Operations
```typescript
// Add content to knowledge base
await vectorDB.addKnowledgeContent(content, metadata, id);

// Search knowledge base
const results = await vectorDB.searchKnowledge(query, limit);

// Add team profile
await vectorDB.addTeamProfile(profile, id);

// Find similar teams
const matches = await vectorDB.findSimilarTeams(profile, limit);
```

## 🚀 Deployment

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start ChromaDB container
docker run -d -p 8000:8000 --name chroma-coaching chromadb/chroma

# Initialize system
curl -X POST "http://localhost:8080/create-coaching-tables"
curl -X POST "http://localhost:8080/api/coaching/vector/init"
```

### Production Deployment
1. **Database Setup**: Ensure PostgreSQL tables are created
2. **ChromaDB**: Deploy vector database container
3. **Environment Variables**: Configure all required variables
4. **Docker Build**: Use existing Dockerfile configuration
5. **AWS Lightsail**: Deploy to existing container service

### Environment Variables
```bash
# Required for AI Coaching System
DATABASE_URL=postgresql://...
SESSION_SECRET=...
CHROMA_HOST=localhost
CHROMA_PORT=8000
AWS_BEDROCK_REGION=us-east-1  # Future use
```

## 🔧 Development Guide

### File Structure
```
server/
├── routes/
│   ├── coaching-routes.ts     # Main coaching API routes
│   └── coaching-routes-complex.ts  # Full implementation (with DB queries)
├── services/
│   ├── vector-db.ts          # ChromaDB service
│   └── vector-db-placeholder.ts    # Backup placeholder
└── index.ts                  # Main server with coaching integration

shared/
└── schema.ts                 # Extended with coaching tables

tests/
├── test-vector-db.ts         # Vector database tests
├── test-coaching-system.sh   # Integration tests
└── final-test.sh             # Complete system verification
```

### Key Classes

#### VectorDBService
```typescript
class VectorDBService {
  // Initialize ChromaDB collections
  async initializeCollections(): Promise<boolean>
  
  // Test connection
  async testConnection(): Promise<boolean>
  
  // Knowledge base operations
  async addKnowledgeContent(content: string, metadata: any, id: string)
  async searchKnowledge(query: string, limit?: number)
  
  // Team profile operations
  async addTeamProfile(profile: any, id: string)
  async findSimilarTeams(targetProfile: any, limit?: number)
}
```

## 🧪 Testing

### Integration Tests
Run comprehensive system tests:
```bash
./final-test.sh
```

### Individual Component Tests
```bash
# Vector database
npx tsx test-vector-db.ts

# API endpoints
curl -X GET "http://localhost:8080/api/coaching/vector/status"
```

## 🔮 Future Development

### Phase 1: AWS Bedrock Integration
- Replace default embeddings with AWS Bedrock Titan
- Implement advanced semantic search capabilities
- Add multilingual support

### Phase 2: AI Coaching Engine
- Develop coaching recommendation algorithms
- Implement personalized learning paths
- Create adaptive coaching based on user progress

### Phase 3: Team Optimization
- Advanced team composition algorithms
- Real-time collaboration insights
- Performance prediction models

### Phase 4: Analytics Dashboard
- Coaching effectiveness metrics
- Team performance analytics
- Predictive insights and recommendations

## 📋 Maintenance

### Regular Tasks
1. **Database Backups**: Ensure coaching tables are included
2. **Vector Database Maintenance**: Monitor ChromaDB performance
3. **Dependency Updates**: Keep vector database libraries current
4. **Content Updates**: Refresh AST methodology content

### Monitoring
- API endpoint health checks
- Vector database connection status
- Database query performance
- Error logging and alerting

## 🎉 Success Metrics

The AI Coaching System foundation is complete with:
- ✅ 5 new database tables created and tested
- ✅ Vector database operational with semantic search
- ✅ API infrastructure ready for coaching features
- ✅ Integration tests passing
- ✅ Development environment fully configured
- ✅ Documentation and deployment guides complete

## 📞 Support

For system issues or development questions:
1. Check integration tests: `./final-test.sh`
2. Verify database connections and table creation
3. Review server logs for error details
4. Test vector database connectivity independently
