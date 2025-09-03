FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files (root level in monorepo)
COPY package*.json ./

# Install build tools and production dependencies (canvas needs native build)
RUN apk add --no-cache --virtual .build-deps build-base python3 cairo-dev pango-dev giflib-dev libjpeg-turbo-dev libpng-dev pkgconfig && \
    npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force && \
    apk del .build-deps

# Copy built application (already built locally)
COPY dist ./dist
COPY shared ./shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

USER nodeuser

# Expose port 8080 (as per deployment guide)
EXPOSE 8080

# Environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init and start built app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
