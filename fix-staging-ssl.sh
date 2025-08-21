#!/bin/bash

# Fix SSL certificate issue on staging VM
# This script updates the environment variables and restarts the container

set -e

VM_IP="34.220.143.127"

echo "🔧 Fixing SSL certificate issue on staging VM: $VM_IP"

# Use Lightsail Console SSH approach since we don't have direct SSH key
echo ""
echo "📋 Manual Steps Required:"
echo "1. Go to https://lightsail.aws.amazon.com/"
echo "2. Click 'hi-staging-vm'"
echo "3. Click 'Connect using SSH'"
echo "4. Run the following commands in the SSH terminal:"
echo ""
echo "# Stop the current container"
echo "sudo docker stop staging-app || true"
echo "sudo docker rm staging-app || true"
echo ""
echo "# Create updated environment file with SSL fix"
echo "cat > staging.env << 'EOF'"
echo "NODE_ENV=staging"
echo "DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require"
echo "SESSION_SECRET=dev-secret-key-2025-heliotrope-imaginal"
echo "ENVIRONMENT=staging"
echo "EOF"
echo ""
echo "# Deploy the container with updated environment"
echo "sudo docker run -d \\"
echo "  --name staging-app \\"
echo "  -p 80:8080 \\"
echo "  --env-file staging.env \\"
echo "  --restart unless-stopped \\"
echo "  962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-amd64"
echo ""
echo "# Verify the fix"
echo "curl http://localhost/health"
echo ""
echo "✅ After running these commands, login should work!"
