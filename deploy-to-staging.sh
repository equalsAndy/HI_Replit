#!/bin/bash
# AWS Lightsail Staging Deployment Script
# Deploy to hi-app-staging service

set -e  # Exit on any error

# Configuration for STAGING
ECR_REGISTRY="962000089613.dkr.ecr.us-west-2.amazonaws.com"
REPO_NAME="hi-replit-app"
SERVICE_NAME="hi-app-staging"
CONTAINER_NAME="heliotrope-app-staging"
REGION="us-west-2"
DATE_TAG=$(date +%Y.%m.%d)
TIME_TAG=$(date +%H%M)
STAGING_TAG="staging-${DATE_TAG}-${TIME_TAG}"

echo "🚀 Starting STAGING deployment for $(date)"
echo "📦 Using image tag: $STAGING_TAG"
echo "🎯 Target service: $SERVICE_NAME"

# Step 1: Build the Docker image
echo "🔨 Building Docker image..."
docker build -t hi-replit-app .

# Step 2: Tag the image with dated staging tag
echo "🏷️  Tagging image as $ECR_REGISTRY/$REPO_NAME:$STAGING_TAG"
docker tag hi-replit-app $ECR_REGISTRY/$REPO_NAME:$STAGING_TAG

# Step 3: Authenticate with ECR
echo "🔐 Authenticating with ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Step 4: Push to ECR
echo "⬆️  Pushing image to ECR..."
docker push $ECR_REGISTRY/$REPO_NAME:$STAGING_TAG

# Step 5: Deploy to Lightsail STAGING
echo "🚢 Deploying to Lightsail STAGING..."
aws lightsail create-container-service-deployment \
  --service-name $SERVICE_NAME \
  --region $REGION \
  --containers "{
    \"$CONTAINER_NAME\": {
      \"image\": \"$ECR_REGISTRY/$REPO_NAME:$STAGING_TAG\",
      \"ports\": {\"8080\": \"HTTP\"},
      \"environment\": {
        \"NODE_ENV\": \"staging\"
      }
    }
  }" \
  --public-endpoint "{\"containerName\": \"$CONTAINER_NAME\", \"containerPort\": 8080}"

echo "✅ STAGING deployment initiated successfully!"
echo "📊 Check deployment status with:"
echo "   aws lightsail get-container-service-deployments --service-name $SERVICE_NAME --region $REGION"
echo ""
echo "🌐 Staging URL: https://hi-app-staging.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/"
echo "🔍 Image deployed: $ECR_REGISTRY/$REPO_NAME:$STAGING_TAG"
