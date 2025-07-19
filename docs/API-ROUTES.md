# API Routes Documentation

## 🚀 Coaching API Endpoints

This document covers all API endpoints for the AI Coaching System built on the AllStarTeams platform.

## Base URL
```
Development: http://localhost:8080/api/coaching
Production: https://your-domain.com/api/coaching
```

## Authentication
Most endpoints require user authentication through the existing AST session system. Authenticated routes check for:
- Valid session cookie
- User role permissions (admin, facilitator, participant)

## Vector Database Endpoints

### Initialize Vector Collections
**POST** `/vector/init`

Initializes ChromaDB collections for the AI coaching system.

**Request:**
```bash
curl -X POST "http://localhost:8080/api/coaching/vector/init"
```

**Response:**
```json
{
  "success": true,
  "message": "Vector DB initialized"
}
```

**Status Codes:**
- `200`: Collections initialized successfully
- `500`: Failed to initialize collections

---

### Check Vector Database Status
**GET** `/vector/status`

Checks the connection status of the ChromaDB vector database.

**Request:**
```bash
curl -X GET "http://localhost:8080/api/coaching/vector/status"
```

**Response:**
```json
{
  "status": "connected",
  "timestamp": "2025-07-19T06:07:17.918Z"
}
```

**Response Fields:**
- `status`: "connected" or "disconnected"
- `timestamp`: ISO timestamp of the check

**Status Codes:**
- `200`: Status check successful
- `500`: Failed to check vector database

## Knowledge Base Endpoints

### Get Knowledge Base Entries
**GET** `/knowledge`

Retrieves knowledge base entries with optional filtering.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 10)
- `category` (optional): Filter by content category
- `search` (optional): Text search in title/content

**Request:**
```bash
curl -X GET "http://localhost:8080/api/coaching/knowledge?limit=5&category=team_dynamics"
```

**Response:**
```json
{
  "message": "Knowledge base endpoint working",
  "status": "development",
  "timestamp": "2025-07-19T06:15:01.036Z"
}
```

*Note: Full implementation with database queries pending.*

---

### Add Knowledge Content
**POST** `/knowledge`

Adds new content to the knowledge base and vector database.

**Request Body:**
```json
{
  "title": "AST Team Dynamics Foundation",
  "content": "The All Stars Team methodology focuses on understanding individual strengths...",
  "category": "team_dynamics",
  "tags": ["foundation", "team-building", "psychology"],
  "source": "AST Methodology Guide v1.0"
}
```

**Request:**
```bash
curl -X POST "http://localhost:8080/api/coaching/knowledge" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Effective Communication",
    "content": "Teams succeed when members understand communication styles...",
    "category": "communication",
    "tags": ["communication", "collaboration"],
    "source": "AST Communication Guide"
  }'
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-generated",
  "message": "Knowledge content added successfully",
  "vectorAdded": true
}
```

**Status Codes:**
- `201`: Content added successfully
- `400`: Invalid request data
- `500`: Server error

---

### Search Knowledge Base
**GET** `/knowledge/search`

Performs semantic search in the knowledge base using vector similarity.

**Query Parameters:**
- `q` (required): Search query text
- `limit` (optional): Number of results (default: 5)
- `category` (optional): Filter by category

**Request:**
```bash
curl -X GET "http://localhost:8080/api/coaching/knowledge/search?q=team%20communication&limit=3"
```

**Response:**
```json
{
  "query": "team communication",
  "results": [
    {
      "id": "uuid-1",
      "title": "Communication Strategies",
      "content": "Effective team communication requires...",
      "category": "communication",
      "similarity": 0.85,
      "metadata": {
        "source": "AST Guide",
        "tags": ["communication", "teams"]
      }
    }
  ],
  "totalFound": 1,
  "searchTime": "0.045s"
}
```

**Status Codes:**
- `200`: Search completed
- `400`: Missing query parameter
- `500`: Search error

## User Profile Endpoints

### Get User Profiles
**GET** `/profiles`

Retrieves extended user profiles for coaching.

**Query Parameters:**
- `limit` (optional): Number of profiles to return (default: 10)
- `userId` (optional): Specific user ID filter

**Request:**
```bash
curl -X GET "http://localhost:8080/api/coaching/profiles?limit=5"
```

**Response:**
```json
{
  "message": "Profiles endpoint working",
  "status": "development", 
  "timestamp": "2025-07-19T06:15:01.061Z"
}
```

*Note: Full implementation with database queries pending.*

---

### Create/Update User Profile
**POST** `/profiles`

Creates or updates a user's extended coaching profile.

**Request Body:**
```json
{
  "strengths": ["analytical thinking", "problem-solving", "attention to detail"],
  "challenges": ["delegation", "time management"],
  "values": ["accuracy", "innovation", "continuous learning"],
  "work_style": "methodical",
  "communication_style": "direct",
  "goals": ["improve leadership skills", "enhance team collaboration"],
  "preferences": {
    "feedback_frequency": "weekly",
    "learning_style": "hands-on",
    "meeting_preference": "structured"
  }
}
```

**Request:**
```bash
curl -X POST "http://localhost:8080/api/coaching/profiles" \
  -H "Content-Type: application/json" \
  -d '{
    "strengths": ["empathy", "active listening"],
    "challenges": ["assertiveness", "decision-making"],
    "values": ["collaboration", "inclusivity"],
    "work_style": "collaborative",
    "communication_style": "supportive"
  }'
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-generated",
  "message": "Profile created successfully",
  "vectorAdded": true
}
```

**Status Codes:**
- `201`: Profile created
- `200`: Profile updated
- `400`: Invalid profile data
- `401`: Authentication required
- `500`: Server error

---

