# API Endpoints Documentation - AI Coaching System

## 🔌 API Overview

The AI Coaching System provides RESTful API endpoints for knowledge management, coaching conversations, team connections, and data upload/processing.

**Base URL**: `/api/coaching`
**Authentication**: All endpoints require user authentication via session middleware

## 📚 Knowledge Base Management

### **POST** `/knowledge-base`
Upload AST methodology, coaching patterns, and training content.

**Purpose**: Add content to the coach's knowledge base for training and context
**Authentication**: Required
**Request Body**:
```json
{
  "category": "methodology" | "coaching_patterns" | "team_dynamics",
  "contentType": "training_prompt" | "example_response" | "guidelines",
  "title": "string",
  "content": "string",
  "tags": ["array", "of", "strings"],
  "metadata": {
    "source": "AST Compendium",
    "section": "Five Strengths Framework",
    "version": "2025"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "methodology",
    "title": "Five Strengths Framework",
    "createdAt": "2025-07-18T14:30:00Z"
  },
  "message": "Knowledge base content added successfully"
}
```

**Example Usage**:
```bash
curl -X POST http://localhost:8080/api/coaching/knowledge-base \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "category": "methodology",
    "contentType": "training_prompt", 
    "title": "Strengths-Based Coaching Approach",
    "content": "When coaching individuals, always start by identifying and building on existing strengths rather than focusing on deficits...",
    "tags": ["strengths", "positive_psychology", "coaching"]
  }'
```

### **GET** `/knowledge-base`
Retrieve knowledge base content for review and debugging.

**Query Parameters**:
- `category` (optional): Filter by content category
- `contentType` (optional): Filter by content type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "category": "methodology",
      "contentType": "training_prompt",
      "title": "Five Strengths Framework",
      "content": "...",
      "tags": ["strengths", "assessment"],
      "createdAt": "2025-07-18T14:30:00Z"
    }
  ]
}
```

## 👥 User Profile Management

### **POST** `/profile/extended`
Create or update extended user profile for team connections.

**Purpose**: Store team collaboration info, expertise, and AST profile summary
**Request Body**:
```json
{
  "company": "Lion Software",
  "department": "Product",
  "role": "Product Manager",
  "expertiseAreas": ["Product Strategy", "User Research", "Data Analysis"],
  "projectExperience": [
    {
      "project": "Mobile App Redesign",
      "role": "Lead PM",
      "duration": "6 months",
      "technologies": ["React Native", "Figma"]
    }
  ],
  "collaborationPreferences": {
    "workStyle": "collaborative_analytical",
    "communicationStyle": "structured_brainstorming",
    "meetingPreference": "morning_focus_blocks"
  },
  "availabilityStatus": "available",
  "connectionOptIn": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "company": "Lion Software",
    "role": "Product Manager",
    "updatedAt": "2025-07-18T14:30:00Z"
  },
  "message": "Extended profile updated successfully"
}
```

### **GET** `/profile/extended`
Retrieve user's extended profile information.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "company": "Lion Software",
    "department": "Product",
    "role": "Product Manager",
    "expertiseAreas": ["Product Strategy", "User Research"],
    "astProfileSummary": {
      "primaryStrength": "thinking",
      "flowAttributes": ["Strategic", "Methodical"],
      "collaborationStyle": "analytical_empathy"
    },
    "availabilityStatus": "available",
    "connectionOptIn": true
  }
}
```

## 💬 Coaching Conversations

### **POST** `/session`
Start a new coaching conversation session.

**Purpose**: Initialize a coaching conversation with context and user intent
**Request Body**:
```json
{
  "initialMessage": "I'm struggling with prioritizing features for our product roadmap",
  "sessionType": "general" | "growth_planning" | "team_connection"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "conversation": [
      {
        "role": "user",
        "content": "I'm struggling with prioritizing features for our product roadmap",
        "timestamp": "2025-07-18T14:30:00Z"
      }
    ],
    "sessionType": "general",
    "createdAt": "2025-07-18T14:30:00Z"
  },
  "message": "Coaching session started"
}
```

