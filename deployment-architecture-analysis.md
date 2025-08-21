# Deployment Architecture Analysis

## Key Questions & Answers

### App Entry Point
✅ **Backend Production Entry**: `node dist/index.js`
- **Package.json confirms**: `"start": "node dist/index.js"`
- **Production script**: `"start:production": "NODE_ENV=production node dist/index.js"`
- **Backend code bundling**: Yes, bundled to `dist/` via `esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`

### Front-end Architecture
✅ **Frontend served as static files** from `dist/public/`
- **Vite build output**: `build.outDir: path.resolve(__dirname, "dist/public")`
- **Express serves static files**: Backend serves frontend assets from `/dist/public/`
- **Separate build process**: Frontend built via `vite build` to `dist/public/`, backend bundled via `esbuild` to `dist/index.js`

### ECR Details
✅ **ECR Repository exists**:
- **AWS Account ID**: `962000089613`
- **Region**: `us-west-2`
- **Repository Name**: `hi-replit-app`
- **Full URI**: `962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app`
- **Repository ARN**: `arn:aws:ecr:us-west-2:962000089613:repository/hi-replit-app`

### Build Context
✅ **Local builds** (from your machine):
- **Platform**: macOS (Darwin 24.6.0)
- **Build commands**: `npm run build`, `npm run build:staging`, `npm run build:production`
- **Docker build**: Local `docker build -t hi-replit-app .`
- **Platform consideration**: May need `--platform linux/amd64` for production

### Current Timeout Issues
⚠️ **Docker push timeouts during ECR upload**:
- **Large image size**: Canvas dependencies (cairo, pango, pixman) add significant size
- **Upload bottleneck**: Multiple deployment scripts suggest push timeouts
- **Canvas requirement**: Chart generation needs native canvas libraries

### Build Tools & Process
✅ **Dual build system**:
- **Frontend**: `vite build` → `dist/public/` (React SPA)
- **Backend**: `esbuild` → `dist/index.js` (Node.js server bundle)
- **Assets**: Manual copy of PNG assets to `dist/public/assets/`
- **Single command**: `npm run build` does both frontend + backend

## Current Build Flow

```bash
# Full production build process:
1. ./version-manager.sh production        # Version bump
2. vite build                            # Frontend → dist/public/
3. cp public/assets/*.png dist/public/assets/  # Copy assets
4. esbuild server/index.ts --bundle --outdir=dist  # Backend → dist/index.js
5. docker build -t hi-replit-app .      # Docker image
6. docker tag & push to ECR             # Registry upload
7. aws lightsail deployment              # Container deployment
```

## Docker Configuration Analysis

### Current Dockerfile.production Issues
❌ **Production Dockerfile has issues**:
```dockerfile
# PROBLEMATIC - Uses tsx to run TypeScript directly
CMD ["npx", "tsx", "server/index.ts"]

# SHOULD BE - Run the built JavaScript bundle
CMD ["node", "dist/index.js"]
```

### Multi-stage Build Opportunity
⚠️ **Currently single-stage build**:
- **Current**: Install dependencies + copy source + run
- **Better**: Build stage → Production stage (smaller final image)
- **Size reduction**: Could eliminate build dependencies from final image

## Environment Setup

### Production Environment Variables
✅ **Standard production env vars needed**:
- `DATABASE_URL` - PostgreSQL connection
- `NODE_ENV=production` 
- `SESSION_SECRET` - Session encryption
- `CLAUDE_API_KEY` - AI integration
- `OPENAI_API_KEY` - AI integration
- `PORT=8080` - Application port

### Environment File Structure
```
├── .env.production          # Production overrides
├── server/.env.development  # Development config
└── client/.env.*           # Frontend-specific config
```

## Deployment Services

### AWS Lightsail Configuration
- **Service Name**: `hi-replit-v2` (production), `hi-app-staging` (staging)
- **Container Name**: `allstarteams-app` (production), `heliotrope-app-staging` (staging)
- **Port**: 8080
- **Health Check**: `/health` endpoint
- **Region**: us-west-2

### URLs
- **Production**: https://app.heliotropeimaginal.com
- **Staging**: https://app2.heliotropeimaginal.com
- **Development**: http://localhost:8080

## Recommendations

### 1. Fix Dockerfile.production
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
# Build steps here...

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules ./node_modules/
COPY .env.production .env
EXPOSE 8080
CMD ["node", "dist/index.js"]  # ✅ Use built JS, not tsx
```

### 2. Optimize Image Size
- **Multi-stage build** to reduce final image size
- **Canvas optimization**: Consider server-side rendering alternatives
- **Build platform**: Use `--platform linux/amd64` for consistency

### 3. Upload Speed Improvements
- **Docker layer caching**: Optimize Dockerfile layer order
- **Parallel uploads**: Consider using `docker buildx` with multi-platform
- **Compression**: Enable Docker compression for faster transfers

### 4. Build Verification
```bash
# Test the built application locally
npm run build
node dist/index.js  # Should start on port 8080
curl http://localhost:8080/health  # Should return 200 OK
```

## Summary

Your architecture is solid with a clear separation between frontend (static files) and backend (Node.js server). The main issues are:

1. **Dockerfile using tsx instead of built JS** (performance impact)
2. **Large image size** due to canvas dependencies (timeout cause)
3. **Single-stage build** (optimization opportunity)

The ECR setup is correct and ready for plug-and-play deployment scripts.