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

# Default DATABASE_URL if unset
DATABASE_URL="${DATABASE_URL:-postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require}"

# Default session secret if unset
SESSION_SECRET="${SESSION_SECRET:-dev-secret-key-2025-heliotrope-imaginal}"

# Ensure Auth0 environment variables for server-side operations
: "${AUTH0_DOMAIN:?AUTH0_DOMAIN environment variable must be set}"
: "${AUTH0_AUDIENCE:?AUTH0_AUDIENCE environment variable must be set}"
: "${AUTH0_MGMT_CLIENT_ID:?AUTH0_MGMT_CLIENT_ID environment variable must be set}"
: "${AUTH0_MGMT_CLIENT_SECRET:?AUTH0_MGMT_CLIENT_SECRET environment variable must be set}"

# Step 1: Build and push the Docker image
echo "🔨 Building & pushing Docker image for linux/amd64 (parallel uploads limited)..."
export BUILDKIT_PARALLELISM=1
echo "🔐 Authenticating with ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
docker buildx build --platform linux/amd64 \
  --tag $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG \
  --push \
  .

# Step 5: Deploy to Lightsail PRODUCTION
echo "🚢 Deploying to Lightsail PRODUCTION..."
## Wait for any existing deployment to complete to avoid conflicts
echo "⏳ Checking for ongoing deployments..."
while aws lightsail get-container-service-deployments --service-name $SERVICE_NAME --region $REGION \
  --query 'containerServiceDeployments[].status' --output text | grep -q InProgress; do
  echo "⏳ Previous deployment still in progress; waiting 15s..."
  sleep 15
done
aws lightsail create-container-service-deployment \
  --service-name $SERVICE_NAME \
  --region $REGION \
  --containers "{
    \"$CONTAINER_NAME\": {
      \"image\": \"$ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG\",
      \"ports\": {\"8080\": \"HTTP\"},
      \"environment\": {
        \"DATABASE_URL\": \"${DATABASE_URL}\",
        \"SESSION_SECRET\": \"${SESSION_SECRET}\",
        \"FEATURE_DEBUG_PANEL\": \"${FEATURE_DEBUG_PANEL}\",
        \"ENVIRONMENT\": \"${ENVIRONMENT}\",
        \"FEATURE_HOLISTIC_REPORTS\": \"${FEATURE_HOLISTIC_REPORTS}\",
        \"OPENAI_API_KEY\": \"${OPENAI_API_KEY}\",
        \"OPENAI_KEY_IA\": \"${OPENAI_KEY_IA}\",
        \"IMAGINAL_AGILITY_PROJECT_ID\": \"${IMAGINAL_AGILITY_PROJECT_ID}\",
        \"AUTH0_DOMAIN\": \"${AUTH0_DOMAIN}\",
        \"AUTH0_AUDIENCE\": \"${AUTH0_AUDIENCE}\",
        \"AUTH0_MGMT_CLIENT_ID\": \"${AUTH0_MGMT_CLIENT_ID}\",
        \"AUTH0_MGMT_CLIENT_SECRET\": \"${AUTH0_MGMT_CLIENT_SECRET}\",
        \"NODE_ENV\": \"production\",
        \"PORT\": \"8080\"
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
