# Production Container Deployment Guide

## 🎯 **Overview**
This guide provides a Vite-free production deployment solution that eliminates module resolution issues in container environments.

## 🚀 **Quick Start**

### 1. Build for Production
```bash
# Build frontend and backend
./build-production.sh
```

### 2. Deploy with Docker
```bash
# Run the container
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL="your_database_url" \
  -e SESSION_SECRET="your_session_secret" \
  --name allstarteams-prod \
  allstarteams-prod
```

## 📦 **Production Architecture**

### **Key Changes from Development**
- **No Vite Dependency**: Uses `server/index-production.ts` instead of `server/index.ts`
- **Static File Serving**: Serves pre-built files from `dist/public/`
- **Container Optimized**: All imports use relative paths with `.js` extensions
- **PM2 Process Management**: Production-ready process management with auto-restart

### **File Structure**
```
📁 Production Container
├── server/
│   ├── index-production.ts     # Production entry point (no Vite)
│   ├── routes/                 # API routes
│   └── services/               # Business logic
├── shared/
│   └── schema.ts              # Database schema
├── dist/public/               # Pre-built frontend files
│   ├── index.html
│   ├── assets/
│   └── ...
└── package.json
```

## 🔧 **Build Process**

### **1. Frontend Build**
```bash
npm run build
# Creates: dist/public/index.html and assets
```

### **2. Backend Preparation**
The production server (`server/index-production.ts`) includes:
- ✅ Express static file serving
- ✅ Session management with PostgreSQL
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ Graceful shutdown handling
- ✅ Error handling middleware

### **3. Container Build**
```bash
docker build -f Dockerfile.production -t allstarteams-prod .
```

## 🌐 **Environment Variables**

### **Required**
```env
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-secure-random-string
```

### **Optional**
```env
NODE_ENV=production
PORT=8080
```

## 🏥 **Health Monitoring**

### **Health Check Endpoint**
```
GET /health
```

**Response (Healthy):**
```json
{
  "status": "ok",
  "initialized": true,
  "timestamp": "2025-07-09T15:47:48.712Z",
  "uptime": 797.124,
  "database": "connected",
  "sessionTable": "accessible"
}
```

## 🔒 **Security Features**

### **Production Security**
- Session storage in PostgreSQL
- CORS headers configured
- Cookie security settings
- Error message sanitization
- PM2 process isolation

### **Container Security**
- Health checks every 30 seconds
- Graceful shutdown handling
- Non-root user execution
- Minimal attack surface

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Module Resolution Errors**
- ✅ **Fixed**: All imports use relative paths with `.js` extensions
- ✅ **Fixed**: No TypeScript path aliases in production

#### **2. Static Files Not Found**
```bash
# Verify build directory exists
ls -la dist/public/
```

#### **3. Database Connection Issues**
```bash
# Test database connection
docker exec -it allstarteams-prod node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1').then(() => console.log('✅ DB OK')).catch(console.error);
"
```

#### **4. Session Problems**
```bash
# Check session table
curl http://localhost:8080/health | jq .sessionTable
```

## 📊 **Performance Optimizations**

### **Container Optimizations**
- Alpine Linux base image (minimal size)
- Multi-stage builds for smaller images
- Static file caching (1 day TTL)
- Gzip compression enabled
- PM2 cluster mode ready

### **Database Optimizations**
- Connection pooling
- Session cleanup
- Prepared statements
- Connection limits

## 🔄 **Deployment Strategies**

### **Blue-Green Deployment**
```bash
# Build new version
docker build -f Dockerfile.production -t allstarteams-prod:v2 .

# Test new version
docker run -d -p 8081:8080 --name allstarteams-test allstarteams-prod:v2

# Health check
curl http://localhost:8081/health

# Switch traffic (update load balancer)
# Stop old version
docker stop allstarteams-prod
```

### **Rolling Updates**
```bash
# Update with zero downtime
docker-compose up -d --scale app=2
docker-compose stop app_1
docker-compose up -d --scale app=1
```

## 📈 **Monitoring**

### **Key Metrics**
- Health check response time
- Database connection count
- Session table size
- Memory usage
- CPU utilization

### **Logging**
```bash
# View container logs
docker logs -f allstarteams-prod

# PM2 process logs
docker exec -it allstarteams-prod pm2 logs
```

## ✅ **Success Criteria**

- ✅ Container starts without module resolution errors
- ✅ Static files served from `dist/public/`
- ✅ All API routes functional
- ✅ Session authentication working
- ✅ Health check responds at `/health`
- ✅ Database connection stable
- ✅ No Vite dependencies in production

## 🎉 **Production Ready**

This production deployment solution:
- **Eliminates** Vite dependency issues
- **Provides** robust error handling
- **Ensures** session persistence
- **Supports** horizontal scaling
- **Includes** comprehensive monitoring
- **Maintains** all application functionality

**Ready for AWS, Google Cloud, Azure, or any container platform!**