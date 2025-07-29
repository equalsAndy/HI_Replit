#!/bin/bash

# ===================================================================
# STAGING DEPLOYMENT v2.1.6 - IA Navigation Fix
# ===================================================================
# Date: 2025-07-27
# Fix: Remove lock icon from current IA navigation steps
# Issue: Current IA steps showed purple (current) + lock icon incorrectly
# 
# IMPORTANT: Run these commands on the staging VM via SSH
# VM Access: ssh -i keys/ubuntu-staging-key.pem ubuntu@34.220.143.127
# ===================================================================

echo "=== STAGING DEPLOYMENT: IA Navigation Fix v2.1.6 ==="

# 1. Update version number
echo "STAGING v2.1.6.$(date +%H%M)" > staging-version.txt

# 2. Build staging version
npm run build:staging

# 3. Build AMD64-compatible Docker image  
docker build --platform linux/amd64 -t staging-amd64 .

# 4. Tag and push to ECR
export TIMESTAMP=$(date +%Y%m%d-%H%M)
export IMAGE_TAG="staging-v2.1.6-${TIMESTAMP}"

echo "=== PUSHING TO ECR: ${IMAGE_TAG} ==="
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

docker tag staging-amd64 "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:${IMAGE_TAG}"
docker push "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:${IMAGE_TAG}"

echo "=== IMAGE PUSHED SUCCESSFULLY ==="
echo "Image Tag: ${IMAGE_TAG}"
echo ""
echo "=== NEXT STEPS ==="
echo "1. SSH to staging VM: ssh -i keys/ubuntu-staging-key.pem ubuntu@34.220.143.127"
echo "2. Run the following deployment commands:"
echo ""

cat << 'EOF'
# Deploy to staging VM (run these commands on the VM):

# 1. Create environment file
echo 'NODE_ENV=staging' > staging.env
echo 'DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require' >> staging.env
echo 'SESSION_SECRET=dev-secret-key-2025-heliotrope-imaginal' >> staging.env
echo 'NODE_TLS_REJECT_UNAUTHORIZED=0' >> staging.env
echo 'ENVIRONMENT=staging' >> staging.env

# 2. Deploy container
sudo docker stop staging-app || true
sudo docker rm staging-app || true

# 3. Run new container (replace IMAGE_TAG with actual timestamp)
sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-v2.1.6-[TIMESTAMP]

# 4. Verify deployment
curl -I http://34.220.143.127
curl http://34.220.143.127/api/health

EOF

echo ""
echo "=== DEPLOYMENT READY ==="
echo "Image: 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:${IMAGE_TAG}"
echo "Fix: IA navigation current steps no longer show lock icons"
echo "Test: Navigate through IA workshop and verify current steps show purple without locks"