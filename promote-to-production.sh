#!/bin/bash
set -e

echo "🔄 Promoting current working deployment to production"
echo "📋 This will retag the current image and deploy staging to the right place"
echo ""

# Current working image (from hi-replit-v2)
CURRENT_IMAGE="updated-20250718-140324"

# Get version info for new tags
VERSION=$(grep '"version"' public/version.json | cut -d'"' -f4)
BUILD=$(grep '"build"' public/version.json | cut -d'"' -f4)
DATE=$(date +%Y%m%d)

PRODUCTION_TAG="production-v${VERSION}.${BUILD}-${DATE}"
STAGING_TAG="staging-v${VERSION}.${BUILD}-${DATE}"

echo "🏷️  Current working image: $CURRENT_IMAGE"
echo "🏷️  New production tag: $PRODUCTION_TAG"
echo "🏷️  New staging tag: $STAGING_TAG"
echo ""

# Login to ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

# Pull the current working image
echo "⬇️ Pulling current working image..."
docker pull --platform linux/amd64 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$CURRENT_IMAGE

# Retag as production
echo "🏷️  Retagging as production..."
docker tag 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$CURRENT_IMAGE 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PRODUCTION_TAG

# Push production tag
echo "⬆️ Pushing production tag..."
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PRODUCTION_TAG

# Deploy production (same image, just with production tag and NODE_ENV)
echo "🚀 Deploying production with proper environment..."
aws lightsail create-container-service-deployment \
  --service-name hi-replit-v2 \
  --region us-west-2 \
  --containers '{
    "allstarteams-app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:'$PRODUCTION_TAG'",
      "ports": {"8080": "HTTP"},
      "environment": {
        "DATABASE_URL": "postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require",
        "SESSION_SECRET": "dev-secret-key-2025-heliotrope-imaginal",
        "NODE_ENV": "production",
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

echo ""
echo "✅ Production deployment initiated!"
echo "🌐 Production URL: https://app2.heliotropeimaginal.com"
echo "🏷️  Production image: $PRODUCTION_TAG"
echo ""
echo "🔄 Now deploying staging..."

# Now deploy staging with the same image (tagged as staging)
docker tag 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$CURRENT_IMAGE 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$STAGING_TAG
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$STAGING_TAG

aws lightsail create-container-service-deployment \
  --service-name hi-app-staging \
  --region us-west-2 \
  --containers '{
    "allstarteams-app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:'$STAGING_TAG'",
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

echo ""
echo "✅ Both deployments initiated!"
echo "🌐 Production: https://app2.heliotropeimaginal.com"
echo "🌐 Staging: https://hi-app-staging.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com"
echo ""
echo "📊 Monitor deployments:"
echo "   Production: aws lightsail get-container-services --service-name hi-replit-v2 --region us-west-2"
echo "   Staging: aws lightsail get-container-services --service-name hi-app-staging --region us-west-2"