### Get Specific User Profile
**GET** `/profiles/:id`

Retrieves a specific user's coaching profile.

**Parameters:**
- `id`: User profile UUID

**Request:**
```bash
curl -X GET "http://localhost:8080/api/coaching/profiles/uuid-123"
```

**Response:**
```json
{
  "id": "uuid-123",
  "userId": 42,
  "strengths": ["analytical thinking", "problem-solving"],
  "challenges": ["delegation", "time management"],
  "values": ["accuracy", "innovation"],
  "work_style": "methodical",
  "communication_style": "direct",
  "goals": ["improve leadership"],
  "preferences": {
    "feedback_frequency": "weekly",
    "learning_style": "hands-on"
  },
  "created_at": "2025-07-18T10:30:00Z",
  "updated_at": "2025-07-19T06:15:00Z"
}
```

## Connection/Matching Endpoints

### Find Similar Team Members
**GET** `/connections/similar`

Finds team members with similar profiles for collaboration opportunities.

**Query Parameters:**
- `userId` (optional): Base user for comparison (defaults to session user)
- `limit` (optional): Number of matches to return (default: 3)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/coaching/connections/similar?limit=5"
```

**Response:**
```json
{
  "baseUser": {
    "id": "uuid-123",
    "name": "Current User"
  },
  "matches": [
    {
      "id": "uuid-456",
      "userId": 78,
      "name": "Jane Smith",
      "similarity": 0.92,
      "commonStrengths": ["analytical thinking", "problem-solving"],
      "complementarySkills": ["leadership", "public speaking"],
      "reasoning": "High compatibility in analytical approach with complementary leadership skills"
    }
  ],
  "totalMatches": 1,
  "searchTime": "0.123s"
}
```

---

### Create Connection Suggestion
**POST** `/connections/suggest`

Creates a suggested connection between team members.

**Request Body:**
```json
{
  "targetUserId": 78,
  "reasoning": "Complementary skills in analytics and leadership",
  "confidence": 0.85
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-connection",
  "message": "Connection suggestion created",
  "status": "pending"
}
```

## Coaching Session Endpoints

### Create Coaching Session
**POST** `/sessions`

Records a coaching session with recommendations.

**Request Body:**
```json
{
  "sessionType": "individual_coaching",
  "content": {
    "focus_areas": ["communication", "leadership"],
    "assessments_completed": ["star_card"],
    "discussion_points": ["team dynamics", "conflict resolution"]
  },
  "recommendations": [
    "Practice active listening techniques",
    "Observe team communication patterns",
    "Schedule follow-up in 2 weeks"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-session",
  "message": "Coaching session recorded",
  "nextSteps": ["follow_up_scheduled"]
}
```

---

### Get Coaching Sessions
**GET** `/sessions`

Retrieves coaching session history for a user.

**Query Parameters:**
- `userId` (optional): Specific user (admin/facilitator only)
- `limit` (optional): Number of sessions (default: 10)
- `sessionType` (optional): Filter by session type

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid-session",
      "sessionType": "individual_coaching",
      "content": {...},
      "recommendations": [...],
      "created_at": "2025-07-19T10:00:00Z"
    }
  ],
  "totalSessions": 1
}
```

## System Administration Endpoints

### Create Coaching Tables
**POST** `/create-coaching-tables`

One-time setup endpoint to create all coaching system database tables.

**Request:**
```bash
curl -X POST "http://localhost:8080/create-coaching-tables"
```

**Response:**
```json
{
  "success": true,
  "message": "Coaching system tables created successfully",
  "results": [
    "✅ Table created successfully",
    "✅ Table created successfully",
    "✅ Table created successfully",
    "✅ Table created successfully", 
    "✅ Table created successfully"
  ],
  "tables": [
    "coach_knowledge_base",
    "user_profiles_extended", 
    "coaching_sessions",
    "connection_suggestions",
    "vector_embeddings"
  ]
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-07-19T06:15:00Z",
  "details": "Additional error information"
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_INPUT`: Request validation failed
- `VECTOR_DB_ERROR`: Vector database operation failed
- `DB_CONNECTION_ERROR`: Database connection failed
- `NOT_FOUND`: Requested resource not found

## Rate Limiting

Current implementation has no rate limiting. Future considerations:
- API key-based rate limiting
- User-based request quotas
- Vector search operation limits

## Development vs Production

### Current State (Development)
- Basic endpoint structure implemented
- Vector database operations functional
- Authentication integration ready
- Database table creation completed

### Planned Production Features
- Full CRUD operations for all endpoints
- Advanced search and filtering
- Batch operations for data management
- Comprehensive error handling
- Rate limiting and security measures

## Testing

### Integration Test Script
```bash
./final-test.sh
```

### Individual Endpoint Testing
```bash
# Vector database
curl -X GET "http://localhost:8080/api/coaching/vector/status"
curl -X POST "http://localhost:8080/api/coaching/vector/init"

# Basic endpoints
curl -X GET "http://localhost:8080/api/coaching/knowledge"
curl -X GET "http://localhost:8080/api/coaching/profiles"
```

### Expected Test Results
All endpoints should return JSON responses with appropriate status codes and no server errors in the development environment.

## Next Development Steps

1. **Implement Full Database Operations**: Replace placeholder responses with actual database queries
2. **Add Authentication Middleware**: Integrate with existing AST authentication system
3. **Enhance Vector Search**: Add AWS Bedrock embeddings for better semantic understanding
4. **Add Data Validation**: Implement request validation and sanitization
5. **Error Handling**: Comprehensive error handling and logging
6. **Performance Optimization**: Query optimization and caching strategies

This API provides the foundation for intelligent coaching features while integrating seamlessly with the existing AllStarTeams platform.
