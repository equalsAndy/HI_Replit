# Copilot Prompt: Install Dependencies & Setup Vector Database

## 🎯 Task Overview
Fix npm dependency issues and install required packages for the AI coaching system. Set up ChromaDB vector database and verify the complete system is ready for data loading.

## 📋 Current Situation
- ✅ Database schema and API routes are successfully implemented
- ❌ npm install failing with ENOTEMPTY errors (corrupted node_modules)
- ❌ Missing dependencies: chromadb, @aws-sdk/client-bedrock-runtime, uuid
- ❌ Vector database (ChromaDB) not yet started

## 🛠️ Implementation Steps

### Step 1: Fix npm Dependencies
```bash
# Clean npm cache and node_modules
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall all dependencies fresh
npm install

# Add required coaching system dependencies
npm install chromadb uuid @aws-sdk/client-bedrock-runtime
npm install -D @types/uuid
```

### Step 2: Verify Dependencies Installation
```bash
# Check that new packages are installed
npm list chromadb
npm list @aws-sdk/client-bedrock-runtime
npm list uuid

# Verify package.json was updated
grep -A 5 -B 5 "chromadb\|@aws-sdk/client-bedrock-runtime" package.json
```

### Step 3: Update Environment Variables
**Add to `.env` file** (if not already present):
```bash
# Vector Database (ChromaDB)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Amazon Bedrock for Claude and embeddings
AWS_REGION=us-west-2
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1

# S3 Storage (already configured)
S3_COACHING_BUCKET_STAGING=hi-coaching-staging-data
S3_COACHING_BUCKET_PRODUCTION=hi-coaching-production-data
```

### Step 4: Start ChromaDB Vector Database
```bash
# Start ChromaDB container (detached mode)
docker run -d -p 8000:8000 --name chroma-coaching chromadb/chroma

# Verify container is running
docker ps | grep chroma

# Test ChromaDB health endpoint
curl http://localhost:8000/api/v1/heartbeat
# Should respond with: {"nanosecond heartbeat": <timestamp>}
```

### Step 5: Update Vector Database Service
**Modify file**: `server/services/vector-db.ts`

Ensure the vector database service can connect properly:
```typescript
// Add error handling for connection
constructor() {
  this.client = new ChromaApi({
    host: process.env.CHROMA_HOST || 'localhost',
    port: parseInt(process.env.CHROMA_PORT || '8000'),
  });
  
  this.bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-west-2',
    // Add credentials if needed for development
  });
}

// Add connection test method
async testConnection() {
  try {
    const heartbeat = await fetch(`http://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || '8000'}/api/v1/heartbeat`);
    console.log('✅ ChromaDB connection successful');
    return true;
  } catch (error) {
    console.error('❌ ChromaDB connection failed:', error);
    return false;
  }
}
```

### Step 6: Test Complete System
```bash
# Start development server
npm run dev

# Test API endpoints (in another terminal)
curl -X GET http://localhost:8080/api/coaching/knowledge-base \
  -H "Cookie: $(cat cookies.txt)" # If you have auth cookies

# Or test in browser:
# http://localhost:8080/api/coaching/knowledge-base
```

### Step 7: Initialize Vector Database Collections
**Create new file**: `scripts/init-vector-db.js`

```javascript
const { vectorDB } = require('../server/services/vector-db');

async function initializeVectorDB() {
  try {
    console.log('🔧 Initializing ChromaDB collections...');
    
    // Test connection first
    const connected = await vectorDB.testConnection();
    if (!connected) {
      throw new Error('Cannot connect to ChromaDB');
    }
    
    // Initialize collections
    await vectorDB.initializeCollections();
    
    console.log('✅ Vector database initialization complete');
    console.log('📊 Collections created:');
    console.log('  - ast_knowledge_base (AST methodology & coaching patterns)');
    console.log('  - team_profiles (user expertise & collaboration data)');
    
  } catch (error) {
    console.error('❌ Vector database initialization failed:', error);
  }
}

initializeVectorDB();
```

**Run the initialization script**:
```bash
node scripts/init-vector-db.js
```

## ✅ Success Criteria

After completion, verify:

1. **✅ Dependencies Installed**
   - `npm list chromadb` shows installed version
   - `npm list @aws-sdk/client-bedrock-runtime` shows installed version
   - No npm errors when running `npm install`

2. **✅ ChromaDB Running**
   - `docker ps` shows chroma-coaching container running
   - `curl http://localhost:8000/api/v1/heartbeat` returns success
   - No connection errors in logs

3. **✅ API System Working**
   - `npm run dev` starts without errors
   - Vector database service loads successfully
   - Coaching API endpoints respond (with auth)

4. **✅ Vector Collections Initialized**
   - ast_knowledge_base collection created
   - team_profiles collection created
   - No initialization errors

## 🚀 Ready for Next Phase

Once complete, the system will be ready for:
- Uploading AST Compendium content
- Loading Lion Software team profiles
- Testing Claude API integration
- Generating coaching conversations

## 📊 Troubleshooting

If issues persist:
- **Docker not running**: Start Docker Desktop
- **Port conflicts**: Use `docker ps` to check port 8000
- **AWS credentials**: Add to .env or configure AWS CLI
- **Network issues**: Check firewall settings for ports 8000, 8080

**Focus**: This setup prepares the foundation for AI coaching system data loading and testing.
