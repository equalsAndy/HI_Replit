#!/bin/bash

# Fresh Lightsail Container Service Deployment Script
# Use this if hi-app-staging continues to fail

set -e

# Configuration
SERVICE_NAME="hi-staging-fresh"
REGION="us-west-2"
IMAGE="962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:no-bedrock-v2"
CONTAINER_NAME="heliotrope-app-fresh"

echo "🚀 Creating fresh Lightsail container service: $SERVICE_NAME"

# Step 1: Create new container service
echo "📝 Creating container service..."
aws lightsail create-container-service \
  --service-name "$SERVICE_NAME" \
  --power small \
  --scale 1 \
  --region "$REGION"

echo "⏳ Waiting for service to be ready..."
sleep 30

# Step 2: Deploy with exact working production configuration
echo "🔧 Deploying container..."
aws lightsail create-container-service-deployment \
  --service-name "$SERVICE_NAME" \
  --region "$REGION" \
  --containers "{
    \"$CONTAINER_NAME\": {
      \"image\": \"$IMAGE\",
      \"ports\": {\"8080\": \"HTTP\"},
      \"environment\": {
        \"NODE_ENV\": \"staging\"
      }
    }
  }" \
  --public-endpoint "{
    \"containerName\": \"$CONTAINER_NAME\",
    \"containerPort\": 8080,
    \"healthCheck\": {
      \"healthyThreshold\": 5,
      \"unhealthyThreshold\": 5,
      \"timeoutSeconds\": 60,
      \"intervalSeconds\": 90,
      \"path\": \"/health\",
      \"successCodes\": \"200-499\"
    }
  }"

echo "✅ Fresh deployment initiated!"
echo "📊 Check status with:"
echo "   aws lightsail get-container-services --region $REGION"
echo ""
echo "🌐 Once active, service will be available at:"
echo "   https://$SERVICE_NAME.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/"