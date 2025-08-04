# Emergency Staging Deployment Commands - 2025-07-27
# Fixed infinite loop crash for participant users

# 1. SSH to staging VM
ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127

# 2. Once on the VM, login to ECR first
aws ecr get-login-password --region us-west-2 | sudo docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

# 3. Create environment file (run each line separately)
echo 'NODE_ENV=staging' > staging.env
echo 'DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require' >> staging.env
echo 'SESSION_SECRET=dev-secret-key-2025-heliotrope-imaginal' >> staging.env
echo 'NODE_TLS_REJECT_UNAUTHORIZED=0' >> staging.env
echo 'ENVIRONMENT=staging' >> staging.env

# 4. Deploy container
sudo docker stop staging-app || true
sudo docker rm staging-app || true
sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-emergency-fix-20250727-0452

# 5. Verify deployment
curl -I http://34.220.143.127

# 6. Check container logs if needed
sudo docker logs staging-app

sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-openai-integration-20250804-1213

echo 'OPENAI_API_KEY=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' >> staging.env