### **POST** `/session/:sessionId/message`
Continue an existing coaching conversation.

**Purpose**: Add user message and get AI coach response
**Path Parameters**:
- `sessionId`: UUID of the coaching session

**Request Body**:
```json
{
  "message": "I usually try to balance user value with business impact, but this time I have too many high-priority items"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "conversation": [
      {
        "role": "user",
        "content": "I usually try to balance user value with business impact...",
        "timestamp": "2025-07-18T14:30:05Z"
      },
      {
        "role": "assistant",
        "content": "That balance approach sounds like your thinking strength at work. When you've had success with that method before, what helped you weigh those competing priorities?",
        "timestamp": "2025-07-18T14:30:08Z",
        "contextSources": ["thinking_strength_guidance", "prioritization_frameworks"]
      }
    ],
    "updatedAt": "2025-07-18T14:30:08Z"
  },
  "response": {
    "role": "assistant",
    "content": "That balance approach sounds like your thinking strength at work...",
    "timestamp": "2025-07-18T14:30:08Z"
  }
}
```

### **GET** `/sessions`
Retrieve user's coaching session history.

**Query Parameters**:
- `limit` (optional): Number of sessions (default: 20)
- `sessionType` (optional): Filter by session type
- `since` (optional): ISO date for sessions since timestamp

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "session-uuid",
      "sessionType": "general",
      "sessionSummary": "Discussion about product roadmap prioritization challenges and analytical approaches",
      "messageCount": 8,
      "lastActivity": "2025-07-18T14:45:00Z",
      "createdAt": "2025-07-18T14:30:00Z"
    }
  ]
}
```

### **GET** `/session/:sessionId`
Get full details of a specific coaching session.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "conversation": [
      {
        "role": "user",
        "content": "I'm struggling with prioritizing features...",
        "timestamp": "2025-07-18T14:30:00Z"
      }
    ],
    "sessionSummary": "User discussed product roadmap challenges...",
    "contextUsed": {
      "astData": ["thinking_strength", "planning_secondary"],
      "knowledgeBase": ["prioritization_frameworks"]
    },
    "sessionType": "general",
    "createdAt": "2025-07-18T14:30:00Z"
  }
}
```

## 🤝 Team Connections

### **GET** `/connections/suggestions`
Get AI-generated team collaboration suggestions for the user.

