#!/usr/bin/env bash
# Script to verify required AWS SSM parameters for production deployment
set -euo pipefail

PARAMS=(
  "/prod/hi-replit/DATABASE_URL"
  "/prod/hi-replit/SESSION_SECRET"
  "/prod/hi-replit/FEATURE_DEBUG_PANEL"
  "/prod/hi-replit/ENVIRONMENT"
  "/prod/hi-replit/FEATURE_HOLISTIC_REPORTS"
  "/prod/hi-replit/OPENAI_API_KEY"
  "/prod/hi-replit/OPENAI_KEY_IA"
  "/prod/hi-replit/IMAGINAL_AGILITY_PROJECT_ID"
  "/prod/hi-replit/AUTH0_DOMAIN"
  "/prod/hi-replit/AUTH0_AUDIENCE"
  "/prod/hi-replit/AUTH0_MGMT_CLIENT_ID"
  "/prod/hi-replit/AUTH0_MGMT_CLIENT_SECRET"
  "/prod/hi-replit/AUTH0_MGMT_AUDIENCE"
  "/prod/hi-replit/NODE_ENV"
)

echo "🔍 Testing AWS SSM Parameter Store values..."
for name in "${PARAMS[@]}"; do
  printf "Parameter %-40s = " "$name"
  aws ssm get-parameter --name "$name" --with-decryption --query "Parameter.Value" --output text
done

echo "✅ All parameters retrieved successfully."
