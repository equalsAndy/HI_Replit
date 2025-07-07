# AWS Lightsail Deployment - Complete Reference Guide

## 🎯 **Deployment Architecture**

### **Production Stack**
- **Frontend/Backend**: Node.js application (combined Replit monorepo)
- **Container Platform**: AWS Lightsail Container Service
- **Database**: Neon PostgreSQL (external, no migration needed)
- **Registry**: Amazon ECR (Elastic Container Registry)
- **Domain**: Lightsail-provided URL with custom domain option

### **Key Infrastructure Components**
- **Lightsail Container Service**: `hi-replit-app` (us-west-2)
- **Service URL**: `https://hi-replit-app.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/`
- **Container Registry**: `962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app`
- **Service Scale**: nano (1 vCPU, 0.5 GB RAM)
- **Environment Variables**: Stored in AWS Secrets Manager

## 📋 **Complete Deployment Process**

### **Phase 1: Container Preparation**
```bash
# 1. Navigate to project directory
cd /Users/bradtopliff/Desktop/HI_Replit

# 2. Build container with corrected Dockerfile
docker build -t hi-replit-app .

# 3. Tag for ECR registry (use correct account ID)
docker tag hi-replit-app 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:latest
```

### **Phase 2: AWS Authentication & Registry Setup**
```bash
# 1. Ensure ECR repository exists
aws ecr create-repository --repository-name hi-replit-app --region us-west-2

# 2. Authenticate Docker with ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com

# 3. Push container to ECR
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:latest
```

### **Phase 3: Lightsail Deployment**
```bash
# Deploy container to Lightsail service
aws lightsail create-container-service-deployment \
  --service-name hi-replit-app \
  --region us-west-2 \
  --containers '{
    "app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:latest",
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

### **Deploying Application Updates**
```bash
# 1. Build new container version
docker build -t hi-replit-app:v2 .

# 2. Tag with latest
docker tag hi-replit-app:v2 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:latest

# 3. Push to ECR
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:latest

# 4. Deploy to Lightsail (rerun deployment command)
aws lightsail create-container-service-deployment \
  --service-name hi-replit-app \
  --region us-west-2 \
  --containers '{
    "app": {
      "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:latest",
      "ports": {"3000": "HTTP"},
      "environment": {
        "NODE_ENV": "production"
      }
    }
  }' \
  --public-endpoint '{"containerName": "app", "containerPort": 3000}'
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

---

**Status**: Production-ready deployment configuration  
**Last Updated**: July 2025  
**Next Review**: After first production deployment