**Purpose**: Retrieve intelligent suggestions for team collaboration
**Query Parameters**:
- `status` (optional): Filter by suggestion status
- `limit` (optional): Number of suggestions (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "suggestion-uuid",
      "suggestedCollaborator": {
        "id": "user-uuid",
        "name": "Sarah Chen",
        "role": "Product Manager",
        "company": "Lion Software"
      },
      "reasonType": "complementary_strengths",
      "reasonExplanation": "Sarah has strong analytical thinking that would complement your planning approach for this project",
      "context": "Mobile app feature prioritization challenge",
      "status": "suggested",
      "createdAt": "2025-07-18T14:30:00Z"
    }
  ]
}
```

### **POST** `/connections/suggest`
Generate new team collaboration suggestion based on user's current challenge.

**Purpose**: AI analyzes user's challenge and suggests relevant team members
**Request Body**:
```json
{
  "challenge": "I need help with user research methodology for our mobile app redesign",
  "skillsNeeded": ["User Research", "Mobile UX", "Usability Testing"],
  "collaborationType": "consultation" | "partnership" | "mentoring"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "userId": "user-uuid",
        "name": "Alex Kim",
        "role": "UX Designer", 
        "reasonExplanation": "Alex has extensive mobile UX research experience and complementary design thinking to your analytical approach",
        "matchScore": 0.85,
        "sharedProjects": ["Customer Analytics Dashboard"]
      }
    ]
  }
}
```

### **POST** `/connections/:suggestionId/respond`
Respond to a team connection suggestion.

**Path Parameters**:
- `suggestionId`: UUID of the connection suggestion

**Request Body**:
```json
{
  "response": "accepted" | "declined" | "maybe_later",
  "feedback": "This looks like a great match for the project"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Response recorded successfully"
}
```

## 📊 Data Management

### **POST** `/bulk-upload/team-profiles`
Bulk upload team profiles for testing (Lion Software data).

**Purpose**: Load test data for team connection features
**Authentication**: Admin/Developer only
**Request Body**:
```json
{
  "profiles": [
    {
      "userId": "uuid",
      "company": "Lion Software",
      "role": "Product Manager",
      "expertiseAreas": ["Product Strategy", "User Research"],
      "astProfileSummary": {
        "primaryStrength": "thinking",
        "flowAttributes": ["Strategic", "Methodical"]
      }
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "profile-uuid",
      "userId": "user-uuid",
      "company": "Lion Software"
    }
  ],
  "message": "Uploaded 25 team profiles"
}
```

### **POST** `/process-document`
Process large documents (AST Compendium) into knowledge base.

**Purpose**: Upload and chunk documents for vector search
**Request Body**:
```json
{
  "title": "AST 2025 Workshop Compendium",
  "category": "methodology",
  "content": "full document text...",
  "chunkSize": 1000,
  "metadata": {
    "source": "official_compendium",
    "version": "2025",
    "pages": 38
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "chunksCreated": 45,
    "knowledgeBaseEntries": 45,
    "vectorEmbeddings": 45
  },
  "message": "Document processed successfully"
}
```

## 🔍 Search & Analytics

### **GET** `/search/knowledge`
Search knowledge base content for debugging and verification.

**Query Parameters**:
- `q`: Search query string
- `category`: Filter by category
- `limit`: Number of results

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "flow state optimization",
    "results": [
      {
        "id": "uuid",
        "title": "Flow State Principles",
        "content": "Flow states emerge when challenge matches skill level...",
        "relevanceScore": 0.92,
        "category": "methodology"
      }
    ]
  }
}
```

### **GET** `/analytics/usage`
Get coaching system usage analytics.

**Purpose**: Monitor system performance and user engagement
**Response**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 1247,
    "activeUsers": 89,
    "averageSessionLength": "8.5 minutes",
    "topCategories": ["growth_planning", "team_connection"],
    "satisfactionRating": 4.2
  }
}
```

## ⚡ Real-time Features

### **WebSocket** `/ws/coaching/:sessionId`
Real-time coaching conversation updates.

**Purpose**: Live coaching conversation with immediate responses
**Connection**: WebSocket upgrade from HTTP
**Messages**:
```json
// Client sends message
{
  "type": "user_message",
  "content": "How can I improve my team communication?"
}

// Server responds with coach message
{
  "type": "coach_response", 
  "content": "That's an important question. What communication challenges are you noticing most?",
  "contextSources": ["team_communication_guide"],
  "timestamp": "2025-07-18T14:30:00Z"
}
```

## 🚨 Error Handling

### **Standard Error Response Format**
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### **Common Error Codes**
- `AUTHENTICATION_REQUIRED` (401): User not authenticated
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions
- `RESOURCE_NOT_FOUND` (404): Requested resource doesn't exist
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

### **Rate Limiting**
- **Coaching conversations**: 10 messages per minute per user
- **Knowledge base uploads**: 5 uploads per minute
- **Team searches**: 20 searches per minute
- **Bulk operations**: 1 per minute

## 🔐 Authentication & Security

### **Session Authentication**
All endpoints require valid session authentication:
```javascript
// Middleware checks session
const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
```

### **Input Validation**
All endpoints validate input data:
```javascript
// Example validation
const validateKnowledgeBase = (req, res, next) => {
  const { category, title, content } = req.body;
  if (!category || !title || !content) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: { requiredFields: ['category', 'title', 'content'] }
    });
  }
  next();
};
```

### **Data Privacy**
- **Coaching conversations**: Only accessible by the user who created them
- **Team profiles**: Filtered by company and opt-in status
- **Knowledge base**: Public within the organization
- **Analytics**: Aggregated data only, no individual identification

---

**Last Updated**: July 18, 2025
**Version**: 1.0
**Status**: API design complete, ready for implementation
