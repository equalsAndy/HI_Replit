#!/bin/bash
set -e

echo "🚀 Updating working base image with latest code..."

# Build your latest code locally first
echo "📦 Building latest staging version..."
npm run build:staging

# Pull the working base image
echo "⬇️ Pulling working base image..."
docker pull 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:environment-badge-test

# Create a new Dockerfile that layers your latest code on the working base
cat > Dockerfile.update << 'DOCKER_EOF'
FROM 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:environment-badge-test

# Remove old client dist and server files
RUN rm -rf /app/dist /app/server.bundle.js /app/shared

# Copy new built files
COPY dist/ /app/dist/
COPY server.bundle.js /app/
COPY shared/ /app/shared/
COPY package.json /app/

# Ensure proper permissions and restart PM2
RUN chmod +x /app/server.bundle.js
DOCKER_EOF

# Build the updated image
NEW_TAG="updated-$(date +%Y%m%d-%H%M%S)"
echo "🔨 Building updated image with tag: $NEW_TAG"
docker build -f Dockerfile.update -t 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG .

# Login to ECR and push
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

echo "⬆️ Pushing updated image..."
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$NEW_TAG

echo "✅ Updated image ready: $NEW_TAG"
echo "💡 Deploy with: aws lightsail create-container-service-deployment --service-name hi-replit-v2 --region us-west-2 --containers '{\"allstarteams-app\": {\"image\": \"962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:'$NEW_TAG'\", \"ports\": {\"8080\": \"HTTP\"}, \"environment\": {\"DATABASE_URL\": \"postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require\", \"SESSION_SECRET\": \"dev-secret-key-2025-heliotrope-imaginal\", \"NODE_ENV\": \"staging\", \"PORT\": \"8080\", \"NODE_TLS_REJECT_UNAUTHORIZED\": \"0\"}}}' --public-endpoint '{\"containerName\": \"allstarteams-app\", \"containerPort\": 8080, \"healthCheck\": {\"healthyThreshold\": 3, \"unhealthyThreshold\": 3, \"timeoutSeconds\": 60, \"intervalSeconds\": 120, \"path\": \"/health\", \"successCodes\": \"200-499\"}}'"

