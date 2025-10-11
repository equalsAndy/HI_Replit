#!/bin/bash

# --- CONFIGURATION ---
AWS_REGION="us-west-2"
ACCOUNT_ID="962000089613"
ECR_REPO="hi-replit-app"

TAG="$(date +%Y%m%d-%H%M%S)"   # or: TAG="latest"
DOCKERFILE="Dockerfile.production"

# Safety check: prevent shipping insecure TLS override to production
  echo "Unset it and retry." >&2
  exit 1
fi
# If local env file exists, check it too
if [ -f .env.production ]; then
    exit 2
  fi
fi

# --- ECR LOGIN ---
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com


# --- BUILD & PUSH IMAGE ---
ECR_IMAGE="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$TAG"
echo "Building and pushing Docker image: $ECR_IMAGE ..."
docker buildx build --platform linux/amd64 \
  -f $DOCKERFILE \
  -t $ECR_IMAGE \
  --push \
  --build-arg NODE_ENV=production \
  .

echo "Image pushed: $ECR_IMAGE"

# --- LIGHTSAIL DEPLOYMENT HINT ---
echo "To deploy on Lightsail:"
echo "1. In AWS Lightsail Console, update your container deployment to pull:"
echo "   $ECR_IMAGE"
echo "2. Set production env vars via Lightsail web UI--do NOT bake them into the image."

# --- OPTIONAL: LOCAL IMAGE TEST ---
# echo "Testing your image locally:"
# docker run --env-file .env.production -p 8080:8080 $IMAGE_NAME:$TAG

echo "Done!"
