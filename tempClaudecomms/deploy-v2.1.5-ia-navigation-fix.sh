#!/bin/bash
# Deploy v2.1.5 with IA navigation fixes + database reset fixes to staging
# Created: 2025-07-27 08:38
# Purpose: Deploy IA Section 6 navigation fix + database reset fix

echo "=== Deploying v2.1.5 to Staging VM ==="
echo "Key Changes:"
echo "- Database reset: workshopStepData field properly cleared (v2.1.4 fix)"
echo "- IA Navigation: ia-6-1 restored as always-accessible step"
echo "- IA Progression: ia-7-1 unlocks after ia-4-6 completion, ia-7-2 locked"
echo "- IA Navigation: Quarterly tune-up 'Coming Soon' remains locked"

# VM Connection Details
# IP: 34.220.143.127
# SSH: ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127

echo ""
echo "Step 1: SSH into staging VM"
echo "ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127"

echo ""
echo "Step 2: Deploy v2.1.5 container (run these commands on the VM):"
echo ""

echo "# Stop and remove existing container"
echo "sudo docker stop staging-app || true"
echo "sudo docker rm staging-app || true"

echo ""
echo "# Pull and run v2.1.5 image"
echo "sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-v2.1.5"

echo ""
echo "# Verify deployment"
echo "sudo docker ps | grep staging-app"
echo "sudo docker logs staging-app --tail 20"

echo ""
echo "Step 3: Test the fixes"
echo "curl -I http://34.220.143.127"
echo ""
echo "Access staging: http://34.220.143.127"
echo ""
echo "=== Key Changes in v2.1.5 ==="
echo "1. Database Reset Fix:"
echo "   - server/reset-routes.ts: Added 'workshopStepData' = NULL to line 84"  
echo "   - server/routes/reset-routes.ts: Added 'workshopStepData' = NULL to line 209"
echo ""
echo "2. IA Navigation Fix:"
echo "   - navigationData.ts: Restored ia-6-1 as first step in Section 6"
echo "   - imaginal-agility.tsx: Added special unlock rules"
echo "   - ia-6-1: Always accessible from start"
echo "   - ia-7-1: Unlocks after workshop completion (ia-4-6)"
echo "   - ia-7-2: Locked for now"
echo "   - ia-6-coming-soon: Quarterly tune-up locked"
echo ""
echo "=== Testing Checklist ==="
echo "✓ Reset Barney's data and verify workshop cache is fully cleared"
echo "✓ Check ia-6-1 is accessible from start" 
echo "✓ Confirm ia-7-1 unlocks after completing ia-4-6"
echo "✓ Verify ia-7-2 remains locked"