# Simplified production build
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci && npm cache clean --force

# Copy all application code
COPY . ./

# Remove problematic root index.html (Vite should use client/index.html)
RUN rm -f index.html

# Build the application (Vite + ESBuild)
WORKDIR /app/client
# Copy Tailwind and Vite configs to client directory for build
RUN cp ../tailwind.config.ts ./tailwind.config.ts
RUN npx vite build
WORKDIR /app
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

USER nodeuser

# Expose port 8080 (NOT 5000)
EXPOSE 8080

# Environment
ENV NODE_ENV=staging
ENV PORT=8080

# Health check for port 8080
HEALTHCHECK --interval=90s --timeout=60s --start-period=30s --retries=5 \
  CMD wget --spider --no-verbose --tries=1 --timeout=60 http://localhost:8080/health || exit 1

# Use dumb-init and start with tsx (development approach)
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
