# Vector Database Service Documentation

## 🧠 ChromaDB Integration

This document covers the vector database implementation for semantic search and AI coaching capabilities in the AllStarTeams system.

## Overview

The VectorDBService provides intelligent semantic search capabilities for:
- AST methodology and coaching content
- User profile matching for team connections
- Knowledge base semantic queries
- Team compatibility analysis

## Installation & Setup

### Dependencies
```bash
npm install chromadb @chroma-core/default-embed uuid @aws-sdk/client-bedrock-runtime
npm install -D @types/uuid
```

### Docker Setup
```bash
# Start ChromaDB container
docker run -d -p 8000:8000 --name chroma-coaching chromadb/chroma

# Verify connection
curl -X GET "http://localhost:8000/api/v2/version"
```

### Environment Configuration
```bash
# .env file
CHROMA_HOST=localhost
CHROMA_PORT=8000
# Future AWS integration
AWS_BEDROCK_REGION=us-east-1
```

## Service Architecture

### Core Class: VectorDBService

```typescript
import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';

export class VectorDBService {
  private client: ChromaClient;
  private embeddingFunction: DefaultEmbeddingFunction;
  
  constructor() {
    this.client = new ChromaClient({
      host: process.env.CHROMA_HOST || 'localhost',
      port: parseInt(process.env.CHROMA_PORT || '8000')
    });
    this.embeddingFunction = new DefaultEmbeddingFunction();
  }
}
```

## Collections

### 1. AST Knowledge Base Collection
**Name**: `ast_knowledge_base`
**Purpose**: Store and search AST methodology content

```typescript
// Collection Schema
{
  name: 'ast_knowledge_base',
  metadata: { description: 'AST methodology and coaching content' },
  embeddingFunction: DefaultEmbeddingFunction
}

// Document Structure
{
  ids: [string],           // Unique identifiers
  documents: [string],     // Text content for embedding
  metadatas: [object]      // Additional metadata
}
```

**Metadata Fields**:
- `source`: Content source (e.g., "AST Methodology Guide v1.0")
- `category`: Content category ("team_dynamics", "communication", etc.)
- `tags`: Array of relevant tags
- `title`: Content title

### 2. Team Profiles Collection
**Name**: `team_profiles`
**Purpose**: Match users based on profile similarity

```typescript
// Collection Schema
{
  name: 'team_profiles',
  metadata: { description: 'Team member profiles and characteristics' },
  embeddingFunction: DefaultEmbeddingFunction
}

// Profile Text Conversion
profileText = [
  "Strengths: analytical thinking, problem-solving",
  "Challenges: delegation, time management", 
  "Values: accuracy, innovation",
  "Work Style: methodical",
  "Communication: direct"
].join('. ');
```

**Metadata Fields**:
- `name`: User identifier
- `strengths_count`: Number of strengths
- `challenges_count`: Number of challenges  
- `values_count`: Number of values
- `work_style`: Primary work style
- `communication_style`: Communication preference

## API Methods

### Connection Management

#### testConnection()
Tests ChromaDB connection and returns version info.

```typescript
async testConnection(): Promise<boolean> {
  try {
    const version = await this.client.version();
    console.log('ChromaDB connection successful, version:', version);
    return true;
  } catch (error) {
    console.error('ChromaDB connection failed:', error);
    return false;
  }
}
```

#### initializeCollections()
Creates required collections if they don't exist.

```typescript
async initializeCollections(): Promise<boolean> {
  try {
    await this.client.getOrCreateCollection({
      name: 'ast_knowledge_base',
      metadata: { description: 'AST methodology and coaching content' },
      embeddingFunction: this.embeddingFunction
    });

    await this.client.getOrCreateCollection({
      name: 'team_profiles', 
      metadata: { description: 'Team member profiles and characteristics' },
      embeddingFunction: this.embeddingFunction
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize vector collections:', error);
    return false;
  }
}
```

### Knowledge Base Operations

#### addKnowledgeContent()
Adds content to the AST knowledge base collection.

```typescript
async addKnowledgeContent(
  content: string, 
  metadata: any, 
  id: string
): Promise<boolean> {
  try {
    const collection = await this.client.getCollection({ 
      name: 'ast_knowledge_base',
      embeddingFunction: this.embeddingFunction
    });
    
    await collection.add({
      ids: [id],
      documents: [content],
      metadatas: [metadata]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to add knowledge content:', error);
    return false;
  }
}
```

**Example Usage**:
```typescript
await vectorDB.addKnowledgeContent(
  "The AST methodology focuses on understanding individual strengths...",
  { 
    source: "AST Guide v1.0", 
    category: "team_dynamics",
    title: "Foundation Principles"
  },
  "ast-001"
);
```

#### searchKnowledge()
Performs semantic search in the knowledge base.

```typescript
async searchKnowledge(query: string, limit: number = 5) {
  try {
    const collection = await this.client.getCollection({ 
      name: 'ast_knowledge_base',
      embeddingFunction: this.embeddingFunction
    });
    
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit
    });
    
    return results;
  } catch (error) {
    console.error('Failed to search knowledge base:', error);
    // Fallback response for development
    return {
      documents: [['Sample knowledge base response']],
      metadatas: [[{ source: 'development' }]],
      distances: [[0.5]]
    };
  }
}
```

**Example Usage**:
```typescript
const results = await vectorDB.searchKnowledge("team communication strategies", 3);
console.log('Found documents:', results.documents[0]);
console.log('Metadata:', results.metadatas[0]);
console.log('Similarity scores:', results.distances[0]);
```

### Team Profile Operations

#### addTeamProfile()
Adds a user profile to the team matching collection.

