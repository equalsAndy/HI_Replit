# AWS Lightsail Deployment - Complete Reference Guide

## 🎯 **Updated Deployment Architecture**

⚠️ **CRITICAL DISCOVERY: ARM64 vs AMD64 Architecture Issue**
- **Root Cause**: All Lightsail container service failures were due to ARM64 images (built on Apple Silicon) being incompatible with AMD64 Lightsail infrastructure
- **Solution**: Use VM-based deployment for staging, maintain container service for production

### **Development Environment (Local)**
- **Platform**: Local development server
- **URL**: http://localhost:8080
- **Command**: `./dev-local.sh` or `npm run dev`
- **Cost**: FREE
- **Purpose**: Development work with live reload

### **Staging Environment (VM-based)**
- **Platform**: AWS Lightsail Ubuntu VM
- **Instance**: `hi-staging-vm`
- **Size**: small_2_0 (1GB RAM, 1 vCPU, 40GB SSD)  
- **IP**: 34.220.143.127
- **URL**: http://34.220.143.127
- **Cost**: $10/month
- **Container**: Docker running directly on VM
- **Image**: `962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-amd64`
- **Benefits**: 
  - Full SSH access for debugging
  - Better for AI workloads (ChromaDB, Bedrock)
  - Direct Docker control
  - $5/month cheaper than container service

### **Production Environment (Container Service)**
- **Service**: `hi-replit-v2`
- **Container**: `allstarteams-app`
- **Size**: Small (1 GB RAM, 0.5 vCPUs)
- **Port**: 8080
- **Environment**: NODE_ENV=production
- **URL**: https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/
- **Cost**: $15/month
- **Status**: ✅ WORKING (using compatible image)

### **Shared Infrastructure**
- **Database**: AWS Lightsail PostgreSQL (shared by all environments)
- **Registry**: Amazon ECR (Elastic Container Registry)
- **Image Repository**: `962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app`
- **Total Cost**: $25/month (down from $45/month after removing failed services)

## 📋 **Updated Deployment Process**

### **🔧 Architecture-Specific Image Building**

#### **For Staging (VM Deployment)**
```bash
# 1. Navigate to project directory
cd /Users/bradtopliff/Desktop/HI_Replit

# 2. Build AMD64-specific image for VM compatibility
docker build --platform linux/amd64 -t staging-amd64-local .

# 3. Tag for ECR registry
docker tag staging-amd64-local 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-amd64

# 4. Push to ECR
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-amd64
```

#### **For Production (Container Service)**
```bash
# Build standard image (works with existing production setup)
docker build -t hi-replit-app .
docker tag hi-replit-app 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:production-$(date +%Y.%m.%d)
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:production-$(date +%Y.%m.%d)
```

### **🏠 Local Development Setup**
```bash
# Start local development environment
./dev-local.sh
# OR
npm run dev

# Access at: http://localhost:8080
```

### **🔧 Staging VM Deployment**

#### **VM Management**
```bash
# Create VM (if needed)
./create-staging-vm.sh

# Access VM via Lightsail Console SSH:
# 1. Go to https://lightsail.aws.amazon.com/
# 2. Click "hi-staging-vm"
# 3. Click "Connect using SSH"
```

#### **Deploy to VM**


```bash
# In VM SSH terminal:

# 1. Create environment file (line by line to avoid truncation)
echo 'NODE_ENV=staging' > staging.env
echo 'DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require' >> staging.env
echo 'SESSION_SECRET=dev-secret-key-2025-heliotrope-imaginal' >> staging.env
echo 'ENVIRONMENT=staging' >> staging.env

# 2. Deploy container (stop and remove existing first)
sudo docker stop staging-app || true
sudo docker rm staging-app || true

sudo docker run -d \
  --name staging-app \
  -p 80:8080 \
  --env-file staging.env \
  --restart unless-stopped \
  962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-amd64

# 3. Verify deployment
sudo docker ps
curl http://localhost/health
curl http://34.220.143.127/health
```

#### **Environment Badge Fix**
If the staging environment shows "development" instead of "staging" in the UI badge:

```bash
# 1. Build with correct environment locally
./update-version.sh 1.0.0 staging
npm run build:staging

# 2. Build and push corrected image
docker build --platform linux/amd64 -t staging-fixed . 
docker tag staging-fixed 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-fixed
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-fixed

# 3. Deploy updated image to VM
# (In VM SSH terminal)
sudo docker pull 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-fixed
sudo docker stop staging-app || true
sudo docker rm staging-app || true
sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-fixed
```

