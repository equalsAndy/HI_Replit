# ChromaDB Integration Setup

This document describes the ChromaDB setup for the HI_Replit AI coaching system.

## ✅ Status: COMPLETE

ChromaDB is successfully integrated and operational:

- **ChromaDB Server**: Running via Docker on `localhost:8000`
- **Node.js Integration**: Working via `chromadb` package v1.10.5
- **Collections**: Initialized and ready
- **API Endpoints**: Active and responding

## 🚀 Quick Start

### Start ChromaDB Server
```bash
# Using Docker (recommended)
docker run -d --name chromadb -p 8000:8000 -v $(pwd)/chromadb_data:/chroma/chroma chromadb/chroma:latest

# Using management script
./chroma-manager.sh start
```

### Start Development Server
```bash
npm run dev
```

### Test Connection
```bash
# Test ChromaDB status
curl http://localhost:8080/api/coaching/vector/status

# Initialize collections
curl -X POST http://localhost:8080/api/coaching/vector/init
```

## 🔧 Environment Configuration

Required environment variables in `.env`:
```bash
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_URL=http://localhost:8000
```

## 📊 API Endpoints

### ChromaDB Management
- **GET** `/api/coaching/vector/status` - Check ChromaDB connection
- **POST** `/api/coaching/vector/init` - Initialize collections

### Collections Created
- `ast_knowledge_base` - AST methodology and coaching content
- `team_profiles` - Team member profiles and characteristics

## 🐳 Docker Commands

```bash
# Start ChromaDB
docker run -d --name chromadb -p 8000:8000 -v $(pwd)/chromadb_data:/chroma/chroma chromadb/chroma:latest

# Check status
docker ps | grep chromadb

# View logs
docker logs chromadb

# Stop ChromaDB
docker stop chromadb

# Remove container (preserves data)
docker rm chromadb
```

## 🛠️ Management Script

Use `./chroma-manager.sh` for easy management:

```bash
./chroma-manager.sh start    # Start ChromaDB
./chroma-manager.sh status   # Check status
./chroma-manager.sh stop     # Stop ChromaDB
./chroma-manager.sh logs     # View logs
./chroma-manager.sh clean    # Remove container
```

## 💾 Data Persistence

ChromaDB data is persisted to:
- **Docker volume**: `chromadb_data/` directory
- **Location**: Same directory as project root
- **Backup**: Data survives container restarts

## 🧪 Testing

### Connection Test
```bash
# Should return: {"status":"connected","timestamp":"..."}
curl http://localhost:8080/api/coaching/vector/status
```

### Collections Test
```bash
# Should return: {"success":true,"message":"Vector DB initialized"}
curl -X POST http://localhost:8080/api/coaching/vector/init
```

## 🚨 Troubleshooting

### ChromaDB Not Starting
```bash
# Check if port 8000 is in use
lsof -i :8000

# Check Docker logs
docker logs chromadb

# Restart container
docker restart chromadb
```

### Connection Issues
```bash
# Verify container is running
docker ps | grep chromadb

# Test direct connection
curl http://localhost:8000/

# Check environment variables
echo $CHROMA_URL
```

### Development Server Issues
```bash
# Check if port 8080 is free
lsof -i :8080

# Restart development server
npm run dev
```

## 🔄 Development Workflow

1. **Start ChromaDB**: `./chroma-manager.sh start`
2. **Start Dev Server**: `npm run dev`
3. **Initialize Collections**: `curl -X POST http://localhost:8080/api/coaching/vector/init`
4. **Develop AI Features**: ChromaDB is now ready for use

## 📋 Integration Details

### VectorDBService Class
- **Location**: `server/services/vector-db.ts`
- **Initialization**: Automatic on server startup
- **Connection**: Uses environment variable `CHROMA_URL`

### Collections Schema
```typescript
// AST Knowledge Base
{
  name: 'ast_knowledge_base',
  metadata: { description: 'AST methodology and coaching content' }
}

// Team Profiles
{
  name: 'team_profiles', 
  metadata: { description: 'Team member profiles and characteristics' }
}
```

## ✅ Success Criteria Met

- [x] ChromaDB CLI accessible (via Docker)
- [x] Server running on localhost:8000
- [x] Application integration working without errors
- [x] API endpoints responding with valid data
- [x] Ready for AI coaching modal implementation

## 🎯 Next Steps

With ChromaDB operational, you can now:

1. **Implement AI coaching modal** with full vector search functionality
2. **Load AST knowledge content** into the knowledge base
3. **Add team profile matching** capabilities
4. **Enable semantic search** for coaching suggestions

## 🔐 Security Notes

- ChromaDB is running in development mode (no authentication)
- Data is persisted locally in `chromadb_data/`
- Production deployment will require proper authentication setup

---

**Status**: ✅ ChromaDB Integration Complete  
**Date**: July 20, 2025  
**Ready for**: AI Coaching Modal Implementation
