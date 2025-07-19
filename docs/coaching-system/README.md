# AI Coaching System - Project Documentation

## 🎯 Project Overview

The AI Coaching System is a comprehensive enhancement to the AllStarTeams (AST) workshop platform that provides:

1. **Individual AI Coach**: Personalized coaching conversations using Claude API
2. **Team Connection Engine**: Intelligent suggestions for collaboration based on strengths
3. **Holistic Report Generation**: AI-powered comprehensive development reports
4. **Workshop AI Assistant**: Guided reflection during workshop completion

## 🏗️ System Architecture

### **Core Components**
- **PostgreSQL Database**: Extended user profiles, coaching sessions, knowledge base
- **Vector Database (ChromaDB)**: AST methodology, team profiles, coaching patterns
- **Claude API (Bedrock)**: Conversational AI and report generation
- **S3 Storage**: Training documents, test data, company profiles

### **Dual Environment Setup**
- **Development**: AWS Lightsail PostgreSQL + local/S3 test data
- **Staging**: Separate AWS Lightsail PostgreSQL + S3 staging data
- **Production**: Separate AWS Lightsail PostgreSQL + S3 production data

## 📊 Data Sources

### **AST Workshop Data (Existing)**
- Star Card strengths (thinking, planning, feeling, acting)
- Flow assessment scores and attributes
- Well-being ladder positions (current/future)
- Step-by-step reflections and insights
- Future self visioning and growth plans

### **Coaching System Data (New)**
- Extended user profiles with expertise/collaboration preferences
- Coaching conversation sessions with context tracking
- Team connection suggestions and responses
- Knowledge base content (methodology, coaching patterns)

### **Test Data**
- **Lion Software**: Fake company with 25+ employee profiles
- **AST Compendium**: 38-page methodology document
- **Coaching Examples**: Sample conversations and response patterns

## 🤖 AI Integration Points

### **1. Individual Coach**
- **Input**: User's AST data + current challenge/question
- **Process**: Vector search AST methodology + generate Claude response
- **Output**: Helpful colleague-style coaching conversation
- **Persona**: Subtle, natural, never diagnostic or assessment-focused

### **2. Team Connector**
- **Input**: User's expertise needs + available team members
- **Process**: Vector search team profiles + strength matching
- **Output**: "You might want to chat with Sarah from Product..."
- **Focus**: Tactical work, problem-solving, collaboration opportunities

### **3. Holistic Reports**
- **Input**: Completed AST workshop data
- **Process**: Combine workshop data + AST methodology via Claude
- **Output**: 5-6 page personalized PDF report
- **Features**: Strengths analysis, growth planning, team integration

### **4. Workshop Assistant**
- **Input**: Reflection prompts + user's partial responses
- **Process**: Guide deeper reflection without providing answers
- **Output**: Socratic questions, example prompts, gentle guidance
- **Boundary**: Never answers FOR them, only helps them reflect

## 🗄️ Database Schema Extensions

### **New Tables Added**
```sql
coach_knowledge_base     -- AST methodology, coaching patterns
user_profiles_extended   -- Team info, expertise, collaboration prefs
coaching_sessions        -- Conversation history and context
connection_suggestions   -- Team collaboration recommendations
vector_embeddings        -- Links to vector database entries
```

## 🔄 Data Flow Architecture

```
Workshop Completion
    ↓
Individual AST Data (PostgreSQL)
    ↓
Vector Knowledge Base (ChromaDB)
    ↓
Claude API (Bedrock)
    ↓
Coaching Response/Report/Connection
    ↓
Session Storage (PostgreSQL)
```

## 📁 File Organization

```
/docs/
├── coaching-system/
│   ├── README.md (this file)
│   ├── database/
│   ├── vector-db/
│   ├── api-endpoints/
│   └── data-flow/
├── architecture/
├── development/
├── features/
└── deployment/

/coaching-data/
├── source-files/        # Local development files
└── processed/           # Processed for database insertion

/server/
├── routes/
│   └── coaching-routes.ts
├── services/
│   └── vector-db.ts
└── middleware/

S3 Buckets:
├── hi-coaching-staging-data/
└── hi-coaching-production-data/
```

## 🚀 Implementation Status

### ✅ Completed
- [x] Database schema design
- [x] S3 bucket creation and testing
- [x] Basic API route structure
- [x] Vector database service foundation
- [x] Environment configuration

### 🔄 In Progress
- [ ] Copilot implementation of database extensions
- [ ] AST Compendium processing and upload
- [ ] Lion Software test data creation
- [ ] Claude API integration

### 📋 Next Steps
1. **Database Migration**: Apply schema changes to development DB
2. **Test Data Upload**: Process and upload Lion Software profiles
3. **Vector Database Setup**: ChromaDB + Bedrock embeddings
4. **Claude Integration**: Coaching conversation API
5. **Frontend Interface**: Chat UI and report generation

## 🔧 Development Environment

### **Required Dependencies**
```bash
npm install chromadb uuid @aws-sdk/client-bedrock-runtime
npm install -D @types/uuid
```

### **Environment Variables**
```bash
# Vector Database
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Amazon Bedrock
AWS_REGION=us-west-2
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1

# S3 Storage
S3_COACHING_BUCKET_STAGING=hi-coaching-staging-data
S3_COACHING_BUCKET_PRODUCTION=hi-coaching-production-data
```

### **Development Commands**
```bash
# Database migration
npx drizzle-kit push:pg

# Start vector database
docker run -p 8000:8000 chromadb/chroma

# Start development server
npm run dev

# Upload test data to S3
aws s3 sync coaching-data/source-files/ s3://hi-coaching-staging-data/
```

## 📊 Success Metrics

### **Technical Metrics**
- Vector search relevance and speed
- Claude API response quality and latency
- Database query performance
- S3 upload/download reliability

### **User Experience Metrics**
- Coaching conversation naturalness
- Team connection accuracy
- Report personalization quality
- Workshop assistance effectiveness

## 🔐 Security Considerations

### **Data Privacy**
- User workshop data remains in secure PostgreSQL
- Coaching conversations stored with user consent
- Team profiles opt-in for connection suggestions
- AWS IAM roles for service access

### **AI Safety**
- Claude responses bounded by coaching persona
- Vector search limited to approved knowledge base
- No sensitive personal data in embeddings
- Audit trail for all AI interactions

## 📞 Integration Points

### **Existing AST Platform**
- User authentication system
- Workshop completion triggers
- Profile and progress pages
- Navigation and routing

### **External Services**
- AWS Bedrock for Claude API
- ChromaDB for vector search
- S3 for document storage
- AWS Lightsail for databases

---

**Last Updated**: July 18, 2025
**Version**: 1.0
**Status**: Development Phase - Database Design Complete