### **🚀 Production Container Service Deployment**
```bash
# Deploy to production (existing process)
aws lightsail create-container-service-deployment \
  --service-name hi-replit-v2 \
  --region us-west-2 \
  --containers '{
    "allstarteams-app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:production-'$(date +%Y.%m.%d)'",
      "ports": {"8080": "HTTP"},
      "environment": {
        "NODE_ENV": "production"
      }
    }
  }' \
  --public-endpoint '{
    "containerName": "allstarteams-app",
    "containerPort": 8080,
    "healthCheck": {
      "healthyThreshold": 5,
      "unhealthyThreshold": 5,
      "timeoutSeconds": 60,
      "intervalSeconds": 90,
      "path": "/health",
      "successCodes": "200-499"
    }
  }'
```

### **Phase 3: Lightsail Deployment**
```bash
# Deploy container to Lightsail service
aws lightsail create-container-service-deployment \
  --service-name hi-replit-app \
  --region us-west-2 \
  --containers '{
    "app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:2025.07.24",
      "ports": {"3000": "HTTP"},
      "environment": {
        "NODE_ENV": "production"
      }
    }
  }' \
  --public-endpoint '{"containerName": "app", "containerPort": 3000}'
```

### **Phase 4: Verification & Testing**
```bash
# Check deployment status
aws lightsail get-container-service-deployments --service-name hi-replit-app --region us-west-2

# Test application health
curl https://hi-replit-app.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/

# View container logs (if needed)
aws lightsail get-container-log --service-name hi-replit-app --container-name app --region us-west-2
```

## 🔧 **Corrected Dockerfile for Replit Monorepo**

```dockerfile
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files (root level in monorepo)
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci && npm cache clean --force

# Copy all application code
COPY . ./

# Build the application (Vite + ESBuild)
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

USER nodeuser

# Expose port 3000
EXPOSE 3000

# Environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init and start built app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

## 🔐 **Required IAM Permissions**

### **User**: HeliotropeAppDeployment
### **Required Policies**:
- `AmazonEC2ContainerRegistryFullAccess` (for ECR operations)
- `AmazonLightsailFullAccess` (for container service management)

### **Key Permissions Needed**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:CreateRepository", 
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lightsail:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🌐 **Environment Configuration**

### **Environment Variables**
- **NODE_ENV**: production
- **DATABASE_URL**: (Stored in AWS Secrets Manager)
- **Additional variables**: Retrieved from `hi-replit-env` secret

### **Port Configuration**
- **Container Port**: 3000
- **Protocol**: HTTP
- **Public Endpoint**: Enabled on port 3000

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **1. Authentication Errors (403 Forbidden)**
**Symptoms**: `unknown: unexpected status from HEAD request`
**Causes**: 
- Wrong account ID in registry URL
- Insufficient IAM permissions
- Expired authentication token

**Solutions**:
```bash
# Verify correct account ID
aws sts get-caller-identity

# Re-authenticate with ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

# Check IAM permissions in AWS Console
```

#### **2. Login Fails with SSL Certificate Error**
**Symptoms**: `Session creation failed: self-signed certificate in certificate chain`

**Solution**:
```bash
# Ensure environment file includes SSL bypass

# Restart container with updated environment
sudo docker stop staging-app && sudo docker rm staging-app
sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped [IMAGE_NAME]
```

#### **3. Environment Badge Shows Wrong Environment**
**Symptoms**: Staging shows "DEV" badge, missing environment indicator
**Cause**: Built with wrong environment configuration

**Solution**:
```bash
# Build with correct environment
./update-version.sh 1.0.0 staging  # For staging
./update-version.sh 1.0.0 production  # For production
npm run build:staging  # or build:production

# Rebuild and deploy Docker image
```

#### **2. Repository Does Not Exist**
**Symptoms**: `repository does not exist or no pull access`
**Solution**:
```bash
aws ecr create-repository --repository-name hi-replit-app --region us-west-2
```

#### **3. Deployment Stuck in PENDING**
**Symptoms**: Deployment shows PENDING status for extended time
**Solutions**:
```bash
# Check deployment status
aws lightsail get-container-service-deployments --service-name hi-replit-app --region us-west-2

# View container logs
aws lightsail get-container-log --service-name hi-replit-app --container-name app --region us-west-2

# Verify image exists in ECR
aws ecr list-images --repository-name hi-replit-app --region us-west-2
```

#### **4. Application Health Check Failures**
**Symptoms**: Container starts but health checks fail
**Solutions**:
- Verify application starts on port 3000
- Check that `/health` endpoint exists
- Review application logs for startup errors
- Verify environment variables are loaded

## 🔄 **Update & Maintenance Procedures**

### **Quick Deployment (Recommended)**
```bash
# Deploy to STAGING
./deploy-to-staging.sh

# Deploy to PRODUCTION
./deploy-to-production.sh
```

### **Manual Deployment Steps**
```bash
# 1. Build Docker image
docker build -t hi-replit-app .

