FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Upgrade npm to the latest version for production builds
RUN npm install -g npm@latest

# Create app directory
WORKDIR /app

# Copy package files for both root and client
COPY package*.json ./
COPY client/package*.json ./client/

# Install build tools and ALL dependencies (needed for building)
RUN apk add --no-cache --virtual .build-deps build-base python3 cairo-dev pango-dev giflib-dev libjpeg-turbo-dev libpng-dev pkgconfig && \
    npm ci --legacy-peer-deps && \
    cd client && npm ci --legacy-peer-deps && cd .. && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for frontend environment variables
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_DOMAIN  
ARG VITE_AUTH0_AUDIENCE
ARG VITE_AUTH0_REDIRECT_URI

# Set environment variables for build
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}
ENV VITE_AUTH0_REDIRECT_URI=${VITE_AUTH0_REDIRECT_URI}

# Build the application with production environment variables
RUN npm run build:production

# Remove build dependencies and dev dependencies
RUN apk del .build-deps && \
    npm prune --production

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
