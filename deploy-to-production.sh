#!/bin/bash
# AWS Lightsail Production Deployment Script - FIXED VERSION
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

# Fetch production parameters from AWS Parameter Store
echo "🔐 Retrieving configuration from AWS SSM Parameter Store..."
DATABASE_URL=$(aws ssm get-parameter --name "/prod/hi-replit/DATABASE_URL" --with-decryption --query "Parameter.Value" --output text)
# Strip any accidental newlines from the DB URL
DATABASE_URL=$(echo "$DATABASE_URL" | tr -d '\n')
SESSION_SECRET=$(aws ssm get-parameter --name "/prod/hi-replit/SESSION_SECRET" --with-decryption --query "Parameter.Value" --output text)
FEATURE_DEBUG_PANEL=$(aws ssm get-parameter --name "/prod/hi-replit/FEATURE_DEBUG_PANEL" --with-decryption --query "Parameter.Value" --output text)
ENVIRONMENT=$(aws ssm get-parameter --name "/prod/hi-replit/ENVIRONMENT" --with-decryption --query "Parameter.Value" --output text)
FEATURE_HOLISTIC_REPORTS=$(aws ssm get-parameter --name "/prod/hi-replit/FEATURE_HOLISTIC_REPORTS" --with-decryption --query "Parameter.Value" --output text)
OPENAI_API_KEY=$(aws ssm get-parameter --name "/prod/hi-replit/OPENAI_API_KEY" --with-decryption --query "Parameter.Value" --output text)
OPENAI_KEY_IA=$(aws ssm get-parameter --name "/prod/hi-replit/OPENAI_KEY_IA" --with-decryption --query "Parameter.Value" --output text)
IMAGINAL_AGILITY_PROJECT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/IMAGINAL_AGILITY_PROJECT_ID" --with-decryption --query "Parameter.Value" --output text)

# Auth0 Configuration - Main app credentials
AUTH0_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/AUTH0_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
AUTH0_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/AUTH0_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)

# Auth0 Management API credentials - THE MISSING ONES
TENANT_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/TENANT_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
MGMT_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/MGMT_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)
MGMT_CLIENT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/MGMT_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
MGMT_CLIENT_SECRET=$(aws ssm get-parameter --name "/prod/hi-replit/MGMT_CLIENT_SECRET" --with-decryption --query "Parameter.Value" --output text)

# Frontend Auth0 Client ID - THE CRITICAL MISSING ONE
VITE_AUTH0_CLIENT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_REDIRECT_URI=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_REDIRECT_URI" --with-decryption --query "Parameter.Value" --output text)

# Validate retrieved parameters
: "${DATABASE_URL:?DATABASE_URL must be set}"
: "${SESSION_SECRET:?SESSION_SECRET must be set}"
: "${FEATURE_DEBUG_PANEL:?FEATURE_DEBUG_PANEL must be set}"
: "${ENVIRONMENT:?ENVIRONMENT must be set}"
: "${FEATURE_HOLISTIC_REPORTS:?FEATURE_HOLISTIC_REPORTS must be set}"
: "${OPENAI_API_KEY:?OPENAI_API_KEY must be set}"
: "${OPENAI_KEY_IA:?OPENAI_KEY_IA must be set}"
: "${IMAGINAL_AGILITY_PROJECT_ID:?IMAGINAL_AGILITY_PROJECT_ID must be set}"
: "${AUTH0_DOMAIN:?AUTH0_DOMAIN must be set}"
: "${AUTH0_AUDIENCE:?AUTH0_AUDIENCE must be set}"
: "${TENANT_DOMAIN:?TENANT_DOMAIN must be set}"
: "${MGMT_AUDIENCE:?MGMT_AUDIENCE must be set}"
: "${MGMT_CLIENT_ID:?MGMT_CLIENT_ID must be set}"
: "${MGMT_CLIENT_SECRET:?MGMT_CLIENT_SECRET must be set}"
: "${VITE_AUTH0_CLIENT_ID:?VITE_AUTH0_CLIENT_ID must be set}"
: "${VITE_AUTH0_DOMAIN:?VITE_AUTH0_DOMAIN must be set}"
: "${VITE_AUTH0_AUDIENCE:?VITE_AUTH0_AUDIENCE must be set}"

# Step 1: Build and push the Docker image
echo "🔨 Building & pushing Docker image for linux/amd64..."
export BUILDKIT_PARALLELISM=1
echo "🔑 Authenticating with ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build locally first with correct production environment variables
echo "🏗️ Building locally with production configuration..."
./build-production.sh

# Build Docker image (using pre-built files)
echo "🐳 Building Docker image with pre-built files..."
docker buildx build --platform linux/amd64 \
  --tag $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG \
  --push \
  .

# Step 2: Deploy to Lightsail PRODUCTION
echo "🚢 Deploying to Lightsail PRODUCTION..."
# Wait for any existing deployment to complete to avoid conflicts
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
        \"TENANT_DOMAIN\": \"${TENANT_DOMAIN}\",
        \"MGMT_AUDIENCE\": \"${MGMT_AUDIENCE}\",
        \"MGMT_CLIENT_ID\": \"${MGMT_CLIENT_ID}\",
        \"MGMT_CLIENT_SECRET\": \"${MGMT_CLIENT_SECRET}\",
        \"VITE_AUTH0_CLIENT_ID\": \"${VITE_AUTH0_CLIENT_ID}\",
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
echo "🌐 Production URL: https://app2.heliotropeimaginal.com/"
echo "🔗 Container URL: https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/"
echo "📦 Image deployed: $ECR_REGISTRY/$REPO_NAME:$PRODUCTION_TAG"

echo ""
echo "🔍 Key Changes Made:"
echo "   ✅ Added TENANT_DOMAIN environment variable"
echo "   ✅ Added MGMT_AUDIENCE environment variable" 
echo "   ✅ Added MGMT_CLIENT_ID environment variable"
echo "   ✅ Added MGMT_CLIENT_SECRET environment variable"
echo "   ✅ Removed NODE_TLS_REJECT_UNAUTHORIZED=0 (security improvement)"