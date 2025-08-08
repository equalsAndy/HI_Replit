# Heliotrope Imaginal Development Project

## 🎯 Project Overview

This is a dual-workshop platform hosting **AST (AllStarTeams)** and **IA (Imaginal Agility)** workshops. The application helps teams and individuals discover their strengths, achieve flow states, and build collaborative excellence through structured assessments and AI-powered insights.

**Key Technologies:** Node.js, React, TypeScript, PostgreSQL, Docker, AWS Lightsail, Claude API

## 🗂️ Project Structure

```
/Users/bradtopliff/Desktop/HI_Replit/
├── client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Client utilities & feature flags
│   │   └── pages/           # Route components
│   ├── dist/                # Build output
│   └── package.json
├── server/                   # Node.js backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Server utilities & feature flags
│   │   └── services/        # Business logic
│   ├── dist/                # Build output
│   └── package.json
├── shared/                   # Shared TypeScript types & schemas
├── docker-compose.yml        # Local development environment
├── docs/                    # Project documentation
├── JiraTickets/             # Jira ticket templates for issue tracking
├── tempClaudecomms/         # Temporary command files for SSH operations
└── Claude Code prompts/     # Custom prompts and instructions for Claude Code
```

## 🔧 Development Environment

### **Critical Requirements**
- **Node.js**: 18.x.x or higher
- **Port**: Always use **8080** (NOT 5000 - conflicts with macOS AirPlay)
- **Database**: PostgreSQL (AWS Lightsail for dev, Neon for production)
- **Workshop Separation**: AST and IA are completely separate systems

### **Quick Start Commands**
```bash
# Initial setup
cd /Users/bradtopliff/Desktop/HI_Replit
git checkout development
git pull origin development

# Install dependencies
npm install

# Start development environment
# Single command from root (runs both server and client)
npm run dev

# Application runs on: http://localhost:8080
```

### **Environment Files Required**
```bash
# Server environment
server/.env.development
server/.env.staging  
server/.env.production

# Client environment
client/.env.development
client/.env.staging
client/.env.production
```

## 🚨 Critical Workshop Separation Rules

### **NEVER MIX AST AND IA WORKSHOPS**

**AST (AllStarTeams):**
- Blue color theme
- Step IDs: `1-1`, `1-2`, `2-1`, `2-2`, `3-1`, `3-2`
- Routes: `/workshop/ast/*`
- API endpoints: `/api/ast/*`

**IA (Imaginal Agility):**
- Purple color theme  
- Step IDs: `ia-1-1`, `ia-1-2`, `ia-2-1`, `ia-2-2`
- Routes: `/workshop/ia/*`
- API endpoints: `/api/ia/*`

**Always specify which workshop when working on features!**

## 🔄 Git Workflow Standards

### **Important Git Rules**
```bash
# ✅ ALWAYS use explicit messages (avoid quote> prompts)
git commit -m "Your message here"
git tag -a v1.0.0 -m "Version message"
git merge --no-ff branch-name -m "Merge message"

# ❌ NEVER use these (causes terminal hangs)
git commit
git tag -a v1.0.0
git merge --no-ff branch-name
```

