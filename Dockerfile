# Multi-stage build for faster startup
FROM node:18-alpine AS builder

# Install build dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build TypeScript to JavaScript
COPY . ./
RUN npx tsc --build tsconfig.docker.json

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built JavaScript files (not TypeScript)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/shared ./shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

USER nodeuser

# Expose port 5000
EXPOSE 5000

# Environment
ENV NODE_ENV=production

# Health check for AWS Lightsail
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use compiled JavaScript instead of tsx
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server/index.js"]
