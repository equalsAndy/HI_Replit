# AI Coaching System - Copilot Prompts Archive

## 📋 Prompt History & Rollback Reference

This directory contains all Copilot prompts used to implement the AI coaching system. These prompts serve as:

- **Implementation Record**: Complete step-by-step implementation history
- **Rollback Reference**: Ability to recreate or rollback any changes
- **Documentation**: Detailed context for each implementation phase
- **Troubleshooting**: Reference for fixing issues or understanding setup

## 🔄 Prompt Sequence

### **Phase 1: Initial Database Setup**
**File**: `01-initial-database-setup.md`
**Status**: ✅ **COMPLETED**
**Description**: Extended development database with 5 new coaching tables, created API routes, and basic vector database service.

**What This Accomplished**:
- ✅ Added coaching tables to PostgreSQL schema
- ✅ Created `/api/coaching/*` endpoints  
- ✅ Integrated with existing authentication
- ✅ Database migration successful
- ✅ API routes properly connected

### **Phase 2: Dependencies & Vector Database**
**File**: `02-dependencies-vector-db.md`
**Status**: 🔄 **READY TO RUN**
**Description**: Fix npm dependency issues, install required packages, start ChromaDB, and initialize vector collections.

**What This Will Accomplish**:
- 🔧 Clean npm cache and reinstall dependencies
// // - 📦 Install chromadb, @aws-sdk/client-bedrock-runtime, uuid
- 🐳 Start ChromaDB container on port 8000
- 🔧 Initialize vector database collections
- ✅ Verify complete system functionality

## 🚨 Rollback Instructions

### **If Phase 1 Needs Rollback**:
```sql
-- Remove coaching tables (if needed)
DROP TABLE IF EXISTS vector_embeddings;
DROP TABLE IF EXISTS connection_suggestions;
DROP TABLE IF EXISTS coaching_sessions;
DROP TABLE IF EXISTS user_profiles_extended;
DROP TABLE IF EXISTS coach_knowledge_base;
```

```bash
# Remove API routes file
rm server/routes/coaching-routes.ts

# Remove vector service file  
rm server/services/vector-db.ts

# Revert server/index.ts changes (remove coaching routes import)
```

### **If Phase 2 Needs Rollback**:
```bash
# Stop and remove ChromaDB container
docker stop chroma-coaching
docker rm chroma-coaching

# Remove added dependencies
// // npm uninstall chromadb @aws-sdk/client-bedrock-runtime uuid @types/uuid

# Clean npm cache
npm cache clean --force
```

## 📊 Environment Variables Added

```bash
# Vector Database (ChromaDB)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Amazon Bedrock for Claude and embeddings
AWS_REGION=us-west-2
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1

# S3 Storage
S3_COACHING_BUCKET_STAGING=hi-coaching-staging-data
S3_COACHING_BUCKET_PRODUCTION=hi-coaching-production-data
```

## 🔧 Files Created/Modified

### **Phase 1 Changes**:
- **Modified**: `shared/schema.ts` (added 5 tables)
- **Created**: `server/routes/coaching-routes.ts`
- **Created**: `server/services/vector-db.ts` 
- **Modified**: `server/index.ts` (added coaching routes)

### **Phase 2 Changes**:
- **Modified**: `package.json` (added dependencies)
- **Modified**: `.env` (added environment variables)
- **Created**: `scripts/init-vector-db.js`
- **Modified**: `server/services/vector-db.ts` (enhanced connection testing)

## 🎯 Current Status

- **✅ Phase 1**: Database and API foundation complete
- **🔄 Phase 2**: Ready to run - fix dependencies and start vector database
- **📋 Next**: Data loading and Claude API integration

## 🚀 Next Phase Planning

After Phase 2 completion, the next prompts will cover:

**Phase 3**: Data Processing & Upload
- AST Compendium processing into vector chunks
- Lion Software team profile generation  
- Knowledge base population scripts

**Phase 4**: Claude API Integration
- Coaching conversation implementation
- Context assembly and prompt engineering
- Response processing and storage

**Phase 5**: Frontend Integration
- Chat interface components
- Team connection suggestions UI
- Holistic report generation interface

---

**All prompts preserved for rollback safety and implementation reference.**
