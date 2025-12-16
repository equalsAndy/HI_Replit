FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Upgrade npm to the latest version for production builds
RUN npm install -g npm@latest

# Create app directory
WORKDIR /app

# Copy package files (root level in monorepo)
COPY package*.json ./

# Install runtime dependencies for canvas (kept permanently)
RUN apk add --no-cache \
    cairo \
    pango \
    giflib \
    libjpeg-turbo \
    libpng \
    pixman

# Install build tools temporarily for native modules
RUN apk add --no-cache --virtual .build-deps \
    build-base \
    g++ \
    python3 \
    cairo-dev \
    pango-dev \
    giflib-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    pixman-dev \
    pkgconfig

# Install production dependencies - canvas needs patching for Alpine Linux
# First install all non-canvas dependencies
RUN npm ci --only=production --legacy-peer-deps --ignore-scripts

# Patch canvas source files to add missing cstdint include (if canvas exists)
RUN if [ -f /app/node_modules/canvas/src/CharData.h ]; then \
      sed -i '2i #include <cstdint>' /app/node_modules/canvas/src/CharData.h && \
      sed -i '2i #include <cstdint>' /app/node_modules/canvas/src/FontParser.h; \
    fi

# Now run install scripts and rebuild canvas if it exists
RUN npm rebuild 2>&1 && \
    npm cache clean --force

# Remove build tools but keep runtime libraries
RUN apk del .build-deps

# Copy built application (already built locally with production env vars)
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
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init and start built app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
