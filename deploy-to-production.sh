#!/bin/bash
# AWS Lightsail Production Deployment Script
# Deploy to hi-replit-v2 service

set -e  # Exit on any error

# Configuration for PRODUCTION
ECR_REGISTRY="962000089613.dkr.ecr.us-west-2.amazonaws.com"
REPO_NAME="hi-replit-app"
SERVICE_NAME="hi-replit-v2"
CONTAINER_NAME="allstarteams-app"
REGION="us-west-2"
DATE_TAG=$(date +%Y.%m.%d)
TIME_TAG=$(date +%H%M)

# For production, use semantic versioning or date-based production tags
# You can modify this to use git tags or semantic versions
PRODUCTION_TAG="v${DATE_TAG}.${TIME_TAG}"

echo "🚀 Starting PRODUCTION deployment for $(date)"
echo "📦 Using image tag: $PRODUCTION_TAG"
echo "🎯 Target service: $SERVICE_NAME"
echo "⚠️  WARNING: This deploys to PRODUCTION!"

# Confirmation prompt
read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [[ $confirm != "yes" ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Step 1: Build the Docker image
echo "🔨 Building Docker image..."
docker build -t hi-replit-app .

# Step 2: Tag the image with production version
echo "🏷️  Tagging image as $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG"
docker tag hi-replit-app $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG

# Step 3: Authenticate with ECR
echo "🔐 Authenticating with ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Step 4: Push to ECR
echo "⬆️  Pushing image to ECR..."
docker push $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG

# Step 5: Deploy to Lightsail PRODUCTION
echo "🚢 Deploying to Lightsail PRODUCTION..."
aws lightsail create-container-service-deployment \
  --service-name $SERVICE_NAME \
  --region $REGION \
  --containers "{
    \"$CONTAINER_NAME\": {
      \"image\": \"$ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG\",
      \"ports\": {\"8080\": \"HTTP\"},
      \"environment\": {
        \"NODE_ENV\": \"production\"
      }
    }
  }" \
  --public-endpoint "{\"containerName\": \"$CONTAINER_NAME\", \"containerPort\": 8080}"

echo "✅ PRODUCTION deployment initiated successfully!"
echo "📊 Check deployment status with:"
echo "   aws lightsail get-container-service-deployments --service-name $SERVICE_NAME --region $REGION"
echo ""
echo "🌐 Production URL: https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/"
echo "🔍 Image deployed: $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG"
