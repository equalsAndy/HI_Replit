#!/bin/bash

# Cleanup script for problematic hi-app-staging service
# Run this ONLY after confirming fresh service works

set -e

SERVICE_NAME="hi-app-staging"
REGION="us-west-2"

echo "⚠️  WARNING: This will DELETE the hi-app-staging service!"
echo "⚠️  Make sure hi-staging-fresh is working first!"
echo ""
read -p "Are you sure you want to delete $SERVICE_NAME? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted"
    exit 1
fi

echo "🗑️  Deleting container service: $SERVICE_NAME"

# Delete the problematic service
aws lightsail delete-container-service \
  --service-name "$SERVICE_NAME" \
  --region "$REGION"

echo "✅ Service deletion initiated"
echo "📊 Check status with:"
echo "   aws lightsail get-container-services --region $REGION"