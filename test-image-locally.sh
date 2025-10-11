#!/bin/bash

# Test the Docker image locally with staging environment
# Use this to validate the image works before deploying

set -e

IMAGE="962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:no-bedrock-v2"
CONTAINER_NAME="test-staging-local"

echo "🧪 Testing image locally with staging configuration..."

# Kill any existing test container
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Run container with staging environment
echo "🐳 Starting container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 8080:8080 \
  -e NODE_ENV=staging \
  -e DATABASE_URL="postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require" \
  -e SESSION_SECRET="dev-secret-key-2025-heliotrope-imaginal" \
  -e ENVIRONMENT="staging" \
  "$IMAGE"

echo "⏳ Waiting for startup..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:8080/health; then
    echo "✅ Health check PASSED - image works locally!"
else
    echo "❌ Health check FAILED - image has issues"
fi

echo ""
echo "📊 Container logs:"
docker logs "$CONTAINER_NAME"

echo ""
echo "🛑 Stopping test container..."
docker stop "$CONTAINER_NAME"
docker rm "$CONTAINER_NAME"

echo "✅ Local test complete"
