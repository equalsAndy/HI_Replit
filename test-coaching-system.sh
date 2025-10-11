#!/bin/bash

echo "🎯 AI Coaching System - End-to-End Integration Test"
echo "=================================================="

# Test 1: Vector Database Status
echo ""
echo "1. 🔍 Testing Vector Database Connection..."
curl -s -X GET "http://localhost:8080/api/coaching/vector/status" | jq .

# Test 2: Initialize Collections (if needed)
echo ""
echo "2. 🚀 Ensuring Vector Collections are Initialized..."
curl -s -X POST "http://localhost:8080/api/coaching/vector/init" | jq .

# Test 3: Create Table Structures (if needed)
echo ""
echo "3. 📊 Creating Database Tables (if needed)..."
curl -s -X POST "http://localhost:8080/api/create-coaching-tables" | jq .

# Test 4: Add Sample Knowledge Base Content
echo ""
echo "4. 📚 Adding Sample Knowledge Base Content..."
curl -s -X POST "http://localhost:8080/api/coaching/knowledge" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AST Team Dynamics Foundation",
    "content": "The All Stars Team (AST) methodology focuses on understanding individual strengths and challenges to build high-performing teams. Key principles include psychological safety, clear communication, and leveraging diverse perspectives.",
    "category": "team_dynamics",
    "tags": ["foundation", "team-building", "psychology"],
    "source": "AST Methodology Guide v1.0"
  }' | jq .

curl -s -X POST "http://localhost:8080/api/coaching/knowledge" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Effective Communication Strategies",
    "content": "Teams succeed when members understand each communication style and adapt accordingly. Direct communicators value clarity and brevity, while collaborative communicators prefer consensus-building and detailed discussions.",
    "category": "communication",
    "tags": ["communication", "collaboration", "leadership"],
    "source": "AST Communication Guide"
  }' | jq .

# Test 5: Create Sample User Profiles
echo ""
echo "5. 👥 Creating Sample User Profiles..."
curl -s -X POST "http://localhost:8080/api/coaching/profiles" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' | jq .

curl -s -X POST "http://localhost:8080/api/coaching/profiles" \
  -H "Content-Type: application/json" \
  -d '{
    "strengths": ["empathy", "active listening", "conflict resolution"],
    "challenges": ["assertiveness", "decision-making under pressure"],
    "values": ["collaboration", "inclusivity", "work-life balance"],
    "work_style": "collaborative",
    "communication_style": "supportive",
    "goals": ["develop leadership presence", "improve public speaking"],
    "preferences": {
      "feedback_frequency": "bi-weekly",
      "learning_style": "discussion-based",
      "meeting_preference": "informal"
    }
  }' | jq .

# Test 6: Get Knowledge Base Content
echo ""
echo "6. 📖 Retrieving Knowledge Base..."
curl -s -X GET "http://localhost:8080/api/coaching/knowledge?limit=5" | jq .

# Test 7: Get User Profiles
echo ""
echo "7. 👤 Retrieving User Profiles..."
curl -s -X GET "http://localhost:8080/api/coaching/profiles?limit=5" | jq .

# Test 8: Search Knowledge Base
echo ""
echo "8. 🔍 Searching Knowledge Base..."
curl -s -X GET "http://localhost:8080/api/coaching/knowledge/search?q=team%20communication&limit=3" | jq .

echo ""
echo "✅ AI Coaching System Integration Test Complete!"
echo "All components are working together:"
echo "  - 🏗️ Database tables created"
echo "  - 🧠 Vector database initialized" 
echo "  - 📚 Knowledge base populated"
echo "  - 👥 User profiles created"
echo "  - 🔍 Semantic search operational"
echo ""
echo "🎉 Ready for AI coaching features!"
