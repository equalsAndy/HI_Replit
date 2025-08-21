#!/bin/bash

# Run staging environment locally
# Connects to staging database but runs on local machine

set -e

echo "🏠 Starting local staging environment..."

# Kill any existing staging container
docker rm -f staging-local 2>/dev/null || true

# Run with staging database configuration
docker run -d \
  --name staging-local \
  -p 8080:8080 \
  -e NODE_ENV=staging \
  -e DATABASE_URL="postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require" \
  -e SESSION_SECRET="dev-secret-key-2025-heliotrope-imaginal" \
  -e ENVIRONMENT="staging" \
  --restart unless-stopped \
  962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:no-bedrock-v2

echo "⏳ Waiting for startup..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:8080/health; then
    echo ""
    echo "✅ Local staging environment is running!"
    echo "🌐 Access at: http://localhost:8080"
    echo "🏥 Health check: http://localhost:8080/health"
    echo ""
    echo "🛑 To stop: docker stop staging-local"
    echo "📊 To view logs: docker logs staging-local"
else
    echo "❌ Health check failed"
    docker logs staging-local
fi
