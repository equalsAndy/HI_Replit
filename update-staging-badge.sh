#!/bin/bash

# Update staging VM with corrected environment badge
# This script provides instructions to update the staging container

set -e

VM_IP="34.220.143.127"

echo "🔄 Updating staging VM with fixed environment badge"
echo ""
echo "📋 Steps to run in VM SSH terminal:"
echo "1. Go to https://lightsail.aws.amazon.com/"
echo "2. Click 'hi-staging-vm'"
echo "3. Click 'Connect using SSH'"
echo "4. Run the following commands:"
echo ""
echo "# Pull the updated image"
echo "sudo docker pull 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-fixed-badge"
echo ""
echo "# Stop and remove current container"
echo "sudo docker stop staging-app || true"
echo "sudo docker rm staging-app || true"
echo ""
echo "# Deploy updated container with fixed environment badge"
echo "sudo docker run -d \\"
echo "  --name staging-app \\"
echo "  -p 80:8080 \\"
echo "  --env-file staging.env \\"
echo "  --restart unless-stopped \\"
echo "  962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-fixed-badge"
echo ""
echo "# Verify the fix"
echo "curl http://localhost/"
echo "curl http://localhost/health"
echo ""
echo "✅ After running these commands:"
echo "   - Staging should show 'STAGING v1.0.0.0838' badge"
echo "   - Login should still work with admin/Heliotrope@2025"
echo "   - Ready for production deployment consideration"