### **Branch Strategy**
- **main**: Production-ready code
- **development**: Active development (primary branch)
- **feature/**: New features
- **hotfix/**: Critical production fixes

## 🗄️ Database & Environment Management

### **Database Environments**
- **Development**: AWS RDS PostgreSQL (`ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com`) - safe for testing
- **Staging**: app2.heliotropeimaginal.com  
- **Production**: app.heliotropeimaginal.com (PROTECTED)

### **⚠️ IMPORTANT: Current Development Database**
The development environment currently uses the **AWS RDS database** (not local PostgreSQL). All development, beta testing, and feature work should be done against this RDS instance:

```bash
# Current development database connection
DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require
```

**Key Points:**
- User accounts, beta tester data, and notes are stored in this RDS database
- All database migrations and schema changes should be applied here
- Beta tester functionality (User 16, etc.) exists in this database, not local PostgreSQL

### **Environment Safety**
```bash
# Safe development commands
npm run dev              # Development server
npm run build           # Production build
npm run test            # Run tests

# Database operations (RDS development database)
npm run db:migrate      # Run migrations on RDS
npm run db:seed        # Seed test data on RDS  
npm run db:reset       # Reset RDS database (USE WITH CAUTION)

# Direct RDS database access
NODE_TLS_REJECT_UNAUTHORIZED=0 PGPASSWORD=HeliotropeDev2025 psql -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com -U dbmasteruser -d postgres
```

### **Admin Access**
```bash
# Admin credentials for development/staging
Username: admin
Password: Heliotrope@2025

# Admin endpoints
/admin                   # Admin dashboard
/api/reports/holistic/admin/reset  # Reset all holistic reports (DELETE)
/api/reports/holistic/admin/list   # List all reports (GET)
```

## 🚩 Feature Flag System

### **Server Flags** (`server/utils/feature-flags.ts`)
```typescript
export const featureFlags = {
  workshopLocking: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'Lock workshop inputs after completion'
  },
  holisticReports: {
    enabled: process.env.FEATURE_HOLISTIC_REPORTS !== 'false',  // ✅ ENABLED BY DEFAULT
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'Claude API-powered personalized reports',
    aiRelated: true
  },
  facilitatorConsole: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'Facilitator cohort management system'
  },
  aiCoaching: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'AI-powered coaching chatbot system',
    aiRelated: true
  },
  videoManagement: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'Enhanced video management and progress tracking'
  },
  debugPanel: {
    enabled: process.env.FEATURE_DEBUG_PANEL === 'true',  // ⚡ DEV ONLY
    environment: 'development',
    description: 'Development debugging panel and tools'
  },
  feedbackSystem: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'User feedback collection and management system'
  }
};
```

### **Client Flags** (`client/src/utils/featureFlags.ts`)
```typescript
export const clientFeatureFlags = {
  debugPanel: {
    enabled: import.meta.env.VITE_FEATURE_DEBUG_PANEL === 'true',  // ⚡ DEV ONLY
    environment: 'development',
    description: 'Development debugging panel and tools'
  },
  feedbackSystem: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'User feedback collection and management system'
  },
  videoManagement: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'Enhanced video management features'
  },
  reflectionModal: {
    enabled: true,
    environment: 'all',  // ✅ ENABLED FOR PRODUCTION
    description: 'Original modal-based Reflection Talia interface'
  }
};
```

### **Production Environment Variables**
```bash
# All features enabled for production
NODE_ENV=production
ENVIRONMENT=production
CLAUDE_API_KEY=your-claude-api-key-here
FEATURE_HOLISTIC_REPORTS=true
FEATURE_DEBUG_PANEL=false  # Keep disabled in production
DATABASE_URL=postgresql://production_connection_string
SESSION_SECRET=production_secret_key
```

## 🔧 Common Development Tasks

### **Adding New Features**
1. **Create feature flag** (if needed)
2. **Determine workshop type** (AST, IA, or both)
3. **Create appropriate routes/API endpoints**
4. **Implement with workshop separation**
5. **Add comprehensive tests**

### **API Development**
```bash
# API endpoint structure
/api/ast/workshop-data/step     # AST-specific endpoints
/api/ia/workshop-data/step      # IA-specific endpoints  
/api/shared/users               # Shared endpoints
/api/admin/dashboard            # Admin-only endpoints
```

### **Component Development**
```bash
# Component organization
client/src/components/
├── ui/                    # Reusable UI components
├── content/
│   ├── allstarteams/     # AST-specific components
│   └── imaginal-agility/ # IA-specific components
└── shared/               # Cross-workshop components
```

## 🧪 Testing Strategy

### **Test Types**
```bash
# Unit tests
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report

# Integration tests  
npm run test:integration       # API integration tests

# E2E tests
npm run test:e2e              # End-to-end tests

# Workshop separation tests
npm run test:separation       # Validate AST/IA separation
```

### **Test Workshop Separation**
```typescript
// Always test both workshops when making changes
describe('Feature X', () => {
  it('should work for AST workshop', () => {
    // Test AST-specific behavior
  });
  
  it('should work for IA workshop', () => {
    // Test IA-specific behavior  
  });
  
  it('should not allow cross-workshop contamination', () => {
    // Test data isolation
  });
});
```

## 🔍 Debugging & Troubleshooting

### **Common Issues & Solutions**

**Port Conflicts:**
```bash
# Check what's using port 8080
lsof -i :8080

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# macOS AirPlay uses port 5000 - always use 8080
```

**Build Failures:**
```bash
# Clear all caches
npm cache clean --force
rm -rf node_modules package-lock.json client/dist client/.vite
npm install

# Memory issues
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

**Database Connection Issues:**
```bash
# Test database connection
curl http://localhost:8080/api/health

# Check environment variables
echo $DATABASE_URL

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"
```

### **Health Check Endpoints**
```bash
# Basic health check (CORRECT ENDPOINT)
curl http://localhost:8080/health

# Feature flag status (development only)
curl http://localhost:8080/api/workshop-data/feature-status

# Production health check
curl https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/health
curl https://app2.heliotropeimaginal.com/health
```

**⚠️ IMPORTANT:** Health endpoint is `/health` NOT `/api/health`

## 🤖 AI Integration (Claude API)

### **AI Features**
- **Holistic Reports**: AI-generated personalized development reports
- **Coaching Interface**: Interactive AI coaching for workshop participants
- **Content Generation**: Dynamic workshop content and insights

### **Claude API Configuration**
```bash
# Environment variables required
CLAUDE_API_KEY=your-claude-api-key-here
FEATURE_AI_COACHING=true
FEATURE_HOLISTIC_REPORTS=true
```

### **API Key Location**
```bash
# Claude API key stored in:
/Users/bradtopliff/Desktop/HI_Replit/keys/HI-AST-KEY.txt
```

### **AI Development Guidelines**
- Always validate AI responses for safety and accuracy
- Implement rate limiting for API calls
- Cache responses when appropriate
- Provide fallback content when AI is unavailable

## 🚀 Deployment Process

### **AWS Lightsail Infrastructure**
- **Service Name**: `hi-replit-v2` (⚠️ NEVER create new services)
- **Container Name**: `allstarteams-app` (NOT hi-app)
- **Port**: 8080 (NEVER 5000 due to macOS AirPlay conflict)
- **Region**: us-west-2

### **Staging Deployment (VM-Based)**
⚠️ **UPDATE**: Staging now uses VM deployment due to ARM64/AMD64 compatibility issues with container services.

```bash
# 1. Build with staging environment
./update-version.sh 1.0.0 staging
npm run build:staging

# 2. Build AMD64-compatible Docker image
docker build --platform linux/amd64 -t staging-amd64 .

# 3. Tag and push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com
docker tag staging-amd64 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-$(date +%Y%m%d-%H%M)
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-$(date +%Y%m%d-%H%M)

# 4. Deploy to VM (via Lightsail Console SSH)
# Access: https://lightsail.aws.amazon.com/ → hi-staging-vm → Connect using SSH
# VM IP: 34.220.143.127

# Create environment file (line by line to avoid truncation)
echo 'NODE_ENV=staging' > staging.env
echo 'DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require' >> staging.env
echo 'SESSION_SECRET=dev-secret-key-2025-heliotrope-imaginal' >> staging.env
echo 'NODE_TLS_REJECT_UNAUTHORIZED=0' >> staging.env
echo 'ENVIRONMENT=development' >> staging.env
echo 'CLAUDE_API_KEY=your-claude-api-key-here' >> staging.env

# Deploy container (NODE_ENV override no longer needed after package.json fix)
sudo docker stop staging-app || true
sudo docker rm staging-app || true
sudo docker run -d --name staging-app -p 80:8080 --env-file staging.env --restart unless-stopped 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:staging-[TAG]

# Verify: http://34.220.143.127
```

### **SSH Command Guidelines**
When providing SSH commands:
- **Single short command**: Display it directly in the conversation for immediate copy/paste
- **Multiple commands or long commands**: Save to `/tempClaudecomms/` folder to prevent line break issues
  - Always tell the user which file contains the commands
  - Include timestamp and clear description in the file
  - Keep each command on a single line for easy copy/paste

### **SSH Access to Staging VM**
```bash
ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127
```

### **Production Deployment Options**

#### **Option 1: Quick Patch Deployment (Recommended for small fixes)**
```bash
# For UI fixes, small bug fixes, configuration updates
# 1. Make changes locally and build
npm run build

# 2. Build lightweight Docker image
docker build -t quick-patch .
PATCH_TAG="patch-$(date +%Y%m%d-%H%M)"

# 3. Tag and push to ECR
docker tag quick-patch 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PATCH_TAG
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PATCH_TAG

# 4. Deploy with existing configuration
cat > patch-deployment.json << EOF
{
  "allstarteams-app": {
    "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PATCH_TAG",
    "environment": {
      "NODE_ENV": "production",
      "DATABASE_URL": "postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require",
      "SESSION_SECRET": "dev-secret-key-2025-heliotrope-imaginal",
      "CLAUDE_API_KEY": "your-claude-api-key-here",
      "OPENAI_API_KEY": "your-openai-api-key-here",
      "FEATURE_HOLISTIC_REPORTS": "true",
      "FEATURE_DEBUG_PANEL": "false",
      "NODE_TLS_REJECT_UNAUTHORIZED": "0",
      "ENVIRONMENT": "production"
    },
    "ports": {
      "8080": "HTTP"
    }
  }
}
EOF

aws lightsail create-container-service-deployment \
  --region us-west-2 \
  --service-name hi-replit-v2 \
  --containers file://patch-deployment.json \
  --public-endpoint file://production-public-endpoint.json
```

#### **Option 2: Dependency-Fixed Deployment (For dependency issues)**
```bash
# Use when encountering module not found errors or dependency issues
# Build on staging VM with ALL dependencies included

# 1. SSH to staging VM and build fixed image
ssh -i /Users/bradtopliff/Desktop/HI_Replit/keys/ubuntu-staging-key.pem ubuntu@34.220.143.127

# 2. On staging VM - create production build directory
mkdir -p production-build
cd production-build

# 3. Copy application files and create fixed Dockerfile
# (Copy dist/, shared/, package*.json from local build)

cat > Dockerfile.dependency-fix << 'EOF'
FROM node:18-alpine

# Install system dependencies for canvas and build tools
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    python3 \
    make \
    g++ \
    dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for modules like drizzle-zod)
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copy application files
COPY dist/ ./dist/
COPY shared/ ./shared/

# Create non-root user
RUN adduser -D -s /bin/sh appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
EOF

# 4. Build, tag, and push fixed image
FIXED_TAG="production-dependency-fixed-$(date +%Y%m%d-%H%M)"
sudo docker build -f Dockerfile.dependency-fix -t $FIXED_TAG .
sudo docker tag $FIXED_TAG 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$FIXED_TAG
aws ecr get-login-password --region us-west-2 | sudo docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com
sudo docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$FIXED_TAG

# 5. Deploy to production (run locally)
# Use the deployment configuration with the fixed tag
```

#### **Option 3: Full Tagged Release (For major versions)**
```bash
# For major releases, new features, version milestones
# Always test in staging first

# 1. Create production tag (single-line format)
git checkout development
git pull origin development
git tag -a v1.x.x -m "Production release v1.x.x - AST/IA platform"
git push origin v1.x.x

# 2. Build from tagged version
git checkout v1.x.x
docker build -t allstarteams-app:v1.x.x .

# 3. Push tagged container to ECR
PROD_TAG="production-v$(git describe --tags)"
docker tag allstarteams-app:v1.x.x 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PROD_TAG
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com
docker push 962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$PROD_TAG

# 4. Deploy with production configuration
# Use standard deployment.json with new image tag
```

### **Critical Deployment Configuration**

#### **Required Configuration Files**
```bash
# production-public-endpoint.json (⚠️ IMPORTANT: Correct health check path)
{
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
}

# ⚠️ CRITICAL: Health check path MUST be "/health" NOT "/api/health"
# Deployments will fail to activate with incorrect health check path
```

#### **Custom Domain Configuration**
```bash
# Production URLs (both working after Route 53 DNS fix):
# ✅ https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/
# ✅ https://app2.heliotropeimaginal.com/

# Route 53 Configuration:
# Record: app2.heliotropeimaginal.com
# Type: CNAME
# Value: hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com
# TTL: 300
```

### **Deployment Health Checks**
```bash
# Verify staging deployment (VM)
curl -I http://34.220.143.127/
curl http://34.220.143.127/health

# Verify production deployment (both URLs)
curl -I https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/
curl -I https://app2.heliotropeimaginal.com/

# Check health endpoints
curl https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/health
curl https://app2.heliotropeimaginal.com/health

# Monitor deployment status
aws lightsail get-container-services \
  --region us-west-2 \
  --service-name hi-replit-v2 \
  --query 'containerServices[0].{state: state, currentVersion: currentDeployment.version, nextVersion: nextDeployment.version, nextState: nextDeployment.state}'

# Check container logs for errors
aws lightsail get-container-log \
  --region us-west-2 \
  --service-name hi-replit-v2 \
  --container-name allstarteams-app | tail -20
```

### **Semantic Versioning System**
- **Development**: Date-based versioning (e.g., `DEV v2025.07.25.0929`)
- **Staging**: Semantic versioning starting from `v2.0.1` (e.g., `STAGING v2.0.3.0929`)
- **Production**: No navbar badge, version shown in admin/test dashboards only

### **Version Management Commands**
```bash
# Staging builds (increments version automatically)
npm run build:staging          # Patch version (2.0.1 → 2.0.2)
npm run build:staging:minor    # Minor version (2.0.3 → 2.1.0)  
npm run build:staging:major    # Major version (2.1.0 → 3.0.0)

# Manual version setting
./version-manager.sh staging 2.1.5  # Set specific version

# Production (uses current staging version)
npm run build:production
```

### **Critical Deployment Rules**
- ⚠️ **Always use `-m "message"` with git commands** (avoid quote> prompts)
- ⚠️ **Port 8080 only** (macOS AirPlay uses 5000)
- ⚠️ **Health check timeout max 60 seconds** (not 90)
- ⚠️ **Health check path MUST be "/health"** (NOT "/api/health")
- ⚠️ **Test staging before production deployment**
- ⚠️ **Use existing service `hi-replit-v2`** (don't create new services)
- ⚠️ **Build with `--platform linux/amd64`** for VM/container compatibility on Apple Silicon
- ⚠️ **ECR image tags must include architecture suffix** (e.g., `-amd64`) for VM deployments
- ⚠️ **Include `NODE_TLS_REJECT_UNAUTHORIZED=0`** in environment for database SSL issues
- ⚠️ **Use version-manager.sh** for proper semantic versioning

### **Common Deployment Issues & Solutions**

#### **Issue: Deployment Stuck in ACTIVATING State**
**Symptoms:** Deployment shows "ACTIVATING" for extended period
**Cause:** Incorrect health check path in configuration
**Solution:** 
```bash
# Check health check configuration in production-public-endpoint.json
# Ensure path is "/health" not "/api/health"
# Update and redeploy with correct configuration
```

#### **Issue: Module Not Found Errors (drizzle-zod, etc.)**
**Symptoms:** Container starts then crashes with ERR_MODULE_NOT_FOUND
**Cause:** Production Docker build excludes dev dependencies
**Solution:** Use Option 2 (Dependency-Fixed Deployment) - build on staging VM with ALL dependencies

#### **Issue: Custom Domain Not Working**
**Symptoms:** Custom domain times out, Lightsail URL works
**Cause:** DNS record points to wrong IP address
**Solution:**
```bash
# Check DNS resolution
nslookup app2.heliotropeimaginal.com
nslookup hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com

# Update Route 53 CNAME record to point to Lightsail service
# Record: app2 (not full domain)
# Type: CNAME
# Value: hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com
```

#### **Issue: Container Restarts with SIGTERM**
**Symptoms:** Container starts successfully then receives SIGTERM
**Cause:** Health check failures or missing dependencies
**Solution:** Check container logs for specific error messages, ensure health endpoint works

## 🤖 Claude Code Integration & Capabilities

### **What Claude Code CAN Do**
- ✅ **Local Development**: Read, write, edit files in the project directory
- ✅ **Build & Package**: Run npm scripts, Docker builds, version management
- ✅ **Code Analysis**: Search, debug, analyze codebase issues
- ✅ **Command Preparation**: Create deployment scripts in `/tempClaudecomms/`
- ✅ **Jira Ticket Creation**: Write detailed tickets in `/JiraTickets/` folder
- ✅ **AWS ECR Operations**: Login, build, tag, and push Docker images
- ✅ **Git Operations**: Commits, branching, tagging (with proper `-m` flags)
- ✅ **Documentation**: Update CLAUDE.md, create technical documentation
- ✅ **Issue Troubleshooting**: Analyze logs, console output, error messages
- ✅ **Custom Prompts**: Read and execute specialized prompts from `/Claude Code prompts/`

### **What Claude Code CANNOT Do**
- ❌ **SSH Access**: Cannot directly SSH into servers or VMs
- ❌ **Remote Execution**: Cannot run commands on staging/production servers
- ❌ **Direct Jira Access**: Cannot create tickets directly in Jira system
- ❌ **Server Management**: Cannot restart services, check server status directly
- ❌ **Database Access**: Cannot directly query or modify databases
- ❌ **Live Debugging**: Cannot interact with running applications in real-time

### **Command Handoff Process**
1. **Claude Prepares Commands**: Creates files in `/tempClaudecomms/` with exact commands
2. **User Executes**: Copy/paste commands to appropriate environment (local/SSH/etc.)
3. **Results Feedback**: User shares output/errors back to Claude for analysis
4. **Iterative Resolution**: Claude analyzes results and prepares next steps

**Example Flow:**
```bash
# Claude creates: /tempClaudecomms/deploy-staging.txt
# User runs on VM: ssh ubuntu@staging-server
# User executes: commands from deploy-staging.txt
# User reports: "deployment successful" or shares error output
# Claude analyzes and prepares next steps
```

### **Custom Prompt Management**
The `/Claude Code prompts/` folder contains specialized prompts and instructions for specific tasks:

**Usage Process:**
1. **Request Prompt**: User asks Claude to read specific prompt from the folder
2. **Execute Instructions**: Claude reads and follows the prompt's instructions
3. **Complete Task**: Claude performs the specialized task as directed
4. **Archive When Done**: When prompt is no longer needed, append `-archive` to filename

**Naming Convention:**
- Active prompts: `task-description.md` or `feature-name.txt`
- Archived prompts: `task-description-archive.md` or `feature-name-archive.txt`

**Example:**
```bash
# Active prompt
/Claude Code prompts/database-migration-helper.md

# After completion, rename to
/Claude Code prompts/database-migration-helper-archive.md
```

This system allows for:
- Reusable specialized instructions
- Complex multi-step task automation  
- Historical tracking of completed processes
- Clean organization of active vs. completed prompts

## 📊 Project Management Integration

### **Jira Projects**
- **SA**: Strategic ideas and product discovery
- **KAN**: Development tasks and bugs  
- **AWB**: Assets and brand materials
- **CR**: Research and experiments

### **Jira Ticket Management Process**
When Claude Code identifies issues that require Jira tickets:

1. **Ticket Creation**: Claude writes ticket details in `/JiraTickets/` folder using this format:
   - Filename: `[PROJECT]-[brief-description].md` (e.g., `KAN-excessive-debug-logging.md`)
   - Contains: Issue type, project, priority, summary, description, acceptance criteria, technical notes
   
2. **Manual Creation**: User copies ticket details from the markdown file and creates the actual Jira ticket
   
3. **File Organization**: Keep completed tickets in `/JiraTickets/` for reference and tracking

**Example Ticket Structure:**
```markdown
# [PROJECT] - [Title]
**Issue Type:** Bug/Story/Task
**Project:** KAN/SA/AWB/CR
**Priority:** High/Medium/Low
**Reporter:** Claude Code
**Date Created:** YYYY-MM-DD

## Summary
Brief one-line description

## Description
Detailed description with impact

## Acceptance Criteria
1. Specific measurable criteria
2. Technical requirements
3. Performance targets

## Technical Notes
- Implementation details
- Files involved
- Architecture considerations
```

### **Confluence Documentation**
- **SAHI Space**: Product and technical documentation
- **HI Space**: General project information

## 🔐 Security Considerations

### **Environment Protection**
- **Development**: Open for experimentation
- **Staging**: Protected, requires approval
- **Production**: Highly restricted access

### **Data Security**
- All user data is workshop-specific
- No cross-workshop data sharing
- Secure API key management
- Regular security audits

## 📝 Documentation Standards

### **Code Documentation**
```typescript
// Always document complex functions
/**
 * Generates holistic report for workshop participant
 * @param userId - Unique identifier for user
 * @param workshopType - Either 'ast' or 'ia'
 * @param includeAIInsights - Whether to include Claude-generated insights
 * @returns Promise<HolisticReport>
 */
