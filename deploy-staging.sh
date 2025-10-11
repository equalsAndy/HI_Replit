#!/bin/bash

# Staging Deployment Script for AWS Lightsail
# Based on proven working deployment from aws-lightsail-deployment-guide-UPDATED.md

set -e

echo "🚀 Starting Staging Deployment to app2.heliotropeimaginal.com"
echo "=================================================="

# Configuration
ECR_REGISTRY="962000089613.dkr.ecr.us-west-2.amazonaws.com"
ECR_REPO="hi-replit-app"
SERVICE_NAME="hi-replit-v2"
REGION="us-west-2"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
NEW_TAG="staging-${TIMESTAMP}"

echo "📋 Deployment Configuration:"
echo "   Service: ${SERVICE_NAME}"
echo "   Region: ${REGION}"
echo "   New Tag: ${NEW_TAG}"
echo

# Step 1: Build the latest code first (to get updated assets)
echo "🔨 Step 1: Building latest code for staging..."
if [ ! -d "dist/public" ]; then
    echo "   Running staging build first..."
    npm run build:staging
    if [ $? -ne 0 ]; then
        echo "❌ Staging build failed"
        exit 1
    fi
fi

echo "✅ Code built successfully"
echo

# Step 2: Build Docker image with latest code
echo "🐳 Step 2: Building Docker image with latest code..."
docker build -f Dockerfile.production -t ${ECR_REPO}:${NEW_TAG} .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"
echo

# Step 3: Tag for ECR
echo "🏷️  Step 3: Tagging image for ECR..."
docker tag ${ECR_REPO}:${NEW_TAG} ${ECR_REGISTRY}/${ECR_REPO}:${NEW_TAG}

echo "✅ Image tagged for ECR"
echo

# Step 4: Login to ECR
echo "🔐 Step 4: Logging into ECR..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

if [ $? -ne 0 ]; then
    echo "❌ ECR login failed"
    exit 1
fi

echo "✅ ECR login successful"
echo

# Step 5: Push to ECR
echo "📤 Step 5: Pushing image to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPO}:${NEW_TAG}

if [ $? -ne 0 ]; then
    echo "❌ ECR push failed"
    exit 1
fi

echo "✅ Image pushed to ECR"
echo

# Step 6: Deploy to Lightsail with increased timeouts
echo "🚀 Step 6: Deploying to Lightsail with generous timeouts..."
aws lightsail create-container-service-deployment \
  --service-name ${SERVICE_NAME} \
  --region ${REGION} \
  --containers '{
    "allstarteams-app": {
      "image": "'${ECR_REGISTRY}/${ECR_REPO}:${NEW_TAG}'",
      "ports": {"8080": "HTTP"},
      "environment": {
        "DATABASE_URL": "postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require",
        "SESSION_SECRET": "dev-secret-key-2025-heliotrope-imaginal",
        "NODE_ENV": "staging",
        "PORT": "8080",
      }
    }
  }' \
  --public-endpoint '{
    "containerName": "allstarteams-app", 
    "containerPort": 8080,
    "healthCheck": {
      "healthyThreshold": 3,
      "unhealthyThreshold": 3,
      "timeoutSeconds": 60,
      "intervalSeconds": 120,
      "path": "/health",
      "successCodes": "200-499"
    }
  }'

if [ $? -ne 0 ]; then
    echo "❌ Lightsail deployment failed"
    exit 1
fi

echo "✅ Deployment initiated successfully"
echo

# Step 7: Monitor deployment
echo "📊 Step 7: Monitoring deployment status..."
echo "You can check the deployment status with:"
echo "aws lightsail get-container-services --service-name ${SERVICE_NAME} --region ${REGION}"
echo
echo "Or check container logs with:"
echo "aws lightsail get-container-log --service-name ${SERVICE_NAME} --container-name allstarteams-app --region ${REGION}"
echo

echo "🎉 Staging deployment process complete!"
echo "Your staging environment should be available at:"
echo "https://app2.heliotropeimaginal.com"
echo
echo "⏳ Note: It may take 5-10 minutes for the deployment to become fully operational."
echo "   Use the monitoring commands above to check progress."
