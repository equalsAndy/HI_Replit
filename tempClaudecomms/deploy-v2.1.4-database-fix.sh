#!/bin/bash
# Deploy v2.1.4 with critical database reset fixes to staging
# Created: 2025-07-27
# Purpose: Deploy database workshopStepData clearing fix

echo "=== Deploying v2.1.4 to Staging VM ==="
echo "Critical fix: Database reset operations now properly clear workshopStepData field"

# VM Connection Details
# IP: 34.220.143.127
# SSH: ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127

echo "Step 1: SSH into staging VM"
echo "ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127"

echo ""
echo "Step 2: Deploy v2.1.4 container (run these commands on the VM):"
echo ""

echo "# Stop and remove existing container"
echo "sudo docker stop staging-app || true"
echo "sudo docker rm staging-app || true"

echo ""
echo "# Pull and run v2.1.4 image"
echo "sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-v2.1.4"

echo ""
echo "# Verify deployment"
echo "sudo docker ps | grep staging-app"
echo "sudo docker logs staging-app --tail 20"

echo ""
echo "Step 3: Test the fix"
echo "curl -I http://34.220.143.127"
echo ""
echo "Access staging: http://34.220.143.127"
echo ""
echo "=== Key Changes in v2.1.4 ==="
echo "- server/reset-routes.ts: Added 'workshopStepData' = NULL to line 84"
echo "- server/routes/reset-routes.ts: Added 'workshopStepData' = NULL to line 209"
echo "- Both files now properly clear workshop step data during reset operations"
echo "- This fixes the cache persistence issue where workshop data remained after database reset"