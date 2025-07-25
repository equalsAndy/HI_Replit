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
└── docs/                    # Project documentation
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
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client  
cd client && npm run dev

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
- **Development**: AWS Lightsail PostgreSQL (safe for testing)
- **Staging**: app2.heliotropeimaginal.com  
- **Production**: app.heliotropeimaginal.com (PROTECTED)

### **Environment Safety**
```bash
# Safe development commands
npm run dev              # Development server
npm run build           # Production build
npm run test            # Run tests

# Database operations (development only)
npm run db:migrate      # Run migrations
npm run db:seed        # Seed test data
npm run db:reset       # Reset database
```

## 🚩 Feature Flag System

### **Server Flags** (`server/src/utils/featureFlags.ts`)
```typescript
export const featureFlags = {
  HOLISTIC_REPORTS: process.env.FEATURE_HOLISTIC_REPORTS === 'true',
  WORKSHOP_LOCKING: process.env.FEATURE_WORKSHOP_LOCKING === 'true',
  AI_COACHING: process.env.FEATURE_AI_COACHING === 'true',
  AST_WORKSHOP: process.env.FEATURE_AST_WORKSHOP !== 'false',
  IA_WORKSHOP: process.env.FEATURE_IA_WORKSHOP === 'true',
};
```

### **Client Flags** (`client/src/utils/featureFlags.ts`)
```typescript
export const clientFeatureFlags = {
  DEBUG_PANEL: import.meta.env.VITE_FEATURE_DEBUG_PANEL === 'true',
  AST_NAVIGATION: import.meta.env.VITE_FEATURE_AST_NAV !== 'false',
  IA_NAVIGATION: import.meta.env.VITE_FEATURE_IA_NAV === 'true',
};
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
# Basic health check
curl http://localhost:8080/api/health

# Database status
curl http://localhost:8080/api/db-status

# Feature flag status (development only)
curl http://localhost:8080/api/workshop-data/feature-status
```

## 🤖 AI Integration (Claude API)

### **AI Features**
- **Holistic Reports**: AI-generated personalized development reports
- **Coaching Interface**: Interactive AI coaching for workshop participants
- **Content Generation**: Dynamic workshop content and insights

### **Claude API Configuration**
```bash
# Environment variables required
CLAUDE_API_KEY=your_api_key_here
FEATURE_AI_COACHING=true
FEATURE_HOLISTIC_REPORTS=true
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
echo 'ENVIRONMENT=staging' >> staging.env

# Deploy container
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

### **Production Deployment (Tag-Based)**
```bash
# CAREFUL: Production is protected
# Always test in staging first

# 1. Create production tag (single-line format)
git checkout development
git pull origin development
git tag -a v1.x.x -m "Production release v1.x.x - AST/IA platform"
git push origin v1.x.x

# 2. Build from tagged version
git checkout v1.x.x
docker build -t allstarteams-app:v1.x.x .

# 3. Push tagged container
aws lightsail push-container-image \
  --region us-west-2 \
  --service-name hi-replit-v2 \
  --label allstarteams-app-v1.x.x \
  --image allstarteams-app:v1.x.x

# 4. Deploy with production configuration
cat > production-deployment.json << EOF
{
  "containers": {
    "allstarteams-app": {
      "image": ":hi-replit-v2.allstarteams-app-v1.x.x.latest",
      "environment": {
        "NODE_ENV": "production"
      },
      "ports": {
        "8080": "HTTP"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "allstarteams-app",
    "containerPort": 8080,
    "healthCheck": {
      "healthyThreshold": 5,
      "unhealthyThreshold": 5,
      "timeoutSeconds": 60,
      "intervalSeconds": 90,
      "path": "/"
    }
  }
}
EOF

aws lightsail create-container-service-deployment \
  --region us-west-2 \
  --service-name hi-replit-v2 \
  --containers file://production-deployment.json \
  --public-endpoint file://production-deployment.json
```

### **Deployment Health Checks**
```bash
# Verify staging deployment
curl -I https://hi-app-staging.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/
curl https://hi-app-staging.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/api/feature-flags/status

# Verify production deployment
curl -I https://hi-replit-v2.tqr7xha9v8ynw.us-west-2.cs.amazonlightsail.com/

# Monitor deployment status
aws lightsail get-container-services \
  --region us-west-2 \
  --service-name hi-replit-v2
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
- ⚠️ **Test staging before production deployment**
- ⚠️ **Use existing service `hi-replit-v2`** (don't create new services)
- ⚠️ **Build with `--platform linux/amd64`** for VM/container compatibility on Apple Silicon
- ⚠️ **Include `NODE_TLS_REJECT_UNAUTHORIZED=0`** in environment for database SSL issues
- ⚠️ **Use version-manager.sh** for proper semantic versioning

## 📊 Project Management Integration

### **Jira Projects**
- **SA**: Strategic ideas and product discovery
- **KAN**: Development tasks and bugs  
- **AWB**: Assets and brand materials
- **CR**: Research and experiments

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