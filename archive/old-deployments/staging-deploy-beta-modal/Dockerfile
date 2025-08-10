FROM node:18-alpine

# Install system dependencies for canvas and other native modules
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

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copy application files with proper structure
COPY dist/ ./dist/
COPY shared/ ./shared/

# Create non-root user for security
RUN adduser -D -s /bin/sh appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]