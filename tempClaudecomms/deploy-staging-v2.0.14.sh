#!/bin/bash
# Staging deployment for v2.0.14
# Date: 2025-07-26
# Changes: Fixed beta tester toggle persistence

# Create environment file (line by line to avoid truncation)
echo 'NODE_ENV=staging' > staging.env
echo 'DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require' >> staging.env
echo 'SESSION_SECRET=dev-secret-key-2025-heliotrope-imaginal' >> staging.env
echo 'NODE_TLS_REJECT_UNAUTHORIZED=0' >> staging.env
echo 'ENVIRONMENT=staging' >> staging.env

# Stop and remove existing container
sudo docker stop staging-app || true
sudo docker rm staging-app || true

# Pull and run the new container
sudo docker pull 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-20250726-2216
sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-20250726-2216

# Check container status
sudo docker ps -a | grep staging-app

# Show logs
sudo docker logs staging-app --tail 50

echo "Deployment complete. Check http://34.220.143.127 to verify."