```typescript
async addTeamProfile(profile: any, id: string): Promise<boolean> {
  try {
    const collection = await this.client.getCollection({ 
      name: 'team_profiles',
      embeddingFunction: this.embeddingFunction
    });
    
    const profileText = this.profileToText(profile);
    
    // ChromaDB metadata must be primitives only
    const flatMetadata = {
      name: profile.name || 'Unknown',
      strengths_count: profile.strengths?.length || 0,
      challenges_count: profile.challenges?.length || 0,
      values_count: profile.values?.length || 0,
      work_style: profile.work_style || 'Unknown',
      communication_style: profile.communication_style || 'Unknown'
    };
    
    await collection.add({
      ids: [id],
      documents: [profileText],
      metadatas: [flatMetadata]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to add team profile:', error);
    return false;
  }
}
```

**Example Usage**:
```typescript
await vectorDB.addTeamProfile({
  strengths: ["analytical thinking", "problem-solving"],
  challenges: ["delegation", "time management"],
  values: ["accuracy", "innovation"],
  work_style: "methodical",
  communication_style: "direct"
}, "user-123");
```

#### findSimilarTeams()
Finds similar team members based on profile characteristics.

```typescript
async findSimilarTeams(targetProfile: any, limit: number = 3) {
  try {
    const collection = await this.client.getCollection({ 
      name: 'team_profiles',
      embeddingFunction: this.embeddingFunction
    });
    
    const profileText = this.profileToText(targetProfile);
    
    const results = await collection.query({
      queryTexts: [profileText],
      nResults: limit
    });
    
    return results;
  } catch (error) {
    console.error('Failed to find similar teams:', error);
    // Development fallback
    return {
      documents: [['Sample team profile match']],
      metadatas: [[{ name: 'Development Team', similarity: 0.8 }]],
      distances: [[0.2]]
    };
  }
}
```

## Utility Methods

### profileToText()
Converts profile object to searchable text for embeddings.

```typescript
private profileToText(profile: any): string {
  const parts = [];
  if (profile.strengths) parts.push(`Strengths: ${profile.strengths.join(', ')}`);
  if (profile.challenges) parts.push(`Challenges: ${profile.challenges.join(', ')}`);
  if (profile.values) parts.push(`Values: ${profile.values.join(', ')}`);
  if (profile.work_style) parts.push(`Work Style: ${profile.work_style}`);
  if (profile.communication_style) parts.push(`Communication: ${profile.communication_style}`);
  return parts.join('. ');
}
```

## Testing

### Basic Connection Test
```typescript
const vectorDB = new VectorDBService();
const connected = await vectorDB.testConnection();
console.log('Connection status:', connected);
```

### Complete Integration Test
```bash
npx tsx test-vector-db.ts
```

### Test Results Structure
```typescript
// Search results format
{
  documents: [['document1', 'document2']],     // Found text content
  metadatas: [[{metadata1}, {metadata2}]],    // Associated metadata
  distances: [[0.1, 0.3]]                     // Similarity scores (lower = more similar)
}
```

## Performance Considerations

### Embedding Generation
- **Current**: DefaultEmbeddingFunction (basic similarity)
- **Future**: AWS Bedrock Titan embeddings (advanced semantic understanding)
- **Batch Processing**: Consider batch operations for large data sets

### Query Optimization
- **Result Limits**: Use appropriate `nResults` limits (3-10 typically sufficient)
- **Metadata Filtering**: Future enhancement for category-specific searches
- **Caching**: Consider caching frequent queries

## Error Handling

### Connection Failures
- Graceful degradation with fallback responses
- Retry logic for temporary network issues
- Health check endpoints for monitoring

### Data Validation
- Metadata must contain only primitives (string, number, boolean)
- Text content should be meaningful for embedding generation
- ID uniqueness validation

## Integration with Express API

### Route Setup
```typescript
import { VectorDBService } from '../services/vector-db.js';

const router = Router();
const vectorDB = new VectorDBService();

// Status endpoint
router.get('/vector/status', async (req, res) => {
  const connected = await vectorDB.testConnection();
  res.json({ 
    status: connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Initialize endpoint
router.post('/vector/init', async (req, res) => {
  const success = await vectorDB.initializeCollections();
  res.json({ success, message: success ? 'Vector DB initialized' : 'Failed' });
});
```

## Future Enhancements

### AWS Bedrock Integration
```typescript
// Planned enhancement
private async generateEmbedding(text: string): Promise<number[]> {
  const client = new BedrockRuntimeClient({ region: 'us-east-1' });
  // Implementation for Titan embeddings
}
```

### Advanced Filtering
```typescript
// Planned enhancement
async searchKnowledgeByCategory(query: string, category: string, limit: number = 5) {
  // Metadata filtering capabilities
}
```

### Batch Operations
```typescript
// Planned enhancement
async addMultipleKnowledgeItems(items: KnowledgeItem[]) {
  // Bulk insertion for efficiency
}
```

## Troubleshooting

### Common Issues

1. **ChromaDB Container Not Running**
   ```bash
   docker ps | grep chroma
   docker start chroma-coaching
   ```

2. **Embedding Function Errors**
   - Ensure `@chroma-core/default-embed` is installed
   - Check embedding function is passed to getCollection calls

3. **Metadata Validation Errors**
   - Ensure metadata contains only primitives
   - Avoid nested objects or arrays in metadata

4. **Connection Timeouts**
   - Verify ChromaDB container is accessible
   - Check network connectivity and port availability

### Debug Mode
```typescript
// Enable debug logging
const vectorDB = new VectorDBService();
await vectorDB.testConnection(); // Will log version info
```

This vector database service provides the foundation for intelligent semantic search and team matching capabilities in the AI coaching system.
