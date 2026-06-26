#!/bin/bash
# Deploy an already-pushed ECR image to Lightsail (no Docker build/push)
# Usage: ./deploy-lightsail-only.sh <image-tag>
# Example: ./deploy-lightsail-only.sh v2026.06.22.1301

set -e

export AWS_PROFILE="${AWS_PROFILE:-heliotrope}"

IMAGE_TAG="${1:?Usage: ./deploy-lightsail-only.sh <image-tag>}"

ECR_REGISTRY="962000089613.dkr.ecr.us-west-2.amazonaws.com"
REPO_NAME="hi-replit-app"
SERVICE_NAME="hi-replit-v2"
CONTAINER_NAME="allstarteams-app"
REGION="us-west-2"

echo "🔑 Using AWS profile: $AWS_PROFILE"
echo "📦 Deploying image tag: $IMAGE_TAG"
echo "🎯 Target service: $SERVICE_NAME"

echo "🔐 Retrieving configuration from AWS SSM Parameter Store..."
DATABASE_URL=$(aws ssm get-parameter --name "/prod/hi-replit/DATABASE_URL" --with-decryption --query "Parameter.Value" --output text)
DATABASE_URL=$(echo "$DATABASE_URL" | tr -d '\n')
SESSION_SECRET=$(aws ssm get-parameter --name "/prod/hi-replit/SESSION_SECRET" --with-decryption --query "Parameter.Value" --output text)
FEATURE_DEBUG_PANEL=$(aws ssm get-parameter --name "/prod/hi-replit/FEATURE_DEBUG_PANEL" --with-decryption --query "Parameter.Value" --output text)
ENVIRONMENT=$(aws ssm get-parameter --name "/prod/hi-replit/ENVIRONMENT" --with-decryption --query "Parameter.Value" --output text)
FEATURE_HOLISTIC_REPORTS=$(aws ssm get-parameter --name "/prod/hi-replit/FEATURE_HOLISTIC_REPORTS" --with-decryption --query "Parameter.Value" --output text)
OPENAI_API_KEY=$(aws ssm get-parameter --name "/prod/hi-replit/OPENAI_API_KEY" --with-decryption --query "Parameter.Value" --output text)
OPENAI_KEY_IA=$(aws ssm get-parameter --name "/prod/hi-replit/OPENAI_KEY_IA" --with-decryption --query "Parameter.Value" --output text)
IMAGINAL_AGILITY_PROJECT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/IMAGINAL_AGILITY_PROJECT_ID" --with-decryption --query "Parameter.Value" --output text)
CLAUDE_API_KEY=$(aws ssm get-parameter --name "/prod/hi-replit/CLAUDE_API_KEY" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
AI_PROVIDER=$(aws ssm get-parameter --name "/prod/hi-replit/AI_PROVIDER" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "openai")
AI_PROVIDER_IA=$(aws ssm get-parameter --name "/prod/hi-replit/AI_PROVIDER_IA" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "openai")
CLAUDE_MODEL=$(aws ssm get-parameter --name "/prod/hi-replit/CLAUDE_MODEL" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "claude-haiku-4-5-20251001")
TRAINING_DOC_SYNC_KEY=$(aws ssm get-parameter --name "/prod/hi-replit/TRAINING_DOC_SYNC_KEY" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
AUTH0_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/AUTH0_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
AUTH0_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/AUTH0_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)
TENANT_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/TENANT_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
MGMT_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/MGMT_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)
MGMT_CLIENT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/MGMT_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
MGMT_CLIENT_SECRET=$(aws ssm get-parameter --name "/prod/hi-replit/MGMT_CLIENT_SECRET" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_CLIENT_ID=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_CLIENT_ID" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_DOMAIN=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_DOMAIN" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_AUDIENCE=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_AUDIENCE" --with-decryption --query "Parameter.Value" --output text)
VITE_AUTH0_REDIRECT_URI=$(aws ssm get-parameter --name "/prod/hi-replit/VITE_AUTH0_REDIRECT_URI" --with-decryption --query "Parameter.Value" --output text)

echo "🚢 Deploying to Lightsail..."

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
      \"image\": \"$ECR_REGISTRY/$REPO_NAME:$IMAGE_TAG\",
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
        \"VITE_AUTH0_DOMAIN\": \"${VITE_AUTH0_DOMAIN}\",
        \"VITE_AUTH0_AUDIENCE\": \"${VITE_AUTH0_AUDIENCE}\",
        \"VITE_AUTH0_REDIRECT_URI\": \"${VITE_AUTH0_REDIRECT_URI}\",
        \"CLAUDE_API_KEY\": \"${CLAUDE_API_KEY}\",
        \"AI_PROVIDER\": \"${AI_PROVIDER}\",
        \"AI_PROVIDER_IA\": \"${AI_PROVIDER_IA}\",
        \"CLAUDE_MODEL\": \"${CLAUDE_MODEL}\",
        \"TRAINING_DOC_SYNC_KEY\": \"${TRAINING_DOC_SYNC_KEY}\",
        \"NODE_ENV\": \"production\",
        \"PORT\": \"8080\"
      }
    }
  }" \
  --public-endpoint "{\"containerName\": \"$CONTAINER_NAME\", \"containerPort\": 8080}"

echo "✅ Lightsail deployment initiated!"
echo "📦 Image deployed: $ECR_REGISTRY/$REPO_NAME:$IMAGE_TAG"
echo "🌐 Production URL: https://app2.heliotropeimaginal.com/"