async function generateHolisticReport(
  userId: string, 
  workshopType: 'ast' | 'ia',
  includeAIInsights: boolean = true
): Promise<HolisticReport>
```

### **API Documentation**
- Use OpenAPI/Swagger specifications
- Document all endpoints with examples
- Include error response formats
- Specify workshop-specific requirements

## 🎯 Development Priorities

### **High Priority**
1. **Workshop Separation**: Maintain strict AST/IA isolation
2. **Data Integrity**: Prevent cross-workshop contamination
3. **Performance**: Optimize for user experience
4. **Security**: Protect user data and API keys

### **Medium Priority**
1. **Feature Flags**: Gradual rollout of new features
2. **AI Integration**: Enhance AI-powered features
3. **Testing**: Comprehensive test coverage
4. **Documentation**: Keep docs current

### **Low Priority**
1. **UI Polish**: Visual improvements
2. **Performance Optimization**: Advanced optimizations
3. **Analytics**: Usage tracking and insights

## 🆘 Emergency Procedures

### **Critical Issue Response**
```bash
# Application down
1. Check health endpoints
2. Review recent deployments
3. Check database connectivity
4. Roll back if necessary

# Data corruption
1. Stop all writes immediately
2. Assess damage scope
3. Restore from backup
4. Validate data integrity

