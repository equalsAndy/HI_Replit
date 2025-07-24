#!/bin/bash
# Debug Docker build - let's see what files exist

docker build --no-cache -t debug-build -f - . << 'EOF'
FROM node:18-alpine

WORKDIR /app
COPY . ./

# Debug: List files to see what's actually copied
RUN echo "=== ROOT FILES ===" && ls -la
RUN echo "=== CLIENT FILES ===" && ls -la client/
RUN echo "=== TAILWIND CONFIG ===" && cat tailwind.config.ts || echo "No tailwind config found"

WORKDIR /app/client
RUN echo "=== CLIENT WORKDIR FILES ===" && ls -la
RUN echo "=== TAILWIND CONFIG FROM CLIENT DIR ===" && cat ../tailwind.config.ts || echo "No tailwind config found"
EOF
