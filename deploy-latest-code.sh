#!/bin/bash
set -e

# Deployment configuration
STAGING_SERVICE="hi-app-staging"
PRODUCTION_SERVICE="hi-replit-v2"

# Default to staging, allow production via argument
ENVIRONMENT=${1:-staging}
if [ "$ENVIRONMENT" = "production" ]; then
    SERVICE_NAME="$PRODUCTION_SERVICE"
    ECR_TAG_PREFIX="production"
    echo "🚀 Deploying latest code to PRODUCTION using working base approach"
else
    SERVICE_NAME="$STAGING_SERVICE"
    ECR_TAG_PREFIX="staging"
    echo "🚀 Deploying latest code to STAGING using working base approach"
fi

echo "📋 This approach layers your latest code on a proven working Docker image"
echo "🎯 Target: $SERVICE_NAME ($ENVIRONMENT)"
echo ""

# Build the latest staging version
echo "📦 Building latest staging version..."
npm run build:staging

# Pull the working base image
echo "⬇️ Pulling working base image..."
docker pull --platform linux/amd64 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:environment-badge-test

# Create the layered Dockerfile
echo "📝 Creating layered Dockerfile..."
cat > Dockerfile.update << 'EOF'
FROM --platform=linux/amd64 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:environment-badge-test

# Remove old files (keep the structure that works)
RUN rm -rf /app/dist

# Copy the new built files
COPY dist/ /app/dist/
COPY shared/ /app/shared/
COPY package.json /app/

# The base image already has PM2 configured properly
EOF

# Build the updated image with descriptive naming
VERSION=$(grep '"version"' public/version.json | cut -d'"' -f4)
BUILD=$(grep '"build"' public/version.json | cut -d'"' -f4)
DATE=$(date +%Y%m%d)
NEW_TAG="${ECR_TAG_PREFIX}-v${VERSION}.${BUILD}-${DATE}"

echo "🔨 Building updated image with tag: $NEW_TAG"
docker build --platform linux/amd64 -f Dockerfile.update -t 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG .

# Login to ECR and push
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

echo "⬆️ Pushing updated image..."
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG

# Deploy to Lightsail
echo "🚀 Deploying to Lightsail ($ENVIRONMENT)..."
aws lightsail create-container-service-deployment \
  --service-name $SERVICE_NAME \
  --region us-west-2 \
  --containers '{
    "allstarteams-app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:'$NEW_TAG'",
      "ports": {"8080": "HTTP"},
      "environment": {
        "DATABASE_URL": "postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require",
        "SESSION_SECRET": "dev-secret-key-2025-heliotrope-imaginal",
        "NODE_ENV": "'$ENVIRONMENT'",
        "PORT": "8080",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
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

echo ""
echo "✅ Deployment initiated with updated image: $NEW_TAG"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌐 Check status at: https://app2.heliotropeimaginal.com"
else
    echo "🌐 Check status at: https://hi-app-staging.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com"
fi
echo "📊 Monitor deployment: aws lightsail get-container-services --service-name $SERVICE_NAME --region us-west-2"
echo "🔍 Check logs: aws lightsail get-container-log --service-name $SERVICE_NAME --container-name allstarteams-app --region us-west-2"
echo "🏷️  Image deployed: ${ECR_TAG_PREFIX}-v${VERSION}.${BUILD}-${DATE}"
echo ""
echo "💡 Usage:"
echo "   ./deploy-latest-code.sh           # Deploy to staging"
echo "   ./deploy-latest-code.sh production # Deploy to production"

# Clean up
rm -f Dockerfile.update