# Security breach
1. Rotate all API keys
2. Review access logs
3. Notify stakeholders
4. Implement additional security
```

### **Emergency Contacts**
- **Technical Issues**: Development team
- **Production Problems**: DevOps team  
- **Security Concerns**: Security team
- **Business Impact**: Product team

## 📚 Resources & Links

### **Development Resources**
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **Project-Specific Resources**
- [Feature Flag Documentation](docs/feature-flags.md)
- [API Documentation](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### **External Services**
- [Claude API Documentation](https://docs.anthropic.com/)
- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [Confluence Documentation](https://confluence.atlassian.com/doc/)
- [Jira Software Documentation](https://confluence.atlassian.com/jira/)

---

## 💡 Tips for Claude Code Assistance

### **Be Specific About Context**
```bash
# ✅ Good: Specific request
"Add a new API endpoint for AST workshop step 2-1 data retrieval with proper workshop validation"

# ❌ Vague: Generic request  
"Help me with the API"
```

### **Always Specify Workshop Type**
```bash
# ✅ Always clarify
"Update the AST reflection component to support the new question format"
"Fix the IA navigation issue on the planning step"

# ❌ Ambiguous
"Update the reflection component"
```

### **Include Error Context**
```bash
# ✅ Helpful context
"Getting 'Module not found' error for @/components/ui/Button in the AST workshop pages. Here's the full error: [paste error]"

# ❌ Incomplete
"Getting an error with imports"
```

### **Mention Environment**
```bash
# ✅ Environment context
"This is happening in development environment on macOS, port 8080"

# ❌ Missing context
"This isn't working"
```

---

**Last Updated**: January 2025  
**Project Version**: v2.1.0  
**Claude Code Compatible**: ✅