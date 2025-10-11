#!/bin/bash

# Setup Docker on Lightsail VM and deploy staging app
# Usage: ./setup-staging-vm.sh <INSTANCE_IP>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <INSTANCE_IP>"
    exit 1
fi

INSTANCE_IP="$1"
IMAGE="962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:no-bedrock-v2"

echo "🔧 Setting up Docker on VM: $INSTANCE_IP"

# Setup commands to run on the VM
SETUP_COMMANDS="
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Configure AWS CLI for ECR access
sudo apt install awscli -y

# Login to ECR (you'll need to provide AWS credentials)
aws ecr get-login-password --region us-west-2 | sudo docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

# Pull the image
sudo docker pull $IMAGE

# Run the staging container
sudo docker run -d \\
  --name staging-app \\
  -p 80:8080 \\
  -e NODE_ENV=staging \\
  -e DATABASE_URL=\"postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require\" \\
  -e SESSION_SECRET=\"dev-secret-key-2025-heliotrope-imaginal\" \\
  -e ENVIRONMENT=\"staging\" \\
  --restart unless-stopped \\
  $IMAGE

echo \"✅ Staging app deployed!\"
echo \"🌐 Access at: http://$INSTANCE_IP\"
echo \"🏥 Health: http://$INSTANCE_IP/health\"
"

# Execute setup on the VM
ssh -i ~/.aws/staging-key.pem -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "$SETUP_COMMANDS"

echo ""
echo "✅ VM setup complete!"
echo "🌐 Staging URL: http://$INSTANCE_IP"
echo "🏥 Health check: http://$INSTANCE_IP/health"
echo ""
echo "🔧 VM management:"
echo "   SSH: ssh ubuntu@$INSTANCE_IP"
echo "   Logs: ssh ubuntu@$INSTANCE_IP 'sudo docker logs staging-app'"
echo "   Restart: ssh ubuntu@$INSTANCE_IP 'sudo docker restart staging-app'"
