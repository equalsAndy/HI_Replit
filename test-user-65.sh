#!/bin/bash

echo "🔧 Testing with User 65 on AWS RDS database..."

# First, verify database connection
echo "📡 Checking database connection..."
curl -s http://localhost:8080/api/workshop-data/feature-status 2>/dev/null || echo "⚠️ Feature status not available"

# Check git status to make sure we're on development branch
echo "📝 Checking git branch and status..."
git status --porcelain
git branch --show-current

# Verify we're using AWS RDS (development environment)
echo "🗄️ Environment check:"
echo "NODE_ENV: ${NODE_ENV:-not_set}"
echo "Current directory: $(pwd)"

# Test with User 65 instead of User 1  
echo "👤 Testing holistic report generation with User 65..."
curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "personal", "userId": 65}' \
  -s | jq . 2>/dev/null || curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "personal", "userId": 65}'

echo ""
echo "📊 Check your server logs for:"
echo "  - Database connection details"
echo "  - User 65 workshop completion status"
echo "  - 🔍 [TRANSFORM DEBUG] and 🔍 [REPORT DEBUG] logs if User 65 has completed data"
echo ""
echo "If User 65 hasn't completed the workshop either, we'll need to:"
echo "1. Find a user who has completed the workshop, or"  
echo "2. Add test assessment data for User 65"
