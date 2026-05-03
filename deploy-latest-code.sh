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

# Pick the build script that matches the target environment.
# (The previous version always ran build:staging even for prod, which caused
# version-manager.sh to bump as a staging version.)
if [ "$ENVIRONMENT" = "production" ]; then
    BUILD_SCRIPT="build:production"
else
    BUILD_SCRIPT="build:staging"
fi

echo "📦 Building latest $ENVIRONMENT version (npm run $BUILD_SCRIPT)..."
npm run $BUILD_SCRIPT

# Login to ECR before any docker operations — local docker creds expire
# every 12h so we always re-auth at deploy time.
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

# Build the image with descriptive naming using the standalone Dockerfile.
# (The previous "layer on top of environment-badge-test base image" approach
# was abandoned because that base image was cleaned out of ECR; the canonical
# Dockerfile rebuilds everything from node:20-alpine in ~5-10 min.)
VERSION=$(grep '"version"' public/version.json | cut -d'"' -f4)
BUILD=$(grep '"build"' public/version.json | cut -d'"' -f4)
DATE=$(date +%Y%m%d)
NEW_TAG="${ECR_TAG_PREFIX}-v${VERSION}.${BUILD}-${DATE}"

echo "🔨 Building image with tag: $NEW_TAG (standalone Dockerfile)"
docker build --platform linux/amd64 -f Dockerfile -t 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG .

# Push (already logged in to ECR above).
echo "⬆️ Pushing updated image..."
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG

# Fetch env vars from AWS Parameter Store (single source of truth).
# Without this, the previous version of this script wiped the Lightsail env
# down to the 4 hardcoded values below, requiring manual re-paste of 25+ vars
# in the Lightsail UI after every deploy.
if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required for the env-injection step." >&2
  echo "Install: brew install jq" >&2
  exit 1
fi

# Allow override via ENVIRONMENT_SHORT if a future stage uses a different
# Param Store path (e.g. "stage" instead of "prod"). Default = "prod".
PARAM_PREFIX="/${ENVIRONMENT_SHORT:-prod}/hi-replit/"

echo "🔐 Loading environment from Parameter Store ($PARAM_PREFIX)..."

PARAMS_JSON=$(aws ssm get-parameters-by-path \
  --path "$PARAM_PREFIX" \
  --with-decryption \
  --region us-west-2 \
  --output json)

# Build env JSON: strip the path prefix from each name, drop entries whose
# resulting key contains a slash (e.g. AUTH0_MGMT_CLIENT_ID/AUDIENCE — looks
# like a typo in Param Store; not a valid POSIX env name), pin NODE_ENV +
# PORT to the script's targets.
ENV_JSON=$(echo "$PARAMS_JSON" | jq -c \
  --arg env "$ENVIRONMENT" \
  --arg port "8080" \
  --arg prefix "$PARAM_PREFIX" '
    .Parameters
    | map(.Name |= sub("^" + $prefix; ""))
    | map(select(.Name | contains("/") | not))
    | map({key: .Name, value: .Value})
    | from_entries
    | . + {"NODE_ENV": $env, "PORT": $port}
  ')

ENV_COUNT=$(echo "$ENV_JSON" | jq 'length')
echo "📋 Loaded $ENV_COUNT env vars from Parameter Store (NODE_ENV + PORT pinned)"

# Build the full --containers JSON via jq so we don't have to escape anything.
CONTAINERS_JSON=$(jq -n \
  --arg image "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG" \
  --argjson env "$ENV_JSON" '
    {"allstarteams-app": {
      "image": $image,
      "ports": {"8080": "HTTP"},
      "environment": $env
    }}
  ')

# Deploy to Lightsail
echo "🚀 Deploying to Lightsail ($ENVIRONMENT)..."
aws lightsail create-container-service-deployment \
  --service-name $SERVICE_NAME \
  --region us-west-2 \
  --containers "$CONTAINERS_JSON" \
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

# (No Dockerfile.update cleanup needed — standalone Dockerfile is checked in.)
