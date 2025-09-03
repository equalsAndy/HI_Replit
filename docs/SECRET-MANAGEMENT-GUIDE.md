# 🔐 Secret Management Guide - HI_Replit

## Overview

This guide explains where and how to set secrets (environment variables) for the HI_Replit application across different environments. The application requires specific environment variables to function properly.

## 📋 Required Environment Variables

### **Essential Secrets**
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-random-string-here
```

### **Optional Configuration**
```env
NODE_ENV=production|development
PORT=5000
ENVIRONMENT=development|production
```

---

## 🌍 Setting Secrets by Environment

### 1. 💻 **Local Development**

#### **Option A: .env File (Recommended)**
Create a `.env` file in the project root:

```bash
# Create .env file in project root
cd /Users/bradtopliff/Desktop/HI_Replit
touch .env
```

Add your secrets to `.env`:
```env
DATABASE_URL=postgresql://neondb_owner:your_password@your-host.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-local-development-secret-key
NODE_ENV=development
PORT=5000
```

#### **Option B: Terminal Export**
```bash
export DATABASE_URL="postgresql://your_connection_string"
export SESSION_SECRET="your-secret-key"
npm run dev
```

---

### 2. 🟢 **Replit Environment**

#### **Using Replit Secrets Tab (Recommended)**
1. Open your Replit project
2. Click on **"Secrets"** tab in the left sidebar (🔒 icon)
3. Add each environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:your_password@your-host.neon.tech/neondb?sslmode=require`
   
   - **Key**: `SESSION_SECRET`
   - **Value**: `your-replit-secret-key-here`

#### **Accessing Replit Secrets**
The application automatically reads Replit secrets through `process.env`. No additional configuration needed.

---

### 3. ☁️ **AWS Production Deployment**

#### **AWS Secrets Manager (Current Setup)**
Based on the deployment documentation, secrets are stored in AWS Secrets Manager:

1. **Secret Name**: `hi-replit-env`
2. **Location**: AWS Secrets Manager (us-west-2)
3. **Access**: Retrieved automatically by Lightsail Container Service

#### **Required AWS Secrets**
```json
{
  "DATABASE_URL": "postgresql://neondb_owner:npg_Qqe3ljCsDkT0@ep-noisy-sun-a6grqv7a.us-west-2.aws.neon.tech/neondb?sslmode=require",
  "SESSION_SECRET": "aws-production-secret-2025",
  "NODE_ENV": "production",
  "PORT": "3000"
}
```

#### **Updating AWS Secrets**
```bash
# Using AWS CLI (requires proper IAM permissions)
aws secretsmanager update-secret \
  --secret-id hi-replit-env \
  --secret-string '{"DATABASE_URL":"your_new_value","SESSION_SECRET":"your_new_secret"}'
```

---

### 4. 🐳 **Docker/Container Deployment**

#### **Docker Run Command**
```bash
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL="postgresql://your_connection_string" \
  -e SESSION_SECRET="your-container-secret" \
  -e NODE_ENV="production" \
  --name hi-replit-app \
  your-image-name
```

#### **Docker Compose**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://your_connection_string
      - SESSION_SECRET=your-docker-secret
      - NODE_ENV=production
```

---

## 🔍 Validation & Troubleshooting

### **Quick Environment Check**
```bash
npm run check:env
```

### **Check if Secrets are Loaded**
The application validates environment variables on startup. Look for these messages:

```bash
✅ Environment variables validated
📊 DATABASE_URL configured: true
🔑 SESSION_SECRET configured: true
```

### **Common Issues**

#### **Missing Environment Variables**
```
❌ Missing required environment variables: ['DATABASE_URL', 'SESSION_SECRET']
```
**Solution**: Run `npm run check:env` and follow the instructions.

#### **Database Connection Failed**
**Check**: Verify your `DATABASE_URL` format and credentials.

#### **Session Errors**
```
failed to save session
```
**Check**: Verify `SESSION_SECRET` is set and `session_aws` table exists.

### **Complete Troubleshooting Guide**
📖 **See**: [SECRET-TROUBLESHOOTING.md](./SECRET-TROUBLESHOOTING.md) for detailed solutions to common issues.

---

## 🔒 Security Best Practices

### **Secret Generation**
```bash
# Generate secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Environment-Specific Secrets**
- **Development**: Use different secrets than production
- **Production**: Use strong, randomly generated secrets
- **Never commit**: Add `.env` to `.gitignore`

### **Database URLs**
- **Format**: `postgresql://username:password@host:port/database?sslmode=require`
- **SSL**: Always use `sslmode=require` for production
- **Rotation**: Regularly rotate database passwords

---

## 📁 File Locations Summary

| Environment | Location | Method |
|-------------|----------|--------|
| **Local Development** | `.env` file in project root | dotenv |
| **Replit** | Secrets tab in Replit UI | Replit secrets |
| **AWS Production** | AWS Secrets Manager | `hi-replit-env` secret |
| **Docker** | Environment variables | `-e` flags or compose |

---

## 🚀 Quick Start Commands

### **Local Development Setup**
```bash
cd /Users/bradtopliff/Desktop/HI_Replit
echo "DATABASE_URL=your_database_url_here" > .env
echo "SESSION_SECRET=$(node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))')" >> .env
npm run dev
```

### **Replit Setup**
1. Go to Secrets tab (🔒)
2. Add `DATABASE_URL` and `SESSION_SECRET`
3. Click "Run" button

### **Production Verification**
```bash
curl https://your-app-url.com/health
# Should return status with environment info
```

---

**Last Updated**: January 2025  
**Status**: Production-ready configuration  
**Support**: See troubleshooting section above