# 2. Tag with relevant staging tag (date + time)
docker tag hi-replit-app 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-$(date +%Y.%m.%d-%H%M)

# 3. Push to ECR
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-$(date +%Y.%m.%d-%H%M)

# 4a. Deploy to STAGING
aws lightsail create-container-service-deployment \
  --service-name hi-app-staging \
  --region us-west-2 \
  --containers '{
    "heliotrope-app-staging": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-2025.07.24-1530",
      "ports": {"8080": "HTTP"},
      "environment": {
        "NODE_ENV": "staging"
      }
    }
  }' \
  --public-endpoint '{"containerName": "heliotrope-app-staging", "containerPort": 8080}'

# 4b. Deploy to PRODUCTION (remove NODE_ENV=staging!)
aws lightsail create-container-service-deployment \
  --service-name hi-replit-v2 \
  --region us-west-2 \
  --containers '{
    "allstarteams-app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:v2025.07.24.1530",
      "ports": {"8080": "HTTP"},
      "environment": {
        "NODE_ENV": "production"
      }
    }
  }' \
  --public-endpoint '{"containerName": "allstarteams-app", "containerPort": 8080}'
```

### **Scaling the Service**
```bash
# Scale to medium (if needed)
aws lightsail update-container-service \
  --service-name hi-replit-app \
  --power medium \
  --scale 2 \
  --region us-west-2
```

### **Monitoring & Logs**
```bash
# View recent logs
aws lightsail get-container-log \
  --service-name hi-replit-app \
  --container-name app \
  --region us-west-2 \
  --start-time "2025-07-07T00:00:00Z"

# Get service metrics
aws lightsail get-container-service-metric-data \
  --service-name hi-replit-app \
  --metric-name CPUUtilization \
  --start-time "2025-07-07T00:00:00Z" \
  --end-time "2025-07-07T23:59:59Z" \
  --period 3600 \
  --statistics Average \
  --region us-west-2
```

## 🎯 **Success Verification Checklist**

### **Deployment Complete When**:
- [ ] Container builds successfully without errors
- [ ] Image pushes to ECR registry successfully  
- [ ] Lightsail deployment shows "RUNNING" status
- [ ] Application responds at public URL
- [ ] Health check endpoint returns 200 OK
- [ ] Database connection working (if applicable)
- [ ] Environment variables loaded correctly

### **Performance Verification**:
- [ ] Page load times under 3 seconds
- [ ] No 500/400 errors in logs
- [ ] Memory usage under 80% of allocated
- [ ] CPU usage normal during typical load

## 📞 **Support Resources**

### **Key AWS Documentation**:
- [Lightsail Container Services](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-container-services.html)
- [ECR User Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### **Project Specific**:
- **Database**: Neon PostgreSQL (external, no AWS changes needed)
- **Project Location**: `/Users/bradtopliff/Desktop/HI_Replit`
- **Git Repository**: Local development repository

## 🎯 **Quick Reference**

### **Daily Deployment Commands**
```bash
# Deploy to staging for testing
./deploy-to-staging.sh

# Deploy to production (after staging verification)
./deploy-to-production.sh

# Check deployment status
aws lightsail get-container-service-deployments --service-name hi-app-staging --region us-west-2
aws lightsail get-container-service-deployments --service-name hi-replit-v2 --region us-west-2

# View logs
aws lightsail get-container-log --service-name hi-app-staging --container-name heliotrope-app-staging --region us-west-2
aws lightsail get-container-log --service-name hi-replit-v2 --container-name allstarteams-app --region us-west-2
```

### **Quick Copy/Paste Commands**
For easy copy/paste without line breaks, use the command reference file:
```
/tempClaudecomms/staging-vm-commands.txt
```

This file contains all commands on single lines for easy terminal pasting.

### **Image Versioning**
- **Staging Tags**: `staging-YYYY.MM.DD-HHMM` (e.g., `staging-2025.07.24-1530`)
- **Production Tags**: `v{YYYY.MM.DD}.{HHMM}` (e.g., `v2025.07.24.1530`)
- **Registry**: `962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app`
- **Example Images**: 
  - Staging: `...hi-replit-app:staging-2025.07.24-1530`
  - Production: `...hi-replit-app:v2025.07.24.1530`

### **Service Information**
**Staging:**
- **Service Name**: `hi-app-staging`
- **Container Name**: `heliotrope-app-staging`
- **URL**: `https://hi-app-staging.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/`
- **Port**: `8080`
- **Environment**: `NODE_ENV=staging`

**Production:**
- **Service Name**: `hi-replit-v2`
- **Container Name**: `allstarteams-app`
- **URL**: `https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/`
- **Port**: `8080`
- **Environment**: `NODE_ENV=production`

---

**Status**: Production-ready deployment configuration  
**Last Updated**: July 2025  
**Next Review**: After first production deployment
