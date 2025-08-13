# Database Architecture - Updated August 13, 2025

## 🏗️ Three-Tier Database Strategy

### **Development Database** (NEW)
- **Purpose**: Safe development and experimentation
- **Type**: AWS RDS PostgreSQL (db.t3.micro)
- **Database**: `heliotrope_dev`
- **Users**: Test users, synthetic data only
- **Cost**: ~$15-20/month
- **Endpoint**: `heliotrope-development.[region].rds.amazonaws.com`

### **Staging Database** (SHARED WITH PRODUCTION)
- **Purpose**: Beta testing and staging deployments
- **Type**: AWS RDS PostgreSQL (shared instance)
- **Database**: Same as production
- **Users**: Real beta testers, live workshop data
- **Endpoint**: `ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com`

### **Production Database** (SHARED WITH STAGING)
- **Purpose**: Live application data
- **Type**: AWS RDS PostgreSQL (shared instance)
- **Database**: Same as staging
- **Users**: Production users, real workshop data
- **Endpoint**: `ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com`

## 🔒 Security Benefits

### **Production Safety**
- ✅ Development changes cannot affect production users
- ✅ Beta testing data remains isolated from development experiments
- ✅ Zero risk of accidental production data corruption
- ✅ Schema changes can be tested safely in development

### **Data Isolation**
- **Development**: Synthetic test data only
- **Staging/Production**: Real user data (shared for beta testing continuity)
- **AI Training**: Documents can be safely tested in development

## 🚀 Development Workflow

### **Local Development**
```bash
# Uses development RDS database
npm run dev
DATABASE_URL=postgresql://devuser:HeliotropeDev2025@heliotrope-development...
```

### **Staging Deployment**
```bash
# Uses shared production RDS database
npm run build:staging
DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051...
```

### **Production Deployment**
```bash
# Uses shared production RDS database
npm run build:production
DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051...
```

## 📋 Environment Configuration

### **Development** (`server/.env.development`)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://devuser:HeliotropeDev2025@heliotrope-development.[region].rds.amazonaws.com:5432/heliotrope_dev
FEATURE_DEBUG_PANEL=true
LOG_LEVEL=debug
```

### **Staging** (`server/.env.staging`)
```bash
NODE_ENV=staging
DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require
FEATURE_DEBUG_PANEL=false
```

### **Production** (`server/.env.production`)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require
FEATURE_DEBUG_PANEL=false
```

## 🔄 Data Management

### **Schema Sync**
- Development database gets latest schema via migrations or Drizzle push
- Staging/Production share schema and remain in sync
- Schema changes tested in development before staging deployment

### **Test Data**
- Development: Synthetic users and workshop data for testing
- Staging/Production: Real beta tester data preserved

### **AI Training Documents**
- Development: Test documents for training AI personas safely
- Production: Real training documents managed through admin interface

## 💰 Cost Implications

### **Additional Costs**
- Development RDS: ~$15-20/month (db.t3.micro + 20GB storage)
- Network transfer: Minimal additional cost

### **Cost Savings**
- Reduced risk of production incidents
- Faster development cycles
- No need for expensive local development tools

## 📚 Setup Instructions

### **1. Create Development RDS**
```bash
./tempClaudecomms/setup-development-rds-2025-08-13.sh
```

### **2. Update Environment Configuration**
```bash
# Replace server/.env.development with new configuration
cp server/.env.development.new server/.env.development
# Update DATABASE_URL with endpoint from RDS setup script
```

### **3. Initialize Development Database**
```bash
./tempClaudecomms/setup-development-database-schema-2025-08-13.sh
```

### **4. Test Development Environment**
```bash
npm run dev
# Should connect to development RDS database
```

## 🚨 Important Notes

### **Beta Testing Protection**
- Staging and production continue to share database
- Beta tester data and workshop progress preserved
- No disruption to ongoing beta testing activities

### **Development Benefits**
- Safe experimentation with AI training documents
- Test schema changes without risk
- Develop with realistic database performance
- Debug with consistent data patterns

### **Staging/Production Shared Benefits**
- Beta testers can test staging features with their real data
- Seamless promotion from staging to production
- Consistent beta testing experience

This architecture provides the perfect balance of development safety and production continuity for your beta testing phase.